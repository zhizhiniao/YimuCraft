// Compare application sources with an unpacked or installed ASAR.
const fs = require('fs');
const path = require('path');
const asar = require('@electron/asar');
const archive = path.resolve(process.argv[2] || 'release/0.7.57/win-unpacked/resources/app.asar');
let files = 0;
const mismatch = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(file); continue; }
    files++;
    try {
      if (!fs.readFileSync(file).equals(asar.extractFile(archive, file))) mismatch.push(file);
    } catch { mismatch.push(file); }
  }
}
walk('src');
const pkg = JSON.parse(asar.extractFile(archive, 'package.json').toString());
console.log(JSON.stringify({ archive, version: pkg.version, files, mismatch }));
if (mismatch.length) process.exitCode = 1;
