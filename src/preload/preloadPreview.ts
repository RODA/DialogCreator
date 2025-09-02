import { global } from "../modules/coms";
import { utils } from "../library/utils";

// Minimal, read-only preview renderer based on the serialized dialog
window.addEventListener("DOMContentLoaded", () => {
  global.on("renderPreview", (data: unknown) => {
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

  for (const el of dialog.elements || []) {
    const node = createPreviewElement(el);
    if (node) {
      canvas.appendChild(node);
    }
  }

  root.appendChild(canvas);
}

function createPreviewElement(el: Record<string, any>): HTMLElement | null {
  const type = String(el.type || "");
  const left = utils.ensureNumber(el.left, 10);
  const top = utils.ensureNumber(el.top, 10);

  let node: HTMLElement | null = null;

  switch (type) {
    case "Button": {
      const btn = document.createElement("button");
      btn.className = "preview-button";
      btn.textContent = String(el.label ?? "Button");
      if (el.color && utils.isValidColor(el.color)) btn.style.backgroundColor = String(el.color);
      node = btn;
      break;
    }
    case "Input": {
      const input = document.createElement("input");
      input.className = "preview-input";
      input.type = "text";
      input.value = String(el.value ?? "");
      if (utils.possibleNumeric(String(el.width))) input.style.width = Number(el.width) + "px";
      node = input;
      break;
    }
    case "Select": {
      const select = document.createElement("select");
      select.className = "preview-select";
      // If value is comma-separated, split into options; otherwise single option
      const val = String(el.value ?? "");
      const values = val.includes(",") ? val.split(",").map((v) => v.trim()) : (val ? [val] : []);
      if (values.length === 0) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "(empty)";
        select.appendChild(opt);
      } else {
        for (const v of values) {
          const opt = document.createElement("option");
          opt.value = v;
          opt.textContent = v;
          select.appendChild(opt);
        }
      }
      if (utils.possibleNumeric(String(el.width))) select.style.width = Number(el.width) + "px";
      node = select;
      break;
    }
    case "Checkbox": {
      const wrap = document.createElement("label");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = utils.isTrue(el.isChecked);
      wrap.appendChild(cb);
      if (el.label) {
        wrap.appendChild(document.createTextNode(" " + String(el.label)));
      }
      node = wrap;
      break;
    }
    case "Radio": {
      const wrap = document.createElement("label");
      const rb = document.createElement("input");
      rb.type = "radio";
      rb.name = String(el.group || "group");
      rb.checked = utils.isTrue(el.isSelected);
      wrap.appendChild(rb);
      if (el.label) {
        wrap.appendChild(document.createTextNode(" " + String(el.label)));
      }
      node = wrap;
      break;
    }
    case "Counter": {
      const wrap = document.createElement("div");
      const down = document.createElement("button");
      const up = document.createElement("button");
      const display = document.createElement("span");
      wrap.className = "no-select";
      down.textContent = "-";
      up.textContent = "+";
      const min = utils.ensureNumber(el.startval, 0);
      const max = utils.ensureNumber(el.maxval, min);
      let current = min;
      display.textContent = String(current);
      down.onclick = () => { current = Math.max(min, current - 1); display.textContent = String(current); };
      up.onclick = () => { current = Math.min(max, current + 1); display.textContent = String(current); };
      wrap.appendChild(down);
      wrap.appendChild(display);
      wrap.appendChild(up);
      node = wrap;
      break;
    }
    case "Slider": {
      const track = document.createElement("div");
      track.style.background = el.color && utils.isValidColor(el.color) ? String(el.color) : "#000";
      track.style.position = "absolute";
      const w = utils.ensureNumber(el.width, 120);
      const h = utils.ensureNumber(el.height, 1);
      const dir = String(el.direction || "horizontal");
      if (dir === "horizontal") {
        track.style.width = w + "px";
        track.style.height = h + "px";
      } else {
        track.style.width = h + "px";
        track.style.height = w + "px";
      }
      const handle = document.createElement("div");
      handle.style.position = "absolute";
      handle.style.background = el.handlecolor && utils.isValidColor(el.handlecolor) ? String(el.handlecolor) : "#4caf50";
      const hp = utils.ensureNumber(el.handlepos, 50);
      const hs = utils.ensureNumber(el.handlesize, 8) * 1.5;
      handle.style.width = hs + "px";
      handle.style.height = hs + "px";
      handle.style.borderRadius = "50%";
      if (dir === "horizontal") {
        handle.style.left = Math.round((w - hs) * (hp / 100)) + "px";
        handle.style.top = Math.round(-(hs / 2) + h / 2) + "px";
      } else {
        handle.style.left = Math.round(-(hs / 2) + h / 2) + "px";
        handle.style.top = Math.round((w - hs) * (1 - hp / 100)) + "px";
      }
      track.appendChild(handle);
      node = track;
      break;
    }
    case "Label": {
      const span = document.createElement("div");
      span.textContent = String(el.value ?? "Label");
      if (el.fontColor && utils.isValidColor(el.fontColor)) span.style.color = String(el.fontColor);
      node = span;
      break;
    }
    case "Separator": {
      const sep = document.createElement("div");
      sep.className = "preview-separator";
      sep.style.backgroundColor = String(el.color || "#000");
      const w = utils.ensureNumber(el.width, 200);
      const h = utils.ensureNumber(el.height, 1);
      sep.style.width = w + "px";
      sep.style.height = h + "px";
      node = sep;
      break;
    }
    case "Container": {
      const div = document.createElement("div");
      div.style.background = "#ffffff";
      const w = utils.ensureNumber(el.width, 150);
      const h = utils.ensureNumber(el.height, 200);
      div.style.width = w + "px";
      div.style.height = h + "px";
      div.style.border = "1px solid #ddd";
      node = div;
      break;
    }
    default:
      node = document.createElement("div");
      node.textContent = `[${type}]`;
      node.style.padding = "2px 4px";
      node.style.border = "1px dashed #aaa";
      break;
  }

  if (!node) return null;

  // Common positioning and states
  node.style.position = "absolute";
  node.style.left = left + "px";
  node.style.top = top + "px";
  if (!utils.isTrue(el.isVisible)) node.style.visibility = "hidden";
  if (!utils.isTrue(el.isEnabled)) (node as HTMLInputElement | HTMLButtonElement).disabled = true;

  return node;
}
