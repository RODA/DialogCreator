import { coms } from "../modules/coms";
import { utils } from "../library/utils";
import { renderutils } from "../library/renderutils";
import { conditions as cond } from "../modules/conditions";
import { AnyElement, StringNumber } from "../interfaces/elements";
import { PreviewDialog, PreviewScriptExports, PreviewUI } from "../interfaces/preview";

// Controlled set of allowed event names for the custom Preview UI API
const ALLOWED_EVENTS = new Set<string>(['click', 'change', 'input']);

function normalizeEventName(ev: unknown): string | null {
    const s = String(ev ?? '').trim().toLowerCase();
    if (!s || !ALLOWED_EVENTS.has(s)) return null;
    return s;
}


function buildUI(canvas: HTMLElement): PreviewUI {
    const disposers: Array<() => void> = [];
    const warnOnce = new Set<string>();
    const warn = (k: string, msg: string) => {
        if (!warnOnce.has(k)) {
            coms.sendTo(
                'editorWindow',
                'consolog',
                'Warning: ' + msg
            );
            warnOnce.add(k);
        }
    };

    // Surface runtime errors to end users in Preview (not just console)
    const showRuntimeError = (msg: string) => {
        // Forward to editor console as well
        coms.sendTo('editorWindow', 'consolog', msg);
        // Create or update a visible error box inside the canvas
        let box = canvas.querySelector('.customjs-error.runtime') as HTMLDivElement | null;
        if (!box) {
            box = document.createElement('div');
            box.className = 'customjs-error runtime';
            canvas.appendChild(box);
        }
        box.textContent = msg;
    };

    const findWrapper = (name: string): HTMLElement | null => {
        const n = String(name || '').trim();
        if (!n) return null;
        // Prefer the top-level element that carries a real element type, to avoid matching inner nodes
        const matches = Array.from(canvas.querySelectorAll<HTMLElement>(`[data-nameid="${n}"]`));
        if (matches.length === 0) return null;
        const withType = matches.find(el => (el.dataset?.type || '').length > 0);
        return withType || matches[0] || null;
    };

    const inner = (el: HTMLElement | null) => el?.firstElementChild as HTMLElement | null;
    const typeOf = (el: HTMLElement | null) => String(el?.dataset?.type || '');

    const api: PreviewUI = {
        el: (name: string) => findWrapper(name),

        inner: (name: string) => inner(findWrapper(name)),

        type: (name: string) => typeOf(findWrapper(name)),

        id: (name: string) => findWrapper(name)?.id || null,

        // Forward logs to the Editor console for visibility during Preview
        log: (...args: any[]) => {
            coms.sendTo(
                'editorWindow',
                'consolog',
                args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ')
            );
        },

        get: (name: string, prop: string) => {
            const el = findWrapper(name);
            const eltype = typeOf(el);
            const inn = inner(el);

            if (!el) return null;

            switch (eltype) {
                case 'Input': {
                    const input = (el instanceof HTMLInputElement ? el : (inn as HTMLInputElement | null));
                    return input?.value ?? '';
                }

                case 'Label': return inn?.textContent ?? '';

                case 'Select': {
                    const sel = (el instanceof HTMLSelectElement ? el : (inn as HTMLSelectElement | null));
                    return sel?.value ?? '';
                }

                case 'Checkbox': return el.dataset.isChecked === 'true';

                case 'Radio': return el.dataset.isSelected === 'true';

                case 'Counter': {
                    if (utils.isNull(prop) || prop === 'value') {
                        const display = el.querySelector('.counter-value') as HTMLDivElement | null;
                        const txt = display?.textContent ?? el.dataset.startval ?? '0';
                        const n = Number(txt);
                        return Number.isFinite(n) ? n : 0;
                    }
                    return el.dataset[prop] ?? null;
                }

                default:
                    // generic dataset prop fallback
                    return el.dataset[prop] ?? null;
            }
        },

        set: (name: string, prop: string, value: any) => {
            const el = findWrapper(name); if (!el) return;
            const t = typeOf(el); const inn = inner(el);
            const v = value as any;

            switch (t) {
                case 'Input':
                    if (prop === 'value' && inn instanceof HTMLInputElement) {
                        inn.value = String(v); el.dataset.value = String(v);
                    } else {
                        warn(`${name}:${prop}`, `Unsupported set(${t}, ${prop})`);
                    }
                    break;

                case 'Label':
                    if (prop === 'value') {
                        el.dataset.value = String(v);
                        renderutils.updateElement(
                            el, { value: String(v) } as any
                        );
                    } else {
                        warn(`${name}:${prop}`, `Unsupported set(${t}, ${prop})`);
                    }
                    break;

                case 'Select':
                    const sel = (inn instanceof HTMLSelectElement ? inn : (el as HTMLSelectElement));
                    if (prop === 'value' && sel) {
                        sel.value = String(v);
                        el.dataset.value = String(v);
                    } else {
                        warn(`${name}:${prop}`, `Unsupported set(${t}, ${prop})`);
                    }
                    break;

                case 'Checkbox':
                    if (prop === 'checked') {
                        renderutils.updateElement(el, { isChecked: v ? 'true' : 'false' } as any);
                    } else {
                        warn(`${name}:${prop}`, `Unsupported set(${t}, ${prop})`);
                    }
                    break;

                case 'Radio':
                    if (prop === 'selected') {
                        renderutils.updateElement(el, { isSelected: v ? 'true' : 'false' } as any);
                    } else {
                        warn(`${name}:${prop}`, `Unsupported set(${t}, ${prop})`);
                    }
                    break;

                case 'Counter':
                    if (prop === 'value') {
                        const min = Number(el.dataset.startval ?? '0');
                        const max = Number(el.dataset.maxval ?? String(min));
                        let n = Number(v);

                        if (!Number.isFinite(n)) {
                            warn(`${name}:${prop}`, `Invalid number: ${v}`);
                            return;
                        }

                        if (n < min) n = min;
                        if (n > max) n = max;

                        const display = el.querySelector('.counter-value') as HTMLDivElement | null;
                        if (display) {
                            display.textContent = String(n);
                        }

                        el.dataset.startval = String(n);
                    } else {
                        warn(`${name}:${prop}`, `Unsupported set(${t}, ${prop})`);
                    }
                    break;
                default:
                    warn(`${name}:${prop}`, `Unsupported element type ${t} for set()`);
                    break;
            }
        },

        text: (name: string, ...rest: [unknown?]): any => {
            if (rest.length === 0) {
                return api.get(name, 'value');
            }
            api.set(name, 'value', rest[0]);
        },

        value: (name: string, ...rest: [unknown?]): any => {
            if (rest.length === 0) {
                return api.get(name, 'value');
            }
            api.set(name, 'value', rest[0]);
        },


        // Checked sugar for Checkbox/Radio – reads live aria-checked when available
        checked: (name: string) => {
            const el = findWrapper(name);
            if (!el) return false;

            const eltype = typeOf(el);

            if (eltype === 'Checkbox') {
                const custom = el.querySelector('.custom-checkbox') as HTMLElement | null;
                if (custom) {
                    return custom.getAttribute('aria-checked') === 'true';
                }
                return el.dataset.isChecked === 'true';
            }

            if (eltype === 'Radio') {
                const custom = el.querySelector('.custom-radio') as HTMLElement | null;
                if (custom) {
                    return custom.getAttribute('aria-checked') === 'true';
                }
                return el.dataset.isSelected === 'true';
            }

            return false;
        },

        // Visibility: true when not display:none
        isVisible: (name: string) => {
            const el = findWrapper(name);
            if (!el) return false;
            const ds = (el.style?.display || '').toLowerCase();
            return ds !== 'none';
        },

        // Enabled: true when not carrying the disabled-div class
        isEnabled: (name: string) => {
            const el = findWrapper(name);
            if (!el) return false;
            return !el.classList.contains('disabled-div');
        },

        // Show/hide sugar: ui.show(name) shows, ui.hide(name) hides, ui.show(name, on) explicit
        show: (name: string, on: boolean = true) => {
            const el = findWrapper(name); if (!el) return;
            // Direct style mutation for reliability in Preview
            if (on) {
                el.dataset.isVisible = 'true';
                el.style.display = '';
                el.classList.remove('design-hidden');
            } else {
                el.dataset.isVisible = 'false';
                el.style.display = 'none';
                el.classList.remove('design-hidden');
            }
        },

        hide: (name: string) => {
            api.show(name, false);
        },

        // Enable/disable sugar: ui.enable(name) enables, ui.disable(name) disables, ui.enable(name, on) explicit
        enable: (name: string, on: boolean = true) => {
            const el = findWrapper(name); if (!el) return;
            renderutils.updateElement(
                el,
                { isEnabled: on ? 'true' : 'false' } as StringNumber
            );
        },

        disable: (name: string) => {
            api.enable(name, false);
        },

        on: (name: string, event: string, handler: (ev: Event, el: HTMLElement) => void) => {
            const el = findWrapper(name);
            if (!el) {
                throw new SyntaxError(`Element not found: ${String(name)}`);
            }

            const evt = normalizeEventName(event);
            if (!evt) {
                throw new SyntaxError(`Unsupported event "${String(event)}" in ui.on(${name}, …). Allowed: ${Array.from(ALLOWED_EVENTS).join(', ')}`);
            }

            const h = (ev: Event) => {
                try {
                    handler(ev, el);
                } catch (e: any) {
                    const msg = `Custom handler error on ${event} for "${name}": ${String(e && e.message ? e.message : e)}`;
                    showRuntimeError(msg);
                }
            };
            el.addEventListener(evt, h);

            disposers.push(() => el.removeEventListener(evt, h));
        },

        __disposeAll: () => {
            disposers.forEach(fn => { fn(); });
            disposers.length = 0;
        },

        // Convenience: checkbox/radio check/uncheck
        check: (name: string) => {
            const el = findWrapper(name); if (!el) return;
            const t = typeOf(el);
            if (t === 'Checkbox') {
                renderutils.updateElement(el, { isChecked: 'true' } as any);
            } else if (t === 'Radio') {
                // Select this radio and unselect others in the same group
                const custom = el.querySelector('.custom-radio') as HTMLElement | null;
                const group = custom?.getAttribute('group') || '';
                if (group) {
                    document.querySelectorAll(`.custom-radio[group="${group}"]`).forEach((r) => {
                        const host = (r as HTMLElement).closest('.element-div') as HTMLElement | null;
                        if (host && host !== el) {
                            renderutils.updateElement(host, { isSelected: 'false' } as any);
                        }
                    });
                }
                renderutils.updateElement(el, { isSelected: 'true' } as any);
            }
        },

        uncheck: (name: string) => {
            const el = findWrapper(name); if (!el) return;
            const t = typeOf(el);
            if (t === 'Checkbox') {
                renderutils.updateElement(el, { isChecked: 'false' } as any);
            } else if (t === 'Radio') {
                renderutils.updateElement(el, { isSelected: 'false' } as any);
            }
        },

        // Dispatch a DOM event without altering state
        trigger: (name: string, event: 'click' | 'change' | 'input') => {
            const el = findWrapper(name);
            if (!el) {
                throw new SyntaxError(`Element not found: ${String(name)}`);
            }

            const evt = normalizeEventName(event);
            if (!evt) {
                throw new SyntaxError(`Unsupported event "${String(event)}" in ui.trigger(${name}, …). Allowed: ${Array.from(ALLOWED_EVENTS).join(', ')}`);
            }

            // Try to target the most meaningful inner control first
            const innerEl = (() => {
                const t = typeOf(el);
                if (t === 'Checkbox') return el.querySelector('.custom-checkbox') as HTMLElement | null;
                if (t === 'Radio') return el.querySelector('.custom-radio') as HTMLElement | null;
                if (t === 'Select') return (el instanceof HTMLSelectElement ? el : (el.querySelector('select') as HTMLElement | null));
                if (t === 'Input') return (el instanceof HTMLInputElement ? el : (el.querySelector('input') as HTMLElement | null));
                return null;
            })();

            const target = (innerEl || el) as HTMLElement;

            if (evt === 'click') {
                // Pointer-like click that bubbles
                target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                return;
            }

            if (evt === 'change') {
                // Generic change event that bubbles
                target.dispatchEvent(new Event('change', { bubbles: true }));
                return;
            }

            if (evt === 'input') {
                // Generic input event that bubbles
                target.dispatchEvent(new Event('input', { bubbles: true }));
                return;
            }
        },

        // Select a value in a Select (single choice) or select a row in a Container (adds to selection)
        select: (name, value) => {
            const el = findWrapper(name);
            if (!el) {
                throw new SyntaxError(`Element not found: ${String(name)}`);
            }

            const t = typeOf(el);
            const inn = inner(el);

            if (t === 'Select') {
                const sel = (el instanceof HTMLSelectElement ? el : (el.querySelector('select') as HTMLSelectElement | null));
                if (!sel) {
                    throw new SyntaxError(`Select control not found in element ${name}`);
                }

                const v = String(value);
                const exists = Array.from(sel.options).some(o => o.value === v);
                if (!exists) {
                    throw new SyntaxError(`Option "${v}" not found in Select ${name}`);
                }
                sel.value = v;
                el.dataset.value = v;
                return;
            }

            if (t === 'Container') {
                const host = inn || el;
                const rows = Array.from(host.querySelectorAll('.container-row')) as HTMLElement[];
                const v = String(value);

                const row = rows.find(r => ((r.querySelector('.container-text') as HTMLElement | null)?.textContent || '') === v);
                if (!row) {
                    throw new SyntaxError(`Row with label "${v}" not found in Container ${name}`);
                }

                if (!row.classList.contains('active')) {
                    row.classList.add('active');
                }

                return;
            }

            throw new SyntaxError(`ui.select is not supported for element type ${t}`);
        },

        // Bridge to main process services (e.g., R adapters). Returns a Promise.
        call: (service, args?) => {
            return new Promise((resolve) => {
                // Correlate requests by a unique id
                const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
                const replyChannel = `service-reply-${requestId}`;

                coms.once(replyChannel, (result) => {
                    resolve(result);
                });

                coms.sendTo(
                    'main',
                    'service-call',
                    requestId,
                    service,
                    args ?? null
                );
            });
        },

        // Get/Set items (options/rows) for Select or Container elements
        items: (name, values?) => {
            const el = findWrapper(name);
            if (!el) return;

            const eltype = typeOf(el);
            const inn = inner(el);

            // Getter
            if (!Array.isArray(values)) {
                if (eltype === 'Select') {
                    const sel = (el instanceof HTMLSelectElement ? el : (el.querySelector('select') as HTMLSelectElement | null));
                    if (!sel) return;

                    return Array.from(sel.options).map(o => o.value);
                }

                if (eltype === 'Container') {
                    const host = inn || el;
                    const rows = Array.from(host.querySelectorAll('.container-row .container-text')) as HTMLElement[];

                    return rows.map(r => r.textContent || '');
                }

                return;
            }

            // Setter
            const items = values.map(v => String(v));
            if (eltype === 'Select') {
                const sel = (el instanceof HTMLSelectElement ? el : (el.querySelector('select') as HTMLSelectElement | null));

                if (sel) {
                    sel.innerHTML = '';

                    for (const v of items) {
                        const opt = document.createElement('option');
                        opt.value = v;
                        opt.textContent = v;
                        sel.appendChild(opt);
                    }

                    // Sync wrapper height to inner control after options change
                    const r = sel.getBoundingClientRect();

                    if (r.height > 0) {
                        el.style.height = `${Math.round(r.height)}px`;
                    }

                    el.dataset.value = String(sel.value || '');
                }

                return;
            }

            if (eltype === 'Container') {
                const host = inn || el;
                // Replace sample rows with provided items
                const sample = host.querySelector('.container-sample') as HTMLDivElement | null;
                const target = sample || host;

                // Clear existing only inside sample if present; else clear host content
                if (sample) {
                    sample.innerHTML = '';
                } else {
                    host.innerHTML = '';
                }

                for (const txt of items) {
                    const row = document.createElement('div');
                    // Do not preselect; let user click to select rows
                    row.className = 'container-row';
                    const label = document.createElement('span');
                    label.className = 'container-text';
                    label.textContent = txt;
                    row.appendChild(label);
                    target.appendChild(row);
                }

                return;
            }
        },

        // Multi-selection values for Container rows; Select is single-choice in this app
        values: (name) => {
            const el = findWrapper(name); if (!el) return [];
            const eltype = typeOf(el);
            const inn = inner(el);

            if (eltype === 'Select') {
                const sel = (el instanceof HTMLSelectElement ? el : (el.querySelector('select') as HTMLSelectElement | null));
                if (!sel) return [];

                // Select is single-choice; return as single-item array when present
                return sel.value ? [sel.value] : [];
            }

            if (eltype === 'Container') {
                const host = inn || el;
                const rows = Array.from(host.querySelectorAll('.container-row')) as HTMLElement[];
                const selected = rows.filter(r => r.classList.contains('active'));
                return selected.map(r => (r.querySelector('.container-text') as HTMLElement | null)?.textContent || '');
            }

            return [];
        }
    };

    return api;
}


