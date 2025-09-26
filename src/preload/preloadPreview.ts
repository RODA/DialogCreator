import { coms } from "../modules/coms";
import { utils } from "../library/utils";
import { renderutils } from "../library/renderutils";
import { conditions as cond } from "../modules/conditions";

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

  const created: HTMLElement[] = [];
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
        if (selected) {
          custom.classList.add('selected');
        } else {
          custom.classList.remove('selected');
        }

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
            handleColor: element.dataset.handleColor || '#75c775',
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
    created.push(element);

    // After the element is in DOM: enforce valueType for Input
    try {
      if (element instanceof HTMLInputElement) {
        const valueType = String((data as any).valueType || (element as any).dataset?.valueType || '').toLowerCase();

        switch (valueType) {
          case 'integer': {
            renderutils.setIntegers([element], '');
            break;
          }
          case 'signed integer': {
            renderutils.setSignedIntegers([element], '');
            break;
          }
          case 'double': {
            renderutils.setDouble([element], '');
            break;
          }
          case 'signed double': {
            renderutils.setSignedDouble([element], '');
            break;
          }
          default:
            // String or unknown: no filter
            break;
        }
      }
    } catch {}
  }

  // === Conditions engine (preview) ===
  try {
    const getByName = (name: string): HTMLElement | null => {
      return created.find(el => (el.dataset?.nameid || el.id) === name) || null;
    };

    const bool = (v: unknown) => utils.isTrue(String(v));

    const getProp = (name: string, propOrNumber: string): unknown => {
      const el = getByName(name);
      if (!el) return false;
      const type = String(el.dataset?.type || '').toLowerCase();
      const token = String(propOrNumber).toLowerCase();
      if (token === 'checked') return bool(el.dataset?.isChecked);
      if (token === 'selected') return bool(el.dataset?.isSelected);
      if (token === 'visible') return !el.style.display || el.style.display !== 'none';
      if (token === 'enabled') return !el.classList.contains('disabled-div');
      // numeric compare: use element value
      const num = Number(propOrNumber);
      if (!Number.isNaN(num)) {
        switch (type) {
          case 'slider': {
            const pos = Number(el.dataset?.handlepos ?? 50);
            return Math.max(0, Math.min(100, pos)) / 100;
          }
          case 'counter': {
            const disp = el.querySelector('.counter-value') as HTMLDivElement | null;
            const n = Number(disp?.textContent ?? el.dataset?.startval ?? 0);
            return Number.isFinite(n) ? n : 0;
          }
          case 'input': {
            return Number(el.dataset?.value ?? (el.textContent || '0'));
          }
          case 'select': {
            return Number(el.dataset?.value ?? 0);
          }
          default:
            return 0;
        }
      }
      return false;
    };

    const evalAtomic = (arr: any[]): boolean => {
      const [name, op, right] = arr as [string, string, string];
      const rightLower = String(right).toLowerCase();
      if (rightLower === 'checked' || rightLower === 'selected' || rightLower === 'visible' || rightLower === 'enabled') {
        const v = !!getProp(name, rightLower);
        if (op === '==') return v === true;
        if (op === '!=') return v === false;
        return false;
      }
      // numeric compare
      const leftVal = Number(getProp(name, 'value'));
      const rightVal = Number(right);
      if (Number.isNaN(leftVal) || Number.isNaN(rightVal)) return false;
      switch (op) {
        case '==': return leftVal === rightVal;
        case '!=': return leftVal !== rightVal;
        case '>=': return leftVal >= rightVal;
        case '<=': return leftVal <= rightVal;
        default: return false;
      }
    };

    const evalExpr = (expr: any): boolean => {
      if (!Array.isArray(expr)) return !!expr;
      // Simple atomic
      if (expr.length === 3 && typeof expr[0] === 'string') return evalAtomic(expr);
      // Complex [left, '&'|'|', right, ...]
      let acc = evalExpr(expr[0]);
      for (let i = 1; i < expr.length; i += 2) {
        const op = expr[i];
        const rhs = evalExpr(expr[i + 1]);
        if (op === '&') acc = acc && rhs; else if (op === '|') acc = acc || rhs;
      }
      return acc;
    };

    type Actions = Record<string, any[]>; // action -> list of expressions
    const parsedByTarget = new Map<HTMLElement, Actions>();

    const mergeParsed = (acc: Actions, text: string | undefined | null) => {
      const t = String(text || '').trim();
      if (!t) return;
      const parsed = cond.parseConditions(t) as any;
      if (typeof parsed === 'string') return;
      const result = parsed.result as Record<string, any>;
      for (const [action, expr] of Object.entries(result)) {
        if (!acc[action]) acc[action] = [];
        acc[action].push(expr);
      }
    };

    const parseFor = (target: HTMLElement): Actions | null => {
      const acc: Actions = {};
      mergeParsed(acc, target.dataset?.conditions);
      mergeParsed(acc, target.dataset?.groupConditions);
      // If nothing parsed, return null
      return Object.keys(acc).length ? acc : null;
    };

    const setEnabledState = (el: HTMLElement, enabled: boolean) => {
      // Update visual state via shared util
      renderutils.updateElement(el, { isEnabled: enabled ? 'true' : 'false' } as any);
      try {
        // Native inputs/selects
        if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) {
          (el as HTMLInputElement | HTMLSelectElement).disabled = !enabled;
          (el.style as CSSStyleDeclaration).pointerEvents = enabled ? '' : 'none';
          return;
        }
        // Inner controls
        const input = el.querySelector('input') as HTMLInputElement | null;
        const select = el.querySelector('select') as HTMLSelectElement | null;
        if (input) { input.disabled = !enabled; input.style.pointerEvents = enabled ? '' : 'none'; }
        if (select) { select.disabled = !enabled; select.style.pointerEvents = enabled ? '' : 'none'; }
        // Custom checkbox/radio
        const customCheckbox = el.querySelector('.custom-checkbox') as HTMLElement | null;
        const customRadio = el.querySelector('.custom-radio') as HTMLElement | null;
        if (customCheckbox) {
          if (!enabled) customCheckbox.setAttribute('aria-disabled', 'true'); else customCheckbox.removeAttribute('aria-disabled');
          customCheckbox.style.pointerEvents = enabled ? '' : 'none';
        }
        if (customRadio) {
          if (!enabled) customRadio.setAttribute('aria-disabled', 'true'); else customRadio.removeAttribute('aria-disabled');
          customRadio.style.pointerEvents = enabled ? '' : 'none';
        }
        // Fallback pointer events for other blocks
        el.style.pointerEvents = enabled ? '' : 'none';
      } catch {}
    };

    const applyAction = (target: HTMLElement, action: string, on: boolean) => {
      switch (action) {
        case 'check':
          if (on && target.dataset.type === 'Checkbox') renderutils.updateElement(target, { isChecked: 'true' } as any);
          break;
        case 'uncheck':
          if (on && target.dataset.type === 'Checkbox') renderutils.updateElement(target, { isChecked: 'false' } as any);
          break;
        case 'select':
          if (on && target.dataset.type === 'Radio') renderutils.updateElement(target, { isSelected: 'true' } as any);
          break;
          case 'unselect':
            if (on && target.dataset.type === 'Radio') renderutils.updateElement(target, { isSelected: 'false' } as any);
            break;
          default:
            // Parameterized actions
            if (on && action.toLowerCase().startsWith('setvalue=')) {
              const num = Number(action.split('=')[1]);
              if (Number.isFinite(num) && String(target.dataset.type || '').toLowerCase() === 'counter') {
                const min = Number(target.dataset.startval ?? 0);
                const max = Number(target.dataset.maxval ?? min);
                const v = Math.max(min, Math.min(max, num));
                const display = target.querySelector('.counter-value') as HTMLDivElement | null;
                if (display) display.textContent = String(v);
              }
            }
            break;
      }
    };

    const evaluateAll = () => {
      for (const target of created) {
        const parsed = parsedByTarget.get(target) || parseFor(target);
        if (!parsed) continue;
        parsedByTarget.set(target, parsed);

        // Resolve visibility and enabled state deterministically
        let shouldShow: boolean | null = null; // null = no rule
        let shouldEnable: boolean | null = null;

        for (const [action, list] of Object.entries(parsed)) {
          const exprs = Array.isArray(list) ? list : [list];
          for (const expr of exprs) {
            const on = evalExpr(expr);
            switch (action) {
            case 'show':
              if (on) shouldShow = true;
              break;
            case 'hide':
              if (on) shouldShow = false;
              break;
            case 'enable':
              if (on) shouldEnable = true;
              break;
            case 'disable':
              if (on) shouldEnable = false;
              break;
            default:
              applyAction(target, action, on);
              break;
            }
          }
        }

        // Apply visibility (hide overrides show)
        if (shouldShow !== null) {
          if (shouldShow) {
            target.dataset.isVisible = 'true';
            target.style.display = '';
            target.classList.remove('design-hidden');
          } else {
            target.dataset.isVisible = 'false';
            target.style.display = 'none';
          }
        }

        // Apply enabled state (disable overrides enable)
        if (shouldEnable !== null) {
          setEnabledState(target, !!shouldEnable);
        }
      }
    };

    // Hook changes on interactive elements to re-evaluate
    created.forEach(el => {
      const type = String(el.dataset?.type || '').toLowerCase();
      if (type === 'checkbox') {
        const custom = el.querySelector('.custom-checkbox') as HTMLElement | null;
        custom?.addEventListener('click', () => {
          const now = custom?.getAttribute('aria-checked') === 'true';
          el.dataset.isChecked = String(now);
          evaluateAll();
        });
      } else if (type === 'radio') {
        const custom = el.querySelector('.custom-radio') as HTMLElement | null;
        custom?.addEventListener('click', () => {
          // Update this radio and group mates
          el.dataset.isSelected = 'true';
          const group = custom?.getAttribute('group') || '';
          if (group) {
            document.querySelectorAll(`.custom-radio[group="${group}"]`).forEach((r) => {
              const host = (r as HTMLElement).closest('.element-div') as HTMLElement | null;
              if (host && host !== el) host.dataset.isSelected = 'false';
            });
          }
          evaluateAll();
        });
      } else if (type === 'select') {
        if (el instanceof HTMLSelectElement) {
          el.addEventListener('change', () => { el.dataset.value = String(el.value || ''); evaluateAll(); });
        } else {
          const sel = el.querySelector('select') as HTMLSelectElement | null;
          sel?.addEventListener('change', () => { el.dataset.value = String(sel.value || ''); evaluateAll(); });
        }
      } else if (type === 'input') {
        const input = el.querySelector('input') as HTMLInputElement | null;
        input?.addEventListener('change', () => { el.dataset.value = String(input.value || ''); evaluateAll(); });
      } else if (type === 'counter') {
        const display = document.querySelector(`#counter-value-${el.id}`) as HTMLDivElement | null;
        const inc = document.querySelector(`#counter-increase-${el.id}`) as HTMLDivElement | null;
        const dec = document.querySelector(`#counter-decrease-${el.id}`) as HTMLDivElement | null;
        const sync = () => { el.dataset.startval = String(Number(display?.textContent || el.dataset.startval || 0)); evaluateAll(); };
        inc?.addEventListener('click', sync); dec?.addEventListener('click', sync);
      } else if (type === 'slider') {
        const handle = el.querySelector('.slider-handle') as HTMLDivElement | null;
        const onUp = () => { el.dataset.handlepos = String(el.dataset.handlepos || '50'); evaluateAll(); };
        handle?.addEventListener('mouseup', onUp);
      }
    });

    // Initial evaluation
    evaluateAll();
  } catch (e) {
    console.error('Conditions evaluation failed:', e);
  }

  try {
    document.addEventListener('keydown', (ev: KeyboardEvent) => {
      const key = ev.key || (ev as any).code;
      if (key === 'Escape' || key === 'Esc') {
        try {
          Array.from(document.querySelectorAll('.color-popover')).forEach((el) => {
            (el as HTMLElement).style.display = 'none';
          });
        } catch {}
        try { coms.sendTo('main', 'close-conditionsWindow'); } catch {}
        ev.preventDefault();
        ev.stopPropagation();
      }
    }, true);
  } catch {}

  root.appendChild(canvas);
}

