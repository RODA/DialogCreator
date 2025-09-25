import { renderutils } from "./renderutils";
import { utils } from "./utils";

// Use CommonJS require for compatibility with our TS config (module: commonjs)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const iro = require('@jaames/iro');

type ColorPickerInstance = {
  color: { hexString: string; set: (val: string) => void };
  on: (eventName: string, handler: (color: any) => void) => void;
  off?: (eventName: string, handler: (color: any) => void) => void;
};

type SliderType = 'saturation' | 'value';

const pickerMap = new WeakMap<HTMLInputElement, ColorPickerInstance>();
const popoverMap = new WeakMap<HTMLInputElement, HTMLDivElement>();
const hostMap = new WeakMap<HTMLInputElement, HTMLDivElement>();
const swatchMap = new WeakMap<HTMLInputElement, HTMLButtonElement>();
const sliderTypeMap = new WeakMap<HTMLInputElement, SliderType>();
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

function clampToViewport(x: number, y: number, w: number, h: number): { left: number; top: number } {
  const pad = 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left = x;
  let top = y;
  if (left + w + pad > vw) left = Math.max(pad, vw - w - pad);
  if (top + h + pad > vh) top = Math.max(pad, vh - h - pad);
  return { left, top };
}

function isValidHex(hex: string): boolean {
  try { return utils.isValidColor(hex); } catch { return false; }
}

function isGrayscale(hex: string): boolean {
  if (!hex) return false;
  const full = hex.trim().toLowerCase();
  let r = 0, g = 0, b = 0;
  if (/^#?[0-9a-f]{3}$/.test(full)) {
    const s = full.replace('#','');
    r = parseInt(s[0]+s[0], 16);
    g = parseInt(s[1]+s[1], 16);
    b = parseInt(s[2]+s[2], 16);
  } else if (/^#?[0-9a-f]{6}$/.test(full)) {
    const s = full.replace('#','');
    r = parseInt(s.substring(0,2), 16);
    g = parseInt(s.substring(2,4), 16);
    b = parseInt(s.substring(4,6), 16);
  } else {
    return false;
  }
  return Math.abs(r-g) < 2 && Math.abs(r-b) < 2 && Math.abs(g-b) < 2;
}

function desiredSliderTypeFor(input: HTMLInputElement): SliderType {
  const v = input.value || '';
  if (isValidHex(v) && isGrayscale(v)) return 'value';
  return 'saturation';
}

function buildPicker(host: HTMLDivElement, initialColor: string, sliderType: SliderType): ColorPickerInstance {
  const picker: ColorPickerInstance = new (iro as any).ColorPicker(host, {
    width: 180,
    color: isValidHex(initialColor) ? initialColor : '#000000',
    layout: [
      { component: (iro as any).ui.Wheel },
      { component: (iro as any).ui.Slider, options: { sliderType } },
    ],
  });
  return picker;
}

function ensurePickerFor(input: HTMLInputElement): ColorPickerInstance {
  const existing = pickerMap.get(input);
  if (existing) return existing;

  const pop = document.createElement('div');
  pop.className = 'color-popover';
  pop.style.position = 'absolute';
  pop.style.zIndex = '2000';
  pop.style.display = 'none';
  document.body.appendChild(pop);

  const host = document.createElement('div');
  host.style.width = '200px';
  pop.appendChild(host);

  const picker: ColorPickerInstance = new (iro as any).ColorPicker(host, {
    width: 180,
    color: isValidHex(input.value) ? input.value : '#000000',
    layout: [
      { component: (iro as any).ui.Wheel },
      { component: (iro as any).ui.Slider, options: { sliderType: 'value' } },
      { component: (iro as any).ui.Slider, options: { sliderType: 'saturation' } },
    ],
  });

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
  if (open === undefined) open = pop.style.display === 'none';
  if (open) {
    const rect = input.getBoundingClientRect();
    const desiredLeft = rect.right + 8;
    const desiredTop = rect.top;
    const { left, top } = clampToViewport(desiredLeft, desiredTop, 220, 220);
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
    pop.style.display = 'block';

    // Sync picker color with current input; do not emit change from programmatic sets
    const picker = ensurePickerFor(input);
    try {
      suppressMap.set(input, true);
      const valid = utils.isValidColor(input.value);
      if (valid) {
        const desiredHex = String(input.value).trim().toLowerCase();
        const currentHex = String(((picker as any).color.hexString || '')).toLowerCase();
        if (desiredHex && desiredHex !== currentHex) {
          (picker as any).color.set(desiredHex);
        }
        // Only force brightness to 100 for grayscale colors (so saturation shows white→color)
        if (isGrayscale(desiredHex)) {
          const hsv = (picker as any).color.hsv as { h: number; s: number; v: number };
          (picker as any).color.hsv = { h: hsv.h || 0, s: hsv.s, v: 100 };
        }
      }
    } catch {}
    finally {
      // release suppression after microtask
      setTimeout(() => suppressMap.delete(input), 0);
    }

    // Close on outside click
    setTimeout(() => {
      const onDocClick = (ev: MouseEvent) => {
        if (!pop.contains(ev.target as Node) && ev.target !== swatchMap.get(input)) {
          pop.style.display = 'none';
          document.removeEventListener('mousedown', onDocClick, true);
          // Commit the final value for non-editor windows (Defaults)
          if (!isEditorWindow()) {
            // Dispatch change so Defaults window persists DB value
            input.dispatchEvent(new Event('change', { bubbles: true }));
          } else {
            // In editor, blur to trigger any existing blur-based update if needed
            try { input.blur(); } catch {}
          }
        }
      };
      document.addEventListener('mousedown', onDocClick, true);
    }, 0);
  } else {
    pop.style.display = 'none';
  }
}

