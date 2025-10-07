import { showError, coms } from "../modules/coms";
import { renderutils } from "../library/renderutils";
import { utils } from "../library/utils";
import { Elements, AnyElement, keyofAnyElement, StringNumber } from '../interfaces/elements';
import { elements as els } from '../modules/elements';
import { attachColorPickers, syncColorPickers } from '../library/colorpicker';
import { dialog } from "../modules/dialog";
import { ipcRenderer } from 'electron';

let elements = { ...els } as Elements;
Object.keys(elements).forEach((element) => {
    coms.sendTo('main', 'getProperties', element);
});


// helpers for when enter key is pressed
let elementSelected = false;

// dialog -- the white part
// editor -- the whole window

// renderutils.elementsFromDB().then((items) => {
//     coms.elements = items;
// });


// On Enter blur element so it triggers update
// Use a generic EventListener type to satisfy addEventListener/removeEventListener.
let propertyUpdate: EventListener = function (_ev: Event) {}; // overwritten once the editor module is loaded
const propertyUpdateOnEnter = (ev: KeyboardEvent) => {
    if (ev.key == 'Enter') {
        if (utils.isTrue(elementSelected)) {
            const el = ev.target as HTMLInputElement;
            el.blur();
        }
    }
}

// Ephemeral multi-select helpers and listeners
let ephemeralLeftBlurHandler: ((ev: Event) => void) | null = null;
let ephemeralTopBlurHandler: ((ev: Event) => void) | null = null;

