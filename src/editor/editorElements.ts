import { v4 as uuidv4 } from 'uuid';
import { ElementsInterface } from './elements';
import { dialogContainer } from './dialogContainer';
import { util } from '../utils';
import { showMessageBox } from '../FrontToBackCommunication';
import { editor } from './editor';
export type editorElementsTypes = 'addButton' | 'addCheckbox' | 'addRadio' | 'addLabel' | 'addInput' | 'addSlider' | 'addSeparator' | 'addSelect' | 'addCounter' // | 'addContainer';

export interface EditorElementsInterface {
    nameidRecords: Record<string, number>;
    fontSize: number;
    fontFamily: string;
    maxWidth: number;
    maxHeight: number;
    setDefaults: (
        size: number,
        family: string,
        maxWidth: number,
        maxHeight: number
    ) => void;
    addButton: (
        dialog: HTMLDivElement,
        data: ElementsInterface["buttonElement"]
    ) => ElementsInterface["buttonElement"];
    addCheckbox: (
        dialog: HTMLDivElement,
        data: ElementsInterface["checkboxElement"]
    ) => ElementsInterface["checkboxElement"];
    addRadio: (
        dialog: HTMLDivElement,
        data: ElementsInterface["checkboxElement"]
    ) => ElementsInterface["checkboxElement"];
    addInput: (
        dialog: HTMLDivElement,
        data: ElementsInterface["inputElement"]
    ) => ElementsInterface["inputElement"];
    addLabel: (
        dialog: HTMLDivElement,
        data: ElementsInterface["labelElement"]
    ) => ElementsInterface["labelElement"];
    addSeparator: (
        dialog: HTMLDivElement,
        data: ElementsInterface["separatorElement"]
    ) => ElementsInterface["separatorElement"];
    addSelect: (
        dialog: HTMLDivElement,
        data: ElementsInterface["selectElement"]
    ) => ElementsInterface["selectElement"];
    addSlider: (
        dialog: HTMLDivElement,
        data: ElementsInterface["sliderElement"]
    ) => ElementsInterface["sliderElement"];
    addCounter: (
        dialog: HTMLDivElement,
        data: ElementsInterface["counterElement"]
    ) => ElementsInterface["counterElement"];
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
        util.setOnlyNumbers(["width", "height", "size", "space", "left", "top", "handlesize", "handlepos"]);
        util.setOnlyNumbersWithMinus(["startval", "maxval"]);
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
                const objid = obj.id;

                switch (key) {
                    case 'nameid':
                        if (util.nameidValidChange(value, button)) {
                            obj[key] = value;
                            button.dataset.nameid = value;
                        } else {
                            showMessageBox({
                                type: 'warning',
                                title: 'Notice',
                                message: 'Name already exists.'
                            });

                        }
                        break;
                    case 'label':
                        obj[key] = value;
                        button.innerText = value;
                        break;
                    case 'top':
                        if (value > editorElements.maxHeight) {
                            value = editorElements.maxHeight;
                        }
                        obj[key] = parseInt(value);
                        button.style.top = value + 'px';
                        break;
                    case 'left':
                        if (value > editorElements.maxWidth) {
                            value = editorElements.maxWidth;
                        }
                        obj[key] = parseInt(value);
                        // const el = document.getElementById("")
                        button.style.left = value + 'px';
                        break;
                    case 'color':
                        if (util.isValidColor(value)) {
                            obj[key] = value;
                            button.style.backgroundColor = value;
                        }
                        break;
                    case 'fontColor':
                        if (util.isValidColor(value)) {
                            obj[key] = value;
                            button.style.color = value;
                        }
                        break;
                    case 'isVisible':
                        obj[key] = value === 'true';
                        button.classList.add("design-hidden");
                        if (obj[key]) {
                            button.classList.remove("design-hidden");
                        }
                        break;
                    case 'isEnabled':
                        obj[key] = value === 'true';
                        button.classList.add("disabled-div");
                        if (obj[key]) {
                            button.classList.remove("disabled-div");
                        }
                        break;
                    default:
                        obj[key] = value;
                }

                const element = dialogContainer.getElement(objid);
                if (element) {
                    editor.editorEvents.emit('selectElement', element);
                }

