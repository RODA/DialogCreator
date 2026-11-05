import { canElementAnchorTo, getElementAnchorError } from '../library/elementAnchoring';
import type { ElementAnchorProperties } from '../interfaces/elements';

export type ElementAnchorPropertyChanges = ElementAnchorProperties;

export interface ElementAnchorPropertiesOptions {
    onChange(element: HTMLElement, properties: ElementAnchorPropertyChanges): void;
}

let selectedElement: HTMLElement | null = null;
let propertyChangeHandler: ElementAnchorPropertiesOptions['onChange'] | undefined;
let listenersInstalled = false;
let rejectedChange: { context: string; message: string } | null = null;

function findSelectedElement(element?: HTMLElement | null): HTMLElement | null {
    if (element === undefined) {
        const properties = document.getElementById('propertiesList');
        if (properties?.classList.contains('hidden')) {
            return null;
        }
        const id = properties?.dataset.currentElementId || '';
        element = id ? document.getElementById(id) : null;
    }

    if (!element) {
        return null;
    }

    const wrapper = element.closest<HTMLElement>('.element-wrapper') || element;
    if (
        !wrapper.classList.contains('element-wrapper')
        || wrapper.dataset.type === 'Group'
        || wrapper.classList.contains('element-group')
        || !wrapper.isConnected
    ) {
        return null;
    }

    return wrapper;
}

function showElementAnchorError(message: string): void {
    const error = document.getElementById('element-anchor-error');
    if (error) {
        error.textContent = message;
        error.classList.toggle('hidden-element', !message);
    }
}

function anchorContextSnapshot(element: HTMLElement): string {
    const siblings = Array.from(element.parentElement?.children || []);
    return JSON.stringify(siblings.filter((sibling): sibling is HTMLElement => {
        return sibling instanceof HTMLElement && sibling.classList.contains('element-wrapper');
    }).map((sibling) => ({ ...sibling.dataset, id: sibling.id })));
}

function showAnchorChoice(
    input: HTMLSelectElement,
    value: string,
    description: string
): void {
    input.querySelectorAll('option[data-unsupported]').forEach((option) => option.remove());
    const normalized = value.trim().toLowerCase();
    const supported = Array.from(input.options).some((option) => option.value === normalized);
    if (supported) {
        input.value = normalized;
        return;
    }

    const unsupported = document.createElement('option');
    unsupported.value = value;
    unsupported.textContent = `Unsupported ${description} (${value})`;
    unsupported.dataset.unsupported = 'true';
    input.appendChild(unsupported);
    input.value = value;
}

function applyElementAnchorChange(properties: ElementAnchorPropertyChanges): void {
    if (!selectedElement?.isConnected || !propertyChangeHandler) {
        return;
    }

    const element = selectedElement;
    try {
        propertyChangeHandler(element, properties);
        refreshElementAnchorProperties(element);
    } catch (reason) {
        const message = reason instanceof Error ? reason.message : String(reason);
        selectedElement = null;
        refreshElementAnchorProperties(element);
        rejectedChange = { context: anchorContextSnapshot(element), message };
        showElementAnchorError(message);
    }
}

function installAnchorNumberInput(
    input: HTMLInputElement,
    property: 'anchorGap' | 'anchorOffset'
): void {
    input.addEventListener('change', () => {
        const value = input.value.trim();
        const number = Number(value);
        if (!value || !Number.isFinite(number)) {
            const name = property === 'anchorGap' ? 'Gap' : 'Offset';
            const message = `${name} must be a finite number.`;
            input.setCustomValidity(message);
            input.setAttribute('aria-invalid', 'true');
            showElementAnchorError(message);
            return;
        }

        input.setCustomValidity('');
        input.removeAttribute('aria-invalid');
        if (property === 'anchorGap') {
            applyElementAnchorChange({ anchorGap: number });
        } else {
            applyElementAnchorChange({ anchorOffset: number });
        }
    });

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            input.blur();
        }
    });
}

