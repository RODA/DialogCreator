#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function syncDocsFonts(repoRoot) {
  const sourceDir = path.join(repoRoot, 'src', 'assets', 'fonts');
  const targetDir = path.join(repoRoot, 'docs', 'fonts');

  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Source fonts directory not found: ${sourceDir}`);
  }

  fs.rmSync(targetDir, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(targetDir), { recursive: true });
  fs.cpSync(sourceDir, targetDir, { recursive: true });
}

if (require.main === module) {
  const repoRoot = path.resolve(__dirname, '..');
  try {
    syncDocsFonts(repoRoot);
    console.log('Synced docs/fonts from src/assets/fonts');
  } catch (error) {
    console.error(error && error.message ? error.message : error);
    process.exit(1);
  }
}

module.exports = { syncDocsFonts };
