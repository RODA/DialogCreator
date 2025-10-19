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

let __uniformSchema: UniformSchema | null = null;

const validation_messages: ValidationMessage = {};
const error_tippy: ErrorTippy = {};
const enhancedButtons = new WeakSet<HTMLButtonElement>();

const CSS_ESCAPE = (value: string) => {
    if (typeof CSS !== 'undefined' && CSS.escape) {
        return CSS.escape(value);
    }
    return value.replace(/"/g, '\\"');
};

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
                allowHTML: true
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

export const errorutils = {
    addTooltip(element: string | string[], message: string) {
        const text = String(message ?? '');
        if (!text) return;

        withElementList(element, (name) => {
            const { host } = resolveElementHost(name);
            if (!host) return;

            ensureTooltip(name, host, text);
            if (!validation_messages[name]) {
                validation_messages[name] = { name, errors: [text] };
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
            } else {
                const { host } = resolveElementHost(name);
                if (host) {
                    ensureTooltip(name, host, existing.errors[0]);
                }
            }
        });
    },

    addHighlight(element: string | string[], kind?: 'field' | 'radio') {
        withElementList(element, (name) => {
            const { host, isRadio } = resolveElementHost(name);
            if (!host) return;

            const inferredKind = kind ?? ((host.dataset?.type === 'Radio' || isRadio) ? 'radio' : 'field');
            host.classList.remove('error-in-field', 'error-in-radio');
            host.classList.add(inferredKind === 'radio' ? 'error-in-radio' : 'error-in-field');
        });
    },

    clearHighlight(element: string | string[]) {
        withElementList(element, (name) => {
            const { host } = resolveElementHost(name);
            if (!host) return;
            host.classList.remove('error-in-field', 'error-in-radio');
        });
    }
};

export const errorhelpers = errorutils;

export const renderutils: RenderUtils = {
    // Determine if current window/context is the Preview window
    // Heuristic: pathname or body data attribute; fallback to checking for preview-specific element
    previewWindow: function() {
        try {
            const loc = window.location.pathname.toLowerCase();
            if (loc.includes('preview.html')) return true;
            if (document.body && document.body.dataset.view === 'preview') return true;
            // Fallback: editor has an element with id 'dialog-properties'; preview should not
            return !document.getElementById('dialog-properties');
        } catch {
            return false;
        }
    },

    unselectRadioGroup: function(element) {
        document.querySelectorAll(`[group="${element.getAttribute("group")}"]`).forEach(
            (radio) => {
                const id = radio.id.slice(6);
                dialog.elements[id].dataset.isSelected = 'false';
                radio.setAttribute('aria-checked', 'false');
                radio.classList.remove('selected');
            }
        );
    },

    makeUniqueNameID: function(nameid) {
        const existingIds = renderutils.getDialogInfo().elements;

        let candidate: string;
        let number = 1;
        do {
            candidate = `${nameid}${number++}`;
        } while (utils.isElementOf(candidate, existingIds));

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
        const nameid = renderutils.makeUniqueNameID(data.nameid);

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
            console.log('Element creation aborted due to invalid or missing properties:\n' + errs.join('\n'));
        }

        function toDatasetValue(v: unknown): string | undefined {
            if (v == null) return undefined;
            if (Array.isArray(v)) return v.map(String).join(',');
            return String(v);
        }

        const bag = data as Record<string, unknown>;
        const keys = utils.getKeys(bag);
        keys.forEach((key) => {
            if (key === '$persist' || key.startsWith('$')) return;
            if (!/^[$A-Za-z_][\w$]*$/.test(key)) return;

            const v = toDatasetValue(bag[key]);
            if (v !== undefined) {
                try {
                    element.dataset[key] = v;
                } catch {
                    /* silently ignore invalid dataset assignments */
                }
            }
        });

        if (data.type == "Button") {

            element.className = 'smart-button';
            element.style.backgroundColor = data.color;
            element.style.maxWidth = data.maxWidth + 'px';

            const lineHeight = coms.fontSize * 1.2;
            const paddingY = 3; // px
            const maxHeight = (lineHeight * data.lineClamp) + 3 * paddingY;
            element.style.maxHeight = maxHeight + 'px';

            const span = document.createElement('span');
            span.className = 'smart-button-text';
            span.style.fontFamily = coms.fontFamily;
            /* --- textContent instead of innerHTML or innerText --- */
            span.textContent = data.label;

            element.appendChild(span);

            renderutils.updateButton(
                element as HTMLDivElement,
                data.label,
                coms.fontSize,
                data.lineClamp,
                data.maxWidth
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
            path.setAttribute('stroke-width', '10');
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

            const customRadio = document.createElement('div');
            customRadio.id = "radio-" + uuid;
            customRadio.className = 'custom-radio';
            customRadio.setAttribute('role', 'radio');
            customRadio.setAttribute('tabindex', '0');
            customRadio.setAttribute('aria-checked', 'false');
            customRadio.setAttribute('group', data.group);
            customRadio.style.setProperty('--radio-color', data.color);

            const cover = document.createElement('div');
            cover.id = "cover-" + uuid;
            cover.className = 'elementcover';
            element.appendChild(customRadio);
            element.appendChild(cover);

        } else if (data.type == "Counter") {

            element.className = "counter-wrapper";

            const decrease = document.createElement("div");
            decrease.className = "counter-arrow down";
            decrease.innerHTML = "&#9654;"; // rotated in the CSS
            decrease.id = "counter-decrease-" + uuid;
            decrease.style.color = data.color;

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
            increase.innerHTML = "&#9654;"; // rotated in the CSS
            increase.id = "counter-increase-" + uuid;
            increase.style.color = data.color;

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
            const maxWInit = Number(data.maxWidth) || 0;
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

        } else if (data.type == "Container") {

            element.className = 'container';
            element.style.backgroundColor = String((data as any).backgroundColor || '#ffffff');
            element.style.width = data.width + 'px';
            element.style.height = data.height + 'px';

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

                const fg = String(data.fontColor) || '#000000';
                const abg = String(data.activeBackgroundColor) || '#779B49';
                const afg = String(data.activeFontColor) || '#ffffff';

                inactive.label.style.color = fg;
                active.row.style.backgroundColor = abg;
                active.label.style.color = afg;

                sample.appendChild(inactive.row);
                sample.appendChild(active.row);
                element.appendChild(sample);
            }

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
        const separator = dataset.type === 'Separator';
        const button = dataset.type === 'Button';
        const label = dataset.type === 'Label';
        const group = dataset.type === 'Group';

        let elementWidth = element.getBoundingClientRect().width;
        const elementHeight = element.getBoundingClientRect().height;
        const dialogW = dialog.canvas.getBoundingClientRect().width;
        const dialogH = dialog.canvas.getBoundingClientRect().height;

        // const all: Record<string, any> = {... element.dataset, ... properties};
        const props: Record<string, any> = {... properties}; // copy of properties only
        const inner = element.firstElementChild as HTMLElement | null;

        Object.keys(props).forEach((key) => {
            // if (['parentId', 'elementIds', 'conditions'].includes(key)) {
            //     return;
            // }

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
                    if (inner && (input || select || container || separator || slider || checkbox || radio)) {
                        inner.style.height = value + 'px';
                        // Also resize the custom control node if present
                        if (checkbox && customCheckbox) customCheckbox.style.height = value + 'px';
                        if (radio && customRadio) customRadio.style.height = value + 'px';
                    }

                    if (Number(eltop.value) + Number(value) + 10 > dialogH) {
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

                    if (elementWidth && Number(elleft.value) + elementWidth + 10 > dialogW) {
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
                    }

                    if (select && Number(value) < 100) {
                        value = '100';
                    }

                    element.style.width = value + 'px';

                    // Ensure the visible child reflects width for contentful elements
                    if (inner && (input || select || container || separator || slider || checkbox || radio)) {
                        inner.style.width = value + 'px';
                        // Also resize the custom control node if present
                        if (checkbox && customCheckbox) customCheckbox.style.width = value + 'px';
                        if (radio && customRadio) customRadio.style.width = value + 'px';
                    }

                    if (Number(elleft.value) + Number(value) + 10 > dialogW) {
                        const newleft = String(Math.round(dialogW - Number(value) - 10));
                        elleft.value = newleft;
                        element.style.left = newleft + 'px';
                    }
                    break;

                case 'maxWidth':
                    if (Number(value) > dialogW - 20) {
                        value = String(Math.round(dialogW - 20));
                        const maxWidth = document.getElementById('elmaxWidth') as HTMLInputElement;
                        maxWidth.value = value;
                    }

                    if (button && inner) {
                        inner.style.maxWidth = value + 'px';
                        // Allow wrapper to auto-size vertically
                        element.style.height = '';
                    } else if (label) {
                        element.dataset[key] = value;
                        renderutils.updateLabel(element);
                    } else {
                        // TODO: if the structure consists of a wrapper (here, the "element") and an inner (here, "inner"), then
                        // why do I apply maxWidth to the wrapper for non-button / label?
                        element.style.maxWidth = value + 'px';
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
                    if (container) {
                        if (utils.isValidColor(value)) {
                            const host = inner || element;
                            host.style.backgroundColor = value;
                            // const row = host.querySelector('.container-item.inactive') as HTMLDivElement | null;
                            // if (row) row.style.backgroundColor = value;
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
                        } else {
                            element.style.color = value;
                        }
                    } else {
                        value = dataset.fontColor;
                        const color = document.getElementById('elfontColor') as HTMLInputElement;
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



                case 'direction':
                    // e.g. separator, switch height with width
                    let width = dataset.height;
                    let height = dataset.width;

                    if (Number(width) > dialogW - 20) {
                        width = String(Math.round(dialogW - 20));
                    }

                    if (Number(elleft.value) + Number(width) + 10 > dialogW) {
                        const newleft = String(Math.round(dialogW - Number(width) - 10));
                        elleft.value = newleft;
                        element.style.left = newleft + 'px';
                    }

                    if (Number(height) > dialogH - 20) {
                        height = String(Math.round(dialogH - 20));
                    }

                    if (Number(eltop.value) + Number(height) + 10 > dialogH) {
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
                    elwidth.value = String(width);
                    elheight.value = String(height);
                    break;

                case 'selection':
                    if (container) {
                        const host = inner || element;
                        const kind = String(value || '').toLowerCase();

                        if (kind === 'single') {
                            const items = Array.from(host.querySelectorAll('.container-item')) as HTMLElement[];
                            const normalFg = String(dataset.fontColor || '#000000');
                            const activeBg = String(dataset.activeBackgroundColor || '#779B49');
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

                    if (label || separator || container || group) {
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

    updateButton: function(
        button,
        text,
        fontSize,
        lineClamp,
        maxWidth
    ) {
        button.style.maxWidth = maxWidth + 'px';

        const lineHeight = fontSize * 1.2;
        const paddingY = 3; // px
        const maxHeight = (lineHeight * lineClamp) + 3 * paddingY;
        button.style.maxHeight = maxHeight + 'px';

        const span = button.querySelector('.smart-button-text') as HTMLSpanElement;
        span.style.fontSize = fontSize + 'px';
        span.style.lineHeight = '1.2';
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
        host.style.textOverflow = 'ellipsis';

        // Configure clamp/ellipsis behavior
        if (lines > 1) {
            host.style.display = '-webkit-box';
            host.style.whiteSpace = 'normal';
            host.style.overflow = 'hidden';
            host.style.textOverflow = 'ellipsis';
            host.style.wordBreak = 'break-word';
            host.style.textAlign = 'left';
            host.style.setProperty('-webkit-line-clamp', String(lines));
            host.style.setProperty('-webkit-box-orient', 'vertical');
            element.style.removeProperty('max-height');
            host.style.removeProperty('max-height');
        } else {
            host.style.display = 'block';
            host.style.whiteSpace = 'nowrap';
            host.style.overflow = 'hidden';
            host.style.textOverflow = 'ellipsis';
            host.style.removeProperty('word-break');
            host.style.textAlign = 'left';
            host.style.removeProperty('-webkit-line-clamp');
            host.style.removeProperty('-webkit-box-orient');
            element.style.removeProperty('max-height');
            host.style.removeProperty('max-height');
        }

    element.style.height = '';
    host.style.height = '';

        // Measure natural single-line width (no wrapping) using canvas measurement
        const natural = utils.textWidth(text, fontSize, coms.fontFamily);

        const finalW = maxW > 0 ? Math.min(natural, maxW) : natural;
        element.style.maxWidth = maxW > 0 ? `${maxW}px` : '';
        element.style.width = `${finalW}px`;

    // Host should fill wrapper (for Preview, host===element so this is harmless)
    host.style.maxWidth = '100%';
    host.style.width = '100%';
        host.style.textAlign = 'left';

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

            const left = Math.round(minLeft - canvasRect.left);
            const top = Math.round(minTop - canvasRect.top);
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

            dialog.canvas.appendChild(groupEl);

            for (let idx = 0; idx < els.length; idx++) {
                const child = els[idx];
                const childRect = child.getBoundingClientRect();
                const newLeft = Math.round(childRect.left - canvasRect.left - left);
                const newTop = Math.round(childRect.top - canvasRect.top - top);
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
                    renderutils.updateButton(
                        (inner as HTMLDivElement) || element,
                        dataset.label || '',
                        fontSize,
                        Number(dataset.lineClamp) || 1,
                        Number(dataset.maxWidth) || 100
                    );
                    // Let wrapper height auto-follow content
                    element.style.height = '';
                    break;

                case "Counter":
                    const countervalue = document.querySelector(`#counter-value-${element.id}`) as HTMLDivElement;
                    countervalue.style.fontSize = fontSize + 'px';
                    if (fontFamily) {
                        countervalue.style.fontFamily = fontFamily;
                    }
                    break;

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
}