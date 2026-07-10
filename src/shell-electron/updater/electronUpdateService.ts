import type {
    App,
    BrowserWindow
} from "electron";
import {
    autoUpdater as electronAutoUpdater
} from "electron-updater";
import type {
    AppUpdater,
    ProgressInfo,
    UpdateInfo
} from "electron-updater";

type UpdateButtonMode = "available" | "downloading" | "downloaded" | "hidden";

export interface ElectronUpdateState {
    mode: UpdateButtonMode;
    percent: number;
    version: string;
}

export interface ElectronUpdateServiceOptions {
    app: App;
    enabled: boolean;
    getMainWindow(): BrowserWindow | null;
    reportError(error: unknown): void;
}

export interface ElectronUpdateService {
    checkForUpdates(): void;
    handleUpdateButton(): void;
}

const channel = "dialogcreator-updater-state";
const rendererChannel = `message-from-main-${channel}`;

const formatVersion = function(info: UpdateInfo | null): string {
    return String(info?.version || "").trim();
};

const isMissingUpdateMetadataError = function(error: unknown): boolean {
    const message = String(
        error instanceof Error
            ? `${error.name} ${error.message}`
            : error || ""
    ).toLowerCase();

    const referencesUpdateMetadata = message.includes("latest.yml")
        || message.includes("latest-mac.yml")
        || message.includes("latest-linux.yml")
        || message.includes("app-update.yml")
        || message.includes("channel file");
    const indicatesMissing = message.includes("status 404")
        || message.includes(" 404")
        || message.includes("not found")
        || message.includes("enoent")
        || message.includes("cannot find channel");

    return referencesUpdateMetadata && indicatesMissing;
};

export const createElectronUpdateService = function(
    options: ElectronUpdateServiceOptions
): ElectronUpdateService {
    const autoUpdater: AppUpdater = electronAutoUpdater;
    let checking = false;
    let downloading = false;
    let downloaded = false;
    let installRequested = false;
    let availableInfo: UpdateInfo | null = null;
    let progressTitleRestore: string | null = null;

    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;

    const sendState = function(state: ElectronUpdateState): void {
        const win = options.getMainWindow();
        if (!win || win.isDestroyed() || win.webContents.isDestroyed()) {
            return;
        }

        win.webContents.send(rendererChannel, state);
    };

    const hideButton = function(): void {
        sendState({
            mode: "hidden",
            percent: 0,
            version: ""
        });
    };

    const setProgress = function(percent: number): void {
        const normalizedPercent = Math.max(0, Math.min(100, percent || 0));
        const win = options.getMainWindow();

        sendState({
            mode: "downloading",
            percent: normalizedPercent,
            version: formatVersion(availableInfo)
        });

        if (!win || win.isDestroyed()) {
            return;
        }

        if (progressTitleRestore === null) {
            progressTitleRestore = win.getTitle();
        }

        win.setProgressBar(normalizedPercent / 100);
    };

    const clearProgress = function(): void {
        const win = options.getMainWindow();

        if (!win || win.isDestroyed()) {
            progressTitleRestore = null;
            return;
        }

        win.setProgressBar(-1);
        if (progressTitleRestore !== null) {
            win.setTitle(progressTitleRestore);
        }
        progressTitleRestore = null;
    };

    const showAvailable = function(info: UpdateInfo): void {
        availableInfo = info;
        downloaded = false;
        downloading = false;

        sendState({
            mode: "available",
            percent: 0,
            version: formatVersion(info)
        });
    };

    const showDownloaded = function(info: UpdateInfo): void {
        availableInfo = info;
        downloaded = true;
        downloading = false;
        clearProgress();

        sendState({
            mode: "downloaded",
            percent: 100,
            version: formatVersion(info)
        });
    };

    const downloadUpdate = async function(): Promise<void> {
        if (downloading || downloaded || !availableInfo) {
            return;
        }

        downloading = true;
        setProgress(0);
        await autoUpdater.downloadUpdate();
    };

    const installUpdate = function(): void {
        if (!downloaded || installRequested) {
            return;
        }

        installRequested = true;
        autoUpdater.quitAndInstall();
    };

    autoUpdater.on("update-available", (info) => {
        showAvailable(info);
    });

    autoUpdater.on("update-not-available", () => {
        hideButton();
    });

    autoUpdater.on("update-downloaded", (info) => {
        showDownloaded(info);
    });

    autoUpdater.on("download-progress", (progress: ProgressInfo) => {
        setProgress(progress.percent || 0);
    });

    autoUpdater.on("error", (error) => {
        checking = false;
        downloading = false;
        installRequested = false;
        clearProgress();
        hideButton();

        if (isMissingUpdateMetadataError(error)) {
            return;
        }

        options.reportError(error);
    });

    return {
        checkForUpdates: function(): void {
            if (!options.enabled
                || !options.app.isPackaged
                || checking
                || downloading
                || downloaded) {
                return;
            }

            checking = true;
            void autoUpdater.checkForUpdates()
                .catch((error) => {
                    if (isMissingUpdateMetadataError(error)) {
                        return;
                    }

                    options.reportError(error);
                })
                .finally(() => {
                    checking = false;
                });
        },

        handleUpdateButton: function(): void {
            if (downloaded) {
                installUpdate();
                return;
            }

            void downloadUpdate().catch((error) => {
                downloading = false;
                clearProgress();
                if (availableInfo) {
                    showAvailable(availableInfo);
                } else {
                    hideButton();
                }
                options.reportError(error);
            });
        }
    };
};
