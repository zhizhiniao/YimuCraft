/* Independent YimuCraft host bridge. Data only in YIMU_REQUEST; no eval of payload. */
(function(request){
  function quote(s){return '"'+String(s).replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\r/g,'\\r').replace(/\n/g,'\\n').replace(/\t/g,'\\t')+'"';}
  function json(v){if(v===null||v===undefined)return 'null';if(typeof v==='string')return quote(v);if(typeof v==='number')return isFinite(v)?String(v):'null';if(typeof v==='boolean')return v?'true':'false';var a=[],k;if(v instanceof Array){for(k=0;k<v.length;k++)a.push(json(v[k]));return '['+a.join(',')+']';}for(k in v)if(v.hasOwnProperty(k))a.push(quote(k)+':'+json(v[k]));return '{'+a.join(',')+'}';}
  function mkdir(f){if(!f.exists){if(f.parent&&!f.parent.exists)mkdir(f.parent);if(!f.create())throw Error('Cannot create folder: '+f.fsName);}return f;}
  function same(a,b){return String(a).replace(/\\/g,'/').toLowerCase()===String(b).replace(/\\/g,'/').toLowerCase();}
  function projectInfo(){var files=[],comps=[],fonts=[],missing=[],i,item,layer,text;
    for(i=1;i<=app.project.numItems;i++){item=app.project.item(i);
      if(item instanceof FootageItem&&item.mainSource instanceof FileSource){var f=item.file;files.push({id:item.id,name:item.name,path:f?f.fsName:null,exists:f?f.exists:false,isStill:item.mainSource.isStill,frameRate:item.frameRate});if(!f||!f.exists||item.footageMissing)missing.push(item.name);}
      if(item.proxySource instanceof FileSource){var p=item.proxySource.file;files.push({id:item.id,name:item.name,proxy:true,path:p?p.fsName:null,exists:p?p.exists:false});if(!p||!p.exists)missing.push(item.name+' (proxy)');}
      if(item instanceof CompItem){comps.push({id:item.id,name:item.name,width:item.width,height:item.height,frameRate:item.frameRate,duration:item.duration,layers:item.numLayers});for(var l=1;l<=item.numLayers;l++){layer=item.layer(l);if(layer instanceof TextLayer){text=layer.property('ADBE Text Properties').property('ADBE Text Document').value;fonts.push(text.font);}}}
    }var selectedComps=[];for(i=0;i<app.project.selection.length;i++)if(app.project.selection[i] instanceof CompItem)selectedComps.push(app.project.selection[i].id);if(!selectedComps.length&&app.project.activeItem instanceof CompItem)selectedComps.push(app.project.activeItem.id);return {version:app.version,project:app.project.file?app.project.file.fsName:null,dirty:app.project.dirty,selectedCompIds:selectedComps,items:app.project.numItems,files:files,comps:comps,fonts:fonts,missing:missing};
  }
  function openIsolated(file){if(!request.isolated)throw Error('Requires isolated AE process');if(app.project&&app.project.file&&same(app.project.file.fsName,file)){reusedOpenProject=true;return;}if(app.project&&(app.project.file||app.project.numItems))throw Error('Isolated session contains a project; refusing to replace it');var f=new File(file);if(!f.exists)throw Error('Project does not exist: '+file);app.open(f);}
  function sequenceFiles(file,source){var ext=/\.([^.]+)$/.exec(file.name),m=/^(.*?)(\d+)(\.[^.]+)$/.exec(file.name);if(!source.isStill&&ext&&/^(png|jpe?g|tiff?|exr|dpx|bmp|tga|cin)$/i.test(ext[1])){if(!m)throw Error('Image sequence naming is ambiguous: '+file.fsName);var candidates=file.parent.getFiles(),out=[];for(var i=0;i<candidates.length;i++){var n=/^(.*?)(\d+)(\.[^.]+)$/.exec(candidates[i].name);if(candidates[i] instanceof File&&n&&n[1]===m[1]&&n[2].length===m[2].length&&n[3].toLowerCase()===m[3].toLowerCase())out.push(candidates[i]);}return out;}return [file];}
  function collect(payload,alreadyOpen){
    if(!alreadyOpen)openIsolated(payload.project);if(payload.compIds&&payload.compIds.length){var keep=[];for(var c=0;c<payload.compIds.length;c++){var candidate=app.project.itemByID(payload.compIds[c]);if(!(candidate instanceof CompItem))throw Error('Selected composition no longer exists');keep.push(candidate);}app.project.reduceProject(keep);}var before=projectInfo();if(before.missing.length)throw Error('Missing footage: '+before.missing.join(', '));
    var footageName=payload.footageFolder||'(Footage)';if(/[\\\/:*?"<>|]/.test(footageName)||footageName==='.'||footageName==='..')throw Error('Invalid footage folder');var output=new Folder(payload.output);if(output.exists)throw Error('Output already exists: '+output.fsName);mkdir(output);var copied=[],i,item;
    function copySource(item,source,proxy){var input=source.file;if(!input||!input.exists)throw Error('Missing source: '+item.name);var dir=mkdir(new Folder(output.fsName+'/'+footageName+'/'+item.id+(proxy?'-proxy':''))),seq=sequenceFiles(input,source),target=new File(dir.fsName+'/'+decodeURI(input.name));for(var s=0;s<seq.length;s++){var out=new File(dir.fsName+'/'+decodeURI(seq[s].name));if(!seq[s].copy(out.fsName))throw Error('Copy failed: '+seq[s].fsName);copied.push({from:seq[s].fsName,to:out.fsName,bytes:out.length});}return {file:target,sequence:seq.length>1,frameRate:source.conformFrameRate};}
    for(i=1;i<=app.project.numItems;i++){item=app.project.item(i);if(item instanceof FootageItem&&item.mainSource instanceof FileSource){var main=copySource(item,item.mainSource,false);if(main.sequence)item.replaceWithSequence(main.file,false);else item.replace(main.file);if(main.frameRate>0&&!item.mainSource.isStill)item.mainSource.conformFrameRate=main.frameRate;}if(item.proxySource instanceof FileSource){var enabled=item.useProxy,proxy=copySource(item,item.proxySource,true);if(proxy.sequence)item.setProxyWithSequence(proxy.file,false);else item.setProxy(proxy.file);item.useProxy=enabled;}}
    var aep=new File(output.fsName+'/'+decodeURI(new File(payload.project).name));app.project.save(aep);app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);app.open(aep);var after=projectInfo();if(after.missing.length)throw Error('Collected project has missing media');
    return {project:aep.fsName,before:before,after:after,copied:copied,limitations:['Fonts and third-party plugins are recorded or external; not redistributed.','External paths embedded in expressions and third-party plugin settings are not rewritten.']};
  }
  function collectCurrent(payload){
    if(!app.project||!app.project.file||app.project.dirty)throw Error('请先保存当前工程，再打包；未保存的修改不会被丢弃');
    var original=app.project.file,before=projectInfo(),selected=[],active=app.project.activeItem,activeId=active?active.id:null,activeTime=active instanceof CompItem?active.time:null;
    for(var si=0;si<app.project.selection.length;si++)selected.push(app.project.selection[si].id);
    var output=new Folder(payload.output);if(output.exists)throw Error('Output already exists: '+output.fsName);
    var temp=mkdir(new Folder(payload.snapshotRoot+'/'+request.id)),snapshot=new File(temp.fsName+'/'+original.name),result,restored=false;
    if(!original.copy(snapshot.fsName))throw Error('Cannot snapshot saved project');
    try{
      app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);app.open(snapshot);
      result=collect({project:snapshot.fsName,output:output.fsName,compIds:payload.compIds||[],footageFolder:'Footage'},true);
    }finally{
      if(app.project)app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);app.open(original);
      for(var i=1;i<=app.project.numItems;i++){var item=app.project.item(i);item.selected=false;for(var j=0;j<selected.length;j++)if(item.id===selected[j])item.selected=true;}
      if(activeId){var target=app.project.itemByID(activeId);if(target instanceof CompItem){target.openInViewer();if(activeTime!==null)target.time=activeTime;}}
      restored=same(app.project.file.fsName,original.fsName);snapshot.remove();temp.remove();
    }
    if(!restored)throw Error('Original project could not be restored');result.original=before;result.restored=projectInfo();return result;
  }
  var response={id:request.id,ok:false,operation:request.operation,version:app.version},ownsProject=false,reusedOpenProject=false;
  try{
    if(request.isolated&&app.project&&(app.project.file||app.project.numItems))throw Error('Existing project detected; no changes made');
    ownsProject=!!request.isolated;
    app.exitAfterLaunchAndEval=!!request.isolated;
    if(!app.project)app.newProject();var p=request.payload,result;
    if(request.operation==='collectCurrent')result=collectCurrent(p);
    else if(request.operation==='inspect')result=projectInfo();
    else if(request.operation==='import'){
      var added=[];app.beginUndoGroup('YimuCraft import');try{for(var i=0;i<p.paths.length;i++){var f=new File(p.paths[i]);if(!f.exists)throw Error('File missing: '+f.fsName);var imported=app.project.importFile(new ImportOptions(f));added.push({id:imported.id,name:imported.name,source:f.fsName});}}finally{app.endUndoGroup();}result={added:added,project:projectInfo()};
    }else if(request.operation==='preset'){
      var preset=new File(p.path),active=app.project.activeItem;if(!preset.exists||!/\.ffx$/i.test(p.path))throw Error('FFX 预设不存在');if(!(active instanceof CompItem)||!active.selectedLayers.length)throw Error('请先激活合成并选择要应用预设的图层');var selectedIds=[];for(var k=0;k<active.selectedLayers.length;k++)selectedIds.push(active.selectedLayers[k].index);app.beginUndoGroup('YimuCraft preset');try{active.selectedLayers[0].applyPreset(preset);}finally{app.endUndoGroup();}result={preset:preset.fsName,layers:selectedIds,count:selectedIds.length};
    }else if(request.operation==='script'){
      var script=new File(p.path);if(!script.exists||!/\.(jsx|jsxbin)$/i.test(p.path))throw Error('AE 脚本不存在');$.evalFile(script);result={script:script.fsName,completed:true};
    }else if(request.operation==='collectFile')result=collect(p);
    else if(request.operation==='verifyFile'){openIsolated(p.project);result=projectInfo();if(result.missing.length)throw Error('Missing footage: '+result.missing.join(', '));}
    else if(request.operation==='fixture'){
      if(app.project.file||app.project.numItems)throw Error('Fixture requires an empty project');var output=mkdir(new Folder(p.output));var comp=app.project.items.addComp('YimuCraft 技术测试，不用于成片',640,360,1,2,24);
      for(var j=0;j<p.media.length;j++){var media=p.media[j],options=new ImportOptions(new File(typeof media==='string'?media:media.path));if(typeof media!=='string'&&media.sequence)options.sequence=true;var item=app.project.importFile(options);if(typeof media!=='string'&&media.proxy){item.setProxy(new File(media.proxy));item.useProxy=true;}comp.layers.add(item);}
      var label=comp.layers.addText('YimuCraft migration test');label.property('Position').setValue([30,180]);if(p.extraComp){var extra=app.project.items.addComp('YimuCraft unused test comp',320,180,1,1,24);extra.layers.addSolid([1,0,0],'unused test solid',320,180,1);}comp.openInViewer();var aep=new File(output.fsName+'/Migration_Test.aep');app.project.save(aep);result=projectInfo();
      if(p.mogrt){var sourceText=label.property('Source Text'),textDoc=sourceText.value;textDoc.font='ArialMT';textDoc.fontSize=32;sourceText.setValue(textDoc);if(!sourceText.addToMotionGraphicsTemplate(comp))throw Error('Cannot add MOGRT text controller');comp.motionGraphicsTemplateName='YimuCraft_Migration_Test';app.project.save();if(!comp.exportAsMotionGraphicsTemplate(false,output.fsName))throw Error('MOGRT export failed');result.mogrt=output.fsName+'/YimuCraft_Migration_Test.mogrt';}
    }else if(request.operation==='font'){
      var comp=app.project.activeItem;if(!(comp instanceof CompItem))throw Error('请先在 AE 激活一个合成');var selected=comp.selectedLayers,count=0;app.beginUndoGroup('YimuCraft font');try{for(var k=0;k<selected.length;k++)if(selected[k] instanceof TextLayer){var prop=selected[k].property('ADBE Text Properties').property('ADBE Text Document'),doc;if(prop.numKeys){for(var frame=1;frame<=prop.numKeys;frame++){doc=prop.keyValue(frame);doc.font=p.postScriptName;prop.setValueAtKey(frame,doc);if(prop.keyValue(frame).font!==p.postScriptName)throw Error('字体未激活或名称不匹配：'+p.postScriptName);}}else{doc=prop.value;doc.font=p.postScriptName;prop.setValue(doc);if(prop.value.font!==p.postScriptName)throw Error('字体未激活或名称不匹配：'+p.postScriptName);}count++;}}finally{app.endUndoGroup();}if(!count)throw Error('请先选中 AE 文字图层');result={count:count,font:p.postScriptName};
    }else throw Error('Unknown operation');
    response.ok=true;response.result=result;
  }catch(e){response.error=String(e);response.line=e.line||null;}
  if(ownsProject&&!reusedOpenProject&&app.project){try{app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);}catch(closeError){response.ok=false;response.error='Cannot close isolated project: '+closeError;}}
  try{var target=new File(request.receipt),temp=new File(request.receipt+'.tmp');temp.encoding='UTF-8';if(!temp.open('w'))throw Error('Cannot write receipt; enable Allow Scripts To Write Files And Access Network');temp.write(json(response));temp.close();if(!temp.rename(target.name))throw Error('Cannot commit receipt');}catch(writeError){$.writeln('YIMU_RECEIPT_ERROR '+writeError);}
})(YIMU_REQUEST);
