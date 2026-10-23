$._yimuBridge={};
$._yimuBridge.dispatch=function(request){
 function quote(s){return '"'+String(s).replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\r/g,'\\r').replace(/\n/g,'\\n').replace(/\t/g,'\\t')+'"';}
 function json(v){if(v===null||v===undefined)return 'null';if(typeof v==='string')return quote(v);if(typeof v==='number')return isFinite(v)?String(v):'null';if(typeof v==='boolean')return v?'true':'false';var a=[],k;if(v instanceof Array){for(k=0;k<v.length;k++)a.push(json(v[k]));return '['+a.join(',')+']';}for(k in v)if(v.hasOwnProperty(k))a.push(quote(k)+':'+json(v[k]));return '{'+a.join(',')+'}';}
 function inspect(){var seq=app.project&&app.project.activeSequence,tracks=[];if(seq)for(var i=0;i<seq.videoTracks.numTracks;i++){var clips=[];for(var j=0;j<seq.videoTracks[i].clips.numItems;j++){var clip=seq.videoTracks[i].clips[j];clips.push({name:clip.name,nodeId:clip.nodeId,start:clip.start.ticks,end:clip.end.ticks,selected:clip.isSelected()});}tracks.push({index:i,clips:clips});}return {version:app.version,project:app.project?app.project.path:null,items:app.project&&app.project.rootItem?app.project.rootItem.children.numItems:0,sequence:seq?{name:seq.name,id:seq.sequenceID,position:seq.getPlayerPosition().ticks,videoTracks:tracks}:null};}
 try{var p=request.payload||{},result;
  if(request.operation==='inspect')result=inspect();
  else if(request.operation==='collectCurrent'){
   if(!app.project||!app.project.path||app.project.path.replace(/\\/g,'/').toLowerCase()!==String(p.expectedProject).replace(/\\/g,'/').toLowerCase())throw Error('PR 活动工程已改变，请重新收集');
   var destination=new Folder(p.output);if(!destination.exists||destination.getFiles().length)throw Error('收集目标须为空文件夹');
   var manager=app.projectManager;if(!manager)throw Error('此 PR 版本不支持工程收集');
   function requireOnline(node){for(var i=0;i<node.children.numItems;i++){var item=node.children[i];if(item.type===2)requireOnline(item);else if(!item.isSequence()&&item.getMediaPath()&&item.isOffline())throw Error('请先在 PR 重新链接缺失素材：'+item.name);}}if(app.project.rootItem)requireOnline(app.project.rootItem);
   var options=manager.options,keys=['destinationPath','clipTransferOption','excludeUnused','includeAllSequences','includePreviews','includeConformedAudio','renameMedia'],previous={};
   for(var i=0;i<keys.length;i++)previous[keys[i]]=options[keys[i]];
   try{options.destinationPath=destination.fsName;options.clipTransferOption=options.CLIP_TRANSFER_COPY;options.excludeUnused=false;options.includeAllSequences=true;options.includePreviews=false;options.includeConformedAudio=false;options.renameMedia=false;
    var code=manager.process(app.project);if(code!==0||(manager.errors&&manager.errors.length))throw Error('PR 收集失败：'+code+' '+manager.errors);result={output:destination.fsName,project:inspect()};
   }finally{for(var i=0;i<keys.length;i++)options[keys[i]]=previous[keys[i]];}
  }
  else if(request.operation==='import'){if(!app.project||!app.project.path)throw Error('请先在 PR 新建或打开工程');for(var i=0;i<p.paths.length;i++)if(!new File(p.paths[i]).exists)throw Error('文件不存在：'+p.paths[i]);if(!app.project.importFiles(p.paths,true,app.project.rootItem,false))throw Error('PR 素材导入失败');result=inspect();}
  else if(request.operation==='mogrt'){var seq=app.project.activeSequence;if(!seq)throw Error('请先激活 PR 时间线');var time=seq.getPlayerPosition().ticks,track=p.videoTrack===undefined?0:p.videoTrack;if(p.expectedSequence&&String(seq.sequenceID)!==String(p.expectedSequence))throw Error('活动时间线已改变，请重新选择目标轨道');if(p.expectedPosition&&String(time)!==String(p.expectedPosition))throw Error('播放头已移动，请重新选择目标轨道');if(track<0||track>=seq.videoTracks.numTracks||Math.floor(track)!==track)throw Error('目标视频轨不存在');var clips=seq.videoTracks[track].clips;for(var j=0;j<clips.numItems;j++)if(Number(clips[j].end.ticks)>Number(time))throw Error('此轨道在播放头处或其后已有片段，请选择空轨道，避免覆盖');var clip=seq.importMGT(p.path,time,track,p.audioTrack||0);if(!clip)throw Error('MOGRT 未插入时间线');result={clip:{name:clip.name,nodeId:clip.nodeId,start:clip.start.ticks,end:clip.end.ticks},project:inspect()};}
  else if(request.operation==='lut'){
   var seq=app.project.activeSequence;if(!seq)throw Error('请先激活 PR 时间线');
   if(String(seq.sequenceID)!==String(p.expectedSequence))throw Error('活动时间线已改变，请重新发送');
   var lut=new File(p.path);if(!lut.exists||!/\.cube$/i.test(lut.name))throw Error('LUT 文件不存在');
   var selected=[],ids=[];for(var t=0;t<seq.videoTracks.numTracks;t++)for(var c=0;c<seq.videoTracks[t].clips.numItems;c++){var clip=seq.videoTracks[t].clips[c];if(clip.isSelected()){selected.push({clip:clip,track:t});ids.push(String(clip.nodeId));}}
   if(!selected.length)throw Error('请先在 PR 时间线选中视频片段');ids.sort();var expected=p.expectedClips.slice(0);expected.sort();if(ids.join(',')!==expected.join(','))throw Error('PR 所选片段已改变，请重新发送');
   app.enableQE();var qs=qe.project.getActiveSequence(),effect=qe.project.getVideoEffectByName('Lumetri Color');if(!effect)effect=qe.project.getVideoEffectByName('Lumetri 颜色');if(!effect)throw Error('PR 未找到 Lumetri 颜色效果');
   for(var n=0;n<selected.length;n++){var target=selected[n],qt=qs.getVideoTrackAt(target.track),matches=[];for(var j=0;j<qt.numItems;j++){var item=qt.getItemAt(j);if(item&&item.type==='Clip'&&String(item.start.ticks)===String(target.clip.start.ticks)&&String(item.end.ticks)===String(target.clip.end.ticks)&&item.name===target.clip.name)matches.push(item);}if(matches.length!==1)throw Error('无法唯一定位所选片段，未应用 LUT');target.q=matches[0];target.before=target.clip.components.numItems;}
   var applied=[];
   try{for(var n=0;n<selected.length;n++){var target=selected[n];target.q.addVideoEffect(effect);if(target.clip.components.numItems!==target.before+1)throw Error('Lumetri 效果未成功添加');applied.push(target);var component=target.clip.components[target.before];if(component.matchName!=='AE.ADBE Lumetri'||component.properties.numItems<8||typeof component.properties[4].getValue()!=='string'||typeof component.properties[6].getValue()!=='number')throw Error('此 PR 版本的 Lumetri 参数结构不支持');
    // Lumetri's file control needs its trailing path delimiter to load the LUT.
    var lutPath=lut.fsName.replace(/\\/g,'/')+'/';component.properties[4].setValue(lutPath,true);component.properties[6].setValue(1,true);
    if(component.properties[4].getValue()!==lutPath||component.properties[6].getValue()!==1)throw Error('PR 未确认 LUT 参数');
   }}catch(error){var failed=[];for(var n=applied.length-1;n>=0;n--){var target=applied[n];try{target.q.getComponentAt(target.before).remove();if(target.clip.components.numItems!==target.before)failed.push(target.clip.name);}catch(ignore){failed.push(target.clip.name);}}if(failed.length)throw Error(String(error)+'；以下片段需检查新增效果：'+failed.join('、'));throw error;}
   result={count:selected.length,clips:ids,path:lut.fsName,project:inspect()};
  }
  else if(request.operation==='lutAdjustment'){
   var seq=app.project.activeSequence;if(!seq||String(seq.sequenceID)!==String(p.expectedSequence))throw Error('活动时间线已改变，请重新发送');
   var at=seq.getPlayerPosition();if(String(at.ticks)!==String(p.expectedPosition))throw Error('播放头已移动，请重新发送');
   var lut=new File(p.path),template=new File(p.template.path);if(!lut.exists||!template.exists)throw Error('LUT 或调节图层模板不存在');
   var start=Number(at.seconds),end=start+Number(p.template.duration),top=-1;
   for(var t=0;t<seq.videoTracks.numTracks;t++)for(var c=0;c<seq.videoTracks[t].clips.numItems;c++){var clip=seq.videoTracks[t].clips[c];if(Number(clip.start.seconds)<end&&Number(clip.end.seconds)>start)top=Math.max(top,t);}
   var track=-1;for(var t=top+1;t<seq.videoTracks.numTracks;t++)if(!seq.videoTracks[t].isLocked()){track=t;break;}
   var bin=null,root=app.project.rootItem;for(var i=0;i<root.children.numItems;i++)if(root.children[i].name==='YimuCraft'&&root.children[i].type===2)bin=root.children[i];if(!bin)bin=root.createBin('YimuCraft');
   function findAdjustment(node){for(var i=0;i<node.children.numItems;i++){var n=node.children[i];if(n.name===p.template.name&&!n.isSequence())return n;if(n.type===2){var found=findAdjustment(n);if(found)return found;}}return null;}
   var item=findAdjustment(bin),imported=[],added=null;
   try{
   if(!item){var oldIds={};for(var i=0;i<app.project.sequences.numSequences;i++)oldIds[app.project.sequences[i].sequenceID]=true;bin.select();app.project.importSequences(template.fsName,[p.template.sequence]);for(var i=0;i<app.project.sequences.numSequences;i++){var candidate=app.project.sequences[i];if(!oldIds[candidate.sequenceID])imported.push(candidate);}item=findAdjustment(bin);if(!item){item=findAdjustment(root);if(item)item.moveBin(bin);}app.project.openSequence(seq.sequenceID);if(!item)throw Error('PR 未导入调节图层');}
   app.enableQE();var qs=qe.project.getActiveSequence();if(track<0){var beforeTracks=seq.videoTracks.numTracks;qs.addTracks(1,beforeTracks,0);if(seq.videoTracks.numTracks!==beforeTracks+1)throw Error('无法创建调节图层轨道');track=seq.videoTracks.numTracks-1;}
   if(seq.videoTracks[track].isLocked())throw Error('目标轨道已锁定');for(var c=0;c<seq.videoTracks[track].clips.numItems;c++){var existing=seq.videoTracks[track].clips[c];if(Number(existing.start.seconds)<end&&Number(existing.end.seconds)>start)throw Error('目标轨道已有片段，已停止以避免覆盖');}item.setInPoint('0',1);var duration=new Time();duration.seconds=Number(p.template.duration);item.setOutPoint(duration.ticks,1);var beforeClips=seq.videoTracks[track].clips.numItems;seq.videoTracks[track].overwriteClip(item,at.seconds);
    for(var c=0;c<seq.videoTracks[track].clips.numItems;c++){var candidate=seq.videoTracks[track].clips[c];if(candidate.projectItem.nodeId===item.nodeId&&String(candidate.start.ticks)===String(at.ticks))added=candidate;}
    if(!added||seq.videoTracks[track].clips.numItems!==beforeClips+1||!added.isAdjustmentLayer())throw Error('PR 未创建真实调节图层');
    var finish=new Time();finish.seconds=end;added.end=finish;var qt=qe.project.getActiveSequence().getVideoTrackAt(track),qc=null;for(var c=0;c<qt.numItems;c++){var candidate=qt.getItemAt(c);if(candidate.type==='Clip'&&String(candidate.start.ticks)===String(at.ticks)&&candidate.name===added.name)qc=candidate;}if(!qc)throw Error('无法定位新增调节图层');
    var effect=qe.project.getVideoEffectByName('Lumetri Color')||qe.project.getVideoEffectByName('Lumetri 颜色');if(!effect)throw Error('未找到 Lumetri');var before=added.components.numItems;qc.addVideoEffect(effect);if(added.components.numItems!==before+1)throw Error('Lumetri 未添加');var component=added.components[before];if(component.matchName!=='AE.ADBE Lumetri'||component.properties.numItems<8)throw Error('Lumetri 参数结构不支持');var lutPath=lut.fsName.replace(/\\/g,'/')+'/';component.properties[4].setValue(lutPath,true);component.properties[6].setValue(1,true);if(component.properties[4].getValue()!==lutPath||component.properties[6].getValue()!==1)throw Error('LUT 参数设置失败');added.name=p.name||lut.displayName;
    result={count:1,adjustment:true,track:track,clip:{nodeId:added.nodeId,start:added.start.ticks,end:added.end.ticks},project:inspect()};
   }catch(error){if(added){try{added.remove(false,false);}catch(cleanup){throw Error(String(error)+'；新增调节图层需手动检查');}}throw error;}
   finally{for(var i=0;i<imported.length;i++)try{app.project.deleteSequence(imported[i]);}catch(ignore){}app.project.openSequence(seq.sequenceID);}
  }
  else if(request.operation==='openProject'){if(!new File(p.path).exists)throw Error('工程不存在');app.openDocument(p.path);result=inspect();if(result.project.replace(/\\/g,'/').toLowerCase()!==p.path.replace(/\\/g,'/').toLowerCase())throw Error('PR 没有打开指定工程');}
  else if(request.operation==='fixture'){if(app.project&&app.project.rootItem&&app.project.rootItem.children.numItems)throw Error('已有素材，拒绝创建测试工程');if(app.project&&app.project.path){if(app.project.path.replace(/\\/g,'/').toLowerCase()!==p.project.replace(/\\/g,'/').toLowerCase())throw Error('已有其他项目，拒绝创建测试工程');}else if(!app.newProject(p.project))throw Error('创建 PR 测试工程失败');app.project.importFiles([p.media],true,app.project.rootItem,false);var item=app.project.rootItem.children[0];app.project.createNewSequenceFromClips('YimuCraft 技术测试',[item],app.project.rootItem);app.project.activeSequence.setPlayerPosition(app.project.activeSequence.end);app.project.save();result=inspect();}
  else throw Error('Unknown operation');return json({ok:true,result:result});
 }catch(e){return json({ok:false,error:String(e),line:e.line||null});}
};

