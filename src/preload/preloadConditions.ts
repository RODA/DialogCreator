import { coms } from "../modules/coms";
import { conditions } from "../modules/conditions";

const test = `
enable if checkbox1 == checked & (radio1 == selected | counter1 == 3);
disable if checkbox1 != checked & radio2 == selected;
show if counter1 != 5;
hide if counter1 == 5;

enable if checkbox1 == checked;

// eroare neconforma la
enable of checkbox1 == checked;
`;

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
            coms.sendTo('editorWindow', 'setElementConditions', conditionsId.value, str);
            coms.sendTo('main', 'close-conditionsWindow');

        } else {

            if (!resized) {
                resized = true;
                coms.sendTo('main', "resize-conditionsWindow");
            }

            const conditionsInputs = document.getElementById('conditionsInputs') as HTMLDivElement;
            // Remove previous error message if present
            const prevError = conditionsInputs.querySelector('.condition-error');
            if (prevError) prevError.remove();
            conditionsInputs.insertAdjacentHTML('beforeend', `<div class="condition-error">${valid}</div>`);

        }

    });

});
