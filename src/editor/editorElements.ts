import { v4 as uuidv4 } from 'uuid';
import { dialogContainer } from './dialogContainer';
import { interfaces } from '../interfaces/editor';
import { utils } from '../library/utils';
import { showError } from '../communication';
import { editor } from './editor';


export const editorElements: interfaces['EditorElements'] = {
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
        utils.setOnlyNumbers(["width", "height", "size", "space", "left", "top", "handlesize", "handlepos"]);
        utils.setOnlyNumbersWithMinus(["startval", "maxval"]);
    },
    // The elements
    // ==============================================
    addButton: function (dialog, data) {
        if (typeof data !== 'object' || Array.isArray(data)) {
            return;
        }

        const dataProxy = new Proxy({ ...data }, {
            set(obj, key: string, value) {
                const objid = obj.id;

                switch (key) {
                    case 'nameid':
                        if (utils.nameidValidChange(value, button)) {
                            obj[key] = value;
                            button.dataset.nameid = value;
                        } else {
                            showError('Name already exists.');
                        }
                        break;
                    case 'label':
                        obj[key] = value;
                        utils.updateButton(
                            button as HTMLDivElement,
                            obj["label"],
                            editorElements.fontSize, // obj["fontSize"],
                            obj["lineClamp"],
                            obj["maxWidth"]
                        );
                        break;
                    case 'lineClamp':
                    case 'maxWidth':
                    case 'fontSize':
                        obj[key] = value;
                        utils.updateButton(
                            button as HTMLDivElement,
                            obj["label"],
                            editorElements.fontSize, // obj["fontSize"], // ?
                            obj["lineClamp"],
                            obj["maxWidth"]
                        );
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
                        if (utils.isValidColor(value)) {
                            obj[key] = value;
                            button.style.backgroundColor = value;
                        }
                        break;
                    case 'fontColor':
                        if (utils.isValidColor(value)) {
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
        const nameid = utils.makeNameID(data.type, editorElements.nameidRecords);

        const button = utils.makeElement(
            data,
            uuid,
            nameid,
            editorElements.fontSize,
            editorElements.fontFamily
        );

        dataProxy.id = uuid;
        dataProxy.nameid = nameid;
        dataProxy.parentId = dialog.id;

        dialog.appendChild(button);

        return dataProxy;
    },

    addInput: function (dialog, data) {
        if (typeof data !== 'object' || Array.isArray(data)) {
            return;
        }

        const dataProxy = new Proxy({ ...data }, {
            set(obj, key: string, value) {
                const objid = obj.id;

                switch (key) {
                    case 'nameid':
                        if (utils.nameidValidChange(value, input)) {
                            obj[key] = value;
                            input.dataset.nameid = value;
                        } else {
                            showError('Name already exists.');
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
                        if (input instanceof HTMLInputElement) {
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
        const nameid = utils.makeNameID(data.type, editorElements.nameidRecords);

        const input = utils.makeElement(
            data,
            uuid,
            nameid,
            editorElements.fontSize,
            editorElements.fontFamily
        );

        dataProxy.id = uuid;
        dataProxy.nameid = nameid;
        dataProxy.parentId = dialog.id;

        dialog.appendChild(input);
        return dataProxy;
    },

    addSelect: function (dialog, data) {
        if (typeof data !== 'object' || Array.isArray(data)) {
            return;
        }

        const dataProxy = new Proxy({ ...data }, {
            set(obj, key: string, value) {
                const objid = obj.id;

                switch (key) {
                    case 'nameid':
                        if (utils.nameidValidChange(value, select)) {
                            obj[key] = value;
                            select.dataset.nameid = value;
                        } else {
                            showError('Name already exists.');
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
                        if (select instanceof HTMLSelectElement) {
                            select.value = value;
                        }
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
        const nameid = utils.makeNameID(data.type, editorElements.nameidRecords);

        const select = utils.makeElement(
            data,
            uuid,
            nameid,
            editorElements.fontSize,
            editorElements.fontFamily
        );

        dataProxy.id = uuid;
        dataProxy.nameid = nameid;
        dataProxy.parentId = dialog.id;

        dialog.appendChild(select);
        return dataProxy;
    },

    addCheckbox: function (dialog, data) {
        if (typeof data !== 'object' || Array.isArray(data)) {
            return;
        }

        const dataProxy = new Proxy({ ...data }, {
            set(obj, key: string, value) {
                const objid = obj.id;

                switch (key) {
                    case 'nameid':
                        if (utils.nameidValidChange(value, checkbox)) {
                            obj[key] = value;
                            checkbox.dataset.nameid = value;
                        } else {
                            showError('Name already exists.');
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
                        if (utils.isValidColor(value)) {
                            obj[key] = value;
                            utils.updateCheckboxColor(uuid, value);
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
        const nameid = utils.makeNameID(data.type, editorElements.nameidRecords);

        const checkbox = utils.makeElement(
            data,
            uuid,
            nameid
        );

        // in container
        dataProxy.id = uuid;
        dataProxy.nameid = nameid;
        dataProxy.parentId = dialog.id;

        dialog.appendChild(checkbox);
        return dataProxy;
    },

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
                        if (utils.nameidValidChange(value, radio)) {
                            obj[key] = value;
                            radio.dataset.nameid = value;
                        } else {
                            showError('Name already exists.');
                        }
                        break;
                    case 'group':
                        obj[key] = value;
                        rd.setAttribute("group", value);
                        if (rd && rd.getAttribute('aria-checked') === 'true') {
                            utils.unselectRadioGroup(rd);
                            rd.setAttribute('aria-checked', 'true');
                        }
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
                    case 'size':
                        obj[key] = parseInt(value);
                        radio.style.width = value + 'px';
                        radio.style.height = value + 'px';
                        break;
                    case 'color':
                        if (utils.isValidColor(value)) {
                            obj[key] = value;
                            rd.style.setProperty('--radio-color', value);
                        }
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
                            utils.unselectRadioGroup(rd);
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
        const nameid = utils.makeNameID(data.type, editorElements.nameidRecords);

        const radio = utils.makeElement(
            data,
            uuid,
            nameid
        );

        dataProxy.nameid = nameid;
        dataProxy.id = uuid;
        dataProxy.parentId = dialog.id;
        dialog.appendChild(radio);

        return dataProxy;
    },

    addCounter: function(dialog: HTMLDivElement, data) {
        if (typeof data !== 'object' || Array.isArray(data)) {
            return;
        }

        const dataProxy = new Proxy({ ...data }, {
            set(obj, key: string, value) {
                const objid = obj.id;

                switch (key) {
                    case 'nameid':
                        if (utils.nameidValidChange(value, counter)) {
                            obj[key] = value;
                            counter.dataset.nameid = value;
                        } else {
                            showError('Name already exists.');
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
                        if (utils.isValidColor(value)) {
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
                            document.getElementById("counter-value-" + uuid).textContent = value;
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
        const nameid = utils.makeNameID(data.type, editorElements.nameidRecords);

        const counter = utils.makeElement(
            data,
            uuid,
            nameid
        );

        dataProxy.id = uuid;
        dataProxy.nameid = nameid;
        dataProxy.parentId = dialog.id;

        dialog.appendChild(counter);
        return dataProxy;
    },

    addSlider: function (dialog, data) {
        if (typeof data !== 'object' || Array.isArray(data)) {
            return;
        }

        const dataProxy = new Proxy({ ...data }, {
            set(obj, key: string, value) {
                const objid = obj.id;

                switch (key) {
                    case 'nameid':
                        if (utils.nameidValidChange(value, slider)) {
                            obj[key] = value;
                            slider.dataset.nameid = value;
                        } else {
                            showError('Name already exists.');
                        }
                        break;
                    case 'top':
                        if (value > editorElements.maxHeight) {
                            value = editorElements.maxHeight;
                        }
                        obj[key] = parseInt(value);
                        slider.style.top = value + 'px';
                        break;
                    case 'left':
                        obj[key] = parseInt(value);
                        slider.style.left = value + 'px';
                        break;
                    case 'width':
                        if (value > editorElements.maxWidth) {
                            value = editorElements.maxWidth;
                        }
                        obj[key] = parseInt(value);
                        slider.style.width = value + 'px';
                        break;
                    case 'height':
                        if (value > editorElements.maxHeight) {
                            value = editorElements.maxHeight;
                        }
                        obj[key] = parseInt(value);
                        slider.style.height = value + 'px';
                        break;
                    case 'color':
                        if (utils.isValidColor(value)) {
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
                        if (utils.isValidColor(value)) {
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

                utils.updateHandleStyle(
                    handle,
                    obj
                );

                return true;
            }
        })

        const uuid = uuidv4();
        const nameid = utils.makeNameID(data.type, editorElements.nameidRecords);

        const slider = utils.makeElement(
            data,
            uuid,
            nameid
        );

        const handle = slider.querySelector("#slider-handle-" + uuid) as HTMLDivElement;

        dataProxy.id = uuid;
        dataProxy.nameid = nameid;
        dataProxy.parentId = dialog.id;

        dialog.appendChild(slider);
        return dataProxy;
    },

    addLabel: function (dialog, data) {
        if (typeof data !== 'object' || Array.isArray(data)) {
            return;
        }

        const dataProxy = new Proxy({ ...data }, {
            set(obj, key: string, value) {

                switch (key) {
                    case 'top':
                        if (value > editorElements.maxHeight) {
                            value = editorElements.maxHeight;
                        }
                        // it cannot be < 0 because the input is set as
                        // numeric non negative, the minus sign is blocked
                        obj[key] = parseInt(value);
                        label.style.top = value + 'px';
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
                    // case 'fontSize':
                    //     obj[key] = value;
                    //     label.style.fontSize = value + 'px';
                    //     break;
                    case 'fontColor':
                        if (utils.isValidColor(value)) {
                            obj[key] = value;
                            label.style.color = value;
                        }
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

        const label = utils.makeElement(
            data,
            uuid,
            void 0,
            editorElements.fontSize,
            editorElements.fontFamily
        );

        dataProxy.id = uuid;
        dataProxy.parentId = dialog.id;

        dialog.appendChild(label);
        return dataProxy;
    },

    addSeparator: function (dialog, data) {
        if (typeof data !== 'object' || Array.isArray(data)) {
            return;
        }

        const dataProxy = new Proxy({ ...data }, {
            set(obj, key: string, value) {
                const objid = obj.id;

                switch (key) {
                    case 'top':
                        if (value > editorElements.maxHeight) {
                            value = editorElements.maxHeight;
                        }
                        obj[key] = parseInt(value);
                        separator.style.top = value + 'px';
                        break;
                    case 'left':
                        obj[key] = parseInt(value);
                        separator.style.left = value + 'px';
                        break;
                    case 'width':
                        if (value > editorElements.maxWidth) {
                            value = editorElements.maxWidth;
                        }
                        obj[key] = parseInt(value);
                        separator.style.width = value + 'px';
                        break;
                    case 'height':
                        if (value > editorElements.maxHeight) {
                            value = editorElements.maxHeight;
                        }
                        obj[key] = parseInt(value);
                        separator.style.height = value + 'px';
                        break;
                    case 'color':
                        if (utils.isValidColor(value)) {
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

        const separator = utils.makeElement(data, uuid);

        dataProxy.id = uuid;
        dataProxy.parentId = dialog.id;

        dialog.appendChild(separator);
        return dataProxy;
    },

    addContainer: function(dialog: HTMLDivElement, data) {
        if (typeof data !== 'object' || Array.isArray(data)) {
            return;
        }

        const dataProxy = new Proxy({ ...data }, {
            set(obj, key: string, value) {
                const objid = obj.id;

                switch (key) {
                    case 'nameid':
                        if (utils.nameidValidChange(value, container)) {
                            obj[key] = value;
                            container.dataset.nameid = value;
                        } else {
                            showError('Name already exists.');
                        }
                        break;
                    case 'top':
                        if (value > editorElements.maxHeight) {
                            value = editorElements.maxHeight;
                        }
                        obj[key] = parseInt(value);
                        container.style.top = value + 'px';
                        break;
                    case 'left':
                        obj[key] = parseInt(value);
                        container.style.left = value + 'px';
                        break;
                    case 'width':
                        if (value > editorElements.maxWidth) {
                            value = editorElements.maxWidth;
                        }
                        obj[key] = parseInt(value);
                        container.style.width = value + 'px';
                        break;
                    case 'height':
                        if (value > editorElements.maxHeight) {
                            value = editorElements.maxHeight;
                        }
                        obj[key] = parseInt(value);
                        container.style.height = value + 'px';
                        break;
                    case 'objViewClass':
                        if (utils.objViewClassValid(container)) {
                            obj[key] = value;
                            container.dataset.objViewClass = value;
                        } else {
                            showError('Only one container per dialog can hold datasets.');
                        }
                        break;
                    case 'isEnabled':
                        obj[key] = value === 'true';
                        container.classList.add("disabled-div");
                        if (obj[key]) {
                            container.classList.remove("disabled-div");
                        }
                        break;
                    case 'isVisible':
                        obj[key] = value === 'true';
                        container.classList.add("design-hidden");
                        if (obj[key]) {
                            container.classList.remove("design-hidden");
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
        const nameid = utils.makeNameID(data.type, editorElements.nameidRecords);

        const container = utils.makeElement(
            data,
            uuid,
            nameid
        );

        dataProxy.id = uuid;
        dataProxy.nameid = nameid;
        dataProxy.parentId = dialog.id;

        dialog.appendChild(container);
        return dataProxy;
    }
};
