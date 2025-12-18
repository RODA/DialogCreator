// Specific utilities for various (renderer) modules

import { RenderUtils, ValidationMessage, ErrorTippy } from '../interfaces/renderutils';
import { utils } from './utils';
import { dialog } from '../modules/dialog';
import { elements } from '../modules/elements';
import { DialogProperties } from "../interfaces/dialog";
import {
    PrimitiveKind,
    AssertOptions,
    BuildOptions,
    UniformSchema,
    StringNumber
} from "../interfaces/elements";
import { showError, coms } from '../modules/coms';
import { EVENT_NAMES, EventName } from '../library/api';
import { v4 as uuidv4 } from 'uuid';
import * as path from "path";
import * as fs from "fs";
import tippy from "tippy.js";
import Sortable = require("sortablejs");

let __uniformSchema: UniformSchema | null = null;

const validation_messages: ValidationMessage = {};
const error_tippy: ErrorTippy = {};
const auto_highlight = new Set<string>();
const highlight_targets = new Map<string, Set<HTMLElement>>();
const enhancedButtons = new WeakSet<HTMLButtonElement>();
const KNOWN_CONTAINER_ITEM_TYPES = new Set<string>([
    'numeric',
    'calibrated',
    'binary',
    'character',
    'factor',
    'date'
]);

const previewWindow = (): boolean => {
    try {
        const loc = window.location.pathname.toLowerCase();
        if (loc.includes('preview.html')) return true;
        if (document.body && document.body.dataset.view === 'preview') return true;
        // Fallback: editor has an element with id 'dialog-properties'; preview should not
        return !document.getElementById('dialog-properties');
    } catch {
        return false;
    }
};

const normalizeContainerItemType = (value: unknown): string => {
    const raw = String(value ?? '').trim().toLowerCase();
    if (!raw) return '';
    if (raw === 'any') return 'any';
    if (KNOWN_CONTAINER_ITEM_TYPES.has(raw)) {
        return raw;
    }
    return raw;
};

const resolveContainerItemType = (value: unknown): string => {
    const normalized = normalizeContainerItemType(value);
    if (!normalized || normalized === 'any') {
        return 'any';
    }
    if (!KNOWN_CONTAINER_ITEM_TYPES.has(normalized)) {
        return 'any';
    }
    return normalized;
};

const applyContainerItemFilter = (host: HTMLElement | null) => {
    if (!(host instanceof HTMLElement)) {
        return;
    }

    // Skip visual filtering in the editor: the design surface only shows sample rows.
    if (!previewWindow()) {
        return;
    }

    const allowed = resolveContainerItemType(host.dataset.itemType);
    const allowAll = allowed === 'any';
    const items = Array.from(host.querySelectorAll<HTMLElement>('.container-item'));
    const normalBg = host.dataset.backgroundColor || '#ffffff';
    const normalFg = host.dataset.fontColor || '#000000';
    const activeBg = host.dataset.activeBackgroundColor || '##589658';
    const activeFg = host.dataset.activeFontColor || '#ffffff';
    const disabledBg = host.dataset.disabledBackgroundColor || '#ececec';
    let selectionChanged = false;

    items.forEach((item) => {
        const rawItemType = item.dataset.itemType || item.dataset.valueType || '';
        const itemType = normalizeContainerItemType(rawItemType);
        const hasExplicitType = Boolean(rawItemType);
        const blocked = !allowAll && hasExplicitType && itemType !== allowed;
        const label = item.querySelector('.container-text') as HTMLElement | null;

        if (blocked) {
            item.classList.add('container-item-disabled');
            item.dataset.disabled = 'true';
            item.setAttribute('aria-disabled', 'true');
            if (item.classList.contains('active')) {
                item.classList.remove('active');
                selectionChanged = true;
            }
            item.style.backgroundColor = disabledBg;
            if (label) {
                label.style.color = normalFg;
            }
        } else {
            item.classList.remove('container-item-disabled');
            if (item.dataset.disabled) {
                delete item.dataset.disabled;
            }
            item.removeAttribute('aria-disabled');
            const isActive = item.classList.contains('active');
            item.style.backgroundColor = isActive ? activeBg : normalBg;
            if (label) {
                label.style.color = isActive ? activeFg : normalFg;
            }
        }
    });

    if (selectionChanged) {
        const activeItems = items
            .filter(node => node.classList.contains('active'))
            .map(node => (node.querySelector('.container-text') as HTMLElement | null)?.textContent || '')
            .map(text => text.trim())
            .filter(Boolean);
        const joined = activeItems.join(',');
        host.dataset.selected = joined;
        host.dataset.activeValues = joined;
        host.dispatchEvent(new Event('change', { bubbles: true }));
    }
};

type SorterState = 'off' | 'asc' | 'desc';
type SorterItem = { text: string; state: SorterState };
const SORTER_STATE_KEY = 'sorterState';

const splitSorterValues = (value: unknown): string[] => {
    return String(value ?? '')
        .split(/[;,]/)
        .map(s => s.trim())
        .filter(Boolean);
};

const parseSorterState = (raw: unknown): SorterItem[] => {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(String(raw));
        if (Array.isArray(parsed)) {
            return parsed
                .map((item: any) => {
                    const text = String(item?.text ?? item?.label ?? item?.name ?? '').trim();
                    const state = String(item?.state ?? '').toLowerCase();
                    const normalized = (state === 'asc' || state === 'desc') ? state as SorterState : 'off';
                    return text ? { text, state: normalized } : null;
                })
                .filter(Boolean) as SorterItem[];
        }
    } catch { /* noop */ }
    return [];
};

const stringifySorterState = (items: SorterItem[]) => JSON.stringify(items.map(it => ({ text: it.text, state: it.state })));

const normalizeSorterItems = (itemsValue: unknown, stateRaw: unknown): SorterItem[] => {
    const labels = splitSorterValues(itemsValue);
    const prev = parseSorterState(stateRaw);
    const prevMap = new Map(prev.map(it => [it.text, it.state]));
    return labels.map(label => ({
        text: label,
        state: prevMap.get(label) || 'off'
    }));
};

const cycleSorterState = (current: SorterState, ordering: boolean): SorterState => {
    if (current === 'off') return 'asc';
    if (current === 'asc' && ordering) return 'desc';
    return 'off';
};

const applySorterStateClasses = (
    row: HTMLElement,
    item: SorterItem,
    colors: { ascBg: string; descBg: string; activeFg: string; baseBg: string; baseFg: string },
    indicator?: HTMLElement | null
) => {
    row.classList.remove('is-asc', 'is-desc', 'is-off');
    const indicatorChar = item.state === 'desc' ? '▼' : '▲';
    if (item.state === 'asc') {
        row.classList.add('is-asc');
        row.style.setProperty('--sorter-row-bg', colors.ascBg);
        row.style.color = colors.activeFg;
    } else if (item.state === 'desc') {
        row.classList.add('is-desc');
        row.style.setProperty('--sorter-row-bg', colors.descBg);
        row.style.color = colors.activeFg;
    } else {
        row.classList.add('is-off');
        row.style.setProperty('--sorter-row-bg', colors.baseBg);
        row.style.color = colors.baseFg;
    }
    if (indicator) {
        indicator.classList.remove('asc', 'desc', 'off');
        const cls = item.state === 'asc' ? 'asc' : item.state === 'desc' ? 'desc' : 'off';
        indicator.classList.add(cls);
        indicator.textContent = indicatorChar;
    }
};

const updateSorterDataset = (host: HTMLElement, items: SorterItem[]) => {
    const order = items.map(it => it.text).join(',');
    const selected = items
        .filter(it => it.state !== 'off')
        .map(it => `${it.text}:${it.state}`);
    const joinedSelected = selected.join(',');

    host.dataset.items = order;
    host.dataset.value = order; // legacy alias
    host.dataset.order = order;
    host.dataset.activeValues = joinedSelected;
    host.dataset.selected = joinedSelected;
    host.dataset[SORTER_STATE_KEY] = stringifySorterState(items);
};

