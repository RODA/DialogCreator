import { showError, coms } from "../modules/coms";
import { renderutils } from "../library/renderutils";
import { DBElements } from "../interfaces/database";
import { attachColorPickers, syncColorPickers } from "../library/colorpicker";

let defaultElementSelected = "";

document.addEventListener('DOMContentLoaded', () => {

    renderutils.setIntegers([
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

    // Attach color pickers once DOM is ready
    attachColorPickers();

    renderutils.setSignedIntegers([
        "startval",
        "maxval"
    ]);

    coms.on('defaultElementSelected', (...args: unknown[]) => {
        const name = typeof args[0] === 'string' ? args[0] : '';
        defaultElementSelected = name;
    });

    coms.on('propertiesFromDB', (...args: unknown[]) => {
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
                    const row = item.closest('.element-property') as HTMLElement | null;
                    if (row) row.classList.remove('hidden-element');
                    let value = properties[item.name as keyof DBElements[keyof DBElements]];
                    item.value = value || '';
                    item.addEventListener("change", async () => {
                        item.blur();
                        coms.sendTo(
                            'main',
                            'updateProperty',
                            name,
                            item.name,
                            item.value
                        );
                    });
                } else {
                    item.disabled = true;
                    const row = item.closest('.element-property') as HTMLElement | null;
                    if (row) row.classList.add('hidden-element');
                }
            });

            const colorlabel = document.getElementById('colorlabel') as HTMLLabelElement;

            // Sync color swatches after initial populate
            syncColorPickers();

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
            coms.sendTo('main', 'resetProperties', defaultElementSelected);
        } else {
            showError("No default element selected to reset properties.");
        }
    });

    coms.on('resetOK', (...args: unknown[]) => {
        const updatedProperties = args[0] as Record<string, string>;
        if (!updatedProperties) return;
        // Update the UI fields in the defaults window with the new values
        const ellist = document.querySelectorAll('#propertiesList [id^="el"]');
            ellist.forEach((el) => {
                const item = el as HTMLInputElement;
                if (item.name in updatedProperties) {
                    item.value = updatedProperties[item.name];
                }
            });
            syncColorPickers();
    });

});

