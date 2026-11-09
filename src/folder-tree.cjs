const path = require('node:path');

function buildTree({location, linkedSource, folders, folderPreferences}, placements) {
  const root = {path: '', children: [], count: 0, directCount: 0};
  const nodes = new Map();
  const hiddenRoots = [location, ...(linkedSource ? [path.join(linkedSource, 'source')] : [])];
  const managed = path.join(location, 'managed');
  const packages = path.join(location, 'packages');

  function hidden(folder) {
    if (hiddenRoots.some(base => {
      const relative = path.relative(folder, base);
      return relative === '' || (!path.isAbsolute(relative) && relative.split(path.sep)[0] !== '..');
    })) return true;
    const rel = path.relative(managed, folder).split(path.sep);
    if (rel[0] === '' || (/^[a-f0-9-]{36}$/i.test(rel[0]) && rel.length <= 2)) return true;
    const pkg = path.relative(packages, folder);
    return !path.isAbsolute(pkg) && pkg !== '..' && !pkg.includes(path.sep);
  }

  function ensure(folder) {
    const key = folder.toLowerCase();
    if (nodes.has(key)) return nodes.get(key);
    if (hidden(folder)) return root;
    const directory = path.dirname(folder);
    const parent = directory === folder ? root : ensure(directory);
    const node = {path: folder, name: path.basename(folder) || folder, naturalParent: parent.path,
      parent: parent.path, directCount: 0, count: 0, children: []};
    nodes.set(key, node);
    return node;
  }
  for (const {folder, count} of folders) ensure(path.resolve(folder)).directCount += count;
  for (const pref of folderPreferences) ensure(path.resolve(pref.path));

  const lookup = folder => folder ? nodes.get(folder.toLowerCase()) : root;
  for (const item of placements) {
    const child = lookup(item.source), parent = lookup(item.parent);
    if (child && parent && child !== root) child.parent = parent.path;
  }
  // If old paths reappear after relinking, conflicting overrides must never hide a branch in a cycle.
  function repairCycle() {
    const checked = new Set();
    for (const node of nodes.values()) {
      const chain = new Set();
      let at = node;
      while (at !== root && !checked.has(at)) {
        if (chain.has(at)) {
          const start = at;
          do {
            const next = lookup(at.parent);
            at.parent = at.naturalParent;
            at = next;
          } while (at !== start);
          return true;
        }
        chain.add(at);
        at = lookup(at.parent);
      }
      for (const member of chain) checked.add(member);
    }
    return false;
  }
  while (placements.length && repairCycle()) { /* Each repair drops an obsolete override. */ }
  for (const node of nodes.values()) lookup(node.parent).children.push(node);
  function total(node) {
    node.count = node.children.reduce((sum, child) => sum + total(child), node.directCount || 0);
    return node.count;
  }
  total(root);
  return {root, lookup};
}

function organize(lib, libraryPath, source, destination) {
  if (libraryPath !== lib.folder) throw Error('素材库已切换，请在当前库重新拖动');
  if (typeof source !== 'string' || !source || typeof destination !== 'string') throw Error('文件夹无效');
  lib.db.exec('BEGIN IMMEDIATE');
  try {
    const data = lib.folderTreeData();
    const {lookup} = buildTree(data, data.placements);
    const child = lookup(source), parent = lookup(destination);
    if (!child || !parent) throw Error('文件夹已变化，请刷新后重试');
    for (let at = parent; at.path; at = lookup(at.parent)) {
      if (at === child) throw Error('不能拖入自身或子文件夹');
    }
    if (child.parent !== parent.path) {
      if (parent.children.some(item => item.name.toLowerCase() === child.name.toLowerCase())) {
        throw Error('目标中已有同名文件夹');
      }
      if (child.naturalParent === parent.path) {
        lib.db.prepare('DELETE FROM folder_tree_parents WHERE source=?').run(child.path);
      } else {
        lib.db.prepare('INSERT INTO folder_tree_parents(source,parent) VALUES(?,?) ON CONFLICT(source) DO UPDATE SET parent=excluded.parent').run(child.path, parent.path);
      }
    }
    lib.db.exec('COMMIT');
    return {path: child.path, parent: parent.path};
  } catch (error) {
    if (lib.db.isTransaction) lib.db.exec('ROLLBACK');
    throw error;
  }
}

// Run within the existing physical move/relink transaction.
function remapPlacements(db, remap) {
  const rows = db.prepare('SELECT source,parent FROM folder_tree_parents').all();
  const changed = rows.filter(row => remap(row.source) !== row.source || remap(row.parent) !== row.parent);
  for (const row of changed) db.prepare('DELETE FROM folder_tree_parents WHERE source=?').run(row.source);
  for (const row of changed) db.prepare('INSERT INTO folder_tree_parents VALUES(?,?)').run(remap(row.source), row.parent ? remap(row.parent) : '');
}

module.exports = {buildTree, organize, remapPlacements};
