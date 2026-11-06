#!/usr/bin/env node

const fs = require('fs');
const { spawnSync } = require('child_process');
const yaml = require('js-yaml');
const { appBuilderPath } = require('app-builder-bin');
const {
    projectRoot,
    productDetails,
    requireFile,
    fileSha512,
    updaterZipPath
} = require('./macos-artifacts');

const keychainProfile = String(
    process.env.DIALOGCREATOR_NOTARY_PROFILE || 'developer-id-notary'
).trim();

function fail(message) {
    throw new Error(message);
}

function requireMacOS() {
    if (process.platform !== 'darwin') {
        fail('macOS notarization commands must run on macOS.');
    }
}

function runCommand(command, args) {
    const result = spawnSync(command, args, {
        cwd: projectRoot,
        stdio: 'inherit'
    });

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        fail(`${command} failed with exit code ${String(result.status)}.`);
    }
}

function runXcrun(args) {
    runCommand('xcrun', args);
}

function rebuildUpdaterZip(appPath, latestMacPath, outputDir) {
    const update = updaterZipPath(latestMacPath, outputDir);
    const temporaryZipPath = `${update.zipPath}.stapled`;
    const blockMapPath = `${update.zipPath}.blockmap`;
    const temporaryBlockMapPath = `${blockMapPath}.stapled`;

    fs.rmSync(temporaryZipPath, { force: true });
    fs.rmSync(temporaryBlockMapPath, { force: true });

    console.log(`Rebuilding updater ZIP from ${appPath}`);
    runCommand('ditto', [
        '-c',
        '-k',
        '--sequesterRsrc',
        '--keepParent',
        appPath,
        temporaryZipPath
    ]);
    runCommand(appBuilderPath, [
        'blockmap',
        '--input',
        temporaryZipPath,
        '--output',
        temporaryBlockMapPath
    ]);

    fs.renameSync(temporaryZipPath, update.zipPath);
    fs.renameSync(temporaryBlockMapPath, blockMapPath);

    const sha512 = fileSha512(update.zipPath);
    update.zipEntry.size = fs.statSync(update.zipPath).size;
    update.zipEntry.sha512 = sha512;
    update.latest.files = [update.zipEntry];
    update.latest.path = String(update.zipEntry.url);
    update.latest.sha512 = sha512;

    fs.writeFileSync(latestMacPath, yaml.dump(update.latest, {
        lineWidth: -1,
        noRefs: true
    }));
}

function readHistory() {
    const result = spawnSync(
        'xcrun',
        [
            'notarytool',
            'history',
            '--keychain-profile',
            keychainProfile,
            '--output-format',
            'json'
        ],
        {
            cwd: projectRoot,
            encoding: 'utf8'
        }
    );

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        process.stderr.write(String(result.stderr || ''));
        fail(`notarytool history failed with exit code ${String(result.status)}.`);
    }

    const parsed = JSON.parse(String(result.stdout || '{}'));

    return Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.history)
            ? parsed.history
            : [];
}

function latestHistoryEntry(history) {
    return history.slice().sort((left, right) => {
        const leftTime = Date.parse(String(left.createdDate || ''));
        const rightTime = Date.parse(String(right.createdDate || ''));
        const normalizedLeft = Number.isFinite(leftTime) ? leftTime : 0;
        const normalizedRight = Number.isFinite(rightTime) ? rightTime : 0;

        return normalizedRight - normalizedLeft;
    })[0];
}

function submit() {
    const { dmgPath } = productDetails();
    requireFile(dmgPath, 'built DMG');

    console.log(`Submitting ${dmgPath}`);
    runXcrun([
        'notarytool',
        'submit',
        dmgPath,
        '--keychain-profile',
        keychainProfile
    ]);
}

function showLatestHistory() {
    const latest = latestHistoryEntry(readHistory());

    if (!latest) {
        fail('No notarization submissions were returned.');
    }

    console.log('Latest submission:');
    console.log(`Name: ${String(latest.name || '(unknown)')}`);
    console.log(`Status: ${String(latest.status || '(unknown)')}`);
    console.log(`Created: ${String(latest.createdDate || '(unknown)')}`);
    console.log(`ID: ${String(latest.id || '(unknown)')}`);
}

function staple() {
    const {
        appPath,
        dmgPath,
        latestMacPath,
        outputDir
    } = productDetails();
    requireFile(appPath, 'built application');
    requireFile(dmgPath, 'built DMG');

    console.log(`Stapling ${appPath}`);
    runXcrun([
        'stapler',
        'staple',
        appPath
    ]);
    runXcrun([
        'stapler',
        'validate',
        appPath
    ]);
    runCommand('codesign', [
        '--verify',
        '--deep',
        '--strict',
        '--verbose=2',
        appPath
    ]);

    rebuildUpdaterZip(appPath, latestMacPath, outputDir);

    console.log(`Stapling ${dmgPath}`);
    runXcrun([
        'stapler',
        'staple',
        dmgPath
    ]);
    runXcrun([
        'stapler',
        'validate',
        dmgPath
    ]);

    runCommand(process.execPath, ['scripts/write-artifact-checksums.js']);
}

function main() {
    requireMacOS();
    const action = String(process.argv[2] || '').trim();

    if (action === 'submit') {
        submit();
        return;
    }

    if (action === 'history') {
        showLatestHistory();
        return;
    }

    if (action === 'staple') {
        staple();
        return;
    }

    fail('Unknown notarization action. Expected submit, history, or staple.');
}

main();
