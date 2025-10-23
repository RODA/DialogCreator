// Setting ENVIRONMENT
process.env.NODE_ENV = 'development';
// process.env.NODE_ENV = 'production';

const production = process.env.NODE_ENV === 'production';
const development = process.env.NODE_ENV === 'development';
const OS_Windows = process.platform == 'win32';

import { app, BrowserWindow, dialog, ipcMain, Menu } from "electron";
import { utils } from "./library/utils";
import * as path from "path";
import { database } from "./database/database";
import { DBElements } from "./interfaces/database";

let editorWindow: BrowserWindow;
let secondWindow: BrowserWindow;

const windowid: { [key: string]: number } = {
    editorWindow: 1,
    secondWindow: 2
}


// const appSession = {
//     language: "en"
// };

function consolog(x: any) {
    if (editorWindow && !editorWindow.isDestroyed()) {
        editorWindow.webContents.send("consolog", x);
    }
}


function createMainWindow() {
    editorWindow = new BrowserWindow({
        title: 'Dialog creator',
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, "preload/preloadEditor.js"),
            sandbox: false
        },
        width: 1200,
        height: 800,
        minWidth: 1200,
        minHeight: 800,
        center: true
    });

    // Ensure initial title formatting on all platforms
    updateWindowTitle();

    // and load the index.html of the app.
    editorWindow.loadFile(path.join(__dirname, "../src/pages/editor.html"));

    // // Set the application menu
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);

    // Open the DevTools.
    if (development) {
        editorWindow.webContents.openDevTools();
        setTimeout(() => {
            editorWindow.focus();
        }, 300);
    }
}

app.whenReady().then(() => {
    createMainWindow();
    setupIPC();
});

app.on("window-all-closed", () => {
    quitApp()
});

function createSecondWindow(args: { [key: string]: any }) {

    // let iconPath = path.join(__dirname, "../src/assets/icon.png");
    // if (process.env.NODE_ENV !== "development") {
    //     iconPath = path.join(path.resolve(__dirname), "../../assets/icon.png");
    // }

    const isCodeWindow = args.html === 'code.html';
    secondWindow = new BrowserWindow({
        width: args.width,
        height: args.height,
        useContentSize: !!args.useContentSize,
        // icon: iconPath,
        backgroundColor: args.backgroundColor,
        parent: editorWindow,
        title: args.title,
        webPreferences: {
            // allows using import { ipcRenderer } from "electron"; directly in renderer
            nodeIntegration: true,

            // protects the context of the window, so that preload is needed
            // (if false, preload is not needed)
            contextIsolation: true,

            preload: path.join(__dirname, 'preload', args.preload),
            sandbox: false,
        },
        autoHideMenuBar: typeof args.autoHideMenuBar === 'boolean' ? args.autoHideMenuBar : (development ? false : true),
        resizable: isCodeWindow ? true : false,
    });

    // and load the index.html of the app.
    secondWindow.loadFile(path.join(__dirname, "../src/pages", args.html));

    // Intercept Cmd/Ctrl+S in the Code window to save code without closing
    if (isCodeWindow) {
        try {
            secondWindow.webContents.on('before-input-event', (event: any, input: any) => {
                try {
                    const key = String(input?.key || '').toLowerCase();
                    if ((input?.meta || input?.control) && key === 's') {
                        event.preventDefault();
                        // Tell the code window to perform a save-only (no close)
                        if (secondWindow && !secondWindow.isDestroyed() && !secondWindow.webContents.isDestroyed()) {
                            secondWindow.webContents.send('code-save-only');
                        }
                    }
                } catch { /* noop */ }
            });
        } catch { /* noop */ }
    }

    // Garbage collection handle
    secondWindow.on('closed', function() {
        if (
            editorWindow &&
            !editorWindow.isDestroyed() &&
            editorWindow.webContents &&
            !editorWindow.webContents.isDestroyed()
        ) {
            editorWindow.webContents.send('removeCover');
        }
    });

    if (development && args.html !== 'preview.html') {
    // if (development) {
        // Open DevTools detached and without activating them so focus stays on the new window
        try {
            secondWindow.webContents.openDevTools({ mode: 'detach', activate: false } as any);
            // As an extra safeguard, refocus shortly after opening DevTools
            setTimeout(() => {
                secondWindow.focus();
            }, 250);
        } catch {
            // Fallback if options unsupported: open and refocus
            secondWindow.webContents.openDevTools();
            setTimeout(() => {
                secondWindow.focus();
            }, 250);
        }
    }


    secondWindow.webContents.on("did-finish-load", () => {
        switch (args.html) {
            case 'defaults.html':
                secondWindow.webContents.send("addAvailableElementsTo", "defaults");
                break;
            case 'preview.html':
                secondWindow.webContents.send("renderPreview", args.data);
                break;
            case 'syntax.html':
                secondWindow.webContents.send("renderSyntax", args.data);
                break;
            case 'code.html':
                secondWindow.webContents.send("renderCode", args.data);
                break;
            default:
                break;
        }
        editorWindow.webContents.send('addCover');
    });

    windowid.secondWindow = secondWindow.id;
}

