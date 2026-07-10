import { app, BrowserWindow, dialog, MenuItemConstructorOptions } from "electron";
import * as fs from "fs";
import * as path from "path";

import {
    createDialogPackage,
    isDialogDirectoryPath,
    isDialogPackagePath,
    readDialogDirectory,
    readDialogPackage,
    writeDialogDirectory
} from "../filesystem/electronDialogFileStore";
import {
    dialogNameFromJson,
    validateDialogJsonForSave
} from "../../core/document/dialogDocumentRules";
import { requestEditorDialogJson } from "./electronEditorDocumentBridge";
import {
    clearRecentDialogPaths as clearStoredRecentDialogPaths,
    loadRecentDialogPaths,
    rememberRecentDialogPath
} from "../filesystem/recentDialogStore";

type ElectronDialogDocumentSessionOptions = {
    getEditorWindow: () => BrowserWindow;
    isMac: boolean;
    onMenuNeedsRebuild: () => void;
    openInfoWindow: (page: 'manual' | 'api' | 'about') => void;
};

const DIALOG_SAVE_FILTERS: Electron.FileFilter[] = [
    { name: 'DialogCreator package', extensions: ['dc.zip'] }
];
const DIALOG_OPEN_FILTERS: Electron.FileFilter[] = [
    { name: 'DialogCreator packages', extensions: ['dc.zip'] }
];

export class ElectronDialogDocumentSession {
    private lastSavedJson = '';
    private currentFilePath: string | null = null;
    private dialogModified = false;
    private pendingCanonicalUpdate = false;
    private quittingInProgress = false;

    constructor(private readonly options: ElectronDialogDocumentSessionOptions) {}

    isQuitting(): boolean {
        return this.quittingInProgress;
    }

    markQuitting(): void {
        this.quittingInProgress = true;
    }

    updateWindowTitle(): void {
        try {
            const editorWindow = this.options.getEditorWindow();
            if (editorWindow && !editorWindow.isDestroyed()) {
                const base = 'Dialog creator';
                const name = this.currentFilePath ? ` — ${path.basename(this.currentFilePath)}` : '';
                const dot = this.dialogModified ? '~ ' : '';
                editorWindow.setTitle(`${dot}${base}${name}`);

                try {
                    if (process.platform === 'darwin') {
                        editorWindow.setDocumentEdited(!!this.dialogModified);
                    }
                } catch { /* noop */ }
            }
        } catch { /* noop */ }
    }

    handleDocumentJsonUpdated(json: string): void {
        try {
            if (this.pendingCanonicalUpdate) {
                this.lastSavedJson = json;
                this.dialogModified = false;
                this.pendingCanonicalUpdate = false;
                this.updateWindowTitle();
                return;
            }

            const same = json === (this.lastSavedJson || '');
            this.dialogModified = !same;
            this.updateWindowTitle();
        } catch {
            // ignore errors computing dirty state
        }
    }

    async loadDialogFromPath(filePath: string): Promise<void> {
        const editorWindow = this.options.getEditorWindow();

        try {
            const content = this.readDialogFromPath(filePath);
            editorWindow.webContents.send('load-dialog-json', content);
            this.pendingCanonicalUpdate = true;
            this.dialogModified = false;
            this.setCurrentDialogPath(filePath);
            this.addRecentDialogPath(filePath);
            this.updateWindowTitle();
        } catch (e: any) {
            dialog.showErrorBox('Load failed', String((e && e.message) ? e.message : e));
        }
    }

    async reloadCurrentDialogFromDisk(): Promise<void> {
        const editorWindow = this.options.getEditorWindow();

        try {
            if (!this.currentFilePath || this.currentFilePath.trim().length === 0) return;
            if (!editorWindow || editorWindow.isDestroyed()) return;

            if (this.dialogModified) {
                const res = await dialog.showMessageBox(editorWindow, {
                    type: 'question',
                    buttons: ['Reload', 'Cancel'],
                    defaultId: 0,
                    cancelId: 1,
                    message: 'Reload this dialog from disk and discard unsaved changes?'
                });

                if (res.response !== 0) return;
            }

            await this.loadDialogFromPath(this.currentFilePath);
        } catch (e: any) {
            dialog.showErrorBox('Reload failed', String((e && e.message) ? e.message : e));
        }
    }

    async confirmQuitIfDirty(): Promise<boolean> {
        try {
            const editorWindow = this.options.getEditorWindow();
            if (!this.dialogModified) return true;
            if (!editorWindow || editorWindow.isDestroyed()) return true;

            const res = await dialog.showMessageBox(editorWindow, {
                type: 'question',
                buttons: ['Save', "Don't Save", 'Cancel'],
                defaultId: 0,
                cancelId: 2,
                message: 'Do you want to save changes to this dialog before quitting?'
            });

            if (res.response === 2) return false;
            if (res.response === 1) return true;

            return this.saveCurrentDialog({ cancelMeansFailure: true });
        } catch {
            return true;
        }
    }

