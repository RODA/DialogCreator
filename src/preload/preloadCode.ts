/*
    Copyright (c) 2025, Adrian Dusa
    All rights reserved.

    License: Academic Non-Commercial License (see LICENSE file for details).
    SPDX-License-Identifier: LicenseRef-ANCL-AdrianDusa
*/

import { coms } from "../modules/coms";
import { ipcRenderer } from 'electron';
import { utils } from "../library/utils";
import * as path from "path";

window.addEventListener('DOMContentLoaded', () => {
    const mount = document.getElementById('codeMount') as HTMLDivElement | null;
    const status = document.getElementById('codeStatus') as HTMLDivElement | null;
    const btn = document.getElementById('saveCode') as HTMLButtonElement | null;

    if (!mount || !btn) return;

    // Ensure the CM6 bundle is loaded into the preload (isolated) context.
    // With contextIsolation=true, globals from page scripts aren't visible here,
    // so the bundle must be required directly when available.
    const fs = require('fs');
    const candidates: string[] = [];

    // Common dev layouts relative to dist/preload
    candidates.push(path.join(__dirname, '..', '..', 'src', 'bundles', 'codemirror.bundle.js'));
    candidates.push(path.join(__dirname, '..', '..', 'bundles', 'codemirror.bundle.js'));
    candidates.push(path.join(__dirname, '..', 'bundles', 'codemirror.bundle.js'));
    // Project root fallback (when running directly from repo root)
    candidates.push(path.join(process.cwd?.() || '.', 'src', 'bundles', 'codemirror.bundle.js'));
    // Packaged path: under resources/bundles
    if (process && process.resourcesPath) {
        candidates.push(path.join(process.resourcesPath, 'bundles', 'codemirror.bundle.js'));
    }

    for (const bundle of candidates) {
        try {
            if (bundle && fs.existsSync(bundle)) {
                require(bundle);
                break;
            }
        } catch { /* non-fatal */ }
    }

    const CM6 = window.CM6;
    let editor: any = null;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const setStatus = (msg: string) => {
        if (status) status.textContent = msg;
    };

    const updateDiagCount = () => {
        try {
            if (!status || !mount) return;
            const n1 = mount.querySelectorAll('.cm-lintPoint').length;
            const n2 = mount.querySelectorAll('.cm-diagnosticRange, .cm-lintRange').length;
            const n3 = mount.querySelectorAll('.cm-diagnostic').length; // visible tooltip items
            const n4 = mount.querySelectorAll('.cm-lintMarker').length; // gutter markers
            const total = n1 + n2 + n3 + n4;
            const suffix = ` | warnings: ${total}`;
            // status.textContent = statusBase + suffix;
        } catch { /* non-fatal */ }
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
                setTimeout(updateDiagCount, 350);
            } catch { /* non-fatal */ }
        }
    };

    // Create editor immediately so we know if CM6 is active even before data arrives

    if (CM6) {
        editor = CM6.createCodeEditor(mount, {
            value: '',
            onChange: () => {
                if (!utils.isNil(debounceTimer)) clearTimeout(debounceTimer);
                debounceTimer = setTimeout(runSyntaxCheck, 250);
            }
        });
        setStatus('Ready (CM6)');
        // initial diag count shortly after mount
        setTimeout(updateDiagCount, 350);
    } else {
        const ta = document.createElement('textarea');
        ta.id = 'codeText';
        mount.appendChild(ta);
        ta.value = '';
        editor = {
            getValue: () => ta.value,
            setValue: (v: string) => { ta.value = v; },
            focus: () => ta.focus(),
            destroy: () => {}
        };
        setStatus('Ready (fallback)');
    }

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

        try {
            if (editor && typeof editor.setValue === 'function') {
                editor.setValue(existing);
            }
        } catch { /* non-fatal */ }

        // Validate immediately on load so existing syntax issues surface without requiring edits
        runSyntaxCheck();
        setTimeout(runSyntaxCheck, 10);
        setTimeout(updateDiagCount, 400);
    });

    // Initial syntax check after load (in case the editor is created via fallback textarea first)
    setTimeout(runSyntaxCheck, 10);
    setTimeout(updateDiagCount, 400);

    const saveOnly = () => {
        const text = (editor?.getValue?.() || '') as string;
        coms.sendTo('editorWindow', 'setDialogCustomJS', text);
        try {
            if (status) {
                const prev = status.textContent || '';
                status.textContent = 'Saved';
                setTimeout(() => { try { status.textContent = prev || 'Ready'; } catch {} }, 1200);
            }
        } catch { /* non-fatal */ }
    };

    btn.addEventListener('click', () => {
        saveOnly();
        // Explicit close channel for the Code window
        coms.sendTo('main', 'close-codeWindow');
    });

    // Keyboard shortcut: Cmd/Ctrl + S should save without closing
    window.addEventListener('keydown', (ev: KeyboardEvent) => {
        try {
            const isSave = (ev.key || '').toLowerCase() === 's' && (ev.metaKey || ev.ctrlKey);
            if (isSave) {
                ev.preventDefault();
                ev.stopPropagation();
                saveOnly();
            }
        } catch { /* ignore */ }
    }, { capture: true });

    // Allow main process to trigger a save-only action and suppress app menu Save
    ipcRenderer.on('code-save-only', () => {
        try { saveOnly(); } catch { /* ignore */ }
    });
});
