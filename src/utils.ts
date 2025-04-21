import { dialogContainer } from './editor/dialogContainer';
import { ElementsInterface } from './editor/elements';

interface UtilsInterface {
    getKeys(obj: Record<string, unknown>): Array<string>;
    isNumeric: (x: string) => boolean;
    possibleNumeric: (x: string) => boolean;
    isInteger: (x: number) => boolean;
    asNumeric(x: string): number;
    asInteger(x: string): number;
    isTrue: (x: boolean) => boolean;
    isFalse: (x: boolean) => boolean;
    missing: (x: unknown) => boolean;
    exists: (x: unknown) => boolean;
    isNull: (x: unknown) => boolean;
    isElement(x: string, set: string[]): boolean;
    unselectRadioGroup: (element: HTMLElement) => void;
    updateHandleStyle: (
        handle: HTMLDivElement,
        obj: ElementsInterface[keyof ElementsInterface]
    ) => void;
    makeNameID: (type: string, nameidRecords: Record<string, number>) => string;
    nameidValidChange: (newId: string, currentElement: HTMLElement) => boolean;
    updateCheckboxColor: (uuid: string, color: string) => void;
    setInputFilter: (textbox: HTMLElement, inputFilter: (value: string) => boolean) => void;
    setOnlyNumbers: (items: string[]) => void;
    setOnlyNumbersWithMinus: (items: string[]) => void;
    setOnlyDouble: (items: string[]) => void;
    isValidColor: (value: string) => boolean;
    makeElement: (
        data: ElementsInterface[keyof ElementsInterface],
        uuid: string,
        nameid?: string,
        fontSize?: number,
        fontFamily?: string
    ) => HTMLDivElement | HTMLInputElement;
    updateButton: (
        button: HTMLDivElement,
        text: string,
        fontSize: number,
        lineClamp: number,
        widthMax: number
    ) => void;
    objViewClassValid: (currentElement: HTMLElement) => boolean;
}

