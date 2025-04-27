import { showError } from "../communication";
import { editor } from "../editor/editor";

export const defaults = {
    addElementsToDefaults: () => {
        const elementsList = document.getElementById('elementsListDefaults');
        if (elementsList) {
            elementsList.innerHTML = '';
            elementsList.appendChild(editor.drawAvailableElements(true));
        } else {
            showError('Cound not find the element list, please check the HTML.')
        }
    }
}