function setupIPC() {

    // "_event" means that I know the event exists but I don't need it
    // using "event" might trigger linter warnings, for instance"
    // "'event' is declared but its value is never read"

    ipcMain.on("send-to", async (_event, window, channel, ...args) => {
        if (window == "main") {
            switch (channel) {
                case 'showError':
                    dialog.showMessageBox(editorWindow, {
                        type: "error",
                        title: "Error",
                        message: args[0]
                    });
                    break;
                case 'showDialogMessage':
                    dialog.showMessageBox(editorWindow, {
                        type: args[0],
                        // title: args[1],
                        // message: args[2]
                        // On macOS, 'title' isn't shown for sheet dialogs; use 'message' for the visible header
                        message: String(args[1] ?? ''),
                        detail: String(args[2] ?? ''),
                        // Keep 'title' as a fallback for platforms that display it
                        title: String(args[1] ?? '')
                    });
                    break;
                case 'secondWindow':
                    createSecondWindow(args[0]);
                    break;
                case 'resize-editorWindow':
                    editorWindow.setSize(
                        Math.max(args[0] + 560, 1200), // width
                        Math.max(args[1] + 320, 800) // height
                    );
                    break;
                case 'getProperties':
                    {
                        const properties = await database.getProperties(args[0] as keyof DBElements);
                        BrowserWindow.getAllWindows().forEach((win) => {
                            win.webContents.send("message-from-main-propertiesFromDB", args[0], properties);
                        });
                    }
                    break;
                case 'resetProperties':
                    {
                        const properties = await database.resetProperties(args[0]);
                        if (utils.isFalse(properties)) {
                            dialog.showErrorBox("Error", `Failed to reset properties of ${args[0]}`);
                        } else {
                            secondWindow.webContents.send(
                                "message-from-main-resetOK",
                                properties
                            );
                            editorWindow.webContents.send(
                                "message-from-main-propertiesFromDB",
                                args[0],
                                properties
                            );
                        }
                    }
                    break;
                case 'updateProperty':
                    {
                        const ok = await database.updateProperty(args[0] as keyof DBElements, args[1], args[2]);
                        if (ok) {
                            const properties = await database.getProperties(args[0] as keyof DBElements);
                            editorWindow.webContents.send(
                                "message-from-main-propertiesFromDB",
                                args[0],
                                properties);
                        }
                        else {
                            dialog.showErrorBox("Error", `Failed to update property ${args[1]} of ${args[0]}`);
                        }
                    }
                    break;
                case 'close-secondWindow':
                case 'close-codeWindow':
                case 'close-previewWindow':
                    secondWindow.close();
                    break;
                case 'document-json-updated':
                    try {
                        const json = String(args[0] ?? '');
                        if (pendingCanonicalUpdate) {
                            lastSavedJson = json;
                            dialogModified = false;
                            pendingCanonicalUpdate = false;
                            updateWindowTitle();
                        } else {
                            const same = json === (lastSavedJson || '');
                            dialogModified = !same;
                            updateWindowTitle();
                        }
                    } catch {
                        // ignore errors computing dirty state
                    }
                    break;
                default:
                    break;
            }

        } else if (window == "all") { // forward to all windows
            BrowserWindow.getAllWindows().forEach((win) => {
                win.webContents.send(`message-from-main-${channel}`, ...args);
            });
        } else {
            const win = BrowserWindow.fromId(windowid[window]);
            if (win && !win.isDestroyed() && !win.webContents.isDestroyed()) {
                win.webContents.send(`message-from-main-${channel}`, ...args);
            }
        }
    });
}


