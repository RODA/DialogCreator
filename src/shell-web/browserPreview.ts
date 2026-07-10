import { bootPreviewController, renderPreviewDialog } from '../preview/previewController';
import { createBrowserRendererTransport } from './browserRendererTransport';

const transport = createBrowserRendererTransport();

type BrowserPreviewWindow = Window & {
    dialogCreatorPreviewTransport?: typeof transport;
    dialogCreatorPreviewEvents?: Record<string, unknown>[];
    renderDialogCreatorPreview?: (data: unknown) => void;
};

function recordBrowserPreviewEvent(event: Record<string, unknown>): void {
    const target = window as BrowserPreviewWindow;
    const events = target.dialogCreatorPreviewEvents || [];
    events.push(event);
    target.dialogCreatorPreviewEvents = events;
}

function focusPreviewRoot(): void {
    const root = document.getElementById('preview-root');

    if (!root) {
        return;
    }

    root.tabIndex = -1;
    root.focus({ preventScroll: true });
}

transport.on('send-to', (windowName, channel, ...args) => {
    if (windowName === 'editorWindow' && channel === 'consolog') {
        recordBrowserPreviewEvent({ type: 'log', message: String(args[0] || '') });
        return;
    }

    if (windowName === 'main' && channel === 'showDialogMessage') {
        recordBrowserPreviewEvent({
            type: 'message',
            level: String(args[0] || ''),
            message: String(args[1] || ''),
            detail: String(args[2] || '')
        });
        return;
    }

    if (windowName === 'main' && channel === 'openSyntaxPanel') {
        recordBrowserPreviewEvent({ type: 'syntax-panel', command: String(args[0] || '') });
        return;
    }

    if (windowName === 'main' && channel === 'close-previewWindow') {
        recordBrowserPreviewEvent({ type: 'close-requested' });
    }
});

const target = window as BrowserPreviewWindow;
target.dialogCreatorPreviewTransport = transport;
target.renderDialogCreatorPreview = renderPreviewDialog;

window.addEventListener('message', (event) => {
    const message = event.data as { type?: unknown; data?: unknown; requestId?: unknown };
    if (message?.type === 'dialogcreator-preview-render') {
        renderPreviewDialog(message.data);
        focusPreviewRoot();
        window.parent?.postMessage({
            type: 'dialogcreator-panel-payload-applied',
            requestId: String(message.requestId || '')
        }, '*');
    }
});

window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        window.parent?.postMessage({ type: 'dialogcreator-close-browser-panel' }, '*');
    }
}, true);

bootPreviewController(transport);
