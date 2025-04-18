import { v4 as uuidv4 } from 'uuid';
import { ElementsInterface } from './elements';
import { dialogContainer } from './dialogContainer';
import { helpers } from '../helpers';
import { showMessageBox } from '../FrontToBackCommunication';
import { editor } from './editor';
export type editorElementsTypes = 'addButton' | 'addCheckbox' | 'addRadio' | 'addLabel' |
    'addSeparator' | 'addSelect' // | 'addContainer' | 'addCounter' | 'addInput' | 'addSlider';

export interface EditorElementsInterface {
    nameidRecords: Record<string, number>;
    fontSize: number;
    fontFamily: string;
    maxWidth: number;
    maxHeight: number;
    setDefaults: (size: number, family: string, maxWidth: number, maxHeight: number) => void;
    addButton: (dialog: HTMLDivElement, data: ElementsInterface["buttonElement"]) => ElementsInterface["buttonElement"];
    addCheckbox: (dialog: HTMLDivElement, data: ElementsInterface["checkboxElement"]) => ElementsInterface["checkboxElement"];
    addRadio: (dialog: HTMLDivElement, data: ElementsInterface["checkboxElement"]) => ElementsInterface["checkboxElement"];
    // addContainer: (dialog: HTMLDivElement, data: elementsConfig.containerElementType) => void;
    // addCounter: (dialog: HTMLDivElement, data: elementsConfig.counterElementType) => void;
    addInput: (dialog: HTMLDivElement, data: ElementsInterface["inputElement"]) => ElementsInterface["inputElement"];
    addLabel: (dialog: HTMLDivElement, data: ElementsInterface["labelElement"]) => ElementsInterface["labelElement"];
    addSeparator: (dialog: HTMLDivElement, data: ElementsInterface["separatorElement"]) => ElementsInterface["separatorElement"];
    addSelect: (dialog: HTMLDivElement, data: ElementsInterface["selectElement"]) => ElementsInterface["selectElement"];
    addSlider: (dialog: HTMLDivElement, data: ElementsInterface["sliderElement"]) => ElementsInterface["sliderElement"];
    // [propName: string]: any;
}