coms.on('elementSelected', (id) => {
    elementSelected = true;
    // enable arrange toolbar buttons
    (document.getElementById('bringToFront') as HTMLButtonElement).disabled = false;
    (document.getElementById('sendToBack') as HTMLButtonElement).disabled = false;
    (document.getElementById('bringForward') as HTMLButtonElement).disabled = false;
    (document.getElementById('sendBackward') as HTMLButtonElement).disabled = false;

    // Remove ephemeral multi-select listeners if any
    const leftInput0 = document.getElementById('elleft') as HTMLInputElement | null;
    const topInput0 = document.getElementById('eltop') as HTMLInputElement | null;
    if (leftInput0 && ephemeralLeftBlurHandler) {
        leftInput0.removeEventListener('blur', ephemeralLeftBlurHandler);
        ephemeralLeftBlurHandler = null;
    }
    if (topInput0 && ephemeralTopBlurHandler) {
        topInput0.removeEventListener('blur', ephemeralTopBlurHandler);
        ephemeralTopBlurHandler = null;
    }

    // update props tab
    const propsList = document.getElementById('propertiesList');
    if (!propsList) {
        console.warn('propertiesList element not found in DOM');
    } else {
        propsList.classList.remove('hidden');
        // Store the currently selected element id so property updates can still target it
        (propsList as HTMLDivElement).dataset.currentElementId = String(id);
    }
    const element = document.getElementById(id as string) as HTMLElement;
    const dataset = element.dataset;

    const ellist = document.querySelectorAll('#propertiesList [id^="el"]');
    // disable all elements and hide everything | reseting props tab
    ellist.forEach(el => {
        const item = el as HTMLInputElement | HTMLSelectElement;
        if (item.name in dataset) {
            // show main element
            item.disabled = false;
            const row = item.closest('.element-property') as HTMLElement | null;
            if (row) row.classList.remove('hidden-element');
            // Store the bound element id on the control for robust blur updates
            (item as HTMLInputElement | HTMLSelectElement).dataset.bindElementId = String(id);

            // Normalize boolean select values to 'true'/'false' strings
            const booleanProps = new Set(['isEnabled', 'isVisible', 'isSelected', 'isChecked']);
            let valueToSet = dataset[item.name] || '';
            if (item.tagName === 'SELECT' && booleanProps.has(item.name)) {
                valueToSet = utils.isTrue(valueToSet) ? 'true' : 'false';
            }
            (item as HTMLInputElement | HTMLSelectElement).value = valueToSet as string;

            item.removeEventListener('blur', propertyUpdate as EventListener);
            item.addEventListener('blur', propertyUpdate as EventListener);

            if (item.tagName !== "SELECT") {
                item.removeEventListener('keyup', propertyUpdateOnEnter as EventListener);
                item.addEventListener('keyup', propertyUpdateOnEnter as EventListener);
            } else {
                item.addEventListener("change", () => {
                    item.blur();
                });
            }
        } else {
            item.disabled = true;
            const row = item.closest('.element-property') as HTMLElement | null;
            if (row) row.classList.add('hidden-element');
        }
    });

    // After values are populated, sync color swatches with current input values
    syncColorPickers();

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

    // Container-specific: lock Selection when Content type is Dataset
    if (dataset.type === 'Container') {
        const contentType = document.getElementById('elcontentType') as HTMLSelectElement | null;
        const selection = document.getElementById('elselection') as HTMLSelectElement | null;
        const applySelectionLock = () => {
            if (!contentType || !selection) return;
            const isDataset = (contentType.value || '').toLowerCase() === 'dataset';
            if (isDataset) {
                selection.value = 'single';
                selection.disabled = true;
                // Reflect change on the element if needed
                if (element && element.dataset.selection !== 'single') {
                    renderutils.updateElement(element, { selection: 'single' } as StringNumber);
                    element.dataset.selection = 'single';
                }
            } else {
                selection.disabled = false;
            }
        };
        // Initial apply based on current values
        applySelectionLock();
        // Re-apply on content type change
        if (contentType) {
            contentType.addEventListener('change', () => {
                // propertyUpdate will also run; enforce UI and value here
                applySelectionLock();
            });
        }
    }


    // trigger change for the select element source values
    // if (element.dataSource) {
    //     document.getElementById('eldataSource').dispatchEvent(new Event('change'));
    // }
    // if(element.type === 'Container') {
    //     // trigger change for container
    //     $("#elcontentType" ).trigger("change");
    // }

    // disable update and remove button | force reselection
    (document.getElementById('removeElement') as HTMLButtonElement).disabled = false;

    // Enable/disable group/ungroup toolbar buttons
    const groupBtn = document.getElementById('groupElements') as HTMLButtonElement | null;
    const ungroupBtn = document.getElementById('ungroupElements') as HTMLButtonElement | null;
    if (groupBtn && ungroupBtn) {
        const selectedCount = document.querySelectorAll('#dialog .selectedElement').length;
        // Check if this is a group element (from lasso selection)
        const isGroup = element.classList.contains('element-group');
        groupBtn.disabled = !(selectedCount >= 2 && !isGroup);
        ungroupBtn.disabled = !isGroup;
    }

});

    // Multi-selection (ephemeral): show group-like properties (Left/Top + read-only Width/Height) and enable Group button
