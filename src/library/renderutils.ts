// Specific utilities for various (renderer) modules

import { RenderUtils } from '../interfaces/renderutils';
import { utils } from './utils';
import { dialog } from '../modules/dialog';
import { elements } from '../modules/elements';
import { DialogProperties } from "../interfaces/dialog";
import { showError, coms } from '../modules/coms';
import { v4 as uuidv4 } from 'uuid';
import * as path from "path";
import * as fs from "fs";

export const renderutils: RenderUtils = {

    unselectRadioGroup: function(element) {
        document.querySelectorAll(`[group="${element.getAttribute("group")}"]`).forEach(
            (radio) => {
                const id = radio.id.slice(6);
                dialog.elements[id].dataset.isSelected = 'false';
                radio.setAttribute('aria-checked', 'false');
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
        const allIds = new Set(
            Array.from(document.querySelectorAll<HTMLElement>('[data-nameid]'))
                .map(el => el !== currentElement ? el.dataset.nameid! : null)
                .filter(id => id !== null)
        );

        return !allIds.has(newId);
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

        const events = ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"];
        events.forEach((event) => {
            textbox.addEventListener(event, function () {
            if (inputFilter(textbox.value)) {
                state.oldValue = textbox.value;
                state.oldSelectionStart = textbox.selectionStart ?? 0;
                state.oldSelectionEnd = textbox.selectionEnd ?? 0;
            } else if (state.oldValue !== undefined) {
                textbox.value = state.oldValue;
                textbox.setSelectionRange(state.oldSelectionStart, state.oldSelectionEnd);
            } else {
                textbox.value = "";
            }
            });
        });
	},

	setOnlyNumbers: function (items, prefix = 'el') {
        items.forEach((item) => {
            renderutils.setInputFilter(
                <HTMLInputElement>document.getElementById(prefix + item),
                function (value: string): boolean { return /^\d*$/.test(value); }
            );
        })
	},

	setOnlyNumbersWithMinus: function (items, prefix = 'el') {
        items.forEach((item) => {
            renderutils.setInputFilter(
                <HTMLInputElement>document.getElementById(prefix + item),
                function (value) { return /^-?\d*$/.test(value);}
            );
        });
	},

	setOnlyDouble: function (items, prefix = 'el') {
        items.forEach((item) => {
            const element = document.getElementById(prefix + item) as HTMLInputElement;
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
                    return /^\d*\.?\d{1,2}$/.test(value);
                }
            );
        })
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
        element.style.position = 'absolute';
        element.style.top = data.top + 'px';
        element.style.left = data.left + 'px';

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
            element.style.maxHeight = data.height + 'px';
            element.style.maxWidth = data.maxWidth + 'px';

        } else if (data.type == "Select") {

            element.className = 'custom-select';
            element.style.width = data.width + 'px';
            element.style.padding = '3px';
            // Set arrow color via inline SVG data URI if provided
            try {
                const color = (data as any).arrowColor || '#000000';
                const svg = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'><path fill='${color}' d='M6 8L0 0h12z'/></svg>`);
                (element as HTMLSelectElement).style.backgroundImage = `url("data:image/svg+xml,${svg}")`;
            } catch {}

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
            display.textContent = String(data.startval);

            display.style.padding = '0px ' + data.space + 'px';
            display.dataset.nameid = nameid;

            display.style.fontFamily = coms.fontFamily;
            display.style.fontSize = coms.fontSize + 'px';
            display.style.color = data.fontColor || '#000000';

            const increase = document.createElement("div");
            increase.className = "counter-arrow up";
            increase.innerHTML = "&#9654;"; // rotated in the CSS
            increase.id = "counter-increase-" + uuid;
            increase.style.color = data.color;

            element.appendChild(decrease);
            element.appendChild(display);
            element.appendChild(increase);
        } else if (data.type == "Slider") {

            element.className = 'separator';
            element.style.width = data.width + 'px';
            element.style.height = data.height + 'px';

            const handle = document.createElement('div');
            handle.className = 'slider-handle';
            handle.id = 'slider-handle-' + uuid;
            element.appendChild(handle);

            renderutils.updateHandleStyle(handle, data);

        } else if (data.type == "Label") {

            element.textContent = data.value;

        } else if (data.type == "Separator") {

            element.className = 'separator';
            element.style.width = data.width + 'px';
            element.style.height = data.height + 'px';
            element.style.backgroundColor = data.color;

        } else if (data.type == "Container") {

            element.className = 'container';
            element.style.backgroundColor = '#ffffff';
            element.style.width = data.width + 'px';
            element.style.height = data.height + 'px';
            element.dataset.objViewClass = data.objViewClass;

        }

        if (utils.isNotElementOf(data.type, ["Counter", "Label"])) {
            data.nameid = nameid;
        }
        element.style.fontFamily = coms.fontFamily;
        element.style.fontSize = coms.fontSize + 'px';

        if (utils.exists(data.fontColor)) {
            element.style.color = data.fontColor;
        }

        if (utils.isFalse(data.isVisible)) {
            element.classList.add('design-hidden');
        }

        if (utils.isFalse(data.isEnabled)) {
            element.classList.add('disabled-div');
        }

        const keys = utils.getKeys(data);
        keys.forEach((key) => {
            element.dataset[key] = data[key];
        });

        element.id = uuid;

        return element;
    },

    updateElement: function (element, properties) {

        // console.log('properties', properties);
        // console.log('dataset', element.dataset);
        // console.log('combined', {... element.dataset, ... properties});
        // console.log('combined2', {... properties, ... element.dataset});

        let elementWidth = element.getBoundingClientRect().width;
        const elementHeight = element.getBoundingClientRect().height;
        const dialogW = dialog.canvas.getBoundingClientRect().width;
        const dialogH = dialog.canvas.getBoundingClientRect().height;

        // const all: Record<string, any> = {... element.dataset, ... properties};
        const all: Record<string, any> = {... properties};
        const dataset = element.dataset;
        const inner = element.firstElementChild as HTMLElement | null;
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


        Object.keys(all).forEach((key) => {
            // if (['parentId', 'elementIds', 'conditions'].includes(key)) {
            //     return;
            // }

            let value = all[key];

            const customCheckbox = document.querySelector(`#checkbox-${element.id}`) as HTMLDivElement;
            const customRadio = document.querySelector(`#radio-${element.id}`) as HTMLDivElement;
            const countervalue = document.querySelector(`#counter-value-${element.id}`) as HTMLDivElement;
            const handle = document.querySelector(`#slider-handle-${element.id}`) as HTMLDivElement;
            const elwidth = document.getElementById('elwidth') as HTMLInputElement;
            const elheight = document.getElementById('elheight') as HTMLInputElement;
            const elleft = document.getElementById('elleft') as HTMLInputElement;
            const eltop = document.getElementById('eltop') as HTMLInputElement;

            switch (key) {
                case 'nameid':
                    if (!renderutils.nameidValidChange(value, element)) {
                        value = element.dataset.nameid || '';
                        showError('Name already exists.');
                    }
                case 'left':
                    if (Number(value) + elementWidth + 10 > dialogW) {
                        value = String(Math.round(dialogW - elementWidth - 10));
                    }
                    if (Number(value) < 10) { value = '10'; }
                    element.style.left = value + 'px';
                    break;
                case 'top':
                    if (Number(value) + elementHeight + 10 > dialogH) {
                        value = String(Math.round(dialogH - elementHeight - 10));
                    }
                    if (Number(value) < 10) { value = '10'; }
                    element.style.top = value + 'px';
                    break;
                case 'height':
                    if (Number(value) > dialogH - 20) {
                        value = String(Math.round(dialogH - 20));
                    }
                    // Apply height to wrapper by default, and also to inner for certain types
                    element.style.height = value + 'px';
                    if (inner && (input || select || container || separator || slider)) {
                        inner.style.height = value + 'px';
                    }

                    if (Number(eltop.value) + Number(value) + 10 > dialogH) {
                        const newtop = String(Math.round(dialogH - Number(value) - 10));
                        eltop.value = newtop;
                        element.style.top = newtop + 'px';
                    }
                    break;
                case 'label':
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
                        value = String(Math.round(100));
                    }
                    // Apply width to wrapper by default
                    element.style.width = value + 'px';
                    // Ensure the visible child reflects width for contentful elements
                    if (inner && (input || select || container || separator || slider)) {
                        inner.style.width = value + 'px';
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
                        (inner.style as any)['maxWidth'] = value + 'px';
                        // Allow wrapper to auto-size vertically
                        element.style.height = '';
                    } else {
                        (element.style as any)['maxWidth'] = value + 'px';
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
                        try {
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
                            if (span) span.style.setProperty('-webkit-line-clamp', String(clamp));
                        } catch {}
                        // Allow wrapper height to auto-size
                        element.style.height = '';
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
                        } else {
                            element.style.backgroundColor = value;
                            if (checkbox) {
                                const customCheckbox = document.querySelector(`#checkbox-${element.id}`) as HTMLDivElement;
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
                case 'fontColor':
                    if (button && inner) {
                        // Color the button text
                        inner.style.color = value;
                        try {
                            const span = inner.querySelector('.smart-button-text') as HTMLSpanElement | null;
                            if (span) span.style.color = value;
                        } catch {}
                    } else if (label && inner) {
                        inner.style.color = value;
                    } else if ((input || select) && inner) {
                        inner.style.color = value;
                    } else if (counter && countervalue) {
                        countervalue.style.color = value;
                    } else {
                        element.style.color = value;
                    }
                    break;
                case 'arrowColor':
                    if (select && inner instanceof HTMLSelectElement) {
                        try {
                            const color = value;
                            if (utils.isValidColor(color)) {
                                const svg = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'><path fill='${color}' d='M6 8L0 0h12z'/></svg>`);
                                inner.style.backgroundImage = `url(\"data:image/svg+xml,${svg}\")`;
                            }
                        } catch {}
                    }
                    break;
                case 'fontSize':
                    element.style.fontSize = value + 'px';
                    if (button && inner) {
                        // Let wrapper height auto-follow content
                        element.style.height = '';
                    }
                    break;
                case 'fontFamily':
                    element.style.fontFamily = value;
                    break;
                case 'space':
                    if (Number(value) > 50) {
                        value = String(Math.round(50));
                        const space = document.getElementById('elspace') as HTMLInputElement;
                        space.value = value;
                    }
                    countervalue.style.padding = '0px ' + value + 'px';
                    break
                case 'startval':
                    if (Number(value) < Number(dataset.maxval)) {
                        countervalue.textContent = value;
                    } else {
                        value = dataset.startval;
                        const startval = document.getElementById('elstartval') as HTMLInputElement;
                        startval.value = value;
                    }
                    break;
                case 'maxval':
                    if (Number(value) <= Number(dataset.startval)) {
                        value = dataset.maxval;
                        const maxval = document.getElementById('elmaxval') as HTMLInputElement;
                        maxval.value = value;
                    }
                    break;
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

                case 'value':
                    if (inner instanceof HTMLInputElement) {
                        inner.value = value;
                    } else if (inner instanceof HTMLSelectElement) {
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
                            for (const t of tokens) {
                                const opt = document.createElement('option');
                                opt.value = t;
                                opt.textContent = t;
                                inner.appendChild(opt);
                            }
                        }
                    } else if (inner instanceof HTMLDivElement) {
                        inner.textContent = value;
                    }
                    // For Label elements, keep single-line and auto-size width up to maxWidth
                    if (dataset.type === 'Label') {
                        try {
                            const host = (inner as HTMLElement) || element;
                            // Let CSS handle single-line behavior; ensure width fits content up to maxWidth
                            const original = element.style.width;
                            element.style.width = '';
                            const natural = Math.ceil(host.scrollWidth || host.getBoundingClientRect().width);
                            let finalW = natural;
                            const maxW = Number(dataset.maxWidth) || undefined;
                            if (maxW && finalW > maxW) finalW = maxW;
                            if (finalW > 0) {
                                element.style.width = `${finalW}px`;
                                // Ensure we remain within canvas bounds
                                if (Number(elleft.value) + finalW + 10 > dialogW) {
                                    const newleft = String(Math.round(dialogW - finalW - 10));
                                    elleft.value = newleft;
                                    element.style.left = newleft + 'px';
                                }
                            } else {
                                element.style.width = original; // restore
                            }
                        } catch {}
                    }
                    break;
                case 'isVisible':
                    if (utils.isTrue(value)) {
                        element.classList.remove('design-hidden');
                    } else {
                        element.classList.add('design-hidden');
                    }
                    break;
                case 'isEnabled':
                    if (utils.isTrue(value)) {
                        element.classList.remove('disabled-div');
                    } else {
                        element.classList.add('disabled-div');
                    }
                    break;
                case 'isSelected':
                    if (customRadio) {
                        customRadio.setAttribute('aria-checked', String(value));
                        if (utils.isTrue(value)) {
                            customRadio.classList.add('selected');
                        } else {
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
                default:
                    break;
            }

            if (['left', 'top', 'width', 'height', 'nameid'].includes(key)) {
                const elprop = document.getElementById('el' + key) as HTMLInputElement;
                elprop.value = value;
            }

            if (dataset.type !== "Checkbox") {
                element.dataset[key] = value;
            } else {
                if (key == "width" || key == "height") {
                    element.dataset.size = value;
                } else {
                    element.dataset[key] = value;
                }
            }

            if (slider && handle) {
                renderutils.updateHandleStyle(handle, {...all, ...dataset});
            }
        });

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
        try { span.style.setProperty('-webkit-line-clamp', String(lineClamp)); } catch {}

        span.textContent = text;

        if (span.scrollHeight > span.offsetHeight) {
            button.title = text;
        } else {
            button.removeAttribute('title');
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
            handle.dataset.handleshape = obj.handleshape || 'triangle';
            handle.dataset.direction = obj.direction;
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
                handle.style.backgroundColor = obj.handleColor;
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
        if (!group) return [];
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
        try { group.remove(); } catch {}
        dialog.removeElement(groupId);
        return childIds;
    },

    // Create a persistent group from a list of element IDs; returns the new group id or null
    makeGroupFromSelection: function(ids: string[], persistent?: boolean) {
        try {
            if (!Array.isArray(ids) || ids.length < 2) return null;
            const els = ids
                .map(id => dialog.getElement(id))
                .filter((el): el is HTMLElement => Boolean(el));
            if (els.length < 2) return null;

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
            if (persistent) groupEl.dataset.persistent = 'true';

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
            try {
                const allRadio = els.length > 0 && els.every(el => el.dataset.type === 'Radio');
                if (allRadio) {
                    const groups = Array.from(new Set(els.map(el => el.dataset.group || '')));
                    if (groups.length === 1 && groups[0]) {
                        const desired = groups[0];
                        const existing = new Set(renderutils.getDialogInfo().elements);
                        let finalName = desired;
                        if (existing.has(finalName)) {
                            let i = 1;
                            while (existing.has(`${desired}${i}`)) i++;
                            finalName = `${desired}${i}`;
                        }
                        groupEl.dataset.nameid = finalName;
                    }
                }
            } catch {}

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
        if (outlineEl && outlineEl.parentElement) outlineEl.parentElement.removeChild(outlineEl);
        return null;
    },

    computeBounds: function(ids: string[]) {
        const els = (ids || []).map(id => dialog.getElement(id)).filter((el): el is HTMLElement => Boolean(el));
        if (!els || els.length === 0) return null;
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
        return { left, top, width, height };
    },

    moveElementsBy: function(ids: string[], dx: number, dy: number) {
        for (const id of ids) {
            const el = dialog.getElement(id) as HTMLElement | undefined;
            if (!el) continue;
            const currentLeft = Number(el.dataset.left ?? (parseInt(el.style.left || '0', 10) || 0));
            const currentTop = Number(el.dataset.top ?? (parseInt(el.style.top || '0', 10) || 0));
            const props: Record<string, number> = { left: currentLeft + dx, top: currentTop + dy };
            renderutils.updateElement(el, props as any);
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

    objViewClassValid: function (currentElement: HTMLElement) {
        const allobjs = new Set(
            Array.from(document.querySelectorAll<HTMLElement>('[data-obj-view-class]'))
            .map(el => el !== currentElement ? el.dataset.objViewClass! : null)
            .filter(id => id !== null)
        )
        return !allobjs.has('dataSet');
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
                case "Label":
                    // Apply to wrapper and let it cascade; also apply to inner if present
                    element.style.fontSize = fontSize + 'px';
                    if (inner) inner.style.fontSize = fontSize + 'px';
                    if (fontFamily) {
                        element.style.fontFamily = fontFamily;
                        if (inner) inner.style.fontFamily = fontFamily;
                    }
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
                default:
                    break;
            }
        }
    }
}