export const util: UtilsInterface = {

    getKeys: function(obj) {
        if (obj === null) return([]);
        return Object.keys(obj);
    },

    isNumeric: function (x) {
        if (util.missing(x) || x === null || ("" + x).length == 0) {
            return false;
        }

        return (
            Object.prototype.toString.call(x) === "[object Number]" &&
            !isNaN(parseFloat("" + x)) &&
            isFinite(util.asNumeric(x as string))
        )
    },

    possibleNumeric: function(x) {
        if (util.isNumeric(x)) {
            return true;
        }

        if (util.isNumeric("" + util.asNumeric(x))) {
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
        if (util.missing(x) || util.isNull(x)) {
            return false;
        }
        return (x === true);
    },

    isFalse: function(x) {
        if (util.missing(x) || util.isNull(x)) {
            return false;
        }
        return (x === false);
    },

    missing: function (x) {
        return x === void 0 || x === undefined;
    },

    exists: function (x) {
        return x !== void 0 && x !== undefined;
    },

    isNull: function(x) {
        return util.exists(x) && x === null;
    },

    isElement: function (x, set) {
        if (
            util.missing(x) ||
            util.isNull(x) ||
            util.missing(set) ||
            util.isNull(set) ||
            set.length === 0 ||
            set.indexOf(x) === -1
        ) {
            return false;
        }

        return true;
    },

    unselectRadioGroup: function(element) {
        document.querySelectorAll(`[group="${element.getAttribute("group")}"]`).forEach(
            (radio) => {
                const id = radio.id.slice(6);
                dialogContainer.elements[id].isSelected = false;
                radio.setAttribute('aria-checked', 'false');
            }
        );
    },

    updateHandleStyle: function(handle, obj) {
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

        // Update dataset (this triggers your CSS-based fallback if needed)
        handle.dataset.handleshape = obj.handleshape;
        handle.dataset.direction = obj.direction;

        // Now apply inline styles based on shape
        if (obj.handleshape === 'triangle') {
            if (obj.direction === 'horizontal') {
                handle.style.borderLeft = obj.handlesize + 'px solid transparent';
                handle.style.borderRight = obj.handlesize + 'px solid transparent';
                handle.style.borderBottom = (1.5 * obj.handlesize) + 'px solid ' + obj.handlecolor;
                handle.style.left = obj.handlepos + "%";
                handle.style.top = "100%";
            } else if (obj.direction === 'vertical') {
                handle.style.borderTop = obj.handlesize + 'px solid transparent';
                handle.style.borderBottom = obj.handlesize + 'px solid transparent';
                handle.style.borderRight = (1.5 * obj.handlesize) + 'px solid ' + obj.handlecolor;
                handle.style.left = "0%";
                handle.style.top = (100 - obj.handlepos) + "%";
            }
            handle.style.width = '0px';
            handle.style.height = '0px';
        } else if (obj.handleshape === 'circle') {
            const radius = 1.5 * obj.handlesize;
            handle.style.width = `${radius}px`;
            handle.style.height = `${radius}px`;
            handle.style.backgroundColor = obj.handlecolor;
            handle.style.borderRadius = '50%';
            if (obj.direction == "horizontal") {
                handle.style.left = obj.handlepos + "%";
                handle.style.top = "50%";
            } else {
                handle.style.left = "50%";
                handle.style.top = (100 - obj.handlepos) + "%";
            }
        }
    },

    makeNameID: function(type, nameidRecords) {
        const existingIds = new Set(
            Array.from(document.querySelectorAll<HTMLElement>('[data-nameid]'))
                .map(el => el.dataset.nameid!)
        );

        type = type.toLowerCase();

        if (!(type in nameidRecords)) {
            nameidRecords[type] = 1;
        }

        let candidate: string;
        do {
            candidate = `${type}${nameidRecords[type]++}`;
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

    updateCheckboxColor: function(uuid, color) {
        const customCheckbox = document.querySelector(`#checkbox-${uuid}`) as HTMLElement;
        if (customCheckbox) {
            customCheckbox.style.setProperty('--checkbox-color', color);
        }
    },

	setInputFilter: function (textbox, inputFilter) {
		// https://stackoverflow.com/questions/469357/html-text-input-allow-only-numeric-input
		// Restricts input for the given textbox to the given inputFilter function.
		["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function (event) {
			textbox.addEventListener(event, function () {
				if (inputFilter(this.value)) {
					this.oldValue = this.value;
					this.oldSelectionStart = this.selectionStart;
					this.oldSelectionEnd = this.selectionEnd;
					// TODO -- check next line if it is okay: https://eslint.org/docs/rules/no-prototype-builtins
				} else if (Object.prototype.hasOwnProperty.call(this, "oldValue")) {
					this.value = this.oldValue;
					this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
				} else {
					this.value = "";
				}
			});
		});
	},

	setOnlyNumbers: function (items) {
        items.forEach((item) => {
            util.setInputFilter(
                document.getElementById('el' + item),
                function (value: string): boolean { return /^\d*$/.test(value); }
            );
        })
	},

	setOnlyNumbersWithMinus: function (items) {
        items.forEach((item) => {
            util.setInputFilter(
                document.getElementById('el' + item),
                function (value) { return /^-?\d*$/.test(value);}
            );
        });
	},

	setOnlyDouble: function (items) {
        items.forEach((item) => {
            util.setInputFilter(
                document.getElementById(item),
                function (value) {
                    if (value.endsWith("..") || value.endsWith(".,")) {
                        const x = value.split("");
                        x.splice(-1);
                        value = x.join("");
                        (<HTMLInputElement>document.getElementById(item)).value = value;
                        return false;
                    }
                    if (value.endsWith(",")) {
                        const x = value.split("");
                        x.splice(-1);
                        x.push(".");
                        value = x.join("");
                        (<HTMLInputElement>document.getElementById(item)).value = value;
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

    makeElement: function(data, uuid, nameid, fontSize, fontFamily) {
        const eltype = data.type == "Input" ? "input" : "div";
        const element = document.createElement(eltype);
        element.id = uuid;

        element.style.position = 'absolute';
        element.style.top = data.top + 'px';
        element.style.left = data.left + 'px';

        element.style.position = 'absolute';
        element.style.top = data.top + 'px';
        element.style.left = data.left + 'px';

        if (data.type == "Button") {
            element.className = 'smart-button';
            element.style.backgroundColor = data.color;
            element.style.maxWidth = data.widthMax + 'px';

            const lineHeight = fontSize * 1.2;
            const paddingY = 3; // px
            const maxHeight = (lineHeight * data.lineClamp) + 3 * paddingY;
            element.style.maxHeight = maxHeight + 'px';

            const span = document.createElement('span');
            span.className = 'smart-button-text';
            span.style.fontFamily = fontFamily;
            /* --- textContent instead of innerHTML or innerText --- */
            span.textContent = data.label;

            element.appendChild(span);

            util.updateButton(
                element,
                data.label,
                fontSize,
                data.lineClamp,
                data.widthMax
            )
        } else if (data.type == "Input") {
            if (element instanceof HTMLInputElement) {
                element.type = 'text';
                element.value = data.value || '';
            }
            element.style.width = data.width + 'px';
            element.style.maxHeight = data.height + 'px';
            element.style.maxWidth = data.widthMax + 'px';
            element.style.fontFamily = fontFamily;
            element.style.fontSize = fontSize + 'px';
        } else if (data.type == "Select") {
            element.className = 'custom-select';
            element.style.width = data.width + 'px';
            element.style.padding = '3px';
            element.style.fontFamily = fontFamily;
            element.style.fontSize = fontSize + 'px';
        } else if (data.type == "Checkbox") {
            element.className = 'element-div';
            element.style.width = data.size + 'px';
            element.style.height = data.size + 'px';

            const customCheckbox = document.createElement('div');
            customCheckbox.id = "checkbox-" + data.uuid;
            customCheckbox.className = 'custom-checkbox';
            customCheckbox.setAttribute('role', 'checkbox');
            customCheckbox.setAttribute('tabindex', '0');
            customCheckbox.setAttribute('aria-checked', 'false');
            customCheckbox.style.setProperty('--checkbox-color', data.color);

            customCheckbox.addEventListener('click', () => {
                const isChecked = customCheckbox.getAttribute('aria-checked') === 'true';
                customCheckbox.setAttribute('aria-checked', isChecked ? "false" : "true");
            });

            const cover = document.createElement('div');
            cover.id = "cover-" + data.uuid;
            cover.className = 'cover';
            element.appendChild(customCheckbox);
            element.appendChild(cover);
        } else if (data.type == "Radio") {
            element.className = 'element-div';
            element.style.width = data.size + 'px';
            element.style.height = data.size + 'px';

            const customRadio = document.createElement('div');
            customRadio.id = "radio-" + data.uuid;
            customRadio.className = 'custom-radio';
            customRadio.setAttribute('role', 'radio');
            customRadio.setAttribute('tabindex', '0');
            customRadio.setAttribute('aria-checked', 'false');
            customRadio.setAttribute('group', data.group);

            const cover = document.createElement('div');
            cover.id = "cover-" + data.uuid;
            cover.className = 'cover';
            element.appendChild(customRadio);
            element.appendChild(cover);
        } else if (data.type == "Counter") {
            element.className = "counter-wrapper";

            const decrease = document.createElement("div");
            decrease.className = "counter-arrow down";
            decrease.innerHTML = "&#9654;"; // rotated in the CSS
            decrease.id = "counter-decrease-" + uuid;

            if (util.exists(data.color)) {
                decrease.style.color = data.color;
            }

            const display = document.createElement("div");
            display.className = "counter-value";
            display.id = "counter-value-" + uuid;
            display.textContent = String(data.startval);

            display.style.padding = '0px ' + data.space + 'px';
            display.dataset.nameid = nameid;

            if (util.exists(fontFamily)) {
                display.style.fontFamily = fontFamily;
            }

            if (util.exists(fontSize)) {
                display.style.fontSize = fontSize + 'px';
            }

            if (util.exists(data.fontColor)) {
                display.style.color = data.fontColor || '#000000';
            }

            const increase = document.createElement("div");
            increase.className = "counter-arrow up";
            increase.innerHTML = "&#9654;"; // rotated in the CSS
            increase.id = "counter-increase-" + uuid;

            if (util.exists(data.color)) {
                increase.style.color = data.color;
            }

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

            util.updateHandleStyle(
                handle,
                data
            );

        } else if (data.type == "Label") {
            element.textContent = data.value;
            element.style.fontFamily = fontFamily;
            element.style.fontSize = fontSize + 'px';
            element.style.color = data.fontColor || '#000000';
        } else if (data.type == "Separator") {
            element.className = 'separator';
            element.style.width = data.width + 'px';
            element.style.height = data.height + 'px';
            element.style.backgroundColor = data.color;
        } else if (data.type == "Container") {
            element.className = 'container';
            element.style.width = data.width + 'px';
            element.style.height = data.height + 'px';
            element.dataset.objViewClass = data.objViewClass;
        }

        // if (util.isElement(data.type, ["Button", "Checkbox"])) {
        if (!util.isElement(data.type, ["Counter", "Label"])) {
            element.dataset.nameid = nameid;
        }

        /* --- start for button, label ---*/
        if (util.exists(fontFamily)) {
            element.style.fontFamily = fontFamily;
        }

        if (util.exists(fontSize)) {
            element.style.fontSize = fontSize + 'px';
        }

        if (util.exists(data.fontColor)) {
            element.style.color = data.fontColor;
        }
        /* --- end for button, label ---*/

        if (util.isFalse(data.isVisible)) {
            element.classList.add('design-hidden');
        }

        if (util.isFalse(data.isEnabled)) {
            element.classList.add('disabled-div');
        }

        return element;
    },

    updateButton: function(
        button,
        text,
        fontSize,
        lineClamp,
        widthMax
    ) {
        button.style.maxWidth = widthMax + 'px';

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

    objViewClassValid: function (currentElement: HTMLElement) {
        const allobjs = new Set(
            Array.from(document.querySelectorAll<HTMLElement>('[data-obj-view-class]'))
            .map(el => el !== currentElement ? el.dataset.objViewClass! : null)
            .filter(id => id !== null)
        )
        return !allobjs.has('dataSet');
    }
}