coms.on('elementSelectedMultiple', (...args: unknown[]) => {
    elementSelected = true;

    // Show properties panel and prepare fields
    const propsList = document.getElementById('propertiesList');
    if (propsList) {
        // Clear stored currentElementId since we are not in single-element editing
        (propsList as HTMLDivElement).dataset.currentElementId = '';
        propsList.classList.remove('hidden');
        // Hide all per-element fields
        document.querySelectorAll('#propertiesList .element-property').forEach(item => {
            item.classList.add('hidden-element');
        });
        // Show a minimal set for the multi-selection "group": Type, Left, Top
        const typeInput = document.getElementById('eltype') as HTMLInputElement | null;
        const leftInput = document.getElementById('elleft') as HTMLInputElement | null;
        const topInput = document.getElementById('eltop') as HTMLInputElement | null;

        // Detach any previous ephemeral listeners
        if (leftInput && ephemeralLeftBlurHandler) {
            leftInput.removeEventListener('blur', ephemeralLeftBlurHandler);
            ephemeralLeftBlurHandler = null;
        }
        if (topInput && ephemeralTopBlurHandler) {
            topInput.removeEventListener('blur', ephemeralTopBlurHandler);
            ephemeralTopBlurHandler = null;
        }

        // Also make sure the generic single-element listeners do not conflict on these two fields
        if (leftInput) leftInput.removeEventListener('blur', propertyUpdate as EventListener);
        if (topInput) topInput.removeEventListener('blur', propertyUpdate as EventListener);
        if (leftInput) leftInput.removeEventListener('keyup', propertyUpdateOnEnter as EventListener);
        if (topInput) topInput.removeEventListener('keyup', propertyUpdateOnEnter as EventListener);

        const fallback = { left: 0, top: 0, width: 0, height: 0 };

        // Compute current bounds of selection and populate
        const bounds = renderutils.computeBounds(renderutils.getSelectedIds()) || fallback;
        if (typeInput) {
            typeInput.value = 'Multiple selection';
            typeInput.parentElement?.classList.remove('hidden-element');
        }
        if (leftInput) {
            leftInput.value = String(bounds.left);
            leftInput.disabled = false;
            leftInput.parentElement?.classList.remove('hidden-element');
        }
        if (topInput) {
            topInput.value = String(bounds.top);
            topInput.disabled = false;
            topInput.parentElement?.classList.remove('hidden-element');
        }
        // Intentionally hide Width/Height for ephemeral group — not part of groupElementType

        // Attach ephemeral blur handlers to move the whole selection when Left/Top change
        if (leftInput) {
            ephemeralLeftBlurHandler = () => {
                const current = renderutils.computeBounds(renderutils.getSelectedIds()) || fallback;
                const desiredLeft = Number(leftInput.value) || current.left;
                const dx = desiredLeft - current.left;
                if (dx !== 0) {
                    renderutils.moveElementsBy(renderutils.getSelectedIds(), dx, 0);
                    const b = renderutils.computeBounds(renderutils.getSelectedIds()) || fallback;
                    leftInput.value = String(b.left);
                }
            };
            leftInput.addEventListener('blur', ephemeralLeftBlurHandler);
            leftInput.addEventListener('keyup', propertyUpdateOnEnter as EventListener);
        }
        if (topInput) {
            ephemeralTopBlurHandler = () => {
                const current = renderutils.computeBounds(renderutils.getSelectedIds()) || fallback;
                const desiredTop = Number(topInput.value) || current.top;
                const dy = desiredTop - current.top;
                if (dy !== 0) {
                    renderutils.moveElementsBy(renderutils.getSelectedIds(), 0, dy);
                    const b = renderutils.computeBounds(renderutils.getSelectedIds()) || fallback;
                    topInput.value = String(b.top);
                }
            };
            topInput.addEventListener('blur', ephemeralTopBlurHandler);
            topInput.addEventListener('keyup', propertyUpdateOnEnter as EventListener);
        }
    }

    // Enable arrange toolbar buttons
    (document.getElementById('bringToFront') as HTMLButtonElement).disabled = false;
    (document.getElementById('sendToBack') as HTMLButtonElement).disabled = false;
    (document.getElementById('bringForward') as HTMLButtonElement).disabled = false;
    (document.getElementById('sendBackward') as HTMLButtonElement).disabled = false;

    const groupBtn = document.getElementById('groupElements') as HTMLButtonElement | null;
    const ungroupBtn = document.getElementById('ungroupElements') as HTMLButtonElement | null;
    if (groupBtn && ungroupBtn) {
        const selectedCount = document.querySelectorAll('#dialog .selectedElement').length;
        // Ephemeral multi-select cannot be a group yet
        groupBtn.disabled = !(selectedCount >= 2);
        ungroupBtn.disabled = true;
    }
});


