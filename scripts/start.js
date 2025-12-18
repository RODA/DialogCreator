#!/usr/bin/env node
// Cross-platform dev launcher that sets NODE_ENV and runs Electron

const path = require('path');
const { spawn } = require('child_process');

const root = path.resolve(__dirname, '..');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
// Ensure dev run uses real Electron (some shells export ELECTRON_RUN_AS_NODE)
delete process.env.ELECTRON_RUN_AS_NODE;
// In some Linux containers/VMs sandbox support is missing; disable to avoid launch failure
if (process.platform === 'linux') {
  process.env.ELECTRON_DISABLE_SANDBOX = process.env.ELECTRON_DISABLE_SANDBOX || '1';
  process.env.ELECTRON_FORCE_DISABLE_SANDBOX = process.env.ELECTRON_FORCE_DISABLE_SANDBOX || '1';
  process.env.ELECTRON_OZONE_PLATFORM_HINT = process.env.ELECTRON_OZONE_PLATFORM_HINT || 'x11';
  process.env.XDG_SESSION_TYPE = process.env.XDG_SESSION_TYPE || 'x11';
  // If Wayland is present, drop it so Electron is forced to X11 like the manual command
  if (process.env.WAYLAND_DISPLAY) delete process.env.WAYLAND_DISPLAY;
}

const electronBin = path.join(
  root,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'electron.cmd' : 'electron'
);

// Compose env for Electron spawn
const spawnEnv = { ...process.env };
if (process.platform === 'linux') {
  spawnEnv.ELECTRON_OZONE_PLATFORM_HINT = 'x11';
  spawnEnv.ELECTRON_ENABLE_WAYLAND = '0';
  spawnEnv.OZONE_PLATFORM = 'x11';
  spawnEnv.XDG_SESSION_TYPE = 'x11';
  delete spawnEnv.WAYLAND_DISPLAY; // force X11 even inside a Wayland session
}

const child = spawn(
  electronBin,
  ['--no-sandbox', '--ozone-platform=x11', path.join(root, 'dist', 'main.js')],
  {
    stdio: 'inherit',
    cwd: root,
    env: spawnEnv,
  }
);

child.on('exit', (code) => process.exit(code || 0));
child.on('error', (err) => {
  console.error(err.message || err);
  process.exit(1);
});
