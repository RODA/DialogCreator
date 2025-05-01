import { ipcRenderer } from "electron";
import { showMessage, global } from "./coms";
import { editorSettings } from './settings';
import { Editor } from '../interfaces/editor';
import { Elements } from '../interfaces/elements';
import { DialogProperties } from "../interfaces/dialog";
import { v4 as uuidv4 } from 'uuid';
import { dialog } from './dialog';
import { utils } from '../library/utils';

export const editor: Editor = {

    dialog: document.createElement('div'),
    dialogId: '',
    selectedElementId: '',
    storage: {
        nameidRecords: {},

        // defaults
        fontSize: 12,
        fontFamily: 'Arial, Helvetica, sans-serif',
        maxWidth: 615,
        maxHeight: 455,
    },

    make: (dialogdiv: HTMLDivElement) => {

        const newDialogID = uuidv4();
        editor.dialog.id = newDialogID;
        editor.dialogId = newDialogID;

        editor.dialog.style.position = 'relative';
        editor.dialog.style.width = editorSettings.dialog.width + 'px';
        editor.dialog.style.height = editorSettings.dialog.height + 'px';
        editor.dialog.style.backgroundColor = editorSettings.dialog.background || '#ffffff';
        editor.dialog.style.border = '1px solid gray';
        editor.dialog.addEventListener('click', (event: MouseEvent) => {
            if ((event.target as HTMLDivElement).id === editor.dialogId) {
                editor.deselectAll();
            }
        });
        editor.dialog.addEventListener("drop", (event: MouseEvent) => {
            event.preventDefault();
        });

        dialogdiv.append(editor.dialog);

        const properties: NodeListOf<HTMLInputElement> = document.querySelectorAll('#dialog-properties [id^="dialog"]');

        properties.forEach((item) => {
            const key = item.getAttribute('name') as keyof DialogProperties;
            if (key) {
                item.value = editorSettings.dialog[key] || '';
            }
        });

        dialog.properties = editorSettings.dialog;

    },

    updateDialogArea: function (properties) {

        // check for valid paper
        if (editor.dialogId !== '') {

            if (properties.width != dialog.properties.width) {
                editor.dialog.style.width =  properties.width + 'px';
            }

            if (properties.height != dialog.properties.height) {
                editor.dialog.style.height =  properties.height + 'px';
            }

            if (properties.fontSize != dialog.properties.fontSize) {
                // TODO: modify all elements that have font size

            }

            dialog.properties = properties;

        } else {
            // alert no dialog
            showMessage({ type: "info", message: "Please create a new dialog first.", title: "No dialog" });
        }

    },

    // called right after make
    drawAvailableElements: (window) => {
        const availableElements = Object.keys(global.elements);
            // .filter(str => str.startsWith("add"))
            // .map(str => str.slice(3));

        const ul = document.createElement('ul');
        ul.setAttribute('id', 'paperAvailableElements');
        for (const name of availableElements) {
            const li = document.createElement('li');
            li.setAttribute('id', uuidv4());
            li.textContent = name.charAt(0).toUpperCase() + name.substring(1, name.length - 7);
            // li.innerHTML = name;
            li.addEventListener('click', () => {
                if (window === "defaults") {
                    // TODO -- show the default properties
                    console.log('show default properties for name: ', name);
                } else if (window === "editor"){
                    const elementType = name as keyof Elements;
                    editor.addElementToDialog(
                        String(li.textContent),
                        global.elements[elementType],
                    );
                }
            });
            ul.appendChild(li);
        }
        return ul;
    },

    // add new element on dialog
    addElementToDialog: function (name, data) {
        if (data) {
            const element = utils.makeElement(data, editor.storage);
            element.dataset.type = name;
            element.dataset.parentId = editor.dialog.id;
            editor.dialog.appendChild(element);
            editor.addElementListeners(element);
            dialog.addElement(element);
        }
    },

    // add listener to the element
    addElementListeners(element) {
        element.addEventListener('click', (event) => {
            event.stopPropagation();
            editor.selectedElementId = element.id;
            if (!element.classList.contains('selectedElement')) {
                editor.deselectAll();
                element.classList.add('selectedElement');
            }
            // there is another emit on the "mousedown" event, this does it twice
            // editor.editorEvents.emit('selectElement', dialog.getElement(element.id));
        })

        editor.addDragAndDrop(element);
    },

    addDragAndDrop(element) {
        const dialogW = editor.dialog.getBoundingClientRect().width;
        const dialogH = editor.dialog.getBoundingClientRect().height;
        let top = 0;
        let left = 0;
        let elementWidth = 0;
        let elementHeight = 0;
        let offsetX: number = 0, offsetY: number = 0, isDragging = false, isMoved = false;
        const checkbox = element.dataset.type === 'Checkbox';

        // Event listeners for mouse down, move, and up events
        element.addEventListener('mousedown', (e) => {
            isDragging = true;
            if (!element.classList.contains('selectedElement')) {
                editor.deselectAll();
                element.classList.add('selectedElement');
                editor.selectedElementId = element.id;
                const type = dialog.getElement(element.id)?.dataset.type;
                if (!type) return;
                global.messenger.emit(
                    'selectElement',
                    element
                );
            }

            elementWidth = element.getBoundingClientRect().width;
            elementHeight = element.getBoundingClientRect().height;

            // Get the initial mouse position relative to the element
            if (element.parentElement) {
                offsetX = element.parentElement.getBoundingClientRect().left + Math.floor(elementWidth / 2);
                offsetY = element.parentElement.getBoundingClientRect().top + Math.floor(elementHeight / 2);
            }

            // Change cursor style while dragging
            element.style.cursor = 'grabbing';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            top = e.clientY - offsetY;
            left = e.clientX - offsetX;

            if (left + elementWidth + 10 > dialogW) { left = dialogW - elementWidth - 10; }
            if (left < 10) { left = 10; }

            if (top + elementHeight + 10 > dialogH) { top = dialogH - elementHeight - 10; }
            if (top < 10) { top = 10; }

            // Apply the new position
            top = Math.round(top);
            left = Math.round(left);
            element.style.left = left + 'px';
            element.style.top = top + 'px';
            isMoved = true;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;

            // Restore cursor style
            element.style.cursor = 'grab';
            if (isMoved) {
                if (checkbox) {
                    const size = Number(element.dataset.size);
                    if (top < 10 + size * 0.25) { top = 10 + size * 0.25; }
                }
                element.style.top = top + 'px';
                element.dataset.left = String(left);
                element.dataset.top = String(top);

                dialog.updateElementProperties(
                    element.id,
                    { top: String(top), left: String(left) }
                );

                isMoved = false; // position updated
            }
        });

        document.addEventListener('dragend', () => {
            console.log('dragend');
        });
    },

    deselectAll: function () {
        for (const element of editor.dialog.children) {
            // last element in the set should be the cover
            element.classList.remove('selectedElement')
        }
        editor.selectedElementId = '';
        editor.clearPropsList();
    },

    // updateElement(data) {
    //     if (editor.selectedElementId !== '') {
    //         dialog.updateElementProperties(editor.selectedElementId, data);
    //     }
    // },

    // remove element form paper and container
    removeSelectedElement() {
        // remove from dialog
        document.getElementById(editor.selectedElementId)?.remove();
        // remove from container
        dialog.removeElement(editor.selectedElementId);
        // clear element properties
        editor.clearPropsList();
    },

    // clear element props
    clearPropsList() {
        // clear data form
        const properties = document.querySelectorAll('#propertiesList [id^="el"]');

        properties.forEach(item => {
            (item as HTMLInputElement).value = '';
        });

        // hide props list
        document.getElementById('propertiesList')?.classList.add('hidden');
        document.querySelectorAll('#propertiesList .element-property').forEach(item => {
            item.classList.add('hidden-element');
        });

        // disable buttons
        (document.getElementById('removeElement') as HTMLButtonElement).disabled = true;
    },

    getElementFromContainer: function() {
        return dialog.getElement(editor.selectedElementId);
    },
}
