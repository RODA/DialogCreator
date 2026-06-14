import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

type PackageFile = {
    name: string;
    data: Buffer;
};

const DIALOG_JSON = 'dialog.json';
const ACTIONS_JS = 'actions.js';
const LEGACY_CUSTOM_JS = 'custom.js';
const PACKAGE_SUFFIX = '.dc.zip';
const SCRIPT_SPEC = Object.freeze({
    entry: ACTIONS_JS,
    language: 'javascript'
});

const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) {
            c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table[i] = c >>> 0;
    }
    return table;
})();

function crc32(data: Buffer): number {
    let crc = 0xffffffff;
    for (const byte of data) {
        crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
}

function dosTimestamp(date = new Date()): { time: number; date: number } {
    const year = Math.max(1980, date.getFullYear());
    const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const dosDate = ((year - 1980) << 9) | (month << 5) | day;
    return { time, date: dosDate };
}

function normalizeZipPath(name: string): string {
    return String(name || '').replace(/\\/g, '/').replace(/^\/+/, '');
}

function makeZip(files: PackageFile[]): Buffer {
    const localParts: Buffer[] = [];
    const centralParts: Buffer[] = [];
    let offset = 0;
    const stamp = dosTimestamp();

    for (const file of files) {
        const name = Buffer.from(normalizeZipPath(file.name), 'utf8');
        const data = file.data;
        const crc = crc32(data);

        const localHeader = Buffer.alloc(30);
        localHeader.writeUInt32LE(0x04034b50, 0);
        localHeader.writeUInt16LE(20, 4);
        localHeader.writeUInt16LE(0x0800, 6);
        localHeader.writeUInt16LE(0, 8);
        localHeader.writeUInt16LE(stamp.time, 10);
        localHeader.writeUInt16LE(stamp.date, 12);
        localHeader.writeUInt32LE(crc, 14);
        localHeader.writeUInt32LE(data.length, 18);
        localHeader.writeUInt32LE(data.length, 22);
        localHeader.writeUInt16LE(name.length, 26);
        localHeader.writeUInt16LE(0, 28);

        localParts.push(localHeader, name, data);

        const centralHeader = Buffer.alloc(46);
        centralHeader.writeUInt32LE(0x02014b50, 0);
        centralHeader.writeUInt16LE(20, 4);
        centralHeader.writeUInt16LE(20, 6);
        centralHeader.writeUInt16LE(0x0800, 8);
        centralHeader.writeUInt16LE(0, 10);
        centralHeader.writeUInt16LE(stamp.time, 12);
        centralHeader.writeUInt16LE(stamp.date, 14);
        centralHeader.writeUInt32LE(crc, 16);
        centralHeader.writeUInt32LE(data.length, 20);
        centralHeader.writeUInt32LE(data.length, 24);
        centralHeader.writeUInt16LE(name.length, 28);
        centralHeader.writeUInt16LE(0, 30);
        centralHeader.writeUInt16LE(0, 32);
        centralHeader.writeUInt16LE(0, 34);
        centralHeader.writeUInt16LE(0, 36);
        centralHeader.writeUInt32LE(0, 38);
        centralHeader.writeUInt32LE(offset, 42);

        centralParts.push(centralHeader, name);
        offset += localHeader.length + name.length + data.length;
    }

    const central = Buffer.concat(centralParts);
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(0, 4);
    end.writeUInt16LE(0, 6);
    end.writeUInt16LE(files.length, 8);
    end.writeUInt16LE(files.length, 10);
    end.writeUInt32LE(central.length, 12);
    end.writeUInt32LE(offset, 16);
    end.writeUInt16LE(0, 20);

    return Buffer.concat([...localParts, central, end]);
}

function findEndOfCentralDirectory(buffer: Buffer): number {
    const minOffset = Math.max(0, buffer.length - 0xffff - 22);
    for (let i = buffer.length - 22; i >= minOffset; i--) {
        if (buffer.readUInt32LE(i) === 0x06054b50) return i;
    }
    throw new Error('Invalid DialogCreator package: ZIP directory not found.');
}

function readZip(buffer: Buffer): Map<string, Buffer> {
    const eocd = findEndOfCentralDirectory(buffer);
    const entries = buffer.readUInt16LE(eocd + 10);
    const centralOffset = buffer.readUInt32LE(eocd + 16);
    const files = new Map<string, Buffer>();
    let cursor = centralOffset;

    for (let i = 0; i < entries; i++) {
        if (buffer.readUInt32LE(cursor) !== 0x02014b50) {
            throw new Error('Invalid DialogCreator package: malformed ZIP directory.');
        }

        const flags = buffer.readUInt16LE(cursor + 8);
        const method = buffer.readUInt16LE(cursor + 10);
        const compressedSize = buffer.readUInt32LE(cursor + 20);
        const fileNameLength = buffer.readUInt16LE(cursor + 28);
        const extraLength = buffer.readUInt16LE(cursor + 30);
        const commentLength = buffer.readUInt16LE(cursor + 32);
        const localOffset = buffer.readUInt32LE(cursor + 42);
        const encoding: BufferEncoding = (flags & 0x0800) ? 'utf8' : 'latin1';
        const name = normalizeZipPath(buffer.toString(encoding, cursor + 46, cursor + 46 + fileNameLength));

        if (!name.endsWith('/')) {
            if (buffer.readUInt32LE(localOffset) !== 0x04034b50) {
                throw new Error(`Invalid DialogCreator package: malformed ZIP entry ${name}.`);
            }

            const localNameLength = buffer.readUInt16LE(localOffset + 26);
            const localExtraLength = buffer.readUInt16LE(localOffset + 28);
            const dataStart = localOffset + 30 + localNameLength + localExtraLength;
            const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
            let data: Buffer;

            if (method === 0) {
                data = Buffer.from(compressed);
            } else if (method === 8) {
                data = zlib.inflateRawSync(compressed);
            } else {
                throw new Error(`Unsupported compression method ${method} for ${name}.`);
            }

            files.set(name, data);
        }

        cursor += 46 + fileNameLength + extraLength + commentLength;
    }

    return files;
}

function parseDialogJson(json: string): Record<string, unknown> {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object' || !('properties' in parsed)) {
        throw new Error('Invalid dialog JSON: missing dialog properties.');
    }
    return parsed as Record<string, unknown>;
}

