import { showMessage, showError, coms } from "./coms";
import { editorSettings } from './settings';
import { Editor } from '../interfaces/editor';
import { Elements, AnyElement } from '../interfaces/elements';
import { elements } from './elements';
import { DialogProperties } from "../interfaces/dialog";
import { v4 as uuidv4 } from 'uuid';
import { dialog } from './dialog';
import { renderutils } from '../library/renderutils';
import { utils } from '../library/utils';

const multiSelected = new Set<string>();
const suppressClickFor = new Set<string>();
let currentGroupId: string | null = null;

// Ephemeral multi-drag state and outline
let multiDragActive = false;
const multiDragSnapshot = new Map<string, { left: number; top: number; width: number; height: number }>();
let dragStart = { x: 0, y: 0 };
let multiOutline: HTMLDivElement | null = null;


// moved to renderutils.updateMultiOutline(canvas, ids, outline)

// moved to renderutils.clearMultiOutline(outline)

function makeGroupFromSelection(persistent = false) {
    if (multiSelected.size <= 1) {
        if (multiSelected.size === 1) {
            const only = Array.from(multiSelected)[0];
            dialog.selectedElement = only;
            coms.emit('elementSelected', only);
        } else {
            dialog.selectedElement = '';
            coms.emit('elementDeselected');
        }
        multiOutline = renderutils.clearMultiOutline(multiOutline);
        return;
    }

    const ids = Array.from(multiSelected);
    if (!persistent) {
        multiOutline = renderutils.clearMultiOutline(multiOutline);
        dialog.selectedElement = '';
        coms.emit('elementSelectedMultiple');
        return;
    }

    const groupId = renderutils.makeGroupFromSelection(ids, true);
    if (!groupId) return;
    const groupEl = dialog.getElement(groupId) as HTMLElement | undefined;
    if (!groupEl) return;
    editor.addElementListeners(groupEl);
    groupEl.classList.add('selectedElement');
    multiSelected.clear();
    multiSelected.add(groupId);
    dialog.selectedElement = groupId;
    currentGroupId = groupId;
    coms.emit('elementSelected', groupId);
}

