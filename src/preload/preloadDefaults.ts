import { showError, global } from "../modules/coms";
import { specifics } from "../library/specifics";
import { utils } from "../library/utils";
import { database } from "../database/database";
import { DBElements } from "../interfaces/database";

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

    global.on('defaultSelected', async (...args: unknown[]) => {
        // Defensive: get the name from args[0] and ensure it's a string
        const name = typeof args[0] === 'string' ? args[0] : '';

        // update properties tab
        document.getElementById('propertiesList')?.classList.remove('hidden');
        // const dataset = element.dataset; // TODO

        const ellist = document.querySelectorAll('#propertiesList [id^="el"]');

        // Capitalize the first letter for DB lookup
        const dbElementName = utils.capitalize(name.substring(0, name.length - 7));

        // Use DBElements type for type safety
        const properties = await database.getProperties(dbElementName as keyof DBElements);

        console.log(properties);

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
                item.addEventListener("change", () => {
                    item.blur();
                });
            } else {
                item.disabled = true;
                item.parentElement?.classList.add('hidden-element');
            }
        });

        const colorlabel = document.getElementById('colorlabel') as HTMLLabelElement;

        if (dbElementName === 'Slider') {
            colorlabel.innerText = 'Track color';
            document.getElementById('sliderHandleProperties')?.classList.remove('hidden-element');
        } else {
            colorlabel.innerText = 'Color';
            document.getElementById('sliderHandleProperties')?.classList.add('hidden-element');
        }


        const valuelabel = document.getElementById('valuelabel') as HTMLLabelElement;
        if (dbElementName == "Select") {
            valuelabel.innerText = 'Values';
        } else {
            valuelabel.innerText = 'Value';
        }
    });

});
