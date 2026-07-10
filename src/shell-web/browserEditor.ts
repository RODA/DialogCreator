import { bootEditor } from '../editor/editorBootstrap';
import type { DialogChildWindowArgs } from '../core/host/dialogChildWindow';
import { createBrowserRendererTransport } from './browserRendererTransport';
import { createStaticElementCatalog } from './staticElementCatalog';

const transport = createBrowserRendererTransport();
const catalog = createStaticElementCatalog();

type BrowserPanelWindow = Window & {
    renderDialogCreatorPreview?: (data: unknown) => void;
    dialogCreatorCodeTransport?: ReturnType<typeof createBrowserRendererTransport>;
    dialogCreatorCodeReady?: Promise<void>;
    dialogCreatorBrowserEditorEvents?: Record<string, unknown>[];
    dialogCreatorSetCustomJS?: (text: unknown) => void;
};

const browserPanelStyleId = 'dialogcreator-browser-panel-styles';
let closeCurrentBrowserPanel: (() => void) | null = null;

function recordBrowserEditorEvent(event: Record<string, unknown>): void {
    const target = window as BrowserPanelWindow;
    const events = target.dialogCreatorBrowserEditorEvents || [];
    events.push(event);
    target.dialogCreatorBrowserEditorEvents = events;
}

function customJSFromPanelData(data: unknown): string {
    if (typeof data !== 'string') {
        return '';
    }

    try {
        return String((JSON.parse(data) as { customJS?: unknown }).customJS || '');
    } catch {
        return '';
    }
}

function closeBrowserPanel(): void {
    if (closeCurrentBrowserPanel) {
        closeCurrentBrowserPanel();
        return;
    }

    document.getElementById('dialogcreator-browser-panel')?.remove();
}

function installBrowserPanelStyles(): void {
    if (document.getElementById(browserPanelStyleId)) {
        return;
    }

    const style = document.createElement('style');
    style.id = browserPanelStyleId;
    style.textContent = `
        #dialogcreator-browser-panel {
            position: fixed;
            inset: 0;
            z-index: 100000;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.32);
        }

        .dialogcreator-browser-panel-window {
            position: absolute;
            display: grid;
            grid-template-rows: 32px minmax(0, 1fr);
            max-width: calc(100vw - 48px);
            max-height: calc(100vh - 48px);
            border: 1px solid #b8bec7;
            border-radius: 6px;
            background: #ffffff;
            box-shadow: 0 18px 42px rgba(15, 23, 42, 0.26);
            overflow: hidden;
        }

        .dialogcreator-browser-panel-titlebar {
            display: flex;
            align-items: center;
            min-width: 0;
            border-bottom: 1px solid #e2e5ea;
            background: #f8f8f8;
            cursor: move;
            user-select: none;
        }

        .dialogcreator-browser-panel-close {
            width: 32px;
            height: 32px;
            padding: 0;
            border: 0;
            background-color: transparent;
            background-image: url("../assets/icons/close.svg");
            background-position: center;
            background-repeat: no-repeat;
            background-size: 16px 16px;
            cursor: pointer;
        }

        .dialogcreator-browser-panel-close:hover {
            background-color: transparent;
            background-image: url("../assets/icons/close.svg");
            background-position: center;
            background-repeat: no-repeat;
            background-size: 16px 16px;
        }

        .dialogcreator-browser-panel-title {
            flex: 1 1 auto;
            min-width: 0;
            padding: 0 10px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-weight: 600;
        }

        .dialogcreator-browser-panel-frame {
            display: block;
            width: 100%;
            height: 100%;
            min-width: 0;
            min-height: 0;
            border: 0;
        }
    `;
    document.head.appendChild(style);
}

function createBrowserPanelCloseButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'dialogcreator-browser-panel-close';
    button.setAttribute('aria-label', 'Close');
    button.title = 'Close';

    return button;
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function centerBrowserPanelWindow(panel: HTMLElement, panelWindow: HTMLElement): void {
    const left = Math.max(0, Math.round((panel.clientWidth - panelWindow.offsetWidth) / 2));
    const top = Math.max(0, Math.round((panel.clientHeight - panelWindow.offsetHeight) / 2));

    panelWindow.style.left = `${left}px`;
    panelWindow.style.top = `${top}px`;
}

