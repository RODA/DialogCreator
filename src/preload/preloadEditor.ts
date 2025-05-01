
import { ipcRenderer, BrowserWindow } from "electron";
import { showError, global } from "../modules/coms";
import { editor } from "../modules/editor";
import { utils } from "../library/utils";
import { editorSettings } from "../modules/settings";
import { elements as defaults } from "../modules/elements";
import { AnyElement } from "../interfaces/elements";
import { DialogProperties } from "../interfaces/dialog";
import { dialog } from "../modules/dialog";

// helpers for when enter key is pressed
let elementSelected = false;
// let mouseDown = false;

// dialog -- the white part
// editor -- the whole window

let elements = { ...defaults };
ipcRenderer.on('updateDefaults', (event, updatedDefaults) => {
    elements = { ...updatedDefaults };
});

const onInitializeDialogProperties = () => {
    // add dialog props
    const properties: NodeListOf<HTMLInputElement> = document.querySelectorAll('#dialog-properties [id^="dialog"]');

    // update dialog properties
    for (const element of properties) {
        element.addEventListener('keyup', (ev: KeyboardEvent) => {
            if (ev.key == 'Enter') {
                const el = ev.target as HTMLInputElement;
                el.blur();
            }
        });
        // save on blur
        element.addEventListener('blur', () => {
            const dialogprops = utils.collectDialogProperties();
            editor.updateDialogArea(dialogprops);
            const wh = {
                width: Number(dialogprops.width),
                height: Number(dialogprops.height)
            }
            ipcRenderer.send('resize-editorWindow', wh)
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


const propertyUpdate = (ev: FocusEvent) => {
    const el = ev.target as HTMLInputElement;
    // console.log(el);
    // editor.updateElement({ [el.name]: el.value });

    const id = el.id.slice(2);
    let value = el.value;
    const element = dialog.getElement(editor.selectedElementId);

    if (element) {
        const dataset = element.dataset;
        let props = { [id]: value };
        if (id === "size" && (dataset.type === "Checkbox" || dataset.type === "Radio")) {
            const dialogW = editor.dialog.getBoundingClientRect().width;
            const dialogH = editor.dialog.getBoundingClientRect().height;
            if (Number(value) > Math.min(dialogW, dialogH) - 20) {
                value = String(Math.round(Math.min(dialogW, dialogH) - 20));
                el.value = value;
            }
            props = {
                width: value,
                height: value
            };
        }
        utils.updateElement(element, props as AnyElement);
        // utils.updateElement(element, { [id]: value } as AnyElement);

    } else {
        showError('Element not found.');
    }


}

// On Enter blur element so it triggers update
const propertyUpdateOnEnter = (ev: KeyboardEvent) => {
    if (ev.key == 'Enter') {
        if (elementSelected) {
            const el = ev.target as HTMLInputElement;
            el.blur();
        }
    }
}

const onElementSelected = () => {
    // show element properties
    global.emitter.on('selectElement', function (element: HTMLElement) {
        elementSelected = true;
        // update props tab
        document.getElementById('propertiesList')?.classList.remove('hidden');
        const dataset = element.dataset;

        const ellist = document.querySelectorAll('#propertiesList [id^="el"]');
        // disable all elements and hide everything | reseting props tab
        ellist.forEach(el => {
            const item = el as HTMLInputElement;
            if (item.name in dataset) {
                // show main element
                item.disabled = false;
                item.parentElement?.classList.remove('hidden-element');
                item.value = dataset[item.name] || '';

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
                item.parentElement?.classList.add('hidden-element');
            }
        });

        const colorlabel = document.getElementById('colorlabel') as HTMLLabelElement;

        if (dataset.type === 'Slider') {
            colorlabel.innerText = 'Track color';
            document.getElementById('sliderHandleProperties')?.classList.remove('hidden-element');
        } else {
            colorlabel.innerText = 'Color';
            document.getElementById('sliderHandleProperties')?.classList.add('hidden-element');
        }


        const valuelabel = document.getElementById('valuelabel') as HTMLLabelElement;
        if (dataset.type == "Select") {
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
            valuelabel.innerText = 'Values';
        } else {
            valuelabel.innerText = 'Value';
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
        elementsList.appendChild(editor.drawAvailableElements("editor"));

        const div = document.createElement('div');
        div.className = 'mt-1_5';
        const button = document.createElement('button');
        button.className = 'custombutton';
        button.innerText = 'Default values';
        button.setAttribute('type', 'button');
        button.style.width = '150px';
        button.addEventListener('click', function () {
            ipcRenderer.send(
                'secondWindow',
                {
                    width: 640,
                    height: 480,
                    backgroundColor: '#fff',
                    title: 'Default values',
                    file: 'defaults.html',
                    elements: elements,
                }
            );
        });
        div.appendChild(button);
        elementsList.appendChild(div);

    } else {
        showError('Cound not find the element list in editor window. Please check the HTML!')
    }
}

const removeElementFromDialog = () => {
    // remove on button click
    document.getElementById('removeElement')?.addEventListener('click', editor.removeSelectedElement);

    // remove the element on delete or backspace key
    document.addEventListener('keyup', function (ev) {
        if (ev.code == 'Delete' || ev.code == 'Backspace') {
            if (elementSelected) {
                if (document.activeElement?.tagName === 'BODY') {
                    editor.removeSelectedElement();
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {

    utils.setOnlyNumbers(["width", "height", "size", "space", "left", "top", "handlesize", "handlepos", "lineClamp"]);
    utils.setOnlyNumbersWithMinus(["startval", "maxval"]);

    // Events - must be first ====
    onInitializeDialogProperties();
    onElementSelected();

    // create new dialog when first opened and trigger events
    const dialogdiv = document.getElementById('dialog');
    if (dialogdiv) {
        editor.make(dialogdiv as HTMLDivElement);
    }
    addAvailableElementsToEditor();
    removeElementFromDialog();


    document.getElementById('conditions')?.addEventListener('click', function () {
        // const id = (document.getElementById('elparentId') as HTMLInputElement).value;
        const element = editor.getElementFromContainer();
        if (!element) {
            showError('Could not find the element. Please check the HTML!');
            return;
        }
        ipcRenderer.send(
            'secondWindow',
            {
                width: 640,
                height: 310,
                backgroundColor: '#fff',
                title: 'Conditions for element: ' + element.dataset.nameid,
                file: 'conditions.html',
                conditions: element.dataset.conditions
            }
        );
    });

    ipcRenderer.on('conditionsValid', (event, args) => {
        if (args) {
            BrowserWindow.getFocusedWindow()?.close();
        } else {
            let message = '<p id="errors"><span>The conditions are not valid. Please check and click save again.</span><br/> For more information please consult the documentation</p>';

            const conditions = document.getElementById('conditions') as HTMLInputElement;
            conditions.style.height = '127px';

            const conditionsInputs = document.getElementById('conditionsInputs') as HTMLDivElement;
            conditionsInputs.insertAdjacentHTML('beforeend', message);
        }
    });

})

ipcRenderer.on('addCover', (event, args) => {
    document.getElementById('editor-cover')?.classList.add('editor-cover');
});
ipcRenderer.on('removeCover', (event, args) => {
    document.getElementById('editor-cover')?.classList.remove('editor-cover');
});


ipcRenderer.on('consolog', (event, object: any) => {
    console.log(object);
});
