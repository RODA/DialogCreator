import { renderutils } from "./renderutils";
import { utils } from "./utils";

// Use CommonJS require for compatibility with our TS config (module: commonjs)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const iro = require('@jaames/iro');

type ColorPickerInstance = {
    color: {
        hexString: string;
        set: (val: string) => void
    };
    on: (eventName: string, handler: (color: any) => void) => void;
    off?: (eventName: string, handler: (color: any) => void) => void;
};

const pickerMap = new WeakMap<HTMLInputElement, ColorPickerInstance>();
const popoverMap = new WeakMap<HTMLInputElement, HTMLDivElement>();
const hostMap = new WeakMap<HTMLInputElement, HTMLDivElement>();
const swatchMap = new WeakMap<HTMLInputElement, HTMLButtonElement>();
const suppressMap = new WeakMap<HTMLInputElement, boolean>();

function isEditorWindow(): boolean {
    // Editor window has a #dialog canvas; Defaults does not
    return Boolean(document.getElementById('dialog'));
}

function getSelectedElementId(): string | null {
    const propsList = document.getElementById('propertiesList') as HTMLDivElement | null;
    const boundId = propsList?.dataset?.currentElementId || '';
    return boundId || null;
}

function isValidHex(hex: string): boolean {
    try {
        return utils.isValidColor(hex);
    } catch {
        return false;
    }
}

function buildPicker(host: HTMLDivElement, initialColor: string): ColorPickerInstance {
    const picker: ColorPickerInstance = new iro.ColorPicker(
        host,
        {
            width: 250, // allow room for vertical sliders next to the box
            color: isValidHex(initialColor) ? initialColor : '#000000',
            layoutDirection: 'horizontal',
            layout: [
                {
                    component: iro.ui.Box,
                    options: {
                        borderWidth: 1
                    }
                },
                {
                    component: iro.ui.Slider,
                    options: {
                        sliderType: 'value',
                        layoutDirection: 'vertical',
                        height: 180
                    }
                },
                {
                    component: iro.ui.Slider,
                    options: {
                        sliderType: 'hue',
                        layoutDirection: 'vertical',
                        height: 180
                    }
                }
            ]
        }
    );
    return picker;
}

function ensurePickerFor(input: HTMLInputElement): ColorPickerInstance {
    const existing = pickerMap.get(input);
    if (existing) return existing;
    let picker: ColorPickerInstance;

    const pop = document.createElement('div');
    pop.className = 'color-popover';
    pop.style.position = 'absolute';
    pop.style.zIndex = '2000';
    pop.style.display = 'none';
    document.body.appendChild(pop);

    const host = document.createElement('div');
    host.style.minWidth = '250px';
    host.style.minHeight = '320px';
    host.style.position = 'relative';
    pop.appendChild(host);

    picker = buildPicker(host, input.value);

    picker.on('color:change', (color: any) => {
        if (suppressMap.get(input)) return;
        const hex = color.hexString as string;
        applyColorToInput(input, hex, /*liveOnly*/ true);
    });

    pickerMap.set(input, picker);
    popoverMap.set(input, pop);
    hostMap.set(input, host);

    return picker;
}

function togglePopover(input: HTMLInputElement, open?: boolean) {
    // Ensure popover exists
    const pop = popoverMap.get(input) || ensurePickerFor(input) && popoverMap.get(input)!;
    if (!pop) return;

    // Position near the input
    if (open === undefined) {
        open = pop.style.display === 'none';
    }

    if (!open) {
        pop.style.display = 'none';
        return;
    }

    // Anchor position near the swatch button if available, otherwise the input
    const anchorEl = swatchMap.get(input) || input;
    const rect = anchorEl.getBoundingClientRect(); // the small color rectangle clicked by the user

    const pad = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Initial placement: to the right of the clicked color rectangle, aligned on its top
    let left = rect.right + pad;
    let top = rect.top;

    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
    pop.style.display = 'block';
    pop.style.visibility = 'hidden';

    requestAnimationFrame(() => {
        // Adjust position after the picker has fully rendered; measure true content size (including sliders)
        const host = hostMap.get(input) as HTMLDivElement | undefined;
        const contentW = Math.max(
            pop.scrollWidth,
            host?.scrollWidth || 0,
            host?.getBoundingClientRect().width || 0
        );
        const contentH = Math.max(
            pop.scrollHeight,
            host?.scrollHeight || 0,
            host?.getBoundingClientRect().height || 0
        );

        let newLeft = left;
        let newTop = top;

        // Clamp horizontally using measured content width
        newLeft = Math.min(
            Math.max(newLeft, pad),
            Math.max(pad, vw - contentW - pad)
        );
        // Clamp vertically using measured content height
        newTop = Math.min(
            Math.max(newTop, pad),
            Math.max(pad, vh - contentH - pad)
        );

        pop.style.left = `${newLeft}px`;
        pop.style.top = `${newTop}px`;

        // After adjustment, show the popover
        pop.style.visibility = 'visible';
    });

    // Sync picker color with current input
    const picker = ensurePickerFor(input);
    try {
        suppressMap.set(input, true);
        const valid = utils.isValidColor(input.value);
        if (valid) {
            const desiredHex = String(input.value).trim().toLowerCase();
            const currentHex = String((picker.color.hexString || '')).toLowerCase();
            if (desiredHex && desiredHex !== currentHex) {
                picker.color.set(desiredHex);
            }
            // Preserve the exact color brightness/saturation as saved by the user.
            // Do not override V to 100 — this ensures the picker opens at the last chosen color.
        }
    } finally {
        // release suppression after microtask
        setTimeout(() => suppressMap.delete(input), 0);
    }

    // Close on outside click
    setTimeout(() => {
        const onDocClick = (ev: MouseEvent) => {
            // const host = hostMap.get(input) as HTMLDivElement | undefined;
            // const target = ev.target as Node;
            // const isOverPicker = host ? host.contains(target) : pop.contains(target);
            if (!pop.contains(ev.target as Node) && ev.target !== swatchMap.get(input)) {
            // if (!isOverPicker && target !== swatchMap.get(input)) {
            pop.style.display = 'none';
            document.removeEventListener('mousedown', onDocClick, true);
            // Commit the final value for non-editor windows (Defaults)
            if (!isEditorWindow()) {
                // Dispatch change so Defaults window persists DB value
                input.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
                // In editor, blur to trigger any existing blur-based update if needed
                input.blur();
            }
            }
        };
        document.addEventListener('mousedown', onDocClick, true);
    }, 0);
}

