#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
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

function productDmgPath() {
    const packagePath = path.join(projectRoot, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const productName = String(pkg.build?.productName || pkg.name || 'DialogCreator').trim();
    const version = String(pkg.version || '').trim();

    if (!version) {
        fail(`Missing version in ${packagePath}`);
    }

    const fileName = `${productName.replace(/\s+/g, '_')}_${version}_silicon.dmg`;
    const dmgPath = path.join(projectRoot, 'build', 'output', fileName);

    if (!fs.existsSync(dmgPath)) {
        fail(`Missing built DMG: ${dmgPath}`);
    }

    return dmgPath;
}

function runInherited(args) {
    const result = spawnSync('xcrun', args, {
        cwd: projectRoot,
        stdio: 'inherit'
    });

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        fail(`xcrun failed with exit code ${String(result.status)}.`);
    }
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
    const dmgPath = productDmgPath();

    console.log(`Submitting ${dmgPath}`);
    runInherited([
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
    const dmgPath = productDmgPath();

    console.log(`Stapling ${dmgPath}`);
    runInherited([
        'stapler',
        'staple',
        dmgPath
    ]);
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
