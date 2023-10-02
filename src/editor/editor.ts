import { EventEmitter } from 'events';
import { editorSettings } from './settings';
import * as elementsConfig from './elements/index';
import { elementsInterfaces } from './elements/index';
import { v4 as uuidv4 } from 'uuid';
import { editorElements, editorElementsTypes } from './editorElements';
console.log(editorElements);
interface EditorInterface {
    dialog: HTMLDivElement;
    dialogId: string;
    editorEvents: EventEmitter;
    make: (dialogContainer: HTMLDivElement) => void;
    drawAvailableElements: () => HTMLUListElement;
    // deselectAll: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addElementToDialog: (type: string, withData?: any) => void;
}

export const editor: EditorInterface = {

    dialog: document.createElement('div'),
    dialogId: '',
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
        // dialog.addEventListener('click', editor.deselectAll);

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


            if (!editorSettings.availableElements.includes(type) || !Object.hasOwn(editorElements, 'add' + type)) {
                alert("Element type not available. Probably functionality not added.");
                return;
            }

            let dataSettings;

            if (withData !== null) {
                dataSettings = withData;
            } else {
                const aa = (type.toLowerCase() + 'Element') as elementsInterfaces;
                dataSettings = elementsConfig[aa];
            }

            // checking for duplicate names | checking for the name propertie if exist should not be necessary as all elements should have it           
            // if (Object.hasOwn(dataSettings, 'name')) {
            //     dataSettings.name = container.elementNameReturn(dataSettings.name);
            // }

            // check for wrong values
            // dataSettings = container.cleanValues(dataSettings);

            editorElements['add' + type as editorElementsTypes](editor.dialog, dataSettings);

            // adn cover, drag and drop and add it to the container
            // this.addCoverAndDrag(element, dataSettings, false);

        } else {
            // dialog.showMessageBox(editorWindow, { type: "info", message: "Please create a new dialog first.", title: "No dialog", buttons: ["OK"] });
            alert('Please create a new dialog first.');
        }
    },

    // deselectAll: function()
    // {
    //     for(const element of editor.elementList){
    //         // last element in the set should be the cover
    //         element.items[element.items.length - 1].attr({'stroke-width': 0, 'stroke-opacity': 0});
    //     }
    //     // editorWindow.webContents.send('deselectedElements');
    // },
}
