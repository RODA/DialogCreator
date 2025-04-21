import { showMessageBox } from './../communication';
import { EventEmitter } from 'events';
import { DialogPropertiesInterface, editorSettings } from './settings';
import * as interfaces from '../library/interfaces';
import { elements } from './elements';
import { v4 as uuidv4 } from 'uuid';
import { editorElements, editorElementsTypes } from './editorElements';
import { dialogContainer } from './dialogContainer';

interface EditorInterface {
    dialog: HTMLDivElement;
    dialogId: string;
    selectedElementId: string;
    editorEvents: EventEmitter;
    make: (dialogContainer: HTMLDivElement) => void;
    updateDialogProperties: (props: DialogPropertiesInterface) => void;
    drawAvailableElements: () => HTMLUListElement;
    deselectAll: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addElementToDialog: (type: string, withData?: any) => void;
    addElementListeners: <T extends interfaces.Elements[keyof interfaces.Elements] >(element: T) => void;
    addDragAndDrop: (element: HTMLElement) => void;
    updateElement: (payload: { [key: string]: string }) => void;
    removeSelectedElement: () => void;
    clearPropsList: () => void;
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
                editor.deselectAll();
            }
        });
        editor.dialog.addEventListener("drop", (event) => {
            event.preventDefault();
        });

        dialogContainer.append(editor.dialog)
        editor.editorEvents.emit('initializeDialogProperties', editorSettings.dialog);

        editorElements.setDefaults(
            editorSettings.fontSize,
            editorSettings.fontFamily,
            editorSettings.dialog.width - 25, // - gutter
            editorSettings.dialog.height - 25 // - gutter
        )
    },
    // update paper
    // updateDialogProperties: function (props) {
    updateDialogProperties: function () {


        // check for valid paper
        if (editor.dialogId !== '') {

            // // let upSize = false;
            // if (props.width != container.properties.width || props.height != container.properties.height) {

            //     this.paper.setSize(props.width, props.height);
            //     // remove previous bg and create a new one
            //     this.paper.getById(this.bgId).remove();
            //     let bgRect = this.paper.rect(0, 0, props.width, props.height).attr({ 'fill': '#fdfdfd' }).toBack();
            //     bgRect.click(editor.deselectAll);
            //     this.bgId = bgRect.id;
            //     // upSize = true;
            // }

            // // update container
            // container.updateProperties(props);
        } else {
            // alert no dialog
            showMessageBox({ type: "info", message: "Please create a new dialog first.", title: "No dialog" });
        }

    },

    // called right after make
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

    // add new element on dialog
    addElementToDialog: function (type, withData) {
        // check for method
        if (
            !editorSettings.availableElements.includes(type) ||
            !Object.hasOwn(editorElements, 'add' + type)
        ){
            showMessageBox({
                type: 'info',
                title: 'Notice',
                message: "Element type not available. Probably functionality not added."
            })
            return;
        }
        // get passed or default element settings
        let dataSettings;
        const elementType = (type.toLowerCase() + 'Element') as keyof interfaces.Elements;
        if (withData !== null) {
            dataSettings = withData;
        } else {
            dataSettings = elements[elementType];
        }

        const createdElement = editorElements['add' + type as editorElementsTypes](
            editor.dialog,
            dataSettings
        );
        editor.addElementListeners(createdElement);
        dialogContainer.addElement(createdElement);
        // checking if there is a dialog
        // if (editor.dialog && document.getElementById(editor.dialogId) !== null) {

        // } else {
        //     showMessageBox({ type: 'info', message: "Please create a new dialog first.", title: "No dialog" });
        // }
    },
    // add listener to the element
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
                // there is another emit on the "mousedown" event, this does it twice
                // editor.editorEvents.emit('selectElement', dialogContainer.getElement(element.id));
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
        let elementWidth = 0;
        let elementHeight = 0;
        let offsetX: number = 0, offsetY: number = 0, isDragging = false, isMoved = false;

        // Event listeners for mouse down, move, and up events
        htmlCreatedElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            if (!htmlCreatedElement.classList.contains('selectedElement')) {
                editor.deselectAll();
                htmlCreatedElement.classList.add('selectedElement');
                editor.selectedElementId = htmlCreatedElement.id;
                editor.editorEvents.emit(
                    'selectElement',
                    dialogContainer.getElement(htmlCreatedElement.id)
                );
            }

            elementWidth = htmlCreatedElement.getBoundingClientRect().width;
            elementHeight = htmlCreatedElement.getBoundingClientRect().height;

            // Get the initial mouse position relative to the element
            offsetX = htmlCreatedElement.parentElement.getBoundingClientRect().left + Math.floor(elementWidth / 2);
            offsetY = htmlCreatedElement.parentElement.getBoundingClientRect().top + Math.floor(elementHeight / 2);

            // Change cursor style while dragging
            htmlCreatedElement.style.cursor = 'grabbing';
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

            if (isMoved) {
                dialogContainer.updateProperties(
                    htmlCreatedElement.id,
                    { top: String(top), left: String(left) }
                );

                isMoved = false; // position updated
                // TODO -- daca e deasupra la element mai face odata chestia asta
                editor.editorEvents.emit(
                    'selectElement',
                    dialogContainer.getElement(htmlCreatedElement.id)
                );
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

    updateElement(payload) {
        if (editor.selectedElementId !== '') {
            dialogContainer.updateProperties(editor.selectedElementId, payload);
        }
    },

    // remove element form paper and container
    removeSelectedElement() {
        // remove from dialog
        document.getElementById(editor.selectedElementId).remove();
        // remove from container
        dialogContainer.removeElement(editor.selectedElementId);
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
        document.getElementById('propertiesList').classList.add('hidden');
        document.querySelectorAll('#propertiesList .element-property').forEach(item => {
            item.classList.add('hidden-element');
        });

        // disable buttons
        (document.getElementById('removeElement') as HTMLButtonElement).disabled = true;
    },
}
