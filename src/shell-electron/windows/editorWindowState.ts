import { app, BrowserWindow, screen } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

const EDITOR_WINDOW_STATE_FILE = 'editor-window-state.json';

export const EDITOR_WINDOW_DEFAULT_WIDTH = 1050;
export const EDITOR_WINDOW_DEFAULT_HEIGHT = 680;

function getEditorWindowStatePath(): string {
    return path.join(app.getPath('userData'), EDITOR_WINDOW_STATE_FILE);
}

export function loadEditorWindowState(): Electron.Rectangle | null {
    try {
        const statePath = getEditorWindowStatePath();
        if (!fs.existsSync(statePath)) return null;

        const raw = JSON.parse(fs.readFileSync(statePath, 'utf8')) as Partial<Electron.Rectangle>;
        const width = Math.max(EDITOR_WINDOW_DEFAULT_WIDTH, Math.round(Number(raw.width) || 0));
        const height = Math.max(EDITOR_WINDOW_DEFAULT_HEIGHT, Math.round(Number(raw.height) || 0));
        const x = Math.round(Number(raw.x));
        const y = Math.round(Number(raw.y));

        if (!Number.isFinite(width) || !Number.isFinite(height) || !Number.isFinite(x) || !Number.isFinite(y)) {
            return null;
        }

        const displays = screen.getAllDisplays();
        const fitsSomeDisplay = displays.some((display) => {
            const area = display.workArea;
            return (
                x >= area.x &&
                y >= area.y &&
                x + 120 <= area.x + area.width &&
                y + 120 <= area.y + area.height
            );
        });

        if (!fitsSomeDisplay) {
            return null;
        }

        return { x, y, width, height };
    } catch {
        return null;
    }
}

export function saveEditorWindowState(win: BrowserWindow | null): void {
    if (!win || win.isDestroyed()) {
        return;
    }

    try {
        const bounds = win.getBounds();
        fs.writeFileSync(getEditorWindowStatePath(), JSON.stringify(bounds, null, 2));
    } catch {
        // Ignore persistence failures.
    }
}