// Build the UI facade for user scripts
function exposeNameGlobals(canvas: HTMLElement) {
    const elements = Array.from(canvas.querySelectorAll<HTMLElement>('[data-nameid]'));
    if (!window.__nameGlobals) {
        window.__nameGlobals = {} as Record<string, HTMLElement>;
    }

    const registry = window.__nameGlobals as Record<string, HTMLElement>;

    for (const el of elements) {
        const name = (el.dataset?.nameid || '').trim();
        if (!name || !utils.isIdentifier(name)) {
            continue;
        }

        // Store element
        if (!(name in registry)) {
            registry[name] = el;

            // Define a read-only getter on window if not already defined
            if (!(name in window)) {
                try {
                    Object.defineProperty(window, name, {
                        configurable: true,
                        enumerable: false,
                        get: () => name, // returns the name string
                        // The actual element remains accessible via window.__nameGlobals[name].
                    });
                } catch {
                    /* ignore define errors */
                }
            }
        } else {
            registry[name] = el; // update reference if it changed
        }
    }
}

// Allow bare identifiers for common event names in customJS, e.g., ui.trigger(x, change)
function exposeEventNameGlobals() {
    const events = Array.from(ALLOWED_EVENTS);
    for (const ev of events) {
        if (!(ev in window)) {
            try {
                Object.defineProperty(window, ev, {
                    configurable: true,
                    enumerable: false,
                    get: () => ev
                });
            } catch {
                /* ignore define errors */
            }
        }
    }
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
        const element = renderutils.makeElement({ ...data } as AnyElement);

        // Restore original id and nameid to avoid factory renaming for preview
        if (data.id) {
            element.id = String(data.id);
        }

        if (data.nameid) {
            element.dataset.nameid = String(data.nameid);
        }

        // Ensure child control ids track the restored wrapper id (so helpers that query by id work)
        try {
            const eid = element.id;
            const etype = String(element.dataset?.type || '');
            if (etype === 'Checkbox') {
                const custom = element.querySelector('.custom-checkbox') as HTMLElement | null;
                if (custom) custom.id = `checkbox-${eid}`;
            } else if (etype === 'Radio') {
                const custom = element.querySelector('.custom-radio') as HTMLElement | null;
                if (custom) custom.id = `radio-${eid}`;
            } else if (etype === 'Counter') {
                const display = element.querySelector('.counter-value') as HTMLDivElement | null;
                const inc = element.querySelector('.counter-arrow.up') as HTMLDivElement | null;
                const dec = element.querySelector('.counter-arrow.down') as HTMLDivElement | null;
                if (display) display.id = `counter-value-${eid}`;
                if (inc) inc.id = `counter-increase-${eid}`;
                if (dec) dec.id = `counter-decrease-${eid}`;
            } else if (etype === 'Slider') {
                const handle = element.querySelector('.slider-handle') as HTMLDivElement | null;
                if (handle) handle.id = `slider-handle-${eid}`;
            }
        } catch {}

        // Remove the drag-protection overlay used in the editor so interactions work in preview
        const cover = element.querySelector('.elementcover');
        if (cover && cover.parentElement) {
            cover.parentElement.removeChild(cover);
        }

        // Ensure left/top are applied (makeElement already does this when provided)
        if (utils.exists(data.left)) {
            element.style.left = String(data.left) + 'px';
        }
        if (utils.exists(data.top)) {
            element.style.top = String(data.top) + 'px';
        }

        // Select: populate options from value (comma/semicolon separated)
        if (element instanceof HTMLSelectElement) {
            const raw = data.value ?? '';
            const text = String(raw);
            const tokens = text.split(/[;,]/).map(s => s.trim()).filter(s => s.length > 0);
            element.innerHTML = '';
            if (tokens.length === 0) {
                const opt = document.createElement('option');
                opt.value = '';
                opt.textContent = '';
                element.appendChild(opt);
            } else {
                for (const t of tokens) {
                    const opt = document.createElement('option');
                    opt.value = t;
                    opt.textContent = t;
                    element.appendChild(opt);
                }
                // If a single value should also be the selected value, keep first by default
            }
        }

        // Checkbox: reflect isChecked
        if ((element.dataset?.type || '') === 'Checkbox') {
            const custom = element.querySelector('.custom-checkbox') as HTMLElement | null;
            if (custom) {
                const checked = utils.isTrue(data.isChecked);
                custom.setAttribute('aria-checked', String(checked));
                if (checked) custom.classList.add('checked'); else custom.classList.remove('checked');
                // Keyboard accessibility in preview (space/enter)
                custom.addEventListener('keydown', (e: KeyboardEvent) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    (e.currentTarget as HTMLElement).click();
                }
                });
            }
        }

        // Radio: reflect isSelected and make it interactive in preview
        if ((element.dataset?.type || '') === 'Radio') {
            const custom = element.querySelector('.custom-radio') as HTMLElement | null;
            if (custom) {
                const selected = utils.isTrue(data.isSelected);
                custom.setAttribute('aria-checked', String(selected));
                if (selected) {
                    custom.classList.add('selected');
                } else {
                    custom.classList.remove('selected');
                }

                const selectThis = () => {
                const group = custom.getAttribute('group') || '';
                if (group) {
                    document.querySelectorAll(`.custom-radio[group="${group}"]`).forEach((el) => {
                        const r = el as HTMLElement;
                        r.setAttribute('aria-checked', 'false');
                        r.classList.remove('selected');
                    });
                }
                custom.setAttribute('aria-checked', 'true');
                custom.classList.add('selected');
                };

                // Click to select this radio and unselect others in the same group
                custom.addEventListener('click', selectThis);
                // Keyboard accessibility
                custom.addEventListener('keydown', (e: KeyboardEvent) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    selectThis();
                }
                });
            }
        }

        // Counter: wire increase/decrease within [startval, maxval]
        if ((element.dataset?.type || '') === 'Counter') {
            const display = element.querySelector('.counter-value') as HTMLDivElement | null;
            const inc = element.querySelector('.counter-arrow.up') as HTMLDivElement | null;
            const dec = element.querySelector('.counter-arrow.down') as HTMLDivElement | null;
            const min = Number(data.startval ?? 0);
            const max = Number(data.maxval ?? min);

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
        if ((element.dataset?.type || '') === 'Button') {
            const doPress = () => element.classList.add('btn-active');
            const clearPress = () => element.classList.remove('btn-active');
            element.addEventListener('mousedown', doPress);
            element.addEventListener('mouseup', clearPress);
            element.addEventListener('mouseleave', clearPress);
            element.addEventListener('click', () => {
                if (!utils.isTrue(data.isEnabled)) return;
                const action = String(data.onClick || 'run');
                switch (action) {
                case 'reset':
                    // showMessage('info', 'Preview', `Reset action for "${data.nameid || 'Button'}"`);
                    coms.sendTo(
                        'editorWindow',
                        'consolog',
                        `Reset action for "${data.nameid || 'Button'}"`
                    );
                    break;
                case 'run':
                default:
                    coms.sendTo(
                        'editorWindow',
                        'consolog',
                        `Run action for "${data.nameid || 'Button'}"`
                    );
                    break;
                }
            });
        }

        // Slider: make handle draggable within the track in preview
        if ((element.dataset?.type || '') === 'Slider') {
            const handle = element.querySelector('.slider-handle') as HTMLDivElement | null;
            if (!handle) {
                continue;
            }

            let dragging = false;
            const direction = (element.dataset.direction || 'horizontal').toLowerCase();

            const onMove = (ev: MouseEvent) => {
                if (!dragging) return;
                const rect = element.getBoundingClientRect();
                if (rect.width <= 0 || rect.height <= 0) {
                    return;
                }
                let percent = 0;
                if (direction === 'vertical') {
                    const relY = (ev.clientY - rect.top);
                    const clamped = Math.max(0, Math.min(rect.height, relY));
                    // handlepos is 0..100 where 100 is top; updateHandleStyle uses (100 - handlepos) for top
                    percent = Math.round(100 - (clamped / rect.height) * 100);
                } else {
                    const relX = (ev.clientX - rect.left);
                    const clamped = Math.max(0, Math.min(rect.width, relX));
                    percent = Math.round((clamped / rect.width) * 100);
                }
                element.dataset.handlepos = String(percent);
                renderutils.updateHandleStyle(
                    handle,
                    {
                        handleshape: element.dataset.handleshape || 'triangle',
                        direction: element.dataset.direction || 'horizontal',
                        handlesize: element.dataset.handlesize || '8',
                        handleColor: element.dataset.handleColor || '#75c775',
                        handlepos: String(percent)
                    } as StringNumber
                );
            };

            const onUp = () => {
                dragging = false;
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };

            handle.addEventListener('mousedown', (ev: MouseEvent) => {
                if (element.classList.contains('disabled-div') || !utils.isTrue(data.isEnabled)) {
                    return;
                }
                dragging = true;
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
                ev.preventDefault();
            });
        }

        // Container: make rows toggle selection on click (multi-select)
        if ((element.dataset?.type || '') === 'Container') {
            const host = element.firstElementChild as HTMLElement | null || element;
            const toggleRow = (row: HTMLElement) => {
                row.classList.toggle('active');
                // Bubble a change event so user handlers can react
                element.dispatchEvent(new Event('change', { bubbles: true }));
            };
            // Event delegation
            host.addEventListener('click', (ev: Event) => {
                try {
                    const target = ev.target as HTMLElement;
                    const row = target?.closest?.('.container-row') as HTMLElement | null;
                    if (row && host.contains(row)) {
                        toggleRow(row);
                    }
                } catch (e: any) {
                    const msg = `Container click error: ${String(e && e.message ? e.message : e)}`;
                    // show overlay if available in this scope
                    try {
                        // @ts-ignore
                        (showRuntimeError as any)(msg);
                    } catch {
                        coms.sendTo('editorWindow', 'consolog', msg);
                    }
                }
            });
        }

        // Visibility / Enabled
        if (!utils.isTrue(data.isVisible)) {
            // In preview, hidden elements should not be visible at all
            element.style.display = 'none';
        }

        if (!utils.isTrue(data.isEnabled)) {
            element.classList.add('disabled-div');
            // In preview, disabled elements should not be interactive
            element.style.pointerEvents = 'none';
            if (
                element instanceof HTMLInputElement ||
                element instanceof HTMLSelectElement ||
                (
                    window.HTMLTextAreaElement &&
                    element instanceof window.HTMLTextAreaElement
                )
            ) {
                element.disabled = true;
            } else {
                const customCheckbox = element.querySelector('.custom-checkbox') as HTMLElement | null;
                if (customCheckbox) {
                    customCheckbox.setAttribute('aria-disabled', 'true');
                }

                const customRadio = element.querySelector('.custom-radio') as HTMLElement | null;
                if (customRadio) {
                    customRadio.setAttribute('aria-disabled', 'true');
                }
            }
        }

        canvas.appendChild(element);
        created.push(element);

        // After the element is in DOM: enforce valueType for Input
        if (element instanceof HTMLInputElement) {
            const valueType = String(data.valueType || element.dataset?.valueType || '').toLowerCase();

            switch (valueType) {
                case 'integer':
                    renderutils.setIntegers([element], '');
                    break;

                case 'signed integer':
                    renderutils.setSignedIntegers([element], '');
                    break;

                case 'double':
                    renderutils.setDouble([element], '');
                    break;

                case 'signed double':
                    renderutils.setSignedDouble([element], '');
                    break;

                default:
                    // String or unknown: no filter
                    break;
            }
        }
    }

    // === Conditions engine (preview) ===
    try {
        const getByName = (name: string): HTMLElement | null => {
            return created.find(el => (el.dataset?.nameid || el.id) === name) || null;
        };

        const getProp = (name: string, propOrNumber: string): unknown => {
            const el = getByName(name);
            if (!el) {
                return false;
            }

            const type = String(el.dataset?.type || '').toLowerCase();
            const token = String(propOrNumber).toLowerCase();

            if (token === 'checked') {
                return utils.isTrue(el.dataset?.isChecked);
            }

            if (token === 'selected') {
                return utils.isTrue(el.dataset?.isSelected);
            }

            if (token === 'visible') {
                return !el.style.display || el.style.display !== 'none';
            }

            if (token === 'enabled') {
                return !el.classList.contains('disabled-div');
            }

            if (utils.possibleNumeric(propOrNumber)) {
                switch (type) {
                    case 'slider': {
                        const pos = Number(el.dataset?.handlepos ?? 50);
                        return Math.max(0, Math.min(100, pos)) / 100;
                    }
                    case 'counter': {
                        const disp = el.querySelector('.counter-value') as HTMLDivElement | null;
                        const n = Number(disp?.textContent ?? el.dataset?.startval ?? 0);
                        return Number.isFinite(n) ? n : 0;
                    }
                    case 'input': {
                        return Number(el.dataset?.value ?? (el.textContent || '0'));
                    }
                    case 'select': {
                        return Number(el.dataset?.value ?? 0);
                    }
                    default:
                        return 0;
                }
            }

            return false;
        };

        const evalAtomic = (arr: any[]): boolean => {
            const [name, op, right] = arr as [string, string, string];
            const rightLower = String(right).toLowerCase();

            if (
                rightLower === 'checked' ||
                rightLower === 'selected' ||
                rightLower === 'visible' ||
                rightLower === 'enabled'
            ) {
                const value = !!getProp(name, rightLower);

                switch (op) {
                    case '==': return value === true;
                    case '!=': return value === false;
                    default: return false;
                }
            }

            // numeric compare
            const leftVal = Number(getProp(name, 'value'));
            const rightVal = Number(right);

            if (Number.isNaN(leftVal) || Number.isNaN(rightVal)) {
                return false;
            }

            switch (op) {
                case '==': return leftVal === rightVal;
                case '!=': return leftVal !== rightVal;
                case '>=': return leftVal >= rightVal;
                case '<=': return leftVal <= rightVal;
                default: return false;
            }
        };

        const evalExpr = (expr: any): boolean => {
            if (!Array.isArray(expr)) {
                return !!expr;
            }

            // Simple atomic
            if (expr.length === 3 && typeof expr[0] === 'string') {
                return evalAtomic(expr);
            }

            // Complex [left, '&'|'|', right, ...]
            let acc = evalExpr(expr[0]);
            for (let i = 1; i < expr.length; i += 2) {
                const op = expr[i];
                const rhs = evalExpr(expr[i + 1]);
                if (op === '&') {
                    acc = acc && rhs;
                } else if (op === '|') {
                    acc = acc || rhs;
                }
            }

            return acc;
        };

        type Actions = Record<string, any[]>; // action -> list of expressions
        const parsedByTarget = new Map<HTMLElement, Actions>();

        const mergeParsed = (acc: Actions, text: string | undefined | null) => {
            const t = String(text || '').trim();
            if (!t) return;
            const parsed = cond.parseConditions(t) as any;
            if (typeof parsed === 'string') return;
            const result = parsed.result as Record<string, any>;
            for (const [action, expr] of Object.entries(result)) {
                if (!acc[action]) acc[action] = [];
                acc[action].push(expr);
            }
        };

        const parseFor = (target: HTMLElement): Actions | null => {
            const acc: Actions = {};
            mergeParsed(acc, target.dataset?.conditions);
            mergeParsed(acc, target.dataset?.groupConditions);
            // If nothing parsed, return null
            return Object.keys(acc).length ? acc : null;
        };

        const setEnabledState = (el: HTMLElement, enabled: boolean) => {
            // Update visual state via shared util
            renderutils.updateElement(
                el,
                { isEnabled: enabled ? 'true' : 'false' } as StringNumber
            );

            // Native inputs/selects
            if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) {
                (el as HTMLInputElement | HTMLSelectElement).disabled = !enabled;
                (el.style as CSSStyleDeclaration).pointerEvents = enabled ? '' : 'none';
                return;
            }

            // Inner controls
            const input = el.querySelector('input') as HTMLInputElement | null;
            const select = el.querySelector('select') as HTMLSelectElement | null;

            if (input) {
                input.disabled = !enabled;
                input.style.pointerEvents = enabled ? '' : 'none';
            }

            if (select) {
                select.disabled = !enabled;
                select.style.pointerEvents = enabled ? '' : 'none';
            }

            // Custom checkbox/radio
            const customCheckbox = el.querySelector('.custom-checkbox') as HTMLElement | null;
            const customRadio = el.querySelector('.custom-radio') as HTMLElement | null;

            if (customCheckbox) {
                if (!enabled) {
                    customCheckbox.setAttribute('aria-disabled', 'true');
                } else {
                    customCheckbox.removeAttribute('aria-disabled');
                }

                customCheckbox.style.pointerEvents = enabled ? '' : 'none';
            }

            if (customRadio) {
                if (!enabled) {
                    customRadio.setAttribute('aria-disabled', 'true');
                } else {
                    customRadio.removeAttribute('aria-disabled');
                }

                customRadio.style.pointerEvents = enabled ? '' : 'none';
            }

            // Fallback pointer events for other blocks
            el.style.pointerEvents = enabled ? '' : 'none';
        };

        const applyAction = (target: HTMLElement, action: string, on: boolean) => {
            switch (action) {
                case 'check':
                    if (on && target.dataset.type === 'Checkbox') {
                        renderutils.updateElement(
                            target,
                            { isChecked: 'true' } as StringNumber
                        );
                    }
                    break;

                case 'uncheck':
                    if (on && target.dataset.type === 'Checkbox') {
                        renderutils.updateElement(
                            target,
                            { isChecked: 'false' } as StringNumber
                        );
                    }
                    break;

                case 'select':
                    if (on && target.dataset.type === 'Radio') {
                        renderutils.updateElement(
                            target,
                            { isSelected: 'true' } as StringNumber
                        );
                    }
                    break;

                case 'unselect':
                    if (on && target.dataset.type === 'Radio') {
                        renderutils.updateElement(
                            target,
                            { isSelected: 'false' } as StringNumber
                        );
                    }
                    break;

                default:
                    // Parameterized actions
                    if (on && action.toLowerCase().startsWith('setvalue=')) {
                        const num = Number(action.split('=')[1]);
                        if (
                            Number.isFinite(num) &&
                            String(target.dataset.type || '').toLowerCase() === 'counter'
                        ) {
                            const min = Number(target.dataset.startval ?? 0);
                            const max = Number(target.dataset.maxval ?? min);
                            const v = Math.max(min, Math.min(max, num));
                            const display = target.querySelector('.counter-value') as HTMLDivElement | null;
                            if (display) {
                                display.textContent = String(v);
                            }
                        }
                    }
                    break;
            }
        };

        const evaluateAll = () => {
            for (const target of created) {
                const parsed = parsedByTarget.get(target) || parseFor(target);
                if (!parsed) continue;
                parsedByTarget.set(target, parsed);

                // Resolve visibility and enabled state deterministically
                let shouldShow: boolean | null = null;
                let shouldEnable: boolean | null = null;
                for (const [action, list] of Object.entries(parsed)) {
                    const exprs = Array.isArray(list) ? list : [list];
                    for (const expr of exprs) {
                        const on = evalExpr(expr);
                        switch (action) {
                            case 'show':
                                if (on) shouldShow = true;
                                break;

                            case 'hide':
                                if (on) shouldShow = false;
                                break;

                            case 'enable':
                                if (on) shouldEnable = true;
                                break;

                            case 'disable':
                                if (on) shouldEnable = false;
                                break;

                            default:
                                applyAction(target, action, on);
                                break;
                        }
                    }
                }

                // Apply visibility (hide overrides show)
                if (!utils.isNull(shouldShow)) {
                    if (shouldShow) {
                        target.dataset.isVisible = 'true';
                        target.style.display = '';
                        target.classList.remove('design-hidden');
                    } else {
                        target.dataset.isVisible = 'false';
                        target.style.display = 'none';
                    }
                }

                // Apply enabled state (disable overrides enable)
                if (!utils.isNull(shouldEnable)) {
                    setEnabledState(target, !!shouldEnable);
                }
            }
        };


        // Hook changes on interactive elements to re-evaluate
        created.forEach(el => {
            const type = String(el.dataset?.type || '').toLowerCase();
            if (type === 'checkbox') {
                const custom = el.querySelector('.custom-checkbox') as HTMLElement | null;
                custom?.addEventListener('click', () => {
                    const now = custom?.getAttribute('aria-checked') === 'true';
                    el.dataset.isChecked = String(now);
                    evaluateAll();
                    // Also emit a 'change' like native checkbox
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                });
                // 'change' is notification-only; no extra evaluation here
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
                    evaluateAll();
                    // Also emit a 'change' like native radio
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                });
                // 'change' is notification-only; no extra evaluation here
            } else if (type === 'select') {
                if (el instanceof HTMLSelectElement) {
                    el.addEventListener('change', () => {
                        el.dataset.value = String(el.value || '');
                        evaluateAll();
                    });
                } else {
                    const sel = el.querySelector('select') as HTMLSelectElement | null;
                    sel?.addEventListener('change', () => {
                        el.dataset.value = String(sel.value || '');
                        evaluateAll();
                    });
                }
            } else if (type === 'input') {
                const input = el.querySelector('input') as HTMLInputElement | null;
                input?.addEventListener('change', () => {
                    el.dataset.value = String(input.value || '');
                    evaluateAll();
                });
            } else if (type === 'counter') {
                const display = document.querySelector(`#counter-value-${el.id}`) as HTMLDivElement | null;
                const inc = document.querySelector(`#counter-increase-${el.id}`) as HTMLDivElement | null;
                const dec = document.querySelector(`#counter-decrease-${el.id}`) as HTMLDivElement | null;
                const sync = () => {
                    el.dataset.startval = String(Number(display?.textContent || el.dataset.startval || 0));
                    // First let conditions react to the new value
                    evaluateAll();
                    // Then notify user handlers; runs after conditions so custom JS can override
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                };
                inc?.addEventListener('click', sync);
                dec?.addEventListener('click', sync);
            } else if (type === 'slider') {
                const handle = el.querySelector('.slider-handle') as HTMLDivElement | null;
                const onUp = () => {
                    el.dataset.handlepos = String(el.dataset.handlepos || '50');
                    evaluateAll();
                };
                handle?.addEventListener('mouseup', onUp);
            }
        });

        // Initial evaluation
        evaluateAll();
    } catch (e) {
        console.error('Conditions evaluation failed:', e);
    }

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
        exposeNameGlobals(canvas);

    // Expose common event names as globals mapping to their own string
    // (so ui.trigger(checkbox1, change) works)
    exposeEventNameGlobals();

        // Provide init/dispose if present
        const exports: PreviewScriptExports = {};

        // Wrap code in a Function with ui in scope
        let fn: Function | null = null;
        try {
            fn = new Function('ui', 'exports', code);
        } catch (e: any) {
            const msg = `Code syntax error: ${String(e && e.message ? e.message : e)}`;
            coms.sendTo('editorWindow', 'consolog', msg);
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
            } catch (e: any) {
                const msg = `init() error: ${String(e && e.message ? e.message : e)}`;
                coms.sendTo('editorWindow', 'consolog', msg);
                const err = document.createElement('div');
                err.className = 'customjs-error';
                err.textContent = msg;
                canvas.appendChild(err);
                console.error('init() error:', e);
            }
        }

        // Register disposer
        window.__userHandlers!.push(() => {
            if (typeof exports.dispose === 'function') {
                exports.dispose(ui);
            }
            ui.__disposeAll?.();
        });
    } else {
        coms.sendTo('editorWindow', 'consolog', 'Preview: no customJS to execute');
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
            console.error("Failed to parse preview data:", e);
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

