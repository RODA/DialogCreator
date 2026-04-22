#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outputDir = path.join(root, 'build', 'output');
const outputNames = {
  sha256: 'SHA256SUMS.txt',
  sha512: 'SHA512SUMS.txt',
};

function isArtifactFile(name) {
  const lower = name.toLowerCase();
  if (lower === outputNames.sha256.toLowerCase() || lower === outputNames.sha512.toLowerCase()) {
    return false;
  }
  return ['.exe', '.dmg', '.zip', '.appimage'].includes(path.extname(lower));
}

function hashFile(filePath, algorithm) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);
    const stream = fs.createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

async function main() {
  if (!fs.existsSync(outputDir)) {
    console.warn(`Output directory not found: ${outputDir}`);
    return;
  }

  const entries = fs
    .readdirSync(outputDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && isArtifactFile(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  if (entries.length === 0) {
    console.warn(`No release artifacts found in ${outputDir}`);
    return;
  }

  const sha256Lines = [];
  const sha512Lines = [];

  for (const name of entries) {
    const fullPath = path.join(outputDir, name);
    sha256Lines.push(`${await hashFile(fullPath, 'sha256')}  ${name}`);
    sha512Lines.push(`${await hashFile(fullPath, 'sha512')}  ${name}`);
  }

  fs.writeFileSync(path.join(outputDir, outputNames.sha256), `${sha256Lines.join('\n')}\n`);
  fs.writeFileSync(path.join(outputDir, outputNames.sha512), `${sha512Lines.join('\n')}\n`);

  console.log(`Wrote ${outputNames.sha256} and ${outputNames.sha512} for ${entries.length} artifact(s).`);
}

main().catch((err) => {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
