import { coms } from "../modules/coms";
import * as path from "path";

window.addEventListener('DOMContentLoaded', () => {
    const mount = document.getElementById('codeMount') as HTMLDivElement | null;
    const status = document.getElementById('codeStatus') as HTMLDivElement | null;
    const btn = document.getElementById('saveCode') as HTMLButtonElement | null;

    if (!mount || !btn) return;

    // Ensure the CM6 bundle is loaded into the preload (isolated) context.
    // With contextIsolation=true, globals from page scripts aren't visible here,
    // so we require the bundle directly when available.
    const fs = require('fs');
    const candidates: string[] = [];
    // Dev path: dist/preload -> project/src/vendor/codemirror.bundle.js
    candidates.push(path.join(__dirname, '../../src/vendor/codemirror.bundle.js'));
    // Packaged path: under resources/vendor
    if (process && (process as any).resourcesPath) {
        candidates.push(path.join((process as any).resourcesPath, 'vendor', 'codemirror.bundle.js'));
    }
    for (const p of candidates) {
        try {
            if (p && fs.existsSync(p)) {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                require(p);
                break;
            }
        } catch {}
    }

    const CM6 = window.CM6;
    let editor: any = null;

    coms.on('renderCode', (payload: unknown) => {
        try {
            type CodePayload = { customJS?: string };
            const obj: CodePayload = typeof payload === 'string' ? JSON.parse(payload as string) : (payload as CodePayload);
            const existing = String(obj?.customJS || '');
            if (CM6) {
                editor = CM6.createCodeEditor(
                    mount,
                    {
                        value: existing,
                        onChange: () => {
                            clearTimeout(debounceTimer);
                            debounceTimer = setTimeout(runSyntaxCheck, 250);
                        }
                    }
                );
            } else {
                // Fallback: textarea (unlikely if bundle loads). Create one on the fly.
                const ta = document.createElement('textarea');
                ta.id = 'codeText';
                ta.style.cssText = 'flex:1;width:100%;padding:12px;border:none;outline:none;resize:none;box-sizing:border-box;line-height:1.5;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;font-size:12px;';
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
        } catch {
            // ignore parse errors
        }
    });

    const setStatus = (msg: string) => { if (status) status.textContent = msg; };

    let debounceTimer: any = null;
    const runSyntaxCheck = () => {
        const code = (editor?.getValue?.() || '') as string;
        try {
            // Validate syntax using a parser to avoid code generation from strings
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const acorn = require('acorn');
            acorn.parse(code, {
                ecmaVersion: 'latest',
                sourceType: 'script',
                allowReturnOutsideFunction: true,
                allowAwaitOutsideFunction: true
            } as any);
            setStatus('No syntax errors');
        } catch (e: any) {
            setStatus('Syntax error: ' + String(e && e.message ? e.message : e));
        }
    };

    // Initial syntax check after load
    setTimeout(runSyntaxCheck, 10);

    btn.addEventListener('click', () => {
        const text = (editor?.getValue?.() || '') as string;

        // Send to the editor window to persist in dialog.syntax.customJS
        coms.sendTo('editorWindow', 'setDialogCustomJS', text);

        // Explicit close channel for the Code window
        coms.sendTo('main', 'close-codeWindow');
    });
});