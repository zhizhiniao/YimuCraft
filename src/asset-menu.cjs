function assetMenu({ids,first,collections,context={},sendAction}){
 if(first.hidden)return [{id:'restoreSelected',label:'恢复素材',click:()=>sendAction('restoreSelected')},{type:'separator'},{id:'deletePermanent',label:'永久删除…',click:()=>sendAction('deletePermanent')},{id:'emptyTrash',label:'清空回收站…',click:()=>sendAction('emptyTrash')}];
 const accelerators={openSelected:'CmdOrCtrl+O',revealSelected:'CmdOrCtrl+E',renameSelected:'F2',copyFiles:'CmdOrCtrl+C',copyPaths:'CmdOrCtrl+Alt+C',trashSelected:'Delete'};
 const one=ids.length===1,item=(label,action,enabled=true)=>({id:action,label,enabled,accelerator:accelerators[action],click:()=>sendAction(action)}),separator={type:'separator'};
 const specialized=[];
 if(one&&first.kind==='lut')specialized.push(item('更换 LUT 参考图','detailAction:lutReference'));
 if(one&&['image','audio','video','lut'].includes(first.kind))specialized.push(item('生成兼容预览','detailAction:generatePreview'));
 if(one&&first.kind==='video')specialized.push(item('当前帧设为封面','detailAction:coverFrame'));
 if(one&&['ttf','otf'].includes(first.ext))specialized.push(item('安装字体','detailAction:installFont'));
 if(one&&first.kind==='font')specialized.push(item('字体应用 AE','detailAction:fontAe'));
 if(one&&['aep','aepx'].includes(first.ext))specialized.push(item('生成效果预览…','detailAction:generatePreview'));
 if(one&&['aep','aepx'].includes(first.ext))specialized.push(item('AE 工程检查','detailAction:verifyAe'));
 const organize=[item('批量修改资料','batchEdit'),{label:'添加到分类',enabled:collections.length>0,submenu:collections.map(c=>item(c.name,'assignCollection:'+c.id))}];
 if(Number.isInteger(context.collection))organize.push(item('移出当前分类','unassignCollection'));
 return [item('在默认应用中打开','openSelected',one),item('在资源管理器中显示预览','revealPreview',one&&!!(first.preview||first.cover)),item('在资源管理器中显示源文件','revealSelected',one),separator,
 item('发送到 After Effects','ae'),item('发送到 Premiere Pro','pr'),separator,
 item('AI 自动打标签','aiSettings'),item('AI 创建语义化索引','aiIndexSelected'),separator,
 item('AI 以图搜图','aiSimilar',one&&!!first.cover),item('查找相似图片','similarSelected',one&&!!first.cover),separator,
 ...(specialized.length?[{label:'素材操作',submenu:specialized}]:[]),{label:'整理素材',submenu:organize},
 item('重命名','renameSelected',one),item('复制文件','copyFiles'),item('复制文件名','copyNames'),item('复制路径','copyPaths'),separator,
 {label:'导出…',submenu:[item('导出到文件夹','export'),item('导出 ZIP 素材包','exportZip')]},separator,
 item(first.hidden?'恢复素材':'移入回收站',first.hidden?'restoreSelected':'trashSelected')];
}
module.exports={assetMenu};
