// Shared API surface bits used by both Preview runtime and Editor (linter/helpers)

import type { PreviewUI, PreviewUIEnv } from '../interfaces/preview';
import type { StringNumber } from '../interfaces/elements';
import { renderutils } from './renderutils';

// Allowed event names for the custom Preview UI API
export const EVENT_LIST = ['click', 'change', 'input'] as const;
export type EventName = typeof EVENT_LIST[number];
export const EVENT_NAMES = new Set<string>(EVENT_LIST);

// Curated helper names exposed as shorthand in user customJS (prelude)
export const API_NAMES: ReadonlyArray<keyof PreviewUI> = Object.freeze([
    // core
    'showMessage', 'getValue', 'setValue',

    // checkbox/radio
    'check', 'isChecked', 'uncheck', 'isUnchecked',

    // visibility/enabled
    'show', 'isVisible', 'hide', 'isHidden', 'enable', 'isEnabled', 'disable', 'isDisabled',

    // events
    'onClick', 'onChange', 'onInput', 'trigger',

    // lists & selection
    'setSelected', 'getSelected', 'addValue', 'deleteValue'
]);

// Methods that take (elementName, ...) as first argument; used by the linter.
// Derive from API_NAMES to keep a single source of truth for the public surface,
// then exclude the non-element-first helpers explicitly (currently just 'showMessage').
const NEUTRAL_NAMES = new Set<keyof PreviewUI>([
    'showMessage'
]);
export const ELEMENT_FIRST_ARG_CALLS: ReadonlyArray<keyof PreviewUI> = Object.freeze(
    API_NAMES.filter(n => !NEUTRAL_NAMES.has(n))
);


