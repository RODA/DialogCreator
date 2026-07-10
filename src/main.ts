/*
    Copyright (c) 2025, Adrian Dusa
    All rights reserved.

    License: Academic Non-Commercial License (see LICENSE file for details).
    SPDX-License-Identifier: LicenseRef-ANCL-AdrianDusa
*/

const production = process.env.NODE_ENV === 'production';
const development = process.env.NODE_ENV === 'development';
const OS_Windows = process.platform == 'win32';
const OS_Linux = process.platform == 'linux';
const OS_Mac = process.platform == 'darwin';

import { app, BrowserWindow, Menu, screen } from "electron";
import { ElectronDialogDocumentSession } from "./shell-electron/document/electronDialogDocumentSession";
import { installElectronIpcRouter } from "./shell-electron/ipc/electronIpcRouter";
import {
    EDITOR_WINDOW_DEFAULT_HEIGHT,
    EDITOR_WINDOW_DEFAULT_WIDTH,
    loadEditorWindowState,
    saveEditorWindowState
} from "./shell-electron/windows/editorWindowState";
import {
    openDialogChildWindow
} from "./shell-electron/windows/dialogChildWindow";
import type { DialogChildWindowArgs } from "./core/host/dialogChildWindow";
import {
    InfoPage,
    openInfoWindow as openElectronInfoWindow
} from "./shell-electron/windows/infoWindow";
import { maybeShowWaylandNotice } from "./shell-electron/platform/waylandNotice";
import { SyntaxPanelWindowHost } from "./shell-electron/windows/syntaxPanelWindow";
import {
    createElectronUpdateService,
    ElectronUpdateService
} from "./shell-electron/updater/electronUpdateService";
import * as path from "path";

// Note: For packaged Linux builds, avoid forcing platform/env vars here. Users on Wayland can launch
// with X11 overrides if needed (e.g., ELECTRON_OZONE_PLATFORM_HINT=x11 OZONE_PLATFORM=x11 XDG_SESSION_TYPE=x11).

let editorWindow: BrowserWindow;
let secondWindow: BrowserWindow;
let syntaxPanelHost: SyntaxPanelWindowHost;
let documentSession: ElectronDialogDocumentSession;
let updateService: ElectronUpdateService;
let lastEditorBounds: Electron.Rectangle | null = null;
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
}

const windowid: { [key: string]: number } = {
    editorWindow: 1,
    secondWindow: 2
}

function reportMainProcessError(error: unknown): void {
    console.error(error instanceof Error ? error.stack : String(error));
}

function rebuildApplicationMenu() {
    if (!app.isReady()) return;
    if (!documentSession) return;
    const mainMenu = Menu.buildFromTemplate(documentSession.buildMainMenuTemplate());
    Menu.setApplicationMenu(mainMenu);
}

function getPreviewWindow() {
    const previewWindow = BrowserWindow.getAllWindows().find((win) => {
        try {
            return win.webContents.getURL().includes('preview.html');
        } catch {
            return false;
        }
    });

    return previewWindow || secondWindow || null;
}

