// D01: full native card drag-out across displays.
//
// A real pointer presses a library card, the renderer's dragstart handler asks
// main for a native OLE drag, and the gesture then travels to an independent
// Electron receiver parked on the other display before releasing. Passing
// therefore requires: renderer dragstart (trusted), main webContents.startDrag,
// Windows OLE delivery, and the library's real bytes on the receiving side.
//
// Requires scripts/test-app.cjs (adds --no-sandbox on this machine),
// scripts/ole-card-pointer.ps1 (DPI-correct absolute pointer gesture) and
// scripts/pointer-reset.ps1 (clears leftovers from interrupted runs).
const { electron } = require('./test-app.cjs');
const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');
const assert = require('assert/strict');
const close = require('./close-test-app.cjs');

// Playwright surfaces late connection teardown as an unhandled rejection after
// the run has already been recorded; keep it as evidence instead of letting it
// rewrite the process exit code.
const lateErrors = [];
process.on('unhandledRejection', (reason) => {
  lateErrors.push(String((reason && reason.message) || reason));
});

(async () => {
  const root = path.resolve('work/native-card-drag-' + Date.now());
  fs.mkdirSync(root, { recursive: true });
  const receipt = path.join(root, 'drop.json');
  const trigger = path.join(root, 'trigger');
  const go = path.join(root, 'go');
  const release = path.join(root, 'release');
  const retry = path.join(root, 'retry');
  const startedMarker = path.join(root, 'native-started');
  const pointerOut = path.join(root, 'pointer.json');
  const report = { root, executable: process.env.YIMU_TEST_EXE || 'development', checks: [] };
  let app, receiver, child, page;

  try {
    // Clear any leftover synthetic press/pointer script from an interrupted run.
    {
      const resetOut = path.join(root, 'reset.json');
      try {
        execFileSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-STA', '-File', path.resolve('scripts/pointer-reset.ps1'), '-Out', resetOut], { encoding: 'utf8', windowsHide: true });
        report.reset = JSON.parse(fs.readFileSync(resetOut, 'utf8'));
      } catch (e) {
        report.reset = { error: String((e && e.stderr) || (e && e.message)) };
      }
    }

    const env = { ...process.env, YIMU_DATA_DIR: path.join(root, 'library'), YIMU_RECEIPT: receipt };
    delete env.ELECTRON_RUN_AS_NODE;

    receiver = await electron.launch({ args: [path.resolve('scripts/ole-receiver.cjs')], env });
    await receiver.firstWindow();
    // Give the receiver a moment to park itself on the secondary display.
    await new Promise((r) => setTimeout(r, 1200));
    const dropTarget = await receiver.evaluate(({ BrowserWindow }) => {
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
    report.receiver = dropTarget;
    assert.ok(dropTarget.visible, 'Receiver window is not visible; it could never accept a drop');

    app = await electron.launch({
      ...(process.env.YIMU_TEST_EXE ? { executablePath: process.env.YIMU_TEST_EXE, args: [] } : { args: ['.'] }),
      env,
    });
    page = await app.firstWindow();
    await page.waitForFunction(() => document.querySelector('#status').textContent.startsWith('就绪'));

    const fileNames = ['真实卡片拖放.txt', '多文件 名字.txt'];
    const files = fileNames.map((name) => {
      const p = path.join(root, name);
      fs.writeFileSync(p, 'card native drag ' + name);
      return p;
    });
    await page.evaluate((list) => window.yimu.command('import', list), files);
    await page.locator('#refresh').click();
    await page.waitForSelector('.asset');
    // Select every imported card so the drag carries multiple files.
    await page.keyboard.press('Control+a');
    await page.waitForFunction(() => document.querySelectorAll('.asset.selected').length === 2, null, { timeout: 5000 });

    // Park the library window on the primary display, where the press is known
    // to reach the renderer. The receiver is moved under the pointer after the
    // native drag starts (in-place drop), which avoids long synthetic travel.
    await app.evaluate(({ BrowserWindow }) => {
      const w = BrowserWindow.getAllWindows()[0];
      w.setBounds({ x: 40, y: 40, width: 960, height: 700 });
      w.setAlwaysOnTop(true, 'screen-saver');
      w.show();
      w.focus();
      w.moveTop();
    });
    await page.waitForTimeout(400);

    const box = await page.locator('.asset').first().boundingBox();
    const source = await app.evaluate(({ BrowserWindow }, box) => {
      const w = BrowserWindow.getAllWindows()[0];
      return {
        pid: process.pid,
        handle: w.getNativeWindowHandle().readBigUInt64LE().toString(),
        bounds: w.getBounds(),
        client: { x: Math.round(box.x + box.width / 2), y: Math.round(box.y + Math.min(40, box.height / 2)) },
      };
    }, box);
    report.box = box;
    report.source = source;

    // Record the real startDrag call so a renderer-only drag cannot pass.
    // `require` is not in scope inside ElectronApplication.evaluate; reaching the
    // filesystem through process.mainModule keeps the wrapper from throwing.
    await app.evaluate(({ BrowserWindow }, marker) => {
      const wc = BrowserWindow.getAllWindows()[0].webContents;
      const original = wc.startDrag.bind(wc);
      const fsModule = process.mainModule.require('fs');
      globalThis.__yimuStartDragArgs = [];
      wc.startDrag = (data) => {
        globalThis.__yimuStartDragArgs.push(data && data.files ? data.files.length : 0);
        fsModule.writeFileSync(marker, String(Date.now()));
        return original(data);
      };
    }, startedMarker);

    await page.evaluate(() => {
      window.testCardEvents = [];
      window.testErrors = [];
      window.testInput = { mousedown: 0, mousemove: 0, pointerdown: 0, firstDown: null };
      for (const type of ['mousedown', 'mousemove', 'pointerdown']) {
        document.addEventListener(type, (e) => {
          window.testInput[type] = (window.testInput[type] || 0) + 1;
          if (type === 'mousedown' && !window.testInput.firstDown) {
            window.testInput.firstDown = { cls: String(e.target.className || e.target.tagName), x: e.clientX, y: e.clientY };
          }
        }, true);
      }
      window.addEventListener('error', (e) => window.testErrors.push('error: ' + (e.message || '')));
      window.addEventListener('unhandledrejection', (e) => window.testErrors.push('rejection: ' + String((e.reason && e.reason.message) || e.reason)));
      document.addEventListener('dragstart', (e) => window.testCardEvents.push({ type: e.type, asset: !!(e.target.closest && e.target.closest('.asset')), trusted: e.isTrusted }), true);
      document.addEventListener('dragstart', (e) => window.testCardEvents.push({ type: 'dragstart-bubble', prevented: e.defaultPrevented }), false);
    });

    // Raise the window from its own process: a background PowerShell process
    // cannot reliably take the foreground, and a synthetic activation click was
    // measured to consume the drag press itself.
    await app.evaluate(({ BrowserWindow }) => {
      const w = BrowserWindow.getAllWindows()[0];
      w.setAlwaysOnTop(true, 'screen-saver');
      w.show();
      w.focus();
      w.moveTop();
    });
    await page.waitForTimeout(300);

    child = spawn(
      'powershell.exe',
      [
        '-NoProfile', '-ExecutionPolicy', 'Bypass', '-STA', '-File', path.resolve('scripts/ole-card-pointer.ps1'),
        '-ClientX', String(source.client.x), '-ClientY', String(source.client.y),
        '-SourcePid', String(source.pid), '-SourceHandle', source.handle,
        '-Trigger', trigger, '-GoMarker', go, '-ReleaseMarker', release,
        '-RetryMarker', retry, '-AttemptDir', root, '-Out', pointerOut,
      ],
      { windowsHide: true },
    );
    let stderr = '';
    child.stderr.on('data', (b) => (stderr += b));

    // A press that never reaches the renderer is provably swallowed (usually by
    // window activation); only then is the pointer script told to press again.
    let started = false;
    let maxMousedown = 0;
    let handledAttempt = 0;
    for (let i = 0; i < 1500 && !started; i++) {
      started = fs.existsSync(startedMarker);
      if (started) break;
      for (let n = handledAttempt + 1; n <= 3; n++) {
        if (!fs.existsSync(path.join(root, `attempt-${n}`))) break;
        handledAttempt = n;
        await new Promise((r) => setTimeout(r, 350));
        const md = await page.evaluate(() => window.testInput.mousedown);
        if (md > maxMousedown) {
          maxMousedown = md;
          report.pressDeliveredOnAttempt = n;
        } else {
          fs.writeFileSync(retry, 'retry');
        }
      }
      if (!started && child.exitCode !== null) break;
      if (!started) await new Promise((r) => setTimeout(r, 40));
    }
    if (fs.existsSync(pointerOut)) report.pointer = JSON.parse(fs.readFileSync(pointerOut, 'utf8'));
    assert.ok(started, 'Native startDrag never ran. ' + (stderr || JSON.stringify(report.pointer || {}) || 'no marker'));
    report.nativeStarted = true;
    // Release the gesture immediately: calling app.evaluate while main is inside
    // the OLE drag loop blocks, so startDrag data is read after the drop again.
    fs.writeFileSync(go, 'go');

    // In-place drop: bring the receiver under the pointer while the button is
    // still held, then let the pointer script release there.
    await receiver.evaluate(({ BrowserWindow, screen }) => {
      const w = BrowserWindow.getAllWindows()[0];
      const p = screen.getCursorScreenPoint();
      w.setBounds({ x: Math.round(p.x - w.getBounds().width / 2), y: Math.round(p.y - w.getBounds().height / 2), width: w.getBounds().width, height: w.getBounds().height });
      w.setAlwaysOnTop(true, 'screen-saver');
      w.showInactive();
      w.moveTop();
    });
    await new Promise((r) => setTimeout(r, 600));
    report.receiverAtDrop = await receiver.evaluate(({ BrowserWindow }) => {
      const w = BrowserWindow.getAllWindows()[0];
      return { bounds: w.getBounds(), visible: w.isVisible(), focused: w.isFocused() };
    });
    fs.writeFileSync(release, 'release');

    let received = false;
    for (let i = 0; i < 400 && !received; i++) {
      received = fs.existsSync(receipt);
      if (!received) await new Promise((r) => setTimeout(r, 50));
    }
    await new Promise((r) => setTimeout(r, 400));
    if (fs.existsSync(pointerOut)) report.pointer = JSON.parse(fs.readFileSync(pointerOut, 'utf8'));
    try { report.receiverEvents = JSON.parse(fs.readFileSync(receipt + '.events', 'utf8')); } catch {}
    report.startDragCalls = await app.evaluate(() => globalThis.__yimuStartDragArgs);
    report.input = await page.evaluate(() => window.testInput);
    report.events = await page.evaluate(() => window.testCardEvents);
    assert.ok(received, 'Receiver got no drop. ' + (stderr || 'pointer=' + JSON.stringify(report.pointer || {})));

    report.drop = JSON.parse(fs.readFileSync(receipt, 'utf8'));
    const rows = (await page.evaluate(() => window.yimu.command('query', {}))).items;
    assert.ok(rows.length === 2, 'Expected both imported assets in the library');
    assert.ok(report.events.some((e) => e.asset && e.trusted), 'No trusted card dragstart');
    assert.equal(report.startDragCalls.length, 1, 'startDrag was not called exactly once');
    assert.equal(report.startDragCalls[0], 2, 'startDrag was not asked to drag both selected files');
    assert.deepEqual([...report.drop.files].sort(), rows.map((r) => r.path).sort(), 'Dropped paths are not the library paths');
    for (const row of rows) {
      assert.equal(fs.readFileSync(row.path, 'utf8'), 'card native drag ' + row.name, 'Received bytes differ for ' + row.name);
    }
    report.checks.push('Real pointer press on a card starts the native OLE drag');
    report.checks.push('Two selected Chinese-named files cross into an independent process');
    report.checks.push('Received bytes match the library files');
    report.passed = true;
  } catch (e) {
    report.passed = false;
    report.error = e.stack;
    try {
      if (page) report.diagnostics = await page.evaluate(() => ({
        events: window.testCardEvents || null,
        errors: window.testErrors || null,
        input: window.testInput || null,
        status: (document.querySelector('#status') || {}).textContent || null,
      }));
    } catch (inner) {
      report.diagnostics = { unavailable: String(inner && inner.message) };
    }
    try {
      if (fs.existsSync(pointerOut)) report.pointer = JSON.parse(fs.readFileSync(pointerOut, 'utf8'));
    } catch (inner) {
      report.pointer = { unreadable: String(inner && inner.message) };
    }
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
    fs.writeFileSync('evidence/native-card-drag.json', JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.passed ? 0 : 1;
  }
})();
