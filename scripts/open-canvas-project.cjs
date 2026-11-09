// Use the actual project picker button, with only the native dialog answer supplied.
module.exports=async function openProject(app,page,folder){
 await page.locator('#canvasTab').click();
 if(!await page.locator('#canvasOpenProject').isVisible())await page.locator('.canvas-quick-nav [data-panel="source"]').click();
 await app.evaluate(({dialog},root)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[root]});},folder);
 await page.locator('#canvasOpenProject').click();
 await page.waitForFunction(root=>document.querySelector('#projectCanvas').dataset.ready==='true'&&document.querySelector('.canvas-repository.current .canvas-repository-open')?.title===root,folder);
};
