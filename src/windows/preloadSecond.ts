import { contextBridge,  ipcRenderer } from "electron";
import { showError } from "../communication";
import { editor } from "../editor/editor";

const addElementsToDefaults = () => {
    const elementsList = document.getElementById('elementsListDefaults');
    if (elementsList) {
        elementsList.innerHTML = '';
        elementsList.appendChild(editor.drawAvailableElements());
    } else {
        showError('Cound not find the element list,please check the HTML.')
    }
}

contextBridge.exposeInMainWorld('electronAPI', {
    onPopulateDefaults: (callback: (args: any) => void) => {
        ipcRenderer.on('populateDefaults', (event, args) => callback(args));
    },
    addElementsToDefaults
});
