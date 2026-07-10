import { app, BrowserWindow } from "electron";
import * as fs from "fs";
import * as path from "path";

export type InfoPage = 'manual' | 'api' | 'about';

type InfoConfig = {
    title: string;
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
    resizable: boolean;
    maximizable: boolean;
    file: string;
};

type OpenInfoWindowOptions = {
    page: InfoPage;
    parent: BrowserWindow;
    compiledRootDir: string;
};

let infoWindow: BrowserWindow | null = null;

function resolveDocPath(fileName: string, compiledRootDir: string): string {
    const packagedCandidates = [
        process.resourcesPath ? path.join(process.resourcesPath, "docs", fileName) : '',
        path.join(app.getAppPath(), "docs", fileName),
        path.join(compiledRootDir, "../docs", fileName)
    ].filter(Boolean) as string[];

    const devCandidates = [
        path.join(compiledRootDir, "../docs", fileName),
        path.join(app.getAppPath(), "docs", fileName)
    ].filter(Boolean) as string[];

    const candidates = app.isPackaged ? packagedCandidates : devCandidates;

    for (const candidate of candidates) {
        try {
            if (fs.existsSync(candidate)) {
                return candidate;
            }
        } catch { /* ignore */ }
    }

    return candidates[0] || path.join(compiledRootDir, "../docs", fileName);
}

function getInfoConfig(page: InfoPage, compiledRootDir: string): InfoConfig {
    switch (page) {
        case 'manual':
            return {
                title: 'Dialog Creator — User Manual',
                width: 1200,
                height: 780,
                minWidth: 900,
                minHeight: 640,
                resizable: true,
                maximizable: true,
                file: resolveDocPath("manual.html", compiledRootDir)
            };
        case 'api':
            return {
                title: 'Dialog Creator — API Reference',
                width: 1200,
                height: 780,
                minWidth: 900,
                minHeight: 640,
                resizable: true,
                maximizable: true,
                file: resolveDocPath("api.html", compiledRootDir)
            };
        case 'about':
        default:
            return {
                title: 'About Dialog Creator',
                width: 420,
                height: 325,
                minWidth: 420,
                minHeight: 325,
                resizable: false,
                maximizable: false,
                file: path.join(compiledRootDir, "../src/pages", "about.html")
            };
    }
}

export function openInfoWindow(options: OpenInfoWindowOptions): void {
    const config = getInfoConfig(options.page, options.compiledRootDir);

    const ensureWindow = function() {
        if (infoWindow && !infoWindow.isDestroyed()) {
            return infoWindow;
        }

        const win = new BrowserWindow({
            width: config.width,
            height: config.height,
            useContentSize: true,
            resizable: config.resizable,
            minimizable: false,
            maximizable: config.maximizable,
            autoHideMenuBar: true,
            parent: options.parent,
            title: config.title,
            center: true,
            webPreferences: {
                contextIsolation: true,
                sandbox: false,
                additionalArguments: ['--dc-window=infoWindow']
            }
        });

        win.on('closed', () => {
            infoWindow = null;
        });
        infoWindow = win;

        if (typeof config.minWidth === 'number' && typeof config.minHeight === 'number') {
            try {
                win.setMinimumSize(config.minWidth, config.minHeight);
            } catch {
                // ignore if platform rejects the constraint
            }
        }

        return win;
    };

    const win = ensureWindow();

    if (win.isDestroyed()) {
        infoWindow = null;
        return openInfoWindow(options);
    }

    try {
        win.setResizable(config.resizable);
        win.setMaximizable(config.maximizable);

        if (typeof config.minWidth === 'number' && typeof config.minHeight === 'number') {
            win.setMinimumSize(config.minWidth, config.minHeight);
        }

        const [curW, curH] = win.getSize();
        if (curW !== config.width || curH !== config.height) {
            win.setSize(config.width, config.height);
            try {
                win.center();
            } catch {
                // ignore if centering is not possible
            }
        }

        win.setTitle(config.title);
    } catch {
        // ignore adjustments if they fail during teardown
    }

    win.loadFile(config.file).catch(() => {
        // noop when file missing; window stays open
    });

    try {
        win.focus();
    } catch {
        // ignore focus errors
    }
}
