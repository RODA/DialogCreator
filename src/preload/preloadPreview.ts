import { coms } from "../modules/coms";
import { utils } from "../library/utils";
import { renderutils } from "../library/renderutils";
import { AnyElement, StringNumber } from "../interfaces/elements";
import { PreviewDialog, PreviewScriptExports, PreviewUI, PreviewUIEnv } from "../interfaces/preview";

import { API_NAMES, createPreviewUI } from '../library/api';


function buildUI(canvas: HTMLElement): PreviewUI {
    const env: PreviewUIEnv = {
        findWrapper: (name: string) => renderutils.findWrapper(name, canvas),
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
        // call: (service, args, cb) => new Promise((resolve) => {
        //     const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        //     const replyChannel = `service-reply-${requestId}`;

        //     coms.once(replyChannel, (result) => {
        //         try {
        //             if (typeof cb === 'function') {
        //                 cb(result);
        //             }
        //         } finally {
        //             resolve(result);
        //         }
        //     });

        //     coms.sendTo(
        //         'main',
        //         'service-call',
        //         requestId,
        //         service,
        //         args ?? null
        //     );
        // })
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
    for (const data of dialog.elements || []) {
        const core = renderutils.makeElement({ ...data } as AnyElement);

        const wrapper = document.createElement('div');
        wrapper.className = 'element-wrapper';
        wrapper.style.position = 'absolute';

        const desiredId = String(data.id || core.id);
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
                const raw = data.value ?? '';
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
                const checked = utils.isTrue(data.isChecked);
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
            const custom = core.querySelector('.custom-radio') as HTMLElement | null;
            if (custom) {
                const selected = utils.isTrue(data.isSelected);
                custom.setAttribute('aria-checked', String(selected));
                custom.classList.toggle('selected', selected);
                const selectThis = () => {
                    const group = custom.getAttribute('group') || '';
                    if (group) {
                        document.querySelectorAll(`.custom-radio[group="${group}"]`).forEach((el) => {
                            const host = (el as HTMLElement).closest('.element-wrapper') as HTMLElement | null;
                            if (host) {
                                host.dataset.isSelected = 'false';
                            }
                            el.setAttribute('aria-checked', 'false');
                            el.classList.remove('selected');
                        });
                    }
                    wrapper.dataset.isSelected = 'true';
                    custom.setAttribute('aria-checked', 'true');
                    custom.classList.add('selected');
                };
                custom.addEventListener('click', selectThis);
                custom.addEventListener('keydown', (e: KeyboardEvent) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        selectThis();
                    }
                });
            }
        }

        // Counter: wire increase/decrease within [minval, maxval]
        if (desiredType === 'Counter') {
            const display = core.querySelector('.counter-value') as HTMLDivElement | null;
            const inc = core.querySelector('.counter-arrow.up') as HTMLDivElement | null;
            const dec = core.querySelector('.counter-arrow.down') as HTMLDivElement | null;
            const rawMin = Number(data.minval ?? data.startval ?? 0);
            const min = Number.isFinite(rawMin) ? rawMin : 0;
            const rawMax = Number(data.maxval ?? min);
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
            core.addEventListener('click', () => {
                if (!utils.isTrue(data.isEnabled)) return;
                const action = String(data.onClick || 'run');
                switch (action) {
                    case 'reset':
                        coms.sendTo('editorWindow', 'consolog', `Reset action for "${data.nameid || 'Button'}"`);
                        break;
                    case 'run':
                    default:
                        coms.sendTo('editorWindow', 'consolog', `Run action for "${data.nameid || 'Button'}"`);
                        break;
                }
            });
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
            const custom = el.querySelector('.custom-radio') as HTMLElement | null;
            custom?.addEventListener('click', () => {
                // Update this radio and group mates
                el.dataset.isSelected = 'true';
                const group = custom?.getAttribute('group') || '';
                if (group) {
                    document.querySelectorAll(`.custom-radio[group="${group}"]`).forEach((r) => {
                        const host = (r as HTMLElement).closest('.element-div') as HTMLElement | null;
                        if (host && host !== el) {
                            host.dataset.isSelected = 'false';
                        }
                    });
                }
                el.dispatchEvent(new Event('change', { bubbles: true }));
            });
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
            input?.addEventListener('change', () => {
                el.dataset.value = String(input.value || '');
            });
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

    // Run custom user code, if any
    // Support both new top-level customJS and legacy syntax.customJS
    const rawTop = dialog?.customJS;
    const code = String(typeof rawTop === 'string' && rawTop.length ? rawTop : '');

    // Forward a small debug note to BOTH the Preview (local console) and the Editor console
    coms.sendTo(
        'editorWindow',
        'consolog',
        `Preview: customJS detected (${code.trim().length} chars)`
    );

    if (code && code.trim().length) {
        const ui = buildUI(canvas);

    // Expose element names as global variables mapping to their own string
        // (so ui.value(counter1) works)
        renderutils.exposeNameGlobals(canvas);

    // Expose common event names as globals mapping to their own string
    // (so ui.trigger(checkbox1, change) works)
    renderutils.exposeEventNameGlobals();

        // Provide init/dispose if present
    const exports: PreviewScriptExports = {};

        // Wrap code in a Function with ui in scope
        let fn: Function | null = null;
        try {
            // Strictly controlled API: expose a curated set of local bindings
            const preludeList = API_NAMES.join(', ');
            // Expose curated helpers plus a private alias: log -> ui.log (not part of API_NAMES)
            const bindings = `const { ${preludeList} } = ui;
            const log = ui.log.bind(ui);`;

            fn = new Function('ui', 'exports', bindings + '\n' + code);

        } catch (e: any) {
            const msg = `Code syntax error: ${String(e && e.message ? e.message : e)}`;
            coms.sendTo(
                'editorWindow',
                'consolog',
                msg
            );

            // Show a friendly message in Preview
            const err = document.createElement('div');
            err.className = 'customjs-error';
            err.textContent = msg;
            canvas.appendChild(err);
            fn = null;
        }

        if (fn) {
            try {
                fn(ui, exports);
                coms.sendTo(
                    'editorWindow',
                    'consolog',
                    'Preview: customJS executed top-level.'
                );
            } catch (e: any) {
                const msg = `Custom code runtime error: ${String(e && e.message ? e.message : e)}`;
                // Reuse runtime error overlay
                const overlay = document.createElement('div');
                overlay.className = 'customjs-error';
                overlay.textContent = msg;
                canvas.appendChild(overlay);
                coms.sendTo('editorWindow', 'consolog', msg);
            }
        }

        if (fn && typeof exports.init === 'function') {
            try {
                exports.init(ui);
                coms.sendTo(
                    'editorWindow',
                    'consolog',
                    'Preview: exports.init() completed.'
                );
            } catch (e) {
                const msg = `init() error: ${String(utils.isRecord(e) && e.message ? e.message : e)}`;
                coms.sendTo('editorWindow', 'consolog', msg);
                const err = document.createElement('div');
                err.className = 'customjs-error';
                err.textContent = msg;
                canvas.appendChild(err);
            }
        }

        // Register disposer
        window.__userHandlers!.push(() => {
            try {
                if (typeof exports.dispose === 'function') {
                    exports.dispose(ui);
                }
            } finally {
                ui.__disposeAll?.();
            }
        });
    } else {
        coms.sendTo(
            'editorWindow',
            'consolog',
            'Preview: no customJS to execute'
        );
    }

    root.appendChild(canvas);
}


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

    // Renderer adapter executor: run services configured with adapter 'renderer' inside this window
    coms.on('service-renderer-exec', async (...args: unknown[]) => {
        const [reqId, moduleName, method, payload] = args as [string, string, string, unknown];
        // Try dynamic resolution by known names; for WebR, look for a global or lazy import
        const reply = (result: unknown) => {
            coms.sendTo('main', 'service-renderer-reply', reqId, result);
        };
        try {
            let mod: any = null;
            // Allow predefined handler name 'webr' meaning use global WebR
            if (moduleName.toLowerCase() === 'webr') {
                mod = (window as any).webR || (window as any).WebR || null;
                if (!mod) {
                    // Attempt dynamic import if a loader is available (user may include it via customJS)
                    try {
                        // @ts-ignore
                        mod = await import('webr');
                    } catch {
                        reply({ ok: false, error: 'WebR not available in renderer. Load it in customJS or include the script.' });
                        return;
                    }
                }
            } else if ((window as any)[moduleName]) {
                mod = (window as any)[moduleName];
            }

            if (!mod) {
                reply({ ok: false, error: `Renderer module not found: ${moduleName}` });
                return;
            }

            const fn = method && method !== 'default' ? mod[method] : (mod.default || mod);
            if (typeof fn !== 'function') {
                reply({ ok: false, error: `Renderer method not found: ${method || 'default'}` });
                return;
            }

            const out = await Promise.resolve(fn(payload));
            reply({ ok: true, data: out });
        } catch (e: any) {
            reply({ ok: false, error: String(e?.message || e) });
        }
    });
});

