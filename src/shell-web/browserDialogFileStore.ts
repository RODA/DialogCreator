import {
    createDialogPackage,
    isDialogPackageName,
    readDialogPackage
} from '../core/dialog-package/dialogPackageFormat';
import { defaultDialogPackageFileName } from '../core/document/dialogDocumentRules';

export type BrowserDialogLoadResult =
    | { ok: true; json: string; fileName: string }
    | { ok: false; reason: string };

export type BrowserDialogSaveResult =
    | { ok: true; fileName: string; bytes: Uint8Array; blob: Blob }
    | { ok: false; reason: string };

export async function readBrowserDialogPackage(file: File): Promise<BrowserDialogLoadResult> {
    if (!isDialogPackageName(file.name)) {
        return {
            ok: false,
            reason: 'Choose a .dc.zip DialogCreator package.'
        };
    }

    try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        return {
            ok: true,
            fileName: file.name,
            json: readDialogPackage(bytes)
        };
    } catch (error) {
        return {
            ok: false,
            reason: error instanceof Error ? error.message : String(error)
        };
    }
}

export function createBrowserDialogPackage(json: string, requestedName?: string): BrowserDialogSaveResult {
    try {
        const fileName = requestedName && isDialogPackageName(requestedName)
            ? requestedName
            : defaultDialogPackageFileName(json);
        const bytes = createDialogPackage(json);
        const blobBuffer = new ArrayBuffer(bytes.byteLength);
        new Uint8Array(blobBuffer).set(bytes);
        const blob = new Blob([blobBuffer], { type: 'application/zip' });

        return {
            ok: true,
            fileName,
            bytes,
            blob
        };
    } catch (error) {
        return {
            ok: false,
            reason: error instanceof Error ? error.message : String(error)
        };
    }
}
