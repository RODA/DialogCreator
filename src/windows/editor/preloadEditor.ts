
import { editor } from "../../editor/editor";

document.addEventListener('DOMContentLoaded', () => {

    // show dialog props -- wait for event
    editor.editorEvents.on('dialogUpdate', function (props) {
        const properties: NodeListOf<HTMLInputElement> = document.querySelectorAll('#dlgProps [id^="dialog"]');
        for (const el of properties) {
            const key = el.getAttribute('name');
            el.value = props[key];
        }
    });

    // draw available elements
    const elementsList = document.getElementById('elementsList');
    if (elementsList) {
        elementsList.innerHTML = '';
        elementsList.appendChild(editor.drawAvailableElements());
    } else {
        alert('Cound not find element list!')
    }

    // create new dialog when first opend
    const dialogContainer = document.getElementById('paper');
    if (dialogContainer) {
        editor.make(dialogContainer as HTMLDivElement);
    }


})

