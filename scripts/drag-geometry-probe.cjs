// Geometry probe for D01: reports real window geometry, DPI scale and the
// physical screen point of the first asset card. Does not modify the product.
const { electron } = require('./test-app.cjs');
const fs = require('fs');
const path = require('path');
const close = require('./close-test-app.cjs');

(async () => {
  const root = path.resolve('work/drag-geometry-' + Date.now());
  fs.mkdirSync(root, { recursive: true });
  const report = { root, executable: process.env.YIMU_TEST_EXE || 'development' };
  let app;
  try {
    const env = { ...process.env, YIMU_DATA_DIR: path.join(root, 'library') };
    delete env.ELECTRON_RUN_AS_NODE;
    app = await electron.launch({
      ...(process.env.YIMU_TEST_EXE ? { executablePath: process.env.YIMU_TEST_EXE, args: [] } : { args: ['.'] }),
      env,
    });
    const page = await app.firstWindow();
    await page.waitForFunction(() => document.querySelector('#status').textContent.startsWith('就绪'));

    const file = path.join(root, '几何探针.txt');
    fs.writeFileSync(file, 'geometry probe');
    await page.evaluate((f) => window.yimu.command('import', [f]), file);
    await page.locator('#refresh').click();
    await page.waitForSelector('.asset');

    await app.evaluate(({ BrowserWindow }) => {
      const w = BrowserWindow.getAllWindows()[0];
      w.setSize(960, 700);
      w.setAlwaysOnTop(true, 'screen-saver');
      w.focus();
    });
    await page.waitForTimeout(300);

    const box = await page.locator('.asset').first().boundingBox();
    const geo = await app.evaluate(({ BrowserWindow, screen }, box) => {
      const w = BrowserWindow.getAllWindows()[0];
      const b = w.getBounds();
      const c = w.getContentBounds();
      const d = screen.getDisplayMatching(b);
      const scale = d.scaleFactor;
      const cardCenterDip = {
        x: c.x + box.x + box.width / 2,
        y: c.y + box.y + Math.min(40, box.height / 2),
      };
      return {
        pid: process.pid,
        handle: w.getNativeWindowHandle().readBigUInt64LE().toString(),
        bounds: b,
        contentBounds: c,
        display: { id: d.id, scaleFactor: scale, bounds: d.bounds },
        cardCenterDip,
        cardCenterPhysical: {
          x: Math.round(cardCenterDip.x * scale),
          y: Math.round(cardCenterDip.y * scale),
        },
      };
    }, box);

    report.box = box;
    report.geometry = geo;

    // Physical->DIP sanity check: Electron exposes DIP; verify by asking the
    // OS for the cursor position after moving it with the OS API.
    const probeOut = path.join(root, 'cursor.json');
    const { execFileSync } = require('child_process');
    const psArgs = [
      '-NoProfile', '-ExecutionPolicy', 'Bypass', '-STA', '-File', path.resolve('scripts/ole-pointer-probe.ps1'),
      '-X', String(geo.cardCenterPhysical.x),
      '-Y', String(geo.cardCenterPhysical.y),
      '-SourcePid', String(geo.pid),
      '-Out', probeOut,
    ];
    try {
      execFileSync('powershell.exe', psArgs, { encoding: 'utf8', windowsHide: true });
    } catch (e) {
      report.probeError = String(e.stderr || e.message);
    }
    if (fs.existsSync(probeOut)) report.cursor = JSON.parse(fs.readFileSync(probeOut, 'utf8'));
  } catch (e) {
    report.passed = false;
    report.error = e.stack;
    process.exitCode = 1;
  } finally {
    await close(app);
    fs.writeFileSync('evidence/drag-geometry.json', JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  }
})();
