import { showError, global } from "../modules/coms";
import { specifics } from "../library/specifics";
import { elements } from "../modules/elements";

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

    global.on('defaultSelected', (name) => {
        // update props tab
        document.getElementById('propertiesList')?.classList.remove('hidden');
        // const dataset = element.dataset; // TODO

        const ellist = document.querySelectorAll('#propertiesList [id^="el"]');
        const properties = elements[name as keyof typeof elements]

        // disable all elements and hide everything | reseting props tab
        ellist.forEach(el => {
            const item = el as HTMLInputElement;
            if (item.name in properties) {
                // show main element
                item.disabled = false;
                item.parentElement?.classList.remove('hidden-element');
                const value = properties[item.name];
                item.value = String(value) || '';
                item.addEventListener("change", () => {
                    item.blur();
                });
            } else {
                item.disabled = true;
                item.parentElement?.classList.add('hidden-element');
            }
        });

        const colorlabel = document.getElementById('colorlabel') as HTMLLabelElement;

        if (properties.type === 'Slider') {
            colorlabel.innerText = 'Track color';
            document.getElementById('sliderHandleProperties')?.classList.remove('hidden-element');
        } else {
            colorlabel.innerText = 'Color';
            document.getElementById('sliderHandleProperties')?.classList.add('hidden-element');
        }


        const valuelabel = document.getElementById('valuelabel') as HTMLLabelElement;
        if (properties.type == "Select") {
            valuelabel.innerText = 'Values';
        } else {
            valuelabel.innerText = 'Value';
        }
    });

});
