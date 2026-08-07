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

import { app, BrowserWindow } from "electron";
import { ElectronDialogDocumentSession } from "./shell-electron/document/electronDialogDocumentSession";
import { installElectronIpcRouter } from "./shell-electron/ipc/electronIpcRouter";
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
import { SecondWindowHost } from "./shell-electron/windows/secondWindowHost";
import { EditorWindowHost } from "./shell-electron/windows/editorWindowHost";
import {
    handleEditorWindowCloseRequest,
    installElectronQuitConfirmation
} from "./shell-electron/lifecycle/electronQuitConfirmation";
import { ElectronApplicationMenuHost } from "./shell-electron/menus/electronApplicationMenu";

// Note: For packaged Linux builds, avoid forcing platform/env vars here. Users on Wayland can launch
// with X11 overrides if needed (e.g., ELECTRON_OZONE_PLATFORM_HINT=x11 OZONE_PLATFORM=x11 XDG_SESSION_TYPE=x11).

let editorWindow: BrowserWindow;
let editorWindowHost: EditorWindowHost;
let secondWindowHost: SecondWindowHost;
let syntaxPanelHost: SyntaxPanelWindowHost;
let documentSession: ElectronDialogDocumentSession;
let updateService: ElectronUpdateService;
let applicationMenuHost: ElectronApplicationMenuHost;
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

function createMainWindow() {
    applicationMenuHost = new ElectronApplicationMenuHost({
        app,
        getSession: () => documentSession || null
    });
    updateService = createElectronUpdateService({
        app,
        enabled: process.env.NODE_ENV !== 'test',
        getMainWindow: () => editorWindow,
        reportError: reportMainProcessError
    });
    editorWindowHost = new EditorWindowHost({
        compiledRootDir: __dirname,
        development,
        onCloseRequested: handleEditorWindowClose,
        onDidFinishLoad: () => {
            updateService.checkForUpdates();
        },
        onMoveChildren: (dx, dy) => {
            secondWindowHost?.nudgePreview(dx, dy);
            syntaxPanelHost?.nudge(dx, dy);
        }
    });
    editorWindow = editorWindowHost.create();

    documentSession = new ElectronDialogDocumentSession({
        getEditorWindow: () => editorWindow,
        isMac: OS_Mac,
        onMenuNeedsRebuild: () => applicationMenuHost.rebuild(),
        openInfoWindow
    });
    documentSession.updateWindowTitle();
    secondWindowHost = new SecondWindowHost({
        compiledRootDir: __dirname,
        development,
        getEditorWindow: () => editorWindow,
        windowIds: windowid
    });
    syntaxPanelHost = new SyntaxPanelWindowHost({
        compiledRootDir: __dirname,
        getEditorWindow: () => editorWindow,
        getPreviewWindow: () => secondWindowHost.getPreviewWindow()
    });

    // Build and set the application menu dynamically per platform (macOS vs Windows/Linux)
    applicationMenuHost.rebuild();
}

async function handleEditorWindowClose(event: Electron.Event): Promise<void> {
    await handleEditorWindowCloseRequest(app, documentSession, event);
}

app.whenReady().then(() => {
    maybeShowWaylandNotice();
    createMainWindow();
    installElectronIpcRouter({
        windowIds: windowid,
        getEditorWindow: () => editorWindow,
        getSecondWindow: () => secondWindowHost.getSecondWindow(),
        createSecondWindow: (args) => secondWindowHost.open(args),
        syntaxPanelHost: () => syntaxPanelHost,
        documentSession: () => documentSession,
        updateService: () => updateService
    });
    installElectronQuitConfirmation(app, () => documentSession);
});

app.on("window-all-closed", () => {
    quitApp()
});

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
