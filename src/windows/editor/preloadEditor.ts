
import { editor } from "../../editor/editor";
import { ElementsInterface } from '../../editor/elements';

// helpers for when enter key is pressed
let elementSelected = false;
let mouseDown = false;

document.addEventListener('DOMContentLoaded', () => {

    // show dialog props -- wait for event
    editor.editorEvents.on('dialogUpdate', function (props) {
        const properties: NodeListOf<HTMLInputElement> = document.querySelectorAll('#dialogProperties [id^="dialog"]');
        for (const el of properties) {
            const key = el.getAttribute('name');
            el.value = props[key];
        }
    });

    // Paper Events ========================================
    // show element properties
    editor.editorEvents.on('selectElement', function (element: ElementsInterface[keyof ElementsInterface]) {

        elementSelected = true;

        // update props tab
        document.getElementById('propertiesList').classList.remove('hidden');

        // disable all elements and hide everything | reseting props tab
        document.querySelectorAll('#propertiesList [id^="el"]').forEach(el => {

            const item = el as HTMLInputElement;
            if (element[item.name]) {
                // show main element
                item.disabled = false;
                item.parentElement.classList.remove('hidden-element');
                item.value = String(element[item.name as keyof ElementsInterface[keyof ElementsInterface]]);

                item.removeEventListener('blur', propertyUpdate);
                item.addEventListener('blur', propertyUpdate);

                if (item.tagName !== "SELECT") {
                    item.removeEventListener('keyup', propertyUpdateOnEnter);
                    item.addEventListener('keyup', propertyUpdateOnEnter);
                }
            } else {
                item.disabled = true;
                item.parentElement.classList.add('hidden-element');
            }
        });

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

    const propertyUpdate = (ev: FocusEvent) => {
        const el = ev.target as HTMLInputElement
        editor.updateElement({ prop: el.name.substring(2), value: el.value });
    }

    // On Enter blur element so it triggers update
    const propertyUpdateOnEnter = (ev: KeyboardEvent) => {
        if (ev.key == 'Enter') {
            if (elementSelected) {
                const el = ev.target as HTMLInputElement
                el.blur();
            }
        }
    }

    const removeElement = () => {
        editor.removeSelectedElement()
    }


    document.getElementById('removeElement').addEventListener('click', removeElement);

    // draw available elements
    const elementsList = document.getElementById('elementsList');
    if (elementsList) {
        elementsList.innerHTML = '';
        elementsList.appendChild(editor.drawAvailableElements());
    } else {
        alert('Cound not find element list!')
    }

    // create new dialog when first opend
    const dialogContainer = document.getElementById('dialog');
    if (dialogContainer) {
        editor.make(dialogContainer as HTMLDivElement);
    }

    // remove the element on delete or backspace key
    document.addEventListener('keyup', function (ev) {
        if (ev.code == 'Delete' || ev.code == 'Backspace') {
            if (elementSelected) {
                if (document.activeElement.tagName === 'BODY') {
                    removeElement();
                }
            }
        }
    });

    //     // Elements name (id) only leters and numbers and max 15 chars
    //     $('#elname').on("change paste keyup", function() {
    //         let newVal = $(this).val().replace(/[^a-z0-9]/g,'');
    //         newVal = (newVal.length < 15) ? newVal : newVal.slice(0, 15);  
    //         $(this).val(newVal);
    //      });
    //     // this.val.regex(/^[a-z0-9]+$/);

    // // update dialog properties
    // var propertyAddEvent = document.querySelectorAll('#dlgProps [id^="dialog"]');
    // for(let i = 0; i < propertyAddEvent.length; i++) {
    //     propertyAddEvent[i].addEventListener('keyup', (ev) => {
    //         if(ev.which == 13) {
    //             let properties = $('#dlgProps [id^="dialog"]');

    //             let obj = {};
    //             properties.each(function(){
    //                 let el = $(this);
    //                 let key = el.attr('name');
    //                 obj[key] = el.val();
    //             });                          
    //            editor.update(obj);
    //         }
    //     });
    //     // save on blur
    //     propertyAddEvent[i].addEventListener('blur', (ev) => {
    //         let properties = $('#dlgProps [id^="dialog"]');

    //         let obj = {};
    //         properties.each(function(){
    //             let el = $(this);
    //             let key = el.attr('name');
    //             obj[key] = el.val();
    //         });                          
    //        editor.update(obj);
    //     });
    // }

})

