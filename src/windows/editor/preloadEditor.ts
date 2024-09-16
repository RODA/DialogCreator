
import { editor } from "../../editor/editor";
import { ElementsInterface } from '../../editor/elements';
import { showMessageBox } from "../../FrontToBackCommunication";
// import { DialogPropertiesInterface } from '../../editor/settings';

// helpers for when enter key is pressed
let elementSelected = false;
// let mouseDown = false;

// dialog -- the white part
// editor -- the whole window
// dialogContainer --

const onInitializeDialogProperties = () => {
    // add dialog props
    const properties: NodeListOf<HTMLInputElement> = document.querySelectorAll('#dialog-properties [id^="dialog"]');
    editor.editorEvents.on('initializeDialogProperties', function (props) {
        for (const el of properties) {
            const key = el.getAttribute('name');
            el.value = props[key];
        }
    });

    // // TODO -- ramas aici
    // const getAllProp = (properties: NodeListOf<HTMLInputElement>) => {
    //     const obj = {} as DialogPropertiesInterface;
    //     properties.forEach((el) => {
    //         const key = el.getAttribute('name') as keyof DialogPropertiesInterface;
    //         obj[key] = el.value;
    //     });
    //     return obj;
    // }

    // // update dialog properties
    // for (const element of properties) {
    //     element.addEventListener('keyup', (ev: KeyboardEvent) => {
    //         if (ev.key == 'Enter') {
    //             editor.updateDialogProperties(getAllProp(properties));
    //         }
    //     });
    //     // save on blur
    //     element.addEventListener('blur', () => {
    //         editor.updateDialogProperties(getAllProp(properties));
    //     });
    // }

    // add dialog syntax
    // TODO
    const dialogSyntax = document.getElementById('#dialog-syntax');
    if (dialogSyntax) {
        dialogSyntax.addEventListener('click', function () {
            // ipcRenderer.send('startSyntaxWindow', editor.getDialogSyntax());
            alert('click');
        });
    }

}
const onElementSelected = () => {

    const propertyUpdate = (ev: FocusEvent) => {
        const el = ev.target as HTMLInputElement;
        editor.updateElement({ [el.name]: el.value });
    }

    // On Enter blur element so it triggers update
    const propertyUpdateOnEnter = (ev: KeyboardEvent) => {
        if (ev.key == 'Enter') {
            if (elementSelected) {
                const el = ev.target as HTMLInputElement
                el.blur();
            }
        }
    }

    // show element properties
    editor.editorEvents.on('selectElement', function (element: ElementsInterface[keyof ElementsInterface]) {

        elementSelected = true;

        // update props tab
        document.getElementById('propertiesList').classList.remove('hidden');

        // disable all elements and hide everything | reseting props tab
        document.querySelectorAll('#propertiesList [id^="el"]').forEach(el => {

            const item = el as HTMLInputElement;
            if (element[item.name]) {
                // show main element
                item.disabled = false;
                item.parentElement.classList.remove('hidden-element');
                item.value = String(element[item.name as keyof ElementsInterface[keyof ElementsInterface]]);

                item.removeEventListener('blur', propertyUpdate);
                item.addEventListener('blur', propertyUpdate);

                if (item.tagName !== "SELECT") {
                    item.removeEventListener('keyup', propertyUpdateOnEnter);
                    item.addEventListener('keyup', propertyUpdateOnEnter);
                }
            } else {
                item.disabled = true;
                item.parentElement.classList.add('hidden-element');
            }
        });

        // trigger change for the select element source values
        // if (element.dataSource) {
        //     document.getElementById('eldataSource').dispatchEvent(new Event('change'));
        // }
        // if(element.type === 'Container') {
        //     // trigger change for container
        //     $("#elobjViewClass" ).trigger("change");
        // }

        // disable update and remove button | force reselection
        (document.getElementById('removeElement') as HTMLButtonElement).disabled = false;
    });
}

const addAvailableElementsToEditor = () => {
    const elementsList = document.getElementById('elementsList');
    if (elementsList) {
        elementsList.innerHTML = '';
        // add available elements to the editor window
        elementsList.appendChild(editor.drawAvailableElements());
    } else {
        showMessageBox({ type: 'error', title: 'Error', message: 'Cound not find the element list in editor window. Please check the HTML!' })
    }
}
const removeElementFromDialog = () => {
    // remove on button click
    document.getElementById('removeElement').addEventListener('click', editor.removeSelectedElement);

    // remove the element on delete or backspace key
    document.addEventListener('keyup', function (ev) {
        if (ev.code == 'Delete' || ev.code == 'Backspace') {
            if (elementSelected) {
                if (document.activeElement.tagName === 'BODY') {
                    editor.removeSelectedElement();
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {

    // Events - must be first ====
    onInitializeDialogProperties();
    onElementSelected();

    // create new dialog when first opened and trigger events
    const dialogContainer = document.getElementById('dialog');
    if (dialogContainer) {
        editor.make(dialogContainer as HTMLDivElement);
    }
    addAvailableElementsToEditor();
    removeElementFromDialog();

})

