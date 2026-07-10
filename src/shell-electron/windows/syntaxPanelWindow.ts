import { BrowserWindow } from "electron";
import * as path from "path";

type SyntaxPanelWindowOptions = {
    compiledRootDir: string;
    getEditorWindow: () => BrowserWindow;
    getPreviewWindow: () => BrowserWindow | null;
};

export class SyntaxPanelWindowHost {
    private syntaxPanelWindow: BrowserWindow | null = null;
    private syntaxPanelAnchor: BrowserWindow | null = null;
    private syntaxPanelHeight = 160;
    private syntaxPanelFollowTimer: NodeJS.Timeout | null = null;
    private readonly syntaxGap = 8;

    constructor(private readonly options: SyntaxPanelWindowOptions) {}

    open(command: string): void {
        const clearFollowTimer = () => {
            if (this.syntaxPanelFollowTimer) {
                clearInterval(this.syntaxPanelFollowTimer);
                this.syntaxPanelFollowTimer = null;
            }
        };

        const anchor = this.options.getPreviewWindow() || this.options.getEditorWindow();
        const getAnchorPos = () => {
            const winBounds = anchor.getBounds();
            const contentBounds = (anchor as any).getContentBounds
                ? (anchor as any).getContentBounds()
                : winBounds;
            const dx = contentBounds.x - winBounds.x;
            const dy = contentBounds.y - winBounds.y;
            const desiredWidth = Math.max(200, contentBounds.width);

            return {
                desiredWidth,
                desiredHeight: this.syntaxPanelHeight,
                desiredX: Math.max(0, winBounds.x + dx),
                desiredY: winBounds.y + dy + contentBounds.height + this.syntaxGap
            };
        };

        const pos = getAnchorPos();

        if (!this.syntaxPanelWindow || this.syntaxPanelWindow.isDestroyed()) {
            this.syntaxPanelWindow = new BrowserWindow({
                parent: anchor,
                width: pos.desiredWidth,
                height: pos.desiredHeight,
                x: pos.desiredX,
                y: pos.desiredY,
                useContentSize: true,
                resizable: false,
                minimizable: false,
                maximizable: false,
                fullscreenable: false,
                frame: false,
                skipTaskbar: true,
                title: 'Syntax Panel',
                webPreferences: {
                    contextIsolation: true,
                    preload: path.join(this.options.compiledRootDir, 'preload', 'preloadSyntaxPanel.js'),
                    sandbox: false,
                    additionalArguments: ['--dc-window=syntaxPanelWindow']
                },
                autoHideMenuBar: true,
            });

            this.syntaxPanelWindow.loadFile(
                path.join(this.options.compiledRootDir, "../src/pages", 'syntaxpanel.html')
            );

            this.syntaxPanelWindow.on('closed', () => {
                const anchorToClose = this.syntaxPanelAnchor;
                this.syntaxPanelWindow = null;
                try {
                    if (anchorToClose && !anchorToClose.isDestroyed()) {
                        anchorToClose.close();
                    }
                } catch { /* noop */ }
            });
        }

        try {
            this.syntaxPanelWindow.setPosition(pos.desiredX, pos.desiredY);
            this.syntaxPanelWindow.setContentSize(pos.desiredWidth, pos.desiredHeight);
        } catch {}

        if (anchor !== this.syntaxPanelAnchor) {
            this.syntaxPanelAnchor?.removeAllListeners('move');
            this.syntaxPanelAnchor?.removeAllListeners('resize');
            this.syntaxPanelAnchor?.removeAllListeners('closed');
            clearFollowTimer();
            this.syntaxPanelAnchor = anchor;

            const reposition = () => {
                try {
                    const p = getAnchorPos();
                    this.syntaxPanelWindow?.setPosition(p.desiredX, p.desiredY);
                    this.syntaxPanelWindow?.setContentSize(p.desiredWidth, p.desiredHeight);
                } catch {}
            };

            anchor.on('move', reposition);
            anchor.on('moved', reposition);
            anchor.on('resize', reposition);
            anchor.on('closed', () => {
                clearFollowTimer();
                try { this.syntaxPanelWindow?.close(); } catch {}
            });

            this.syntaxPanelFollowTimer = setInterval(() => {
                try {
                    const p = getAnchorPos();
                    this.syntaxPanelWindow?.setPosition(p.desiredX, p.desiredY);
                    this.syntaxPanelWindow?.setContentSize(p.desiredWidth, p.desiredHeight);
                } catch { /* noop */ }
            }, 150);
        }

        if (this.syntaxPanelWindow && !this.syntaxPanelWindow.webContents.isLoadingMainFrame()) {
            this.syntaxPanelWindow.webContents.send('renderSyntaxCommand', command);
        } else {
            this.syntaxPanelWindow?.webContents.once('did-finish-load', () => {
                this.syntaxPanelWindow?.webContents.send('renderSyntaxCommand', command);
            });
        }
    }

    resize(payload: unknown): void {
        const requestedHeight = Number(((payload as any) && (payload as any).height) ?? payload ?? 0);
        if (!Number.isFinite(requestedHeight) || requestedHeight <= 0) return;

        this.syntaxPanelHeight = Math.max(40, Math.min(1000, Math.round(requestedHeight)));

        if (!this.syntaxPanelWindow || this.syntaxPanelWindow.isDestroyed()) {
            return;
        }

        let width = 320;
        try {
            const anchorWin = this.syntaxPanelAnchor || this.options.getPreviewWindow() || this.options.getEditorWindow();
            const winBounds = anchorWin.getBounds();
            const contentBounds = (anchorWin as any).getContentBounds
                ? (anchorWin as any).getContentBounds()
                : winBounds;
            const dx = contentBounds.x - winBounds.x;
            const dy = contentBounds.y - winBounds.y;

            width = Math.max(200, contentBounds.width);
            this.syntaxPanelWindow.setPosition(
                Math.max(0, winBounds.x + dx),
                winBounds.y + dy + contentBounds.height + this.syntaxGap
            );
        } catch { /* keep current position */ }

        this.syntaxPanelWindow.setContentSize(width, this.syntaxPanelHeight);
    }

    nudge(dx: number, dy: number): void {
        const win = this.syntaxPanelWindow;
        if (!win || win.isDestroyed()) return;

        const bounds = win.getBounds();
        win.setBounds({
            x: bounds.x + dx,
            y: bounds.y + dy,
            width: bounds.width,
            height: bounds.height
        }, false);
    }
}
