// Setting ENVIRONMENT
process.env.NODE_ENV = 'development';
// process.env.NODE_ENV = 'production';

const production = process.env.NODE_ENV === 'production';
const development = process.env.NODE_ENV === 'development';
const OS_Windows = process.platform == 'win32';

import { app, BrowserWindow, dialog, ipcMain, globalShortcut, Menu } from "electron";
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

    // and load the index.html of the app.
    editorWindow.loadFile(path.join(__dirname, "../src/pages/editor.html"));

    // // Set the application menu
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);

    // Open the DevTools.
    if (development) {
        editorWindow.webContents.openDevTools();
    }
}

app.whenReady().then(() => {
    createMainWindow();
    setupIPC();

    const success = globalShortcut.register('CommandOrControl+Q', () => {
        quitApp();
    });

    if (!success) {
        console.error("Global shortcut registration failed");
    }

    // editorWindow.webContents.on("did-finish-load", () => {
    //     consolog(path.join(__dirname, "../src/pages/editor.html"));
    // });
});

app.on("window-all-closed", () => {
    quitApp()
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

function createSecondWindow(args: { [key: string]: any }) {

    // let iconPath = path.join(__dirname, "../src/assets/icon.png");
    // if (process.env.NODE_ENV !== "development") {
    //     iconPath = path.join(path.resolve(__dirname), "../../assets/icon.png");
    // }

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
        resizable: false,
    });

    // and load the index.html of the app.
    secondWindow.loadFile(path.join(__dirname, "../src/pages", args.html));

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
        // Open the DevTools.
        secondWindow.webContents.openDevTools();
    }


    secondWindow.webContents.on("did-finish-load", () => {
        switch (args.html) {
            case 'defaults.html':
                secondWindow.webContents.send("addAvailableElementsTo", "defaults");
                break;
            case 'conditions.html':
                secondWindow.webContents.send("populateConditions", {
                    name: args.name,
                    conditions: args.conditions,
                    elements: args.elements,
                    selected: args.selected
                });
                break;
            case 'preview.html':
                secondWindow.webContents.send("response-from-main-renderPreview", args.data);
                break;
            case 'syntax.html':
                secondWindow.webContents.send("response-from-main-renderSyntax", args.data);
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
                        title: args[1],
                        message: args[2]
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
                case 'resize-conditionsWindow':
                    {
                        const size = secondWindow.getSize();
                        secondWindow.setSize(size[0], size[1] + 33);
                    }
                    break;
                case 'getProperties':
                    {
                        const properties = await database.getProperties(args[0] as keyof DBElements);
                        BrowserWindow.getAllWindows().forEach((win) => {
                            win.webContents.send("response-from-main-propertiesFromDB", args[0], properties);
                        });
                    }
                    break;
                case 'resetProperties':
                    {
                        const properties = await database.resetProperties(args[0]);
                        if (utils.isFalse(properties)) {
                            dialog.showErrorBox("Error", `Failed to reset properties of ${args[0]}`);
                        } else {
                            secondWindow.webContents.send("response-from-main-resetOK", properties);
                            editorWindow.webContents.send("response-from-main-propertiesFromDB", args[0], properties);
                        }
                    }
                    break;
                case 'updateProperty':
                    {
                        const ok = await database.updateProperty(args[0] as keyof DBElements, args[1], args[2]);
                        if (ok) {
                            const properties = await database.getProperties(args[0] as keyof DBElements);
                            editorWindow.webContents.send("response-from-main-propertiesFromDB", args[0], properties);
                        }
                        else {
                            dialog.showErrorBox("Error", `Failed to update property ${args[1]} of ${args[0]}`);
                        }
                    }
                    break;
                case 'close-conditionsWindow':
                    secondWindow.close();
                    break;
                default:
                    break;
            }

        } else if (window == "all") { // forward to all windows
            BrowserWindow.getAllWindows().forEach((win) => {
                win.webContents.send(`response-from-main-${channel}`, ...args);
            });
        } else {
            const win = BrowserWindow.fromId(windowid[window]);
            if (win && !win.isDestroyed() && !win.webContents.isDestroyed()) {
                win.webContents.send(`response-from-main-${channel}`, ...args);
            }
        }
    });
}


function quitApp() {
    app.quit();
}


// Create menu template
import type { MenuItemConstructorOptions } from "electron";

const mainMenuTemplate: MenuItemConstructorOptions[] = [
    {
        label: 'File',
        submenu:[
            {
                label: 'New',
                accelerator: "CommandOrControl+N",
                click: () => {
                    // editorWindow.webContents.send('newWindow');
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
                            const { canceled, filePath } = await dialog.showSaveDialog(editorWindow, {
                                title: 'Save dialog',
                                filters: [{ name: 'Dialog JSON', extensions: ['json'] }],
                                defaultPath: 'dialog.json'
                            });
                            if (canceled || !filePath) return;
                            const fs = require('fs');
                            fs.writeFileSync(filePath, json || '', 'utf-8');
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

