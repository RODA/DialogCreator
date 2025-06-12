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
        autoHideMenuBar: development ? false : true,
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

    if (development) {
        // Open the DevTools.
        secondWindow.webContents.openDevTools();
    }


    secondWindow.webContents.on("did-finish-load", () => {
        switch (args.html) {
            case 'defaults.html':
                secondWindow.webContents.send("addAvailableElementsTo", "defaults");
                break;
            case 'conditions.html':
                // secondWindow.webContents.send("conditions", args.conditions);
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
    // using "event" might trigger linter warnings, for instance
    // 'event' is declared but its value is never read
    ipcMain.on('secondWindow', (_event, args) => {
        createSecondWindow(args);
    });

    // send condition for validation to container
    ipcMain.on('conditionsCheck', (_event, args) => {
        if (editorWindow && !editorWindow.isDestroyed()) {
            editorWindow.webContents.send('conditionsCheck', args);
        }
    });

    ipcMain.on('showDialogMessage', (_event, args) => {
        dialog.showMessageBox(editorWindow, {
            type: args.type,
            title: args.title,
            message: args.message,
        })
    });

    ipcMain.on('showError', (_event, message) => {
        dialog.showMessageBox(editorWindow, {
            type: "error",
            title: "Error",
            message: message
        });
    });

    ipcMain.on('resize-editorWindow', (_event, { width, height }) => {
        editorWindow.setSize(Math.max(width + 560, 1200), Math.max(height + 320, 800));
    });

    ipcMain.on("send-to-window", (_event, window, channel, ...args) => {
        if (window == "all") { // forward to all windows
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

    ipcMain.on("getProperties", async (_event, name) => {
        const properties = await database.getProperties(name as keyof DBElements);
        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send("response-from-main-propertiesFromDB", name, properties);
        });
    });

    ipcMain.on("updateProperty", async (_event, obj) => {

        const ok = await database.updateProperty(obj.name as keyof DBElements, obj.property, obj.value);
        if (ok) {
            const properties = await database.getProperties(obj.name as keyof DBElements);
            BrowserWindow.getAllWindows().forEach((win) => {
                win.webContents.send("response-from-main-propertiesFromDB", obj.name, properties);
            });
        }
        else {
            dialog.showErrorBox("Error", `Failed to update property ${obj.property} of ${obj.name}`);
        }
    });

    ipcMain.on("resetProperties", async (_event, element) => {
        const ok = await database.resetProperties(element);
        if (utils.isFalse(ok)) {
            dialog.showErrorBox("Error", `Failed to reset properties of ${element}`);
        } else {
            BrowserWindow.getAllWindows().forEach((win) => {
                win.webContents.send("response-from-main-resetOK", ok);
            });
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
                click: () => {

                }
            },
            {
                label: 'Save dialog',
                accelerator: "CommandOrControl+S",
                click: () => {
                    editorWindow.webContents.send('previewDialog');
                    ipcMain.once('containerData', (event, arg) => {
                        if(utils.isTrue(arg)) {
                            // saveDataToFile(arg);
                        }
                    });
                }
            },
        ]
    },
    {
        label: 'Edit',
        submenu: [
            {
                label: "Undo",
                accelerator: "CmdOrCtrl+Z",
                click: () => {}
            },
            {
                label: "Redo",
                accelerator: "Shift+CmdOrCtrl+Z",
                click: () => {}
            },
            { type: "separator" as const },
            {
                label: "Cut",
                accelerator: "CmdOrCtrl+X",
                click: () => {}
            },
            {
                label: "Copy",
                accelerator: "CmdOrCtrl+C",
                click: () => {}
            },
            {
                label: "Paste",
                accelerator: "CmdOrCtrl+V",
                click: () => {}
            },
            {
                label: "Select All",
                accelerator: "CmdOrCtrl+A",
                click: () => {}
            }
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

