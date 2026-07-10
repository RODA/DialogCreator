import * as acorn from 'acorn';

import { bootCodeEditor } from '../code-editor/codeEditorController';
import { createBrowserRendererTransport } from './browserRendererTransport';

const transport = createBrowserRendererTransport();

function recordBrowserCodeEvent(event: Record<string, unknown>): void {
    const target = window as unknown as {
        dialogCreatorBrowserCodeEvents?: Record<string, unknown>[];
    };
    const events = target.dialogCreatorBrowserCodeEvents || [];
    events.push(event);
    target.dialogCreatorBrowserCodeEvents = events;
}

transport.on('send-to', (windowName, channel, ...args) => {
    if (windowName === 'main' && channel === 'close-codeWindow') {
        recordBrowserCodeEvent({ type: 'close-requested' });
        window.parent?.postMessage({ type: 'dialogcreator-close-browser-panel' }, '*');
        transport.emit('browser-code-close-requested');
        return;
    }

    if (windowName === 'editorWindow' && channel === 'setDialogCustomJS') {
        const code = String(args[0] || '');
        recordBrowserCodeEvent({ type: 'saved', code });
        window.parent?.postMessage({ type: 'dialogcreator-code-saved', code }, '*');
        transport.emit('browser-code-saved', code);
    }
});

type BrowserCodeWindow = Window & {
    dialogCreatorCodeTransport?: typeof transport;
    dialogCreatorCodeReady?: Promise<void>;
};

(window as BrowserCodeWindow).dialogCreatorCodeTransport = transport;

window.addEventListener('message', (event) => {
    const message = event.data as { type?: unknown; data?: unknown; requestId?: unknown };
    if (message?.type === 'dialogcreator-code-render') {
        transport.emit('renderCode', message.data);
        window.parent?.postMessage({
            type: 'dialogcreator-panel-payload-applied',
            requestId: String(message.requestId || '')
        }, '*');
    }
});

window.addEventListener('DOMContentLoaded', () => {
    (window as BrowserCodeWindow).dialogCreatorCodeReady = bootCodeEditor({
        transport,
        loadCodeMirror: () => window.CM6 ?? null,
        parseJavaScript(code: string): void {
            acorn.parse(
                code,
                {
                    ecmaVersion: 'latest',
                    sourceType: 'script',
                    allowReturnOutsideFunction: true,
                    allowAwaitOutsideFunction: true
                }
            );
        }
    });
});
