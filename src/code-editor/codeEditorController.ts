import { coms, setRendererTransport } from '../modules/coms';
import { utils } from '../library/utils';
import type { RendererTransport } from '../core/ipc/rendererTransport';

type CodeEditorInstance = {
    view?: unknown;
    getValue(): string;
    setValue(value: string): void;
    focus?(): void;
    destroy?(): void;
};

type CodeMirrorHost = {
    createCodeEditor(
        mount: HTMLElement,
        options: {
            value: string;
            onChange(): void;
        }
    ): CodeEditorInstance;
    requestLint?(editor: { view?: unknown } | null | undefined): void;
    setDialogMeta?(metadata: {
        elements: Array<{ name: string; type: string; options?: string[] }>;
        radioGroups: string[];
    }): void;
};

export interface CodeEditorControllerOptions {
    transport: RendererTransport;
    loadCodeMirror?(): Promise<CodeMirrorHost | null> | CodeMirrorHost | null;
    parseJavaScript?(code: string): void;
}

function createFallbackEditor(mount: HTMLElement): CodeEditorInstance {
    const textarea = document.createElement('textarea');
    textarea.id = 'codeText';
    mount.appendChild(textarea);
    textarea.value = '';

    return {
        getValue: () => textarea.value,
        setValue: (value: string) => {
            textarea.value = value;
        },
        focus: () => textarea.focus(),
        destroy: () => {}
    };
}

function readDialogCodePayload(payload: unknown): Record<string, any> {
    return typeof payload === 'string'
        ? JSON.parse(payload)
        : (payload as Record<string, any>);
}

function updateDialogMetadata(CM6: CodeMirrorHost | null, payload: Record<string, any>): void {
    if (!CM6?.setDialogMeta || !payload || !Array.isArray(payload.elements)) {
        return;
    }

    const elements = [] as Array<{ name: string; type: string; options?: string[] }>;
    const radioGroups = new Set<string>();

    for (const element of payload.elements) {
        const name = String(element?.nameid || '').trim();
        const type = String(element?.type || element?.dataset?.type || '').trim();

        if (!name || !type) {
            continue;
        }

        const metaElement: { name: string; type: string; options?: string[] } = { name, type };

        if (type === 'Select') {
            const raw = String(element?.value ?? '');
            const tokens = raw
                .split(/[;,]/)
                .map((value: string) => value.trim())
                .filter((value: string) => value.length > 0);
            metaElement.options = tokens;
        }

        if (type === 'Radio') {
            const group = String(element?.group || element?.dataset?.group || '').trim();
            if (group) {
                radioGroups.add(group);
            }
        }

        elements.push(metaElement);
    }

    CM6.setDialogMeta({
        elements,
        radioGroups: Array.from(radioGroups)
    });
}

export async function bootCodeEditor(options: CodeEditorControllerOptions): Promise<void> {
    setRendererTransport(options.transport);

    const mount = document.getElementById('codeMount') as HTMLDivElement | null;
    const status = document.getElementById('codeStatus') as HTMLDivElement | null;
    const button = document.getElementById('saveCode') as HTMLButtonElement | null;

    if (!mount || !button) {
        return;
    }

    const loadedCodeMirror = options.loadCodeMirror
        ? await options.loadCodeMirror()
        : null;
    const CM6 = loadedCodeMirror || window.CM6 || null;
    let editor: CodeEditorInstance | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const setStatus = function(message: string): void {
        if (status) {
            status.textContent = message;
        }
    };

    const updateDiagCount = function(): void {
        try {
            if (!status || !mount) return;
            mount.querySelectorAll('.cm-lintPoint').length;
            mount.querySelectorAll('.cm-diagnosticRange, .cm-lintRange').length;
            mount.querySelectorAll('.cm-diagnostic').length;
            mount.querySelectorAll('.cm-lintMarker').length;
        } catch {
            // Diagnostic count is best-effort.
        }
    };

    const runSyntaxCheck = function(): void {
        const code = editor?.getValue?.() || '';

        try {
            options.parseJavaScript?.(code);
            setStatus('No syntax errors');
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setStatus(`Syntax error: ${message}`);
        }

        if (typeof CM6?.requestLint === 'function' && editor) {
            try {
                CM6.requestLint(editor);
                setTimeout(updateDiagCount, 350);
            } catch {
                // Lint refresh is best-effort.
            }
        }
    };

    if (CM6) {
        editor = CM6.createCodeEditor(mount, {
            value: '',
            onChange: () => {
                if (!utils.isNil(debounceTimer)) {
                    clearTimeout(debounceTimer);
                }
                debounceTimer = setTimeout(runSyntaxCheck, 250);
            }
        });
        setStatus('Ready (CM6)');
        setTimeout(updateDiagCount, 350);
    } else {
        editor = createFallbackEditor(mount);
        setStatus('Ready (fallback)');
    }

    coms.on('renderCode', (payload: unknown) => {
        const data = readDialogCodePayload(payload);
        const existing = String(data?.customJS || '');

        try {
            updateDialogMetadata(CM6, data);
        } catch {
            // Metadata refresh is non-fatal.
        }

        try {
            editor?.setValue(existing);
        } catch {
            // Editor value refresh is non-fatal.
        }

        runSyntaxCheck();
        setTimeout(runSyntaxCheck, 10);
        setTimeout(updateDiagCount, 400);
    });

    setTimeout(runSyntaxCheck, 10);
    setTimeout(updateDiagCount, 400);

    const saveOnly = function(): void {
        const text = editor?.getValue?.() || '';
        coms.sendTo('editorWindow', 'setDialogCustomJS', text);

        try {
            if (!status) return;

            const previous = status.textContent || '';
            status.textContent = 'Saved';
            setTimeout(() => {
                try {
                    status.textContent = previous || 'Ready';
                } catch {
                    // Status reset is best-effort.
                }
            }, 1200);
        } catch {
            // Status update is best-effort.
        }
    };

    button.addEventListener('click', () => {
        saveOnly();
        coms.sendTo('main', 'close-codeWindow');
    });

    window.addEventListener('keydown', (event: KeyboardEvent) => {
        try {
            const isSave = (event.key || '').toLowerCase() === 's' && (event.metaKey || event.ctrlKey);
            if (isSave) {
                event.preventDefault();
                event.stopPropagation();
                saveOnly();
            }
        } catch {
            // Ignore shortcut errors.
        }
    }, { capture: true });

    options.transport.on('code-save-only', () => {
        try {
            saveOnly();
        } catch {
            // Ignore forced save errors.
        }
    });
}
