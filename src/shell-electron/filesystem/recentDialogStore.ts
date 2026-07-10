import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

const RECENT_DIALOGS_FILE = 'recent-dialogs.json';
const MAX_RECENT_DIALOGS = 10;

function getRecentDialogsPath(): string {
    return path.join(app.getPath('userData'), RECENT_DIALOGS_FILE);
}

export function loadRecentDialogPaths(): string[] {
    try {
        const recentPath = getRecentDialogsPath();
        if (!fs.existsSync(recentPath)) return [];

        const raw = JSON.parse(fs.readFileSync(recentPath, 'utf8'));
        if (!Array.isArray(raw)) return [];

        return raw
            .map((entry) => String(entry || '').trim())
            .filter((entry) => entry.length > 0);
    } catch {
        return [];
    }
}

function saveRecentDialogPaths(paths: string[]): void {
    try {
        fs.writeFileSync(getRecentDialogsPath(), JSON.stringify(paths, null, 2));
    } catch {
        // Ignore persistence failures.
    }
}

export function rememberRecentDialogPath(filePath: string): void {
    const normalized = String(filePath || '').trim();
    if (!normalized) return;

    const next = [
        normalized,
        ...loadRecentDialogPaths().filter((entry) => {
            return entry !== normalized && fs.existsSync(entry);
        })
    ].slice(0, MAX_RECENT_DIALOGS);

    saveRecentDialogPaths(next);
}

export function clearRecentDialogPaths(): void {
    saveRecentDialogPaths([]);
}
