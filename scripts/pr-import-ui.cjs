// D03/D01: import a library asset into Premiere Pro through the product's own
// right-click action ("发送到 Premiere Pro"), not through simulated window drags.
//
// The native popup is intercepted so the real menu item's callback runs without a
// focus race, then the run proves Premiere actually took the media by comparing
// the owning project's bin item count before and after through the CEP bridge.
const { electron } = require('./test-app.cjs');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const assert = require('assert/strict');
const close = require('./close-test-app.cjs');
const { PremiereBridge } = require('../src/premiere-bridge.cjs');

const lateErrors = [];
process.on('unhandledRejection', (reason) => {
  lateErrors.push(String((reason && reason.message) || reason));
});

(async () => {
  const root = path.resolve('work/pr-import-' + Date.now());
  fs.mkdirSync(root, { recursive: true });
  const report = { root, executable: process.env.YIMU_TEST_EXE || 'development', checks: [] };
  let app, page;

  try {
    const bridge = new PremiereBridge();
    const before = await bridge.run('inspect');
    const projectPath = path.resolve(before.result.project);
    const expectedProject=path.resolve(process.env.YIMU_PR_TEST_PROJECT||'work/YimuCraft_PR_Test.prproj');
    assert.ok(expectedProject.startsWith(path.resolve('work')+path.sep),'Test project must be inside work');
    assert.equal(projectPath, expectedProject, 'PR must have the owned test project active');
    report.before = { items: before.result.items, version: before.result.version, project: projectPath };

    const env = { ...process.env, YIMU_DATA_DIR: path.join(root, 'library') };
    delete env.ELECTRON_RUN_AS_NODE;
    app = await electron.launch({
      ...(process.env.YIMU_TEST_EXE ? { executablePath: process.env.YIMU_TEST_EXE, args: [] } : { args: ['.'] }),
      env,
    });
    page = await app.firstWindow();
    await page.waitForFunction(() => document.querySelector('#status').textContent.startsWith('就绪'));

    // YIMU_BATCH=1 imports two assets and sends both, which exercises the batch
    // branch of the same right-click action.
    const batch = process.env.YIMU_BATCH === '1';
    report.batch = batch;
    const kinds = process.env.YIMU_MEDIA_KINDS?.split(',');
    const mediaFiles = kinds ? kinds.map((kind, index) => {
      assert.ok(['audio','video','image'].includes(kind));
      const target=path.join(root, '右键导入 '+kind+({audio:'.wav',video:'.mp4',image:'.png'}[kind]));
      const inputs=kind==='audio'?['-f','lavfi','-i','sine=frequency=550:duration=1']:
        kind==='video'?['-f','lavfi','-i','color=c=blue:s=320x180:d=1','-pix_fmt','yuv420p']:
        ['-f','lavfi','-i','color=c=orange:s=320x180','-frames:v','1'];
      execFileSync(require('ffmpeg-static'),['-hide_banner','-loglevel','error','-y',...inputs,target],{windowsHide:true});
      return target;
    }) : batch
      ? ['导入PR 音频一.wav', '导入PR 音频二.wav'].map((name, index) => {
          const target = path.join(root, name);
          execFileSync(require('ffmpeg-static'), ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', `sine=frequency=${440 + index * 110}:duration=1`, target], { windowsHide: true });
          return target;
        })
      : [path.join(root, '导入PR 音频.wav')];
    if (!batch&&!kinds) {
      execFileSync(require('ffmpeg-static'), ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=1', mediaFiles[0]], { windowsHide: true });
    }
    await page.evaluate((list) => window.yimu.command('import', list), mediaFiles);
    await page.locator('#refresh').click();
    await page.waitForSelector('.asset');
    if (batch) {
      await page.keyboard.press('Control+a');
      await page.waitForFunction((n) => document.querySelectorAll('.asset.selected').length === n, mediaFiles.length, { timeout: 5000 });
    }

    // Capture the real menu instead of showing a native popup.
    const nativeMenu=process.env.YIMU_PR_NATIVE_MENU==='1';
    if(nativeMenu){
      const handle=await app.evaluate(({app,BrowserWindow})=>{
        app.setAccessibilitySupportEnabled(true);
        const window=BrowserWindow.getAllWindows()[0];
        window.show();window.focus();
        return Number(window.getNativeWindowHandle().readBigUInt64LE());
      });
      const activate="import win32gui as g,win32com.client as c,sys,time;h=int(sys.argv[1]);c.Dispatch('WScript.Shell').SendKeys('%');g.SetForegroundWindow(h);time.sleep(.1);assert g.GetForegroundWindow()==h";
      execFileSync('python',['-c',activate,String(handle)],{windowsHide:true});
    }
    if(!nativeMenu)await app.evaluate(({ Menu }) => {
      const build = Menu.buildFromTemplate.bind(Menu);
      const hasSend = (items) =>
        items.some((item) => item.id === 'pr' || (item.submenu && hasSend(item.submenu.items)));
      Menu.buildFromTemplate = (template) => {
        const menu = build(template);
        if (hasSend(menu.items)) menu.popup = () => { global.__yimuPrMenu = menu; };
        return menu;
      };
    });

    await page.locator('.asset').first().click({ button: 'right' });
    if(nativeMenu)execFileSync('python',['-c',"from PIL import ImageGrab;import sys;ImageGrab.grab().save(sys.argv[1])",path.join(root,'native-menu.png')],{windowsHide:true});
    let clicked;
    if(nativeMenu){
      const script = [
        'Add-Type -AssemblyName UIAutomationClient',
        'Add-Type -AssemblyName UIAutomationTypes',
        "$root=[System.Windows.Automation.AutomationElement]::RootElement",
        "$condition=[System.Windows.Automation.PropertyCondition]::new([System.Windows.Automation.AutomationElement]::NameProperty,'发送到 Premiere Pro')",
        '$deadline=[DateTime]::UtcNow.AddSeconds(6)',
        'do{$item=$root.FindFirst([System.Windows.Automation.TreeScope]::Descendants,$condition);if(!$item){Start-Sleep -Milliseconds 150}}while(!$item -and [DateTime]::UtcNow -lt $deadline)',
        "if(!$item){throw 'Native Premiere menu item missing'}",
        '$item.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke()'
      ].join('\n');
      execFileSync('powershell.exe',['-NoProfile','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{windowsHide:true,timeout:15000});
      clicked='clicked';
    }else clicked = await app.evaluate(async () => {
      for (let i = 0; i < 60 && !global.__yimuPrMenu; i++) await new Promise((r) => setTimeout(r, 50));
      if (!global.__yimuPrMenu) return 'menu not captured';
      const item = global.__yimuPrMenu.items.find((x) => x.id === 'pr');
      if (!item) return 'no Premiere item';
      item.click();
      return 'clicked';
    });
    report.menu = clicked;
    report.nativeMenu = nativeMenu;
    report.mediaKinds = kinds;
    assert.equal(clicked, 'clicked', 'Could not invoke the Premiere menu item');

    let status = '';
    let after = null;
    const expected = mediaFiles.length;
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 500));
      status = await page.evaluate(() => document.querySelector('#status').textContent);
      if (status.includes('PR 已确认接收素材')) break;
    }
    assert.match(status,/PR 已确认接收素材/,'Product action did not confirm import');
    assert.doesNotMatch(status,/窗口未切换/);
    if(process.env.YIMU_PR_TEST_FOREGROUND==='1'){
      const probe="import win32gui as g,win32process as p,json;h=g.GetForegroundWindow();print(json.dumps({'pid':p.GetWindowThreadProcessId(h)[1],'title':g.GetWindowText(h)}))";
      report.foreground=JSON.parse(execFileSync('python',['-c',probe],{encoding:'utf8',windowsHide:true}));
      assert.ok(report.foreground.title.startsWith('Adobe Premiere'),report.foreground.title);
      report.checks.push('Windows foreground belongs to Premiere after successful menu action');
    }
    after = await bridge.run('inspect');
    report.status = status;
    report.after = { items: after.result.items, project: path.resolve(after.result.project) };
    assert.equal(report.after.project, projectPath, 'Premiere switched away from the owned test project');
    assert.equal(
      report.after.items,
      report.before.items + expected,
      `Premiere bin gained ${report.after.items - report.before.items} item(s), expected ${expected}; status=${status}`,
    );
    report.checks.push('Right-click "发送到 Premiere Pro" runs the product import path');
    report.checks.push(`Premiere project bin gained exactly ${expected} item(s)`);
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
    fs.writeFileSync(path.join(root,'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.passed ? 0 : 1;
  }
})();
