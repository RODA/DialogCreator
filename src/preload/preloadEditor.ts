
import { ipcRenderer, BrowserWindow } from "electron";
import { showError, global } from "../modules/coms";
import { editor } from "../modules/editor";
import { utils } from "../library/utils";
import { AnyElement } from "../interfaces/elements";
import { dialog } from "../modules/dialog";

// helpers for when enter key is pressed
global.elementSelected = false;

// dialog -- the white part
// editor -- the whole window

const initializeDialogProperties = () => {
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
            const id = element.id;
            if (id === 'dialogwidth' || id === 'dialogheight') {
                const value = element.value;
                if (value) {
                    const dialogprops = utils.collectDialogProperties();
                    editor.updateDialogArea(dialogprops);
                    const wh = {
                        width: Number(dialog.properties.width),
                        height: Number(dialog.properties.height)
                    }
                    ipcRenderer.send('resize-editorWindow', wh);
                }
            }
            if (id === 'dialogFontSize') {
                const value = element.value;
                if (value) {
                    utils.updateFont(Number(value));
                }
            }
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
    const element = dialog.getElement(global.selectedElementId);

    if (element) {
        const dataset = element.dataset;
        let props = { [id]: value };
        if (id === "size" && (dataset.type === "Checkbox" || dataset.type === "Radio")) {
            const dialogW = global.dialog.getBoundingClientRect().width;
            const dialogH = global.dialog.getBoundingClientRect().height;
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
        if (global.elementSelected) {
            const el = ev.target as HTMLInputElement;
            el.blur();
        }
    }
}

global.on('selectElement', (id) => {
    global.elementSelected = true;
    // update props tab
    document.getElementById('propertiesList')?.classList.remove('hidden');
    const element = document.getElementById(id as string) as HTMLElement;
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


document.addEventListener('DOMContentLoaded', () => {

    utils.setOnlyNumbers(["width", "height", "size", "space", "left", "top", "handlesize", "handlepos", "lineClamp"]);
    utils.setOnlyNumbersWithMinus(["startval", "maxval"]);

    // Events - must be first ====
    initializeDialogProperties();

    // create new dialog when first opened and trigger events
    editor.newDialog();

    utils.addAvailableElementsTo('elementsList');
    utils.addDefaultsButton();

    document.getElementById('removeElement')?.addEventListener(
        'click',
        editor.removeSelectedElement
    );

    // remove the element on delete or backspace key
    document.addEventListener('keyup', function (ev) {
        if (ev.code == 'Delete' || ev.code == 'Backspace') {
            if (global.elementSelected) {
                if (document.activeElement?.tagName === 'BODY') {
                    editor.removeSelectedElement();
                }
            }
        }
    });


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
})

// TODO: this does not belong to this window. Move to conditions module.
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
