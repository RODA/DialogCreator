import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

import {
    createDialogPackage as createDialogPackageBytes,
    createDialogPackageFiles,
    isDialogPackageName,
    readDialogFiles,
    readDialogPackage as readDialogPackageBytes
} from '../../core/dialog-package/dialogPackageFormat';

const DIALOG_JSON = 'dialog.json';
const ACTIONS_JS = 'actions.js';
const LEGACY_CUSTOM_JS = 'custom.js';

function normalizePackagePath(name: string): string {
    return String(name || '').replace(/\\/g, '/').replace(/^\/+/, '');
}

export function createDialogPackage(json: string): Buffer {
    return Buffer.from(createDialogPackageBytes(json));
}

export function readDialogPackage(buffer: Uint8Array): string {
    return readDialogPackageBytes(buffer, {
        inflateRaw: (data) => zlib.inflateRawSync(Buffer.from(data))
    });
}

export function readDialogDirectory(dirPath: string): string {
    const dialogPath = path.join(dirPath, DIALOG_JSON);
    if (!fs.existsSync(dialogPath)) {
        throw new Error(`Invalid DialogCreator directory: missing ${DIALOG_JSON}.`);
    }

    const dialogJson = fs.readFileSync(dialogPath, 'utf8');
    const dialog = JSON.parse(dialogJson) as Record<string, unknown>;
    const script = dialog.script as { entry?: unknown } | undefined;
    const entry = normalizePackagePath(String(script?.entry || ACTIONS_JS));
    const scriptPath = path.join(dirPath, entry);
    const legacyScriptPath = path.join(dirPath, LEGACY_CUSTOM_JS);
    const customJS = fs.existsSync(scriptPath)
        ? fs.readFileSync(scriptPath, 'utf8')
        : (entry === ACTIONS_JS && fs.existsSync(legacyScriptPath) ? fs.readFileSync(legacyScriptPath, 'utf8') : undefined);

    return readDialogFiles(dialogJson, customJS);
}

export function writeDialogDirectory(dirPath: string, json: string) {
    const dialogFiles = createDialogPackageFiles(json);
    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(path.join(dirPath, DIALOG_JSON), dialogFiles.dialogJson, 'utf8');
    fs.writeFileSync(path.join(dirPath, ACTIONS_JS), dialogFiles.customJS, 'utf8');
}

export function isDialogPackagePath(filePath: string): boolean {
    return isDialogPackageName(filePath);
}

export function isDialogDirectoryPath(filePath: string): boolean {
    try {
        return fs.statSync(filePath).isDirectory() && fs.existsSync(path.join(filePath, DIALOG_JSON));
    } catch {
        return false;
    }
}
