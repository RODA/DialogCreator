import { BrowserWindow, dialog, ipcMain } from "electron";

import { utils } from "../../library/utils";
import { DBElements } from "../../interfaces/database";
import type { DialogChildWindowArgs } from "../../core/host/dialogChildWindow";
import { elementCatalog } from "../catalog/sqliteElementCatalog";
import type { ElectronDialogDocumentSession } from "../document/electronDialogDocumentSession";
import type { SyntaxPanelWindowHost } from "../windows/syntaxPanelWindow";

type WindowIdMap = { [key: string]: number };

type ElectronIpcRouterOptions = {
    windowIds: WindowIdMap;
    getEditorWindow: () => BrowserWindow;
    getSecondWindow: () => BrowserWindow;
    createSecondWindow: (args: DialogChildWindowArgs) => void;
    syntaxPanelHost: () => SyntaxPanelWindowHost;
    documentSession: () => ElectronDialogDocumentSession;
};

export function installElectronIpcRouter(options: ElectronIpcRouterOptions): void {
    ipcMain.on("send-to", async (_event, window, channel, ...args) => {
        if (window == "main") {
            await handleMainChannel(options, channel, args);
            return;
        }

        if (window == "all") {
            BrowserWindow.getAllWindows().forEach((win) => {
                win.webContents.send(`message-from-main-${channel}`, ...args);
            });
            return;
        }

        const win = BrowserWindow.fromId(options.windowIds[window]);
        if (win && !win.isDestroyed() && !win.webContents.isDestroyed()) {
            win.webContents.send(`message-from-main-${channel}`, ...args);
        }
    });
}

async function handleMainChannel(
    options: ElectronIpcRouterOptions,
    channel: string,
    args: unknown[]
): Promise<void> {
    const editorWindow = options.getEditorWindow();

    switch (channel) {
        case 'showError':
            dialog.showMessageBox(editorWindow, {
                type: "error",
                title: "Error",
                message: String(args[0] ?? '')
            });
            break;
        case 'showDialogMessage':
            dialog.showMessageBox(editorWindow, {
                type: args[0] as Electron.MessageBoxOptions['type'],
                message: String(args[1] ?? ''),
                detail: String(args[2] ?? ''),
                title: String(args[1] ?? '')
            });
            break;
        case 'openSyntaxPanel':
            openSyntaxPanel(options, args);
            break;
        case 'syntaxpanel-resize':
            try {
                options.syntaxPanelHost().resize(args[0]);
            } catch { /* noop */ }
            break;
        case 'secondWindow':
            options.createSecondWindow(args[0] as DialogChildWindowArgs);
            break;
        case 'getProperties':
            await sendElementProperties(args[0] as keyof DBElements);
            break;
        case 'resetProperties':
            await resetElementProperties(options, args[0] as keyof DBElements);
            break;
        case 'updateProperty':
            await updateElementProperty(options, args);
            break;
        case 'close-secondWindow':
        case 'close-codeWindow':
        case 'close-previewWindow':
            closeSecondWindow(options);
            break;
        case 'document-json-updated':
            options.documentSession().handleDocumentJsonUpdated(String(args[0] ?? ''));
            break;
        default:
            break;
    }
}

function openSyntaxPanel(options: ElectronIpcRouterOptions, args: unknown[]): void {
    try {
        const command = String(args[0] ?? '');
        options.syntaxPanelHost().open(command);
    } catch (e: any) {
        dialog.showErrorBox('Syntax panel error', String(e && e.message ? e.message : e));
    }
}

async function sendElementProperties(element: keyof DBElements): Promise<void> {
    const properties = await elementCatalog.getProperties(element);
    BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send("message-from-main-propertiesFromDB", element, properties);
    });
}

async function resetElementProperties(
    options: ElectronIpcRouterOptions,
    element: keyof DBElements
): Promise<void> {
    const properties = await elementCatalog.resetProperties(element);
    if (utils.isFalse(properties)) {
        dialog.showErrorBox("Error", `Failed to reset properties of ${element}`);
        return;
    }

    const secondWindow = options.getSecondWindow();
    const editorWindow = options.getEditorWindow();

    secondWindow.webContents.send(
        "message-from-main-resetOK",
        properties
    );
    editorWindow.webContents.send(
        "message-from-main-propertiesFromDB",
        element,
        properties
    );
}

async function updateElementProperty(
    options: ElectronIpcRouterOptions,
    args: unknown[]
): Promise<void> {
    const element = args[0] as keyof DBElements;
    const property = String(args[1] ?? '');
    const value = String(args[2] ?? '');
    const ok = await elementCatalog.updateProperty(element, property, value);

    if (ok) {
        const properties = await elementCatalog.getProperties(element);
        options.getEditorWindow().webContents.send(
            "message-from-main-propertiesFromDB",
            element,
            properties
        );
        return;
    }

    dialog.showErrorBox("Error", `Failed to update property ${property} of ${element}`);
}

function closeSecondWindow(options: ElectronIpcRouterOptions): void {
    const secondWindow = options.getSecondWindow();
    if (secondWindow && !secondWindow.isDestroyed()) {
        secondWindow.close();
    }
}