// Factory: build the Preview UI API bound to a specific canvas and adapters.
export function createPreviewUI(env: PreviewUIEnv): PreviewUI {
    const {
        findWrapper,
        updateElement,
        showRuntimeError,
        logToEditor,
        showDialogMessage,
        // call
    } = env;

    const disposers: Array<() => void> = [];
    const warnOnce = new Set<string>();
    const warn = (k: string, msg: string) => {
        if (!warnOnce.has(k)) {
            logToEditor('Warning: ' + msg);
            warnOnce.add(k);
        }
    };

    const inner = (el: HTMLElement | null) => el?.firstElementChild as HTMLElement | null;
    const typeOf = (el: HTMLElement | null) => String(el?.dataset?.type || '');

    const api: PreviewUI = {
        // Forward logs to the Editor console for visibility during Preview
        log: (...args: any[]) => {
            const msg = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
            logToEditor(msg);
        },

        // Convenience: checkbox/radio check/uncheck
        check: (name: string) => {
            const el = findWrapper(name);
            if (!el) return;

            const eltype = typeOf(el);
            if (eltype === 'Checkbox') {
                updateElement(el, { isChecked: 'true' } as StringNumber);
            } else if (eltype === 'Radio') {
                // Select this radio and unselect others in the same group
                const custom = el.querySelector('.custom-radio') as HTMLElement | null;
                const group = custom?.getAttribute('group') || '';

                if (group) {
                    document.querySelectorAll(`.custom-radio[group="${group}"]`).forEach((r) => {
                        const host = (r as HTMLElement).closest('.element-div') as HTMLElement | null;
                        if (host && host !== el) {
                            updateElement(host, { isSelected: 'false' } as StringNumber);
                        }
                    });
                }

                updateElement(el, { isSelected: 'true' } as StringNumber);
            }
        },

        uncheck: (name: string) => {
            const el = findWrapper(name);
            if (!el) return;
            const t = typeOf(el);
            if (t === 'Checkbox') {
                updateElement(el, { isChecked: 'false' } as StringNumber);
            } else if (t === 'Radio') {
                updateElement(el, { isSelected: 'false' } as StringNumber);
            }
        },

        showMessage: (...argsIn: any[]) => {
            // New convention: (message, detail?, type?)
            const allowed = new Set(['info', 'warning', 'error', 'question']);
            const message = String(argsIn[0] ?? '');
            const detail = String(argsIn[1] ?? '');
            const typeCand = String(argsIn[2] ?? '').toLowerCase();
            const type = (allowed.has(typeCand) ? typeCand : 'info') as 'info' | 'warning' | 'error' | 'question';
            showDialogMessage(type, message, detail);
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
                    if (prop == null || prop === 'value') {
                        const display = el.querySelector('.counter-value') as HTMLDivElement | null;
                        const txt = display?.textContent ?? el.dataset.startval ?? '0';
                        const n = Number(txt);
                        return Number.isFinite(n) ? n : 0;
                    }
                    return el.dataset[prop] ?? null;
                }
                default:
                    return el.dataset[prop] ?? null;
            }
        },

        set: (name: string, prop: string, value: any) => {
            const el = findWrapper(name);
            if (!el) return;

            const eltype = typeOf(el);
            const inn = inner(el);
            const v = value as any;

            switch (eltype) {
                case 'Input':
                    if (prop === 'value' && inn instanceof HTMLInputElement) {
                        inn.value = String(v); el.dataset.value = String(v);
                    } else {
                        warn(`${name}:${prop}`, `Unsupported set(${eltype}, ${prop})`);
                    }
                    break;
                case 'Label':
                    if (prop === 'value') {
                        el.dataset.value = String(v);
                        updateElement(el, { value: String(v) } as StringNumber);
                    } else {
                        warn(`${name}:${prop}`, `Unsupported set(${eltype}, ${prop})`);
                    }
                    break;
                case 'Select':
                    const sel = (inn instanceof HTMLSelectElement ? inn : (el as any as HTMLSelectElement));
                    if (prop === 'value' && sel) {
                        sel.value = String(v);
                        el.dataset.value = String(v);
                    } else {
                        warn(`${name}:${prop}`, `Unsupported set(${eltype}, ${prop})`);
                    }
                    break;
                case 'Checkbox':
                    if (prop === 'checked') {
                        updateElement(el, { isChecked: v ? 'true' : 'false' } as StringNumber);
                    } else {
                        warn(`${name}:${prop}`, `Unsupported set(${eltype}, ${prop})`);
                    }
                    break;
                case 'Radio':
                    if (prop === 'selected') {
                        updateElement(el, { isSelected: v ? 'true' : 'false' } as StringNumber);
                    } else {
                        warn(`${name}:${prop}`, `Unsupported set(${eltype}, ${prop})`);
                    }
                    break;
                case 'Counter':
                    if (prop === 'value') {
                        const min = Number(el.dataset.minval ?? el.dataset.startval ?? '0');
                        const max = Number(el.dataset.maxval ?? String(min));
                        let n = Number(v);

                        if (!Number.isFinite(n)) {
                            warn(`${name}:${prop}`, `Invalid number: ${v}`);
                            return;
                        }

                        if (n < min) {
                            n = min;
                        } else if (n > max) {
                            n = max;
                        }

                        updateElement(el, { startval: String(n) } as StringNumber);
                    } else if (prop === 'minval' || prop === 'maxval' || prop === 'startval') {
                        updateElement(el, { [prop]: String(v) } as StringNumber);
                    } else {
                        warn(`${name}:${prop}`, `Unsupported set(${eltype}, ${prop})`);
                    }
                    break;
                default:
                    warn(`${name}:${prop}`, `Unsupported element type ${eltype} for set()`);
                    break;
            }
        },

        getValue: (name: string): any => {
            const el = findWrapper(name);
            if (!el) return null;
            const eltype = typeOf(el);
            const inn = inner(el);
            if (eltype === 'Input') {
                const input = (el instanceof HTMLInputElement ? el : (inn as HTMLInputElement | null));
                return input?.value ?? '';
            }
            if (eltype === 'Label') return inn?.textContent ?? '';
            if (eltype === 'Select') {
                const sel = (el instanceof HTMLSelectElement ? el : (inn as HTMLSelectElement | null));
                return sel?.value ?? '';
            }
            if (eltype === 'Checkbox') return el.dataset.isChecked === 'true';
            if (eltype === 'Radio') return el.dataset.isSelected === 'true';
            if (eltype === 'Counter') {
                const display = el.querySelector('.counter-value') as HTMLDivElement | null;
                const txt = display?.textContent ?? el.dataset.startval ?? '0';
                const n = Number(txt);
                return Number.isFinite(n) ? n : 0;
            }
            if (eltype === 'Container') {
                const host = inn || el;
                const rows = Array.from(host.querySelectorAll('.container-row .container-text')) as HTMLElement[];
                return rows.map(r => r.textContent || '');
            }
            return (el.dataset as any)['value'] ?? null;
        },

        setValue: (name: string, value: any): void => {
            const el = findWrapper(name);
            if (!el) return;
            const eltype = typeOf(el);
            const inn = inner(el);

            if (Array.isArray(value)) {
                const items = value.map(v => String(v));
                if (eltype === 'Select') {
                    const sel = (el instanceof HTMLSelectElement ? el : (el.querySelector('select') as HTMLSelectElement | null));
                    if (sel) {
                        sel.innerHTML = '';
                        for (const v of items) {
                            const opt = document.createElement('option');
                            opt.value = v; opt.textContent = v; sel.appendChild(opt);
                        }
                        const r = sel.getBoundingClientRect();
                        if (r.height > 0) el.style.height = `${Math.round(r.height)}px`;
                        el.dataset.value = String(sel.value || '');
                    }
                    return;
                }
                if (eltype === 'Container') {
                    const host = inn || el;
                    const sample = host.querySelector('.container-sample') as HTMLDivElement | null;
                    const target = sample || host;
                    if (sample) { sample.innerHTML = ''; } else { host.innerHTML = ''; }
                    for (const txt of items) {
                        const row = document.createElement('div');
                        row.className = 'container-row';
                        const label = document.createElement('span');
                        label.className = 'container-text';
                        label.textContent = txt; row.appendChild(label); target.appendChild(row);
                    }
                    return;
                }
                return; // ignore arrays for other types
            }

            // Scalar
            if (eltype === 'Input') {
                const input = (el instanceof HTMLInputElement ? el : (inn as HTMLInputElement | null));
                if (input) { input.value = String(value); el.dataset.value = String(value); }
                return;
            }
            if (eltype === 'Label') {
                el.dataset.value = String(value);
                updateElement(el, { value: String(value) } as StringNumber);
                return;
            }
            if (eltype === 'Select') {
                const sel = (el instanceof HTMLSelectElement ? el : (el.querySelector('select') as HTMLSelectElement | null));
                if (sel) { sel.value = String(value); el.dataset.value = String(value); }
                return;
            }
            if (eltype === 'Checkbox') { updateElement(el, { isChecked: value ? 'true' : 'false' } as StringNumber); return; }
            if (eltype === 'Radio') { updateElement(el, { isSelected: value ? 'true' : 'false' } as StringNumber); return; }
            if (eltype === 'Counter') {
                const min = Number(el.dataset.minval ?? el.dataset.startval ?? '0');
                const max = Number(el.dataset.maxval ?? String(min));
                let n = Number(value);
                if (!Number.isFinite(n)) { showRuntimeError(`Invalid number: ${value}`); return; }
                if (n < min) n = min;
                if (n > max) n = max;
                updateElement(el, { startval: String(n) } as StringNumber);
                return;
            }
            (el.dataset as any)['value'] = String(value);
        },

        getSelected: (name: string): string[] => {
            const el = findWrapper(name);
            if (!el) return [];
            const eltype = typeOf(el);
            const inn = inner(el);
            if (eltype === 'Select') {
                const sel = (el instanceof HTMLSelectElement ? el : (el.querySelector('select') as HTMLSelectElement | null));
                return sel && sel.value ? [sel.value] : [];
            }
            if (eltype === 'Container') {
                const host = inn || el;
                const rows = Array.from(host.querySelectorAll('.container-row')) as HTMLElement[];
                const selected = rows.filter(r => r.classList.contains('active'));
                return selected.map(r => (r.querySelector('.container-text') as HTMLElement | null)?.textContent || '');
            }
            return [];
        },

        // New preferred name for checked state
        isChecked: (name: string) => {
            const el = findWrapper(name);
            if (!el) return false;

            const eltype = typeOf(el);
            if (eltype === 'Checkbox') {
                const custom = el.querySelector('.custom-checkbox') as HTMLElement | null;
                if (custom) return custom.getAttribute('aria-checked') === 'true';
                return el.dataset.isChecked === 'true';
            } else if (eltype === 'Radio') {
                const custom = el.querySelector('.custom-radio') as HTMLElement | null;
                if (custom) return custom.getAttribute('aria-checked') === 'true';
                return el.dataset.isSelected === 'true';
            }

            return false;
        },

        isUnchecked: (name: string) => {
            return !api.isChecked(name);
        },

        isVisible: (name: string) => {
            const el = findWrapper(name);
            if (!el) return false;

            const ds = (el.style?.display || '').toLowerCase();
            return ds !== 'none';
        },

        isHidden: (name: string) => {
            return !api.isVisible(name);
        },

        isEnabled: (name: string) => {
            const el = findWrapper(name);
            if (!el) return false;
            return !el.classList.contains('disabled-div');
        },

        isDisabled: (name: string) => {
            const el = findWrapper(name);
            if (!el) return false;
            return el.classList.contains('disabled-div');
        },

        show: (name: string, on: boolean = true) => {
            const el = findWrapper(name);
            if (!el) return;

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

        hide: (name: string, on: boolean = true) => {
            api.show(name, !on);
        },

        enable: (name: string, on: boolean = true) => {
            const el = findWrapper(name);
            if (!el) return;

            updateElement(el, { isEnabled: on ? 'true' : 'false' } as StringNumber);
        },

        disable: (name: string, on: boolean = true) => {
            api.enable(name, !on);
        },

        on: (name: string, event: string, handler: (ev: Event, el: HTMLElement) => void) => {
            const el = findWrapper(name);
            if (!el) {
                throw new SyntaxError(`Element not found: ${String(name)}`);
            }

            const evt = renderutils.normalizeEventName(event);
            if (!evt) {
                throw new SyntaxError(`Unsupported event "${String(event)}" in ui.on(${name}, ...). Allowed: ${Array.from(EVENT_NAMES).join(', ')}`);
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

        onClick: (name: string, handler: (ev: Event, el: HTMLElement) => void) => api.on(name, 'click', handler),
        onChange: (name: string, handler: (ev: Event, el: HTMLElement) => void) => api.on(name, 'change', handler),
        onInput: (name: string, handler: (ev: Event, el: HTMLElement) => void) => api.on(name, 'input', handler),

    trigger: (name: string, event: EventName) => {
            const el = findWrapper(name);
            if (!el) {
                throw new SyntaxError(`Element not found: ${String(name)}`);
            }

            const evt = renderutils.normalizeEventName(event);
            if (!evt) {
                throw new SyntaxError(`Unsupported event "${String(event)}" in ui.trigger(${name}, ...). Allowed: ${Array.from(EVENT_NAMES).join(', ')}`);
            }

            const innerEl = (() => {
                const eltype = typeOf(el);
                if (eltype === 'Checkbox') {
                    return el.querySelector('.custom-checkbox') as HTMLElement | null;
                }

                if (eltype === 'Radio') {
                    return el.querySelector('.custom-radio') as HTMLElement | null;
                }

                if (eltype === 'Select') {
                    return (el instanceof HTMLSelectElement ? el : (el.querySelector('select') as HTMLElement | null));
                }

                if (eltype === 'Input') {
                    return (el instanceof HTMLInputElement ? el : (el.querySelector('input') as HTMLElement | null));
                }

                return null;
            })();

            const target = (innerEl || el) as HTMLElement;
            if (evt === 'click') {
                target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                return;
            }

            if (evt === 'change') {
                target.dispatchEvent(new Event('change', { bubbles: true }));
                return;
            }

            if (evt === 'input') {
                target.dispatchEvent(new Event('input', { bubbles: true }));
                return;
            }
        },

        setSelected: (name, value) => {
            const el = findWrapper(name);
            if (!el) {
                throw new SyntaxError(`Element not found: ${String(name)}`);
            }

            const eltype = typeOf(el);
            const inn = inner(el);

            if (eltype === 'Select') {
                const sel = (el instanceof HTMLSelectElement ? el : (el.querySelector('select') as HTMLSelectElement | null));
                if (!sel) throw new SyntaxError(`Select control not found in element ${name}`);
                const v = String(Array.isArray(value) ? value[0] : value);
                const exists = Array.from(sel.options).some(o => o.value === v);
                if (!exists) throw new SyntaxError(`Option "${v}" not found in Select ${name}`);
                sel.value = v; el.dataset.value = v; return;
            }

            if (eltype === 'Container') {
                const host = inn || el;
                const rows = Array.from(host.querySelectorAll('.container-row')) as HTMLElement[];
                const selValues = Array.isArray(value) ? value.map(v => String(v)) : [String(value)];
                // Replace selection to exactly match selValues
                rows.forEach(r => {
                    const label = (r.querySelector('.container-text') as HTMLElement | null)?.textContent || '';
                    const shouldSelect = selValues.includes(label);
                    if (shouldSelect) r.classList.add('active'); else r.classList.remove('active');
                });
                return;
            }
            throw new SyntaxError(`ui.setSelected is not supported for element type ${eltype}`);
        },

    // Legacy alias: select(name, value) preserves previous additive behavior for Container
        select: (name: string, value: string) => {
            const el = findWrapper(name);
            if (!el) {
                throw new SyntaxError(`Element not found: ${String(name)}`);
            }
            const eltype = typeOf(el);
            const inn = inner(el);
            if (eltype === 'Select') {
                (api as any).setSelected(name, value);
                return;
            }
            if (eltype === 'Container') {
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
            throw new SyntaxError(`ui.select is not supported for element type ${eltype}`);
        },

        addValue: (name: string, value: string) => {
            const el = findWrapper(name);
            if (!el) {
                throw new SyntaxError(`Element not found: ${String(name)}`);
            }
            const eltype = typeOf(el);
            const inn = inner(el);
            if (eltype !== 'Container') {
                throw new SyntaxError(`ui.addValue is only supported for Container elements`);
            }
            const host = inn || el;
            const sample = host.querySelector('.container-sample') as HTMLDivElement | null;
            const target = sample || host;
            const rows = Array.from(target.querySelectorAll('.container-row')) as HTMLElement[];
            const exists = rows.some(r => ((r.querySelector('.container-text') as HTMLElement | null)?.textContent || '') === String(value));
            if (exists) return;
            const row = document.createElement('div');
            row.className = 'container-row';
            const label = document.createElement('span');
            label.className = 'container-text';
            label.textContent = String(value);
            row.appendChild(label);
            target.appendChild(row);
        },

        deleteValue: (name: string, value: string) => {
            const el = findWrapper(name);
            if (!el) {
                throw new SyntaxError(`Element not found: ${String(name)}`);
            }
            const eltype = typeOf(el);
            const inn = inner(el);
            if (eltype !== 'Container') {
                throw new SyntaxError(`ui.deleteValue is only supported for Container elements`);
            }
            const host = inn || el;
            const rows = Array.from(host.querySelectorAll('.container-row')) as HTMLElement[];
            const v = String(value);
            const row = rows.find(r => ((r.querySelector('.container-text') as HTMLElement | null)?.textContent || '') === v);
            if (!row) return; // nothing to delete
            row.remove();
        },

        // call: (service, args?, cb?) => call(service, args, cb),

        // items() and values() removed in favor of getValue/setValue/getSelected

        __disposeAll: () => {
            disposers.forEach(fn => { fn(); });
            disposers.length = 0;
        }
    };

    return api;
}
