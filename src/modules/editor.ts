import { showMessage, showError, coms } from "./coms";
import { editorSettings } from './settings';
import { Editor } from '../interfaces/editor';
import { Elements, StringNumber, AnyElement } from '../interfaces/elements';
import { elements } from './elements';
import { DialogProperties } from "../interfaces/dialog";
import { v4 as uuidv4 } from 'uuid';
import { dialog } from './dialog';
import { renderutils } from '../library/renderutils';
import { utils } from '../library/utils';

let lastContextTargetId: string | null = null;
let contextMenu: HTMLElement | null = null;
let currentGroupId: string | null = null;
let contextMenuInitialized = false;
let multiDragActive = false;
let dragStart = { x: 0, y: 0 };
let multiOutline: HTMLDivElement | null = null; // ephemeral group multi-drag state and outline

const multiSelected = new Set<string>();
const suppressClickFor = new Set<string>();
const SKIP_KEYS = new Set(['elementIds', 'persistent']);
const elementPropertyKinds = buildElementPropertyKindMap();
const multiDragSnapshot = new Map<string, { left: number; top: number; width: number; height: number }>();
const selectionOrder: string[] = [];
let selectionAnchorId: string | null = null;

function applySelection(order: string[], opts: { emit?: boolean } = {}) {
    const seen = new Set<string>();
    const filtered: string[] = [];

    for (const id of order) {
        if (!id || seen.has(id)) continue;
        const el = dialog.getElement(id) as HTMLElement | undefined;
        if (!el) continue;
        filtered.push(id);
        seen.add(id);
    }

    selectionOrder.length = 0;
    selectionOrder.push(...filtered);

    selectionAnchorId = selectionOrder[0] ?? null;
    const anchorEl = selectionAnchorId ? dialog.getElement(selectionAnchorId) as HTMLElement | undefined : undefined;
    currentGroupId = (anchorEl && anchorEl.classList.contains('element-group')) ? selectionAnchorId : null;

    multiSelected.clear();
    filtered.forEach(id => multiSelected.add(id));

    dialog.canvas.querySelectorAll('.selectedElement').forEach(node => node.classList.remove('selectedElement'));

    for (const id of filtered) {
        const node = dialog.getElement(id) as HTMLElement | undefined;
        if (!node) continue;
        node.classList.add('selectedElement');
        if (node.classList.contains('element-group')) {
            node.querySelectorAll('.selectedElement').forEach(child => child.classList.remove('selectedElement'));
        }
    }

    multiOutline = renderutils.clearMultiOutline(multiOutline);

    if (opts.emit === false) {
        return;
    }

    if (filtered.length === 0) {
        dialog.selectedElement = '';
        coms.emit('elementDeselected');
    } else if (filtered.length === 1) {
        dialog.selectedElement = filtered[0];
        coms.emit('elementSelected', filtered[0]);
    } else {
        dialog.selectedElement = '';
        coms.emit('elementSelectedMultiple', filtered.slice());
    }
}

type PropertyKind = 'boolean' | 'number' | 'string' | 'array' | 'object';


function buildElementPropertyKindMap() {
    const map = new Map<string, Record<string, PropertyKind>>();
    for (const template of Object.values(elements)) {
        const templateRecord = template as unknown as Record<string, unknown>;
        const typeName = (templateRecord as { type?: string }).type;
        if (!typeName) continue;
        map.set(typeName, inferKindsFromTemplate(templateRecord));
    }
    return map;
}

function inferKindsFromTemplate(template: Record<string, unknown>) {
    const kinds: Record<string, PropertyKind> = {};
    for (const [key, value] of Object.entries(template)) {
        if (key === '$persist') continue;
        kinds[key] = derivePropertyKind(value);
    }
    return kinds;
}

function derivePropertyKind(value: unknown): PropertyKind {
    if (Array.isArray(value)) return 'array';
    if (value === null) return 'object';
    switch (typeof value) {
        case 'boolean':
            return 'boolean';
        case 'number':
            return 'number';
        case 'string':
            return 'string';
        case 'object':
            return 'object';
        default:
            return 'string';
    }
}

function resolveTemplateForType(typeName: string | undefined): Record<string, unknown> {
    if (!typeName) return elements.buttonElement as unknown as Record<string, unknown>;
    const key = `${typeName.charAt(0).toLowerCase()}${typeName.slice(1)}Element` as keyof Elements;
    const template = elements[key] ?? elements.buttonElement;
    return template as unknown as Record<string, unknown>;
}

function inferKindFromTemplate(template: Record<string, unknown>, key: string): PropertyKind | undefined {
    const value = template[key];
    return value === undefined ? undefined : derivePropertyKind(value);
}

