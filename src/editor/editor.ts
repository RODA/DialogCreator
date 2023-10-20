import { EventEmitter } from 'events';
import { editorSettings } from './settings';
import { buttonElementType, checkboxElementType, elements, ElementsInterface } from './elements';
import { v4 as uuidv4 } from 'uuid';
import { editorElements, editorElementsTypes } from './editorElements';
import { dialogContainer } from './dialogContainer';
console.log(editorElements);
interface EditorInterface {
    dialog: HTMLDivElement;
    dialogId: string;
    selectedElementId: string;
    editorEvents: EventEmitter;
    make: (dialogContainer: HTMLDivElement) => void;
    drawAvailableElements: () => HTMLUListElement;
    deselectAll: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addElementToDialog: (type: string, withData?: any) => void;
    addElementListeners: <T extends (buttonElementType | checkboxElementType) >(element: T) => void;
    addDragAndDrop: (element: HTMLElement) => void;
    updateElement: (payload: { prop: string, value: string }) => void;
    removeSelectedElement: () => void;
    cleaPropsList: () => void;
}

export const editor: EditorInterface = {

    dialog: document.createElement('div'),
    dialogId: '',
    selectedElementId: '',
    editorEvents: new EventEmitter(),
    make: (dialogContainer: HTMLDivElement) => {

        const newDialogID = uuidv4();
        editor.dialog.id = newDialogID;
        editor.dialogId = newDialogID;

        editor.dialog.style.position = 'relative';
        editor.dialog.style.width = editorSettings.dialog.width + 'px';
        editor.dialog.style.height = editorSettings.dialog.height + 'px';
        editor.dialog.style.backgroundColor = editorSettings.dialog.background;
        editor.dialog.style.border = '1px solid gray';
        editor.dialog.addEventListener('click', (event) => {
            if ((event.target as HTMLDivElement).id === editor.dialogId) {
                console.log('dialog click');
                
                editor.deselectAll();
            }
        });
        editor.dialog.addEventListener("drop", (event) => {
            // prevent default action (open as link for some elements)
            event.preventDefault();
            // move dragged element to the selected drop target
            // if (event.target.className === "dropzone") {
            //     dragged.parentNode.removeChild(dragged);
            //     event.target.appendChild(dragged);
            // }
        });

        dialogContainer.append(editor.dialog)

        // // bg id for resize
        // this.bgId = bgRect.id;
        // // set paper exists
        // this.paperExists = true;
        // // set font size and family
        // elements.setDefaultFont(this.settings.fontSize, this.settings.fontFamily);
        // //add info to container - add availabel props
        // container.initialize(this.settings.dialog);
        // // emit dialog update
        editor.editorEvents.emit('dialogUpdate', editorSettings.dialog);
    },

    drawAvailableElements: () => {
        const ul = document.createElement('ul');
        ul.setAttribute('id', 'paperAvailableElements');
        for (const element of editorSettings.availableElements) {
            const li = document.createElement('li');
            li.setAttribute('id', uuidv4());
            li.innerHTML = element;
            li.addEventListener('click', () => {
                editor.addElementToDialog(element, null);
            })
            ul.appendChild(li);
        }
        return ul;
    },

    // add new element on paper
    addElementToDialog: function (type, withData) {
        // checking if there is a paper
        if (editor.dialog) {
            // check for method
            if (!editorSettings.availableElements.includes(type) || !Object.hasOwn(editorElements, 'add' + type)) {
                alert("Element type not available. Probably functionality not added.");
                return;
            }
            // get passed or default element settings
            let dataSettings;
            const elementType = (type.toLowerCase() + 'Element') as keyof ElementsInterface;
            if (withData !== null) {
                dataSettings = withData;
            } else {
                dataSettings = elements[elementType];
            }

            const createdElement = editorElements['add' + type as editorElementsTypes](editor.dialog, dataSettings);
            editor.addElementListeners(createdElement);
            dialogContainer.addElement(createdElement);

        } else {
            // dialog.showMessageBox(editorWindow, { type: "info", message: "Please create a new dialog first.", title: "No dialog", buttons: ["OK"] });
            alert('Please create a new dialog first.');
        }
    },

    addElementListeners(element) {
        const htmlCreatedElement = document.getElementById(element.id);
        if (htmlCreatedElement) {
            // select element on click
            htmlCreatedElement.addEventListener('click', (event) => {
                event.stopPropagation();
                editor.selectedElementId = element.id;
                if (!htmlCreatedElement.classList.contains('selectedElement')) {
                    editor.deselectAll();
                    htmlCreatedElement.classList.add('selectedElement');

                }
                editor.editorEvents.emit('selectElement', dialogContainer.getElement(element.id));
            })

            editor.addDragAndDrop(htmlCreatedElement);

        } else {
            throw new Error('Could not find the element!')
        }
    },

    addDragAndDrop(htmlCreatedElement) {
        const dialogW = editor.dialog.getBoundingClientRect().width;
        const dialogH = editor.dialog.getBoundingClientRect().height;
        let top = 0;
        let left = 0;
        const elementWidth = htmlCreatedElement.getBoundingClientRect().width;
        const elementHeight = htmlCreatedElement.getBoundingClientRect().height;
        let offsetX: number = 0, offsetY: number = 0, isDragging = false, isMoved = false;

        // Event listeners for mouse down, move, and up events
        htmlCreatedElement.addEventListener('mousedown', (e) => {
            isDragging = true;

            // Get the initial mouse position relative to the element
            offsetX = htmlCreatedElement.parentElement.getBoundingClientRect().left + Math.floor(elementWidth / 2);
            offsetY = htmlCreatedElement.parentElement.getBoundingClientRect().top + Math.floor(elementHeight / 2);

            // Change cursor style while dragging
            htmlCreatedElement.style.cursor = 'grabbing';

            if (!htmlCreatedElement.classList.contains('selectedElement')) {
                editor.deselectAll();
                htmlCreatedElement.classList.add('selectedElement');
                editor.editorEvents.emit('selectElement', dialogContainer.getElement(htmlCreatedElement.id));
            }
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
            htmlCreatedElement.style.left = left + 'px';
            htmlCreatedElement.style.top = top + 'px';
            isMoved = true;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;

            // Restore cursor style
            htmlCreatedElement.style.cursor = 'grab';
        });

        htmlCreatedElement.addEventListener('dragend', () => {
            console.log('dragend');
        });

        htmlCreatedElement.addEventListener('mouseup', () => {
            if (isMoved) {
                dialogContainer.updateProperties(htmlCreatedElement.id, { prop: 'top', value: String(top) });
                dialogContainer.updateProperties(htmlCreatedElement.id, { prop: 'left', value: String(left) });
                isMoved = false; // position updated
            }
        })
    },

    deselectAll: function () {
        for (const element of editor.dialog.children) {
            // last element in the set should be the cover
            element.classList.remove('selectedElement')
        }
        editor.selectedElementId = '';
        editor.cleaPropsList();
    },

    updateElement(payload) {

        dialogContainer.updateProperties(editor.selectedElementId, payload);
        console.log(dialogContainer.elements);
    },

    // remove element form paper and container
    removeSelectedElement() {
        // remove from dialog
        document.getElementById(editor.selectedElementId).remove();
        // remove from container
        dialogContainer.removeElement(editor.selectedElementId);
        // clear element properties
        editor.cleaPropsList();
    },

    // clear element props
    cleaPropsList() {
        // clear data form
        const properties = document.querySelectorAll('#propertiesList [id^="el"]');

        properties.forEach(item => {
            (item as HTMLInputElement).value = '';
        });

        // hide props list
        document.getElementById('propertiesList').classList.add('hidden');
        document.querySelectorAll('#propertiesList .element-property').forEach(item => {
            item.classList.add('hidden-element');
        });

        // disable buttons
        (document.getElementById('removeElement') as HTMLButtonElement).disabled = true;
    },
}
