// YimuCraft AE bridge panel.
//
// The desktop app cannot script a running After Effects with `AfterFX.exe -r`
// (that starts a *new* instance), so this panel runs inside the user's AE and
// executes the app's pending request scripts in the live instance.
//
// Protocol (shared with src/adobe-bridge.cjs):
//   Documents/YimuCraft/ae-panel.json          app -> panel: { directory, updated }
//   Documents/YimuCraft/ae-panel-heartbeat.json panel -> app: { ts, version }
//   <directory>/<id>.jsx                        app request (ExtendScript, writes its own receipt)
//   <directory>/<id>.json                       receipt written by src/adobe-host.jsx
(function () {
  'use strict';

  var nodeRequire = typeof require === 'function' ? require : window.require;
  var fs = nodeRequire('fs');
  var path = nodeRequire('path');

  var PANEL_VERSION = '0.1.0';
  var POLL_MS = 700;
  var RENDEZVOUS_MAX_AGE_MS = 30000;
  var REQUEST_MAX_AGE_MS = 120000;
  var NAME = /^[0-9a-f-]{36}\.(jsx|json)$/i;

  var base = decodeURI(window.__adobe_cep__.getSystemPath('myDocuments').replace(/^file:\/\/\//, ''));
  var folder = path.join(base, 'YimuCraft');
  var rendezvousPath = path.join(folder, 'ae-panel.json');
  var heartbeatPath = path.join(folder, 'ae-panel-heartbeat.json');
  var stateEl = document.getElementById('state');
  var pathEl = document.getElementById('path');
  var busy = Object.create(null);
  var lastDirectory = null;

  function show(text, tone) {
    stateEl.textContent = text;
    stateEl.className = tone || '';
  }

  function writeHeartbeat() {
    try {
      fs.mkdirSync(folder, { recursive: true });
      fs.writeFileSync(heartbeatPath, JSON.stringify({ ts: Date.now(), version: PANEL_VERSION }));
    } catch (error) {
      show('无法写入心跳：' + error.message, 'warn');
    }
  }

  function readRendezvous() {
    try {
      var raw = JSON.parse(fs.readFileSync(rendezvousPath, 'utf8'));
      if (!raw || typeof raw.directory !== 'string') return null;
      var age = Date.now() - fs.statSync(rendezvousPath).mtimeMs;
      if (age > RENDEZVOUS_MAX_AGE_MS) return null;
      if (!fs.existsSync(raw.directory)) return null;
      return raw;
    } catch (error) {
      return null;
    }
  }

  function pendingRequests(directory) {
    var names;
    try {
      names = fs.readdirSync(directory).filter(function (name) { return NAME.test(name); });
    } catch (error) {
      return [];
    }
    var requests = [];
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      if (!/\.jsx$/i.test(name) || busy[name]) continue;
      var id = name.replace(/\.jsx$/i, '');
      var receipt = path.join(directory, id + '.json');
      if (fs.existsSync(receipt)) continue;
      var full = path.join(directory, name);
      try {
        if (Date.now() - fs.statSync(full).mtimeMs > REQUEST_MAX_AGE_MS) continue;
      } catch (error) {
        continue;
      }
      requests.push({ name: name, id: id, file: full, receipt: receipt });
    }
    return requests;
  }

  function runRequest(request) {
    busy[request.name] = true;
    var script;
    try {
      script = fs.readFileSync(request.file, 'utf8');
    } catch (error) {
      delete busy[request.name];
      show('读取请求失败：' + error.message, 'warn');
      return;
    }
    show('正在执行 AE 请求 ' + request.id.slice(0, 8) + '…');
    window.__adobe_cep__.evalScript(script, function (result) {
      delete busy[request.name];
      if (fs.existsSync(request.receipt)) {
        show('已处理 ' + request.id.slice(0, 8), 'ok');
      } else {
        show('AE 未返回回执：' + String(result).slice(0, 80), 'warn');
      }
    });
  }

  function tick() {
    writeHeartbeat();
    var info = readRendezvous();
    if (!info) {
      show('等待一幕启动（打开一幕后此处会自动连接）', 'warn');
      pathEl.textContent = '';
      lastDirectory = null;
      return;
    }
    if (info.directory !== lastDirectory) {
      lastDirectory = info.directory;
      pathEl.textContent = info.directory;
    }
    var requests = pendingRequests(info.directory);
    if (!requests.length) {
      show('已连接，等待一幕的请求', 'ok');
      return;
    }
    runRequest(requests[0]);
  }

  show('正在初始化…');
  tick();
  setInterval(tick, POLL_MS);
})();
