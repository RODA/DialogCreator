const DIALOG_JSON = 'dialog.json';
const ACTIONS_JS = 'actions.js';
const LEGACY_CUSTOM_JS = 'custom.js';
const SCRIPT_SPEC = Object.freeze({
    entry: ACTIONS_JS,
    language: 'javascript'
});

type PackageFile = {
    name: string;
    data: Uint8Array;
};

export interface DialogPackageFiles {
    dialogJson: string;
    customJS: string;
}

export interface ReadDialogPackageOptions {
    inflateRaw?(data: Uint8Array): Uint8Array;
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder('utf-8');

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

function toUint8Array(data: Uint8Array): Uint8Array {
    return data instanceof Uint8Array
        ? data
        : new Uint8Array(data);
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
    const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
    const output = new Uint8Array(totalLength);
    let offset = 0;

    for (const part of parts) {
        output.set(part, offset);
        offset += part.length;
    }

    return output;
}

function createByteBuffer(length: number): {
    bytes: Uint8Array;
    view: DataView;
} {
    const bytes = new Uint8Array(length);
    return {
        bytes,
        view: new DataView(bytes.buffer)
    };
}

function crc32(data: Uint8Array): number {
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

function readString(buffer: Uint8Array, start: number, end: number, encoding: 'utf8' | 'latin1'): string {
    const bytes = buffer.subarray(start, end);
    if (encoding === 'latin1') {
        return Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
    }

    return textDecoder.decode(bytes);
}

function makeZip(files: PackageFile[]): Uint8Array {
    const localParts: Uint8Array[] = [];
    const centralParts: Uint8Array[] = [];
    let offset = 0;
    const stamp = dosTimestamp();

    for (const file of files) {
        const name = textEncoder.encode(normalizeZipPath(file.name));
        const data = toUint8Array(file.data);
        const crc = crc32(data);

        const localHeader = createByteBuffer(30);
        localHeader.view.setUint32(0, 0x04034b50, true);
        localHeader.view.setUint16(4, 20, true);
        localHeader.view.setUint16(6, 0x0800, true);
        localHeader.view.setUint16(8, 0, true);
        localHeader.view.setUint16(10, stamp.time, true);
        localHeader.view.setUint16(12, stamp.date, true);
        localHeader.view.setUint32(14, crc, true);
        localHeader.view.setUint32(18, data.length, true);
        localHeader.view.setUint32(22, data.length, true);
        localHeader.view.setUint16(26, name.length, true);
        localHeader.view.setUint16(28, 0, true);

        localParts.push(localHeader.bytes, name, data);

        const centralHeader = createByteBuffer(46);
        centralHeader.view.setUint32(0, 0x02014b50, true);
        centralHeader.view.setUint16(4, 20, true);
        centralHeader.view.setUint16(6, 20, true);
        centralHeader.view.setUint16(8, 0x0800, true);
        centralHeader.view.setUint16(10, 0, true);
        centralHeader.view.setUint16(12, stamp.time, true);
        centralHeader.view.setUint16(14, stamp.date, true);
        centralHeader.view.setUint32(16, crc, true);
        centralHeader.view.setUint32(20, data.length, true);
        centralHeader.view.setUint32(24, data.length, true);
        centralHeader.view.setUint16(28, name.length, true);
        centralHeader.view.setUint16(30, 0, true);
        centralHeader.view.setUint16(32, 0, true);
        centralHeader.view.setUint16(34, 0, true);
        centralHeader.view.setUint16(36, 0, true);
        centralHeader.view.setUint32(38, 0, true);
        centralHeader.view.setUint32(42, offset, true);

        centralParts.push(centralHeader.bytes, name);
        offset += localHeader.bytes.length + name.length + data.length;
    }

    const central = concatBytes(centralParts);
    const end = createByteBuffer(22);
    end.view.setUint32(0, 0x06054b50, true);
    end.view.setUint16(4, 0, true);
    end.view.setUint16(6, 0, true);
    end.view.setUint16(8, files.length, true);
    end.view.setUint16(10, files.length, true);
    end.view.setUint32(12, central.length, true);
    end.view.setUint32(16, offset, true);
    end.view.setUint16(20, 0, true);

    return concatBytes([...localParts, central, end.bytes]);
}

function findEndOfCentralDirectory(buffer: Uint8Array): number {
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const minOffset = Math.max(0, buffer.length - 0xffff - 22);

    for (let i = buffer.length - 22; i >= minOffset; i--) {
        if (view.getUint32(i, true) === 0x06054b50) {
            return i;
        }
    }

    throw new Error('Invalid DialogCreator package: ZIP directory not found.');
}

function readZip(buffer: Uint8Array, options: ReadDialogPackageOptions = {}): Map<string, Uint8Array> {
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const eocd = findEndOfCentralDirectory(buffer);
    const entries = view.getUint16(eocd + 10, true);
    const centralOffset = view.getUint32(eocd + 16, true);
    const files = new Map<string, Uint8Array>();
    let cursor = centralOffset;

    for (let i = 0; i < entries; i++) {
        if (view.getUint32(cursor, true) !== 0x02014b50) {
            throw new Error('Invalid DialogCreator package: malformed ZIP directory.');
        }

        const flags = view.getUint16(cursor + 8, true);
        const method = view.getUint16(cursor + 10, true);
        const compressedSize = view.getUint32(cursor + 20, true);
        const fileNameLength = view.getUint16(cursor + 28, true);
        const extraLength = view.getUint16(cursor + 30, true);
        const commentLength = view.getUint16(cursor + 32, true);
        const localOffset = view.getUint32(cursor + 42, true);
        const encoding = (flags & 0x0800) ? 'utf8' : 'latin1';
        const name = normalizeZipPath(readString(
            buffer,
            cursor + 46,
            cursor + 46 + fileNameLength,
            encoding
        ));

        if (!name.endsWith('/')) {
            if (view.getUint32(localOffset, true) !== 0x04034b50) {
                throw new Error(`Invalid DialogCreator package: malformed ZIP entry ${name}.`);
            }

            const localNameLength = view.getUint16(localOffset + 26, true);
            const localExtraLength = view.getUint16(localOffset + 28, true);
            const dataStart = localOffset + 30 + localNameLength + localExtraLength;
            const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
            let data: Uint8Array;

            if (method === 0) {
                data = new Uint8Array(compressed);
            } else if (method === 8 && options.inflateRaw) {
                data = options.inflateRaw(compressed);
            } else if (method === 8) {
                throw new Error(`DialogCreator package entry ${name} requires deflate support.`);
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

export function createDialogPackageFiles(json: string): DialogPackageFiles {
    const dialog = parseDialogJson(json);
    const customJS = String(dialog.customJS || '');
    delete dialog.customJS;

    dialog.script = { ...SCRIPT_SPEC };

    return {
        dialogJson: JSON.stringify(dialog, null, 4) + '\n',
        customJS
    };
}

export function createDialogPackage(json: string): Uint8Array {
    const dialogFiles = createDialogPackageFiles(json);
    const files: PackageFile[] = [
        { name: DIALOG_JSON, data: textEncoder.encode(dialogFiles.dialogJson) },
        { name: ACTIONS_JS, data: textEncoder.encode(dialogFiles.customJS) }
    ];

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

export function readDialogPackage(
    data: Uint8Array,
    options: ReadDialogPackageOptions = {}
): string {
    const buffer = toUint8Array(data);
    const files = readZip(buffer, options);
    const dialogFile = files.get(DIALOG_JSON);

    if (!dialogFile) {
        throw new Error(`Invalid DialogCreator package: missing ${DIALOG_JSON}.`);
    }

    const dialogJson = textDecoder.decode(dialogFile);
    const dialog = parseDialogJson(dialogJson);
    const script = dialog.script as { entry?: unknown } | undefined;
    const entry = normalizeZipPath(String(script?.entry || ACTIONS_JS));
    const customFile = files.get(entry) ?? (entry === ACTIONS_JS ? files.get(LEGACY_CUSTOM_JS) : undefined);
    const customJS = customFile ? textDecoder.decode(customFile) : undefined;

    return readDialogFiles(dialogJson, customJS);
}

export function isDialogPackageName(fileName: string): boolean {
    return String(fileName || '').toLowerCase().endsWith('.dc.zip');
}
