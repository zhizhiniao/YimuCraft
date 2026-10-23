/* Independent YimuCraft dockable After Effects packaging panel. */
(function(context){
  var base=new File($.fileName).parent,hostFile=new File(base.fsName+'/YimuCraft/host.jsx');
  function read(file){file.encoding='UTF-8';if(!file.open('r'))throw Error('无法读取：'+file.fsName);var text=file.read();file.close();return eval('('+text+')');}
  function connection(){var file=new File($.global.YimuPackConnectionFile||Folder.userData.fsName+'/YimuCraft/ae-library.json');if(!file.exists)throw Error('请先打开一幕素材库');var c=read(file);if(!c.outputRoot||!c.inbox||new Date().getTime()-c.updated>15000)throw Error('一幕未连接，请先打开桌面软件');return c;}
  function pack(selected){
    var c=connection();if(!app.project||!app.project.file||app.project.dirty)throw Error('请先保存当前工程，再打包');
    var ids=[];if(selected){for(var i=0;i<app.project.selection.length;i++)if(app.project.selection[i] instanceof CompItem)ids.push(app.project.selection[i].id);if(!ids.length&&app.project.activeItem instanceof CompItem)ids.push(app.project.activeItem.id);if(!ids.length)throw Error('请先选择或激活合成');}
    var id='ae-'+new Date().getTime()+'-'+Math.floor(Math.random()*1000000),receipt=new File(c.inbox+'/'+id+'.json');
    $.global.YIMU_REQUEST={id:id,operation:'collectCurrent',isolated:false,payload:{output:c.outputRoot+'/'+id,compIds:ids,snapshotRoot:c.snapshotRoot},receipt:receipt.fsName};
    if(!hostFile.exists)throw Error('打包组件缺失，请在一幕重新安装 AE 面板');
    $.evalFile(hostFile);var result=read(receipt);if(!result.ok)throw Error(result.error);return result;
  }
  $.global.YimuPack={pack:pack};
  var panel=context instanceof Panel?context:new Window('palette','一幕工程打包',undefined,{resizeable:true});
  panel.orientation='column';panel.alignChildren=['fill','top'];panel.add('statictext',undefined,'一幕 YimuCraft · 蒋啊讲出品');
  panel.add('statictext',undefined,'先保存工程。打包完成后自动回到原工程。');
  var all=panel.add('button',undefined,'打包当前工程并回库'),selected=panel.add('button',undefined,'打包选中合成并回库'),state=panel.add('statictext',undefined,'请保持一幕桌面软件打开',{multiline:true});state.preferredSize=[310,48];
  function run(selection){all.enabled=selected.enabled=false;state.text='正在复制依赖与打包，请稍候…';panel.update();try{var r=pack(selection);state.text='打包完成：'+r.result.copied.length+' 个依赖。桌面正在接收入库。';}catch(e){state.text=String(e);}finally{all.enabled=selected.enabled=true;panel.layout.layout(true);}}
  all.onClick=function(){run(false);};selected.onClick=function(){run(true);};panel.onResizing=panel.onResize=function(){this.layout.resize();};panel.layout.layout(true);if(panel instanceof Window){panel.center();panel.show();}
})(this);
