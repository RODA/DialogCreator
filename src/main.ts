// Setting ENVIROMENT
process.env.NODE_ENV = 'development';
// Need this
// process.env.NODE_ENV = 'production';

import { app, BrowserWindow, dialog, ipcMain } from "electron";
import * as path from "path";

let mainWindow: BrowserWindow;

function createMainWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
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
  mainWindow.loadFile(path.join(__dirname, "../src/windows/editor/windowEditor.html"));

  // Open the DevTools.
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
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
  dialog.showMessageBox(mainWindow, {
    type: args.type,
    title: args.title,
    message: args.message,
  })
});