function quitApp() {
    app.quit();
}

// Title helpers
function updateWindowTitle() {
    try {
        if (editorWindow && !editorWindow.isDestroyed()) {
            const base = 'Dialog creator';
            const name = currentFilePath ? ` — ${path.basename(currentFilePath)}` : '';
            const dot = dialogModified ? '~ ' : '';
            editorWindow.setTitle(`${dot}${base}${name}`);
            try {
                if (process.platform === 'darwin') {
                    editorWindow.setDocumentEdited(!!dialogModified);
                }
            } catch { /* noop */ }
        }
    } catch { /* noop */ }
}

function setCurrentDialogPath(filePath: string | null) {
    currentFilePath = filePath;
    updateWindowTitle();
}

// Create menu template
import type { MenuItemConstructorOptions } from "electron";

let lastSavedJson = '';
let currentFilePath: string | null = null;
let dialogModified = false;
let pendingCanonicalUpdate = false; // next JSON update should reset baseline

const mainMenuTemplate: MenuItemConstructorOptions[] = [
    {
        label: 'File',
        submenu:[
            {
                label: 'New',
                accelerator: "CommandOrControl+N",
                click: async () => {
                    // Request current JSON from renderer
                    editorWindow.webContents.send('request-dialog-json');

                    const onJson = async (_ev: any, json: string) => {
                        ipcMain.removeListener('send-to', onSendTo);
                        const current = json || '';
                        const isSame = current && lastSavedJson && current === lastSavedJson;
                        if (!current || !isSame) {
                            // Ask to save changes
                            const res = await dialog.showMessageBox(editorWindow, {
                                type: 'question',
                                buttons: ['Save', "Don't Save", 'Cancel'],
                                defaultId: 0,
                                cancelId: 2,
                                message: 'Do you want to save changes to this dialog before creating a new one?'
                            });

                            if (res.response === 2) return; // Cancel

                            if (res.response === 0) {
                                // Save then proceed
                                try {
                                    const { canceled, filePath } = await dialog.showSaveDialog(editorWindow, {
                                        title: 'Save dialog',
                                        filters: [{ name: 'Dialog JSON', extensions: ['json'] }],
                                        defaultPath: 'dialog.json'
                                    });

                                    if (!canceled && filePath) {
                                        const fs = require('fs');
                                        fs.writeFileSync(filePath, current, 'utf-8');
                                        lastSavedJson = current;
                                        // Remember path used for saving the previous file
                                        setCurrentDialogPath(filePath);
                                    } else {
                                        // user canceled save dialog => abort New
                                        return;
                                    }
                                } catch (e: any) {
                                    dialog.showErrorBox('Save failed', String((e && e.message) ? e.message : e));
                                    return;
                                }
                            }
                        }
                        // Clear dialog: select all + remove
                        editorWindow.webContents.send('newDialogClear');
                        // Reset state for the new unsaved dialog
                        setCurrentDialogPath(null);
                        // Next renderer JSON becomes the clean baseline
                        pendingCanonicalUpdate = true;
                        dialogModified = false;
                        updateWindowTitle();
                    };
                    const onSendTo = (_event: any, window: string, channel: string, ...args: any[]) => {
                        if (window === 'main' && channel === 'dialog-json') {
                            onJson(null, args[0] as string);
                        }
                    };
                    ipcMain.on('send-to', onSendTo);
                }
            },
            {
                label: 'Preview',
                accelerator: "CommandOrControl+P",
                click: () => {
                    editorWindow.webContents.send('previewDialog');
                    ipcMain.once('containerData', (event, arg) => {
                        if (utils.isTrue(arg)) {
                            // createObjectsWindow(arg);
                        }
                    });
                }
            },
            { type: "separator" as const },
            {
                label: 'Load dialog',
                accelerator: "CommandOrControl+O",
                click: async () => {
                    const { canceled, filePaths } = await dialog.showOpenDialog(editorWindow, {
                        title: 'Load dialog',
                        filters: [{ name: 'Dialog JSON', extensions: ['json'] }],
                        properties: ['openFile']
                    });
                    if (canceled || !filePaths || filePaths.length === 0) return;
                    try {
                        const fs = require('fs');
                        const content = fs.readFileSync(filePaths[0], 'utf-8');
                        editorWindow.webContents.send('load-dialog-json', content);
                        // Ask the next JSON snapshot to be treated as canonical
                        pendingCanonicalUpdate = true;
                        dialogModified = false;
                        // Remember the loaded file path so Cmd+S overwrites it and reflect in title
                        setCurrentDialogPath(filePaths[0]);
                        updateWindowTitle();
                    } catch (e: any) {
                        dialog.showErrorBox('Load failed', String((e && e.message) ? e.message : e));
                    }
                }
            },
            {
                label: 'Save dialog',
                accelerator: "CommandOrControl+S",
                click: async () => {
                    // Ask renderer for JSON
                    editorWindow.webContents.send('request-dialog-json');
                    const onJson = async (_ev: any, json: string) => {
                        ipcMain.removeListener('send-to', onSendTo);
                        try {
                            const fs = require('fs');
                            const data = json || '';
                            if (currentFilePath && currentFilePath.length > 0) {
                                // Overwrite the current file without prompting
                                fs.writeFileSync(currentFilePath, data, 'utf-8');
                                lastSavedJson = data;
                                dialogModified = false;
                                updateWindowTitle();
                                return;
                            }
                            // No known path: fall back to Save As...
                            const { canceled, filePath } = await dialog.showSaveDialog(editorWindow, {
                                title: 'Save dialog',
                                filters: [{ name: 'Dialog JSON', extensions: ['json'] }],
                                defaultPath: 'dialog.json'
                            });

                            if (canceled || !filePath) return;

                            fs.writeFileSync(filePath, data, 'utf-8');
                            lastSavedJson = data;
                            setCurrentDialogPath(filePath);

                            dialogModified = false;
                            updateWindowTitle();

                        } catch (e: any) {
                            dialog.showErrorBox('Save failed', String((e && e.message) ? e.message : e));
                        }
                    };
                    const onSendTo = (_event: any, window: string, channel: string, ...args: any[]) => {
                        if (window === 'main' && channel === 'dialog-json') {
                            onJson(null, args[0] as string);
                        }
                    };
                    ipcMain.on('send-to', onSendTo);
                }
            },
            {
                label: 'Save dialog As...',
                accelerator: 'Shift+CommandOrControl+S',
                click: async () => {
                    // Ask renderer for JSON
                    editorWindow.webContents.send('request-dialog-json');
                    const onJson = async (_ev: any, json: string) => {
                        ipcMain.removeListener('send-to', onSendTo);
                        try {
                            const fs = require('fs');
                            const data = json || '';
                            const { canceled, filePath } = await dialog.showSaveDialog(editorWindow, {
                                title: 'Save dialog As...',
                                filters: [{ name: 'Dialog JSON', extensions: ['json'] }],
                                defaultPath: currentFilePath || 'dialog.json'
                            });
                            if (canceled || !filePath) return;
                            fs.writeFileSync(filePath, data, 'utf-8');
                            lastSavedJson = data;
                            setCurrentDialogPath(filePath);
                        } catch (e: any) {
                            dialog.showErrorBox('Save failed', String((e && e.message) ? e.message : e));
                        }
                    };
                    const onSendTo = (_event: any, window: string, channel: string, ...args: any[]) => {
                        if (window === 'main' && channel === 'dialog-json') {
                            onJson(null, args[0] as string);
                        }
                    };
                    ipcMain.on('send-to', onSendTo);
                }
            },
            { type: 'separator' },
            {
                label: 'Quit',
                accelerator: 'CommandOrControl+Q',
                click: () => {
                    // Only fires when app/menu focused (Electron menu accelerator semantics)
                    quitApp();
                }
            }
        ]
    },
    {
        label: 'Edit',
        submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { role: 'selectAll' }
        ]
    },
    {
        label: 'Info',
        submenu:[
            {
                label: 'About',
                click() {
                    // createAboutWindow();
                }
            },
            {
                label: 'User manual',
                click() {
                    // createUserManualWindow();
                }
            }
        ]
    },
];