export function refreshElementAnchorProperties(element?: HTMLElement | null): void {
    const previousElement = selectedElement;
    selectedElement = findSelectedElement(element);
    if (
        selectedElement !== previousElement
        || !selectedElement
        || (rejectedChange && rejectedChange.context !== anchorContextSnapshot(selectedElement))
    ) {
        rejectedChange = null;
    }

    const target = document.getElementById('element-anchor-target') as HTMLSelectElement | null;
    const position = document.getElementById('element-anchor-position') as HTMLSelectElement | null;
    const gap = document.getElementById('element-anchor-gap') as HTMLInputElement | null;
    const align = document.getElementById('element-anchor-align') as HTMLSelectElement | null;
    const offset = document.getElementById('element-anchor-offset') as HTMLInputElement | null;
    if (!target || !position || !gap || !align || !offset) {
        return;
    }

    let editingNumber: HTMLInputElement | null = null;
    if (selectedElement && selectedElement === previousElement) {
        if (document.activeElement === gap) {
            editingNumber = gap;
        } else if (document.activeElement === offset) {
            editingNumber = offset;
        }
    }

    const targetId = selectedElement?.dataset.anchorTarget?.trim() || '';
    const attached = Boolean(selectedElement && targetId);
    const targetRow = document.getElementById('element-anchor-target-row');
    targetRow?.classList.toggle('hidden-element', !selectedElement);
    document.querySelectorAll('.element-anchor-detail').forEach((row) => {
        row.classList.toggle('hidden-element', !attached);
    });

    for (const control of [target, position, gap, align, offset]) {
        control.disabled = !selectedElement;
        if (control !== editingNumber) {
            control.removeAttribute('aria-invalid');
        }
    }
    if (gap !== editingNumber) {
        gap.setCustomValidity('');
    }
    if (offset !== editingNumber) {
        offset.setCustomValidity('');
    }

    for (const property of ['left', 'top'] as const) {
        const input = document.getElementById(`el${property}`) as HTMLInputElement | null;
        if (input) {
            input.readOnly = attached;
            input.title = attached ? 'Calculated from the attached element.' : '';
            if (attached && selectedElement) {
                input.value = selectedElement.style[property].replace('px', '')
                    || selectedElement.dataset[property]
                    || '';
            }
        }
    }

    target.replaceChildren();
    const absolute = document.createElement('option');
    absolute.value = '';
    absolute.textContent = 'None (absolute)';
    target.appendChild(absolute);

    if (!selectedElement) {
        position.value = 'left';
        gap.value = '10';
        align.value = 'middle';
        offset.value = '0';
        showElementAnchorError('');
        return;
    }

    let foundTarget = false;
    let selectedTargetError = '';
    const siblings = Array.from(selectedElement.parentElement?.children || []);
    for (const sibling of siblings) {
        if (
            !(sibling instanceof HTMLElement)
            || (sibling === selectedElement && sibling.id !== targetId)
            || !sibling.classList.contains('element-wrapper')
            || !sibling.id
            || sibling.dataset.type === 'Group'
            || sibling.classList.contains('element-group')
        ) {
            continue;
        }

        const option = document.createElement('option');
        option.value = sibling.id;
        const name = sibling.dataset.nameid || sibling.dataset.type || sibling.id;
        const reason = canElementAnchorTo(selectedElement, sibling);
        option.textContent = name;
        if (reason) {
            const description = /cycle|circular/i.test(reason) ? 'circular reference' : 'unavailable';
            option.textContent = `${name} (${description})`;
            option.title = reason;
            option.disabled = sibling.id !== targetId;
        }
        target.appendChild(option);
        if (sibling.id === targetId) {
            foundTarget = true;
            selectedTargetError = reason;
        }
    }

    let error = getElementAnchorError(selectedElement) || selectedTargetError;
    if (attached && !foundTarget) {
        const missing = document.createElement('option');
        missing.value = targetId;
        const unavailable = document.getElementById(targetId);
        missing.textContent = unavailable
            ? `Unavailable target (${unavailable.dataset.nameid || targetId})`
            : `Missing target (${targetId})`;
        target.appendChild(missing);
        if (!error) {
            error = 'The attached element is missing from this canvas or group. Choose another element or None (absolute).';
        }
        missing.title = error;
        target.setAttribute('aria-invalid', 'true');
    }
    if (selectedTargetError) {
        target.setAttribute('aria-invalid', 'true');
    }

    target.value = targetId;
    target.title = target.selectedOptions[0]?.title || target.selectedOptions[0]?.textContent || '';
    showAnchorChoice(position, selectedElement.dataset.anchorPosition ?? 'left', 'side');
    if (gap !== editingNumber) {
        gap.value = selectedElement.dataset.anchorGap ?? '10';
    }
    showAnchorChoice(align, selectedElement.dataset.anchorAlign ?? 'middle', 'alignment');
    if (offset !== editingNumber) {
        offset.value = selectedElement.dataset.anchorOffset ?? '0';
    }
    if (attached) {
        for (const [input, name] of [[gap, 'Gap'], [offset, 'Offset']] as const) {
            if (input !== editingNumber && (!input.value.trim() || !Number.isFinite(Number(input.value)))) {
                const message = `${name} must be a finite number.`;
                input.setCustomValidity(message);
                input.setAttribute('aria-invalid', 'true');
                error ||= message;
            }
        }
    }
    showElementAnchorError(editingNumber?.validationMessage || rejectedChange?.message || error);
}

export function installElementAnchorProperties(options: ElementAnchorPropertiesOptions): void {
    propertyChangeHandler = options.onChange;
    if (listenersInstalled) {
        refreshElementAnchorProperties();
        return;
    }

    const target = document.getElementById('element-anchor-target') as HTMLSelectElement | null;
    const position = document.getElementById('element-anchor-position') as HTMLSelectElement | null;
    const gap = document.getElementById('element-anchor-gap') as HTMLInputElement | null;
    const align = document.getElementById('element-anchor-align') as HTMLSelectElement | null;
    const offset = document.getElementById('element-anchor-offset') as HTMLInputElement | null;
    if (!target || !position || !gap || !align || !offset) {
        return;
    }

    target.addEventListener('change', () => {
        applyElementAnchorChange({ anchorTarget: target.value });
    });
    position.addEventListener('change', () => {
        if (
            position.value === 'left'
            || position.value === 'right'
            || position.value === 'above'
            || position.value === 'below'
        ) {
            applyElementAnchorChange({ anchorPosition: position.value });
        }
    });
    align.addEventListener('change', () => {
        if (
            align.value === 'start'
            || align.value === 'middle'
            || align.value === 'end'
        ) {
            applyElementAnchorChange({ anchorAlign: align.value });
        }
    });
    installAnchorNumberInput(gap, 'anchorGap');
    installAnchorNumberInput(offset, 'anchorOffset');

    listenersInstalled = true;
    refreshElementAnchorProperties();
}
