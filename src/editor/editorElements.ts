import { v4 as uuidv4 } from 'uuid';
import { ElementsInterface } from './elements';
import { dialogContainer } from './dialogContainer';
import { helpers } from '../helpers';
import { showMessageBox } from '../FrontToBackCommunication';
import { editor } from './editor';
export type editorElementsTypes = 'addButton' | 'addCheckbox' | 'addRadio' | 'addLabel' | 'addInput' | 'addSlider' | 'addSeparator' | 'addSelect' | 'addCounter' // | 'addContainer';

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
    addInput: (dialog: HTMLDivElement, data: ElementsInterface["inputElement"]) => ElementsInterface["inputElement"];
    addLabel: (dialog: HTMLDivElement, data: ElementsInterface["labelElement"]) => ElementsInterface["labelElement"];
    addSeparator: (dialog: HTMLDivElement, data: ElementsInterface["separatorElement"]) => ElementsInterface["separatorElement"];
    addSelect: (dialog: HTMLDivElement, data: ElementsInterface["selectElement"]) => ElementsInterface["selectElement"];
    addSlider: (dialog: HTMLDivElement, data: ElementsInterface["sliderElement"]) => ElementsInterface["sliderElement"];
    addCounter: (dialog: HTMLDivElement, data: ElementsInterface["counterElement"]) => ElementsInterface["counterElement"];
    // addContainer: (dialog: HTMLDivElement, data: elementsConfig.containerElementType) => void;
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
        if (typeof data !== 'object' || Array.isArray(data)) {
            return;
        }

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
                        if (editorElements.maxHeight >= value) {
                            obj[key] = parseInt(value);
                            button.style.top = value + 'px';
                        } else {
                            button.style.top = editorElements.maxHeight + 'px';
                        }
                        break;
                    case 'left':
                        obj[key] = parseInt(value);
                        button.style.left = value + 'px';
                        break;
                    case 'width':
                        obj[key] = parseInt(value);
                        button.style.width = value + 'px';
                        break;
                    case 'isVisible':
                    case 'isEnabled':
                        obj[key] = value === 'true';
                        break;
                    default:
                        obj[key] = value;

                }
                return true;
            }
        })

        const uuid = uuidv4();

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
        button.id = uuid;
        // in container
        dataProxy.id = uuid;
        dataProxy.parentId = dialog.id;

        const nameid = helpers.generateUniqueNameID(data.type, editorElements.nameidRecords);
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
    },

    // Add checkbox
    addCheckbox: function (dialog, data) {
        if (typeof data !== 'object' || Array.isArray(data)) {
            return;
        }

        const dataProxy = new Proxy({ ...data }, {
            set(obj, key: string, value) {
                const cb = document.getElementById("checkbox-" + uuid) as HTMLElement;
                const cover = document.getElementById("cover-" + uuid) as HTMLElement;

                switch (key) {
                    case 'nameid':
                        if (helpers.nameidValidChange(value, checkbox)) {
                            obj[key] = value;
                            checkbox.dataset.nameid = value;
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
                    case 'top':
                        if (editorElements.maxHeight >= value) {
                            obj[key] = parseInt(value);
                            checkbox.style.top = value + 'px';
                        } else {
                            checkbox.style.top = editorElements.maxHeight + 'px';
                        }
                        break;
                    case 'left':
                        obj[key] = parseInt(value);
                        checkbox.style.left = value + 'px';
                        break;
                    case 'isVisible':
                        obj[key] = value === 'true';
                        break;
                    case 'isEnabled':
                        obj[key] = value === 'true';
                        if (obj[key]) {
                            // checkbox.disabled = false;
                            cover.classList.remove('disabled-div');
                        } else {
                            // checkbox.disabled = true;
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

        const uuid = uuidv4();

        const checkbox = document.createElement('div');
        checkbox.className = 'element-div';

        // position
        checkbox.style.top = data.top + 'px';
        checkbox.style.left = data.left + 'px';
        checkbox.style.width = '13px';
        checkbox.style.height = '13px';

        // Create the custom checkbox
        const customCheckbox = document.createElement('div');
        customCheckbox.id = "checkbox-" + uuid;
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
        cover.id = "cover-" + uuid;
        cover.className = 'cover';
        // Append the cover to the custom checkbox

        const nameid = helpers.generateUniqueNameID(data.type, editorElements.nameidRecords);
        dataProxy.nameid = nameid;
        checkbox.dataset.nameid = nameid;

        checkbox.appendChild(customCheckbox);
        checkbox.appendChild(cover);

        // on screen
        checkbox.id = uuid;

        // in container
        dataProxy.id = uuid;
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
    },

    // Add radio button
    addRadio: function (dialog, data) {
        if (typeof data !== 'object' || Array.isArray(data)) {
            return;
        }

        const dataProxy = new Proxy({ ...data }, {
            set(obj, key: string, value) {
                const rd = document.getElementById("radio-" + uuid) as HTMLElement;
                const cover = document.getElementById("cover-" + uuid) as HTMLElement;

                switch (key) {
                    case 'nameid':
                        if (helpers.nameidValidChange(value, radio)) {
                            obj[key] = value;
                            radio.dataset.nameid = value;
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
                    case 'group':
                        obj[key] = value;
                        rd.setAttribute("group", value);
                        break;
                    case 'top':
                        if (editorElements.maxHeight >= value) {
                            obj[key] = parseInt(value);
                            radio.style.top = value + 'px';
                        } else {
                            radio.style.top = editorElements.maxHeight + 'px';
                        }
                        break;
                    case 'left':
                        obj[key] = parseInt(value);
                        radio.style.left = value + 'px';
                        break;
                    case 'isVisible':
                        obj[key] = value === 'true';
                        break;
                    case 'isEnabled':
                        obj[key] = value === 'true';
                        if (obj[key]) {
                            // radio.disabled = false;
                            cover.classList.remove('disabled-div');
                        } else {
                            // radio.disabled = true;
                            cover.classList.add('disabled-div');
                        }
                        break;
                    case 'isSelected':
                        if (value === 'true') {
                            helpers.unselectRadioGroup(rd);
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

        const uuid = uuidv4();

        const radio = document.createElement('div');
        radio.className = 'element-div';

        // position
        radio.style.top = data.top + 'px';
        radio.style.left = data.left + 'px';
        radio.style.width = '13px';
        radio.style.height = '13px';

        // Create the custom radio
        const customRadio = document.createElement('div');
        customRadio.id = "radio-" + uuid;
        customRadio.className = 'custom-radio';
        customRadio.setAttribute('role', 'radio');
        customRadio.setAttribute('tabindex', '0');
        customRadio.setAttribute('aria-checked', 'false');
        customRadio.setAttribute('group', data.group);

        // Create the cover div
        const cover = document.createElement('div');
        cover.id = "cover-" + uuid;
        cover.className = 'cover';
        // Append the cover to the custom radio
        customRadio.appendChild(cover);

        radio.appendChild(customRadio);

        const nameid = helpers.generateUniqueNameID(data.type, editorElements.nameidRecords);
        dataProxy.nameid = nameid;
        radio.dataset.nameid = nameid;

        // on screen
        radio.id = uuid;

        // in container
        dataProxy.id = uuid;
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
    },

    // Add Input
    addInput: function (dialog, data) {
        if (typeof data !== 'object' || Array.isArray(data)) {
            return;
        }

        const dataProxy = new Proxy({ ...data }, {
            set(obj, key: string, value) {

                switch (key) {
                    case 'nameid':
                        if (helpers.nameidValidChange(value, input)) {
                            obj[key] = value;
                            input.dataset.nameid = value;
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
                    case 'top':
                        if (editorElements.maxHeight >= value) {
                            obj[key] = parseInt(value);
                            input.style.top = value + 'px';
                        } else {
                            input.style.top = editorElements.maxHeight + 'px';
                        }
                        break;
                    case 'left':
                        obj[key] = parseInt(value);
                        if (input) {
                            input.style.left = value + 'px';
                        }
                        break;
                    case 'width':
                        obj[key] = parseInt(value);
                        if (input) {
                            input.style.width = value + 'px';
                        }
                        break;
                    case 'value':
                        obj[key] = value;
                        if (input) {
                            input.value = value;
                        }
                        break;
                    case 'isVisible':
                    case 'isEnabled':
                        obj[key] = value === 'true';
                        break;
                    default:
                        obj[key] = value;

                }
                return true;
            }
        })

        const uuid = uuidv4();

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

        const nameid = helpers.generateUniqueNameID(data.type, editorElements.nameidRecords);
        dataProxy.nameid = nameid;
        input.dataset.nameid = nameid;

        // on screen
        input.id = uuid;
        // in container
        dataProxy.id = uuid;
        dataProxy.parentId = dialog.id;

        if (!data.isVisible) {
            input.style.display = 'none';
        }
        if (!data.isEnabled) {
            input.disabled = true;
        }
        dialog.appendChild(input);
        return dataProxy;
    },

    // Add Label
    addLabel: function (dialog, data) {
        if (typeof data !== 'object' || Array.isArray(data)) {
            return;
        }

        const dataProxy = new Proxy({ ...data }, {
            set(obj, key: string, value) {

                switch (key) {
                    case 'top':
                        if (editorElements.maxHeight >= value) {
                            obj[key] = parseInt(value);
                            label.style.top = value + 'px';
                        } else {
                            label.style.top = editorElements.maxHeight + 'px';
                        }
                        break;
                    case 'left':
                        obj[key] = parseInt(value);
                        label.style.left = value + 'px';
                        break;
                    case 'width':
                        obj[key] = parseInt(value);
                        label.style.width = value + 'px';
                        break;
                    case 'value':
                        obj[key] = value;
                        label.innerText = value;
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

        const uuid = uuidv4();

        const label = document.createElement('div');

        // position
        label.style.position = 'absolute';
        label.style.top = data.top + 'px';
        label.style.left = data.left + 'px';
        label.innerText = data.value;

        label.style.maxWidth = editorElements.maxWidth + 'px';
        label.style.maxHeight = editorElements.maxHeight + 'px';

        label.style.fontFamily = editorElements.fontFamily;
        label.style.fontSize = editorElements.fontSize + 'px';

        // on screen
        label.id = uuid;
        // in container
        dataProxy.id = uuid;
        dataProxy.parentId = dialog.id;

        if (!data.isVisible) {
            label.style.display = 'none';
        }
        if (!data.isEnabled) {
            label.classList.add('disabled-div');
        }
        dialog.appendChild(label);
        return dataProxy;
    },

    // Add Separator
    addSeparator: function (dialog, data) {
        if (typeof data !== 'object' || Array.isArray(data)) {
            return;
        }

        const dataProxy = new Proxy({ ...data }, {
            set(obj, key: string, value) {

                switch (key) {
                    case 'top':
                        if (editorElements.maxHeight >= value) {
                            obj[key] = parseInt(value);
                            separator.style.top = value + 'px';
                        } else {
                            separator.style.top = editorElements.maxHeight + 'px';
                        }
                        break;
                    case 'left':
                        obj[key] = parseInt(value);
                        separator.style.left = value + 'px';
                        break;
                    case 'width':
                        obj[key] = parseInt(value);
                        separator.style.width = value + 'px';
                        break;
                    case 'height':
                        obj[key] = parseInt(value);
                        separator.style.height = value + 'px';
                        break;
                    case 'color':
                        obj[key] = value;
                        separator.style.backgroundColor = value;
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

        const uuid = uuidv4();

        const separator = document.createElement('div');
        separator.className = 'separator';

        // position
        separator.style.position = 'absolute';
        separator.style.top = data.top + 'px';
        separator.style.left = data.left + 'px';

        separator.style.width = data.width + 'px';
        separator.style.height = data.height + 'px';
        separator.style.maxWidth = editorElements.maxWidth + 'px';
        separator.style.maxHeight = editorElements.maxHeight + 'px';

        separator.style.backgroundColor = data.color + 'px';

        // on screen
        separator.id = uuid;
        // in container
        dataProxy.id = uuid;
        dataProxy.parentId = dialog.id;

        if (!data.isVisible) {
            separator.style.display = 'none';
        }
        dialog.appendChild(separator);
        return dataProxy;
    },

    // Add Select
    addSelect: function (dialog, data) {
        if (typeof data !== 'object' || Array.isArray(data)) {
            return;
        }

        const dataProxy = new Proxy({ ...data }, {
            set(obj, key: string, value) {

                switch (key) {
                    case 'nameid':
                        if (helpers.nameidValidChange(value, select)) {
                            obj[key] = value;
                            select.dataset.nameid = value;
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
                    case 'top':
                        if (editorElements.maxHeight >= value) {
                            obj[key] = parseInt(value);
                            select.style.top = value + 'px';
                        } else {
                            select.style.top = editorElements.maxHeight + 'px';
                        }
                        break;
                    case 'left':
                        obj[key] = parseInt(value);
                        select.style.left = value + 'px';
                        break;
                    case 'width':
                        obj[key] = parseInt(value);
                        select.style.width = value + 'px';
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
                        select.value = value;
                        break;
                    case 'isVisible':
                    case 'isEnabled':
                        obj[key] = value === 'true';
                        break;
                    default:
                        obj[key] = value;

                }
                return true;
            }
        })

        const uuid = uuidv4();

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

        const nameid = helpers.generateUniqueNameID(data.type, editorElements.nameidRecords);
        dataProxy.nameid = nameid;
        select.dataset.nameid = nameid;

        // on screen
        select.id = uuid;
        // in container
        dataProxy.id = uuid;
        dataProxy.parentId = dialog.id;

        if (!data.isVisible) {
            select.style.display = 'none';
        }
        if (!data.isEnabled) {
            select.disabled = true;
        }
        dialog.appendChild(select);
        return dataProxy;
    },

    // Add Separator
    addSlider: function (dialog, data) {
        if (typeof data !== 'object' || Array.isArray(data)) {
            return;
        }

        const dataProxy = new Proxy({ ...data }, {
            set(obj, key: string, value) {

                switch (key) {
                    case 'nameid':
                        if (helpers.nameidValidChange(value, slider)) {
                            obj[key] = value;
                            slider.dataset.nameid = value;
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
                    case 'top':
                        if (editorElements.maxHeight >= value) {
                            obj[key] = parseInt(value);
                            slider.style.top = value + 'px';
                        } else {
                            slider.style.top = editorElements.maxHeight + 'px';
                        }
                        break;
                    case 'left':
                        obj[key] = parseInt(value);
                        slider.style.left = value + 'px';
                        break;
                    case 'width':
                        obj[key] = parseInt(value);
                        slider.style.width = value + 'px';
                        break;
                    case 'height':
                        obj[key] = parseInt(value);
                        slider.style.height = value + 'px';
                        break;
                    case 'color':
                        obj[key] = value;
                        slider.style.backgroundColor = value;
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

        const uuid = uuidv4();

        const slider = document.createElement('div');
        slider.className = 'separator';

        const handle = document.createElement('div');
        handle.className = 'slider-handle';
        handle.id = 'slider-handle-' + uuid;
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

        const nameid = helpers.generateUniqueNameID(data.type, editorElements.nameidRecords);
        dataProxy.nameid = nameid;
        slider.dataset.nameid = nameid;

        // on screen
        slider.id = uuid;
        // in container
        dataProxy.id = uuid;
        dataProxy.parentId = dialog.id;

        if (!data.isVisible) {
            slider.style.display = 'none';
        }
        dialog.appendChild(slider);
        return dataProxy;
    },

    // Add Counter
    addCounter: function(dialog: HTMLDivElement, data: ElementsInterface["counterElement"]) {
        if (typeof data !== 'object' || Array.isArray(data)) {
            return;
        }

        const dataProxy = new Proxy({ ...data }, {
            set(obj, key: string, value) {

                switch (key) {
                    case 'nameid':
                        if (helpers.nameidValidChange(value, counter)) {
                            obj[key] = value;
                            counter.dataset.nameid = value;
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
                    case 'top':
                        if (editorElements.maxHeight >= value) {
                            obj[key] = parseInt(value);
                            counter.style.top = value + 'px';
                        } else {
                            counter.style.top = editorElements.maxHeight + 'px';
                        }
                        break;
                    case 'left':
                        obj[key] = parseInt(value);
                        counter.style.left = value + 'px';
                        break;
                    case 'space':
                        if (value < 0) {
                            value = 0;
                        }
                        obj[key] = parseInt(value);
                        editor.editorEvents.emit(
                            'selectElement',
                            dialogContainer.getElement(obj.id)
                        );
                        document.getElementById("counter-value-" + uuid).style.padding = '0px ' + value + 'px';
                        document.getElementById("counter-value-" + uuid).style.padding = '0px ' + value + 'px';
                        break;
                    case 'startval':
                        if (value >= obj["maxval"]) {
                            value = obj["maxval"] - 1;
                        }
                        obj[key] = parseInt(value);
                        editor.editorEvents.emit(
                            'selectElement',
                            dialogContainer.getElement(obj.id)
                        );
                        document.getElementById("counter-value-" + uuid).innerHTML = value;
                        break;
                    case 'maxval':
                        if (value <= obj["startval"]) {
                            value = obj["startval"] + 1;
                        }
                        obj[key] = parseInt(value);
                        editor.editorEvents.emit(
                            'selectElement',
                            dialogContainer.getElement(obj.id)
                        );
                        break;
                    case 'isVisible':
                    case 'isEnabled':
                        obj[key] = value === 'true';
                        break;
                    default:
                        obj[key] = value;
                }

                return true;
            }
        })

        const uuid = uuidv4();

        const counter = helpers.makeCounter(data.startval, uuid)

        // position
        counter.style.position = 'absolute';
        counter.style.top = data.top + 'px';
        counter.style.left = data.left + 'px';

        const nameid = helpers.generateUniqueNameID(data.type, editorElements.nameidRecords);
        dataProxy.nameid = nameid;
        counter.dataset.nameid = nameid;

        // on screen
        counter.id = uuid;
        // in container
        dataProxy.id = uuid;
        dataProxy.parentId = dialog.id;

        if (!data.isVisible) {
            counter.style.display = 'none';
        }
        dialog.appendChild(counter);
        return dataProxy;
    }
};


