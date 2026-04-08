#!/usr/bin/env node
/*
  Generates a Linux-only electron-builder config from package.json build,
  runs electron-builder for the requested Linux architectures,
  and leaves package.json untouched.
*/

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = path.resolve(__dirname, '..');
const pkgPath = path.join(root, 'package.json');
const tmpDir = path.join(root, '.tmp');
const cfgPath = path.join(tmpDir, 'electron-builder-linux.json');

function getRequestedArchArgs() {
  const fromCli = process.argv.slice(2).filter((arg) => arg === '--x64' || arg === '--arm64');
  if (fromCli.length > 0) {
    return fromCli;
  }

  const fromEnv = (process.env.BUILD_LINUX_ARCHES || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  const archArgs = [];
  if (fromEnv.includes('x64')) archArgs.push('--x64');
  if (fromEnv.includes('arm64')) archArgs.push('--arm64');
  return archArgs.length > 0 ? archArgs : ['--x64', '--arm64'];
}

function getRequestedTargets() {
  const fromCli = process.argv
    .slice(2)
    .filter((arg) => arg === 'AppImage' || arg === 'deb');
  if (fromCli.length > 0) {
    return fromCli;
  }

  const fromEnv = (process.env.BUILD_LINUX_TARGETS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => value === 'AppImage' || value === 'deb');

  return fromEnv.length > 0 ? fromEnv : ['AppImage', 'deb'];
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', ...opts });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

(async () => {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const base = pkg.build || {};

  const baseDesktop = base.linux?.desktop || {};
  // electron-builder >= 26 expects linux.desktop.entry instead of freeform keys
  const desktopEntry = baseDesktop.entry || baseDesktop;

  const linuxConfig = Object.assign({}, base, {
    // Remove mac section to avoid any cross-platform confusion
    mac: undefined,
    win: undefined,
    // Ensure linux section is present and configured
    linux: Object.assign({}, base.linux || {}, {
      target: getRequestedTargets(),
      icon: base.linux?.icon || 'icons/original/icon.png',
      category: base.linux?.category || 'Utility',
      vendor: base.linux?.vendor || 'RODA',
      maintainer: base.linux?.maintainer || 'Adrian Dusa <dusa.adrian@gmail.com>',
      desktop: {
        entry: Object.assign({}, desktopEntry, {
          Comment: desktopEntry.Comment || 'Academic Non-Commercial License (see LICENSE file for details).'
        })
      }
    })
  });

  // Clean undefined keys (like mac: undefined)
  const cleaned = JSON.parse(JSON.stringify(linuxConfig));

  // Ensure tmp dir
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
  fs.writeFileSync(cfgPath, JSON.stringify(cleaned, null, 2));

  const bin = path.join(
    root,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'electron-builder.cmd' : 'electron-builder'
  );

  // Build only Linux targets, do not publish by default
  const args = ['--linux', ...getRequestedArchArgs(), '--publish', 'never', '-c', cfgPath];

  console.log('Using electron-builder config at', cfgPath);
  await run(bin, args, { cwd: root });
})().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
