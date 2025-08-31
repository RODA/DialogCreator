import { showMessage, showError, global } from "./coms";
import { editorSettings } from './settings';
import { Editor } from '../interfaces/editor';
import { Elements, AnyElement } from '../interfaces/elements';
import { elements } from './elements';
import { DialogProperties } from "../interfaces/dialog";
import { v4 as uuidv4 } from 'uuid';
import { dialog } from './dialog';
import { renderutils } from '../library/renderutils';
import { utils } from '../library/utils';

export const editor: Editor = {

    makeDialog: () => {

        const newDialogID = uuidv4();
        dialog.canvas.id = newDialogID;
        dialog.id = newDialogID;

        dialog.canvas.style.position = 'relative';
        dialog.canvas.style.width = editorSettings.dialog.width + 'px';
        dialog.canvas.style.height = editorSettings.dialog.height + 'px';
        dialog.canvas.style.backgroundColor = editorSettings.dialog.background || '#ffffff';
        dialog.canvas.style.border = '1px solid gray';
        dialog.canvas.addEventListener('click', (event: MouseEvent) => {
            if ((event.target as HTMLDivElement).id === dialog.id) {
                editor.deselectAll();
            }
        });
        dialog.canvas.addEventListener("drop", (event: MouseEvent) => {
            event.preventDefault();
        });

        const dialogdiv = document.getElementById('dialog') as HTMLDivElement;
        if (dialogdiv) {
            dialogdiv.append(dialog.canvas);
        }

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
        if (dialog.id !== '') {

            if (properties.width != dialog.properties.width) {
                dialog.canvas.style.width =  properties.width + 'px';
            }

            if (properties.height != dialog.properties.height) {
                dialog.canvas.style.height =  properties.height + 'px';
            }

            if (properties.fontSize != dialog.properties.fontSize) {
                // TODO: modify all elements that have font size

            }

            dialog.properties = properties;

        } else {
            // alert no dialog
            showMessage(
                "info",
                "No dialog",
                "Please create a new dialog first."
            );
        }

    },

    addAvailableElementsTo: function(window) {
        const elementsList = document.getElementById('elementsList');
        if (elementsList) {
            elementsList.innerHTML = '';

            const availableElements = Object.keys(elements);

            const ul = document.createElement('ul');
            ul.setAttribute('id', 'paperAvailableElements');
            for (const name of availableElements) {
                const li = document.createElement('li');
                li.setAttribute('id', uuidv4());

                // Remove the sufix "Element" from the name of the element
                li.textContent = utils.capitalize(name.substring(0, name.length - 7));

                li.addEventListener('click', () => {

                    if (window === "defaults") {
                        // Remove highlight from all siblings
                        ul.querySelectorAll('li').forEach((el) => {
                            el.classList.remove('selected-available-element');
                        });
                        // Highlight this one
                        li.classList.add('selected-available-element');

                        // this sends a message within the same ("defaults", second) window
                        // useful when the click event is created in a different module, like here
                        // basically a "note to self"
                        global.emit('defaultElementSelected', name);

                        global.sendTo('main', 'getProperties', name);

                    } else if (window === "editor") {
                        const elementType = name as keyof Elements;
                        editor.addElementToDialog(
                            String(li.textContent),
                            elements[elementType],
                        );
                    }
                });
                ul.appendChild(li);
            }

            elementsList.appendChild(ul);

        } else {
            showError('Could not find the element list in editor window. Please check the HTML!')
        }
    },

    // add new element on dialog
    addElementToDialog: function (name, data) {
        if (data) {
            const element = renderutils.makeElement({ ...data });
            element.dataset.type = name;
            element.dataset.parentId = dialog.id;
            dialog.canvas.appendChild(element);
            editor.addElementListeners(element);
            dialog.addElement(element);
        }
    },

    // add listener to the element
    addElementListeners(element) {
        element.addEventListener('click', (event) => {
            event.stopPropagation();
            dialog.selectedElement = element.id;
            if (!element.classList.contains('selectedElement')) {
                editor.deselectAll();
                element.classList.add('selectedElement');
            }
        })

        editor.addDragAndDrop(element);
    },

    addDragAndDrop(element) {
        const dialogW = dialog.canvas.getBoundingClientRect().width;
        const dialogH = dialog.canvas.getBoundingClientRect().height;
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
                dialog.selectedElement = element.id;
                const type = dialog.getElement(element.id)?.dataset.type;
                if (!type) return;
                global.emit( // only to the current window / process
                    'elementSelected',
                    element.id
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
            // console.log('dragend');
        });
    },

    deselectAll: function () {
        for (const element of dialog.canvas.children) {
            // last element in the set should be the cover
            element.classList.remove('selectedElement')
        }
        dialog.selectedElement = '';
        editor.clearPropsList();
    },

    // updateElement(data) {
    //     if (dialog.selectedElement !== '') {
    //         dialog.updateElementProperties(dialog.selectedElement, data);
    //     }
    // },

    // remove element form paper and container
    removeSelectedElement() {
        // remove from dialog
        document.getElementById(dialog.selectedElement)?.remove();
        // remove from container
        dialog.removeElement(dialog.selectedElement);
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
                global.sendTo(
                    'main',
                    'secondWindow',
                    {
                        width: 640,
                        height: 480,
                        backgroundColor: '#fff',
                        title: 'Default values',
                        preload: 'preloadDefaults.js',
                        html: 'defaults.html'
                    }
                );
            });
            div.appendChild(button);
            elementsList.appendChild(div);
        }
    },

    propertyUpdate: function(ev) {
        const el = ev.target as HTMLInputElement;
            // console.log(el);
            // editor.updateElement({ [el.name]: el.value });

            const id = el.id.slice(2);
            let value = el.value;
            const element = dialog.getElement(dialog.selectedElement);

            if (element) {
                const dataset = element.dataset;
                let props = { [id]: value };
                if (id === "size" && (dataset.type === "Checkbox" || dataset.type === "Radio")) {
                    const dialogW = dialog.canvas.getBoundingClientRect().width;
                    const dialogH = dialog.canvas.getBoundingClientRect().height;
                    if (Number(value) > Math.min(dialogW, dialogH) - 20) {
                        value = String(Math.round(Math.min(dialogW, dialogH) - 20));
                        el.value = value;
                    }
                    props = {
                        width: value,
                        height: value
                    };
                }
                renderutils.updateElement(element, props as AnyElement);
                // renderutils.updateElement(element, { [id]: value } as AnyElement);

            } else {
                showError('Element not found.');
            }
    },

    initializeDialogProperties: function() {
        // add dialog props
        const properties: NodeListOf<HTMLInputElement> = document.querySelectorAll('#dialog-properties [id^="dialog"]');

        // update dialog properties
        for (const element of properties) {
            element.addEventListener('keyup', (ev: KeyboardEvent) => {
                if (ev.key == 'Enter') {
                    const el = ev.target as HTMLInputElement;
                    el.blur();
                }
            });
            // save on blur
            element.addEventListener('blur', () => {
                const id = element.id;
                if (id === 'dialogwidth' || id === 'dialogheight') {
                    const value = element.value;
                    if (value) {
                        const dialogprops = renderutils.collectDialogProperties();
                        editor.updateDialogArea(dialogprops);
                        global.sendTo(
                            'main',
                            'resize-editorWindow',
                            Number(dialog.properties.width),
                            Number(dialog.properties.height)
                        );
                    }
                }
                if (id === 'dialogFontSize') {
                    const value = element.value;
                    if (value) {
                        renderutils.updateFont(Number(value));
                    }
                }
            });
        }
    }
}
