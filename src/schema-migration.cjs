const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const VERSION=2;
function migrate(db,folder,initialize){
 const version=Number(db.prepare('PRAGMA user_version').get().user_version);
 if(version>VERSION)throw Error('素材库版本较新，请使用更新的一幕；未修改数据库');
 db.exec('PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;');
 if(version===VERSION)return;
 if(db.prepare('PRAGMA quick_check').get().quick_check!=='ok')throw Error('素材库完整性检查失败，请从备份恢复到新目录');
 let backup;
 const exists=db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").get();
 if(exists){
  const directory=path.join(folder,'schema-backups');fs.mkdirSync(directory,{recursive:true});
  backup=path.join(directory,'pre-v'+version+'-to-v'+VERSION+'-'+crypto.randomUUID()+'.sqlite');
  const temporary=backup+'.partial';db.prepare('VACUUM INTO ?').run(temporary);
  const copy=new (require('node:sqlite').DatabaseSync)(temporary,{readOnly:true});
  try{if(copy.prepare('PRAGMA integrity_check').get().integrity_check!=='ok')throw Error('升级前快照校验失败');}finally{copy.close();}
  fs.renameSync(temporary,backup);
 }
 db.exec('BEGIN IMMEDIATE');
 try{
  // Another connection may have completed the migration while snapshotting.
  const current=Number(db.prepare('PRAGMA user_version').get().user_version);
  if(current>VERSION)throw Error('素材库版本较新');
  if(current<VERSION){initialize();db.exec('PRAGMA user_version='+VERSION);}
  db.exec('COMMIT');
 }catch(e){if(db.isTransaction)db.exec('ROLLBACK');throw Error('素材库升级失败，未提交的修改已回滚。'+(backup?'升级前快照：'+backup+'。':'')+e.message,{cause:e});}
}
module.exports={migrate,VERSION};
