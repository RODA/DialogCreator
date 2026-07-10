import { createBrowserRendererTransport } from './browserRendererTransport';
import {
    createBrowserDialogPackage,
    readBrowserDialogPackage
} from './browserDialogFileStore';
import { createStaticElementCatalog } from './staticElementCatalog';

export interface BrowserComposition {
    transport: ReturnType<typeof createBrowserRendererTransport>;
    catalog: ReturnType<typeof createStaticElementCatalog>;
    files: {
        createPackage: typeof createBrowserDialogPackage;
        readPackage: typeof readBrowserDialogPackage;
    };
}

type BrowserInfoPage = 'manual' | 'api' | 'about';

type BrowserInfoConfig = {
    title: string;
    src: string;
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
    resizable: boolean;
};

export function createBrowserComposition(): BrowserComposition {
    return {
        transport: createBrowserRendererTransport(),
        catalog: createStaticElementCatalog(),
        files: {
            createPackage: createBrowserDialogPackage,
            readPackage: readBrowserDialogPackage
        }
    };
}

export function mountBrowserComposition(): BrowserComposition {
    const composition = createBrowserComposition();

    Object.assign(window, {
        dialogCreatorBrowserHost: composition
    });

    return composition;
}

function getEditorFrameWindow(): Window | null {
    const frame = document.getElementById('dialogcreator-browser-frame') as HTMLIFrameElement | null;
    return frame?.contentWindow || null;
}

function closeEditorPanel(): void {
    getEditorFrameWindow()?.postMessage({ type: 'dialogcreator-close-browser-panel' }, '*');
}

