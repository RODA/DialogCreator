import type { RendererTransport } from '../core/ipc/rendererTransport';
import type { Dialog } from '../interfaces/dialog';

export interface EditorDocumentControllerEditor {
    stringifyDialog(): string;
    loadDialogFromJson?(data: unknown): void;
    selectAll?(): void;
    removeSelectedElement?(): void;
}

export interface EditorDocumentControllerOptions {
    transport: RendererTransport;
    editor: EditorDocumentControllerEditor;
    dialog: Dialog;
    scheduleJsonUpdate(): void;
    setElementSelected(value: boolean): void;
}

function clearDialogCustomState(dialog: Dialog): void {
    dialog.customJS = '';
    dialog.i18n = undefined;

    if (!dialog.syntax) {
        dialog.syntax = { command: '', defaultElements: [] };
        return;
    }

    dialog.syntax.command = '';
}

function updateDialogPropertyInput(id: string, value: string): void {
    const input = document.getElementById(id) as HTMLInputElement | null;
    if (!input) {
        return;
    }

    input.value = value;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
}

function resetDialogProperties(payload: unknown): void {
    const data = payload as {
        name?: string;
        title?: string;
        language?: string;
        runtimeProvider?: string;
    };

    updateDialogPropertyInput('dialogName', String(data.name ?? 'NewDialog'));
    updateDialogPropertyInput('dialogTitle', String(data.title ?? 'New dialog'));
    updateDialogPropertyInput('dialogLanguage', String(data.language ?? 'en_US'));
    updateDialogPropertyInput('dialogRuntimeProvider', String(data.runtimeProvider ?? 'R'));
}

function disableButton(id: string): void {
    const button = document.getElementById(id) as HTMLButtonElement | null;
    if (button) {
        button.disabled = true;
    }
}

function clearStalePropertiesPanel(
    setElementSelected: (value: boolean) => void
): void {
    const propsList = document.getElementById('propertiesList') as HTMLDivElement | null;
    const currentElementId = propsList?.dataset.currentElementId || '';

    if (!propsList || !currentElementId || document.getElementById(currentElementId)) {
        return;
    }

    disableButton('removeElement');
    disableButton('bringToFront');
    disableButton('sendToBack');
    disableButton('bringForward');
    disableButton('sendBackward');
    disableButton('alignLeft');
    disableButton('alignTop');
    disableButton('alignMiddle');
    disableButton('alignRight');
    disableButton('alignBottom');
    disableButton('alignCenter');

    propsList.dataset.currentElementId = '';
    propsList.classList.add('hidden');

    document.querySelectorAll('#propertiesList .element-property').forEach((item) => {
        item.classList.add('hidden-element');
    });
    document.querySelectorAll('#propertiesList [id^="el"]').forEach((item) => {
        (item as HTMLInputElement).value = '';
    });

    setElementSelected(false);
}

export function installEditorDocumentController(
    options: EditorDocumentControllerOptions
): void {
    const transport = options.transport;

    transport.on('request-dialog-json', () => {
        try {
            transport.send('send-to', 'main', 'dialog-json', options.editor.stringifyDialog());
        } catch {
            transport.send('send-to', 'main', 'dialog-json', '');
        }
    });

    transport.on('load-dialog-json', (data: unknown) => {
        try {
            options.editor.loadDialogFromJson?.(data);
        } catch (error) {
            console.error('Failed to load dialog JSON', error);
        }

        setTimeout(() => {
            try {
                options.scheduleJsonUpdate();
            } catch {
                // Dirty-state refresh is best-effort after load.
            }
        }, 300);
    });

    transport.on('newDialogClear', () => {
        options.editor.selectAll?.();
        options.editor.removeSelectedElement?.();

        try {
            clearDialogCustomState(options.dialog);
        } catch {
            // State reset is best-effort while the editor is rebuilding.
        }
    });

    transport.on('reset-dialog-properties', (payload: unknown = {}) => {
        try {
            resetDialogProperties(payload);
        } catch {
            // Property reset is best-effort during New.
        }
    });

    transport.on('load-dialog-json', () => {
        setTimeout(() => clearStalePropertiesPanel(options.setElementSelected), 0);
    });

    transport.on('newDialogClear', () => {
        setTimeout(() => clearStalePropertiesPanel(options.setElementSelected), 0);
        setTimeout(() => {
            try {
                options.scheduleJsonUpdate();
            } catch {
                // Dirty-state refresh is best-effort after New.
            }
        }, 300);
    });
}
