import { global } from "../modules/coms";
import { conditions } from "../modules/conditions";

document.addEventListener('DOMContentLoaded', () => {

    let resized = false;
    // send condtions for validation and to be saved
    document.getElementById('saveConditions')?.addEventListener('click', () => {
        const textarea = document.getElementById("conditions") as HTMLTextAreaElement;
        const str = textarea.value.trim();

        // const valid = '';
        const valid = conditions.validate(str);

        if (valid === '') {

            const conditionsId = document.getElementById("conditionsId") as HTMLInputElement;
            global.sendTo('editorWindow', 'setElementConditions', conditionsId.value, str);
            global.sendTo('main', 'close-conditionsWindow');

        } else {

            if (!resized) {
                resized = true;
                global.sendTo('main', "resize-conditionsWindow");
            }

            const conditionsInputs = document.getElementById('conditionsInputs') as HTMLDivElement;
            // Remove previous error message if present
            const prevError = conditionsInputs.querySelector('.condition-error');
            if (prevError) prevError.remove();
            conditionsInputs.insertAdjacentHTML('beforeend', `<div class="condition-error">${valid}</div>`);

        }

    });

});
