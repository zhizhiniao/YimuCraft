// Shared Playwright launch helper for YimuCraft UI/host tests.
//
// Why this exists: on this machine `electron.exe` exits immediately with no
// output when Chromium's OS-level sandbox is enabled (verified 2026-10-22:
// spawning `electron.exe -r loader --inspect=0 --remote-debugging-port=0 .`
// exits at once, while the same command plus `--no-sandbox` starts normally).
// Every Playwright-driven script therefore needs the flag, otherwise
// `electron.launch()` fails with the opaque "Process failed to launch!".
//
// The flag only affects Chromium process isolation. It does not change the
// product's own code path (BrowserWindow webPreferences still request a
// sandboxed renderer), the SQLite data layer, or drag-and-drop behaviour.
//
// Set YIMU_TEST_SANDBOX=1 to keep the OS sandbox on a machine where it works.
const playwright = require('playwright');

const KEEP_SANDBOX = process.env.YIMU_TEST_SANDBOX === '1';

function withSandboxFlag(args) {
  const list = Array.isArray(args) ? [...args] : [];
  if (KEEP_SANDBOX || list.includes('--no-sandbox')) return list;
  return [...list, '--no-sandbox'];
}

const electron = {
  launch(options = {}) {
    return playwright._electron.launch({ ...options, args: withSandboxFlag(options.args) });
  },
};

module.exports = { electron, withSandboxFlag, KEEP_SANDBOX };
