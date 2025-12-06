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
}

const electronBin = path.join(
  root,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'electron.cmd' : 'electron'
);

const child = spawn(
  electronBin,
  ['--no-sandbox', path.join(root, 'dist', 'main.js')],
  {
    stdio: 'inherit',
    cwd: root,
    env: { ...process.env },
  }
);

child.on('exit', (code) => process.exit(code || 0));
child.on('error', (err) => {
  console.error(err.message || err);
  process.exit(1);
});
