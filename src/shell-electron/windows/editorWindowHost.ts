import { BrowserWindow } from "electron";
import * as path from "path";

import {
    EDITOR_WINDOW_DEFAULT_HEIGHT,
    EDITOR_WINDOW_DEFAULT_WIDTH,
    loadEditorWindowState,
    saveEditorWindowState
} from "./editorWindowState";

export interface EditorWindowHostOptions {
    compiledRootDir: string;
    development: boolean;
    onCloseRequested(event: Electron.Event): void | Promise<void>;
    onDidFinishLoad(): void;
    onMoveChildren(dx: number, dy: number): void;
}

export class EditorWindowHost {
    private editorWindow: BrowserWindow | null = null;
    private lastEditorBounds: Electron.Rectangle | null = null;

    constructor(private readonly options: EditorWindowHostOptions) {}

    getWindow(): BrowserWindow {
        if (!this.editorWindow || this.editorWindow.isDestroyed()) {
            throw new Error("Editor window is not available.");
        }

        return this.editorWindow;
    }

    create(): BrowserWindow {
        const restoredBounds = loadEditorWindowState();
        const win = new BrowserWindow({
            title: 'Dialog creator',
            webPreferences: {
                contextIsolation: true,
                preload: path.join(this.options.compiledRootDir, "preload/preloadEditor.js"),
                sandbox: false,
                additionalArguments: ['--dc-window=editorWindow']
            },
            width: restoredBounds?.width ?? EDITOR_WINDOW_DEFAULT_WIDTH,
            height: restoredBounds?.height ?? EDITOR_WINDOW_DEFAULT_HEIGHT,
            minWidth: EDITOR_WINDOW_DEFAULT_WIDTH,
            minHeight: EDITOR_WINDOW_DEFAULT_HEIGHT,
            x: restoredBounds?.x,
            y: restoredBounds?.y,
            center: restoredBounds ? false : true,
            icon: path.join(this.options.compiledRootDir, 'icons', 'icon.png')
        });

        this.editorWindow = win;
        this.lastEditorBounds = win.getBounds();

        win.loadFile(path.join(this.options.compiledRootDir, "../src/pages/editor.html"));
        win.webContents.once('did-finish-load', () => {
            this.options.onDidFinishLoad();
        });

        win.on('close', async (event) => {
            saveEditorWindowState(win);
            await this.options.onCloseRequested(event);
        });

        this.installDevelopmentTools(win);
        this.installMoveSync(win);
        this.installStatePersistence(win);

        return win;
    }

    private installDevelopmentTools(win: BrowserWindow): void {
        if (!this.options.development) {
            return;
        }

        try {
            win.webContents.openDevTools({ mode: 'detach', activate: false } as any);
            const devTools = win.webContents.devToolsWebContents;
            if (devTools) {
                devTools.once('did-finish-load', () => {
                    try {
                        win.focus();
                        win.webContents.focus();
                    } catch {
                        // Refocus is best-effort.
                    }
                });
            }
        } catch {
            win.webContents.openDevTools({ mode: 'detach' } as any);
        }

        const refocus = () => {
            try {
                win.focus();
                win.webContents.focus();
            } catch {
                // Refocus is best-effort.
            }
        };

        setTimeout(refocus, 600);
    }

    private installMoveSync(win: BrowserWindow): void {
        const syncChildrenOnMove = () => {
            try {
                if (!win || win.isDestroyed()) {
                    return;
                }

                const currentBounds = win.getBounds();
                if (!this.lastEditorBounds) {
                    this.lastEditorBounds = currentBounds;
                    return;
                }

                const dx = currentBounds.x - this.lastEditorBounds.x;
                const dy = currentBounds.y - this.lastEditorBounds.y;
                if (dx === 0 && dy === 0) {
                    this.lastEditorBounds = currentBounds;
                    return;
                }

                this.options.onMoveChildren(dx, dy);
                this.lastEditorBounds = currentBounds;
            } catch {
                // Child window position sync is best-effort.
            }
        };

        win.on('move', syncChildrenOnMove);
        win.on('moved', syncChildrenOnMove);
    }

    private installStatePersistence(win: BrowserWindow): void {
        win.on('resize', () => saveEditorWindowState(win));
        win.on('moved', () => saveEditorWindowState(win));
    }
}
