
import { ipcRenderer } from "electron";
import { editor } from "../editor/editor";
import { interfaces } from '../interfaces/editor';
import { showMessage } from "../communication";
import { utils } from "../library/utils";
import { elements } from "../editor/elements";

// helpers for when enter key is pressed
let elementSelected = false;
// let mouseDown = false;

// dialog -- the white part
// editor -- the whole window
// dialogContainer --


const onInitializeDialogProperties = () => {
    // add dialog props
    const properties: NodeListOf<HTMLInputElement> = document.querySelectorAll('#dialog-properties [id^="dialog"]');
    editor.editorEvents.on('initializeDialogProperties', function (props: interfaces['DialogProperties']) {
        for (const el of properties) {
            const key = el.getAttribute('name') as keyof interfaces['DialogProperties'];
            if (key) {
            el.value = props[key] as string;
            }
        }
        });

    // TODO -- ramas aici
    const getAllProp = (properties: NodeListOf<HTMLInputElement>) => {
        const obj = {} as interfaces['DialogProperties'];
        properties.forEach((el) => {
            // const key = el.getAttribute('name') as keyof interfaces['DialogProperties'];
            // obj[key] = el.value;
            obj.name = el.value;
        });
        return obj;
    }

    // update dialog properties
    for (const element of properties) {
        element.addEventListener('keyup', (ev: KeyboardEvent) => {
            if (ev.key == 'Enter') {
                editor.updateDialogProperties(getAllProp(properties));
            }
        });
        // save on blur
        element.addEventListener('blur', () => {
            editor.updateDialogProperties(getAllProp(properties));
        });
    }

    // add dialog syntax
    // TODO
    const dialogSyntax = document.getElementById('#dialog-syntax');
    if (dialogSyntax) {
        dialogSyntax.addEventListener('click', function () {
            // ipcRenderer.send('createSecondWindow', editor.getDialogSyntax());
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
    editor.editorEvents.on('selectElement', function (element: interfaces['AnyElement']) {

        elementSelected = true;
        // update props tab
        document.getElementById('propertiesList').classList.remove('hidden');

        // disable all elements and hide everything | reseting props tab
        document.querySelectorAll('#propertiesList [id^="el"]').forEach(el => {

            const item = el as HTMLInputElement;
            if (item.name in element) {
                // show main element
                item.disabled = false;
                item.parentElement.classList.remove('hidden-element');
                // item.value = String(element[item.name as keyof ElementsInterface[keyof ElementsInterface]]);
                // item.value = String(element[item.name as interfaces['keyofAnyElement']]);
                item.value = utils.getElementValue(element, item.name);

                item.removeEventListener('blur', propertyUpdate);
                item.addEventListener('blur', propertyUpdate);

                if (item.tagName !== "SELECT") {
                    item.removeEventListener('keyup', propertyUpdateOnEnter);
                    item.addEventListener('keyup', propertyUpdateOnEnter);
                } else {
                    item.addEventListener("change", () => {
                        item.blur();
                    });
                }
            } else {
                item.disabled = true;
                item.parentElement.classList.add('hidden-element');
            }
        });

        if (element.type === 'Slider') {
            document.getElementById('colorlabel').innerText = 'Track color';
            document.getElementById('sliderHandleProperties').classList.remove('hidden-element');
        } else {
            document.getElementById('colorlabel').innerText = 'Color';
            document.getElementById('sliderHandleProperties').classList.add('hidden-element');
        }


        if (element.type == "Select") {
            /*
            // This works and could be used, but it is very R specific and the
            // Dialog Creator could theoretically be used for any other language
            let value = document.getElementById('eldataSource').dataset.savedValue;
            if (!value) {
                value = "custom";
            }

            if (value == "custom") {
                document.getElementById('divRobjects').style.display = 'none';
                document.getElementById('divalue').style.display = '';
            } else {
                document.getElementById('divRobjects').style.display = '';
                document.getElementById('divalue').style.display = 'none';
            }
            */
            document.getElementById('valuelabel').innerText = 'Values';
        } else {
            document.getElementById('valuelabel').innerText = 'Value';
        }


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

        const div = document.createElement('div');
        div.className = 'mt-1_5';
        const button = document.createElement('button');
        button.className = 'custombutton';
        button.innerText = 'Default values';
        button.setAttribute('type', 'button');
        button.style.width = '150px';
        button.addEventListener('click', function () {
            // ipcRenderer.send(
            //     'createSecondWindow',
            //     {
            //         width: 640,
            //         height: 310,
            //         backgroundColor: '#fff',
            //         title: 'Default valeus',
            //         file: 'defaults.html',
            //         elements: elements,
            //     }
            // );
        });
        div.appendChild(button);
        elementsList.appendChild(div);

    } else {
        showMessage({ type: 'error', title: 'Error', message: 'Cound not find the element list in editor window. Please check the HTML!' })
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


    document.getElementById('conditions').addEventListener('click', function () {
        // const id = (document.getElementById('elparentId') as HTMLInputElement).value;
        const element = editor.getElementFromContainer();

        ipcRenderer.send(
            'secondWindow',
            {
                width: 640,
                height: 310,
                backgroundColor: '#fff',
                title: 'Conditions for element: ' + element.nameid,
                file: 'conditions.html',
                conditions: element.conditions
            }
        );
    });

})


ipcRenderer.on('consolog', (event, object: any) => {
    console.log(object);
});
