
import { editor } from "../../editor/editor";
import { ElementsInterface } from '../../editor/elements';

document.addEventListener('DOMContentLoaded', () => {

    // show dialog props -- wait for event
    editor.editorEvents.on('dialogUpdate', function (props) {
        const properties: NodeListOf<HTMLInputElement> = document.querySelectorAll('#dlgProps [id^="dialog"]');
        for (const el of properties) {
            const key = el.getAttribute('name');
            el.value = props[key];
        }
    });

    // Paper Events ========================================
    // show element properties
    editor.editorEvents.on('selectElement', function (element: ElementsInterface[keyof ElementsInterface]) {

        // Later... elementSelected = true;

        // disable all elements and hide everything | reseting props tab
        document.querySelectorAll('#propertiesList [id^="el"]').forEach(item => {
            (item as HTMLInputElement).disabled = true;
            (item as HTMLInputElement).style.display = 'none';
        })

        // trigger change for the select element source values
        // if (element.dataSource) {
        //     document.getElementById('eldataSource').dispatchEvent(new Event('change'));
        // }

        // update props tab
        for (const key in element) {
            const el = document.getElementById('el' + key) as HTMLInputElement;
            if (el) {
                // show main element
                document.getElementById('propertiesList').style.display = 'block';
                el.disabled = false;
                el.style.display = 'block';
                el.parentElement.style.display = 'block';
                el.value = String(element[key as keyof ElementsInterface[keyof ElementsInterface]]);
                el.addEventListener('blur', (ev) => {
                    propertyUpdate(element.id, ev);
                });
            }
        }
        // disable update and remove button | force reselection
        (document.getElementById('removeElement') as HTMLButtonElement).disabled = false;

        // if(element.type === 'Container') {
        //     // trigger change for container
        //     $("#elobjViewClass" ).trigger("change");
        // }

    });

    const propertyUpdate = (elId: string, ev: FocusEvent) =>
    {
        // console.log(ev.target);
        const el = ev.target as HTMLInputElement
        editor.updateElement(elId, {prop: el.name.substring(2), value: el.value});

        // save on blur
        // element.addEventListener('blur', (ev) => {
        //     if (!enterPressed) {            
        //         // get all proprerties
        //         let properties = $('#propertiesList [id^="el"]');
        //         // save all properties to obj
        //         let obj = {};
        //         properties.each(function(){
        //             let el = $(this);
        //             if(!el.prop('disabled')){
        //                 let key = el.attr('name').substr(2);
        //                 obj[key] = el.val();
        //             }
        //         });       
        //         if(editor.paperExists === true && obj.type !== void 0) {
        //             // send obj for update
        //             editor.updateElement(obj);
        //         }
        //     } else {
        //         enterPressed = false;
        //     }
        // });
    }

    // draw available elements
    const elementsList = document.getElementById('elementsList');
    if (elementsList) {
        elementsList.innerHTML = '';
        elementsList.appendChild(editor.drawAvailableElements());
    } else {
        alert('Cound not find element list!')
    }

    // create new dialog when first opend
    const dialogContainer = document.getElementById('paper');
    if (dialogContainer) {
        editor.make(dialogContainer as HTMLDivElement);
    }


})

