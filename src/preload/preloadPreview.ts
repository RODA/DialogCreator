import { coms } from "../modules/coms";
import { utils } from "../library/utils";
import { renderutils } from "../library/renderutils";
import { AnyElement, StringNumber } from "../interfaces/elements";
import { PreviewDialog, PreviewScriptExports, PreviewUI, PreviewUIEnv } from "../interfaces/preview";

import { API_NAMES, createPreviewUI } from '../library/api';


function buildUI(canvas: HTMLElement): PreviewUI {
    const env: PreviewUIEnv = {
        findWrapper: (name: string) => renderutils.findWrapper(name, canvas),
        findRadioGroupMembers: (group: string) => renderutils.findRadioGroupMembers(group, canvas),
        updateElement: (el, props) => renderutils.updateElement(el, props),
        showRuntimeError: (msg: string) => renderutils.showRuntimeError(msg, canvas),
        logToEditor: (msg: string) => coms.sendTo('editorWindow', 'consolog', msg),
        showDialogMessage: (type, message, detail) => coms.sendTo(
            'main',
            'showDialogMessage',
            type,
            message,
            detail
        ),
        openSyntaxPanel: (command: string) => coms.sendTo('main', 'openSyntaxPanel', command)
    };

    return createPreviewUI(env);
}


