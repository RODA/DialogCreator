#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const semver = require('semver');
const {
    projectRoot,
    productDetails,
    requireFile,
    fileSha512,
    updaterZipPath
} = require('./macos-artifacts');

const targetRepo = 'RODA/DialogCreator';
const targetTag = 'latest';

function run(command, args, { captureOutput = false } = {}) {
    const result = spawnSync(command, args, {
        cwd: projectRoot,
        encoding: 'utf8',
        stdio: captureOutput ? ['ignore', 'pipe', 'inherit'] : 'inherit'
    });

    if (result.error) {
        if (command === 'gh' && result.error.code === 'ENOENT') {
            throw new Error('Install the GitHub CLI (gh) and authenticate with `gh auth login`.');
        }
        throw result.error;
    }

    if (result.status !== 0) {
        throw new Error(`${command} ${args.slice(0, 2).join(' ')} failed (${result.signal || result.status}).`);
    }

    return result.stdout;
}

function validateStapling(dmgPath, zipPath, appName) {
    const temporaryDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dialogcreator-publish-'));

    try {
        run('xcrun', ['stapler', 'validate', dmgPath]);
        run('ditto', ['-x', '-k', zipPath, temporaryDir]);
        run('xcrun', ['stapler', 'validate', path.join(temporaryDir, appName)]);
    } finally {
        fs.rmSync(temporaryDir, { recursive: true, force: true });
    }
}

function removePreviousMacAssets(version, uploadedAssetNames) {
    const release = JSON.parse(run('gh', [
        'release', 'view', targetTag, '--repo', targetRepo, '--json', 'assets'
    ], { captureOutput: true }));

    for (const { name } of release.assets) {
        const match = /^DialogCreator_(.+)_universal\.(?:zip|dmg)(?:\.blockmap)?$/.exec(name)
            || /^DialogCreator-(.+)-universal\.dmg(?:\.blockmap)?$/.exec(name);
        const assetVersion = match && semver.valid(match[1]);

        if (assetVersion && semver.lt(assetVersion, version) && !uploadedAssetNames.has(name)) {
            console.log(`Removing previous macOS release asset ${name}.`);
            run('gh', ['release', 'delete-asset', targetTag, name, '--repo', targetRepo, '--yes']);
        }
    }
}

function publish() {
    if (process.platform !== 'darwin') {
        throw new Error('Publish macOS artifacts from macOS so stapling can be validated.');
    }

    const { appPath, dmgPath, latestMacPath, outputDir } = productDetails();
    const { latest, zipEntry, zipPath } = updaterZipPath(latestMacPath, outputDir);
    const version = semver.valid(latest.version);
    if (!version) {
        throw new Error('Expected a valid release version in latest-mac.yml.');
    }

    const blockMapPath = `${zipPath}.blockmap`;
    requireFile(dmgPath, 'universal DMG');
    requireFile(zipPath, 'macOS updater ZIP');
    requireFile(blockMapPath, 'macOS updater blockmap');

    if (
        latest.files.length !== 1
        || latest.path !== zipEntry.url
        || latest.sha512 !== zipEntry.sha512
        || zipEntry.size !== fs.statSync(zipPath).size
        || zipEntry.sha512 !== fileSha512(zipPath)
    ) {
        throw new Error(
            'Expected latest-mac.yml to describe only the updater ZIP with its matching size and SHA-512. '
            + 'Run `npm run staple` first.'
        );
    }

    validateStapling(dmgPath, zipPath, path.basename(appPath));

    console.log(`Uploading macOS artifacts to ${targetRepo} (${targetTag}).`);
    const upload = ['release', 'upload', targetTag, '--repo', targetRepo, '--clobber'];
    const binaries = [dmgPath, zipPath, blockMapPath];
    run('gh', [...upload, ...binaries]);
    run('gh', [...upload, latestMacPath]);

    const uploadedAssetNames = new Set([...binaries, latestMacPath].map((file) => path.basename(file)));
    removePreviousMacAssets(version, uploadedAssetNames);
}

try {
    publish();
} catch (error) {
    console.error(`[publish-artifacts] ${error.message}`);
    process.exitCode = 1;
}
