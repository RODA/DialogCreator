import { coms } from "../modules/coms";
import { utils } from "../library/utils";
import { renderutils } from "../library/renderutils";

// Render a snapshot of the dialog using the exact same element factory as the editor
window.addEventListener("DOMContentLoaded", () => {
  coms.on("renderPreview", (data: unknown) => {
    try {
      const payload = typeof data === "string" ? JSON.parse(data as string) : (data as any);
      renderPreview(payload);
    } catch (e) {
      console.error("Failed to parse preview data:", e);
    }
  });
});

function renderPreview(dialog: {
  id: string;
  properties: { width: string | number; height: string | number; background?: string };
  syntax: Record<string, unknown>;
  elements: Array<Record<string, any>>;
}) {
  const root = document.getElementById("preview-root");
  if (!root) return;
  root.innerHTML = "";

  const width = Number(dialog.properties.width) || 640;
  const height = Number(dialog.properties.height) || 480;
  const background = dialog.properties.background || "#ffffff";

  const canvas = document.createElement("div");
  canvas.className = "preview-canvas";
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  canvas.style.backgroundColor = String(background);

  // Align typography with editor
  const fs = Number((dialog.properties as any).fontSize);
  if (Number.isFinite(fs) && fs > 0) {
    (coms as any).fontSize = fs;
  }

  for (const data of dialog.elements || []) {
    const element = renderutils.makeElement({ ...(data as any) } as any);

    // Restore original id and nameid to avoid factory renaming for preview
    if ((data as any).id) element.id = String((data as any).id);
    if ((data as any).nameid) (element.dataset as any).nameid = String((data as any).nameid);

    // Remove the drag-protection overlay used in the editor so interactions work in preview
    const cover = element.querySelector('.elementcover');
    if (cover && cover.parentElement) {
      cover.parentElement.removeChild(cover);
    }

    // Ensure left/top are applied (makeElement already does this when provided)
    if ((data as any).left !== undefined) {
      element.style.left = String((data as any).left) + 'px';
    }
    if ((data as any).top !== undefined) {
      element.style.top = String((data as any).top) + 'px';
    }

    // Select: populate options from value (comma/semicolon separated)
    if (element instanceof HTMLSelectElement) {
      const raw = (data as any).value ?? '';
      const text = String(raw);
      const tokens = text.split(/[;,]/).map(s => s.trim()).filter(s => s.length > 0);
      element.innerHTML = '';
      if (tokens.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = '';
        element.appendChild(opt);
      } else {
        for (const t of tokens) {
          const opt = document.createElement('option');
          opt.value = t;
          opt.textContent = t;
          element.appendChild(opt);
        }
        // If a single value should also be the selected value, keep first by default
      }
    }

    // Checkbox: reflect isChecked
    if ((element.dataset?.type || '') === 'Checkbox') {
      const custom = element.querySelector('.custom-checkbox') as HTMLElement | null;
      if (custom) {
        const checked = utils.isTrue((data as any).isChecked);
        custom.setAttribute('aria-checked', String(checked));
        if (checked) custom.classList.add('checked'); else custom.classList.remove('checked');
        // Keyboard accessibility in preview (space/enter)
        custom.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            (e.currentTarget as HTMLElement).click();
          }
        });
      }
    }

    // Radio: reflect isSelected and make it interactive in preview
    if ((element.dataset?.type || '') === 'Radio') {
      const custom = element.querySelector('.custom-radio') as HTMLElement | null;
      if (custom) {
        const selected = utils.isTrue((data as any).isSelected);
        custom.setAttribute('aria-checked', String(selected));
        if (selected) custom.classList.add('selected'); else custom.classList.remove('selected');

        const selectThis = () => {
          const group = custom.getAttribute('group') || '';
          if (group) {
            document.querySelectorAll(`.custom-radio[group="${group}"]`).forEach((el) => {
              const r = el as HTMLElement;
              r.setAttribute('aria-checked', 'false');
              r.classList.remove('selected');
            });
          }
          custom.setAttribute('aria-checked', 'true');
          custom.classList.add('selected');
        };

        // Click to select this radio and unselect others in the same group
        custom.addEventListener('click', selectThis);
        // Keyboard accessibility
        custom.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            selectThis();
          }
        });
      }
    }

    // Counter: wire increase/decrease within [startval, maxval]
    if ((element.dataset?.type || '') === 'Counter') {
      const display = element.querySelector('.counter-value') as HTMLDivElement | null;
      const inc = element.querySelector('.counter-arrow.up') as HTMLDivElement | null;
      const dec = element.querySelector('.counter-arrow.down') as HTMLDivElement | null;
      const min = Number((data as any).startval ?? 0);
      const max = Number((data as any).maxval ?? min);

      const getValue = () => Number(display?.textContent ?? min);
      const setValue = (v: number) => { if (display) display.textContent = String(v); };

      inc?.addEventListener('click', () => {
        const curr = getValue();
        if (curr < max) setValue(curr + 1);
      });
      dec?.addEventListener('click', () => {
        const curr = getValue();
        if (curr > min) setValue(curr - 1);
      });
    }

    // Button: prevent text selection and add pressed/click feedback
    if ((element.dataset?.type || '') === 'Button') {
      const doPress = () => element.classList.add('btn-active');
      const clearPress = () => element.classList.remove('btn-active');
      element.addEventListener('mousedown', doPress);
      element.addEventListener('mouseup', clearPress);
      element.addEventListener('mouseleave', clearPress);
      element.addEventListener('click', () => {
        if (!utils.isTrue((data as any).isEnabled)) return;
        const action = String((data as any).onClick || 'run');
        switch (action) {
          case 'reset':
            // showMessage('info', 'Preview', `Reset action for "${(data as any).nameid || 'Button'}"`);
            coms.sendTo('editorWindow', 'consolog', `Reset action for "${(data as any).nameid || 'Button'}"`);
            break;
          case 'run':
          default:
            coms.sendTo('editorWindow', 'consolog', `Run action for "${(data as any).nameid || 'Button'}"`);
            break;
        }
      });
    }

    // Slider: make handle draggable within the track in preview
    if ((element.dataset?.type || '') === 'Slider') {
      const handle = element.querySelector('.slider-handle') as HTMLDivElement | null;
      if (handle) {
        let dragging = false;
        const direction = (element.dataset.direction || 'horizontal').toLowerCase();

        const onMove = (ev: MouseEvent) => {
          if (!dragging) return;
          const rect = element.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) return;
          let percent = 0;
          if (direction === 'vertical') {
            const relY = (ev.clientY - rect.top);
            const clamped = Math.max(0, Math.min(rect.height, relY));
            // handlepos is 0..100 where 100 is top; updateHandleStyle uses (100 - handlepos) for top
            percent = Math.round(100 - (clamped / rect.height) * 100);
          } else {
            const relX = (ev.clientX - rect.left);
            const clamped = Math.max(0, Math.min(rect.width, relX));
            percent = Math.round((clamped / rect.width) * 100);
          }
          element.dataset.handlepos = String(percent);
          renderutils.updateHandleStyle(handle, {
            handleshape: element.dataset.handleshape || 'triangle',
            direction: element.dataset.direction || 'horizontal',
            handlesize: element.dataset.handlesize || '8',
            handlecolor: element.dataset.handlecolor || '#318f34',
            handlepos: String(percent)
          } as any);
        };
        const onUp = () => { dragging = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
        handle.addEventListener('mousedown', (ev: MouseEvent) => {
          if ((element.classList.contains('disabled-div')) || !utils.isTrue((data as any).isEnabled)) return;
          dragging = true;
          document.addEventListener('mousemove', onMove);
          document.addEventListener('mouseup', onUp);
          ev.preventDefault();
        });
      }
    }

    // Visibility / Enabled
    if (!utils.isTrue((data as any).isVisible)) {
      // In preview, hidden elements should not be visible at all
      element.style.display = 'none';
    }
    if (!utils.isTrue((data as any).isEnabled)) {
      element.classList.add('disabled-div');
      // In preview, disabled elements should not be interactive
      try {
        (element as any).style.pointerEvents = 'none';
        if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || (window as any).HTMLTextAreaElement && element instanceof (window as any).HTMLTextAreaElement) {
          (element as HTMLInputElement | HTMLSelectElement).disabled = true;
        } else {
          const customCheckbox = element.querySelector('.custom-checkbox') as HTMLElement | null;
          const customRadio = element.querySelector('.custom-radio') as HTMLElement | null;
          if (customCheckbox) customCheckbox.setAttribute('aria-disabled', 'true');
          if (customRadio) customRadio.setAttribute('aria-disabled', 'true');
        }
      } catch {}
    }

    canvas.appendChild(element);
  }

  root.appendChild(canvas);
}

