import { coms, setRendererTransport } from '../modules/coms';
import type { RendererTransport } from '../core/ipc/rendererTransport';
import type { PreviewDialog } from '../interfaces/preview';
import { closeHostPreviewWindow, openHostSyntaxPanel } from '../core/host/dialogChildWindow';
import { sendEditorConsoleLog } from '../core/host/editorWindowEvents';
import { showHostDialogMessage } from '../core/host/hostMessages';
import { createDialogRenderer } from '../renderer/dialogRenderer';

let renderer: ReturnType<typeof createDialogRenderer> | null = null;

export function renderPreviewDialog(data: unknown): void {
    const root = document.getElementById('preview-root');
    if (!root) {
        return;
    }
    if (!renderer) {
        renderer = createDialogRenderer(root, {
            log: (message) => sendEditorConsoleLog(coms, message),
            showMessage: (type, message, detail) => showHostDialogMessage(coms, type, message, detail),
            openSyntaxPanel: (command) => openHostSyntaxPanel(coms, command),
            closeDialog: () => closeHostPreviewWindow(coms),
            setTitle: (title) => { document.title = title; }
        });
    }
    try {
        const payload = typeof data === 'string' ? JSON.parse(data) : data;
        renderer.render(payload as PreviewDialog);
    } catch (error) {
        sendEditorConsoleLog(coms, `Failed to render preview: ${String(error)}`);
    }
}

export function bootPreviewController(transport: RendererTransport): void {
    setRendererTransport(transport);
    coms.on('reload-css', () => {
        document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]').forEach((link) => {
            link.href = `${link.href.split('?')[0]}?v=${Date.now()}`;
        });
    });
    window.addEventListener('DOMContentLoaded', () => {
        coms.on('renderPreview', renderPreviewDialog);
    });
}
