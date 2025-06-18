import { ipcRenderer, BrowserWindow } from "electron";
import { showError, global } from "../modules/coms";
import { renderutils } from "../library/renderutils";
import { utils } from "../library/utils";
import { Elements } from '../interfaces/elements';
import { elements as els } from '../modules/elements';

let elements = { ...els } as Elements;
Object.keys(elements).forEach((element) => {
    global.sendTo('main', 'getProperties', element);
});


// helpers for when enter key is pressed
let elementSelected = false;

// dialog -- the white part
// editor -- the whole window

// renderutils.elementsFromDB().then((items) => {
//     global.elements = items;
// });


// On Enter blur element so it triggers update
let propertyUpdate = function(ev: FocusEvent) {}; // overwritten once the editor module is loaded
const propertyUpdateOnEnter = (ev: KeyboardEvent) => {
    if (ev.key == 'Enter') {
        if (utils.isTrue(elementSelected)) {
            const el = ev.target as HTMLInputElement;
            el.blur();
        }
    }
}


// TODO: this does not belong to this window. Move to conditions module.
global.on('conditionsValid', (event, args) => {
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

global.on('elementSelected', (id) => {

    elementSelected = true;
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


window.addEventListener("DOMContentLoaded", async () => {

    // Dynamically import the editor module and run its setup
    const { editor } = await import("../modules/editor");

    propertyUpdate = editor.propertyUpdate;

    // Run the main setup logic for the editor window
    // (mimics the previous top-level code in this file)
    renderutils.setOnlyNumbers([
        "width",
        "height",
        "size",
        "space",
        "left",
        "top",
        "handlesize",
        "handlepos",
        "lineClamp"
    ]);

    renderutils.setOnlyNumbersWithMinus([
        "startval",
        "maxval"
    ]);

    editor.initializeDialogProperties();
    editor.makeDialog();
    editor.addAvailableElementsTo("editor");
    editor.addDefaultsButton();

    document.getElementById('removeElement')?.addEventListener('click', editor.removeSelectedElement);

    document.addEventListener('keyup', function (ev) {
        if (ev.code == 'Delete' || ev.code == 'Backspace') {
            if (utils.isTrue(elementSelected)) {
                if (document.activeElement?.tagName === 'BODY') {
                    editor.removeSelectedElement();
                }
            }
        }
    });

    document.getElementById('conditions')?.addEventListener('click', function () {
        const element = editor.getElementFromContainer();
        if (!element) {
            showError('Could not find the element. Please check the HTML!');
            return;
        }
        global.sendTo(
            'main',
            'secondWindow',
            {
                width: 640,
                height: 310,
                backgroundColor: '#fff',
                title: 'Conditions for element: ' + element.dataset.nameid,
                preload: 'preloadConditions.js',
                html: 'conditions.html',
                conditions: element.dataset.conditions
            }
        );
    });

    global.on("propertiesFromDB", (...args: unknown[]) => {
        // TODO: properties do not return from the DB...
        // the channel does not behaves properly: message is sent from main
        // but not properly handled in coms.ts
        const name = args[0] as string;
        const properties = args[1] as Record<string, string>;
        const pkeys = Object.keys(properties);
        if (pkeys.length > 0) {
            for (const pkey of pkeys) {
                let value = properties[pkey] as string | number;
                if (utils.possibleNumeric(String(value))) {
                    value = utils.asNumeric(String(value));
                }
                elements[name][pkey] = value;
            }
        }
    });
});