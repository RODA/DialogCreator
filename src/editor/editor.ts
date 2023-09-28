import { EventEmitter } from 'events';
import { editorSettings } from './settings';
import * as elements from './elements/index';
import { v4 as uuidv4 } from 'uuid';



interface EditorInterface {
    dialogId: string;
    editorEvents: EventEmitter;
    make: (dialogContainer: HTMLDivElement) => void;
    drawAvailableElements: () => HTMLUListElement;
    // deselectAll: () => void;
}

export const editor: EditorInterface = {

    dialogId: '',
    editorEvents: new EventEmitter(),

    make: (dialogContainer: HTMLDivElement) => {
        
        const dialog = document.createElement('div');
        const newDialogID = uuidv4();
        dialog.id = newDialogID;
        editor.dialogId = newDialogID;

        dialog.style.width = editorSettings.dialog.width + 'px';
        dialog.style.height = editorSettings.dialog.height + 'px';
        dialog.style.backgroundColor = editorSettings.dialog.background;
        dialog.style.border = '1px solid gray';
        // dialog.addEventListener('click', editor.deselectAll);

        dialogContainer.append(dialog)
        
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
            li.setAttribute('id', element);
            li.innerHTML = element;
            ul.appendChild(li);
        }
        return ul;
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
