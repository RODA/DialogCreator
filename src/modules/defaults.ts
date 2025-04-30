import { showError } from "./coms";
import { editor } from "./editor";

export const defaults = {
    addElementsToDefaults: () => {
        const elementsList = document.getElementById('elementsListDefaults');
        if (elementsList) {
            elementsList.innerHTML = '';
            elementsList.appendChild(editor.drawAvailableElements("defaults"));
        } else {
            showError('Cound not find the element list, please check the HTML.')
        }
    }
}