    buildMainMenuTemplate(): MenuItemConstructorOptions[] {
        const fileSubmenu: MenuItemConstructorOptions[] = [
            {
                label: 'New',
                accelerator: 'CommandOrControl+N',
                click: async () => {
                    await this.createNewDialog();
                }
            },
            {
                label: 'Preview',
                accelerator: 'CommandOrControl+P',
                click: () => {
                    this.options.getEditorWindow().webContents.send('previewDialog');
                }
            },
            { type: 'separator' },
            {
                label: 'Load',
                accelerator: 'CommandOrControl+L',
                click: async () => {
                    await this.openDialogFromNativePicker();
                }
            },
            {
                label: 'Reload from disk',
                accelerator: 'CommandOrControl+R',
                enabled: !!this.currentFilePath,
                click: async () => {
                    await this.reloadCurrentDialogFromDisk();
                }
            },
            {
                label: 'Recently used',
                submenu: this.buildRecentDialogsSubmenu()
            },
            {
                label: 'Save',
                accelerator: 'CommandOrControl+S',
                click: async () => {
                    await this.saveCurrentDialog();
                }
            },
            {
                label: 'Save as ...',
                accelerator: 'Shift+CommandOrControl+S',
                click: async () => {
                    await this.saveCurrentDialog({ forceSaveAs: true });
                }
            }
        ];

        if (!this.options.isMac) {
            fileSubmenu.push({ type: 'separator' });
            fileSubmenu.push({ role: 'quit', label: 'Exit' });
        }

        const editMenu: MenuItemConstructorOptions = {
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
        };

        const infoMenu: MenuItemConstructorOptions = {
            label: 'Info',
            submenu: [
                {
                    label: 'User manual',
                    click: () => this.options.openInfoWindow('manual')
                },
                {
                    label: 'API reference',
                    click: () => this.options.openInfoWindow('api')
                },
                ...(!this.options.isMac ? [{
                    label: 'About',
                    click: () => this.options.openInfoWindow('about')
                }] : [])
            ]
        };

        const template: MenuItemConstructorOptions[] = [];

        if (this.options.isMac) {
            template.push({
                label: app.name,
                submenu: [
                    { label: 'About', click: () => this.options.openInfoWindow('about') },
                    { type: 'separator' },
                    { role: 'services' },
                    { type: 'separator' },
                    { role: 'hide' },
                    { role: 'hideOthers' },
                    { role: 'unhide' },
                    { type: 'separator' },
                    { role: 'quit' }
                ]
            });
        }

        template.push({ label: 'File', submenu: fileSubmenu });
        template.push(editMenu);
        template.push(infoMenu);

        return template;
    }

    private readDialogFromPath(filePath: string): string {
        if (isDialogDirectoryPath(filePath)) {
            return readDialogDirectory(filePath);
        }

        if (isDialogPackagePath(filePath)) {
            return readDialogPackage(fs.readFileSync(filePath));
        }

        throw new Error('Unsupported dialog path. Open a .dc.zip package or a dialog directory containing dialog.json and actions.js.');
    }

    private writeDialogToPath(filePath: string, json: string): void {
        validateDialogJsonForSave(json);

        if (isDialogDirectoryPath(filePath)) {
            writeDialogDirectory(filePath, json);
        } else if (isDialogPackagePath(filePath)) {
            fs.writeFileSync(filePath, createDialogPackage(json));
        } else {
            throw new Error('Unsupported save path. Save as a .dc.zip package or into a dialog directory.');
        }
    }

    private defaultDialogSavePath(json?: string): string {
        const dialogName = json ? dialogNameFromJson(json) : '';

        if (this.currentFilePath && this.currentFilePath.trim().length > 0) {
            if (isDialogDirectoryPath(this.currentFilePath)) {
                const parent = path.dirname(this.currentFilePath);
                const name = dialogName || path.basename(this.currentFilePath);
                return path.join(parent, `${name}.dc.zip`);
            }

            const dir = path.dirname(this.currentFilePath);
            const base = dialogName
                || path.basename(this.currentFilePath).replace(/(?:\.dc\.zip|\.[^./\\]+)$/i, '');
            return path.join(dir, `${base}.dc.zip`);
        }

        return `${dialogName || 'dialog'}.dc.zip`;
    }

    private canSaveDirectlyToCurrentPath(): boolean {
        return !!this.currentFilePath &&
            (isDialogPackagePath(this.currentFilePath) || isDialogDirectoryPath(this.currentFilePath));
    }

    private setCurrentDialogPath(filePath: string | null): void {
        this.currentFilePath = filePath;
        this.updateWindowTitle();
        this.options.onMenuNeedsRebuild();
    }

