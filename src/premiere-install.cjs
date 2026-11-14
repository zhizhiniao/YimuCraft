const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

// Write the manifest last so a new installation is discoverable only after its scripts exist.
async function installPremiereBridge(appData) {
  const source = path.join(__dirname, 'premiere-panel');
  const destination = path.join(appData, 'Adobe', 'CEP', 'extensions', 'com.yimucraft.bridge');
  let changed = false;
  for (const name of ['host.jsx', 'panel.js', 'index.html', 'CSXS/manifest.xml']) {
    const file = path.join(destination, name);
    const bytes = await fs.readFile(path.join(source, name));
    let existing;
    try { existing = await fs.readFile(file); }
    catch (e) { if (e.code !== 'ENOENT') throw e; }
    if (existing && existing.equals(bytes)) continue;
    await fs.mkdir(path.dirname(file), { recursive: true });
    const temporary = file + '.' + randomUUID() + '.tmp';
    try {
      await fs.writeFile(temporary, bytes, { flag: 'wx' });
      await fs.rename(temporary, file);
    } finally {
      await fs.rm(temporary, { force: true });
    }
    changed = true;
  }
  return { changed, message: changed ? 'PR 后台连接已安装。如果 PR 已打开，请保存工程并重启一次 PR' : 'PR 后台连接文件已就绪。可使用“检查 PR 连接”确认宿主状态' };
}
module.exports = { installPremiereBridge };
