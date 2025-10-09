import { coms } from "../modules/coms";

window.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('codeText') as HTMLTextAreaElement | null;
    const btn = document.getElementById('saveCode') as HTMLButtonElement | null;
    if (!textarea || !btn) return;

    coms.on('renderCode', (payload: unknown) => {
        try {
            type CodePayload = { customJS?: string };
            const obj: CodePayload = typeof payload === 'string' ? JSON.parse(payload as string) : (payload as CodePayload);
            const existing = String(obj?.customJS || '');
            textarea.value = existing;
        } catch {
            // ignore parse errors
        }
    });

    btn.addEventListener('click', () => {
        const text = textarea.value || '';

        // Send to the editor window to persist in dialog.syntax.customJS
        coms.sendTo('editorWindow', 'setDialogCustomJS', text);

        // Explicit close channel for the Code window
        coms.sendTo('main', 'close-codeWindow');
    });
});