const CSS_ESCAPE = (value: string) => {
    if (typeof CSS !== 'undefined' && CSS.escape) {
        return CSS.escape(value);
    }
    return value.replace(/"/g, '\\"');
};

function getRadioWrapperFromNode(node: Element | null | undefined): HTMLElement | null {
    if (!(node instanceof HTMLElement)) {
        return null;
    }

    const directType = String(node.dataset?.type || '').trim();
    if (directType === 'Radio') {
        return node;
    }

    const wrapper = node.closest('.element-wrapper');
    if (wrapper instanceof HTMLElement) {
        const wrapperType = String(wrapper.dataset?.type || '').trim();
        if (wrapperType === 'Radio') {
            return wrapper;
        }
    }

    return null;
}

function withElementList(elementOrElements: string | string[], fn: (name: string) => void) {
    const list = Array.isArray(elementOrElements) ? elementOrElements : [elementOrElements];
    list.forEach(name => {
        const trimmed = String(name ?? '').trim();
        if (!trimmed) {
            return;
        }
        fn(trimmed);
    });
}

function resolveElementHost(name: string): { host: HTMLElement | null; isRadio: boolean } {
    const escaped = CSS_ESCAPE(name);
    let host = document.querySelector(`[data-nameid="${escaped}"]`) as HTMLElement | null;
    let isRadio = false;

    if (!host) {
        host = document.getElementById(name);
    }

    if (!host) {
        const radio = document.getElementsByName(name)[0] as HTMLElement | undefined;
        if (radio && radio.parentNode && radio.parentNode.parentNode instanceof HTMLElement) {
            host = radio.parentNode.parentNode as HTMLElement;
            isRadio = true;
        }
    }

    if (host && !isRadio) {
        const type = String(
            host.dataset?.type ||
            host.getAttribute?.('data-type') ||
            host.firstElementChild?.getAttribute?.('data-type') ||
            ''
        );

        isRadio = type === 'Radio';
    }

    return { host, isRadio };
}

function ensureTooltip(name: string, anchor: HTMLElement, content: string) {
    if (!error_tippy[name]) {
        error_tippy[name] = [
            tippy(anchor, {
                theme: 'light-red',
                placement: 'top-start',
                content,
                arrow: false,
                allowHTML: true,
                // Keep tooltip out of the way and outside the canvas stacking context
                appendTo: () => document.body,
                offset: [0, 8],
                zIndex: 9999,
                interactive: false
            })
        ];
    } else {
        error_tippy[name][0]?.setContent(content);
    }
}

function destroyTooltip(name: string) {
    if (error_tippy[name]) {
        error_tippy[name][0]?.destroy();
        delete error_tippy[name];
    }
}

function bestAnchorFor(name: string, fallback: HTMLElement | null): HTMLElement | null {
    const stored = highlight_targets.get(name);
    if (stored && stored.size) {
        for (const node of stored) return node; // first stored node
    }
    if (fallback && fallback.firstElementChild instanceof HTMLElement) {
        return fallback.firstElementChild as HTMLElement;
    }
    return fallback;
}

function removeHighlightClasses(node: HTMLElement | null | undefined) {
    if (!node) return;
    node.classList.remove('error-in-field', 'error-in-radio');
}

function clearStoredHighlight(name: string) {
    const stored = highlight_targets.get(name);
    if (stored) {
        stored.forEach(target => removeHighlightClasses(target));
        highlight_targets.delete(name);
    }
}

export const errorutils = {
    addTooltip(element: string | string[], message: string) {
        const text = String(message ?? '');
        if (!text) return;

        withElementList(element, (name) => {
            const { host } = resolveElementHost(name);
            if (!host) return;

            // Ensure highlight is set first so we can anchor to the visible target
            errorutils.addHighlight(name);
            const anchor = bestAnchorFor(name, host);
            ensureTooltip(name, anchor || host, text);

            if (!validation_messages[name]) {
                validation_messages[name] = { name, errors: [text] };
                auto_highlight.add(name);
            } else if (!validation_messages[name].errors.includes(text)) {
                validation_messages[name].errors.push(text);
            }
        });
    },

    clearTooltip(element: string | string[], message?: string) {
        withElementList(element, (name) => {
            const existing = validation_messages[name];
            if (!existing) {
                destroyTooltip(name);
                clearStoredHighlight(name);
                return;
            }

            if (message) {
                existing.errors = existing.errors.filter(err => err !== message);
            } else {
                existing.errors = [];
            }

            if (existing.errors.length === 0) {
                destroyTooltip(name);
                delete validation_messages[name];

                clearStoredHighlight(name);
                auto_highlight.delete(name);
            } else {
                const { host } = resolveElementHost(name);
                const anchor = bestAnchorFor(name, host);
                if (anchor) {
                    ensureTooltip(name, anchor, existing.errors[0]);
                }
            }
        });
    },

    addHighlight(element: string | string[], kind?: 'field' | 'radio') {
        withElementList(element, (name) => {
            const { host, isRadio } = resolveElementHost(name);
            if (!host) return;

            const inferredKind = kind ?? ((host.dataset?.type === 'Radio' || isRadio) ? 'radio' : 'field');
            const highlightClass = inferredKind === 'radio' ? 'error-in-radio' : 'error-in-field';

            // Prefer highlighting the visible inner control when possible.
            // In Preview, wrappers are absolutely positioned and may have 0x0 size;
            // applying the class to the inner element ensures the glow is visible
            // for containers and other non-input elements.
            let target: HTMLElement | null = null;
            if (highlightClass === 'error-in-radio') {
                target = host.querySelector('.custom-radio') as HTMLElement | null;
            } else {
                target = host.querySelector('input, select, textarea, button') as HTMLElement | null;
                // Fallback to the first element child (e.g., Container, Separator, Slider, Button wrapper)
                if (!target) target = host.firstElementChild as HTMLElement | null;
            }

            const node = target || host;

            clearStoredHighlight(name);

            node.classList.add(highlightClass);

            const store = new Set<HTMLElement>();
            store.add(node);
            highlight_targets.set(name, store);
        });
    },

    clearHighlight(element: string | string[]) {
        withElementList(element, (name) => {
            clearStoredHighlight(name);
            auto_highlight.delete(name);
        });
    }
};

export const errorhelpers = errorutils;

export const renderutils: RenderUtils = {
    // Determine if current window/context is the Preview window
    previewWindow,

    unselectRadioGroup: function(element) {
        const group = element?.getAttribute?.('group') || '';
        if (!group) return;

        // In Preview window, operate purely on the Preview DOM; do not touch editor state
        if (renderutils.previewWindow()) {
            const escaped = CSS_ESCAPE(group);
            const radios = Array.from(document.querySelectorAll<HTMLElement>(`.custom-radio[group="${escaped}"]`));
            radios.forEach(node => {
                if (node === element) return;
                const wrapper = getRadioWrapperFromNode(node);
                if (!wrapper) return;
                node.setAttribute('aria-checked', 'false');
                node.classList.remove('selected');
                try { wrapper.dataset.isSelected = 'false'; } catch {}
                const native = wrapper.querySelector('input[type="radio"]') as HTMLInputElement | null;
                if (native) native.checked = false;
            });
            return;
        }

        // Editor window: previous behavior using editor dialog structure
        const radios = Array.from(document.querySelectorAll<HTMLElement>(`[group="${group}"]`));
        radios.forEach(radio => {
            const id = radio.id.slice(6);
            const native = document.getElementById(`native-radio-${id}`) as HTMLInputElement | null;
            try { dialog.elements[id].dataset.isSelected = 'false'; } catch {}
            radio.setAttribute('aria-checked', 'false');
            radio.classList.remove('selected');
            if (native) {
                native.checked = false;
            }
        });
    },

    makeUniqueNameID: function(baseName) {
        // Generate the next sequential nameid for a given base (typically the element type in lowercase).
        // Example: existing [label1, label2, label5] -> makeUniqueNameID('label') returns 'label6'.
        const existingIds = renderutils.getDialogInfo().elements;
        const base = String(baseName || 'el');

        let max = 0;
        for (const id of existingIds) {
            if (typeof id !== 'string') continue;
            if (!id.startsWith(base)) continue;
            const suffix = id.slice(base.length);
            if (/^\d+$/.test(suffix)) {
                const n = Number(suffix);
                if (Number.isFinite(n) && n > max) max = n;
            }
        }

        const next = max + 1;
        const candidate = `${base}${next}`;
        return candidate;
    },

    nameidValidChange: function(newId, currentElement) {
        const n = String(newId || '').trim();
        if (!n) return false;
        try {
            // Prefer authoritative list of top-level elements (wrappers) from dialog.elements
            const wrappers = Object.values(dialog.elements) as HTMLElement[];
            if (wrappers && wrappers.length) {
                const ids = new Set(
                    wrappers
                        .filter(w => w && w.id !== currentElement.id)
                        .map(w => w.dataset?.nameid || '')
                        .filter(v => v && v.length)
                );
                return !ids.has(n);
            }
        } catch {}
        // Fallback: scan DOM but ignore currentElement and anything within it to avoid inner duplicates
        const allIds = new Set(
            Array.from(document.querySelectorAll<HTMLElement>('[data-nameid]'))
                .filter(el => el !== currentElement && !currentElement.contains(el))
                .map(el => el.dataset.nameid || '')
                .filter(v => v && v.length)
        );
        return !allIds.has(n);
    },

	setInputFilter: function (textbox, inputFilter) {
		// https://stackoverflow.com/questions/469357/html-text-input-allow-only-numeric-input
		// Restricts input for the given textbox to the given inputFilter function.
		if (!textbox) return;
		const state = {
            oldValue: '',
            oldSelectionStart: 0,
            oldSelectionEnd: 0
        };

        [
            "input",
            "keydown",
            "keyup",
            "mousedown",
            "mouseup",
            "select",
            "contextmenu",
            "drop",
            "focusout"
        ].forEach((event) => {
            textbox.addEventListener(event, function () {
            if (inputFilter(textbox.value)) {
                state.oldValue = textbox.value;
                state.oldSelectionStart = textbox.selectionStart ?? 0;
                state.oldSelectionEnd = textbox.selectionEnd ?? 0;
            } else if (state.oldValue !== undefined) {
                textbox.value = state.oldValue;
                if (!(utils.isNull(state.oldSelectionStart) || utils.isNull(state.oldSelectionEnd))) {
                    textbox.setSelectionRange(state.oldSelectionStart, state.oldSelectionEnd);
                }
            } else {
                textbox.value = "";
            }
            });
        });
	},

	setIntegers: function (items, prefix = 'el') {
        items.forEach((item) => {
            let element: HTMLInputElement | null = null;

            if (item instanceof HTMLInputElement) {
                element = item;
            } else {
                element = document.getElementById(prefix + item) as HTMLInputElement | null;
            }

            if (!element) return;

            renderutils.setInputFilter(
                element,
                function (value: string): boolean {
                    let v = String(value || '');
                    // allow empty while typing
                    if (v === '') return true;
                    // digits only
                    if (!/^\d+$/.test(v)) return false;
                    // normalize leading zeros: lone 0 allowed, but 01 -> 1, 000 -> 0
                    if (v.length > 1 && v.startsWith('0')) {
                        const stripped = v.replace(/^0+/, '');
                        element!.value = stripped === '' ? '0' : stripped;
                    }
                    return true;
                }
            );
        })
	},

	setSignedIntegers: function (items, prefix = 'el') {
        items.forEach((item) => {
            let element: HTMLInputElement | null = null;

            if (item instanceof HTMLInputElement) {
                element = item;
            } else {
                element = document.getElementById(prefix + item) as HTMLInputElement | null;
            }

            if (!element) return;

            renderutils.setInputFilter(
                element,
                function (value: string): boolean {
                    let v = String(value || '');
                    // allow partial minus or empty
                    if (v === '' || v === '-') return true;
                    // must be optional '-' followed by digits
                    if (!/^-?\d+$/.test(v)) return false;
                    // Disallow '-0' and normalize '-0\d+' to '-\d+'
                    if (v.startsWith('-0')) {
                        if (v.length === 2) { // '-0'
                            element!.value = '-';
                            return true;
                        }
                        // '-0..' -> '-' + stripped
                        const stripped = v.slice(2).replace(/^0+/, '');
                        element!.value = '-' + (stripped === '' ? '' : stripped);
                        return true;
                    }
                    // Normalize leading zeros on positive numbers: 01 -> 1, 000 -> 0 -> but since we disallow starting 0 except lone 0, convert to stripped or '0'
                    if (!v.startsWith('-') && v.length > 1 && v.startsWith('0')) {
                        const stripped = v.replace(/^0+/, '');
                        element!.value = stripped === '' ? '0' : stripped;
                        return true;
                    }
                    return true;
                }
            );
        });
	},

	setDouble: function (items, prefix = 'el') {
        items.forEach((item) => {
            let element: HTMLInputElement | null = null;

            if (item instanceof HTMLInputElement) {
                element = item;
            } else {
                element = document.getElementById(prefix + item) as HTMLInputElement | null;
            }

            if (!element) return;

            renderutils.setInputFilter(
                element,
                function (value) {
                    if (value.endsWith("..") || value.endsWith(".,")) {
                        const x = value.split("");
                        x.splice(-1);
                        value = x.join("");
                        element.value = value;
                        return false;
                    }
                    if (value.endsWith(",")) {
                        const x = value.split("");
                        x.splice(-1);
                        x.push(".");
                        value = x.join("");
                        element.value = value;
                    }
                    if (value === "" || value.endsWith(".")) {
                        return true;
                    }
                    // Allow up to 3 decimals
                    return /^\d*\.?\d{1,3}$/.test(value);
                }
            );
        })
	},

    setSignedDouble: function (items, prefix = 'el') {
        items.forEach((item) => {
            let element: HTMLInputElement | null = null;

            if (item instanceof HTMLInputElement) {
                element = item;
            } else {
                element = document.getElementById(prefix + item) as HTMLInputElement | null;
            }

            if (!element) return;

            renderutils.setInputFilter(
                element,
                function (value: string): boolean {
                    const v = String(value || '');
                    if (v === '' || v === '+' || v === '-' || v === '.' || v === '+.' || v === '-.') return true;
                    if (/^[+-]?\d+$/.test(v)) return true;
                    if (/^[+-]?\d*\.\d*$/.test(v)) return true;
                    if (/^[+-]?\.\d+$/.test(v)) return true;
                    return false;
                }
            );
        });
    },

    getDialogInfo: function() {

        // instead of el.dataset.nameid ?? '', we can use el.dataset.nameid!
        // this tells Typescript to trust the element is not null or undefined
        return ({
            elements: Array.from(Object.values(dialog.elements)).map((el) => el.dataset.nameid!),
            selected: dialog.getElement(dialog.selectedElement)
        });
    },

    makeElement: function(data) {
        if (typeof data !== 'object' || Array.isArray(data)) {
            showError('Invalid settings for this element.');
        }

        const uuid = uuidv4();
        // Determine effective nameid:
        // - If user provided a non-empty, valid identifier and it is not already used, keep it verbatim.
        // - Otherwise, generate a unique sequential id based on the provided base or the element type.
        const provided = String(data.nameid || '').trim();
        const baseFallback = String(data.type || 'el').toLowerCase();
        const existingIds = (() => {
            try {
                const info = renderutils.getDialogInfo();
                return Array.isArray(info?.elements) ? new Set(info.elements.filter(Boolean)) : new Set<string>();
            } catch {
                return new Set<string>();
            }
        })();

        const chooseUnique = (base: string) => renderutils.makeUniqueNameID(base || baseFallback);

        let nameid: string;
        const isTemplateDefault = provided && provided.toLowerCase() === baseFallback;
        if (provided && utils.isIdentifier(provided) && !existingIds.has(provided)) {
            // If the provided name is exactly the template default (e.g., 'label'),
            // force a numeric suffix so the first instance becomes 'label1'.
            nameid = isTemplateDefault ? chooseUnique(baseFallback) : provided;
        } else if (provided) {
            nameid = chooseUnique(provided);
        } else {
            nameid = chooseUnique(baseFallback);
        }

        let eltype = 'div';
        if (utils.isElementOf(data.type, ["Input", "Select"])) {
            eltype = data.type.toLowerCase();
        }

        const element = document.createElement(eltype) as HTMLDivElement | HTMLInputElement | HTMLSelectElement;

        data.id = uuid;
        // Assign unique nameid BEFORE copying properties into dataset so dataset.nameid isn't the template default
        // Ensure all element types receive a unique nameid (including Counter and Label)
        data.nameid = nameid;

        element.style.position = 'absolute';
        element.style.top = data.top + 'px';
        element.style.left = data.left + 'px';

        const errs = (renderutils.assertTypes(data, { collect: true }) || []) as string[];
        if (errs.length) {
            coms.sendTo(
                'editorWindow',
                'consolog',
                'Element creation aborted due to invalid or missing properties:\n' + errs.join('\n')
            );
        }

        function valueToDataset(value: unknown): string | undefined {
            if (utils.isNull(value)) return undefined;
            if (Array.isArray(value)) return value.map(String).join(',');
            return String(value);
        }

        const recordata = data as Record<string, unknown>;
        const keys = utils.getKeys(recordata);
        keys.forEach((key) => {
            if (
                key.startsWith('$') ||
                !/^[$A-Za-z_][\w$]*$/.test(key) // test if not(!) a valid identifier (nameid)
            ) return;

            const value = valueToDataset(recordata[key]);
            if (utils.notNil(value)) {
                element.dataset[key] = value;
            }
        });

        if (data.type == "Button") {

            element.className = 'smart-button';
            element.style.backgroundColor = data.color;
            element.style.borderColor = data.borderColor;
            element.dataset.borderColor = data.borderColor;
            element.style.width = data.width + 'px';
            element.style.maxWidth = data.width + 'px';
            element.dataset.width = String(data.width);

            const lineHeight = coms.fontSize * 1.2;
            const paddingY = 3; // px
            const maxHeight = (lineHeight * data.lineClamp) + 3 * paddingY;
            element.style.maxHeight = maxHeight + 'px';

            const span = document.createElement('span');
            span.className = 'smart-button-text';
            span.style.fontFamily = coms.fontFamily;
            span.style.overflow = 'hidden';
            span.style.textOverflow = 'ellipsis';
            span.style.whiteSpace = 'nowrap';
            /* --- textContent instead of innerHTML or innerText --- */
            span.textContent = data.label;

            element.appendChild(span);

            renderutils.updateButton(
                element as HTMLDivElement,
                data.label,
                coms.fontSize,
                data.lineClamp,
                data.width
            )

        } else if (data.type == "Input" && element instanceof HTMLInputElement) {

            element.type = 'text';
            element.value = data.value || '';
            element.style.width = data.width + 'px';
            // element.style.maxHeight = data.height + 'px';
            // element.style.maxWidth = data.maxWidth + 'px';

        } else if (data.type == "Select") {

            element.className = 'custom-select';
            element.style.width = data.width + 'px';
            // Set arrow color via inline SVG data URI if provided
            const color = data.arrowColor || '#000000';
            const svg = encodeURIComponent(`
                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'>
                    <path fill='${color}' d='M6 8L0 0h12z'/>
                </svg>
            `);
            element.style.backgroundImage = `url("data:image/svg+xml,${svg}")`;

        } else if (data.type == "Checkbox") {

            element.className = 'element-div';
            element.style.width = data.size + 'px';
            element.style.height = data.size + 'px';

            const customCheckbox = document.createElement('div');
            customCheckbox.id = "checkbox-" + uuid;
            customCheckbox.className = 'custom-checkbox';
            customCheckbox.setAttribute('role', 'checkbox');
            customCheckbox.setAttribute('tabindex', '0');
            customCheckbox.setAttribute('aria-checked', 'false');
            customCheckbox.dataset.fill = String(!!data.fill);
            customCheckbox.style.setProperty('--checkbox-color', data.color);

            const SVG_NS = "http://www.w3.org/2000/svg";

            const svg = document.createElementNS(SVG_NS, 'svg');
            svg.setAttribute('viewBox', '0 0 100 100');
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            svg.style.overflow = 'visible';

            const path = document.createElementNS(SVG_NS, 'path');
            path.setAttribute('d', 'M15 35 L48 80 L95 -35');
            path.setAttribute('stroke', 'black');
            path.setAttribute('stroke-width', '14');
            path.setAttribute('fill', 'none');
            path.setAttribute('class', 'tick-mark');
            svg.appendChild(path);
            customCheckbox.appendChild(svg);

            customCheckbox.addEventListener('click', () => {
                const isChecked = customCheckbox.getAttribute('aria-checked') === 'true';
                customCheckbox.setAttribute('aria-checked', isChecked ? "false" : "true");
            });

            const cover = document.createElement('div');
            cover.id = "cover-" + uuid;
            cover.className = 'elementcover';
            element.appendChild(customCheckbox);
            element.appendChild(cover);

        } else if (data.type == "Radio") {

            element.className = 'element-div';
            element.style.width = data.size + 'px';
            element.style.height = data.size + 'px';

            const wrapperLabel = document.createElement('label');
            wrapperLabel.className = 'custom-radio-wrapper';
            wrapperLabel.dataset.group = String(data.group || '');

            const nativeRadio = document.createElement('input');
            nativeRadio.type = 'radio';
            nativeRadio.name = data.group || '';
            nativeRadio.id = `native-radio-${uuid}`;
            nativeRadio.className = 'native-radio';
            nativeRadio.dataset.color = data.color;
            nativeRadio.style.position = 'absolute';
            nativeRadio.style.opacity = '0';
            nativeRadio.style.pointerEvents = 'auto';

            const customRadio = document.createElement('span');
            customRadio.id = `radio-${uuid}`;
            customRadio.className = 'custom-radio';
            customRadio.setAttribute('role', 'radio');
            customRadio.setAttribute('aria-checked', 'false');
            customRadio.setAttribute('group', data.group || '');
            customRadio.style.setProperty('--radio-color', data.color);

            wrapperLabel.appendChild(nativeRadio);
            wrapperLabel.appendChild(customRadio);
            element.appendChild(wrapperLabel);

            if (data.group) {
                element.dataset.group = String(data.group);
            }

            nativeRadio.addEventListener('focus', () => {
                element.classList.add('radio-focus');
            });
            nativeRadio.addEventListener('blur', () => {
                element.classList.remove('radio-focus');
            });

            const cover = document.createElement('div');
            cover.id = `cover-${uuid}`;
            cover.className = 'elementcover';
            element.appendChild(cover);

        } else if (data.type == "Counter") {

            element.className = "counter-wrapper";

            const decrease = document.createElement("div");
            decrease.className = "counter-arrow down";
            decrease.id = "counter-decrease-" + uuid;
            decrease.style.width = '0px';
            decrease.style.height = '0px';
            decrease.style.borderLeft = (data.updownsize || 8) + 'px solid transparent';
            decrease.style.borderRight = (data.updownsize || 8) + 'px solid transparent';
            decrease.style.borderTop = (1.5 * (data.updownsize || 8)) + 'px solid ' + data.color;
            decrease.style.borderBottom = '';

            const display = document.createElement("div");
            display.className = "counter-value";
            display.id = "counter-value-" + uuid;
            const rawMin = Number(data.minval ?? data.startval ?? 0);
            const rawStart = Number(data.startval ?? rawMin);
            const rawMax = Number(data.maxval ?? rawStart);
            const min = Number.isFinite(rawMin) ? rawMin : 0;
            const max = Number.isFinite(rawMax) ? rawMax : Math.max(min, Number.isFinite(rawStart) ? rawStart : min);
            const start = Number.isFinite(rawStart) ? rawStart : min;
            const initial = Math.min(Math.max(start, min), max);
            display.textContent = String(initial);

            display.style.padding = '0px ' + data.space + 'px';
            display.dataset.nameid = nameid;

            display.style.fontFamily = coms.fontFamily;
            display.style.fontSize = coms.fontSize + 'px';
            // Counter text color independent from arrow color; default to black
            display.style.color = '#000000';

            const increase = document.createElement("div");
            increase.className = "counter-arrow up";
            increase.id = "counter-increase-" + uuid;
            increase.style.width = '0px';
            increase.style.height = '0px';
            increase.style.borderLeft = (data.updownsize || 8) + 'px solid transparent';
            increase.style.borderRight = (data.updownsize || 8) + 'px solid transparent';
            increase.style.borderBottom = (1.5 * (data.updownsize || 8)) + 'px solid ' + data.color;
            increase.style.borderTop = '';

            element.appendChild(decrease);
            element.appendChild(display);
            element.appendChild(increase);

            element.dataset.minval = String(min);
            element.dataset.maxval = String(max);
            element.dataset.startval = String(initial);
        } else if (data.type == "Slider") {

            element.className = 'separator';
            element.style.width = data.width + 'px';
            element.style.height = data.height + 'px';
            element.style.backgroundColor = String(data.color || '#000000');
            element.dataset.color = String(data.color || '#000000');

            const handle = document.createElement('div');
            handle.className = 'slider-handle';
            handle.id = 'slider-handle-' + uuid;
            element.appendChild(handle);

            const handleConfig = Object.fromEntries(
                Object.entries(data).map(([k, v]) => [k, v ?? ''])
            ) as { [key: string]: string };
            renderutils.updateHandleStyle(handle, handleConfig);

        } else if (data.type == "Label") {

            // Initial label setup: single span-like behavior within the core node
            element.textContent = data.value || '';
            element.style.fontFamily = coms.fontFamily;
            element.style.fontSize = coms.fontSize + 'px';
            element.style.lineHeight = '1.2';
            element.style.overflow = 'hidden';
            element.style.textOverflow = 'ellipsis';
            // Place in normal flow so width measures to content
            element.style.position = 'relative';
            // Default to single-line unless lineClamp > 1
            const clampInit = Number(data.lineClamp) || 1;
            // Prefer width over legacy maxWidth; fall back for backward compatibility
            const maxWInit = Number(data.maxWidth ?? data.maxWidth ?? 0);
            // Apply text alignment (default to left)
            element.style.textAlign = data.align || 'left';

            if (clampInit > 1) {
                element.style.display = '-webkit-box';
                (element.style).setProperty('-webkit-line-clamp', String(clampInit));
                (element.style).setProperty('-webkit-box-orient', 'vertical');
                element.style.whiteSpace = 'normal';
                // Height cap for the clamp
                const maxH = Math.round(coms.fontSize * 1.2 * clampInit);
                element.style.maxHeight = maxH + 'px';
            } else {
                element.style.display = 'inline-block';
                element.style.whiteSpace = 'nowrap';
                element.style.removeProperty('-webkit-line-clamp');
                element.style.removeProperty('-webkit-box-orient');
                element.style.maxHeight = Math.round(coms.fontSize * 1.2) + 'px';
            }

            if (maxWInit > 0) element.style.maxWidth = maxWInit + 'px';

        } else if (data.type == "Separator") {

            element.className = 'separator';
            element.style.width = data.width + 'px';
            element.style.height = data.height + 'px';
            element.style.backgroundColor = String(data.color || '#000000');
            element.dataset.color = String(data.color || '#000000');

        } else if (data.type == "Container") {

            element.className = 'container';
            element.style.backgroundColor = data.backgroundColor;
            element.style.borderColor = data.borderColor;
            element.dataset.borderColor = data.borderColor;
            element.style.width = data.width + 'px';
            element.style.height = data.height + 'px';
            element.dataset.itemType = resolveContainerItemType(element.dataset.itemType);

            if (renderutils.previewWindow()) {
                const content = document.createElement('div');
                content.className = 'container-content';
                element.appendChild(content);
            } else {
                const sample = document.createElement('div');
                sample.className = 'container-sample';

                const mkRow = (cls: string, text: string) => {
                    const row = document.createElement('div');
                    row.className = `container-item ${cls}`;
                    const label = document.createElement('span');
                    label.className = 'container-text';
                    label.textContent = text;
                    row.appendChild(label);
                    return { row, label };
                };

                const inactive = mkRow('inactive', 'unselected');
                const active = mkRow('active', 'active / selected');
                const disabled = mkRow('container-item-disabled disabled', 'disabled / blocked');

                const fg = String(data.fontColor) || '#000000';
                const abg = String(data.activeBackgroundColor) || '##589658';
                const afg = String(data.activeFontColor) || '#ffffff';
                const dbg = String((data as Record<string, unknown>).disabledBackgroundColor ?? '#ececec');
                inactive.label.style.color = fg;
                active.row.style.backgroundColor = abg;
                active.label.style.color = afg;
                disabled.row.dataset.disabled = 'true';
                disabled.row.setAttribute('aria-disabled', 'true');
                disabled.row.style.backgroundColor = dbg;
                disabled.label.style.color = fg;

                sample.appendChild(inactive.row);
                sample.appendChild(active.row);
                sample.appendChild(disabled.row);
                element.appendChild(sample);
            }

        } else if (data.type == "ChoiceList") {

            element.className = 'sorter';
            element.style.width = data.width + 'px';
            element.style.height = data.height + 'px';
            element.style.backgroundColor = data.backgroundColor;
            element.style.borderColor = data.borderColor;
            element.dataset.backgroundColor = data.backgroundColor;
            element.dataset.fontColor = data.fontColor;
            element.dataset.activeBackgroundColor = data.activeBackgroundColor;
            element.dataset.activeFontColor = data.activeFontColor;
            element.dataset.borderColor = data.borderColor;
            element.dataset.sortable = String(data.sortable);
            element.dataset.ordering = String(data.ordering);
            element.dataset.items = String(data.items || '');
            element.dataset.align = String(data.align || 'left');
            element.dataset.value = String(data.items || ''); // legacy alias

            // Preview should start with no selection (ChoiceList has no "Value" property).
            if (renderutils.previewWindow()) {
                delete element.dataset.selected;
                delete element.dataset.activeValues;
                delete element.dataset[SORTER_STATE_KEY];
            } else {
                // Editor-only visual sample: show an active row by default (prefer second item when present),
                // but do NOT persist this as dialog data.
                const labels = splitSorterValues(data.items || '');
                const preferred = labels[1]; // second item if exists
                if (preferred) {
                    (element as any).__sampleSorterState = stringifySorterState(
                        labels.map(text => ({ text, state: text === preferred ? 'asc' : 'off' }))
                    );
                } else {
                    delete (element as any).__sampleSorterState;
                }
            }

            renderutils.renderSorter(element, {
                items: data.items,
                sortable: data.sortable,
                ordering: data.ordering,
                align: data.align,
                backgroundColor: data.backgroundColor,
                fontColor: data.fontColor,
                activeBackgroundColor: data.activeBackgroundColor,
                activeFontColor: data.activeFontColor,
                borderColor: data.borderColor
            });

        }

        // nameid already assigned earlier (before dataset population) for non Counter/Label types
        element.style.fontFamily = coms.fontFamily;
        element.style.fontSize = coms.fontSize + 'px';

        // Initial visibility handling (editor: faint/ghosted, preview: fully removed)
        if (utils.isFalse(data.isVisible)) {
            if (renderutils.previewWindow()) {
                element.style.display = 'none';
            } else {
                element.classList.add('design-hidden'); // applies 10% opacity, still interactive
                element.style.removeProperty('visibility');
            }
        }

        if (utils.isFalse(data.isEnabled)) {
            element.classList.add('disabled-div');
        }

        element.id = uuid;

        return element;
    },

    updateElement: function (element, properties) {

        // All elements should have the following structure:
        // (constructed by addElementToDialog() in editor.ts)
        // - wrapper div
        //   - inner div (the actual element, constructed by makeElement())
        //   - cover div (for dragging/selection)
        // The dataset properties are copied on both the wrapper div and the inner div

        // console.log('properties', properties);
        // console.log('dataset', element.dataset);
        // console.log('combined', {... element.dataset, ... properties});
        // console.log('combined2', {... properties, ... element.dataset});

        const dataset = element.dataset;
        const checkbox = dataset.type === 'Checkbox';
        const counter = dataset.type === 'Counter';
        const radio = dataset.type === 'Radio';
        const input = dataset.type === 'Input';
        const select = dataset.type === 'Select';
        const slider = dataset.type === 'Slider';
        const container = dataset.type === 'Container';
        const sorter = dataset.type === 'ChoiceList';
        const separator = dataset.type === 'Separator';
        const button = dataset.type === 'Button';
        const label = dataset.type === 'Label';
        const group = dataset.type === 'Group';

        let counterNeedsResize = false;
        let sorterNeedsRender = false;
        let elementWidth = element.getBoundingClientRect().width;
        const elementHeight = element.getBoundingClientRect().height;
        const dialogW = dialog.canvas.getBoundingClientRect().width;
        const dialogH = dialog.canvas.getBoundingClientRect().height;

        // const all: Record<string, any> = {... element.dataset, ... properties};
        const props: Record<string, any> = {... properties}; // copy of properties only
        const inner = element.firstElementChild as HTMLElement | null;

        Object.keys(props).forEach((key) => {

            let value = props[key];

            const customCheckbox = document.querySelector(`#checkbox-${element.id}`) as HTMLDivElement;
            const customRadio = document.querySelector(`#radio-${element.id}`) as HTMLDivElement;
            const countervalue = document.querySelector(`#counter-value-${element.id}`) as HTMLDivElement | null;
            const handle = document.querySelector(`#slider-handle-${element.id}`) as HTMLDivElement;
            const elwidth = document.getElementById('elwidth') as HTMLInputElement;
            const elheight = document.getElementById('elheight') as HTMLInputElement;
            const elleft = document.getElementById('elleft') as HTMLInputElement;
            const eltop = document.getElementById('eltop') as HTMLInputElement;

            switch (key) {
                case 'nameid': {
                    const next = String(value || '').trim();
                    if (renderutils.nameidValidChange(next, element)) {
                        // Propagate rename in other elements' conditions and in customJS
                        const prev = String(element.dataset.nameid || '');
                        if (prev && next && prev !== next) {
                            renderutils.propagateNameChange(prev, next);
                        }
                        value = next;
                    } else {
                        value = element.dataset.nameid || '';
                        showError('Name already exists.');
                    }}
                    break;

                case 'left':
                    if (Number(value) + elementWidth + 10 > dialogW) {
                        value = String(Math.round(dialogW - elementWidth - 10));
                    }

                    if (Number(value) < 10) {
                        value = '10';
                    }

                    element.style.left = value + 'px';
                    break;

                case 'top':
                    if (Number(value) + elementHeight + 10 > dialogH) {
                        value = String(Math.round(dialogH - elementHeight - 10));
                    }

                    if (Number(value) < 10) {
                        value = '10';
                    }

                    element.style.top = value + 'px';
                    break;

                case 'height':
                    if (Number(value) > dialogH - 20) {
                        value = String(Math.round(dialogH - 20));
                    }
                    // Apply height to wrapper by default, and also to inner for visual elements
                    element.style.height = value + 'px';
                    if (inner && (input || select || container || sorter || separator || slider || checkbox || radio)) {
                        inner.style.height = value + 'px';
                        // Also resize the custom control node if present
                        if (checkbox && customCheckbox) customCheckbox.style.height = value + 'px';
                        if (radio && customRadio) customRadio.style.height = value + 'px';
                    }

                    if (eltop && Number(eltop.value) + Number(value) + 10 > dialogH) {
                        const newtop = String(Math.round(dialogH - Number(value) - 10));
                        eltop.value = newtop;
                        element.style.top = newtop + 'px';
                    }

                    break;

                case 'label': // NOT the "Label" element type, but the text label of Button
                    const span = element.querySelector('.smart-button-text') as HTMLSpanElement;
                    if (span) {
                        span.textContent = value;
                    }

                    elementWidth = element.getBoundingClientRect().width;

                    // In Preview, the editor input fields (elleft) are not present; guard their access
                    if (elementWidth && elleft && Number(elleft.value) + elementWidth + 10 > dialogW) {
                        const newleft = String(Math.round(dialogW - elementWidth - 10));
                        elleft.value = newleft;
                        element.style.left = newleft + 'px';
                    }

                    // For button, let wrapper height auto-follow content
                    if (button) {
                        element.style.height = '';
                    }
                    break;

                case 'width':
                    if (Number(value) > dialogW - 20) {
                        value = String(Math.round(dialogW - 20));
                        const widthInput = document.getElementById('elwidth') as HTMLInputElement | null;
                        if (widthInput) widthInput.value = value;
                    }

                    if (sorter && Number(value) < 24) {
                        value = '24';
                        const widthInput = document.getElementById('elwidth') as HTMLInputElement | null;
                        if (widthInput) widthInput.value = value;
                    }

                    if (select && Number(value) < 100) {
                        value = '100';
                    }

                    if (button && inner) {
                        // For buttons, apply width to wrapper and make inner button fill it
                        element.style.width = value + 'px';
                        element.style.setProperty('width', value + 'px', 'important');
                        inner.style.width = '100%';
                        inner.style.setProperty('width', '100%', 'important');
                        inner.style.maxWidth = '100%';
                        inner.style.setProperty('max-width', '100%', 'important');
                        inner.style.minWidth = '0';
                        inner.style.setProperty('min-width', '0', 'important');
                        // Allow wrapper to auto-size vertically
                        element.style.height = '';

                    } else if (label) {
                        element.dataset[key] = value;
                        renderutils.updateLabel(element);
                    } else {
                        // For other elements, apply width to wrapper
                        element.style.width = value + 'px';
                        if (inner && (input || select || container || sorter || separator || slider || checkbox || radio)) {
                            inner.style.width = value + 'px';
                            if (checkbox && customCheckbox) customCheckbox.style.width = value + 'px';
                            if (radio && customRadio) customRadio.style.width = value + 'px';
                        }
                    }

                    if (elleft && Number(elleft.value) + Number(value) + 10 > dialogW) {
                        const newleft = String(Math.round(dialogW - Number(value) - 10));
                        elleft.value = newleft;
                        element.style.left = newleft + 'px';
                    }
                    break;

                case 'maxWidth':
                    if (label) {
                        element.dataset[key] = value;
                        renderutils.updateLabel(element);
                    }
                    break;

                case 'lineClamp':
                    if (Number(value) > 3) {
                        value = String(3);
                        const lineClamp = document.getElementById('ellineClamp') as HTMLInputElement;
                        lineClamp.value = value;
                    }

                    if (button) {
                        // Compute max height based on computed font size, padding, and borders
                        const host = (inner as HTMLDivElement) || element;
                        const span = host.querySelector('.smart-button-text') as HTMLSpanElement | null;
                        const spanCS = window.getComputedStyle(span || host);
                        const fs = parseFloat(spanCS.fontSize || '0') || Number(dataset.fontSize) || coms.fontSize;
                        const lineHeightPx = fs * 1.2;
                        const hostCS = window.getComputedStyle(host);
                        const padT = parseFloat(hostCS.paddingTop || '0') || 0;
                        const padB = parseFloat(hostCS.paddingBottom || '0') || 0;
                        const borT = parseFloat(hostCS.borderTopWidth || '0') || 0;
                        const borB = parseFloat(hostCS.borderBottomWidth || '0') || 0;
                        const clamp = Number(value) || 1;
                        const maxHeightPx = Math.round(lineHeightPx * clamp + padT + padB + borT + borB);
                        host.style.maxHeight = maxHeightPx + 'px';

                        if (span) {
                            span.style.setProperty('-webkit-line-clamp', String(clamp));
                        }

                        // Allow wrapper height to auto-size
                        element.style.height = '';
                    } else if (label) {
                        element.dataset[key] = value;
                        renderutils.updateLabel(element);
                    } else {
                        const lineHeight = Number(dataset.fontSize) * 1.2;
                        const paddingY = 3; // px
                        const maxHeight = (lineHeight * value) + 2 * paddingY;
                        element.style.maxHeight = maxHeight + 'px';
                    }
                    break;

                case 'maxHeight':
                    element.style[key] = value + 'px';
                    break;

                case 'size':
                    if (checkbox || radio) {
                        element.style.width = value + 'px';
                        element.style.height = value + 'px';
                    }
                    break;

                case 'color':
                    if (utils.isValidColor(value)) {
                        if (customRadio) {
                            customRadio.style.setProperty('--radio-color', value);
                        } else if (counter) {
                            const decrease = document.querySelector(`#counter-decrease-${element.id}`) as HTMLDivElement;
                            decrease.style.color = value;
                            const increase = document.querySelector(`#counter-increase-${element.id}`) as HTMLDivElement;
                            increase.style.color = value;
                        } else if (button && inner) {
                            inner.style.backgroundColor = value;
                        } else if (separator && inner) {
                            // For separators, apply color to the inner element (the actual separator)
                            inner.style.backgroundColor = value;
                        } else if (slider && inner) {
                            inner.style.backgroundColor = value;
                        } else if (!container) {
                            // For most elements, 'color' is background. Container uses 'backgroundColor' instead.
                            element.style.backgroundColor = value;
                            if (checkbox) {
                                if (customCheckbox) {
                                    customCheckbox.style.setProperty('--checkbox-color', value);
                                }
                            }
                        }
                    } else {
                        value = dataset.color;
                        const color = document.getElementById('elcolor') as HTMLInputElement;
                        color.value = value;
                    }
                    break;

                case 'backgroundColor':
                    // Container background + inactive row background color
                    if (container || sorter) {
                        if (utils.isValidColor(value)) {
                            const host = inner || element;
                            host.style.backgroundColor = value;
                            if (sorter) {
                                sorterNeedsRender = true;
                            }
                        } else {
                            value = dataset.backgroundColor;
                            const color = document.getElementById('elbackgroundColor') as HTMLInputElement;
                            color.value = value;
                        }
                    }
                    break;

                case 'fontColor':
                    if (utils.isValidColor(value)) {
                        if (button && inner) {
                            // Color the button text
                            inner.style.color = value;
                            const span = inner.querySelector('.smart-button-text') as HTMLSpanElement | null;
                            if (span) {
                                span.style.color = value;
                            }
                        } else if (label && inner) {
                            inner.style.color = value;
                        } else if ((input || select) && inner) {
                            inner.style.color = value;
                        } else if (counter && countervalue) {
                            countervalue.style.color = value;
                        } else if (container) {
                            const host = inner || element;
                            // Apply new font color to all non-active items' labels
                            host.querySelectorAll('.container-item:not(.active) .container-text').forEach((item) => {
                                (item as HTMLElement).style.color = String(value);
                            });
                        } else if (sorter) {
                            const host = inner || element;
                            host.style.color = value;
                            sorterNeedsRender = true;
                        } else {
                            element.style.color = value;
                        }
                    } else {
                        value = dataset.fontColor;
                        const color = document.getElementById('elfontColor') as HTMLInputElement;
                        color.value = value;
                    }
                    break;

                case 'borderColor':
                    if (utils.isValidColor(value)) {
                        if (button && inner) {
                            // Apply border color to button
                            inner.style.borderColor = value;
                        } else if ((container || sorter) && inner) {
                            // Apply border color to container
                            inner.style.borderColor = value;
                        } else if (button || container || sorter) {
                            // Fallback for wrapper-level styling
                            element.style.borderColor = value;
                        }
                    } else {
                        value = dataset.border;
                        const color = document.getElementById('elborderColor') as HTMLInputElement;
                        color.value = value;
                    }
                    break;

                case 'activeBackgroundColor':
                    if (container) {
                        if (utils.isValidColor(value)) {
                            const host = inner || element;
                            host.querySelectorAll('.container-item.active').forEach((r) => {
                                (r as HTMLDivElement).style.backgroundColor = String(value);
                            });
                        } else {
                            value = dataset.activeBackgroundColor;
                            const color = document.getElementById('elactiveBackgroundColor') as HTMLInputElement;
                            color.value = value;
                        }
                    } else if (sorter) {
                        if (!utils.isValidColor(value)) {
                            value = dataset.activeBackgroundColor;
                        }
                        sorterNeedsRender = true;
                    }
                    break;

                case 'activeFontColor':
                    if (container) {
                        if (utils.isValidColor(value)) {
                            const host = inner || element;
                            host.querySelectorAll('.container-item.active .container-text').forEach((n) => {
                                (n as HTMLElement).style.color = String(value);
                            });
                        } else {
                            value = dataset.activeFontColor;
                            const color = document.getElementById('elactiveFontColor') as HTMLInputElement;
                            color.value = value;
                        }
                    } else if (sorter) {
                        if (!utils.isValidColor(value)) {
                            value = dataset.activeFontColor;
                        }
                        sorterNeedsRender = true;
                    }
                    break;

                case 'disabledBackgroundColor':
                    if (container) {
                        if (utils.isValidColor(value)) {
                            const host = (inner || element) as HTMLElement;
                            host.querySelectorAll('.container-item-disabled').forEach((r) => {
                                (r as HTMLDivElement).style.backgroundColor = String(value);
                            });
                            renderutils.applyContainerItemFilter(element as HTMLElement);
                        } else {
                            value = dataset.disabledBackgroundColor || '#ececec';
                            const color = document.getElementById('eldisabledBackgroundColor') as HTMLInputElement;
                            if (color) color.value = value;
                        }
                    }
                    break;

                case 'arrowColor':
                    if (utils.isValidColor(value)) {
                        // property arrowColor is only for Select
                        const svg = encodeURIComponent(`
                            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'>
                                <path fill='${value}' d='M6 8L0 0h12z'/>
                            </svg>
                        `);
                        (inner as HTMLElement).style.backgroundImage = `url(\"data:image/svg+xml,${svg}\")`;
                    } else {
                        value = dataset.arrowColor;
                        const color = document.getElementById('elarrowColor') as HTMLInputElement;
                        color.value = value;
                    }
                    break;

                case 'space':
                    if (Number(value) > 50) {
                        value = String(Math.round(50));
                        const space = document.getElementById('elspace') as HTMLInputElement;
                        space.value = value;
                    }
                    if (countervalue) {
                        countervalue.style.padding = '0px ' + value + 'px';
                        counterNeedsResize = counterNeedsResize || counter;
                    }
                    break;
                case 'minval': {
                    const startCandidate = Number(props.startval ?? dataset.startval);
                    const maxCandidate = Number(props.maxval ?? dataset.maxval);
                    const candidate = Number(value);

                    if (Number.isFinite(candidate) && candidate <= startCandidate && candidate < maxCandidate) {
                        value = String(candidate);
                        if (countervalue && Number(countervalue.textContent) < candidate) {
                            countervalue.textContent = String(candidate);
                            counterNeedsResize = counterNeedsResize || counter;
                        }
                    } else {
                        value = dataset.minval ?? dataset.startval;
                        const minval = document.getElementById('elminval') as HTMLInputElement | null;
                        if (minval) {
                            minval.value = value;
                        }
                    }
                    break;
                }

                case 'startval': {
                    const minCandidate = Number(props.minval ?? dataset.minval ?? value);
                    const maxCandidate = Number(props.maxval ?? dataset.maxval);
                    const candidate = Number(value);

                    if (Number.isFinite(candidate) && candidate >= minCandidate && candidate <= maxCandidate) {
                        value = String(candidate);
                        if (countervalue) {
                            countervalue.textContent = String(candidate);
                            counterNeedsResize = counterNeedsResize || counter;
                        }
                    } else {
                        value = dataset.startval;
                        const startval = document.getElementById('elstartval') as HTMLInputElement | null;
                        if (startval) {
                            startval.value = value;
                        }
                    }
                    break;
                }

                case 'maxval': {
                    const minCandidate = Number(props.minval ?? dataset.minval ?? dataset.startval);
                    const startCandidate = Number(props.startval ?? dataset.startval);
                    const candidate = Number(value);

                    if (Number.isFinite(candidate) && candidate >= startCandidate && candidate > minCandidate) {
                        value = String(candidate);
                    } else {
                        value = dataset.maxval;
                        const maxval = document.getElementById('elmaxval') as HTMLInputElement | null;
                        if (maxval) {
                            maxval.value = value;
                        }
                    }
                    break;
                }

                case 'updownsize':
                    if (counter) {
                        const decrease = document.querySelector(`#counter-decrease-${element.id}`) as HTMLDivElement;
                        const increase = document.querySelector(`#counter-increase-${element.id}`) as HTMLDivElement;
                        const size = Number(value || 8);
                        const sideSize = size + 'px';
                        const tipSize = (1.5 * size) + 'px';
                        const color = element.dataset.color || '#558855';

                        if (decrease) {
                            decrease.style.borderLeft = sideSize + ' solid transparent';
                            decrease.style.borderRight = sideSize + ' solid transparent';
                            decrease.style.borderTop = tipSize + ' solid ' + color;
                            decrease.style.borderBottom = '';
                        }
                        if (increase) {
                            increase.style.borderLeft = sideSize + ' solid transparent';
                            increase.style.borderRight = sideSize + ' solid transparent';
                            increase.style.borderBottom = tipSize + ' solid ' + color;
                            increase.style.borderTop = '';
                        }
                    }
                    counterNeedsResize = counterNeedsResize || counter;
                    break;

                case 'direction':
                    // e.g. separator, switch height with width
                    {
                        const nextDir = String(value || dataset.direction || '').toLowerCase();
                        const currentDir = String(dataset.direction || '').toLowerCase();
                        const dirInput = document.getElementById('eldirection') as HTMLSelectElement | null;
                        if (dirInput) dirInput.value = nextDir || currentDir || 'horizontal';
                        if (nextDir === currentDir) {
                            dataset.direction = currentDir;
                            break;
                        }
                        dataset.direction = nextDir || currentDir;
                    }
                    let width = dataset.height;
                    let height = dataset.width;

                    if (Number(width) > dialogW - 20) {
                        width = String(Math.round(dialogW - 20));
                    }

                    if (elleft && Number(elleft.value) + Number(width) + 10 > dialogW) {
                        const newleft = String(Math.round(dialogW - Number(width) - 10));
                        elleft.value = newleft;
                        element.style.left = newleft + 'px';
                    }

                    if (Number(height) > dialogH - 20) {
                        height = String(Math.round(dialogH - 20));
                    }

                    if (eltop && Number(eltop.value) + Number(height) + 10 > dialogH) {
                        const newtop = String(Math.round(dialogH - Number(height) - 10));
                        eltop.value = newtop;
                        element.style.top = newtop + 'px';
                    }

                    dataset.width = width;
                    dataset.height = height;
                    // Apply sizes
                    if (inner && (separator || slider || container)) {
                        inner.style.width = width + 'px';
                        inner.style.height = height + 'px';
                    }
                    element.style.width = width + 'px';
                    element.style.height = height + 'px';
                    if (elwidth) elwidth.value = String(width);
                    if (elheight) elheight.value = String(height);
                    break;

                case 'selection':
                    if (container) {
                        const host = inner || element;
                        const kind = String(value || '').toLowerCase();

                        if (kind === 'single') {
                            const items = Array.from(host.querySelectorAll('.container-item')) as HTMLElement[];
                            const normalFg = String(dataset.fontColor || '#000000');
                            const activeBg = String(dataset.activeBackgroundColor || '#589658');
                            const activeFg = String(dataset.activeFontColor || '#ffffff');

                            // Keep the first active row; clear others
                            let kept = false;

                            items.forEach(item => {
                                if (item.classList.contains('active')) {
                                    if (!kept) {
                                        kept = true;
                                        item.style.backgroundColor = activeBg;

                                        const txt = item.querySelector('.container-text') as HTMLElement | null;
                                        if (txt) {
                                            txt.style.color = activeFg;
                                        }
                                    } else {
                                        item.classList.remove('active');
                                        item.style.backgroundColor = '';
                                        const txt = item.querySelector('.container-text') as HTMLElement | null;
                                        if (txt) {
                                            txt.style.color = normalFg;
                                        }
                                    }
                                }
                            });
                        }
                    }
                    break;

                case 'itemType':
                    if (container) {
                        const resolved = resolveContainerItemType(value);
                        value = resolved;
                        element.dataset.itemType = resolved;
                        applyContainerItemFilter(element);
                    }
                    break;

                case 'value':
                    // Update only the appropriate UI elements
                    if (inner instanceof HTMLInputElement && input) {
                        inner.value = value;
                    } else if (inner instanceof HTMLSelectElement && select) {
                        // Populate select options from comma/semicolon separated tokens
                        const text = String(value || '');
                        const tokens = text.split(/[;,]/).map(s => s.trim()).filter(s => s.length > 0);
                        inner.innerHTML = '';
                        if (tokens.length === 0) {
                            const opt = document.createElement('option');
                            opt.value = '';
                            opt.textContent = '';
                            inner.appendChild(opt);
                        } else {
                            for (const token of tokens) {
                                const opt = document.createElement('option');
                                opt.value = token;
                                opt.textContent = token;
                                inner.appendChild(opt);
                            }
                        }
                        // Sync wrapper height to the inner control after options change
                        const inn = inner.getBoundingClientRect();
                        if (inn.height > 0) {
                            element.style.height = `${Math.round(inn.height)}px`;
                        }
                    } else if (label) {
                        element.dataset[key] = value;
                        renderutils.updateLabel(element);
                    }
                    // For other element types (e.g., Radio, Checkbox, Button, Counter, etc.)
                    // the Value is metadata only and should not alter visible text.
                    break;
                case 'items':
                    if (sorter) {
                        element.dataset.items = String(value || '');
                        const itemsInput = document.getElementById('elitems') as HTMLInputElement | null;
                        if (itemsInput) itemsInput.value = String(value || '');
                        sorterNeedsRender = true;
                    }
                    break;

                case 'isEnabled': {
                    const enabled = utils.isTrue(value);
                    if (enabled) {
                        element.classList.remove('disabled-div');
                        if (renderutils.previewWindow()) {
                            element.style.pointerEvents = '';
                        }
                    } else {
                        element.classList.add('disabled-div');
                        if (renderutils.previewWindow()) {
                            element.style.pointerEvents = 'none';
                        }
                    }

                    if (input) {
                        const inputEl = (inner instanceof HTMLInputElement ? inner : element.querySelector('input'));
                        const actualInput = (element instanceof HTMLInputElement ? element : inputEl) as HTMLInputElement | null;
                        if (actualInput) {
                            actualInput.disabled = !enabled;
                        }
                    }

                    if (select) {
                        const selectEl = (inner instanceof HTMLSelectElement ? inner : element.querySelector('select'));
                        const actualSelect = (element instanceof HTMLSelectElement ? element : selectEl) as HTMLSelectElement | null;
                        if (actualSelect) {
                            actualSelect.disabled = !enabled;
                        }
                    }

                    if (slider) {
                        if (inner) {
                            inner.style.pointerEvents = enabled ? '' : 'none';
                        }
                        const sliderHandle = document.querySelector(`#slider-handle-${element.id}`) as HTMLDivElement | null;
                        if (sliderHandle) {
                            sliderHandle.style.pointerEvents = enabled ? '' : 'none';
                        }
                    }

                    if (counter) {
                        const arrows = element.querySelectorAll('.counter-arrow') as NodeListOf<HTMLDivElement>;
                        arrows.forEach(arrow => {
                            arrow.style.pointerEvents = enabled ? '' : 'none';
                            if (!enabled) {
                                arrow.classList.add('disabled');
                            } else {
                                arrow.classList.remove('disabled');
                            }
                        });
                    }

                    if (button && inner) {
                        inner.style.pointerEvents = enabled ? '' : 'none';
                    }

                    if (label || separator || container || sorter || group) {
                        element.style.pointerEvents = enabled ? '' : 'none';
                    }

                    const inputEl = (element instanceof HTMLInputElement ? element : (inner as HTMLInputElement | null));
                    if (inputEl && input) {
                        inputEl.disabled = !enabled;
                    }

                    if (checkbox && customCheckbox) {
                        customCheckbox.setAttribute('aria-disabled', String(!enabled));
                    }

                    if (radio && customRadio) {
                        customRadio.setAttribute('aria-disabled', String(!enabled));
                    }}
                    break;

                case 'isVisible':
                    if (utils.isTrue(value)) {
                        // Restore element in both modes
                        element.classList.remove('design-hidden');
                        element.style.removeProperty('display');
                        element.style.removeProperty('visibility');

                        // Also ensure the inner element is visible
                        const inner = element.firstElementChild as HTMLElement | null;
                        if (inner) {
                            inner.classList.remove('design-hidden');
                            inner.style.removeProperty('display');
                            inner.style.removeProperty('visibility');
                        }
                    } else {
                        if (renderutils.previewWindow()) {
                            element.style.display = 'none';
                            element.classList.remove('design-hidden');
                        } else {
                            element.classList.add('design-hidden');
                            element.style.removeProperty('display');
                            element.style.removeProperty('visibility');
                        }
                    }
                    break;

                case 'isSelected':
                    if (customRadio) {
                        if (utils.isTrue(value)) {
                            // Enforce single selection within the same radio group
                            renderutils.unselectRadioGroup(customRadio);
                            customRadio.setAttribute('aria-checked', 'true');
                            customRadio.classList.add('selected');
                        } else {
                            customRadio.setAttribute('aria-checked', 'false');
                            customRadio.classList.remove('selected');
                        }
                    }
                    break;

                case 'group':
                    element.dataset.group = String(value ?? '');
                    if (customRadio) {
                        customRadio.setAttribute('group', String(value ?? ''));
                        if (utils.isTrue(props.isSelected) || customRadio.classList.contains('selected')) {
                            renderutils.unselectRadioGroup(customRadio);
                            customRadio.setAttribute('aria-checked', 'true');
                            customRadio.classList.add('selected');
                        }
                    }
                    break;

                case 'isChecked':
                    if (customCheckbox) {
                        customCheckbox.setAttribute('aria-checked', String(value));
                        if (utils.isTrue(value)) {
                            customCheckbox.classList.add('checked');
                        } else {
                            customCheckbox.classList.remove('checked');
                        }
                    }
                    break;

                case 'fill':
                    if (customCheckbox) {
                        customCheckbox.dataset.fill = String(utils.isTrue(value));
                    }
                    break;

                case 'sortable':
                    if (sorter) {
                        value = utils.isTrue(value) ? 'true' : 'false';
                        sorterNeedsRender = true;
                    }
                    break;

                case 'ordering':
                    if (sorter) {
                        value = utils.isTrue(value) ? 'true' : 'false';
                        sorterNeedsRender = true;
                    }
                    break;

                case 'align':
                    if (label) {
                        element.dataset[key] = value;
                        renderutils.updateLabel(element);
                    } else if (sorter) {
                        const normalized = String(value || '').toLowerCase();
                        const allowed = ['left', 'center', 'right'];
                        const next = allowed.includes(normalized) ? normalized : 'left';
                        element.dataset.align = next;
                        const alignInput = document.getElementById('elalign') as HTMLSelectElement | null;
                        if (alignInput) alignInput.value = next;
                        sorterNeedsRender = true;
                    }
                    break;

                default:
                    break;
            }

            if (['left', 'top', 'width', 'height', 'nameid'].includes(key)) {
                const elprop = document.getElementById('el' + key) as HTMLInputElement;
                elprop.value = value;
            }

            element.dataset[key] = value;

            if (slider && handle) {
                renderutils.updateHandleStyle(handle, {...props, ...dataset});
            }
        });

        if (counter && counterNeedsResize) {
            renderutils.syncCounterSize(element);
        }
        if (sorter && sorterNeedsRender) {
            renderutils.renderSorter(element);
        }

    },

    // Propagate an element name change across customJS for ui.on(...) and ui.trigger(...) first argument (identifier or quoted)
    propagateNameChange: function(oldName: string, newName: string) {
        const old_name = String(oldName || '').trim();
        const new_name = String(newName || '').trim();

        if (!old_name || !new_name || old_name === new_name) {
            return;
        }

        // Helper: escape regex special chars
        const escapeName = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Update customJS for common API usages only (ui.on/ui.trigger first arg)
        const src = String(dialog.customJS || '');
        if (src) {
            const escOld = escapeName(old_name);
            // ui.on(<id>, ...)
            const onUnquotedRegExp = new RegExp(`\\bui\\.on\\s*\\(\\s*${escOld}\\b`, 'g');
            const onQuotedRegExp = new RegExp(`\\bui\\.on\\s*\\(\\s*(["'])${escOld}\\1`, 'g');
            // ui.trigger(<id>, ...)
            const triggerUnquotedRegExp = new RegExp(`\\bui\\.trigger\\s*\\(\\s*${escOld}\\b`, 'g');
            const triggerQuotedRegExp = new RegExp(`\\bui\\.trigger\\s*\\(\\s*(["'])${escOld}\\1`, 'g');

            let out = src.replace(onUnquotedRegExp, (word) => word.replace(old_name, new_name));
            out = out.replace(triggerUnquotedRegExp, (word) => word.replace(old_name, new_name));
            out = out.replace(onQuotedRegExp, (_word, quote: string) => `ui.on(${quote}${new_name}${quote}`);
            out = out.replace(triggerQuotedRegExp, (_word, quote: string) => `ui.trigger(${quote}${new_name}${quote}`);

            if (out !== src) {
                dialog.customJS = out;
            }
        }
    },

    renderSorter: function(host: HTMLElement, opts: Partial<Record<string, unknown>> = {}, emitChange = true) {
        const visual = host.classList.contains('sorter')
            ? host
            : (host.querySelector('.sorter') as HTMLElement | null);

        if (!visual) {
            return;
        }

        const datasetSource = host as HTMLElement;

        const itemsStr = String(opts.items ?? datasetSource.dataset.items ?? datasetSource.dataset.value ?? '');

        // Build a design-time sample state (second item active) for editor only.
        let sampleStateRaw: string | undefined;
        if (!renderutils.previewWindow()) {
            const labels = splitSorterValues(itemsStr);
            const preferred = labels[1]; // second item, if present
            sampleStateRaw = preferred
                ? stringifySorterState(labels.map(text => ({ text, state: text === preferred ? 'asc' : 'off' })))
                : undefined;
            (visual as any).__sampleSorterState = sampleStateRaw;
        } else {
            (visual as any).__sampleSorterState = undefined;
        }

        const persistedStateRaw = datasetSource.dataset[SORTER_STATE_KEY];
        const stateRaw = opts[SORTER_STATE_KEY] !== undefined
            ? opts[SORTER_STATE_KEY]
            : (persistedStateRaw && String(persistedStateRaw).trim().length > 0
                ? persistedStateRaw
                : sampleStateRaw);
        const usingSampleState = opts[SORTER_STATE_KEY] === undefined && (
            !persistedStateRaw || String(persistedStateRaw).trim().length === 0
        ) && !!sampleStateRaw;
        const persistState = opts.persistState === undefined ? !usingSampleState : utils.isTrue(opts.persistState);

        const sortable = utils.isTrue(opts.sortable ?? datasetSource.dataset.sortable ?? 'true');
        const ordering = utils.isTrue(opts.ordering ?? datasetSource.dataset.ordering ?? 'true');
        let items = normalizeSorterItems(itemsStr, stateRaw);

        if (!ordering) {
            items = items.map(item => ({
                text: item.text,
                state: item.state === 'asc' ? 'asc' : 'off'
            }));
        }

        const bg = String(opts.backgroundColor ?? datasetSource.dataset.backgroundColor ?? '#ffffff');
        const fg = String(opts.fontColor ?? datasetSource.dataset.fontColor ?? '#000000');
        const activeBg = String(opts.activeBackgroundColor ?? datasetSource.dataset.activeBackgroundColor ?? '#e6f1e6');
        const activeFg = String(opts.activeFontColor ?? datasetSource.dataset.activeFontColor ?? '#000000');
        const border = String(opts.borderColor ?? datasetSource.dataset.borderColor ?? '#b8b8b8');
        const alignRaw = String(opts.align ?? datasetSource.dataset.align ?? 'left').toLowerCase();
        const align = ['left', 'center', 'right'].includes(alignRaw) ? alignRaw : 'left';
        const descBg = activeBg;

        visual.style.backgroundColor = bg;
        visual.style.borderColor = border;
        visual.style.setProperty('--sorter-bg', bg);
        visual.style.setProperty('--sorter-fg', fg);
        visual.style.setProperty('--sorter-active-bg', activeBg);
        visual.style.setProperty('--sorter-desc-bg', descBg);
        visual.style.setProperty('--sorter-active-fg', activeFg);
        datasetSource.dataset.sortable = sortable ? 'true' : 'false';
        datasetSource.dataset.ordering = ordering ? 'true' : 'false';
        visual.dataset.sortable = datasetSource.dataset.sortable;
        visual.dataset.ordering = datasetSource.dataset.ordering;

        const existingList = visual.querySelector('.sorter-list') as HTMLDivElement | null;
        const list = existingList || document.createElement('div');
        list.className = 'sorter-list';
        list.style.position = 'relative';
        const existingSortable = (list as any).__sortable as { destroy?: () => void } | undefined;
        if (existingSortable?.destroy) {
            try { existingSortable.destroy(); } catch { /* noop */ }
        }
        delete (list as any).__sortable;
        list.innerHTML = '';

        if (persistState) {
            updateSorterDataset(datasetSource, items);
        } else {
            const order = items.map(it => it.text).join(',');
            datasetSource.dataset.items = order;
            datasetSource.dataset.value = order; // legacy alias
            datasetSource.dataset.order = order;
        }
        visual.dataset.items = datasetSource.dataset.items || '';
        visual.dataset.value = datasetSource.dataset.value || ''; // legacy
        visual.dataset.order = datasetSource.dataset.order || '';
        visual.dataset.activeValues = datasetSource.dataset.activeValues || '';
        visual.dataset.selected = datasetSource.dataset.selected || '';
        visual.dataset[SORTER_STATE_KEY] = datasetSource.dataset[SORTER_STATE_KEY] || '';

        const colors = {
            ascBg: activeBg,
            descBg,
            activeFg,
            baseBg: bg,
            baseFg: fg
        };

        const attachRow = (item: SorterItem, index: number) => {
            const row = document.createElement('div');
            row.className = 'sorter-item';
            row.dataset.state = item.state;
            row.dataset.text = item.text;
            row.draggable = false;
            row.dataset.align = align;
            if (!ordering) {
                row.classList.add('no-order');
            }

            const label = document.createElement('span');
            label.className = 'sorter-label';
            label.textContent = item.text;
            label.style.textAlign = align as 'left' | 'center' | 'right';

            const indicator = document.createElement('span');
            indicator.className = 'sorter-indicator';
            indicator.textContent = item.state === 'desc' ? '▼' : '▲';
            indicator.classList.toggle('hidden', !ordering);

            applySorterStateClasses(row, item, colors, ordering ? indicator : null);

            const cycle = () => {
                item.state = cycleSorterState(item.state, ordering);
                applySorterStateClasses(row, item, colors, ordering ? indicator : null);
                if (persistState) {
                    updateSorterDataset(datasetSource, items);
                    visual.dataset.value = datasetSource.dataset.value || '';
                    visual.dataset.order = datasetSource.dataset.order || '';
                    visual.dataset.activeValues = datasetSource.dataset.activeValues || '';
                    visual.dataset.selected = datasetSource.dataset.selected || '';
                    visual.dataset[SORTER_STATE_KEY] = datasetSource.dataset[SORTER_STATE_KEY] || '';
                    if (emitChange) {
                        visual.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                } else {
                    (visual as any).__sampleSorterState = stringifySorterState(items);
                }

                // Re-apply alignment in case it changed via dataset
                label.style.textAlign = align as 'left' | 'center' | 'right';
            };

            row.addEventListener('click', () => {
                if (list.dataset.dragging === 'true') return;
                cycle();
            });
            label.addEventListener('click', (ev) => {
                ev.stopPropagation();
                if (list.dataset.dragging === 'true') return;
                cycle();
            });
            indicator.addEventListener('click', (ev) => {
                ev.stopPropagation();
                if (list.dataset.dragging === 'true') return;
                cycle();
            });

            row.appendChild(label);
            row.appendChild(indicator);
            list.appendChild(row);
        };

        items.forEach((item, idx) => attachRow(item, idx));

        if (!existingList) {
            visual.innerHTML = '';
            visual.appendChild(list);
        }

        if (sortable) {
            (list as any).__sortable = new Sortable(list, {
                animation: 150,
                draggable: '.sorter-item',
                ghostClass: 'sorter-ghost',
                chosenClass: 'sorter-chosen',
                dragClass: 'sorter-drag',
                direction: 'vertical',
                forceFallback: true,
                fallbackOnBody: false,
                fallbackBoundingClientRect: visual.getBoundingClientRect(),
                scroll: false,
                group: {
                    name: `choicelist-${datasetSource.id || 'default'}`,
                    pull: false,
                    put: false
                },
                onMove: (evt) => {
                    const ev = evt.originalEvent as MouseEvent | DragEvent | undefined;
                    if (!ev) return true;
                    const r = visual.getBoundingClientRect();
                    const x = (ev as MouseEvent).clientX ?? 0;
                    const y = (ev as MouseEvent).clientY ?? 0;
                    const inside = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
                    return inside;
                },
                onStart: () => {
                    list.dataset.dragging = 'true';
                },
                onEnd: () => {
                    // Prevent accidental click-to-toggle after drag end.
                    setTimeout(() => { delete list.dataset.dragging; }, 0);

                    const rows = Array.from(list.querySelectorAll<HTMLElement>('.sorter-item'));
                    const order = rows.map(r => String(r.dataset.text || '').trim()).filter(Boolean);
                    if (order.length === items.length) {
                        const map = new Map(items.map(it => [it.text, it]));
                        const next = order.map(t => map.get(t)).filter(Boolean) as SorterItem[];
                        if (next.length === items.length) {
                            items = next;
                        }
                    }

                if (persistState) {
                    updateSorterDataset(datasetSource, items);
                    visual.dataset.value = datasetSource.dataset.value || '';
                    visual.dataset.order = datasetSource.dataset.order || '';
                    visual.dataset.activeValues = datasetSource.dataset.activeValues || '';
                        visual.dataset.selected = datasetSource.dataset.selected || '';
                        visual.dataset[SORTER_STATE_KEY] = datasetSource.dataset[SORTER_STATE_KEY] || '';
                        if (emitChange) {
                            visual.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    } else {
                        (visual as any).__sampleSorterState = stringifySorterState(items);
                    }
                }
            });
        }

        return items;
    },

    updateButton: function(
        button,
        text,
        fontSize,
        lineClamp,
        width
    ) {
        button.style.width = width + 'px';
        button.style.setProperty('width', width + 'px', 'important');
        button.style.maxWidth = width + 'px';
        button.style.setProperty('max-width', width + 'px', 'important');

        const lineHeight = fontSize * 1.2;
        const paddingY = 3; // px
        const maxHeight = (lineHeight * lineClamp) + 3 * paddingY;
        button.style.maxHeight = maxHeight + 'px';

        const span = button.querySelector('.smart-button-text') as HTMLSpanElement;
        span.style.fontSize = fontSize + 'px';
        span.style.lineHeight = '1.2';
        span.style.overflow = 'hidden';
        span.style.textOverflow = 'ellipsis';
        span.style.whiteSpace = 'nowrap';
        // Use CSS property setter for vendor-prefixed line clamp
        span.style.setProperty('-webkit-line-clamp', String(lineClamp));

        span.textContent = text;

        if (span.scrollHeight > span.offsetHeight) {
            button.title = text;
        } else {
            button.removeAttribute('title');
        }
    },

    updateLabel: function(element, properties) {
        // In the Editor, element is a wrapper and the actual label is its first child.
        // In Preview, the label is a single node (no inner child). Fall back to the element itself.
        const host = (element.firstElementChild as HTMLElement | null) || element;

        let dataset = element.dataset;

        // Determine effective font size with precedence:
        let fontSize = 0;

        // 1) dataset.fontSize
        if (dataset.fontSize) {
            fontSize = Number(dataset.fontSize);
        }

        // 2) wrapper inline style (dialog-level)
        if (fontSize <= 0) {
            const wrFS = utils.asInteger(element.style.fontSize.replace('px', '') || '');
            if (!Number.isNaN(wrFS) && wrFS > 0) fontSize = wrFS;
        }

        // 3) computed host
        if (fontSize <= 0) {
            const cs = window.getComputedStyle(host);
            const hcFS = parseFloat(cs.fontSize || '');
            if (!Number.isNaN(hcFS) && hcFS > 0) fontSize = hcFS;
        }

        // 4) global fallback
        if (fontSize <= 0) {
            fontSize = Number(coms.fontSize);
        }

        const text = dataset.value ? dataset.value : '';
        let lines = dataset.lineClamp ? Number(dataset.lineClamp) : 1;
        let maxW = dataset.maxWidth ? Number(dataset.maxWidth) : 100;


    // Apply text and font styles
    host.textContent = text;
    host.style.fontSize = fontSize + 'px';
    host.style.lineHeight = '1.2';
    host.style.overflow = 'hidden';
    // textOverflow is finalized after measuring; set a safe default now
    host.style.textOverflow = 'ellipsis';

        const singleLineHeight = Math.ceil(fontSize * 1.2);

        // Apply text alignment
        const align = dataset.align || 'left';
        host.style.textAlign = align;

        // Configure clamp/ellipsis behavior and vertical centering
        if (lines > 1) {
            // Multi-line: use flexbox for vertical centering
            host.style.display = '-webkit-box';
            host.style.whiteSpace = 'normal';
            host.style.overflow = 'hidden';
            host.style.textOverflow = 'ellipsis';
            host.style.wordBreak = 'break-word';
            host.style.setProperty('-webkit-line-clamp', String(lines));
            host.style.setProperty('-webkit-box-orient', 'vertical');
            host.style.removeProperty('max-height');
            host.style.removeProperty('height');
            host.style.removeProperty('position');
            host.style.removeProperty('top');
            host.style.removeProperty('transform');
            host.style.removeProperty('vertical-align');

            // Set up wrapper for vertical centering
            element.style.display = 'flex';
            element.style.alignItems = 'center';
            element.style.justifyContent = 'flex-start';
            element.style.removeProperty('height');
            element.style.removeProperty('max-height');
        } else {
            // Single line: use flexbox for vertical centering
            host.style.display = 'block';
            host.style.whiteSpace = 'nowrap';
            host.style.removeProperty('-webkit-line-clamp');
            host.style.removeProperty('-webkit-box-orient');
            host.style.removeProperty('word-break');
            host.style.removeProperty('max-height');
            host.style.removeProperty('height');
            host.style.removeProperty('position');
            host.style.removeProperty('top');
            host.style.removeProperty('transform');
            host.style.removeProperty('vertical-align');

            // Set up wrapper for vertical centering
            element.style.display = 'flex';
            element.style.alignItems = 'center';
            element.style.justifyContent = 'flex-start';
            element.style.removeProperty('max-height');
        }

        host.style.minWidth = '0';

        // Measure natural rendered width so the Editor stays in sync with Preview sizing.
        // Temporarily clear width constraints so scrollWidth reflects the full content width.
        element.style.removeProperty('width');
        element.style.removeProperty('max-width');
        host.style.width = 'auto';
        host.style.removeProperty('max-width');

        const measuredScroll = Math.ceil(host.scrollWidth || 0);
        const measuredBox = Math.ceil(host.getBoundingClientRect().width || 0);
        let natural = Math.max(measuredScroll, measuredBox);
        if (!Number.isFinite(natural) || natural <= 0) {
            natural = utils.textWidth(text, fontSize, coms.fontFamily);
        }

    // Add a small cross-platform safety buffer to avoid right-edge clipping on Windows
    // where glyph rasterization can exceed measured widths by ~1px.
    const fudge = 2; // px
    const finalW = Math.max(0, maxW > 0 ? Math.min(natural + fudge, maxW) : (natural + fudge));
        element.style.maxWidth = maxW > 0 ? `${maxW}px` : '';
        element.style.width = `${finalW}px`;

        // Restore any width settings that were temporarily cleared. Preview hosts (no wrapper)
        // should mirror the final width instead of stretching to 100%.
        if (host === element) {
            host.style.maxWidth = maxW > 0 ? `${maxW}px` : '';
            host.style.width = `${finalW}px`;
        } else {
            host.style.maxWidth = '100%';
            host.style.width = '100%';
        }

        // Toggle ellipsis only when needed (single-line labels)
        if (lines <= 1) {
            // If content fits within final width, avoid showing an ellipsis
            const needsEllipsis = natural > finalW;
            host.style.textOverflow = needsEllipsis ? 'ellipsis' : 'clip';
            // Also allow overflow to be visible when not needed to prevent 1px clipping
            host.style.overflow = needsEllipsis ? 'hidden' : 'visible';
        }

        // Keep in canvas bounds (Editor only). In Preview, do not auto-shift position.
        if (!renderutils.previewWindow()) {
            const dialogW = dialog.canvas.getBoundingClientRect().width;
            const elleft = document.getElementById('elleft') as HTMLInputElement | null;
            const left = Number(element.dataset.left ?? (parseInt(element.style.left || '0', 10) || 0));
            if (left + finalW + 10 > dialogW) {
                const newleft = Math.max(10, Math.round(dialogW - finalW - 10));
                element.style.left = newleft + 'px';
                element.dataset.left = String(newleft);
                if (elleft) elleft.value = String(newleft);
            }
        }

        // Tooltip based on overflow
        const overflow = (host.scrollWidth > host.clientWidth) || (host.scrollHeight > host.clientHeight);
        if (overflow) {
            element.title = text;
        } else {
            element.removeAttribute('title');
        }
    },

    updateHandleStyle: function(handle, obj) {

        if (obj.handleshape && obj.direction) {
            // Clear all shape-specific inline styles
            handle.style.border = '';
            handle.style.borderLeft = '';
            handle.style.borderRight = '';
            handle.style.borderTop = '';
            handle.style.borderBottom = '';
            handle.style.backgroundColor = '';
            handle.style.width = '';
            handle.style.height = '';
            handle.style.borderRadius = '';

            // Update dataset (this triggers CSS-based fallback if needed)
            handle.dataset.handleshape = String(obj.handleshape) || 'triangle';
            handle.dataset.direction = String(obj.direction);
            if (obj.handleshape === 'triangle') {
                if (obj.direction === 'horizontal') {
                    handle.style.borderLeft = obj.handlesize + 'px solid transparent';
                    handle.style.borderRight = obj.handlesize + 'px solid transparent';
                    handle.style.borderBottom = (1.5 * Number(obj.handlesize)) + 'px solid ' + obj.handleColor;
                    handle.style.left = obj.handlepos + "%";
                    handle.style.top = "100%";
                } else if (obj.direction === 'vertical') {
                    handle.style.borderTop = obj.handlesize + 'px solid transparent';
                    handle.style.borderBottom = obj.handlesize + 'px solid transparent';
                    handle.style.borderRight = (1.5 * Number(obj.handlesize)) + 'px solid ' + obj.handleColor;
                    handle.style.left = "0%";
                    handle.style.top = (100 - Number(obj.handlepos)) + "%";
                }
                handle.style.width = '0px';
                handle.style.height = '0px';
            } else if (obj.handleshape === 'circle') {
                const radius = 1.5 * Number(obj.handlesize);
                handle.style.width = `${radius}px`;
                handle.style.height = `${radius}px`;
                handle.style.backgroundColor = String(obj.handleColor);
                handle.style.borderRadius = '50%';
                if (obj.direction == "horizontal") {
                    handle.style.left = obj.handlepos + "%";
                    handle.style.top = "50%";
                } else {
                    handle.style.left = "50%";
                    handle.style.top = (100 - Number(obj.handlepos)) + "%";
                }
            }
        }
    },

    syncCounterSize: function(wrapper: HTMLElement) {
        // Prefer the actual counter node if the caller passed a wrapper that contains it
        const innerCounter = (
            wrapper.firstElementChild instanceof HTMLElement &&
            wrapper.firstElementChild.classList.contains('counter-wrapper')
        ) ? wrapper.firstElementChild as HTMLElement : null;

        const host = innerCounter || wrapper;
        const prevWidth = wrapper.style.width;
        const prevHeight = wrapper.style.height;

        // Let the element size to its contents before measuring
        wrapper.style.width = 'fit-content';
        wrapper.style.height = 'fit-content';

        const rect = host.getBoundingClientRect();
        const naturalW = Math.ceil(Math.max(host.scrollWidth || 0, rect.width || 0));
        const naturalH = Math.ceil(Math.max(host.scrollHeight || 0, rect.height || 0));

        if (naturalW > 0) {
            wrapper.style.width = `${naturalW}px`;
        } else {
            wrapper.style.width = prevWidth;
        }

        if (naturalH > 0) {
            wrapper.style.height = `${naturalH}px`;
        } else {
            wrapper.style.height = prevHeight;
        }

        // Keep the transparent cover in sync with the new size
        const cover = wrapper.querySelector('.elementcover') as HTMLElement | null;
        if (cover) {
            cover.style.width = '100%';
            cover.style.height = '100%';
        }
    },

    getSelectedIds: function() {
        return Array.from(document.querySelectorAll('#dialog .selectedElement')).map(el => (el as HTMLElement).id);
    },

    // Ungroup a persistent group element back into top-level elements; returns child IDs
    ungroupGroup: function(groupId: string) {
        const group = dialog.getElement(groupId) as HTMLElement | undefined;
        if (!group) {
            return [];
        }

        const groupLeft = parseInt(group.style.left || '0', 10) || 0;
        const groupTop = parseInt(group.style.top || '0', 10) || 0;
        const children = Array.from(group.children) as HTMLElement[];
        const childIds: string[] = [];

        for (const child of children) {
            const cLeft = parseInt(child.style.left || '0', 10) || 0;
            const cTop = parseInt(child.style.top || '0', 10) || 0;
            const newLeft = groupLeft + cLeft;
            const newTop = groupTop + cTop;
            child.style.left = String(newLeft) + 'px';
            child.style.top = String(newTop) + 'px';
            child.dataset.left = String(newLeft);
            child.dataset.top = String(newTop);
            dialog.canvas.appendChild(child);
            childIds.push(child.id);
        }

        group.remove();
        dialog.removeElement(groupId);
        return childIds;
    },

    // Create a persistent group from a list of element IDs; returns the new group id or null
    makeGroupFromSelection: function(ids: string[], persistent?: boolean) {
        try {
            if (!Array.isArray(ids) || ids.length < 2) {
                return null;
            }

            const els = ids
                .map(id => dialog.getElement(id))
                .filter((el): el is HTMLElement => Boolean(el));
            if (els.length < 2) {
                return null;
            }

            const canvasRect = dialog.canvas.getBoundingClientRect();
            const rects = els.map(el => el.getBoundingClientRect());
            const minLeft = Math.min(...rects.map(r => r.left));
            const minTop = Math.min(...rects.map(r => r.top));
            const maxRight = Math.max(...rects.map(r => r.right));
            const maxBottom = Math.max(...rects.map(r => r.bottom));

            // Compute base offsets relative to canvas
            const baseLeft = (minLeft - canvasRect.left);
            const baseTop = (minTop - canvasRect.top);
            // Use floor for group position so that child offsets computed with rounding
            // can reconstruct the original integer pixel positions without drift.
            const left = Math.floor(baseLeft);
            const top = Math.floor(baseTop);
            const width = Math.round(maxRight - minLeft);
            const height = Math.round(maxBottom - minTop);

            const groupTemplate = elements.groupElement;
            const groupEl = renderutils.makeElement({ ...groupTemplate, left, top });
            groupEl.dataset.type = 'Group';
            groupEl.classList.add('element-group');
            groupEl.style.width = width + 'px';
            groupEl.style.height = height + 'px';

            if (persistent) {
                groupEl.dataset.persistent = 'true';
            }

            // Ensure groups have a stable nameid so custom code can refer to them
            if (!groupEl.dataset.nameid || !groupEl.dataset.nameid.trim()) {
                const unique = renderutils.makeUniqueNameID('group');
                groupEl.dataset.nameid = unique;
            }

            dialog.canvas.appendChild(groupEl);

            for (let idx = 0; idx < els.length; idx++) {
                const child = els[idx];
                const childRect = rects[idx];
                // Reconstruct child position so that (groupLeft + childLeft) ~= round(childAbsLeft)
                const childAbsLeft = (childRect.left - canvasRect.left);
                const childAbsTop = (childRect.top - canvasRect.top);
                // Hardwire a -1px adjustment to counteract subpixel rounding drift
                const newLeft = Math.round(childAbsLeft) - left - 1;
                const newTop = Math.round(childAbsTop) - top - 1;
                child.style.left = String(newLeft) + 'px';
                child.style.top = String(newTop) + 'px';
                child.dataset.left = String(newLeft);
                child.dataset.top = String(newTop);
                child.classList.remove('selectedElement');
                groupEl.appendChild(child);
            }

            groupEl.dataset.elementIds = ids.join(',');

            // Inherit Radio 'Group' name as group's nameid if applicable
            const allRadio = els.length > 0 && els.every(el => el.dataset.type === 'Radio');
            if (allRadio) {
                const groups = Array.from(new Set(els.map(el => el.dataset.group || '')));
                if (groups.length === 1 && groups[0]) {
                    const desired = groups[0];
                    const existing = new Set(renderutils.getDialogInfo().elements);

                    let finalName = desired;
                    if (existing.has(finalName)) {
                        let i = 1;
                        while (existing.has(`${desired}${i}`)) {
                            i++;
                        }
                        finalName = `${desired}${i}`;
                    }
                    groupEl.dataset.nameid = finalName;
                }
            }

            dialog.addElement(groupEl);
            return groupEl.id;

        } catch {
            return null;
        }
    },

    // Selection helpers
    updateMultiOutline: function(canvas: HTMLElement, ids: string[], outlineEl?: HTMLDivElement | null) {
        const bounds = renderutils.computeBounds(ids);
        if (!bounds) {
            if (outlineEl && outlineEl.parentElement) outlineEl.parentElement.removeChild(outlineEl);
            return null;
        }

        const { left, top, width, height } = bounds;

        let outline = outlineEl;
        if (!outline) {
            outline = document.createElement('div') as HTMLDivElement;
            outline.className = 'multi-outline';
            canvas.appendChild(outline);
        }

        outline.style.left = left + 'px';
        outline.style.top = top + 'px';
        outline.style.width = width + 'px';
        outline.style.height = height + 'px';

        return outline;
    },

    clearMultiOutline: function(outlineEl?: HTMLDivElement | null) {
        if (outlineEl && outlineEl.parentElement) {
            outlineEl.parentElement.removeChild(outlineEl);
        }
        return null;
    },

    computeBounds: function(ids: string[]) {
        const els = (ids || []).map(id => dialog.getElement(id)).filter((el): el is HTMLElement => Boolean(el));
        if (!els || els.length === 0) {
            return null;
        }

        const canvasRect = dialog.canvas.getBoundingClientRect();

        const parseAxis = (el: HTMLElement, axis: 'left' | 'top') => {
            const datasetValue = el.dataset[axis];
            if (datasetValue !== undefined) {
                const numeric = Number(datasetValue);
                if (!Number.isNaN(numeric)) {
                    return numeric;
                }
            }

            const styleValue = (el.style[axis] || '').trim();
            if (styleValue.endsWith('px')) {
                const numeric = Number(styleValue.slice(0, -2));
                if (!Number.isNaN(numeric)) {
                    return numeric;
                }
            }

            const rect = el.getBoundingClientRect();
            const canvasOffset = axis === 'left' ? canvasRect.left : canvasRect.top;
            return rect[axis] - canvasOffset;
        };

        let minLeft = Number.POSITIVE_INFINITY;
        let minTop = Number.POSITIVE_INFINITY;
        let maxRight = Number.NEGATIVE_INFINITY;
        let maxBottom = Number.NEGATIVE_INFINITY;

        for (const el of els) {
            const left = parseAxis(el, 'left');
            const top = parseAxis(el, 'top');
            const width = el.offsetWidth;
            const height = el.offsetHeight;
            const right = left + width;
            const bottom = top + height;

            if (left < minLeft) minLeft = left;
            if (top < minTop) minTop = top;
            if (right > maxRight) maxRight = right;
            if (bottom > maxBottom) maxBottom = bottom;
        }

        const left = Math.round(minLeft);
        const top = Math.round(minTop);
        const width = Math.round(maxRight - minLeft);
        const height = Math.round(maxBottom - minTop);

        return { left, top, width, height };
    },

    moveElementsBy: function(ids: string[], dx: number, dy: number) {
        for (const id of ids) {
            const el = dialog.getElement(id) as HTMLElement | undefined;
            if (!el) {
                continue;
            }

            const currentLeft = Number(el.dataset.left ?? (parseInt(el.style.left || '0', 10) || 0));
            const currentTop = Number(el.dataset.top ?? (parseInt(el.style.top || '0', 10) || 0));
            const props: Record<string, number> = { left: currentLeft + dx, top: currentTop + dy };

            renderutils.updateElement(el, props as StringNumber);

            el.dataset.left = String(props.left);
            el.dataset.top = String(props.top);
        }
    },

    updateCheckboxColor: function(uuid, color) {
        const customCheckbox = document.querySelector(`#checkbox-${uuid}`) as HTMLElement;
        if (customCheckbox) {
            customCheckbox.style.setProperty('--checkbox-color', color);
        }
    },

    async handleEvent(eventName, ...args) {
        const handler = coms.handlers[eventName];
        if (!handler) {
            console.error(`No handler for event: ${eventName}`);
            return;
        }
        try {
            const modulePath = path.join(__dirname, handler);

            if (fs.existsSync(modulePath + '.js')) {
                const imported = await import(modulePath);
                // the object of interest is the first exported one from that module
                const key = Object.keys(imported)[0];
                // (there really should be only one export per module)

                // then extract the function from that object
                const func = imported[key][eventName];

                if (typeof func === 'function') {
                    return await func(...args);
                } else {
                    console.error(`Function ${eventName} not found in module ${module}`);
                }
            } else {
                showError(`Module "${module}" not found in the modules/ directory.`);
            }
        } catch (error: any) {
            showError(`Error handling ${eventName}: ${error.message}`);
        }
    },

    collectDialogProperties: function() {
        const properties: NodeListOf<HTMLInputElement> = document.querySelectorAll('#dialog-properties [id^="dialog"]');
        const obj = {} as DialogProperties;
        properties.forEach((item) => {
            const key = item.getAttribute('name') as keyof DialogProperties;
            if (key) {
                obj[key] = item.value;
            }
        });
        return obj;
    },

    updateFont: function (fontSize, fontFamily) {
        for (const key in dialog.elements) {
            const element = dialog.elements[key] as HTMLDivElement;
            const dataset = element.dataset;
            const inner = element.firstElementChild as HTMLElement | null;
            switch (dataset.type) {
                case "Input":
                case "Select":
                    // Apply to wrapper and let it cascade; also apply to inner if present
                    element.style.fontSize = fontSize + 'px';
                    if (inner) inner.style.fontSize = fontSize + 'px';
                    if (fontFamily) {
                        element.style.fontFamily = fontFamily;
                        if (inner) inner.style.fontFamily = fontFamily;
                    }
                    // Sync wrapper height to the inner control after font changes
                    if (inner) {
                        const r = inner.getBoundingClientRect();
                        if (r.height > 0) element.style.height = `${Math.round(r.height)}px`;
                    }
                    break;

                case "Label":
                    element.style.fontSize = fontSize + 'px';
                    element.dataset.fontSize = String(fontSize);
                    renderutils.updateLabel(element);
                    break;

                case "Button":
                    // Update the inner button node for precise sizing
                    // Preserve the explicit button width when changing global font size.
                    // Prefer dataset.width, then inline style width, then current layout width,
                    // and only lastly fall back to any legacy maxWidth or a safe default.
                    {
                        const host = (inner as HTMLDivElement) || element;
                        const dsWidth = utils.asNumeric(dataset.width);
                        const styleW = utils.asNumeric(String(element.style.width || '').replace('px', ''));
                        const rectW = Math.round(host.getBoundingClientRect().width || 0);
                        const legacyMax = utils.asNumeric(dataset.maxWidth);
                        const widthPx = (
                            (utils.isNumeric(dsWidth) && dsWidth > 0) ? dsWidth :
                            (utils.isNumeric(styleW) && styleW > 0) ? styleW :
                            (utils.isNumeric(rectW) && rectW > 0) ? rectW :
                            (utils.isNumeric(legacyMax) && legacyMax > 0) ? legacyMax :
                            100
                        );

                        renderutils.updateButton(
                            host,
                            dataset.label || '',
                            fontSize,
                            Number(dataset.lineClamp) || 1,
                            widthPx
                        );
                    }
                    // Let wrapper height auto-follow content
                    element.style.height = '';
                    break;

                case "Counter": {
                    const countervalue = document.querySelector(`#counter-value-${element.id}`) as HTMLDivElement | null;
                    if (countervalue) {
                        countervalue.style.fontSize = fontSize + 'px';
                        if (fontFamily) {
                            countervalue.style.fontFamily = fontFamily;
                        }
                    }
                    renderutils.syncCounterSize(element);
                    break;
                }

                case "Container": {
                    // Apply font size to container and its inner sample items
                    element.style.fontSize = fontSize + 'px';
                    if (inner) {
                        inner.style.fontSize = fontSize + 'px';
                    }

                    const host = inner || element;
                    const items = host.querySelectorAll('.container-item') as NodeListOf<HTMLDivElement>;
                    const rowMinH = Math.max(24, Math.round(fontSize * 2)); // scale row height with font

                    items.forEach(item => {
                        item.style.minHeight = rowMinH + 'px';
                    });

                    break;
                }

                case "ChoiceList": {
                    element.style.fontSize = fontSize + 'px';
                    if (inner) {
                        inner.style.fontSize = fontSize + 'px';
                    }
                    renderutils.renderSorter(element);
                    break;
                }

                default:
                    break;
            }
        }
    },

    buildUniformSchema: function(opts: BuildOptions = {}) {
        const {
            includeBooleans = true,
            includeNumbers = true,
            includeStrings = true,
            skipKeys = [],
            treatMixedAs = 'skip'
        } = opts;

        const typeMap: Record<string, Set<PrimitiveKind>> = {};
        const allowed = new Set<PrimitiveKind>();

        if (includeStrings) {
            allowed.add('string');
        }

        if (includeNumbers) {
            allowed.add('number');
        }

        if (includeBooleans) {
            allowed.add('boolean');
        }

        for (const tmpl of Object.values(elements)) {
            if (!tmpl || typeof tmpl !== 'object') {
                continue;
            }

            for (const [k, v] of Object.entries(tmpl)) {
                if (skipKeys.includes(k)) {
                    continue;
                }

                const tv = typeof v;
                if (tv === 'string' || tv === 'number' || tv === 'boolean') {
                    if (!allowed.has(tv)) {
                        continue;
                    }

                    if (!typeMap[k]) {
                        typeMap[k] = new Set();
                    }

                    typeMap[k].add(tv);
                }
            }
        }

        const schema: UniformSchema = {};

        for (const [k, set] of Object.entries(typeMap)) {
            if (set.size === 1) {
                schema[k] = [...set][0];
            } else {
                if (treatMixedAs !== 'skip') {
                    schema[k] = treatMixedAs as PrimitiveKind; // user-forced
                }
            } // else skip keys with mixed types
        }

        return schema;
    },

    assertTypes: function(
        data: Record<string, unknown>,
        options: AssertOptions = {}
    ) {
        const { schema, collect = false, strictPresence = false } = options;
        if (!__uniformSchema && !schema) {
            __uniformSchema = renderutils.buildUniformSchema();
        }
        const active = schema || __uniformSchema!;
        const errors: string[] = [];

        for (const [key, expected] of Object.entries(active)) {
            const has = Object.prototype.hasOwnProperty.call(data, key);
            if (!has) {
                if (strictPresence) {
                    const msg = `Missing expected key "${key}"`;
                    if (collect) errors.push(msg); else throw new Error(msg);
                }
                continue;
            }

            const val = data[key];
            const tv = typeof val;
            if (tv !== expected) {
                // Attempt safe coercions to reduce noisy errors when loading persisted dialogs
                let coerced = false;
                if (expected === 'string' && (tv === 'boolean' || tv === 'number')) {
                    data[key] = String(val);
                    coerced = true;
                } else if (expected === 'boolean' && tv === 'string') {
                    const low = String(val).toLowerCase();
                    if (low === 'true' || low === 'false') {
                        data[key] = (low === 'true');
                        coerced = true;
                    }
                } else if (expected === 'number' && tv === 'string') {
                    const num = Number(val);
                    if (!Number.isNaN(num)) {
                        data[key] = num;
                        coerced = true;
                    }
                }
                if (!coerced) {
                    const msg = `Property "${key}" expected ${expected}, got ${tv}`;
                    if (collect) {
                        errors.push(msg);
                    } else {
                        throw new Error(msg);
                    }
                }
            }
        }

        if (collect) return errors;
    },

    // Return the keys of an element template that are NOT listed in its $persist array
    // (excluding the metadata key $persist itself)
    getNonPersistKeys: function(name) {
        const tmpl = elements[name];
        if (!tmpl) {
            return [];
        }

        const persistSet = new Set<string>((tmpl.$persist as readonly string[] | undefined) || []);

        // Non-persist keys are everything not explicitly listed in $persist,
        // including the metadata key '$persist' itself
        return Object.keys(tmpl).filter(k => !persistSet.has(k));
    },

    // Add press/hover keyboard feedback to consistent buttons
    enhanceButton: function(btn: HTMLButtonElement) {
        if (!btn || enhancedButtons.has(btn)) {
            return;
        }

        enhancedButtons.add(btn);
        const press = () => btn.classList.add('btn-active');
        const release = () => btn.classList.remove('btn-active');

        btn.addEventListener('mousedown', press);
        btn.addEventListener('mouseup', release);
        btn.addEventListener('mouseleave', release);
        btn.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === ' ' || e.key === 'Enter') {
                press();
            }
        });

        btn.addEventListener('keyup', (e: KeyboardEvent) => {
            if (e.key === ' ' || e.key === 'Enter') {
                release();
                // Trigger click on Enter/Space for accessibility
                btn.click();
            }
        });
    },

    enhanceButtons: function(root?: ParentNode) {
        const scope: ParentNode = root || document;
        const buttons = Array.from(scope.querySelectorAll('button.custombutton')) as HTMLButtonElement[];
        buttons.forEach(renderutils.enhanceButton);
    },

    findWrapper(name, canvas) {
        const n = String(name || '').trim();
        if (!n) {
            return null;
        }

        // Prefer the top-level element that carries a real element type, to avoid matching inner nodes
        const matches = Array.from(canvas.querySelectorAll<HTMLElement>(`[data-nameid="${n}"]`));
        if (matches.length === 0) {
            return null;
        }

        const withType = matches.find(el => (el.dataset?.type || '').length > 0);
        return withType || matches[0] || null;
    },

    findRadioGroupMembers(groupName, canvas) {
        const gnm = String(groupName || '').trim();
        if (!gnm) {
            return [];
        }

        const all = Array.from(canvas.querySelectorAll<HTMLElement>(`.custom-radio[group="${CSS_ESCAPE(gnm)}"]`));
        if (!all.length) {
            const wrappers = Array.from(canvas.querySelectorAll<HTMLElement>(`.element-wrapper[data-group="${CSS_ESCAPE(gnm)}"]`));
            return wrappers.filter(el => String(el.dataset?.type || '').trim() === 'Radio');
        }

        const wrappers = new Set<HTMLElement>();
        all.forEach(node => {
            const wrapper = getRadioWrapperFromNode(node);
            if (wrapper) {
                wrappers.add(wrapper);
            }
        });

        return Array.from(wrappers);
    },

    // Surface runtime errors to end users in Preview (not just console)
    showRuntimeError: function(msg, canvas) {
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
    },

    // Build the UI facade for user scripts
    exposeNameGlobals: function(canvas) {
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

        // Automatically expose radio group names as globals referencing their string identifiers.
        renderutils.exposeRadioGroupGlobals(canvas);
    },

    exposeRadioGroupGlobals: function(canvas) {
        const groups = new Set<string>();

        const customRadios = Array.from(canvas.querySelectorAll<HTMLElement>('.custom-radio[group]'));
        customRadios.forEach(node => {
            const value = (node.getAttribute('group') || '').trim();
            if (value) {
                groups.add(value);
            }
        });

        const wrappers = Array.from(canvas.querySelectorAll<HTMLElement>('.element-wrapper[data-group]'));
        wrappers.forEach(wrapper => {
            const type = String(wrapper.dataset?.type || '').trim();
            if (type !== 'Radio') {
                return;
            }
            const value = (wrapper.dataset.group || '').trim();
            if (value) {
                groups.add(value);
            }
        });

        if (!window.__radioGroupGlobals) {
            window.__radioGroupGlobals = {} as Record<string, string>;
        }

        const registry = window.__radioGroupGlobals as Record<string, string>;

        for (const group of groups) {
            if (!(group in registry)) {
                registry[group] = group;
            }

            if (!(group in window)) {
                if (!utils.isIdentifier(group)) {
                    continue;
                }
                try {
                    Object.defineProperty(window, group, {
                        configurable: true,
                        enumerable: false,
                        get: () => registry[group]
                    });
                } catch {
                    /* ignore define errors */
                }
            }
        }
    },


    // Allow bare identifiers for common event names in customJS, e.g., ui.trigger(x, change)
    exposeEventNameGlobals: function() {
        const events = Array.from(EVENT_NAMES);
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
    },

    // Normalize an arbitrary event-like value to a supported event name,
    // or null if unsupported
    normalizeEventName: function(ev) {
        const s = String(ev ?? '').trim().toLowerCase();
        if (!s || !EVENT_NAMES.has(s)) {
            return null;
        }
        return s as EventName;
    },

    normalizeContainerItemType: function(value) {
        return normalizeContainerItemType(value);
    },

    applyContainerItemFilter: function(host) {
        applyContainerItemFilter(host || null);
    },
}