    private addRecentDialogPath(filePath: string): void {
        rememberRecentDialogPath(filePath);
        this.options.onMenuNeedsRebuild();
    }

    private clearRecentDialogPaths(): void {
        clearStoredRecentDialogPaths();
        this.options.onMenuNeedsRebuild();
    }

    private buildRecentDialogsSubmenu(): MenuItemConstructorOptions[] {
        const recents = loadRecentDialogPaths().filter((filePath) => fs.existsSync(filePath));
        if (recents.length === 0) {
            return [
                { label: 'No recent dialogs', enabled: false }
            ];
        }

        const items: MenuItemConstructorOptions[] = recents.map((filePath) => ({
            label: path.basename(filePath),
            sublabel: filePath,
            click: () => {
                void this.loadDialogFromPath(filePath);
            }
        }));

        items.push({ type: 'separator' });
        items.push({
            label: 'Clear menu',
            click: () => {
                this.clearRecentDialogPaths();
            }
        });

        return items;
    }

    private async createNewDialog(): Promise<void> {
        const editorWindow = this.options.getEditorWindow();
        const current = await requestEditorDialogJson(editorWindow);
        const isSame = current && this.lastSavedJson && current === this.lastSavedJson;

        if (!current || !isSame) {
            const shouldContinue = await this.confirmDiscardOrSaveBeforeNew(current);
            if (!shouldContinue) return;
        }

        editorWindow.webContents.send('newDialogClear');
        editorWindow.webContents.send('reset-dialog-properties', {
            name: 'NewDialog',
            title: 'New dialog',
            language: 'en_US',
            runtimeProvider: 'R'
        });
        this.setCurrentDialogPath(null);
        this.pendingCanonicalUpdate = true;
        this.dialogModified = false;
        this.updateWindowTitle();
    }

    private async confirmDiscardOrSaveBeforeNew(current: string): Promise<boolean> {
        const editorWindow = this.options.getEditorWindow();
        const res = await dialog.showMessageBox(editorWindow, {
            type: 'question',
            buttons: ['Save', "Don't Save", 'Cancel'],
            defaultId: 0,
            cancelId: 2,
            message: 'Do you want to save changes to this dialog before creating a new one?'
        });

        if (res.response === 2) return false;
        if (res.response !== 0) return true;

        try {
            const { canceled, filePath } = await dialog.showSaveDialog(editorWindow, {
                title: 'Save dialog',
                filters: DIALOG_SAVE_FILTERS,
                defaultPath: this.defaultDialogSavePath(current)
            });

            if (canceled || !filePath) return false;

            this.writeDialogToPath(filePath, current);
            this.lastSavedJson = current;
            this.setCurrentDialogPath(filePath);
            this.addRecentDialogPath(filePath);
            return true;
        } catch (e: any) {
            dialog.showErrorBox('Save failed', String((e && e.message) ? e.message : e));
            return false;
        }
    }

    private async openDialogFromNativePicker(): Promise<void> {
        const editorWindow = this.options.getEditorWindow();
        const { canceled, filePaths } = await dialog.showOpenDialog(editorWindow, {
            title: 'Load dialog',
            filters: DIALOG_OPEN_FILTERS,
            properties: ['openFile', 'openDirectory']
        });

        if (canceled || !filePaths || filePaths.length === 0) return;
        await this.loadDialogFromPath(filePaths[0]);
    }

    private async saveCurrentDialog(options: {
        forceSaveAs?: boolean;
        cancelMeansFailure?: boolean;
    } = {}): Promise<boolean> {
        const editorWindow = this.options.getEditorWindow();

        try {
            const data = await requestEditorDialogJson(editorWindow);
            if (!options.forceSaveAs && this.canSaveDirectlyToCurrentPath()) {
                this.writeDialogToPath(this.currentFilePath!, data);
                this.lastSavedJson = data;
                this.addRecentDialogPath(this.currentFilePath!);
                this.dialogModified = false;
                this.updateWindowTitle();
                return true;
            }

            const { canceled, filePath } = await dialog.showSaveDialog(editorWindow, {
                title: options.forceSaveAs ? 'Save dialog As...' : 'Save dialog',
                filters: DIALOG_SAVE_FILTERS,
                defaultPath: this.defaultDialogSavePath(data)
            });

            if (canceled || !filePath) return !options.cancelMeansFailure;

            this.writeDialogToPath(filePath, data);
            this.lastSavedJson = data;
            this.setCurrentDialogPath(filePath);
            this.addRecentDialogPath(filePath);
            this.dialogModified = false;
            this.updateWindowTitle();
            return true;
        } catch (e: any) {
            dialog.showErrorBox('Save failed', String((e && e.message) ? e.message : e));
            return false;
        }
    }
}