function sendEditorCommand(command: string, data?: unknown): Promise<unknown> {
    const frameWindow = getEditorFrameWindow();

    if (!frameWindow) {
        return Promise.reject(new Error('Editor is not ready.'));
    }

    const requestId = `browser-command-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            window.removeEventListener('message', onMessage);
            reject(new Error(`Timed out waiting for editor command ${command}.`));
        }, 5000);

        const onMessage = function(event: MessageEvent): void {
            const message = event.data as {
                type?: unknown;
                requestId?: unknown;
                ok?: unknown;
                result?: unknown;
                reason?: unknown;
            };

            if (
                message?.type !== 'dialogcreator-browser-command-result' ||
                message.requestId !== requestId
            ) {
                return;
            }

            clearTimeout(timeout);
            window.removeEventListener('message', onMessage);

            if (message.ok) {
                resolve(message.result);
            } else {
                reject(new Error(String(message.reason || 'Editor command failed.')));
            }
        };

        window.addEventListener('message', onMessage);
        frameWindow.postMessage({
            type: 'dialogcreator-browser-command',
            requestId,
            command,
            data
        }, '*');
    });
}

function setBrowserStatus(message: string): void {
    const status = document.getElementById('dialogcreator-browser-status');
    if (status) {
        status.textContent = message;
    }
}

function downloadDialogPackage(fileName: string, blob: Blob): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function closeOpenMenus(): void {
    document.querySelectorAll<HTMLElement>('[data-menu-root].is-open').forEach((root) => {
        root.classList.remove('is-open');
        root.querySelector<HTMLButtonElement>('.web-menu-button')?.setAttribute('aria-expanded', 'false');
    });
}

function installMenuPopups(): void {
    document.querySelectorAll<HTMLElement>('[data-menu-root]').forEach((root) => {
        const button = root.querySelector<HTMLButtonElement>('.web-menu-button');
        if (!button) {
            return;
        }

        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const isOpen = root.classList.contains('is-open');
            closeOpenMenus();

            if (!isOpen) {
                root.classList.add('is-open');
                button.setAttribute('aria-expanded', 'true');
            }
        });
    });

    document.addEventListener('pointerdown', (event) => {
        const target = event.target as HTMLElement | null;
        if (!target?.closest('[data-menu-root]')) {
            closeOpenMenus();
        }
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeOpenMenus();
            closeEditorPanel();
            removeBrowserInfoWindow();
        }
    }, true);

    document.querySelectorAll('.web-menu-item').forEach((item) => {
        item.addEventListener('click', () => closeOpenMenus());
    });
}

function focusEditorFrame(): void {
    const frame = document.getElementById('dialogcreator-browser-frame') as HTMLIFrameElement | null;
    frame?.contentWindow?.focus();
}

function installEditMenu(): void {
    document.querySelectorAll<HTMLButtonElement>('[data-browser-edit-command]').forEach((button) => {
        button.addEventListener('click', () => {
            focusEditorFrame();
            const command = String(button.dataset.browserEditCommand || '');
            document.execCommand(command);
        });
    });
}

function installInfoMenu(): void {
    document.querySelectorAll<HTMLButtonElement>('[data-browser-info-command]').forEach((button) => {
        button.addEventListener('click', () => {
            const command = String(button.dataset.browserInfoCommand || '') as BrowserInfoPage;
            openBrowserInfoWindow(command);
        });
    });
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function infoConfigFor(page: BrowserInfoPage): BrowserInfoConfig {
    switch (page) {
        case 'manual':
            return {
                title: 'Dialog Creator - User Manual',
                src: 'docs/manual.html',
                width: 1200,
                height: 780,
                minWidth: 900,
                minHeight: 640,
                resizable: true
            };
        case 'api':
            return {
                title: 'Dialog Creator - API Reference',
                src: 'docs/api.html',
                width: 1200,
                height: 780,
                minWidth: 900,
                minHeight: 640,
                resizable: true
            };
        case 'about':
        default:
            return {
                title: 'About Dialog Creator',
                src: 'pages/about.html',
                width: 420,
                height: 325,
                minWidth: 420,
                minHeight: 325,
                resizable: false
            };
    }
}

function removeBrowserInfoWindow(): void {
    document.getElementById('dialogcreator-info-layer')?.remove();
}

function centerInDesktop(desktop: HTMLElement, win: HTMLElement): void {
    const left = Math.max(0, Math.round((desktop.clientWidth - win.offsetWidth) / 2));
    const top = Math.max(0, Math.round((desktop.clientHeight - win.offsetHeight) / 2));

    win.style.left = `${left}px`;
    win.style.top = `${top}px`;
}

function installWindowDrag(
    bounds: HTMLElement,
    win: HTMLElement,
    titlebar: HTMLElement
): void {
    titlebar.addEventListener('pointerdown', (event: PointerEvent) => {
        const target = event.target as HTMLElement | null;
        if (event.button !== 0 || target?.closest('button')) {
            return;
        }

        const startX = event.clientX;
        const startY = event.clientY;
        const startLeft = win.offsetLeft;
        const startTop = win.offsetTop;

        titlebar.setPointerCapture(event.pointerId);

        const move = function(moveEvent: PointerEvent): void {
            const nextLeft = clamp(
                startLeft + moveEvent.clientX - startX,
                0,
                Math.max(0, bounds.clientWidth - win.offsetWidth)
            );
            const nextTop = clamp(
                startTop + moveEvent.clientY - startY,
                0,
                Math.max(0, bounds.clientHeight - win.offsetHeight)
            );

            win.style.left = `${Math.round(nextLeft)}px`;
            win.style.top = `${Math.round(nextTop)}px`;
        };

        const up = function(upEvent: PointerEvent): void {
            titlebar.releasePointerCapture(upEvent.pointerId);
            titlebar.removeEventListener('pointermove', move);
            titlebar.removeEventListener('pointerup', up);
            titlebar.removeEventListener('pointercancel', up);
        };

        titlebar.addEventListener('pointermove', move);
        titlebar.addEventListener('pointerup', up);
        titlebar.addEventListener('pointercancel', up);
    });
}

function installInfoWindowResize(
    bounds: HTMLElement,
    win: HTMLElement,
    config: BrowserInfoConfig
): void {
    if (!config.resizable) {
        return;
    }

    win.querySelectorAll<HTMLElement>('.web-workbench-resize-handle').forEach((handle) => {
        handle.addEventListener('pointerdown', (event: PointerEvent) => {
            if (event.button !== 0) {
                return;
            }

            const direction = String(handle.dataset.resizeDirection || '');
            const startX = event.clientX;
            const startY = event.clientY;
            const startWidth = win.offsetWidth;
            const startHeight = win.offsetHeight;

            handle.setPointerCapture(event.pointerId);

            const move = function(moveEvent: PointerEvent): void {
                const maxWidth = Math.max(config.minWidth, bounds.clientWidth - win.offsetLeft);
                const maxHeight = Math.max(config.minHeight, bounds.clientHeight - win.offsetTop);

                if (direction === 'right' || direction === 'corner') {
                    const width = clamp(
                        startWidth + moveEvent.clientX - startX,
                        config.minWidth,
                        maxWidth
                    );
                    win.style.width = `${Math.round(width)}px`;
                }

                if (direction === 'bottom' || direction === 'corner') {
                    const height = clamp(
                        startHeight + moveEvent.clientY - startY,
                        config.minHeight,
                        maxHeight
                    );
                    win.style.height = `${Math.round(height)}px`;
                }
            };

            const up = function(upEvent: PointerEvent): void {
                handle.releasePointerCapture(upEvent.pointerId);
                handle.removeEventListener('pointermove', move);
                handle.removeEventListener('pointerup', up);
                handle.removeEventListener('pointercancel', up);
            };

            handle.addEventListener('pointermove', move);
            handle.addEventListener('pointerup', up);
            handle.addEventListener('pointercancel', up);
        });
    });
}

function createInfoResizeHandle(direction: string): HTMLSpanElement {
    const handle = document.createElement('span');
    handle.className = 'web-workbench-resize-handle';
    handle.dataset.resizeDirection = direction;

    return handle;
}

function installInfoFrameEscape(frame: HTMLIFrameElement): void {
    try {
        frame.contentWindow?.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                removeBrowserInfoWindow();
            }
        }, true);
    } catch {
        // Same-origin docs should allow this; ignore if the browser blocks access.
    }
}

function openBrowserInfoWindow(page: BrowserInfoPage): void {
    const desktop = document.getElementById('dialogcreator-browser-desktop') as HTMLElement | null;
    if (!desktop) {
        return;
    }

    const config = infoConfigFor(page);
    removeBrowserInfoWindow();

    const layer = document.createElement('div');
    layer.id = 'dialogcreator-info-layer';
    layer.className = 'web-info-layer';

    const win = document.createElement('section');
    win.className = 'web-info-window';
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-label', config.title);
    win.style.width = `${Math.min(config.width, Math.max(config.minWidth, desktop.clientWidth - 48))}px`;
    win.style.height = `${Math.min(config.height, Math.max(config.minHeight, desktop.clientHeight - 48))}px`;
    win.style.minWidth = `${config.minWidth}px`;
    win.style.minHeight = `${config.minHeight}px`;

    const titlebar = document.createElement('div');
    titlebar.className = 'web-info-window__titlebar';

    const title = document.createElement('div');
    title.className = 'web-info-window__title';
    title.textContent = config.title;

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'web-info-window__close';
    close.setAttribute('aria-label', 'Close');

    const frame = document.createElement('iframe');
    frame.className = 'web-info-window__frame';
    frame.title = config.title;
    frame.src = config.src;

    close.addEventListener('click', removeBrowserInfoWindow);
    frame.addEventListener('load', () => {
        installInfoFrameEscape(frame);
    });
    titlebar.append(title, close);
    win.append(titlebar, frame);

    if (config.resizable) {
        win.append(
            createInfoResizeHandle('right'),
            createInfoResizeHandle('bottom'),
            createInfoResizeHandle('corner')
        );
    }
    layer.appendChild(win);
    desktop.appendChild(layer);
    centerInDesktop(desktop, win);
    installWindowDrag(desktop, win, titlebar);
    installInfoWindowResize(desktop, win, config);
    frame.focus();
}

function installMainWindowDrag(): void {
    const desktop = document.getElementById('dialogcreator-browser-desktop') as HTMLElement | null;
    const win = document.getElementById('dialogcreator-main-window') as HTMLElement | null;
    const titlebar = document.getElementById('dialogcreator-main-titlebar') as HTMLElement | null;

    if (!desktop || !win || !titlebar) {
        return;
    }

    titlebar.addEventListener('pointerdown', (event: PointerEvent) => {
        if (event.button !== 0) {
            return;
        }

        const desktopRect = desktop.getBoundingClientRect();
        const rect = win.getBoundingClientRect();
        const startX = event.clientX;
        const startY = event.clientY;
        const startLeft = rect.left - desktopRect.left;
        const startTop = rect.top - desktopRect.top;

        titlebar.setPointerCapture(event.pointerId);

        const move = function(moveEvent: PointerEvent): void {
            const nextLeft = clamp(
                startLeft + moveEvent.clientX - startX,
                0,
                Math.max(0, desktop.clientWidth - win.offsetWidth)
            );
            const nextTop = clamp(
                startTop + moveEvent.clientY - startY,
                0,
                Math.max(0, desktop.clientHeight - win.offsetHeight)
            );

            win.style.left = `${Math.round(nextLeft)}px`;
            win.style.top = `${Math.round(nextTop)}px`;
        };

        const up = function(upEvent: PointerEvent): void {
            titlebar.releasePointerCapture(upEvent.pointerId);
            titlebar.removeEventListener('pointermove', move);
            titlebar.removeEventListener('pointerup', up);
            titlebar.removeEventListener('pointercancel', up);
        };

        titlebar.addEventListener('pointermove', move);
        titlebar.addEventListener('pointerup', up);
        titlebar.addEventListener('pointercancel', up);
    });
}

function installMainWindowResize(): void {
    const desktop = document.getElementById('dialogcreator-browser-desktop') as HTMLElement | null;
    const win = document.getElementById('dialogcreator-main-window') as HTMLElement | null;

    if (!desktop || !win) {
        return;
    }

    win.querySelectorAll<HTMLElement>('.web-workbench-resize-handle').forEach((handle) => {
        handle.addEventListener('pointerdown', (event: PointerEvent) => {
            if (event.button !== 0) {
                return;
            }

            const direction = String(handle.dataset.resizeDirection || '');
            const startX = event.clientX;
            const startY = event.clientY;
            const startWidth = win.offsetWidth;
            const startHeight = win.offsetHeight;
            const minWidth = 720;
            const minHeight = 420;
            const maxWidth = Math.max(minWidth, desktop.clientWidth - win.offsetLeft);
            const maxHeight = Math.max(minHeight, desktop.clientHeight - win.offsetTop);

            handle.setPointerCapture(event.pointerId);

            const move = function(moveEvent: PointerEvent): void {
                if (direction === 'right' || direction === 'corner') {
                    const width = clamp(
                        startWidth + moveEvent.clientX - startX,
                        minWidth,
                        maxWidth
                    );
                    win.style.width = `${Math.round(width)}px`;
                }

                if (direction === 'bottom' || direction === 'corner') {
                    const height = clamp(
                        startHeight + moveEvent.clientY - startY,
                        minHeight,
                        maxHeight
                    );
                    win.style.height = `${Math.round(height)}px`;
                }
            };

            const up = function(upEvent: PointerEvent): void {
                handle.releasePointerCapture(upEvent.pointerId);
                handle.removeEventListener('pointermove', move);
                handle.removeEventListener('pointerup', up);
                handle.removeEventListener('pointercancel', up);
            };

            handle.addEventListener('pointermove', move);
            handle.addEventListener('pointerup', up);
            handle.addEventListener('pointercancel', up);
        });
    });
}

function installBrowserMenu(composition: BrowserComposition): void {
    const fileInput = document.getElementById('dialogcreator-browser-file-input') as HTMLInputElement | null;

    const newDialog = async function(): Promise<void> {
        try {
            await sendEditorCommand('new');
            setBrowserStatus('New dialog');
        } catch (error) {
            setBrowserStatus(error instanceof Error ? error.message : String(error));
        }
    };

    const loadDialog = function(): void {
        fileInput?.click();
    };

    const previewDialog = async function(): Promise<void> {
        try {
            await sendEditorCommand('preview');
        } catch (error) {
            setBrowserStatus(error instanceof Error ? error.message : String(error));
        }
    };

    document.getElementById('dialogcreator-browser-new')?.addEventListener('click', () => {
        void newDialog();
    });

    document.getElementById('dialogcreator-browser-load')?.addEventListener('click', () => {
        loadDialog();
    });

    fileInput?.addEventListener('change', async () => {
        const file = fileInput.files?.[0];
        fileInput.value = '';

        if (!file) {
            return;
        }

        const result = await composition.files.readPackage(file);
        if (!result.ok) {
            setBrowserStatus(result.reason);
            return;
        }

        try {
            await sendEditorCommand('load-json', result.json);
            setBrowserStatus(`Loaded ${result.fileName}`);
        } catch (error) {
            setBrowserStatus(error instanceof Error ? error.message : String(error));
        }
    });

    const save = async function(requestedName?: string): Promise<void> {
        let json = '';

        try {
            json = String(await sendEditorCommand('get-json') || '');
        } catch (error) {
            setBrowserStatus(error instanceof Error ? error.message : String(error));
            return;
        }

        const result = composition.files.createPackage(json, requestedName);
        if (!result.ok) {
            setBrowserStatus(result.reason);
            return;
        }

        downloadDialogPackage(result.fileName, result.blob);
        setBrowserStatus(`Saved ${result.fileName}`);
    };

    document.getElementById('dialogcreator-browser-save')?.addEventListener('click', () => {
        void save();
    });

    document.getElementById('dialogcreator-browser-save-as')?.addEventListener('click', () => {
        void save();
    });

    document.getElementById('dialogcreator-browser-preview')?.addEventListener('click', () => {
        void previewDialog();
    });

    window.addEventListener('message', (event) => {
        const message = event.data as { type?: unknown; command?: unknown };
        if (message?.type !== 'dialogcreator-browser-shortcut') {
            return;
        }

        switch (String(message.command || '')) {
            case 'new':
                void newDialog();
                break;
            case 'load':
                loadDialog();
                break;
            case 'save':
            case 'save-as':
                void save();
                break;
            case 'preview':
                void previewDialog();
                break;
            default:
                break;
        }
    });

    window.addEventListener('keydown', (event: KeyboardEvent) => {
        const key = (event.key || '').toLowerCase();
        if (!(event.metaKey || event.ctrlKey)) {
            return;
        }

        if (key === 'n') {
            event.preventDefault();
            void newDialog();
            return;
        }

        if (key === 's') {
            event.preventDefault();
            void save();
            return;
        }

        if (key === 'l') {
            event.preventDefault();
            loadDialog();
            return;
        }

        if (key === 'p') {
            event.preventDefault();
            void previewDialog();
        }
    }, { capture: true });
}

installMenuPopups();
installEditMenu();
installInfoMenu();
installMainWindowDrag();
installMainWindowResize();
installBrowserMenu(mountBrowserComposition());