export const editorElements: EditorElementsInterface = {
    nameidRecords: {},

    // defaults
    fontSize: 12,
    fontFamily: 'Arial, Helvetica, sans-serif',
    maxWidth: 615,
    maxHeight: 455,
    // TODO:
    // minWidth: 0,
    // minHeight: 0,

    // set default font size and family
    setDefaults: function (size, family, maxWidth, maxHeight) {
        editorElements.fontSize = size;
        editorElements.fontFamily = family;
        editorElements.maxWidth = maxWidth;
        editorElements.maxHeight = maxHeight;
    },
    // The elements
    // ==============================================
    // Add button
    addButton: function (dialog, data) {
        if (typeof data === 'object' && !Array.isArray(data)) {

            const buttonId = uuidv4();

            const dataProxy = new Proxy({ ...data }, {
                set(obj, key: string, value) {

                    switch (key) {
                        case 'nameid':
                            if (helpers.nameidValidChange(value, button)) {
                                obj[key] = value;
                                button.dataset.nameid = value;
                            } else {
                                editor.editorEvents.emit(
                                    'selectElement',
                                    dialogContainer.getElement(obj.id)
                                );
                                showMessageBox({
                                    type: 'warning',
                                    title: 'Notice',
                                    message: 'Name already exists.'
                                });

                            }
                            break;
                        case 'label':
                            button.innerText = value;
                            obj[key] = value;
                            break;
                        case 'top':
                            if (button && editorElements.maxHeight >= value) {
                                obj[key] = parseInt(value);
                                button.style.top = value + 'px';
                            } else {
                                button.style.top = editorElements.maxHeight + 'px';
                            }
                            break;
                        case 'left':
                            obj[key] = parseInt(value);
                            if (button) {
                                button.style.left = value + 'px';
                            }
                            break;
                        case 'width':
                            obj[key] = parseInt(value);
                            if (button) {
                                button.style.width = value + 'px';
                            }
                            break;
                        case 'isVisible':
                            obj[key] = value === 'true';
                            break;
                        case 'isEnabled':
                            obj[key] = value === 'true';
                            break;
                        default:
                            obj[key] = value;

                    }
                    return true;
                }
            })

            const button = document.createElement('button');
            // position
            button.style.position = 'absolute';
            button.style.top = data.top + 'px';
            button.style.left = data.left + 'px';
            button.style.width = data.width + 'px';
            // label
            button.innerText = data.label

            button.style.maxWidth = editorElements.maxWidth + 'px';
            button.style.maxHeight = editorElements.maxHeight + 'px';

            button.style.fontFamily = editorElements.fontFamily;
            button.style.fontSize = editorElements.fontSize + 'px';

            // on screen
            button.id = buttonId;
            // in container
            dataProxy.id = buttonId;
            dataProxy.parentId = dialog.id;

            const nameid = helpers.generateUniqueNameID("button", editorElements.nameidRecords);
            dataProxy.nameid = nameid;
            button.dataset.nameid = nameid;

            if (!data.isVisible) {
                button.style.display = 'none';
            }
            if (!data.isEnabled) {
                button.disabled = true;
            }
            dialog.appendChild(button);
            return dataProxy;
        } else {
            return;
        }
    },

    // Add checkbox
    addCheckbox: function (dialog, data) {
        if (typeof data === 'object' && !Array.isArray(data)) {

            const checkboxId = uuidv4();

            const dataProxy = new Proxy({ ...data }, {
                set(obj, key: string, value) {
                    const el = document.getElementById(checkboxId) as HTMLInputElement;
                    const cb = document.getElementById("checkbox-" + checkboxId) as HTMLElement;
                    const cover = document.getElementById("cover-" + checkboxId) as HTMLElement;

                    switch (key) {
                        case 'top':
                            if (el && editorElements.maxHeight >= value) {
                                obj[key] = parseInt(value);
                                el.style.top = value + 'px';
                            } else {
                                el.style.top = editorElements.maxHeight + 'px';
                            }
                            break;
                        case 'left':
                            obj[key] = parseInt(value);
                            if (el) {
                                el.style.left = value + 'px';
                            }
                            break;
                        case 'isVisible':
                            obj[key] = value === 'true';
                            break;
                        case 'isEnabled':
                            obj[key] = value === 'true';
                            if (obj[key]) {
                                // el.disabled = false;
                                cover.classList.remove('disabled-div');
                            } else {
                                // el.disabled = true;
                                cover.classList.add('disabled-div');
                            }
                            break;
                        case 'isChecked':
                            obj[key] = value === 'true';
                            cb.setAttribute("aria-checked", value);
                            break;
                        default:
                            obj[key] = value;
                    }

                    return true;
                }
            })

            const checkbox = document.createElement('div');
            checkbox.className = 'element-div';

            // position
            checkbox.style.top = data.top + 'px';
            checkbox.style.left = data.left + 'px';
            checkbox.style.width = '13px';
            checkbox.style.height = '13px';

            // Create the custom checkbox
            const customCheckbox = document.createElement('div');
            customCheckbox.id = "checkbox-" + checkboxId;
            customCheckbox.className = 'custom-checkbox';
            customCheckbox.setAttribute('role', 'checkbox');
            customCheckbox.setAttribute('tabindex', '0');
            customCheckbox.setAttribute('aria-checked', 'false');

            customCheckbox.addEventListener('click', () => {
                const isChecked = customCheckbox.getAttribute('aria-checked') === 'true';
                customCheckbox.setAttribute('aria-checked', isChecked ? "false" : "true");
            });

            // Create the cover div
            const cover = document.createElement('div');
            cover.id = "cover-" + checkboxId;
            cover.className = 'cover';
            // Append the cover to the custom checkbox

            checkbox.appendChild(customCheckbox);
            checkbox.appendChild(cover);

            // // create checkbox
            // const checkbox = document.createElement('input');
            // checkbox.type = 'checkbox';
            // // position
            // checkbox.style.position = 'absolute';
            // checkbox.style.top = data.top + 'px';
            // checkbox.style.left = data.left + 'px';

            // checkbox.style.fontFamily = editorElements.fontFamily;
            // checkbox.style.fontSize = editorElements.fontSize + 'px';

            // on screen
            checkbox.id = checkboxId;


            // in container
            dataProxy.id = checkboxId;
            dataProxy.parentId = dialog.id;

            if (!data.isVisible) {
                checkbox.style.display = 'none';
            }

            checkbox.classList.remove('disabled-div');
            if (!data.isEnabled) {
                checkbox.classList.add('disabled-div');
            }

            dialog.appendChild(checkbox);
            return dataProxy;
        } else {
            return;
        }
    },

    // Add radio button
    addRadio: function (dialog, data) {

        const unselectRadioGroup = function(element: HTMLElement) {
            document.querySelectorAll(`[group="${element.getAttribute("group")}"]`).forEach((radio) => {
                const id = radio.id.slice(6);
                dialogContainer.elements[id].isSelected = false;
                radio.setAttribute('aria-checked', 'false');
            });
        };

        if (typeof data === 'object' && !Array.isArray(data)) {

            const radioId = uuidv4();

            const dataProxy = new Proxy({ ...data }, {
                set(obj, key: string, value) {
                    const el = document.getElementById(radioId) as HTMLInputElement;
                    const rd = document.getElementById("radio-" + radioId) as HTMLElement;
                    const cover = document.getElementById("cover-" + radioId) as HTMLElement;

                    switch (key) {
                        case 'group':
                            obj[key] = value;
                            rd.setAttribute("group", value);
                            break;
                        case 'top':
                            if (el && editorElements.maxHeight >= value) {
                                obj[key] = parseInt(value);
                                el.style.top = value + 'px';
                            } else {
                                el.style.top = editorElements.maxHeight + 'px';
                            }
                            break;
                        case 'left':
                            obj[key] = parseInt(value);
                            if (el) {
                                el.style.left = value + 'px';
                            }
                            break;
                        case 'isVisible':
                            obj[key] = value === 'true';
                            break;
                        case 'isEnabled':
                            obj[key] = value === 'true';
                            if (obj[key]) {
                                // el.disabled = false;
                                cover.classList.remove('disabled-div');
                            } else {
                                // el.disabled = true;
                                cover.classList.add('disabled-div');
                            }
                            break;
                        case 'isSelected':
                            if (value === 'true') {
                                unselectRadioGroup(rd);
                            }
                            rd.setAttribute('aria-checked', value);
                            obj[key] = value === 'true';
                            break;
                        default:
                            obj[key] = value;
                    }

                    return true;
                }
            })

            const radio = document.createElement('div');
            radio.className = 'element-div';

            // position
            radio.style.top = data.top + 'px';
            radio.style.left = data.left + 'px';
            radio.style.width = '13px';
            radio.style.height = '13px';

            // Create the custom radio
            const customRadio = document.createElement('div');
            customRadio.id = "radio-" + radioId;
            customRadio.className = 'custom-radio';
            customRadio.setAttribute('role', 'radio');
            customRadio.setAttribute('tabindex', '0');
            customRadio.setAttribute('aria-checked', 'false');
            customRadio.setAttribute('group', data.group);

            // Create the cover div
            const cover = document.createElement('div');
            cover.id = "cover-" + radioId;
            cover.className = 'cover';
            // Append the cover to the custom radio
            customRadio.appendChild(cover);

            radio.appendChild(customRadio);

            // on screen
            radio.id = radioId;


            // in container
            dataProxy.id = radioId;
            dataProxy.parentId = dialog.id;

            if (!data.isVisible) {
                radio.style.display = 'none';
            }

            radio.classList.remove('disabled-div');
            if (!data.isEnabled) {
                radio.classList.add('disabled-div');
            }
            dialog.appendChild(radio);

            return dataProxy;
        } else {
            return;
        }
    },

    // Add Input
    addInput: function (dialog, data) {
        if (typeof data === 'object' && !Array.isArray(data)) {

            const inputId = uuidv4();

            const dataProxy = new Proxy({ ...data }, {
                set(obj, key: string, value) {

                    const el = document.getElementById(inputId) as HTMLInputElement;

                    switch (key) {
                        case 'top':
                            if (el && editorElements.maxHeight >= value) {
                                obj[key] = parseInt(value);
                                el.style.top = value + 'px';
                            } else {
                                el.style.top = editorElements.maxHeight + 'px';
                            }
                            break;
                        case 'left':
                            obj[key] = parseInt(value);
                            if (el) {
                                el.style.left = value + 'px';
                            }
                            break;
                        case 'width':
                            obj[key] = parseInt(value);
                            if (el) {
                                el.style.width = value + 'px';
                            }
                            break;
                        case 'value':
                            obj[key] = value;
                            if (el) {
                                el.value = value;
                            }
                            break;
                        case 'isVisible':
                            obj[key] = value === 'true';
                            break;
                        case 'isEnabled':
                            obj[key] = value === 'true';
                            break;
                        default:
                            obj[key] = value;

                    }
                    return true;
                }
            })

            const input = document.createElement('input');
            input.type = 'text';
            // position
            input.style.position = 'absolute';
            input.style.top = data.top + 'px';
            input.style.left = data.left + 'px';
            input.style.width = data.width + 'px';
            input.value = data.value;

            input.style.maxWidth = editorElements.maxWidth + 'px';
            input.style.maxHeight = editorElements.maxHeight + 'px';

            input.style.fontFamily = editorElements.fontFamily;
            input.style.fontSize = editorElements.fontSize + 'px';

            // on screen
            input.id = inputId;
            // in container
            dataProxy.id = inputId;
            dataProxy.parentId = dialog.id;

            if (!data.isVisible) {
                input.style.display = 'none';
            }
            if (!data.isEnabled) {
                input.disabled = true;
            }
            dialog.appendChild(input);
            return dataProxy;
        } else {
            return;
        }
    },

    // Add Label
    addLabel: function (dialog, data) {
        if (typeof data === 'object' && !Array.isArray(data)) {

            const inputId = uuidv4();

            const dataProxy = new Proxy({ ...data }, {
                set(obj, key: string, value) {

                    const el = document.getElementById(inputId) as HTMLInputElement;

                    switch (key) {
                        case 'top':
                            if (el && editorElements.maxHeight >= value) {
                                obj[key] = parseInt(value);
                                el.style.top = value + 'px';
                            } else {
                                el.style.top = editorElements.maxHeight + 'px';
                            }
                            break;
                        case 'left':
                            obj[key] = parseInt(value);
                            if (el) {
                                el.style.left = value + 'px';
                            }
                            break;
                        case 'width':
                            obj[key] = parseInt(value);
                            if (el) {
                                el.style.width = value + 'px';
                            }
                            break;
                        case 'value':
                            obj[key] = value;
                            if (el) {
                                el.innerText = value;
                            }
                            break;
                        case 'isVisible':
                            obj[key] = value === 'true';
                            break;
                        case 'isEnabled':
                            obj[key] = value === 'true';
                            break;
                        default:
                            obj[key] = value;

                    }
                    return true;
                }
            })

            const input = document.createElement('div');

            // position
            input.style.position = 'absolute';
            input.style.top = data.top + 'px';
            input.style.left = data.left + 'px';
            input.innerText = data.value;

            input.style.maxWidth = editorElements.maxWidth + 'px';
            input.style.maxHeight = editorElements.maxHeight + 'px';

            input.style.fontFamily = editorElements.fontFamily;
            input.style.fontSize = editorElements.fontSize + 'px';

            // on screen
            input.id = inputId;
            // in container
            dataProxy.id = inputId;
            dataProxy.parentId = dialog.id;

            if (!data.isVisible) {
                input.style.display = 'none';
            }
            if (!data.isEnabled) {
                input.classList.add('disabled-div');
            }
            dialog.appendChild(input);
            return dataProxy;
        } else {
            return;
        }
    },

    // Add Separator
    addSeparator: function (dialog, data) {
        if (typeof data === 'object' && !Array.isArray(data)) {

            const inputId = uuidv4();

            const dataProxy = new Proxy({ ...data }, {
                set(obj, key: string, value) {

                    const el = document.getElementById(inputId) as HTMLInputElement;

                    switch (key) {
                        case 'top':
                            if (el && editorElements.maxHeight >= value) {
                                obj[key] = parseInt(value);
                                el.style.top = value + 'px';
                            } else {
                                el.style.top = editorElements.maxHeight + 'px';
                            }
                            break;
                        case 'left':
                            obj[key] = parseInt(value);
                            if (el) {
                                el.style.left = value + 'px';
                            }
                            break;
                        case 'width':
                            obj[key] = parseInt(value);
                            if (el) {
                                el.style.width = value + 'px';
                            }
                            break;
                        case 'height':
                            obj[key] = parseInt(value);
                            if (el) {
                                el.style.height = value + 'px';
                            }
                            break;
                        case 'color':
                            obj[key] = value;
                            if (el) {
                                el.style.backgroundColor = value;
                            }
                            break;
                        case 'direction':
                            obj[key] = value;
                            dialogContainer.updateProperties(
                                obj.id,
                                { width: String(obj["height"]), height: String(obj["width"]) }
                            );
                            editor.editorEvents.emit(
                                'selectElement',
                                dialogContainer.getElement(obj.id)
                            );
                            break;
                        case 'isVisible':
                            obj[key] = value === 'true';
                            break;
                        default:
                            obj[key] = value;

                    }
                    return true;
                }
            })

            const input = document.createElement('div');
            input.className = 'separator';

            // position
            input.style.position = 'absolute';
            input.style.top = data.top + 'px';
            input.style.left = data.left + 'px';

            input.style.width = data.width + 'px';
            input.style.height = data.height + 'px';
            input.style.maxWidth = editorElements.maxWidth + 'px';
            input.style.maxHeight = editorElements.maxHeight + 'px';

            input.style.backgroundColor = data.color + 'px';

            // on screen
            input.id = inputId;
            // in container
            dataProxy.id = inputId;
            dataProxy.parentId = dialog.id;

            if (!data.isVisible) {
                input.style.display = 'none';
            }
            dialog.appendChild(input);
            return dataProxy;
        } else {
            return;
        }
    },

    // Add Input
    addSelect: function (dialog, data) {
        if (typeof data === 'object' && !Array.isArray(data)) {

            const selectId = uuidv4();

            const dataProxy = new Proxy({ ...data }, {
                set(obj, key: string, value) {

                    const el = document.getElementById(selectId) as HTMLSelectElement;

                    switch (key) {
                        case 'top':
                            if (el && editorElements.maxHeight >= value) {
                                obj[key] = parseInt(value);
                                el.style.top = value + 'px';
                            } else {
                                el.style.top = editorElements.maxHeight + 'px';
                            }
                            break;
                        case 'left':
                            obj[key] = parseInt(value);
                            if (el) {
                                el.style.left = value + 'px';
                            }
                            break;
                        case 'width':
                            obj[key] = parseInt(value);
                            if (el) {
                                el.style.width = value + 'px';
                            }
                            break;
                        case 'dataSource':
                            obj[key] = value;
                            /*
                            // This works and could be used, but it is very R specific and the
                            // Dialog Creator could theoretically be used for any other language
                            document.getElementById('eldataSource').dataset.savedValue = value;
                            if (value == "custom") {
                                document.getElementById('divRobjects').style.display = 'none';
                                document.getElementById('divalue').style.display = '';
                            } else {
                                document.getElementById('divRobjects').style.display = '';
                                document.getElementById('divalue').style.display = 'none';
                            }
                            */
                            break;
                        case 'value':
                            obj[key] = value;
                            if (el) {
                                el.value = value;
                            }
                            break;
                        case 'isVisible':
                            obj[key] = value === 'true';
                            break;
                        case 'isEnabled':
                            obj[key] = value === 'true';
                            break;
                        default:
                            obj[key] = value;

                    }
                    return true;
                }
            })

            const select = document.createElement('select');
            select.className = 'custom-select';

            // position
            select.style.position = 'absolute';
            select.style.top = data.top + 'px';
            select.style.left = data.left + 'px';
            select.style.width = data.width + 'px';
            select.style.padding = '3px';

            select.style.maxWidth = editorElements.maxWidth + 'px';
            select.style.maxHeight = editorElements.maxHeight + 'px';

            select.style.fontFamily = editorElements.fontFamily;
            select.style.fontSize = editorElements.fontSize + 'px';

            // on screen
            select.id = selectId;
            // in container
            dataProxy.id = selectId;
            dataProxy.parentId = dialog.id;

            if (!data.isVisible) {
                select.style.display = 'none';
            }
            if (!data.isEnabled) {
                select.disabled = true;
            }
            dialog.appendChild(select);
            return dataProxy;
        } else {
            return;
        }
    },

    // Add Separator
    addSlider: function (dialog, data) {
        if (typeof data === 'object' && !Array.isArray(data)) {

            const sliderId = uuidv4();

            const dataProxy = new Proxy({ ...data }, {
                set(obj, key: string, value) {

                    const el = document.getElementById(sliderId) as HTMLInputElement;

                    switch (key) {
                        case 'top':
                            if (el && editorElements.maxHeight >= value) {
                                obj[key] = parseInt(value);
                                el.style.top = value + 'px';
                            } else {
                                el.style.top = editorElements.maxHeight + 'px';
                            }
                            break;
                        case 'left':
                            obj[key] = parseInt(value);
                            if (el) {
                                el.style.left = value + 'px';
                            }
                            break;
                        case 'width':
                            obj[key] = parseInt(value);
                            if (el) {
                                el.style.width = value + 'px';
                            }
                            break;
                        case 'height':
                            obj[key] = parseInt(value);
                            if (el) {
                                el.style.height = value + 'px';
                            }
                            break;
                        case 'color':
                            obj[key] = value;
                            if (el) {
                                el.style.backgroundColor = value;
                            }
                            break;
                        case 'direction':
                            obj[key] = value;
                            dialogContainer.updateProperties(
                                obj.id,
                                { width: String(obj["height"]), height: String(obj["width"]) }
                            );
                            editor.editorEvents.emit(
                                'selectElement',
                                dialogContainer.getElement(obj.id)
                            );
                            break;
                        case 'handlepos':
                            if (value < 0) {
                                value = 0;
                            } else if (value > 100) {
                                value = 100;
                            }
                            obj[key] = value;
                            // if (obj["direction"] == "horizontal") {
                            //     handle.style.left = value + '%';
                            // } else {
                            //     handle.style.top = (100 - value) + '%';
                            // }
                            editor.editorEvents.emit(
                                'selectElement',
                                dialogContainer.getElement(obj.id)
                            );
                            break;
                        case 'handlesize':
                            obj[key] = value;
                            break;
                        case 'handleshape':
                            obj[key] = value;
                            break;
                        case 'handlecolor':
                            obj[key] = value;
                            break;
                        case 'isVisible':
                            obj[key] = value === 'true';
                            break;
                        default:
                            obj[key] = value;
                    }

                    helpers.updateHandleStyle(
                        handle,
                        obj["handleshape"],
                        obj["direction"],
                        obj["handlecolor"],
                        obj["handlesize"],
                        obj["handlepos"]
                    );

                    return true;
                }
            })

            const slider = document.createElement('div');
            slider.className = 'separator';
            const handle = document.createElement('div');
            handle.className = 'slider-handle';
            handle.id = 'slider-handle-' + sliderId;
            helpers.updateHandleStyle(
                handle,
                data.handleshape,
                data.direction,
                data.handlecolor,
                data.handlesize,
                data.handlepos
            );
            slider.appendChild(handle);

            // position
            slider.style.position = 'absolute';
            slider.style.top = data.top + 'px';
            slider.style.left = data.left + 'px';

            slider.style.width = data.width + 'px';
            slider.style.height = data.height + 'px';
            slider.style.maxWidth = editorElements.maxWidth + 'px';
            slider.style.maxHeight = editorElements.maxHeight + 'px';

            // slider.style.backgroundColor = data.color + 'px';

            // on screen
            slider.id = sliderId;
            // in container
            dataProxy.id = sliderId;
            dataProxy.parentId = dialog.id;

            if (!data.isVisible) {
                slider.style.display = 'none';
            }
            dialog.appendChild(slider);
            return dataProxy;
        } else {
            return;
        }
    },

    // Add container
    // addContainer: function (paper, data) {
    //     if (this.isObject(data)) {
    //         // data to int
    //         let dataLeft = parseInt(data.left);
    //         let dataTop = parseInt(data.top);

    //         // check for user input
    //         if (data.width < 50) { data.width = 50; }
    //         else if (data.width > paper.width - 15) { data.width = paper.width - 30; dataLeft = 15; }

    //         if (data.height < 50) { data.height = 50; }
    //         else if (data.height > paper.height - 15) { data.height = paper.height - 30; dataTop = 15; }

    //         let rect = paper.rect(dataLeft, dataTop, data.width, data.height).attr({ fill: "#ffffff", "stroke": "#5d5d5d", "stroke-width": 1 });

    //         if (data.isEnabled == 'false') {
    //             rect.attr({ fill: "#cccccc", stroke: "#848484" });
    //         }
    //         return rect;
    //     } else {
    //         return;
    //     }
    // },

    // Add counter
    // addCounter: function (paper, data) {
    //     if (this.isObject(data)) {
    //         // data to int
    //         let dataLeft = parseInt(data.left) + 24;
    //         let dataTop = parseInt(data.top) + 7;

    //         var txtanchor = "middle";
    //         let crtVal = data.startval;

    //         let textvalue = paper.text(dataLeft, dataTop, "" + data.startval)
    //             .attr({ "text-anchor": txtanchor, "font-size": editorElements.fontSize, "font-family": editorElements.fontFamily });

    //         let downsign = paper.path([
    //             ["M", dataLeft - 12 - parseInt(data.width) / 2, dataTop - 6],
    //             ["l", 12, 0],
    //             ["l", -6, 12],
    //             ["z"]
    //         ]).attr({ fill: "#eeeeee", "stroke-width": 1, stroke: "#5d5d5d" });

    //         let upsign = paper.path([
    //             ["M", dataLeft + parseInt(data.width) / 2, dataTop + 6],
    //             ["l", 12, 0],
    //             ["l", -6, -12],
    //             ["z"]
    //         ]).attr({ fill: "#eeeeee", "stroke-width": 1, stroke: "#5d5d5d" });

    //         // let down = paper.rect(dataLeft - 22, dataTop - 6, 15, 15)
    //         //     .attr({fill: "#fff", opacity: 0, stroke: "#000", "stroke-width": 1, cursor: "pointer"});

    //         // let up = paper.rect(dataLeft + 8, dataTop - 8, 15, 15)
    //         //     .attr({fill: "#fff", opacity: 0, stroke: "#000", "stroke-width": 1, cursor: "pointer"});

    //         if (data.isEnabled == 'false') {
    //             textvalue.attr({ fill: '#848484' });
    //             upsign.attr({ fill: "#cccccc", stroke: "#848484" });
    //             downsign.attr({ fill: "#cccccc", stroke: "#848484" });
    //         }

    //         let set = paper.set();

    //         set.push(textvalue, downsign, upsign);

    //         return set;
    //     } else {
    //         return;
    //     }
    // },

    // Add counter
    // addCounter: function (paper, data) {
    //     if (this.isObject(data)) {
    //         // data to int
    //         let dataLeft = parseInt(data.left) + 24;
    //         let dataTop = parseInt(data.top) + 7;

    //         var txtanchor = "middle";
    //         let crtVal = data.startval;

    //         let textvalue = paper.text(dataLeft, dataTop, "" + data.startval)
    //             .attr({ "text-anchor": txtanchor, "font-size": editorElements.fontSize, "font-family": editorElements.fontFamily });

    //         let downsign = paper.path([
    //             ["M", dataLeft - 12 - parseInt(data.width) / 2, dataTop - 6],
    //             ["l", 12, 0],
    //             ["l", -6, 12],
    //             ["z"]
    //         ]).attr({ fill: "#eeeeee", "stroke-width": 1, stroke: "#5d5d5d" });

    //         let upsign = paper.path([
    //             ["M", dataLeft + parseInt(data.width) / 2, dataTop + 6],
    //             ["l", 12, 0],
    //             ["l", -6, -12],
    //             ["z"]
    //         ]).attr({ fill: "#eeeeee", "stroke-width": 1, stroke: "#5d5d5d" });

    //         // let down = paper.rect(dataLeft - 22, dataTop - 6, 15, 15)
    //         //     .attr({fill: "#fff", opacity: 0, stroke: "#000", "stroke-width": 1, cursor: "pointer"});

    //         // let up = paper.rect(dataLeft + 8, dataTop - 8, 15, 15)
    //         //     .attr({fill: "#fff", opacity: 0, stroke: "#000", "stroke-width": 1, cursor: "pointer"});

    //         if (data.isEnabled == 'false') {
    //             textvalue.attr({ fill: '#848484' });
    //             upsign.attr({ fill: "#cccccc", stroke: "#848484" });
    //             downsign.attr({ fill: "#cccccc", stroke: "#848484" });
    //         }

    //         let set = paper.set();

    //         set.push(textvalue, downsign, upsign);

    //         return set;
    //     } else {
    //         return;
    //     }
    // },

    // Add slider
    // addSlider: function(paper, data)
    // {
    //     if( this.isObject(data) ) {

    //         // data to int
    //         let dataLeft = parseInt(data.left);
    //         let dataTop = parseInt(data.top);
    //         let dataWidth = parseInt(data.length);
    //         let dataVal = parseFloat(data.value);

    //         // check for user input
    //         if(dataLeft < 10 || dataLeft > paper.width - 10){ dataLeft = 10; }
    //         if(dataTop < 10 || dataTop > paper.height - 10){ dataTop = 10; }
    //         if(dataVal < 0) {
    //             dataVal = 0;
    //         } else if (dataVal > 1) {
    //             dataVal = 1;
    //         }

    //         // width to big
    //         if(dataWidth < 50) { dataWidth = 50; }
    //         else if(dataWidth > paper.width - 30) { dataWidth = paper.width - 30; dataLeft = 15;}

    //         let v = parseInt(dataWidth) + parseInt(dataLeft);

    //         let line = paper.path("M" + dataLeft + " " + dataTop + "L"+ v +" " + dataTop).attr({stroke: "#5d5d5d", "stroke-width": 1});

    //         let tLeft = dataLeft + (dataWidth * dataVal);
    //         let triangle = paper.path([
    //             ["M", tLeft - 6, dataTop + 13],
    //             ["l", 12, 0],
    //             ["l", -6, -12],
    //             ["z"]
    //         ]).attr({fill: "#eeeeee", "stroke-width": 1, stroke: "#5d5d5d"});


    //         if(data.isEnabled === 'false')
    //         {
    //             line.attr({stroke: '#848484'});
    //             triangle.attr({fill: "#cccccc", "stroke": "#cccccc"});
    //         }

    //         let set = paper.set();
    //         set.push( line, triangle );

    //         return set;

    //     } else {
    //         return;
    //     }
    // },

    // Helpers
    // ==============================================

};

