
const mainMenu = (app, mainWindow) => {
    const mainMenuTemplate = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New',
                    accelerator: "CommandOrControl+N",
                    click() {
                        mainWindow.webContents.send('newWindow');
                    }
                },
                {
                    label: 'Preview',
                    accelerator: "CommandOrControl+P",
                    click() {
                        mainWindow.webContents.send('previewDialog');
                        ipcMain.once('containerData', (event, arg) => {
                            if (arg != false) {
                                createObjectsWindow(arg);
                            }
                        });
                    }
                },
                { type: "separator" },
                {
                    label: 'Load dialog',
                    accelerator: "CommandOrControl+O",
                    click() {
                        dialog.showOpenDialog(mainWindow, { title: "Load dialog data", filters: [{ name: 'R-GUI-DialogCreator', extensions: ['json'] }], properties: ['openFile'] }, result => {
                            if (result !== void 0) {
                                fs.readFile(result[0], 'utf-8', (err, data) => {
                                    if (err) {
                                        dialog.showMessageBox(mainWindow, { type: 'error', title: 'Could not open the file!', buttons: ['OK'] });
                                    } else {
                                        mainWindow.webContents.send('openFile', data);
                                    }
                                });
                            }
                        });
                    }
                },
                {
                    label: 'Save dialog',
                    accelerator: "CommandOrControl+S",
                    click() {
                        mainWindow.webContents.send('previewDialog');
                        ipcMain.once('containerData', (event, arg) => {
                            if (arg != false) {
                                saveDataToFile(arg);
                            }
                        });
                    }
                },
            ]
        },
        // { role: 'editMenu' }
        {
            label: 'Edit',
            submenu: [
                { label: "Undo", accelerator: "CmdOrCtrl+Z", role: "undo" },
                { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", role: "redo" },
                { type: "separator" },
                { label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut" },
                { label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy" },
                { label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste" },
                { label: "Select All", accelerator: "CmdOrCtrl+A", role: "selectAll" }
            ]
        },
        // { role: 'infoMenu' }
        {
            label: 'Info',
            submenu: [
                {
                    label: 'About',
                    click() {
                        createAboutWindow();
                    }
                },
                {
                    label: 'User manual',
                    click() {
                        createUserManualWindow();
                    }
                }
            ]
        },

    ];

    if (process.platform === 'win32') {
        mainMenuTemplate[0].submenu.push({ type: "separator" });
        mainMenuTemplate[0].submenu.push({
            label: 'Quit',
            accelerator: "CommandOrControl+Q",
            click() {
                app.quit();
            }
        });
    }
    // only electron 5
    app.setName('R-GUI-DialogCreator');
    if (process.platform === 'darwin') {
        // { role: 'appMenu' }  
        mainMenuTemplate.unshift({
            label: app.getName(),
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        });
    }

    // Add developer tools item if not in production
    if (process.env.NODE_ENV !== 'production') {
        mainMenuTemplate.push({
            label: "Developer Tools",
            submenu: [
                {
                    label: "Toggle DevTools",
                    accelerator: "CommandOrControl+I",
                    click(item, focusedWindow) {
                        focusedWindow.toggleDevTools();
                    }
                },
                {
                    role: 'reload'
                }
            ]
        });
    }

    return mainMenuTemplate;
}

export module mainMenu;
