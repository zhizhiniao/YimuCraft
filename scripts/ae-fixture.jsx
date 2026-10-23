// Independent test fixture only. Never opens or modifies an existing project.
(function () {
  if (app.project && (app.project.file || app.project.numItems > 0)) {
    alert('YimuCraft test stopped: an existing project is open.');
    return;
  }
  if (!app.project) app.newProject();
  var root = new Folder('K:/Codex/YimuCraft/work/ae-fixture'); root.create();
  var comp = app.project.items.addComp('YimuCraft_Test_Only', 640, 360, 1, 2, 24);
  comp.layers.addSolid([0.12, 0.15, 0.2], 'Test background', 640, 360, 1);
  var label = comp.layers.addText('YimuCraft test fixture');
  label.property('Position').setValue([60,180]);
  app.project.save(new File(root.fsName + '/YimuCraft_Test.aep'));
})();
