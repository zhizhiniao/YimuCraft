// Read-only build check plus isolated first-launch check; no personal library changes.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const asar = require('@electron/asar');
const {electron} = require('./test-app.cjs');
const root = path.resolve(__dirname, '..');
const version = require('../package.json').version;
// A fresh run keeps previous evidence and never reuses a populated test library.
const runId = `release-${version}-${Date.now()}`;
const output = path.join(root, 'evidence', runId);
const scratch = path.join(root, 'work', runId);
const release = path.join(root, 'release', version);
const installed = path.join(process.env.LOCALAPPDATA, 'Programs', 'YimuCraft');
const digest = data => crypto.createHash('sha256').update(data).digest('hex');
const report = {version, tag: `v${version}-dev.1`, output, sourceFiles: 0, mismatches: [], passed: false};
fs.mkdirSync(output, {recursive: true});
const archive = path.join(release, 'win-unpacked', 'resources', 'app.asar');
async function main() {
  report.asarSHA256 = digest(fs.readFileSync(archive));
  assert.equal(digest(fs.readFileSync(path.join(installed, 'resources', 'app.asar'))), report.asarSHA256);
  const manifest = {};
  function visit(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(file);
      else {
        const rel = path.relative(root, file).replaceAll('\\', '/');
        const hash = digest(fs.readFileSync(file));
        manifest[rel] = hash;
        report.sourceFiles++;
        if (digest(asar.extractFile(archive, path.relative(root, file))) !== hash) report.mismatches.push(rel);
      }
    }
  }
  visit(path.join(root, 'src'));
  assert.deepEqual(report.mismatches, []);
  assert.equal(JSON.parse(asar.extractFile(archive, 'package.json')).version, version);
  const forbidden = asar.listPackage(archive).map(p => p.replaceAll('\\', '/')).filter(p => /^\/(work|data|evidence|private-analysis|reference)(\/|$)/.test(p));
  assert.deepEqual(forbidden, []);
  report.installerSHA256 = digest(fs.readFileSync(path.join(release, `YimuCraft Setup ${version}.exe`)));
  fs.writeFileSync(path.join(output, 'source-manifest.json'), JSON.stringify(manifest, null, 2));
  let app;
  try {
    const env = {...process.env, YIMU_DATA_DIR: scratch};
    delete env.ELECTRON_RUN_AS_NODE;
    app = await electron.launch({executablePath: path.join(release, 'win-unpacked', 'YimuCraft.exe'), args: [], env});
    const page = await app.firstWindow();
    await page.waitForFunction(() => document.body.innerText.includes('YimuCraft'));
    await page.waitForFunction(() => document.querySelector('#resultCount')?.textContent === '0 项', {timeout: 60000});
    report.emptyQuery = await page.evaluate(() => window.yimu.command('query', {limit: 10, offset: 0}));
    assert.equal(report.emptyQuery.total, 0);
    report.ui = await page.evaluate(() => ({title: document.title, cards: document.querySelectorAll('.asset').length, text: document.body.innerText.slice(0, 1500)}));
    assert.equal(report.ui.cards, 0);
    report.actualVersion = await app.evaluate(({app}) => app.getVersion());
    assert.equal(report.actualVersion, version);
    await page.screenshot({path: path.join(output, 'clean-first-launch.png')});
  } finally {
    if (app) await require('./close-test-app.cjs')(app);
  }
  report.passed = true;
}
main().catch(e => {report.error = e.stack; process.exitCode = 1;}).finally(() => {
  fs.writeFileSync(path.join(output, 'verification.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
});
