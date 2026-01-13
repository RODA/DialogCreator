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
    'showMessage', 'getValue', 'setValue', 'run', 'updateSyntax',

    // checkbox/radio
    'check', 'isChecked', 'uncheck', 'isUnchecked',

    // visibility/enabled
    'show', 'isVisible', 'hide', 'isHidden', 'enable', 'isEnabled', 'disable', 'isDisabled',

    // events
    'onClick', 'onChange', 'onInput', 'triggerChange', 'triggerClick',

    // lists & selection
    'setSelected', 'getSelected', 'addValue', 'clearValue', 'clearContainer', 'clearInput', 'clearContent',
    // label and item updates
    'setLabel', 'changeValue',

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
    'listVariables',
    'run'
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
        openSyntaxPanel,
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
    const splitList = (raw: unknown): string[] => {
        return String(raw ?? '')
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
    };
    const normalizeOrderList = (values: string[]): string[] => {
        const seen = new Set<string>();
        const out: string[] = [];
        values.forEach((value) => {
            const next = String(value || '').trim();
            if (!next || seen.has(next)) return;
            seen.add(next);
            out.push(next);
        });
        return out;
    };
    const mergeSelectionOrder = (host: HTMLElement, activeItems: string[]): string[] => {
        const prev = normalizeOrderList(splitList(host.dataset.selectedOrder));
        const activeSet = new Set(activeItems);
        const next = prev.filter(v => activeSet.has(v));
        const seen = new Set(next);
        activeItems.forEach((value) => {
            if (!seen.has(value)) {
                next.push(value);
                seen.add(value);
            }
        });
        return next;
    };

    const attachContainerItemHandler = (host: HTMLElement, target: HTMLElement, item: HTMLElement) => {
        item.addEventListener('click', (ev) => {
            if (item.dataset.disabled === 'true') {
                ev.preventDefault();
                return;
            }

            const selectionMode = String(host.dataset.selection || 'single').toLowerCase();
            const multiple = selectionMode === 'multiple';

            if (multiple && ev instanceof MouseEvent && ev.shiftKey) {
                const all = Array.from(target.querySelectorAll<HTMLElement>('.container-item'));
                const last = lastSelectedItem.get(host);
                const lastIndex = last ? all.indexOf(last) : -1;
                const currentIndex = all.indexOf(item);

                if (lastIndex !== -1 && currentIndex !== -1) {
                    const [start, end] = lastIndex < currentIndex ? [lastIndex, currentIndex] : [currentIndex, lastIndex];
                    const shouldActivate = !item.classList.contains('active');
                    all.slice(start, end + 1).forEach(it => {
                        if (it.dataset.disabled === 'true') {
                            it.classList.remove('active');
                            applyItemStyle(host, it, false);
                            return;
                        }
                        it.classList.toggle('active', shouldActivate);
                        applyItemStyle(host, it, shouldActivate);
                    });
                    lastSelectedItem.set(host, item);
                } else {
                    const shouldActivate = !item.classList.contains('active');
                    item.classList.toggle('active', shouldActivate);
                    applyItemStyle(host, item, shouldActivate);
                    lastSelectedItem.set(host, item);
                }
            } else if (multiple) {
                const shouldSelect = !item.classList.contains('active');
                item.classList.toggle('active', shouldSelect);
                applyItemStyle(host, item, shouldSelect);
                lastSelectedItem.set(host, item);
            } else {
                target.querySelectorAll<HTMLElement>('.container-item.active').forEach(other => {
                    if (other !== item) {
                        other.classList.remove('active');
                        applyItemStyle(host, other, false);
                    }
                });
                item.classList.add('active');
                applyItemStyle(host, item, true);
                lastSelectedItem.set(host, item);
            }

            const activeValues = Array.from(target.querySelectorAll<HTMLElement>('.container-item.active'))
                .map(it => it.dataset.value || '')
                .join(',');
            host.dataset.activeValues = activeValues;
            host.dataset.selected = activeValues;
            if (utils.isTrue(host.dataset.itemOrder)) {
                const ordered = mergeSelectionOrder(host, activeValues.split(',').map(s => s.trim()).filter(Boolean));
                host.dataset.selectedOrder = ordered.join(',');
            } else if ('selectedOrder' in host.dataset) {
                delete host.dataset.selectedOrder;
            }

            host.dispatchEvent(new Event('change', { bubbles: true }));
            renderutils.applyContainerItemFilter(host);
        });
    };

    const populateContainer = (host: HTMLElement, items: Array<{ text: string; active?: boolean; type?: string }>) => {
        let target: HTMLElement | null = null;

        // identify container target
        const existing = host.querySelector('.container-content');
        const sample = host.querySelector('.container-sample');
        if (existing instanceof HTMLElement) {
            target = existing;
        } else if (sample instanceof HTMLElement) {
            target = sample;
        } else {
            target = document.createElement('div');
            target.className = 'container-content';
            target.style.width = '100%';
            target.style.height = '100%';
            target.style.overflowY = 'auto';
            target.style.overflowX = 'hidden';
            host.appendChild(target);
        }

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
            const itemType = renderutils.normalizeContainerItemType(item?.type ?? (item as any)?.itemType ?? (item as any)?.kind ?? '');
            if (itemType && itemType !== 'any') {
                div.dataset.itemType = itemType;
            } else {
                delete div.dataset.itemType;
            }

            const active = item.active || initialActive.has(value);
            div.classList.toggle('active', active);
            applyItemStyle(host, div, active);

            const label = document.createElement('span');
            label.className = 'container-text';
            label.textContent = value;
            div.appendChild(label);

            attachContainerItemHandler(host, target, div);

            target.appendChild(div);
        });

        host.dataset.activeValues = Array.from(
            target.querySelectorAll<HTMLElement>('.container-item.active')
        ).map(item => item.dataset.value || '').join(',');
        if (utils.isTrue(host.dataset.itemOrder)) {
            const active = host.dataset.activeValues
                ? host.dataset.activeValues.split(',').map(s => s.trim()).filter(Boolean)
                : [];
            const ordered = mergeSelectionOrder(host, active);
            host.dataset.selectedOrder = ordered.join(',');
        } else if ('selectedOrder' in host.dataset) {
            delete host.dataset.selectedOrder;
        }

        Array.from(target.querySelectorAll<HTMLElement>('.container-item')).forEach(item => {
            applyItemStyle(host, item, item.classList.contains('active'));
        });

        renderutils.applyContainerItemFilter(host);

        if (items.length) {
            host.dispatchEvent(new Event('change', { bubbles: true }));
        }
    };

    const parseContainerValue = (value: unknown): Array<{ text: string; active?: boolean; type?: string }> => {
        if (Array.isArray(value)) {
            return value.map(val => {
                if (typeof val === 'object' && val !== null && 'text' in val) {
                    return {
                        text: String(val.text ?? ''),
                        active: Boolean(val.active),
                        type: 'type' in val ? String(val.type ?? '') : ('itemType' in val ? String(val.itemType ?? '') : undefined)
                    };
                }
                return { text: String(val ?? '') };
            });
        }

        const tokens = String(value ?? '')
            .split(/\r?\n/)
            .map(t => t.trim())
            .filter(Boolean);
        return tokens.map(text => ({ text }));
    };

    type SorterState = 'off' | 'asc' | 'desc';
    const normalizeSorterState = (raw: unknown, allowDesc: boolean): SorterState => {
        const val = String(raw ?? '').toLowerCase();
        if (val === 'asc') return 'asc';
        if (val === 'desc' && allowDesc) return 'desc';
        return 'off';
    };

    const normalizeSorterInput = (value: unknown, allowDesc: boolean): Array<{ text: string; state: SorterState }> => {
        const list = Array.isArray(value) ? value : [value];
        const out: Array<{ text: string; state: SorterState }> = [];
        list.forEach((entry) => {
            if (entry === undefined || entry === null) return;
            if (typeof entry === 'object' && !Array.isArray(entry)) {
                const text = String((entry as any).text ?? (entry as any).label ?? '').trim();
                if (!text) return;
                const st = normalizeSorterState((entry as any).state, allowDesc);
                out.push({ text, state: st });
                return;
            }
            const raw = String(entry ?? '').trim();
            if (!raw) return;
            const [labelPart, statePart] = raw.split(':');
            const text = labelPart.trim();
            if (!text) return;
            const st = normalizeSorterState(statePart || 'asc', allowDesc);
            out.push({ text, state: st });
        });
        return out;
    };

    const readSorterItems = (host: HTMLElement): Array<{ text: string; state: SorterState }> => {
        const allowDesc = utils.isTrue(host.dataset.ordering ?? 'true');
        const raw = host.dataset.sorterState || '';
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return normalizeSorterInput(parsed, allowDesc).map(item => ({
                    text: item.text,
                    state: normalizeSorterState(item.state, allowDesc)
                }));
            }
        } catch { /* noop */ }

        const rows = Array.from(host.querySelectorAll('.sorter-item')) as HTMLElement[];
        if (rows.length) {
            return rows.map(row => ({
                text: (row.querySelector('.sorter-label') as HTMLElement | null)?.textContent?.trim() || '',
                state: normalizeSorterState(row.dataset.state || 'off', allowDesc)
            })).filter(item => item.text);
        }

        const labels = String(host.dataset.items || host.dataset.value || '')
            .split(/[;,]/)
            .map(s => s.trim())
            .filter(Boolean);

        return labels.map(text => ({ text, state: 'off' as SorterState }));
    };

    const applySorterItems = (host: HTMLElement, items: Array<{ text: string; state: SorterState }>) => {
        const allowDesc = utils.isTrue(host.dataset.ordering ?? 'true');
        const normalized = items
            .map(item => ({
                text: String(item.text || '').trim(),
                state: normalizeSorterState(item.state, allowDesc)
            }))
            .filter(item => item.text);

        const visual = host.querySelector('.sorter') as HTMLElement | null;
        const targets = visual ? [host, visual] : [host];

        const joined = normalized.map(it => it.text).join(',');
        targets.forEach(node => {
            node.dataset.sorterState = JSON.stringify(normalized);
            node.dataset.items = joined;
            node.dataset.value = joined; // legacy alias
        });

        renderutils.renderSorter(visual || host, {
            items: host.dataset.items,
            sorterState: host.dataset.sorterState
        });
    };

    const applyItemStyle = (host: HTMLElement, item: HTMLElement, active: boolean) => {
        const label = item.querySelector('.container-text') as HTMLElement | null;
        const normalBg = host.dataset.backgroundColor || '#ffffff';
        const normalFg = host.dataset.fontColor || '#000000';
        const activeBg = host.dataset.activeBackgroundColor || '##589658';
        const activeFg = host.dataset.activeFontColor || '#ffffff';
        const disabledBg = host.dataset.disabledBackgroundColor || '#ececec';

        if (item.dataset.disabled === 'true') {
            item.style.backgroundColor = disabledBg;
            if (label) label.style.color = normalFg;
            return;
        }

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

        run: (_command: string) => {
            // Intentionally left as a no-op to preserve legacy API surface.
        },

        updateSyntax: (command: string) => {
            try {
                // Prefer external floating panel via env if available
                if (typeof openSyntaxPanel === 'function') {
                    openSyntaxPanel(String(command ?? ''));
                    return;
                }

                const root = document.getElementById('preview-root');
                if (!root) { logToEditor(`updateSyntax(): preview root not found.`); return; }

                // Ensure we place the panel right after the canvas
                const canvas = root.querySelector('.preview-canvas') as HTMLElement | null;

                let panel = root.querySelector('.preview-syntax-panel') as HTMLDivElement | null;
                if (!panel) {
                    panel = document.createElement('div');
                    panel.className = 'preview-syntax-panel';
                    // Insert after canvas when possible, otherwise append to root
                    if (canvas && canvas.parentElement === root && canvas.nextSibling) {
                        root.insertBefore(panel, canvas.nextSibling);
                    } else {
                        root.appendChild(panel);
                    }
                }

                // Keep width in sync with canvas for alignment
                try {
                    const w = (canvas?.getBoundingClientRect().width || 0);
                    if (w > 0) {
                        panel.style.width = `${Math.round(w)}px`;
                    } else {
                        panel.style.removeProperty('width');
                    }
                } catch {}

                // Render command as code in monospace
                panel.innerHTML = '';
                const pre = document.createElement('pre');
                pre.className = 'preview-syntax-panel-pre';
                pre.textContent = String(command ?? '');
                panel.appendChild(pre);
                panel.style.display = 'block';
            } catch (e: any) {
                const msg = `updateSyntax() failed: ${String(e && e.message ? e.message : e)}`;
                logToEditor(msg);
            }
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

                case 'ChoiceList':
                    if (prop === 'value') {
                        applySorterItems(el, normalizeSorterInput(v, utils.isTrue(el.dataset.ordering)));
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

            if (eltype === 'ChoiceList') {
                return readSorterItems(el);
            }

            if (eltype === 'Container') {
                const host = el; // items are direct children of the container element
                const items = Array.from(host.querySelectorAll('.container-item .container-text')) as HTMLElement[];
                const values = items.map(r => r.textContent || '');
                return values.length ? values : '';
            }

            return el.dataset['value'] ?? null;
        },

        setValue: (name, value) => {
            const el = findWrapper(name);
            if (!el) return;

            const eltype = typeOf(el);
            const inn = inner(el);

            if (Array.isArray(value)) {
                if (eltype === 'Select') {
                    const sel = (el instanceof HTMLSelectElement ? el : (el.querySelector('select') as HTMLSelectElement | null));
                    if (sel) {
                        const values = value.map(v => String(v));
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
                    const items = parseContainerValue(value);
                    populateContainer(el, items);
                    return;
                }

                if (eltype === 'ChoiceList') {
                    applySorterItems(el, normalizeSorterInput(value, utils.isTrue(el.dataset.ordering)));
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

            if (eltype === 'ChoiceList') {
                applySorterItems(el, normalizeSorterInput(value, utils.isTrue(el.dataset.ordering)));
                return;
            }

            el.dataset['value'] = String(value);
        },

        getSelected: (name) => {
            // Try direct element first
            const el = findWrapper(name);

            if (!el) {
                // If not a direct element, treat the name as a radio group identifier
                const members = findRadioGroupMembers(String(name));
                if (members && members.length > 0) {
                    const selected = (() => {
                        // Prefer dataset mirror
                        const ds = members.find(m => String(m.dataset?.isSelected || '') === 'true');
                        if (ds) return ds;
                        // Fallback to native input checked
                        const n = members.find(m => {
                            const input = m.querySelector('input[type="radio"]') as HTMLInputElement | null;
                            return !!input?.checked;
                        });
                        if (n) return n;
                        // Fallback to custom node aria-checked
                        const c = members.find(m => {
                            const custom = m.querySelector('.custom-radio') as HTMLElement | null;
                            return custom?.getAttribute('aria-checked') === 'true';
                        });
                        return c || null;
                    })();

                    if (selected) {
                        const nm = String(selected.dataset?.nameid || selected.id || '').trim();
                        return nm ? [nm] : [];
                    }

                    return [];
                }

                return [];
            }

            const eltype = typeOf(el);

            if (eltype === 'Select') {
                const sel = (el instanceof HTMLSelectElement ? el : (el.querySelector('select') as HTMLSelectElement | null));
                return sel && sel.value ? [sel.value] : [];
            }

            if (eltype === 'Container') {
                if (utils.isTrue((el as HTMLElement).dataset.itemOrder)) {
                    const ordered = normalizeOrderList(splitList((el as HTMLElement).dataset.selectedOrder));
                    if (ordered.length > 0) {
                        return ordered;
                    }
                }
                // Compute from DOM on the container element directly
                const nodes = Array.from(el.querySelectorAll('.container-item.active .container-text')) as HTMLElement[];

                const vals = nodes.map(n => n.textContent || '').map(s => s.trim()).filter(s => s.length > 0);
                if (vals.length > 0) {
                    return vals;
                }

                // Fallback to dataset mirror if present
                const ds = String((el as HTMLElement).dataset.selected || '').trim();
                const dsVals = ds
                    ? ds.split(',').map(s => s.trim()).filter(s => s.length > 0)
                    : [];

                return dsVals.length > 0 ? dsVals : '';
            }

            if (eltype === 'ChoiceList') {
                const items = readSorterItems(el).filter(item => item.state !== 'off');
                if (items.length === 0) return [];
                return items.map(item => `${item.text}:${item.state}`);
            }

            // Radios are handled via radio group names; for a single Radio element,
            // prefer isChecked(name) instead of getSelected(name).

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
        listVariables: (input) => {
            const items = Array.isArray(input) ? input : [input];
            const [datasetName] = items.map(v => String(v ?? '').trim()).filter(Boolean);
            if (!datasetName) {
                return [];
            }
            const source = datasets[datasetName];
            if (!Array.isArray(source)) {
                return [];
            }
            return source.map(entry => ({
                text: String(entry?.text ?? ''),
                type: String(entry?.type ?? '')
            }));
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
                const applied = new Set<string>();
                items.forEach(item => {
                    const label = (item.querySelector('.container-text') as HTMLElement | null)?.textContent || '';
                    const disabled = item.dataset.disabled === 'true';
                    const shouldSelect = !disabled && selValues.includes(label);
                    item.classList.toggle('active', shouldSelect);
                    applyItemStyle(host, item, shouldSelect);
                    if (shouldSelect) {
                        applied.add(label);
                    }
                });

                // Update dataset mirror
                const finalValues = Array.from(applied).map(v => v.trim()).filter(Boolean);
                const joined = finalValues.join(',');
                const containerEl = el as HTMLElement;
                containerEl.dataset.selected = joined;
                containerEl.dataset.activeValues = joined;
                if (utils.isTrue(containerEl.dataset.itemOrder)) {
                    const desired = normalizeOrderList(selValues);
                    const appliedSet = new Set(finalValues);
                    const ordered = desired.filter(v => appliedSet.has(v));
                    const extras = finalValues.filter(v => !ordered.includes(v));
                    const next = normalizeOrderList([...ordered, ...extras]);
                    containerEl.dataset.selectedOrder = next.join(',');
                } else if ('selectedOrder' in containerEl.dataset) {
                    delete containerEl.dataset.selectedOrder;
                }
                renderutils.applyContainerItemFilter(host);
                return;
            }

            if (eltype === 'ChoiceList') {
                const host = el;
                const allowDesc = utils.isTrue(host.dataset.ordering);
                const current = readSorterItems(host);
                const desired = normalizeSorterInput(value, allowDesc);
                const desiredMap = new Map(desired.map(d => [d.text, d.state]));
                const merged = current.map(item => {
                    const next = desiredMap.get(item.text);
                    return next ? { text: item.text, state: next } : { text: item.text, state: 'off' as SorterState };
                });
                applySorterItems(host, merged);
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
                if (item.dataset.disabled === 'true') {
                    const required = renderutils.normalizeContainerItemType(h.dataset.itemType || 'any') || 'any';
                    throw new SyntaxError(`Item "${v}" is not selectable; container requires ${required} items`);
                }

                const kind = String(el.dataset.selection || h.dataset.selection || 'single').toLowerCase();
                const multiple = kind === 'multiple';
                let changed = false;
                let toggledOn = false;

                if (multiple) {
                    const willActivate = !item.classList.contains('active');
                    item.classList.toggle('active', willActivate);
                    applyItemStyle(h, item, willActivate);
                    changed = true;
                    toggledOn = willActivate;
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
                            applyItemStyle(h, prev, false);
                        }

                        item.classList.add('active');
                        applyItemStyle(h, item, true);
                        changed = true;
                    }
                }

                if (changed) {
                    const active = Array.from(h.querySelectorAll('.container-item.active .container-text')) as HTMLElement[];
                    const vals = active.map(n => String(n.textContent || '').trim()).filter(s => s.length > 0);
                    const joined = vals.join(',');
                    el.dataset.selected = joined;
                    h.dataset.activeValues = joined;
                    if (utils.isTrue(h.dataset.itemOrder)) {
                        const label = v.trim();
                        let nextOrder = normalizeOrderList(splitList(h.dataset.selectedOrder));
                        if (multiple) {
                            nextOrder = toggledOn
                                ? normalizeOrderList([...nextOrder.filter(val => val !== label), label])
                                : nextOrder.filter(val => val !== label);
                        } else {
                            nextOrder = label ? [label] : [];
                        }
                        h.dataset.selectedOrder = normalizeOrderList(nextOrder).join(',');
                    } else if ('selectedOrder' in h.dataset) {
                        delete h.dataset.selectedOrder;
                    }
                    renderutils.applyContainerItemFilter(h);
                }
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
                target = document.createElement('div');
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

            const descriptor = (() => {
                if (typeof value === 'object' && value !== null) {
                    const src = value as {
                        text?: unknown;
                        label?: unknown;
                        type?: unknown;
                        itemType?: unknown;
                    };
                    const text = src.text ?? src.label ?? '';
                    const type = src.type ?? src.itemType ?? '';
                    return { text: String(text ?? ''), type: String(type ?? '') };
                }
                return { text: String(value ?? ''), type: '' };
            })();

            const textValue = descriptor.text.trim();
            const normalizedType = renderutils.normalizeContainerItemType(descriptor.type);

            if (!textValue) {
                return;
            }

            const items = Array.from(target.querySelectorAll('.container-item')) as HTMLElement[];

            const exists = items.some(item => ((item.querySelector('.container-text') as HTMLElement | null)?.textContent || '') === textValue);
            if (exists) {
                return;
            }

            const item = document.createElement('div');
            item.className = 'container-item';
            item.dataset.value = textValue;
            if (normalizedType && normalizedType !== 'any') {
                item.dataset.itemType = normalizedType;
            } else {
                delete item.dataset.itemType;
            }
            const label = document.createElement('span');
            label.className = 'container-text';
            label.textContent = textValue;
            // initialize label color to container fontColor
            label.style.color = String(host.dataset.fontColor || '#000000');
            item.appendChild(label);
            target.appendChild(item);

            // Apply initial styling like in populateContainer
            applyItemStyle(host, item, false);

            // Wire click handler same as populateContainer
            attachContainerItemHandler(host, target, item);

            renderutils.applyContainerItemFilter(host);
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
            const values = (Array.isArray(value) ? value : [value])
                .map(v => String(v).trim())
                .filter(v => v.length > 0);

            if (values.length === 0) {
                return; // nothing to clear
            }

            const valuesSet = new Set(values);
            let removed = false;

            items.forEach(item => {
                const textElement = item.querySelector('.container-text') as HTMLElement | null;
                const text = String(textElement?.textContent || '').trim();
                if (valuesSet.has(text)) {
                    item.remove();
                    removed = true;
                }
            });

            if (!removed) {
                return; // no matching items found
            }

            // Update dataset mirror after clearing
            const active = Array.from(host.querySelectorAll('.container-item.active .container-text')) as HTMLElement[];
            const vals = active.map(n => String(n.textContent || '').trim()).filter(s => s.length > 0);
            const joined = vals.join(',');
            el.dataset.selected = joined;
            host.dataset.activeValues = joined;
            if (utils.isTrue(host.dataset.itemOrder)) {
                const ordered = mergeSelectionOrder(host, vals);
                host.dataset.selectedOrder = ordered.join(',');
            } else if ('selectedOrder' in host.dataset) {
                delete host.dataset.selectedOrder;
            }
            renderutils.applyContainerItemFilter(host);
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
            host.dataset.activeValues = '';
            if ('selectedOrder' in host.dataset) {
                delete host.dataset.selectedOrder;
            }
            renderutils.applyContainerItemFilter(host);
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

        clearContent: (name) => {
            const el = findWrapper(name);
            if (!el) {
                throw new SyntaxError(`Element not found: ${String(name)}`);
            }

            const eltype = typeOf(el);

            if (eltype === 'Input') {
                const inn = inner(el);
                const input = (el instanceof HTMLInputElement ? el : (inn as HTMLInputElement | null));
                if (input) {
                    input.value = '';
                    el.dataset.value = '';
                }
                return;
            }

            if (eltype === 'Container') {
                const host = el; // use the container element directly
                const items = Array.from(host.querySelectorAll('.container-item')) as HTMLElement[];
                items.forEach(item => item.remove());
                el.dataset.selected = '';
                host.dataset.activeValues = '';
                if ('selectedOrder' in host.dataset) {
                    delete host.dataset.selectedOrder;
                }
                renderutils.applyContainerItemFilter(host);
                return;
            }

            throw new SyntaxError(`clearContent() supports only Input and Container elements`);
        },

        // Update the visible label of a Button element
        setLabel: (name, label) => {
            const el = findWrapper(name);
            if (!el) {
                throw new SyntaxError(`Element not found: ${String(name)}`);
            }

            const eltype = typeOf(el);
            if (eltype !== 'Button') {
                throw new SyntaxError(`setLabel() can only be applied to Button elements`);
            }

            updateElement(el, { label: String(label ?? '') });
        },

        // Change the label of a specific Container item
        changeValue: (name, oldValue, newValue) => {
            const el = findWrapper(name);
            if (!el) {
                throw new SyntaxError(`Element not found: ${String(name)}`);
            }

            const eltype = typeOf(el);
            if (eltype !== 'Container') {
                throw new SyntaxError(`changeValue() can only be applied to Container elements`);
            }

            const host = el; // container wrapper
            const items = Array.from(host.querySelectorAll('.container-item')) as HTMLElement[];
            const from = String(oldValue ?? '');
            const to = String(newValue ?? '');

            // Find first item whose text or dataset.value matches
            const item = items.find(r => {
                const text = (r.querySelector('.container-text') as HTMLElement | null)?.textContent || '';
                const ds = r.dataset.value || '';
                return text === from || ds === from;
            });

            if (!item) {
                return; // nothing to change
            }

            // Update dataset mirror and visible text
            item.dataset.value = to;
            const label = item.querySelector('.container-text') as HTMLElement | null;
            if (label) {
                label.textContent = to;
            }

            // If item is active, refresh container's dataset.selected mirror
            try {
                const active = Array.from(host.querySelectorAll('.container-item.active .container-text')) as HTMLElement[];
                const vals = active.map(n => String(n.textContent || '').trim()).filter(s => s.length > 0);
                el.dataset.selected = vals.join(',');
            } catch {}
        },

        // call: (service, args?, cb?) => call(service, args, cb),

        // items() and values() removed in favor of getValue/setValue/getSelected

        __disposeAll: () => {
            disposers.forEach(fn => { fn(); });
            disposers.length = 0;
        }
    };

    // Ensure the syntax panel is created/opened alongside the preview.
    try {
        api.updateSyntax('');
    } catch { /* ignore panel boot errors */ }

    return api;
}
