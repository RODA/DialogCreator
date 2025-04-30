// Setting ENVIRONMENT
process.env.NODE_ENV = 'development';
// process.env.NODE_ENV = 'production';

const production = process.env.NODE_ENV === 'production';
const development = process.env.NODE_ENV === 'development';
const OS_Windows = process.platform == 'win32';

import { app, BrowserWindow, dialog, ipcMain, globalShortcut } from "electron";
import * as path from "path";

let editorWindow: BrowserWindow;
let secondWindow: BrowserWindow;

function createMainWindow() {
    editorWindow = new BrowserWindow({
        title: 'Dialog creator',
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, "preload/preloadEditor.js"),
            // TODO -- use webpack to enable this
            sandbox: false
        },
        width: 1200,
        height: 800,
        minWidth: 1200,
        minHeight: 800,
        center: true
    });

    // and load the index.html of the app.
    editorWindow.loadFile(getFilePath("editor.html"));

    // Open the DevTools.
    if (development) {
        editorWindow.webContents.openDevTools();
    }

    // Build menu from template
    // const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu
    // Menu.setApplicationMenu(mainMenu);

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
            nodeIntegration: true, // allows using import { ipcRenderer } from "electron"; directly in renderer
            contextIsolation: true, // protects the context of the window, so that preload is needed (if false, preload is not needed)
            preload: path.join(__dirname, "preload/preloadSecond.js"),
            sandbox: false,
        },
        autoHideMenuBar: development ? false : true,
        resizable: false,
    });


    // and load the index.html of the app.
    secondWindow.loadFile(path.join(__dirname, "../src/pages", args.file));

    // Garbage collection handle
    secondWindow.on('closed', function() {
        if (editorWindow && !editorWindow.isDestroyed()) {
            editorWindow.webContents.send('removeCover');
            consolog('secondWindow closed');
        }
    });

    if (development) {
        // Open the DevTools.
        secondWindow.webContents.openDevTools();
    }


    secondWindow.webContents.on("did-finish-load", () => {
        switch (args.file) {
        case 'defaults.html':
            secondWindow.webContents.send("populateDefaults", args.elements);
            break;
        case 'conditions.html':
            break;
        default:
            break;
        }
        if (editorWindow && !editorWindow.isDestroyed()) {
            editorWindow.webContents.send('addCover');
        }
    });

}

function setupIPC() {

    ipcMain.on('secondWindow', (event, args) => {
        createSecondWindow(args);
    });

    // send condition for validation to container
    ipcMain.on('conditionsCheck', (event, args) => {
        if (editorWindow && !editorWindow.isDestroyed()) {
            editorWindow.webContents.send('conditionsCheck', args);
        }
    });

    ipcMain.on('showDialogMessage', (event, args) => {
        dialog.showMessageBox(editorWindow, {
            type: args.type,
            title: args.title,
            message: args.message,
        })
    });

    ipcMain.on('showError', (event, message) => {
        dialog.showMessageBox(editorWindow, {
            type: "error",
            title: "Error",
            message: message
        });
    });


    ipcMain.on('resize-editorWindow', (event, { width, height }) => {
        editorWindow.setSize(Math.max(width + 560, 1200), Math.max(height + 320, 800));
    });
}


function consolog(x: any) {
    if (editorWindow && !editorWindow.isDestroyed()) {
        editorWindow.webContents.send("consolog", x);
    }
}

async function quitApp() {
    await Promise.all(
        BrowserWindow.getAllWindows().map(win => {
            if (!win.isDestroyed()) win.close();
        })
    );
    app.quit();
}

function getFilePath(file: string) {
    if (development) {
        return path.join(__dirname, "../src/pages", file);
    } else {
        return path.join(__dirname, "pages", file);
    }
}