export function createDialogPackageFiles(json: string): { dialogJson: string; customJS: string } {
    const dialog = parseDialogJson(json);
    const customJS = String(dialog.customJS || '');
    delete dialog.customJS;

    dialog.script = { ...SCRIPT_SPEC };

    return {
        dialogJson: JSON.stringify(dialog, null, 4) + '\n',
        customJS
    };
}

export function createDialogPackage(json: string): Buffer {
    const dialogFiles = createDialogPackageFiles(json);
    const files: PackageFile[] = [
        { name: DIALOG_JSON, data: Buffer.from(dialogFiles.dialogJson, 'utf8') }
    ];

    files.push({ name: ACTIONS_JS, data: Buffer.from(dialogFiles.customJS, 'utf8') });

    return makeZip(files);
}

export function readDialogFiles(dialogJson: string, customJS?: string): string {
    const dialog = parseDialogJson(dialogJson);
    const script = dialog.script as { entry?: unknown } | undefined;

    if (customJS !== undefined) {
        dialog.customJS = customJS;
    } else if (script?.entry) {
        throw new Error(`Invalid DialogCreator package: missing script entry ${normalizeZipPath(String(script.entry))}.`);
    } else {
        dialog.customJS = String(dialog.customJS || '');
    }

    return JSON.stringify(dialog, null, 4);
}

export function readDialogPackage(buffer: Buffer): string {
    const files = readZip(buffer);
    const dialogFile = files.get(DIALOG_JSON);
    if (!dialogFile) {
        throw new Error(`Invalid DialogCreator package: missing ${DIALOG_JSON}.`);
    }

    const dialog = parseDialogJson(dialogFile.toString('utf8'));
    const script = dialog.script as { entry?: unknown } | undefined;
    const entry = normalizeZipPath(String(script?.entry || ACTIONS_JS));
    const customFile = files.get(entry) ?? (entry === ACTIONS_JS ? files.get(LEGACY_CUSTOM_JS) : undefined);

    return readDialogFiles(dialogFile.toString('utf8'), customFile?.toString('utf8'));
}

export function readDialogDirectory(dirPath: string): string {
    const dialogPath = path.join(dirPath, DIALOG_JSON);
    if (!fs.existsSync(dialogPath)) {
        throw new Error(`Invalid DialogCreator directory: missing ${DIALOG_JSON}.`);
    }

    const dialogJson = fs.readFileSync(dialogPath, 'utf8');
    const dialog = parseDialogJson(dialogJson);
    const script = dialog.script as { entry?: unknown } | undefined;
    const entry = normalizeZipPath(String(script?.entry || ACTIONS_JS));
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

    const scriptPath = path.join(dirPath, ACTIONS_JS);
    fs.writeFileSync(scriptPath, dialogFiles.customJS, 'utf8');
}

export function isDialogPackagePath(filePath: string): boolean {
    return String(filePath || '').toLowerCase().endsWith(PACKAGE_SUFFIX);
}

export function isDialogDirectoryPath(filePath: string): boolean {
    try {
        return fs.statSync(filePath).isDirectory() && fs.existsSync(path.join(filePath, DIALOG_JSON));
    } catch {
        return false;
    }
}
