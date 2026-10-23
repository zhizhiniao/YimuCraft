// Independent native drop receiver for D01 tests.
// Runs as its own Electron process, parks itself on the secondary display so a
// real drag can travel from the library window to it, and records every drag
// event so "never hovered" can be told apart from "hovered but drop rejected".
const { app, BrowserWindow, ipcMain, screen } = require('electron');
const fs = require('fs');

const events = { dragenter: 0, dragover: 0, drop: 0, dragleave: 0 };

app.whenReady().then(() => {
  const displays = screen.getAllDisplays();
  const display = displays.find((d) => d.bounds.x < 0) || screen.getPrimaryDisplay();
  // Sat below the library window on the same display, so a real drag can travel
  // between two visible windows without crossing the hostile full-screen window
  // that covers the primary display.
  const window = new BrowserWindow({
    x: display.bounds.x + 40,
    y: display.bounds.y + Math.max(700, display.bounds.height - 340),
    width: 420,
    height: 320,
    frame: false,
    show: false,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  window.loadURL(
    'data:text/html,' +
      encodeURIComponent(
        '<body style="margin:0;background:#1f2430;color:#e8e8e8;font:13px sans-serif">' +
          '<div style="padding:8px">独立原生接收窗口</div>' +
          '<div id="n" style="padding:8px;font-size:22px">0</div>' +
          '<script>const {ipcRenderer,webUtils}=require("electron");let n=0;' +
          'const note=t=>{ipcRenderer.send("evt",t)};' +
          'const over=e=>{e.preventDefault();e.dataTransfer.dropEffect="copy";note(e.type)};' +
          'document.addEventListener("dragenter",over);' +
          'document.addEventListener("dragover",over);' +
          'document.addEventListener("dragleave",e=>note("dragleave"));' +
          'document.addEventListener("drop",e=>{e.preventDefault();note("drop");' +
          'ipcRenderer.send("received",[...e.dataTransfer.files].map(f=>webUtils.getPathForFile(f)));});' +
          '</script></body>',
      ),
  );
  window.once('ready-to-show', () => window.showInactive());
});

ipcMain.on('evt', (_event, type) => {
  events[type] = (events[type] || 0) + 1;
});

// Heartbeat so a run where the drop never arrives still shows whether the
// pointer ever entered this window.
setInterval(() => {
  try {
    fs.writeFileSync(process.env.YIMU_RECEIPT + '.events', JSON.stringify(events));
  } catch {}
}, 300);

ipcMain.on('received', (_event, files) => {
  fs.writeFileSync(process.env.YIMU_RECEIPT, JSON.stringify({ files, count: files.length, events }));
});
