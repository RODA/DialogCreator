import { dialogContainer } from './editor/dialogContainer';

export const helpers = {

    unselectRadioGroup: function(element: HTMLElement) {
        document.querySelectorAll(`[group="${element.getAttribute("group")}"]`).forEach(
            (radio) => {
                const id = radio.id.slice(6);
                dialogContainer.elements[id].isSelected = false;
                radio.setAttribute('aria-checked', 'false');
            }
        );
    },

    updateHandleStyle: function(
        handle: HTMLDivElement,
        shape: string,
        direction: string,
        color: string,
        size: number,
        position: number
    ) {
        // Clear all shape-specific inline styles
        handle.style.border = '';
        handle.style.borderLeft = '';
        handle.style.borderRight = '';
        handle.style.borderTop = '';
        handle.style.borderBottom = '';
        handle.style.backgroundColor = '';
        handle.style.width = '';
        handle.style.height = '';
        handle.style.borderRadius = '';

        // Update dataset (this triggers your CSS-based fallback if needed)
        handle.dataset.shape = shape;
        handle.dataset.direction = direction;

        // Now apply inline styles based on shape
        if (shape === 'triangle') {
            if (direction === 'horizontal') {
                handle.style.borderLeft = size + 'px solid transparent';
                handle.style.borderRight = size + 'px solid transparent';
                handle.style.borderBottom = (1.5 * size) + 'px solid ' + color;
                handle.style.left = position + "%";
                handle.style.top = "100%";
            } else if (direction === 'vertical') {
                handle.style.borderTop = size + 'px solid transparent';
                handle.style.borderBottom = size + 'px solid transparent';
                handle.style.borderRight = (1.5 * size) + 'px solid ' + color;
                handle.style.left = "0%";
                handle.style.top = (100 - position) + "%";
            }
            handle.style.width = '0px';
            handle.style.height = '0px';
        } else if (shape === 'circle') {
            const radius = 1.5 * size;
            handle.style.width = `${radius}px`;
            handle.style.height = `${radius}px`;
            handle.style.backgroundColor = color;
            handle.style.borderRadius = '50%';
            if (direction == "horizontal") {
                handle.style.left = position + "%";
                handle.style.top = "50%";
            } else {
                handle.style.left = "50%";
                handle.style.top = (100 - position) + "%";
            }
        }
    },

    generateUniqueNameID: function(
        type: string,
        nameidRecords: Record<string, number>
    ): string {
        const existingIds = new Set(
            Array.from(document.querySelectorAll<HTMLElement>('[data-nameid]'))
                .map(el => el.dataset.nameid!)
        );

        type = type.toLowerCase();

        if (!(type in nameidRecords)) {
            nameidRecords[type] = 1;
        }

        let candidate: string;
        do {
            candidate = `${type}${nameidRecords[type]++}`;
        } while (existingIds.has(candidate));

        return candidate;
    },

    nameidValidChange: function(newId: string, currentElement: HTMLElement): boolean {
        const allIds = new Set(
            Array.from(document.querySelectorAll<HTMLElement>('[data-nameid]'))
                .map(el => el !== currentElement ? el.dataset.nameid! : null)
                .filter(id => id !== null)
        );

        return !allIds.has(newId);
    },

    makeCounter: function(start: number, uuid: string): HTMLElement {
        const wrapper = document.createElement("div");
        wrapper.className = "counter-wrapper";

        const decrease = document.createElement("div");
        decrease.className = "counter-arrow down";
        decrease.innerHTML = "&#9660;"; // ▼

        const display = document.createElement("div");
        display.className = "counter-value";
        display.id = "counter-value-" + uuid;
        display.textContent = String(start);

        const increase = document.createElement("div");
        increase.className = "counter-arrow up";
        increase.innerHTML = "&#9650;"; // ▲

        wrapper.appendChild(decrease);
        wrapper.appendChild(display);
        wrapper.appendChild(increase);

        return wrapper;
    }
}

