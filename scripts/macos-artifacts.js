const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const pkg = require('../package.json');

const projectRoot = path.resolve(__dirname, '..');

function productDetails() {
    const productName = String(pkg.build?.productName || pkg.name || 'DialogCreator').trim();
    const outputDir = path.join(projectRoot, pkg.build.directories.output);
    const productFileName = productName.replace(/\s+/g, '_');

    return {
        appPath: path.join(outputDir, 'mac-universal', `${productName}.app`),
        dmgPath: path.join(outputDir, `${productFileName}_universal.dmg`),
        latestMacPath: path.join(outputDir, 'latest-mac.yml'),
        outputDir
    };
}

function requireFile(targetPath, label) {
    if (!fs.existsSync(targetPath)) {
        throw new Error(`Missing ${label}: ${targetPath}`);
    }

    return targetPath;
}

function fileSha512(filePath) {
    return crypto.createHash('sha512')
        .update(fs.readFileSync(filePath))
        .digest('base64');
}

function updaterZipPath(latestMacPath, outputDir) {
    requireFile(latestMacPath, 'macOS updater metadata');
    const latest = yaml.load(fs.readFileSync(latestMacPath, 'utf8')) || {};
    const files = Array.isArray(latest.files) ? latest.files : [];
    const zipEntry = files.find((entry) => {
        return /\.zip$/i.test(String(entry?.url || ''));
    });

    if (!zipEntry) {
        throw new Error(`No updater ZIP is listed in ${latestMacPath}.`);
    }

    const zipName = String(zipEntry.url);
    if (path.basename(zipName) !== zipName) {
        throw new Error(`Expected a local updater ZIP filename in ${latestMacPath}.`);
    }

    return {
        latest,
        zipEntry,
        zipPath: path.join(outputDir, zipName)
    };
}

module.exports = { projectRoot, productDetails, requireFile, fileSha512, updaterZipPath };
