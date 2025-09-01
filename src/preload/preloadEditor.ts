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

global.on('elementSelected', (id) => {
    elementSelected = true;
    // enable arrange toolbar buttons
    (document.getElementById('bringToFront') as HTMLButtonElement).disabled = false;
    (document.getElementById('sendToBack') as HTMLButtonElement).disabled = false;
    (document.getElementById('bringForward') as HTMLButtonElement).disabled = false;
    (document.getElementById('sendBackward') as HTMLButtonElement).disabled = false;

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

    // Ensure the editor (grey) area shrinks by the height of the toolbar to keep total app height constant
    const updateToolbarHeightVar = () => {
        const toolbar = document.getElementById('editor-toolbar');
        if (!toolbar) return;
        const styles = window.getComputedStyle(toolbar);
        const marginTop = parseFloat(styles.marginTop || '0') || 0;
        const marginBottom = parseFloat(styles.marginBottom || '0') || 0;
        const total = Math.round(toolbar.offsetHeight + marginTop + marginBottom);
        document.documentElement.style.setProperty('--editor-toolbar-height', `${total}px`);
    };

    updateToolbarHeightVar();
    window.addEventListener('resize', updateToolbarHeightVar);

    // Observe toolbar size changes (safer if styles/fonts change)
    try {
        const RO = (window as unknown as { ResizeObserver?: new (cb: () => void) => { observe: (el: Element) => void } }).ResizeObserver;
        const toolbar = document.getElementById('editor-toolbar');
        if (RO && toolbar) {
            const ro = new RO(() => updateToolbarHeightVar());
            ro.observe(toolbar);
        }
    } catch {
        // no-op if ResizeObserver is unavailable
    }

    document.getElementById('removeElement')?.addEventListener('click', editor.removeSelectedElement);

    // Arrange buttons
    document.getElementById('bringToFront')?.addEventListener('click', editor.bringSelectedToFront);
    document.getElementById('sendToBack')?.addEventListener('click', editor.sendSelectedToBack);
    document.getElementById('bringForward')?.addEventListener('click', editor.bringSelectedForward);
    document.getElementById('sendBackward')?.addEventListener('click', editor.sendSelectedBackward);

    document.addEventListener('keyup', function (ev) {
        if (ev.code == 'Delete' || ev.code == 'Backspace') {
            if (utils.isTrue(elementSelected)) {
                if (document.activeElement?.tagName === 'BODY') {
                    editor.removeSelectedElement();
                }
            }
        }
    });

    // Keyboard shortcuts for arrange actions (Cmd/Ctrl + Arrow keys)
    document.addEventListener('keydown', function (ev) {
        if (!utils.isTrue(elementSelected)) return;
        const activeTag = document.activeElement?.tagName;
        if (activeTag && activeTag !== 'BODY') return;

        const metaOrCtrl = ev.metaKey || ev.ctrlKey;
        if (!metaOrCtrl) return;

        // Robust arrow detection across layouts: check code, key, and legacy keyCode
        const keyCode = (ev as unknown as { keyCode?: number }).keyCode;
        const isArrowUp =
            ev.code === 'ArrowUp' ||
            ev.key === 'ArrowUp' ||
            keyCode === 38;
        const isArrowDown =
            ev.code === 'ArrowDown' ||
            ev.key === 'ArrowDown' ||
            keyCode === 40;

        if (isArrowUp && ev.shiftKey) {
            ev.preventDefault();
            editor.bringSelectedToFront();
        } else if (isArrowDown && ev.shiftKey) {
            ev.preventDefault();
            editor.sendSelectedToBack();
        } else if (isArrowUp) {
            ev.preventDefault();
            editor.bringSelectedForward();
        } else if (isArrowDown) {
            ev.preventDefault();
            editor.sendSelectedBackward();
        }
    });

    document.getElementById('conditions')?.addEventListener('click', function () {
        const info = renderutils.getDialogInfo();

        if (!info.selected) {
            showError('Could not find the selected element. Please check the HTML!');
            return;
        }

        const dataset = info.selected.dataset;

        global.sendTo(
            'main',
            'secondWindow',
            {
                width: 640,
                height: 310,
                backgroundColor: '#fff',
                title: 'Conditions for element: ' + dataset.nameid,
                preload: 'preloadConditions.js',
                html: 'conditions.html',
                name: dataset.nameid,
                conditions: dataset.conditions,
                elements: info.elements,
                selected: info.selected.id // the id of the selected element
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


    global.on('setElementConditions', (...args: unknown[]) => {
        const element = document.getElementById(args[0] as string) as HTMLElement;
        const dataset = element.dataset;
        dataset.conditions = args[1] as string;
    });

    // When element gets deselected from editor logic
    global.on('elementDeselected', () => {
        elementSelected = false;
        (document.getElementById('removeElement') as HTMLButtonElement).disabled = true;
        (document.getElementById('bringToFront') as HTMLButtonElement).disabled = true;
        (document.getElementById('sendToBack') as HTMLButtonElement).disabled = true;
        (document.getElementById('bringForward') as HTMLButtonElement).disabled = true;
        (document.getElementById('sendBackward') as HTMLButtonElement).disabled = true;
    });
});





    // global.on('resetOK', (...args: unknown[]) => {
    //     const updatedProperties = args[0] as Record<string, string>;
    //     if (!updatedProperties) return;
    //     // Update the UI fields in the defaults window with the new values
    //     const ellist = document.querySelectorAll('#propertiesList [id^="el"]');
    //     ellist.forEach((el) => {
    //         const tag = el.tagName;
    //         const name = (el as HTMLInputElement).name;
    //         if (name in updatedProperties) {
    //             let value = updatedProperties[name];
    //             if (utils.isElementOf(name, ['isEnabled', 'isVisible', 'isSelected', 'isChecked'])) {
    //                 value = (value === '1' || utils.isTrue(value)) ? 'true' : 'false';
    //             }
    //             if (tag === 'SELECT') {
    //                 const select = el as HTMLSelectElement;
    //                 let v = (value || '').toString().trim().toLowerCase();
    //                 // Find the actual option value (in case of case/whitespace mismatch)
    //                 const realValue = Array.from(select.options).find(opt => opt.value.trim().toLowerCase() === v)?.value;
    //                 if (realValue) {
    //                     select.value = realValue;
    //                     setTimeout(() => {
    //                         select.selectedIndex = Array.from(select.options).findIndex(opt => opt.value === realValue);
    //                         select.dispatchEvent(new Event('change', { bubbles: true }));
    //                         console.log('After setTimeout, select.value:', select.value, 'selectedIndex:', select.selectedIndex, 'selected text:', select.options[select.selectedIndex]?.text);
    //                     }, 100);
    //                 } else {
    //                     select.value = 'false';
    //                 }
    //             } else {
    //                 (el as HTMLInputElement).value = value || '';
    //             }
    //         }
    //     });
    // });
