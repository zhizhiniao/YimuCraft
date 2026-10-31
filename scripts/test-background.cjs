// Opt-in test harness: exercise renderer/IPC without taking desktop focus.
// Loaded only by test-app.cjs; never included in the packaged application.
const {app,BrowserWindow}=require('electron');
const show=BrowserWindow.prototype.show,focus=BrowserWindow.prototype.focus;
globalThis.__yimuTestShow=window=>{show.call(window);focus.call(window);};
app.on('browser-window-created',(_event,window)=>{window.webContents.setBackgroundThrottling(false);window.webContents.startDrag=()=>{throw Error('Background test requires an explicit native drag sink');};});
BrowserWindow.prototype.show=function(){};
BrowserWindow.prototype.focus=function(){};
