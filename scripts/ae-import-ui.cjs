// D03: send a library asset to After Effects through the product's own
// right-click action ("发送到 After Effects"), and prove the host confirmed it.
//
// The native popup is intercepted so the real menu item callback runs. Success is
// asserted from two independent places: the renderer status produced by the AE
// command ("AE 已确认导入 N 项 · 缺失引用 M") and the newest bridge receipt on
// disk, which lists the items AE actually added.
const { electron } = require('./test-app.cjs');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const assert = require('assert/strict');
const close = require('./close-test-app.cjs');

const lateErrors = [];
process.on('unhandledRejection', (reason) => {
  lateErrors.push(String((reason && reason.message) || reason));
});

(async () => {
  const root = path.resolve('work/ae-import-' + Date.now());
  const library = path.join(root, 'library');
  fs.mkdirSync(root, { recursive: true });
  const report = { root, executable: process.env.YIMU_TEST_EXE || 'development', checks: [] };
  let app, page;

  try {
    const env = { ...process.env, YIMU_DATA_DIR: library };
    delete env.ELECTRON_RUN_AS_NODE;
    app = await electron.launch({
      ...(process.env.YIMU_TEST_EXE ? { executablePath: process.env.YIMU_TEST_EXE, args: [] } : { args: ['.'] }),
      env,
    });
    page = await app.firstWindow();
    await page.waitForFunction(() => document.querySelector('#status').textContent.startsWith('就绪'));

    // A real image so AE has something valid to import.
    // YIMU_BATCH=1 sends two images, exercising the batch branch of the same
    // right-click action.
    const batch = process.env.YIMU_BATCH === '1';
    report.batch = batch;
    const mediaNames = batch ? ['发送AE 图像一.png', '发送AE 图像二.png'] : ['发送AE 图像.png'];
    const mediaFiles = mediaNames.map((name, index) => {
      const target = path.join(root, name);
      execFileSync(require('ffmpeg-static'), ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', index === 0 ? 'color=c=red:s=64x64' : 'color=c=blue:s=64x64', '-frames:v', '1', target], { windowsHide: true });
      return target;
    });
    await page.evaluate((list) => window.yimu.command('import', list), mediaFiles);
    await page.locator('#refresh').click();
    await page.waitForSelector('.asset');
    if (batch) {
      await page.keyboard.press('Control+a');
      await page.waitForFunction((n) => document.querySelectorAll('.asset.selected').length === n, mediaFiles.length, { timeout: 5000 });
    }

    await app.evaluate(({ Menu }) => {
      const build = Menu.buildFromTemplate.bind(Menu);
      const hasSend = (items) => items.some((item) => item.id === 'ae' || (item.submenu && hasSend(item.submenu.items)));
      Menu.buildFromTemplate = (template) => {
        const menu = build(template);
        if (hasSend(menu.items)) menu.popup = () => { global.__yimuAeMenu = menu; };
        return menu;
      };
    });

    await page.locator('.asset').first().click({ button: 'right' });
    const clicked = await app.evaluate(async () => {
      for (let i = 0; i < 60 && !global.__yimuAeMenu; i++) await new Promise((r) => setTimeout(r, 50));
      if (!global.__yimuAeMenu) return 'menu not captured';
      const item = global.__yimuAeMenu.items.find((x) => x.id === 'ae');
      if (!item) return 'no After Effects item';
      item.click();
      return 'clicked';
    });
    report.menu = clicked;
    assert.equal(clicked, 'clicked', 'Could not invoke the After Effects menu item');

    // After Effects starts on demand; give the host time to answer.
    let status = '';
    let finished = false;
    for (let i = 0; i < 240; i++) {
      await new Promise((r) => setTimeout(r, 500));
      status = await page.evaluate(() => document.querySelector('#status').textContent);
      if (status.includes('AE 已确认导入') || /失败|错误|Error/.test(status)) {
        finished = true;
        break;
      }
    }
    report.status = status;
    assert.ok(finished, 'After Effects did not answer within 120s; status=' + status);
    assert.ok(!/失败|错误|Error/.test(status), 'After Effects reported an error: ' + status);

    const addedMatch = status.match(/AE 已确认导入\s*(\d+)\s*项/);
    const missingMatch = status.match(/缺失引用\s*(\d+)/);
    assert.ok(addedMatch, 'Status did not report an AE confirmation: ' + status);
    report.added = Number(addedMatch[1]);
    report.missing = missingMatch ? Number(missingMatch[1]) : null;
    assert.equal(report.added, mediaFiles.length, 'AE confirmed ' + report.added + ' of ' + mediaFiles.length + ' item(s)');
    assert.equal(report.missing, 0, 'AE reported missing references');

    // Cross-check with the bridge receipt written into the library's bridge dir.
    // The receipt keeps the request id as its file name and records what AE added.
    const bridgeDir = path.join(library, 'bridge');
    const candidates = fs.existsSync(bridgeDir)
      ? fs.readdirSync(bridgeDir)
          .filter((f) => f.endsWith('.json'))
          .map((f) => path.join(bridgeDir, f))
          .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)
      : [];
    let receipt = null;
    for (const file of candidates) {
      try {
        const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (parsed && parsed.result && Array.isArray(parsed.result.added)) {
          receipt = { file: path.basename(file), parsed };
          break;
        }
      } catch {}
    }
    assert.ok(receipt, 'No AE bridge receipt with an added list was found');
    assert.equal(receipt.parsed.ok, true, 'AE receipt reports failure');
    assert.ok(receipt.parsed.result.added.length >= 1, 'AE receipt added list is empty');
    assert.deepEqual(receipt.parsed.result.added.map((a) => a.name).sort(), mediaNames.slice().sort(), 'AE added different items: ' + receipt.parsed.result.added.map((a) => a.name).join(','));
    report.receipt = {
      file: receipt.file,
      ok: receipt.parsed.ok,
      added: receipt.parsed.result.added.map((a) => a.name),
      projectItems: receipt.parsed.result.project ? receipt.parsed.result.project.items : null,
    };
    report.checks.push('Right-click "发送到 After Effects" runs the product import path');
    report.checks.push('After Effects confirmed the import by name with no missing references');
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
    fs.writeFileSync('evidence/ae-import-ui.json', JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.passed ? 0 : 1;
  }
})();
