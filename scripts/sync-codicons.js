#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function syncCodicons(repoRoot) {
  const sourceDir = path.join(repoRoot, 'node_modules', '@vscode', 'codicons', 'dist');
  const targetDir = path.join(repoRoot, 'src', 'assets', 'codicons');

  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Codicons package assets not found: ${sourceDir}`);
  }

  fs.rmSync(targetDir, { recursive: true, force: true });
  fs.mkdirSync(targetDir, { recursive: true });
  fs.cpSync(path.join(sourceDir, 'codicon.css'), path.join(targetDir, 'codicon.css'));
  fs.cpSync(path.join(sourceDir, 'codicon.ttf'), path.join(targetDir, 'codicon.ttf'));
  fs.cpSync(path.join(sourceDir, 'metadata.json'), path.join(targetDir, 'metadata.json'));
}

if (require.main === module) {
  const repoRoot = path.resolve(__dirname, '..');
  try {
    syncCodicons(repoRoot);
    console.log('Synced codicons into src/assets/codicons');
  } catch (error) {
    console.error(error && error.message ? error.message : error);
    process.exit(1);
  }
}

module.exports = { syncCodicons };
