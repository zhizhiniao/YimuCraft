// D01 reverse direction: a native OLE drag started by an independent process
// must be accepted by the YimuCraft window's document drop handler and copied
// into the owned library with the real bytes.
//
// The drag is driven by the same verified-pointer tooling as the outbound test:
// the pointer presses on the receiver window, the receiver enters DoDragDrop with
// the button held, the library window is moved under the pointer, and the button
// is released over it.
const { electron } = require('./test-app.cjs');
const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');
const assert = require('assert/strict');
const close = require('./close-test-app.cjs');

const lateErrors = [];
process.on('unhandledRejection', (reason) => {
  lateErrors.push(String((reason && reason.message) || reason));
});

(async () => {
  const root = path.resolve('work/native-reverse-drag-' + Date.now());
  fs.mkdirSync(root, { recursive: true });
  const receipt = path.join(root, 'unused-receipt.json');
  const trigger = path.join(root, 'trigger');
  const go = path.join(root, 'go');
  const release = path.join(root, 'release');
  const pointerOut = path.join(root, 'pointer.json');
  const report = { root, executable: process.env.YIMU_TEST_EXE || 'development', checks: [] };
  let app, receiver, child, page;

  try {
    {
      const resetOut = path.join(root, 'reset.json');
      execFileSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-STA', '-File', path.resolve('scripts/pointer-reset.ps1'), '-Out', resetOut], { encoding: 'utf8', windowsHide: true });
      report.reset = JSON.parse(fs.readFileSync(resetOut, 'utf8'));
    }

    const env = { ...process.env, YIMU_DATA_DIR: path.join(root, 'library'), YIMU_RECEIPT: receipt };
    delete env.ELECTRON_RUN_AS_NODE;

    receiver = await electron.launch({ args: [path.resolve('scripts/ole-receiver.cjs')], env });
    await receiver.firstWindow();
    await new Promise((r) => setTimeout(r, 1200));

    app = await electron.launch({
      ...(process.env.YIMU_TEST_EXE ? { executablePath: process.env.YIMU_TEST_EXE, args: [] } : { args: ['.'] }),
      env,
    });
    page = await app.firstWindow();
    await page.waitForFunction(() => document.querySelector('#status').textContent.startsWith('就绪'));
    await app.evaluate(({ BrowserWindow }) => {
      const w = BrowserWindow.getAllWindows()[0];
      w.setBounds({ x: 400, y: 900, width: 900, height: 660 });
      w.setAlwaysOnTop(true, 'screen-saver');
      w.show();
    });
    await page.waitForTimeout(300);

    const receiverInfo = await receiver.evaluate(({ BrowserWindow }) => {
      const w = BrowserWindow.getAllWindows()[0];
      const b = w.getBounds();
      return {
        pid: process.pid,
        handle: w.getNativeWindowHandle().readBigUInt64LE().toString(),
        bounds: b,
        visible: w.isVisible(),
        client: { x: Math.round(b.width / 2), y: Math.round(b.height / 2) },
      };
    });
    report.receiver = receiverInfo;
    assert.ok(receiverInfo.visible, 'Receiver window is not visible; it cannot hold the drag');



    // Independent observation of the drop, separate from the product handler:
    // proves whether files arrive and what the preload bridge returns for them.
    await page.evaluate(() => {
      window.testDrop = null;
      document.addEventListener('drop', (e) => {
        const described = [];
        for (const f of e.dataTransfer.files) {
          let resolved;
          try {
            resolved = window.yimu.filePath(f);
          } catch (err) {
            resolved = 'THREW: ' + String((err && err.message) || err);
          }
          described.push({ name: f.name, size: f.size, type: f.type, resolved });
        }
        window.testDrop = { count: described.length, files: described, types: [...e.dataTransfer.types] };
      }, true);
    });

    // Two Chinese-named files: reverse import must handle multiple files too.
    const incomingNames = ['反向拖入 中文.txt', '反向二号 文件.txt'];
    const incomingFiles = incomingNames.map((name) => {
      const p = path.join(root, name);
      fs.writeFileSync(p, 'reverse native drop ' + name);
      return p;
    });
    report.incoming = incomingFiles;

    fs.writeFileSync(go, 'go'); // pressed-then-go: the pointer script parks and waits for release
    // The receiver must own the foreground before the synthetic press lands.
    await receiver.evaluate(({ BrowserWindow }) => {
      const w = BrowserWindow.getAllWindows()[0];
      w.setAlwaysOnTop(true, 'screen-saver');
      w.show();
      w.focus();
      w.moveTop();
    });
    await new Promise((r) => setTimeout(r, 400));
    child = spawn(
      'powershell.exe',
      [
        '-NoProfile', '-ExecutionPolicy', 'Bypass', '-STA', '-File', path.resolve('scripts/ole-card-pointer.ps1'),
        '-ClientX', String(receiverInfo.client.x), '-ClientY', String(receiverInfo.client.y),
        '-SourcePid', String(receiverInfo.pid), '-SourceHandle', receiverInfo.handle,
        '-Trigger', trigger, '-GoMarker', go, '-ReleaseMarker', release, '-Out', pointerOut,
      ],
      { windowsHide: true },
    );
    let stderr = '';
    child.stderr.on('data', (b) => (stderr += b));

    let pressed = false;
    for (let i = 0; i < 600 && !pressed; i++) {
      pressed = fs.existsSync(trigger);
      if (!pressed && child.exitCode !== null) break;
      if (!pressed) await new Promise((r) => setTimeout(r, 20));
    }
    if (fs.existsSync(pointerOut)) report.pointer = JSON.parse(fs.readFileSync(pointerOut, 'utf8'));
    assert.ok(pressed, 'Pointer never pressed on the receiver. ' + (stderr || JSON.stringify(report.pointer || {})));

    // Start the native drag with the button already held. The call blocks the
    // receiver main process inside DoDragDrop, so it must not be awaited.
    receiver
      .evaluate(({ BrowserWindow, nativeImage }, args) => {
        BrowserWindow.getAllWindows()[0].webContents.startDrag({
          files: args.files,
          icon: nativeImage.createFromPath(args.icon),
        });
      }, { files: incomingFiles, icon: path.resolve('src/tray.png') })
      .catch((e) => lateErrors.push('startDrag promise: ' + String(e && e.message)));

    // Move the library window under the pointer so it becomes the drop target.
    await app.evaluate(({ BrowserWindow, screen }) => {
      const w = BrowserWindow.getAllWindows()[0];
      const p = screen.getCursorScreenPoint();
      const b = w.getBounds();
      w.setBounds({ x: Math.round(p.x - b.width / 2), y: Math.round(p.y - b.height / 2), width: b.width, height: b.height });
      w.setAlwaysOnTop(true, 'screen-saver');
      w.moveTop();
    });
    await page.waitForTimeout(900);
    report.appBoundsAtDrop = await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].getBounds());
    report.cursorAtDrop = await app.evaluate(({ screen }) => screen.getCursorScreenPoint());

    fs.writeFileSync(release, 'release');

    let imported = [];
    for (let i = 0; i < 240 && imported.length < incomingNames.length; i++) {
      const items = (await page.evaluate(() => window.yimu.command('query', {}))).items;
      imported = items.filter((a) => incomingNames.includes(a.name));
      if (imported.length < incomingNames.length) await new Promise((r) => setTimeout(r, 100));
    }
    await new Promise((r) => setTimeout(r, 500));
    if (fs.existsSync(pointerOut)) report.pointer = JSON.parse(fs.readFileSync(pointerOut, 'utf8'));
    report.status = await page.evaluate(() => document.querySelector('#status').textContent);
    report.dropObservation = await page.evaluate(() => window.testDrop);
    assert.equal(imported.length, incomingNames.length, 'Library did not import every reverse-dropped file. status=' + report.status);
    for (const asset of imported) {
      assert.ok(asset.path.includes('managed'), 'Imported asset is not a managed copy: ' + asset.path);
      assert.equal(fs.readFileSync(asset.path, 'utf8'), 'reverse native drop ' + asset.name);
    }
    report.imported = imported.map((a) => ({ name: a.name, path: a.path }));
    report.checks.push('Native drag started by an independent process is accepted by the app window');
    report.checks.push('Two Chinese-named dropped files are copied into the managed library with real bytes');

    // Restart against the same library: the imported assets must still resolve.
    await close(app);
    app = await electron.launch({
      ...(process.env.YIMU_TEST_EXE ? { executablePath: process.env.YIMU_TEST_EXE, args: [] } : { args: ['.'] }),
      env,
    });
    page = await app.firstWindow();
    await page.waitForFunction(() => document.querySelector('#status').textContent.startsWith('就绪'));
    const afterRestart = (await page.evaluate(() => window.yimu.command('query', {}))).items.filter((a) => incomingNames.includes(a.name));
    assert.equal(afterRestart.length, incomingNames.length, 'Imported assets disappeared after restart');
    for (const asset of afterRestart) {
      const before = report.imported.find((a) => a.name === asset.name);
      assert.equal(asset.path, before.path, 'Asset path changed after restart: ' + asset.name);
      assert.equal(fs.readFileSync(asset.path, 'utf8'), 'reverse native drop ' + asset.name);
    }
    report.afterRestart = afterRestart.map((a) => ({ name: a.name, path: a.path }));
    report.checks.push('Imported asset and bytes persist after restarting the application');
    report.passed = true;
  } catch (e) {
    report.passed = false;
    report.error = e.stack;
    try {
      if (fs.existsSync(pointerOut)) report.pointer = JSON.parse(fs.readFileSync(pointerOut, 'utf8'));
    } catch {}
    try {
      if (page) report.status = await page.evaluate(() => document.querySelector('#status').textContent);
    } catch {}
    try {
      if (page) report.dropObservation = await page.evaluate(() => window.testDrop);
    } catch {}
    process.exitCode = 1;
  } finally {
    if (child) await new Promise((resolve) => {
      if (child.exitCode !== null) return resolve();
      child.once('exit', resolve);
      setTimeout(resolve, 8000);
    });
    await close(receiver);
    await close(app);
    report.lateErrors = lateErrors;
    fs.writeFileSync('evidence/native-reverse-drag.json', JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.passed ? 0 : 1;
  }
})();