function coerceDatasetValue(raw: string, kind: PropertyKind | undefined, templateValue: unknown): unknown {
    if (kind === 'boolean') {
        return utils.isTrue(raw);
    }

    if (kind === 'number') {
        const parsed = utils.asNumeric(raw);
        if (Number.isFinite(parsed)) return parsed;
        if (typeof templateValue === 'number') return templateValue;
        return 0;
    }

    if (kind === 'array') {
        if (!raw) return Array.isArray(templateValue) ? [...templateValue] : [];
        return raw.split(',');
    }

    if (raw === 'true' || raw === 'false') {
        return raw === 'true';
    }

    if (utils.possibleNumeric(raw)) {
        const parsed = utils.asNumeric(raw);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return raw;
}

function hideContextMenu() {
    if (!contextMenu) return;

    contextMenu.setAttribute('aria-hidden', 'true');
    contextMenu.style.top = '';
    contextMenu.style.left = '';
    contextMenu.style.visibility = '';
    lastContextTargetId = null;
}

function contextMenuHandlers() {
    if (!contextMenu || contextMenuInitialized) return;

    contextMenuInitialized = true;
    const duplicateButton = contextMenu.querySelector('[data-action="duplicate"]') as HTMLButtonElement | null;

    duplicateButton?.addEventListener('click', () => {
        if (!lastContextTargetId) {
            hideContextMenu();
            return;
        }
        editor.duplicateElement(lastContextTargetId);
        hideContextMenu();
    });
    if (duplicateButton) duplicateButton.dataset.bound = 'true';
}

function showContextMenu(targetId: string, x: number, y: number) {
    if (!contextMenu) return;
    contextMenuHandlers();
    contextMenu.style.visibility = 'hidden';
    contextMenu.style.top = '-1000px';
    contextMenu.style.left = '-1000px';
    contextMenu.setAttribute('aria-hidden', 'false');

    const menuRect = contextMenu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = x;
    let top = y;
    if (left + menuRect.width > viewportWidth) {
        left = Math.max(0, viewportWidth - menuRect.width - 4);
    }

    if (top + menuRect.height > viewportHeight) {
        top = Math.max(0, viewportHeight - menuRect.height - 4);
    }

    contextMenu.style.top = `${top}px`;
    contextMenu.style.left = `${left}px`;
    contextMenu.style.visibility = 'visible';
    lastContextTargetId = targetId;

    // Do not auto-focus the first menu item to avoid showing a focus ring
    try {
        const duplicate = contextMenu.querySelector('[data-action="duplicate"]') as HTMLButtonElement | null;
        const group = contextMenu.querySelector('[data-action="group"]') as HTMLButtonElement | null;
        const ungroup = contextMenu.querySelector('[data-action="ungroup"]') as HTMLButtonElement | null;
        if (duplicate && !duplicate.dataset.bound) {
            duplicate.addEventListener('click', function() {
                if (!lastContextTargetId) {
                    hideContextMenu();
                    return;
                }
                editor.duplicateElement(lastContextTargetId);
                hideContextMenu();
            });
            duplicate.dataset.bound = 'true';
        }

        if (group && !group.dataset.bound) {
            group.addEventListener('click', function() {
                // Group current multi-selection into a persistent group
                editor.groupSelection();
                hideContextMenu();
            });
            group.dataset.bound = 'true';
        }

        if (ungroup && !ungroup.dataset.bound) {
            ungroup.addEventListener('click', function() {
                if (!lastContextTargetId) {
                    hideContextMenu();
                    return;
                }

                const node = dialog.getElement(lastContextTargetId) as HTMLElement | undefined;
                if (!node || !node.classList.contains('element-group')) {
                    hideContextMenu();
                    return;
                }

                const children = renderutils.ungroupGroup(lastContextTargetId);
                if (children && children.length) {
                    applySelection(children);
                } else {
                    applySelection([]);
                }

                hideContextMenu();
            });
            ungroup.dataset.bound = 'true';
        }

        // Toggle which actions are visible based on context
        const node = dialog.getElement(targetId) as HTMLElement | undefined;
        const isPersistentGroup = !!(node && node.classList.contains('element-group'));
        const hasEphemeralMultiSelect = !isPersistentGroup && selectionOrder.length >= 2;

        if (group) {
            group.style.display = hasEphemeralMultiSelect ? '' : 'none';
        }
        if (ungroup) {
            ungroup.style.display = isPersistentGroup ? '' : 'none';
        }
    } catch { /* noop */ }
}

function makeGroupFromSelection(persistent = false) {
    if (selectionOrder.length <= 1) {
        applySelection(selectionOrder, { emit: true });
        return;
    }

    const ids = selectionOrder.slice();
    if (!persistent) {
        currentGroupId = null;
        multiOutline = renderutils.clearMultiOutline(multiOutline);
        coms.emit('elementSelectedMultiple', ids);
        return;
    }

    const groupId = renderutils.makeGroupFromSelection(ids, true);
    if (!groupId) return;
    const groupEl = dialog.getElement(groupId) as HTMLElement | undefined;
    if (!groupEl) return;
    editor.addElementListeners(groupEl);
    currentGroupId = groupId;
    applySelection([groupId]);
}

export const editor: Editor = {
    alignSelection: function(mode: 'left' | 'top' | 'middle' | 'right' | 'bottom' | 'center') {
        const orderedIds = selectionOrder.length >= 2
            ? selectionOrder.slice()
            : (selectionOrder.length === 0 ? renderutils.getSelectedIds() : selectionOrder.slice());

        if (orderedIds.length < 2) {
            return;
        }

        const anchorId = orderedIds[0];
        const anchor = dialog.getElement(anchorId) as HTMLElement | undefined;
        if (!anchor) {
            return;
        }

        const anchorLeft = Number(anchor.dataset.left ?? (parseInt(anchor.style.left || '0', 10) || 0));
        const anchorTop = Number(anchor.dataset.top ?? (parseInt(anchor.style.top || '0', 10) || 0));
        const anchorWidth = anchor.offsetWidth;
        const anchorHeight = anchor.offsetHeight;
        const targets = orderedIds.slice(1);

        // If targets represent an ephemeral multi-selection (no persistent group container included),
        // treat them as a unit and align their bounding box to the anchor.
        const containsPersistentGroup = targets.some(id => {
            const n = dialog.getElement(id) as HTMLElement | undefined;
            return !!n && n.classList.contains('element-group');
        });

        if (targets.length > 1 && !containsPersistentGroup) {
            const groupBounds = renderutils.computeBounds(targets);
            if (groupBounds) {
                let dx = 0, dy = 0;
                if (mode === 'left') {
                    dx = anchorLeft - groupBounds.left;
                } else if (mode === 'right') {
                    const anchorRight = anchorLeft + anchorWidth;
                    const groupRight = groupBounds.left + groupBounds.width;
                    dx = anchorRight - groupRight;
                } else if (mode === 'center') {
                    const anchorCenter = anchorLeft + Math.round(anchorWidth / 2);
                    const groupCenter = groupBounds.left + Math.round(groupBounds.width / 2);
                    dx = anchorCenter - groupCenter;
                } else if (mode === 'top') {
                    dy = anchorTop - groupBounds.top;
                } else if (mode === 'bottom') {
                    const anchorBottom = anchorTop + anchorHeight;
                    const groupBottom = groupBounds.top + groupBounds.height;
                    dy = anchorBottom - groupBottom;
                } else if (mode === 'middle') {
                    const anchorMiddle = anchorTop + Math.round(anchorHeight / 2);
                    const groupMiddle = groupBounds.top + Math.round(groupBounds.height / 2);
                    dy = anchorMiddle - groupMiddle;
                }

                if (dx !== 0 || dy !== 0) {
                    renderutils.moveElementsBy(targets, dx, dy);
                }

                coms.emit('elementSelectedMultiple', orderedIds);
                return;
            }
        }

        for (const id of targets) {
            const el = dialog.getElement(id) as HTMLElement | undefined;
            if (!el) {
                continue;
            }

            const isGroupContainer = el.classList.contains('element-group');
            const currentLeft = Number(el.dataset.left ?? (parseInt(el.style.left || '0', 10) || 0));
            const currentTop = Number(el.dataset.top ?? (parseInt(el.style.top || '0', 10) || 0));
            const elWidth = el.offsetWidth;
            const elHeight = el.offsetHeight;
            const props: Record<string, number> = {};

            if (isGroupContainer) {
                // Move group container as a unit relative to anchor
                if (mode === 'left' && currentLeft !== anchorLeft) {
                    props.left = anchorLeft;
                } else if (mode === 'top' && currentTop !== anchorTop) {
                    props.top = anchorTop;
                } else if (mode === 'right') {
                    const anchorRight = anchorLeft + anchorWidth;
                    const elRight = currentLeft + elWidth;
                    if (elRight !== anchorRight) props.left = anchorRight - elWidth;
                } else if (mode === 'bottom') {
                    const anchorBottom = anchorTop + anchorHeight;
                    const elBottom = currentTop + elHeight;
                    if (elBottom !== anchorBottom) props.top = anchorBottom - elHeight;
                } else if (mode === 'center') {
                    const anchorCenter = anchorLeft + Math.round(anchorWidth / 2);
                    const newLeft = anchorCenter - Math.round(elWidth / 2);
                    if (newLeft !== currentLeft) props.left = newLeft;
                } else if (mode === 'middle') {
                    const anchorCenter = anchorTop + Math.round(anchorHeight / 2);
                    const newTop = anchorCenter - Math.round(elHeight / 2);
                    if (newTop !== currentTop) props.top = newTop;
                }
            } else {
                // Per-element alignment as before
                if (mode === 'left' && currentLeft !== anchorLeft) {
                    props.left = anchorLeft;
                } else if (mode === 'top' && currentTop !== anchorTop) {
                    props.top = anchorTop;
                } else if (mode === 'right') {
                    const anchorRight = anchorLeft + anchorWidth;
                    const elRight = currentLeft + elWidth;
                    if (elRight !== anchorRight) {
                        props.left = anchorRight - elWidth;
                    }
                } else if (mode === 'bottom') {
                    const anchorBottom = anchorTop + anchorHeight;
                    const elBottom = currentTop + elHeight;
                    if (elBottom !== anchorBottom) {
                        props.top = anchorBottom - elHeight;
                    }
                } else if (mode === 'center') {
                    const anchorCenter = anchorLeft + Math.round(anchorWidth / 2);
                    const newLeft = anchorCenter - Math.round(elWidth / 2);
                    if (newLeft !== currentLeft) {
                        props.left = newLeft;
                    }
                } else if (mode === 'middle') {
                    const anchorCenter = anchorTop + Math.round(anchorHeight / 2);
                    const newTop = anchorCenter - Math.round(elHeight / 2);
                    if (newTop !== currentTop) {
                        props.top = newTop;
                    }
                }
            }

            if (utils.getKeys(props).length === 0) {
                continue;
            }

            renderutils.updateElement(el, props as StringNumber);
            if (props.left !== undefined) {
                el.dataset.left = String(props.left);
            }
            if (props.top !== undefined) {
                el.dataset.top = String(props.top);
            }
        }

        coms.emit('elementSelectedMultiple', orderedIds);
    },


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
            hideContextMenu();
            if ((event.target as HTMLDivElement).id === dialog.id) {
                // If a property input is active, blur it first to commit changes
                const active = document.activeElement as HTMLElement | null;
                if (active && active.closest('#propertiesList')) {
                    active.blur();
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

        dialog.canvas.addEventListener('mousedown', (event: MouseEvent) => {
            if ((event.target as HTMLElement).id !== dialog.id) return;
            // Commit any in-progress property edits before starting lasso
            const active = document.activeElement as HTMLElement | null;
            if (active && active.closest('#propertiesList')) {
                active.blur();
            }
            const rect = dialog.canvas.getBoundingClientRect();
            lassoActive = true;
            lassoStart = { x: event.clientX - rect.left, y: event.clientY - rect.top };

            lassoDiv = document.createElement('div');
            lassoDiv.className = 'lasso-rect';
            lassoDiv.style.left = lassoStart.x + 'px';
            lassoDiv.style.top = lassoStart.y + 'px';
            lassoDiv.style.width = '0px';
            lassoDiv.style.height = '0px';
            dialog.canvas.appendChild(lassoDiv);
            event.preventDefault();
        });

        document.addEventListener('mousemove', (event: MouseEvent) => {
            if (!lassoActive || !lassoDiv) return;
            const rect = dialog.canvas.getBoundingClientRect();
            const currX = event.clientX - rect.left;
            const currY = event.clientY - rect.top;
            const left = Math.min(currX, lassoStart.x);
            const top = Math.min(currY, lassoStart.y);
            const width = Math.abs(currX - lassoStart.x);
            const height = Math.abs(currY - lassoStart.y);
            lassoDiv.style.left = left + 'px';
            lassoDiv.style.top = top + 'px';
            lassoDiv.style.width = width + 'px';
            lassoDiv.style.height = height + 'px';
        });

        const endLasso = (event: MouseEvent) => {
            if (!lassoActive) return;
            const additive = event.shiftKey;
            const rect = dialog.canvas.getBoundingClientRect();
            const endX = event.clientX - rect.left;
            const endY = event.clientY - rect.top;
            const left = Math.min(endX, lassoStart.x);
            const top = Math.min(endY, lassoStart.y);
            const width = Math.abs(endX - lassoStart.x);
            const height = Math.abs(endY - lassoStart.y);

            if (lassoDiv && lassoDiv.parentElement) {
                lassoDiv.parentElement.removeChild(lassoDiv);
            }

            lassoDiv = null;
            lassoActive = false;
            if (width < 3 && height < 3 && !additive) {
                applySelection([]);
                return;
            }

            const selRectangle = {
                left,
                top,
                right: left + width,
                bottom: top + height
            };

            const next = additive ? selectionOrder.slice() : [];
            const children = Array.from(dialog.canvas.children) as HTMLElement[];
            children.forEach(el => {
                if (el.classList.contains('lasso-rect')) return;

                const rect = el.getBoundingClientRect();
                const canvasRect = dialog.canvas.getBoundingClientRect();
                const rel = {
                    left: rect.left - canvasRect.left,
                    right: rect.right - canvasRect.left,
                    top: rect.top - canvasRect.top,
                    bottom: rect.bottom - canvasRect.top
                };

                const contained = (
                    rel.left >= selRectangle.left &&
                    rel.right <= selRectangle.right &&
                    rel.top >= selRectangle.top &&
                    rel.bottom <= selRectangle.bottom
                );

                if (!contained) return;

                const id = el.id;
                const idx = next.indexOf(id);

                if (additive) {
                    if (idx >= 0) {
                        next.splice(idx, 1);
                    } else {
                        next.push(id);
                    }
                } else {
                    if (idx === -1) {
                        next.push(id);
                    }
                }
            });

            skipCanvasClickOnce = true;
            applySelection(next);
        };

        document.addEventListener('mouseup', endLasso);

        const dialogdiv = document.getElementById('dialog') as HTMLDivElement;
        if (dialogdiv) {
            dialogdiv.append(dialog.canvas);
        }

        contextMenu = document.getElementById('element-context-menu');
        document.addEventListener('click', (ev) => {
            if (
                !contextMenu ||
                contextMenu.getAttribute('aria-hidden') !== 'false'
            ) return;

            if (contextMenu.contains(ev.target as Node)) return;

            hideContextMenu();
        });

        document.addEventListener('keydown', (ev) => {
            if (ev.key === 'Escape') {
                hideContextMenu();
            }
        });

        const properties: NodeListOf<HTMLInputElement> = document.querySelectorAll('#dialog-properties [id^="dialog"]');

        properties.forEach((item) => {
            const key = item.getAttribute('name') as keyof DialogProperties;
            if (key) {
                item.value = editorSettings.dialog[key] || '';
            }
        });

        dialog.properties = editorSettings.dialog;

    },

    duplicateElement(elementId: string) {
        if (!elementId) return;
        const source = dialog.getElement(elementId) as HTMLElement | undefined;
        if (!source) return;

        const duplicateChildIntoGroup = (child: HTMLElement, groupEl: HTMLElement): string | null => {
            const datasetEntries = Object.entries(child.dataset || {});
            const copy: Record<string, unknown> = {};

            const typeFromDataset = child.dataset.type || child.tagName;
            const elementKinds = elementPropertyKinds.get(typeFromDataset) || {};
            const template = resolveTemplateForType(typeFromDataset);

            for (const [key, value] of datasetEntries) {
                if (value === undefined || SKIP_KEYS.has(key)) continue;
                const kind = elementKinds[key] ?? inferKindFromTemplate(template, key);
                const templateValue = template[key];
                copy[key] = coerceDatasetValue(value, kind, templateValue);
            }

            const type = String(typeFromDataset);
            copy.type = type;
            const base = type.toLowerCase();
            copy.nameid = renderutils.makeUniqueNameID(base);

            const leftRaw = child.dataset.left ?? child.style.left ?? '';
            const topRaw = child.dataset.top ?? child.style.top ?? '';
            const left = utils.asNumeric(leftRaw) || parseInt(String(leftRaw).replace(/px$/, ''), 10) || child.offsetLeft;
            const top = utils.asNumeric(topRaw) || parseInt(String(topRaw).replace(/px$/, ''), 10) || child.offsetTop;
            copy.left = left;
            copy.top = top;

            const constructed = renderutils.makeElement({ ...template, ...copy } as AnyElement);

            const wrapper = document.createElement('div');
            wrapper.classList.add('element-wrapper');
            wrapper.style.position = 'absolute';

            const origId = constructed.id;
            wrapper.id = origId;
            constructed.id = `${origId}-inner`;
            wrapper.style.left = `${left}px`;
            wrapper.style.top = `${top}px`;
            wrapper.dataset.left = String(left);
            wrapper.dataset.top = String(top);

            for (const [k, v] of Object.entries(constructed.dataset)) {
                if (typeof v === 'string') {
                    wrapper.dataset[k] = v;
                }
            }

            constructed.style.left = '0px';
            constructed.style.top = '0px';
            if (wrapper.dataset.type === 'Button') {
                constructed.style.position = 'relative';
            }

            wrapper.appendChild(constructed);
            groupEl.appendChild(wrapper);

            const innerCover = constructed.querySelector('.elementcover');
            if (innerCover && innerCover.parentElement) {
                innerCover.parentElement.removeChild(innerCover);
            }

            if (!(wrapper.dataset.type === 'Button' || wrapper.dataset.type === 'Label')) {
                const rect = constructed.getBoundingClientRect();
                if (rect.width > 0) wrapper.style.width = `${Math.round(rect.width)}px`;
                if (rect.height > 0) wrapper.style.height = `${Math.round(rect.height)}px`;
            }

            const cover = document.createElement('div');
            cover.id = `${wrapper.id}-cover`;
            cover.className = 'elementcover';
            wrapper.appendChild(cover);

            editor.addElementListeners(wrapper);
            dialog.addElement(wrapper);

            if (wrapper.dataset.type === 'Label') {
                renderutils.updateLabel(wrapper);
            }

            return wrapper.id;
        };

        if (source.classList.contains('element-group')) {
            const groupTemplate = resolveTemplateForType('Group');
            const groupEntries = Object.entries(source.dataset || {});
            const groupCopy: Record<string, unknown> = {};
            const groupKinds = elementPropertyKinds.get('Group') || {};

            for (const [key, value] of groupEntries) {
                if (value === undefined || SKIP_KEYS.has(key)) continue;
                const kind = groupKinds[key] ?? inferKindFromTemplate(groupTemplate, key);
                const templateValue = groupTemplate[key];
                groupCopy[key] = coerceDatasetValue(value, kind, templateValue);
            }

            const groupLeftRaw = source.dataset.left ?? source.style.left ?? '';
            const groupTopRaw = source.dataset.top ?? source.style.top ?? '';
            const groupLeft = utils.asNumeric(groupLeftRaw) || parseInt(String(groupLeftRaw).replace(/px$/, ''), 10) || source.offsetLeft;
            const groupTop = utils.asNumeric(groupTopRaw) || parseInt(String(groupTopRaw).replace(/px$/, ''), 10) || source.offsetTop;
            groupCopy.type = 'Group';
            groupCopy.nameid = renderutils.makeUniqueNameID('group');
            groupCopy.left = groupLeft;
            groupCopy.top = groupTop;

            const groupEl = renderutils.makeElement({ ...groupTemplate, ...groupCopy } as AnyElement);
            groupEl.dataset.type = 'Group';
            groupEl.classList.add('element-group');
            if (source.dataset.persistent === 'true') {
                groupEl.dataset.persistent = 'true';
            }

            const rect = source.getBoundingClientRect();
            const width = utils.asNumeric(source.style.width) || Math.round(rect.width);
            const height = utils.asNumeric(source.style.height) || Math.round(rect.height);
            if (width > 0) groupEl.style.width = `${width}px`;
            if (height > 0) groupEl.style.height = `${height}px`;

            dialog.canvas.appendChild(groupEl);
            dialog.addElement(groupEl);
            editor.addElementListeners(groupEl);

            const children = Array.from(source.children)
                .filter((el): el is HTMLElement => el instanceof HTMLElement && el.classList.contains('element-wrapper'));

            const newIds: string[] = [];
            for (const child of children) {
                const id = duplicateChildIntoGroup(child, groupEl);
                if (id) newIds.push(id);
            }
            groupEl.dataset.elementIds = newIds.join(',');

            applySelection([groupEl.id]);
            return;
        }

        const datasetEntries = Object.entries(source.dataset || {});
        const copy: Record<string, unknown> = {};

        const typeFromDataset = source.dataset.type || source.tagName;
        const elementKinds = elementPropertyKinds.get(typeFromDataset) || {};
        const template = resolveTemplateForType(typeFromDataset);

        for (const [key, value] of datasetEntries) {
            if (value === undefined || SKIP_KEYS.has(key)) continue;
            const kind = elementKinds[key] ?? inferKindFromTemplate(template, key);
            const templateValue = template[key];
            copy[key] = coerceDatasetValue(value, kind, templateValue);
        }

        const type = String(typeFromDataset);
        copy.type = type;
        // Use type-wide base for sequential nameid (e.g., 'label' -> next labelN)
        const base = type.toLowerCase();
        copy.nameid = renderutils.makeUniqueNameID(base);

        const leftRaw = source.dataset.left ?? source.style.left ?? '';
        const topRaw = source.dataset.top ?? source.style.top ?? '';
        const left = utils.asNumeric(leftRaw) || parseInt(String(leftRaw).replace(/px$/, ''), 10) || source.offsetLeft;
        const top = utils.asNumeric(topRaw) || parseInt(String(topRaw).replace(/px$/, ''), 10) || source.offsetTop;
        copy.left = left;
        copy.top = top;

        const constructed = renderutils.makeElement({ ...template, ...copy } as AnyElement);

        const wrapper = document.createElement('div');
        wrapper.classList.add('element-wrapper');
        wrapper.style.position = 'absolute';

        const origId = constructed.id;
        wrapper.id = origId;
        constructed.id = `${origId}-inner`;
        wrapper.style.left = `${left}px`;
        wrapper.style.top = `${top}px`;
        wrapper.dataset.left = String(left);
        wrapper.dataset.top = String(top);

        for (const [k, v] of Object.entries(constructed.dataset)) {
            if (typeof v === 'string') {
                wrapper.dataset[k] = v;
            }
        }

        constructed.style.left = '0px';
        constructed.style.top = '0px';
        if (wrapper.dataset.type === 'Button') {
            constructed.style.position = 'relative';
        }

        wrapper.appendChild(constructed);
        dialog.canvas.appendChild(wrapper);

        const innerCover = constructed.querySelector('.elementcover');
        if (innerCover && innerCover.parentElement) {
            innerCover.parentElement.removeChild(innerCover);
        }

        if (!(wrapper.dataset.type === 'Button' || wrapper.dataset.type === 'Label')) {
            const rect = constructed.getBoundingClientRect();
            if (rect.width > 0) wrapper.style.width = `${Math.round(rect.width)}px`;
            if (rect.height > 0) wrapper.style.height = `${Math.round(rect.height)}px`;
        }

        const cover = document.createElement('div');
        cover.id = `${wrapper.id}-cover`;
        cover.className = 'elementcover';
        wrapper.appendChild(cover);

        editor.addElementListeners(wrapper);
        dialog.addElement(wrapper);

        if (wrapper.dataset.type === 'Label') {
            renderutils.updateLabel(wrapper);
        }

        applySelection([wrapper.id]);
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
                const fsize = utils.asNumeric(properties.fontSize);
                if (utils.isNumeric(fsize) && fsize > 0) {
                    coms.fontSize = fsize;
                    renderutils.updateFont(fsize);
                }
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
                li.dataset.elementKey = name;

                // Remove the sufix "Element" from the name of the element
                const baseName = name.substring(0, name.length - 7);
                const displayName = utils.capitalize(baseName);
                li.textContent = displayName;

                li.addEventListener('click', () => {

                    if (window === "defaults") {
                        // Remove highlight from all siblings
                        ul.querySelectorAll('li').forEach((el) => {
                            el.classList.remove('selected-available-element');
                        });
                        // Highlight this one
                        li.classList.add('selected-available-element');
                        const propsPanel = document.getElementById('propertiesList') as HTMLDivElement | null;
                        if (propsPanel) {
                            propsPanel.dataset.defaultElement = name;
                        }

                        // this sends a message within the same ("defaults", second) window
                        // useful when the click event is created in a different module, like here
                        // basically a "note to self"
                        coms.emit('defaultElementSelected', name);

                        coms.sendTo('main', 'getProperties', name);

                    } else if (window === "editor") {
                        const elementType = name as keyof Elements;
                        const elementData = elements[elementType];
                        editor.addElementToDialog(
                            String(elementData.type || displayName),
                            elementData,
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
            // Ensure dataset.type uses the canonical element type, not the display label.
            core.dataset.type = String(data.type || name);

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
            const innerCover = core.querySelector('.elementcover');
            if (innerCover && innerCover.parentElement) {
                innerCover.parentElement.removeChild(innerCover);
            }

            // Set wrapper size for most elements; for auto-sized ones (Label), avoid fixing width/height
            // because the wrapper auto-sizes to the content. Buttons now have fixed width.
            if (!(wrapper.dataset.type === 'Label')) {
                const rect = core.getBoundingClientRect();
                if (rect.width > 0) wrapper.style.width = `${Math.round(rect.width)}px`;
                if (rect.height > 0) wrapper.style.height = `${Math.round(rect.height)}px`;
            }

            // Add a universal cover at wrapper level to block inner interactions in editor
            const cover = document.createElement('div');
            cover.id = `${wrapper.id}-cover`;
            cover.className = 'elementcover';
            wrapper.appendChild(cover);

            // Register
            editor.addElementListeners(wrapper);
            dialog.addElement(wrapper);

            // For Label, immediately calibrate size so the wrapper height matches content
            if (wrapper.dataset.type === 'Label') {
                renderutils.updateLabel(wrapper);
            }
        }
    },

    // add listener to the element
    addElementListeners(element) {
        element.addEventListener('click', (event: MouseEvent) => {
            event.stopPropagation();

            const activeProp = document.activeElement as HTMLElement | null;
            if (activeProp && activeProp.closest('#propertiesList')) {
                activeProp.blur();
            }

            const isGroupContainer = element.classList.contains('element-group');
            const groupAncestor = element.closest('.element-group') as HTMLElement | null;
            const target = isGroupContainer ? element : (groupAncestor || element);
            const targetId = target.id;
            const shift = event.shiftKey;

            if (suppressClickFor.has(targetId)) {
                suppressClickFor.delete(targetId);
                return;
            }

            if (shift) {
                let next = selectionOrder.slice();
                const existingIndex = next.indexOf(targetId);
                if (existingIndex >= 0) {
                    next.splice(existingIndex, 1);
                } else {
                    if (target.classList.contains('element-group')) {
                        next = next.filter(id => {
                            const node = dialog.getElement(id) as HTMLElement | undefined;
                            return !(node && node !== target && target.contains(node));
                        });
                    }
                    next.push(targetId);
                }
                applySelection(next);
                return;
            }

            applySelection([targetId]);

            setTimeout(() => {
                if (selectionOrder.length === 1 && selectionOrder[0] === targetId) {
                    const element = document.getElementById('elnameid') as HTMLInputElement | null;
                    if (element) {
                        element.focus();
                        element.select();
                    }
                }
            }, 0);
        });

        // Double-click inside a group should select the individual element (not the group)
        element.addEventListener('dblclick', (event: MouseEvent) => {
            event.stopPropagation();
            const isGroupContainer = element.classList.contains('element-group');
            const hasGroupAncestor = !!(element.closest('.element-group') as HTMLElement | null);
            if (!isGroupContainer && hasGroupAncestor) {
                applySelection([element.id]);
                currentGroupId = null;
            }
        });

        element.addEventListener('contextmenu', (event: MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();

            const targetId = (element.closest('.element-group') as HTMLElement | null)?.id || element.id;
            if (!selectionOrder.includes(targetId)) {
                applySelection([targetId], { emit: true });
            }

            showContextMenu(targetId, event.clientX, event.clientY);
        });

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
        element.addEventListener('mousedown', (event) => {
            // Commit any in-progress property edits before starting drag/select
            const active = document.activeElement as HTMLElement | null;
            if (active && active.closest('#propertiesList')) {
                active.blur();
            }
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
            if (isGroupEl && !event.shiftKey && selectionOrder.indexOf(dragTarget.id) === -1) {
                applySelection([dragTarget.id]);
                currentGroupId = dragTarget.id;
                suppressClickFor.add(dragTarget.id);
            }

            isDragging = true;

            const hasPersistentGroup = Boolean(currentGroupId);

            if (multiSelected.size > 1 && !hasPersistentGroup) {
                // Prepare for ephemeral multi-drag: snapshot positions
                multiDragActive = true;
                multiDragSnapshot.clear();
                dragStart = {
                    x: event.clientX,
                    y: event.clientY
                };

                for (const id of multiSelected) {
                    const el = dialog.getElement(id);
                    if (!el) continue;

                    const rect = el.getBoundingClientRect();
                    const canvasRect = dialog.canvas.getBoundingClientRect();
                    const left0 = rect.left - canvasRect.left;
                    const top0 = rect.top - canvasRect.top;
                    multiDragSnapshot.set(id, { left: left0, top: top0, width: rect.width, height: rect.height });
                    // Do not suppress click yet; only suppress after we actually move on mouseup
                }
            } else if (!isGroupEl) {
                if (!selectionOrder.includes(element.id)) {
                    if (event.shiftKey) {
                        applySelection([...selectionOrder, element.id]);
                    } else {
                        applySelection([element.id]);
                    }
                    suppressClickFor.add(element.id);
                }
            }

            elementWidth = dragTarget.getBoundingClientRect().width;
            elementHeight = dragTarget.getBoundingClientRect().height;

            // Store pointer offset within the drag target for stable single dragging
            const rect = dragTarget.getBoundingClientRect();
            offsetX = event.clientX - rect.left;
            offsetY = event.clientY - rect.top;

            // Change cursor style while dragging
            dragTarget.style.cursor = 'grabbing';
            event.preventDefault();
        });

        document.addEventListener('mousemove', (event) => {
            if (!isDragging) return;

            const canvasRect = dialog.canvas.getBoundingClientRect();

            if (multiDragActive && multiSelected.size > 1 && !currentGroupId) {
                // Move all selected wrappers by the same delta
                const dx = event.clientX - dragStart.x;
                const dy = event.clientY - dragStart.y;
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
            left = event.clientX - canvasRect.left - offsetX;
            top = event.clientY - canvasRect.top - offsetY;

            if (left + elementWidth + 10 > dialogW) {
                left = dialogW - elementWidth - 10;
            }

            if (left < 10) {
                left = 10;
            }

            if (top + elementHeight + 10 > dialogH) {
                top = dialogH - elementHeight - 10;
            }

            if (top < 10) {
                top = 10;
            }

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
                        if (top < 10 + size * 0.25) {
                            top = 10 + size * 0.25;
                        }
                    }

                    dragTarget.style.top = top + 'px';
                    dragTarget.dataset.left = String(left);
                    dragTarget.dataset.top = String(top);

                    dialog.updateElementProperties(
                        dragTarget.id,
                        {
                            top: String(top),
                            left: String(left)
                        }
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
        applySelection([]);
        currentGroupId = null;
        multiOutline = renderutils.clearMultiOutline(multiOutline);
        editor.clearPropsList();
    },

    // updateElement(data) {
    //     if (dialog.selectedElement !== '') {
    //         dialog.updateElementProperties(dialog.selectedElement, data);
    //     }
    // },

    // remove selected elements (single, group, or multiple)
    removeSelectedElement() {
        const selected = Array.from(dialog.canvas.querySelectorAll('.selectedElement')) as HTMLElement[];
        if (selected.length === 0 && dialog.selectedElement) {
            const only = dialog.getElement(dialog.selectedElement);
            if (only) selected.push(only);
        }

        // If a persistent group is selected, its children are inside; removing the group removes children as well
        const toRemove = new Set<HTMLElement>();
        for (const el of selected) {
            // Avoid collecting both a parent group and its children; prefer removing the parent once
            const parentGroup = el.closest('.element-group') as HTMLElement | null;
            // Skip child if its parent group is also selected, but do not skip the group itself
            if (parentGroup && parentGroup !== el && selected.includes(parentGroup)) continue;
            toRemove.add(el);
        }

        for (const el of toRemove) {
            el.remove();
            dialog.removeElement(el.id);
        }

        applySelection([]);
        editor.clearPropsList();
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
                        height: 520,
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

                renderutils.updateElement(element, props);

                // Keep last-selected id updated
                const propsList = document.getElementById('propertiesList') as HTMLDivElement | null;
                if (propsList) {
                    propsList.dataset.currentElementId = element.id;
                }

            } else {
                showError('Element not found.');
            }
    },

    initializeDialogProperties: function() {
        // numeric filters for dialog fields
        renderutils.setIntegers(['Width', 'Height', 'FontSize'], 'dialog');

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
                } else if (idLower === 'dialogfontsize') {
                    const value = element.value;
                    if (value) {
                        const dialogprops = renderutils.collectDialogProperties();
                        editor.updateDialogArea(dialogprops);
                    }
                } else if (idLower === 'dialogname' || idLower === 'dialogtitle') {
                    // Update name/title into dialog properties as well
                    const dialogprops = renderutils.collectDialogProperties();
                    editor.updateDialogArea(dialogprops);
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
        if (currentGroupId) {
            const childIds: string[] = renderutils.ungroupGroup(currentGroupId);
            currentGroupId = null;
            applySelection(childIds);
        }
    },

    selectAll: function() {
        const ids = Array.from(dialog.canvas.children)
            .filter((el): el is HTMLElement => el instanceof HTMLElement && !el.classList.contains('lasso-rect'))
            .map(el => el.id);
        currentGroupId = null;
        applySelection(ids);
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
                // Serialize group container and its children
                const gLeft = toNumber(child.dataset.left as string, 0);
                const gTop = toNumber(child.dataset.top as string, 0);
                const members = Array.from(child.children) as HTMLElement[];

                // Compute group width/height
                const rects = members.map(m => m.getBoundingClientRect());
                const minLeft = Math.min(...rects.map(r => r.left));
                const minTop = Math.min(...rects.map(r => r.top));
                const maxRight = Math.max(...rects.map(r => r.right));
                const maxBottom = Math.max(...rects.map(r => r.bottom));
                const width = Math.round(maxRight - minLeft);
                const height = Math.round(maxBottom - minTop);

                // Save group object itself
                const groupObj: Record<string, unknown> = {
                    id: child.id,
                    type: 'Group',
                    left: gLeft,
                    top: gTop,
                    width,
                    height,
                    nameid: (child.dataset.nameid || ''),
                    elementIds: members.map(m => m.id),
                };
                flattened.push(groupObj);

                // Save children with absolute coordinates and carry groupConditions for runtime
                for (const m of members) {
                    if (m.classList.contains('lasso-rect')) continue;
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

                    const mLeftAbs = toNumber(m.getAttribute('data-left') as string, 0) + gLeft;
                    const mTopAbs = toNumber(m.getAttribute('data-top') as string, 0) + gTop;
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
            customJS: dialog.customJS || '',
            elements: flattened
        };
        return JSON.stringify(result);
    },

    previewDialog: function() {
        const json = editor.stringifyDialog();
        // Open a dedicated preview window via the main process
        const width = Math.max(Number(dialog.properties.width) || 640, 200);
        const height = Math.max(Number(dialog.properties.height) || 480, 200);
        // Use custom dialog title when available
        const winTitle = String(dialog.properties.title || dialog.properties.name || 'Preview');
        coms.sendTo(
            'main',
            'secondWindow',
            {
                width: width,
                height: height,
                useContentSize: true,
                autoHideMenuBar: true,
                backgroundColor: '#ffffff',
                title: winTitle,
                preload: 'preloadPreview.js',
                html: 'preview.html',
                data: json
            }
        );
    },

    loadDialogFromJson: function(data: unknown) {
        try {
            const obj = typeof data === 'string' ? JSON.parse(data) : data;
            if (!obj || !obj.properties) return;

            // Before replacing content, clear any current selection and hide properties panel
            // so stale properties from a previously selected element do not linger.
            editor.deselectAll();

            // Clear existing elements
            const keys = Object.keys(dialog.elements);
            for (const id of keys) {
                const el = dialog.getElement(id);
                if (el && el.parentElement) el.parentElement.removeChild(el);
                dialog.removeElement(id);
            }
            dialog.canvas.innerHTML = '';

            // Update dialog properties and UI
            const props = obj.properties as any;
            dialog.properties = { ...props };
            // Load custom JS if present
            dialog.customJS = String((obj as any).customJS || '');
            const w = Number(props.width) || 640;
            const h = Number(props.height) || 480;
            dialog.canvas.style.width = w + 'px';
            dialog.canvas.style.height = h + 'px';

            const dwidth = document.getElementById('dialogWidth') as HTMLInputElement | null;
            if (dwidth) dwidth.value = String(props.width || '');

            const dheight = document.getElementById('dialogHeight') as HTMLInputElement | null;
            if (dheight) dheight.value = String(props.height || '');

            const dname = document.getElementById('dialogName') as HTMLInputElement | null;
            if (dname) dname.value = String(props.name || '');

            const dtitle = document.getElementById('dialogTitle') as HTMLInputElement | null;
            if (dtitle) dtitle.value = String(props.title || '');

            const dfont = document.getElementById('dialogFontSize') as HTMLInputElement | null;
            if (dfont) dfont.value = String(props.fontSize || '');

            // Sync global typography before recreating elements so their initial sizing matches
            const pf = Number(props.fontSize);
            if (Number.isFinite(pf) && pf > 0) {
                coms.fontSize = pf;
            }

            // Recreate elements
            const arr = Array.isArray(obj.elements) ? obj.elements : [];
            const groups: any[] = [];
            for (const element of arr) {
                if (String(element.type || '').toLowerCase() === 'group') {
                    groups.push(element);
                    continue;
                }
                // Use the same wrapping approach as addElementToDialog, but preserve ids and nameids from JSON
                const core = renderutils.makeElement({ ...element });
                const wrapper = document.createElement('div');
                wrapper.classList.add('element-wrapper');
                wrapper.style.position = 'absolute';

                const desiredId = String(element.id || core.id);
                const desiredType = String(element.type || core.dataset.type || '');
                const desiredNameId = String(element.nameid || core.dataset.nameid || '');

                // Preserve id on wrapper, move inner id aside
                wrapper.id = desiredId;
                core.id = desiredId + '-inner';

                // Position from JSON
                const left = Number(element.left ?? (parseInt(core.style.left || '0', 10) || 0));
                const top = Number(element.top ?? (parseInt(core.style.top || '0', 10) || 0));
                wrapper.style.left = `${left}px`;
                wrapper.style.top = `${top}px`;

                // Copy dataset from JSON into wrapper
                for (const [key, value] of Object.entries(element)) {
                    if (key === 'id') continue;
                    const val = typeof value === 'string' ? value : String(value);
                    wrapper.dataset[key] = val;
                }

                wrapper.dataset.type = desiredType;
                if (desiredNameId) {
                    wrapper.dataset.nameid = desiredNameId;
                }
                if (desiredType === 'Container' && !('itemOrder' in wrapper.dataset)) {
                    wrapper.dataset.itemOrder = 'false';
                }

                // Inner element positioned relative to wrapper
                core.style.left = '0px';
                core.style.top = '0px';
                if (desiredType === 'Button') {
                    core.style.position = 'relative';
                }

                wrapper.appendChild(core);

                // Normalize inner element IDs to reflect the wrapper id so update routines work
                const wid = wrapper.id;

                const r = core.querySelector('.custom-radio') as HTMLElement | null;
                if (r) r.id = `radio-${wid}`;

                const cb = core.querySelector('.custom-checkbox') as HTMLElement | null;
                if (cb) cb.id = `checkbox-${wid}`;

                const cv = core.querySelector('.counter-value') as HTMLDivElement | null;
                if (cv) cv.id = `counter-value-${wid}`;

                const inc = core.querySelector('.counter-arrow.up') as HTMLDivElement | null;
                if (inc) inc.id = `counter-increase-${wid}`;

                const dec = core.querySelector('.counter-arrow.down') as HTMLDivElement | null;
                if (dec) dec.id = `counter-decrease-${wid}`;

                const sh = core.querySelector('.slider-handle') as HTMLDivElement | null;
                if (sh) sh.id = `slider-handle-${wid}`;

                dialog.canvas.appendChild(wrapper);

                // Remove inner cover and add outer cover
                const innerCover = core.querySelector('.elementcover');
                innerCover && innerCover.parentElement?.removeChild(innerCover);

                const cover = document.createElement('div');
                cover.id = `cover-${wrapper.id}`;
                cover.className = 'elementcover';
                wrapper.appendChild(cover);

                // Size wrapper: fix to core's rendered size for most
                // (Button, Label should auto-size)
                if (desiredType !== 'Button' && desiredType !== 'Label') {
                    const rect = core.getBoundingClientRect();
                    if (rect.width > 0) {
                        wrapper.style.width = `${Math.round(rect.width)}px`;
                    }

                    if (rect.height > 0) {
                        wrapper.style.height = `${Math.round(rect.height)}px`;
                    }
                }

                editor.addElementListeners(wrapper);
                dialog.addElement(wrapper);
            }

            // Recreate groups (after children exist)
            for (const g of groups) {
                const ids: string[] = Array.isArray(g.elementIds)
                    ? g.elementIds
                    : String(g.elementIds || '').split(',').map((s: string) => s.trim()).filter((s: string) => s.length);

                const newId = renderutils.makeGroupFromSelection(ids, true);
                if (!newId) continue;

                const groupEl = dialog.getElement(newId) as HTMLElement | undefined;
                if (!groupEl) continue;

                const savedId = String(g.id || newId);
                // Set group id to saved id
                groupEl.id = savedId;
                dialog.elements[savedId] = groupEl;
                delete dialog.elements[newId];

                // Move group to saved position if provided
                const gl = g.left; const gt = g.top;
                if (gl !== undefined || gt !== undefined) {
                    const props: any = {};
                    if (gl !== undefined) props.left = String(gl);
                    if (gt !== undefined) props.top = String(gt);
                    renderutils.updateElement(groupEl, props);
                }
            }

            // Ensure all existing elements reflect the loaded font settings
            if (Number.isFinite(coms.fontSize) && coms.fontSize > 0) {
                renderutils.updateFont(coms.fontSize);
            }
        } catch (error) {
            console.error('loadDialogFromJson failed', error);
        }
    }
}
