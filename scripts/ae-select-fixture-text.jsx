(function(){
 app.exitAfterLaunchAndEval=false;
 if(!app.project)throw Error('No test project');
 var found=false;
 for(var i=1;i<=app.project.numItems&&!found;i++){
  var c=app.project.item(i);
  if(c instanceof CompItem&&c.name==='YimuCraft 技术测试，不用于成片'){
   for(var j=1;j<=c.numLayers;j++)c.layer(j).selected=false;
   for(var j=1;j<=c.numLayers;j++)if(c.layer(j) instanceof TextLayer&&c.layer(j).property('Source Text').value.text==='YimuCraft migration test'){
    c.openInViewer();c.layer(j).selected=true;found=true;break;
   }
  }
 }
 if(!found)throw Error('Owned fixture not present; no user layers selected');
})();