                return true;
            }
        })

        const uuid = uuidv4();
        const nameid = util.makeNameID(data.type, editorElements.nameidRecords);

        const button = util.makeElement({
            type: data.type,
            uuid: uuid,
            nameid: nameid,
            top: data.top,
            left: data.left,
            label: data.label,
            isVisible: data.isVisible,
            isEnabled: data.isEnabled,
            color: data.color,
            fontColor: data.fontColor,
            fontFamily: editorElements.fontFamily,
            fontSize: editorElements.fontSize,
            maxWidth: editorElements.maxWidth,
            maxHeight: editorElements.maxHeight,
        });

        dataProxy.id = uuid;
        dataProxy.nameid = nameid;
        dataProxy.parentId = dialog.id;

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
                const objid = obj.id;

                switch (key) {
                    case 'nameid':
                        if (util.nameidValidChange(value, checkbox)) {
                            obj[key] = value;
                            checkbox.dataset.nameid = value;
                        } else {
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
                    case 'size':
                        obj[key] = parseInt(value);
                        checkbox.style.width = value + 'px';
                        checkbox.style.height = value + 'px';
                        break;
                    case 'color':
                        if (util.isValidColor(value)) {
                            obj[key] = value;
                            util.updateCheckboxColor(uuid, value);
                        }
                        break;
                    case 'isVisible':
                        obj[key] = value === 'true';
                        checkbox.classList.add("design-hidden");
                        if (obj[key]) {
                            checkbox.classList.remove("design-hidden");
                        }
                        break;
                    case 'isEnabled':
                        obj[key] = value === 'true';
                        checkbox.classList.add('disabled-div');
                        if (obj[key]) {
                            checkbox.classList.remove('disabled-div');
                        }
                        break;
                    case 'isChecked':
                        obj[key] = value === 'true';
                        document.getElementById("checkbox-" + uuid).setAttribute("aria-checked", value);
                        break;
                    default:
                        obj[key] = value;
                }

                const element = dialogContainer.getElement(objid);
                if (element) {
                    editor.editorEvents.emit('selectElement', element);
                }

                return true;
            }
        })

        const uuid = uuidv4();
        const nameid = util.makeNameID(data.type, editorElements.nameidRecords);

        const checkbox = util.makeElement({
            type: data.type,
            uuid: uuid,
            nameid: nameid,
            top: data.top,
            left: data.left,
            size: data.size,
            isVisible: data.isVisible,
            isEnabled: data.isEnabled,
            color: data.color
        });

        // in container
        dataProxy.id = uuid;
        dataProxy.nameid = nameid;
        dataProxy.parentId = dialog.id;

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
                const objid = obj.id;
                const rd = document.getElementById("radio-" + uuid) as HTMLElement;

                switch (key) {
                    case 'nameid':
                        if (util.nameidValidChange(value, radio)) {
                            obj[key] = value;
                            radio.dataset.nameid = value;
                        } else {
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
                        radio.classList.add("design-hidden");
                        if (obj[key]) {
                            radio.classList.remove("design-hidden");
                        }
                        break;
                    case 'isEnabled':
                        obj[key] = value === 'true';
                        radio.classList.add('disabled-div');
                        if (obj[key]) {
                            radio.classList.remove('disabled-div');
                        }
                        break;
                    case 'isSelected':
                        if (value === 'true') {
                            util.unselectRadioGroup(rd);
                        }
                        rd.setAttribute('aria-checked', value);
                        obj[key] = value === 'true';
                        break;
                    default:
                        obj[key] = value;
                }

                const element = dialogContainer.getElement(objid);
                if (element) {
                    editor.editorEvents.emit('selectElement', element);
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

        const nameid = util.makeNameID(data.type, editorElements.nameidRecords);
        dataProxy.nameid = nameid;
        radio.dataset.nameid = nameid;

        // on screen
        radio.id = uuid;

        // in container
        dataProxy.id = uuid;
        dataProxy.parentId = dialog.id;

        radio.classList.add('design-hidden');
        if (data.isVisible) {
            radio.classList.remove('design-hidden');
        }

        radio.classList.add('disabled-div');
        if (data.isEnabled) {
            radio.classList.remove('disabled-div');
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
                const objid = obj.id;

                switch (key) {
                    case 'nameid':
                        if (util.nameidValidChange(value, input)) {
                            obj[key] = value;
                            input.dataset.nameid = value;
                        } else {
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
                        obj[key] = value === 'true';
                        input.classList.add("design-hidden");
                        if (obj[key]) {
                            input.classList.remove("design-hidden");
                        }
                        break;
                    case 'isEnabled':
                        obj[key] = value === 'true';
                        input.classList.add('disabled-div');
                        if (obj[key]) {
                            input.classList.remove('disabled-div');
                        }
                        break;
                    default:
                        obj[key] = value;

                }

                const element = dialogContainer.getElement(objid);
                if (element) {
                    editor.editorEvents.emit('selectElement', element);
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

        const nameid = util.makeNameID(data.type, editorElements.nameidRecords);
        dataProxy.nameid = nameid;
        input.dataset.nameid = nameid;

        // on screen
        input.id = uuid;
        // in container
        dataProxy.id = uuid;
        dataProxy.parentId = dialog.id;

        input.classList.add('design-hidden');
        if (data.isVisible) {
            input.classList.remove('design-hidden');
        }

        input.classList.add('disabled-div');
        if (data.isEnabled) {
            input.classList.remove('disabled-div');
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
                        label.classList.add("design-hidden");
                        if (obj[key]) {
                            label.classList.remove("design-hidden");
                        }
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

        label.style.fontFamily = editorElements.fontFamily;
        label.style.fontSize = editorElements.fontSize + 'px';

        // on screen
        label.id = uuid;
        // in container
        dataProxy.id = uuid;
        dataProxy.parentId = dialog.id;

        label.classList.add("design-hidden");
        if (data.isVisible) {
            label.classList.remove("design-hidden");
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
                const objid = obj.id;

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
                        if (util.isValidColor(value)) {
                            obj[key] = value;
                            separator.style.backgroundColor = value;
                        }
                        break;
                    case 'direction':
                        obj[key] = value;
                        dialogContainer.updateProperties(
                            obj.id,
                            { width: String(obj["height"]), height: String(obj["width"]) }
                        );
                        break;
                    case 'isVisible':
                        obj[key] = value === 'true';
                        separator.classList.add("design-hidden");
                        if (obj[key]) {
                            separator.classList.remove("design-hidden");
                        }
                        break;
                    default:
                        obj[key] = value;
                }

                const element = dialogContainer.getElement(objid);
                if (element) {
                    editor.editorEvents.emit('selectElement', element);
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

        separator.classList.add("design-hidden");
        if (data.isVisible) {
            separator.classList.remove("design-hidden");
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
                const objid = obj.id;

                switch (key) {
                    case 'nameid':
                        if (util.nameidValidChange(value, select)) {
                            obj[key] = value;
                            select.dataset.nameid = value;
                        } else {
                            showMessageBox({
                                type: 'warning',
                                title: 'Notice',
                                message: 'Name already exists.'
                            });
                        }
                        break;
                    case 'top':
                        if (value > editorElements.maxHeight) {
                            value = editorElements.maxHeight;
                        }
                        obj[key] = parseInt(value);
                        select.style.top = value + 'px';
                        break;
                    case 'left':
                        obj[key] = parseInt(value);
                        select.style.left = value + 'px';
                        break;
                    case 'width':
                        if (value > editorElements.maxWidth) {
                            value = editorElements.maxWidth;
                        }
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
                        obj[key] = value === 'true';
                        select.classList.add("design-hidden");
                        if (obj[key]) {
                            select.classList.remove("design-hidden");
                        }
                        break;
                    case 'isEnabled':
                        obj[key] = value === 'true';
                        select.classList.add('disabled-div');
                        if (obj[key]) {
                            select.classList.remove('disabled-div');
                        }
                        break;
                    default:
                        obj[key] = value;
                }

                const element = dialogContainer.getElement(objid);
                if (element) {
                    editor.editorEvents.emit('selectElement', element);
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

        const nameid = util.makeNameID(data.type, editorElements.nameidRecords);
        dataProxy.nameid = nameid;
        select.dataset.nameid = nameid;

        // on screen
        select.id = uuid;
        // in container
        dataProxy.id = uuid;
        dataProxy.parentId = dialog.id;

        select.classList.add("design-hidden");
        if (data.isVisible) {
            select.classList.remove("design-hidden");
        }

        select.classList.add('disabled-div');
        if (data.isEnabled) {
            select.classList.remove('disabled-div');
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
                const objid = obj.id;

                switch (key) {
                    case 'nameid':
                        if (util.nameidValidChange(value, slider)) {
                            obj[key] = value;
                            slider.dataset.nameid = value;
                        } else {
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
                        if (util.isValidColor(value)) {
                            obj[key] = value;
                            slider.style.backgroundColor = value;
                        }
                        break;
                    case 'direction':
                        obj[key] = value;
                        dialogContainer.updateProperties(
                            obj.id,
                            { width: String(obj["height"]), height: String(obj["width"]) }
                        );
                        break;
                    case 'handlepos':
                        if (value < 0) {
                            value = 0;
                        } else if (value > 100) {
                            value = 100;
                        }
                        obj[key] = value;
                        break;
                    case 'handlesize':
                        obj[key] = value;
                        break;
                    case 'handleshape':
                        obj[key] = value;
                        break;
                    case 'handlecolor':
                        if (util.isValidColor(value)) {
                            obj[key] = value;
                        }
                        break;
                    case 'isVisible':
                        obj[key] = value === 'true';
                        slider.classList.add("design-hidden");
                        if (obj[key]) {
                            slider.classList.remove("design-hidden");
                        }
                        break;
                    case 'isEnabled':
                        obj[key] = value === 'true';
                        slider.classList.add('disabled-div');
                        if (obj[key]) {
                            slider.classList.remove('disabled-div');
                        }
                        break;
                    default:
                        obj[key] = value;
                }

                const element = dialogContainer.getElement(objid);
                if (element) {
                    editor.editorEvents.emit('selectElement', element);
                }

                util.updateHandleStyle(
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
        util.updateHandleStyle(
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

        const nameid = util.makeNameID(data.type, editorElements.nameidRecords);
        dataProxy.nameid = nameid;
        slider.dataset.nameid = nameid;

        // on screen
        slider.id = uuid;
        // in container
        dataProxy.id = uuid;
        dataProxy.parentId = dialog.id;

        slider.classList.add("design-hidden");
        if (data.isVisible) {
            slider.classList.remove("design-hidden");
        }

        slider.classList.add('disabled-div');
        if (data.isEnabled) {
            slider.classList.remove('disabled-div');
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
                const objid = obj.id;

                switch (key) {
                    case 'nameid':
                        if (util.nameidValidChange(value, counter)) {
                            obj[key] = value;
                            counter.dataset.nameid = value;
                        } else {
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
                    case 'color':
                        if (util.isValidColor(value)) {
                            obj[key] = value;
                            document.getElementById("counter-decrease-" + uuid).style.color = value;
                            document.getElementById("counter-increase-" + uuid).style.color = value;
                        }
                        break;
                    case 'space':
                        if (value < 0) {
                            value = 0;
                        }
                        obj[key] = parseInt(value);
                        document.getElementById("counter-value-" + uuid).style.padding = '0px ' + value + 'px';
                        break;
                    case 'startval':
                        if (value < obj["maxval"]) {
                            obj[key] = parseInt(value);
                            document.getElementById("counter-value-" + uuid).innerHTML = value;
                        }
                        break;
                    case 'maxval':
                        if (value > obj["startval"]) {
                            obj[key] = parseInt(value);
                        }
                        break;
                    case 'isVisible':
                        obj[key] = value === 'true';
                        counter.classList.add("design-hidden");
                        if (obj[key]) {
                            counter.classList.remove("design-hidden");
                        }
                        break;
                    case 'isEnabled':
                        obj[key] = value === 'true';
                        counter.classList.add("disabled-div");
                        if (obj[key]) {
                            counter.classList.remove("disabled-div");
                        }
                        break;
                    default:
                        obj[key] = value;
                }

                const element = dialogContainer.getElement(objid);
                if (element) {
                    editor.editorEvents.emit('selectElement', element);
                }

                return true;
            }
        })

        const uuid = uuidv4();
        const nameid = util.makeNameID(data.type, editorElements.nameidRecords);

        const counter = util.makeElement({
            type: data.type,
            uuid: uuid,
            nameid: nameid,
            top: data.top,
            startval: data.startval,
            left: data.left,
            color: data.color,
            space: data.space
        });

        dataProxy.id = uuid;
        dataProxy.nameid = nameid;
        dataProxy.parentId = dialog.id;

        dialog.appendChild(counter);
        return dataProxy;
    }
};


