// Verify that the packaged ASAR contains exactly the current working-tree
// sources. Reports per-file mismatches so "same version number" can never stand
// in for "same code".
//
// Note: @electron/asar on Windows stores and expects entry names with backslash
// separators and no leading separator ("src\\main.cjs"); forward slashes fail for
// nested entries, so extraction always uses the backslash form.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const asar = require('@electron/asar');

const unpacked = process.argv[2] || 'release/0.7.28/win-unpacked';
const asarPath = path.join(unpacked, 'resources', 'app.asar');
const out = process.argv[3] || 'evidence/installed-verify.json';

const sha = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');
const toEntry = (normalised) => normalised.replace(/\//g, '\\');

const report = { asarPath, asarSha256: null, checked: 0, mismatched: [], missingInAsar: [], extraSrcInAsar: [] };
report.asarSha256 = sha(fs.readFileSync(asarPath));

const listed = asar.listPackage(asarPath).map((p) => p.replace(/\\/g, '/').replace(/^\//, ''));
const srcInAsar = listed.filter((p) => /^src\/.*\.(cjs|js|jsx|html|css|svg|png|ico)$/.test(p));

const srcDir = path.resolve('src');
const localFiles = [];
(function walk(dir, prefix) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix + entry.name;
    if (entry.isDirectory()) walk(path.join(dir, entry.name), rel + '/');
    else if (/\.(cjs|js|jsx|html|css|svg|png|ico)$/.test(entry.name)) localFiles.push(rel);
  }
})(srcDir, '');

for (const rel of localFiles) {
  const asarName = 'src/' + rel;
  if (!srcInAsar.includes(asarName)) {
    report.missingInAsar.push(asarName);
    continue;
  }
  const localHash = sha(fs.readFileSync(path.join(srcDir, rel)));
  let packedHash;
  try {
    packedHash = sha(asar.extractFile(asarPath, toEntry(asarName)));
  } catch (e) {
    report.mismatched.push({ file: asarName, error: String(e && e.message) });
    continue;
  }
  report.checked++;
  if (localHash !== packedHash) report.mismatched.push({ file: asarName, localHash, packedHash });
}

for (const rel of srcInAsar) {
  if (!localFiles.includes(rel.slice(4))) report.extraSrcInAsar.push(rel);
}

report.packageJson = JSON.parse(asar.extractFile(asarPath, 'package.json').toString('utf8')).version;
report.sourceVersion = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
report.passed =
  report.mismatched.length === 0 &&
  report.missingInAsar.length === 0 &&
  report.extraSrcInAsar.length === 0 &&
  report.packageJson === report.sourceVersion;

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    {
      passed: report.passed,
      checked: report.checked,
      mismatched: report.mismatched,
      missingInAsar: report.missingInAsar,
      extraSrcInAsar: report.extraSrcInAsar,
      asarSha256: report.asarSha256,
      version: report.packageJson,
      sourceVersion: report.sourceVersion,
    },
    null,
    2,
  ),
);
process.exitCode = report.passed ? 0 : 1;
