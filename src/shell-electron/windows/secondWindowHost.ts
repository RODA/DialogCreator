import { BrowserWindow } from "electron";

import type { DialogChildWindowArgs } from "../../core/host/dialogChildWindow";
import { openDialogChildWindow } from "./dialogChildWindow";

type WindowIdMap = { [key: string]: number };

export interface SecondWindowHostOptions {
    compiledRootDir: string;
    development: boolean;
    getEditorWindow: () => BrowserWindow;
    windowIds: WindowIdMap;
}

export class SecondWindowHost {
    private secondWindow: BrowserWindow | null = null;

    constructor(private readonly options: SecondWindowHostOptions) {}

    getSecondWindow(): BrowserWindow | null {
        return this.secondWindow;
    }

    getPreviewWindow(): BrowserWindow | null {
        const previewWindow = BrowserWindow.getAllWindows().find((win) => {
            try {
                return win.webContents.getURL().includes('preview.html');
            } catch {
                return false;
            }
        });

        return previewWindow || this.secondWindow || null;
    }

    open(args: DialogChildWindowArgs): void {
        const editorWindow = this.options.getEditorWindow();

        this.secondWindow = openDialogChildWindow({
            args,
            parent: editorWindow,
            compiledRootDir: this.options.compiledRootDir,
            development: this.options.development,
            onClosed: () => {
                if (
                    editorWindow &&
                    !editorWindow.isDestroyed() &&
                    editorWindow.webContents &&
                    !editorWindow.webContents.isDestroyed()
                ) {
                    editorWindow.webContents.send('removeCover');
                }
            },
            onDidFinishLoad: () => {
                editorWindow.webContents.send('addCover');
            }
        });

        this.options.windowIds.secondWindow = this.secondWindow.id;
    }

    nudgePreview(dx: number, dy: number): void {
        const win = this.secondWindow;
        if (!win || win.isDestroyed()) {
            return;
        }

        try {
            const url = win.webContents.getURL();
            if (!url.includes('preview.html')) {
                return;
            }
        } catch {
            return;
        }

        const bounds = win.getBounds();
        win.setBounds(
            {
                x: bounds.x + dx,
                y: bounds.y + dy,
                width: bounds.width,
                height: bounds.height
            },
            false
        );
    }
}