function applyColorToInput(input: HTMLInputElement, hex: string, liveOnly = false) {
    input.value = hex;
    const sw = swatchMap.get(input);
    if (sw) {
        sw.style.background = hex;
    }

    if (isEditorWindow()) {
        // Live update the selected element for immediate feedback
        const propName = input.name as keyof HTMLElement['dataset'];
        const selected_id = getSelectedElementId();
        if (selected_id) {
            const selected = (document.getElementById(selected_id) as HTMLElement | null);
            if (selected) {
                renderutils.updateElement(
                    selected,
                    {
                        [propName]: hex
                    } as any // TODO: as AnyElementProperties
                );
            }
        }

        if (!liveOnly) {
            input.blur();
        }
    } else if (!liveOnly) {
        // Defaults window: trigger change to persist via existing handler
        input.dispatchEvent(
            new Event(
                'change',
                {
                    bubbles: true
                }
            )
        );
    }
}

function enhanceColorInput(input: HTMLInputElement) {
    if (input.dataset.hasColorPicker) return;

    input.dataset.hasColorPicker = 'true';

    const parent = input.parentElement;
    if (!parent) return;

    // Wrap input + add swatch button
    const wrapper = document.createElement('div');

    wrapper.className = 'color-input-wrapper';
    // Inline layout to override any conflicting rules
    wrapper.style.position = 'relative';
    wrapper.style.display = 'grid';
    wrapper.style.gridTemplateColumns = 'minmax(0, 1fr) 18px';
    wrapper.style.alignItems = 'center';
    wrapper.style.columnGap = '4px';
    wrapper.style.width = '100%';

    parent.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    input.style.width = '100%';
    input.style.gridColumn = '1 / 2';

    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'color-swatch-btn';
    swatch.title = 'Pick color';
    swatch.style.width = '18px';
    swatch.style.height = '18px';
    swatch.style.background = utils.isValidColor(input.value) ? input.value : '#000000';
    swatch.style.border = '0.5px solid #000000';
    swatch.setAttribute('tabindex', '-1'); // do not take focus
    swatch.addEventListener('mousedown', (e) => e.preventDefault()); // prevent focus ring on mouse
    swatch.addEventListener('keydown', (e) => e.preventDefault()); // ignore keyboard focus actions
    swatch.style.gridColumn = '2 / 3';
    swatch.style.justifySelf = 'end';
    wrapper.appendChild(swatch);
    swatchMap.set(input, swatch);

    swatch.addEventListener('click', () => togglePopover(input, true));

    // Keep picker/swatch in sync if user types manually
    input.addEventListener('input', () => {
        const v = input.value;
        if (utils.isValidColor(v)) {
            const picker = pickerMap.get(input);
            if (picker) {
                picker.color.set(v);
            }
            swatch.style.background = v;
        }
    });
}

let escapeInstalled = false;

export function attachColorPickers(root?: ParentNode) {
    const scope: ParentNode = root || document;
    const candidates = Array.from(
        scope.querySelectorAll<HTMLInputElement>('#propertiesList input')
    ).filter((el) => {
        return(
            typeof el.name === 'string' &&
            el.name.toLowerCase().includes('color')
        )
    });

    for (const input of candidates) {
        enhanceColorInput(input);
    }

    // Global ESC closes any open color popovers
    if (!escapeInstalled) {
        escapeInstalled = true;
        document.addEventListener('keydown', (ev: KeyboardEvent) => {
            const key = ev.key || ev.code;
            if (key === 'Escape' || key === 'Esc') {
                const pops = Array.from(document.querySelectorAll('.color-popover')) as HTMLElement[];
                pops.forEach(p => p.style.display = 'none');
                ev.stopPropagation();
            }
        }, true);
    }
}

export function syncColorPickers(root?: ParentNode) {
    const scope: ParentNode = root || document;
    const candidates = Array.from(
        scope.querySelectorAll<HTMLInputElement>('#propertiesList input')
    ).filter((el) => {
        return(
            typeof el.name === 'string' &&
            el.name.toLowerCase().includes('color')
        )
    });

    for (const input of candidates) {
        const sw = swatchMap.get(input);
        if (sw) {
            const v = input.value;
            sw.style.background = utils.isValidColor(v) ? v : '#000000';
        }

        const picker = pickerMap.get(input);
        if (picker && utils.isValidColor(input.value)) {
            picker.color.set(input.value);
        }
    }
}
