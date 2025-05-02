import { ipcRenderer } from "electron";
import { dialog } from '../modules/dialog';
import { editor } from '../modules/editor';
import { Utils } from '../interfaces/utils';
import { DialogProperties } from "../interfaces/dialog";
import { showError, global } from '../modules/coms';
import { v4 as uuidv4 } from 'uuid';
import * as path from "path";

export const utils: Utils = {
    getKeys: function(obj) {
        if (obj === null) return([]);
        return Object.keys(obj);
    },

    isNumeric: function (x) {
        if (utils.missing(x) || x === null || ("" + x).length == 0) {
            return false;
        }

        return (
            Object.prototype.toString.call(x) === "[object Number]" &&
            !isNaN(parseFloat("" + x)) &&
            isFinite(utils.asNumeric(x as string))
        )
    },

    possibleNumeric: function(x) {
        if (utils.isNumeric(x)) {
            return true;
        }

        if (utils.isNumeric("" + utils.asNumeric(x))) {
            return true;
        }

        return false;
    },

    isInteger: function (x) {
        return parseFloat("" + x) == parseInt("" + x, 10);
    },

    asNumeric: function(x) {
        return parseFloat("" + x);
    },

    asInteger: function(x) {
        return parseInt("" + x);
    },

    isTrue: function(x) {
        if (utils.missing(x) || utils.isNull(x)) {
            return false;
        }
        return (x === true || (typeof x === 'string' && (x === 'true' || x === 'True')));
    },

    isFalse: function(x) {
        if (utils.missing(x) || utils.isNull(x)) {
            return false;
        }
        return (x === false || (typeof x === 'string' && (x === 'false' || x === 'False')));
    },

    missing: function (x) {
        return x === void 0 || x === undefined;
    },

    exists: function (x) {
        return x !== void 0 && x !== undefined;
    },

    isNull: function(x) {
        return utils.exists(x) && x === null;
    },

    isElement: function (x, set) {
        if (
            utils.missing(x) ||
            utils.isNull(x) ||
            utils.missing(set) ||
            utils.isNull(set) ||
            set.length === 0
        ) {
            return false;
        }

        return set.indexOf(x) >= 0;
    },

    isNotElement: function (x, set) {
        if (
            utils.missing(x) ||
            utils.isNull(x) ||
            utils.missing(set) ||
            utils.isNull(set) ||
            set.length === 0
        ) {
            return false;
        }

        return set.indexOf(x) < 0;
    },

    unselectRadioGroup: function(element) {
        document.querySelectorAll(`[group="${element.getAttribute("group")}"]`).forEach(
            (radio) => {
                const id = radio.id.slice(6);
                dialog.elements[id].dataset.isSelected = 'false';
                radio.setAttribute('aria-checked', 'false');
            }
        );
    },

    makeNameID: function(type) {
        const existingIds = new Set(
            Array.from(document.querySelectorAll<HTMLElement>('[data-nameid]'))
                .map(el => el.dataset.nameid!)
        );

        type = type.toLowerCase();

        let candidate: string;
        let number = 1;
        do {
            candidate = `${type}${number++}`;
        } while (existingIds.has(candidate));

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
            oldValue: "",
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
            utils.setInputFilter(
                <HTMLInputElement>document.getElementById(prefix + item),
                function (value: string): boolean { return /^\d*$/.test(value); }
            );
        })
	},

	setOnlyNumbersWithMinus: function (items, prefix = 'el') {
        items.forEach((item) => {
            utils.setInputFilter(
                <HTMLInputElement>document.getElementById(prefix + item),
                function (value) { return /^-?\d*$/.test(value);}
            );
        });
	},

	setOnlyDouble: function (items, prefix = 'el') {
        items.forEach((item) => {
            const element = document.getElementById(prefix + item) as HTMLInputElement;
            utils.setInputFilter(
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

    isValidColor: function(value: string): boolean {
        const x = new Option().style;
        x.color = value;
        return x.color !== '';
    },

    makeElement: function(data) {
        if (typeof data !== 'object' || Array.isArray(data)) {
            showError('Invalid settings for this element.');
        }

        const uuid = uuidv4();
        const nameid = utils.makeNameID(data.type);

        let eltype = 'div';
        if (utils.isElement(data.type, ["Input", "Select"])) {
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

            const lineHeight = global.fontSize * 1.2;
            const paddingY = 3; // px
            const maxHeight = (lineHeight * data.lineClamp) + 3 * paddingY;
            element.style.maxHeight = maxHeight + 'px';

            const span = document.createElement('span');
            span.className = 'smart-button-text';
            span.style.fontFamily = global.fontFamily;
            /* --- textContent instead of innerHTML or innerText --- */
            span.textContent = data.label;

            element.appendChild(span);

            utils.updateButton(
                element as HTMLDivElement,
                data.label,
                global.fontSize,
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

            display.style.fontFamily = global.fontFamily;
            display.style.fontSize = global.fontSize + 'px';
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

            utils.updateHandleStyle(handle, data);

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

        if (utils.isNotElement(data.type, ["Counter", "Label"])) {
            data.nameid = nameid;
        }
        element.style.fontFamily = global.fontFamily;
        element.style.fontSize = global.fontSize + 'px';

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
        const dialogW = global.dialog.getBoundingClientRect().width;
        const dialogH = global.dialog.getBoundingClientRect().height;

        // const all: Record<string, any> = {... element.dataset, ... properties};
        const all: Record<string, any> = {... properties};
        const dataset = element.dataset;
        const checkbox = dataset.type === 'Checkbox';
        const counter = dataset.type === 'Counter';
        const radio = dataset.type === 'Radio';
        const select = dataset.type === 'Select';
        const slider = dataset.type === 'Slider';


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
                    if (!utils.nameidValidChange(value, element)) {
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
                    element.style.height = value + 'px';

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
                    break;
                case 'width':
                    if (Number(value) > dialogW - 20) {
                        value = String(Math.round(dialogW - 20));
                    }

                    if (select && Number(value) < 100) {
                        value = String(Math.round(100));
                    }
                    element.style.width = value + 'px';
                    if (Number(elleft.value) + Number(value) + 10 > dialogW) {
                        const newleft = String(Math.round(dialogW - Number(value) - 10));
                        elleft.value = newleft;
                        element.style.left = newleft + 'px';
                    }
                case 'maxWidth':
                    if (Number(value) > dialogW - 20) {
                        value = String(Math.round(dialogW - 20));
                        const maxWidth = document.getElementById('elmaxWidth') as HTMLInputElement;
                        maxWidth.value = value;
                    }
                    element.style[key] = value + 'px';
                    break;
                case 'lineClamp':
                    if (Number(value) > 3) {
                        value = String(3);
                        const lineClamp = document.getElementById('ellineClamp') as HTMLInputElement;
                        lineClamp.value = value;
                    }
                    const lineHeight = Number(dataset.fontSize) * 1.2;
                    const paddingY = 3; // px
                    const maxHeight = (lineHeight * value) + 3 * paddingY;
                    element.style.maxHeight = maxHeight + 'px';
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
                    element.style.color = value;
                    break;
                case 'fontSize':
                    element.style.fontSize = value + 'px';
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
                    element.style.width = width + 'px';
                    element.style.height = height + 'px';
                    elwidth.value = String(width);
                    elheight.value = String(height);
                    break;

                case 'value':
                    if (element instanceof HTMLInputElement) {
                        element.value = value;
                    } else if (element instanceof HTMLDivElement) {
                        element.textContent = value;
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
                utils.updateHandleStyle(handle, {...all, ...dataset});
            }
        });

    },

    addAvailableElementsTo: function(name) {
        const elementsList = document.getElementById(name);
        if (elementsList) {
            elementsList.innerHTML = '';
            // add available elements to the editor window
            elementsList.appendChild(editor.drawAvailableElements("editor"));

        } else {
            showError('Cound not find the element list in editor window. Please check the HTML!')
        }
    },

    addDefaultsButton: function() {
        const elementsList = document.getElementById('elementsList');
        if (elementsList) {
            const div = document.createElement('div');
            div.className = 'mt-1_5';
            const button = document.createElement('button');
            button.className = 'custombutton';
            button.innerText = 'Default values';
            button.setAttribute('type', 'button');
            button.style.width = '150px';
            button.addEventListener('click', function () {
                ipcRenderer.send(
                    'secondWindow',
                    {
                        width: 640,
                        height: 480,
                        backgroundColor: '#fff',
                        title: 'Default values',
                        file: 'defaults.html',
                        elements: global.elements,
                    }
                );
            });
            div.appendChild(button);
            elementsList.appendChild(div);
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
        span.style.webkitLineClamp = String(lineClamp); // Clamp to max lines

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
                    handle.style.borderBottom = (1.5 * Number(obj.handlesize)) + 'px solid ' + obj.handlecolor;
                    handle.style.left = obj.handlepos + "%";
                    handle.style.top = "100%";
                } else if (obj.direction === 'vertical') {
                    handle.style.borderTop = obj.handlesize + 'px solid transparent';
                    handle.style.borderBottom = obj.handlesize + 'px solid transparent';
                    handle.style.borderRight = (1.5 * Number(obj.handlesize)) + 'px solid ' + obj.handlecolor;
                    handle.style.left = "0%";
                    handle.style.top = (100 - Number(obj.handlepos)) + "%";
                }
                handle.style.width = '0px';
                handle.style.height = '0px';
            } else if (obj.handleshape === 'circle') {
                const radius = 1.5 * Number(obj.handlesize);
                handle.style.width = `${radius}px`;
                handle.style.height = `${radius}px`;
                handle.style.backgroundColor = obj.handlecolor;
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

    updateCheckboxColor: function(uuid, color) {
        const customCheckbox = document.querySelector(`#checkbox-${uuid}`) as HTMLElement;
        if (customCheckbox) {
            customCheckbox.style.setProperty('--checkbox-color', color);
        }
    },

    async handleEvent(eventName, ...args) {
        const handler = global.handlers[eventName];
        if (!handler) {
            console.error(`No handler for event: ${eventName}`);
            return;
        }
        try {
            let { module, functioname } = handler;
            const modulePath = path.join(__dirname, '../modules', module);

            const imported = await import(modulePath);

            const container = imported.defaults ?? imported;
            const func = container[functioname];

            if (typeof func === 'function') {
                return await func(...args);
            } else {
                console.error(`Function ${functioname} not found in module ${module}`);
            }
        } catch (error: any) {
            console.error(`Error handling ${eventName}: ${error.message}`);
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
            switch (dataset.type) {
                case "Input":
                case "Select":
                case "Label":
                    element.style.fontSize = fontSize + 'px';
                    if (fontFamily) {
                        element.style.fontFamily = fontFamily;
                    }
                    break;
                case "Button":
                    utils.updateButton(
                        element,
                        dataset.label || '',
                        fontSize,
                        Number(dataset.lineClamp) || 1,
                        Number(dataset.maxWidth) || 100
                    );
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
    },
}