function applyColorToInput(input: HTMLInputElement, hex: string, liveOnly = false) {
  input.value = hex;
  const sw = swatchMap.get(input);
  if (sw) sw.style.background = hex;

  if (isEditorWindow()) {
    // Live update the selected element for immediate feedback
    const propName = input.name as keyof HTMLElement['dataset'];
    const selId = getSelectedElementId();
    if (selId) {
      const selected = (document.getElementById(selId) as HTMLElement | null);
      if (selected) {
        try { renderutils.updateElement(selected, { [propName]: hex } as any); } catch {}
      }
    }
    if (!liveOnly) {
      try { input.blur(); } catch {}
    }
  } else if (!liveOnly) {
    // Defaults window: trigger change to persist via existing handler
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function enhanceColorInput(input: HTMLInputElement) {
  if ((input as any)._hasColorPicker) return;
  (input as any)._hasColorPicker = true;

  const parent = input.parentElement;
  if (!parent) return;

  // Wrap input + add swatch button
  const wrapper = document.createElement('div');
  wrapper.className = 'color-input-wrapper';
  // Inline layout to override any conflicting rules
  try {
    wrapper.style.position = 'relative';
    wrapper.style.display = 'grid';
    (wrapper.style as any).gridTemplateColumns = 'minmax(0, 1fr) 18px';
    wrapper.style.alignItems = 'center';
    (wrapper.style as any).columnGap = '4px';
    wrapper.style.width = '100%';
  } catch {}

  parent.insertBefore(wrapper, input);
  wrapper.appendChild(input);
  try {
    input.style.width = '100%';
    (input.style as any).gridColumn = '1 / 2';
  } catch {}

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
  try { (swatch.style as any).gridColumn = '2 / 3'; (swatch.style as any).justifySelf = 'end'; } catch {}
  wrapper.appendChild(swatch);
  swatchMap.set(input, swatch);

  swatch.addEventListener('click', () => togglePopover(input, true));

  // Keep picker/swatch in sync if user types manually
  input.addEventListener('input', () => {
    const v = input.value;
    if (utils.isValidColor(v)) {
      const picker = pickerMap.get(input);
      if (picker) { try { picker.color.set(v); } catch {} }
      swatch.style.background = v;
    }
  });
}

let escInstalled = false;

export function attachColorPickers(root?: ParentNode) {
  const scope: ParentNode = root || document;
  const candidates = Array.from(
    scope.querySelectorAll<HTMLInputElement>('#propertiesList input')
  ).filter((el) => typeof el.name === 'string' && el.name.toLowerCase().includes('color'));

  for (const input of candidates) {
    enhanceColorInput(input);
  }

  // Global ESC closes any open color popovers
  if (!escInstalled) {
    escInstalled = true;
    document.addEventListener('keydown', (ev: KeyboardEvent) => {
      const key = ev.key || (ev as any).code;
      if (key === 'Escape' || key === 'Esc') {
        try {
          const pops = Array.from(document.querySelectorAll('.color-popover')) as HTMLElement[];
          pops.forEach(p => p.style.display = 'none');
          ev.stopPropagation();
        } catch {}
      }
    }, true);
  }
}

export function syncColorPickers(root?: ParentNode) {
  const scope: ParentNode = root || document;
  const candidates = Array.from(
    scope.querySelectorAll<HTMLInputElement>('#propertiesList input')
  ).filter((el) => typeof el.name === 'string' && el.name.toLowerCase().includes('color'));
  for (const input of candidates) {
    const sw = swatchMap.get(input);
    if (sw) {
      const v = input.value;
      sw.style.background = utils.isValidColor(v) ? v : '#000000';
    }
    const picker = pickerMap.get(input);
    if (picker && utils.isValidColor(input.value)) {
      try { picker.color.set(input.value); } catch {}
    }
  }
}