export const editor: Editor = {

    makeDialog: () => {

        const newDialogID = uuidv4();
        dialog.canvas.id = newDialogID;
        dialog.id = newDialogID;

        dialog.canvas.style.position = 'relative';
        dialog.canvas.style.width = editorSettings.dialog.width + 'px';
        dialog.canvas.style.height = editorSettings.dialog.height + 'px';
        dialog.canvas.style.backgroundColor = editorSettings.dialog.background || '#ffffff';
        dialog.canvas.style.border = '1px solid gray';
        dialog.canvas.addEventListener('click', (event: MouseEvent) => {
            // Ignore the synthetic click that follows a lasso selection
            if (skipCanvasClickOnce) {
                skipCanvasClickOnce = false;
                event.stopPropagation();
                event.preventDefault();
                return;
            }
            if ((event.target as HTMLDivElement).id === dialog.id) {
                // If a property input is active, blur it first to commit changes
                const active = document.activeElement as HTMLElement | null;
                if (active && active.closest('#propertiesList')) {
                    try { (active as HTMLElement).blur(); } catch {}
                }
                editor.deselectAll();
            }
        });
        dialog.canvas.addEventListener("drop", (event: MouseEvent) => {
            event.preventDefault();
        });

        // Lasso selection (click-and-drag rectangle on empty canvas)
        let lassoActive = false;
        let lassoStart = { x: 0, y: 0 };
        let lassoDiv: HTMLDivElement | null = null;
        // Used to suppress the click on the canvas that follows a lasso mouseup
        let skipCanvasClickOnce = false;

        dialog.canvas.addEventListener('mousedown', (e: MouseEvent) => {
            if ((e.target as HTMLElement).id !== dialog.id) return;
            // Commit any in-progress property edits before starting lasso
            const active = document.activeElement as HTMLElement | null;
            if (active && active.closest('#propertiesList')) {
                try { active.blur(); } catch {}
            }
            const rect = dialog.canvas.getBoundingClientRect();
            lassoActive = true;
            lassoStart = { x: e.clientX - rect.left, y: e.clientY - rect.top };

            lassoDiv = document.createElement('div');
            lassoDiv.className = 'lasso-rect';
            lassoDiv.style.left = lassoStart.x + 'px';
            lassoDiv.style.top = lassoStart.y + 'px';
            lassoDiv.style.width = '0px';
            lassoDiv.style.height = '0px';
            dialog.canvas.appendChild(lassoDiv);
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e: MouseEvent) => {
            if (!lassoActive || !lassoDiv) return;
            const rect = dialog.canvas.getBoundingClientRect();
            const currX = e.clientX - rect.left;
            const currY = e.clientY - rect.top;
            const left = Math.min(currX, lassoStart.x);
            const top = Math.min(currY, lassoStart.y);
            const width = Math.abs(currX - lassoStart.x);
            const height = Math.abs(currY - lassoStart.y);
            lassoDiv.style.left = left + 'px';
            lassoDiv.style.top = top + 'px';
            lassoDiv.style.width = width + 'px';
            lassoDiv.style.height = height + 'px';
        });

        const endLasso = (e: MouseEvent) => {
            if (!lassoActive) return;
            const additive = e.shiftKey;
            const rect = dialog.canvas.getBoundingClientRect();
            const endX = e.clientX - rect.left;
            const endY = e.clientY - rect.top;
            const left = Math.min(endX, lassoStart.x);
            const top = Math.min(endY, lassoStart.y);
            const width = Math.abs(endX - lassoStart.x);
            const height = Math.abs(endY - lassoStart.y);
            if (lassoDiv && lassoDiv.parentElement) lassoDiv.parentElement.removeChild(lassoDiv);
            lassoDiv = null;
            lassoActive = false;
            if (width < 3 && height < 3 && !additive) {
                editor.deselectAll();
                return;
            }
            const selRectangle = { left, top, right: left + width, bottom: top + height };
            if (!additive) {
                editor.deselectAll();
            }
            const children = Array.from(dialog.canvas.children) as HTMLElement[];
            children.forEach((el) => {
                // Skip lasso rect itself and any existing groups
                if (el.classList.contains('lasso-rect') || el.classList.contains('element-group')) {
                    return;
                }
                const elRectangle = el.getBoundingClientRect();
                const canvasRect = dialog.canvas.getBoundingClientRect();
                const rel = {
                    left: elRectangle.left - canvasRect.left,
                    top: elRectangle.top - canvasRect.top,
                    right: elRectangle.right - canvasRect.left,
                    bottom: elRectangle.bottom - canvasRect.top
                };
                const overlap = !(rel.left > selRectangle.right || rel.right < selRectangle.left || rel.top > selRectangle.bottom || rel.bottom < selRectangle.top);
                if (overlap) {
                    el.classList.add('selectedElement');
                    multiSelected.add(el.id);
                }
            });
            // Prevent the canvas click that follows mouseup from clearing the new selection
            skipCanvasClickOnce = true;
            makeGroupFromSelection();
        };
        document.addEventListener('mouseup', endLasso);

        const dialogdiv = document.getElementById('dialog') as HTMLDivElement;
        if (dialogdiv) {
            dialogdiv.append(dialog.canvas);
        }

        const properties: NodeListOf<HTMLInputElement> = document.querySelectorAll('#dialog-properties [id^="dialog"]');

        properties.forEach((item) => {
            const key = item.getAttribute('name') as keyof DialogProperties;
            if (key) {
                item.value = editorSettings.dialog[key] || '';
            }
        });

        dialog.properties = editorSettings.dialog;

    },

    updateDialogArea: function (properties) {

        // check for valid paper
        if (dialog.id !== '') {

            if (properties.width != dialog.properties.width) {
                dialog.canvas.style.width =  properties.width + 'px';
            }

            if (properties.height != dialog.properties.height) {
                dialog.canvas.style.height =  properties.height + 'px';
            }

            if (properties.fontSize != dialog.properties.fontSize) {
                // TODO: modify all elements that have font size

            }

            dialog.properties = properties;

        } else {
            // alert no dialog
            showMessage(
                "info",
                "No dialog",
                "Please create a new dialog first."
            );
        }

    },

    addAvailableElementsTo: function(window) {
        const elementsList = document.getElementById('elementsList');
        if (elementsList) {
            elementsList.innerHTML = '';

            let availableElements = Object.keys(elements);
            // Exclude Group from the addable elements in both editor and defaults windows
            if (window === 'editor' || window === 'defaults') {
                availableElements = availableElements.filter(name => name !== 'groupElement');
            }

            const ul = document.createElement('ul');
            ul.setAttribute('id', 'paperAvailableElements');
            for (const name of availableElements) {
                const li = document.createElement('li');
                li.setAttribute('id', uuidv4());

                // Remove the sufix "Element" from the name of the element
                li.textContent = utils.capitalize(name.substring(0, name.length - 7));

                li.addEventListener('click', () => {

                    if (window === "defaults") {
                        // Remove highlight from all siblings
                        ul.querySelectorAll('li').forEach((el) => {
                            el.classList.remove('selected-available-element');
                        });
                        // Highlight this one
                        li.classList.add('selected-available-element');

                        // this sends a message within the same ("defaults", second) window
                        // useful when the click event is created in a different module, like here
                        // basically a "note to self"
                        coms.emit('defaultElementSelected', name);

                        coms.sendTo('main', 'getProperties', name);

                    } else if (window === "editor") {
                        const elementType = name as keyof Elements;
                        editor.addElementToDialog(
                            String(li.textContent),
                            elements[elementType],
                        );
                    }
                });
                ul.appendChild(li);
            }

            elementsList.appendChild(ul);

        } else {
            showError('Could not find the element list in editor window. Please check the HTML!')
        }
    },

    // add new element on dialog
    addElementToDialog: function (name, data) {
        if (data) {
            // Create the core element as before
            const core = renderutils.makeElement({ ...data });
            // The core factory often sets dataset.type from data.type, but we normalize it to the name from UI
            core.dataset.type = name;

            // Build a wrapper that carries the dataset and positioning
            const wrapper = document.createElement('div');
            wrapper.classList.add('element-wrapper');
            wrapper.style.position = 'absolute';

            // Transfer id and dataset from core to wrapper
            const origId = core.id;
            wrapper.id = origId; // keep original id on wrapper so internal parts (#checkbox-<id>, etc.) continue to work
            core.id = origId + '-inner'; // ensure DOM id uniqueness for the inner element

            // Position wrapper where the core element would have been
            wrapper.style.left = core.style.left;
            wrapper.style.top = core.style.top;

            // Copy all dataset attributes onto the wrapper
            for (const [k, v] of Object.entries(core.dataset)) {
                if (typeof v === 'string') wrapper.dataset[k] = v;
            }
            // Ensure parentId reflects dialog id
            wrapper.dataset.parentId = dialog.id;

            // The inner element should sit at (0,0) inside the wrapper
            core.style.left = '0px';
            core.style.top = '0px';
            // For Button, use normal flow so wrapper can size to content
            if (wrapper.dataset.type === 'Button') {
                core.style.position = 'relative';
            }

            // Assemble
            wrapper.appendChild(core);
            dialog.canvas.appendChild(wrapper);

            // Remove any inner cover created by factory (checkbox/radio)
            try {
                const innerCover = core.querySelector('.elementcover');
                if (innerCover && innerCover.parentElement) {
                    innerCover.parentElement.removeChild(innerCover);
                }
            } catch {}

            // Set wrapper size for non-button elements; for buttons, avoid fixing width
            try {
                const isButton = (wrapper.dataset.type === 'Button');
                if (!isButton) {
                    const rect = core.getBoundingClientRect();
                    if (rect.width > 0) wrapper.style.width = `${Math.round(rect.width)}px`;
                    if (rect.height > 0) wrapper.style.height = `${Math.round(rect.height)}px`;
                } else {
                    // Let the wrapper auto-size to the button content; no explicit width/height here
                }
            } catch {}

            // Add a universal cover at wrapper level to block inner interactions in editor
            const cover = document.createElement('div');
            cover.id = `cover-${wrapper.id}`;
            cover.className = 'elementcover';
            wrapper.appendChild(cover);

            // Register
            editor.addElementListeners(wrapper);
            dialog.addElement(wrapper);
        }
    },

    // add listener to the element
    addElementListeners(element) {
        element.addEventListener('click', (event: MouseEvent) => {
            event.stopPropagation();

            // Prefer selecting the group if this element is inside one
            const groupAncestor = element.classList.contains('element-group')
                ? element
                : (element.closest('.element-group') as HTMLElement | null);
            if (groupAncestor && !element.classList.contains('element-group')) {
                if (suppressClickFor.has(groupAncestor.id)) {
                    suppressClickFor.delete(groupAncestor.id);
                    return;
                }
                // Clear any existing selections (deep) and outline
                dialog.canvas.querySelectorAll('.selectedElement').forEach((el) => el.classList.remove('selectedElement'));
                multiOutline = renderutils.clearMultiOutline(multiOutline);

                groupAncestor.classList.add('selectedElement');
                // Remove selection from group's descendants to avoid double outlines
                groupAncestor.querySelectorAll('.selectedElement').forEach((el) => el.classList.remove('selectedElement'));

                multiSelected.clear();
                multiSelected.add(groupAncestor.id);
                dialog.selectedElement = groupAncestor.id;
                currentGroupId = groupAncestor.id;
                coms.emit('elementSelected', groupAncestor.id);
                return;
            }

            if (suppressClickFor.has(element.id)) {
                suppressClickFor.delete(element.id);
                return;
            }
            const shift = event.shiftKey;
            if (shift) {
                if (element.classList.contains('selectedElement')) {
                    element.classList.remove('selectedElement');
                    multiSelected.delete(element.id);
                    if (dialog.selectedElement === element.id) {
                        dialog.selectedElement = '';
                        coms.emit('elementDeselected');
                    }
                } else {
                    element.classList.add('selectedElement');
                    multiSelected.add(element.id);
                    dialog.selectedElement = element.id;
                    coms.emit('elementSelected', element.id);
                }
                makeGroupFromSelection();
                return;
            }
            editor.deselectAll();
            element.classList.add('selectedElement');
            multiSelected.add(element.id);
            dialog.selectedElement = element.id;
            coms.emit('elementSelected', element.id);
        })

        editor.addDragAndDrop(element);
    },

    addDragAndDrop(element) {
        const dialogW = dialog.canvas.getBoundingClientRect().width;
        const dialogH = dialog.canvas.getBoundingClientRect().height;
        let top = 0;
        let left = 0;
        let elementWidth = 0;
        let elementHeight = 0;
        let offsetX: number = 0, offsetY: number = 0, isDragging = false, isMoved = false;

        // The element that will actually move (a group container if present, otherwise the element itself)
        let dragTarget: HTMLElement = element;
        let isCheckboxDrag = false;

        // Event listeners for mouse down, move, and up events
        element.addEventListener('mousedown', (e) => {
            // If this element is inside a group, drag the group instead of the child
            const containerAncestor = (element.classList.contains('element-group') || element.classList.contains('element-wrapper'))
                ? element
                : (element.closest('.element-group, .element-wrapper') as HTMLElement | null);

            // If this element is inside a persistent group, always drag the group container
            const groupAncestor = element.closest('.element-group') as HTMLElement | null;
            if (groupAncestor) {
                dragTarget = groupAncestor;
            } else {
                dragTarget = containerAncestor || element;
            }

            isCheckboxDrag = (dragTarget.dataset.type === 'Checkbox');
            const isGroupEl = dragTarget.classList.contains('element-group');

            // If dragging a group and it's not selected, select it now and clear child outlines
            if (isGroupEl && dialog.selectedElement !== dragTarget.id) {
                dialog.canvas.querySelectorAll('.selectedElement').forEach((el) => el.classList.remove('selectedElement'));
                (dragTarget as HTMLElement).classList.add('selectedElement');
                (dragTarget as HTMLElement).querySelectorAll('.selectedElement').forEach((el) => el.classList.remove('selectedElement'));
                multiSelected.clear();
                multiSelected.add(dragTarget.id);
                dialog.selectedElement = dragTarget.id;
                currentGroupId = dragTarget.id;
                coms.emit('elementSelected', dragTarget.id);
                suppressClickFor.add(dragTarget.id);
            }

            isDragging = true;

            const hasPersistentGroup = Boolean(currentGroupId);

            if (multiSelected.size > 1 && !hasPersistentGroup) {
                // Prepare for ephemeral multi-drag: snapshot positions
                multiDragActive = true;
                multiDragSnapshot.clear();
                dragStart = { x: e.clientX, y: e.clientY };
                for (const id of multiSelected) {
                    const el = dialog.getElement(id);
                    if (!el) continue;
                    const rect = el.getBoundingClientRect();
                    const canvasRect = dialog.canvas.getBoundingClientRect();
                    const left0 = rect.left - canvasRect.left;
                    const top0 = rect.top - canvasRect.top;
                    multiDragSnapshot.set(id, { left: left0, top: top0, width: rect.width, height: rect.height });
                    suppressClickFor.add(id);
                }
            } else if (!isGroupEl) {
                // Selection handling for single or persistent group context
                if (!element.classList.contains('selectedElement')) {
                    if (e.shiftKey) {
                        element.classList.add('selectedElement');
                        multiSelected.add(element.id);
                        dialog.selectedElement = element.id;
                        coms.emit('elementSelected', element.id);
                        suppressClickFor.add(element.id);
                        makeGroupFromSelection(false);
                    } else {
                        editor.deselectAll();
                        element.classList.add('selectedElement');
                        multiSelected.clear();
                        multiSelected.add(element.id);
                        dialog.selectedElement = element.id;
                        const type = dialog.getElement(element.id)?.dataset.type;
                        if (!type) return;
                        coms.emit('elementSelected', element.id);
                        suppressClickFor.add(element.id);
                        makeGroupFromSelection(false);
                    }
                }
            }

            elementWidth = dragTarget.getBoundingClientRect().width;
            elementHeight = dragTarget.getBoundingClientRect().height;

            // Store pointer offset within the drag target for stable single dragging
            const rect = dragTarget.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            // Change cursor style while dragging
            dragTarget.style.cursor = 'grabbing';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const canvasRect = dialog.canvas.getBoundingClientRect();

            if (multiDragActive && multiSelected.size > 1 && !currentGroupId) {
                // Move all selected wrappers by the same delta
                const dx = e.clientX - dragStart.x;
                const dy = e.clientY - dragStart.y;
                for (const id of multiSelected) {
                    const el = dialog.getElement(id);
                    if (!el) continue;
                    const snap = multiDragSnapshot.get(id);
                    if (!snap) continue;
                    let nleft = snap.left + dx;
                    let ntop = snap.top + dy;
                    const w = snap.width;
                    const h = snap.height;
                    const maxLeft = dialogW - w - 10;
                    const maxTop = dialogH - h - 10;
                    if (nleft > maxLeft) nleft = maxLeft;
                    if (nleft < 10) nleft = 10;
                    if (ntop > maxTop) ntop = maxTop;
                    if (ntop < 10) ntop = 10;
                    el.style.left = Math.round(nleft) + 'px';
                    el.style.top = Math.round(ntop) + 'px';
                }
                isMoved = true;
                return;
            }

            // Single or persistent group drag using stored pointer offset
            // If dragging a child inside a group, we already redirected dragTarget to the group above
            left = e.clientX - canvasRect.left - offsetX;
            top = e.clientY - canvasRect.top - offsetY;

            if (left + elementWidth + 10 > dialogW) { left = dialogW - elementWidth - 10; }
            if (left < 10) { left = 10; }
            if (top + elementHeight + 10 > dialogH) { top = dialogH - elementHeight - 10; }
            if (top < 10) { top = 10; }

            // Apply the new position to the drag target
            top = Math.round(top);
            left = Math.round(left);
            dragTarget.style.left = left + 'px';
            dragTarget.style.top = top + 'px';
            isMoved = true;
        });

        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;

            // Restore cursor style
            dragTarget.style.cursor = 'grab';
            if (isMoved) {
                if (multiDragActive && multiSelected.size > 1 && !currentGroupId) {
                    // Commit positions for all selected wrappers
                    for (const id of multiSelected) {
                        const el = dialog.getElement(id);
                        if (!el) continue;
                        const leftNum = Math.round(parseInt(el.style.left || '0', 10) || 0);
                        const topNum = Math.round(parseInt(el.style.top || '0', 10) || 0);
                        el.dataset.left = String(leftNum);
                        el.dataset.top = String(topNum);
                        dialog.updateElementProperties(id, { top: String(topNum), left: String(leftNum) });
                        suppressClickFor.add(id);
                    }
                } else {
                    if (isCheckboxDrag) {
                        const size = Number(dragTarget.dataset.size);
                        if (top < 10 + size * 0.25) { top = 10 + size * 0.25; }
                    }
                    dragTarget.style.top = top + 'px';
                    dragTarget.dataset.left = String(left);
                    dragTarget.dataset.top = String(top);

                    dialog.updateElementProperties(
                        dragTarget.id,
                        { top: String(top), left: String(left) }
                    );

                    // Suppress the click that follows mouseup for the moved target and its children (if group)
                    suppressClickFor.add(dragTarget.id);
                    if (dragTarget.classList.contains('element-group')) {
                        const kids = Array.from(dragTarget.children) as HTMLElement[];
                        kids.forEach(k => suppressClickFor.add(k.id));
                    }
                }

                isMoved = false; // position updated
            }
            multiDragActive = false;
            multiDragSnapshot.clear();
        });

        document.addEventListener('dragend', () => {
            // console.log('dragend');
        });
    },

    deselectAll: function () {
        // Remove selection from all elements (deep)
        dialog.canvas.querySelectorAll('.selectedElement').forEach((el) => el.classList.remove('selectedElement'));
        // Do not auto-ungroup on deselect
        currentGroupId = null;
        multiSelected.clear();
        multiOutline = renderutils.clearMultiOutline(multiOutline);
        dialog.selectedElement = '';
        editor.clearPropsList();
        // notify UI that selection has been cleared
        coms.emit('elementDeselected');
    },

    // updateElement(data) {
    //     if (dialog.selectedElement !== '') {
    //         dialog.updateElementProperties(dialog.selectedElement, data);
    //     }
    // },

    // remove element form paper and container
    removeSelectedElement() {
        // remove from dialog
        document.getElementById(dialog.selectedElement)?.remove();
        // remove from container
        dialog.removeElement(dialog.selectedElement);
        // clear element properties
        editor.clearPropsList();
        // notify UI that selection has been cleared
        coms.emit('elementDeselected');
    },

    // clear element props
    clearPropsList() {
        // clear data form
        const properties = document.querySelectorAll('#propertiesList [id^="el"]');

        properties.forEach(item => {
            (item as HTMLInputElement).value = '';
        });

        // hide props list
        document.getElementById('propertiesList')?.classList.add('hidden');
        document.querySelectorAll('#propertiesList .element-property').forEach(item => {
            item.classList.add('hidden-element');
        });

        // disable buttons
        (document.getElementById('removeElement') as HTMLButtonElement).disabled = true;
        (document.getElementById('bringToFront') as HTMLButtonElement).disabled = true;
        (document.getElementById('sendToBack') as HTMLButtonElement).disabled = true;
        (document.getElementById('bringForward') as HTMLButtonElement).disabled = true;
        (document.getElementById('sendBackward') as HTMLButtonElement).disabled = true;
    },

    addDefaultsButton: function() {
        const elementsList = document.getElementById('elementsList');
        if (elementsList) {
            const div = document.createElement('div');
            div.className = 'mt-1_5';
            const button = document.createElement('button');
            button.className = 'custombutton';
            button.innerText = 'Default values';
            button.setAttribute('type', 'button');
            button.style.width = '150px';
            button.addEventListener('click', function () {
                coms.sendTo(
                    'main',
                    'secondWindow',
                    {
                        width: 640,
                        height: 480,
                        backgroundColor: '#fff',
                        title: 'Default values',
                        preload: 'preloadDefaults.js',
                        html: 'defaults.html'
                    }
                );
            });
            div.appendChild(button);
            elementsList.appendChild(div);
        }
    },

    propertyUpdate: function(ev) {
        const el = ev.target as HTMLInputElement;
            // console.log(el);
            // editor.updateElement({ [el.name]: el.value });

            const propName = el.id.slice(2);
            let value = el.value;

            // Determine target element id: prefer current selection, otherwise last-selected stored on the panel
            let targetId = dialog.selectedElement;
            if (!targetId) {
                const propsList = document.getElementById('propertiesList') as HTMLDivElement | null;
                const stored = propsList?.dataset.currentElementId || '';
                if (stored) targetId = stored;
            }
            if (!targetId) {
                const bound = (el as HTMLInputElement | HTMLSelectElement).dataset?.bindElementId || '';
                if (bound) targetId = bound;
            }
            const element = targetId ? dialog.getElement(targetId) : undefined;

            if (element) {
                const dataset = element.dataset;
                let props: Record<string, string> = { [propName]: value };
                if (propName === "size" && (dataset.type === "Checkbox" || dataset.type === "Radio")) {
                    const dialogW = dialog.canvas.getBoundingClientRect().width;
                    const dialogH = dialog.canvas.getBoundingClientRect().height;
                    if (Number(value) > Math.min(dialogW, dialogH) - 20) {
                        value = String(Math.round(Math.min(dialogW, dialogH) - 20));
                        el.value = value;
                    }
                    props = {
                        width: value,
                        height: value
                    } as Record<string, string>;
                }
                renderutils.updateElement(element, props as AnyElement);
                // Keep last-selected id updated
                const propsList = document.getElementById('propertiesList') as HTMLDivElement | null;
                if (propsList) propsList.dataset.currentElementId = element.id;

            } else {
                showError('Element not found.');
            }
    },

    initializeDialogProperties: function() {
        // numeric filters for dialog fields
        try {
            renderutils.setOnlyNumbers(['Width', 'Height', 'FontSize'], 'dialog');
        } catch {}

        // add dialog props
        const properties: NodeListOf<HTMLInputElement> = document.querySelectorAll('#dialog-properties [id^="dialog"]');

        // update dialog properties
        for (const element of properties) {
            element.addEventListener('keyup', (ev: KeyboardEvent) => {
                if (ev.key == 'Enter') {
                    const el = ev.target as HTMLInputElement;
                    el.blur();
                }
            });
            // save on blur
            element.addEventListener('blur', () => {
                const id = element.id;
                const idLower = id.toLowerCase();
                if (idLower === 'dialogwidth' || idLower === 'dialogheight') {
                    const value = element.value;
                    if (value) {
                        const dialogprops = renderutils.collectDialogProperties();
                        editor.updateDialogArea(dialogprops);
                        coms.sendTo(
                            'main',
                            'resize-editorWindow',
                            Number(dialog.properties.width),
                            Number(dialog.properties.height)
                        );
                    }
                }
                if (idLower === 'dialogfontsize') {
                    const value = element.value;
                    if (value) {
                        renderutils.updateFont(Number(value));
                    }
                }
            });
        }
    },

    // Arrange/Z-order actions ======================================
    bringSelectedToFront: function() {
        const el = dialog.getElement(dialog.selectedElement);
        if (el && el.parentElement) {
            el.parentElement.appendChild(el);
        }
    },

    sendSelectedToBack: function() {
        const el = dialog.getElement(dialog.selectedElement);
        if (el && el.parentElement) {
            el.parentElement.insertBefore(el, el.parentElement.firstElementChild);
        }
    },

    bringSelectedForward: function() {
        const el = dialog.getElement(dialog.selectedElement);
        if (el && el.parentElement) {
            const next = el.nextElementSibling as HTMLElement | null;
            if (next) {
                // swap with next sibling
                el.parentElement.insertBefore(next, el);
            }
        }
    },

    sendSelectedBackward: function() {
        const el = dialog.getElement(dialog.selectedElement);
        if (el && el.parentElement) {
            const prev = el.previousElementSibling as HTMLElement | null;
            if (prev) {
                // move before previous sibling
                el.parentElement.insertBefore(el, prev);
            }
        }
    },

    // Group / Ungroup actions
    groupSelection: function() {
        makeGroupFromSelection(true);
    },

    ungroupSelection: function() {
        // Convert a persistent group back into an ephemeral multi-selection
        if (currentGroupId) {
            // Perform ungroup via renderutils and get the child IDs
            const childIds: string[] = renderutils.ungroupGroup(currentGroupId);

            // Clear all selection outlines, then select all former children
            dialog.canvas.querySelectorAll('.selectedElement').forEach((el) => el.classList.remove('selectedElement'));
            multiSelected.clear();
            for (const id of childIds) {
                const el = dialog.getElement(id);
                if (el) {
                    el.classList.add('selectedElement');
                    multiSelected.add(id);
                }
            }

            // No persistent group is active anymore
            currentGroupId = null;
            dialog.selectedElement = '';

            // Ephemeral multi-selection (keep group-like behavior without DOM container)
            // Do not show any extra outer outline; just both elements selected
            coms.emit('elementSelectedMultiple', childIds);
        }
    },

    stringifyDialog: function() {
        const flattened: Array<Record<string, unknown>> = [];
        const toNumber = (v: string | undefined, fallback = 0) => {
            if (!v) return fallback;
            return utils.possibleNumeric(v) ? utils.asNumeric(v) : fallback;
        };

        const topLevel = Array.from(dialog.canvas.children) as HTMLElement[];
        for (const child of topLevel) {
            if (child.classList.contains('element-group')) {
                // Flatten multi-select group: serialize its children with absolute coordinates
                const gLeft = toNumber(child.dataset.left as string, 0);
                const gTop = toNumber(child.dataset.top as string, 0);
                const members = Array.from(child.children) as HTMLElement[];
                for (const m of members) {
                    // Skip nested groups (not expected) and lasso rects
            if (child.classList.contains('lasso-rect')) continue;
                    const obj: Record<string, unknown> = { id: m.id };
                    for (const [key, raw] of Object.entries(m.dataset)) {
                        let value: unknown = raw;
                        if (raw === 'true' || raw === 'false') {
                            value = raw === 'true';
                        } else if (typeof raw === 'string' && utils.possibleNumeric(raw)) {
                            value = utils.asNumeric(raw);
                        }
                        obj[key] = value as unknown;
                    }
                    // Attach group's extra conditions so they apply at runtime without altering element-specific ones
                    const gconds = (child.dataset as any)?.groupConditions || (child.dataset as any)?.conditions || '';
                    if (gconds) (obj as any).groupConditions = String(gconds);

                    // Adjust left/top by the group's position to make them absolute
                    const mLeftAbs = toNumber(m.dataset.left as string, 0) + gLeft;
                    const mTopAbs = toNumber(m.dataset.top as string, 0) + gTop;
                    obj.left = mLeftAbs;
                    obj.top = mTopAbs;
                    flattened.push(obj);
                }
            } else if (child.classList.contains('lasso-rect')) {
                continue;
            } else {
                const obj: Record<string, unknown> = { id: child.id };
                for (const [key, raw] of Object.entries(child.dataset)) {
                    let value: unknown = raw;
                    if (raw === 'true' || raw === 'false') {
                        value = raw === 'true';
                    } else if (typeof raw === 'string' && utils.possibleNumeric(raw)) {
                        value = utils.asNumeric(raw);
                    }
                    obj[key] = value as unknown;
                }
                flattened.push(obj);
            }
        }

        const result = {
            id: dialog.id,
            properties: { ...dialog.properties },
            syntax: { ...dialog.syntax },
            elements: flattened
        };
        return JSON.stringify(result);
    },

    previewDialog: function() {
        const json = editor.stringifyDialog();
        // Open a dedicated preview window via the main process
        const width = Math.max(Number(dialog.properties.width) || 640, 200);
        const height = Math.max(Number(dialog.properties.height) || 480, 200);
        coms.sendTo(
            'main',
            'secondWindow',
            {
                width: width,
                height: height,
                useContentSize: true,
                autoHideMenuBar: true,
                backgroundColor: '#ffffff',
                title: 'Preview',
                preload: 'preloadPreview.js',
                html: 'preview.html',
                data: json
            }
        );
    },

    loadDialogFromJson: function(data: unknown) {
        try {
            const obj = typeof data === 'string' ? JSON.parse(data) : (data as any);
            if (!obj || !obj.properties) return;

            // Clear existing elements
            try {
                const keys = Object.keys(dialog.elements);
                for (const id of keys) {
                    const el = dialog.getElement(id);
                    if (el && el.parentElement) el.parentElement.removeChild(el);
                    dialog.removeElement(id);
                }
                dialog.canvas.innerHTML = '';
            } catch {}

            // Update dialog properties and UI
            const props = obj.properties as any;
            dialog.properties = { ...props };
            try {
                const w = Number(props.width) || 640;
                const h = Number(props.height) || 480;
                dialog.canvas.style.width = w + 'px';
                dialog.canvas.style.height = h + 'px';
                const wEl = document.getElementById('dialogWidth') as HTMLInputElement | null; if (wEl) wEl.value = String(props.width || '');
                const hEl = document.getElementById('dialogHeight') as HTMLInputElement | null; if (hEl) hEl.value = String(props.height || '');
                const nEl = document.getElementById('dialogName') as HTMLInputElement | null; if (nEl) nEl.value = String(props.name || '');
                const tEl = document.getElementById('dialogTitle') as HTMLInputElement | null; if (tEl) tEl.value = String(props.title || '');
                const fEl = document.getElementById('dialogFontSize') as HTMLInputElement | null; if (fEl) fEl.value = String(props.fontSize || '');
            } catch {}

            // Recreate elements
            const arr = Array.isArray(obj.elements) ? obj.elements : [];
            for (const e of arr) {
                try {
                    // Use the same wrapping approach as addElementToDialog, but preserve ids and nameids from JSON
                    const core = renderutils.makeElement({ ...(e as any) } as any);
                    const wrapper = document.createElement('div');
                    wrapper.classList.add('element-wrapper');
                    wrapper.style.position = 'absolute';

                    const desiredId = String((e as any).id || core.id);
                    const desiredType = String((e as any).type || core.dataset.type || '');
                    const desiredNameId = String((e as any).nameid || core.dataset.nameid || '');

                    // Preserve id on wrapper, move inner id aside
                    wrapper.id = desiredId;
                    core.id = desiredId + '-inner';

                    // Position from JSON
const left = Number((e as any).left ?? (parseInt(core.style.left || '0', 10) || 0));
const top = Number((e as any).top ?? (parseInt(core.style.top || '0', 10) || 0));
                    wrapper.style.left = `${left}px`;
                    wrapper.style.top = `${top}px`;

                    // Copy dataset from JSON into wrapper
                    for (const [k, v] of Object.entries(e as any)) {
                        if (k === 'id') continue;
                        const val = typeof v === 'string' ? v : String(v);
                        try { (wrapper.dataset as any)[k] = val; } catch {}
                    }
                    wrapper.dataset.type = desiredType;
                    if (desiredNameId) wrapper.dataset.nameid = desiredNameId;
                    wrapper.dataset.parentId = dialog.id;

                    // Inner element positioned relative to wrapper
                    core.style.left = '0px';
                    core.style.top = '0px';
                    if (desiredType === 'Button') core.style.position = 'relative';

                    wrapper.appendChild(core);
                    dialog.canvas.appendChild(wrapper);

                    // Remove inner cover and add outer cover
                    try { const innerCover = core.querySelector('.elementcover'); innerCover && innerCover.parentElement?.removeChild(innerCover); } catch {}
                    const cover = document.createElement('div'); cover.id = `cover-${wrapper.id}`; cover.className = 'elementcover'; wrapper.appendChild(cover);

                    // Size wrapper: for non-buttons, fix to core's rendered size; for buttons, let it auto-size
                    try {
                        if (desiredType !== 'Button') {
                            const rect = core.getBoundingClientRect();
                            if (rect.width > 0) wrapper.style.width = `${Math.round(rect.width)}px`;
                            if (rect.height > 0) wrapper.style.height = `${Math.round(rect.height)}px`;
                        }
                    } catch {}

                    editor.addElementListeners(wrapper);
                    dialog.addElement(wrapper);
                } catch {}
            }
        } catch (e) {
            console.error('loadDialogFromJson failed', e);
        }
    }
}
