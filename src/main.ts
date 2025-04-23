// Setting ENVIROMENT
process.env.NODE_ENV = 'development';
// Need this
// process.env.NODE_ENV = 'production';

import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { utils } from "./library/utils";
import * as path from "path";

let editorWindow: BrowserWindow = null;
let conditionsWindow: BrowserWindow = null;

function createMainWindow() {
  // Create the browser window.
  editorWindow = new BrowserWindow({
    title: 'Dialog creator',
    webPreferences: {
      preload: path.join(__dirname, "windows/editor/preloadEditor.js"),
      contextIsolation: process.env.NODE_ENV !== "development",
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
  // TODO -- prod/dev
  editorWindow.loadFile(path.join(__dirname, "../src/windows/editor/windowEditor.html"));

  // Open the DevTools.
  if (process.env.NODE_ENV === 'development') {
    editorWindow.webContents.openDevTools();
  }

  // Build menu from template
  // const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  // Menu.setApplicationMenu(mainMenu);

}

app.whenReady().then(() => {
  createMainWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.


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

type argsType = {id: string, name: string, conditions: string}

function createConditionswWindow(args: argsType) {

  // let iconPath = path.join(__dirname, "../src/assets/icon.png");
  // if (process.env.NODE_ENV !== "development") {
  //     iconPath = path.join(path.resolve(__dirname), "../../assets/icon.png");
  // }

  if (conditionsWindow == null || conditionsWindow.isDestroyed()) {
    conditionsWindow = new BrowserWindow({
      width: 640,
      height: 310,
      title: 'Conditions for element: ' + args.name,
      // icon: iconPath,
      parent: editorWindow,
      backgroundColor: "#fff",
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: process.env.NODE_ENV !== "development" ? true : false,
        sandbox: false,
        preload: path.join(__dirname, "../windows/conditions/preloadConditions.js"),
      },
      autoHideMenuBar: true,
      resizable: false,
    });

    conditionsWindow.loadFile(
      path.join(
        __dirname,
        "../src/windows/conditions/windowConditions.html"
      )
    );

    // Garbage collection handle
    conditionsWindow.on('closed', function(){
        conditionsWindow = null;
    });

    if (process.env.NODE_ENV !== "development") {
      conditionsWindow.removeMenu();
    }

    if (process.env.NODE_ENV === "development") {
        // Open the DevTools.
        // secondWindow.webContents.openDevTools();
    }

    // no menu
    conditionsWindow.setMenu(null);

  } else {
      conditionsWindow.focus();
  }
}


ipcMain.on('conditionsData', (event, args) => {
  createConditionswWindow(args);
});

// send condition for validation to container
ipcMain.on('conditionsCheck', (event, args) => {
  editorWindow.webContents.send('conditionsCheck', args);
});

// send back the response
ipcMain.on('conditionsValid', (event, args) => {
    conditionsWindow.webContents.send('conditionsValid', args);
});

ipcMain.on('closeConditionsWindow', (event, arg) => {
  if (conditionsWindow) {
    conditionsWindow.close();
  }
});
