import * as zlib from 'zlib';

type PackageFile = {
    name: string;
    data: Buffer;
};

const DIALOG_JSON = 'dialog.json';
const CUSTOM_JS = 'custom.js';
const SCRIPT_SPEC = Object.freeze({
    entry: CUSTOM_JS,
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

export function createDialogPackage(json: string): Buffer {
    const dialog = parseDialogJson(json);
    const customJS = String(dialog.customJS || '');
    delete dialog.customJS;

    if (customJS.trim().length > 0) {
        dialog.script = { ...SCRIPT_SPEC };
    } else {
        delete dialog.script;
    }

    const dialogJson = Buffer.from(JSON.stringify(dialog, null, 4) + '\n', 'utf8');
    const files: PackageFile[] = [{ name: DIALOG_JSON, data: dialogJson }];

    if (customJS.trim().length > 0) {
        files.push({ name: CUSTOM_JS, data: Buffer.from(customJS, 'utf8') });
    }

    return makeZip(files);
}

export function readDialogPackage(buffer: Buffer): string {
    const files = readZip(buffer);
    const dialogFile = files.get(DIALOG_JSON);
    if (!dialogFile) {
        throw new Error(`Invalid DialogCreator package: missing ${DIALOG_JSON}.`);
    }

    const dialog = parseDialogJson(dialogFile.toString('utf8'));
    const script = dialog.script as { entry?: unknown } | undefined;
    const entry = normalizeZipPath(String(script?.entry || CUSTOM_JS));
    const customFile = files.get(entry);

    if (customFile) {
        dialog.customJS = customFile.toString('utf8');
    } else if (script?.entry) {
        throw new Error(`Invalid DialogCreator package: missing script entry ${entry}.`);
    } else {
        dialog.customJS = String(dialog.customJS || '');
    }

    return JSON.stringify(dialog, null, 4);
}

export function isDialogPackagePath(filePath: string): boolean {
    const ext = pathExtension(filePath);
    return ext === '.dczip';
}

function pathExtension(filePath: string): string {
    const match = String(filePath || '').toLowerCase().match(/\.[^./\\]+$/);
    return match ? match[0] : '';
}