function installBrowserPanelDrag(
    panel: HTMLElement,
    panelWindow: HTMLElement,
    titlebar: HTMLElement
): void {
    titlebar.addEventListener('pointerdown', (event: PointerEvent) => {
        const target = event.target as HTMLElement | null;
        if (event.button !== 0 || target?.closest('button')) {
            return;
        }

        const startX = event.clientX;
        const startY = event.clientY;
        const startLeft = panelWindow.offsetLeft;
        const startTop = panelWindow.offsetTop;

        titlebar.setPointerCapture(event.pointerId);

        const move = function(moveEvent: PointerEvent): void {
            const maxLeft = Math.max(0, panel.clientWidth - panelWindow.offsetWidth);
            const maxTop = Math.max(0, panel.clientHeight - panelWindow.offsetHeight);
            const nextLeft = clamp(startLeft + moveEvent.clientX - startX, 0, maxLeft);
            const nextTop = clamp(startTop + moveEvent.clientY - startY, 0, maxTop);

            panelWindow.style.left = `${Math.round(nextLeft)}px`;
            panelWindow.style.top = `${Math.round(nextTop)}px`;
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

function openBrowserPanel(args: DialogChildWindowArgs): void {
    closeBrowserPanel();
    installBrowserPanelStyles();
    recordBrowserEditorEvent({
        type: 'open-panel',
        html: args.html,
        customJS: customJSFromPanelData(args.data)
    });

    const panel = document.createElement('div');
    panel.id = 'dialogcreator-browser-panel';
    panel.tabIndex = -1;

    const panelWindow = document.createElement('div');
    panelWindow.className = 'dialogcreator-browser-panel-window';
    panelWindow.style.width = `${Number(args.width) || 640}px`;
    panelWindow.style.height = `${(Number(args.height) || 480) + 32}px`;

    const titlebar = document.createElement('div');
    titlebar.className = 'dialogcreator-browser-panel-titlebar';

    const closeButton = createBrowserPanelCloseButton();
    const title = document.createElement('div');
    title.className = 'dialogcreator-browser-panel-title';
    title.textContent = String(args.title || 'DialogCreator');

    titlebar.appendChild(title);
    titlebar.appendChild(closeButton);

    const frame = document.createElement('iframe');
    frame.title = String(args.title || 'DialogCreator panel');
    frame.className = 'dialogcreator-browser-panel-frame';
    frame.style.background = String(args.backgroundColor || '#ffffff');
    frame.src = `./${args.html}`;

    const handleEscape = function(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            closeBrowserPanel();
        }
    };

    const closePanel = function(): void {
        window.removeEventListener('keydown', handleEscape, true);
        panel.remove();

        if (closeCurrentBrowserPanel === closePanel) {
            closeCurrentBrowserPanel = null;
        }
    };

    closeCurrentBrowserPanel = closePanel;
    closeButton.addEventListener('click', closePanel);
    window.addEventListener('keydown', handleEscape, true);
    installBrowserPanelDrag(panel, panelWindow, titlebar);

    panelWindow.appendChild(titlebar);
    panelWindow.appendChild(frame);
    panel.appendChild(panelWindow);
    document.body.appendChild(panel);
    centerBrowserPanelWindow(panel, panelWindow);
    panel.focus({ preventScroll: true });

    sendBrowserPanelPayload(frame, args);
}

function sendBrowserPanelPayload(frame: HTMLIFrameElement, args: DialogChildWindowArgs): void {
    if (args.html === 'preview.html') {
        sendPanelMessageUntilApplied(frame, 'dialogcreator-preview-render', args.data);
        return;
    }

    if (args.html === 'code.html') {
        sendPanelMessageUntilApplied(frame, 'dialogcreator-code-render', args.data);
    }
}

function sendBrowserShortcut(command: string): void {
    window.parent?.postMessage({
        type: 'dialogcreator-browser-shortcut',
        command
    }, '*');
}

function installBrowserShortcuts(): void {
    window.addEventListener('keydown', (event: KeyboardEvent) => {
        const key = (event.key || '').toLowerCase();
        if (!(event.metaKey || event.ctrlKey)) {
            return;
        }

        if (key === 'p') {
            event.preventDefault();
            const actions = (window as BrowserPanelWindow & {
                dialogCreatorEditorActions?: {
                    previewDialog(): void;
                };
            }).dialogCreatorEditorActions;
            actions?.previewDialog();
            return;
        }

        if (key === 'n') {
            event.preventDefault();
            const actions = (window as BrowserPanelWindow & {
                dialogCreatorEditorActions?: {
                    newDialog(): void;
                };
            }).dialogCreatorEditorActions;
            actions?.newDialog();
            return;
        }

        if (key === 'l') {
            event.preventDefault();
            sendBrowserShortcut('load');
            return;
        }

        if (key === 's') {
            event.preventDefault();
            sendBrowserShortcut(event.shiftKey ? 'save-as' : 'save');
        }
    }, { capture: true });
}

function sendPanelMessageUntilApplied(
    frame: HTMLIFrameElement,
    type: string,
    data: unknown
): void {
    const requestId = `panel-payload-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    let attempts = 0;
    let applied = false;

    const onMessage = function(event: MessageEvent): void {
        const message = event.data as { type?: unknown; requestId?: unknown };
        if (
            message?.type === 'dialogcreator-panel-payload-applied' &&
            message.requestId === requestId
        ) {
            applied = true;
            window.removeEventListener('message', onMessage);
        }
    };

    const send = function(): void {
        if (applied) {
            return;
        }

        attempts += 1;
        frame.contentWindow?.postMessage({ type, data, requestId }, '*');

        if (attempts < 100) {
            setTimeout(send, 25);
        } else {
            window.removeEventListener('message', onMessage);
        }
    };

    window.addEventListener('message', onMessage);
    send();
}

window.addEventListener('message', (event) => {
    const message = event.data as {
        type?: unknown;
        code?: unknown;
        requestId?: unknown;
        command?: unknown;
        data?: unknown;
    };

    if (message?.type === 'dialogcreator-code-saved') {
        const code = String(message.code || '');
        recordBrowserEditorEvent({ type: 'code-saved', code });
        (window as BrowserPanelWindow).dialogCreatorSetCustomJS?.(code);
        transport.emit('setDialogCustomJS', code);
        transport.emit('message-from-main-setDialogCustomJS', code);
        return;
    }

    if (message?.type === 'dialogcreator-close-browser-panel') {
        recordBrowserEditorEvent({ type: 'panel-close-requested' });
        closeBrowserPanel();
        return;
    }

    if (message?.type === 'dialogcreator-browser-command') {
        handleBrowserCommand(message);
    }
});

function handleBrowserCommand(message: {
    requestId?: unknown;
    command?: unknown;
    data?: unknown;
}): void {
    const requestId = String(message.requestId || '');

    try {
        const actions = (window as BrowserPanelWindow & {
            dialogCreatorEditorActions?: {
                getDialogJson(): string;
                loadDialogJson(data: unknown): void;
                newDialog(): void;
                previewDialog(): void;
            };
        }).dialogCreatorEditorActions;

        if (!actions) {
            throw new Error('Editor is not ready.');
        }

        let result: unknown = true;
        switch (String(message.command || '')) {
            case 'get-json':
                result = actions.getDialogJson();
                break;
            case 'load-json':
                actions.loadDialogJson(message.data);
                break;
            case 'new':
                actions.newDialog();
                break;
            case 'preview':
                actions.previewDialog();
                break;
            default:
                throw new Error(`Unsupported browser command: ${String(message.command || '')}`);
        }

        window.parent?.postMessage({
            type: 'dialogcreator-browser-command-result',
            requestId,
            ok: true,
            result
        }, '*');
    } catch (error) {
        window.parent?.postMessage({
            type: 'dialogcreator-browser-command-result',
            requestId,
            ok: false,
            reason: error instanceof Error ? error.message : String(error)
        }, '*');
    }
}

transport.on('send-to', async (windowName, channel, ...args) => {
    if (windowName !== 'main') {
        return;
    }

    if (channel === 'getProperties') {
        const element = String(args[0] || '');
        const properties = await catalog.getProperties(element);
        transport.emit('message-from-main-propertiesFromDB', element, properties);
        return;
    }

    if (channel === 'resetProperties') {
        const element = String(args[0] || '');
        const properties = await catalog.resetProperties(element);
        if (properties) {
            transport.emit('message-from-main-resetOK', properties);
            transport.emit('message-from-main-propertiesFromDB', element, properties);
        }
        return;
    }

    if (channel === 'updateProperty') {
        const element = String(args[0] || '');
        const property = String(args[1] || '');
        const value = String(args[2] || '');
        const ok = await catalog.updateProperty(element, property, value);
        if (ok) {
            const properties = await catalog.getProperties(element);
            transport.emit('message-from-main-propertiesFromDB', element, properties);
        }
        return;
    }

    if (channel === 'secondWindow') {
        openBrowserPanel(args[0] as DialogChildWindowArgs);
        return;
    }

    if (
        channel === 'close-secondWindow' ||
        channel === 'close-codeWindow' ||
        channel === 'close-previewWindow'
    ) {
        closeBrowserPanel();
    }
});

bootEditor(transport);
installBrowserShortcuts();
