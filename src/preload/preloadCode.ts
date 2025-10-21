import { coms } from "../modules/coms";
import { utils } from "../library/utils";
import * as path from "path";

window.addEventListener('DOMContentLoaded', () => {
    const mount = document.getElementById('codeMount') as HTMLDivElement | null;
    const status = document.getElementById('codeStatus') as HTMLDivElement | null;
    const btn = document.getElementById('saveCode') as HTMLButtonElement | null;

    if (!mount || !btn) return;

    // Ensure the CM6 bundle is loaded into the preload (isolated) context.
    // With contextIsolation=true, globals from page scripts aren't visible here,
    // so the bundle directly required, when available.
    const fs = require('fs');
    const candidates: string[] = [];

    // Dev path: dist/preload -> src/bundles/codemirror.bundle.js
    candidates.push(path.join(__dirname, '..', '..', 'src', 'bundles', 'codemirror.bundle.js'));

    // Packaged path: under resources/bundles
    if (process && process.resourcesPath) {
        candidates.push(path.join(process.resourcesPath, 'bundles', 'codemirror.bundle.js'));
    }

    for (const bundle of candidates) {
        if (bundle && fs.existsSync(bundle)) {
            require(bundle);
            break;
        }
    }

    const CM6 = window.CM6;
    let editor: any = null;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const setStatus = (msg: string) => {
        if (status) status.textContent = msg;
    };

    const runSyntaxCheck = () => {
        const code = (editor?.getValue?.() || '') as string;
        try {
            // Validate syntax using a parser to avoid code generation from strings
            const acorn = require('acorn');
            acorn.parse(
                code,
                {
                    ecmaVersion: 'latest',
                    sourceType: 'script',
                    allowReturnOutsideFunction: true,
                    allowAwaitOutsideFunction: true
                } as any
            );
            setStatus('No syntax errors');
        } catch (e: any) {
            setStatus('Syntax error: ' + String(e && e.message ? e.message : e));
        }

        if (typeof CM6?.requestLint === 'function') {
            try {
                CM6.requestLint(editor);
            } catch { /* non-fatal */ }
        }
    };

    coms.on('renderCode', (payload: unknown) => {
        const obj: any = typeof payload === 'string' ? JSON.parse(payload as string) : (payload as any);
        const existing = String(obj?.customJS || '');

        // Build dialog metadata for the linter from the dialog JSON
        try {
            if (CM6?.setDialogMeta && obj && Array.isArray(obj.elements)) {
                const elements = [] as Array<{ name: string; type: string; options?: string[] }>;
                const radioGroups = new Set<string>();
                for (const e of obj.elements) {
                    const name = String(e?.nameid || '').trim();
                    const type = String(e?.type || e?.dataset?.type || '').trim();
                    if (!name || !type) continue;
                    const metaEl: { name: string; type: string; options?: string[] } = { name, type };
                    if (type === 'Select') {
                        const raw = String(e?.value ?? '');
                        const tokens = raw.split(/[;,]/).map((s: string) => s.trim()).filter((s: string) => s.length > 0);
                        metaEl.options = tokens;
                    }
                    if (type === 'Radio') {
                        const group = String(e?.group || e?.dataset?.group || '').trim();
                        if (group) {
                            radioGroups.add(group);
                        }
                    }
                    elements.push(metaEl);
                }
                CM6.setDialogMeta({ elements, radioGroups: Array.from(radioGroups) });
            }
        } catch { /* non-fatal */ }

        if (CM6) {
            editor = CM6.createCodeEditor(
                mount,
                {
                    value: existing,
                    onChange: () => {
                        if (!utils.isNil(debounceTimer)) {
                            // clear if neither null nor undefined
                            clearTimeout(debounceTimer);
                        }
                        debounceTimer = setTimeout(runSyntaxCheck, 250);
                    }
                }
            );
        } else {
            // Fallback: textarea (unlikely if bundle loads). Create one on the fly.
            const ta = document.createElement('textarea');
            ta.id = 'codeText';
            mount.appendChild(ta);
            ta.value = existing;
            editor = {
                getValue: () => ta.value,
                setValue: (v: string) => { ta.value = v; },
                focus: () => ta.focus(),
                destroy: () => {}
            };
        }

        setStatus('Ready');

        // Validate immediately on load so existing syntax issues surface without requiring edits
        runSyntaxCheck();
        setTimeout(runSyntaxCheck, 10);
    });

    // Initial syntax check after load (in case the editor is created via fallback textarea first)
    setTimeout(runSyntaxCheck, 10);

    btn.addEventListener('click', () => {
        const text = (editor?.getValue?.() || '') as string;

        // Send to the editor window to persist in dialog.syntax.customJS
        coms.sendTo('editorWindow', 'setDialogCustomJS', text);

        // Explicit close channel for the Code window
        coms.sendTo('main', 'close-codeWindow');
    });
});