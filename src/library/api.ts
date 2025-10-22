// Shared API surface bits used by both Preview runtime and Editor (linter/helpers)

import type { PreviewUI, PreviewUIEnv } from '../interfaces/preview';
import { renderutils, errorhelpers } from './renderutils';
import { utils } from './utils';
import { datasets } from './datasets';

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
    'onClick', 'onChange', 'onInput',

    // lists & selection
    'setSelected', 'getSelected', 'addValue', 'clearValue', 'clearContainer', 'clearInput',

    // errors
    'addError', 'clearError',

    // datasets/workspace
    'listDatasets', 'listVariables'
]);

// Methods that take (elementName, ...) as first argument; used by the linter.
// Derive from API_NAMES to keep a single source of truth for the public surface,
// then exclude the non-element-first helpers explicitly (currently just 'showMessage').
const NEUTRAL_NAMES = new Set<keyof PreviewUI>([
    'showMessage',
    'listDatasets',
    'listVariables'
]);

export const ELEMENT_FIRST_ARG_CALLS: ReadonlyArray<keyof PreviewUI> = Object.freeze(
    API_NAMES.filter(n => !NEUTRAL_NAMES.has(n))
);

// Factory: build the Preview UI API bound to a specific canvas and adapters.
export function createPreviewUI(env: PreviewUIEnv): PreviewUI {
    const {
        findWrapper,
        findRadioGroupMembers,
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
            logToEditor(`Warning: ${msg}`);
            warnOnce.add(k);
        }
    };

    const inner = (el: HTMLElement | null) => el?.firstElementChild as HTMLElement | null;
    const typeOf = (el: HTMLElement | null) => String(el?.dataset?.type || '');

    const coerceName = (value: unknown): string => {
        const name = String(value ?? '').trim();
        if (!name) {
            throw new SyntaxError('Element name cannot be empty');
        }
        return name;
    };

    const lastSelectedItem = new WeakMap<HTMLElement, HTMLElement | null>();

    const populateContainer = (host: HTMLElement, items: Array<{ text: string; active?: boolean }>) => {
        let target: HTMLElement | null = null;

        // identify container target
        const existing = host.querySelector('.container-content');
        const sample = host.querySelector('.container-sample');
        if (existing instanceof HTMLElement) {
            target = existing;
        } else if (sample instanceof HTMLElement) {
            target = sample;
        } else {
            const target = document.createElement('div');
            target.className = 'container-content';
            target.style.width = '100%';
            target.style.height = '100%';
            target.style.overflowY = 'auto';
            target.style.overflowX = 'hidden';
            host.appendChild(target);
        }

        const selectionMode = String(host.dataset.selection || 'single').toLowerCase();
        const multiple = selectionMode === 'multiple';
        const initialActive = new Set<string>(
            (host.dataset.activeValues || '').split(',').map(v => v.trim()).filter(Boolean)
        );

        if (!target) {
            return;
        }

        target.replaceChildren();

        items.forEach((item) => {
            const value = String(item?.text ?? '');
            const div = document.createElement('div');
            div.className = 'container-item';
            div.dataset.value = value;

            const active = item.active || initialActive.has(value);
            div.classList.toggle('active', active);
            applyItemStyle(host, div, active);

            const label = document.createElement('span');
            label.className = 'container-text';
            label.textContent = value;
            div.appendChild(label);

            div.addEventListener('click', (ev) => {
                if (multiple && ev instanceof MouseEvent && ev.shiftKey) {
                    const all = Array.from(target.querySelectorAll<HTMLElement>('.container-item'));
                    const last = lastSelectedItem.get(host);
                    const lastIndex = last ? all.indexOf(last) : -1;
                    const currentIndex = all.indexOf(div);

                    if (lastIndex !== -1 && currentIndex !== -1) {
                        const [start, end] = lastIndex < currentIndex ? [lastIndex, currentIndex] : [currentIndex, lastIndex];
                        const shouldActivate = !div.classList.contains('active');
                        all.slice(start, end + 1).forEach(it => {
                            it.classList.toggle('active', shouldActivate);
                            applyItemStyle(host, it, shouldActivate);
                        });
                        lastSelectedItem.set(host, div);
                    } else {
                        const shouldActivate = !div.classList.contains('active');
                        div.classList.toggle('active', shouldActivate);
                        applyItemStyle(host, div, shouldActivate);
                        lastSelectedItem.set(host, div);
                    }
                } else if (multiple) {
                    const shouldSelect = !div.classList.contains('active');
                    div.classList.toggle('active', shouldSelect);
                    applyItemStyle(host, div, shouldSelect);
                    lastSelectedItem.set(host, div);
                } else {
                    target.querySelectorAll<HTMLElement>('.container-item.active').forEach(other => {
                        if (other !== div) {
                            other.classList.remove('active');
                            applyItemStyle(host, other, false);
                        }
                    });
                    div.classList.add('active');
                    applyItemStyle(host, div, true);
                    lastSelectedItem.set(host, div);
                }

                host.dataset.activeValues = Array.from(target.querySelectorAll<HTMLElement>('.container-item.active'))
                    .map(it => it.dataset.value || '')
                    .join(',');

                host.dispatchEvent(new Event('change', { bubbles: true }));
            });

            target.appendChild(div);
        });

        host.dataset.activeValues = Array.from(
            target.querySelectorAll<HTMLElement>('.container-item.active')
        ).map(item => item.dataset.value || '').join(',');

        Array.from(target.querySelectorAll<HTMLElement>('.container-item')).forEach(item => {
            applyItemStyle(host, item, item.classList.contains('active'));
        });

        if (items.length) {
            host.dispatchEvent(new Event('change', { bubbles: true }));
        }
    };

    const parseContainerValue = (value: unknown): Array<{ text: string; active?: boolean }> => {
        if (Array.isArray(value)) {
            return value.map(v => {
                if (typeof v === 'object' && v !== null && 'text' in v) {
                    return {
                        text: String(v.text ?? ''),
                        active: Boolean(v.active)
                    };
                }
                return { text: String(v ?? '') };
            });
        }

        const tokens = String(value ?? '')
            .split(/\r?\n/)
            .map(t => t.trim())
            .filter(Boolean);
        return tokens.map(text => ({ text }));
    };

    const applyItemStyle = (host: HTMLElement, item: HTMLElement, active: boolean) => {
        const label = item.querySelector('.container-text') as HTMLElement | null;
        const normalBg = host.dataset.backgroundColor || '#ffffff';
        const normalFg = host.dataset.fontColor || '#000000';
        const activeBg = host.dataset.activeBackgroundColor || '#779B49';
        const activeFg = host.dataset.activeFontColor || '#ffffff';

        if (active) {
            item.style.backgroundColor = activeBg;
            if (label) label.style.color = activeFg;
        } else {
            item.style.backgroundColor = normalBg;
            if (label) label.style.color = normalFg;
        }
    };

    const api: PreviewUI = {
        // Forward logs to the Editor console for visibility during Preview
        log: (...args) => {
            const msg = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
            logToEditor(msg);
        },

        // Convenience: checkbox/radio check/uncheck
        check: (name) => {
            const el = findWrapper(name);
            if (!el) return;

            const eltype = typeOf(el);
            if (eltype === 'Checkbox') {
                updateElement(
                    el,
                    { isChecked: 'true' }
                );
            } else if (eltype === 'Radio') {
                // Select this radio and unselect others in the same group
                const custom = el.querySelector('.custom-radio') as HTMLElement | null;
                const group = custom?.getAttribute('group') || '';

                if (group) {
                    document.querySelectorAll(`.custom-radio[group="${group}"]`).forEach((r) => {
                        const host = (r as HTMLElement).closest('.element-div') as HTMLElement | null;
                        if (host && host !== el) {
                            updateElement(
                                host,
                                { isSelected: 'false' }
                            );
                        }
                    });
                }

                updateElement(
                    el,
                    { isSelected: 'true' }
                );
            }
        },

        uncheck: (name) => {
            const el = findWrapper(name);
            if (!el) return;
            const eltype = typeOf(el);
            if (eltype === 'Checkbox') {
                updateElement(
                    el,
                    { isChecked: 'false' }
                );
            } else if (eltype === 'Radio') {
                updateElement(
                    el,
                    { isSelected: 'false' }
                );
            }
        },

        showMessage: (...argsIn: unknown[]) => {
            // New convention: (message, detail?, type?)
            const allowed = new Set(['info', 'warning', 'error', 'question']);
            const message = String(argsIn[0] ?? '');
            const detail = String(argsIn[1] ?? '');
            const typearg = String(argsIn[2] ?? '').toLowerCase();
            const type = (allowed.has(typearg) ? typearg : 'info') as 'info' | 'warning' | 'error' | 'question';
            showDialogMessage(type, message, detail);
        },

        get: (name, prop) => {
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
                        updateElement(el, { value: String(v) });
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
                        updateElement(el, { isChecked: v ? 'true' : 'false' });
                    } else {
                        warn(`${name}:${prop}`, `Unsupported set(${eltype}, ${prop})`);
                    }
                    break;

                case 'Radio':
                    if (prop === 'selected') {
                        updateElement(el, { isSelected: v ? 'true' : 'false' });
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

                        updateElement(el, { startval: String(n) });

                    } else if (prop === 'minval' || prop === 'maxval' || prop === 'startval') {
                        updateElement(el, { [prop]: String(v) });
                    } else {
                        warn(`${name}:${prop}`, `Unsupported set(${eltype}, ${prop})`);
                    }
                    break;

                case 'Container':
                    if (prop === 'value') {
                        const items = parseContainerValue(v);
                        populateContainer(el, items);
                    } else {
                        warn(`${name}:${prop}`, `Unsupported set(${eltype}, ${prop})`);
                    }
                    break;

                default:
                    warn(`${name}:${prop}`, `Unsupported set(${eltype}, ${prop})`);
                    break;
            }
        },

        getValue: (name) => {
            const el = findWrapper(name);
            if (!el) {
                return null;
            }

            const eltype = typeOf(el);
            const inn = inner(el);

            if (eltype === 'Input') {
                const input = (el instanceof HTMLInputElement ? el : (inn as HTMLInputElement | null));
                return input?.value ?? '';
            }

            if (eltype === 'Label') {
                return inn?.textContent ?? '';
            }

            if (eltype === 'Select') {
                const sel = (el instanceof HTMLSelectElement ? el : (inn as HTMLSelectElement | null));
                return sel?.value ?? '';
            }

            if (eltype === 'Checkbox') {
                return el.dataset.isChecked === 'true';
            }

            if (eltype === 'Radio') {
                return el.dataset.isSelected === 'true';
            }

            if (eltype === 'Counter') {
                const display = el.querySelector('.counter-value') as HTMLDivElement | null;
                const txt = display?.textContent ?? el.dataset.startval ?? '0';
                const n = Number(txt);
                return Number.isFinite(n) ? n : 0;
            }

            if (eltype === 'Container') {
                const host = el; // items are direct children of the container element
                const items = Array.from(host.querySelectorAll('.container-item .container-text')) as HTMLElement[];
                return items.map(r => r.textContent || '');
            }

            return el.dataset['value'] ?? null;
        },

        setValue: (name, value) => {
            const el = findWrapper(name);
            if (!el) return;

            const eltype = typeOf(el);
            const inn = inner(el);

            if (Array.isArray(value)) {
                const values = value.map(v => String(v));
                if (eltype === 'Select') {
                    const sel = (el instanceof HTMLSelectElement ? el : (el.querySelector('select') as HTMLSelectElement | null));
                    if (sel) {
                        sel.innerHTML = '';
                        for (const v of values) {
                            const opt = document.createElement('option');
                            opt.value = v; opt.textContent = v; sel.appendChild(opt);
                        }
                        const r = sel.getBoundingClientRect();
                        if (r.height > 0) {
                            el.style.height = `${Math.round(r.height)}px`;
                        }
                        el.dataset.value = String(sel.value || '');
                    }
                    return;
                }

                if (eltype === 'Container') {
                    const items = parseContainerValue(values);
                    populateContainer(el, items);
                    return;
                }

                return; // ignore arrays for other types
            }

            // Scalar
            if (eltype === 'Input') {
                const input = (el instanceof HTMLInputElement ? el : (inn as HTMLInputElement | null));

                if (input) {
                    input.value = String(value);
                    el.dataset.value = String(value);
                }

                return;
            }

            if (eltype === 'Label') {
                el.dataset.value = String(value);
                updateElement(
                    el,
                    { value: String(value) }
                );

                return;
            }

            if (eltype === 'Select') {
                const sel = (el instanceof HTMLSelectElement ? el : (el.querySelector('select') as HTMLSelectElement | null));

                if (sel) {
                    sel.value = String(value);
                    el.dataset.value = String(value);
                }

                return;
            }

            if (eltype === 'Checkbox') {
                updateElement(
                    el,
                    { isChecked: value ? 'true' : 'false' }
                );
                return;
            }

            if (eltype === 'Radio') {
                updateElement(
                    el,
                    { isSelected: value ? 'true' : 'false' }
                );
                return;
            }

            if (eltype === 'Container') {
                const items = parseContainerValue(value);
                populateContainer(el, items);
                return;
            }

            el.dataset['value'] = String(value);
        },

        getSelected: (name) => {
            const el = findWrapper(name);
            if (!el) {
                return [];
            }

            const eltype = typeOf(el);

            if (eltype === 'Select') {
                const sel = (el instanceof HTMLSelectElement ? el : (el.querySelector('select') as HTMLSelectElement | null));
                return sel && sel.value ? [sel.value] : [];
            }

            if (eltype === 'Container') {
                // Compute from DOM on the container element directly
                const nodes = Array.from(el.querySelectorAll('.container-item.active .container-text')) as HTMLElement[];

                const vals = nodes.map(n => n.textContent || '').map(s => s.trim()).filter(s => s.length > 0);
                if (vals.length > 0) {
                    return vals;
                }

                // Fallback to dataset mirror if present
                const ds = String((el as HTMLElement).dataset.selected || '').trim();
                return ds ? ds.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
            }

            return [];
        },

        // New preferred name for checked state
        isChecked: (name) => {
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

        isUnchecked: (name) => {
            return !api.isChecked(name);
        },

        isVisible: (name) => {
            const el = findWrapper(name);
            if (!el) return false;

            const ds = (el.style?.display || '').toLowerCase();
            return ds !== 'none';
        },

        isHidden: (name) => {
            return !api.isVisible(name);
        },

        isEnabled: (name) => {
            const el = findWrapper(name);
            if (!el) return false;
            return !el.classList.contains('disabled-div');
        },

        isDisabled: (name) => {
            const el = findWrapper(name);
            if (!el) return false;
            return el.classList.contains('disabled-div');
        },

        show: (name, on = true) => {
            const el = findWrapper(name);
            if (!el) return;

            if (on) {
                el.dataset.isVisible = 'true';
                el.style.removeProperty('display');
                el.classList.remove('design-hidden');

                // Also check and fix the inner element if it exists
                const inner = el.firstElementChild as HTMLElement | null;
                if (inner && inner.style.display === 'none') {
                    inner.style.removeProperty('display');
                }

                // Force visibility by setting display to block if still hidden
                if (el.style.display === 'none' || getComputedStyle(el).display === 'none') {
                    el.style.display = 'block';
                }
            } else {
                el.dataset.isVisible = 'false';
                el.style.display = 'none';
                el.classList.remove('design-hidden');
            }
        },

        hide: (name, on = true) => {
            api.show(name, !on);
        },

        enable: (name, on = true) => {
            const el = findWrapper(name);
            if (!el) return;

            updateElement(el, { isEnabled: on ? 'true' : 'false' });
        },

        disable: (name, yes = true) => {
            api.enable(name, !yes);
        },

        addError: (name, message) => {
            const key = coerceName(name);
            const text = String(message ?? '');
            if (!text) {
                return;
            }

            errorhelpers.addTooltip(key, text);
        },

        clearError: (name, message?) => {
            const key = coerceName(name);
            errorhelpers.clearTooltip(key, message ? String(message) : undefined);
        },

        // Simulated workspace datasets listing (e.g., via R connection)
        listDatasets: () => {
            try {
                return utils.getKeys(datasets);
            } catch {
                return [];
            }
        },

        // Simulated workspace variables listing
        listVariables: (x) => {
            if (x.length != 1) return [];
            try {
                return datasets[x[0]];
            } catch {
                return [];
            }
        },

        on: (name, event, handler: (ev: Event, el: HTMLElement) => void) => {
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

        onClick: (name, handler: (ev: Event, el: HTMLElement) => void) => api.on(name, 'click', handler),
        onChange: (name, handler: (ev: Event, el: HTMLElement) => void) => {
            const key = coerceName(name);

            const direct = findWrapper(key);
            if (direct) {
                api.on(key, 'change', handler);
                return;
            }

            const groupMembers = findRadioGroupMembers(key);

            if (groupMembers.length > 0) {
                const handledEvents = new WeakSet<Event>();
                const visited = new Set<HTMLElement>();
                groupMembers.forEach(member => {
                    const native = member.querySelector('input[type="radio"]');
                    const handlerWrapper = (ev: Event) => {
                        if (handledEvents.has(ev)) {
                            return;
                        }
                        handledEvents.add(ev);

                        if (!native || ev.target !== native) {
                            return;
                        }

                        if (member.dataset?.isSelected !== 'true') {
                            return;
                        }

                        handler(ev, member);
                    };

                    if (visited.has(member)) {
                        return;
                    }

                    visited.add(member);

                    const memberName = member.dataset?.nameid || member.id;
                    if (!memberName) {
                        return;
                    }

                    member.addEventListener('change', handlerWrapper);
                    disposers.push(() => member.removeEventListener('change', handlerWrapper));
                });

                return;
            }

            api.on(key, 'change', handler);
        },
        onInput: (name, handler: (ev: Event, el: HTMLElement) => void) => api.on(name, 'input', handler),

        trigger: (name, event: EventName = 'change') => {
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

        triggerChange: (name) => api.trigger(name, 'change'),
        triggerClick: (name) => api.trigger(name, 'click'),

        setSelected: (name, value) => {
            const el = findWrapper(name);
            if (!el) {
                throw new SyntaxError(`Element not found: ${String(name)}`);
            }

            const eltype = typeOf(el);

            if (eltype === 'Select') {
                const sel = (el instanceof HTMLSelectElement ? el : (el.querySelector('select') as HTMLSelectElement | null));
                if (!sel) {
                    throw new SyntaxError(`Select control not found in element ${name}`);
                }

                const v = String(Array.isArray(value) ? value[0] : value);
                const exists = Array.from(sel.options).some(o => o.value === v);

                if (!exists) {
                    throw new SyntaxError(`Option "${v}" not found in Select ${name}`);
                }

                sel.value = v;
                el.dataset.value = v;

                return;
            }

            if (eltype === 'Container') {
                const host = el; // use the container element directly
                const items = Array.from(host.querySelectorAll('.container-item')) as HTMLElement[];

                const kind = String(el.dataset.selection || (host as HTMLElement).dataset.selection || 'single').toLowerCase();
                let selValues = Array.isArray(value) ? value.map(v => String(v)) : [String(value)];

                if (kind === 'single') {
                    selValues = selValues.length ? [selValues[0]] : [];
                }

                // Replace selection to exactly match selValues
                const normalFg = String((host as HTMLElement).dataset.fontColor || '#000000');
                const activeBg = String((host as HTMLElement).dataset.activeBackgroundColor || '#779B49');
                const activeFg = String((host as HTMLElement).dataset.activeFontColor || '#ffffff');
                items.forEach(item => {
                    const label = (item.querySelector('.container-text') as HTMLElement | null)?.textContent || '';
                    const shouldSelect = selValues.includes(label);
                    item.classList.toggle('active', shouldSelect);

                    item.style.backgroundColor = shouldSelect ? activeBg : '';
                    const txt = item.querySelector('.container-text') as HTMLElement | null;
                    if (txt) {
                        txt.style.color = shouldSelect ? activeFg : normalFg;
                    }
                });

                // Update dataset mirror
                (el as HTMLElement).dataset.selected = selValues.join(',');
                return;
            }

            throw new SyntaxError(`ui.setSelected is not supported for element type ${eltype}`);
        },

        // Legacy alias: select(name, value) preserves previous additive behavior for Container
        select: (name, value) => {
            const el = findWrapper(name);
            if (!el) {
                throw new SyntaxError(`Element not found: ${String(name)}`);
            }

            const eltype = typeOf(el);

            if (eltype === 'Select') {
                api.setSelected(name, value);
                return;
            }

            if (eltype === 'Container') {
                const host = el; // use the container element directly
                const items = Array.from(host.querySelectorAll('.container-item')) as HTMLElement[];
                const v = String(value);
                const item = items.find(r => ((r.querySelector('.container-text') as HTMLElement | null)?.textContent || '') === v);
                if (!item) {
                    throw new SyntaxError(`Item with label "${v}" not found in Container ${name}`);
                }
                const h = host as HTMLElement;

                const kind = String(el.dataset.selection || h.dataset.selection || 'single').toLowerCase();
                const normalFg = String(h.dataset.fontColor || '#000000');
                const activeBg = String(h.dataset.activeBackgroundColor || '#779B49');
                const activeFg = String(h.dataset.activeFontColor || '#ffffff');

                if (kind === 'multiple') {
                    const willActivate = !item.classList.contains('active');
                    item.classList.toggle('active');
                    item.style.backgroundColor = willActivate ? activeBg : '';

                    const txt = item.querySelector('.container-text') as HTMLElement | null;
                    if (txt) {
                        txt.style.color = willActivate ? activeFg : normalFg;
                    }
                } else {
                    // Single-select: clear all others then activate this item
                    const prevs = Array.from(h.querySelectorAll('.container-item.active')) as HTMLElement[];
                    const alreadyActive = item.classList.contains('active');
                    if (!alreadyActive) {
                        for (const prev of prevs) {
                            if (prev === item) {
                                continue;
                            }

                            prev.classList.remove('active');
                            prev.style.backgroundColor = '';

                            const ptxt = prev.querySelector('.container-text') as HTMLElement | null;
                            if (ptxt) {
                                ptxt.style.color = normalFg;
                            }
                        }

                        item.classList.add('active');
                        item.style.backgroundColor = activeBg;

                        const txt = item.querySelector('.container-text') as HTMLElement | null;
                        if (txt) {
                            txt.style.color = activeFg;
                        }
                    }
                }

                // Update dataset mirror after programmatic select
                const active = Array.from(h.querySelectorAll('.container-item.active .container-text')) as HTMLElement[];
                const vals = active.map(n => String(n.textContent || '').trim()).filter(s => s.length > 0);

                el.dataset.selected = vals.join(',');
                return;
            }

            throw new SyntaxError(`ui.select is not supported for element type ${eltype}`);
        },

        addValue: (name, value) => {
            const el = findWrapper(name);
            if (!el) {
                throw new SyntaxError(`Element not found: ${String(name)}`);
            }

            const eltype = typeOf(el);

            if (eltype !== 'Container') {
                throw new SyntaxError(`addValue is only supported for Container elements`);
            }

            const host = el; // use the container element directly

            // Use the same target logic as populateContainer
            let target: HTMLElement | null = null;
            const existing = host.querySelector('.container-content');
            const sample = host.querySelector('.container-sample');
            if (existing instanceof HTMLElement) {
                target = existing;
            } else if (sample instanceof HTMLElement) {
                target = sample;
            } else {
                const target = document.createElement('div');
                target.className = 'container-content';
                target.style.width = '100%';
                target.style.height = '100%';
                target.style.overflowY = 'auto';
                target.style.overflowX = 'hidden';
                host.appendChild(target);
            }

            if (!target) {
                return;
            }

            const items = Array.from(target.querySelectorAll('.container-item')) as HTMLElement[];

            const exists = items.some(item => ((item.querySelector('.container-text') as HTMLElement | null)?.textContent || '') === String(value));
            if (exists) {
                return;
            }

            const item = document.createElement('div');
            item.className = 'container-item';
            item.dataset.value = String(value);
            const label = document.createElement('span');
            label.className = 'container-text';
            label.textContent = String(value);
            // initialize label color to container fontColor
            label.style.color = String(host.dataset.fontColor || '#000000');
            item.appendChild(label);
            target.appendChild(item);

            // Apply initial styling like in populateContainer
            applyItemStyle(host, item, false);

            // Wire click handler same as in setValue
            try {
                const h = host as HTMLElement;
                item.addEventListener('click', () => {

                    const kind = String(el.dataset.selection || h.dataset.selection || 'single').toLowerCase();
                    const normalFg = String(h.dataset.fontColor || '#000000');
                    const activeBg = String(h.dataset.activeBackgroundColor || '#779B49');
                    const activeFg = String(h.dataset.activeFontColor || '#ffffff');

                    let changed = false;

                    if (kind === 'multiple') {
                        const willActivate = !item.classList.contains('active');
                        item.classList.toggle('active');
                        item.style.backgroundColor = willActivate ? activeBg : '';

                        const txt = item.querySelector('.container-text') as HTMLElement | null;
                        if (txt) {
                            txt.style.color = willActivate ? activeFg : normalFg;
                        }

                        changed = true;

                    } else {
                        const prev = h.querySelector('.container-item.active') as HTMLElement | null;

                        if (prev !== item) {
                            if (prev) {
                                prev.classList.remove('active');
                                prev.style.backgroundColor = '';
                                const ptxt = prev.querySelector('.container-text') as HTMLElement | null;
                                if (ptxt) {
                                    ptxt.style.color = normalFg;
                                }
                            }

                            item.classList.add('active');
                            item.style.backgroundColor = activeBg;

                            const txt = item.querySelector('.container-text') as HTMLElement | null;
                            if (txt) {
                                txt.style.color = activeFg;
                            }

                            changed = true;
                        }
                    }

                    if (changed) {
                        const active = Array.from(h.querySelectorAll('.container-item.active .container-text')) as HTMLElement[];
                        const vals = active.map(n => String(n.textContent || '').trim()).filter(s => s.length > 0);

                        el.dataset.selected = vals.join(',');
                        h.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
            } catch {}
        },

        clearValue: (name, value) => {
            const el = findWrapper(name);
            if (!el) {
                throw new SyntaxError(`Element not found: ${String(name)}`);
            }

            const eltype = typeOf(el);

            if (eltype !== 'Container') {
                throw new SyntaxError(`clearValue is only supported for Container elements`);
            }

            const host = el; // use the container element directly

            const items = Array.from(host.querySelectorAll('.container-item')) as HTMLElement[];
            const v = String(value);

            const item = items.find(r => ((r.querySelector('.container-text') as HTMLElement | null)?.textContent || '') === v);
            if (!item) {
                return; // nothing to clear
            }

            item.remove();
            // Update dataset mirror after clearing
            const active = Array.from(host.querySelectorAll('.container-item.active .container-text')) as HTMLElement[];
            const vals = active.map(n => String(n.textContent || '').trim()).filter(s => s.length > 0);
            el.dataset.selected = vals.join(',');
        },

        clearContainer: (name) => {
            const el = findWrapper(name);
            if (!el) {
                throw new SyntaxError(`Element not found: ${String(name)}`);
            }

            const eltype = typeOf(el);

            if (eltype !== 'Container') {
                throw new SyntaxError(`clearContainer() can only be applied to container elements`);
            }

            const host = el; // use the container element directly
            const items = Array.from(host.querySelectorAll('.container-item')) as HTMLElement[];

            // Apply deleteValue to all items
            items.forEach(item => {
                const textElement = item.querySelector('.container-text') as HTMLElement | null;
                const value = textElement?.textContent || '';
                if (value) {
                    item.remove();
                }
            });

            // Update dataset mirror after clearing
            el.dataset.selected = '';
        },

        clearInput: (name) => {
            const el = findWrapper(name);
            if (!el) {
                throw new SyntaxError(`Element not found: ${String(name)}`);
            }

            const eltype = typeOf(el);

            if (eltype !== 'Input') {
                throw new SyntaxError(`clearInput() can only be applied to input elements`);
            }

            const inn = inner(el);
            const input = (el instanceof HTMLInputElement ? el : (inn as HTMLInputElement | null));

            if (input) {
                input.value = '';
                el.dataset.value = '';
            }
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