function renderPreview(dialog: PreviewDialog) {
    const root = document.getElementById("preview-root");
    if (!root) return;
    root.innerHTML = "";

    const width = Number(dialog.properties.width) || 640;
    const height = Number(dialog.properties.height) || 480;
    const background = dialog.properties.background || "#ffffff";

    // Reflect dialog title in the window/document title for user clarity
    try {
        const title = String((dialog as any)?.properties?.title || (dialog as any)?.properties?.name || 'Preview');
        if (title && typeof title === 'string') {
            document.title = title;
        }
    } catch { /* no-op */ }

    const canvas = document.createElement("div");
    canvas.className = "preview-canvas";
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.style.backgroundColor = String(background);

    // Align typography with editor
    const fs = Number(dialog.properties.fontSize);
    if (Number.isFinite(fs) && fs > 0) {
        coms.fontSize = fs;
    }

    const created: HTMLElement[] = [];
    // Dispose previous user handlers if any
    window.__userHandlers?.forEach((fn: () => void) => {
        fn();
    });

    window.__userHandlers = [] as Array<() => void>;
    // First pass: render only non-Group elements. Groups are reconstructed after.
    const allElements = Array.from((dialog as any).elements || []) as AnyElement[];
    for (const data of allElements) {
        const t = String((data as any)?.type || '').trim();
        if (t === 'Group') {
            continue; // skip groups in first pass
        }
        // Preserve the saved id from JSON; makeElement mutates data.id to a new uuid
        const savedId = String((data as any)?.id || '');
        const core = renderutils.makeElement({ ...data } as AnyElement);

        const wrapper = document.createElement('div');
        wrapper.className = 'element-wrapper';
        wrapper.style.position = 'absolute';

        const desiredId = savedId || String(core.id);
        const desiredType = String(data.type || core.dataset.type || '').trim();
        const desiredNameId = String(data.nameid || core.dataset.nameid || '');

        const left = Number(data.left ?? core.dataset.left ?? 0);
        const top = Number(data.top ?? core.dataset.top ?? 0);

        wrapper.id = desiredId;
        wrapper.style.left = `${left}px`;
        wrapper.style.top = `${top}px`;
        wrapper.dataset.left = String(left);
        wrapper.dataset.top = String(top);
        if (desiredType) wrapper.dataset.type = desiredType;
        if (desiredNameId) wrapper.dataset.nameid = desiredNameId;
        wrapper.dataset.parentId = String(data.parentId || dialog.id || '');

        // Mirror all dataset properties from the inner element onto the wrapper
        // so Preview UI helpers read the same values as in the Editor.
        try {
            const ds = (core as HTMLElement).dataset || {} as DOMStringMap;
            Object.keys(ds).forEach((key) => {
                const val = ds[key as keyof DOMStringMap];
                if (typeof val === 'string') {
                    wrapper.dataset[key] = val;
                }
            });
        } catch { /* no-op */ }

        core.id = `${desiredId}-inner`;
        core.style.left = '0px';
        core.style.top = '0px';
        if (desiredType === 'Button') core.style.position = 'relative';

        // Ensure child control ids track the restored wrapper id (so helpers that query by id work)
        try {
            if (desiredType === 'Checkbox') {
                const custom = core.querySelector('.custom-checkbox') as HTMLElement | null;
                if (custom) custom.id = `checkbox-${desiredId}`;
            } else if (desiredType === 'Radio') {
                const custom = core.querySelector('.custom-radio') as HTMLElement | null;
                if (custom) custom.id = `radio-${desiredId}`;
            } else if (desiredType === 'Counter') {
                const display = core.querySelector('.counter-value') as HTMLDivElement | null;
                const inc = core.querySelector('.counter-arrow.up') as HTMLDivElement | null;
                const dec = core.querySelector('.counter-arrow.down') as HTMLDivElement | null;
                if (display) display.id = `counter-value-${desiredId}`;
                if (inc) inc.id = `counter-increase-${desiredId}`;
                if (dec) dec.id = `counter-decrease-${desiredId}`;
            } else if (desiredType === 'Slider') {
                const handle = core.querySelector('.slider-handle') as HTMLDivElement | null;
                if (handle) handle.id = `slider-handle-${desiredId}`;
            }
        } catch {}

        // Remove the drag-protection overlay used in the editor so interactions work in preview
        const cover = core.querySelector('.elementcover');
        if (cover && cover.parentElement) {
            cover.parentElement.removeChild(cover);
        }

        wrapper.appendChild(core);
        canvas.appendChild(wrapper);
        created.push(wrapper);

        const element = wrapper;

        // Select: populate options from value (comma/semicolon separated)
        if (desiredType === 'Select') {
            const select = core.querySelector('select') as HTMLSelectElement | null;
            if (select) {
                const raw = core.dataset.value ?? '';
                const text = String(raw);
                const tokens = text.split(/[;,]/).map(s => s.trim()).filter(s => s.length > 0);
                select.innerHTML = '';
                if (tokens.length === 0) {
                    const opt = document.createElement('option');
                    opt.value = '';
                    opt.textContent = '';
                    select.appendChild(opt);
                } else {
                    for (const t of tokens) {
                        const opt = document.createElement('option');
                        opt.value = t;
                        opt.textContent = t;
                        select.appendChild(opt);
                    }
                }
            }
        }

        // Checkbox: reflect isChecked
        if (desiredType === 'Checkbox') {
            const custom = core.querySelector('.custom-checkbox') as HTMLElement | null;
            if (custom) {
                const checked = utils.isTrue(core.dataset.isChecked);
                custom.setAttribute('aria-checked', String(checked));
                custom.classList.toggle('checked', checked);
                custom.addEventListener('keydown', (e: KeyboardEvent) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        (e.currentTarget as HTMLElement).click();
                    }
                });
            }
        }

        // Radio: reflect isSelected and make it interactive in preview
        if (desiredType === 'Radio') {
            const desiredGroup = String(core.dataset.group || '').trim();
            if (desiredGroup) {
                wrapper.dataset.group = desiredGroup;
            }
            const custom = core.querySelector('.custom-radio') as HTMLElement | null;
            const native = core.querySelector('input[type="radio"]') as HTMLInputElement | null;

            const syncState = (checked: boolean) => {
                const flag = checked ? 'true' : 'false';
                wrapper.dataset.isSelected = flag;
                custom?.setAttribute('aria-checked', flag);
                custom?.classList.toggle('selected', checked);
            };

            const ensureGroupConsistency = () => {
                const group = custom?.getAttribute('group') || native?.name || '';
                if (!group) return;
                document.querySelectorAll(`.custom-radio[group="${group}"]`).forEach((el) => {
                    const node = el as HTMLElement;
                    if (node === custom) return;
                    node.setAttribute('aria-checked', 'false');
                    node.classList.remove('selected');
                    const host = node.closest('.element-wrapper') as HTMLElement | null;
                    if (host) host.dataset.isSelected = 'false';
                });
            };

            const selected = utils.isTrue(core.dataset.isSelected);
            if (native) {
                native.checked = selected;
            }
            syncState(selected);
            ensureGroupConsistency();

            if (custom) {
                custom.addEventListener('keydown', (e: KeyboardEvent) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        native?.click();
                    }
                });
            }

            if (native) {
                native.addEventListener('change', () => {
                    ensureGroupConsistency();
                    syncState(native.checked);
                });
                native.addEventListener('click', () => {
                    // click already handled by change; no-op to avoid duplicate triggers
                });
            }
        }

        // Counter: wire increase/decrease within [minval, maxval]
        if (desiredType === 'Counter') {
            const display = core.querySelector('.counter-value') as HTMLDivElement | null;
            const inc = core.querySelector('.counter-arrow.up') as HTMLDivElement | null;
            const dec = core.querySelector('.counter-arrow.down') as HTMLDivElement | null;
            const rawMin = Number(core.dataset.minval ?? core.dataset.startval ?? 0);
            const min = Number.isFinite(rawMin) ? rawMin : 0;
            const rawMax = Number(core.dataset.maxval ?? min);
            const max = Number.isFinite(rawMax) ? rawMax : min;

            const getValue = () => Number(display?.textContent ?? min);
            const setValue = (v: number) => { if (display) display.textContent = String(v); };

            inc?.addEventListener('click', () => {
                const curr = getValue();
                if (curr < max) setValue(curr + 1);
            });

            dec?.addEventListener('click', () => {
                const curr = getValue();
                if (curr > min) setValue(curr - 1);
            });
        }

        // Button: prevent text selection and add pressed/click feedback
        if (desiredType === 'Button') {
            const doPress = () => core.classList.add('btn-active');
            const clearPress = () => core.classList.remove('btn-active');
            core.addEventListener('mousedown', doPress);
            core.addEventListener('mouseup', clearPress);
            core.addEventListener('mouseleave', clearPress);
        }

        // Slider: make handle draggable within the track in preview
        if (desiredType === 'Slider') {
            const handle = core.querySelector('.slider-handle') as HTMLDivElement | null;
            if (!handle) continue;

            let dragging = false;
            const direction = (core.dataset.direction || 'horizontal').toLowerCase();

            const onMove = (ev: MouseEvent) => {
                if (!dragging) return;
                const rect = core.getBoundingClientRect();
                if (rect.width <= 0 || rect.height <= 0) return;
                let percent = 0;
                if (direction === 'vertical') {
                    const relY = ev.clientY - rect.top;
                    const clamped = Math.max(0, Math.min(rect.height, relY));
                    percent = Math.round(100 - (clamped / rect.height) * 100);
                } else {
                    const relX = ev.clientX - rect.left;
                    const clamped = Math.max(0, Math.min(rect.width, relX));
                    percent = Math.round((clamped / rect.width) * 100);
                }
                wrapper.dataset.handlepos = String(percent);
                renderutils.updateHandleStyle(handle, {
                    handleshape: core.dataset.handleshape || 'triangle',
                    direction: core.dataset.direction || 'horizontal',
                    handlesize: core.dataset.handlesize || '8',
                    handleColor: core.dataset.handleColor || '#75c775',
                    handlepos: String(percent)
                } as StringNumber);
            };

            const onUp = () => {
                dragging = false;
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };

            handle.addEventListener('mousedown', (ev: MouseEvent) => {
                if (core.classList.contains('disabled-div') || !utils.isTrue(data.isEnabled)) return;
                dragging = true;
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
                ev.preventDefault();
            });
        }

        // Container remains as-is for now

        // Visibility / Enabled
        if (!utils.isTrue(data.isVisible)) {
            wrapper.style.display = 'none';
        }

        if (!utils.isTrue(data.isEnabled)) {
            wrapper.classList.add('disabled-div');
            core.style.pointerEvents = 'none';
        }
    }

    // Recreate persistent groups after individual elements exist in the DOM
    try {
        const groups = (allElements || []).filter((e: any) => String(e?.type || '').trim() === 'Group');
        for (const g of groups) {
            const elementIds: string[] = Array.isArray((g as any).elementIds)
                ? (g as any).elementIds
                : String((g as any).elementIds || '')
                    .split(',')
                    .map((s: string) => s.trim())
                    .filter((s: string) => s.length > 0);

            if (!elementIds.length) continue;

            const gl = Number((g as any).left ?? 0);
            const gt = Number((g as any).top ?? 0);
            const gid = String((g as any).id || `group-${Date.now()}-${Math.random().toString(36).slice(2)}`);
            const gname = String((g as any).nameid || '').trim();

            const group = document.createElement('div');
            group.id = gid;
            group.className = 'element-group';
            group.style.position = 'absolute';
            group.style.left = `${gl}px`;
            group.style.top = `${gt}px`;
            group.dataset.type = 'Group';
            if (gname) group.dataset.nameid = gname;
            group.dataset.left = String(gl);
            group.dataset.top = String(gt);

            // Move each child under the group container; convert to relative positions
            let moved = 0;
            elementIds.forEach(cid => {
                // Look up within the unattached canvas subtree
                let child = canvas.querySelector(`[id="${cid}"]`) as HTMLElement | null;
                if (!child) {
                    const inner = canvas.querySelector(`[id="${cid}-inner"]`) as HTMLElement | null;
                    if (inner) child = inner.closest('.element-wrapper') as HTMLElement | null;
                }
                if (!child) return;
                const absLeft = Number(child.dataset.left ?? (parseInt(child.style.left || '0', 10) || 0));
                const absTop = Number(child.dataset.top ?? (parseInt(child.style.top || '0', 10) || 0));
                const relLeft = absLeft - gl;
                const relTop = absTop - gt;
                child.style.left = `${relLeft}px`;
                child.style.top = `${relTop}px`;
                child.dataset.left = String(relLeft);
                child.dataset.top = String(relTop);
                group.appendChild(child);
                moved++;
            });

            // Optionally compute group size to wrap children
            try {
                const bounds = renderutils.computeBounds(elementIds);
                if (bounds) {
                    group.style.width = `${bounds.width}px`;
                    group.style.height = `${bounds.height}px`;
                }
            } catch { /* ignore sizing issues */ }

            canvas.appendChild(group);
        }
    } catch { /* ignore group reconstruction errors */ }

    // Note: customJS runs later (post-render block below)

    // Conditions window and engine removed: interactions now only update datasets and fire change events.
    // Hook changes on interactive elements to fire change notifications for custom JS
    created.forEach(el => {
        const type = String(el.dataset?.type || '').toLowerCase();
        if (type === 'checkbox') {
            const custom = el.querySelector('.custom-checkbox') as HTMLElement | null;
            custom?.addEventListener('click', () => {
                const now = custom?.getAttribute('aria-checked') === 'true';
                el.dataset.isChecked = String(now);
                el.dispatchEvent(new Event('change', { bubbles: true }));
            });
        } else if (type === 'radio') {
            const native = el.querySelector('input[type="radio"]') as HTMLInputElement | null;
            if (native) {
                native.addEventListener('change', () => {
                    el.dataset.isSelected = String(native.checked);
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                });
            }
        } else if (type === 'select') {
            if (el instanceof HTMLSelectElement) {
                el.addEventListener('change', () => {
                    el.dataset.value = String(el.value || '');
                });
            } else {
                const sel = el.querySelector('select') as HTMLSelectElement | null;
                sel?.addEventListener('change', () => {
                    el.dataset.value = String(sel.value || '');
                });
            }
        } else if (type === 'input') {
            const input = el.querySelector('input') as HTMLInputElement | null;
            if (input) {
                let focusValue = input.value;
                let pendingSyntheticChange = false;

                input.addEventListener('focus', () => {
                    focusValue = input.value;
                    pendingSyntheticChange = false;
                });

                input.addEventListener('change', () => {
                    el.dataset.value = String(input.value || '');
                    focusValue = input.value;
                    pendingSyntheticChange = false;
                });

                input.addEventListener('keydown', (ev: KeyboardEvent) => {
                    if (ev.key !== 'Enter' || ev.isComposing) {
                        return;
                    }

                    ev.preventDefault();
                    ev.stopPropagation();

                    const currentValue = input.value;
                    const valueChanged = currentValue !== focusValue;

                    pendingSyntheticChange = valueChanged;
                    input.blur();

                    if (valueChanged) {
                        queueMicrotask(() => {
                            if (!pendingSyntheticChange) {
                                return;
                            }
                            pendingSyntheticChange = false;
                            input.dispatchEvent(new Event('change', { bubbles: true }));
                        });
                    }
                });
            }
        } else if (type === 'counter') {
            const display = document.querySelector(`#counter-value-${el.id}`) as HTMLDivElement | null;
            const inc = document.querySelector(`#counter-increase-${el.id}`) as HTMLDivElement | null;
            const dec = document.querySelector(`#counter-decrease-${el.id}`) as HTMLDivElement | null;
            const sync = () => {
                el.dataset.startval = String(Number(display?.textContent || el.dataset.startval || 0));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            };
            inc?.addEventListener('click', sync);
            dec?.addEventListener('click', sync);
        } else if (type === 'slider') {
            const handle = el.querySelector('.slider-handle') as HTMLDivElement | null;
            const onUp = () => {
                el.dataset.handlepos = String(el.dataset.handlepos || '50');
            };
            handle?.addEventListener('mouseup', onUp);
        }
    });

    document.addEventListener('keydown', (ev: KeyboardEvent) => {
        const key = ev.key || ev.code;
        if (key === 'Escape' || key === 'Esc') {
            // Dismiss color pickers
            Array.from(document.querySelectorAll('.color-popover')).forEach((el) => {
                (el as HTMLElement).style.display = 'none';
            });

            // If a runtime/customJS error overlay is visible, remove it and stay in Preview
            const overlay = document.querySelector('.preview-canvas .customjs-error') as HTMLDivElement | null;
            if (overlay && overlay.parentElement) {
                overlay.parentElement.removeChild(overlay);
                ev.preventDefault();
                ev.stopPropagation();
                return;
            }

            // Otherwise, close the Preview window
            coms.sendTo('main', 'close-previewWindow');

            ev.preventDefault();
            ev.stopPropagation();
        }
    }, true);

    // Attach canvas to DOM before executing custom code, so style/computedStyle work reliably
    root.appendChild(canvas);

    // Execute custom code after elements (and groups) are in the DOM
    try {
        const rawTop = (dialog as any)?.customJS;
        const code = String(typeof rawTop === 'string' && rawTop.length ? rawTop : '');
        coms.sendTo('editorWindow', 'consolog', `Preview: customJS detected (${code.trim().length} chars, post-render)`);
        if (code && code.trim().length) {
            const ui = buildUI(canvas);
            renderutils.exposeNameGlobals(canvas);
            renderutils.exposeEventNameGlobals();

            const exports: PreviewScriptExports = {};
            const preludeList = API_NAMES.join(', ');

            // Build safe local bindings for element name IDs and radio groups, so
            // bare identifiers in customJS (e.g., getValue(datasets)) are always
            // defined in the function scope regardless of existing window globals.
            const elementsWithName = Array.from(canvas.querySelectorAll<HTMLElement>('[data-nameid]'));
            const nameIds = Array.from(new Set(
                elementsWithName
                    .map(el => String(el.dataset?.nameid || '').trim())
                    .filter(n => n && utils.isIdentifier(n))
            ));

            const groupNamesSet = new Set<string>();
            const customRadios = Array.from(canvas.querySelectorAll<HTMLElement>('.custom-radio[group]'));
            customRadios.forEach(node => {
                const g = (node.getAttribute('group') || '').trim();
                if (g) groupNamesSet.add(g);
            });
            const wrappers = Array.from(canvas.querySelectorAll<HTMLElement>('.element-wrapper[data-group]'));
            wrappers.forEach(w => {
                const t = String(w.dataset?.type || '').trim();
                if (t !== 'Radio') return;
                const g = (w.dataset.group || '').trim();
                if (g) groupNamesSet.add(g);
            });

            const groupNames = Array.from(groupNamesSet).filter(n => n && utils.isIdentifier(n));

            const allBareNames = Array.from(new Set([...nameIds, ...groupNames]));
            // try {
            //     coms.sendTo('editorWindow', 'consolog', `Preview: bare identifiers available -> ${allBareNames.join(', ')}`);
            // } catch { /* ignore */ }

            // Note: base-name aliasing (e.g., mapping datasets -> 'datasets1')
            // can collide with user-declared variables and cause TDZ errors.
            // To keep customJS predictable, we only expose the exact name IDs
            // present in the dialog.

            const namePrelude = allBareNames
                .map(n => `const ${n} = ${JSON.stringify(n)};`)
                .join('\n');

            const bindings = `const { ${preludeList} } = ui;\nconst log = ui.log.bind(ui);\n${namePrelude}`;
            let fn: Function | null = null;
            try {
                fn = new Function('ui', 'exports', bindings + '\n' + code);
            } catch (e: any) {
                const msg = `Code syntax error: ${String(e && e.message ? e.message : e)}`;
                coms.sendTo('editorWindow', 'consolog', msg);
            }

            if (fn) {
                try {
                    fn(ui, exports);
                    coms.sendTo('editorWindow', 'consolog', 'Preview: customJS executed after render.');
                } catch (e: any) {
                    const msg = `Action code runtime error: ${String(e && e.message ? e.message : e)}`;
                    const overlay = document.createElement('div');
                    overlay.className = 'customjs-error';
                    overlay.textContent = msg;
                    canvas.appendChild(overlay);
                }
            }

            if (fn && typeof exports.init === 'function') {
                try { exports.init(ui); } catch {}
            }

            window.__userHandlers!.push(() => {
                try { if (typeof exports.dispose === 'function') exports.dispose(ui); } finally { ui.__disposeAll?.(); }
            });
        } else {
            coms.sendTo('editorWindow', 'consolog', 'Preview: no customJS to execute (post-render).');
        }
    } catch {}
}

// Hot-reload linked CSS stylesheets in the Preview window
coms.on('reload-css', () => {
    try {
        const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
        const ts = Date.now();
        links.forEach((link) => {
            try {
                const base = link.href.split('?')[0];
                link.href = `${base}?v=${ts}`;
            } catch { /* ignore per-link errors */ }
        });
    } catch { /* ignore */ }
});


// Render a snapshot of the dialog using the exact same element factory as the editor
window.addEventListener("DOMContentLoaded", () => {
    coms.on("renderPreview", (data: unknown) => {
        try {
            const payload = typeof data === "string" ? JSON.parse(data as string) : data;
            renderPreview(payload);
        } catch (e) {
            coms.sendTo(
                'editorWindow',
                'consolog',
                `Failed to parse preview data: ${String(utils.isRecord(e) && e.message ? e.message : e)}`
            );
        }
    });
});