function createMainWindow() {
    const restoredBounds = loadEditorWindowState();
    editorWindow = new BrowserWindow({
        title: 'Dialog creator',
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, "preload/preloadEditor.js"),
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
        icon: path.join(__dirname, 'icons', 'icon.png')
    });

    documentSession = new ElectronDialogDocumentSession({
        getEditorWindow: () => editorWindow,
        isMac: OS_Mac,
        onMenuNeedsRebuild: rebuildApplicationMenu,
        openInfoWindow
    });
    documentSession.updateWindowTitle();
    lastEditorBounds = editorWindow.getBounds();
    syntaxPanelHost = new SyntaxPanelWindowHost({
        compiledRootDir: __dirname,
        getEditorWindow: () => editorWindow,
        getPreviewWindow
    });
    updateService = createElectronUpdateService({
        app,
        enabled: process.env.NODE_ENV !== 'test',
        getMainWindow: () => editorWindow,
        reportError: reportMainProcessError
    });

    // and load the index.html of the app.
    editorWindow.loadFile(path.join(__dirname, "../src/pages/editor.html"));
    editorWindow.webContents.once('did-finish-load', () => {
        updateService.checkForUpdates();
    });

    // Build and set the application menu dynamically per platform (macOS vs Windows/Linux)
    rebuildApplicationMenu();

    // Handle window close button (red X)
    editorWindow.on('close', async (e) => {
        if (documentSession.isQuitting()) return; // allow close to proceed during app quit

        e.preventDefault(); // Prevent default close

        const ok = await documentSession.confirmQuitIfDirty();
        if (ok) {
            documentSession.markQuitting();
            app.quit(); // This will close all windows and quit the app
        }
        // If not ok, window stays open (close was cancelled)
    });

    // Open the DevTools.
    if (development) {
        try {
            editorWindow.webContents.openDevTools({ mode: 'detach', activate: false } as any);
            const dt = editorWindow.webContents.devToolsWebContents;
            if (dt) {
                dt.once('did-finish-load', () => {
                    try { editorWindow.focus(); editorWindow.webContents.focus(); } catch { /* noop */ }
                });
            }
        } catch {
            editorWindow.webContents.openDevTools({ mode: 'detach' } as any);
        }
        // Refocus the editor window after DevTools opens; add a couple passes for slower starts
        const refocus = () => {
            try { editorWindow.focus(); editorWindow.webContents.focus(); } catch { /* noop */ }
        };

        setTimeout(refocus, 600);
    }

    // Keep child windows (preview/syntax) in sync when the editor moves (Linux lacks implicit parenting)
    const syncChildrenOnMove = () => {
        try {
            if (!editorWindow || editorWindow.isDestroyed()) return;
            const curr = editorWindow.getBounds();
            if (!lastEditorBounds) {
                lastEditorBounds = curr;
                return;
            }
            const dx = curr.x - lastEditorBounds.x;
            const dy = curr.y - lastEditorBounds.y;
            if (dx === 0 && dy === 0) {
                lastEditorBounds = curr;
                return;
            }

            const nudge = (win: BrowserWindow | null) => {
                if (!win || win.isDestroyed()) return;
                const b = win.getBounds();
                win.setBounds({ x: b.x + dx, y: b.y + dy, width: b.width, height: b.height }, false);
            };

            if (secondWindow && !secondWindow.isDestroyed()) {
                try {
                    const url = secondWindow.webContents.getURL();
                    if (url.includes('preview.html')) {
                        nudge(secondWindow);
                    }
                } catch { /* noop */ }
            }

            syntaxPanelHost?.nudge(dx, dy);

            lastEditorBounds = curr;
        } catch { /* noop */ }
    };

    editorWindow.on('move', syncChildrenOnMove);
    editorWindow.on('moved', syncChildrenOnMove);
    editorWindow.on('resize', () => saveEditorWindowState(editorWindow));
    editorWindow.on('moved', () => saveEditorWindowState(editorWindow));
    editorWindow.on('close', () => saveEditorWindowState(editorWindow));
}

app.whenReady().then(() => {
    maybeShowWaylandNotice();
    createMainWindow();
    installElectronIpcRouter({
        windowIds: windowid,
        getEditorWindow: () => editorWindow,
        getSecondWindow: () => secondWindow,
        createSecondWindow,
        syntaxPanelHost: () => syntaxPanelHost,
        documentSession: () => documentSession,
        updateService: () => updateService
    });
    // Intercept OS-level quits (e.g., Cmd+Q) to prompt for save when dirty
    app.on('before-quit', (e) => {
        if (documentSession.isQuitting()) return; // allow actual quit to proceed

        e.preventDefault(); // Always prevent default first

        documentSession.confirmQuitIfDirty()
            .then((ok) => {
                if (ok) {
                    documentSession.markQuitting();
                    app.quit(); // Trigger quit again, this time it will proceed
                }
                // If not ok, stay in app (quit was cancelled)
            })
            .catch(() => {
                // On error, allow quit
                documentSession.markQuitting();
                app.quit();
            });
    });
});

app.on("window-all-closed", () => {
    quitApp()
});

function createSecondWindow(args: DialogChildWindowArgs) {
    secondWindow = openDialogChildWindow({
        args,
        parent: editorWindow,
        compiledRootDir: __dirname,
        development,
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

    windowid.secondWindow = secondWindow.id;
}

function openInfoWindow(page: InfoPage) {
    openElectronInfoWindow({
        page,
        parent: editorWindow,
        compiledRootDir: __dirname
    });
}

function quitApp() {
    app.quit();
}