window.addEventListener("DOMContentLoaded", async () => {

    // Dynamically import the editor module and run its setup
    const { editor } = await import("../modules/editor");

    propertyUpdate = editor.propertyUpdate as unknown as EventListener;

    // Run the main setup logic for the editor window
    // (mimics the previous top-level code in this file)
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

    renderutils.setSignedIntegers([
        "startval",
        "maxval"
    ]);

    editor.initializeDialogProperties();
    editor.makeDialog();
    editor.addAvailableElementsTo("editor");
    editor.addDefaultsButton();

    // Enable Syntax button and wire it
    const btn = document.getElementById('dialog-syntax') as HTMLButtonElement | null;
    if (btn) {
        btn.disabled = false;
        btn.addEventListener('click', () => {
            const json = editor.stringifyDialog();
            const screenW = Number(window.innerWidth) || 1024;
            const width = Math.max(560, Math.round(screenW * 0.66)); // ~1/3 narrower than editor
            const height = 480; // reduce height a bit as well
            coms.sendTo('main', 'secondWindow', {
                width,
                height,
                useContentSize: true,
                autoHideMenuBar: true,
                backgroundColor: '#ffffff',
                title: 'Syntax',
                preload: 'preloadSyntax.js',
                html: 'syntax.html',
                data: json
            });
        });
    }

    // Attach color pickers to all color-related fields in the properties panel
    attachColorPickers();

    // Enhance custom buttons with press feedback
    renderutils.enhanceButtons(document);

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
    type ROType = {
        ResizeObserver?: new (cb: () => void) => { observe: (el: Element) => void }
    };

    try {
        const RO = (window as unknown as ROType).ResizeObserver;
        const toolbar = document.getElementById('editor-toolbar');
        if (RO && toolbar) {
            const ro = new RO(() => updateToolbarHeightVar());
            ro.observe(toolbar);
        }
    } catch {
        // ResizeObserver is unavailable
    }

    document.getElementById('removeElement')?.addEventListener('click', editor.removeSelectedElement);

    // Respond to save request from main: serialize dialog and send back
    ipcRenderer.on('request-dialog-json', () => {
        try {
            const json = editor.stringifyDialog();
            ipcRenderer.send('send-to', 'main', 'dialog-json', json);
        } catch (error) {
            ipcRenderer.send('send-to', 'main', 'dialog-json', '');
        }
    });

    // Respond to load dialog request from main
    ipcRenderer.on('load-dialog-json', (_ev, data: unknown) => {
        try {
            editor.loadDialogFromJson?.(data);
        } catch (error) {
            console.error('Failed to load dialog JSON', error);
        }
    });

    // Persist syntax text coming from Syntax window
    coms.on('setDialogSyntaxText', (text: unknown) => {
        const t = typeof text === 'string' ? text : '';
        dialog.syntax = dialog.syntax || { command: '' };
        dialog.syntax.command = t;
    });

    // Arrange buttons
    document.getElementById('bringToFront')?.addEventListener('click', editor.bringSelectedToFront);
    document.getElementById('sendToBack')?.addEventListener('click', editor.sendSelectedToBack);
    document.getElementById('bringForward')?.addEventListener('click', editor.bringSelectedForward);
    document.getElementById('sendBackward')?.addEventListener('click', editor.sendSelectedBackward);

    // Grouping buttons
    document.getElementById('groupElements')?.addEventListener('click', () => editor.groupSelection());
    document.getElementById('ungroupElements')?.addEventListener('click', () => editor.ungroupSelection());

    document.addEventListener('keyup', function (ev) {
        if (ev.code === 'Delete' || ev.code === 'Backspace') {
            if (!utils.isTrue(elementSelected)) return;
            const ae = document.activeElement as HTMLElement | null;
            const tag = (ae?.tagName || '').toUpperCase();
            const isEditable = !!ae && (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || ae.isContentEditable);
            if (isEditable) return; // don't delete while actively editing a field
            editor.removeSelectedElement();
            ev.preventDefault();
        }
    });

    // Nudge movement with Arrow keys (no modifier)
    document.addEventListener('keydown', function (ev) {
        if (!utils.isTrue(elementSelected)) return;
        const activeTag = document.activeElement?.tagName;
        if (activeTag && activeTag !== 'BODY') return;
        // Skip if using Cmd/Ctrl — those are reserved for arrange actions
        if (ev.metaKey || ev.ctrlKey) return;

        const keyCode = (ev as unknown as { keyCode?: number }).keyCode;
        const isArrowUp = ev.code === 'ArrowUp' || ev.key === 'ArrowUp' || keyCode === 38;
        const isArrowDown = ev.code === 'ArrowDown' || ev.key === 'ArrowDown' || keyCode === 40;
        const isArrowLeft = ev.code === 'ArrowLeft' || ev.key === 'ArrowLeft' || keyCode === 37;
        const isArrowRight = ev.code === 'ArrowRight' || ev.key === 'ArrowRight' || keyCode === 39;
        if (!(isArrowUp || isArrowDown || isArrowLeft || isArrowRight)) return;

        const step = ev.shiftKey ? 10 : 1;

        // Check how many elements are currently selected in the canvas
        const selectedEls = Array.from(document.querySelectorAll('#dialog .selectedElement')) as HTMLElement[];
        if (selectedEls.length === 0) return;

        if (selectedEls.length > 1) {
            // Ephemeral multi-selection: nudge all selected elements together
            let dx = 0, dy = 0;
            if (isArrowUp) dy = -step;
            if (isArrowDown) dy = step;
            if (isArrowLeft) dx = -step;
            if (isArrowRight) dx = step;
            if (dx !== 0 || dy !== 0) {
                for (const sel of selectedEls) {
                    const currentLeft = Number(sel.dataset.left ?? (parseInt(sel.style.left || '0', 10) || 0));
                    const currentTop = Number(sel.dataset.top ?? (parseInt(sel.style.top || '0', 10) || 0));
                    const props = {
                        left: currentLeft + dx,
                        top: currentTop + dy
                    } as StringNumber;
                    renderutils.updateElement(sel, props);
                    sel.dataset.left = String(props.left);
                    sel.dataset.top = String(props.top);
                }
            }
        } else {
            // Single selection (or a persistent group container)
            const info = renderutils.getDialogInfo();
            const el = info.selected as HTMLElement | null;
            if (!el) return;

            const currentLeft = Number(el.dataset.left ?? (parseInt(el.style.left || '0', 10) || 0));
            const currentTop = Number(el.dataset.top ?? (parseInt(el.style.top || '0', 10) || 0));
            let newLeft = currentLeft;
            let newTop = currentTop;

            if (isArrowUp) newTop = currentTop - step;
            if (isArrowDown) newTop = currentTop + step;
            if (isArrowLeft) newLeft = currentLeft - step;
            if (isArrowRight) newLeft = currentLeft + step;

            const props = {} as StringNumber;
            if (newLeft !== currentLeft) props.left = newLeft;
            if (newTop !== currentTop) props.top = newTop;
            if (Object.keys(props).length) {
                renderutils.updateElement(el, props);
                if (props.left !== undefined) el.dataset.left = String(props.left);
                if (props.top !== undefined) el.dataset.top = String(props.top);
            }
        }

        ev.preventDefault();
    });

    // Keyboard shortcuts for arrange actions (Cmd/Ctrl + Arrow keys) and grouping (Cmd/Ctrl + G)
    document.addEventListener('keydown', function (ev) {
        if (!utils.isTrue(elementSelected)) return;
        const activeTag = document.activeElement?.tagName;
        if (activeTag && activeTag !== 'BODY') return;

        const metaOrCtrl = ev.metaKey || ev.ctrlKey;
        if (!metaOrCtrl) return;

        // Group/Ungroup shortcuts
        // Use code 'KeyG' when available, fallback to key comparison
        const isKeyG = ev.code === 'KeyG' || ev.key?.toLowerCase() === 'g';
        if (isKeyG) {
            ev.preventDefault();
            if (ev.shiftKey) {
                editor.ungroupSelection();
            } else {
                editor.groupSelection();
            }
            return;
        }


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

    // Global Select All (Cmd/Ctrl + A) — works even when nothing is selected
    document.addEventListener('keydown', function (ev) {
        const metaOrCtrl = ev.metaKey || ev.ctrlKey;
        const isA = ev.code === 'KeyA' || (ev.key && ev.key.toLowerCase() === 'a');
        if (!metaOrCtrl || !isA) return;
        const activeTag = document.activeElement?.tagName;
        if (activeTag && activeTag !== 'BODY') return; // don't hijack text inputs
        ev.preventDefault();
        editor.selectAll?.();
    });

    // Clear dialog handler for New menu (select all + remove)
    ipcRenderer.on('newDialogClear', () => {
        editor.selectAll?.();
        editor.removeSelectedElement?.();
    });

    document.getElementById('conditions')?.addEventListener('click', function () {
        const info = renderutils.getDialogInfo();

        if (!info.selected) {
            showError('Could not find the selected element. Please check the HTML!');
            return;
        }

        const dataset = info.selected.dataset;
        const isGroup = (dataset.type === 'Group') || info.selected.classList.contains('element-group');
        const condText = isGroup ? (dataset.groupConditions || '') : (dataset.conditions || '');

        coms.sendTo(
            'main',
            'secondWindow',
            {
                width: 640,
                height: 310,
                backgroundColor: '#fff',
                title: 'Conditions for element: ' + (dataset.nameid || dataset.type || ''),
                preload: 'preloadConditions.js',
                html: 'conditions.html',
                name: dataset.nameid || dataset.type || '',
                conditions: condText,
                elements: info.elements,
                selected: info.selected.id // the id of the selected element
            }
        );
    });

    coms.on("propertiesFromDB", (...args: unknown[]) => {
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
                // elements[name][pkey] = value;
                if (utils.isKeyOf(elements, name)) {
                    const element = elements[name] as AnyElement;
                    const k = pkey as keyofAnyElement;
                    if (k in element) {
                        (element as any)[k] = value; // safe enough after the above guard
                    }
                }
            }
        }
    });


    coms.on('setElementConditions', (...args: unknown[]) => {
        const targetId = String(args[0] || '');
        const text = String(args[1] || '');
        const element = document.getElementById(targetId) as HTMLElement | null;
        if (!element) return;

        const isGroup = element.classList.contains('element-group') || String(element.dataset?.type || '') === 'Group';
        if (isGroup) {
            // Store separately so it can be applied at runtime to all members, without overwriting per-element rules
            element.dataset.groupConditions = text;
        } else {
            element.dataset.conditions = text;
        }
    });

    // When element gets deselected from editor logic
    coms.on('elementDeselected', () => {
        elementSelected = false;
        // Clear stored selection id to avoid updates after deselect
        const propsList = document.getElementById('propertiesList') as HTMLDivElement | null;
        if (propsList && propsList.dataset) propsList.dataset.currentElementId = '';
        (document.getElementById('removeElement') as HTMLButtonElement).disabled = true;
        (document.getElementById('bringToFront') as HTMLButtonElement).disabled = true;
        (document.getElementById('sendToBack') as HTMLButtonElement).disabled = true;
        (document.getElementById('bringForward') as HTMLButtonElement).disabled = true;
        (document.getElementById('sendBackward') as HTMLButtonElement).disabled = true;
        const groupBtn = document.getElementById('groupElements') as HTMLButtonElement | null;
        const ungroupBtn = document.getElementById('ungroupElements') as HTMLButtonElement | null;
        if (groupBtn) groupBtn.disabled = true;
        if (ungroupBtn) ungroupBtn.disabled = true;
    });
});





    // coms.on('resetOK', (...args: unknown[]) => {
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
