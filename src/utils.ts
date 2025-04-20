import { dialogContainer } from './editor/dialogContainer';

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
        shape: string,
        direction: string,
        color: string,
        size: number,
        position: number
    ) => void;
    makeNameID: (type: string, nameidRecords: Record<string, number>) => string;
    nameidValidChange: (newId: string, currentElement: HTMLElement) => boolean;
    updateCheckboxColor: (uuid: string, color: string) => void;
    setInputFilter: (textbox: HTMLElement, inputFilter: (value: string) => boolean) => void;
    setOnlyNumbers: (items: string[]) => void;
    setOnlyNumbersWithMinus: (items: string[]) => void;
    setOnlyDouble: (items: string[]) => void;
    isValidColor: (value: string) => boolean;
    makeElement: (options: {
        type: string;
        uuid: string;
        nameid: string;
        left: number;
        top: number;
        startval?: number;
        space?: number;
        width?: number;
        widthMax?: number;
        lineClamp?:number;
        height?: number;
        size?: number;
        color?: string;
        label?: string;
        isVisible?: boolean;
        isEnabled?: boolean;
        fontColor?: string;
        fontFamily?: string;
        fontSize?: number;
        maxWidth?: number;
        maxHeight?: number;
    }) => HTMLDivElement;
    updateButton: (
        button: HTMLDivElement,
        text: string,
        fontSize: number,
        lineClamp: number,
        widthMax: number
    ) => void;
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

    updateHandleStyle: function(
        handle,
        shape,
        direction,
        color,
        size,
        position
    ) {
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
        handle.dataset.shape = shape;
        handle.dataset.direction = direction;

        // Now apply inline styles based on shape
        if (shape === 'triangle') {
            if (direction === 'horizontal') {
                handle.style.borderLeft = size + 'px solid transparent';
                handle.style.borderRight = size + 'px solid transparent';
                handle.style.borderBottom = (1.5 * size) + 'px solid ' + color;
                handle.style.left = position + "%";
                handle.style.top = "100%";
            } else if (direction === 'vertical') {
                handle.style.borderTop = size + 'px solid transparent';
                handle.style.borderBottom = size + 'px solid transparent';
                handle.style.borderRight = (1.5 * size) + 'px solid ' + color;
                handle.style.left = "0%";
                handle.style.top = (100 - position) + "%";
            }
            handle.style.width = '0px';
            handle.style.height = '0px';
        } else if (shape === 'circle') {
            const radius = 1.5 * size;
            handle.style.width = `${radius}px`;
            handle.style.height = `${radius}px`;
            handle.style.backgroundColor = color;
            handle.style.borderRadius = '50%';
            if (direction == "horizontal") {
                handle.style.left = position + "%";
                handle.style.top = "50%";
            } else {
                handle.style.left = "50%";
                handle.style.top = (100 - position) + "%";
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

    makeElement: function(options) {
        const element = document.createElement("div");
        element.id = options.uuid;

        element.style.position = 'absolute';
        element.style.top = options.top + 'px';
        element.style.left = options.left + 'px';

        if (options.type == "Counter") {
            element.className = "counter-wrapper";

            const decrease = document.createElement("div");
            decrease.className = "counter-arrow down";
            decrease.innerHTML = "&#9654;";
            decrease.id = "counter-decrease-" + options.uuid;

            if (util.exists(options.color)) {
                decrease.style.color = options.color;
            }

            const display = document.createElement("div");
            display.className = "counter-value";
            display.id = "counter-value-" + options.uuid;
            display.textContent = String(options.startval);

            display.style.padding = '0px ' + options.space + 'px';
            display.dataset.nameid = options.nameid;

            if (util.exists(options.fontFamily)) {
                display.style.fontFamily = options.fontFamily;
            }

            if (util.exists(options.fontSize)) {
                display.style.fontSize = options.fontSize + 'px';
            }

            if (util.exists(options.fontColor)) {
                display.style.color = options.fontColor || '#000000';
            }

            const increase = document.createElement("div");
            increase.className = "counter-arrow up";
            increase.innerHTML = "&#9654;";
            increase.id = "counter-increase-" + options.uuid;

            if (util.exists(options.color)) {
                increase.style.color = options.color;
            }

            element.appendChild(decrease);
            element.appendChild(display);
            element.appendChild(increase);
        } else if (options.type == "Button") {
            element.className = 'smart-button';
            element.style.backgroundColor = options.color;
            element.style.maxWidth = options.widthMax + 'px';

            const lineHeight = options.fontSize * 1.2;
            const paddingY = 3; // px
            const maxHeight = (lineHeight * options.lineClamp) + 3 * paddingY;
            element.style.maxHeight = maxHeight + 'px';

            const span = document.createElement('span');
            span.className = 'smart-button-text';
            span.style.fontFamily = options.fontFamily;
            /* --- textContent instead of innerHTML or innerText --- */
            span.textContent = options.label;

            element.appendChild(span);

            util.updateButton(
                element,
                options.label,
                options.fontSize,
                options.lineClamp,
                options.widthMax
            )
        } else if (options.type == "Checkbox") {
            element.className = 'element-div';
            element.style.width = options.size + 'px';
            element.style.height = options.size + 'px';

            const customCheckbox = document.createElement('div');
            customCheckbox.id = "checkbox-" + options.uuid;
            customCheckbox.className = 'custom-checkbox';
            customCheckbox.setAttribute('role', 'checkbox');
            customCheckbox.setAttribute('tabindex', '0');
            customCheckbox.setAttribute('aria-checked', 'false');
            customCheckbox.style.setProperty('--checkbox-color', options.color);

            customCheckbox.addEventListener('click', () => {
                const isChecked = customCheckbox.getAttribute('aria-checked') === 'true';
                customCheckbox.setAttribute('aria-checked', isChecked ? "false" : "true");
            });

            const cover = document.createElement('div');
            cover.id = "cover-" + options.uuid;
            cover.className = 'cover';
            element.appendChild(customCheckbox);
            element.appendChild(cover);
        }

        // if (util.isElement(options.type, ["Button", "Checkbox"])) {
        if (!util.isElement(options.type, ["Counter"])) {
            element.dataset.nameid = options.nameid;
        }

        /* --- start for button, label ---*/
        if (util.exists(options.fontFamily)) {
            element.style.fontFamily = options.fontFamily;
        }

        if (util.exists(options.fontSize)) {
            element.style.fontSize = options.fontSize + 'px';
        }

        if (util.exists(options.fontColor)) {
            element.style.color = options.fontColor;
        }
        /* --- end for button, label ---*/

        if (util.isFalse(options.isVisible)) {
            element.classList.add('design-hidden');
        }

        if (util.isFalse(options.isEnabled)) {
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
    }
}

