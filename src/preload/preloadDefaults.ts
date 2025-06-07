import { ipcRenderer } from 'electron';
import { showError, global } from "../modules/coms";
import { specifics } from "../library/specifics";
import { utils } from "../library/utils";
import { DBElements } from "../interfaces/database";
import { elements } from "../modules/elements";

let defaultElementSelected = "";

document.addEventListener('DOMContentLoaded', () => {

    specifics.setOnlyNumbers([
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

    specifics.setOnlyNumbersWithMinus([
        "startval",
        "maxval"
    ]);

    global.on('defaultElementSelected', (...args: unknown[]) => {
        const name = typeof args[0] === 'string' ? args[0] : '';
        defaultElementSelected = name;
    });

    global.on('propertiesFromDB', (...args: unknown[]) => {
        // Defensive: get the name from args[0] and ensure it's a string
        const name = typeof args[0] === 'string' ? args[0] : '';

        // update properties tab
        if (defaultElementSelected === name) {
            document.getElementById('propertiesList')?.classList.remove('hidden');

            const ellist = document.querySelectorAll('#propertiesList [id^="el"]');

            const properties = args[1] as DBElements[keyof DBElements];

            // disable all elements and hide everything | reseting properties tab
            ellist.forEach(el => {
                const item = el as HTMLInputElement;
                if (item.name in properties) {
                    // show main element
                    item.disabled = false;
                    item.parentElement?.classList.remove('hidden-element');
                    let value = properties[item.name as keyof DBElements[keyof DBElements]];
                    if (utils.isElementOf(item.name, ['isEnabled', 'isVisible', 'isSelected', 'isChecked'])) {
                        value = (value === '1') ? 'true' : 'false';
                    }
                    item.value = value || '';
                    item.addEventListener("change", async () => {
                        item.blur();
                        ipcRenderer.send('updateProperty', {
                            name: name,
                            property: item.name,
                            value: item.value
                        });
                    });
                } else {
                    item.disabled = true;
                    item.parentElement?.classList.add('hidden-element');
                }
            });

            const colorlabel = document.getElementById('colorlabel') as HTMLLabelElement;

            if (name === 'sliderElement') {
                colorlabel.innerText = 'Track color';
                document.getElementById('sliderHandleProperties')?.classList.remove('hidden-element');
            } else {
                colorlabel.innerText = 'Color';
                document.getElementById('sliderHandleProperties')?.classList.add('hidden-element');
            }

            const valuelabel = document.getElementById('valuelabel') as HTMLLabelElement;

            if (name == "selectElement") {
                valuelabel.innerText = 'Values';
            } else {
                valuelabel.innerText = 'Value';
            }
        }
    });


    document.getElementById('reset')?.addEventListener('click', () => {
        if (defaultElementSelected) {
            ipcRenderer.send('resetProperties', defaultElementSelected);
        } else {
            showError("No default element selected to reset properties.");
        }
    });

    global.on('resetOK', (...args: unknown[]) => {
        const updatedProperties = args[0] as Record<string, string>;
        if (!updatedProperties) return;
        // Update the UI fields in the defaults window with the new values
        const ellist = document.querySelectorAll('#propertiesList [id^="el"]');
        ellist.forEach(el => {
            const item = el as HTMLInputElement;
            if (item.name in updatedProperties) {
                let value = updatedProperties[item.name];
                if (utils.isElementOf(item.name, ['isEnabled', 'isVisible', 'isSelected', 'isChecked'])) {
                    value = (value === '1') ? 'true' : 'false';
                }
                item.value = value || '';
            }
        });
    });



});

