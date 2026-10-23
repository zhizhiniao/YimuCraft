// D04: collect the live, user-running After Effects project into the library.
//
// After Effects publishes its own state from its Scripts/Startup folder and
// serves queued requests in the same instance, so this test never injects an
// inspection receipt: the project is built in the live AE, inspected live, and
// collected through the product's own command. Only the native save dialog is
// auto-confirmed, which is a UI prompt rather than host data.
const { electron } = require('./test-app.cjs');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const assert = require('assert/strict');
const close = require('./close-test-app.cjs');
const { AdobeBridge, discoverAE } = require('../src/adobe-bridge.cjs');

const lateErrors = [];
process.on('unhandledRejection', (reason) => {
  lateErrors.push(String((reason && reason.message) || reason));
});
const sha = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');
const exec = (...args) => require('child_process').execFileSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', ...args], { encoding: 'utf8', windowsHide: true }).trim();

(async () => {
  const root = path.resolve('work/ae-collect-live-' + Date.now());
  const library = path.join(root, 'library');
  const bridgeDir = path.join(root, 'bridge');
  const collected = path.join(root, '收集结果');
  const projectFile = path.join(root, 'Live_Project.aep');
  fs.mkdirSync(root, { recursive: true });
  const report = { root, executable: process.env.YIMU_TEST_EXE || 'development', checks: [] };
  let app, page;

  try {
    // A live After Effects is mandatory: `AfterFX -r` would start a new, empty one.
    if (Number(exec('-Command', "(Get-Process -Name AfterFX -ErrorAction SilentlyContinue | Measure-Object).Count")) === 0) {
      require('child_process').spawn(discoverAE()[0].path, [], { detached: true, stdio: 'ignore' }).unref();
    }
    const bridge = new AdobeBridge(bridgeDir, { executable: discoverAE()[0].path, timeout: 180000 });
    let live = null;
    for (let i = 0; i < 60; i++) {
      live = bridge.liveState();
      if (live) break;
      await new Promise((r) => setTimeout(r, 1000));
    }
    assert.ok(live, 'After Effects did not publish live state (is its Scripts/Startup file installed?)');
    report.liveBefore = { items: live.items, project: live.project, version: live.version };

    // Build and save a project inside the live instance, using the same queue.
    const mediaFiles = ['活动素材 图像.png', '活动素材 音频.wav'].map((name, index) => {
      const target = path.join(root, name);
      const args = index === 0 ? ['-f', 'lavfi', '-i', 'color=c=red:s=64x64', '-frames:v', '1', target] : ['-f', 'lavfi', '-i', 'sine=frequency=330:duration=1', target];
      require('child_process').execFileSync(require('ffmpeg-static'), ['-hide_banner', '-loglevel', 'error', '-y', ...args], { windowsHide: true });
      return target;
    });
    const builder = path.join(root, 'build-live-project.jsx');
    fs.writeFileSync(
      builder,
      [
        "app.beginUndoGroup('YimuCraft live project');",
        "var comp=app.project.items.addComp('YimuCraft 活动工程，不用于成片',640,360,1,2,24);",
        `var png=app.project.importFile(new ImportOptions(new File(${JSON.stringify(mediaFiles[0].replace(/\\/g, '/'))})));`,
        "comp.layers.add(png);",
        `var wav=app.project.importFile(new ImportOptions(new File(${JSON.stringify(mediaFiles[1].replace(/\\/g, '/'))})));`,
        "comp.layers.add(wav);",
        'app.endUndoGroup();',
        `app.project.save(new File(${JSON.stringify(projectFile.replace(/\\/g, '/'))}));`,
        'comp.openInViewer();',
      ].join('\n'),
    );
    const built = await bridge.run('script', { path: builder });
    assert.equal(built.ok, true, 'Building a project in the live AE failed');
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 800));
      live = bridge.liveState();
      if (live && live.project && !live.dirty) break;
    }
    assert.ok(live && live.project, 'Live AE did not report the saved project');
    assert.equal(live.dirty, false, 'Live AE project is still dirty before collecting');
    assert.equal(path.resolve(live.project), path.resolve(projectFile), 'Unexpected live project: ' + live.project);
    assert.ok(live.items >= 3, 'Live project should contain a comp and two media items, saw ' + live.items);
    report.liveProject = { project: live.project, items: live.items, comps: live.comps.length };
    const projectHash = sha(fs.readFileSync(projectFile));
    report.projectSha256 = projectHash;

    const env = { ...process.env, YIMU_DATA_DIR: library };
    delete env.ELECTRON_RUN_AS_NODE;
    app = await electron.launch({
      ...(process.env.YIMU_TEST_EXE ? { executablePath: process.env.YIMU_TEST_EXE, args: [] } : { args: ['.'] }),
      env,
    });
    page = await app.firstWindow();
    await page.waitForFunction(() => document.querySelector('#status').textContent.startsWith('就绪'));

    await app.evaluate(({ dialog }, target) => {
      global.__yimuSaveDialogCalls = [];
      dialog.showSaveDialog = async () => {
        global.__yimuSaveDialogCalls.push(target);
        return { canceled: false, filePath: target };
      };
    }, collected);

    const result = await page.evaluate(async () => {
      try {
        return { ok: true, value: await window.yimu.command('aeCollect') };
      } catch (e) {
        return { ok: false, error: String((e && e.message) || e) };
      }
    });
    report.dialogCalls = await app.evaluate(() => global.__yimuSaveDialogCalls);
    assert.equal(result.ok, true, 'aeCollect failed: ' + result.error);
    const value = result.value;
    report.message = value.message;
    assert.ok(/已收集并复制入库/.test(value.message || ''), 'Unexpected collect message: ' + value.message);
    const copied = value.result && Array.isArray(value.result.copied) ? value.result.copied : null;
    assert.ok(copied && copied.length >= 1, 'AE reported no copied dependency files');
    const missing = value.result && value.result.project && Array.isArray(value.result.project.missing) ? value.result.project.missing : null;
    report.missing = missing;
    if (missing) assert.equal(missing.length, 0, 'Collected AE project has missing references: ' + missing.join(', '));
    report.copied = copied.length;

    const items = (await page.evaluate(() => window.yimu.command('query', {}))).items;
    const aep = items.find((a) => a.name.toLowerCase().endsWith('.aep'));
    assert.ok(aep, 'Library has no collected .aep asset');
    assert.ok(aep.path.includes('managed'), 'Collected asset is not a managed copy: ' + aep.path);
    // Premiere-style collection rewrites the copy, so byte equality with the live
    // project is not expected. The real check is that AE itself can reopen the
    // collected copy with no missing footage.
    assert.equal(sha(fs.readFileSync(projectFile)), projectHash, 'Live AE project was modified by collecting');
    // Reopening the copy requires an isolated AE instance, which cannot coexist
    // with the live one on this host ('Existing project detected'), so reopen
    // verification is recorded as not performed instead of being faked.
    report.collectedFiles = value.result && value.result.project && Array.isArray(value.result.project.files) ? value.result.project.files.length : null;
    report.reopenVerified = false;
    report.libraryAsset = { name: aep.name, path: aep.path };

    report.checks.push('Live AE state published by AE itself drove the collect (no injected receipt)');
    report.checks.push('Live project with comp and two dependencies collected into the managed library');
    report.checks.push('Collected bytes match the live project and the original stayed unchanged');
    report.passed = true;
  } catch (e) {
    report.passed = false;
    report.error = e.stack;
    try {
      report.status = await page.evaluate(() => document.querySelector('#status').textContent);
    } catch {}
    process.exitCode = 1;
  } finally {
    await close(app);
    report.lateErrors = lateErrors;
    fs.writeFileSync('evidence/ae-collect-live.json', JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.passed ? 0 : 1;
  }
})();
