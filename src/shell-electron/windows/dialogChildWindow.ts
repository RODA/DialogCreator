import { BrowserWindow } from "electron";
import * as path from "path";

import type { DialogChildWindowArgs } from "../../core/host/dialogChildWindow";

type OpenDialogChildWindowOptions = {
    args: DialogChildWindowArgs;
    parent: BrowserWindow;
    compiledRootDir: string;
    development: boolean;
    onClosed?: () => void;
    onDidFinishLoad?: (win: BrowserWindow, args: DialogChildWindowArgs) => void;
};

export function openDialogChildWindow(options: OpenDialogChildWindowOptions): BrowserWindow {
    const args = options.args;
    const isCodeWindow = args.html === 'code.html';
    const isPreviewWindow = args.html === 'preview.html';

    const windowName = isCodeWindow
        ? 'codeWindow'
        : (isPreviewWindow ? 'previewWindow' : 'secondWindow');

    const childWindow = new BrowserWindow({
        width: args.width,
        height: args.height,
        useContentSize: !!args.useContentSize,
        backgroundColor: args.backgroundColor,
        parent: options.parent,
        title: args.title,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(options.compiledRootDir, 'preload', args.preload),
            sandbox: false,
            additionalArguments: [`--dc-window=${windowName}`],
        },
        autoHideMenuBar: typeof args.autoHideMenuBar === 'boolean'
            ? args.autoHideMenuBar
            : (options.development ? false : true),
        resizable: isCodeWindow ? true : false,
        alwaysOnTop: false,
    });

    try {
        childWindow.setContentSize(args.width, args.height);
        childWindow.webContents.setZoomFactor(1);
    } catch { /* no-op */ }

    childWindow.loadFile(path.join(options.compiledRootDir, "../src/pages", args.html));

    if (isCodeWindow) {
        childWindow.webContents.on('before-input-event', (event: any, input: any) => {
            const key = String(input?.key || '').toLowerCase();
            if ((input?.meta || input?.control) && key === 's') {
                event.preventDefault();

                if (
                    !childWindow.isDestroyed() &&
                    !childWindow.webContents.isDestroyed()
                ) {
                    childWindow.webContents.send('code-save-only');
                }
            }
        });
    }

    childWindow.on('closed', function() {
        options.onClosed?.();
    });

    if (options.development) {
        try {
            childWindow.webContents.openDevTools({ mode: 'detach', activate: false } as any);
            setTimeout(() => {
                childWindow.focus();
            }, 250);
        } catch {
            childWindow.webContents.openDevTools();
            setTimeout(() => {
                childWindow.focus();
            }, 250);
        }
    }

    childWindow.webContents.on("did-finish-load", () => {
        switch (args.html) {
            case 'defaults.html':
                childWindow.webContents.send("addAvailableElementsTo", "defaults");
                break;
            case 'preview.html':
                childWindow.webContents.send("renderPreview", args.data);
                break;
            case 'code.html':
                childWindow.webContents.send("renderCode", args.data);
                break;
            default:
                break;
        }

        options.onDidFinishLoad?.(childWindow, args);
    });

    return childWindow;
}
