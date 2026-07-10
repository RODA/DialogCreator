"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn2, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn2 && (res = (0, fn2[__getOwnPropNames(fn2)[0]])(fn2 = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target2, all) => {
    for (var name in all)
      __defProp(target2, name, { get: all[name], enumerable: true });
  };

  // src/library/utils.ts
  var TRUE_SET, FALSE_SET, DECIMAL_REGEX, INT_REGEX, utils;
  var init_utils = __esm({
    "src/library/utils.ts"() {
      "use strict";
      TRUE_SET = /* @__PURE__ */ new Set(["true", "t", "1"]);
      FALSE_SET = /* @__PURE__ */ new Set(["false", "f", "0"]);
      DECIMAL_REGEX = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
      INT_REGEX = /^[+-]?\d+$/;
      utils = {
        // ---- inline typing necessary below ----
        isRecord: function(x) {
          return x && typeof x === "object" && !Array.isArray(x);
        },
        isNull: function(x) {
          return x === null;
        },
        // Aliases for clarity when checking both null and undefined together
        isNil: function(x) {
          return x === null || x === void 0;
        },
        notNil: function(x) {
          return x !== null && x !== void 0;
        },
        isKeyOf: function(obj, key) {
          return !!obj && key in obj;
        },
        isOwnKeyOf: function(obj, key) {
          if (!obj) return false;
          return Object.prototype.hasOwnProperty.call(obj, key);
        },
        getKeyValue: function(obj, key) {
          return obj[key];
        },
        // Overloaded primitive type expectation helper
        expectType: /* @__PURE__ */ (function() {
          function expectType(obj, key, kind) {
            if (!obj || !(key in obj)) {
              throw new Error(`Missing property "${key}"`);
            }
            const v = obj[key];
            if (typeof v !== kind || kind === "number" && !Number.isFinite(v)) {
              throw new Error(`Expected "${key}" to be ${kind}, got ${typeof v}`);
            }
          }
          return expectType;
        })(),
        // ---- end of necessary inline typing ----
        // Generic typing lives in the Utils interface; we keep implementation minimal here.
        getKeys: function(obj) {
          if (!obj) {
            return [];
          }
          return Object.keys(obj);
        },
        // getKeys: function(obj) {
        //     if (obj === null) return([]);
        //     return Object.keys(obj);
        // },
        isNumeric: function(x) {
          if (typeof x === "number") {
            return Number.isFinite(x);
          }
          if (Object.prototype.toString.call(x) === "[object Number]") {
            try {
              const n = x.valueOf();
              return Number.isFinite(n);
            } catch {
              return false;
            }
          }
          return false;
        },
        possibleNumeric: function(x) {
          return isFinite(utils.asNumeric(x));
        },
        possibleInteger: function(x) {
          return Number.isInteger(utils.asNumeric(x));
        },
        asNumeric: function(x) {
          if (utils.missing(x) || utils.isNull(x)) {
            return NaN;
          }
          if (typeof x === "number") {
            return Number.isFinite(x) ? x : NaN;
          }
          if (Object.prototype.toString.call(x) === "[object Number]") {
            try {
              const n = x.valueOf();
              return Number.isFinite(n) ? n : NaN;
            } catch {
              return NaN;
            }
          }
          if (typeof x === "string") {
            const s = x.trim();
            if (s.length === 0) {
              return NaN;
            }
            if (!DECIMAL_REGEX.test(s)) {
              return NaN;
            }
            const n = Number(s);
            return Number.isFinite(n) ? n : NaN;
          }
          return NaN;
        },
        asInteger: function(x) {
          if (utils.missing(x) || utils.isNull(x)) {
            return NaN;
          }
          if (typeof x === "number") {
            return Number.isFinite(x) ? Math.trunc(x) : NaN;
          }
          if (Object.prototype.toString.call(x) === "[object Number]") {
            try {
              const n = x.valueOf();
              return Number.isFinite(n) ? Math.trunc(n) : NaN;
            } catch {
              return NaN;
            }
          }
          if (typeof x === "string") {
            const s = x.trim();
            if (s.length === 0) {
              return NaN;
            }
            if (INT_REGEX.test(s)) {
              return Number(s);
            }
            if (DECIMAL_REGEX.test(s)) {
              const n = Number(s);
              return Number.isFinite(n) ? Math.trunc(n) : NaN;
            }
            return NaN;
          }
          return NaN;
        },
        ensureNumber: function(x, fallback) {
          return utils.possibleNumeric(x) ? utils.asNumeric(x) : fallback;
        },
        isTrue: function(x) {
          if (utils.missing(x) || utils.isNull(x)) {
            return false;
          }
          if (typeof x === "boolean") return x === true;
          if (typeof x === "number") return x === 1;
          if (typeof x === "string") {
            const s = x.trim().toLowerCase();
            if (TRUE_SET.has(s)) return true;
            if (FALSE_SET.has(s)) return false;
          }
          return false;
        },
        isFalse: function(x) {
          if (utils.missing(x) || utils.isNull(x)) {
            return false;
          }
          if (typeof x === "boolean") return x === false;
          if (typeof x === "number") return x === 0;
          if (typeof x === "string") {
            const s = x.trim().toLowerCase();
            return FALSE_SET.has(s);
          }
          return false;
        },
        missing: function(x) {
          return x === void 0 || x === void 0;
        },
        exists: function(x) {
          return x !== void 0 && x !== void 0;
        },
        capitalize: function(str) {
          return str.charAt(0).toUpperCase() + str.slice(1);
        },
        isElementOf: function(x, set) {
          if (utils.missing(x) || utils.isNull(x) || utils.missing(set) || utils.isNull(set) || set.length === 0) {
            return false;
          }
          return set.indexOf(x) >= 0;
        },
        isNotElementOf: function(x, set) {
          if (utils.missing(x) || utils.isNull(x) || utils.missing(set) || utils.isNull(set) || set.length === 0) {
            return false;
          }
          return set.indexOf(x) < 0;
        },
        isValidColor: function(value) {
          const x = new Option().style;
          x.color = value;
          return x.color !== "";
        },
        isIdentifier: function(s) {
          if (typeof s !== "string" || s.length === 0) {
            return false;
          }
          if (!/^[A-Za-z_$][\w$]*$/.test(s)) {
            return false;
          }
          const RESERVED = /* @__PURE__ */ new Set([
            // Strict + future + contextual (conservative superset)
            "break",
            "case",
            "catch",
            "class",
            "const",
            "continue",
            "debugger",
            "default",
            "delete",
            "do",
            "else",
            "enum",
            "export",
            "extends",
            "false",
            "finally",
            "for",
            "function",
            "if",
            "import",
            "in",
            "instanceof",
            "new",
            "null",
            "return",
            "super",
            "switch",
            "this",
            "throw",
            "true",
            "try",
            "typeof",
            "var",
            "void",
            "while",
            "with",
            "yield",
            "let",
            "static",
            "implements",
            "interface",
            "package",
            "private",
            "protected",
            "public",
            "await",
            "arguments",
            "eval",
            "of",
            "from",
            "as"
          ]);
          if (RESERVED.has(s.toLowerCase())) {
            return false;
          }
          return true;
        },
        // Measure the natural width (in CSS pixels) of a text string for a given font
        // Prefers an offscreen canvas when a DOM is available; otherwise falls back to an approximation
        textWidth: function(text, fontSize, fontFamily) {
          const t = String(text ?? "");
          if (t.length === 0) return 0;
          const size = Number(fontSize) || 12;
          let family = fontFamily && String(fontFamily).trim().length ? String(fontFamily) : "";
          if (!family && // same thing as family === '' because '' is falsy
          typeof window !== "undefined" && typeof getComputedStyle === "function") {
            family = getComputedStyle(document.body || document.documentElement).fontFamily || "";
          }
          if (!family) {
            family = "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, 'Noto Sans', 'Liberation Sans', sans-serif";
          }
          const familyNormalized = family.split(",").map((s) => s.trim()).filter((s) => s.length > 0).map((name) => /^['"]/.test(name) || !/\s/.test(name) ? name : `"${name}"`).join(", ");
          const Offscreen = globalThis.OffscreenCanvas;
          if (Offscreen && typeof Offscreen === "function") {
            const off = new Offscreen(0, 0);
            const ctx = off.getContext("2d");
            if (ctx && typeof ctx.measureText === "function") {
              ctx.font = `${size}px ${familyNormalized}`;
              const metrics = ctx.measureText(t);
              return Math.ceil(metrics.width);
            }
          }
          if (typeof document !== "undefined" && typeof document.createElement === "function") {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.font = `${size}px ${familyNormalized}`;
              const metrics = ctx.measureText(t);
              return Math.ceil(metrics.width);
            }
          }
          return Math.ceil(t.length * size * 0.6);
        }
      };
    }
  });

  // src/modules/dialog.ts
  var dialog;
  var init_dialog = __esm({
    "src/modules/dialog.ts"() {
      "use strict";
      dialog = {
        canvas: document.createElement("div"),
        id: "",
        selectedElement: "",
        // id of the selected element in the dialog
        properties: {},
        elements: {},
        syntax: {
          command: "",
          defaultElements: []
        },
        i18n: void 0,
        customJS: "",
        // Dialog =======================================
        // dialog properties: name, title, width, height
        initialize: function(obj) {
          this.properties = { ...obj };
        },
        // update dialog element props !!!!!!
        updateElementProperties: function(id, payload) {
          const dialogW = dialog.canvas.getBoundingClientRect().width;
          const dialogH = dialog.canvas.getBoundingClientRect().height;
          const notFound = [];
          const keys = Object.keys(payload);
          const dataset = dialog.elements[id].dataset;
          for (let i = 0; i < keys.length; i++) {
            if (Object.hasOwn(dataset, keys[i])) {
              if (keys[i] == "left") {
                const elementWidth = document.getElementById(id)?.getBoundingClientRect().width;
                if (elementWidth && Number(payload[keys[i]]) + elementWidth + 10 > dialogW) {
                  payload[keys[i]] = String(Math.round(dialogW - elementWidth - 10));
                }
                if (Number(payload[keys[i]]) < 10) {
                  payload[keys[i]] = "10";
                }
                const elleft = document.getElementById("elleft");
                elleft.value = payload[keys[i]];
              } else if (keys[i] == "top") {
                const elementHeight = document.getElementById(id)?.getBoundingClientRect().height;
                if (elementHeight && Number(payload[keys[i]]) + elementHeight + 10 > dialogH) {
                  payload[keys[i]] = String(Math.round(dialogH - elementHeight - 10));
                }
                if (Number(payload[keys[i]]) < 10) {
                  payload[keys[i]] = "10";
                }
                const eltop = document.getElementById("eltop");
                eltop.value = payload[keys[i]];
              }
              if (keys[i] == "label" || keys[i] == "width") {
                const elementWidth = document.getElementById(id)?.getBoundingClientRect().width;
                const elleft = document.getElementById("elleft");
                if (elementWidth && Number(elleft.value) + elementWidth + 10 > dialogW) {
                  const newleft = String(Math.round(dialogW - elementWidth - 10));
                  elleft.value = newleft;
                  dialog.elements[id].style.left = newleft + "px";
                }
              } else if (keys[i] == "height") {
                const eltop = document.getElementById("eltop");
                const elementHeight = document.getElementById(id)?.getBoundingClientRect().height;
                if (elementHeight && Number(eltop.value) + elementHeight + 10 > dialogH) {
                  const newtop = String(Math.round(dialogH - elementHeight - 10));
                  eltop.value = newtop;
                  dialog.elements[id].style.top = newtop + "px";
                }
              }
            } else {
              notFound.push(keys[i]);
            }
          }
          if (notFound.length) {
          }
        },
        // Elements
        // ======================================
        // add/save an element
        addElement: function(element) {
          dialog.elements[element.id] = element;
        },
        // remove element from container
        removeElement: function(elID) {
          delete dialog.elements[elID];
        },
        // return an element by ID
        getElement: function(elId) {
          return dialog.elements[elId];
        }
      };
    }
  });

  // src/modules/elements.ts
  var elements;
  var init_elements = __esm({
    "src/modules/elements.ts"() {
      "use strict";
      elements = {
        buttonElement: {
          id: "",
          nameid: "button",
          type: "Button",
          label: "Button",
          icon: "none",
          iconSize: 0,
          left: 15,
          top: 15,
          width: 60,
          height: 22,
          lineClamp: 1,
          color: "#efefef",
          fontColor: "#000000",
          borderColor: "#727272",
          isEnabled: true,
          isVisible: true,
          elementIds: [],
          $persist: [
            "nameid",
            "label",
            "icon",
            "iconSize",
            "left",
            "top",
            "width",
            "height",
            "lineClamp",
            "color",
            "fontColor",
            "borderColor",
            "isEnabled",
            "isVisible"
          ]
        },
        inputElement: {
          id: "",
          type: "Input",
          nameid: "input",
          left: 15,
          top: 15,
          width: 60,
          height: 22,
          value: "",
          valueType: "String",
          borderColor: "#8c8c8c",
          disabledColor: "#dedede",
          isEnabled: true,
          isVisible: true,
          elementIds: [],
          $persist: [
            "nameid",
            "left",
            "top",
            "width",
            "height",
            "value",
            "valueType",
            "borderColor",
            "disabledColor",
            "isEnabled",
            "isVisible"
          ]
        },
        selectElement: {
          id: "",
          type: "Select",
          nameid: "select",
          left: 15,
          top: 15,
          width: 120,
          value: "",
          arrowColor: "#5b855b",
          disabledColor: "#dedede",
          isEnabled: true,
          isVisible: true,
          elementIds: [],
          $persist: [
            "nameid",
            "left",
            "top",
            "width",
            "value",
            "arrowColor",
            "disabledColor",
            "isEnabled",
            "isVisible"
          ]
        },
        checkboxElement: {
          id: "",
          type: "Checkbox",
          nameid: "checkbox",
          left: 10,
          top: 10,
          size: 14,
          fill: true,
          color: "#70a470",
          borderColor: "#8c8c8c",
          disabledColor: "#dedede",
          isChecked: false,
          isEnabled: true,
          isVisible: true,
          elementIds: [],
          $persist: [
            "nameid",
            "left",
            "top",
            "size",
            "color",
            "fill",
            "borderColor",
            "disabledColor",
            "isChecked",
            "isEnabled",
            "isVisible"
          ]
        },
        radioElement: {
          id: "",
          type: "Radio",
          nameid: "radio",
          group: "radiogroup1",
          left: 10,
          top: 10,
          size: 14,
          color: "#5b855b",
          disabledColor: "#dedede",
          isSelected: false,
          isEnabled: true,
          isVisible: true,
          elementIds: [],
          $persist: [
            "nameid",
            "group",
            "left",
            "top",
            "size",
            "color",
            "disabledColor",
            "isSelected",
            "isEnabled",
            "isVisible"
          ]
        },
        counterElement: {
          id: "",
          type: "Counter",
          nameid: "counter",
          left: 15,
          top: 15,
          space: 4,
          color: "#558855",
          borderColor: "#8c8c8c",
          disabledColor: "#dedede",
          minval: 1,
          startval: 1,
          maxval: 5,
          updownsize: 8,
          isEnabled: true,
          isVisible: true,
          elementIds: [],
          $persist: [
            "nameid",
            "left",
            "top",
            "space",
            "color",
            "borderColor",
            "disabledColor",
            "minval",
            "startval",
            "maxval",
            "updownsize",
            "isEnabled",
            "isVisible"
          ]
        },
        sliderElement: {
          id: "",
          type: "Slider",
          nameid: "slider",
          left: 15,
          top: 15,
          width: 120,
          height: 1,
          direction: "horizontal",
          color: "#000000",
          isEnabled: true,
          isVisible: true,
          handlepos: 50,
          handleshape: "triangle",
          handleColor: "#558855",
          handlesize: 8,
          elementIds: [],
          $persist: [
            "nameid",
            "left",
            "top",
            "width",
            "height",
            "direction",
            "color",
            "isEnabled",
            "isVisible",
            "handlepos",
            "handleshape",
            "handleColor",
            "handlesize"
          ]
        },
        labelElement: {
          id: "",
          type: "Label",
          nameid: "label",
          left: 15,
          top: 15,
          maxWidth: 200,
          lineClamp: 1,
          fontColor: "#000000",
          value: "Label",
          icon: "none",
          iconSize: 0,
          align: "left",
          valign: "top",
          rotate: 0,
          isEnabled: true,
          isVisible: true,
          elementIds: [],
          $persist: [
            "left",
            "top",
            "maxWidth",
            "lineClamp",
            "fontColor",
            "value",
            "icon",
            "iconSize",
            "align",
            "valign",
            "rotate",
            "isEnabled",
            "isVisible"
          ]
        },
        separatorElement: {
          id: "",
          type: "Separator",
          nameid: "separator",
          left: 15,
          top: 15,
          width: 200,
          height: 1,
          direction: "horizontal",
          color: "#000000",
          isEnabled: true,
          isVisible: true,
          elementIds: [],
          $persist: [
            "left",
            "top",
            "width",
            "height",
            "direction",
            "color",
            "isEnabled",
            "isVisible"
          ]
        },
        containerElement: {
          id: "",
          type: "Container",
          nameid: "container",
          left: 15,
          top: 15,
          width: 130,
          height: 100,
          selection: "single",
          itemType: "any",
          itemOrder: false,
          pinontop: false,
          backgroundColor: "#ffffff",
          fontColor: "#000000",
          activeBackgroundColor: "#589658",
          activeFontColor: "#ffffff",
          disabledColor: "#d8d8d8",
          borderColor: "#b8b8b8",
          isEnabled: true,
          isVisible: true,
          elementIds: [],
          $persist: [
            "nameid",
            "left",
            "top",
            "width",
            "height",
            "selection",
            "itemType",
            "itemOrder",
            "pinontop",
            "backgroundColor",
            "fontColor",
            "activeBackgroundColor",
            "activeFontColor",
            "disabledColor",
            "borderColor",
            "isEnabled",
            "isVisible"
          ]
        },
        choiceElement: {
          id: "",
          type: "Choice",
          nameid: "choice",
          left: 15,
          top: 15,
          width: 50,
          height: 75,
          items: "A,B,C",
          backgroundColor: "#ffffff",
          fontColor: "#000000",
          activeBackgroundColor: "#589658",
          activeFontColor: "#ffffff",
          borderColor: "#b8b8b8",
          selection: "multiple",
          sortable: true,
          ordering: "no",
          orientation: "vertical",
          align: "left",
          isEnabled: true,
          isVisible: true,
          elementIds: [],
          $persist: [
            "nameid",
            "left",
            "top",
            "width",
            "height",
            "items",
            "backgroundColor",
            "fontColor",
            "activeBackgroundColor",
            "activeFontColor",
            "borderColor",
            "selection",
            "sortable",
            "ordering",
            "orientation",
            "align",
            "isEnabled",
            "isVisible"
          ]
        },
        groupElement: {
          id: "",
          type: "Group",
          nameid: "group",
          left: 15,
          top: 15,
          isEnabled: true,
          isVisible: true,
          elementIds: []
        }
      };
    }
  });

  // src/library/datasets.ts
  var datasets;
  var init_datasets = __esm({
    "src/library/datasets.ts"() {
      "use strict";
      datasets = {
        PlantGrowth: [
          { name: "weight", numeric: true },
          { name: "group", factor: true, categorical: true }
        ],
        ToothGrowth: [
          { name: "len", numeric: true },
          { name: "supp", factor: true, categorical: true },
          { name: "dose", numeric: true }
        ],
        Survey: [
          { name: "age", numeric: true },
          { name: "gender", factor: true, categorical: true },
          { name: "education", factor: true, categorical: true },
          { name: "income", numeric: true },
          { name: "satisfaction", numeric: true },
          { name: "residence", factor: true, categorical: true }
        ]
      };
    }
  });

  // src/library/api.ts
  function createPreviewUI(env) {
    const {
      findWrapper,
      findRadioGroupMembers,
      updateElement,
      showRuntimeError,
      logToEditor,
      showDialogMessage,
      openSyntaxPanel,
      resetDialog,
      closeDialog
      // call
    } = env;
    const disposers = [];
    const warnOnce = /* @__PURE__ */ new Set();
    const activeElementEvents = /* @__PURE__ */ new WeakMap();
    const warn = (k, msg) => {
      if (!warnOnce.has(k)) {
        logToEditor(`Warning: ${msg}`);
        warnOnce.add(k);
      }
    };
    const eventKey = (event) => renderutils.normalizeEventName(event) || String(event);
    const isHandlingEvent = (el, event) => activeElementEvents.get(el)?.has(eventKey(event)) === true;
    const withActiveEvent = (el, event, fn2) => {
      const key = eventKey(event);
      let active = activeElementEvents.get(el);
      if (!active) {
        active = /* @__PURE__ */ new Set();
        activeElementEvents.set(el, active);
      }
      active.add(key);
      try {
        fn2();
      } finally {
        active.delete(key);
        if (active.size === 0) {
          activeElementEvents.delete(el);
        }
      }
    };
    const inner = (el) => el?.firstElementChild;
    const typeOf = (el) => String(el?.dataset?.type || "");
    const translateMessage = (message) => {
      const text = String(message ?? "");
      if (!text || typeof env.translateMessage !== "function") {
        return text;
      }
      return env.translateMessage(text);
    };
    const coerceName = (value) => {
      const name = String(value ?? "").trim();
      if (!name) {
        throw new SyntaxError("Element name cannot be empty");
      }
      return name;
    };
    const lastSelectedItem = /* @__PURE__ */ new WeakMap();
    const shiftWheelContainerTargets = /* @__PURE__ */ new WeakSet();
    const splitList2 = (raw) => {
      return String(raw ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    };
    const normalizeOrderList2 = (values) => {
      const seen = /* @__PURE__ */ new Set();
      const out = [];
      values.forEach((value) => {
        const next = String(value || "").trim();
        if (!next || seen.has(next)) return;
        seen.add(next);
        out.push(next);
      });
      return out;
    };
    const mergeSelectionOrder2 = (host, activeItems) => {
      const prev = normalizeOrderList2(splitList2(host.dataset.selectedOrder));
      const activeSet = new Set(activeItems);
      const next = prev.filter((v) => activeSet.has(v));
      const seen = new Set(next);
      activeItems.forEach((value) => {
        if (!seen.has(value)) {
          next.push(value);
          seen.add(value);
        }
      });
      return next;
    };
    const attachContainerItemHandler = (host, target2, item) => {
      item.addEventListener("click", (ev) => {
        if (item.dataset.disabled === "true") {
          ev.preventDefault();
          return;
        }
        const selectionMode = String(host.dataset.selection || "single").toLowerCase();
        const forcedSingle = selectionMode === "single-radio";
        const multiple = selectionMode === "multiple";
        let deferPinOnTop = false;
        if (multiple && ev instanceof MouseEvent && ev.shiftKey) {
          const all = Array.from(target2.querySelectorAll(".container-item"));
          const previous = lastSelectedItem.get(host);
          const last = previous && previous.classList.contains("active") ? previous : null;
          const lastIndex = last ? all.indexOf(last) : -1;
          const currentIndex = all.indexOf(item);
          if (lastIndex !== -1 && currentIndex !== -1) {
            const [start2, end2] = lastIndex < currentIndex ? [lastIndex, currentIndex] : [currentIndex, lastIndex];
            const shouldActivate = !item.classList.contains("active");
            all.slice(start2, end2 + 1).forEach((it) => {
              if (it.dataset.disabled === "true") {
                it.classList.remove("active");
                applyItemStyle(host, it, false);
                return;
              }
              it.classList.toggle("active", shouldActivate);
              applyItemStyle(host, it, shouldActivate);
            });
          } else {
            deferPinOnTop = true;
            const shouldActivate = !item.classList.contains("active");
            item.classList.toggle("active", shouldActivate);
            applyItemStyle(host, item, shouldActivate);
          }
        } else if (multiple) {
          const shouldSelect = !item.classList.contains("active");
          item.classList.toggle("active", shouldSelect);
          applyItemStyle(host, item, shouldSelect);
        } else {
          const wasActive = item.classList.contains("active");
          if (wasActive) {
            if (!forcedSingle) {
              target2.querySelectorAll(".container-item.active").forEach((other) => {
                other.classList.remove("active");
                applyItemStyle(host, other, false);
              });
            }
          } else {
            target2.querySelectorAll(".container-item.active").forEach((other) => {
              if (other !== item) {
                other.classList.remove("active");
                applyItemStyle(host, other, false);
              }
            });
            item.classList.add("active");
            applyItemStyle(host, item, true);
          }
        }
        lastSelectedItem.set(host, item.classList.contains("active") ? item : null);
        if (deferPinOnTop) {
          host.dataset.deferPinOnTop = "true";
        } else if ("deferPinOnTop" in host.dataset) {
          delete host.dataset.deferPinOnTop;
        }
        const activeValues = Array.from(target2.querySelectorAll(".container-item.active")).map((it) => it.dataset.value || "").join(",");
        host.dataset.activeValues = activeValues;
        host.dataset.selected = activeValues;
        if (utils.isTrue(host.dataset.itemOrder)) {
          const ordered = mergeSelectionOrder2(host, activeValues.split(",").map((s) => s.trim()).filter(Boolean));
          host.dataset.selectedOrder = ordered.join(",");
        } else if ("selectedOrder" in host.dataset) {
          delete host.dataset.selectedOrder;
        }
        host.dispatchEvent(new Event("change", { bubbles: true }));
        renderutils.applyContainerItemFilter(host);
      });
    };
    const containerItemFromValue = (value) => {
      if (typeof value === "object" && value !== null) {
        const source = value;
        const name2 = String(source.name ?? "").trim();
        if (!name2) {
          return null;
        }
        const flags = {};
        DATASET_ITEM_FLAGS.forEach((flag) => {
          if (typeof source[flag] === "boolean") {
            flags[flag] = source[flag] === true;
          }
        });
        return {
          name: name2,
          active: source.active === true,
          flags
        };
      }
      const name = String(value ?? "").trim();
      if (!name) {
        return null;
      }
      return { name, flags: {} };
    };
    const populateContainer = (host, items) => {
      let target2 = null;
      const existing = host.querySelector(".container-content");
      const sample = host.querySelector(".container-sample");
      if (existing instanceof HTMLElement) {
        target2 = existing;
      } else if (sample instanceof HTMLElement) {
        target2 = sample;
      } else {
        target2 = document.createElement("div");
        target2.className = "container-content";
        target2.style.width = "100%";
        target2.style.height = "100%";
        target2.style.overflowY = "auto";
        target2.style.overflowX = "hidden";
        host.appendChild(target2);
      }
      const initialActive = new Set(
        (host.dataset.activeValues || "").split(",").map((v) => v.trim()).filter(Boolean)
      );
      if (!target2) {
        return;
      }
      if (!shiftWheelContainerTargets.has(target2)) {
        shiftWheelContainerTargets.add(target2);
        target2.addEventListener("wheel", (ev) => {
          if (String(host.dataset.selection || "single").toLowerCase() !== "multiple" || !utils.isTrue(host.dataset.pinontop) || !ev.shiftKey || utils.isFalse(host.dataset.isEnabled ?? "true")) {
            return;
          }
          const verticalDelta = ev.deltaY !== 0 ? ev.deltaY : ev.deltaX;
          if (verticalDelta === 0) {
            return;
          }
          target2.scrollTop += verticalDelta;
          ev.preventDefault();
        }, { passive: false });
      }
      target2.replaceChildren();
      items.forEach((item) => {
        const value = item.name;
        const div2 = document.createElement("div");
        div2.className = "container-item";
        div2.dataset.value = value;
        div2.dataset.baseOrder = String(target2.children.length);
        const activeFlags = DATASET_ITEM_FLAGS.filter((flag) => item.flags[flag] === true);
        if (activeFlags.length > 0) {
          div2.dataset.itemFlags = activeFlags.join(",");
        } else {
          delete div2.dataset.itemFlags;
        }
        const active = item.active || initialActive.has(value);
        div2.classList.toggle("active", active);
        applyItemStyle(host, div2, active);
        const label = document.createElement("span");
        label.className = "container-text";
        label.textContent = value;
        div2.appendChild(label);
        attachContainerItemHandler(host, target2, div2);
        target2.appendChild(div2);
      });
      host.dataset.activeValues = Array.from(
        target2.querySelectorAll(".container-item.active")
      ).map((item) => item.dataset.value || "").join(",");
      if (utils.isTrue(host.dataset.itemOrder)) {
        const active = host.dataset.activeValues ? host.dataset.activeValues.split(",").map((s) => s.trim()).filter(Boolean) : [];
        const ordered = mergeSelectionOrder2(host, active);
        host.dataset.selectedOrder = ordered.join(",");
      } else if ("selectedOrder" in host.dataset) {
        delete host.dataset.selectedOrder;
      }
      Array.from(target2.querySelectorAll(".container-item")).forEach((item) => {
        applyItemStyle(host, item, item.classList.contains("active"));
      });
      renderutils.applyContainerItemFilter(host);
      if (items.length) {
        host.dispatchEvent(new Event("change", { bubbles: true }));
      }
    };
    const parseContainerValue = (value) => {
      if (Array.isArray(value)) {
        return value.map(containerItemFromValue).filter((item) => item !== null);
      }
      const tokens = String(value ?? "").split(/\r?\n/).map((t) => t.trim()).filter(Boolean);
      return tokens.map((name) => ({ name, flags: {} }));
    };
    const normalizeChoiceOrdering2 = (raw) => {
      const value = String(raw ?? "").trim().toLowerCase();
      if (value === "decreasing" || value === "desc" || value === "descending") {
        return "decreasing";
      }
      if (value === "increasing" || value === "asc" || value === "ascending" || value === "true") {
        return "increasing";
      }
      return "no";
    };
    const preferredSorterState2 = (mode) => {
      return mode === "decreasing" ? "desc" : "asc";
    };
    const normalizeChoiceSelection2 = (raw) => {
      const value = String(raw ?? "").trim().toLowerCase();
      if (value === "single-radio" || value === "single_forced" || value === "radio") {
        return "single-radio";
      }
      if (value === "single") {
        return "single";
      }
      return "multiple";
    };
    const normalizeSorterItemsForMode2 = (items, orderingMode) => {
      if (orderingMode !== "no") {
        return items;
      }
      return items.map((item) => ({
        text: item.text,
        state: item.state === "off" ? "off" : "asc"
      }));
    };
    const normalizeSorterState = (raw, allowDesc) => {
      const val = String(raw ?? "").toLowerCase();
      if (val === "asc") return "asc";
      if (val === "desc" && allowDesc) return "desc";
      return "off";
    };
    const normalizeSorterInput = (value, orderingMode) => {
      const list = Array.isArray(value) ? value : [value];
      const allowDesc = orderingMode !== "no";
      const preferred = preferredSorterState2(orderingMode);
      const out = [];
      list.forEach((entry) => {
        if (entry === void 0 || entry === null) return;
        if (typeof entry === "object" && !Array.isArray(entry)) {
          const text2 = String(entry.text ?? entry.label ?? "").trim();
          if (!text2) return;
          const st2 = normalizeSorterState(entry.state, allowDesc);
          out.push({ text: text2, state: st2 });
          return;
        }
        const raw = String(entry ?? "").trim();
        if (!raw) return;
        const [labelPart, statePart] = raw.split(":");
        const text = labelPart.trim();
        if (!text) return;
        const st = normalizeSorterState(statePart || preferred, allowDesc);
        out.push({ text, state: st });
      });
      return normalizeSorterItemsForMode2(out, orderingMode);
    };
    const readSorterItems = (host) => {
      const orderingMode = normalizeChoiceOrdering2(host.dataset.ordering ?? "no");
      const allowDesc = orderingMode !== "no";
      const raw = host.dataset.sorterState || "";
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return normalizeSorterInput(parsed, orderingMode);
        }
      } catch {
      }
      const rows = Array.from(host.querySelectorAll(".sorter-item"));
      if (rows.length) {
        return rows.map((row) => ({
          text: row.querySelector(".sorter-label")?.textContent?.trim() || "",
          state: normalizeSorterState(row.dataset.state || "off", allowDesc)
        })).filter((item) => item.text);
      }
      const labels = String(host.dataset.items || host.dataset.value || "").split(/[;,]/).map((s) => s.trim()).filter(Boolean);
      return labels.map((text) => ({ text, state: "off" }));
    };
    const applySorterItems = (host, items) => {
      const orderingMode = normalizeChoiceOrdering2(host.dataset.ordering ?? "no");
      const selectionMode = normalizeChoiceSelection2(host.dataset.selection ?? "multiple");
      const normalized = items.map((item) => ({
        text: String(item.text || "").trim(),
        state: normalizeSorterState(item.state, orderingMode !== "no")
      })).filter((item) => item.text);
      const coerced = normalizeSorterItemsForMode2(normalized, orderingMode).map((item) => ({ ...item }));
      if (selectionMode === "single" || selectionMode === "single-radio") {
        let kept = false;
        coerced.forEach((item) => {
          if (item.state === "off") {
            return;
          }
          if (!kept) {
            kept = true;
            return;
          }
          item.state = "off";
        });
      }
      if (selectionMode === "single-radio" && !coerced.some((item) => item.state !== "off") && coerced.length > 0) {
        coerced[0].state = preferredSorterState2(orderingMode);
      }
      const visual = host.querySelector(".sorter");
      const targets = visual ? [host, visual] : [host];
      const joined = coerced.map((it) => it.text).join(",");
      targets.forEach((node) => {
        node.dataset.sorterState = JSON.stringify(coerced);
        node.dataset.items = joined;
        node.dataset.value = joined;
      });
      renderutils.renderSorter(visual || host, {
        items: host.dataset.items,
        sorterState: host.dataset.sorterState,
        selection: selectionMode
      });
    };
    const applyItemStyle = (host, item, active) => {
      const label = item.querySelector(".container-text");
      const normalBg = host.dataset.backgroundColor || "#ffffff";
      const normalFg = host.dataset.fontColor || "#000000";
      const activeBg = host.dataset.activeBackgroundColor || "#589658";
      const activeFg = host.dataset.activeFontColor || "#ffffff";
      const disabledBg = host.dataset.disabledColor || "#d8d8d8";
      if (item.dataset.disabled === "true") {
        item.style.backgroundColor = disabledBg;
        if (label) label.style.color = normalFg;
        return;
      }
      if (active) {
        item.style.backgroundColor = activeBg;
        if (label) label.style.color = activeFg;
      } else {
        item.style.backgroundColor = normalBg;
        if (label) label.style.color = normalFg;
      }
    };
    const listColumnsFromDataset = (input) => {
      const items = Array.isArray(input) ? input : [input];
      const [datasetName] = items.map((v) => String(v ?? "").trim()).filter(Boolean);
      if (!datasetName) {
        return [];
      }
      const source = datasets[datasetName];
      if (!Array.isArray(source)) {
        return [];
      }
      return source.map((entry) => {
        const descriptor = {
          name: String(entry?.name ?? "")
        };
        DATASET_ITEM_FLAGS.forEach((flag) => {
          if (typeof entry?.[flag] === "boolean") {
            descriptor[flag] = entry[flag] === true;
          }
        });
        try {
          Object.defineProperty(descriptor, "toString", {
            value() {
              return String(this.name || "");
            },
            enumerable: false
          });
        } catch {
        }
        return descriptor;
      }).filter((entry) => entry.name.trim().length > 0);
    };
    const listObjectsByType = (type) => {
      const normalized = String(type ?? "").trim().toLowerCase();
      if (!normalized) {
        return [];
      }
      switch (normalized) {
        case "datasets":
          try {
            return utils.getKeys(datasets);
          } catch {
            return [];
          }
        default:
          return [];
      }
    };
    const collectObjectBindingVariableContainers = (variables) => {
      const out = [];
      const addName = (value) => {
        const name = String(value ?? "").trim();
        if (name) {
          out.push(name);
        }
      };
      if (typeof variables === "string") {
        addName(variables);
      } else if (Array.isArray(variables)) {
        variables.forEach(addName);
      } else if (variables && typeof variables === "object") {
        Object.values(variables).forEach((value) => {
          if (Array.isArray(value)) {
            value.forEach(addName);
          } else {
            addName(value);
          }
        });
      }
      return Array.from(new Set(out));
    };
    const normalizeObjectBindingRequest = (request) => {
      if (!request || typeof request !== "object") {
        throw new SyntaxError("bindObjects() expects a binding object");
      }
      const datasetsName = coerceName(request.datasets);
      return {
        ...request,
        dialog: String(request.dialog || "").trim(),
        datasets: datasetsName
      };
    };
    const bindObjectsInPreview = (request) => {
      const variableContainers = collectObjectBindingVariableContainers(request.variables);
      api.setValue(request.datasets, listObjectsByType("datasets"));
      if (!variableContainers.length) {
        return;
      }
      const refreshVariables = () => {
        const selectedDataset = api.getSelected(request.datasets)[0] || "";
        const variables = selectedDataset ? listColumnsFromDataset(selectedDataset) : [];
        variableContainers.forEach((container) => {
          api.setValue(container, variables);
        });
      };
      api.onChange(request.datasets, refreshVariables);
      refreshVariables();
    };
    const api = {
      // Forward logs to the Editor console for visibility during Preview
      log: (...args) => {
        const msg = args.map((a) => typeof a === "string" ? a : JSON.stringify(a)).join(" ");
        logToEditor(msg);
      },
      // Convenience: checkbox/radio check/uncheck
      check: (...names) => {
        const list = names.length === 1 && Array.isArray(names[0]) ? names[0] : names;
        if (!list.length) {
          throw new SyntaxError("check() expects at least one element");
        }
        const radioGroups = /* @__PURE__ */ new Map();
        const resolved = [];
        list.forEach((name) => {
          const key = coerceName(name);
          const el = findWrapper(key);
          if (!el) return;
          const eltype = typeOf(el);
          let group = "";
          if (eltype === "Radio") {
            const custom = el.querySelector(".custom-radio");
            group = custom?.getAttribute("group") || "";
            if (group) {
              const existing = radioGroups.get(group);
              if (existing && existing !== key) {
                throw new SyntaxError(`check() cannot target multiple radios from the same group ('${group}').`);
              }
              radioGroups.set(group, key);
            }
          }
          resolved.push({ el, type: eltype, group });
        });
        resolved.forEach(({ el, type, group }) => {
          if (type === "Checkbox") {
            updateElement(el, { isChecked: "true" });
          } else if (type === "Radio") {
            if (group) {
              document.querySelectorAll(`.custom-radio[group="${group}"]`).forEach((r) => {
                const host = r.closest(".element-div");
                if (host && host !== el) {
                  updateElement(host, { isSelected: "false" });
                }
              });
            }
            updateElement(el, { isSelected: "true" });
          }
        });
      },
      uncheck: (...names) => {
        const list = names.length === 1 && Array.isArray(names[0]) ? names[0] : names;
        if (!list.length) {
          throw new SyntaxError("uncheck() expects at least one element");
        }
        list.forEach((name) => {
          const key = coerceName(name);
          const el = findWrapper(key);
          if (!el) return;
          const eltype = typeOf(el);
          if (eltype === "Checkbox") {
            updateElement(el, { isChecked: "false" });
          } else if (eltype === "Radio") {
            updateElement(el, { isSelected: "false" });
          }
        });
      },
      showMessage: (...argsIn) => {
        const allowed = /* @__PURE__ */ new Set(["info", "warning", "error", "question"]);
        const message = String(argsIn[0] ?? "");
        const detail = String(argsIn[1] ?? "");
        const typearg = String(argsIn[2] ?? "").toLowerCase();
        const type = allowed.has(typearg) ? typearg : "info";
        showDialogMessage(type, translateMessage(message), translateMessage(detail));
      },
      run: (_command) => {
      },
      callExternal: async (name, parameters) => {
        const callName = String(name ?? "").trim();
        if (!callName) {
          throw new SyntaxError("callExternal() expects a non-empty function name");
        }
        if (typeof env.callExternal !== "function") {
          return void 0;
        }
        return env.callExternal(callName, parameters);
      },
      updateSyntax: (command) => {
        try {
          if (typeof openSyntaxPanel === "function") {
            openSyntaxPanel(String(command ?? ""));
            return;
          }
          const root = document.getElementById("preview-root");
          if (!root) {
            logToEditor(`updateSyntax(): preview root not found.`);
            return;
          }
          const canvas = root.querySelector(".preview-canvas");
          let panel = root.querySelector(".preview-syntax-panel");
          if (!panel) {
            panel = document.createElement("div");
            panel.className = "preview-syntax-panel";
            if (canvas && canvas.parentElement === root && canvas.nextSibling) {
              root.insertBefore(panel, canvas.nextSibling);
            } else {
              root.appendChild(panel);
            }
          }
          try {
            const w = canvas?.getBoundingClientRect().width || 0;
            if (w > 0) {
              panel.style.width = `${Math.round(w)}px`;
            } else {
              panel.style.removeProperty("width");
            }
          } catch {
          }
          panel.innerHTML = "";
          const pre = document.createElement("pre");
          pre.className = "preview-syntax-panel-pre";
          pre.textContent = String(command ?? "");
          panel.appendChild(pre);
          panel.style.display = "block";
        } catch (e) {
          const msg = `updateSyntax() failed: ${String(e && e.message ? e.message : e)}`;
          logToEditor(msg);
        }
      },
      resetDialog: () => {
        try {
          resetDialog();
        } catch (e) {
          const msg = `resetDialog() failed: ${String(e && e.message ? e.message : e)}`;
          showRuntimeError(msg);
        }
      },
      closeDialog: () => {
        try {
          if (typeof closeDialog === "function") {
            void closeDialog();
          }
        } catch (e) {
          const msg = `closeDialog() failed: ${String(e && e.message ? e.message : e)}`;
          showRuntimeError(msg);
        }
      },
      get: (name, prop) => {
        const el = findWrapper(name);
        const eltype = typeOf(el);
        const inn = inner(el);
        if (!el) return null;
        switch (eltype) {
          case "Input": {
            const input = el instanceof HTMLTextAreaElement ? el : inn;
            return input?.value ?? "";
          }
          case "Label":
            return inn?.textContent ?? "";
          case "Select": {
            const sel = el instanceof HTMLSelectElement ? el : inn;
            return sel?.value ?? "";
          }
          case "Checkbox":
            return el.dataset.isChecked === "true";
          case "Radio":
            return el.dataset.isSelected === "true";
          case "Counter": {
            if (prop == null || prop === "value") {
              const display = el.querySelector(".counter-value");
              const txt = display?.textContent ?? el.dataset.startval ?? "0";
              const n = Number(txt);
              return Number.isFinite(n) ? n : 0;
            }
            return el.dataset[prop] ?? null;
          }
          default:
            return el.dataset[prop] ?? null;
        }
      },
      set: (name, prop, value) => {
        const el = findWrapper(name);
        if (!el) return;
        const eltype = typeOf(el);
        const inn = inner(el);
        const v = value;
        switch (eltype) {
          case "Input":
            if (prop === "value" && inn instanceof HTMLTextAreaElement) {
              inn.value = String(v);
              el.dataset.value = String(v);
            } else {
              warn(`${name}:${prop}`, `Unsupported set(${eltype}, ${prop})`);
            }
            break;
          case "Label":
            if (prop === "value") {
              el.dataset.value = String(v);
              updateElement(el, { value: String(v) });
            } else {
              warn(`${name}:${prop}`, `Unsupported set(${eltype}, ${prop})`);
            }
            break;
          case "Select":
            const sel = inn instanceof HTMLSelectElement ? inn : el;
            if (prop === "value" && sel) {
              sel.value = String(v);
              el.dataset.value = String(v);
            } else {
              warn(`${name}:${prop}`, `Unsupported set(${eltype}, ${prop})`);
            }
            break;
          case "Checkbox":
            if (prop === "checked") {
              updateElement(el, { isChecked: v ? "true" : "false" });
            } else {
              warn(`${name}:${prop}`, `Unsupported set(${eltype}, ${prop})`);
            }
            break;
          case "Radio":
            if (prop === "selected") {
              updateElement(el, { isSelected: v ? "true" : "false" });
            } else {
              warn(`${name}:${prop}`, `Unsupported set(${eltype}, ${prop})`);
            }
            break;
          case "Counter":
            if (prop === "value") {
              const min2 = Number(el.dataset.minval ?? el.dataset.startval ?? "0");
              const max2 = Number(el.dataset.maxval ?? String(min2));
              let n = Number(v);
              if (!Number.isFinite(n)) {
                warn(`${name}:${prop}`, `Invalid number: ${v}`);
                return;
              }
              if (n < min2) {
                n = min2;
              } else if (n > max2) {
                n = max2;
              }
              updateElement(el, { startval: String(n) });
            } else if (prop === "minval" || prop === "maxval" || prop === "startval") {
              updateElement(el, { [prop]: String(v) });
            } else {
              warn(`${name}:${prop}`, `Unsupported set(${eltype}, ${prop})`);
            }
            break;
          case "Container":
            if (prop === "value") {
              const items = parseContainerValue(v);
              populateContainer(el, items);
            } else {
              warn(`${name}:${prop}`, `Unsupported set(${eltype}, ${prop})`);
            }
            break;
          case "Choice":
            if (prop === "value") {
              applySorterItems(el, normalizeSorterInput(v, normalizeChoiceOrdering2(el.dataset.ordering)));
            } else {
              warn(`${name}:${prop}`, `Unsupported set(${eltype}, ${prop})`);
            }
            break;
          default:
            warn(`${name}:${prop}`, `Unsupported set(${eltype}, ${prop})`);
            break;
        }
      },
      getValue: (name) => {
        const el = findWrapper(name);
        if (!el) {
          return null;
        }
        const eltype = typeOf(el);
        const inn = inner(el);
        if (eltype === "Input") {
          const input = el instanceof HTMLTextAreaElement ? el : inn;
          return input?.value ?? "";
        }
        if (eltype === "Label") {
          return inn?.textContent ?? "";
        }
        if (eltype === "Select") {
          const sel = el instanceof HTMLSelectElement ? el : inn;
          return sel?.value ?? "";
        }
        if (eltype === "Checkbox") {
          return el.dataset.isChecked === "true";
        }
        if (eltype === "Radio") {
          return el.dataset.isSelected === "true";
        }
        if (eltype === "Counter") {
          const display = el.querySelector(".counter-value");
          const txt = display?.textContent ?? el.dataset.startval ?? "0";
          const n = Number(txt);
          return Number.isFinite(n) ? n : 0;
        }
        if (eltype === "Choice") {
          return readSorterItems(el);
        }
        if (eltype === "Container") {
          const host = el;
          const items = Array.from(host.querySelectorAll(".container-item .container-text"));
          const values = items.map((r) => r.textContent || "");
          return values.length ? values : "";
        }
        return el.dataset["value"] ?? null;
      },
      setValue: (name, value) => {
        const el = findWrapper(name);
        if (!el) return;
        const eltype = typeOf(el);
        const inn = inner(el);
        if (Array.isArray(value)) {
          if (eltype === "Select") {
            const sel = el instanceof HTMLSelectElement ? el : el.querySelector("select");
            if (sel) {
              const values = value.map((v) => String(v));
              sel.innerHTML = "";
              for (const v of values) {
                const opt = document.createElement("option");
                opt.value = v;
                opt.textContent = v;
                sel.appendChild(opt);
              }
              const r = sel.getBoundingClientRect();
              if (r.height > 0) {
                el.style.height = `${Math.round(r.height)}px`;
              }
              el.dataset.value = String(sel.value || "");
            }
            return;
          }
          if (eltype === "Container") {
            const items = parseContainerValue(value);
            populateContainer(el, items);
            return;
          }
          if (eltype === "Choice") {
            applySorterItems(el, normalizeSorterInput(value, normalizeChoiceOrdering2(el.dataset.ordering)));
            return;
          }
          return;
        }
        if (eltype === "Input") {
          const input = el instanceof HTMLTextAreaElement ? el : inn;
          if (input) {
            input.value = String(value);
            el.dataset.value = String(value);
          }
          return;
        }
        if (eltype === "Label") {
          el.dataset.value = String(value);
          updateElement(
            el,
            { value: String(value) }
          );
          return;
        }
        if (eltype === "Select") {
          const sel = el instanceof HTMLSelectElement ? el : el.querySelector("select");
          if (sel) {
            sel.value = String(value);
            el.dataset.value = String(value);
          }
          return;
        }
        if (eltype === "Checkbox") {
          updateElement(
            el,
            { isChecked: value ? "true" : "false" }
          );
          return;
        }
        if (eltype === "Radio") {
          updateElement(
            el,
            { isSelected: value ? "true" : "false" }
          );
          return;
        }
        if (eltype === "Container") {
          const items = parseContainerValue(value);
          populateContainer(el, items);
          return;
        }
        if (eltype === "Choice") {
          applySorterItems(el, normalizeSorterInput(value, normalizeChoiceOrdering2(el.dataset.ordering)));
          return;
        }
        el.dataset["value"] = String(value);
      },
      getSelected: (name) => {
        const el = findWrapper(name);
        if (!el) {
          const members = findRadioGroupMembers(String(name));
          if (members && members.length > 0) {
            const selected = (() => {
              const ds = members.find((m) => String(m.dataset?.isSelected || "") === "true");
              if (ds) return ds;
              const n = members.find((m) => {
                const input = m.querySelector('input[type="radio"]');
                return !!input?.checked;
              });
              if (n) return n;
              const c = members.find((m) => {
                const custom = m.querySelector(".custom-radio");
                return custom?.getAttribute("aria-checked") === "true";
              });
              return c || null;
            })();
            if (selected) {
              const nm = String(selected.dataset?.nameid || selected.id || "").trim();
              return nm ? [nm] : [];
            }
            return [];
          }
          return [];
        }
        const eltype = typeOf(el);
        if (eltype === "Select") {
          const sel = el instanceof HTMLSelectElement ? el : el.querySelector("select");
          return sel && sel.value ? [sel.value] : [];
        }
        if (eltype === "Container") {
          if (utils.isTrue(el.dataset.itemOrder)) {
            const ordered = normalizeOrderList2(splitList2(el.dataset.selectedOrder));
            if (ordered.length > 0) {
              return ordered;
            }
          }
          const nodes = Array.from(el.querySelectorAll(".container-item.active .container-text"));
          const vals = nodes.map((n) => n.textContent || "").map((s) => s.trim()).filter((s) => s.length > 0);
          if (vals.length > 0) {
            return vals;
          }
          const ds = String(el.dataset.selected || "").trim();
          const dsVals = ds ? ds.split(",").map((s) => s.trim()).filter((s) => s.length > 0) : [];
          return dsVals.length > 0 ? dsVals : "";
        }
        if (eltype === "Choice") {
          const items = readSorterItems(el).filter((item) => item.state !== "off");
          if (items.length === 0) return [];
          return items.map((item) => `${item.text}:${item.state}`);
        }
        return [];
      },
      // New preferred name for checked state
      isChecked: (name) => {
        const el = findWrapper(name);
        if (!el) return false;
        const eltype = typeOf(el);
        if (eltype === "Checkbox") {
          const custom = el.querySelector(".custom-checkbox");
          if (custom) return custom.getAttribute("aria-checked") === "true";
          return el.dataset.isChecked === "true";
        } else if (eltype === "Radio") {
          const custom = el.querySelector(".custom-radio");
          if (custom) return custom.getAttribute("aria-checked") === "true";
          return el.dataset.isSelected === "true";
        }
        return false;
      },
      isUnchecked: (name) => {
        return !api.isChecked(name);
      },
      isVisible: (name) => {
        const el = findWrapper(name);
        if (!el) return false;
        const ds = (el.style?.display || "").toLowerCase();
        return ds !== "none";
      },
      isHidden: (name) => {
        return !api.isVisible(name);
      },
      isEnabled: (name) => {
        const el = findWrapper(name);
        if (!el) return false;
        if (el.classList.contains("disabled-div")) {
          return false;
        }
        const input = el.querySelector("input, select, textarea");
        if (input?.disabled) {
          return false;
        }
        const customCheckbox = el.querySelector('.custom-checkbox[aria-disabled="true"]');
        if (customCheckbox) {
          return false;
        }
        const customRadio = el.querySelector('.custom-radio[aria-disabled="true"]');
        if (customRadio) {
          return false;
        }
        return true;
      },
      isDisabled: (name) => {
        return !api.isEnabled(name);
      },
      show: (name, on = true) => {
        const el = findWrapper(name);
        if (!el) return;
        if (on) {
          el.dataset.isVisible = "true";
          el.style.removeProperty("display");
          el.classList.remove("design-hidden");
          const inner2 = el.firstElementChild;
          if (inner2 && inner2.style.display === "none") {
            inner2.style.removeProperty("display");
          }
          if (el.style.display === "none" || getComputedStyle(el).display === "none") {
            el.style.display = "block";
          }
        } else {
          el.dataset.isVisible = "false";
          el.style.display = "none";
          el.classList.remove("design-hidden");
        }
      },
      hide: (name, on = true) => {
        api.show(name, !on);
      },
      enable: (name, on = true) => {
        const el = findWrapper(name);
        if (!el) return;
        updateElement(el, { isEnabled: on ? "true" : "false" });
      },
      disable: (name, yes = true) => {
        api.enable(name, !yes);
      },
      addError: (name, message) => {
        const key = coerceName(name);
        const text = translateMessage(message);
        if (!text) {
          return;
        }
        errorhelpers.addTooltip(key, text);
      },
      clearError: (...args) => {
        if (!args.length) {
          throw new SyntaxError("clearError() expects at least one element");
        }
        let names = [];
        let message;
        if (Array.isArray(args[0])) {
          names = args[0];
          if (args.length > 1 && args[1] != null) {
            const msg = translateMessage(args[1]);
            if (msg) message = msg;
          }
        } else if (args.length === 2) {
          const maybeMsg = args[1];
          if (typeof maybeMsg === "string" && !findWrapper(maybeMsg)) {
            names = [args[0]];
            const msg = translateMessage(maybeMsg);
            if (msg) message = msg;
          } else {
            names = args;
          }
        } else {
          names = args;
        }
        if (!names.length) {
          throw new SyntaxError("clearError() expects at least one element");
        }
        names.forEach((name) => {
          const key = coerceName(name);
          errorhelpers.clearTooltip(key, message ? String(message) : void 0);
        });
      },
      // Simulated workspace object listing (e.g., via R connection)
      listObjects: (type) => listObjectsByType(type),
      // Simulated workspace columns listing
      listColumns: (input) => listColumnsFromDataset(input),
      bindObjects: async (request) => {
        const normalized = normalizeObjectBindingRequest(request);
        if (typeof env.bindObjects === "function") {
          return env.bindObjects(normalized);
        }
        bindObjectsInPreview(normalized);
        return normalized;
      },
      on: (name, event, handler) => {
        const el = findWrapper(name);
        if (!el) {
          throw new SyntaxError(`Element not found: ${String(name)}`);
        }
        const evt = renderutils.normalizeEventName(event);
        if (!evt) {
          throw new SyntaxError(`Unsupported event "${String(event)}" in ui.on(${name}, ...). Allowed: ${Array.from(EVENT_NAMES).join(", ")}`);
        }
        const h = (ev) => {
          withActiveEvent(el, evt, () => {
            try {
              handler(ev, el);
            } catch (e) {
              const msg = `Custom handler error on ${event} for "${name}": ${String(e && e.message ? e.message : e)}`;
              showRuntimeError(msg);
            }
          });
        };
        el.addEventListener(evt, h);
        disposers.push(() => el.removeEventListener(evt, h));
      },
      onClick: (name, handler) => api.on(name, "click", handler),
      onChange: (name, handler) => {
        const key = coerceName(name);
        const direct = findWrapper(key);
        if (direct) {
          api.on(key, "change", handler);
          return;
        }
        const groupMembers = findRadioGroupMembers(key);
        if (groupMembers.length > 0) {
          const handledEvents = /* @__PURE__ */ new WeakSet();
          const visited = /* @__PURE__ */ new Set();
          groupMembers.forEach((member) => {
            const native = member.querySelector('input[type="radio"]');
            const handlerWrapper = (ev) => {
              if (handledEvents.has(ev)) {
                return;
              }
              handledEvents.add(ev);
              if (!native || ev.target !== native) {
                return;
              }
              if (member.dataset?.isSelected !== "true") {
                return;
              }
              handler(ev, member);
            };
            if (visited.has(member)) {
              return;
            }
            visited.add(member);
            const memberName = member.dataset?.nameid || member.id;
            if (!memberName) {
              return;
            }
            const guardedHandlerWrapper = (ev) => withActiveEvent(member, "change", () => handlerWrapper(ev));
            member.addEventListener("change", guardedHandlerWrapper);
            disposers.push(() => member.removeEventListener("change", guardedHandlerWrapper));
          });
          return;
        }
        api.on(key, "change", handler);
      },
      onInput: (name, handler) => api.on(name, "input", handler),
      trigger: (name, event = "change") => {
        const el = findWrapper(name);
        if (!el) {
          throw new SyntaxError(`Element not found: ${String(name)}`);
        }
        const evt = renderutils.normalizeEventName(event);
        if (!evt) {
          throw new SyntaxError(`Unsupported event "${String(event)}" in ui.trigger(${name}, ...). Allowed: ${Array.from(EVENT_NAMES).join(", ")}`);
        }
        const innerEl = (() => {
          const eltype = typeOf(el);
          if (eltype === "Checkbox") {
            return el.querySelector(".custom-checkbox");
          }
          if (eltype === "Radio") {
            return el.querySelector(".custom-radio");
          }
          if (eltype === "Select") {
            return el instanceof HTMLSelectElement ? el : el.querySelector("select");
          }
          if (eltype === "Input") {
            return el instanceof HTMLTextAreaElement ? el : el.querySelector("textarea");
          }
          return null;
        })();
        const target2 = innerEl || el;
        if (isHandlingEvent(el, evt)) {
          return;
        }
        if (evt === "click") {
          target2.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
          return;
        }
        if (evt === "change") {
          target2.dispatchEvent(new Event("change", { bubbles: true }));
          return;
        }
        if (evt === "input") {
          target2.dispatchEvent(new Event("input", { bubbles: true }));
          return;
        }
      },
      triggerChange: (name) => api.trigger(name, "change"),
      triggerClick: (name) => api.trigger(name, "click"),
      searchIn: (input, ...containers) => {
        const inputName = coerceName(input);
        const inputEl = findWrapper(inputName);
        if (!inputEl) {
          throw new SyntaxError(`Element not found: ${String(input)}`);
        }
        const inputType = typeOf(inputEl);
        if (inputType !== "Input") {
          throw new SyntaxError(`searchIn() expects an Input as the first argument; ${inputName} is ${inputType}`);
        }
        if (!containers.length) {
          throw new SyntaxError("searchIn() expects at least one container");
        }
        const readQuery = () => String(api.getValue(inputName) ?? "").trim();
        const applyQuery = () => {
          const query = readQuery();
          containers.forEach((container) => {
            const containerName = coerceName(container);
            const containerEl = findWrapper(containerName);
            if (!containerEl) {
              throw new SyntaxError(`Element not found: ${containerName}`);
            }
            const containerType = typeOf(containerEl);
            if (containerType !== "Container") {
              throw new SyntaxError(`searchIn() supports only Container targets; ${containerName} is ${containerType}`);
            }
            if (query) {
              containerEl.dataset.searchQuery = query;
            } else if ("searchQuery" in containerEl.dataset) {
              delete containerEl.dataset.searchQuery;
            }
            renderutils.applyContainerItemFilter(containerEl);
          });
        };
        api.onInput(inputName, applyQuery);
        api.onChange(inputName, applyQuery);
        applyQuery();
      },
      enableSearch: (...containers) => {
        if (!containers.length) {
          throw new SyntaxError("enableSearch() expects at least one container");
        }
        containers.forEach((container) => {
          const containerName = coerceName(container);
          const containerEl = findWrapper(containerName);
          if (!containerEl) {
            throw new SyntaxError(`Element not found: ${containerName}`);
          }
          const containerType = typeOf(containerEl);
          if (containerType !== "Container") {
            throw new SyntaxError(`enableSearch() supports only Container targets; ${containerName} is ${containerType}`);
          }
          containerEl.dataset.autoSearchEnabled = "true";
        });
      },
      setSelected: (name, value) => {
        const el = findWrapper(name);
        if (!el) {
          throw new SyntaxError(`Element not found: ${String(name)}`);
        }
        const eltype = typeOf(el);
        if (eltype === "Select") {
          const sel = el instanceof HTMLSelectElement ? el : el.querySelector("select");
          if (!sel) {
            throw new SyntaxError(`Select control not found in element ${name}`);
          }
          const v = String(Array.isArray(value) ? value[0] : value);
          const exists = Array.from(sel.options).some((o) => o.value === v);
          if (!exists) {
            throw new SyntaxError(`Option "${v}" not found in Select ${name}`);
          }
          sel.value = v;
          el.dataset.value = v;
          return;
        }
        if (eltype === "Container") {
          const host = el;
          const items = Array.from(host.querySelectorAll(".container-item"));
          const kind = String(el.dataset.selection || host.dataset.selection || "single").toLowerCase();
          let selValues = Array.isArray(value) ? value.map((v) => String(v)) : [String(value)];
          if (kind !== "multiple") {
            selValues = selValues.length ? [selValues[0]] : [];
            if (kind === "single-radio" && selValues.length === 0) {
              const firstSelectable = items.find((item) => item.dataset.disabled !== "true");
              const fallback = firstSelectable?.querySelector(".container-text")?.textContent || "";
              selValues = fallback.trim() ? [fallback.trim()] : [];
            }
          }
          const applied = /* @__PURE__ */ new Set();
          items.forEach((item) => {
            const label = item.querySelector(".container-text")?.textContent || "";
            const disabled = item.dataset.disabled === "true";
            const shouldSelect = !disabled && selValues.includes(label);
            item.classList.toggle("active", shouldSelect);
            applyItemStyle(host, item, shouldSelect);
            if (shouldSelect) {
              applied.add(label);
            }
          });
          const finalValues = Array.from(applied).map((v) => v.trim()).filter(Boolean);
          const joined = finalValues.join(",");
          const containerEl = el;
          containerEl.dataset.selected = joined;
          containerEl.dataset.activeValues = joined;
          if (utils.isTrue(containerEl.dataset.itemOrder)) {
            const desired = normalizeOrderList2(selValues);
            const appliedSet = new Set(finalValues);
            const ordered = desired.filter((v) => appliedSet.has(v));
            const extras = finalValues.filter((v) => !ordered.includes(v));
            const next = normalizeOrderList2([...ordered, ...extras]);
            containerEl.dataset.selectedOrder = next.join(",");
          } else if ("selectedOrder" in containerEl.dataset) {
            delete containerEl.dataset.selectedOrder;
          }
          renderutils.applyContainerItemFilter(host);
          return;
        }
        if (eltype === "Choice") {
          const host = el;
          const orderingMode = normalizeChoiceOrdering2(host.dataset.ordering);
          const current = readSorterItems(host);
          const desired = normalizeSorterInput(value, orderingMode);
          const desiredMap = new Map(desired.map((d) => [d.text, d.state]));
          const merged = current.map((item) => {
            const next = desiredMap.get(item.text);
            return next ? { text: item.text, state: next } : { text: item.text, state: "off" };
          });
          applySorterItems(host, merged);
          return;
        }
        throw new SyntaxError(`ui.setSelected is not supported for element type ${eltype}`);
      },
      // Legacy alias: select(name, value) preserves previous additive behavior for Container
      select: (name, value) => {
        const el = findWrapper(name);
        if (!el) {
          throw new SyntaxError(`Element not found: ${String(name)}`);
        }
        const eltype = typeOf(el);
        if (eltype === "Select") {
          api.setSelected(name, value);
          return;
        }
        if (eltype === "Container") {
          const host = el;
          const items = Array.from(host.querySelectorAll(".container-item"));
          const v = String(value);
          const item = items.find((r) => (r.querySelector(".container-text")?.textContent || "") === v);
          if (!item) {
            throw new SyntaxError(`Item with label "${v}" not found in Container ${name}`);
          }
          const h = host;
          if (item.dataset.disabled === "true") {
            const required = renderutils.normalizeContainerItemType(h.dataset.itemType || "any") || "any";
            throw new SyntaxError(`Item "${v}" is not selectable; container requires ${required} items`);
          }
          const kind = String(el.dataset.selection || h.dataset.selection || "single").toLowerCase();
          const forcedSingle = kind === "single-radio";
          const multiple = kind === "multiple";
          let changed = false;
          let toggledOn = false;
          if (multiple) {
            const willActivate = !item.classList.contains("active");
            item.classList.toggle("active", willActivate);
            applyItemStyle(h, item, willActivate);
            changed = true;
            toggledOn = willActivate;
          } else {
            const prevs = Array.from(h.querySelectorAll(".container-item.active"));
            const alreadyActive = item.classList.contains("active");
            if (!alreadyActive) {
              for (const prev of prevs) {
                if (prev === item) {
                  continue;
                }
                prev.classList.remove("active");
                applyItemStyle(h, prev, false);
              }
              item.classList.add("active");
              applyItemStyle(h, item, true);
              changed = true;
            } else if (!forcedSingle) {
              item.classList.remove("active");
              applyItemStyle(h, item, false);
              changed = true;
            }
          }
          if (changed) {
            const active = Array.from(h.querySelectorAll(".container-item.active .container-text"));
            const vals = active.map((n) => String(n.textContent || "").trim()).filter((s) => s.length > 0);
            const joined = vals.join(",");
            el.dataset.selected = joined;
            h.dataset.activeValues = joined;
            if (utils.isTrue(h.dataset.itemOrder)) {
              const label = v.trim();
              let nextOrder = normalizeOrderList2(splitList2(h.dataset.selectedOrder));
              if (multiple) {
                nextOrder = toggledOn ? normalizeOrderList2([...nextOrder.filter((val) => val !== label), label]) : nextOrder.filter((val) => val !== label);
              } else {
                nextOrder = label ? [label] : [];
              }
              h.dataset.selectedOrder = normalizeOrderList2(nextOrder).join(",");
            } else if ("selectedOrder" in h.dataset) {
              delete h.dataset.selectedOrder;
            }
            renderutils.applyContainerItemFilter(h);
          }
          return;
        }
        throw new SyntaxError(`ui.select is not supported for element type ${eltype}`);
      },
      addValue: (name, value) => {
        const el = findWrapper(name);
        if (!el) {
          throw new SyntaxError(`Element not found: ${String(name)}`);
        }
        const eltype = typeOf(el);
        if (eltype !== "Container") {
          throw new SyntaxError(`addValue is only supported for Container elements`);
        }
        const host = el;
        let target2 = null;
        const existing = host.querySelector(".container-content");
        const sample = host.querySelector(".container-sample");
        if (existing instanceof HTMLElement) {
          target2 = existing;
        } else if (sample instanceof HTMLElement) {
          target2 = sample;
        } else {
          target2 = document.createElement("div");
          target2.className = "container-content";
          target2.style.width = "100%";
          target2.style.height = "100%";
          target2.style.overflowY = "auto";
          target2.style.overflowX = "hidden";
          host.appendChild(target2);
        }
        if (!target2) {
          return;
        }
        const descriptor = containerItemFromValue(value);
        if (!descriptor) {
          return;
        }
        const textValue = descriptor.name;
        const activeFlags = DATASET_ITEM_FLAGS.filter((flag) => descriptor.flags[flag] === true);
        const items = Array.from(target2.querySelectorAll(".container-item"));
        const exists = items.some((item2) => (item2.querySelector(".container-text")?.textContent || "") === textValue);
        if (exists) {
          return;
        }
        const item = document.createElement("div");
        item.className = "container-item";
        item.dataset.value = textValue;
        item.dataset.baseOrder = String(items.length);
        if (activeFlags.length > 0) {
          item.dataset.itemFlags = activeFlags.join(",");
        } else {
          delete item.dataset.itemFlags;
        }
        const label = document.createElement("span");
        label.className = "container-text";
        label.textContent = textValue;
        label.style.color = String(host.dataset.fontColor || "#000000");
        item.appendChild(label);
        target2.appendChild(item);
        applyItemStyle(host, item, false);
        attachContainerItemHandler(host, target2, item);
        renderutils.applyContainerItemFilter(host);
      },
      clearValue: (name, value) => {
        const el = findWrapper(name);
        if (!el) {
          throw new SyntaxError(`Element not found: ${String(name)}`);
        }
        const eltype = typeOf(el);
        if (eltype !== "Container") {
          throw new SyntaxError(`clearValue is only supported for Container elements`);
        }
        const host = el;
        const items = Array.from(host.querySelectorAll(".container-item"));
        const values = (Array.isArray(value) ? value : [value]).map((v) => String(v).trim()).filter((v) => v.length > 0);
        if (values.length === 0) {
          return;
        }
        const valuesSet = new Set(values);
        let removed = false;
        items.forEach((item) => {
          const textElement = item.querySelector(".container-text");
          const text = String(textElement?.textContent || "").trim();
          if (valuesSet.has(text)) {
            item.remove();
            removed = true;
          }
        });
        if (!removed) {
          return;
        }
        const active = Array.from(host.querySelectorAll(".container-item.active .container-text"));
        const vals = active.map((n) => String(n.textContent || "").trim()).filter((s) => s.length > 0);
        const joined = vals.join(",");
        el.dataset.selected = joined;
        host.dataset.activeValues = joined;
        if (utils.isTrue(host.dataset.itemOrder)) {
          const ordered = mergeSelectionOrder2(host, vals);
          host.dataset.selectedOrder = ordered.join(",");
        } else if ("selectedOrder" in host.dataset) {
          delete host.dataset.selectedOrder;
        }
        renderutils.applyContainerItemFilter(host);
      },
      clearInput: (name) => {
        const el = findWrapper(name);
        if (!el) {
          throw new SyntaxError(`Element not found: ${String(name)}`);
        }
        const eltype = typeOf(el);
        if (eltype !== "Input") {
          throw new SyntaxError(`clearInput() can only be applied to input elements`);
        }
        const inn = inner(el);
        const input = el instanceof HTMLTextAreaElement ? el : inn;
        if (input) {
          input.value = "";
          el.dataset.value = "";
        }
      },
      clearContent: (...names) => {
        const list = names.length === 1 && Array.isArray(names[0]) ? names[0] : names;
        if (!list.length) {
          throw new SyntaxError("clearContent() expects at least one element");
        }
        const clearOne = (name) => {
          const key = coerceName(name);
          const el = findWrapper(key);
          if (!el) {
            throw new SyntaxError(`Element not found: ${String(name)}`);
          }
          const eltype = typeOf(el);
          if (eltype === "Input") {
            const inn = inner(el);
            const input = el instanceof HTMLTextAreaElement ? el : inn;
            if (input) {
              input.value = "";
              el.dataset.value = "";
            }
            return;
          }
          if (eltype === "Container") {
            const host = el;
            const items = Array.from(host.querySelectorAll(".container-item"));
            items.forEach((item) => item.remove());
            el.dataset.selected = "";
            host.dataset.activeValues = "";
            if ("selectedOrder" in host.dataset) {
              delete host.dataset.selectedOrder;
            }
            renderutils.applyContainerItemFilter(host);
            return;
          }
          throw new SyntaxError(`clearContent() supports only Input and Container elements`);
        };
        list.forEach(clearOne);
      },
      // Update the visible label of a Button element
      setLabel: (name, label) => {
        const el = findWrapper(name);
        if (!el) {
          throw new SyntaxError(`Element not found: ${String(name)}`);
        }
        const eltype = typeOf(el);
        if (eltype !== "Button") {
          throw new SyntaxError(`setLabel() can only be applied to Button elements`);
        }
        updateElement(el, { label: String(label ?? "") });
      },
      // Change the label of a specific Container item
      changeValue: (name, oldValue, newValue) => {
        const el = findWrapper(name);
        if (!el) {
          throw new SyntaxError(`Element not found: ${String(name)}`);
        }
        const eltype = typeOf(el);
        if (eltype !== "Container") {
          throw new SyntaxError(`changeValue() can only be applied to Container elements`);
        }
        const host = el;
        const items = Array.from(host.querySelectorAll(".container-item"));
        const from = String(oldValue ?? "");
        const to = String(newValue ?? "");
        const item = items.find((r) => {
          const text = r.querySelector(".container-text")?.textContent || "";
          const ds = r.dataset.value || "";
          return text === from || ds === from;
        });
        if (!item) {
          return;
        }
        item.dataset.value = to;
        const label = item.querySelector(".container-text");
        if (label) {
          label.textContent = to;
        }
        try {
          const active = Array.from(host.querySelectorAll(".container-item.active .container-text"));
          const vals = active.map((n) => String(n.textContent || "").trim()).filter((s) => s.length > 0);
          el.dataset.selected = vals.join(",");
        } catch {
        }
      },
      // items() and values() removed in favor of getValue/setValue/getSelected
      __disposeAll: () => {
        disposers.forEach((fn2) => {
          fn2();
        });
        disposers.length = 0;
      }
    };
    try {
      api.updateSyntax("");
    } catch {
    }
    return api;
  }
  var EVENT_LIST, EVENT_NAMES, API_NAMES, NEUTRAL_NAMES, ELEMENT_FIRST_ARG_CALLS, DATASET_ITEM_FLAGS;
  var init_api = __esm({
    "src/library/api.ts"() {
      "use strict";
      init_renderutils();
      init_utils();
      init_datasets();
      EVENT_LIST = ["click", "change", "input"];
      EVENT_NAMES = new Set(EVENT_LIST);
      API_NAMES = Object.freeze([
        // core
        "showMessage",
        "getValue",
        "setValue",
        "run",
        "callExternal",
        "updateSyntax",
        "resetDialog",
        "closeDialog",
        // checkbox/radio
        "check",
        "isChecked",
        "uncheck",
        "isUnchecked",
        // visibility/enabled
        "show",
        "isVisible",
        "hide",
        "isHidden",
        "enable",
        "isEnabled",
        "disable",
        "isDisabled",
        // events
        "onClick",
        "onChange",
        "onInput",
        "triggerChange",
        "triggerClick",
        // search helpers
        "searchIn",
        "enableSearch",
        // lists & selection
        "setSelected",
        "getSelected",
        "addValue",
        "clearValue",
        "clearInput",
        "clearContent",
        // label and item updates
        "setLabel",
        "changeValue",
        // errors
        "addError",
        "clearError",
        // object/data helpers
        "listObjects",
        "listColumns",
        "bindObjects"
      ]);
      NEUTRAL_NAMES = /* @__PURE__ */ new Set([
        "showMessage",
        "listObjects",
        "listColumns",
        "bindObjects",
        "callExternal",
        "run",
        "resetDialog",
        "closeDialog"
      ]);
      ELEMENT_FIRST_ARG_CALLS = Object.freeze(
        API_NAMES.filter((n) => !NEUTRAL_NAMES.has(n))
      );
      DATASET_ITEM_FLAGS = ["numeric", "factor", "calibrated", "binary", "character", "categorical", "date"];
    }
  });

  // node_modules/uuid/dist/stringify.js
  function unsafeStringify(arr, offset2 = 0) {
    return (byteToHex[arr[offset2 + 0]] + byteToHex[arr[offset2 + 1]] + byteToHex[arr[offset2 + 2]] + byteToHex[arr[offset2 + 3]] + "-" + byteToHex[arr[offset2 + 4]] + byteToHex[arr[offset2 + 5]] + "-" + byteToHex[arr[offset2 + 6]] + byteToHex[arr[offset2 + 7]] + "-" + byteToHex[arr[offset2 + 8]] + byteToHex[arr[offset2 + 9]] + "-" + byteToHex[arr[offset2 + 10]] + byteToHex[arr[offset2 + 11]] + byteToHex[arr[offset2 + 12]] + byteToHex[arr[offset2 + 13]] + byteToHex[arr[offset2 + 14]] + byteToHex[arr[offset2 + 15]]).toLowerCase();
  }
  var byteToHex;
  var init_stringify = __esm({
    "node_modules/uuid/dist/stringify.js"() {
      byteToHex = [];
      for (let i = 0; i < 256; ++i) {
        byteToHex.push((i + 256).toString(16).slice(1));
      }
    }
  });

  // node_modules/uuid/dist/rng.js
  function rng() {
    return crypto.getRandomValues(rnds8);
  }
  var rnds8;
  var init_rng = __esm({
    "node_modules/uuid/dist/rng.js"() {
      rnds8 = new Uint8Array(16);
    }
  });

  // node_modules/uuid/dist/v4.js
  function v4(options, buf, offset2) {
    if (!buf && !options && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return _v4(options, buf, offset2);
  }
  function _v4(options, buf, offset2) {
    options = options || {};
    const rnds = options.random ?? options.rng?.() ?? rng();
    if (rnds.length < 16) {
      throw new Error("Random bytes length must be >= 16");
    }
    rnds[6] = rnds[6] & 15 | 64;
    rnds[8] = rnds[8] & 63 | 128;
    if (buf) {
      offset2 = offset2 || 0;
      if (offset2 < 0 || offset2 + 16 > buf.length) {
        throw new RangeError(`UUID byte range ${offset2}:${offset2 + 15} is out of buffer bounds`);
      }
      for (let i = 0; i < 16; ++i) {
        buf[offset2 + i] = rnds[i];
      }
      return buf;
    }
    return unsafeStringify(rnds);
  }
  var v4_default;
  var init_v4 = __esm({
    "node_modules/uuid/dist/v4.js"() {
      init_rng();
      init_stringify();
      v4_default = v4;
    }
  });

  // node_modules/uuid/dist/index.js
  var init_dist = __esm({
    "node_modules/uuid/dist/index.js"() {
      init_v4();
    }
  });

  // node_modules/@popperjs/core/lib/enums.js
  var top, bottom, right, left, auto, basePlacements, start, end, clippingParents, viewport, popper, reference, variationPlacements, placements, beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite, modifierPhases;
  var init_enums = __esm({
    "node_modules/@popperjs/core/lib/enums.js"() {
      top = "top";
      bottom = "bottom";
      right = "right";
      left = "left";
      auto = "auto";
      basePlacements = [top, bottom, right, left];
      start = "start";
      end = "end";
      clippingParents = "clippingParents";
      viewport = "viewport";
      popper = "popper";
      reference = "reference";
      variationPlacements = /* @__PURE__ */ basePlacements.reduce(function(acc, placement) {
        return acc.concat([placement + "-" + start, placement + "-" + end]);
      }, []);
      placements = /* @__PURE__ */ [].concat(basePlacements, [auto]).reduce(function(acc, placement) {
        return acc.concat([placement, placement + "-" + start, placement + "-" + end]);
      }, []);
      beforeRead = "beforeRead";
      read = "read";
      afterRead = "afterRead";
      beforeMain = "beforeMain";
      main = "main";
      afterMain = "afterMain";
      beforeWrite = "beforeWrite";
      write = "write";
      afterWrite = "afterWrite";
      modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];
    }
  });

  // node_modules/@popperjs/core/lib/dom-utils/getNodeName.js
  function getNodeName(element) {
    return element ? (element.nodeName || "").toLowerCase() : null;
  }
  var init_getNodeName = __esm({
    "node_modules/@popperjs/core/lib/dom-utils/getNodeName.js"() {
    }
  });

  // node_modules/@popperjs/core/lib/dom-utils/getWindow.js
  function getWindow(node) {
    if (node == null) {
      return window;
    }
    if (node.toString() !== "[object Window]") {
      var ownerDocument = node.ownerDocument;
      return ownerDocument ? ownerDocument.defaultView || window : window;
    }
    return node;
  }
  var init_getWindow = __esm({
    "node_modules/@popperjs/core/lib/dom-utils/getWindow.js"() {
    }
  });

  // node_modules/@popperjs/core/lib/dom-utils/instanceOf.js
  function isElement(node) {
    var OwnElement = getWindow(node).Element;
    return node instanceof OwnElement || node instanceof Element;
  }
  function isHTMLElement(node) {
    var OwnElement = getWindow(node).HTMLElement;
    return node instanceof OwnElement || node instanceof HTMLElement;
  }
  function isShadowRoot(node) {
    if (typeof ShadowRoot === "undefined") {
      return false;
    }
    var OwnElement = getWindow(node).ShadowRoot;
    return node instanceof OwnElement || node instanceof ShadowRoot;
  }
  var init_instanceOf = __esm({
    "node_modules/@popperjs/core/lib/dom-utils/instanceOf.js"() {
      init_getWindow();
    }
  });

  // node_modules/@popperjs/core/lib/modifiers/applyStyles.js
  function applyStyles(_ref) {
    var state = _ref.state;
    Object.keys(state.elements).forEach(function(name) {
      var style = state.styles[name] || {};
      var attributes = state.attributes[name] || {};
      var element = state.elements[name];
      if (!isHTMLElement(element) || !getNodeName(element)) {
        return;
      }
      Object.assign(element.style, style);
      Object.keys(attributes).forEach(function(name2) {
        var value = attributes[name2];
        if (value === false) {
          element.removeAttribute(name2);
        } else {
          element.setAttribute(name2, value === true ? "" : value);
        }
      });
    });
  }
  function effect(_ref2) {
    var state = _ref2.state;
    var initialStyles = {
      popper: {
        position: state.options.strategy,
        left: "0",
        top: "0",
        margin: "0"
      },
      arrow: {
        position: "absolute"
      },
      reference: {}
    };
    Object.assign(state.elements.popper.style, initialStyles.popper);
    state.styles = initialStyles;
    if (state.elements.arrow) {
      Object.assign(state.elements.arrow.style, initialStyles.arrow);
    }
    return function() {
      Object.keys(state.elements).forEach(function(name) {
        var element = state.elements[name];
        var attributes = state.attributes[name] || {};
        var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]);
        var style = styleProperties.reduce(function(style2, property) {
          style2[property] = "";
          return style2;
        }, {});
        if (!isHTMLElement(element) || !getNodeName(element)) {
          return;
        }
        Object.assign(element.style, style);
        Object.keys(attributes).forEach(function(attribute) {
          element.removeAttribute(attribute);
        });
      });
    };
  }
  var applyStyles_default;
  var init_applyStyles = __esm({
    "node_modules/@popperjs/core/lib/modifiers/applyStyles.js"() {
      init_getNodeName();
      init_instanceOf();
      applyStyles_default = {
        name: "applyStyles",
        enabled: true,
        phase: "write",
        fn: applyStyles,
        effect,
        requires: ["computeStyles"]
      };
    }
  });

  // node_modules/@popperjs/core/lib/utils/getBasePlacement.js
  function getBasePlacement(placement) {
    return placement.split("-")[0];
  }
  var init_getBasePlacement = __esm({
    "node_modules/@popperjs/core/lib/utils/getBasePlacement.js"() {
    }
  });

  // node_modules/@popperjs/core/lib/utils/math.js
  var max, min, round;
  var init_math = __esm({
    "node_modules/@popperjs/core/lib/utils/math.js"() {
      max = Math.max;
      min = Math.min;
      round = Math.round;
    }
  });

  // node_modules/@popperjs/core/lib/utils/userAgent.js
  function getUAString() {
    var uaData = navigator.userAgentData;
    if (uaData != null && uaData.brands && Array.isArray(uaData.brands)) {
      return uaData.brands.map(function(item) {
        return item.brand + "/" + item.version;
      }).join(" ");
    }
    return navigator.userAgent;
  }
  var init_userAgent = __esm({
    "node_modules/@popperjs/core/lib/utils/userAgent.js"() {
    }
  });

  // node_modules/@popperjs/core/lib/dom-utils/isLayoutViewport.js
  function isLayoutViewport() {
    return !/^((?!chrome|android).)*safari/i.test(getUAString());
  }
  var init_isLayoutViewport = __esm({
    "node_modules/@popperjs/core/lib/dom-utils/isLayoutViewport.js"() {
      init_userAgent();
    }
  });

  // node_modules/@popperjs/core/lib/dom-utils/getBoundingClientRect.js
  function getBoundingClientRect(element, includeScale, isFixedStrategy) {
    if (includeScale === void 0) {
      includeScale = false;
    }
    if (isFixedStrategy === void 0) {
      isFixedStrategy = false;
    }
    var clientRect = element.getBoundingClientRect();
    var scaleX = 1;
    var scaleY = 1;
    if (includeScale && isHTMLElement(element)) {
      scaleX = element.offsetWidth > 0 ? round(clientRect.width) / element.offsetWidth || 1 : 1;
      scaleY = element.offsetHeight > 0 ? round(clientRect.height) / element.offsetHeight || 1 : 1;
    }
    var _ref = isElement(element) ? getWindow(element) : window, visualViewport = _ref.visualViewport;
    var addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
    var x = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
    var y = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
    var width = clientRect.width / scaleX;
    var height = clientRect.height / scaleY;
    return {
      width,
      height,
      top: y,
      right: x + width,
      bottom: y + height,
      left: x,
      x,
      y
    };
  }
  var init_getBoundingClientRect = __esm({
    "node_modules/@popperjs/core/lib/dom-utils/getBoundingClientRect.js"() {
      init_instanceOf();
      init_math();
      init_getWindow();
      init_isLayoutViewport();
    }
  });

  // node_modules/@popperjs/core/lib/dom-utils/getLayoutRect.js
  function getLayoutRect(element) {
    var clientRect = getBoundingClientRect(element);
    var width = element.offsetWidth;
    var height = element.offsetHeight;
    if (Math.abs(clientRect.width - width) <= 1) {
      width = clientRect.width;
    }
    if (Math.abs(clientRect.height - height) <= 1) {
      height = clientRect.height;
    }
    return {
      x: element.offsetLeft,
      y: element.offsetTop,
      width,
      height
    };
  }
  var init_getLayoutRect = __esm({
    "node_modules/@popperjs/core/lib/dom-utils/getLayoutRect.js"() {
      init_getBoundingClientRect();
    }
  });

  // node_modules/@popperjs/core/lib/dom-utils/contains.js
  function contains(parent, child) {
    var rootNode = child.getRootNode && child.getRootNode();
    if (parent.contains(child)) {
      return true;
    } else if (rootNode && isShadowRoot(rootNode)) {
      var next = child;
      do {
        if (next && parent.isSameNode(next)) {
          return true;
        }
        next = next.parentNode || next.host;
      } while (next);
    }
    return false;
  }
  var init_contains = __esm({
    "node_modules/@popperjs/core/lib/dom-utils/contains.js"() {
      init_instanceOf();
    }
  });

  // node_modules/@popperjs/core/lib/dom-utils/getComputedStyle.js
  function getComputedStyle2(element) {
    return getWindow(element).getComputedStyle(element);
  }
  var init_getComputedStyle = __esm({
    "node_modules/@popperjs/core/lib/dom-utils/getComputedStyle.js"() {
      init_getWindow();
    }
  });

  // node_modules/@popperjs/core/lib/dom-utils/isTableElement.js
  function isTableElement(element) {
    return ["table", "td", "th"].indexOf(getNodeName(element)) >= 0;
  }
  var init_isTableElement = __esm({
    "node_modules/@popperjs/core/lib/dom-utils/isTableElement.js"() {
      init_getNodeName();
    }
  });

  // node_modules/@popperjs/core/lib/dom-utils/getDocumentElement.js
  function getDocumentElement(element) {
    return ((isElement(element) ? element.ownerDocument : (
      // $FlowFixMe[prop-missing]
      element.document
    )) || window.document).documentElement;
  }
  var init_getDocumentElement = __esm({
    "node_modules/@popperjs/core/lib/dom-utils/getDocumentElement.js"() {
      init_instanceOf();
    }
  });

  // node_modules/@popperjs/core/lib/dom-utils/getParentNode.js
  function getParentNode(element) {
    if (getNodeName(element) === "html") {
      return element;
    }
    return (
      // this is a quicker (but less type safe) way to save quite some bytes from the bundle
      // $FlowFixMe[incompatible-return]
      // $FlowFixMe[prop-missing]
      element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
      element.parentNode || // DOM Element detected
      (isShadowRoot(element) ? element.host : null) || // ShadowRoot detected
      // $FlowFixMe[incompatible-call]: HTMLElement is a Node
      getDocumentElement(element)
    );
  }
  var init_getParentNode = __esm({
    "node_modules/@popperjs/core/lib/dom-utils/getParentNode.js"() {
      init_getNodeName();
      init_getDocumentElement();
      init_instanceOf();
    }
  });

  // node_modules/@popperjs/core/lib/dom-utils/getOffsetParent.js
  function getTrueOffsetParent(element) {
    if (!isHTMLElement(element) || // https://github.com/popperjs/popper-core/issues/837
    getComputedStyle2(element).position === "fixed") {
      return null;
    }
    return element.offsetParent;
  }
  function getContainingBlock(element) {
    var isFirefox = /firefox/i.test(getUAString());
    var isIE = /Trident/i.test(getUAString());
    if (isIE && isHTMLElement(element)) {
      var elementCss = getComputedStyle2(element);
      if (elementCss.position === "fixed") {
        return null;
      }
    }
    var currentNode = getParentNode(element);
    if (isShadowRoot(currentNode)) {
      currentNode = currentNode.host;
    }
    while (isHTMLElement(currentNode) && ["html", "body"].indexOf(getNodeName(currentNode)) < 0) {
      var css = getComputedStyle2(currentNode);
      if (css.transform !== "none" || css.perspective !== "none" || css.contain === "paint" || ["transform", "perspective"].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === "filter" || isFirefox && css.filter && css.filter !== "none") {
        return currentNode;
      } else {
        currentNode = currentNode.parentNode;
      }
    }
    return null;
  }
  function getOffsetParent(element) {
    var window2 = getWindow(element);
    var offsetParent = getTrueOffsetParent(element);
    while (offsetParent && isTableElement(offsetParent) && getComputedStyle2(offsetParent).position === "static") {
      offsetParent = getTrueOffsetParent(offsetParent);
    }
    if (offsetParent && (getNodeName(offsetParent) === "html" || getNodeName(offsetParent) === "body" && getComputedStyle2(offsetParent).position === "static")) {
      return window2;
    }
    return offsetParent || getContainingBlock(element) || window2;
  }
  var init_getOffsetParent = __esm({
    "node_modules/@popperjs/core/lib/dom-utils/getOffsetParent.js"() {
      init_getWindow();
      init_getNodeName();
      init_getComputedStyle();
      init_instanceOf();
      init_isTableElement();
      init_getParentNode();
      init_userAgent();
    }
  });

  // node_modules/@popperjs/core/lib/utils/getMainAxisFromPlacement.js
  function getMainAxisFromPlacement(placement) {
    return ["top", "bottom"].indexOf(placement) >= 0 ? "x" : "y";
  }
  var init_getMainAxisFromPlacement = __esm({
    "node_modules/@popperjs/core/lib/utils/getMainAxisFromPlacement.js"() {
    }
  });

  // node_modules/@popperjs/core/lib/utils/within.js
  function within(min2, value, max2) {
    return max(min2, min(value, max2));
  }
  function withinMaxClamp(min2, value, max2) {
    var v = within(min2, value, max2);
    return v > max2 ? max2 : v;
  }
  var init_within = __esm({
    "node_modules/@popperjs/core/lib/utils/within.js"() {
      init_math();
    }
  });

  // node_modules/@popperjs/core/lib/utils/getFreshSideObject.js
  function getFreshSideObject() {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
  }
  var init_getFreshSideObject = __esm({
    "node_modules/@popperjs/core/lib/utils/getFreshSideObject.js"() {
    }
  });

  // node_modules/@popperjs/core/lib/utils/mergePaddingObject.js
  function mergePaddingObject(paddingObject) {
    return Object.assign({}, getFreshSideObject(), paddingObject);
  }
  var init_mergePaddingObject = __esm({
    "node_modules/@popperjs/core/lib/utils/mergePaddingObject.js"() {
      init_getFreshSideObject();
    }
  });

  // node_modules/@popperjs/core/lib/utils/expandToHashMap.js
  function expandToHashMap(value, keys) {
    return keys.reduce(function(hashMap, key) {
      hashMap[key] = value;
      return hashMap;
    }, {});
  }
  var init_expandToHashMap = __esm({
    "node_modules/@popperjs/core/lib/utils/expandToHashMap.js"() {
    }
  });

  // node_modules/@popperjs/core/lib/modifiers/arrow.js
  function arrow(_ref) {
    var _state$modifiersData$;
    var state = _ref.state, name = _ref.name, options = _ref.options;
    var arrowElement = state.elements.arrow;
    var popperOffsets2 = state.modifiersData.popperOffsets;
    var basePlacement = getBasePlacement(state.placement);
    var axis = getMainAxisFromPlacement(basePlacement);
    var isVertical = [left, right].indexOf(basePlacement) >= 0;
    var len = isVertical ? "height" : "width";
    if (!arrowElement || !popperOffsets2) {
      return;
    }
    var paddingObject = toPaddingObject(options.padding, state);
    var arrowRect = getLayoutRect(arrowElement);
    var minProp = axis === "y" ? top : left;
    var maxProp = axis === "y" ? bottom : right;
    var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets2[axis] - state.rects.popper[len];
    var startDiff = popperOffsets2[axis] - state.rects.reference[axis];
    var arrowOffsetParent = getOffsetParent(arrowElement);
    var clientSize = arrowOffsetParent ? axis === "y" ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
    var centerToReference = endDiff / 2 - startDiff / 2;
    var min2 = paddingObject[minProp];
    var max2 = clientSize - arrowRect[len] - paddingObject[maxProp];
    var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
    var offset2 = within(min2, center, max2);
    var axisProp = axis;
    state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset2, _state$modifiersData$.centerOffset = offset2 - center, _state$modifiersData$);
  }
  function effect2(_ref2) {
    var state = _ref2.state, options = _ref2.options;
    var _options$element = options.element, arrowElement = _options$element === void 0 ? "[data-popper-arrow]" : _options$element;
    if (arrowElement == null) {
      return;
    }
    if (typeof arrowElement === "string") {
      arrowElement = state.elements.popper.querySelector(arrowElement);
      if (!arrowElement) {
        return;
      }
    }
    if (!contains(state.elements.popper, arrowElement)) {
      return;
    }
    state.elements.arrow = arrowElement;
  }
  var toPaddingObject, arrow_default;
  var init_arrow = __esm({
    "node_modules/@popperjs/core/lib/modifiers/arrow.js"() {
      init_getBasePlacement();
      init_getLayoutRect();
      init_contains();
      init_getOffsetParent();
      init_getMainAxisFromPlacement();
      init_within();
      init_mergePaddingObject();
      init_expandToHashMap();
      init_enums();
      toPaddingObject = function toPaddingObject2(padding, state) {
        padding = typeof padding === "function" ? padding(Object.assign({}, state.rects, {
          placement: state.placement
        })) : padding;
        return mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
      };
      arrow_default = {
        name: "arrow",
        enabled: true,
        phase: "main",
        fn: arrow,
        effect: effect2,
        requires: ["popperOffsets"],
        requiresIfExists: ["preventOverflow"]
      };
    }
  });

  // node_modules/@popperjs/core/lib/utils/getVariation.js
  function getVariation(placement) {
    return placement.split("-")[1];
  }
  var init_getVariation = __esm({
    "node_modules/@popperjs/core/lib/utils/getVariation.js"() {
    }
  });

  // node_modules/@popperjs/core/lib/modifiers/computeStyles.js
  function roundOffsetsByDPR(_ref, win) {
    var x = _ref.x, y = _ref.y;
    var dpr = win.devicePixelRatio || 1;
    return {
      x: round(x * dpr) / dpr || 0,
      y: round(y * dpr) / dpr || 0
    };
  }
  function mapToStyles(_ref2) {
    var _Object$assign2;
    var popper2 = _ref2.popper, popperRect = _ref2.popperRect, placement = _ref2.placement, variation = _ref2.variation, offsets = _ref2.offsets, position = _ref2.position, gpuAcceleration = _ref2.gpuAcceleration, adaptive = _ref2.adaptive, roundOffsets = _ref2.roundOffsets, isFixed = _ref2.isFixed;
    var _offsets$x = offsets.x, x = _offsets$x === void 0 ? 0 : _offsets$x, _offsets$y = offsets.y, y = _offsets$y === void 0 ? 0 : _offsets$y;
    var _ref3 = typeof roundOffsets === "function" ? roundOffsets({
      x,
      y
    }) : {
      x,
      y
    };
    x = _ref3.x;
    y = _ref3.y;
    var hasX = offsets.hasOwnProperty("x");
    var hasY = offsets.hasOwnProperty("y");
    var sideX = left;
    var sideY = top;
    var win = window;
    if (adaptive) {
      var offsetParent = getOffsetParent(popper2);
      var heightProp = "clientHeight";
      var widthProp = "clientWidth";
      if (offsetParent === getWindow(popper2)) {
        offsetParent = getDocumentElement(popper2);
        if (getComputedStyle2(offsetParent).position !== "static" && position === "absolute") {
          heightProp = "scrollHeight";
          widthProp = "scrollWidth";
        }
      }
      offsetParent = offsetParent;
      if (placement === top || (placement === left || placement === right) && variation === end) {
        sideY = bottom;
        var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : (
          // $FlowFixMe[prop-missing]
          offsetParent[heightProp]
        );
        y -= offsetY - popperRect.height;
        y *= gpuAcceleration ? 1 : -1;
      }
      if (placement === left || (placement === top || placement === bottom) && variation === end) {
        sideX = right;
        var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : (
          // $FlowFixMe[prop-missing]
          offsetParent[widthProp]
        );
        x -= offsetX - popperRect.width;
        x *= gpuAcceleration ? 1 : -1;
      }
    }
    var commonStyles = Object.assign({
      position
    }, adaptive && unsetSides);
    var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
      x,
      y
    }, getWindow(popper2)) : {
      x,
      y
    };
    x = _ref4.x;
    y = _ref4.y;
    if (gpuAcceleration) {
      var _Object$assign;
      return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? "0" : "", _Object$assign[sideX] = hasX ? "0" : "", _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", _Object$assign));
    }
    return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : "", _Object$assign2[sideX] = hasX ? x + "px" : "", _Object$assign2.transform = "", _Object$assign2));
  }
  function computeStyles(_ref5) {
    var state = _ref5.state, options = _ref5.options;
    var _options$gpuAccelerat = options.gpuAcceleration, gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat, _options$adaptive = options.adaptive, adaptive = _options$adaptive === void 0 ? true : _options$adaptive, _options$roundOffsets = options.roundOffsets, roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;
    var commonStyles = {
      placement: getBasePlacement(state.placement),
      variation: getVariation(state.placement),
      popper: state.elements.popper,
      popperRect: state.rects.popper,
      gpuAcceleration,
      isFixed: state.options.strategy === "fixed"
    };
    if (state.modifiersData.popperOffsets != null) {
      state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
        offsets: state.modifiersData.popperOffsets,
        position: state.options.strategy,
        adaptive,
        roundOffsets
      })));
    }
    if (state.modifiersData.arrow != null) {
      state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
        offsets: state.modifiersData.arrow,
        position: "absolute",
        adaptive: false,
        roundOffsets
      })));
    }
    state.attributes.popper = Object.assign({}, state.attributes.popper, {
      "data-popper-placement": state.placement
    });
  }
  var unsetSides, computeStyles_default;
  var init_computeStyles = __esm({
    "node_modules/@popperjs/core/lib/modifiers/computeStyles.js"() {
      init_enums();
      init_getOffsetParent();
      init_getWindow();
      init_getDocumentElement();
      init_getComputedStyle();
      init_getBasePlacement();
      init_getVariation();
      init_math();
      unsetSides = {
        top: "auto",
        right: "auto",
        bottom: "auto",
        left: "auto"
      };
      computeStyles_default = {
        name: "computeStyles",
        enabled: true,
        phase: "beforeWrite",
        fn: computeStyles,
        data: {}
      };
    }
  });

  // node_modules/@popperjs/core/lib/modifiers/eventListeners.js
  function effect3(_ref) {
    var state = _ref.state, instance = _ref.instance, options = _ref.options;
    var _options$scroll = options.scroll, scroll = _options$scroll === void 0 ? true : _options$scroll, _options$resize = options.resize, resize = _options$resize === void 0 ? true : _options$resize;
    var window2 = getWindow(state.elements.popper);
    var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);
    if (scroll) {
      scrollParents.forEach(function(scrollParent) {
        scrollParent.addEventListener("scroll", instance.update, passive);
      });
    }
    if (resize) {
      window2.addEventListener("resize", instance.update, passive);
    }
    return function() {
      if (scroll) {
        scrollParents.forEach(function(scrollParent) {
          scrollParent.removeEventListener("scroll", instance.update, passive);
        });
      }
      if (resize) {
        window2.removeEventListener("resize", instance.update, passive);
      }
    };
  }
  var passive, eventListeners_default;
  var init_eventListeners = __esm({
    "node_modules/@popperjs/core/lib/modifiers/eventListeners.js"() {
      init_getWindow();
      passive = {
        passive: true
      };
      eventListeners_default = {
        name: "eventListeners",
        enabled: true,
        phase: "write",
        fn: function fn() {
        },
        effect: effect3,
        data: {}
      };
    }
  });

  // node_modules/@popperjs/core/lib/utils/getOppositePlacement.js
  function getOppositePlacement(placement) {
    return placement.replace(/left|right|bottom|top/g, function(matched) {
      return hash[matched];
    });
  }
  var hash;
  var init_getOppositePlacement = __esm({
    "node_modules/@popperjs/core/lib/utils/getOppositePlacement.js"() {
      hash = {
        left: "right",
        right: "left",
        bottom: "top",
        top: "bottom"
      };
    }
  });

  // node_modules/@popperjs/core/lib/utils/getOppositeVariationPlacement.js
  function getOppositeVariationPlacement(placement) {
    return placement.replace(/start|end/g, function(matched) {
      return hash2[matched];
    });
  }
  var hash2;
  var init_getOppositeVariationPlacement = __esm({
    "node_modules/@popperjs/core/lib/utils/getOppositeVariationPlacement.js"() {
      hash2 = {
        start: "end",
        end: "start"
      };
    }
  });

  // node_modules/@popperjs/core/lib/dom-utils/getWindowScroll.js
  function getWindowScroll(node) {
    var win = getWindow(node);
    var scrollLeft = win.pageXOffset;
    var scrollTop = win.pageYOffset;
    return {
      scrollLeft,
      scrollTop
    };
  }
  var init_getWindowScroll = __esm({
    "node_modules/@popperjs/core/lib/dom-utils/getWindowScroll.js"() {
      init_getWindow();
    }
  });

  // node_modules/@popperjs/core/lib/dom-utils/getWindowScrollBarX.js
  function getWindowScrollBarX(element) {
    return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
  }
  var init_getWindowScrollBarX = __esm({
    "node_modules/@popperjs/core/lib/dom-utils/getWindowScrollBarX.js"() {
      init_getBoundingClientRect();
      init_getDocumentElement();
      init_getWindowScroll();
    }
  });

  // node_modules/@popperjs/core/lib/dom-utils/getViewportRect.js
  function getViewportRect(element, strategy) {
    var win = getWindow(element);
    var html = getDocumentElement(element);
    var visualViewport = win.visualViewport;
    var width = html.clientWidth;
    var height = html.clientHeight;
    var x = 0;
    var y = 0;
    if (visualViewport) {
      width = visualViewport.width;
      height = visualViewport.height;
      var layoutViewport = isLayoutViewport();
      if (layoutViewport || !layoutViewport && strategy === "fixed") {
        x = visualViewport.offsetLeft;
        y = visualViewport.offsetTop;
      }
    }
    return {
      width,
      height,
      x: x + getWindowScrollBarX(element),
      y
    };
  }
  var init_getViewportRect = __esm({
    "node_modules/@popperjs/core/lib/dom-utils/getViewportRect.js"() {
      init_getWindow();
      init_getDocumentElement();
      init_getWindowScrollBarX();
      init_isLayoutViewport();
    }
  });

  // node_modules/@popperjs/core/lib/dom-utils/getDocumentRect.js
  function getDocumentRect(element) {
    var _element$ownerDocumen;
    var html = getDocumentElement(element);
    var winScroll = getWindowScroll(element);
    var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
    var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
    var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
    var x = -winScroll.scrollLeft + getWindowScrollBarX(element);
    var y = -winScroll.scrollTop;
    if (getComputedStyle2(body || html).direction === "rtl") {
      x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
    }
    return {
      width,
      height,
      x,
      y
    };
  }
  var init_getDocumentRect = __esm({
    "node_modules/@popperjs/core/lib/dom-utils/getDocumentRect.js"() {
      init_getDocumentElement();
      init_getComputedStyle();
      init_getWindowScrollBarX();
      init_getWindowScroll();
      init_math();
    }
  });

  // node_modules/@popperjs/core/lib/dom-utils/isScrollParent.js
  function isScrollParent(element) {
    var _getComputedStyle = getComputedStyle2(element), overflow = _getComputedStyle.overflow, overflowX = _getComputedStyle.overflowX, overflowY = _getComputedStyle.overflowY;
    return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
  }
  var init_isScrollParent = __esm({
    "node_modules/@popperjs/core/lib/dom-utils/isScrollParent.js"() {
      init_getComputedStyle();
    }
  });

  // node_modules/@popperjs/core/lib/dom-utils/getScrollParent.js
  function getScrollParent(node) {
    if (["html", "body", "#document"].indexOf(getNodeName(node)) >= 0) {
      return node.ownerDocument.body;
    }
    if (isHTMLElement(node) && isScrollParent(node)) {
      return node;
    }
    return getScrollParent(getParentNode(node));
  }
  var init_getScrollParent = __esm({
    "node_modules/@popperjs/core/lib/dom-utils/getScrollParent.js"() {
      init_getParentNode();
      init_isScrollParent();
      init_getNodeName();
      init_instanceOf();
    }
  });

  // node_modules/@popperjs/core/lib/dom-utils/listScrollParents.js
  function listScrollParents(element, list) {
    var _element$ownerDocumen;
    if (list === void 0) {
      list = [];
    }
    var scrollParent = getScrollParent(element);
    var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
    var win = getWindow(scrollParent);
    var target2 = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
    var updatedList = list.concat(target2);
    return isBody ? updatedList : (
      // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
      updatedList.concat(listScrollParents(getParentNode(target2)))
    );
  }
  var init_listScrollParents = __esm({
    "node_modules/@popperjs/core/lib/dom-utils/listScrollParents.js"() {
      init_getScrollParent();
      init_getParentNode();
      init_getWindow();
      init_isScrollParent();
    }
  });

  // node_modules/@popperjs/core/lib/utils/rectToClientRect.js
  function rectToClientRect(rect) {
    return Object.assign({}, rect, {
      left: rect.x,
      top: rect.y,
      right: rect.x + rect.width,
      bottom: rect.y + rect.height
    });
  }
  var init_rectToClientRect = __esm({
    "node_modules/@popperjs/core/lib/utils/rectToClientRect.js"() {
    }
  });

  // node_modules/@popperjs/core/lib/dom-utils/getClippingRect.js
  function getInnerBoundingClientRect(element, strategy) {
    var rect = getBoundingClientRect(element, false, strategy === "fixed");
    rect.top = rect.top + element.clientTop;
    rect.left = rect.left + element.clientLeft;
    rect.bottom = rect.top + element.clientHeight;
    rect.right = rect.left + element.clientWidth;
    rect.width = element.clientWidth;
    rect.height = element.clientHeight;
    rect.x = rect.left;
    rect.y = rect.top;
    return rect;
  }
  function getClientRectFromMixedType(element, clippingParent, strategy) {
    return clippingParent === viewport ? rectToClientRect(getViewportRect(element, strategy)) : isElement(clippingParent) ? getInnerBoundingClientRect(clippingParent, strategy) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
  }
  function getClippingParents(element) {
    var clippingParents2 = listScrollParents(getParentNode(element));
    var canEscapeClipping = ["absolute", "fixed"].indexOf(getComputedStyle2(element).position) >= 0;
    var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;
    if (!isElement(clipperElement)) {
      return [];
    }
    return clippingParents2.filter(function(clippingParent) {
      return isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== "body";
    });
  }
  function getClippingRect(element, boundary, rootBoundary, strategy) {
    var mainClippingParents = boundary === "clippingParents" ? getClippingParents(element) : [].concat(boundary);
    var clippingParents2 = [].concat(mainClippingParents, [rootBoundary]);
    var firstClippingParent = clippingParents2[0];
    var clippingRect = clippingParents2.reduce(function(accRect, clippingParent) {
      var rect = getClientRectFromMixedType(element, clippingParent, strategy);
      accRect.top = max(rect.top, accRect.top);
      accRect.right = min(rect.right, accRect.right);
      accRect.bottom = min(rect.bottom, accRect.bottom);
      accRect.left = max(rect.left, accRect.left);
      return accRect;
    }, getClientRectFromMixedType(element, firstClippingParent, strategy));
    clippingRect.width = clippingRect.right - clippingRect.left;
    clippingRect.height = clippingRect.bottom - clippingRect.top;
    clippingRect.x = clippingRect.left;
    clippingRect.y = clippingRect.top;
    return clippingRect;
  }
  var init_getClippingRect = __esm({
    "node_modules/@popperjs/core/lib/dom-utils/getClippingRect.js"() {
      init_enums();
      init_getViewportRect();
      init_getDocumentRect();
      init_listScrollParents();
      init_getOffsetParent();
      init_getDocumentElement();
      init_getComputedStyle();
      init_instanceOf();
      init_getBoundingClientRect();
      init_getParentNode();
      init_contains();
      init_getNodeName();
      init_rectToClientRect();
      init_math();
    }
  });

  // node_modules/@popperjs/core/lib/utils/computeOffsets.js
  function computeOffsets(_ref) {
    var reference2 = _ref.reference, element = _ref.element, placement = _ref.placement;
    var basePlacement = placement ? getBasePlacement(placement) : null;
    var variation = placement ? getVariation(placement) : null;
    var commonX = reference2.x + reference2.width / 2 - element.width / 2;
    var commonY = reference2.y + reference2.height / 2 - element.height / 2;
    var offsets;
    switch (basePlacement) {
      case top:
        offsets = {
          x: commonX,
          y: reference2.y - element.height
        };
        break;
      case bottom:
        offsets = {
          x: commonX,
          y: reference2.y + reference2.height
        };
        break;
      case right:
        offsets = {
          x: reference2.x + reference2.width,
          y: commonY
        };
        break;
      case left:
        offsets = {
          x: reference2.x - element.width,
          y: commonY
        };
        break;
      default:
        offsets = {
          x: reference2.x,
          y: reference2.y
        };
    }
    var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;
    if (mainAxis != null) {
      var len = mainAxis === "y" ? "height" : "width";
      switch (variation) {
        case start:
          offsets[mainAxis] = offsets[mainAxis] - (reference2[len] / 2 - element[len] / 2);
          break;
        case end:
          offsets[mainAxis] = offsets[mainAxis] + (reference2[len] / 2 - element[len] / 2);
          break;
        default:
      }
    }
    return offsets;
  }
  var init_computeOffsets = __esm({
    "node_modules/@popperjs/core/lib/utils/computeOffsets.js"() {
      init_getBasePlacement();
      init_getVariation();
      init_getMainAxisFromPlacement();
      init_enums();
    }
  });

  // node_modules/@popperjs/core/lib/utils/detectOverflow.js
  function detectOverflow(state, options) {
    if (options === void 0) {
      options = {};
    }
    var _options = options, _options$placement = _options.placement, placement = _options$placement === void 0 ? state.placement : _options$placement, _options$strategy = _options.strategy, strategy = _options$strategy === void 0 ? state.strategy : _options$strategy, _options$boundary = _options.boundary, boundary = _options$boundary === void 0 ? clippingParents : _options$boundary, _options$rootBoundary = _options.rootBoundary, rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary, _options$elementConte = _options.elementContext, elementContext = _options$elementConte === void 0 ? popper : _options$elementConte, _options$altBoundary = _options.altBoundary, altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary, _options$padding = _options.padding, padding = _options$padding === void 0 ? 0 : _options$padding;
    var paddingObject = mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
    var altContext = elementContext === popper ? reference : popper;
    var popperRect = state.rects.popper;
    var element = state.elements[altBoundary ? altContext : elementContext];
    var clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary, strategy);
    var referenceClientRect = getBoundingClientRect(state.elements.reference);
    var popperOffsets2 = computeOffsets({
      reference: referenceClientRect,
      element: popperRect,
      strategy: "absolute",
      placement
    });
    var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets2));
    var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect;
    var overflowOffsets = {
      top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
      bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
      left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
      right: elementClientRect.right - clippingClientRect.right + paddingObject.right
    };
    var offsetData = state.modifiersData.offset;
    if (elementContext === popper && offsetData) {
      var offset2 = offsetData[placement];
      Object.keys(overflowOffsets).forEach(function(key) {
        var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
        var axis = [top, bottom].indexOf(key) >= 0 ? "y" : "x";
        overflowOffsets[key] += offset2[axis] * multiply;
      });
    }
    return overflowOffsets;
  }
  var init_detectOverflow = __esm({
    "node_modules/@popperjs/core/lib/utils/detectOverflow.js"() {
      init_getClippingRect();
      init_getDocumentElement();
      init_getBoundingClientRect();
      init_computeOffsets();
      init_rectToClientRect();
      init_enums();
      init_instanceOf();
      init_mergePaddingObject();
      init_expandToHashMap();
    }
  });

  // node_modules/@popperjs/core/lib/utils/computeAutoPlacement.js
  function computeAutoPlacement(state, options) {
    if (options === void 0) {
      options = {};
    }
    var _options = options, placement = _options.placement, boundary = _options.boundary, rootBoundary = _options.rootBoundary, padding = _options.padding, flipVariations = _options.flipVariations, _options$allowedAutoP = _options.allowedAutoPlacements, allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
    var variation = getVariation(placement);
    var placements2 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function(placement2) {
      return getVariation(placement2) === variation;
    }) : basePlacements;
    var allowedPlacements = placements2.filter(function(placement2) {
      return allowedAutoPlacements.indexOf(placement2) >= 0;
    });
    if (allowedPlacements.length === 0) {
      allowedPlacements = placements2;
    }
    var overflows = allowedPlacements.reduce(function(acc, placement2) {
      acc[placement2] = detectOverflow(state, {
        placement: placement2,
        boundary,
        rootBoundary,
        padding
      })[getBasePlacement(placement2)];
      return acc;
    }, {});
    return Object.keys(overflows).sort(function(a, b) {
      return overflows[a] - overflows[b];
    });
  }
  var init_computeAutoPlacement = __esm({
    "node_modules/@popperjs/core/lib/utils/computeAutoPlacement.js"() {
      init_getVariation();
      init_enums();
      init_detectOverflow();
      init_getBasePlacement();
    }
  });

  // node_modules/@popperjs/core/lib/modifiers/flip.js
  function getExpandedFallbackPlacements(placement) {
    if (getBasePlacement(placement) === auto) {
      return [];
    }
    var oppositePlacement = getOppositePlacement(placement);
    return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
  }
  function flip(_ref) {
    var state = _ref.state, options = _ref.options, name = _ref.name;
    if (state.modifiersData[name]._skip) {
      return;
    }
    var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis, specifiedFallbackPlacements = options.fallbackPlacements, padding = options.padding, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, _options$flipVariatio = options.flipVariations, flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio, allowedAutoPlacements = options.allowedAutoPlacements;
    var preferredPlacement = state.options.placement;
    var basePlacement = getBasePlacement(preferredPlacement);
    var isBasePlacement = basePlacement === preferredPlacement;
    var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
    var placements2 = [preferredPlacement].concat(fallbackPlacements).reduce(function(acc, placement2) {
      return acc.concat(getBasePlacement(placement2) === auto ? computeAutoPlacement(state, {
        placement: placement2,
        boundary,
        rootBoundary,
        padding,
        flipVariations,
        allowedAutoPlacements
      }) : placement2);
    }, []);
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var checksMap = /* @__PURE__ */ new Map();
    var makeFallbackChecks = true;
    var firstFittingPlacement = placements2[0];
    for (var i = 0; i < placements2.length; i++) {
      var placement = placements2[i];
      var _basePlacement = getBasePlacement(placement);
      var isStartVariation = getVariation(placement) === start;
      var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
      var len = isVertical ? "width" : "height";
      var overflow = detectOverflow(state, {
        placement,
        boundary,
        rootBoundary,
        altBoundary,
        padding
      });
      var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;
      if (referenceRect[len] > popperRect[len]) {
        mainVariationSide = getOppositePlacement(mainVariationSide);
      }
      var altVariationSide = getOppositePlacement(mainVariationSide);
      var checks = [];
      if (checkMainAxis) {
        checks.push(overflow[_basePlacement] <= 0);
      }
      if (checkAltAxis) {
        checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
      }
      if (checks.every(function(check) {
        return check;
      })) {
        firstFittingPlacement = placement;
        makeFallbackChecks = false;
        break;
      }
      checksMap.set(placement, checks);
    }
    if (makeFallbackChecks) {
      var numberOfChecks = flipVariations ? 3 : 1;
      var _loop = function _loop2(_i2) {
        var fittingPlacement = placements2.find(function(placement2) {
          var checks2 = checksMap.get(placement2);
          if (checks2) {
            return checks2.slice(0, _i2).every(function(check) {
              return check;
            });
          }
        });
        if (fittingPlacement) {
          firstFittingPlacement = fittingPlacement;
          return "break";
        }
      };
      for (var _i = numberOfChecks; _i > 0; _i--) {
        var _ret = _loop(_i);
        if (_ret === "break") break;
      }
    }
    if (state.placement !== firstFittingPlacement) {
      state.modifiersData[name]._skip = true;
      state.placement = firstFittingPlacement;
      state.reset = true;
    }
  }
  var flip_default;
  var init_flip = __esm({
    "node_modules/@popperjs/core/lib/modifiers/flip.js"() {
      init_getOppositePlacement();
      init_getBasePlacement();
      init_getOppositeVariationPlacement();
      init_detectOverflow();
      init_computeAutoPlacement();
      init_enums();
      init_getVariation();
      flip_default = {
        name: "flip",
        enabled: true,
        phase: "main",
        fn: flip,
        requiresIfExists: ["offset"],
        data: {
          _skip: false
        }
      };
    }
  });

  // node_modules/@popperjs/core/lib/modifiers/hide.js
  function getSideOffsets(overflow, rect, preventedOffsets) {
    if (preventedOffsets === void 0) {
      preventedOffsets = {
        x: 0,
        y: 0
      };
    }
    return {
      top: overflow.top - rect.height - preventedOffsets.y,
      right: overflow.right - rect.width + preventedOffsets.x,
      bottom: overflow.bottom - rect.height + preventedOffsets.y,
      left: overflow.left - rect.width - preventedOffsets.x
    };
  }
  function isAnySideFullyClipped(overflow) {
    return [top, right, bottom, left].some(function(side) {
      return overflow[side] >= 0;
    });
  }
  function hide(_ref) {
    var state = _ref.state, name = _ref.name;
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var preventedOffsets = state.modifiersData.preventOverflow;
    var referenceOverflow = detectOverflow(state, {
      elementContext: "reference"
    });
    var popperAltOverflow = detectOverflow(state, {
      altBoundary: true
    });
    var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
    var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
    var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
    var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
    state.modifiersData[name] = {
      referenceClippingOffsets,
      popperEscapeOffsets,
      isReferenceHidden,
      hasPopperEscaped
    };
    state.attributes.popper = Object.assign({}, state.attributes.popper, {
      "data-popper-reference-hidden": isReferenceHidden,
      "data-popper-escaped": hasPopperEscaped
    });
  }
  var hide_default;
  var init_hide = __esm({
    "node_modules/@popperjs/core/lib/modifiers/hide.js"() {
      init_enums();
      init_detectOverflow();
      hide_default = {
        name: "hide",
        enabled: true,
        phase: "main",
        requiresIfExists: ["preventOverflow"],
        fn: hide
      };
    }
  });

  // node_modules/@popperjs/core/lib/modifiers/offset.js
  function distanceAndSkiddingToXY(placement, rects, offset2) {
    var basePlacement = getBasePlacement(placement);
    var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;
    var _ref = typeof offset2 === "function" ? offset2(Object.assign({}, rects, {
      placement
    })) : offset2, skidding = _ref[0], distance = _ref[1];
    skidding = skidding || 0;
    distance = (distance || 0) * invertDistance;
    return [left, right].indexOf(basePlacement) >= 0 ? {
      x: distance,
      y: skidding
    } : {
      x: skidding,
      y: distance
    };
  }
  function offset(_ref2) {
    var state = _ref2.state, options = _ref2.options, name = _ref2.name;
    var _options$offset = options.offset, offset2 = _options$offset === void 0 ? [0, 0] : _options$offset;
    var data = placements.reduce(function(acc, placement) {
      acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset2);
      return acc;
    }, {});
    var _data$state$placement = data[state.placement], x = _data$state$placement.x, y = _data$state$placement.y;
    if (state.modifiersData.popperOffsets != null) {
      state.modifiersData.popperOffsets.x += x;
      state.modifiersData.popperOffsets.y += y;
    }
    state.modifiersData[name] = data;
  }
  var offset_default;
  var init_offset = __esm({
    "node_modules/@popperjs/core/lib/modifiers/offset.js"() {
      init_getBasePlacement();
      init_enums();
      offset_default = {
        name: "offset",
        enabled: true,
        phase: "main",
        requires: ["popperOffsets"],
        fn: offset
      };
    }
  });

  // node_modules/@popperjs/core/lib/modifiers/popperOffsets.js
  function popperOffsets(_ref) {
    var state = _ref.state, name = _ref.name;
    state.modifiersData[name] = computeOffsets({
      reference: state.rects.reference,
      element: state.rects.popper,
      strategy: "absolute",
      placement: state.placement
    });
  }
  var popperOffsets_default;
  var init_popperOffsets = __esm({
    "node_modules/@popperjs/core/lib/modifiers/popperOffsets.js"() {
      init_computeOffsets();
      popperOffsets_default = {
        name: "popperOffsets",
        enabled: true,
        phase: "read",
        fn: popperOffsets,
        data: {}
      };
    }
  });

  // node_modules/@popperjs/core/lib/utils/getAltAxis.js
  function getAltAxis(axis) {
    return axis === "x" ? "y" : "x";
  }
  var init_getAltAxis = __esm({
    "node_modules/@popperjs/core/lib/utils/getAltAxis.js"() {
    }
  });

  // node_modules/@popperjs/core/lib/modifiers/preventOverflow.js
  function preventOverflow(_ref) {
    var state = _ref.state, options = _ref.options, name = _ref.name;
    var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, padding = options.padding, _options$tether = options.tether, tether = _options$tether === void 0 ? true : _options$tether, _options$tetherOffset = options.tetherOffset, tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
    var overflow = detectOverflow(state, {
      boundary,
      rootBoundary,
      padding,
      altBoundary
    });
    var basePlacement = getBasePlacement(state.placement);
    var variation = getVariation(state.placement);
    var isBasePlacement = !variation;
    var mainAxis = getMainAxisFromPlacement(basePlacement);
    var altAxis = getAltAxis(mainAxis);
    var popperOffsets2 = state.modifiersData.popperOffsets;
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var tetherOffsetValue = typeof tetherOffset === "function" ? tetherOffset(Object.assign({}, state.rects, {
      placement: state.placement
    })) : tetherOffset;
    var normalizedTetherOffsetValue = typeof tetherOffsetValue === "number" ? {
      mainAxis: tetherOffsetValue,
      altAxis: tetherOffsetValue
    } : Object.assign({
      mainAxis: 0,
      altAxis: 0
    }, tetherOffsetValue);
    var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
    var data = {
      x: 0,
      y: 0
    };
    if (!popperOffsets2) {
      return;
    }
    if (checkMainAxis) {
      var _offsetModifierState$;
      var mainSide = mainAxis === "y" ? top : left;
      var altSide = mainAxis === "y" ? bottom : right;
      var len = mainAxis === "y" ? "height" : "width";
      var offset2 = popperOffsets2[mainAxis];
      var min2 = offset2 + overflow[mainSide];
      var max2 = offset2 - overflow[altSide];
      var additive = tether ? -popperRect[len] / 2 : 0;
      var minLen = variation === start ? referenceRect[len] : popperRect[len];
      var maxLen = variation === start ? -popperRect[len] : -referenceRect[len];
      var arrowElement = state.elements.arrow;
      var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
        width: 0,
        height: 0
      };
      var arrowPaddingObject = state.modifiersData["arrow#persistent"] ? state.modifiersData["arrow#persistent"].padding : getFreshSideObject();
      var arrowPaddingMin = arrowPaddingObject[mainSide];
      var arrowPaddingMax = arrowPaddingObject[altSide];
      var arrowLen = within(0, referenceRect[len], arrowRect[len]);
      var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
      var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
      var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
      var clientOffset = arrowOffsetParent ? mainAxis === "y" ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
      var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
      var tetherMin = offset2 + minOffset - offsetModifierValue - clientOffset;
      var tetherMax = offset2 + maxOffset - offsetModifierValue;
      var preventedOffset = within(tether ? min(min2, tetherMin) : min2, offset2, tether ? max(max2, tetherMax) : max2);
      popperOffsets2[mainAxis] = preventedOffset;
      data[mainAxis] = preventedOffset - offset2;
    }
    if (checkAltAxis) {
      var _offsetModifierState$2;
      var _mainSide = mainAxis === "x" ? top : left;
      var _altSide = mainAxis === "x" ? bottom : right;
      var _offset = popperOffsets2[altAxis];
      var _len = altAxis === "y" ? "height" : "width";
      var _min = _offset + overflow[_mainSide];
      var _max = _offset - overflow[_altSide];
      var isOriginSide = [top, left].indexOf(basePlacement) !== -1;
      var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;
      var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;
      var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;
      var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);
      popperOffsets2[altAxis] = _preventedOffset;
      data[altAxis] = _preventedOffset - _offset;
    }
    state.modifiersData[name] = data;
  }
  var preventOverflow_default;
  var init_preventOverflow = __esm({
    "node_modules/@popperjs/core/lib/modifiers/preventOverflow.js"() {
      init_enums();
      init_getBasePlacement();
      init_getMainAxisFromPlacement();
      init_getAltAxis();
      init_within();
      init_getLayoutRect();
      init_getOffsetParent();
      init_detectOverflow();
      init_getVariation();
      init_getFreshSideObject();
      init_math();
      preventOverflow_default = {
        name: "preventOverflow",
        enabled: true,
        phase: "main",
        fn: preventOverflow,
        requiresIfExists: ["offset"]
      };
    }
  });

  // node_modules/@popperjs/core/lib/modifiers/index.js
  var init_modifiers = __esm({
    "node_modules/@popperjs/core/lib/modifiers/index.js"() {
      init_applyStyles();
    }
  });

  // node_modules/@popperjs/core/lib/dom-utils/getHTMLElementScroll.js
  function getHTMLElementScroll(element) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }
  var init_getHTMLElementScroll = __esm({
    "node_modules/@popperjs/core/lib/dom-utils/getHTMLElementScroll.js"() {
    }
  });

  // node_modules/@popperjs/core/lib/dom-utils/getNodeScroll.js
  function getNodeScroll(node) {
    if (node === getWindow(node) || !isHTMLElement(node)) {
      return getWindowScroll(node);
    } else {
      return getHTMLElementScroll(node);
    }
  }
  var init_getNodeScroll = __esm({
    "node_modules/@popperjs/core/lib/dom-utils/getNodeScroll.js"() {
      init_getWindowScroll();
      init_getWindow();
      init_instanceOf();
      init_getHTMLElementScroll();
    }
  });

  // node_modules/@popperjs/core/lib/dom-utils/getCompositeRect.js
  function isElementScaled(element) {
    var rect = element.getBoundingClientRect();
    var scaleX = round(rect.width) / element.offsetWidth || 1;
    var scaleY = round(rect.height) / element.offsetHeight || 1;
    return scaleX !== 1 || scaleY !== 1;
  }
  function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
    if (isFixed === void 0) {
      isFixed = false;
    }
    var isOffsetParentAnElement = isHTMLElement(offsetParent);
    var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
    var documentElement = getDocumentElement(offsetParent);
    var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled, isFixed);
    var scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    var offsets = {
      x: 0,
      y: 0
    };
    if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
      if (getNodeName(offsetParent) !== "body" || // https://github.com/popperjs/popper-core/issues/1078
      isScrollParent(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isHTMLElement(offsetParent)) {
        offsets = getBoundingClientRect(offsetParent, true);
        offsets.x += offsetParent.clientLeft;
        offsets.y += offsetParent.clientTop;
      } else if (documentElement) {
        offsets.x = getWindowScrollBarX(documentElement);
      }
    }
    return {
      x: rect.left + scroll.scrollLeft - offsets.x,
      y: rect.top + scroll.scrollTop - offsets.y,
      width: rect.width,
      height: rect.height
    };
  }
  var init_getCompositeRect = __esm({
    "node_modules/@popperjs/core/lib/dom-utils/getCompositeRect.js"() {
      init_getBoundingClientRect();
      init_getNodeScroll();
      init_getNodeName();
      init_instanceOf();
      init_getWindowScrollBarX();
      init_getDocumentElement();
      init_isScrollParent();
      init_math();
    }
  });

  // node_modules/@popperjs/core/lib/utils/orderModifiers.js
  function order(modifiers) {
    var map = /* @__PURE__ */ new Map();
    var visited = /* @__PURE__ */ new Set();
    var result = [];
    modifiers.forEach(function(modifier) {
      map.set(modifier.name, modifier);
    });
    function sort(modifier) {
      visited.add(modifier.name);
      var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
      requires.forEach(function(dep) {
        if (!visited.has(dep)) {
          var depModifier = map.get(dep);
          if (depModifier) {
            sort(depModifier);
          }
        }
      });
      result.push(modifier);
    }
    modifiers.forEach(function(modifier) {
      if (!visited.has(modifier.name)) {
        sort(modifier);
      }
    });
    return result;
  }
  function orderModifiers(modifiers) {
    var orderedModifiers = order(modifiers);
    return modifierPhases.reduce(function(acc, phase) {
      return acc.concat(orderedModifiers.filter(function(modifier) {
        return modifier.phase === phase;
      }));
    }, []);
  }
  var init_orderModifiers = __esm({
    "node_modules/@popperjs/core/lib/utils/orderModifiers.js"() {
      init_enums();
    }
  });

  // node_modules/@popperjs/core/lib/utils/debounce.js
  function debounce(fn2) {
    var pending;
    return function() {
      if (!pending) {
        pending = new Promise(function(resolve) {
          Promise.resolve().then(function() {
            pending = void 0;
            resolve(fn2());
          });
        });
      }
      return pending;
    };
  }
  var init_debounce = __esm({
    "node_modules/@popperjs/core/lib/utils/debounce.js"() {
    }
  });

  // node_modules/@popperjs/core/lib/utils/mergeByName.js
  function mergeByName(modifiers) {
    var merged = modifiers.reduce(function(merged2, current) {
      var existing = merged2[current.name];
      merged2[current.name] = existing ? Object.assign({}, existing, current, {
        options: Object.assign({}, existing.options, current.options),
        data: Object.assign({}, existing.data, current.data)
      }) : current;
      return merged2;
    }, {});
    return Object.keys(merged).map(function(key) {
      return merged[key];
    });
  }
  var init_mergeByName = __esm({
    "node_modules/@popperjs/core/lib/utils/mergeByName.js"() {
    }
  });

  // node_modules/@popperjs/core/lib/createPopper.js
  function areValidElements() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return !args.some(function(element) {
      return !(element && typeof element.getBoundingClientRect === "function");
    });
  }
  function popperGenerator(generatorOptions) {
    if (generatorOptions === void 0) {
      generatorOptions = {};
    }
    var _generatorOptions = generatorOptions, _generatorOptions$def = _generatorOptions.defaultModifiers, defaultModifiers2 = _generatorOptions$def === void 0 ? [] : _generatorOptions$def, _generatorOptions$def2 = _generatorOptions.defaultOptions, defaultOptions = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
    return function createPopper2(reference2, popper2, options) {
      if (options === void 0) {
        options = defaultOptions;
      }
      var state = {
        placement: "bottom",
        orderedModifiers: [],
        options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
        modifiersData: {},
        elements: {
          reference: reference2,
          popper: popper2
        },
        attributes: {},
        styles: {}
      };
      var effectCleanupFns = [];
      var isDestroyed = false;
      var instance = {
        state,
        setOptions: function setOptions(setOptionsAction) {
          var options2 = typeof setOptionsAction === "function" ? setOptionsAction(state.options) : setOptionsAction;
          cleanupModifierEffects();
          state.options = Object.assign({}, defaultOptions, state.options, options2);
          state.scrollParents = {
            reference: isElement(reference2) ? listScrollParents(reference2) : reference2.contextElement ? listScrollParents(reference2.contextElement) : [],
            popper: listScrollParents(popper2)
          };
          var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers2, state.options.modifiers)));
          state.orderedModifiers = orderedModifiers.filter(function(m) {
            return m.enabled;
          });
          runModifierEffects();
          return instance.update();
        },
        // Sync update – it will always be executed, even if not necessary. This
        // is useful for low frequency updates where sync behavior simplifies the
        // logic.
        // For high frequency updates (e.g. `resize` and `scroll` events), always
        // prefer the async Popper#update method
        forceUpdate: function forceUpdate() {
          if (isDestroyed) {
            return;
          }
          var _state$elements = state.elements, reference3 = _state$elements.reference, popper3 = _state$elements.popper;
          if (!areValidElements(reference3, popper3)) {
            return;
          }
          state.rects = {
            reference: getCompositeRect(reference3, getOffsetParent(popper3), state.options.strategy === "fixed"),
            popper: getLayoutRect(popper3)
          };
          state.reset = false;
          state.placement = state.options.placement;
          state.orderedModifiers.forEach(function(modifier) {
            return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
          });
          for (var index = 0; index < state.orderedModifiers.length; index++) {
            if (state.reset === true) {
              state.reset = false;
              index = -1;
              continue;
            }
            var _state$orderedModifie = state.orderedModifiers[index], fn2 = _state$orderedModifie.fn, _state$orderedModifie2 = _state$orderedModifie.options, _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2, name = _state$orderedModifie.name;
            if (typeof fn2 === "function") {
              state = fn2({
                state,
                options: _options,
                name,
                instance
              }) || state;
            }
          }
        },
        // Async and optimistically optimized update – it will not be executed if
        // not necessary (debounced to run at most once-per-tick)
        update: debounce(function() {
          return new Promise(function(resolve) {
            instance.forceUpdate();
            resolve(state);
          });
        }),
        destroy: function destroy() {
          cleanupModifierEffects();
          isDestroyed = true;
        }
      };
      if (!areValidElements(reference2, popper2)) {
        return instance;
      }
      instance.setOptions(options).then(function(state2) {
        if (!isDestroyed && options.onFirstUpdate) {
          options.onFirstUpdate(state2);
        }
      });
      function runModifierEffects() {
        state.orderedModifiers.forEach(function(_ref) {
          var name = _ref.name, _ref$options = _ref.options, options2 = _ref$options === void 0 ? {} : _ref$options, effect5 = _ref.effect;
          if (typeof effect5 === "function") {
            var cleanupFn = effect5({
              state,
              name,
              instance,
              options: options2
            });
            var noopFn = function noopFn2() {
            };
            effectCleanupFns.push(cleanupFn || noopFn);
          }
        });
      }
      function cleanupModifierEffects() {
        effectCleanupFns.forEach(function(fn2) {
          return fn2();
        });
        effectCleanupFns = [];
      }
      return instance;
    };
  }
  var DEFAULT_OPTIONS;
  var init_createPopper = __esm({
    "node_modules/@popperjs/core/lib/createPopper.js"() {
      init_getCompositeRect();
      init_getLayoutRect();
      init_listScrollParents();
      init_getOffsetParent();
      init_orderModifiers();
      init_debounce();
      init_mergeByName();
      init_instanceOf();
      DEFAULT_OPTIONS = {
        placement: "bottom",
        modifiers: [],
        strategy: "absolute"
      };
    }
  });

  // node_modules/@popperjs/core/lib/popper.js
  var defaultModifiers, createPopper;
  var init_popper = __esm({
    "node_modules/@popperjs/core/lib/popper.js"() {
      init_createPopper();
      init_eventListeners();
      init_popperOffsets();
      init_computeStyles();
      init_applyStyles();
      init_offset();
      init_flip();
      init_preventOverflow();
      init_arrow();
      init_hide();
      init_modifiers();
      defaultModifiers = [eventListeners_default, popperOffsets_default, computeStyles_default, applyStyles_default, offset_default, flip_default, preventOverflow_default, arrow_default, hide_default];
      createPopper = /* @__PURE__ */ popperGenerator({
        defaultModifiers
      });
    }
  });

  // node_modules/@popperjs/core/lib/index.js
  var init_lib = __esm({
    "node_modules/@popperjs/core/lib/index.js"() {
      init_enums();
      init_modifiers();
      init_popper();
    }
  });

  // node_modules/tippy.js/dist/tippy.esm.js
  function hasOwnProperty(obj, key) {
    return {}.hasOwnProperty.call(obj, key);
  }
  function getValueAtIndexOrReturn(value, index, defaultValue) {
    if (Array.isArray(value)) {
      var v = value[index];
      return v == null ? Array.isArray(defaultValue) ? defaultValue[index] : defaultValue : v;
    }
    return value;
  }
  function isType(value, type) {
    var str = {}.toString.call(value);
    return str.indexOf("[object") === 0 && str.indexOf(type + "]") > -1;
  }
  function invokeWithArgsOrReturn(value, args) {
    return typeof value === "function" ? value.apply(void 0, args) : value;
  }
  function debounce2(fn2, ms) {
    if (ms === 0) {
      return fn2;
    }
    var timeout;
    return function(arg) {
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        fn2(arg);
      }, ms);
    };
  }
  function removeProperties(obj, keys) {
    var clone = Object.assign({}, obj);
    keys.forEach(function(key) {
      delete clone[key];
    });
    return clone;
  }
  function splitBySpaces(value) {
    return value.split(/\s+/).filter(Boolean);
  }
  function normalizeToArray(value) {
    return [].concat(value);
  }
  function pushIfUnique(arr, value) {
    if (arr.indexOf(value) === -1) {
      arr.push(value);
    }
  }
  function unique(arr) {
    return arr.filter(function(item, index) {
      return arr.indexOf(item) === index;
    });
  }
  function getBasePlacement2(placement) {
    return placement.split("-")[0];
  }
  function arrayFrom(value) {
    return [].slice.call(value);
  }
  function removeUndefinedProps(obj) {
    return Object.keys(obj).reduce(function(acc, key) {
      if (obj[key] !== void 0) {
        acc[key] = obj[key];
      }
      return acc;
    }, {});
  }
  function div() {
    return document.createElement("div");
  }
  function isElement2(value) {
    return ["Element", "Fragment"].some(function(type) {
      return isType(value, type);
    });
  }
  function isNodeList(value) {
    return isType(value, "NodeList");
  }
  function isMouseEvent(value) {
    return isType(value, "MouseEvent");
  }
  function isReferenceElement(value) {
    return !!(value && value._tippy && value._tippy.reference === value);
  }
  function getArrayOfElements(value) {
    if (isElement2(value)) {
      return [value];
    }
    if (isNodeList(value)) {
      return arrayFrom(value);
    }
    if (Array.isArray(value)) {
      return value;
    }
    return arrayFrom(document.querySelectorAll(value));
  }
  function setTransitionDuration(els, value) {
    els.forEach(function(el) {
      if (el) {
        el.style.transitionDuration = value + "ms";
      }
    });
  }
  function setVisibilityState(els, state) {
    els.forEach(function(el) {
      if (el) {
        el.setAttribute("data-state", state);
      }
    });
  }
  function getOwnerDocument(elementOrElements) {
    var _element$ownerDocumen;
    var _normalizeToArray = normalizeToArray(elementOrElements), element = _normalizeToArray[0];
    return element != null && (_element$ownerDocumen = element.ownerDocument) != null && _element$ownerDocumen.body ? element.ownerDocument : document;
  }
  function isCursorOutsideInteractiveBorder(popperTreeData, event) {
    var clientX = event.clientX, clientY = event.clientY;
    return popperTreeData.every(function(_ref) {
      var popperRect = _ref.popperRect, popperState = _ref.popperState, props = _ref.props;
      var interactiveBorder = props.interactiveBorder;
      var basePlacement = getBasePlacement2(popperState.placement);
      var offsetData = popperState.modifiersData.offset;
      if (!offsetData) {
        return true;
      }
      var topDistance = basePlacement === "bottom" ? offsetData.top.y : 0;
      var bottomDistance = basePlacement === "top" ? offsetData.bottom.y : 0;
      var leftDistance = basePlacement === "right" ? offsetData.left.x : 0;
      var rightDistance = basePlacement === "left" ? offsetData.right.x : 0;
      var exceedsTop = popperRect.top - clientY + topDistance > interactiveBorder;
      var exceedsBottom = clientY - popperRect.bottom - bottomDistance > interactiveBorder;
      var exceedsLeft = popperRect.left - clientX + leftDistance > interactiveBorder;
      var exceedsRight = clientX - popperRect.right - rightDistance > interactiveBorder;
      return exceedsTop || exceedsBottom || exceedsLeft || exceedsRight;
    });
  }
  function updateTransitionEndListener(box, action, listener) {
    var method = action + "EventListener";
    ["transitionend", "webkitTransitionEnd"].forEach(function(event) {
      box[method](event, listener);
    });
  }
  function actualContains(parent, child) {
    var target2 = child;
    while (target2) {
      var _target$getRootNode;
      if (parent.contains(target2)) {
        return true;
      }
      target2 = target2.getRootNode == null ? void 0 : (_target$getRootNode = target2.getRootNode()) == null ? void 0 : _target$getRootNode.host;
    }
    return false;
  }
  function onDocumentTouchStart() {
    if (currentInput.isTouch) {
      return;
    }
    currentInput.isTouch = true;
    if (window.performance) {
      document.addEventListener("mousemove", onDocumentMouseMove);
    }
  }
  function onDocumentMouseMove() {
    var now = performance.now();
    if (now - lastMouseMoveTime < 20) {
      currentInput.isTouch = false;
      document.removeEventListener("mousemove", onDocumentMouseMove);
    }
    lastMouseMoveTime = now;
  }
  function onWindowBlur() {
    var activeElement = document.activeElement;
    if (isReferenceElement(activeElement)) {
      var instance = activeElement._tippy;
      if (activeElement.blur && !instance.state.isVisible) {
        activeElement.blur();
      }
    }
  }
  function bindGlobalEventListeners() {
    document.addEventListener("touchstart", onDocumentTouchStart, TOUCH_OPTIONS);
    window.addEventListener("blur", onWindowBlur);
  }
  function createMemoryLeakWarning(method) {
    var txt = method === "destroy" ? "n already-" : " ";
    return [method + "() was called on a" + txt + "destroyed instance. This is a no-op but", "indicates a potential memory leak."].join(" ");
  }
  function clean(value) {
    var spacesAndTabs = /[ \t]{2,}/g;
    var lineStartWithSpaces = /^[ \t]*/gm;
    return value.replace(spacesAndTabs, " ").replace(lineStartWithSpaces, "").trim();
  }
  function getDevMessage(message) {
    return clean("\n  %ctippy.js\n\n  %c" + clean(message) + "\n\n  %c\u{1F477}\u200D This is a development-only message. It will be removed in production.\n  ");
  }
  function getFormattedMessage(message) {
    return [
      getDevMessage(message),
      // title
      "color: #00C584; font-size: 1.3em; font-weight: bold;",
      // message
      "line-height: 1.5",
      // footer
      "color: #a6a095;"
    ];
  }
  function resetVisitedMessages() {
    visitedMessages = /* @__PURE__ */ new Set();
  }
  function warnWhen(condition, message) {
    if (condition && !visitedMessages.has(message)) {
      var _console;
      visitedMessages.add(message);
      (_console = console).warn.apply(_console, getFormattedMessage(message));
    }
  }
  function errorWhen(condition, message) {
    if (condition && !visitedMessages.has(message)) {
      var _console2;
      visitedMessages.add(message);
      (_console2 = console).error.apply(_console2, getFormattedMessage(message));
    }
  }
  function validateTargets(targets) {
    var didPassFalsyValue = !targets;
    var didPassPlainObject = Object.prototype.toString.call(targets) === "[object Object]" && !targets.addEventListener;
    errorWhen(didPassFalsyValue, ["tippy() was passed", "`" + String(targets) + "`", "as its targets (first) argument. Valid types are: String, Element,", "Element[], or NodeList."].join(" "));
    errorWhen(didPassPlainObject, ["tippy() was passed a plain object which is not supported as an argument", "for virtual positioning. Use props.getReferenceClientRect instead."].join(" "));
  }
  function getExtendedPassedProps(passedProps) {
    var plugins = passedProps.plugins || [];
    var pluginProps2 = plugins.reduce(function(acc, plugin) {
      var name = plugin.name, defaultValue = plugin.defaultValue;
      if (name) {
        var _name;
        acc[name] = passedProps[name] !== void 0 ? passedProps[name] : (_name = defaultProps[name]) != null ? _name : defaultValue;
      }
      return acc;
    }, {});
    return Object.assign({}, passedProps, pluginProps2);
  }
  function getDataAttributeProps(reference2, plugins) {
    var propKeys = plugins ? Object.keys(getExtendedPassedProps(Object.assign({}, defaultProps, {
      plugins
    }))) : defaultKeys;
    var props = propKeys.reduce(function(acc, key) {
      var valueAsString = (reference2.getAttribute("data-tippy-" + key) || "").trim();
      if (!valueAsString) {
        return acc;
      }
      if (key === "content") {
        acc[key] = valueAsString;
      } else {
        try {
          acc[key] = JSON.parse(valueAsString);
        } catch (e) {
          acc[key] = valueAsString;
        }
      }
      return acc;
    }, {});
    return props;
  }
  function evaluateProps(reference2, props) {
    var out = Object.assign({}, props, {
      content: invokeWithArgsOrReturn(props.content, [reference2])
    }, props.ignoreAttributes ? {} : getDataAttributeProps(reference2, props.plugins));
    out.aria = Object.assign({}, defaultProps.aria, out.aria);
    out.aria = {
      expanded: out.aria.expanded === "auto" ? props.interactive : out.aria.expanded,
      content: out.aria.content === "auto" ? props.interactive ? null : "describedby" : out.aria.content
    };
    return out;
  }
  function validateProps(partialProps, plugins) {
    if (partialProps === void 0) {
      partialProps = {};
    }
    if (plugins === void 0) {
      plugins = [];
    }
    var keys = Object.keys(partialProps);
    keys.forEach(function(prop) {
      var nonPluginProps = removeProperties(defaultProps, Object.keys(pluginProps));
      var didPassUnknownProp = !hasOwnProperty(nonPluginProps, prop);
      if (didPassUnknownProp) {
        didPassUnknownProp = plugins.filter(function(plugin) {
          return plugin.name === prop;
        }).length === 0;
      }
      warnWhen(didPassUnknownProp, ["`" + prop + "`", "is not a valid prop. You may have spelled it incorrectly, or if it's", "a plugin, forgot to pass it in an array as props.plugins.", "\n\n", "All props: https://atomiks.github.io/tippyjs/v6/all-props/\n", "Plugins: https://atomiks.github.io/tippyjs/v6/plugins/"].join(" "));
    });
  }
  function dangerouslySetInnerHTML(element, html) {
    element[innerHTML()] = html;
  }
  function createArrowElement(value) {
    var arrow2 = div();
    if (value === true) {
      arrow2.className = ARROW_CLASS;
    } else {
      arrow2.className = SVG_ARROW_CLASS;
      if (isElement2(value)) {
        arrow2.appendChild(value);
      } else {
        dangerouslySetInnerHTML(arrow2, value);
      }
    }
    return arrow2;
  }
  function setContent(content, props) {
    if (isElement2(props.content)) {
      dangerouslySetInnerHTML(content, "");
      content.appendChild(props.content);
    } else if (typeof props.content !== "function") {
      if (props.allowHTML) {
        dangerouslySetInnerHTML(content, props.content);
      } else {
        content.textContent = props.content;
      }
    }
  }
  function getChildren(popper2) {
    var box = popper2.firstElementChild;
    var boxChildren = arrayFrom(box.children);
    return {
      box,
      content: boxChildren.find(function(node) {
        return node.classList.contains(CONTENT_CLASS);
      }),
      arrow: boxChildren.find(function(node) {
        return node.classList.contains(ARROW_CLASS) || node.classList.contains(SVG_ARROW_CLASS);
      }),
      backdrop: boxChildren.find(function(node) {
        return node.classList.contains(BACKDROP_CLASS);
      })
    };
  }
  function render(instance) {
    var popper2 = div();
    var box = div();
    box.className = BOX_CLASS;
    box.setAttribute("data-state", "hidden");
    box.setAttribute("tabindex", "-1");
    var content = div();
    content.className = CONTENT_CLASS;
    content.setAttribute("data-state", "hidden");
    setContent(content, instance.props);
    popper2.appendChild(box);
    box.appendChild(content);
    onUpdate(instance.props, instance.props);
    function onUpdate(prevProps, nextProps) {
      var _getChildren = getChildren(popper2), box2 = _getChildren.box, content2 = _getChildren.content, arrow2 = _getChildren.arrow;
      if (nextProps.theme) {
        box2.setAttribute("data-theme", nextProps.theme);
      } else {
        box2.removeAttribute("data-theme");
      }
      if (typeof nextProps.animation === "string") {
        box2.setAttribute("data-animation", nextProps.animation);
      } else {
        box2.removeAttribute("data-animation");
      }
      if (nextProps.inertia) {
        box2.setAttribute("data-inertia", "");
      } else {
        box2.removeAttribute("data-inertia");
      }
      box2.style.maxWidth = typeof nextProps.maxWidth === "number" ? nextProps.maxWidth + "px" : nextProps.maxWidth;
      if (nextProps.role) {
        box2.setAttribute("role", nextProps.role);
      } else {
        box2.removeAttribute("role");
      }
      if (prevProps.content !== nextProps.content || prevProps.allowHTML !== nextProps.allowHTML) {
        setContent(content2, instance.props);
      }
      if (nextProps.arrow) {
        if (!arrow2) {
          box2.appendChild(createArrowElement(nextProps.arrow));
        } else if (prevProps.arrow !== nextProps.arrow) {
          box2.removeChild(arrow2);
          box2.appendChild(createArrowElement(nextProps.arrow));
        }
      } else if (arrow2) {
        box2.removeChild(arrow2);
      }
    }
    return {
      popper: popper2,
      onUpdate
    };
  }
  function createTippy(reference2, passedProps) {
    var props = evaluateProps(reference2, Object.assign({}, defaultProps, getExtendedPassedProps(removeUndefinedProps(passedProps))));
    var showTimeout;
    var hideTimeout;
    var scheduleHideAnimationFrame;
    var isVisibleFromClick = false;
    var didHideDueToDocumentMouseDown = false;
    var didTouchMove = false;
    var ignoreOnFirstUpdate = false;
    var lastTriggerEvent;
    var currentTransitionEndListener;
    var onFirstUpdate;
    var listeners = [];
    var debouncedOnMouseMove = debounce2(onMouseMove, props.interactiveDebounce);
    var currentTarget;
    var id = idCounter++;
    var popperInstance = null;
    var plugins = unique(props.plugins);
    var state = {
      // Is the instance currently enabled?
      isEnabled: true,
      // Is the tippy currently showing and not transitioning out?
      isVisible: false,
      // Has the instance been destroyed?
      isDestroyed: false,
      // Is the tippy currently mounted to the DOM?
      isMounted: false,
      // Has the tippy finished transitioning in?
      isShown: false
    };
    var instance = {
      // properties
      id,
      reference: reference2,
      popper: div(),
      popperInstance,
      props,
      state,
      plugins,
      // methods
      clearDelayTimeouts,
      setProps,
      setContent: setContent2,
      show,
      hide: hide2,
      hideWithInteractivity,
      enable,
      disable,
      unmount,
      destroy
    };
    if (!props.render) {
      if (true) {
        errorWhen(true, "render() function has not been supplied.");
      }
      return instance;
    }
    var _props$render = props.render(instance), popper2 = _props$render.popper, onUpdate = _props$render.onUpdate;
    popper2.setAttribute("data-tippy-root", "");
    popper2.id = "tippy-" + instance.id;
    instance.popper = popper2;
    reference2._tippy = instance;
    popper2._tippy = instance;
    var pluginsHooks = plugins.map(function(plugin) {
      return plugin.fn(instance);
    });
    var hasAriaExpanded = reference2.hasAttribute("aria-expanded");
    addListeners();
    handleAriaExpandedAttribute();
    handleStyles();
    invokeHook("onCreate", [instance]);
    if (props.showOnCreate) {
      scheduleShow();
    }
    popper2.addEventListener("mouseenter", function() {
      if (instance.props.interactive && instance.state.isVisible) {
        instance.clearDelayTimeouts();
      }
    });
    popper2.addEventListener("mouseleave", function() {
      if (instance.props.interactive && instance.props.trigger.indexOf("mouseenter") >= 0) {
        getDocument().addEventListener("mousemove", debouncedOnMouseMove);
      }
    });
    return instance;
    function getNormalizedTouchSettings() {
      var touch = instance.props.touch;
      return Array.isArray(touch) ? touch : [touch, 0];
    }
    function getIsCustomTouchBehavior() {
      return getNormalizedTouchSettings()[0] === "hold";
    }
    function getIsDefaultRenderFn() {
      var _instance$props$rende;
      return !!((_instance$props$rende = instance.props.render) != null && _instance$props$rende.$$tippy);
    }
    function getCurrentTarget() {
      return currentTarget || reference2;
    }
    function getDocument() {
      var parent = getCurrentTarget().parentNode;
      return parent ? getOwnerDocument(parent) : document;
    }
    function getDefaultTemplateChildren() {
      return getChildren(popper2);
    }
    function getDelay(isShow) {
      if (instance.state.isMounted && !instance.state.isVisible || currentInput.isTouch || lastTriggerEvent && lastTriggerEvent.type === "focus") {
        return 0;
      }
      return getValueAtIndexOrReturn(instance.props.delay, isShow ? 0 : 1, defaultProps.delay);
    }
    function handleStyles(fromHide) {
      if (fromHide === void 0) {
        fromHide = false;
      }
      popper2.style.pointerEvents = instance.props.interactive && !fromHide ? "" : "none";
      popper2.style.zIndex = "" + instance.props.zIndex;
    }
    function invokeHook(hook, args, shouldInvokePropsHook) {
      if (shouldInvokePropsHook === void 0) {
        shouldInvokePropsHook = true;
      }
      pluginsHooks.forEach(function(pluginHooks) {
        if (pluginHooks[hook]) {
          pluginHooks[hook].apply(pluginHooks, args);
        }
      });
      if (shouldInvokePropsHook) {
        var _instance$props;
        (_instance$props = instance.props)[hook].apply(_instance$props, args);
      }
    }
    function handleAriaContentAttribute() {
      var aria = instance.props.aria;
      if (!aria.content) {
        return;
      }
      var attr = "aria-" + aria.content;
      var id2 = popper2.id;
      var nodes = normalizeToArray(instance.props.triggerTarget || reference2);
      nodes.forEach(function(node) {
        var currentValue = node.getAttribute(attr);
        if (instance.state.isVisible) {
          node.setAttribute(attr, currentValue ? currentValue + " " + id2 : id2);
        } else {
          var nextValue = currentValue && currentValue.replace(id2, "").trim();
          if (nextValue) {
            node.setAttribute(attr, nextValue);
          } else {
            node.removeAttribute(attr);
          }
        }
      });
    }
    function handleAriaExpandedAttribute() {
      if (hasAriaExpanded || !instance.props.aria.expanded) {
        return;
      }
      var nodes = normalizeToArray(instance.props.triggerTarget || reference2);
      nodes.forEach(function(node) {
        if (instance.props.interactive) {
          node.setAttribute("aria-expanded", instance.state.isVisible && node === getCurrentTarget() ? "true" : "false");
        } else {
          node.removeAttribute("aria-expanded");
        }
      });
    }
    function cleanupInteractiveMouseListeners() {
      getDocument().removeEventListener("mousemove", debouncedOnMouseMove);
      mouseMoveListeners = mouseMoveListeners.filter(function(listener) {
        return listener !== debouncedOnMouseMove;
      });
    }
    function onDocumentPress(event) {
      if (currentInput.isTouch) {
        if (didTouchMove || event.type === "mousedown") {
          return;
        }
      }
      var actualTarget = event.composedPath && event.composedPath()[0] || event.target;
      if (instance.props.interactive && actualContains(popper2, actualTarget)) {
        return;
      }
      if (normalizeToArray(instance.props.triggerTarget || reference2).some(function(el) {
        return actualContains(el, actualTarget);
      })) {
        if (currentInput.isTouch) {
          return;
        }
        if (instance.state.isVisible && instance.props.trigger.indexOf("click") >= 0) {
          return;
        }
      } else {
        invokeHook("onClickOutside", [instance, event]);
      }
      if (instance.props.hideOnClick === true) {
        instance.clearDelayTimeouts();
        instance.hide();
        didHideDueToDocumentMouseDown = true;
        setTimeout(function() {
          didHideDueToDocumentMouseDown = false;
        });
        if (!instance.state.isMounted) {
          removeDocumentPress();
        }
      }
    }
    function onTouchMove() {
      didTouchMove = true;
    }
    function onTouchStart() {
      didTouchMove = false;
    }
    function addDocumentPress() {
      var doc = getDocument();
      doc.addEventListener("mousedown", onDocumentPress, true);
      doc.addEventListener("touchend", onDocumentPress, TOUCH_OPTIONS);
      doc.addEventListener("touchstart", onTouchStart, TOUCH_OPTIONS);
      doc.addEventListener("touchmove", onTouchMove, TOUCH_OPTIONS);
    }
    function removeDocumentPress() {
      var doc = getDocument();
      doc.removeEventListener("mousedown", onDocumentPress, true);
      doc.removeEventListener("touchend", onDocumentPress, TOUCH_OPTIONS);
      doc.removeEventListener("touchstart", onTouchStart, TOUCH_OPTIONS);
      doc.removeEventListener("touchmove", onTouchMove, TOUCH_OPTIONS);
    }
    function onTransitionedOut(duration, callback) {
      onTransitionEnd(duration, function() {
        if (!instance.state.isVisible && popper2.parentNode && popper2.parentNode.contains(popper2)) {
          callback();
        }
      });
    }
    function onTransitionedIn(duration, callback) {
      onTransitionEnd(duration, callback);
    }
    function onTransitionEnd(duration, callback) {
      var box = getDefaultTemplateChildren().box;
      function listener(event) {
        if (event.target === box) {
          updateTransitionEndListener(box, "remove", listener);
          callback();
        }
      }
      if (duration === 0) {
        return callback();
      }
      updateTransitionEndListener(box, "remove", currentTransitionEndListener);
      updateTransitionEndListener(box, "add", listener);
      currentTransitionEndListener = listener;
    }
    function on(eventType, handler, options) {
      if (options === void 0) {
        options = false;
      }
      var nodes = normalizeToArray(instance.props.triggerTarget || reference2);
      nodes.forEach(function(node) {
        node.addEventListener(eventType, handler, options);
        listeners.push({
          node,
          eventType,
          handler,
          options
        });
      });
    }
    function addListeners() {
      if (getIsCustomTouchBehavior()) {
        on("touchstart", onTrigger2, {
          passive: true
        });
        on("touchend", onMouseLeave, {
          passive: true
        });
      }
      splitBySpaces(instance.props.trigger).forEach(function(eventType) {
        if (eventType === "manual") {
          return;
        }
        on(eventType, onTrigger2);
        switch (eventType) {
          case "mouseenter":
            on("mouseleave", onMouseLeave);
            break;
          case "focus":
            on(isIE11 ? "focusout" : "blur", onBlurOrFocusOut);
            break;
          case "focusin":
            on("focusout", onBlurOrFocusOut);
            break;
        }
      });
    }
    function removeListeners() {
      listeners.forEach(function(_ref) {
        var node = _ref.node, eventType = _ref.eventType, handler = _ref.handler, options = _ref.options;
        node.removeEventListener(eventType, handler, options);
      });
      listeners = [];
    }
    function onTrigger2(event) {
      var _lastTriggerEvent;
      var shouldScheduleClickHide = false;
      if (!instance.state.isEnabled || isEventListenerStopped(event) || didHideDueToDocumentMouseDown) {
        return;
      }
      var wasFocused = ((_lastTriggerEvent = lastTriggerEvent) == null ? void 0 : _lastTriggerEvent.type) === "focus";
      lastTriggerEvent = event;
      currentTarget = event.currentTarget;
      handleAriaExpandedAttribute();
      if (!instance.state.isVisible && isMouseEvent(event)) {
        mouseMoveListeners.forEach(function(listener) {
          return listener(event);
        });
      }
      if (event.type === "click" && (instance.props.trigger.indexOf("mouseenter") < 0 || isVisibleFromClick) && instance.props.hideOnClick !== false && instance.state.isVisible) {
        shouldScheduleClickHide = true;
      } else {
        scheduleShow(event);
      }
      if (event.type === "click") {
        isVisibleFromClick = !shouldScheduleClickHide;
      }
      if (shouldScheduleClickHide && !wasFocused) {
        scheduleHide(event);
      }
    }
    function onMouseMove(event) {
      var target2 = event.target;
      var isCursorOverReferenceOrPopper = getCurrentTarget().contains(target2) || popper2.contains(target2);
      if (event.type === "mousemove" && isCursorOverReferenceOrPopper) {
        return;
      }
      var popperTreeData = getNestedPopperTree().concat(popper2).map(function(popper3) {
        var _instance$popperInsta;
        var instance2 = popper3._tippy;
        var state2 = (_instance$popperInsta = instance2.popperInstance) == null ? void 0 : _instance$popperInsta.state;
        if (state2) {
          return {
            popperRect: popper3.getBoundingClientRect(),
            popperState: state2,
            props
          };
        }
        return null;
      }).filter(Boolean);
      if (isCursorOutsideInteractiveBorder(popperTreeData, event)) {
        cleanupInteractiveMouseListeners();
        scheduleHide(event);
      }
    }
    function onMouseLeave(event) {
      var shouldBail = isEventListenerStopped(event) || instance.props.trigger.indexOf("click") >= 0 && isVisibleFromClick;
      if (shouldBail) {
        return;
      }
      if (instance.props.interactive) {
        instance.hideWithInteractivity(event);
        return;
      }
      scheduleHide(event);
    }
    function onBlurOrFocusOut(event) {
      if (instance.props.trigger.indexOf("focusin") < 0 && event.target !== getCurrentTarget()) {
        return;
      }
      if (instance.props.interactive && event.relatedTarget && popper2.contains(event.relatedTarget)) {
        return;
      }
      scheduleHide(event);
    }
    function isEventListenerStopped(event) {
      return currentInput.isTouch ? getIsCustomTouchBehavior() !== event.type.indexOf("touch") >= 0 : false;
    }
    function createPopperInstance() {
      destroyPopperInstance();
      var _instance$props2 = instance.props, popperOptions = _instance$props2.popperOptions, placement = _instance$props2.placement, offset2 = _instance$props2.offset, getReferenceClientRect = _instance$props2.getReferenceClientRect, moveTransition = _instance$props2.moveTransition;
      var arrow2 = getIsDefaultRenderFn() ? getChildren(popper2).arrow : null;
      var computedReference = getReferenceClientRect ? {
        getBoundingClientRect: getReferenceClientRect,
        contextElement: getReferenceClientRect.contextElement || getCurrentTarget()
      } : reference2;
      var tippyModifier = {
        name: "$$tippy",
        enabled: true,
        phase: "beforeWrite",
        requires: ["computeStyles"],
        fn: function fn2(_ref2) {
          var state2 = _ref2.state;
          if (getIsDefaultRenderFn()) {
            var _getDefaultTemplateCh = getDefaultTemplateChildren(), box = _getDefaultTemplateCh.box;
            ["placement", "reference-hidden", "escaped"].forEach(function(attr) {
              if (attr === "placement") {
                box.setAttribute("data-placement", state2.placement);
              } else {
                if (state2.attributes.popper["data-popper-" + attr]) {
                  box.setAttribute("data-" + attr, "");
                } else {
                  box.removeAttribute("data-" + attr);
                }
              }
            });
            state2.attributes.popper = {};
          }
        }
      };
      var modifiers = [{
        name: "offset",
        options: {
          offset: offset2
        }
      }, {
        name: "preventOverflow",
        options: {
          padding: {
            top: 2,
            bottom: 2,
            left: 5,
            right: 5
          }
        }
      }, {
        name: "flip",
        options: {
          padding: 5
        }
      }, {
        name: "computeStyles",
        options: {
          adaptive: !moveTransition
        }
      }, tippyModifier];
      if (getIsDefaultRenderFn() && arrow2) {
        modifiers.push({
          name: "arrow",
          options: {
            element: arrow2,
            padding: 3
          }
        });
      }
      modifiers.push.apply(modifiers, (popperOptions == null ? void 0 : popperOptions.modifiers) || []);
      instance.popperInstance = createPopper(computedReference, popper2, Object.assign({}, popperOptions, {
        placement,
        onFirstUpdate,
        modifiers
      }));
    }
    function destroyPopperInstance() {
      if (instance.popperInstance) {
        instance.popperInstance.destroy();
        instance.popperInstance = null;
      }
    }
    function mount() {
      var appendTo = instance.props.appendTo;
      var parentNode;
      var node = getCurrentTarget();
      if (instance.props.interactive && appendTo === TIPPY_DEFAULT_APPEND_TO || appendTo === "parent") {
        parentNode = node.parentNode;
      } else {
        parentNode = invokeWithArgsOrReturn(appendTo, [node]);
      }
      if (!parentNode.contains(popper2)) {
        parentNode.appendChild(popper2);
      }
      instance.state.isMounted = true;
      createPopperInstance();
      if (true) {
        warnWhen(instance.props.interactive && appendTo === defaultProps.appendTo && node.nextElementSibling !== popper2, ["Interactive tippy element may not be accessible via keyboard", "navigation because it is not directly after the reference element", "in the DOM source order.", "\n\n", "Using a wrapper <div> or <span> tag around the reference element", "solves this by creating a new parentNode context.", "\n\n", "Specifying `appendTo: document.body` silences this warning, but it", "assumes you are using a focus management solution to handle", "keyboard navigation.", "\n\n", "See: https://atomiks.github.io/tippyjs/v6/accessibility/#interactivity"].join(" "));
      }
    }
    function getNestedPopperTree() {
      return arrayFrom(popper2.querySelectorAll("[data-tippy-root]"));
    }
    function scheduleShow(event) {
      instance.clearDelayTimeouts();
      if (event) {
        invokeHook("onTrigger", [instance, event]);
      }
      addDocumentPress();
      var delay = getDelay(true);
      var _getNormalizedTouchSe = getNormalizedTouchSettings(), touchValue = _getNormalizedTouchSe[0], touchDelay = _getNormalizedTouchSe[1];
      if (currentInput.isTouch && touchValue === "hold" && touchDelay) {
        delay = touchDelay;
      }
      if (delay) {
        showTimeout = setTimeout(function() {
          instance.show();
        }, delay);
      } else {
        instance.show();
      }
    }
    function scheduleHide(event) {
      instance.clearDelayTimeouts();
      invokeHook("onUntrigger", [instance, event]);
      if (!instance.state.isVisible) {
        removeDocumentPress();
        return;
      }
      if (instance.props.trigger.indexOf("mouseenter") >= 0 && instance.props.trigger.indexOf("click") >= 0 && ["mouseleave", "mousemove"].indexOf(event.type) >= 0 && isVisibleFromClick) {
        return;
      }
      var delay = getDelay(false);
      if (delay) {
        hideTimeout = setTimeout(function() {
          if (instance.state.isVisible) {
            instance.hide();
          }
        }, delay);
      } else {
        scheduleHideAnimationFrame = requestAnimationFrame(function() {
          instance.hide();
        });
      }
    }
    function enable() {
      instance.state.isEnabled = true;
    }
    function disable() {
      instance.hide();
      instance.state.isEnabled = false;
    }
    function clearDelayTimeouts() {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
      cancelAnimationFrame(scheduleHideAnimationFrame);
    }
    function setProps(partialProps) {
      if (true) {
        warnWhen(instance.state.isDestroyed, createMemoryLeakWarning("setProps"));
      }
      if (instance.state.isDestroyed) {
        return;
      }
      invokeHook("onBeforeUpdate", [instance, partialProps]);
      removeListeners();
      var prevProps = instance.props;
      var nextProps = evaluateProps(reference2, Object.assign({}, prevProps, removeUndefinedProps(partialProps), {
        ignoreAttributes: true
      }));
      instance.props = nextProps;
      addListeners();
      if (prevProps.interactiveDebounce !== nextProps.interactiveDebounce) {
        cleanupInteractiveMouseListeners();
        debouncedOnMouseMove = debounce2(onMouseMove, nextProps.interactiveDebounce);
      }
      if (prevProps.triggerTarget && !nextProps.triggerTarget) {
        normalizeToArray(prevProps.triggerTarget).forEach(function(node) {
          node.removeAttribute("aria-expanded");
        });
      } else if (nextProps.triggerTarget) {
        reference2.removeAttribute("aria-expanded");
      }
      handleAriaExpandedAttribute();
      handleStyles();
      if (onUpdate) {
        onUpdate(prevProps, nextProps);
      }
      if (instance.popperInstance) {
        createPopperInstance();
        getNestedPopperTree().forEach(function(nestedPopper) {
          requestAnimationFrame(nestedPopper._tippy.popperInstance.forceUpdate);
        });
      }
      invokeHook("onAfterUpdate", [instance, partialProps]);
    }
    function setContent2(content) {
      instance.setProps({
        content
      });
    }
    function show() {
      if (true) {
        warnWhen(instance.state.isDestroyed, createMemoryLeakWarning("show"));
      }
      var isAlreadyVisible = instance.state.isVisible;
      var isDestroyed = instance.state.isDestroyed;
      var isDisabled = !instance.state.isEnabled;
      var isTouchAndTouchDisabled = currentInput.isTouch && !instance.props.touch;
      var duration = getValueAtIndexOrReturn(instance.props.duration, 0, defaultProps.duration);
      if (isAlreadyVisible || isDestroyed || isDisabled || isTouchAndTouchDisabled) {
        return;
      }
      if (getCurrentTarget().hasAttribute("disabled")) {
        return;
      }
      invokeHook("onShow", [instance], false);
      if (instance.props.onShow(instance) === false) {
        return;
      }
      instance.state.isVisible = true;
      if (getIsDefaultRenderFn()) {
        popper2.style.visibility = "visible";
      }
      handleStyles();
      addDocumentPress();
      if (!instance.state.isMounted) {
        popper2.style.transition = "none";
      }
      if (getIsDefaultRenderFn()) {
        var _getDefaultTemplateCh2 = getDefaultTemplateChildren(), box = _getDefaultTemplateCh2.box, content = _getDefaultTemplateCh2.content;
        setTransitionDuration([box, content], 0);
      }
      onFirstUpdate = function onFirstUpdate2() {
        var _instance$popperInsta2;
        if (!instance.state.isVisible || ignoreOnFirstUpdate) {
          return;
        }
        ignoreOnFirstUpdate = true;
        void popper2.offsetHeight;
        popper2.style.transition = instance.props.moveTransition;
        if (getIsDefaultRenderFn() && instance.props.animation) {
          var _getDefaultTemplateCh3 = getDefaultTemplateChildren(), _box = _getDefaultTemplateCh3.box, _content = _getDefaultTemplateCh3.content;
          setTransitionDuration([_box, _content], duration);
          setVisibilityState([_box, _content], "visible");
        }
        handleAriaContentAttribute();
        handleAriaExpandedAttribute();
        pushIfUnique(mountedInstances, instance);
        (_instance$popperInsta2 = instance.popperInstance) == null ? void 0 : _instance$popperInsta2.forceUpdate();
        invokeHook("onMount", [instance]);
        if (instance.props.animation && getIsDefaultRenderFn()) {
          onTransitionedIn(duration, function() {
            instance.state.isShown = true;
            invokeHook("onShown", [instance]);
          });
        }
      };
      mount();
    }
    function hide2() {
      if (true) {
        warnWhen(instance.state.isDestroyed, createMemoryLeakWarning("hide"));
      }
      var isAlreadyHidden = !instance.state.isVisible;
      var isDestroyed = instance.state.isDestroyed;
      var isDisabled = !instance.state.isEnabled;
      var duration = getValueAtIndexOrReturn(instance.props.duration, 1, defaultProps.duration);
      if (isAlreadyHidden || isDestroyed || isDisabled) {
        return;
      }
      invokeHook("onHide", [instance], false);
      if (instance.props.onHide(instance) === false) {
        return;
      }
      instance.state.isVisible = false;
      instance.state.isShown = false;
      ignoreOnFirstUpdate = false;
      isVisibleFromClick = false;
      if (getIsDefaultRenderFn()) {
        popper2.style.visibility = "hidden";
      }
      cleanupInteractiveMouseListeners();
      removeDocumentPress();
      handleStyles(true);
      if (getIsDefaultRenderFn()) {
        var _getDefaultTemplateCh4 = getDefaultTemplateChildren(), box = _getDefaultTemplateCh4.box, content = _getDefaultTemplateCh4.content;
        if (instance.props.animation) {
          setTransitionDuration([box, content], duration);
          setVisibilityState([box, content], "hidden");
        }
      }
      handleAriaContentAttribute();
      handleAriaExpandedAttribute();
      if (instance.props.animation) {
        if (getIsDefaultRenderFn()) {
          onTransitionedOut(duration, instance.unmount);
        }
      } else {
        instance.unmount();
      }
    }
    function hideWithInteractivity(event) {
      if (true) {
        warnWhen(instance.state.isDestroyed, createMemoryLeakWarning("hideWithInteractivity"));
      }
      getDocument().addEventListener("mousemove", debouncedOnMouseMove);
      pushIfUnique(mouseMoveListeners, debouncedOnMouseMove);
      debouncedOnMouseMove(event);
    }
    function unmount() {
      if (true) {
        warnWhen(instance.state.isDestroyed, createMemoryLeakWarning("unmount"));
      }
      if (instance.state.isVisible) {
        instance.hide();
      }
      if (!instance.state.isMounted) {
        return;
      }
      destroyPopperInstance();
      getNestedPopperTree().forEach(function(nestedPopper) {
        nestedPopper._tippy.unmount();
      });
      if (popper2.parentNode) {
        popper2.parentNode.removeChild(popper2);
      }
      mountedInstances = mountedInstances.filter(function(i) {
        return i !== instance;
      });
      instance.state.isMounted = false;
      invokeHook("onHidden", [instance]);
    }
    function destroy() {
      if (true) {
        warnWhen(instance.state.isDestroyed, createMemoryLeakWarning("destroy"));
      }
      if (instance.state.isDestroyed) {
        return;
      }
      instance.clearDelayTimeouts();
      instance.unmount();
      removeListeners();
      delete reference2._tippy;
      instance.state.isDestroyed = true;
      invokeHook("onDestroy", [instance]);
    }
  }
  function tippy(targets, optionalProps) {
    if (optionalProps === void 0) {
      optionalProps = {};
    }
    var plugins = defaultProps.plugins.concat(optionalProps.plugins || []);
    if (true) {
      validateTargets(targets);
      validateProps(optionalProps, plugins);
    }
    bindGlobalEventListeners();
    var passedProps = Object.assign({}, optionalProps, {
      plugins
    });
    var elements2 = getArrayOfElements(targets);
    if (true) {
      var isSingleContentElement = isElement2(passedProps.content);
      var isMoreThanOneReferenceElement = elements2.length > 1;
      warnWhen(isSingleContentElement && isMoreThanOneReferenceElement, ["tippy() was passed an Element as the `content` prop, but more than", "one tippy instance was created by this invocation. This means the", "content element will only be appended to the last tippy instance.", "\n\n", "Instead, pass the .innerHTML of the element, or use a function that", "returns a cloned version of the element instead.", "\n\n", "1) content: element.innerHTML\n", "2) content: () => element.cloneNode(true)"].join(" "));
    }
    var instances = elements2.reduce(function(acc, reference2) {
      var instance = reference2 && createTippy(reference2, passedProps);
      if (instance) {
        acc.push(instance);
      }
      return acc;
    }, []);
    return isElement2(targets) ? instances[0] : instances;
  }
  var BOX_CLASS, CONTENT_CLASS, BACKDROP_CLASS, ARROW_CLASS, SVG_ARROW_CLASS, TOUCH_OPTIONS, TIPPY_DEFAULT_APPEND_TO, currentInput, lastMouseMoveTime, isBrowser, isIE11, visitedMessages, pluginProps, renderProps, defaultProps, defaultKeys, setDefaultProps, innerHTML, idCounter, mouseMoveListeners, mountedInstances, applyStylesModifier, tippy_esm_default;
  var init_tippy_esm = __esm({
    "node_modules/tippy.js/dist/tippy.esm.js"() {
      init_lib();
      BOX_CLASS = "tippy-box";
      CONTENT_CLASS = "tippy-content";
      BACKDROP_CLASS = "tippy-backdrop";
      ARROW_CLASS = "tippy-arrow";
      SVG_ARROW_CLASS = "tippy-svg-arrow";
      TOUCH_OPTIONS = {
        passive: true,
        capture: true
      };
      TIPPY_DEFAULT_APPEND_TO = function TIPPY_DEFAULT_APPEND_TO2() {
        return document.body;
      };
      currentInput = {
        isTouch: false
      };
      lastMouseMoveTime = 0;
      isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
      isIE11 = isBrowser ? (
        // @ts-ignore
        !!window.msCrypto
      ) : false;
      if (true) {
        resetVisitedMessages();
      }
      pluginProps = {
        animateFill: false,
        followCursor: false,
        inlinePositioning: false,
        sticky: false
      };
      renderProps = {
        allowHTML: false,
        animation: "fade",
        arrow: true,
        content: "",
        inertia: false,
        maxWidth: 350,
        role: "tooltip",
        theme: "",
        zIndex: 9999
      };
      defaultProps = Object.assign({
        appendTo: TIPPY_DEFAULT_APPEND_TO,
        aria: {
          content: "auto",
          expanded: "auto"
        },
        delay: 0,
        duration: [300, 250],
        getReferenceClientRect: null,
        hideOnClick: true,
        ignoreAttributes: false,
        interactive: false,
        interactiveBorder: 2,
        interactiveDebounce: 0,
        moveTransition: "",
        offset: [0, 10],
        onAfterUpdate: function onAfterUpdate() {
        },
        onBeforeUpdate: function onBeforeUpdate() {
        },
        onCreate: function onCreate() {
        },
        onDestroy: function onDestroy() {
        },
        onHidden: function onHidden() {
        },
        onHide: function onHide() {
        },
        onMount: function onMount() {
        },
        onShow: function onShow() {
        },
        onShown: function onShown() {
        },
        onTrigger: function onTrigger() {
        },
        onUntrigger: function onUntrigger() {
        },
        onClickOutside: function onClickOutside() {
        },
        placement: "top",
        plugins: [],
        popperOptions: {},
        render: null,
        showOnCreate: false,
        touch: true,
        trigger: "mouseenter focus",
        triggerTarget: null
      }, pluginProps, renderProps);
      defaultKeys = Object.keys(defaultProps);
      setDefaultProps = function setDefaultProps2(partialProps) {
        if (true) {
          validateProps(partialProps, []);
        }
        var keys = Object.keys(partialProps);
        keys.forEach(function(key) {
          defaultProps[key] = partialProps[key];
        });
      };
      innerHTML = function innerHTML2() {
        return "innerHTML";
      };
      render.$$tippy = true;
      idCounter = 1;
      mouseMoveListeners = [];
      mountedInstances = [];
      tippy.defaultProps = defaultProps;
      tippy.setDefaultProps = setDefaultProps;
      tippy.currentInput = currentInput;
      applyStylesModifier = Object.assign({}, applyStyles_default, {
        effect: function effect4(_ref) {
          var state = _ref.state;
          var initialStyles = {
            popper: {
              position: state.options.strategy,
              left: "0",
              top: "0",
              margin: "0"
            },
            arrow: {
              position: "absolute"
            },
            reference: {}
          };
          Object.assign(state.elements.popper.style, initialStyles.popper);
          state.styles = initialStyles;
          if (state.elements.arrow) {
            Object.assign(state.elements.arrow.style, initialStyles.arrow);
          }
        }
      });
      tippy.setDefaultProps({
        render
      });
      tippy_esm_default = tippy;
    }
  });

  // node_modules/sortablejs/Sortable.min.js
  var require_Sortable_min = __commonJS({
    "node_modules/sortablejs/Sortable.min.js"(exports, module) {
      !(function(t, e) {
        "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : (t = t || self).Sortable = e();
      })(exports, function() {
        "use strict";
        function o(t2, e2) {
          (null == e2 || e2 > t2.length) && (e2 = t2.length);
          for (var n2 = 0, o2 = Array(e2); n2 < e2; n2++) o2[n2] = t2[n2];
          return o2;
        }
        function i(t2, e2, n2) {
          return (e2 = (function(t3) {
            t3 = (function(t4, e3) {
              if ("object" != typeof t4 || !t4) return t4;
              var n3 = t4[Symbol.toPrimitive];
              if (void 0 === n3) return ("string" === e3 ? String : Number)(t4);
              e3 = n3.call(t4, e3 || "default");
              if ("object" != typeof e3) return e3;
              throw new TypeError("@@toPrimitive must return a primitive value.");
            })(t3, "string");
            return "symbol" == typeof t3 ? t3 : t3 + "";
          })(e2)) in t2 ? Object.defineProperty(t2, e2, { value: n2, enumerable: true, configurable: true, writable: true }) : t2[e2] = n2, t2;
        }
        function a() {
          return (a = Object.assign ? Object.assign.bind() : function(t2) {
            for (var e2 = 1; e2 < arguments.length; e2++) {
              var n2, o2 = arguments[e2];
              for (n2 in o2) !{}.hasOwnProperty.call(o2, n2) || (t2[n2] = o2[n2]);
            }
            return t2;
          }).apply(null, arguments);
        }
        function r(e2, t2) {
          var n2, o2 = Object.keys(e2);
          return Object.getOwnPropertySymbols && (n2 = Object.getOwnPropertySymbols(e2), t2 && (n2 = n2.filter(function(t3) {
            return Object.getOwnPropertyDescriptor(e2, t3).enumerable;
          })), o2.push.apply(o2, n2)), o2;
        }
        function I(e2) {
          for (var t2 = 1; t2 < arguments.length; t2++) {
            var n2 = null != arguments[t2] ? arguments[t2] : {};
            t2 % 2 ? r(Object(n2), true).forEach(function(t3) {
              i(e2, t3, n2[t3]);
            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e2, Object.getOwnPropertyDescriptors(n2)) : r(Object(n2)).forEach(function(t3) {
              Object.defineProperty(e2, t3, Object.getOwnPropertyDescriptor(n2, t3));
            });
          }
          return e2;
        }
        function l(t2, e2) {
          if (null == t2) return {};
          var n2, o2 = (function(t3, e3) {
            if (null == t3) return {};
            var n3, o3 = {};
            for (n3 in t3) if ({}.hasOwnProperty.call(t3, n3)) {
              if (-1 !== e3.indexOf(n3)) continue;
              o3[n3] = t3[n3];
            }
            return o3;
          })(t2, e2);
          if (Object.getOwnPropertySymbols) for (var i2 = Object.getOwnPropertySymbols(t2), r2 = 0; r2 < i2.length; r2++) n2 = i2[r2], -1 === e2.indexOf(n2) && {}.propertyIsEnumerable.call(t2, n2) && (o2[n2] = t2[n2]);
          return o2;
        }
        function e(t2) {
          return (function(t3) {
            if (Array.isArray(t3)) return o(t3);
          })(t2) || (function(t3) {
            if ("undefined" != typeof Symbol && null != t3[Symbol.iterator] || null != t3["@@iterator"]) return Array.from(t3);
          })(t2) || (function(t3, e2) {
            if (t3) {
              if ("string" == typeof t3) return o(t3, e2);
              var n2 = {}.toString.call(t3).slice(8, -1);
              return "Map" === (n2 = "Object" === n2 && t3.constructor ? t3.constructor.name : n2) || "Set" === n2 ? Array.from(t3) : "Arguments" === n2 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n2) ? o(t3, e2) : void 0;
            }
          })(t2) || (function() {
            throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
          })();
        }
        function s(t2) {
          return (s = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t3) {
            return typeof t3;
          } : function(t3) {
            return t3 && "function" == typeof Symbol && t3.constructor === Symbol && t3 !== Symbol.prototype ? "symbol" : typeof t3;
          })(t2);
        }
        function t(t2) {
          if ("undefined" != typeof window && window.navigator) return !!navigator.userAgent.match(t2);
        }
        var y = t(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i), w = t(/Edge/i), c = t(/firefox/i), u = t(/safari/i) && !t(/chrome/i) && !t(/android/i), d = t(/iP(ad|od|hone)/i), n = t(/chrome/i) && t(/android/i), h = { capture: false, passive: false };
        function f(t2, e2, n2) {
          t2.addEventListener(e2, n2, !y && h);
        }
        function p(t2, e2, n2) {
          t2.removeEventListener(e2, n2, !y && h);
        }
        function g(t2, e2) {
          if (e2 && (">" === e2[0] && (e2 = e2.substring(1)), t2)) try {
            if (t2.matches) return t2.matches(e2);
            if (t2.msMatchesSelector) return t2.msMatchesSelector(e2);
            if (t2.webkitMatchesSelector) return t2.webkitMatchesSelector(e2);
          } catch (t3) {
            return;
          }
        }
        function m(t2) {
          return t2.host && t2 !== document && t2.host.nodeType && t2.host !== t2 ? t2.host : t2.parentNode;
        }
        function P(t2, e2, n2, o2) {
          if (t2) {
            n2 = n2 || document;
            do {
              if (null != e2 && (">" !== e2[0] || t2.parentNode === n2) && g(t2, e2) || o2 && t2 === n2) return t2;
            } while (t2 !== n2 && (t2 = m(t2)));
          }
          return null;
        }
        var v, b = /\s+/g;
        function k(t2, e2, n2) {
          var o2;
          t2 && e2 && (t2.classList ? t2.classList[n2 ? "add" : "remove"](e2) : (o2 = (" " + t2.className + " ").replace(b, " ").replace(" " + e2 + " ", " "), t2.className = (o2 + (n2 ? " " + e2 : "")).replace(b, " ")));
        }
        function R(t2, e2, n2) {
          var o2 = t2 && t2.style;
          if (o2) {
            if (void 0 === n2) return document.defaultView && document.defaultView.getComputedStyle ? n2 = document.defaultView.getComputedStyle(t2, "") : t2.currentStyle && (n2 = t2.currentStyle), void 0 === e2 ? n2 : n2[e2];
            o2[e2 = !(e2 in o2 || -1 !== e2.indexOf("webkit")) ? "-webkit-" + e2 : e2] = n2 + ("string" == typeof n2 ? "" : "px");
          }
        }
        function D(t2, e2) {
          var n2 = "";
          if ("string" == typeof t2) n2 = t2;
          else do {
            var o2 = R(t2, "transform");
          } while (o2 && "none" !== o2 && (n2 = o2 + " " + n2), !e2 && (t2 = t2.parentNode));
          var i2 = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
          return i2 && new i2(n2);
        }
        function E(t2, e2, n2) {
          if (t2) {
            var o2 = t2.getElementsByTagName(e2), i2 = 0, r2 = o2.length;
            if (n2) for (; i2 < r2; i2++) n2(o2[i2], i2);
            return o2;
          }
          return [];
        }
        function O() {
          var t2 = document.scrollingElement;
          return t2 || document.documentElement;
        }
        function X(t2, e2, n2, o2, i2) {
          if (t2.getBoundingClientRect || t2 === window) {
            var r2, a2, l2, s2, c2, u2, d2 = t2 !== window && t2.parentNode && t2 !== O() ? (a2 = (r2 = t2.getBoundingClientRect()).top, l2 = r2.left, s2 = r2.bottom, c2 = r2.right, u2 = r2.height, r2.width) : (l2 = a2 = 0, s2 = window.innerHeight, c2 = window.innerWidth, u2 = window.innerHeight, window.innerWidth);
            if ((e2 || n2) && t2 !== window && (i2 = i2 || t2.parentNode, !y)) do {
              if (i2 && i2.getBoundingClientRect && ("none" !== R(i2, "transform") || n2 && "static" !== R(i2, "position"))) {
                var h2 = i2.getBoundingClientRect();
                a2 -= h2.top + parseInt(R(i2, "border-top-width")), l2 -= h2.left + parseInt(R(i2, "border-left-width")), s2 = a2 + r2.height, c2 = l2 + r2.width;
                break;
              }
            } while (i2 = i2.parentNode);
            return o2 && t2 !== window && (o2 = (e2 = D(i2 || t2)) && e2.a, t2 = e2 && e2.d, e2 && (s2 = (a2 /= t2) + (u2 /= t2), c2 = (l2 /= o2) + (d2 /= o2))), { top: a2, left: l2, bottom: s2, right: c2, width: d2, height: u2 };
          }
        }
        function Y(t2, e2, n2) {
          for (var o2 = M(t2, true), i2 = X(t2)[e2]; o2; ) {
            var r2 = X(o2)[n2];
            if (!("top" === n2 || "left" === n2 ? r2 <= i2 : i2 <= r2)) return o2;
            if (o2 === O()) break;
            o2 = M(o2, false);
          }
          return false;
        }
        function B(t2, e2, n2, o2) {
          for (var i2 = 0, r2 = 0, a2 = t2.children; r2 < a2.length; ) {
            if ("none" !== a2[r2].style.display && a2[r2] !== Ht.ghost && (o2 || a2[r2] !== Ht.dragged) && P(a2[r2], n2.draggable, t2, false)) {
              if (i2 === e2) return a2[r2];
              i2++;
            }
            r2++;
          }
          return null;
        }
        function F(t2, e2) {
          for (var n2 = t2.lastElementChild; n2 && (n2 === Ht.ghost || "none" === R(n2, "display") || e2 && !g(n2, e2)); ) n2 = n2.previousElementSibling;
          return n2 || null;
        }
        function j(t2, e2) {
          var n2 = 0;
          if (!t2 || !t2.parentNode) return -1;
          for (; t2 = t2.previousElementSibling; ) "TEMPLATE" === t2.nodeName.toUpperCase() || t2 === Ht.clone || e2 && !g(t2, e2) || n2++;
          return n2;
        }
        function S(t2) {
          var e2 = 0, n2 = 0, o2 = O();
          if (t2) do {
            var i2 = D(t2), r2 = i2.a, i2 = i2.d;
          } while (e2 += t2.scrollLeft * r2, n2 += t2.scrollTop * i2, t2 !== o2 && (t2 = t2.parentNode));
          return [e2, n2];
        }
        function M(t2, e2) {
          if (!t2 || !t2.getBoundingClientRect) return O();
          var n2 = t2, o2 = false;
          do {
            if (n2.clientWidth < n2.scrollWidth || n2.clientHeight < n2.scrollHeight) {
              var i2 = R(n2);
              if (n2.clientWidth < n2.scrollWidth && ("auto" == i2.overflowX || "scroll" == i2.overflowX) || n2.clientHeight < n2.scrollHeight && ("auto" == i2.overflowY || "scroll" == i2.overflowY)) {
                if (!n2.getBoundingClientRect || n2 === document.body) return O();
                if (o2 || e2) return n2;
                o2 = true;
              }
            }
          } while (n2 = n2.parentNode);
          return O();
        }
        function _(t2, e2) {
          return Math.round(t2.top) === Math.round(e2.top) && Math.round(t2.left) === Math.round(e2.left) && Math.round(t2.height) === Math.round(e2.height) && Math.round(t2.width) === Math.round(e2.width);
        }
        function C(e2, n2) {
          return function() {
            var t2;
            v || (1 === (t2 = arguments).length ? e2.call(this, t2[0]) : e2.apply(this, t2), v = setTimeout(function() {
              v = void 0;
            }, n2));
          };
        }
        function H(t2, e2, n2) {
          t2.scrollLeft += e2, t2.scrollTop += n2;
        }
        function T(t2) {
          var e2 = window.Polymer, n2 = window.jQuery || window.Zepto;
          return e2 && e2.dom ? e2.dom(t2).cloneNode(true) : n2 ? n2(t2).clone(true)[0] : t2.cloneNode(true);
        }
        function x(t2, e2) {
          R(t2, "position", "absolute"), R(t2, "top", e2.top), R(t2, "left", e2.left), R(t2, "width", e2.width), R(t2, "height", e2.height);
        }
        function A(t2) {
          R(t2, "position", ""), R(t2, "top", ""), R(t2, "left", ""), R(t2, "width", ""), R(t2, "height", "");
        }
        function L(n2, o2, i2) {
          var r2 = {};
          return Array.from(n2.children).forEach(function(t2) {
            var e2;
            P(t2, o2.draggable, n2, false) && !t2.animated && t2 !== i2 && (e2 = X(t2), r2.left = Math.min(null !== (t2 = r2.left) && void 0 !== t2 ? t2 : 1 / 0, e2.left), r2.top = Math.min(null !== (t2 = r2.top) && void 0 !== t2 ? t2 : 1 / 0, e2.top), r2.right = Math.max(null !== (t2 = r2.right) && void 0 !== t2 ? t2 : -1 / 0, e2.right), r2.bottom = Math.max(null !== (t2 = r2.bottom) && void 0 !== t2 ? t2 : -1 / 0, e2.bottom));
          }), r2.width = r2.right - r2.left, r2.height = r2.bottom - r2.top, r2.x = r2.left, r2.y = r2.top, r2;
        }
        var K = "Sortable" + (/* @__PURE__ */ new Date()).getTime();
        function N() {
          var e2, o2 = [];
          return { captureAnimationState: function() {
            o2 = [], this.options.animation && [].slice.call(this.el.children).forEach(function(t2) {
              var e3, n2;
              "none" !== R(t2, "display") && t2 !== Ht.ghost && (o2.push({ target: t2, rect: X(t2) }), e3 = I({}, o2[o2.length - 1].rect), !t2.thisAnimationDuration || (n2 = D(t2, true)) && (e3.top -= n2.f, e3.left -= n2.e), t2.fromRect = e3);
            });
          }, addAnimationState: function(t2) {
            o2.push(t2);
          }, removeAnimationState: function(t2) {
            o2.splice((function(t3, e3) {
              for (var n2 in t3) if (t3.hasOwnProperty(n2)) {
                for (var o3 in e3) if (e3.hasOwnProperty(o3) && e3[o3] === t3[n2][o3]) return Number(n2);
              }
              return -1;
            })(o2, { target: t2 }), 1);
          }, animateAll: function(t2) {
            var c2 = this;
            if (!this.options.animation) return clearTimeout(e2), void ("function" == typeof t2 && t2());
            var u2 = false, d2 = 0;
            o2.forEach(function(t3) {
              var e3 = 0, n2 = t3.target, o3 = n2.fromRect, i2 = X(n2), r2 = n2.prevFromRect, a2 = n2.prevToRect, l2 = t3.rect, s2 = D(n2, true);
              s2 && (i2.top -= s2.f, i2.left -= s2.e), n2.toRect = i2, n2.thisAnimationDuration && _(r2, i2) && !_(o3, i2) && (l2.top - i2.top) / (l2.left - i2.left) == (o3.top - i2.top) / (o3.left - i2.left) && (t3 = l2, s2 = r2, r2 = a2, a2 = c2.options, e3 = Math.sqrt(Math.pow(s2.top - t3.top, 2) + Math.pow(s2.left - t3.left, 2)) / Math.sqrt(Math.pow(s2.top - r2.top, 2) + Math.pow(s2.left - r2.left, 2)) * a2.animation), _(i2, o3) || (n2.prevFromRect = o3, n2.prevToRect = i2, e3 = e3 || c2.options.animation, c2.animate(n2, l2, i2, e3)), e3 && (u2 = true, d2 = Math.max(d2, e3), clearTimeout(n2.animationResetTimer), n2.animationResetTimer = setTimeout(function() {
                n2.animationTime = 0, n2.prevFromRect = null, n2.fromRect = null, n2.prevToRect = null, n2.thisAnimationDuration = null;
              }, e3), n2.thisAnimationDuration = e3);
            }), clearTimeout(e2), u2 ? e2 = setTimeout(function() {
              "function" == typeof t2 && t2();
            }, d2) : "function" == typeof t2 && t2(), o2 = [];
          }, animate: function(t2, e3, n2, o3) {
            var i2, r2;
            o3 && (R(t2, "transition", ""), R(t2, "transform", ""), i2 = (r2 = D(this.el)) && r2.a, r2 = r2 && r2.d, i2 = (e3.left - n2.left) / (i2 || 1), r2 = (e3.top - n2.top) / (r2 || 1), t2.animatingX = !!i2, t2.animatingY = !!r2, R(t2, "transform", "translate3d(" + i2 + "px," + r2 + "px,0)"), this.forRepaintDummy = t2.offsetWidth, R(t2, "transition", "transform " + o3 + "ms" + (this.options.easing ? " " + this.options.easing : "")), R(t2, "transform", "translate3d(0,0,0)"), "number" == typeof t2.animated && clearTimeout(t2.animated), t2.animated = setTimeout(function() {
              R(t2, "transition", ""), R(t2, "transform", ""), t2.animated = false, t2.animatingX = false, t2.animatingY = false;
            }, o3));
          } };
        }
        var W = [], z = { initializeByDefault: true }, G = { mount: function(e2) {
          for (var t2 in z) !z.hasOwnProperty(t2) || t2 in e2 || (e2[t2] = z[t2]);
          W.forEach(function(t3) {
            if (t3.pluginName === e2.pluginName) throw "Sortable: Cannot mount plugin ".concat(e2.pluginName, " more than once");
          }), W.push(e2);
        }, pluginEvent: function(e2, n2, o2) {
          var t2 = this;
          this.eventCanceled = false, o2.cancel = function() {
            t2.eventCanceled = true;
          };
          var i2 = e2 + "Global";
          W.forEach(function(t3) {
            n2[t3.pluginName] && (n2[t3.pluginName][i2] && n2[t3.pluginName][i2](I({ sortable: n2 }, o2)), n2.options[t3.pluginName] && n2[t3.pluginName][e2] && n2[t3.pluginName][e2](I({ sortable: n2 }, o2)));
          });
        }, initializePlugins: function(n2, o2, i2, t2) {
          for (var e2 in W.forEach(function(t3) {
            var e3 = t3.pluginName;
            (n2.options[e3] || t3.initializeByDefault) && ((t3 = new t3(n2, o2, n2.options)).sortable = n2, t3.options = n2.options, n2[e3] = t3, a(i2, t3.defaults));
          }), n2.options) {
            var r2;
            n2.options.hasOwnProperty(e2) && (void 0 !== (r2 = this.modifyOption(n2, e2, n2.options[e2])) && (n2.options[e2] = r2));
          }
        }, getEventProperties: function(e2, n2) {
          var o2 = {};
          return W.forEach(function(t2) {
            "function" == typeof t2.eventProperties && a(o2, t2.eventProperties.call(n2[t2.pluginName], e2));
          }), o2;
        }, modifyOption: function(e2, n2, o2) {
          var i2;
          return W.forEach(function(t2) {
            e2[t2.pluginName] && t2.optionListeners && "function" == typeof t2.optionListeners[n2] && (i2 = t2.optionListeners[n2].call(e2[t2.pluginName], o2));
          }), i2;
        } };
        function U(t2) {
          var e2 = t2.sortable, n2 = t2.rootEl, o2 = t2.name, i2 = t2.targetEl, r2 = t2.cloneEl, a2 = t2.toEl, l2 = t2.fromEl, s2 = t2.oldIndex, c2 = t2.newIndex, u2 = t2.oldDraggableIndex, d2 = t2.newDraggableIndex, h2 = t2.originalEvent, f2 = t2.putSortable, p2 = t2.extraEventProperties;
          if (e2 = e2 || n2 && n2[K]) {
            var g2, m2 = e2.options, t2 = "on" + o2.charAt(0).toUpperCase() + o2.substr(1);
            !window.CustomEvent || y || w ? (g2 = document.createEvent("Event")).initEvent(o2, true, true) : g2 = new CustomEvent(o2, { bubbles: true, cancelable: true }), g2.to = a2 || n2, g2.from = l2 || n2, g2.item = i2 || n2, g2.clone = r2, g2.oldIndex = s2, g2.newIndex = c2, g2.oldDraggableIndex = u2, g2.newDraggableIndex = d2, g2.originalEvent = h2, g2.pullMode = f2 ? f2.lastPutMode : void 0;
            var v2, b2 = I(I({}, p2), G.getEventProperties(o2, e2));
            for (v2 in b2) g2[v2] = b2[v2];
            n2 && n2.dispatchEvent(g2), m2[t2] && m2[t2].call(e2, g2);
          }
        }
        function q(t2, e2) {
          var n2 = (o2 = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : {}).evt, o2 = l(o2, V);
          G.pluginEvent.bind(Ht)(t2, e2, I({ dragEl: $, parentEl: Q, ghostEl: J, rootEl: tt, nextEl: et, lastDownEl: nt, cloneEl: ot, cloneHidden: it, dragStarted: vt, putSortable: ut, activeSortable: Ht.active, originalEvent: n2, oldIndex: rt, oldDraggableIndex: lt, newIndex: at, newDraggableIndex: st, hideGhostForTarget: Yt, unhideGhostForTarget: Bt, cloneNowHidden: function() {
            it = true;
          }, cloneNowShown: function() {
            it = false;
          }, dispatchSortableEvent: function(t3) {
            Z({ sortable: e2, name: t3, originalEvent: n2 });
          } }, o2));
        }
        var V = ["evt"];
        function Z(t2) {
          U(I({ putSortable: ut, cloneEl: ot, targetEl: $, rootEl: tt, oldIndex: rt, oldDraggableIndex: lt, newIndex: at, newDraggableIndex: st }, t2));
        }
        var $, Q, J, tt, et, nt, ot, it, rt, at, lt, st, ct, ut, dt, ht, ft, pt, gt, mt, vt, bt, yt, wt, Dt, Et = false, St = false, _t = [], Ct = false, Tt = false, xt = [], Ot = false, Mt = [], At = "undefined" != typeof document, Nt = d, It = w || y ? "cssFloat" : "float", Pt = At && !n && !d && "draggable" in document.createElement("div"), kt = (function() {
          if (At) {
            if (y) return false;
            var t2 = document.createElement("x");
            return t2.style.cssText = "pointer-events:auto", "auto" === t2.style.pointerEvents;
          }
        })(), Rt = function(t2, e2) {
          var n2 = R(t2), o2 = parseInt(n2.width) - parseInt(n2.paddingLeft) - parseInt(n2.paddingRight) - parseInt(n2.borderLeftWidth) - parseInt(n2.borderRightWidth), i2 = B(t2, 0, e2), r2 = B(t2, 1, e2), a2 = i2 && R(i2), l2 = r2 && R(r2), s2 = a2 && parseInt(a2.marginLeft) + parseInt(a2.marginRight) + X(i2).width, t2 = l2 && parseInt(l2.marginLeft) + parseInt(l2.marginRight) + X(r2).width;
          if ("flex" === n2.display) return "column" === n2.flexDirection || "column-reverse" === n2.flexDirection ? "vertical" : "horizontal";
          if ("grid" === n2.display) return n2.gridTemplateColumns.split(" ").length <= 1 ? "vertical" : "horizontal";
          if (i2 && a2.float && "none" !== a2.float) {
            e2 = "left" === a2.float ? "left" : "right";
            return !r2 || "both" !== l2.clear && l2.clear !== e2 ? "horizontal" : "vertical";
          }
          return i2 && ("block" === a2.display || "flex" === a2.display || "table" === a2.display || "grid" === a2.display || o2 <= s2 && "none" === n2[It] || r2 && "none" === n2[It] && o2 < s2 + t2) ? "vertical" : "horizontal";
        }, Xt = function(t2) {
          function l2(r2, a2) {
            return function(t3, e3, n3, o2) {
              var i2 = t3.options.group.name && e3.options.group.name && t3.options.group.name === e3.options.group.name;
              if (null == r2 && (a2 || i2)) return true;
              if (null == r2 || false === r2) return false;
              if (a2 && "clone" === r2) return r2;
              if ("function" == typeof r2) return l2(r2(t3, e3, n3, o2), a2)(t3, e3, n3, o2);
              e3 = (a2 ? t3 : e3).options.group.name;
              return true === r2 || "string" == typeof r2 && r2 === e3 || r2.join && -1 < r2.indexOf(e3);
            };
          }
          var e2 = {}, n2 = t2.group;
          n2 && "object" == s(n2) || (n2 = { name: n2 }), e2.name = n2.name, e2.checkPull = l2(n2.pull, true), e2.checkPut = l2(n2.put), e2.revertClone = n2.revertClone, t2.group = e2;
        }, Yt = function() {
          !kt && J && R(J, "display", "none");
        }, Bt = function() {
          !kt && J && R(J, "display", "");
        };
        At && !n && document.addEventListener("click", function(t2) {
          if (St) return t2.preventDefault(), t2.stopPropagation && t2.stopPropagation(), t2.stopImmediatePropagation && t2.stopImmediatePropagation(), St = false;
        }, true);
        function Ft(t2) {
          if ($) {
            t2 = t2.touches ? t2.touches[0] : t2;
            var e2 = (i2 = t2.clientX, r2 = t2.clientY, _t.some(function(t3) {
              var e3 = t3[K].options.emptyInsertThreshold;
              if (e3 && !F(t3)) {
                var n3 = X(t3), o3 = i2 >= n3.left - e3 && i2 <= n3.right + e3, e3 = r2 >= n3.top - e3 && r2 <= n3.bottom + e3;
                return o3 && e3 ? a2 = t3 : void 0;
              }
            }), a2);
            if (e2) {
              var n2, o2 = {};
              for (n2 in t2) t2.hasOwnProperty(n2) && (o2[n2] = t2[n2]);
              o2.target = o2.rootEl = e2, o2.preventDefault = void 0, o2.stopPropagation = void 0, e2[K]._onDragOver(o2);
            }
          }
          var i2, r2, a2;
        }
        function jt(t2) {
          $ && $.parentNode[K]._isOutsideThisEl(t2.target);
        }
        function Ht(t2, e2) {
          if (!t2 || !t2.nodeType || 1 !== t2.nodeType) throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(t2));
          this.el = t2, this.options = e2 = a({}, e2), t2[K] = this;
          var n2, o2, i2 = { group: null, sort: true, disabled: false, store: null, handle: null, draggable: /^[uo]l$/i.test(t2.nodeName) ? ">li" : ">*", swapThreshold: 1, invertSwap: false, invertedSwapThreshold: null, removeCloneOnHide: true, direction: function() {
            return Rt(t2, this.options);
          }, ghostClass: "sortable-ghost", chosenClass: "sortable-chosen", dragClass: "sortable-drag", ignore: "a, img", filter: null, preventOnFilter: true, animation: 0, easing: null, setData: function(t3, e3) {
            t3.setData("Text", e3.textContent);
          }, dropBubble: false, dragoverBubble: false, dataIdAttr: "data-id", delay: 0, delayOnTouchOnly: false, touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1, forceFallback: false, fallbackClass: "sortable-fallback", fallbackOnBody: false, fallbackTolerance: 0, fallbackOffset: { x: 0, y: 0 }, supportPointer: false !== Ht.supportPointer && "PointerEvent" in window && (!u || d), emptyInsertThreshold: 5 };
          for (n2 in G.initializePlugins(this, t2, i2), i2) n2 in e2 || (e2[n2] = i2[n2]);
          for (o2 in Xt(e2), this) "_" === o2.charAt(0) && "function" == typeof this[o2] && (this[o2] = this[o2].bind(this));
          this.nativeDraggable = !e2.forceFallback && Pt, this.nativeDraggable && (this.options.touchStartThreshold = 1), e2.supportPointer ? f(t2, "pointerdown", this._onTapStart) : (f(t2, "mousedown", this._onTapStart), f(t2, "touchstart", this._onTapStart)), this.nativeDraggable && (f(t2, "dragover", this), f(t2, "dragenter", this)), _t.push(this.el), e2.store && e2.store.get && this.sort(e2.store.get(this) || []), a(this, N());
        }
        function Lt(t2, e2, n2, o2, i2, r2, a2, l2) {
          var s2, c2, u2 = t2[K], d2 = u2.options.onMove;
          return !window.CustomEvent || y || w ? (s2 = document.createEvent("Event")).initEvent("move", true, true) : s2 = new CustomEvent("move", { bubbles: true, cancelable: true }), s2.to = e2, s2.from = t2, s2.dragged = n2, s2.draggedRect = o2, s2.related = i2 || e2, s2.relatedRect = r2 || X(e2), s2.willInsertAfter = l2, s2.originalEvent = a2, t2.dispatchEvent(s2), c2 = d2 ? d2.call(u2, s2, a2) : c2;
        }
        function Kt(t2) {
          t2.draggable = false;
        }
        function Wt() {
          Ot = false;
        }
        function zt(t2) {
          return setTimeout(t2, 0);
        }
        function Gt(t2) {
          return clearTimeout(t2);
        }
        Ht.prototype = { constructor: Ht, _isOutsideThisEl: function(t2) {
          this.el.contains(t2) || t2 === this.el || (bt = null);
        }, _getDirection: function(t2, e2) {
          return "function" == typeof this.options.direction ? this.options.direction.call(this, t2, e2, $) : this.options.direction;
        }, _onTapStart: function(e2) {
          if (e2.cancelable) {
            var n2 = this, o2 = this.el, t2 = this.options, i2 = t2.preventOnFilter, r2 = e2.type, a2 = e2.touches && e2.touches[0] || e2.pointerType && "touch" === e2.pointerType && e2, l2 = (a2 || e2).target, s2 = e2.target.shadowRoot && (e2.path && e2.path[0] || e2.composedPath && e2.composedPath()[0]) || l2, c2 = t2.filter;
            if (!(function(t3) {
              Mt.length = 0;
              var e3 = t3.getElementsByTagName("input"), n3 = e3.length;
              for (; n3--; ) {
                var o3 = e3[n3];
                o3.checked && Mt.push(o3);
              }
            })(o2), !$ && !(/mousedown|pointerdown/.test(r2) && 0 !== e2.button || t2.disabled) && !s2.isContentEditable && (this.nativeDraggable || !u || !l2 || "SELECT" !== l2.tagName.toUpperCase()) && !((l2 = P(l2, t2.draggable, o2, false)) && l2.animated || nt === l2)) {
              if (rt = j(l2), lt = j(l2, t2.draggable), "function" == typeof c2) {
                if (c2.call(this, e2, l2, this)) return Z({ sortable: n2, rootEl: s2, name: "filter", targetEl: l2, toEl: o2, fromEl: o2 }), q("filter", n2, { evt: e2 }), void (i2 && e2.preventDefault());
              } else if (c2 = c2 && c2.split(",").some(function(t3) {
                if (t3 = P(s2, t3.trim(), o2, false)) return Z({ sortable: n2, rootEl: t3, name: "filter", targetEl: l2, fromEl: o2, toEl: o2 }), q("filter", n2, { evt: e2 }), true;
              })) return void (i2 && e2.preventDefault());
              t2.handle && !P(s2, t2.handle, o2, false) || this._prepareDragStart(e2, a2, l2);
            }
          }
        }, _prepareDragStart: function(t2, e2, n2) {
          var o2, i2 = this, r2 = i2.el, a2 = i2.options, l2 = r2.ownerDocument;
          n2 && !$ && n2.parentNode === r2 && (o2 = X(n2), tt = r2, Q = ($ = n2).parentNode, et = $.nextSibling, nt = n2, ct = a2.group, dt = { target: Ht.dragged = $, clientX: (e2 || t2).clientX, clientY: (e2 || t2).clientY }, gt = dt.clientX - o2.left, mt = dt.clientY - o2.top, this._lastX = (e2 || t2).clientX, this._lastY = (e2 || t2).clientY, $.style["will-change"] = "all", o2 = function() {
            q("delayEnded", i2, { evt: t2 }), Ht.eventCanceled ? i2._onDrop() : (i2._disableDelayedDragEvents(), !c && i2.nativeDraggable && ($.draggable = true), i2._triggerDragStart(t2, e2), Z({ sortable: i2, name: "choose", originalEvent: t2 }), k($, a2.chosenClass, true));
          }, a2.ignore.split(",").forEach(function(t3) {
            E($, t3.trim(), Kt);
          }), f(l2, "dragover", Ft), f(l2, "mousemove", Ft), f(l2, "touchmove", Ft), a2.supportPointer ? (f(l2, "pointerup", i2._onDrop), this.nativeDraggable || f(l2, "pointercancel", i2._onDrop)) : (f(l2, "mouseup", i2._onDrop), f(l2, "touchend", i2._onDrop), f(l2, "touchcancel", i2._onDrop)), c && this.nativeDraggable && (this.options.touchStartThreshold = 4, $.draggable = true), q("delayStart", this, { evt: t2 }), !a2.delay || a2.delayOnTouchOnly && !e2 || this.nativeDraggable && (w || y) ? o2() : Ht.eventCanceled ? this._onDrop() : (a2.supportPointer ? (f(l2, "pointerup", i2._disableDelayedDrag), f(l2, "pointercancel", i2._disableDelayedDrag)) : (f(l2, "mouseup", i2._disableDelayedDrag), f(l2, "touchend", i2._disableDelayedDrag), f(l2, "touchcancel", i2._disableDelayedDrag)), f(l2, "mousemove", i2._delayedDragTouchMoveHandler), f(l2, "touchmove", i2._delayedDragTouchMoveHandler), a2.supportPointer && f(l2, "pointermove", i2._delayedDragTouchMoveHandler), i2._dragStartTimer = setTimeout(o2, a2.delay)));
        }, _delayedDragTouchMoveHandler: function(t2) {
          t2 = t2.touches ? t2.touches[0] : t2;
          Math.max(Math.abs(t2.clientX - this._lastX), Math.abs(t2.clientY - this._lastY)) >= Math.floor(this.options.touchStartThreshold / (this.nativeDraggable && window.devicePixelRatio || 1)) && this._disableDelayedDrag();
        }, _disableDelayedDrag: function() {
          $ && Kt($), clearTimeout(this._dragStartTimer), this._disableDelayedDragEvents();
        }, _disableDelayedDragEvents: function() {
          var t2 = this.el.ownerDocument;
          p(t2, "mouseup", this._disableDelayedDrag), p(t2, "touchend", this._disableDelayedDrag), p(t2, "touchcancel", this._disableDelayedDrag), p(t2, "pointerup", this._disableDelayedDrag), p(t2, "pointercancel", this._disableDelayedDrag), p(t2, "mousemove", this._delayedDragTouchMoveHandler), p(t2, "touchmove", this._delayedDragTouchMoveHandler), p(t2, "pointermove", this._delayedDragTouchMoveHandler);
        }, _triggerDragStart: function(t2, e2) {
          e2 = e2 || "touch" == t2.pointerType && t2, !this.nativeDraggable || e2 ? this.options.supportPointer ? f(document, "pointermove", this._onTouchMove) : f(document, e2 ? "touchmove" : "mousemove", this._onTouchMove) : (f($, "dragend", this), f(tt, "dragstart", this._onDragStart));
          try {
            document.selection ? zt(function() {
              document.selection.empty();
            }) : window.getSelection().removeAllRanges();
          } catch (t3) {
          }
        }, _dragStarted: function(t2, e2) {
          var n2;
          Et = false, tt && $ ? (q("dragStarted", this, { evt: e2 }), this.nativeDraggable && f(document, "dragover", jt), n2 = this.options, t2 || k($, n2.dragClass, false), k($, n2.ghostClass, true), Ht.active = this, t2 && this._appendGhost(), Z({ sortable: this, name: "start", originalEvent: e2 })) : this._nulling();
        }, _emulateDragOver: function() {
          if (ht) {
            this._lastX = ht.clientX, this._lastY = ht.clientY, Yt();
            for (var t2 = document.elementFromPoint(ht.clientX, ht.clientY), e2 = t2; t2 && t2.shadowRoot && (t2 = t2.shadowRoot.elementFromPoint(ht.clientX, ht.clientY)) !== e2; ) e2 = t2;
            if ($.parentNode[K]._isOutsideThisEl(t2), e2) do {
              if (e2[K]) {
                if (e2[K]._onDragOver({ clientX: ht.clientX, clientY: ht.clientY, target: t2, rootEl: e2 }) && !this.options.dragoverBubble) break;
              }
            } while (e2 = m(t2 = e2));
            Bt();
          }
        }, _onTouchMove: function(t2) {
          if (dt) {
            var e2 = this.options, n2 = e2.fallbackTolerance, o2 = e2.fallbackOffset, i2 = t2.touches ? t2.touches[0] : t2, r2 = J && D(J, true), a2 = J && r2 && r2.a, l2 = J && r2 && r2.d, e2 = Nt && Dt && S(Dt), a2 = (i2.clientX - dt.clientX + o2.x) / (a2 || 1) + (e2 ? e2[0] - xt[0] : 0) / (a2 || 1), l2 = (i2.clientY - dt.clientY + o2.y) / (l2 || 1) + (e2 ? e2[1] - xt[1] : 0) / (l2 || 1);
            if (!Ht.active && !Et) {
              if (n2 && Math.max(Math.abs(i2.clientX - this._lastX), Math.abs(i2.clientY - this._lastY)) < n2) return;
              this._onDragStart(t2, true);
            }
            J && (r2 ? (r2.e += a2 - (ft || 0), r2.f += l2 - (pt || 0)) : r2 = { a: 1, b: 0, c: 0, d: 1, e: a2, f: l2 }, r2 = "matrix(".concat(r2.a, ",").concat(r2.b, ",").concat(r2.c, ",").concat(r2.d, ",").concat(r2.e, ",").concat(r2.f, ")"), R(J, "webkitTransform", r2), R(J, "mozTransform", r2), R(J, "msTransform", r2), R(J, "transform", r2), ft = a2, pt = l2, ht = i2), t2.cancelable && t2.preventDefault();
          }
        }, _appendGhost: function() {
          if (!J) {
            var t2 = this.options.fallbackOnBody ? document.body : tt, e2 = X($, true, Nt, true, t2), n2 = this.options;
            if (Nt) {
              for (Dt = t2; "static" === R(Dt, "position") && "none" === R(Dt, "transform") && Dt !== document; ) Dt = Dt.parentNode;
              Dt !== document.body && Dt !== document.documentElement ? (Dt === document && (Dt = O()), e2.top += Dt.scrollTop, e2.left += Dt.scrollLeft) : Dt = O(), xt = S(Dt);
            }
            k(J = $.cloneNode(true), n2.ghostClass, false), k(J, n2.fallbackClass, true), k(J, n2.dragClass, true), R(J, "transition", ""), R(J, "transform", ""), R(J, "box-sizing", "border-box"), R(J, "margin", 0), R(J, "top", e2.top), R(J, "left", e2.left), R(J, "width", e2.width), R(J, "height", e2.height), R(J, "opacity", "0.8"), R(J, "position", Nt ? "absolute" : "fixed"), R(J, "zIndex", "100000"), R(J, "pointerEvents", "none"), Ht.ghost = J, t2.appendChild(J), R(J, "transform-origin", gt / parseInt(J.style.width) * 100 + "% " + mt / parseInt(J.style.height) * 100 + "%");
          }
        }, _onDragStart: function(t2, e2) {
          var n2 = this, o2 = t2.dataTransfer, i2 = n2.options;
          q("dragStart", this, { evt: t2 }), Ht.eventCanceled ? this._onDrop() : (q("setupClone", this), Ht.eventCanceled || ((ot = T($)).removeAttribute("id"), ot.draggable = false, ot.style["will-change"] = "", this._hideClone(), k(ot, this.options.chosenClass, false), Ht.clone = ot), n2.cloneId = zt(function() {
            q("clone", n2), Ht.eventCanceled || (n2.options.removeCloneOnHide || tt.insertBefore(ot, $), n2._hideClone(), Z({ sortable: n2, name: "clone" }));
          }), e2 || k($, i2.dragClass, true), e2 ? (St = true, n2._loopId = setInterval(n2._emulateDragOver, 50)) : (p(document, "mouseup", n2._onDrop), p(document, "touchend", n2._onDrop), p(document, "touchcancel", n2._onDrop), o2 && (o2.effectAllowed = "move", i2.setData && i2.setData.call(n2, o2, $)), f(document, "drop", n2), R($, "transform", "translateZ(0)")), Et = true, n2._dragStartId = zt(n2._dragStarted.bind(n2, e2, t2)), f(document, "selectstart", n2), vt = true, window.getSelection().removeAllRanges(), u && R(document.body, "user-select", "none"));
        }, _onDragOver: function(n2) {
          var o2, i2, r2, t2, e2, a2 = this.el, l2 = n2.target, s2 = this.options, c2 = s2.group, u2 = Ht.active, d2 = ct === c2, h2 = s2.sort, f2 = ut || u2, p2 = this, g2 = false;
          if (!Ot) {
            if (void 0 !== n2.preventDefault && n2.cancelable && n2.preventDefault(), l2 = P(l2, s2.draggable, a2, true), O2("dragOver"), Ht.eventCanceled) return g2;
            if ($.contains(n2.target) || l2.animated && l2.animatingX && l2.animatingY || p2._ignoreWhileAnimating === l2) return A2(false);
            if (St = false, u2 && !s2.disabled && (d2 ? h2 || (i2 = Q !== tt) : ut === this || (this.lastPutMode = ct.checkPull(this, u2, $, n2)) && c2.checkPut(this, u2, $, n2))) {
              if (r2 = "vertical" === this._getDirection(n2, l2), o2 = X($), O2("dragOverValid"), Ht.eventCanceled) return g2;
              if (i2) return Q = tt, M2(), this._hideClone(), O2("revert"), Ht.eventCanceled || (et ? tt.insertBefore($, et) : tt.appendChild($)), A2(true);
              var m2 = F(a2, s2.draggable);
              if (m2 && (S2 = n2, c2 = r2, x2 = X(F((E2 = this).el, E2.options.draggable)), E2 = L(E2.el, E2.options, J), !(c2 ? S2.clientX > E2.right + 10 || S2.clientY > x2.bottom && S2.clientX > x2.left : S2.clientY > E2.bottom + 10 || S2.clientX > x2.right && S2.clientY > x2.top) || m2.animated)) {
                if (m2 && (t2 = n2, e2 = r2, C2 = X(B((_2 = this).el, 0, _2.options, true)), _2 = L(_2.el, _2.options, J), e2 ? t2.clientX < _2.left - 10 || t2.clientY < C2.top && t2.clientX < C2.right : t2.clientY < _2.top - 10 || t2.clientY < C2.bottom && t2.clientX < C2.left)) {
                  var v2 = B(a2, 0, s2, true);
                  if (v2 === $) return A2(false);
                  if (D2 = X(l2 = v2), false !== Lt(tt, a2, $, o2, l2, D2, n2, false)) return M2(), a2.insertBefore($, v2), Q = a2, N2(), A2(true);
                } else if (l2.parentNode === a2) {
                  var b2, y2, w2, D2 = X(l2), E2 = $.parentNode !== a2, S2 = (S2 = $.animated && $.toRect || o2, x2 = l2.animated && l2.toRect || D2, _2 = (e2 = r2) ? S2.left : S2.top, t2 = e2 ? S2.right : S2.bottom, C2 = e2 ? S2.width : S2.height, v2 = e2 ? x2.left : x2.top, S2 = e2 ? x2.right : x2.bottom, x2 = e2 ? x2.width : x2.height, !(_2 === v2 || t2 === S2 || _2 + C2 / 2 === v2 + x2 / 2)), _2 = r2 ? "top" : "left", C2 = Y(l2, "top", "top") || Y($, "top", "top"), v2 = C2 ? C2.scrollTop : void 0;
                  if (bt !== l2 && (y2 = D2[_2], Ct = false, Tt = !S2 && s2.invertSwap || E2), 0 !== (b2 = (function(t3, e3, n3, o3, i3, r3, a3, l3) {
                    var s3 = o3 ? t3.clientY : t3.clientX, c3 = o3 ? n3.height : n3.width, t3 = o3 ? n3.top : n3.left, o3 = o3 ? n3.bottom : n3.right, n3 = false;
                    if (!a3) {
                      if (l3 && wt < c3 * i3) {
                        if (Ct = !Ct && (1 === yt ? t3 + c3 * r3 / 2 < s3 : s3 < o3 - c3 * r3 / 2) ? true : Ct) n3 = true;
                        else if (1 === yt ? s3 < t3 + wt : o3 - wt < s3) return -yt;
                      } else if (t3 + c3 * (1 - i3) / 2 < s3 && s3 < o3 - c3 * (1 - i3) / 2) return (function(t4) {
                        return j($) < j(t4) ? 1 : -1;
                      })(e3);
                    }
                    if ((n3 = n3 || a3) && (s3 < t3 + c3 * r3 / 2 || o3 - c3 * r3 / 2 < s3)) return t3 + c3 / 2 < s3 ? 1 : -1;
                    return 0;
                  })(n2, l2, D2, r2, S2 ? 1 : s2.swapThreshold, null == s2.invertedSwapThreshold ? s2.swapThreshold : s2.invertedSwapThreshold, Tt, bt === l2))) for (var T2 = j($); (w2 = Q.children[T2 -= b2]) && ("none" === R(w2, "display") || w2 === J); ) ;
                  if (0 === b2 || w2 === l2) return A2(false);
                  yt = b2;
                  var x2 = (bt = l2).nextElementSibling, E2 = false, S2 = Lt(tt, a2, $, o2, l2, D2, n2, E2 = 1 === b2);
                  if (false !== S2) return 1 !== S2 && -1 !== S2 || (E2 = 1 === S2), Ot = true, setTimeout(Wt, 30), M2(), E2 && !x2 ? a2.appendChild($) : l2.parentNode.insertBefore($, E2 ? x2 : l2), C2 && H(C2, 0, v2 - C2.scrollTop), Q = $.parentNode, void 0 === y2 || Tt || (wt = Math.abs(y2 - X(l2)[_2])), N2(), A2(true);
                }
              } else {
                if (m2 === $) return A2(false);
                if ((l2 = m2 && a2 === n2.target ? m2 : l2) && (D2 = X(l2)), false !== Lt(tt, a2, $, o2, l2, D2, n2, !!l2)) return M2(), m2 && m2.nextSibling ? a2.insertBefore($, m2.nextSibling) : a2.appendChild($), Q = a2, N2(), A2(true);
              }
              if (a2.contains($)) return A2(false);
            }
            return false;
          }
          function O2(t3, e3) {
            q(t3, p2, I({ evt: n2, isOwner: d2, axis: r2 ? "vertical" : "horizontal", revert: i2, dragRect: o2, targetRect: D2, canSort: h2, fromSortable: f2, target: l2, completed: A2, onMove: function(t4, e4) {
              return Lt(tt, a2, $, o2, t4, X(t4), n2, e4);
            }, changed: N2 }, e3));
          }
          function M2() {
            O2("dragOverAnimationCapture"), p2.captureAnimationState(), p2 !== f2 && f2.captureAnimationState();
          }
          function A2(t3) {
            return O2("dragOverCompleted", { insertion: t3 }), t3 && (d2 ? u2._hideClone() : u2._showClone(p2), p2 !== f2 && (k($, (ut || u2).options.ghostClass, false), k($, s2.ghostClass, true)), ut !== p2 && p2 !== Ht.active ? ut = p2 : p2 === Ht.active && ut && (ut = null), f2 === p2 && (p2._ignoreWhileAnimating = l2), p2.animateAll(function() {
              O2("dragOverAnimationComplete"), p2._ignoreWhileAnimating = null;
            }), p2 !== f2 && (f2.animateAll(), f2._ignoreWhileAnimating = null)), (l2 === $ && !$.animated || l2 === a2 && !l2.animated) && (bt = null), s2.dragoverBubble || n2.rootEl || l2 === document || ($.parentNode[K]._isOutsideThisEl(n2.target), t3 || Ft(n2)), !s2.dragoverBubble && n2.stopPropagation && n2.stopPropagation(), g2 = true;
          }
          function N2() {
            at = j($), st = j($, s2.draggable), Z({ sortable: p2, name: "change", toEl: a2, newIndex: at, newDraggableIndex: st, originalEvent: n2 });
          }
        }, _ignoreWhileAnimating: null, _offMoveEvents: function() {
          p(document, "mousemove", this._onTouchMove), p(document, "touchmove", this._onTouchMove), p(document, "pointermove", this._onTouchMove), p(document, "dragover", Ft), p(document, "mousemove", Ft), p(document, "touchmove", Ft);
        }, _offUpEvents: function() {
          var t2 = this.el.ownerDocument;
          p(t2, "mouseup", this._onDrop), p(t2, "touchend", this._onDrop), p(t2, "pointerup", this._onDrop), p(t2, "pointercancel", this._onDrop), p(t2, "touchcancel", this._onDrop), p(document, "selectstart", this);
        }, _onDrop: function(t2) {
          var e2 = this.el, n2 = this.options;
          at = j($), st = j($, n2.draggable), q("drop", this, { evt: t2 }), Q = $ && $.parentNode, at = j($), st = j($, n2.draggable), Ht.eventCanceled || (Ct = Tt = Et = false, clearInterval(this._loopId), clearTimeout(this._dragStartTimer), Gt(this.cloneId), Gt(this._dragStartId), this.nativeDraggable && (p(document, "drop", this), p(e2, "dragstart", this._onDragStart)), this._offMoveEvents(), this._offUpEvents(), u && R(document.body, "user-select", ""), R($, "transform", ""), t2 && (vt && (t2.cancelable && t2.preventDefault(), n2.dropBubble || t2.stopPropagation()), J && J.parentNode && J.parentNode.removeChild(J), (tt === Q || ut && "clone" !== ut.lastPutMode) && ot && ot.parentNode && ot.parentNode.removeChild(ot), $ && (this.nativeDraggable && p($, "dragend", this), Kt($), $.style["will-change"] = "", vt && !Et && k($, (ut || this).options.ghostClass, false), k($, this.options.chosenClass, false), Z({ sortable: this, name: "unchoose", toEl: Q, newIndex: null, newDraggableIndex: null, originalEvent: t2 }), tt !== Q ? (0 <= at && (Z({ rootEl: Q, name: "add", toEl: Q, fromEl: tt, originalEvent: t2 }), Z({ sortable: this, name: "remove", toEl: Q, originalEvent: t2 }), Z({ rootEl: Q, name: "sort", toEl: Q, fromEl: tt, originalEvent: t2 }), Z({ sortable: this, name: "sort", toEl: Q, originalEvent: t2 })), ut && ut.save()) : at !== rt && 0 <= at && (Z({ sortable: this, name: "update", toEl: Q, originalEvent: t2 }), Z({ sortable: this, name: "sort", toEl: Q, originalEvent: t2 })), Ht.active && (null != at && -1 !== at || (at = rt, st = lt), Z({ sortable: this, name: "end", toEl: Q, originalEvent: t2 }), this.save())))), this._nulling();
        }, _nulling: function() {
          q("nulling", this), tt = $ = Q = J = et = ot = nt = it = dt = ht = vt = at = st = rt = lt = bt = yt = ut = ct = Ht.dragged = Ht.ghost = Ht.clone = Ht.active = null;
          var e2 = this.el;
          Mt.forEach(function(t2) {
            e2.contains(t2) && (t2.checked = true);
          }), Mt.length = ft = pt = 0;
        }, handleEvent: function(t2) {
          switch (t2.type) {
            case "drop":
            case "dragend":
              this._onDrop(t2);
              break;
            case "dragenter":
            case "dragover":
              $ && (this._onDragOver(t2), (function(t3) {
                t3.dataTransfer && (t3.dataTransfer.dropEffect = "move");
                t3.cancelable && t3.preventDefault();
              })(t2));
              break;
            case "selectstart":
              t2.preventDefault();
          }
        }, toArray: function() {
          for (var t2, e2 = [], n2 = this.el.children, o2 = 0, i2 = n2.length, r2 = this.options; o2 < i2; o2++) P(t2 = n2[o2], r2.draggable, this.el, false) && e2.push(t2.getAttribute(r2.dataIdAttr) || (function(t3) {
            var e3 = t3.tagName + t3.className + t3.src + t3.href + t3.textContent, n3 = e3.length, o3 = 0;
            for (; n3--; ) o3 += e3.charCodeAt(n3);
            return o3.toString(36);
          })(t2));
          return e2;
        }, sort: function(t2, e2) {
          var n2 = {}, o2 = this.el;
          this.toArray().forEach(function(t3, e3) {
            e3 = o2.children[e3];
            P(e3, this.options.draggable, o2, false) && (n2[t3] = e3);
          }, this), e2 && this.captureAnimationState(), t2.forEach(function(t3) {
            n2[t3] && (o2.removeChild(n2[t3]), o2.appendChild(n2[t3]));
          }), e2 && this.animateAll();
        }, save: function() {
          var t2 = this.options.store;
          t2 && t2.set && t2.set(this);
        }, closest: function(t2, e2) {
          return P(t2, e2 || this.options.draggable, this.el, false);
        }, option: function(t2, e2) {
          var n2 = this.options;
          if (void 0 === e2) return n2[t2];
          var o2 = G.modifyOption(this, t2, e2);
          n2[t2] = void 0 !== o2 ? o2 : e2, "group" === t2 && Xt(n2);
        }, destroy: function() {
          q("destroy", this);
          var t2 = this.el;
          t2[K] = null, p(t2, "mousedown", this._onTapStart), p(t2, "touchstart", this._onTapStart), p(t2, "pointerdown", this._onTapStart), this.nativeDraggable && (p(t2, "dragover", this), p(t2, "dragenter", this)), Array.prototype.forEach.call(t2.querySelectorAll("[draggable]"), function(t3) {
            t3.removeAttribute("draggable");
          }), this._onDrop(), this._disableDelayedDragEvents(), _t.splice(_t.indexOf(this.el), 1), this.el = t2 = null;
        }, _hideClone: function() {
          it || (q("hideClone", this), Ht.eventCanceled || (R(ot, "display", "none"), this.options.removeCloneOnHide && ot.parentNode && ot.parentNode.removeChild(ot), it = true));
        }, _showClone: function(t2) {
          "clone" === t2.lastPutMode ? it && (q("showClone", this), Ht.eventCanceled || ($.parentNode != tt || this.options.group.revertClone ? et ? tt.insertBefore(ot, et) : tt.appendChild(ot) : tt.insertBefore(ot, $), this.options.group.revertClone && this.animate($, ot), R(ot, "display", ""), it = false)) : this._hideClone();
        } }, At && f(document, "touchmove", function(t2) {
          (Ht.active || Et) && t2.cancelable && t2.preventDefault();
        }), Ht.utils = { on: f, off: p, css: R, find: E, is: function(t2, e2) {
          return !!P(t2, e2, t2, false);
        }, extend: function(t2, e2) {
          if (t2 && e2) for (var n2 in e2) e2.hasOwnProperty(n2) && (t2[n2] = e2[n2]);
          return t2;
        }, throttle: C, closest: P, toggleClass: k, clone: T, index: j, nextTick: zt, cancelNextTick: Gt, detectDirection: Rt, getChild: B, expando: K }, Ht.get = function(t2) {
          return t2[K];
        }, Ht.mount = function() {
          for (var t2 = arguments.length, e2 = new Array(t2), n2 = 0; n2 < t2; n2++) e2[n2] = arguments[n2];
          (e2 = e2[0].constructor === Array ? e2[0] : e2).forEach(function(t3) {
            if (!t3.prototype || !t3.prototype.constructor) throw "Sortable: Mounted plugin must be a constructor function, not ".concat({}.toString.call(t3));
            t3.utils && (Ht.utils = I(I({}, Ht.utils), t3.utils)), G.mount(t3);
          });
        }, Ht.create = function(t2, e2) {
          return new Ht(t2, e2);
        };
        var Ut, qt, Vt, Zt, $t, Qt, Jt = [], te = !(Ht.version = "1.15.7");
        function ee() {
          Jt.forEach(function(t2) {
            clearInterval(t2.pid);
          }), Jt = [];
        }
        function ne() {
          clearInterval(Qt);
        }
        var oe, ie = C(function(n2, t2, e2, o2) {
          if (t2.scroll) {
            var i2, r2 = (n2.touches ? n2.touches[0] : n2).clientX, a2 = (n2.touches ? n2.touches[0] : n2).clientY, l2 = t2.scrollSensitivity, s2 = t2.scrollSpeed, c2 = O(), u2 = false;
            qt !== e2 && (qt = e2, ee(), Ut = t2.scroll, i2 = t2.scrollFn, true === Ut && (Ut = M(e2, true)));
            var d2 = 0, h2 = Ut;
            do {
              var f2 = h2, p2 = X(f2), g2 = p2.top, m2 = p2.bottom, v2 = p2.left, b2 = p2.right, y2 = p2.width, w2 = p2.height, D2 = void 0, E2 = void 0, S2 = f2.scrollWidth, _2 = f2.scrollHeight, C2 = R(f2), T2 = f2.scrollLeft, p2 = f2.scrollTop, E2 = f2 === c2 ? (D2 = y2 < S2 && ("auto" === C2.overflowX || "scroll" === C2.overflowX || "visible" === C2.overflowX), w2 < _2 && ("auto" === C2.overflowY || "scroll" === C2.overflowY || "visible" === C2.overflowY)) : (D2 = y2 < S2 && ("auto" === C2.overflowX || "scroll" === C2.overflowX), w2 < _2 && ("auto" === C2.overflowY || "scroll" === C2.overflowY)), T2 = D2 && (Math.abs(b2 - r2) <= l2 && T2 + y2 < S2) - (Math.abs(v2 - r2) <= l2 && !!T2), p2 = E2 && (Math.abs(m2 - a2) <= l2 && p2 + w2 < _2) - (Math.abs(g2 - a2) <= l2 && !!p2);
              if (!Jt[d2]) for (var x2 = 0; x2 <= d2; x2++) Jt[x2] || (Jt[x2] = {});
              Jt[d2].vx == T2 && Jt[d2].vy == p2 && Jt[d2].el === f2 || (Jt[d2].el = f2, Jt[d2].vx = T2, Jt[d2].vy = p2, clearInterval(Jt[d2].pid), 0 == T2 && 0 == p2 || (u2 = true, Jt[d2].pid = setInterval(function() {
                o2 && 0 === this.layer && Ht.active._onTouchMove($t);
                var t3 = Jt[this.layer].vy ? Jt[this.layer].vy * s2 : 0, e3 = Jt[this.layer].vx ? Jt[this.layer].vx * s2 : 0;
                "function" == typeof i2 && "continue" !== i2.call(Ht.dragged.parentNode[K], e3, t3, n2, $t, Jt[this.layer].el) || H(Jt[this.layer].el, e3, t3);
              }.bind({ layer: d2 }), 24))), d2++;
            } while (t2.bubbleScroll && h2 !== c2 && (h2 = M(h2, false)));
            te = u2;
          }
        }, 30), n = function(t2) {
          var e2 = t2.originalEvent, n2 = t2.putSortable, o2 = t2.dragEl, i2 = t2.activeSortable, r2 = t2.dispatchSortableEvent, a2 = t2.hideGhostForTarget, t2 = t2.unhideGhostForTarget;
          e2 && (i2 = n2 || i2, a2(), e2 = e2.changedTouches && e2.changedTouches.length ? e2.changedTouches[0] : e2, e2 = document.elementFromPoint(e2.clientX, e2.clientY), t2(), i2 && !i2.el.contains(e2) && (r2("spill"), this.onSpill({ dragEl: o2, putSortable: n2 })));
        };
        function re() {
        }
        function ae() {
        }
        re.prototype = { startIndex: null, dragStart: function(t2) {
          t2 = t2.oldDraggableIndex;
          this.startIndex = t2;
        }, onSpill: function(t2) {
          var e2 = t2.dragEl, n2 = t2.putSortable;
          this.sortable.captureAnimationState(), n2 && n2.captureAnimationState();
          t2 = B(this.sortable.el, this.startIndex, this.options);
          t2 ? this.sortable.el.insertBefore(e2, t2) : this.sortable.el.appendChild(e2), this.sortable.animateAll(), n2 && n2.animateAll();
        }, drop: n }, a(re, { pluginName: "revertOnSpill" }), ae.prototype = { onSpill: function(t2) {
          var e2 = t2.dragEl, t2 = t2.putSortable || this.sortable;
          t2.captureAnimationState(), e2.parentNode && e2.parentNode.removeChild(e2), t2.animateAll();
        }, drop: n }, a(ae, { pluginName: "removeOnSpill" });
        var le, se, ce, ue, de, he = [], fe = [], pe = false, ge = false, me = false;
        function ve(n2, o2) {
          fe.forEach(function(t2, e2) {
            e2 = o2.children[t2.sortableIndex + (n2 ? Number(e2) : 0)];
            e2 ? o2.insertBefore(t2, e2) : o2.appendChild(t2);
          });
        }
        function be() {
          he.forEach(function(t2) {
            t2 !== ce && t2.parentNode && t2.parentNode.removeChild(t2);
          });
        }
        return Ht.mount(new function() {
          function t2() {
            for (var t3 in this.defaults = { scroll: true, forceAutoScrollFallback: false, scrollSensitivity: 30, scrollSpeed: 10, bubbleScroll: true }, this) "_" === t3.charAt(0) && "function" == typeof this[t3] && (this[t3] = this[t3].bind(this));
          }
          return t2.prototype = { dragStarted: function(t3) {
            t3 = t3.originalEvent;
            this.sortable.nativeDraggable ? f(document, "dragover", this._handleAutoScroll) : this.options.supportPointer ? f(document, "pointermove", this._handleFallbackAutoScroll) : t3.touches ? f(document, "touchmove", this._handleFallbackAutoScroll) : f(document, "mousemove", this._handleFallbackAutoScroll);
          }, dragOverCompleted: function(t3) {
            t3 = t3.originalEvent;
            this.options.dragOverBubble || t3.rootEl || this._handleAutoScroll(t3);
          }, drop: function() {
            this.sortable.nativeDraggable ? p(document, "dragover", this._handleAutoScroll) : (p(document, "pointermove", this._handleFallbackAutoScroll), p(document, "touchmove", this._handleFallbackAutoScroll), p(document, "mousemove", this._handleFallbackAutoScroll)), ne(), ee(), clearTimeout(v), v = void 0;
          }, nulling: function() {
            $t = qt = Ut = te = Qt = Vt = Zt = null, Jt.length = 0;
          }, _handleFallbackAutoScroll: function(t3) {
            this._handleAutoScroll(t3, true);
          }, _handleAutoScroll: function(e2, n2) {
            var o2, i2 = this, r2 = (e2.touches ? e2.touches[0] : e2).clientX, a2 = (e2.touches ? e2.touches[0] : e2).clientY, t3 = document.elementFromPoint(r2, a2);
            $t = e2, n2 || this.options.forceAutoScrollFallback || w || y || u ? (ie(e2, this.options, t3, n2), o2 = M(t3, true), !te || Qt && r2 === Vt && a2 === Zt || (Qt && ne(), Qt = setInterval(function() {
              var t4 = M(document.elementFromPoint(r2, a2), true);
              t4 !== o2 && (o2 = t4, ee()), ie(e2, i2.options, t4, n2);
            }, 10), Vt = r2, Zt = a2)) : this.options.bubbleScroll && M(t3, true) !== O() ? ie(e2, this.options, M(t3, false), false) : ee();
          } }, a(t2, { pluginName: "scroll", initializeByDefault: true });
        }()), Ht.mount(ae, re), Ht.mount(new function() {
          function t2() {
            this.defaults = { swapClass: "sortable-swap-highlight" };
          }
          return t2.prototype = { dragStart: function(t3) {
            t3 = t3.dragEl;
            oe = t3;
          }, dragOverValid: function(t3) {
            var e2 = t3.completed, n2 = t3.target, o2 = t3.onMove, i2 = t3.activeSortable, r2 = t3.changed, a2 = t3.cancel;
            i2.options.swap && (t3 = this.sortable.el, i2 = this.options, n2 && n2 !== t3 && (t3 = oe, oe = false !== o2(n2) ? (k(n2, i2.swapClass, true), n2) : null, t3 && t3 !== oe && k(t3, i2.swapClass, false)), r2(), e2(true), a2());
          }, drop: function(t3) {
            var e2, n2, o2 = t3.activeSortable, i2 = t3.putSortable, r2 = t3.dragEl, a2 = i2 || this.sortable, l2 = this.options;
            oe && k(oe, l2.swapClass, false), oe && (l2.swap || i2 && i2.options.swap) && r2 !== oe && (a2.captureAnimationState(), a2 !== o2 && o2.captureAnimationState(), n2 = oe, t3 = (e2 = r2).parentNode, l2 = n2.parentNode, t3 && l2 && !t3.isEqualNode(n2) && !l2.isEqualNode(e2) && (i2 = j(e2), r2 = j(n2), t3.isEqualNode(l2) && i2 < r2 && r2++, t3.insertBefore(n2, t3.children[i2]), l2.insertBefore(e2, l2.children[r2])), a2.animateAll(), a2 !== o2 && o2.animateAll());
          }, nulling: function() {
            oe = null;
          } }, a(t2, { pluginName: "swap", eventProperties: function() {
            return { swapItem: oe };
          } });
        }()), Ht.mount(new function() {
          function t2(o2) {
            for (var t3 in this) "_" === t3.charAt(0) && "function" == typeof this[t3] && (this[t3] = this[t3].bind(this));
            o2.options.avoidImplicitDeselect || (o2.options.supportPointer ? f(document, "pointerup", this._deselectMultiDrag) : (f(document, "mouseup", this._deselectMultiDrag), f(document, "touchend", this._deselectMultiDrag))), f(document, "keydown", this._checkKeyDown), f(document, "keyup", this._checkKeyUp), this.defaults = { selectedClass: "sortable-selected", multiDragKey: null, avoidImplicitDeselect: false, setData: function(t4, e2) {
              var n2 = "";
              he.length && se === o2 ? he.forEach(function(t5, e3) {
                n2 += (e3 ? ", " : "") + t5.textContent;
              }) : n2 = e2.textContent, t4.setData("Text", n2);
            } };
          }
          return t2.prototype = { multiDragKeyDown: false, isMultiDrag: false, delayStartGlobal: function(t3) {
            t3 = t3.dragEl;
            ce = t3;
          }, delayEnded: function() {
            this.isMultiDrag = ~he.indexOf(ce);
          }, setupClone: function(t3) {
            var e2 = t3.sortable, t3 = t3.cancel;
            if (this.isMultiDrag) {
              for (var n2 = 0; n2 < he.length; n2++) fe.push(T(he[n2])), fe[n2].sortableIndex = he[n2].sortableIndex, fe[n2].draggable = false, fe[n2].style["will-change"] = "", k(fe[n2], this.options.selectedClass, false), he[n2] === ce && k(fe[n2], this.options.chosenClass, false);
              e2._hideClone(), t3();
            }
          }, clone: function(t3) {
            var e2 = t3.sortable, n2 = t3.rootEl, o2 = t3.dispatchSortableEvent, t3 = t3.cancel;
            this.isMultiDrag && (this.options.removeCloneOnHide || he.length && se === e2 && (ve(true, n2), o2("clone"), t3()));
          }, showClone: function(t3) {
            var e2 = t3.cloneNowShown, n2 = t3.rootEl, t3 = t3.cancel;
            this.isMultiDrag && (ve(false, n2), fe.forEach(function(t4) {
              R(t4, "display", "");
            }), e2(), de = false, t3());
          }, hideClone: function(t3) {
            var e2 = this, n2 = (t3.sortable, t3.cloneNowHidden), t3 = t3.cancel;
            this.isMultiDrag && (fe.forEach(function(t4) {
              R(t4, "display", "none"), e2.options.removeCloneOnHide && t4.parentNode && t4.parentNode.removeChild(t4);
            }), n2(), de = true, t3());
          }, dragStartGlobal: function(t3) {
            t3.sortable;
            !this.isMultiDrag && se && se.multiDrag._deselectMultiDrag(), he.forEach(function(t4) {
              t4.sortableIndex = j(t4);
            }), he = he.sort(function(t4, e2) {
              return t4.sortableIndex - e2.sortableIndex;
            }), me = true;
          }, dragStarted: function(t3) {
            var e2, n2 = this, t3 = t3.sortable;
            this.isMultiDrag && (this.options.sort && (t3.captureAnimationState(), this.options.animation && (he.forEach(function(t4) {
              t4 !== ce && R(t4, "position", "absolute");
            }), e2 = X(ce, false, true, true), he.forEach(function(t4) {
              t4 !== ce && x(t4, e2);
            }), pe = ge = true)), t3.animateAll(function() {
              pe = ge = false, n2.options.animation && he.forEach(function(t4) {
                A(t4);
              }), n2.options.sort && be();
            }));
          }, dragOver: function(t3) {
            var e2 = t3.target, n2 = t3.completed, t3 = t3.cancel;
            ge && ~he.indexOf(e2) && (n2(false), t3());
          }, revert: function(t3) {
            var n2, o2, e2 = t3.fromSortable, i2 = t3.rootEl, r2 = t3.sortable, a2 = t3.dragRect;
            1 < he.length && (he.forEach(function(t4) {
              r2.addAnimationState({ target: t4, rect: ge ? X(t4) : a2 }), A(t4), t4.fromRect = a2, e2.removeAnimationState(t4);
            }), ge = false, n2 = !this.options.removeCloneOnHide, o2 = i2, he.forEach(function(t4, e3) {
              e3 = o2.children[t4.sortableIndex + (n2 ? Number(e3) : 0)];
              e3 ? o2.insertBefore(t4, e3) : o2.appendChild(t4);
            }));
          }, dragOverCompleted: function(t3) {
            var e2, n2 = t3.sortable, o2 = t3.isOwner, i2 = t3.insertion, r2 = t3.activeSortable, a2 = t3.parentEl, l2 = t3.putSortable, t3 = this.options;
            i2 && (o2 && r2._hideClone(), pe = false, t3.animation && 1 < he.length && (ge || !o2 && !r2.options.sort && !l2) && (e2 = X(ce, false, true, true), he.forEach(function(t4) {
              t4 !== ce && (x(t4, e2), a2.appendChild(t4));
            }), ge = true), o2 || (ge || be(), 1 < he.length ? (o2 = de, r2._showClone(n2), r2.options.animation && !de && o2 && fe.forEach(function(t4) {
              r2.addAnimationState({ target: t4, rect: ue }), t4.fromRect = ue, t4.thisAnimationDuration = null;
            })) : r2._showClone(n2)));
          }, dragOverAnimationCapture: function(t3) {
            var e2 = t3.dragRect, n2 = t3.isOwner, t3 = t3.activeSortable;
            he.forEach(function(t4) {
              t4.thisAnimationDuration = null;
            }), t3.options.animation && !n2 && t3.multiDrag.isMultiDrag && (ue = a({}, e2), e2 = D(ce, true), ue.top -= e2.f, ue.left -= e2.e);
          }, dragOverAnimationComplete: function() {
            ge && (ge = false, be());
          }, drop: function(t3) {
            var o2, i2, r2, a2, n2, e2, l2, s2 = t3.originalEvent, c2 = t3.rootEl, u2 = t3.parentEl, d2 = t3.sortable, h2 = t3.dispatchSortableEvent, f2 = t3.oldIndex, t3 = t3.putSortable, p2 = t3 || this.sortable;
            s2 && (o2 = this.options, i2 = u2.children, me || (o2.multiDragKey && !this.multiDragKeyDown && this._deselectMultiDrag(), k(ce, o2.selectedClass, !~he.indexOf(ce)), ~he.indexOf(ce) ? (he.splice(he.indexOf(ce), 1), le = null, U({ sortable: d2, rootEl: c2, name: "deselect", targetEl: ce, originalEvent: s2 })) : (he.push(ce), U({ sortable: d2, rootEl: c2, name: "select", targetEl: ce, originalEvent: s2 }), s2.shiftKey && le && d2.el.contains(le) ? (r2 = j(le), a2 = j(ce), ~r2 && ~a2 && r2 !== a2 && (function() {
              for (var e3, t4 = r2 < a2 ? (e3 = r2, a2) : (e3 = a2, r2 + 1), n3 = o2.filter; e3 < t4; e3++) ~he.indexOf(i2[e3]) || P(i2[e3], o2.draggable, u2, false) && (n3 && ("function" == typeof n3 ? n3.call(d2, s2, i2[e3], d2) : n3.split(",").some(function(t5) {
                return P(i2[e3], t5.trim(), u2, false);
              })) || (k(i2[e3], o2.selectedClass, true), he.push(i2[e3]), U({ sortable: d2, rootEl: c2, name: "select", targetEl: i2[e3], originalEvent: s2 })));
            })()) : le = ce, se = p2)), me && this.isMultiDrag && (ge = false, (u2[K].options.sort || u2 !== c2) && 1 < he.length && (n2 = X(ce), e2 = j(ce, ":not(." + this.options.selectedClass + ")"), !pe && o2.animation && (ce.thisAnimationDuration = null), p2.captureAnimationState(), pe || (o2.animation && (ce.fromRect = n2, he.forEach(function(t4) {
              var e3;
              t4.thisAnimationDuration = null, t4 !== ce && (e3 = ge ? X(t4) : n2, t4.fromRect = e3, p2.addAnimationState({ target: t4, rect: e3 }));
            })), be(), he.forEach(function(t4) {
              i2[e2] ? u2.insertBefore(t4, i2[e2]) : u2.appendChild(t4), e2++;
            }), f2 === j(ce) && (l2 = false, he.forEach(function(t4) {
              t4.sortableIndex !== j(t4) && (l2 = true);
            }), l2 && (h2("update"), h2("sort")))), he.forEach(function(t4) {
              A(t4);
            }), p2.animateAll()), se = p2), (c2 === u2 || t3 && "clone" !== t3.lastPutMode) && fe.forEach(function(t4) {
              t4.parentNode && t4.parentNode.removeChild(t4);
            }));
          }, nullingGlobal: function() {
            this.isMultiDrag = me = false, fe.length = 0;
          }, destroyGlobal: function() {
            this._deselectMultiDrag(), p(document, "pointerup", this._deselectMultiDrag), p(document, "mouseup", this._deselectMultiDrag), p(document, "touchend", this._deselectMultiDrag), p(document, "keydown", this._checkKeyDown), p(document, "keyup", this._checkKeyUp);
          }, _deselectMultiDrag: function(t3) {
            if (!(void 0 !== me && me || se !== this.sortable || t3 && P(t3.target, this.options.draggable, this.sortable.el, false) || t3 && 0 !== t3.button)) for (; he.length; ) {
              var e2 = he[0];
              k(e2, this.options.selectedClass, false), he.shift(), U({ sortable: this.sortable, rootEl: this.sortable.el, name: "deselect", targetEl: e2, originalEvent: t3 });
            }
          }, _checkKeyDown: function(t3) {
            t3.key === this.options.multiDragKey && (this.multiDragKeyDown = true);
          }, _checkKeyUp: function(t3) {
            t3.key === this.options.multiDragKey && (this.multiDragKeyDown = false);
          } }, a(t2, { pluginName: "multiDrag", utils: { select: function(t3) {
            var e2 = t3.parentNode[K];
            e2 && e2.options.multiDrag && !~he.indexOf(t3) && (se && se !== e2 && (se.multiDrag._deselectMultiDrag(), se = e2), k(t3, e2.options.selectedClass, true), he.push(t3));
          }, deselect: function(t3) {
            var e2 = t3.parentNode[K], n2 = he.indexOf(t3);
            e2 && e2.options.multiDrag && ~n2 && (k(t3, e2.options.selectedClass, false), he.splice(n2, 1));
          } }, eventProperties: function() {
            var n2 = this, o2 = [], i2 = [];
            return he.forEach(function(t3) {
              var e2;
              o2.push({ multiDragElement: t3, index: t3.sortableIndex }), e2 = ge && t3 !== ce ? -1 : ge ? j(t3, ":not(." + n2.options.selectedClass + ")") : j(t3), i2.push({ multiDragElement: t3, index: e2 });
            }), { items: e(he), clones: [].concat(fe), oldIndicies: o2, newIndicies: i2 };
          }, optionListeners: { multiDragKey: function(t3) {
            return "ctrl" === (t3 = t3.toLowerCase()) ? t3 = "Control" : 1 < t3.length && (t3 = t3.charAt(0).toUpperCase() + t3.substr(1)), t3;
          } } });
        }()), Ht;
      });
    }
  });

  // src/modules/cover.ts
  var cover_exports = {};
  __export(cover_exports, {
    cover: () => cover
  });
  var cover;
  var init_cover = __esm({
    "src/modules/cover.ts"() {
      "use strict";
      cover = {
        addCover: () => {
          document.getElementById("editor-cover")?.classList.add("editor-cover");
        },
        removeCover: () => {
          document.getElementById("editor-cover")?.classList.remove("editor-cover");
        }
      };
    }
  });

  // src/modules/settings.ts
  var editorSettings;
  var init_settings = __esm({
    "src/modules/settings.ts"() {
      "use strict";
      editorSettings = {
        fontSize: 12,
        fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, 'Noto Sans', 'Liberation Sans', sans-serif",
        // dialog properties
        dialog: {
          name: "NewDialog",
          title: "New dialog",
          language: "en_US",
          runtimeProvider: "R",
          width: "560",
          height: "400",
          fontSize: "12",
          background: "#FFFFFF"
        }
      };
    }
  });

  // src/modules/editor.ts
  var editor_exports = {};
  __export(editor_exports, {
    editor: () => editor
  });
  function applySelection(order2, opts = {}) {
    const seen = /* @__PURE__ */ new Set();
    const filtered = [];
    for (const id of order2) {
      if (!id || seen.has(id)) continue;
      const el = dialog.getElement(id);
      if (!el) continue;
      filtered.push(id);
      seen.add(id);
    }
    selectionOrder.length = 0;
    selectionOrder.push(...filtered);
    selectionAnchorId = selectionOrder[0] ?? null;
    const anchorEl = selectionAnchorId ? dialog.getElement(selectionAnchorId) : void 0;
    currentGroupId = anchorEl && anchorEl.classList.contains("element-group") ? selectionAnchorId : null;
    multiSelected.clear();
    filtered.forEach((id) => multiSelected.add(id));
    dialog.canvas.querySelectorAll(".selectedElement").forEach((node) => node.classList.remove("selectedElement"));
    for (const id of filtered) {
      const node = dialog.getElement(id);
      if (!node) continue;
      node.classList.add("selectedElement");
      if (node.classList.contains("element-group")) {
        node.querySelectorAll(".selectedElement").forEach((child) => child.classList.remove("selectedElement"));
      }
    }
    multiOutline = renderutils.clearMultiOutline(multiOutline);
    if (opts.emit === false) {
      return;
    }
    if (filtered.length === 0) {
      dialog.selectedElement = "";
      coms.emit("elementDeselected");
    } else if (filtered.length === 1) {
      dialog.selectedElement = filtered[0];
      coms.emit("elementSelected", filtered[0]);
    } else {
      dialog.selectedElement = "";
      coms.emit("elementSelectedMultiple", filtered.slice());
    }
  }
  function buildElementPropertyKindMap() {
    const map = /* @__PURE__ */ new Map();
    for (const template of Object.values(elements)) {
      const templateRecord = template;
      const typeName = templateRecord.type;
      if (!typeName) continue;
      map.set(typeName, inferKindsFromTemplate(templateRecord));
    }
    return map;
  }
  function inferKindsFromTemplate(template) {
    const kinds = {};
    for (const [key, value] of Object.entries(template)) {
      if (key === "$persist") continue;
      kinds[key] = derivePropertyKind(value);
    }
    return kinds;
  }
  function derivePropertyKind(value) {
    if (Array.isArray(value)) return "array";
    if (value === null) return "object";
    switch (typeof value) {
      case "boolean":
        return "boolean";
      case "number":
        return "number";
      case "string":
        return "string";
      case "object":
        return "object";
      default:
        return "string";
    }
  }
  function resolveTemplateForType(typeName) {
    if (!typeName) return elements.buttonElement;
    const key = `${typeName.charAt(0).toLowerCase()}${typeName.slice(1)}Element`;
    const template = elements[key] ?? elements.buttonElement;
    return template;
  }
  function hydrateElementDatasetDefaults(wrapper) {
    const typeName = String(wrapper.dataset.type || "").trim();
    if (!typeName) return;
    const template = resolveTemplateForType(typeName);
    const inner = wrapper.firstElementChild;
    for (const [key, rawValue] of Object.entries(template)) {
      if (key.startsWith("$")) continue;
      if (!(key in wrapper.dataset) && rawValue !== void 0 && rawValue !== null) {
        wrapper.dataset[key] = Array.isArray(rawValue) ? rawValue.map(String).join(",") : String(rawValue);
      }
      if (inner && !(key in inner.dataset) && rawValue !== void 0 && rawValue !== null) {
        inner.dataset[key] = Array.isArray(rawValue) ? rawValue.map(String).join(",") : String(rawValue);
      }
    }
  }
  function getDialogCanvasSize() {
    const rect = dialog.canvas.getBoundingClientRect();
    const width = Math.round(rect.width || dialog.canvas.clientWidth || utils.asNumeric(dialog.canvas.style.width) || 0);
    const height = Math.round(rect.height || dialog.canvas.clientHeight || utils.asNumeric(dialog.canvas.style.height) || 0);
    return { width, height };
  }
  function getDragTargetSize(target2) {
    const datasetWidth = utils.asNumeric(target2.dataset.width ?? "");
    const datasetHeight = utils.asNumeric(target2.dataset.height ?? "");
    const styleWidth = utils.asNumeric(target2.style.width || "");
    const styleHeight = utils.asNumeric(target2.style.height || "");
    const rect = target2.getBoundingClientRect();
    const width = Math.round(
      datasetWidth || styleWidth || target2.offsetWidth || rect.width || 0
    );
    const height = Math.round(
      datasetHeight || styleHeight || target2.offsetHeight || rect.height || 0
    );
    return { width, height };
  }
  function sanitizeDialogI18n(input) {
    if (!input || typeof input !== "object") return void 0;
    const raw = input;
    const localesRaw = raw.locales;
    const locales = {};
    const availableLocales = localesRaw && typeof localesRaw === "object" ? Object.keys(localesRaw).map(normalizeLocaleId) : [];
    const maybeBase = String(raw.baseLocale ?? "en_US").trim();
    const baseLocale = canonicalDialogLocale(maybeBase, availableLocales);
    if (localesRaw && typeof localesRaw === "object") {
      for (const [locale, dictRaw] of Object.entries(localesRaw)) {
        if (!dictRaw || typeof dictRaw !== "object") continue;
        const dictionary = {};
        for (const [key, value] of Object.entries(dictRaw)) {
          if (typeof value === "string") {
            dictionary[key] = value;
          }
        }
        const normalizedLocale = normalizeLocaleId(locale);
        const canonicalLocale = canonicalDialogLocale(locale, availableLocales);
        locales[canonicalLocale] = normalizedLocale === canonicalLocale ? { ...locales[canonicalLocale] || {}, ...dictionary } : { ...dictionary, ...locales[canonicalLocale] || {} };
      }
    }
    return { baseLocale, locales };
  }
  function normalizeLocaleId(locale) {
    return String(locale || "").trim().replace(/-/g, "_");
  }
  function canonicalDialogLocale(locale, availableLocales = []) {
    const normalized = normalizeLocaleId(locale);
    if (!normalized.length) return "en_US";
    if (normalized === "en") return "en_US";
    if (/^[a-z]{2}$/i.test(normalized)) {
      const prefix = `${normalized}_`.toLowerCase();
      const matchingRegional = availableLocales.filter((candidate) => candidate.toLowerCase().startsWith(prefix)).sort((a, b) => a.localeCompare(b));
      if (matchingRegional.length === 1) {
        return matchingRegional[0];
      }
    }
    return normalized;
  }
  function buildGeneratedDialogDictionary(properties, elementsData) {
    const dict = {};
    const title = String(properties.title ?? "").trim();
    if (title.length) {
      dict["dialog.title"] = title;
    }
    const textProps = ["label", "value"];
    for (const element of elementsData) {
      const elementId = String(element.id ?? "").trim();
      if (!elementId.length) continue;
      for (const prop of textProps) {
        const raw = element[prop];
        if (typeof raw !== "string") continue;
        const value = raw.trim();
        if (!value.length) continue;
        dict[`elements.${elementId}.${prop}`] = value;
      }
      const rawItems = element.items;
      if (typeof rawItems === "string") {
        const values = rawItems.split(/[;,]/).map((item) => item.trim()).filter((item) => item.length > 0);
        values.forEach((item, index) => {
          dict[`elements.${elementId}.items.${index}`] = item;
        });
      }
    }
    return dict;
  }
  function mergeGeneratedDialogI18n(existing, generated, preferredBaseLocale) {
    const locales = {};
    const existingLocaleKeys = Object.keys(existing?.locales || {}).map(normalizeLocaleId);
    const baseLocale = canonicalDialogLocale(
      String(preferredBaseLocale ?? existing?.baseLocale ?? "en_US"),
      existingLocaleKeys
    );
    if (existing?.locales) {
      for (const [locale, dict] of Object.entries(existing.locales)) {
        const normalizedLocale = normalizeLocaleId(locale);
        const canonicalLocale = canonicalDialogLocale(locale, existingLocaleKeys);
        locales[canonicalLocale] = normalizedLocale === canonicalLocale ? { ...locales[canonicalLocale] || {}, ...dict } : { ...dict, ...locales[canonicalLocale] || {} };
      }
    }
    const generatedKeys = new Set(Object.keys(generated));
    const isGeneratedDialogKey = (key) => key === "dialog.title" || key.startsWith("elements.");
    const preserveCustomEntries = (dict) => {
      return Object.fromEntries(
        Object.entries(dict || {}).filter(([key]) => {
          return !isGeneratedDialogKey(key);
        })
      );
    };
    const mergeLocaleDictionary = (current, useGeneratedValues) => {
      const currentDict = current || {};
      const next = {
        ...preserveCustomEntries(currentDict)
      };
      for (const key of generatedKeys) {
        const translated = currentDict[key];
        next[key] = !useGeneratedValues && typeof translated === "string" ? translated : generated[key];
      }
      return next;
    };
    for (const locale of Object.keys(locales)) {
      locales[locale] = mergeLocaleDictionary(locales[locale], locale === baseLocale);
    }
    locales[baseLocale] = mergeLocaleDictionary(locales[baseLocale], true);
    return {
      baseLocale,
      locales
    };
  }
  function inferKindFromTemplate(template, key) {
    const value = template[key];
    return value === void 0 ? void 0 : derivePropertyKind(value);
  }
  function coerceDatasetValue(raw, kind, templateValue) {
    if (kind === "boolean") {
      return utils.isTrue(raw);
    }
    if (kind === "number") {
      const parsed = utils.asNumeric(raw);
      if (Number.isFinite(parsed)) return parsed;
      if (typeof templateValue === "number") return templateValue;
      return 0;
    }
    if (kind === "array") {
      if (!raw) return Array.isArray(templateValue) ? [...templateValue] : [];
      return raw.split(",");
    }
    if (raw === "true" || raw === "false") {
      return raw === "true";
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
    contextMenu.setAttribute("aria-hidden", "true");
    contextMenu.style.top = "";
    contextMenu.style.left = "";
    contextMenu.style.visibility = "";
    lastContextTargetId = null;
  }
  function contextMenuHandlers() {
    if (!contextMenu || contextMenuInitialized) return;
    contextMenuInitialized = true;
    const duplicateButton = contextMenu.querySelector('[data-action="duplicate"]');
    duplicateButton?.addEventListener("click", () => {
      if (!lastContextTargetId) {
        hideContextMenu();
        return;
      }
      editor.duplicateElement(lastContextTargetId);
      hideContextMenu();
    });
    if (duplicateButton) duplicateButton.dataset.bound = "true";
  }
  function showContextMenu(targetId, x, y) {
    if (!contextMenu) return;
    contextMenuHandlers();
    contextMenu.style.visibility = "hidden";
    contextMenu.style.top = "-1000px";
    contextMenu.style.left = "-1000px";
    contextMenu.setAttribute("aria-hidden", "false");
    const menuRect = contextMenu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let left2 = x;
    let top2 = y;
    if (left2 + menuRect.width > viewportWidth) {
      left2 = Math.max(0, viewportWidth - menuRect.width - 4);
    }
    if (top2 + menuRect.height > viewportHeight) {
      top2 = Math.max(0, viewportHeight - menuRect.height - 4);
    }
    contextMenu.style.top = `${top2}px`;
    contextMenu.style.left = `${left2}px`;
    contextMenu.style.visibility = "visible";
    lastContextTargetId = targetId;
    try {
      const duplicate = contextMenu.querySelector('[data-action="duplicate"]');
      const group = contextMenu.querySelector('[data-action="group"]');
      const ungroup = contextMenu.querySelector('[data-action="ungroup"]');
      if (duplicate && !duplicate.dataset.bound) {
        duplicate.addEventListener("click", function() {
          if (!lastContextTargetId) {
            hideContextMenu();
            return;
          }
          editor.duplicateElement(lastContextTargetId);
          hideContextMenu();
        });
        duplicate.dataset.bound = "true";
      }
      if (group && !group.dataset.bound) {
        group.addEventListener("click", function() {
          editor.groupSelection();
          hideContextMenu();
        });
        group.dataset.bound = "true";
      }
      if (ungroup && !ungroup.dataset.bound) {
        ungroup.addEventListener("click", function() {
          if (!lastContextTargetId) {
            hideContextMenu();
            return;
          }
          const node2 = dialog.getElement(lastContextTargetId);
          if (!node2 || !node2.classList.contains("element-group")) {
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
        ungroup.dataset.bound = "true";
      }
      const node = dialog.getElement(targetId);
      const isPersistentGroup = !!(node && node.classList.contains("element-group"));
      const hasEphemeralMultiSelect = !isPersistentGroup && selectionOrder.length >= 2;
      if (group) {
        group.style.display = hasEphemeralMultiSelect ? "" : "none";
      }
      if (ungroup) {
        ungroup.style.display = isPersistentGroup ? "" : "none";
      }
    } catch {
    }
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
      coms.emit("elementSelectedMultiple", ids);
      return;
    }
    const groupId = renderutils.makeGroupFromSelection(ids, true);
    if (!groupId) return;
    const groupEl = dialog.getElement(groupId);
    if (!groupEl) return;
    editor.addElementListeners(groupEl);
    currentGroupId = groupId;
    applySelection([groupId]);
  }
  var lastContextTargetId, contextMenu, currentGroupId, contextMenuInitialized, multiDragActive, dragStart, multiOutline, multiSelected, suppressClickFor, SKIP_KEYS, elementPropertyKinds, multiDragSnapshot, selectionOrder, selectionAnchorId, editor;
  var init_editor = __esm({
    "src/modules/editor.ts"() {
      "use strict";
      init_coms();
      init_settings();
      init_elements();
      init_dist();
      init_dialog();
      init_renderutils();
      init_utils();
      lastContextTargetId = null;
      contextMenu = null;
      currentGroupId = null;
      contextMenuInitialized = false;
      multiDragActive = false;
      dragStart = { x: 0, y: 0 };
      multiOutline = null;
      multiSelected = /* @__PURE__ */ new Set();
      suppressClickFor = /* @__PURE__ */ new Set();
      SKIP_KEYS = /* @__PURE__ */ new Set(["elementIds", "persistent"]);
      elementPropertyKinds = buildElementPropertyKindMap();
      multiDragSnapshot = /* @__PURE__ */ new Map();
      selectionOrder = [];
      selectionAnchorId = null;
      editor = {
        alignSelection: function(mode) {
          const orderedIds = selectionOrder.length >= 2 ? selectionOrder.slice() : selectionOrder.length === 0 ? renderutils.getSelectedIds() : selectionOrder.slice();
          if (orderedIds.length < 2) {
            return;
          }
          const anchorId = orderedIds[0];
          const anchor = dialog.getElement(anchorId);
          if (!anchor) {
            return;
          }
          const anchorLeft = Number(anchor.dataset.left ?? (parseInt(anchor.style.left || "0", 10) || 0));
          const anchorTop = Number(anchor.dataset.top ?? (parseInt(anchor.style.top || "0", 10) || 0));
          const anchorWidth = anchor.offsetWidth;
          const anchorHeight = anchor.offsetHeight;
          const targets = orderedIds.slice(1);
          const containsPersistentGroup = targets.some((id) => {
            const n = dialog.getElement(id);
            return !!n && n.classList.contains("element-group");
          });
          if (targets.length > 1 && !containsPersistentGroup) {
            const groupBounds = renderutils.computeBounds(targets);
            if (groupBounds) {
              let dx = 0, dy = 0;
              if (mode === "left") {
                dx = anchorLeft - groupBounds.left;
              } else if (mode === "right") {
                const anchorRight = anchorLeft + anchorWidth;
                const groupRight = groupBounds.left + groupBounds.width;
                dx = anchorRight - groupRight;
              } else if (mode === "center") {
                const anchorCenter = anchorLeft + Math.round(anchorWidth / 2);
                const groupCenter = groupBounds.left + Math.round(groupBounds.width / 2);
                dx = anchorCenter - groupCenter;
              } else if (mode === "top") {
                dy = anchorTop - groupBounds.top;
              } else if (mode === "bottom") {
                const anchorBottom = anchorTop + anchorHeight;
                const groupBottom = groupBounds.top + groupBounds.height;
                dy = anchorBottom - groupBottom;
              } else if (mode === "middle") {
                const anchorMiddle = anchorTop + Math.round(anchorHeight / 2);
                const groupMiddle = groupBounds.top + Math.round(groupBounds.height / 2);
                dy = anchorMiddle - groupMiddle;
              }
              if (dx !== 0 || dy !== 0) {
                renderutils.moveElementsBy(targets, dx, dy);
              }
              coms.emit("elementSelectedMultiple", orderedIds);
              return;
            }
          }
          for (const id of targets) {
            const el = dialog.getElement(id);
            if (!el) {
              continue;
            }
            const isGroupContainer = el.classList.contains("element-group");
            const currentLeft = Number(el.dataset.left ?? (parseInt(el.style.left || "0", 10) || 0));
            const currentTop = Number(el.dataset.top ?? (parseInt(el.style.top || "0", 10) || 0));
            const elWidth = el.offsetWidth;
            const elHeight = el.offsetHeight;
            const props = {};
            if (isGroupContainer) {
              if (mode === "left" && currentLeft !== anchorLeft) {
                props.left = anchorLeft;
              } else if (mode === "top" && currentTop !== anchorTop) {
                props.top = anchorTop;
              } else if (mode === "right") {
                const anchorRight = anchorLeft + anchorWidth;
                const elRight = currentLeft + elWidth;
                if (elRight !== anchorRight) props.left = anchorRight - elWidth;
              } else if (mode === "bottom") {
                const anchorBottom = anchorTop + anchorHeight;
                const elBottom = currentTop + elHeight;
                if (elBottom !== anchorBottom) props.top = anchorBottom - elHeight;
              } else if (mode === "center") {
                const anchorCenter = anchorLeft + Math.round(anchorWidth / 2);
                const newLeft = anchorCenter - Math.round(elWidth / 2);
                if (newLeft !== currentLeft) props.left = newLeft;
              } else if (mode === "middle") {
                const anchorCenter = anchorTop + Math.round(anchorHeight / 2);
                const newTop = anchorCenter - Math.round(elHeight / 2);
                if (newTop !== currentTop) props.top = newTop;
              }
            } else {
              if (mode === "left" && currentLeft !== anchorLeft) {
                props.left = anchorLeft;
              } else if (mode === "top" && currentTop !== anchorTop) {
                props.top = anchorTop;
              } else if (mode === "right") {
                const anchorRight = anchorLeft + anchorWidth;
                const elRight = currentLeft + elWidth;
                if (elRight !== anchorRight) {
                  props.left = anchorRight - elWidth;
                }
              } else if (mode === "bottom") {
                const anchorBottom = anchorTop + anchorHeight;
                const elBottom = currentTop + elHeight;
                if (elBottom !== anchorBottom) {
                  props.top = anchorBottom - elHeight;
                }
              } else if (mode === "center") {
                const anchorCenter = anchorLeft + Math.round(anchorWidth / 2);
                const newLeft = anchorCenter - Math.round(elWidth / 2);
                if (newLeft !== currentLeft) {
                  props.left = newLeft;
                }
              } else if (mode === "middle") {
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
            renderutils.updateElement(el, props);
            if (props.left !== void 0) {
              el.dataset.left = String(props.left);
            }
            if (props.top !== void 0) {
              el.dataset.top = String(props.top);
            }
          }
          coms.emit("elementSelectedMultiple", orderedIds);
        },
        makeDialog: () => {
          const newDialogID = v4_default();
          dialog.canvas.id = newDialogID;
          dialog.id = newDialogID;
          dialog.canvas.style.position = "relative";
          dialog.canvas.style.width = editorSettings.dialog.width + "px";
          dialog.canvas.style.height = editorSettings.dialog.height + "px";
          dialog.canvas.style.backgroundColor = editorSettings.dialog.background || "#ffffff";
          dialog.canvas.style.border = "1px solid gray";
          const handleEmptyCanvasClick = (event, allowOuterDialog = false) => {
            if (skipCanvasClickOnce) {
              skipCanvasClickOnce = false;
              event.stopPropagation();
              event.preventDefault();
              return;
            }
            hideContextMenu();
            const target2 = event.target;
            const clickedCanvas = !!target2 && target2.id === dialog.id;
            const clickedOuterDialog = !!target2 && allowOuterDialog && target2.id === "dialog";
            if (clickedCanvas || clickedOuterDialog) {
              const active = document.activeElement;
              if (active && active.closest("#propertiesList")) {
                active.blur();
              }
              editor.deselectAll();
            }
          };
          dialog.canvas.addEventListener("click", handleEmptyCanvasClick);
          dialog.canvas.addEventListener("drop", (event) => {
            event.preventDefault();
          });
          let lassoActive = false;
          let lassoStart = { x: 0, y: 0 };
          let lassoDiv = null;
          let skipCanvasClickOnce = false;
          dialog.canvas.addEventListener("mousedown", (event) => {
            if (event.target.id !== dialog.id) return;
            const active = document.activeElement;
            if (active && active.closest("#propertiesList")) {
              active.blur();
            }
            const rect = dialog.canvas.getBoundingClientRect();
            lassoActive = true;
            lassoStart = { x: event.clientX - rect.left, y: event.clientY - rect.top };
            lassoDiv = document.createElement("div");
            lassoDiv.className = "lasso-rect";
            lassoDiv.style.left = lassoStart.x + "px";
            lassoDiv.style.top = lassoStart.y + "px";
            lassoDiv.style.width = "0px";
            lassoDiv.style.height = "0px";
            dialog.canvas.appendChild(lassoDiv);
            event.preventDefault();
          });
          document.addEventListener("mousemove", (event) => {
            if (!lassoActive || !lassoDiv) return;
            const rect = dialog.canvas.getBoundingClientRect();
            const currX = event.clientX - rect.left;
            const currY = event.clientY - rect.top;
            const left2 = Math.min(currX, lassoStart.x);
            const top2 = Math.min(currY, lassoStart.y);
            const width = Math.abs(currX - lassoStart.x);
            const height = Math.abs(currY - lassoStart.y);
            lassoDiv.style.left = left2 + "px";
            lassoDiv.style.top = top2 + "px";
            lassoDiv.style.width = width + "px";
            lassoDiv.style.height = height + "px";
          });
          const endLasso = (event) => {
            if (!lassoActive) return;
            const additive = event.shiftKey;
            const rect = dialog.canvas.getBoundingClientRect();
            const endX = event.clientX - rect.left;
            const endY = event.clientY - rect.top;
            const left2 = Math.min(endX, lassoStart.x);
            const top2 = Math.min(endY, lassoStart.y);
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
              left: left2,
              top: top2,
              right: left2 + width,
              bottom: top2 + height
            };
            const next = additive ? selectionOrder.slice() : [];
            const children = Array.from(dialog.canvas.children);
            children.forEach((el) => {
              if (el.classList.contains("lasso-rect")) return;
              const rect2 = el.getBoundingClientRect();
              const canvasRect = dialog.canvas.getBoundingClientRect();
              const rel = {
                left: rect2.left - canvasRect.left,
                right: rect2.right - canvasRect.left,
                top: rect2.top - canvasRect.top,
                bottom: rect2.bottom - canvasRect.top
              };
              const contained = rel.left >= selRectangle.left && rel.right <= selRectangle.right && rel.top >= selRectangle.top && rel.bottom <= selRectangle.bottom;
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
          document.addEventListener("mouseup", endLasso);
          const dialogdiv = document.getElementById("dialog");
          if (dialogdiv) {
            dialogdiv.append(dialog.canvas);
            dialogdiv.addEventListener("click", (event) => {
              if (event.target !== dialogdiv) {
                return;
              }
              handleEmptyCanvasClick(event, true);
            });
          }
          contextMenu = document.getElementById("element-context-menu");
          document.addEventListener("click", (ev) => {
            if (!contextMenu || contextMenu.getAttribute("aria-hidden") !== "false") return;
            if (contextMenu.contains(ev.target)) return;
            hideContextMenu();
          });
          document.addEventListener("keydown", (ev) => {
            if (ev.key === "Escape") {
              hideContextMenu();
            }
          });
          const properties = document.querySelectorAll('#dialog-properties [id^="dialog"]');
          properties.forEach((item) => {
            const key = item.getAttribute("name");
            if (key) {
              item.value = editorSettings.dialog[key] || "";
            }
          });
          dialog.properties = editorSettings.dialog;
          dialog.i18n = void 0;
        },
        duplicateElement(elementId) {
          if (!elementId) return;
          const source = dialog.getElement(elementId);
          if (!source) return;
          const duplicateChildIntoGroup = (child, groupEl) => {
            const datasetEntries2 = Object.entries(child.dataset || {});
            const copy2 = {};
            const typeFromDataset2 = child.dataset.type || child.tagName;
            const elementKinds2 = elementPropertyKinds.get(typeFromDataset2) || {};
            const template2 = resolveTemplateForType(typeFromDataset2);
            for (const [key, value] of datasetEntries2) {
              if (value === void 0 || SKIP_KEYS.has(key)) continue;
              const kind = elementKinds2[key] ?? inferKindFromTemplate(template2, key);
              const templateValue = template2[key];
              copy2[key] = coerceDatasetValue(value, kind, templateValue);
            }
            const type2 = String(typeFromDataset2);
            copy2.type = type2;
            const base2 = type2.toLowerCase();
            copy2.nameid = renderutils.makeUniqueNameID(base2);
            const leftRaw2 = child.dataset.left ?? child.style.left ?? "";
            const topRaw2 = child.dataset.top ?? child.style.top ?? "";
            const left3 = utils.asNumeric(leftRaw2) || parseInt(String(leftRaw2).replace(/px$/, ""), 10) || child.offsetLeft;
            const top3 = utils.asNumeric(topRaw2) || parseInt(String(topRaw2).replace(/px$/, ""), 10) || child.offsetTop;
            copy2.left = left3;
            copy2.top = top3;
            const constructed2 = renderutils.makeElement({ ...template2, ...copy2 });
            const wrapper2 = document.createElement("div");
            wrapper2.classList.add("element-wrapper");
            wrapper2.style.position = "absolute";
            const origId2 = constructed2.id;
            wrapper2.id = origId2;
            constructed2.id = `${origId2}-inner`;
            wrapper2.style.left = `${left3}px`;
            wrapper2.style.top = `${top3}px`;
            wrapper2.dataset.left = String(left3);
            wrapper2.dataset.top = String(top3);
            for (const [k, v] of Object.entries(constructed2.dataset)) {
              if (typeof v === "string") {
                wrapper2.dataset[k] = v;
              }
            }
            constructed2.style.left = "0px";
            constructed2.style.top = "0px";
            if (wrapper2.dataset.type === "Button") {
              constructed2.style.position = "relative";
            }
            wrapper2.appendChild(constructed2);
            groupEl.appendChild(wrapper2);
            const innerCover2 = constructed2.querySelector(".elementcover");
            if (innerCover2 && innerCover2.parentElement) {
              innerCover2.parentElement.removeChild(innerCover2);
            }
            if (!(wrapper2.dataset.type === "Button" || wrapper2.dataset.type === "Label")) {
              const rect = constructed2.getBoundingClientRect();
              if (rect.width > 0) wrapper2.style.width = `${Math.round(rect.width)}px`;
              if (rect.height > 0) wrapper2.style.height = `${Math.round(rect.height)}px`;
            }
            const cover3 = document.createElement("div");
            cover3.id = `${wrapper2.id}-cover`;
            cover3.className = "elementcover";
            wrapper2.appendChild(cover3);
            editor.addElementListeners(wrapper2);
            dialog.addElement(wrapper2);
            if (wrapper2.dataset.type === "Label") {
              renderutils.updateLabel(wrapper2);
            }
            return wrapper2.id;
          };
          if (source.classList.contains("element-group")) {
            const groupTemplate = resolveTemplateForType("Group");
            const groupEntries = Object.entries(source.dataset || {});
            const groupCopy = {};
            const groupKinds = elementPropertyKinds.get("Group") || {};
            for (const [key, value] of groupEntries) {
              if (value === void 0 || SKIP_KEYS.has(key)) continue;
              const kind = groupKinds[key] ?? inferKindFromTemplate(groupTemplate, key);
              const templateValue = groupTemplate[key];
              groupCopy[key] = coerceDatasetValue(value, kind, templateValue);
            }
            const groupLeftRaw = source.dataset.left ?? source.style.left ?? "";
            const groupTopRaw = source.dataset.top ?? source.style.top ?? "";
            const groupLeft = utils.asNumeric(groupLeftRaw) || parseInt(String(groupLeftRaw).replace(/px$/, ""), 10) || source.offsetLeft;
            const groupTop = utils.asNumeric(groupTopRaw) || parseInt(String(groupTopRaw).replace(/px$/, ""), 10) || source.offsetTop;
            groupCopy.type = "Group";
            groupCopy.nameid = renderutils.makeUniqueNameID("group");
            groupCopy.left = groupLeft;
            groupCopy.top = groupTop;
            const groupEl = renderutils.makeElement({ ...groupTemplate, ...groupCopy });
            groupEl.dataset.type = "Group";
            groupEl.classList.add("element-group");
            if (source.dataset.persistent === "true") {
              groupEl.dataset.persistent = "true";
            }
            const rect = source.getBoundingClientRect();
            const width = utils.asNumeric(source.style.width) || Math.round(rect.width);
            const height = utils.asNumeric(source.style.height) || Math.round(rect.height);
            if (width > 0) groupEl.style.width = `${width}px`;
            if (height > 0) groupEl.style.height = `${height}px`;
            dialog.canvas.appendChild(groupEl);
            dialog.addElement(groupEl);
            editor.addElementListeners(groupEl);
            const children = Array.from(source.children).filter((el) => el instanceof HTMLElement && el.classList.contains("element-wrapper"));
            const newIds = [];
            for (const child of children) {
              const id = duplicateChildIntoGroup(child, groupEl);
              if (id) newIds.push(id);
            }
            groupEl.dataset.elementIds = newIds.join(",");
            applySelection([groupEl.id]);
            return;
          }
          const datasetEntries = Object.entries(source.dataset || {});
          const copy = {};
          const typeFromDataset = source.dataset.type || source.tagName;
          const elementKinds = elementPropertyKinds.get(typeFromDataset) || {};
          const template = resolveTemplateForType(typeFromDataset);
          for (const [key, value] of datasetEntries) {
            if (value === void 0 || SKIP_KEYS.has(key)) continue;
            const kind = elementKinds[key] ?? inferKindFromTemplate(template, key);
            const templateValue = template[key];
            copy[key] = coerceDatasetValue(value, kind, templateValue);
          }
          const type = String(typeFromDataset);
          copy.type = type;
          const base = type.toLowerCase();
          copy.nameid = renderutils.makeUniqueNameID(base);
          const leftRaw = source.dataset.left ?? source.style.left ?? "";
          const topRaw = source.dataset.top ?? source.style.top ?? "";
          const left2 = utils.asNumeric(leftRaw) || parseInt(String(leftRaw).replace(/px$/, ""), 10) || source.offsetLeft;
          const top2 = utils.asNumeric(topRaw) || parseInt(String(topRaw).replace(/px$/, ""), 10) || source.offsetTop;
          copy.left = left2;
          copy.top = top2;
          const constructed = renderutils.makeElement({ ...template, ...copy });
          const wrapper = document.createElement("div");
          wrapper.classList.add("element-wrapper");
          wrapper.style.position = "absolute";
          const origId = constructed.id;
          wrapper.id = origId;
          constructed.id = `${origId}-inner`;
          wrapper.style.left = `${left2}px`;
          wrapper.style.top = `${top2}px`;
          wrapper.dataset.left = String(left2);
          wrapper.dataset.top = String(top2);
          for (const [k, v] of Object.entries(constructed.dataset)) {
            if (typeof v === "string") {
              wrapper.dataset[k] = v;
            }
          }
          constructed.style.left = "0px";
          constructed.style.top = "0px";
          if (wrapper.dataset.type === "Button") {
            constructed.style.position = "relative";
          }
          wrapper.appendChild(constructed);
          dialog.canvas.appendChild(wrapper);
          const innerCover = constructed.querySelector(".elementcover");
          if (innerCover && innerCover.parentElement) {
            innerCover.parentElement.removeChild(innerCover);
          }
          if (!(wrapper.dataset.type === "Button" || wrapper.dataset.type === "Label")) {
            const rect = constructed.getBoundingClientRect();
            if (rect.width > 0) wrapper.style.width = `${Math.round(rect.width)}px`;
            if (rect.height > 0) wrapper.style.height = `${Math.round(rect.height)}px`;
          }
          const cover2 = document.createElement("div");
          cover2.id = `${wrapper.id}-cover`;
          cover2.className = "elementcover";
          wrapper.appendChild(cover2);
          editor.addElementListeners(wrapper);
          dialog.addElement(wrapper);
          if (wrapper.dataset.type === "Label") {
            renderutils.updateLabel(wrapper);
          }
          applySelection([wrapper.id]);
        },
        updateDialogArea: function(properties) {
          if (dialog.id !== "") {
            if (properties.width != dialog.properties.width) {
              dialog.canvas.style.width = properties.width + "px";
            }
            if (properties.height != dialog.properties.height) {
              dialog.canvas.style.height = properties.height + "px";
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
            showMessage(
              "info",
              "No dialog",
              "Please create a new dialog first."
            );
          }
        },
        addAvailableElementsTo: function(window2) {
          const elementsList = document.getElementById("elementsList");
          if (elementsList) {
            elementsList.innerHTML = "";
            let availableElements = Object.keys(elements);
            if (window2 === "editor" || window2 === "defaults") {
              availableElements = availableElements.filter((name) => name !== "groupElement");
            }
            const ul = document.createElement("ul");
            ul.setAttribute("id", "paperAvailableElements");
            for (const name of availableElements) {
              const li = document.createElement("li");
              li.setAttribute("id", v4_default());
              li.dataset.elementKey = name;
              const baseName = name.substring(0, name.length - 7);
              const displayName = utils.capitalize(baseName);
              li.textContent = displayName;
              li.addEventListener("click", () => {
                if (window2 === "defaults") {
                  ul.querySelectorAll("li").forEach((el) => {
                    el.classList.remove("selected-available-element");
                  });
                  li.classList.add("selected-available-element");
                  const propsPanel = document.getElementById("propertiesList");
                  if (propsPanel) {
                    propsPanel.dataset.defaultElement = name;
                  }
                  coms.emit("defaultElementSelected", name);
                  coms.sendTo("main", "getProperties", name);
                } else if (window2 === "editor") {
                  const elementType = name;
                  const elementData = elements[elementType];
                  editor.addElementToDialog(
                    String(elementData.type || displayName),
                    elementData
                  );
                }
              });
              ul.appendChild(li);
            }
            elementsList.appendChild(ul);
          } else {
            showError("Could not find the element list in editor window. Please check the HTML!");
          }
        },
        // add new element on dialog
        addElementToDialog: function(name, data) {
          if (data) {
            const core = renderutils.makeElement({ ...data });
            core.dataset.type = String(data.type || name);
            const wrapper = document.createElement("div");
            wrapper.classList.add("element-wrapper");
            wrapper.style.position = "absolute";
            const origId = core.id;
            wrapper.id = origId;
            core.id = origId + "-inner";
            wrapper.style.left = core.style.left;
            wrapper.style.top = core.style.top;
            for (const [k, v] of Object.entries(core.dataset)) {
              if (typeof v === "string") wrapper.dataset[k] = v;
            }
            hydrateElementDatasetDefaults(wrapper);
            core.style.left = "0px";
            core.style.top = "0px";
            if (wrapper.dataset.type === "Button") {
              core.style.position = "relative";
            }
            wrapper.appendChild(core);
            dialog.canvas.appendChild(wrapper);
            if (core instanceof HTMLTextAreaElement && wrapper.dataset.type === "Input") {
              requestAnimationFrame(() => renderutils.syncInputOverflow(core));
            }
            const innerCover = core.querySelector(".elementcover");
            if (innerCover && innerCover.parentElement) {
              innerCover.parentElement.removeChild(innerCover);
            }
            if (!(wrapper.dataset.type === "Label")) {
              const rect = core.getBoundingClientRect();
              if (rect.width > 0) wrapper.style.width = `${Math.round(rect.width)}px`;
              if (rect.height > 0) wrapper.style.height = `${Math.round(rect.height)}px`;
            }
            const cover2 = document.createElement("div");
            cover2.id = `${wrapper.id}-cover`;
            cover2.className = "elementcover";
            wrapper.appendChild(cover2);
            editor.addElementListeners(wrapper);
            dialog.addElement(wrapper);
            if (wrapper.dataset.type === "Label") {
              renderutils.updateLabel(wrapper);
            }
          }
        },
        // add listener to the element
        addElementListeners(element) {
          element.addEventListener("click", (event) => {
            event.stopPropagation();
            const activeProp = document.activeElement;
            if (activeProp && activeProp.closest("#propertiesList")) {
              activeProp.blur();
            }
            const isGroupContainer = element.classList.contains("element-group");
            const groupAncestor = element.closest(".element-group");
            const target2 = isGroupContainer ? element : groupAncestor || element;
            const targetId = target2.id;
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
                if (target2.classList.contains("element-group")) {
                  next = next.filter((id) => {
                    const node = dialog.getElement(id);
                    return !(node && node !== target2 && target2.contains(node));
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
                const element2 = document.getElementById("elnameid");
                if (element2) {
                  element2.focus();
                  element2.select();
                }
              }
            }, 0);
          });
          element.addEventListener("dblclick", (event) => {
            event.stopPropagation();
            const isGroupContainer = element.classList.contains("element-group");
            const hasGroupAncestor = !!element.closest(".element-group");
            if (!isGroupContainer && hasGroupAncestor) {
              applySelection([element.id]);
              currentGroupId = null;
            }
          });
          element.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            event.stopPropagation();
            const targetId = element.closest(".element-group")?.id || element.id;
            if (!selectionOrder.includes(targetId)) {
              applySelection([targetId], { emit: true });
            }
            showContextMenu(targetId, event.clientX, event.clientY);
          });
          editor.addDragAndDrop(element);
        },
        addDragAndDrop(element) {
          let top2 = 0;
          let left2 = 0;
          let elementWidth = 0;
          let elementHeight = 0;
          let offsetX = 0, offsetY = 0, isDragging = false, isMoved = false;
          let dragTarget = element;
          let isCheckboxDrag = false;
          element.addEventListener("mousedown", (event) => {
            const active = document.activeElement;
            if (active && active.closest("#propertiesList")) {
              active.blur();
            }
            const containerAncestor = element.classList.contains("element-group") || element.classList.contains("element-wrapper") ? element : element.closest(".element-group, .element-wrapper");
            const groupAncestor = element.closest(".element-group");
            if (groupAncestor) {
              dragTarget = groupAncestor;
            } else {
              dragTarget = containerAncestor || element;
            }
            isCheckboxDrag = dragTarget.dataset.type === "Checkbox";
            const isGroupEl = dragTarget.classList.contains("element-group");
            if (isGroupEl && !event.shiftKey && selectionOrder.indexOf(dragTarget.id) === -1) {
              applySelection([dragTarget.id]);
              currentGroupId = dragTarget.id;
              suppressClickFor.add(dragTarget.id);
            }
            isDragging = true;
            const hasPersistentGroup = Boolean(currentGroupId);
            if (multiSelected.size > 1 && !hasPersistentGroup) {
              multiDragActive = true;
              multiDragSnapshot.clear();
              dragStart = {
                x: event.clientX,
                y: event.clientY
              };
              for (const id of multiSelected) {
                const el = dialog.getElement(id);
                if (!el) continue;
                const rect2 = el.getBoundingClientRect();
                const canvasRect = dialog.canvas.getBoundingClientRect();
                const left0 = rect2.left - canvasRect.left;
                const top0 = rect2.top - canvasRect.top;
                const size = getDragTargetSize(el);
                multiDragSnapshot.set(id, { left: left0, top: top0, width: size.width, height: size.height });
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
            const targetSize = getDragTargetSize(dragTarget);
            elementWidth = targetSize.width;
            elementHeight = targetSize.height;
            const rect = dragTarget.getBoundingClientRect();
            offsetX = event.clientX - rect.left;
            offsetY = event.clientY - rect.top;
            dragTarget.style.cursor = "grabbing";
            event.preventDefault();
          });
          document.addEventListener("mousemove", (event) => {
            if (!isDragging) return;
            const canvasRect = dialog.canvas.getBoundingClientRect();
            const { width: dialogW, height: dialogH } = getDialogCanvasSize();
            if (multiDragActive && multiSelected.size > 1 && !currentGroupId) {
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
                el.style.left = Math.round(nleft) + "px";
                el.style.top = Math.round(ntop) + "px";
              }
              isMoved = true;
              return;
            }
            left2 = event.clientX - canvasRect.left - offsetX;
            top2 = event.clientY - canvasRect.top - offsetY;
            if (left2 + elementWidth + 10 > dialogW) {
              left2 = dialogW - elementWidth - 10;
            }
            if (left2 < 10) {
              left2 = 10;
            }
            if (top2 + elementHeight + 10 > dialogH) {
              top2 = dialogH - elementHeight - 10;
            }
            if (top2 < 10) {
              top2 = 10;
            }
            top2 = Math.round(top2);
            left2 = Math.round(left2);
            dragTarget.style.left = left2 + "px";
            dragTarget.style.top = top2 + "px";
            isMoved = true;
          });
          document.addEventListener("mouseup", () => {
            if (!isDragging) return;
            isDragging = false;
            dragTarget.style.cursor = "grab";
            if (isMoved) {
              if (multiDragActive && multiSelected.size > 1 && !currentGroupId) {
                for (const id of multiSelected) {
                  const el = dialog.getElement(id);
                  if (!el) continue;
                  const leftNum = Math.round(parseInt(el.style.left || "0", 10) || 0);
                  const topNum = Math.round(parseInt(el.style.top || "0", 10) || 0);
                  el.dataset.left = String(leftNum);
                  el.dataset.top = String(topNum);
                  dialog.updateElementProperties(id, { top: String(topNum), left: String(leftNum) });
                  suppressClickFor.add(id);
                }
              } else {
                if (isCheckboxDrag) {
                  const size = Number(dragTarget.dataset.size);
                  if (top2 < 10 + size * 0.25) {
                    top2 = 10 + size * 0.25;
                  }
                }
                dragTarget.style.top = top2 + "px";
                dragTarget.dataset.left = String(left2);
                dragTarget.dataset.top = String(top2);
                dialog.updateElementProperties(
                  dragTarget.id,
                  {
                    top: String(top2),
                    left: String(left2)
                  }
                );
                suppressClickFor.add(dragTarget.id);
                if (dragTarget.classList.contains("element-group")) {
                  const kids = Array.from(dragTarget.children);
                  kids.forEach((k) => suppressClickFor.add(k.id));
                }
              }
              isMoved = false;
            }
            multiDragActive = false;
            multiDragSnapshot.clear();
          });
          document.addEventListener("dragend", () => {
          });
        },
        deselectAll: function() {
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
          const selected = Array.from(dialog.canvas.querySelectorAll(".selectedElement"));
          if (selected.length === 0 && dialog.selectedElement) {
            const only = dialog.getElement(dialog.selectedElement);
            if (only) selected.push(only);
          }
          const toRemove = /* @__PURE__ */ new Set();
          for (const el of selected) {
            const parentGroup = el.closest(".element-group");
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
          const properties = document.querySelectorAll('#propertiesList [id^="el"]');
          properties.forEach((item) => {
            item.value = "";
          });
          document.getElementById("propertiesList")?.classList.add("hidden");
          document.querySelectorAll("#propertiesList .element-property").forEach((item) => {
            item.classList.add("hidden-element");
          });
          document.getElementById("removeElement").disabled = true;
          document.getElementById("bringToFront").disabled = true;
          document.getElementById("sendToBack").disabled = true;
          document.getElementById("bringForward").disabled = true;
          document.getElementById("sendBackward").disabled = true;
        },
        addDefaultsButton: function() {
          const elementsList = document.getElementById("elementsList");
          if (elementsList) {
            const div2 = document.createElement("div");
            div2.className = "mt-1_5";
            const button = document.createElement("button");
            button.className = "custombutton";
            button.innerText = "Default values";
            button.setAttribute("type", "button");
            button.style.width = "150px";
            button.addEventListener("click", function() {
              coms.sendTo(
                "main",
                "secondWindow",
                {
                  width: 640,
                  height: 520,
                  backgroundColor: "#fff",
                  title: "Default values",
                  preload: "preloadDefaults.js",
                  html: "defaults.html"
                }
              );
            });
            div2.appendChild(button);
            elementsList.appendChild(div2);
          }
        },
        propertyUpdate: function(ev) {
          const el = ev.target;
          const propName = el.id.slice(2);
          let value = el.value;
          let targetId = dialog.selectedElement;
          if (!targetId) {
            const propsList = document.getElementById("propertiesList");
            const stored = propsList?.dataset.currentElementId || "";
            if (stored) targetId = stored;
          }
          if (!targetId) {
            const bound = el.dataset?.bindElementId || "";
            if (bound) targetId = bound;
          }
          const element = targetId ? dialog.getElement(targetId) : void 0;
          if (element) {
            const dataset = element.dataset;
            let props = { [propName]: value };
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
              };
            }
            renderutils.updateElement(element, props);
            const propsList = document.getElementById("propertiesList");
            if (propsList) {
              propsList.dataset.currentElementId = element.id;
            }
          } else {
            showError("Element not found.");
          }
        },
        initializeDialogProperties: function() {
          renderutils.setIntegers(["Width", "Height", "FontSize"], "dialog");
          const properties = document.querySelectorAll('#dialog-properties [id^="dialog"]');
          for (const element of properties) {
            if (element instanceof HTMLInputElement) {
              element.addEventListener("keyup", (ev) => {
                if (ev.key == "Enter") {
                  const el = ev.target;
                  el.blur();
                }
              });
            }
            element.addEventListener("blur", () => {
              const id = element.id;
              const idLower = id.toLowerCase();
              if (idLower === "dialogwidth" || idLower === "dialogheight") {
                const value = element.value;
                if (value) {
                  const dialogprops = renderutils.collectDialogProperties();
                  editor.updateDialogArea(dialogprops);
                }
              } else if (idLower === "dialogfontsize") {
                const value = element.value;
                if (value) {
                  const dialogprops = renderutils.collectDialogProperties();
                  editor.updateDialogArea(dialogprops);
                }
              } else if (idLower === "dialogname" || idLower === "dialogtitle" || idLower === "dialoglanguage" || idLower === "dialogruntimeprovider") {
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
            const next = el.nextElementSibling;
            if (next) {
              el.parentElement.insertBefore(next, el);
            }
          }
        },
        sendSelectedBackward: function() {
          const el = dialog.getElement(dialog.selectedElement);
          if (el && el.parentElement) {
            const prev = el.previousElementSibling;
            if (prev) {
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
            const childIds = renderutils.ungroupGroup(currentGroupId);
            currentGroupId = null;
            applySelection(childIds);
          }
        },
        selectAll: function() {
          const ids = Array.from(dialog.canvas.children).filter((el) => el instanceof HTMLElement && !el.classList.contains("lasso-rect")).map((el) => el.id);
          currentGroupId = null;
          applySelection(ids);
        },
        stringifyDialog: function() {
          const flattened = [];
          const toNumber = (v, fallback = 0) => {
            if (!v) return fallback;
            return utils.possibleNumeric(v) ? utils.asNumeric(v) : fallback;
          };
          const serializeElement = (node) => {
            const obj = { id: node.id };
            const typeName = String(node.dataset.type || node.tagName || "");
            const template = resolveTemplateForType(typeName);
            for (const [key, raw] of Object.entries(node.dataset)) {
              if (key === "id") continue;
              let value = raw;
              if (raw === "true" || raw === "false") {
                value = raw === "true";
              } else if (typeof raw === "string" && utils.possibleNumeric(raw)) {
                value = utils.asNumeric(raw);
              }
              obj[key] = value;
            }
            if (String(typeName).toLowerCase() === "label" && obj.valign === void 0) {
              obj.valign = String(template.valign ?? "top");
            }
            return obj;
          };
          const topLevel = Array.from(dialog.canvas.children);
          for (const child of topLevel) {
            if (child.classList.contains("element-group")) {
              const gLeft = toNumber(child.dataset.left, 0);
              const gTop = toNumber(child.dataset.top, 0);
              const members = Array.from(child.children);
              const rects = members.map((m) => m.getBoundingClientRect());
              const minLeft = Math.min(...rects.map((r) => r.left));
              const minTop = Math.min(...rects.map((r) => r.top));
              const maxRight = Math.max(...rects.map((r) => r.right));
              const maxBottom = Math.max(...rects.map((r) => r.bottom));
              const width = Math.round(maxRight - minLeft);
              const height = Math.round(maxBottom - minTop);
              const groupObj = {
                id: child.id,
                type: "Group",
                left: gLeft,
                top: gTop,
                width,
                height,
                nameid: child.dataset.nameid || "",
                elementIds: members.map((m) => m.id)
              };
              flattened.push(groupObj);
              for (const m of members) {
                if (m.classList.contains("lasso-rect")) continue;
                const obj = serializeElement(m);
                const mLeftAbs = toNumber(m.getAttribute("data-left"), 0) + gLeft;
                const mTopAbs = toNumber(m.getAttribute("data-top"), 0) + gTop;
                obj.left = mLeftAbs;
                obj.top = mTopAbs;
                flattened.push(obj);
              }
            } else if (child.classList.contains("lasso-rect")) {
              continue;
            } else {
              const obj = serializeElement(child);
              flattened.push(obj);
            }
          }
          const result = {
            id: dialog.id,
            properties: { ...dialog.properties },
            syntax: { ...dialog.syntax },
            i18n: mergeGeneratedDialogI18n(
              dialog.i18n,
              buildGeneratedDialogDictionary(dialog.properties, flattened),
              String(dialog.properties.language ?? "")
            ),
            customJS: dialog.customJS || "",
            elements: flattened
          };
          return JSON.stringify(result, null, 4);
        },
        previewDialog: function() {
          const json = editor.stringifyDialog();
          const width = Math.max(Number(dialog.properties.width) || 640, 200);
          const height = Math.max(Number(dialog.properties.height) || 480, 200);
          const winTitle = String(dialog.properties.title || dialog.properties.name || "Preview");
          coms.sendTo(
            "main",
            "secondWindow",
            {
              width,
              height,
              useContentSize: true,
              autoHideMenuBar: true,
              backgroundColor: "#ffffff",
              title: winTitle,
              preload: "preloadPreview.js",
              html: "preview.html",
              data: json
            }
          );
        },
        loadDialogFromJson: function(data) {
          try {
            const obj = typeof data === "string" ? JSON.parse(data) : data;
            if (!obj || !obj.properties) return;
            editor.deselectAll();
            const keys = Object.keys(dialog.elements);
            for (const id of keys) {
              const el = dialog.getElement(id);
              if (el && el.parentElement) el.parentElement.removeChild(el);
              dialog.removeElement(id);
            }
            dialog.canvas.innerHTML = "";
            const loadedDialogId = String(obj.id || "").trim();
            if (loadedDialogId) {
              dialog.id = loadedDialogId;
              dialog.canvas.id = loadedDialogId;
            }
            const props = obj.properties;
            const loadedI18n = sanitizeDialogI18n(obj.i18n);
            const loadedLanguage = canonicalDialogLocale(
              String(props.language ?? loadedI18n?.baseLocale ?? "en_US"),
              Object.keys(loadedI18n?.locales || {})
            );
            const loadedRuntimeProvider = String(props.runtimeProvider ?? "R").trim() || "R";
            dialog.properties = { ...props, language: loadedLanguage, runtimeProvider: loadedRuntimeProvider };
            dialog.customJS = String(obj.customJS || "");
            dialog.i18n = loadedI18n ? { ...loadedI18n, baseLocale: loadedLanguage } : void 0;
            const w = Number(props.width) || 640;
            const h = Number(props.height) || 480;
            dialog.canvas.style.width = w + "px";
            dialog.canvas.style.height = h + "px";
            const dwidth = document.getElementById("dialogWidth");
            if (dwidth) dwidth.value = String(props.width || "");
            const dheight = document.getElementById("dialogHeight");
            if (dheight) dheight.value = String(props.height || "");
            const dname = document.getElementById("dialogName");
            if (dname) dname.value = String(props.name || "");
            const dtitle = document.getElementById("dialogTitle");
            if (dtitle) dtitle.value = String(props.title || "");
            const dlang = document.getElementById("dialogLanguage");
            if (dlang) dlang.value = loadedLanguage;
            const druntime = document.getElementById("dialogRuntimeProvider");
            if (druntime) druntime.value = loadedRuntimeProvider;
            const dfont = document.getElementById("dialogFontSize");
            if (dfont) dfont.value = String(props.fontSize || "");
            const pf = Number(props.fontSize);
            if (Number.isFinite(pf) && pf > 0) {
              coms.fontSize = pf;
            }
            const arr = Array.isArray(obj.elements) ? obj.elements : [];
            const groups = [];
            const loadedElementPositions = /* @__PURE__ */ new Map();
            for (const element of arr) {
              if (String(element.type || "").toLowerCase() === "group") {
                groups.push(element);
                continue;
              }
              const core = renderutils.makeElement({ ...element });
              const wrapper = document.createElement("div");
              wrapper.classList.add("element-wrapper");
              wrapper.style.position = "absolute";
              const desiredId = String(element.id || core.id);
              const desiredType = String(element.type || core.dataset.type || "");
              const desiredNameId = String(element.nameid || core.dataset.nameid || "");
              wrapper.id = desiredId;
              core.id = desiredId + "-inner";
              const left2 = Number(element.left ?? (parseInt(core.style.left || "0", 10) || 0));
              const top2 = Number(element.top ?? (parseInt(core.style.top || "0", 10) || 0));
              wrapper.style.left = `${left2}px`;
              wrapper.style.top = `${top2}px`;
              loadedElementPositions.set(wrapper.id, { left: left2, top: top2 });
              for (const [key, value] of Object.entries(element)) {
                if (key === "id") continue;
                const val = typeof value === "string" ? value : String(value);
                wrapper.dataset[key] = val;
              }
              wrapper.dataset.type = desiredType;
              if (desiredNameId) {
                wrapper.dataset.nameid = desiredNameId;
              }
              if (desiredType === "Container" && !("itemOrder" in wrapper.dataset)) {
                wrapper.dataset.itemOrder = "false";
              }
              if (desiredType === "Container" && !("pinontop" in wrapper.dataset)) {
                wrapper.dataset.pinontop = "false";
              }
              hydrateElementDatasetDefaults(wrapper);
              core.style.left = "0px";
              core.style.top = "0px";
              if (desiredType === "Button") {
                core.style.position = "relative";
              }
              wrapper.appendChild(core);
              const wid = wrapper.id;
              const r = core.querySelector(".custom-radio");
              if (r) r.id = `radio-${wid}`;
              const cb = core.querySelector(".custom-checkbox");
              if (cb) cb.id = `checkbox-${wid}`;
              const cv = core.querySelector(".counter-value");
              if (cv) cv.id = `counter-value-${wid}`;
              const inc = core.querySelector(".counter-arrow.up");
              if (inc) inc.id = `counter-increase-${wid}`;
              const dec = core.querySelector(".counter-arrow.down");
              if (dec) dec.id = `counter-decrease-${wid}`;
              const sh = core.querySelector(".slider-handle");
              if (sh) {
                sh.id = `slider-handle-${wid}`;
                renderutils.updateHandleStyle(sh, {
                  handleshape: wrapper.dataset.handleshape || core.dataset.handleshape || "triangle",
                  direction: wrapper.dataset.direction || core.dataset.direction || "horizontal",
                  handlesize: wrapper.dataset.handlesize || core.dataset.handlesize || "8",
                  handleColor: wrapper.dataset.handleColor || core.dataset.handleColor || "#558855",
                  handlepos: wrapper.dataset.handlepos || core.dataset.handlepos || "50"
                });
              }
              dialog.canvas.appendChild(wrapper);
              const innerCover = core.querySelector(".elementcover");
              innerCover && innerCover.parentElement?.removeChild(innerCover);
              const cover2 = document.createElement("div");
              cover2.id = `cover-${wrapper.id}`;
              cover2.className = "elementcover";
              wrapper.appendChild(cover2);
              if (desiredType !== "Button" && desiredType !== "Label") {
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
            for (const g of groups) {
              const ids = Array.isArray(g.elementIds) ? g.elementIds : String(g.elementIds || "").split(",").map((s) => s.trim()).filter((s) => s.length);
              const newId = renderutils.makeGroupFromSelection(ids, true);
              if (!newId) continue;
              const groupEl = dialog.getElement(newId);
              if (!groupEl) continue;
              const savedId = String(g.id || newId);
              groupEl.id = savedId;
              dialog.elements[savedId] = groupEl;
              delete dialog.elements[newId];
              const gl = g.left;
              const gt = g.top;
              if (gl !== void 0 || gt !== void 0) {
                const props2 = {};
                if (gl !== void 0) props2.left = String(gl);
                if (gt !== void 0) props2.top = String(gt);
                renderutils.updateElement(groupEl, props2);
              }
            }
            if (Number.isFinite(coms.fontSize) && coms.fontSize > 0) {
              renderutils.updateFont(coms.fontSize);
            }
            loadedElementPositions.forEach((pos, id) => {
              const el = dialog.getElement(id);
              if (!el) return;
              const parent = el.parentElement;
              if (parent && parent.classList.contains("element-group")) {
                const groupLeft = Number(parent.dataset.left ?? (parseInt(parent.style.left || "0", 10) || 0));
                const groupTop = Number(parent.dataset.top ?? (parseInt(parent.style.top || "0", 10) || 0));
                const relLeft = pos.left - groupLeft;
                const relTop = pos.top - groupTop;
                el.style.left = `${relLeft}px`;
                el.style.top = `${relTop}px`;
                el.dataset.left = String(relLeft);
                el.dataset.top = String(relTop);
                return;
              }
              el.style.left = `${pos.left}px`;
              el.style.top = `${pos.top}px`;
              el.dataset.left = String(pos.left);
              el.dataset.top = String(pos.top);
            });
          } catch (error) {
            console.error("loadDialogFromJson failed", error);
          }
        }
      };
    }
  });

  // src/library/renderutils.ts
  function getRadioWrapperFromNode(node) {
    if (!(node instanceof HTMLElement)) {
      return null;
    }
    const directType = String(node.dataset?.type || "").trim();
    if (directType === "Radio") {
      return node;
    }
    const wrapper = node.closest(".element-wrapper");
    if (wrapper instanceof HTMLElement) {
      const wrapperType = String(wrapper.dataset?.type || "").trim();
      if (wrapperType === "Radio") {
        return wrapper;
      }
    }
    return null;
  }
  function withElementList(elementOrElements, fn2) {
    const list = Array.isArray(elementOrElements) ? elementOrElements : [elementOrElements];
    list.forEach((name) => {
      const trimmed = String(name ?? "").trim();
      if (!trimmed) {
        return;
      }
      fn2(trimmed);
    });
  }
  function resolveElementHost(name) {
    const escaped = CSS_ESCAPE(name);
    let host = document.querySelector(`[data-nameid="${escaped}"]`);
    let isRadio = false;
    if (!host) {
      host = document.getElementById(name);
    }
    if (!host) {
      const radio = document.getElementsByName(name)[0];
      if (radio && radio.parentNode && radio.parentNode.parentNode instanceof HTMLElement) {
        host = radio.parentNode.parentNode;
        isRadio = true;
      }
    }
    if (host && !isRadio) {
      const type = String(
        host.dataset?.type || host.getAttribute?.("data-type") || host.firstElementChild?.getAttribute?.("data-type") || ""
      );
      isRadio = type === "Radio";
    }
    return { host, isRadio };
  }
  function ensureTooltip(name, anchor, content) {
    if (!error_tippy[name]) {
      error_tippy[name] = [
        tippy_esm_default(anchor, {
          theme: "light-red",
          placement: "top-start",
          content,
          arrow: false,
          allowHTML: true,
          // Keep tooltip out of the way and outside the canvas stacking context
          appendTo: () => document.body,
          offset: [0, 8],
          zIndex: 9999,
          interactive: false
        })
      ];
    } else {
      error_tippy[name][0]?.setContent(content);
    }
  }
  function destroyTooltip(name) {
    if (error_tippy[name]) {
      error_tippy[name][0]?.destroy();
      delete error_tippy[name];
    }
  }
  function bestAnchorFor(name, fallback) {
    const stored = highlight_targets.get(name);
    if (stored && stored.size) {
      for (const node of stored) return node;
    }
    if (fallback && fallback.firstElementChild instanceof HTMLElement) {
      return fallback.firstElementChild;
    }
    return fallback;
  }
  function removeHighlightClasses(node) {
    if (!node) return;
    node.classList.remove("error-in-field", "error-in-radio");
  }
  function clearStoredHighlight(name) {
    const stored = highlight_targets.get(name);
    if (stored) {
      stored.forEach((target2) => removeHighlightClasses(target2));
      highlight_targets.delete(name);
    }
  }
  var Sortable, __uniformSchema, validation_messages, error_tippy, auto_highlight, highlight_targets, enhancedButtons, handlerModules, KNOWN_CONTAINER_ITEM_TYPES, previewWindow, normalizeContainerItemType, resolveContainerItemType, syncInputOverflow, splitList, normalizeOrderList, ELEMENT_ICON_ALIASES, normalizeElementIcon, resolveElementIconSize, normalizeLabelVAlign, resolveElementTemplate, ensureElementTextNode, ensureElementIconNode, syncElementPresentation, mergeSelectionOrder, reorderContainerItemsForPinOnTop, getDisabledColor, parseCssColor, blendCssColors, applyEditorContainerSampleState, applyControlDisabledAppearance, applyCounterDisabledAppearance, applyContainerItemFilter, SORTER_STATE_KEY, normalizeChoiceOrdering, normalizeChoiceOrientation, normalizeChoiceSelection, preferredSorterState, coerceSorterItemsForSelection, normalizeSorterItemsForMode, buildSorterSampleState, splitSorterValues, parseSorterState, stringifySorterState, normalizeSorterItems, cycleSorterState, applySorterStateClasses, updateSorterDataset, CSS_ESCAPE, errorutils, errorhelpers, renderutils;
  var init_renderutils = __esm({
    "src/library/renderutils.ts"() {
      "use strict";
      init_utils();
      init_dialog();
      init_elements();
      init_coms();
      init_api();
      init_dist();
      init_tippy_esm();
      Sortable = require_Sortable_min();
      __uniformSchema = null;
      validation_messages = {};
      error_tippy = {};
      auto_highlight = /* @__PURE__ */ new Set();
      highlight_targets = /* @__PURE__ */ new Map();
      enhancedButtons = /* @__PURE__ */ new WeakSet();
      handlerModules = {
        "../modules/cover": () => Promise.resolve().then(() => (init_cover(), cover_exports)),
        "../modules/editor": () => Promise.resolve().then(() => (init_editor(), editor_exports))
      };
      KNOWN_CONTAINER_ITEM_TYPES = /* @__PURE__ */ new Set([
        "numeric",
        "factor",
        "calibrated",
        "binary",
        "character",
        "categorical",
        "date"
      ]);
      previewWindow = () => {
        try {
          const loc = window.location.pathname.toLowerCase();
          if (loc.includes("preview.html")) return true;
          if (document.body && document.body.dataset.view === "preview") return true;
          return !document.getElementById("dialog-properties");
        } catch {
          return false;
        }
      };
      normalizeContainerItemType = (value) => {
        const raw = String(value ?? "").trim().toLowerCase();
        if (!raw) return "";
        if (raw === "any") return "any";
        if (KNOWN_CONTAINER_ITEM_TYPES.has(raw)) {
          return raw;
        }
        return raw;
      };
      resolveContainerItemType = (value) => {
        const normalized = normalizeContainerItemType(value);
        if (!normalized || normalized === "any") {
          return "any";
        }
        if (!KNOWN_CONTAINER_ITEM_TYPES.has(normalized)) {
          return "any";
        }
        return normalized;
      };
      syncInputOverflow = (input) => {
        if (!input) return;
        input.style.overflowX = "hidden";
        const needsVerticalScrollbar = input.scrollHeight - input.clientHeight > 1;
        input.style.overflowY = needsVerticalScrollbar ? "auto" : "hidden";
      };
      splitList = (raw) => {
        return String(raw ?? "").split(",").map((s) => s.trim()).filter(Boolean);
      };
      normalizeOrderList = (values) => {
        const seen = /* @__PURE__ */ new Set();
        const out = [];
        values.forEach((value) => {
          const next = String(value || "").trim();
          if (!next || seen.has(next)) return;
          seen.add(next);
          out.push(next);
        });
        return out;
      };
      ELEMENT_ICON_ALIASES = {
        none: "none",
        minus: "dash",
        remove: "dash",
        plus: "plus",
        add: "plus",
        x: "close"
      };
      normalizeElementIcon = (value) => {
        const raw = String(value ?? "").trim().toLowerCase();
        if (!raw || raw === "none") return "none";
        return ELEMENT_ICON_ALIASES[raw] ?? raw;
      };
      resolveElementIconSize = (iconSize, fallback) => {
        const parsed = Number(iconSize);
        if (Number.isFinite(parsed) && parsed > 0) {
          return parsed;
        }
        return fallback;
      };
      normalizeLabelVAlign = (value) => {
        const raw = String(value ?? "").trim().toLowerCase();
        if (raw === "top" || raw === "bottom") {
          return raw;
        }
        return "top";
      };
      resolveElementTemplate = (typeName) => {
        const rawType = String(typeName ?? "").trim();
        if (!rawType) {
          return elements.buttonElement;
        }
        const key = `${rawType.charAt(0).toLowerCase()}${rawType.slice(1)}Element`;
        const template = elements[key];
        return template && typeof template === "object" ? template : elements.buttonElement;
      };
      ensureElementTextNode = (host, className) => {
        let span = host.querySelector(`.${className}`);
        if (!span) {
          span = document.createElement("span");
          span.className = className;
          host.appendChild(span);
        }
        return span;
      };
      ensureElementIconNode = (host, className) => {
        let icon = host.querySelector(`.${className}`);
        if (!icon) {
          icon = document.createElement("span");
          icon.className = className;
          host.appendChild(icon);
        }
        return icon;
      };
      syncElementPresentation = (host, text, iconName, textClassName, iconClassName, datasetKey) => {
        const span = ensureElementTextNode(host, textClassName);
        const icon = ensureElementIconNode(host, iconClassName);
        const normalized = normalizeElementIcon(iconName);
        span.textContent = text;
        if (normalized === "none") {
          icon.className = `${iconClassName} codicon`;
          icon.innerHTML = "";
          icon.style.display = "none";
          span.style.display = "block";
          if (datasetKey) {
            delete host.dataset[datasetKey];
          }
          return;
        }
        icon.className = `${iconClassName} codicon codicon-${normalized}`;
        icon.innerHTML = "";
        icon.style.display = "flex";
        span.style.display = "none";
        if (datasetKey) {
          host.dataset[datasetKey] = normalized;
        }
      };
      mergeSelectionOrder = (host, activeItems) => {
        const prev = normalizeOrderList(splitList(host.dataset.selectedOrder));
        const activeSet = new Set(activeItems);
        const next = prev.filter((v) => activeSet.has(v));
        const seen = new Set(next);
        activeItems.forEach((value) => {
          if (!seen.has(value)) {
            next.push(value);
            seen.add(value);
          }
        });
        return next;
      };
      reorderContainerItemsForPinOnTop = (host) => {
        if (host.dataset.deferPinOnTop === "true") {
          return;
        }
        const content = host.querySelector(".container-content");
        if (!content) {
          return;
        }
        const items = Array.from(content.querySelectorAll(":scope > .container-item"));
        if (items.length < 2) {
          return;
        }
        const pinnedValues = utils.isTrue(host.dataset.itemOrder) ? normalizeOrderList(splitList(host.dataset.selectedOrder)) : [];
        const pinnedIndex = new Map(pinnedValues.map((value, index) => [value, index]));
        const pinOnTop = utils.isTrue(host.dataset.pinontop);
        const decorated = items.map((item, index) => ({
          item,
          index,
          baseOrder: Number.parseInt(String(item.dataset.baseOrder || index), 10),
          active: item.classList.contains("active"),
          value: String(item.dataset.value || "").trim()
        }));
        decorated.sort((left2, right2) => {
          if (!pinOnTop) {
            return left2.baseOrder - right2.baseOrder;
          }
          if (left2.active !== right2.active) {
            return left2.active ? -1 : 1;
          }
          if (!left2.active) {
            return left2.baseOrder - right2.baseOrder;
          }
          const leftPinned = pinnedIndex.get(left2.value);
          const rightPinned = pinnedIndex.get(right2.value);
          if (leftPinned !== void 0 || rightPinned !== void 0) {
            if (leftPinned === void 0) return 1;
            if (rightPinned === void 0) return -1;
            if (leftPinned !== rightPinned) return leftPinned - rightPinned;
          }
          return left2.baseOrder - right2.baseOrder;
        });
        decorated.forEach(({ item }) => {
          content.appendChild(item);
        });
        if (pinOnTop) {
          content.scrollTop = 0;
        }
      };
      getDisabledColor = (source) => {
        const raw = String(source.disabledColor ?? "").trim();
        return raw || "#dedede";
      };
      parseCssColor = (value) => {
        const raw = String(value || "").trim();
        if (!raw || typeof document === "undefined" || !document.body) {
          return null;
        }
        const probe = document.createElement("span");
        probe.style.color = raw;
        if (!probe.style.color) {
          return null;
        }
        probe.style.display = "none";
        document.body.appendChild(probe);
        const resolved = getComputedStyle(probe).color;
        probe.remove();
        const match = resolved.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
        if (!match) {
          return null;
        }
        return [Number(match[1]), Number(match[2]), Number(match[3])];
      };
      blendCssColors = (foreground, background, foregroundWeight = 0.62) => {
        const fg = parseCssColor(foreground);
        const bg = parseCssColor(background);
        if (!fg || !bg) {
          return null;
        }
        const w = Math.max(0, Math.min(1, foregroundWeight));
        const mix = (a, b) => Math.round(a * w + b * (1 - w));
        return `rgb(${mix(fg[0], bg[0])}, ${mix(fg[1], bg[1])}, ${mix(fg[2], bg[2])})`;
      };
      applyEditorContainerSampleState = (host, source, enabled) => {
        if (!(host instanceof HTMLElement) || previewWindow()) {
          return;
        }
        const activeRow = host.querySelector(".container-sample .container-item.active");
        const activeLabel = activeRow?.querySelector(".container-text");
        if (!activeRow) {
          return;
        }
        const activeBg = String(source.activeBackgroundColor ?? "").trim() || "#589658";
        const activeFg = String(source.activeFontColor ?? "").trim() || "#ffffff";
        const disabledBg = getDisabledColor(source);
        const disabledActiveBg = blendCssColors(activeBg, disabledBg, 0.62) || activeBg;
        host.style.setProperty("--container-disabled-bg", disabledBg);
        host.style.setProperty("--container-disabled-active-bg", disabledActiveBg);
        activeRow.style.backgroundColor = enabled ? activeBg : disabledActiveBg;
        if (activeLabel) {
          activeLabel.style.color = activeFg;
        }
      };
      applyControlDisabledAppearance = (opts) => {
        const disabledBg = getDisabledColor(opts.source);
        if (opts.input) {
          opts.input.style.setProperty("--input-disabled-background-color", disabledBg);
          opts.input.style.backgroundColor = opts.enabled ? "#ffffff" : disabledBg;
        }
        if (opts.checkbox) {
          opts.checkbox.style.setProperty("--checkbox-disabled-background-color", disabledBg);
          opts.checkbox.setAttribute("aria-disabled", String(!opts.enabled));
          if (opts.enabled) {
            opts.checkbox.style.removeProperty("background-color");
          } else {
            opts.checkbox.style.backgroundColor = disabledBg;
          }
        }
        if (opts.radio) {
          opts.radio.style.setProperty("--radio-disabled-background-color", disabledBg);
          opts.radio.setAttribute("aria-disabled", String(!opts.enabled));
          if (opts.enabled) {
            opts.radio.style.removeProperty("background-color");
          } else {
            opts.radio.style.backgroundColor = disabledBg;
          }
        }
      };
      applyCounterDisabledAppearance = (host, enabled, source) => {
        if (!(host instanceof HTMLElement)) {
          return;
        }
        const fillColor = String(source.color ?? "").trim() || "#558855";
        const disabledFill = getDisabledColor(source);
        const glyphs = host.querySelectorAll(".counter-arrow-glyph");
        glyphs.forEach((glyph) => {
          glyph.style.setProperty("--counter-arrow-fill-color", enabled ? fillColor : disabledFill);
        });
      };
      applyContainerItemFilter = (host) => {
        if (!(host instanceof HTMLElement)) {
          return;
        }
        if (!previewWindow()) {
          return;
        }
        const allowed = resolveContainerItemType(host.dataset.itemType);
        const allowAll = allowed === "any";
        const query = String(host.dataset.searchQuery || "").trim().toLowerCase();
        const items = Array.from(host.querySelectorAll(".container-item"));
        const normalBg = host.dataset.backgroundColor || "#ffffff";
        const normalFg = host.dataset.fontColor || "#000000";
        const activeBg = host.dataset.activeBackgroundColor || "#589658";
        const activeFg = host.dataset.activeFontColor || "#ffffff";
        const disabledBg = host.dataset.disabledColor || "#d8d8d8";
        let selectionChanged = false;
        items.forEach((item) => {
          const rawItemType = item.dataset.itemType || item.dataset.valueType || "";
          const itemType = normalizeContainerItemType(rawItemType);
          const itemFlags = String(item.dataset.itemFlags || "").split(",").map((flag) => normalizeContainerItemType(flag)).filter(Boolean);
          const hasExplicitType = Boolean(rawItemType) || itemFlags.length > 0;
          const blocked = !allowAll && hasExplicitType && itemType !== allowed && !itemFlags.includes(allowed);
          const label = item.querySelector(".container-text");
          const text = String(label?.textContent || item.dataset.value || "").trim().toLowerCase();
          const matchesQuery = !query || text.includes(query);
          item.style.display = matchesQuery ? "" : "none";
          if (blocked) {
            item.classList.add("container-item-disabled");
            item.dataset.disabled = "true";
            item.setAttribute("aria-disabled", "true");
            if (item.classList.contains("active")) {
              item.classList.remove("active");
              selectionChanged = true;
            }
            item.style.backgroundColor = disabledBg;
            if (label) {
              label.style.color = normalFg;
            }
          } else {
            item.classList.remove("container-item-disabled");
            if (item.dataset.disabled) {
              delete item.dataset.disabled;
            }
            item.removeAttribute("aria-disabled");
            const isActive = item.classList.contains("active");
            item.style.backgroundColor = isActive ? activeBg : normalBg;
            if (label) {
              label.style.color = isActive ? activeFg : normalFg;
            }
          }
        });
        if (selectionChanged) {
          const activeItems = items.filter((node) => node.classList.contains("active")).map((node) => node.querySelector(".container-text")?.textContent || "").map((text) => text.trim()).filter(Boolean);
          const joined = activeItems.join(",");
          host.dataset.selected = joined;
          host.dataset.activeValues = joined;
          if (utils.isTrue(host.dataset.itemOrder)) {
            const ordered = mergeSelectionOrder(host, activeItems);
            host.dataset.selectedOrder = ordered.join(",");
          } else if ("selectedOrder" in host.dataset) {
            delete host.dataset.selectedOrder;
          }
          host.dispatchEvent(new Event("change", { bubbles: true }));
        }
        reorderContainerItemsForPinOnTop(host);
      };
      SORTER_STATE_KEY = "sorterState";
      normalizeChoiceOrdering = (value) => {
        const raw = String(value ?? "").trim().toLowerCase();
        if (raw === "decreasing" || raw === "desc" || raw === "descending") {
          return "decreasing";
        }
        if (raw === "increasing" || raw === "asc" || raw === "ascending" || raw === "true") {
          return "increasing";
        }
        return "no";
      };
      normalizeChoiceOrientation = (value) => {
        const raw = String(value ?? "").trim().toLowerCase();
        return raw === "horizontal" ? "horizontal" : "vertical";
      };
      normalizeChoiceSelection = (value) => {
        const raw = String(value ?? "").trim().toLowerCase();
        if (raw === "single-radio" || raw === "single_forced" || raw === "radio") {
          return "single-radio";
        }
        if (raw === "single") {
          return "single";
        }
        return "multiple";
      };
      preferredSorterState = (mode) => {
        return mode === "decreasing" ? "desc" : "asc";
      };
      coerceSorterItemsForSelection = (items, selectionMode, orderingMode) => {
        if (selectionMode === "multiple") {
          return items;
        }
        let kept = false;
        const next = items.map((item) => {
          if (item.state === "off") {
            return item;
          }
          if (!kept) {
            kept = true;
            return item;
          }
          return { ...item, state: "off" };
        });
        if (selectionMode === "single-radio" && !next.some((item) => item.state !== "off") && next.length > 0) {
          next[0] = { ...next[0], state: preferredSorterState(orderingMode) };
        }
        return next;
      };
      normalizeSorterItemsForMode = (items, mode) => {
        if (mode !== "no") {
          return items;
        }
        return items.map((item) => ({
          text: item.text,
          state: item.state === "off" ? "off" : "asc"
        }));
      };
      buildSorterSampleState = (labels, mode) => {
        if (labels.length === 0) {
          return void 0;
        }
        const sample = labels[1];
        if (!sample) {
          return void 0;
        }
        const preferred = mode === "no" ? "asc" : preferredSorterState(mode);
        return stringifySorterState(labels.map((text) => ({
          text,
          state: text === sample ? preferred : "off"
        })));
      };
      splitSorterValues = (value) => {
        return String(value ?? "").split(/[;,]/).map((s) => s.trim()).filter(Boolean);
      };
      parseSorterState = (raw) => {
        if (!raw) return [];
        try {
          const parsed = JSON.parse(String(raw));
          if (Array.isArray(parsed)) {
            return parsed.map((item) => {
              const text = String(item?.text ?? item?.label ?? item?.name ?? "").trim();
              const state = String(item?.state ?? "").toLowerCase();
              const normalized = state === "asc" || state === "desc" ? state : "off";
              return text ? { text, state: normalized } : null;
            }).filter(Boolean);
          }
        } catch {
        }
        return [];
      };
      stringifySorterState = (items) => JSON.stringify(items.map((it) => ({ text: it.text, state: it.state })));
      normalizeSorterItems = (itemsValue, stateRaw) => {
        const labels = splitSorterValues(itemsValue);
        const prev = parseSorterState(stateRaw);
        const prevMap = new Map(prev.map((it) => [it.text, it.state]));
        return labels.map((label) => ({
          text: label,
          state: prevMap.get(label) || "off"
        }));
      };
      cycleSorterState = (current, mode) => {
        if (mode === "no") {
          return current === "off" ? "asc" : "off";
        }
        const preferred = preferredSorterState(mode);
        const alternate = preferred === "asc" ? "desc" : "asc";
        if (current === "off") return preferred;
        if (current === preferred) return alternate;
        return "off";
      };
      applySorterStateClasses = (row, item, colors, orderingMode, indicator) => {
        row.classList.remove("is-asc", "is-desc", "is-off");
        row.dataset.state = item.state;
        const indicatorChar = item.state === "off" ? preferredSorterState(orderingMode) === "desc" ? "\u25BC" : "\u25B2" : item.state === "desc" ? "\u25BC" : "\u25B2";
        if (item.state === "asc") {
          row.classList.add("is-asc");
          row.style.setProperty("--sorter-row-bg", colors.activeBg);
          row.style.color = colors.activeFg;
        } else if (item.state === "desc") {
          row.classList.add("is-desc");
          row.style.setProperty("--sorter-row-bg", colors.activeBg);
          row.style.color = colors.activeFg;
        } else {
          row.classList.add("is-off");
          row.style.setProperty("--sorter-row-bg", colors.baseBg);
          row.style.color = colors.baseFg;
        }
        if (indicator) {
          indicator.classList.remove("asc", "desc", "off");
          const cls = item.state === "asc" ? "asc" : item.state === "desc" ? "desc" : "off";
          indicator.classList.add(cls);
          indicator.textContent = indicatorChar;
        }
      };
      updateSorterDataset = (host, items) => {
        const order2 = items.map((it) => it.text).join(",");
        const selected = items.filter((it) => it.state !== "off").map((it) => `${it.text}:${it.state}`);
        const joinedSelected = selected.join(",");
        const targets = /* @__PURE__ */ new Set();
        targets.add(host);
        const wrapper = host.classList.contains("element-wrapper") ? host : host.closest(".element-wrapper");
        if (wrapper) {
          targets.add(wrapper);
        }
        targets.forEach((node) => {
          node.dataset.items = order2;
          node.dataset.order = order2;
          node.dataset.activeValues = joinedSelected;
          node.dataset.selected = joinedSelected;
          node.dataset[SORTER_STATE_KEY] = stringifySorterState(items);
        });
      };
      CSS_ESCAPE = (value) => {
        if (typeof CSS !== "undefined" && CSS.escape) {
          return CSS.escape(value);
        }
        return value.replace(/"/g, '\\"');
      };
      errorutils = {
        addTooltip(element, message) {
          const text = String(message ?? "");
          if (!text) return;
          withElementList(element, (name) => {
            const { host } = resolveElementHost(name);
            if (!host) return;
            errorutils.addHighlight(name);
            const anchor = bestAnchorFor(name, host);
            ensureTooltip(name, anchor || host, text);
            if (!validation_messages[name]) {
              validation_messages[name] = { name, errors: [text] };
              auto_highlight.add(name);
            } else if (!validation_messages[name].errors.includes(text)) {
              validation_messages[name].errors.push(text);
            }
          });
        },
        clearTooltip(element, message) {
          withElementList(element, (name) => {
            const existing = validation_messages[name];
            if (!existing) {
              destroyTooltip(name);
              clearStoredHighlight(name);
              return;
            }
            if (message) {
              existing.errors = existing.errors.filter((err) => err !== message);
            } else {
              existing.errors = [];
            }
            if (existing.errors.length === 0) {
              destroyTooltip(name);
              delete validation_messages[name];
              clearStoredHighlight(name);
              auto_highlight.delete(name);
            } else {
              const { host } = resolveElementHost(name);
              const anchor = bestAnchorFor(name, host);
              if (anchor) {
                ensureTooltip(name, anchor, existing.errors[0]);
              }
            }
          });
        },
        addHighlight(element, kind) {
          withElementList(element, (name) => {
            const { host, isRadio } = resolveElementHost(name);
            if (!host) return;
            const inferredKind = kind ?? (host.dataset?.type === "Radio" || isRadio ? "radio" : "field");
            const highlightClass = inferredKind === "radio" ? "error-in-radio" : "error-in-field";
            let target2 = null;
            if (highlightClass === "error-in-radio") {
              target2 = host.querySelector(".custom-radio");
            } else {
              target2 = host.querySelector("input, select, textarea, button");
              if (!target2) target2 = host.firstElementChild;
            }
            const node = target2 || host;
            clearStoredHighlight(name);
            node.classList.add(highlightClass);
            const store = /* @__PURE__ */ new Set();
            store.add(node);
            highlight_targets.set(name, store);
          });
        },
        clearHighlight(element) {
          withElementList(element, (name) => {
            clearStoredHighlight(name);
            auto_highlight.delete(name);
          });
        }
      };
      errorhelpers = errorutils;
      renderutils = {
        // Determine if current window/context is the Preview window
        previewWindow,
        unselectRadioGroup: function(element) {
          const group = element?.getAttribute?.("group") || "";
          if (!group) return;
          if (renderutils.previewWindow()) {
            const escaped = CSS_ESCAPE(group);
            const radios2 = Array.from(document.querySelectorAll(`.custom-radio[group="${escaped}"]`));
            radios2.forEach((node) => {
              if (node === element) return;
              const wrapper = getRadioWrapperFromNode(node);
              if (!wrapper) return;
              node.setAttribute("aria-checked", "false");
              node.classList.remove("selected");
              try {
                wrapper.dataset.isSelected = "false";
              } catch {
              }
              const native = wrapper.querySelector('input[type="radio"]');
              if (native) native.checked = false;
            });
            return;
          }
          const radios = Array.from(document.querySelectorAll(`[group="${group}"]`));
          radios.forEach((radio) => {
            const id = radio.id.slice(6);
            const native = document.getElementById(`native-radio-${id}`);
            try {
              dialog.elements[id].dataset.isSelected = "false";
            } catch {
            }
            radio.setAttribute("aria-checked", "false");
            radio.classList.remove("selected");
            if (native) {
              native.checked = false;
            }
          });
        },
        makeUniqueNameID: function(baseName) {
          const existingIds = renderutils.getDialogInfo().elements;
          const base = String(baseName || "el");
          let max2 = 0;
          for (const id of existingIds) {
            if (typeof id !== "string") continue;
            if (!id.startsWith(base)) continue;
            const suffix = id.slice(base.length);
            if (/^\d+$/.test(suffix)) {
              const n = Number(suffix);
              if (Number.isFinite(n) && n > max2) max2 = n;
            }
          }
          const next = max2 + 1;
          const candidate = `${base}${next}`;
          return candidate;
        },
        nameidValidChange: function(newId, currentElement) {
          const n = String(newId || "").trim();
          if (!n) return false;
          try {
            const wrappers = Object.values(dialog.elements);
            if (wrappers && wrappers.length) {
              const ids = new Set(
                wrappers.filter((w) => w && w.id !== currentElement.id).map((w) => w.dataset?.nameid || "").filter((v) => v && v.length)
              );
              return !ids.has(n);
            }
          } catch {
          }
          const allIds = new Set(
            Array.from(document.querySelectorAll("[data-nameid]")).filter((el) => el !== currentElement && !currentElement.contains(el)).map((el) => el.dataset.nameid || "").filter((v) => v && v.length)
          );
          return !allIds.has(n);
        },
        setInputFilter: function(textbox, inputFilter) {
          if (!textbox) return;
          const state = {
            oldValue: "",
            oldSelectionStart: 0,
            oldSelectionEnd: 0
          };
          [
            "input",
            "keydown",
            "keyup",
            "mousedown",
            "mouseup",
            "select",
            "contextmenu",
            "drop",
            "focusout"
          ].forEach((event) => {
            textbox.addEventListener(event, function() {
              if (inputFilter(textbox.value)) {
                state.oldValue = textbox.value;
                state.oldSelectionStart = textbox.selectionStart ?? 0;
                state.oldSelectionEnd = textbox.selectionEnd ?? 0;
              } else if (state.oldValue !== void 0) {
                textbox.value = state.oldValue;
                if (!(utils.isNull(state.oldSelectionStart) || utils.isNull(state.oldSelectionEnd))) {
                  textbox.setSelectionRange(state.oldSelectionStart, state.oldSelectionEnd);
                }
              } else {
                textbox.value = "";
              }
            });
          });
        },
        setIntegers: function(items, prefix = "el") {
          items.forEach((item) => {
            let element = null;
            if (item instanceof HTMLInputElement) {
              element = item;
            } else {
              element = document.getElementById(prefix + item);
            }
            if (!element) return;
            renderutils.setInputFilter(
              element,
              function(value) {
                let v = String(value || "");
                if (v === "") return true;
                if (!/^\d+$/.test(v)) return false;
                if (v.length > 1 && v.startsWith("0")) {
                  const stripped = v.replace(/^0+/, "");
                  element.value = stripped === "" ? "0" : stripped;
                }
                return true;
              }
            );
          });
        },
        setSignedIntegers: function(items, prefix = "el") {
          items.forEach((item) => {
            let element = null;
            if (item instanceof HTMLInputElement) {
              element = item;
            } else {
              element = document.getElementById(prefix + item);
            }
            if (!element) return;
            renderutils.setInputFilter(
              element,
              function(value) {
                let v = String(value || "");
                if (v === "" || v === "-") return true;
                if (!/^-?\d+$/.test(v)) return false;
                if (v.startsWith("-0")) {
                  if (v.length === 2) {
                    element.value = "-";
                    return true;
                  }
                  const stripped = v.slice(2).replace(/^0+/, "");
                  element.value = "-" + (stripped === "" ? "" : stripped);
                  return true;
                }
                if (!v.startsWith("-") && v.length > 1 && v.startsWith("0")) {
                  const stripped = v.replace(/^0+/, "");
                  element.value = stripped === "" ? "0" : stripped;
                  return true;
                }
                return true;
              }
            );
          });
        },
        setDouble: function(items, prefix = "el") {
          items.forEach((item) => {
            let element = null;
            if (item instanceof HTMLInputElement) {
              element = item;
            } else {
              element = document.getElementById(prefix + item);
            }
            if (!element) return;
            renderutils.setInputFilter(
              element,
              function(value) {
                if (value.endsWith("..") || value.endsWith(".,")) {
                  const x = value.split("");
                  x.splice(-1);
                  value = x.join("");
                  element.value = value;
                  return false;
                }
                if (value.endsWith(",")) {
                  const x = value.split("");
                  x.splice(-1);
                  x.push(".");
                  value = x.join("");
                  element.value = value;
                }
                if (value === "" || value.endsWith(".")) {
                  return true;
                }
                return /^\d*\.?\d{1,3}$/.test(value);
              }
            );
          });
        },
        setSignedDouble: function(items, prefix = "el") {
          items.forEach((item) => {
            let element = null;
            if (item instanceof HTMLInputElement) {
              element = item;
            } else {
              element = document.getElementById(prefix + item);
            }
            if (!element) return;
            renderutils.setInputFilter(
              element,
              function(value) {
                const v = String(value || "");
                if (v === "" || v === "+" || v === "-" || v === "." || v === "+." || v === "-.") return true;
                if (/^[+-]?\d+$/.test(v)) return true;
                if (/^[+-]?\d*\.\d*$/.test(v)) return true;
                if (/^[+-]?\.\d+$/.test(v)) return true;
                return false;
              }
            );
          });
        },
        getDialogInfo: function() {
          return {
            elements: Array.from(Object.values(dialog.elements)).map((el) => el.dataset.nameid),
            selected: dialog.getElement(dialog.selectedElement)
          };
        },
        makeElement: function(data) {
          if (typeof data !== "object" || Array.isArray(data)) {
            showError("Invalid settings for this element.");
          }
          const template = resolveElementTemplate(data?.type);
          data = { ...template, ...data };
          const uuid = v4_default();
          const provided = String(data.nameid || "").trim();
          const baseFallback = String(data.type || "el").toLowerCase();
          const existingIds = (() => {
            try {
              const info = renderutils.getDialogInfo();
              return Array.isArray(info?.elements) ? new Set(info.elements.filter(Boolean)) : /* @__PURE__ */ new Set();
            } catch {
              return /* @__PURE__ */ new Set();
            }
          })();
          const chooseUnique = (base) => renderutils.makeUniqueNameID(base || baseFallback);
          let nameid;
          const isTemplateDefault = provided && provided.toLowerCase() === baseFallback;
          if (provided && utils.isIdentifier(provided) && !existingIds.has(provided)) {
            nameid = isTemplateDefault ? chooseUnique(baseFallback) : provided;
          } else if (provided) {
            nameid = chooseUnique(provided);
          } else {
            nameid = chooseUnique(baseFallback);
          }
          let eltype = "div";
          if (data.type === "Input") {
            eltype = "textarea";
          } else if (data.type === "Select") {
            eltype = "select";
          }
          const element = document.createElement(eltype);
          data.id = uuid;
          data.nameid = nameid;
          element.style.position = "absolute";
          element.style.top = data.top + "px";
          element.style.left = data.left + "px";
          const errs = renderutils.assertTypes(data, { collect: true }) || [];
          if (errs.length) {
            coms.sendTo(
              "editorWindow",
              "consolog",
              "Element creation aborted due to invalid or missing properties:\n" + errs.join("\n")
            );
          }
          function valueToDataset(value) {
            if (utils.isNull(value)) return void 0;
            if (Array.isArray(value)) return value.map(String).join(",");
            return String(value);
          }
          const recordata = data;
          const keys = utils.getKeys(recordata);
          keys.forEach((key) => {
            if (key.startsWith("$") || !/^[$A-Za-z_][\w$]*$/.test(key)) return;
            const value = valueToDataset(recordata[key]);
            if (utils.notNil(value)) {
              element.dataset[key] = value;
            }
          });
          if (data.type == "Button") {
            element.className = "smart-button";
            element.style.backgroundColor = data.color;
            element.style.borderColor = data.borderColor;
            element.style.color = data.fontColor;
            element.dataset.borderColor = data.borderColor;
            element.style.width = data.width + "px";
            element.style.maxWidth = data.width + "px";
            element.style.height = data.height + "px";
            element.dataset.width = String(data.width);
            element.dataset.height = String(data.height);
            const lineHeight = coms.fontSize * 1.2;
            const paddingY = 3;
            const maxHeight = lineHeight * data.lineClamp + 3 * paddingY;
            element.style.maxHeight = maxHeight + "px";
            const span = ensureElementTextNode(element, "smart-button-text");
            span.style.fontFamily = coms.fontFamily;
            span.style.overflow = "hidden";
            span.style.textOverflow = "ellipsis";
            span.style.whiteSpace = "nowrap";
            syncElementPresentation(element, data.label, data.icon, "smart-button-text", "smart-button-icon", "buttonIcon");
            renderutils.updateButton(
              element,
              data.label,
              coms.fontSize,
              data.lineClamp,
              data.width,
              data.icon,
              data.height,
              data.iconSize
            );
          } else if (data.type == "Input" && element instanceof HTMLTextAreaElement) {
            element.value = data.value || "";
            element.rows = 1;
            element.wrap = "soft";
            element.style.resize = "none";
            element.style.width = data.width + "px";
            element.style.height = data.height + "px";
            element.style.borderColor = data.borderColor || "#8c8c8c";
            element.style.setProperty("--input-disabled-background-color", getDisabledColor(data));
            requestAnimationFrame(() => syncInputOverflow(element));
          } else if (data.type == "Select") {
            element.className = "custom-select";
            element.style.width = data.width + "px";
            element.style.setProperty("--input-disabled-background-color", getDisabledColor(data));
            const color = data.arrowColor || "#000000";
            const svg = encodeURIComponent(`
                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'>
                    <path fill='${color}' d='M6 8L0 0h12z'/>
                </svg>
            `);
            element.style.backgroundImage = `url("data:image/svg+xml,${svg}")`;
            try {
              const selectEl = element;
              const raw = String(data.value ?? selectEl.dataset.value ?? "");
              const tokens = raw.split(/[;,]/).map((s) => s.trim()).filter((s) => s.length > 0);
              selectEl.innerHTML = "";
              if (tokens.length === 0) {
                const opt = document.createElement("option");
                opt.value = "";
                opt.textContent = "";
                selectEl.appendChild(opt);
              } else {
                for (const t of tokens) {
                  const opt = document.createElement("option");
                  opt.value = t;
                  opt.textContent = t;
                  selectEl.appendChild(opt);
                }
              }
            } catch {
            }
          } else if (data.type == "Checkbox") {
            element.className = "element-div";
            element.style.width = data.size + "px";
            element.style.height = data.size + "px";
            const customCheckbox = document.createElement("div");
            customCheckbox.id = "checkbox-" + uuid;
            customCheckbox.className = "custom-checkbox";
            customCheckbox.setAttribute("role", "checkbox");
            customCheckbox.setAttribute("tabindex", "0");
            const initialChecked = utils.isTrue(data.isChecked);
            customCheckbox.setAttribute("aria-checked", initialChecked ? "true" : "false");
            customCheckbox.classList.toggle("checked", initialChecked);
            customCheckbox.dataset.fill = String(!!data.fill);
            customCheckbox.style.setProperty("--checkbox-color", data.color);
            customCheckbox.style.setProperty("--checkbox-border-color", data.borderColor || "#8c8c8c");
            customCheckbox.style.setProperty("--checkbox-disabled-background-color", getDisabledColor(data));
            customCheckbox.style.borderColor = data.borderColor || "#8c8c8c";
            const SVG_NS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(SVG_NS, "svg");
            svg.setAttribute("viewBox", "0 0 100 100");
            svg.setAttribute("width", "100%");
            svg.setAttribute("height", "100%");
            svg.style.overflow = "visible";
            const path = document.createElementNS(SVG_NS, "path");
            path.setAttribute("d", "M15 35 L48 80 L95 -35");
            path.setAttribute("stroke", "black");
            path.setAttribute("stroke-width", "14");
            path.setAttribute("fill", "none");
            path.setAttribute("class", "tick-mark");
            svg.appendChild(path);
            customCheckbox.appendChild(svg);
            customCheckbox.addEventListener("click", () => {
              const isChecked = customCheckbox.getAttribute("aria-checked") === "true";
              customCheckbox.setAttribute("aria-checked", isChecked ? "false" : "true");
            });
            const cover2 = document.createElement("div");
            cover2.id = "cover-" + uuid;
            cover2.className = "elementcover";
            element.appendChild(customCheckbox);
            element.appendChild(cover2);
          } else if (data.type == "Radio") {
            element.className = "element-div";
            element.style.width = data.size + "px";
            element.style.height = data.size + "px";
            const initialSelected = utils.isTrue(data.isSelected);
            const wrapperLabel = document.createElement("label");
            wrapperLabel.className = "custom-radio-wrapper";
            wrapperLabel.dataset.group = String(data.group || "");
            const nativeRadio = document.createElement("input");
            nativeRadio.type = "radio";
            nativeRadio.name = data.group || "";
            nativeRadio.id = `native-radio-${uuid}`;
            nativeRadio.className = "native-radio";
            nativeRadio.dataset.color = data.color;
            nativeRadio.style.position = "absolute";
            nativeRadio.style.opacity = "0";
            nativeRadio.style.pointerEvents = "auto";
            nativeRadio.checked = initialSelected;
            const customRadio = document.createElement("span");
            customRadio.id = `radio-${uuid}`;
            customRadio.className = "custom-radio";
            customRadio.setAttribute("role", "radio");
            customRadio.setAttribute("aria-checked", initialSelected ? "true" : "false");
            customRadio.setAttribute("group", data.group || "");
            customRadio.style.setProperty("--radio-color", data.color);
            customRadio.style.setProperty("--radio-disabled-background-color", getDisabledColor(data));
            customRadio.classList.toggle("selected", initialSelected);
            wrapperLabel.appendChild(nativeRadio);
            wrapperLabel.appendChild(customRadio);
            element.appendChild(wrapperLabel);
            if (data.group) {
              element.dataset.group = String(data.group);
            }
            nativeRadio.addEventListener("focus", () => {
              element.classList.add("radio-focus");
            });
            nativeRadio.addEventListener("blur", () => {
              element.classList.remove("radio-focus");
            });
            const cover2 = document.createElement("div");
            cover2.id = `cover-${uuid}`;
            cover2.className = "elementcover";
            element.appendChild(cover2);
          } else if (data.type == "Counter") {
            element.className = "counter-wrapper";
            const borderColor = String(data.borderColor || "#8c8c8c");
            element.dataset.borderColor = borderColor;
            const arrowColor = String(data.color || "#558855");
            const arrowSize = Number(data.updownsize || 8);
            const arrowHeight = 1.5 * arrowSize;
            const createCounterGlyph = (direction) => {
              const svgNS = "http://www.w3.org/2000/svg";
              const glyph = document.createElementNS(svgNS, "svg");
              glyph.setAttribute("class", `counter-arrow-glyph ${direction}`);
              glyph.setAttribute("viewBox", "0 0 100 80");
              glyph.setAttribute("aria-hidden", "true");
              const polygon = document.createElementNS(svgNS, "polygon");
              polygon.setAttribute("class", "counter-arrow-shape");
              polygon.setAttribute(
                "points",
                direction === "up" ? "50,10 12,70 88,70" : "12,10 88,10 50,70"
              );
              glyph.style.setProperty("--counter-arrow-border-color", borderColor);
              glyph.style.setProperty("--counter-arrow-fill-color", arrowColor);
              glyph.style.setProperty("--counter-arrow-disabled-fill-color", getDisabledColor(data));
              glyph.appendChild(polygon);
              return glyph;
            };
            const decrease = document.createElement("div");
            decrease.className = "counter-arrow down";
            decrease.id = "counter-decrease-" + uuid;
            decrease.style.width = `${Math.ceil(arrowSize * 2)}px`;
            decrease.style.height = `${Math.ceil(arrowHeight)}px`;
            const decreaseGlyph = createCounterGlyph("down");
            decrease.appendChild(decreaseGlyph);
            const display = document.createElement("div");
            display.className = "counter-value";
            display.id = "counter-value-" + uuid;
            const rawMin = Number(data.minval ?? data.startval ?? 0);
            const rawStart = Number(data.startval ?? rawMin);
            const rawMax = Number(data.maxval ?? rawStart);
            const min2 = Number.isFinite(rawMin) ? rawMin : 0;
            const max2 = Number.isFinite(rawMax) ? rawMax : Math.max(min2, Number.isFinite(rawStart) ? rawStart : min2);
            const start2 = Number.isFinite(rawStart) ? rawStart : min2;
            const initial = Math.min(Math.max(start2, min2), max2);
            display.textContent = String(initial);
            display.style.padding = "0px " + data.space + "px";
            display.dataset.nameid = nameid;
            display.style.boxSizing = "border-box";
            display.style.fontFamily = coms.fontFamily;
            display.style.fontSize = coms.fontSize + "px";
            display.style.color = "#000000";
            const increase = document.createElement("div");
            increase.className = "counter-arrow up";
            increase.id = "counter-increase-" + uuid;
            increase.style.width = `${Math.ceil(arrowSize * 2)}px`;
            increase.style.height = `${Math.ceil(arrowHeight)}px`;
            const increaseGlyph = createCounterGlyph("up");
            increase.appendChild(increaseGlyph);
            element.appendChild(decrease);
            element.appendChild(display);
            element.appendChild(increase);
            element.dataset.minval = String(min2);
            element.dataset.maxval = String(max2);
            element.dataset.startval = String(initial);
          } else if (data.type == "Slider") {
            element.className = "separator";
            element.style.width = data.width + "px";
            element.style.height = data.height + "px";
            element.style.backgroundColor = String(data.color || "#000000");
            element.dataset.color = String(data.color || "#000000");
            const handle = document.createElement("div");
            handle.className = "slider-handle";
            handle.id = "slider-handle-" + uuid;
            element.appendChild(handle);
            const handleConfig = Object.fromEntries(
              Object.entries(data).map(([k, v]) => [k, v ?? ""])
            );
            renderutils.updateHandleStyle(handle, handleConfig);
          } else if (data.type == "Label") {
            syncElementPresentation(element, data.value || "", data.icon, "smart-label-text", "smart-label-icon", "elementIcon");
            element.style.fontFamily = coms.fontFamily;
            element.style.fontSize = coms.fontSize + "px";
            element.style.lineHeight = "1.2";
            element.style.color = data.fontColor || "#000000";
            element.style.overflow = "hidden";
            element.style.textOverflow = "ellipsis";
            element.style.position = "relative";
            const clampInit = Number(data.lineClamp) || 1;
            const maxWInit = Number(data.maxWidth ?? data.maxWidth ?? 0);
            element.style.textAlign = data.align || "left";
            if (clampInit > 1) {
              element.style.display = "-webkit-box";
              element.style.setProperty("-webkit-line-clamp", String(clampInit));
              element.style.setProperty("-webkit-box-orient", "vertical");
              element.style.whiteSpace = "normal";
              const maxH = Math.round(coms.fontSize * 1.2 * clampInit);
              element.style.maxHeight = maxH + "px";
            } else {
              element.style.display = "inline-block";
              element.style.whiteSpace = "nowrap";
              element.style.removeProperty("-webkit-line-clamp");
              element.style.removeProperty("-webkit-box-orient");
              element.style.maxHeight = Math.round(coms.fontSize * 1.2) + "px";
            }
            if (maxWInit > 0) element.style.maxWidth = maxWInit + "px";
          } else if (data.type == "Separator") {
            element.className = "separator";
            element.style.width = data.width + "px";
            element.style.height = data.height + "px";
            element.style.backgroundColor = String(data.color || "#000000");
            element.dataset.color = String(data.color || "#000000");
          } else if (data.type == "Container") {
            element.className = "container";
            element.style.backgroundColor = data.backgroundColor;
            element.style.borderColor = data.borderColor;
            element.style.setProperty("--container-active-fg", String(data.activeFontColor || "#ffffff"));
            element.style.setProperty("--container-disabled-bg", String(data.disabledColor ?? "#d8d8d8"));
            element.dataset.backgroundColor = String(data.backgroundColor || "#ffffff");
            element.dataset.fontColor = String(data.fontColor || "#000000");
            element.dataset.activeBackgroundColor = String(data.activeBackgroundColor || "#589658");
            element.dataset.activeFontColor = String(data.activeFontColor || "#ffffff");
            element.dataset.disabledColor = String(data.disabledColor ?? "#d8d8d8");
            element.dataset.borderColor = data.borderColor;
            element.style.width = data.width + "px";
            element.style.height = data.height + "px";
            element.dataset.itemType = resolveContainerItemType(element.dataset.itemType);
            if (!("itemOrder" in element.dataset)) {
              element.dataset.itemOrder = "false";
            }
            if (!("pinontop" in element.dataset)) {
              element.dataset.pinontop = "false";
            }
            if (renderutils.previewWindow()) {
              const content = document.createElement("div");
              content.className = "container-content";
              element.appendChild(content);
            } else {
              const sample = document.createElement("div");
              sample.className = "container-sample";
              const mkRow = (cls, text) => {
                const row = document.createElement("div");
                row.className = `container-item ${cls}`;
                const label = document.createElement("span");
                label.className = "container-text";
                label.textContent = text;
                row.appendChild(label);
                return { row, label };
              };
              const inactive = mkRow("inactive", "unselected");
              const active = mkRow("active", "active / selected");
              const disabled = mkRow("container-item-disabled disabled", "disabled / blocked");
              const fg = String(data.fontColor) || "#000000";
              const abg = String(data.activeBackgroundColor) || "#589658";
              const afg = String(data.activeFontColor) || "#ffffff";
              const dbg = String(data.disabledColor ?? "#d8d8d8");
              inactive.label.style.color = fg;
              active.row.style.backgroundColor = abg;
              active.label.style.color = afg;
              disabled.row.dataset.disabled = "true";
              disabled.row.setAttribute("aria-disabled", "true");
              disabled.row.style.backgroundColor = dbg;
              disabled.label.style.color = fg;
              sample.appendChild(inactive.row);
              sample.appendChild(active.row);
              sample.appendChild(disabled.row);
              element.appendChild(sample);
              applyEditorContainerSampleState(element, data, !utils.isFalse(data.isEnabled));
            }
          } else if (data.type == "Choice") {
            element.className = "sorter";
            element.style.width = data.width + "px";
            element.style.height = data.height + "px";
            element.style.backgroundColor = data.backgroundColor;
            element.style.borderColor = data.borderColor;
            element.dataset.backgroundColor = data.backgroundColor;
            element.dataset.fontColor = data.fontColor;
            element.dataset.activeBackgroundColor = data.activeBackgroundColor;
            element.dataset.activeFontColor = data.activeFontColor;
            element.dataset.borderColor = data.borderColor;
            element.dataset.selection = normalizeChoiceSelection(data.selection);
            element.dataset.sortable = String(data.sortable);
            element.dataset.ordering = normalizeChoiceOrdering(data.ordering);
            element.dataset.orientation = normalizeChoiceOrientation(data.orientation);
            element.dataset.items = String(data.items || "");
            element.dataset.align = String(data.align || "left");
            if (renderutils.previewWindow()) {
              delete element.dataset.selected;
              delete element.dataset.activeValues;
              delete element.dataset[SORTER_STATE_KEY];
            } else {
              const labels = splitSorterValues(data.items || "");
              const orderingMode = normalizeChoiceOrdering(data.ordering);
              const sampleState = buildSorterSampleState(labels, orderingMode);
              if (sampleState) {
                element.__sampleSorterState = sampleState;
              } else {
                delete element.__sampleSorterState;
              }
            }
            renderutils.renderSorter(element, {
              items: data.items,
              sortable: data.sortable,
              ordering: data.ordering,
              orientation: data.orientation,
              align: data.align,
              backgroundColor: data.backgroundColor,
              fontColor: data.fontColor,
              activeBackgroundColor: data.activeBackgroundColor,
              activeFontColor: data.activeFontColor,
              borderColor: data.borderColor,
              selection: data.selection
            });
          }
          element.style.fontFamily = coms.fontFamily;
          element.style.fontSize = coms.fontSize + "px";
          if (utils.isFalse(data.isVisible)) {
            if (renderutils.previewWindow()) {
              element.style.display = "none";
            } else {
              element.classList.add("design-hidden");
              element.style.removeProperty("visibility");
            }
          }
          if (utils.isFalse(data.isEnabled)) {
            if (!utils.isElementOf(data.type, ["Input", "Select", "Checkbox", "Radio", "Counter"])) {
              element.classList.add("disabled-div");
            }
            if (data.type === "Input" && element instanceof HTMLTextAreaElement) {
              element.disabled = true;
              applyControlDisabledAppearance({ input: element, enabled: false, source: data });
            } else if (data.type === "Select" && element instanceof HTMLSelectElement) {
              element.disabled = true;
              applyControlDisabledAppearance({ input: element, enabled: false, source: data });
            } else if (data.type === "Checkbox") {
              const customCheckbox = element.querySelector(".custom-checkbox");
              applyControlDisabledAppearance({ checkbox: customCheckbox, enabled: false, source: data });
            } else if (data.type === "Radio") {
              const nativeRadio = element.querySelector(".native-radio");
              const customRadio = element.querySelector(".custom-radio");
              if (nativeRadio) {
                nativeRadio.disabled = true;
              }
              applyControlDisabledAppearance({ radio: customRadio, enabled: false, source: data });
            } else if (data.type === "Counter") {
              applyCounterDisabledAppearance(element, false, data);
            } else if (data.type === "Container") {
              element.style.backgroundColor = getDisabledColor(data);
              applyEditorContainerSampleState(element, data, false);
            }
          }
          element.id = uuid;
          return element;
        },
        updateElement: function(element, properties) {
          const dataset = element.dataset;
          const checkbox = dataset.type === "Checkbox";
          const counter = dataset.type === "Counter";
          const radio = dataset.type === "Radio";
          const input = dataset.type === "Input";
          const select = dataset.type === "Select";
          const slider = dataset.type === "Slider";
          const container = dataset.type === "Container";
          const sorter = dataset.type === "Choice";
          const separator = dataset.type === "Separator";
          const button = dataset.type === "Button";
          const label = dataset.type === "Label";
          const group = dataset.type === "Group";
          let counterNeedsResize = false;
          let sorterNeedsRender = false;
          let elementWidth = element.getBoundingClientRect().width;
          const elementHeight = element.getBoundingClientRect().height;
          const dialogW = dialog.canvas.getBoundingClientRect().width;
          const dialogH = dialog.canvas.getBoundingClientRect().height;
          const props = { ...properties };
          const inner = element.firstElementChild;
          Object.keys(props).forEach((key) => {
            let value = props[key];
            const customCheckbox = document.querySelector(`#checkbox-${element.id}`);
            const customRadio = document.querySelector(`#radio-${element.id}`);
            const countervalue = document.querySelector(`#counter-value-${element.id}`);
            const counterDecrease = document.querySelector(`#counter-decrease-${element.id}`);
            const counterIncrease = document.querySelector(`#counter-increase-${element.id}`);
            const handle = document.querySelector(`#slider-handle-${element.id}`);
            const elwidth = document.getElementById("elwidth");
            const elheight = document.getElementById("elheight");
            const elleft = document.getElementById("elleft");
            const eltop = document.getElementById("eltop");
            switch (key) {
              case "nameid":
                {
                  const next = String(value || "").trim();
                  if (renderutils.nameidValidChange(next, element)) {
                    const prev = String(element.dataset.nameid || "");
                    if (prev && next && prev !== next) {
                      renderutils.propagateNameChange(prev, next);
                    }
                    value = next;
                  } else {
                    value = element.dataset.nameid || "";
                    showError("Name already exists.");
                  }
                }
                break;
              case "left":
                if (Number(value) + elementWidth + 10 > dialogW) {
                  value = String(Math.round(dialogW - elementWidth - 10));
                }
                if (Number(value) < 10) {
                  value = "10";
                }
                element.style.left = value + "px";
                break;
              case "top":
                if (Number(value) + elementHeight + 10 > dialogH) {
                  value = String(Math.round(dialogH - elementHeight - 10));
                }
                if (Number(value) < 10) {
                  value = "10";
                }
                element.style.top = value + "px";
                break;
              case "height":
                if (Number(value) > dialogH - 20) {
                  value = String(Math.round(dialogH - 20));
                }
                element.style.height = value + "px";
                if (button) {
                  const host = inner || element;
                  renderutils.updateButton(
                    host,
                    String(props.label ?? dataset.label ?? ""),
                    parseFloat(window.getComputedStyle(host).fontSize || "0") || Number(dataset.fontSize) || coms.fontSize,
                    Number(props.lineClamp ?? dataset.lineClamp) || 1,
                    Number(props.width ?? dataset.width) || Math.round(host.getBoundingClientRect().width || 0) || 60,
                    props.icon ?? dataset.icon ?? "none",
                    Number(value),
                    Number(props.iconSize ?? dataset.iconSize) || 0
                  );
                } else if (inner && (input || select || container || sorter || separator || slider || checkbox || radio)) {
                  inner.style.height = value + "px";
                  if (checkbox && customCheckbox) customCheckbox.style.height = value + "px";
                  if (radio && customRadio) customRadio.style.height = value + "px";
                  if (input && inner instanceof HTMLTextAreaElement) {
                    requestAnimationFrame(() => syncInputOverflow(inner));
                  }
                }
                if (eltop && Number(eltop.value) + Number(value) + 10 > dialogH) {
                  const newtop = String(Math.round(dialogH - Number(value) - 10));
                  eltop.value = newtop;
                  element.style.top = newtop + "px";
                }
                break;
              case "label":
                const span = element.querySelector(".smart-button-text");
                if (span) {
                  span.textContent = value;
                }
                elementWidth = element.getBoundingClientRect().width;
                if (elementWidth && elleft && Number(elleft.value) + elementWidth + 10 > dialogW) {
                  const newleft = String(Math.round(dialogW - elementWidth - 10));
                  elleft.value = newleft;
                  element.style.left = newleft + "px";
                }
                if (button) {
                  const host = inner || element;
                  renderutils.updateButton(
                    host,
                    String(value),
                    parseFloat(window.getComputedStyle(host).fontSize || "0") || Number(dataset.fontSize) || coms.fontSize,
                    Number(props.lineClamp ?? dataset.lineClamp) || 1,
                    Number(props.width ?? dataset.width) || Math.round(host.getBoundingClientRect().width || 0) || 60,
                    props.icon ?? dataset.icon ?? "none",
                    Number(props.height ?? dataset.height) || void 0,
                    Number(props.iconSize ?? dataset.iconSize) || 0
                  );
                }
                break;
              case "icon":
                if (button) {
                  const host = inner || element;
                  renderutils.updateButton(
                    host,
                    String(props.label ?? dataset.label ?? ""),
                    parseFloat(window.getComputedStyle(host).fontSize || "0") || Number(dataset.fontSize) || coms.fontSize,
                    Number(props.lineClamp ?? dataset.lineClamp) || 1,
                    Number(props.width ?? dataset.width) || Math.round(host.getBoundingClientRect().width || 0) || 60,
                    value,
                    Number(props.height ?? dataset.height) || void 0,
                    Number(props.iconSize ?? dataset.iconSize) || 0
                  );
                } else if (label) {
                  element.dataset[key] = value;
                  renderutils.updateLabel(element);
                }
                break;
              case "iconSize":
                if (button) {
                  const host = inner || element;
                  renderutils.updateButton(
                    host,
                    String(props.label ?? dataset.label ?? ""),
                    parseFloat(window.getComputedStyle(host).fontSize || "0") || Number(dataset.fontSize) || coms.fontSize,
                    Number(props.lineClamp ?? dataset.lineClamp) || 1,
                    Number(props.width ?? dataset.width) || Math.round(host.getBoundingClientRect().width || 0) || 60,
                    props.icon ?? dataset.icon ?? "none",
                    Number(props.height ?? dataset.height) || void 0,
                    Number(value) || 0
                  );
                } else if (label) {
                  element.dataset[key] = value;
                  renderutils.updateLabel(element);
                }
                break;
              case "width":
                if (Number(value) > dialogW - 20) {
                  value = String(Math.round(dialogW - 20));
                  const widthInput = document.getElementById("elwidth");
                  if (widthInput) widthInput.value = value;
                }
                if (sorter && Number(value) < 24) {
                  value = "24";
                  const widthInput = document.getElementById("elwidth");
                  if (widthInput) widthInput.value = value;
                }
                if (select && Number(value) < 50) {
                  value = "50";
                }
                if (button && inner) {
                  element.style.width = value + "px";
                  element.style.setProperty("width", value + "px", "important");
                  inner.style.width = "100%";
                  inner.style.setProperty("width", "100%", "important");
                  inner.style.maxWidth = "100%";
                  inner.style.setProperty("max-width", "100%", "important");
                  inner.style.minWidth = "0";
                  inner.style.setProperty("min-width", "0", "important");
                  renderutils.updateButton(
                    inner,
                    String(props.label ?? dataset.label ?? ""),
                    parseFloat(window.getComputedStyle(inner).fontSize || "0") || Number(dataset.fontSize) || coms.fontSize,
                    Number(props.lineClamp ?? dataset.lineClamp) || 1,
                    Number(value),
                    props.icon ?? dataset.icon ?? "none",
                    Number(props.height ?? dataset.height) || void 0,
                    Number(props.iconSize ?? dataset.iconSize) || 0
                  );
                } else if (label) {
                  element.dataset[key] = value;
                  renderutils.updateLabel(element);
                } else {
                  element.style.width = value + "px";
                  if (inner && (input || select || container || sorter || separator || slider || checkbox || radio)) {
                    inner.style.width = value + "px";
                    if (checkbox && customCheckbox) customCheckbox.style.width = value + "px";
                    if (radio && customRadio) customRadio.style.width = value + "px";
                  }
                }
                if (elleft && Number(elleft.value) + Number(value) + 10 > dialogW) {
                  const newleft = String(Math.round(dialogW - Number(value) - 10));
                  elleft.value = newleft;
                  element.style.left = newleft + "px";
                }
                break;
              case "maxWidth":
                if (label) {
                  element.dataset[key] = value;
                  renderutils.updateLabel(element);
                }
                break;
              case "lineClamp":
                if (Number(value) > 3) {
                  value = String(3);
                  const lineClamp = document.getElementById("ellineClamp");
                  lineClamp.value = value;
                }
                if (button) {
                  const host = inner || element;
                  const span2 = host.querySelector(".smart-button-text");
                  const icon = host.querySelector(".smart-button-icon");
                  const spanCS = window.getComputedStyle(span2 && span2.style.display !== "none" ? span2 : icon || host);
                  const fs = parseFloat(spanCS.fontSize || "0") || Number(dataset.fontSize) || coms.fontSize;
                  const lineHeightPx = fs * 1.2;
                  const hostCS = window.getComputedStyle(host);
                  const padT = parseFloat(hostCS.paddingTop || "0") || 0;
                  const padB = parseFloat(hostCS.paddingBottom || "0") || 0;
                  const borT = parseFloat(hostCS.borderTopWidth || "0") || 0;
                  const borB = parseFloat(hostCS.borderBottomWidth || "0") || 0;
                  const clamp = Number(value) || 1;
                  const maxHeightPx = Math.round(lineHeightPx * clamp + padT + padB + borT + borB);
                  host.style.maxHeight = maxHeightPx + "px";
                  if (span2) {
                    span2.style.setProperty("-webkit-line-clamp", String(clamp));
                  }
                } else if (label) {
                  element.dataset[key] = value;
                  renderutils.updateLabel(element);
                } else {
                  const lineHeight = Number(dataset.fontSize) * 1.2;
                  const paddingY = 3;
                  const maxHeight = lineHeight * value + 2 * paddingY;
                  element.style.maxHeight = maxHeight + "px";
                }
                break;
              case "maxHeight":
                element.style[key] = value + "px";
                break;
              case "size":
                if (checkbox || radio) {
                  element.style.width = value + "px";
                  element.style.height = value + "px";
                }
                break;
              case "color":
                if (utils.isValidColor(value)) {
                  if (customRadio) {
                    customRadio.style.setProperty("--radio-color", value);
                  } else if (counter) {
                    const decreaseGlyph = counterDecrease?.querySelector(".counter-arrow-glyph");
                    const increaseGlyph = counterIncrease?.querySelector(".counter-arrow-glyph");
                    const enabled = utils.isTrue(dataset.isEnabled ?? "true");
                    if (decreaseGlyph) {
                      decreaseGlyph.style.setProperty(
                        "--counter-arrow-fill-color",
                        enabled ? value : getDisabledColor(dataset)
                      );
                    }
                    if (increaseGlyph) {
                      increaseGlyph.style.setProperty(
                        "--counter-arrow-fill-color",
                        enabled ? value : getDisabledColor(dataset)
                      );
                    }
                  } else if (button && inner) {
                    inner.style.backgroundColor = value;
                  } else if (separator && inner) {
                    inner.style.backgroundColor = value;
                  } else if (slider && inner) {
                    inner.style.backgroundColor = value;
                  } else if (!container) {
                    element.style.backgroundColor = value;
                    if (checkbox) {
                      if (customCheckbox) {
                        customCheckbox.style.setProperty("--checkbox-color", value);
                      }
                    }
                  }
                } else {
                  value = dataset.color;
                  const color = document.getElementById("elcolor");
                  color.value = value;
                }
                break;
              case "backgroundColor":
                if (container || sorter) {
                  if (utils.isValidColor(value)) {
                    const host = inner || element;
                    host.style.backgroundColor = value;
                    if (sorter) {
                      sorterNeedsRender = true;
                    }
                  } else {
                    value = dataset.backgroundColor;
                    const color = document.getElementById("elbackgroundColor");
                    color.value = value;
                  }
                }
                break;
              case "fontColor":
                if (utils.isValidColor(value)) {
                  if (button && inner) {
                    inner.style.color = value;
                    const span2 = inner.querySelector(".smart-button-text");
                    if (span2) {
                      span2.style.color = value;
                    }
                    const icon = inner.querySelector(".smart-button-icon");
                    if (icon) {
                      icon.style.color = value;
                    }
                  } else if (label && inner) {
                    inner.style.color = value;
                  } else if ((input || select) && inner) {
                    inner.style.color = value;
                  } else if (counter && countervalue) {
                    countervalue.style.color = value;
                  } else if (container) {
                    const host = inner || element;
                    host.querySelectorAll(".container-item:not(.active) .container-text").forEach((item) => {
                      item.style.color = String(value);
                    });
                  } else if (sorter) {
                    const host = inner || element;
                    host.style.color = value;
                    sorterNeedsRender = true;
                  } else {
                    element.style.color = value;
                  }
                } else {
                  value = dataset.fontColor;
                  const color = document.getElementById("elfontColor");
                  color.value = value;
                }
                break;
              case "borderColor":
                if (utils.isValidColor(value)) {
                  if (button && inner) {
                    inner.style.borderColor = value;
                  } else if (input && inner) {
                    inner.style.borderColor = value;
                  } else if (counter) {
                    if (counterDecrease) {
                      const decreaseGlyph = counterDecrease.querySelector(".counter-arrow-glyph");
                      if (decreaseGlyph) {
                        decreaseGlyph.style.setProperty("--counter-arrow-border-color", value);
                      }
                    }
                    if (counterIncrease) {
                      const increaseGlyph = counterIncrease.querySelector(".counter-arrow-glyph");
                      if (increaseGlyph) {
                        increaseGlyph.style.setProperty("--counter-arrow-border-color", value);
                      }
                    }
                  } else if (checkbox && customCheckbox) {
                    customCheckbox.style.borderColor = value;
                    customCheckbox.style.setProperty("--checkbox-border-color", value);
                  } else if ((container || sorter) && inner) {
                    inner.style.borderColor = value;
                  } else if (button || container || sorter || input) {
                    element.style.borderColor = value;
                  }
                } else {
                  value = dataset.borderColor;
                  const color = document.getElementById("elborderColor");
                  color.value = value;
                }
                break;
              case "activeBackgroundColor":
                if (container) {
                  if (utils.isValidColor(value)) {
                    const host = inner || element;
                    host.querySelectorAll(".container-item.active").forEach((r) => {
                      r.style.backgroundColor = String(value);
                    });
                    applyEditorContainerSampleState(host, { ...dataset, activeBackgroundColor: value }, utils.isTrue(dataset.isEnabled ?? "true"));
                  } else {
                    value = dataset.activeBackgroundColor;
                    const color = document.getElementById("elactiveBackgroundColor");
                    color.value = value;
                  }
                } else if (sorter) {
                  if (!utils.isValidColor(value)) {
                    value = dataset.activeBackgroundColor;
                  }
                  sorterNeedsRender = true;
                }
                break;
              case "activeFontColor":
                if (container) {
                  if (utils.isValidColor(value)) {
                    const host = inner || element;
                    host.style.setProperty("--container-active-fg", String(value));
                    host.querySelectorAll(".container-item.active .container-text").forEach((n) => {
                      n.style.color = String(value);
                    });
                    applyEditorContainerSampleState(host, { ...dataset, activeFontColor: value }, utils.isTrue(dataset.isEnabled ?? "true"));
                  } else {
                    value = dataset.activeFontColor;
                    const color = document.getElementById("elactiveFontColor");
                    color.value = value;
                  }
                } else if (sorter) {
                  if (!utils.isValidColor(value)) {
                    value = dataset.activeFontColor;
                  }
                  sorterNeedsRender = true;
                }
                break;
              case "disabledColor":
                if (input) {
                  if (utils.isValidColor(value)) {
                    const inputEl = element instanceof HTMLTextAreaElement ? element : inner;
                    applyControlDisabledAppearance({
                      input: inputEl,
                      enabled: !inputEl?.disabled,
                      source: { ...dataset, disabledColor: value }
                    });
                  } else {
                    value = dataset.disabledColor || "#dedede";
                    const color = document.getElementById("eldisabledColor");
                    if (color) color.value = value;
                  }
                } else if (select) {
                  if (utils.isValidColor(value)) {
                    const selectEl = element instanceof HTMLSelectElement ? element : inner;
                    applyControlDisabledAppearance({
                      input: selectEl,
                      enabled: !selectEl?.disabled,
                      source: { ...dataset, disabledColor: value }
                    });
                  } else {
                    value = dataset.disabledColor || "#dedede";
                    const color = document.getElementById("eldisabledColor");
                    if (color) color.value = value;
                  }
                } else if (checkbox) {
                  if (utils.isValidColor(value)) {
                    applyControlDisabledAppearance({
                      checkbox: customCheckbox,
                      enabled: customCheckbox?.getAttribute("aria-disabled") !== "true",
                      source: { ...dataset, disabledColor: value }
                    });
                  } else {
                    value = dataset.disabledColor || "#dedede";
                    const color = document.getElementById("eldisabledColor");
                    if (color) color.value = value;
                  }
                } else if (radio) {
                  if (utils.isValidColor(value)) {
                    applyControlDisabledAppearance({
                      radio: customRadio,
                      enabled: customRadio?.getAttribute("aria-disabled") !== "true",
                      source: { ...dataset, disabledColor: value }
                    });
                  } else {
                    value = dataset.disabledColor || "#dedede";
                    const color = document.getElementById("eldisabledColor");
                    if (color) color.value = value;
                  }
                } else if (counter) {
                  if (utils.isValidColor(value)) {
                    const decreaseGlyph = counterDecrease?.querySelector(".counter-arrow-glyph");
                    const increaseGlyph = counterIncrease?.querySelector(".counter-arrow-glyph");
                    if (decreaseGlyph) {
                      decreaseGlyph.style.setProperty("--counter-arrow-disabled-fill-color", value);
                    }
                    if (increaseGlyph) {
                      increaseGlyph.style.setProperty("--counter-arrow-disabled-fill-color", value);
                    }
                    applyCounterDisabledAppearance(element, utils.isTrue(dataset.isEnabled ?? "true"), {
                      ...dataset,
                      disabledColor: value
                    });
                  } else {
                    value = dataset.disabledColor || "#dedede";
                    const color = document.getElementById("eldisabledColor");
                    if (color) color.value = value;
                  }
                } else if (container) {
                  if (utils.isValidColor(value)) {
                    const host = inner || element;
                    host.style.setProperty("--container-disabled-bg", String(value));
                    host.querySelectorAll(".container-item-disabled").forEach((r) => {
                      r.style.backgroundColor = String(value);
                    });
                    applyEditorContainerSampleState(host, { ...dataset, disabledColor: value }, utils.isTrue(dataset.isEnabled ?? "true"));
                    renderutils.applyContainerItemFilter(element);
                    if (!utils.isTrue(dataset.isEnabled ?? "true")) {
                      host.style.backgroundColor = String(value);
                    }
                  } else {
                    value = dataset.disabledColor || "#d8d8d8";
                    const color = document.getElementById("eldisabledColor");
                    if (color) color.value = value;
                  }
                }
                break;
              case "arrowColor":
                if (utils.isValidColor(value)) {
                  const svg = encodeURIComponent(`
                            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'>
                                <path fill='${value}' d='M6 8L0 0h12z'/>
                            </svg>
                        `);
                  inner.style.backgroundImage = `url("data:image/svg+xml,${svg}")`;
                } else {
                  value = dataset.arrowColor;
                  const color = document.getElementById("elarrowColor");
                  color.value = value;
                }
                break;
              case "space":
                if (Number(value) > 50) {
                  value = String(Math.round(50));
                  const space = document.getElementById("elspace");
                  space.value = value;
                }
                if (countervalue) {
                  countervalue.style.padding = "0px " + value + "px";
                  counterNeedsResize = counterNeedsResize || counter;
                }
                break;
              case "minval": {
                const startCandidate = Number(props.startval ?? dataset.startval);
                const maxCandidate = Number(props.maxval ?? dataset.maxval);
                const candidate = Number(value);
                if (Number.isFinite(candidate) && candidate <= startCandidate && candidate < maxCandidate) {
                  value = String(candidate);
                  if (countervalue && Number(countervalue.textContent) < candidate) {
                    countervalue.textContent = String(candidate);
                    counterNeedsResize = counterNeedsResize || counter;
                  }
                } else {
                  value = dataset.minval ?? dataset.startval;
                  const minval = document.getElementById("elminval");
                  if (minval) {
                    minval.value = value;
                  }
                }
                break;
              }
              case "startval": {
                const minCandidate = Number(props.minval ?? dataset.minval ?? value);
                const maxCandidate = Number(props.maxval ?? dataset.maxval);
                const candidate = Number(value);
                if (Number.isFinite(candidate) && candidate >= minCandidate && candidate <= maxCandidate) {
                  value = String(candidate);
                  if (countervalue) {
                    countervalue.textContent = String(candidate);
                    counterNeedsResize = counterNeedsResize || counter;
                  }
                } else {
                  value = dataset.startval;
                  const startval = document.getElementById("elstartval");
                  if (startval) {
                    startval.value = value;
                  }
                }
                break;
              }
              case "maxval": {
                const minCandidate = Number(props.minval ?? dataset.minval ?? dataset.startval);
                const startCandidate = Number(props.startval ?? dataset.startval);
                const candidate = Number(value);
                if (Number.isFinite(candidate) && candidate >= startCandidate && candidate > minCandidate) {
                  value = String(candidate);
                } else {
                  value = dataset.maxval;
                  const maxval = document.getElementById("elmaxval");
                  if (maxval) {
                    maxval.value = value;
                  }
                }
                break;
              }
              case "updownsize":
                if (counter) {
                  const size = Number(value || 8);
                  const glyphWidth = `${Math.ceil(size * 2)}px`;
                  const glyphHeight = `${Math.ceil(1.5 * size)}px`;
                  if (counterDecrease) {
                    counterDecrease.style.width = glyphWidth;
                    counterDecrease.style.height = glyphHeight;
                  }
                  if (counterIncrease) {
                    counterIncrease.style.width = glyphWidth;
                    counterIncrease.style.height = glyphHeight;
                  }
                }
                counterNeedsResize = counterNeedsResize || counter;
                break;
              case "direction":
                {
                  const nextDir = String(value || dataset.direction || "").toLowerCase();
                  const currentDir = String(dataset.direction || "").toLowerCase();
                  const dirInput = document.getElementById("eldirection");
                  if (dirInput) dirInput.value = nextDir || currentDir || "horizontal";
                  if (nextDir === currentDir) {
                    dataset.direction = currentDir;
                    break;
                  }
                  dataset.direction = nextDir || currentDir;
                }
                let width = dataset.height;
                let height = dataset.width;
                if (Number(width) > dialogW - 20) {
                  width = String(Math.round(dialogW - 20));
                }
                if (elleft && Number(elleft.value) + Number(width) + 10 > dialogW) {
                  const newleft = String(Math.round(dialogW - Number(width) - 10));
                  elleft.value = newleft;
                  element.style.left = newleft + "px";
                }
                if (Number(height) > dialogH - 20) {
                  height = String(Math.round(dialogH - 20));
                }
                if (eltop && Number(eltop.value) + Number(height) + 10 > dialogH) {
                  const newtop = String(Math.round(dialogH - Number(height) - 10));
                  eltop.value = newtop;
                  element.style.top = newtop + "px";
                }
                dataset.width = width;
                dataset.height = height;
                if (inner && (separator || slider || container)) {
                  inner.style.width = width + "px";
                  inner.style.height = height + "px";
                }
                element.style.width = width + "px";
                element.style.height = height + "px";
                if (elwidth) elwidth.value = String(width);
                if (elheight) elheight.value = String(height);
                break;
              case "selection":
                if (container) {
                  const host = inner || element;
                  const kind = String(value || "").toLowerCase();
                  if (kind === "single") {
                    const items = Array.from(host.querySelectorAll(".container-item"));
                    const normalFg = String(dataset.fontColor || "#000000");
                    const activeBg = String(dataset.activeBackgroundColor || "#589658");
                    const activeFg = String(dataset.activeFontColor || "#ffffff");
                    let kept = false;
                    items.forEach((item) => {
                      if (item.classList.contains("active")) {
                        if (!kept) {
                          kept = true;
                          item.style.backgroundColor = activeBg;
                          const txt = item.querySelector(".container-text");
                          if (txt) {
                            txt.style.color = activeFg;
                          }
                        } else {
                          item.classList.remove("active");
                          item.style.backgroundColor = "";
                          const txt = item.querySelector(".container-text");
                          if (txt) {
                            txt.style.color = normalFg;
                          }
                        }
                      }
                    });
                  }
                } else if (sorter) {
                  value = normalizeChoiceSelection(value);
                  dataset.selection = value;
                  renderutils.renderSorter(element);
                }
                break;
              case "itemType":
                if (container) {
                  const resolved = resolveContainerItemType(value);
                  value = resolved;
                  element.dataset.itemType = resolved;
                  applyContainerItemFilter(element);
                }
                break;
              case "itemOrder":
                if (container) {
                  const enabled = utils.isTrue(value);
                  if (enabled) {
                    const activeItems = Array.from(element.querySelectorAll(".container-item.active .container-text")).map((node) => node.textContent || "").map((text) => text.trim()).filter(Boolean);
                    const ordered = mergeSelectionOrder(element, activeItems);
                    element.dataset.selectedOrder = ordered.join(",");
                  } else if ("selectedOrder" in element.dataset) {
                    delete element.dataset.selectedOrder;
                  }
                  value = enabled ? "true" : "false";
                }
                break;
              case "pinontop":
                if (container) {
                  value = utils.isTrue(value) ? "true" : "false";
                  dataset.pinontop = value;
                  applyContainerItemFilter(element);
                }
                break;
              case "value":
                if (inner instanceof HTMLTextAreaElement && input) {
                  inner.value = value;
                  requestAnimationFrame(() => syncInputOverflow(inner));
                } else if (inner instanceof HTMLSelectElement && select) {
                  const text = String(value || "");
                  const tokens = text.split(/[;,]/).map((s) => s.trim()).filter((s) => s.length > 0);
                  inner.innerHTML = "";
                  if (tokens.length === 0) {
                    const opt = document.createElement("option");
                    opt.value = "";
                    opt.textContent = "";
                    inner.appendChild(opt);
                  } else {
                    for (const token of tokens) {
                      const opt = document.createElement("option");
                      opt.value = token;
                      opt.textContent = token;
                      inner.appendChild(opt);
                    }
                  }
                  const inn = inner.getBoundingClientRect();
                  if (inn.height > 0) {
                    element.style.height = `${Math.round(inn.height)}px`;
                  }
                } else if (label) {
                  element.dataset[key] = value;
                  renderutils.updateLabel(element);
                }
                break;
              case "items":
                if (sorter) {
                  element.dataset.items = String(value || "");
                  const itemsInput = document.getElementById("elitems");
                  if (itemsInput) itemsInput.value = String(value || "");
                  sorterNeedsRender = true;
                }
                break;
              case "isEnabled":
                {
                  const enabled = utils.isTrue(value);
                  const usesCustomDisabledColor = input || select || checkbox || radio || counter;
                  if (enabled) {
                    element.classList.remove("disabled-div");
                    if (renderutils.previewWindow()) {
                      element.style.pointerEvents = "";
                    }
                  } else {
                    if (!usesCustomDisabledColor) {
                      element.classList.add("disabled-div");
                    } else {
                      element.classList.remove("disabled-div");
                    }
                    if (renderutils.previewWindow()) {
                      element.style.pointerEvents = "none";
                    }
                  }
                  if (inner) {
                    if (usesCustomDisabledColor) {
                      inner.classList.remove("disabled-div");
                    } else {
                      inner.classList.toggle("disabled-div", !enabled);
                    }
                    if (renderutils.previewWindow()) {
                      inner.style.pointerEvents = enabled ? "" : "none";
                    }
                  }
                  if (input) {
                    const inputEl2 = inner instanceof HTMLTextAreaElement ? inner : element.querySelector("textarea");
                    const actualInput = element instanceof HTMLTextAreaElement ? element : inputEl2;
                    if (actualInput) {
                      actualInput.disabled = !enabled;
                    }
                  }
                  if (select) {
                    const selectEl2 = inner instanceof HTMLSelectElement ? inner : element.querySelector("select");
                    const actualSelect = element instanceof HTMLSelectElement ? element : selectEl2;
                    if (actualSelect) {
                      actualSelect.disabled = !enabled;
                    }
                  }
                  if (slider) {
                    if (inner) {
                      inner.style.pointerEvents = enabled ? "" : "none";
                    }
                    const sliderHandle = document.querySelector(`#slider-handle-${element.id}`);
                    if (sliderHandle) {
                      sliderHandle.style.pointerEvents = enabled ? "" : "none";
                    }
                  }
                  if (counter) {
                    const arrows = element.querySelectorAll(".counter-arrow");
                    arrows.forEach((arrow2) => {
                      arrow2.style.pointerEvents = enabled ? "" : "none";
                      if (!enabled) {
                        arrow2.classList.add("disabled");
                      } else {
                        arrow2.classList.remove("disabled");
                      }
                    });
                    applyCounterDisabledAppearance(element, enabled, dataset);
                  }
                  if (button && inner) {
                    inner.style.pointerEvents = enabled ? "" : "none";
                  }
                  if (label || separator || container || sorter || group) {
                    element.style.pointerEvents = enabled ? "" : "none";
                  }
                  if (container) {
                    const normalBg = String(dataset.backgroundColor || "#ffffff");
                    const disabledBg = String(dataset.disabledColor || "#d8d8d8");
                    const host = inner || element;
                    host.style.backgroundColor = enabled ? normalBg : disabledBg;
                    if (host !== element) {
                      element.style.backgroundColor = enabled ? normalBg : disabledBg;
                    }
                    applyEditorContainerSampleState(host, dataset, enabled);
                    applyContainerItemFilter(element);
                  }
                  if (sorter) {
                    const host = inner || element;
                    const normalBg = String(dataset.backgroundColor || "#ffffff");
                    host.style.backgroundColor = normalBg;
                    if (host !== element) {
                      element.style.backgroundColor = normalBg;
                    }
                    sorterNeedsRender = true;
                  }
                  const inputEl = element instanceof HTMLTextAreaElement ? element : inner;
                  if (inputEl && input) {
                    inputEl.disabled = !enabled;
                    applyControlDisabledAppearance({ input: inputEl, enabled, source: dataset });
                  }
                  const selectEl = element instanceof HTMLSelectElement ? element : inner;
                  if (selectEl && select) {
                    selectEl.disabled = !enabled;
                    applyControlDisabledAppearance({ input: selectEl, enabled, source: dataset });
                  }
                  if (checkbox && customCheckbox) {
                    applyControlDisabledAppearance({ checkbox: customCheckbox, enabled, source: dataset });
                  }
                  if (radio && customRadio) {
                    applyControlDisabledAppearance({ radio: customRadio, enabled, source: dataset });
                    const nativeRadio = element.querySelector(".native-radio");
                    if (nativeRadio) {
                      nativeRadio.disabled = !enabled;
                    }
                  }
                }
                break;
              case "isVisible":
                if (utils.isTrue(value)) {
                  element.classList.remove("design-hidden");
                  element.style.removeProperty("display");
                  element.style.removeProperty("visibility");
                  const inner2 = element.firstElementChild;
                  if (inner2) {
                    inner2.classList.remove("design-hidden");
                    inner2.style.removeProperty("display");
                    inner2.style.removeProperty("visibility");
                  }
                } else {
                  if (renderutils.previewWindow()) {
                    element.style.display = "none";
                    element.classList.remove("design-hidden");
                  } else {
                    element.classList.add("design-hidden");
                    element.style.removeProperty("display");
                    element.style.removeProperty("visibility");
                  }
                }
                break;
              case "isSelected":
                if (customRadio) {
                  if (utils.isTrue(value)) {
                    renderutils.unselectRadioGroup(customRadio);
                    customRadio.setAttribute("aria-checked", "true");
                    customRadio.classList.add("selected");
                  } else {
                    customRadio.setAttribute("aria-checked", "false");
                    customRadio.classList.remove("selected");
                  }
                }
                break;
              case "group":
                element.dataset.group = String(value ?? "");
                if (customRadio) {
                  customRadio.setAttribute("group", String(value ?? ""));
                  if (utils.isTrue(props.isSelected) || customRadio.classList.contains("selected")) {
                    renderutils.unselectRadioGroup(customRadio);
                    customRadio.setAttribute("aria-checked", "true");
                    customRadio.classList.add("selected");
                  }
                }
                break;
              case "isChecked":
                if (customCheckbox) {
                  customCheckbox.setAttribute("aria-checked", String(value));
                  if (utils.isTrue(value)) {
                    customCheckbox.classList.add("checked");
                  } else {
                    customCheckbox.classList.remove("checked");
                  }
                }
                break;
              case "fill":
                if (customCheckbox) {
                  customCheckbox.dataset.fill = String(utils.isTrue(value));
                }
                break;
              case "sortable":
                if (sorter) {
                  value = utils.isTrue(value) ? "true" : "false";
                  sorterNeedsRender = true;
                }
                break;
              case "ordering":
                if (sorter) {
                  value = normalizeChoiceOrdering(value);
                  sorterNeedsRender = true;
                }
                break;
              case "orientation":
                if (sorter) {
                  value = normalizeChoiceOrientation(value);
                  const orientationInput = document.getElementById("elorientation");
                  if (orientationInput) orientationInput.value = value;
                  sorterNeedsRender = true;
                }
                break;
              case "align":
                if (label) {
                  element.dataset[key] = value;
                  const alignInput = document.getElementById("elalign");
                  if (alignInput) alignInput.value = String(value || "left");
                  renderutils.updateLabel(element);
                } else if (sorter) {
                  const normalized = String(value || "").toLowerCase();
                  const allowed = ["left", "center", "right"];
                  const next = allowed.includes(normalized) ? normalized : "left";
                  element.dataset.align = next;
                  const alignInput = document.getElementById("elalign");
                  if (alignInput) alignInput.value = next;
                  sorterNeedsRender = true;
                }
                break;
              case "valign":
                if (label) {
                  const next = normalizeLabelVAlign(value);
                  element.dataset.valign = next;
                  const valignInput = document.getElementById("elvalign");
                  if (valignInput) valignInput.value = next;
                  renderutils.updateLabel(element);
                }
                break;
              case "rotate":
                if (label) {
                  const allowed = /* @__PURE__ */ new Set(["0", "90", "180", "270"]);
                  value = allowed.has(String(value)) ? String(value) : "0";
                  element.dataset[key] = value;
                  const rotateInput = document.getElementById("elrotate");
                  if (rotateInput) rotateInput.value = value;
                  renderutils.updateLabel(element);
                }
                break;
              default:
                break;
            }
            if (["left", "top", "width", "height", "nameid"].includes(key)) {
              const elprop = document.getElementById("el" + key);
              elprop.value = value;
            }
            element.dataset[key] = value;
            if (slider && handle) {
              renderutils.updateHandleStyle(handle, { ...props, ...dataset });
            }
          });
          if (counter && counterNeedsResize) {
            renderutils.syncCounterSize(element);
          }
          if (sorter && sorterNeedsRender) {
            renderutils.renderSorter(element);
          }
        },
        // Propagate an element name change across customJS for ui.on(...) and ui.trigger(...) first argument (identifier or quoted)
        propagateNameChange: function(oldName, newName) {
          const old_name = String(oldName || "").trim();
          const new_name = String(newName || "").trim();
          if (!old_name || !new_name || old_name === new_name) {
            return;
          }
          const escapeName = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const src = String(dialog.customJS || "");
          if (src) {
            const escOld = escapeName(old_name);
            const onUnquotedRegExp = new RegExp(`\\bui\\.on\\s*\\(\\s*${escOld}\\b`, "g");
            const onQuotedRegExp = new RegExp(`\\bui\\.on\\s*\\(\\s*(["'])${escOld}\\1`, "g");
            const triggerUnquotedRegExp = new RegExp(`\\bui\\.trigger\\s*\\(\\s*${escOld}\\b`, "g");
            const triggerQuotedRegExp = new RegExp(`\\bui\\.trigger\\s*\\(\\s*(["'])${escOld}\\1`, "g");
            let out = src.replace(onUnquotedRegExp, (word) => word.replace(old_name, new_name));
            out = out.replace(triggerUnquotedRegExp, (word) => word.replace(old_name, new_name));
            out = out.replace(onQuotedRegExp, (_word, quote) => `ui.on(${quote}${new_name}${quote}`);
            out = out.replace(triggerQuotedRegExp, (_word, quote) => `ui.trigger(${quote}${new_name}${quote}`);
            if (out !== src) {
              dialog.customJS = out;
            }
          }
        },
        renderSorter: function(host, opts = {}, emitChange = true) {
          const visual = host.classList.contains("sorter") ? host : host.querySelector(".sorter");
          if (!visual) {
            return;
          }
          const datasetSource = host;
          const itemsStr = String(opts.items ?? datasetSource.dataset.items ?? "");
          let sampleStateRaw;
          if (!renderutils.previewWindow()) {
            const labels = splitSorterValues(itemsStr);
            sampleStateRaw = buildSorterSampleState(labels, normalizeChoiceOrdering(opts.ordering ?? datasetSource.dataset.ordering ?? "no"));
            visual.__sampleSorterState = sampleStateRaw;
          } else {
            visual.__sampleSorterState = void 0;
          }
          const persistedStateRaw = datasetSource.dataset[SORTER_STATE_KEY];
          const stateRaw = opts[SORTER_STATE_KEY] !== void 0 ? opts[SORTER_STATE_KEY] : persistedStateRaw && String(persistedStateRaw).trim().length > 0 ? persistedStateRaw : sampleStateRaw;
          const usingSampleState = opts[SORTER_STATE_KEY] === void 0 && (!persistedStateRaw || String(persistedStateRaw).trim().length === 0) && !!sampleStateRaw;
          const persistState = opts.persistState === void 0 ? !usingSampleState : utils.isTrue(opts.persistState);
          const sortable = utils.isTrue(opts.sortable ?? datasetSource.dataset.sortable ?? "true");
          const orderingMode = normalizeChoiceOrdering(opts.ordering ?? datasetSource.dataset.ordering ?? "no");
          const orientation = normalizeChoiceOrientation(opts.orientation ?? datasetSource.dataset.orientation ?? "vertical");
          const selectionMode = normalizeChoiceSelection(opts.selection ?? datasetSource.dataset.selection ?? "multiple");
          const ordering = orderingMode !== "no";
          let items = normalizeSorterItems(itemsStr, stateRaw);
          items = normalizeSorterItemsForMode(items, orderingMode);
          items = coerceSorterItemsForSelection(items, selectionMode, orderingMode);
          const bg = String(opts.backgroundColor ?? datasetSource.dataset.backgroundColor ?? "#ffffff");
          const fg = String(opts.fontColor ?? datasetSource.dataset.fontColor ?? "#000000");
          const activeBg = String(opts.activeBackgroundColor ?? datasetSource.dataset.activeBackgroundColor ?? "#e6f1e6");
          const activeFg = String(opts.activeFontColor ?? datasetSource.dataset.activeFontColor ?? "#000000");
          const border = String(opts.borderColor ?? datasetSource.dataset.borderColor ?? "#b8b8b8");
          const alignRaw = String(opts.align ?? datasetSource.dataset.align ?? "left").toLowerCase();
          const align = ["left", "center", "right"].includes(alignRaw) ? alignRaw : "left";
          visual.style.backgroundColor = bg;
          visual.style.borderColor = border;
          visual.style.setProperty("--sorter-bg", bg);
          visual.style.setProperty("--sorter-fg", fg);
          visual.style.setProperty("--sorter-active-bg", activeBg);
          visual.style.setProperty("--sorter-active-fg", activeFg);
          datasetSource.dataset.sortable = sortable ? "true" : "false";
          datasetSource.dataset.ordering = orderingMode;
          datasetSource.dataset.orientation = orientation;
          datasetSource.dataset.selection = selectionMode;
          visual.dataset.sortable = datasetSource.dataset.sortable;
          visual.dataset.ordering = datasetSource.dataset.ordering;
          visual.dataset.orientation = orientation;
          visual.dataset.selection = selectionMode;
          const existingList = visual.querySelector(".sorter-list");
          const list = existingList || document.createElement("div");
          list.className = "sorter-list";
          list.dataset.orientation = orientation;
          list.style.position = "relative";
          const existingSortable = list.__sortable;
          if (existingSortable?.destroy) {
            try {
              existingSortable.destroy();
            } catch {
            }
          }
          delete list.__sortable;
          list.innerHTML = "";
          if (persistState) {
            updateSorterDataset(datasetSource, items);
          } else {
            const order2 = items.map((it) => it.text).join(",");
            datasetSource.dataset.items = order2;
            datasetSource.dataset.order = order2;
          }
          visual.dataset.items = datasetSource.dataset.items || "";
          visual.dataset.order = datasetSource.dataset.order || "";
          visual.dataset.activeValues = datasetSource.dataset.activeValues || "";
          visual.dataset.selected = datasetSource.dataset.selected || "";
          visual.dataset[SORTER_STATE_KEY] = datasetSource.dataset[SORTER_STATE_KEY] || "";
          const colors = {
            activeBg,
            activeFg,
            baseBg: bg,
            baseFg: fg
          };
          const attachRow = (item, index) => {
            const row = document.createElement("div");
            row.className = "sorter-item";
            row.dataset.state = item.state;
            row.dataset.text = item.text;
            row.draggable = false;
            row.dataset.align = align;
            if (!ordering) {
              row.classList.add("no-order");
            }
            const label = document.createElement("span");
            label.className = "sorter-label";
            label.textContent = item.text;
            label.style.textAlign = align;
            const indicator = document.createElement("span");
            indicator.className = "sorter-indicator";
            indicator.textContent = item.state === "desc" ? "\u25BC" : "\u25B2";
            indicator.classList.toggle("hidden", !ordering);
            applySorterStateClasses(row, item, colors, orderingMode, ordering ? indicator : null);
            const cycle = () => {
              const nextState = cycleSorterState(item.state, orderingMode);
              const forcedSingle = selectionMode === "single-radio";
              const plainSingle = selectionMode === "single";
              if ((forcedSingle || plainSingle) && nextState !== "off") {
                items.forEach((candidate, candidateIndex) => {
                  candidate.state = candidateIndex === index ? nextState : "off";
                });
              } else if (forcedSingle && nextState === "off") {
                item.state = item.state === "off" ? preferredSorterState(orderingMode) : item.state;
              } else {
                item.state = nextState;
              }
              applySorterStateClasses(row, item, colors, orderingMode, ordering ? indicator : null);
              if (forcedSingle || plainSingle) {
                Array.from(list.querySelectorAll(".sorter-item")).forEach((otherRow, otherIndex) => {
                  if (otherIndex === index) return;
                  const otherItem = items[otherIndex];
                  const otherIndicator = otherRow.querySelector(".sorter-indicator");
                  if (otherItem) {
                    applySorterStateClasses(otherRow, otherItem, colors, orderingMode, ordering ? otherIndicator : null);
                  }
                });
              }
              if (persistState) {
                updateSorterDataset(datasetSource, items);
                visual.dataset.order = datasetSource.dataset.order || "";
                visual.dataset.activeValues = datasetSource.dataset.activeValues || "";
                visual.dataset.selected = datasetSource.dataset.selected || "";
                visual.dataset[SORTER_STATE_KEY] = datasetSource.dataset[SORTER_STATE_KEY] || "";
                if (emitChange) {
                  visual.dispatchEvent(new Event("change", { bubbles: true }));
                }
              } else {
                visual.__sampleSorterState = stringifySorterState(items);
              }
              label.style.textAlign = align;
            };
            row.addEventListener("click", () => {
              if (list.dataset.dragging === "true") return;
              cycle();
            });
            label.addEventListener("click", (ev) => {
              ev.stopPropagation();
              if (list.dataset.dragging === "true") return;
              cycle();
            });
            indicator.addEventListener("click", (ev) => {
              ev.stopPropagation();
              if (list.dataset.dragging === "true") return;
              cycle();
            });
            row.appendChild(label);
            row.appendChild(indicator);
            list.appendChild(row);
          };
          items.forEach((item, idx) => attachRow(item, idx));
          if (!existingList) {
            visual.innerHTML = "";
            visual.appendChild(list);
          }
          if (sortable) {
            list.__sortable = new Sortable(list, {
              animation: 150,
              draggable: ".sorter-item",
              ghostClass: "sorter-ghost",
              chosenClass: "sorter-chosen",
              dragClass: "sorter-drag",
              direction: orientation,
              forceFallback: true,
              fallbackOnBody: false,
              fallbackBoundingClientRect: visual.getBoundingClientRect(),
              scroll: false,
              group: {
                name: `choice-${datasetSource.id || "default"}`,
                pull: false,
                put: false
              },
              onMove: (evt) => {
                const ev = evt.originalEvent;
                if (!ev) return true;
                const r = visual.getBoundingClientRect();
                const x = ev.clientX ?? 0;
                const y = ev.clientY ?? 0;
                const inside = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
                return inside;
              },
              onStart: () => {
                list.dataset.dragging = "true";
              },
              onEnd: () => {
                setTimeout(() => {
                  delete list.dataset.dragging;
                }, 0);
                const rows = Array.from(list.querySelectorAll(".sorter-item"));
                const order2 = rows.map((r) => String(r.dataset.text || "").trim()).filter(Boolean);
                if (order2.length === items.length) {
                  const map = new Map(items.map((it) => [it.text, it]));
                  const next = order2.map((t) => map.get(t)).filter(Boolean);
                  if (next.length === items.length) {
                    items = next;
                  }
                }
                if (persistState) {
                  updateSorterDataset(datasetSource, items);
                  visual.dataset.order = datasetSource.dataset.order || "";
                  visual.dataset.activeValues = datasetSource.dataset.activeValues || "";
                  visual.dataset.selected = datasetSource.dataset.selected || "";
                  visual.dataset[SORTER_STATE_KEY] = datasetSource.dataset[SORTER_STATE_KEY] || "";
                  if (emitChange) {
                    visual.dispatchEvent(new Event("change", { bubbles: true }));
                  }
                } else {
                  visual.__sampleSorterState = stringifySorterState(items);
                }
              }
            });
          }
          return items;
        },
        updateButton: function(button, text, fontSize, lineClamp, width, icon = "none", height, iconSize) {
          button.style.width = width + "px";
          button.style.setProperty("width", width + "px", "important");
          button.style.maxWidth = width + "px";
          button.style.setProperty("max-width", width + "px", "important");
          const lineHeight = fontSize * 1.2;
          const paddingY = 3;
          const maxHeight = lineHeight * lineClamp + 3 * paddingY;
          button.style.maxHeight = maxHeight + "px";
          if (Number.isFinite(height) && Number(height) > 0) {
            button.style.height = Number(height) + "px";
            button.style.minHeight = Number(height) + "px";
          } else {
            button.style.removeProperty("height");
            button.style.removeProperty("min-height");
          }
          syncElementPresentation(button, text, icon, "smart-button-text", "smart-button-icon", "buttonIcon");
          const span = button.querySelector(".smart-button-text");
          const iconNode = button.querySelector(".smart-button-icon");
          span.style.fontSize = fontSize + "px";
          span.style.lineHeight = "1.2";
          span.style.overflow = "hidden";
          span.style.textOverflow = "ellipsis";
          span.style.whiteSpace = "nowrap";
          span.style.setProperty("-webkit-line-clamp", String(lineClamp));
          if (iconNode) {
            iconNode.style.fontSize = resolveElementIconSize(iconSize, fontSize) + "px";
            iconNode.style.lineHeight = "1";
          }
          if (normalizeElementIcon(icon) !== "none") {
            button.title = text;
          } else if (span.scrollHeight > span.offsetHeight) {
            button.title = text;
          } else {
            button.removeAttribute("title");
          }
        },
        updateLabel: function(element, properties) {
          const host = element.firstElementChild || element;
          let dataset = element.dataset;
          const currentLeft = Number(element.dataset.left ?? (parseInt(element.style.left || "0", 10) || 0));
          const currentTop = Number(element.dataset.top ?? (parseInt(element.style.top || "0", 10) || 0));
          const currentWidth = Math.ceil(element.getBoundingClientRect().width || utils.asNumeric(element.style.width.replace("px", "")) || 0);
          const currentHeight = Math.ceil(element.getBoundingClientRect().height || utils.asNumeric(element.style.height.replace("px", "")) || 0);
          const hasMeasuredWidth = currentWidth > 0;
          const hasMeasuredHeight = currentHeight > 0;
          let fontSize = 0;
          if (dataset.fontSize) {
            fontSize = Number(dataset.fontSize);
          }
          if (fontSize <= 0) {
            const wrFS = utils.asInteger(element.style.fontSize.replace("px", "") || "");
            if (!Number.isNaN(wrFS) && wrFS > 0) fontSize = wrFS;
          }
          if (fontSize <= 0) {
            const cs = window.getComputedStyle(host);
            const hcFS = parseFloat(cs.fontSize || "");
            if (!Number.isNaN(hcFS) && hcFS > 0) fontSize = hcFS;
          }
          if (fontSize <= 0) {
            fontSize = Number(coms.fontSize);
          }
          const text = dataset.value ? dataset.value : "";
          const iconName = dataset.icon ? dataset.icon : "none";
          const iconSize = resolveElementIconSize(dataset.iconSize, fontSize);
          let lines = dataset.lineClamp ? Number(dataset.lineClamp) : 1;
          let maxW = dataset.maxWidth ? Number(dataset.maxWidth) : 100;
          const rotate = (/* @__PURE__ */ new Set([0, 90, 180, 270])).has(Number(dataset.rotate)) ? Number(dataset.rotate) : 0;
          const align = dataset.align || "left";
          const valign = normalizeLabelVAlign(dataset.valign || "top");
          const verticalAlign = valign === "top" ? "flex-start" : valign === "bottom" ? "flex-end" : "center";
          const horizontalInset = 2;
          syncElementPresentation(host, text, iconName, "smart-label-text", "smart-label-icon", "elementIcon");
          const textNode = host.querySelector(".smart-label-text");
          const iconNode = host.querySelector(".smart-label-icon");
          const iconMode = normalizeElementIcon(iconName) !== "none";
          host.style.fontSize = fontSize + "px";
          host.style.lineHeight = "1.2";
          host.style.overflow = "hidden";
          host.style.color = dataset.fontColor || "#000000";
          host.style.textOverflow = "ellipsis";
          host.style.boxSizing = "border-box";
          if (textNode) {
            textNode.style.fontSize = fontSize + "px";
            textNode.style.lineHeight = "1.2";
          }
          if (iconNode) {
            iconNode.style.fontSize = iconSize + "px";
            iconNode.style.lineHeight = "1";
            iconNode.style.alignItems = "center";
            iconNode.style.justifyContent = align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start";
          }
          const singleLineHeight = Math.ceil(fontSize * 1.2);
          host.style.textAlign = align;
          if (!iconMode) {
            host.style.paddingLeft = `${horizontalInset}px`;
            host.style.paddingRight = `${horizontalInset}px`;
          } else {
            host.style.paddingLeft = "0px";
            host.style.paddingRight = "0px";
          }
          if (iconMode) {
            host.style.display = "flex";
            host.style.whiteSpace = "nowrap";
            host.style.overflow = "visible";
            host.style.textOverflow = "clip";
            host.style.alignItems = verticalAlign;
            host.style.removeProperty("-webkit-line-clamp");
            host.style.removeProperty("-webkit-box-orient");
            host.style.removeProperty("word-break");
            host.style.removeProperty("max-height");
            host.style.removeProperty("height");
            host.style.removeProperty("position");
            host.style.removeProperty("top");
            host.style.removeProperty("transform");
            host.style.removeProperty("vertical-align");
            element.style.display = "flex";
            element.style.alignItems = verticalAlign;
            element.style.justifyContent = align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start";
            element.style.removeProperty("max-height");
          } else if (lines > 1) {
            host.style.display = "-webkit-box";
            host.style.whiteSpace = "normal";
            host.style.overflow = "hidden";
            host.style.textOverflow = "ellipsis";
            host.style.wordBreak = "break-word";
            host.style.setProperty("-webkit-line-clamp", String(lines));
            host.style.setProperty("-webkit-box-orient", "vertical");
            host.style.alignItems = verticalAlign;
            host.style.removeProperty("max-height");
            host.style.removeProperty("height");
            host.style.removeProperty("position");
            host.style.removeProperty("top");
            host.style.removeProperty("transform");
            host.style.removeProperty("vertical-align");
            element.style.display = "flex";
            element.style.alignItems = verticalAlign;
            element.style.justifyContent = "flex-start";
            element.style.removeProperty("height");
            element.style.removeProperty("max-height");
          } else {
            host.style.display = "block";
            host.style.whiteSpace = "nowrap";
            host.style.removeProperty("-webkit-line-clamp");
            host.style.removeProperty("-webkit-box-orient");
            host.style.removeProperty("word-break");
            host.style.removeProperty("max-height");
            host.style.removeProperty("height");
            host.style.removeProperty("position");
            host.style.removeProperty("top");
            host.style.removeProperty("transform");
            host.style.removeProperty("vertical-align");
            host.style.alignItems = verticalAlign;
            element.style.display = "flex";
            element.style.alignItems = verticalAlign;
            element.style.justifyContent = "flex-start";
            element.style.removeProperty("max-height");
          }
          host.style.minWidth = "0";
          element.style.removeProperty("width");
          element.style.removeProperty("max-width");
          host.style.width = "auto";
          host.style.removeProperty("max-width");
          const measureNoWrapLabelWidth = () => {
            const probe = document.createElement("span");
            const computed = window.getComputedStyle(host);
            probe.textContent = text;
            probe.style.position = "absolute";
            probe.style.visibility = "hidden";
            probe.style.pointerEvents = "none";
            probe.style.whiteSpace = "nowrap";
            probe.style.fontFamily = computed.fontFamily || coms.fontFamily;
            probe.style.fontSize = `${fontSize}px`;
            probe.style.fontWeight = computed.fontWeight;
            probe.style.fontStyle = computed.fontStyle;
            probe.style.letterSpacing = computed.letterSpacing;
            probe.style.lineHeight = "1.2";
            probe.style.padding = "0";
            probe.style.border = "0";
            probe.style.boxSizing = "content-box";
            document.body.appendChild(probe);
            const width = Math.ceil(Math.max(
              probe.scrollWidth || 0,
              probe.getBoundingClientRect().width || 0
            ));
            probe.remove();
            return width + horizontalInset * 2 + 2;
          };
          let natural = iconMode ? Math.ceil(iconSize * 1.1) : measureNoWrapLabelWidth();
          if (!Number.isFinite(natural) || natural <= 0) {
            const measuredScroll = Math.ceil(host.scrollWidth || 0);
            const measuredBox = Math.ceil(host.getBoundingClientRect().width || 0);
            natural = Math.max(measuredScroll, measuredBox, singleLineHeight);
          }
          const finalW = Math.max(0, maxW > 0 ? Math.min(natural, maxW) : natural);
          host.style.maxWidth = maxW > 0 ? `${maxW}px` : "";
          host.style.width = `${finalW}px`;
          const wrappedTextLabel = !iconMode && lines > 1 && natural > finalW;
          host.style.paddingTop = "0px";
          host.style.paddingBottom = "0px";
          const wrappedTextHeight = wrappedTextLabel ? Math.ceil(fontSize * 1.2 * Math.max(1, lines)) : 0;
          const naturalH = Math.max(
            0,
            Math.ceil(host.scrollHeight || 0),
            Math.ceil(host.getBoundingClientRect().height || 0),
            wrappedTextHeight,
            iconMode ? Math.ceil(iconSize * 1.1) : singleLineHeight
          );
          const finalBoxW = rotate === 90 || rotate === 270 ? naturalH : finalW;
          const finalBoxH = rotate === 90 || rotate === 270 ? finalW : naturalH;
          element.style.maxWidth = "";
          element.style.width = `${finalBoxW}px`;
          element.style.height = `${finalBoxH}px`;
          let anchoredLeft = currentLeft;
          let anchoredTop = currentTop;
          if (hasMeasuredWidth) {
            if (align === "right") {
              anchoredLeft = currentLeft + currentWidth - finalBoxW;
            } else if (align === "center") {
              const center = currentLeft + currentWidth / 2;
              anchoredLeft = Math.round(center - finalBoxW / 2);
            }
          }
          if ((rotate === 90 || rotate === 270) && hasMeasuredHeight) {
            if (align === "right") {
              anchoredTop = currentTop + currentHeight - finalBoxH;
            } else if (align === "center") {
              const center = currentTop + currentHeight / 2;
              anchoredTop = Math.round(center - finalBoxH / 2);
            }
          }
          element.style.left = `${anchoredLeft}px`;
          element.style.top = `${anchoredTop}px`;
          element.dataset.left = String(anchoredLeft);
          element.dataset.top = String(anchoredTop);
          if (lines <= 1) {
            const needsEllipsis = natural > finalW;
            host.style.textOverflow = needsEllipsis ? "ellipsis" : "clip";
            host.style.overflow = needsEllipsis ? "hidden" : "visible";
          }
          if (!renderutils.previewWindow()) {
            const dialogW = dialog.canvas.getBoundingClientRect().width;
            const dialogH = dialog.canvas.getBoundingClientRect().height;
            const elleft = document.getElementById("elleft");
            const eltop = document.getElementById("eltop");
            const left2 = Number(element.dataset.left ?? (parseInt(element.style.left || "0", 10) || 0));
            const top2 = Number(element.dataset.top ?? (parseInt(element.style.top || "0", 10) || 0));
            let newleft = left2;
            let newtop = top2;
            if (left2 < 10) {
              newleft = 10;
            }
            if (newleft + finalBoxW + 10 > dialogW) {
              newleft = Math.max(10, Math.round(dialogW - finalBoxW - 10));
            }
            if (top2 < 10) {
              newtop = 10;
            }
            if (newtop + finalBoxH + 10 > dialogH) {
              newtop = Math.max(10, Math.round(dialogH - finalBoxH - 10));
            }
            if (newleft !== left2) {
              element.style.left = newleft + "px";
              element.dataset.left = String(newleft);
              if (elleft) elleft.value = String(newleft);
            }
            if (newtop !== top2) {
              element.style.top = newtop + "px";
              element.dataset.top = String(newtop);
              if (eltop) eltop.value = String(newtop);
            }
          }
          host.style.transformOrigin = "top left";
          if (host !== element && rotate !== 0) {
            element.style.display = "block";
            element.style.alignItems = "";
            element.style.justifyContent = "";
            host.style.position = "absolute";
            switch (rotate) {
              case 90:
                host.style.left = `${finalBoxW}px`;
                host.style.top = "0px";
                host.style.transform = "rotate(90deg)";
                break;
              case 180:
                host.style.left = `${finalW}px`;
                host.style.top = `${finalBoxH}px`;
                host.style.transform = "rotate(180deg)";
                break;
              case 270:
                host.style.left = "0px";
                host.style.top = `${finalW}px`;
                host.style.transform = "rotate(270deg)";
                break;
              default:
                break;
            }
          } else {
            host.style.removeProperty("position");
            host.style.removeProperty("left");
            host.style.removeProperty("top");
            switch (rotate) {
              case 90:
                host.style.transform = "rotate(90deg) translateY(-100%)";
                break;
              case 180:
                host.style.transform = "rotate(180deg) translate(-100%, -100%)";
                break;
              case 270:
                host.style.transform = "rotate(270deg) translateX(-100%)";
                break;
              default:
                host.style.transform = "";
                break;
            }
          }
          const overflow = host.scrollWidth > host.clientWidth || host.scrollHeight > host.clientHeight;
          if (overflow) {
            element.title = text;
          } else {
            element.removeAttribute("title");
          }
        },
        updateHandleStyle: function(handle, obj) {
          if (obj.handleshape && obj.direction) {
            handle.style.border = "";
            handle.style.borderLeft = "";
            handle.style.borderRight = "";
            handle.style.borderTop = "";
            handle.style.borderBottom = "";
            handle.style.backgroundColor = "";
            handle.style.width = "";
            handle.style.height = "";
            handle.style.borderRadius = "";
            handle.dataset.handleshape = String(obj.handleshape) || "triangle";
            handle.dataset.direction = String(obj.direction);
            if (obj.handleshape === "triangle") {
              if (obj.direction === "horizontal") {
                handle.style.borderLeft = obj.handlesize + "px solid transparent";
                handle.style.borderRight = obj.handlesize + "px solid transparent";
                handle.style.borderBottom = 1.5 * Number(obj.handlesize) + "px solid " + obj.handleColor;
                handle.style.left = obj.handlepos + "%";
                handle.style.top = "100%";
              } else if (obj.direction === "vertical") {
                handle.style.borderTop = obj.handlesize + "px solid transparent";
                handle.style.borderBottom = obj.handlesize + "px solid transparent";
                handle.style.borderRight = 1.5 * Number(obj.handlesize) + "px solid " + obj.handleColor;
                handle.style.left = "0%";
                handle.style.top = 100 - Number(obj.handlepos) + "%";
              }
              handle.style.width = "0px";
              handle.style.height = "0px";
            } else if (obj.handleshape === "circle") {
              const radius = 1.5 * Number(obj.handlesize);
              handle.style.width = `${radius}px`;
              handle.style.height = `${radius}px`;
              handle.style.backgroundColor = String(obj.handleColor);
              handle.style.borderRadius = "50%";
              if (obj.direction == "horizontal") {
                handle.style.left = obj.handlepos + "%";
                handle.style.top = "50%";
              } else {
                handle.style.left = "50%";
                handle.style.top = 100 - Number(obj.handlepos) + "%";
              }
            }
          }
        },
        syncCounterSize: function(wrapper) {
          const innerCounter = wrapper.firstElementChild instanceof HTMLElement && wrapper.firstElementChild.classList.contains("counter-wrapper") ? wrapper.firstElementChild : null;
          const host = innerCounter || wrapper;
          const prevWidth = wrapper.style.width;
          const prevHeight = wrapper.style.height;
          wrapper.style.width = "fit-content";
          wrapper.style.height = "fit-content";
          const rect = host.getBoundingClientRect();
          const naturalW = Math.ceil(Math.max(host.scrollWidth || 0, rect.width || 0));
          const naturalH = Math.ceil(Math.max(host.scrollHeight || 0, rect.height || 0));
          if (naturalW > 0) {
            wrapper.style.width = `${naturalW}px`;
          } else {
            wrapper.style.width = prevWidth;
          }
          if (naturalH > 0) {
            wrapper.style.height = `${naturalH}px`;
          } else {
            wrapper.style.height = prevHeight;
          }
          const cover2 = wrapper.querySelector(".elementcover");
          if (cover2) {
            cover2.style.width = "100%";
            cover2.style.height = "100%";
          }
        },
        getSelectedIds: function() {
          return Array.from(document.querySelectorAll("#dialog .selectedElement")).map((el) => el.id);
        },
        // Ungroup a persistent group element back into top-level elements; returns child IDs
        ungroupGroup: function(groupId) {
          const group = dialog.getElement(groupId);
          if (!group) {
            return [];
          }
          const groupLeft = parseInt(group.style.left || "0", 10) || 0;
          const groupTop = parseInt(group.style.top || "0", 10) || 0;
          const children = Array.from(group.children);
          const childIds = [];
          for (const child of children) {
            const cLeft = parseInt(child.style.left || "0", 10) || 0;
            const cTop = parseInt(child.style.top || "0", 10) || 0;
            const newLeft = groupLeft + cLeft;
            const newTop = groupTop + cTop;
            child.style.left = String(newLeft) + "px";
            child.style.top = String(newTop) + "px";
            child.dataset.left = String(newLeft);
            child.dataset.top = String(newTop);
            dialog.canvas.appendChild(child);
            childIds.push(child.id);
          }
          group.remove();
          dialog.removeElement(groupId);
          return childIds;
        },
        // Create a persistent group from a list of element IDs; returns the new group id or null
        makeGroupFromSelection: function(ids, persistent) {
          try {
            if (!Array.isArray(ids) || ids.length < 2) {
              return null;
            }
            const els = ids.map((id) => dialog.getElement(id)).filter((el) => Boolean(el));
            if (els.length < 2) {
              return null;
            }
            const canvasRect = dialog.canvas.getBoundingClientRect();
            const rects = els.map((el) => el.getBoundingClientRect());
            const minLeft = Math.min(...rects.map((r) => r.left));
            const minTop = Math.min(...rects.map((r) => r.top));
            const maxRight = Math.max(...rects.map((r) => r.right));
            const maxBottom = Math.max(...rects.map((r) => r.bottom));
            const baseLeft = minLeft - canvasRect.left;
            const baseTop = minTop - canvasRect.top;
            const left2 = Math.floor(baseLeft);
            const top2 = Math.floor(baseTop);
            const width = Math.round(maxRight - minLeft);
            const height = Math.round(maxBottom - minTop);
            const groupTemplate = elements.groupElement;
            const groupEl = renderutils.makeElement({ ...groupTemplate, left: left2, top: top2 });
            groupEl.dataset.type = "Group";
            groupEl.classList.add("element-group");
            groupEl.style.width = width + "px";
            groupEl.style.height = height + "px";
            if (persistent) {
              groupEl.dataset.persistent = "true";
            }
            if (!groupEl.dataset.nameid || !groupEl.dataset.nameid.trim()) {
              const unique2 = renderutils.makeUniqueNameID("group");
              groupEl.dataset.nameid = unique2;
            }
            dialog.canvas.appendChild(groupEl);
            for (let idx = 0; idx < els.length; idx++) {
              const child = els[idx];
              const childRect = rects[idx];
              const childAbsLeft = childRect.left - canvasRect.left;
              const childAbsTop = childRect.top - canvasRect.top;
              const newLeft = Math.round(childAbsLeft) - left2 - 1;
              const newTop = Math.round(childAbsTop) - top2 - 1;
              child.style.left = String(newLeft) + "px";
              child.style.top = String(newTop) + "px";
              child.dataset.left = String(newLeft);
              child.dataset.top = String(newTop);
              child.classList.remove("selectedElement");
              groupEl.appendChild(child);
            }
            groupEl.dataset.elementIds = ids.join(",");
            const allRadio = els.length > 0 && els.every((el) => el.dataset.type === "Radio");
            if (allRadio) {
              const groups = Array.from(new Set(els.map((el) => el.dataset.group || "")));
              if (groups.length === 1 && groups[0]) {
                const desired = groups[0];
                const existing = new Set(renderutils.getDialogInfo().elements);
                let finalName = desired;
                if (existing.has(finalName)) {
                  let i = 1;
                  while (existing.has(`${desired}${i}`)) {
                    i++;
                  }
                  finalName = `${desired}${i}`;
                }
                groupEl.dataset.nameid = finalName;
              }
            }
            dialog.addElement(groupEl);
            return groupEl.id;
          } catch {
            return null;
          }
        },
        // Selection helpers
        updateMultiOutline: function(canvas, ids, outlineEl) {
          const bounds = renderutils.computeBounds(ids);
          if (!bounds) {
            if (outlineEl && outlineEl.parentElement) outlineEl.parentElement.removeChild(outlineEl);
            return null;
          }
          const { left: left2, top: top2, width, height } = bounds;
          let outline = outlineEl;
          if (!outline) {
            outline = document.createElement("div");
            outline.className = "multi-outline";
            canvas.appendChild(outline);
          }
          outline.style.left = left2 + "px";
          outline.style.top = top2 + "px";
          outline.style.width = width + "px";
          outline.style.height = height + "px";
          return outline;
        },
        clearMultiOutline: function(outlineEl) {
          if (outlineEl && outlineEl.parentElement) {
            outlineEl.parentElement.removeChild(outlineEl);
          }
          return null;
        },
        computeBounds: function(ids) {
          const els = (ids || []).map((id) => dialog.getElement(id)).filter((el) => Boolean(el));
          if (!els || els.length === 0) {
            return null;
          }
          const canvasRect = dialog.canvas.getBoundingClientRect();
          const parseAxis = (el, axis) => {
            const datasetValue = el.dataset[axis];
            if (datasetValue !== void 0) {
              const numeric = Number(datasetValue);
              if (!Number.isNaN(numeric)) {
                return numeric;
              }
            }
            const styleValue = (el.style[axis] || "").trim();
            if (styleValue.endsWith("px")) {
              const numeric = Number(styleValue.slice(0, -2));
              if (!Number.isNaN(numeric)) {
                return numeric;
              }
            }
            const rect = el.getBoundingClientRect();
            const canvasOffset = axis === "left" ? canvasRect.left : canvasRect.top;
            return rect[axis] - canvasOffset;
          };
          let minLeft = Number.POSITIVE_INFINITY;
          let minTop = Number.POSITIVE_INFINITY;
          let maxRight = Number.NEGATIVE_INFINITY;
          let maxBottom = Number.NEGATIVE_INFINITY;
          for (const el of els) {
            const left3 = parseAxis(el, "left");
            const top3 = parseAxis(el, "top");
            const width2 = el.offsetWidth;
            const height2 = el.offsetHeight;
            const right2 = left3 + width2;
            const bottom2 = top3 + height2;
            if (left3 < minLeft) minLeft = left3;
            if (top3 < minTop) minTop = top3;
            if (right2 > maxRight) maxRight = right2;
            if (bottom2 > maxBottom) maxBottom = bottom2;
          }
          const left2 = Math.round(minLeft);
          const top2 = Math.round(minTop);
          const width = Math.round(maxRight - minLeft);
          const height = Math.round(maxBottom - minTop);
          return { left: left2, top: top2, width, height };
        },
        moveElementsBy: function(ids, dx, dy) {
          for (const id of ids) {
            const el = dialog.getElement(id);
            if (!el) {
              continue;
            }
            const currentLeft = Number(el.dataset.left ?? (parseInt(el.style.left || "0", 10) || 0));
            const currentTop = Number(el.dataset.top ?? (parseInt(el.style.top || "0", 10) || 0));
            const props = { left: currentLeft + dx, top: currentTop + dy };
            renderutils.updateElement(el, props);
            el.dataset.left = String(props.left);
            el.dataset.top = String(props.top);
          }
        },
        updateCheckboxColor: function(uuid, color) {
          const customCheckbox = document.querySelector(`#checkbox-${uuid}`);
          if (customCheckbox) {
            customCheckbox.style.setProperty("--checkbox-color", color);
          }
        },
        async handleEvent(eventName, ...args) {
          const handler = coms.handlers[eventName];
          if (!handler) {
            console.error(`No handler for event: ${eventName}`);
            return;
          }
          try {
            const moduleLabel = String(handler || "").split("/").pop() || String(handler || "");
            const loadHandler = handlerModules[handler];
            if (loadHandler) {
              const imported = await loadHandler();
              const key = Object.keys(imported)[0];
              const exported = imported[key];
              const func = exported[eventName];
              if (typeof func === "function") {
                return await func(...args);
              } else {
                console.error(`Function ${eventName} not found in module ${moduleLabel}`);
              }
            } else {
              showError(`Module "${moduleLabel}" not found in the modules/ directory.`);
            }
          } catch (error) {
            showError(`Error handling ${eventName}: ${error.message}`);
          }
        },
        collectDialogProperties: function() {
          const properties = document.querySelectorAll('#dialog-properties [id^="dialog"]');
          const obj = {};
          properties.forEach((item) => {
            const key = item.getAttribute("name");
            if (key) {
              obj[key] = item.value;
            }
          });
          if (!obj.language || !String(obj.language).trim()) {
            obj.language = "en_US";
          }
          if (!obj.runtimeProvider || !String(obj.runtimeProvider).trim()) {
            obj.runtimeProvider = "R";
          }
          return obj;
        },
        updateFont: function(fontSize, fontFamily) {
          for (const key in dialog.elements) {
            const element = dialog.elements[key];
            const dataset = element.dataset;
            const inner = element.firstElementChild;
            switch (dataset.type) {
              case "Input":
              case "Select":
                element.style.fontSize = fontSize + "px";
                if (inner) inner.style.fontSize = fontSize + "px";
                if (fontFamily) {
                  element.style.fontFamily = fontFamily;
                  if (inner) inner.style.fontFamily = fontFamily;
                }
                if (inner) {
                  const r = inner.getBoundingClientRect();
                  if (r.height > 0) element.style.height = `${Math.round(r.height)}px`;
                }
                break;
              case "Label":
                element.style.fontSize = fontSize + "px";
                element.dataset.fontSize = String(fontSize);
                renderutils.updateLabel(element);
                break;
              case "Button":
                {
                  const host = inner || element;
                  const dsWidth = utils.asNumeric(dataset.width);
                  const styleW = utils.asNumeric(String(element.style.width || "").replace("px", ""));
                  const rectW = Math.round(host.getBoundingClientRect().width || 0);
                  const legacyMax = utils.asNumeric(dataset.maxWidth);
                  const widthPx = utils.isNumeric(dsWidth) && dsWidth > 0 ? dsWidth : utils.isNumeric(styleW) && styleW > 0 ? styleW : utils.isNumeric(rectW) && rectW > 0 ? rectW : utils.isNumeric(legacyMax) && legacyMax > 0 ? legacyMax : 100;
                  renderutils.updateButton(
                    host,
                    dataset.label || "",
                    fontSize,
                    Number(dataset.lineClamp) || 1,
                    widthPx,
                    dataset.icon || "none",
                    Number(dataset.height) || void 0,
                    Number(dataset.iconSize) || 0
                  );
                }
                break;
              case "Counter": {
                const countervalue = document.querySelector(`#counter-value-${element.id}`);
                if (countervalue) {
                  countervalue.style.fontSize = fontSize + "px";
                  if (fontFamily) {
                    countervalue.style.fontFamily = fontFamily;
                  }
                }
                renderutils.syncCounterSize(element);
                break;
              }
              case "Container": {
                element.style.fontSize = fontSize + "px";
                if (inner) {
                  inner.style.fontSize = fontSize + "px";
                }
                const host = inner || element;
                const items = host.querySelectorAll(".container-item");
                const rowMinH = Math.max(24, Math.round(fontSize * 2));
                items.forEach((item) => {
                  item.style.minHeight = rowMinH + "px";
                });
                break;
              }
              case "Choice": {
                element.style.fontSize = fontSize + "px";
                if (inner) {
                  inner.style.fontSize = fontSize + "px";
                }
                renderutils.renderSorter(element);
                break;
              }
              default:
                break;
            }
          }
        },
        buildUniformSchema: function(opts = {}) {
          const {
            includeBooleans = true,
            includeNumbers = true,
            includeStrings = true,
            skipKeys = [],
            treatMixedAs = "skip"
          } = opts;
          const typeMap = {};
          const allowed = /* @__PURE__ */ new Set();
          if (includeStrings) {
            allowed.add("string");
          }
          if (includeNumbers) {
            allowed.add("number");
          }
          if (includeBooleans) {
            allowed.add("boolean");
          }
          for (const tmpl of Object.values(elements)) {
            if (!tmpl || typeof tmpl !== "object") {
              continue;
            }
            for (const [k, v] of Object.entries(tmpl)) {
              if (skipKeys.includes(k)) {
                continue;
              }
              const tv = typeof v;
              if (tv === "string" || tv === "number" || tv === "boolean") {
                if (!allowed.has(tv)) {
                  continue;
                }
                if (!typeMap[k]) {
                  typeMap[k] = /* @__PURE__ */ new Set();
                }
                typeMap[k].add(tv);
              }
            }
          }
          const schema = {};
          for (const [k, set] of Object.entries(typeMap)) {
            if (set.size === 1) {
              schema[k] = [...set][0];
            } else {
              if (treatMixedAs !== "skip") {
                schema[k] = treatMixedAs;
              }
            }
          }
          return schema;
        },
        assertTypes: function(data, options = {}) {
          const { schema, collect = false, strictPresence = false } = options;
          if (!__uniformSchema && !schema) {
            __uniformSchema = renderutils.buildUniformSchema();
          }
          const active = schema || __uniformSchema;
          const errors = [];
          for (const [key, expected] of Object.entries(active)) {
            const has = Object.prototype.hasOwnProperty.call(data, key);
            if (!has) {
              if (strictPresence) {
                const msg = `Missing expected key "${key}"`;
                if (collect) errors.push(msg);
                else throw new Error(msg);
              }
              continue;
            }
            const val = data[key];
            const tv = typeof val;
            if (tv !== expected) {
              let coerced = false;
              if (expected === "string" && (tv === "boolean" || tv === "number")) {
                data[key] = String(val);
                coerced = true;
              } else if (expected === "boolean" && tv === "string") {
                const low = String(val).toLowerCase();
                if (low === "true" || low === "false") {
                  data[key] = low === "true";
                  coerced = true;
                }
              } else if (expected === "number" && tv === "string") {
                const num = Number(val);
                if (!Number.isNaN(num)) {
                  data[key] = num;
                  coerced = true;
                }
              }
              if (!coerced) {
                const msg = `Property "${key}" expected ${expected}, got ${tv}`;
                if (collect) {
                  errors.push(msg);
                } else {
                  throw new Error(msg);
                }
              }
            }
          }
          if (collect) return errors;
        },
        // Return the keys of an element template that are NOT listed in its $persist array
        // (excluding the metadata key $persist itself)
        getNonPersistKeys: function(name) {
          const tmpl = elements[name];
          if (!tmpl) {
            return [];
          }
          const persistSet = new Set(tmpl.$persist || []);
          return Object.keys(tmpl).filter((k) => !persistSet.has(k));
        },
        // Add press/hover keyboard feedback to consistent buttons
        enhanceButton: function(btn) {
          if (!btn || enhancedButtons.has(btn)) {
            return;
          }
          enhancedButtons.add(btn);
          const press = () => btn.classList.add("btn-active");
          const release = () => btn.classList.remove("btn-active");
          btn.addEventListener("mousedown", press);
          btn.addEventListener("mouseup", release);
          btn.addEventListener("mouseleave", release);
          btn.addEventListener("keydown", (e) => {
            if (e.key === " " || e.key === "Enter") {
              press();
            }
          });
          btn.addEventListener("keyup", (e) => {
            if (e.key === " " || e.key === "Enter") {
              release();
              btn.click();
            }
          });
        },
        enhanceButtons: function(root) {
          const scope = root || document;
          const buttons = Array.from(scope.querySelectorAll("button.custombutton"));
          buttons.forEach(renderutils.enhanceButton);
        },
        findWrapper(name, canvas) {
          const n = String(name || "").trim();
          if (!n) {
            return null;
          }
          const matches = Array.from(canvas.querySelectorAll(`[data-nameid="${n}"]`));
          if (matches.length === 0) {
            return null;
          }
          const wrapper = matches.find((el) => el.classList.contains("element-wrapper"));
          if (wrapper) {
            return wrapper;
          }
          const topLevel = matches.find((el) => el.parentElement === canvas);
          if (topLevel) {
            return topLevel;
          }
          const withType = matches.find((el) => (el.dataset?.type || "").length > 0);
          return withType || matches[0] || null;
        },
        findRadioGroupMembers(groupName, canvas) {
          const gnm = String(groupName || "").trim();
          if (!gnm) {
            return [];
          }
          const all = Array.from(canvas.querySelectorAll(`.custom-radio[group="${CSS_ESCAPE(gnm)}"]`));
          if (!all.length) {
            const wrappers2 = Array.from(canvas.querySelectorAll(`.element-wrapper[data-group="${CSS_ESCAPE(gnm)}"]`));
            return wrappers2.filter((el) => String(el.dataset?.type || "").trim() === "Radio");
          }
          const wrappers = /* @__PURE__ */ new Set();
          all.forEach((node) => {
            const wrapper = getRadioWrapperFromNode(node);
            if (wrapper) {
              wrappers.add(wrapper);
            }
          });
          return Array.from(wrappers);
        },
        // Surface runtime errors to end users in Preview (not just console)
        showRuntimeError: function(msg, canvas) {
          coms.sendTo("editorWindow", "consolog", msg);
          let box = canvas.querySelector(".customjs-error.runtime");
          if (!box) {
            box = document.createElement("div");
            box.className = "customjs-error runtime";
            canvas.appendChild(box);
          }
          box.textContent = msg;
        },
        // Build the UI facade for user scripts
        exposeNameGlobals: function(canvas) {
          const elements2 = Array.from(canvas.querySelectorAll("[data-nameid]"));
          if (!window.__nameGlobals) {
            window.__nameGlobals = {};
          }
          const registry = window.__nameGlobals;
          for (const el of elements2) {
            const name = (el.dataset?.nameid || "").trim();
            if (!name || !utils.isIdentifier(name)) {
              continue;
            }
            if (!(name in registry)) {
              registry[name] = el;
              if (!(name in window)) {
                try {
                  Object.defineProperty(window, name, {
                    configurable: true,
                    enumerable: false,
                    get: () => name
                    // returns the name string
                    // The actual element remains accessible via window.__nameGlobals[name].
                  });
                } catch {
                }
              }
            } else {
              registry[name] = el;
            }
          }
          renderutils.exposeRadioGroupGlobals(canvas);
        },
        exposeRadioGroupGlobals: function(canvas) {
          const groups = /* @__PURE__ */ new Set();
          const customRadios = Array.from(canvas.querySelectorAll(".custom-radio[group]"));
          customRadios.forEach((node) => {
            const value = (node.getAttribute("group") || "").trim();
            if (value) {
              groups.add(value);
            }
          });
          const wrappers = Array.from(canvas.querySelectorAll(".element-wrapper[data-group]"));
          wrappers.forEach((wrapper) => {
            const type = String(wrapper.dataset?.type || "").trim();
            if (type !== "Radio") {
              return;
            }
            const value = (wrapper.dataset.group || "").trim();
            if (value) {
              groups.add(value);
            }
          });
          if (!window.__radioGroupGlobals) {
            window.__radioGroupGlobals = {};
          }
          const registry = window.__radioGroupGlobals;
          for (const group of groups) {
            if (!(group in registry)) {
              registry[group] = group;
            }
            if (!(group in window)) {
              if (!utils.isIdentifier(group)) {
                continue;
              }
              try {
                Object.defineProperty(window, group, {
                  configurable: true,
                  enumerable: false,
                  get: () => registry[group]
                });
              } catch {
              }
            }
          }
        },
        // Allow bare identifiers for common event names in customJS, e.g., ui.trigger(x, change)
        exposeEventNameGlobals: function() {
          const events = Array.from(EVENT_NAMES);
          for (const ev of events) {
            if (!(ev in window)) {
              try {
                Object.defineProperty(window, ev, {
                  configurable: true,
                  enumerable: false,
                  get: () => ev
                });
              } catch {
              }
            }
          }
        },
        // Normalize an arbitrary event-like value to a supported event name,
        // or null if unsupported
        normalizeEventName: function(ev) {
          const s = String(ev ?? "").trim().toLowerCase();
          if (!s || !EVENT_NAMES.has(s)) {
            return null;
          }
          return s;
        },
        normalizeContainerItemType: function(value) {
          return normalizeContainerItemType(value);
        },
        syncInputOverflow: function(input) {
          syncInputOverflow(input);
        },
        applyContainerItemFilter: function(host) {
          applyContainerItemFilter(host || null);
        }
      };
    }
  });

  // src/core/ipc/rendererTransport.ts
  function createMissingRendererTransport() {
    return {
      send(channel) {
        throw new Error(`Renderer transport is not configured for channel "${channel}".`);
      },
      on(channel) {
        throw new Error(`Renderer transport is not configured for channel "${channel}".`);
      }
    };
  }
  var init_rendererTransport = __esm({
    "src/core/ipc/rendererTransport.ts"() {
      "use strict";
    }
  });

  // src/modules/coms.ts
  function setRendererTransport(nextTransport) {
    transport = nextTransport;
    rendererTransportConfigured = true;
    for (const channel of pendingTransportChannels) {
      registerTransportListener(channel);
    }
    pendingTransportChannels.clear();
    registerHandlerChannels();
  }
  function ensureRendererTransport(channel) {
    if (!rendererTransportConfigured) {
      throw new Error(`Renderer transport is not configured for channel "${channel}".`);
    }
  }
  function registerTransportListener(channel) {
    const responseChannel = `message-from-main-${channel}`;
    if (registeredChannels.has(channel)) {
      return;
    }
    transport.on(responseChannel, (...args) => {
      messenger.emit(channel, ...args);
    });
    transport.on(channel, (...args) => {
      messenger.emit(channel, ...args);
    });
    registeredChannels.add(channel);
  }
  function registerHandlerChannels() {
    if (handlerChannelsRegistered) {
      return;
    }
    for (const eventName in coms.handlers) {
      transport.on(eventName, async (...args) => {
        const result = await renderutils.handleEvent(eventName, ...args);
        if (utils.exists(result)) {
          messenger.emit(eventName + "-result", result);
        }
      });
    }
    handlerChannelsRegistered = true;
  }
  var messenger, transport, rendererTransportConfigured, handlerChannelsRegistered, pendingTransportChannels, registeredChannels, handlers, coms, showMessage, showError;
  var init_coms = __esm({
    "src/modules/coms.ts"() {
      "use strict";
      init_utils();
      init_renderutils();
      init_rendererTransport();
      messenger = /* @__PURE__ */ (() => {
        const listeners = /* @__PURE__ */ new Map();
        const on = function(channel, listener) {
          const channelListeners = listeners.get(channel) || [];
          channelListeners.push(listener);
          listeners.set(channel, channelListeners);
        };
        return {
          emit(channel, ...args) {
            for (const listener of listeners.get(channel) || []) {
              listener(...args);
            }
          },
          on,
          once(channel, listener) {
            const onceListener = function(...args) {
              const channelListeners = listeners.get(channel) || [];
              listeners.set(
                channel,
                channelListeners.filter((candidate) => candidate !== onceListener)
              );
              listener(...args);
            };
            on(channel, onceListener);
          }
        };
      })();
      transport = createMissingRendererTransport();
      rendererTransportConfigured = false;
      handlerChannelsRegistered = false;
      pendingTransportChannels = /* @__PURE__ */ new Set();
      registeredChannels = /* @__PURE__ */ new Set();
      handlers = {
        addCover: "../modules/cover",
        removeCover: "../modules/cover",
        addAvailableElementsTo: "../modules/editor",
        previewDialog: "../modules/editor"
      };
      coms = {
        emit(channel, ...args) {
          messenger.emit(channel, ...args);
        },
        // send to all listeners from all processes, via ipcMain
        send(channel, ...args) {
          coms.sendTo("all", channel, ...args);
        },
        sendTo(window2, channel, ...args) {
          ensureRendererTransport(channel);
          transport.send("send-to", window2, channel, ...args);
        },
        async runLocal(channel, ...args) {
          const result = await renderutils.handleEvent(channel, ...args);
          return result;
        },
        on(channel, listener) {
          if (rendererTransportConfigured) {
            registerTransportListener(channel);
          } else {
            pendingTransportChannels.add(channel);
          }
          messenger.on(channel, listener);
        },
        once(channel, listener) {
          if (rendererTransportConfigured) {
            registerTransportListener(channel);
          } else {
            pendingTransportChannels.add(channel);
          }
          messenger.once(channel, listener);
        },
        // IPC dispatcher
        handlers,
        fontSize: 12,
        fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, 'Noto Sans', 'Liberation Sans', sans-serif"
      };
      coms.on("consolog", (...args) => {
        console.log(args[0]);
      });
      showMessage = (type, title, message) => {
        coms.sendTo("main", "showDialogMessage", type, title, message);
      };
      showError = (message) => {
        coms.sendTo("main", "showError", message);
      };
    }
  });

  // src/preview/previewController.ts
  init_coms();
  init_utils();
  init_renderutils();
  init_api();
  var initialPreviewDialog = null;
  var activePreviewLocale = "";
  var previewLastSelectedContainerItem = /* @__PURE__ */ new WeakMap();
  var previewShiftWheelContainerTargets = /* @__PURE__ */ new WeakSet();
  var previewHoveredContainer = null;
  var previewSearchContainer = null;
  var previewSearchInput = null;
  var isPreviewContainerSearchable = (host) => {
    if (!(host instanceof HTMLElement)) {
      return false;
    }
    if (String(host.dataset.type || "") !== "Container") {
      return false;
    }
    if (host.style.display === "none" || !utils.isTrue(host.dataset.isVisible ?? "true")) {
      return false;
    }
    if (!utils.isTrue(host.dataset.isEnabled ?? "true")) {
      return false;
    }
    if (!utils.isTrue(host.dataset.autoSearchEnabled ?? "false")) {
      return false;
    }
    return Boolean(host.querySelector(".container-content"));
  };
  var syncPreviewContainerSearchQuery = (host, query) => {
    const trimmed = String(query || "").trim();
    if (trimmed) {
      host.dataset.searchQuery = trimmed;
    } else if ("searchQuery" in host.dataset) {
      delete host.dataset.searchQuery;
    }
    renderutils.applyContainerItemFilter(host);
  };
  var closePreviewContainerSearch = (clearQuery = true) => {
    const host = previewSearchContainer;
    const input = previewSearchInput;
    if (input && input.parentElement) {
      input.parentElement.remove();
    }
    document.querySelectorAll(".preview-container-search").forEach((node) => {
      if (node.parentElement) {
        node.parentElement.removeChild(node);
      }
    });
    if (clearQuery && host) {
      syncPreviewContainerSearchQuery(host, "");
    }
    if (host) {
      delete host.dataset.searchActive;
    }
    previewSearchInput = null;
    previewSearchContainer = null;
  };
  var openPreviewContainerSearch = (host) => {
    if (!isPreviewContainerSearchable(host)) {
      return;
    }
    document.querySelectorAll(".preview-container-search").forEach((node) => {
      if (node.parentElement && node.parentElement !== host) {
        node.parentElement.removeChild(node);
      }
    });
    if (previewSearchContainer && previewSearchContainer !== host) {
      closePreviewContainerSearch(true);
    }
    if (previewSearchContainer === host && previewSearchInput) {
      previewSearchInput.focus();
      previewSearchInput.select();
      return;
    }
    const overlay = document.createElement("div");
    overlay.className = "preview-container-search";
    const input = document.createElement("input");
    input.type = "text";
    input.className = "preview-container-search-input";
    input.placeholder = "Search";
    input.value = String(host.dataset.searchQuery || "");
    input.setAttribute("aria-label", "Search in container");
    input.addEventListener("input", () => {
      syncPreviewContainerSearchQuery(host, input.value);
    });
    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" || ev.key === "Esc") {
        ev.preventDefault();
        ev.stopPropagation();
        closePreviewContainerSearch(true);
      }
    });
    input.addEventListener("blur", () => {
      if (!String(input.value || "").trim()) {
        closePreviewContainerSearch(true);
      }
    });
    overlay.appendChild(input);
    host.appendChild(overlay);
    host.dataset.searchActive = "true";
    previewSearchContainer = host;
    previewSearchInput = input;
    syncPreviewContainerSearchQuery(host, input.value);
    queueMicrotask(() => {
      input.focus();
      input.select();
    });
  };
  var splitPreviewList = (raw) => {
    return String(raw ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  };
  var normalizePreviewOrderList = (values) => {
    const seen = /* @__PURE__ */ new Set();
    const out = [];
    values.forEach((value) => {
      const next = String(value || "").trim();
      if (!next || seen.has(next)) return;
      seen.add(next);
      out.push(next);
    });
    return out;
  };
  var mergePreviewSelectionOrder = (host, activeItems) => {
    const prev = normalizePreviewOrderList(splitPreviewList(host.dataset.selectedOrder));
    const activeSet = new Set(activeItems);
    const next = prev.filter((value) => activeSet.has(value));
    const seen = new Set(next);
    activeItems.forEach((value) => {
      if (!seen.has(value)) {
        next.push(value);
        seen.add(value);
      }
    });
    return next;
  };
  var applyPreviewContainerItemStyle = (host, item, active) => {
    const label = item.querySelector(".container-text");
    const normalBg = host.dataset.backgroundColor || "#ffffff";
    const normalFg = host.dataset.fontColor || "#000000";
    const activeBg = host.dataset.activeBackgroundColor || "#589658";
    const activeFg = host.dataset.activeFontColor || "#ffffff";
    const disabledBg = host.dataset.disabledColor || "#d8d8d8";
    if (item.dataset.disabled === "true" || item.classList.contains("container-item-disabled")) {
      item.style.backgroundColor = disabledBg;
      if (label) label.style.color = normalFg;
      return;
    }
    if (active) {
      item.style.backgroundColor = activeBg;
      if (label) label.style.color = activeFg;
    } else {
      item.style.backgroundColor = normalBg;
      if (label) label.style.color = normalFg;
    }
  };
  var syncPreviewContainerSelection = (host, target2, core) => {
    const activeItems = Array.from(target2.querySelectorAll(".container-item.active")).map((item) => item.dataset.value || "").map((value) => String(value).trim()).filter(Boolean);
    const joined = activeItems.join(",");
    host.dataset.activeValues = joined;
    host.dataset.selected = joined;
    if (core) {
      core.dataset.activeValues = joined;
      core.dataset.selected = joined;
    }
    if (utils.isTrue(host.dataset.itemOrder)) {
      const ordered = mergePreviewSelectionOrder(host, activeItems);
      host.dataset.selectedOrder = ordered.join(",");
      if (core) {
        core.dataset.selectedOrder = host.dataset.selectedOrder;
      }
    } else {
      delete host.dataset.selectedOrder;
      if (core && "selectedOrder" in core.dataset) {
        delete core.dataset.selectedOrder;
      }
    }
  };
  var attachPreviewContainerHandlers = (host, core) => {
    const target2 = host.querySelector(".container-content");
    if (!target2) {
      return;
    }
    host.addEventListener("mouseenter", () => {
      if (isPreviewContainerSearchable(host)) {
        previewHoveredContainer = host;
      }
    });
    host.addEventListener("mouseleave", () => {
      if (previewHoveredContainer === host) {
        previewHoveredContainer = null;
      }
    });
    if (!previewShiftWheelContainerTargets.has(target2)) {
      previewShiftWheelContainerTargets.add(target2);
      target2.addEventListener("wheel", (ev) => {
        if (String(host.dataset.selection || "single").toLowerCase() !== "multiple" || !utils.isTrue(host.dataset.pinontop) || !ev.shiftKey || !utils.isTrue(host.dataset.isEnabled)) {
          return;
        }
        const verticalDelta = ev.deltaY !== 0 ? ev.deltaY : ev.deltaX;
        if (verticalDelta === 0) {
          return;
        }
        target2.scrollTop += verticalDelta;
        ev.preventDefault();
      }, { passive: false });
    }
    const items = Array.from(target2.querySelectorAll(".container-item"));
    items.forEach((item) => {
      applyPreviewContainerItemStyle(host, item, item.classList.contains("active"));
      item.addEventListener("click", (ev) => {
        if (!utils.isTrue(host.dataset.isEnabled)) {
          ev.preventDefault();
          return;
        }
        if (item.dataset.disabled === "true" || item.classList.contains("container-item-disabled")) {
          ev.preventDefault();
          return;
        }
        const selectionMode = String(host.dataset.selection || "single").toLowerCase();
        const forcedSingle = selectionMode === "single-radio";
        const multiple = selectionMode === "multiple";
        let deferPinOnTop = false;
        if (multiple && ev instanceof MouseEvent && ev.shiftKey) {
          const all = Array.from(target2.querySelectorAll(".container-item"));
          const previous = previewLastSelectedContainerItem.get(host);
          const last = previous && previous.classList.contains("active") ? previous : null;
          const lastIndex = last ? all.indexOf(last) : -1;
          const currentIndex = all.indexOf(item);
          if (lastIndex !== -1 && currentIndex !== -1) {
            const [start2, end2] = lastIndex < currentIndex ? [lastIndex, currentIndex] : [currentIndex, lastIndex];
            const shouldActivate = !item.classList.contains("active");
            all.slice(start2, end2 + 1).forEach((candidate) => {
              if (candidate.dataset.disabled === "true" || candidate.classList.contains("container-item-disabled")) {
                candidate.classList.remove("active");
                applyPreviewContainerItemStyle(host, candidate, false);
                return;
              }
              candidate.classList.toggle("active", shouldActivate);
              applyPreviewContainerItemStyle(host, candidate, shouldActivate);
            });
          } else {
            deferPinOnTop = true;
            const shouldActivate = !item.classList.contains("active");
            item.classList.toggle("active", shouldActivate);
            applyPreviewContainerItemStyle(host, item, shouldActivate);
          }
        } else if (multiple) {
          const shouldActivate = !item.classList.contains("active");
          item.classList.toggle("active", shouldActivate);
          applyPreviewContainerItemStyle(host, item, shouldActivate);
        } else {
          const wasActive = item.classList.contains("active");
          target2.querySelectorAll(".container-item.active").forEach((other) => {
            if (other !== item || wasActive && !forcedSingle) {
              other.classList.remove("active");
              applyPreviewContainerItemStyle(host, other, false);
            }
          });
          if (!wasActive) {
            item.classList.add("active");
            applyPreviewContainerItemStyle(host, item, true);
          }
        }
        previewLastSelectedContainerItem.set(host, item.classList.contains("active") ? item : null);
        if (deferPinOnTop) {
          host.dataset.deferPinOnTop = "true";
        } else if ("deferPinOnTop" in host.dataset) {
          delete host.dataset.deferPinOnTop;
        }
        syncPreviewContainerSelection(host, target2, core);
        host.dispatchEvent(new Event("change", { bubbles: true }));
        renderutils.applyContainerItemFilter(host);
      });
    });
    syncPreviewContainerSelection(host, target2, core);
    renderutils.applyContainerItemFilter(host);
  };
  var clonePreviewDialog = (input) => {
    try {
      return JSON.parse(JSON.stringify(input));
    } catch {
      return input;
    }
  };
  var uniqueLocales = (dialog2) => {
    const out = [];
    const add = (value) => {
      const locale = String(value ?? "").trim();
      if (locale && !out.includes(locale)) {
        out.push(locale);
      }
    };
    add(dialog2.properties.language);
    add(dialog2.i18n?.baseLocale);
    Object.keys(dialog2.i18n?.locales || {}).forEach(add);
    return out;
  };
  var formatLocaleName = (locale) => {
    const normalized = String(locale || "").trim().replace(/_/g, "-");
    if (!normalized) {
      return locale;
    }
    const language = normalized.split("-")[0];
    try {
      if (typeof Intl !== "undefined" && typeof Intl.DisplayNames === "function") {
        const names = new Intl.DisplayNames([normalized], { type: "language" });
        const label = names.of(language);
        if (label) {
          return label.charAt(0).toLocaleUpperCase(normalized) + label.slice(1);
        }
      }
    } catch {
    }
    return locale;
  };
  var resolveTranslation = (baseDict, localeDict, element, prop) => {
    const ids = [
      String(element.id ?? "").trim()
    ].filter(Boolean);
    for (const id of ids) {
      const key = `elements.${id}.${prop}`;
      if (localeDict[key] !== void 0) return localeDict[key];
      if (baseDict[key] !== void 0) return baseDict[key];
    }
    return void 0;
  };
  var translateDelimitedItems = (baseDict, localeDict, element, raw) => {
    const ids = [
      String(element.id ?? "").trim()
    ].filter(Boolean);
    const values = String(raw ?? "").split(/[;,]/).map((item) => item.trim());
    if (!ids.length || !values.some(Boolean)) {
      return void 0;
    }
    let changed = false;
    const translated = values.map((value, index) => {
      for (const id of ids) {
        const key = `elements.${id}.items.${index}`;
        if (localeDict[key] !== void 0) {
          changed = true;
          return localeDict[key];
        }
        if (baseDict[key] !== void 0) {
          changed = true;
          return baseDict[key];
        }
      }
      return value;
    });
    return changed ? translated.join(", ") : void 0;
  };
  var localizePreviewDialog = (input, locale) => {
    const copy = clonePreviewDialog(input);
    const i18n = copy.i18n;
    if (!i18n?.locales) {
      return copy;
    }
    const baseLocale = String(i18n.baseLocale || copy.properties.language || "").trim();
    const baseDict = baseLocale && i18n.locales[baseLocale] || {};
    const localeDict = i18n.locales[locale] || baseDict;
    copy.properties.language = locale;
    const title = localeDict["dialog.title"] ?? baseDict["dialog.title"];
    if (title !== void 0) {
      copy.properties.title = title;
    }
    copy.elements = copy.elements.map((element) => {
      const next = { ...element };
      const type = String(next.type || "").trim();
      const label = resolveTranslation(baseDict, localeDict, next, "label");
      if (label !== void 0) {
        next.label = label;
      }
      const value = resolveTranslation(baseDict, localeDict, next, "value");
      if (value !== void 0) {
        if (type === "Select") {
          next.__localizedValue = value;
        } else {
          if (type === "Label") {
            next.__baseValue = next.value;
          }
          next.value = value;
        }
      }
      const itemText = translateDelimitedItems(baseDict, localeDict, next, next.items);
      if (itemText !== void 0) {
        next.items = itemText;
      }
      if (type === "Choice" && itemText === void 0) {
        const choiceValue = resolveTranslation(baseDict, localeDict, next, "items");
        if (choiceValue !== void 0) {
          next.items = choiceValue;
        }
      }
      return next;
    });
    return copy;
  };
  var createDialogMessageTranslator = (dialog2, locale) => {
    const i18n = dialog2.i18n;
    const baseLocale = String(i18n?.baseLocale || dialog2.properties.language || "").trim();
    const baseDict = baseLocale && i18n?.locales?.[baseLocale] || {};
    const localeDict = locale && i18n?.locales?.[locale] || baseDict;
    return (text) => {
      const translationKey = String(text ?? "");
      const translated = localeDict[translationKey] ?? baseDict[translationKey];
      if (translated !== void 0) {
        return translated;
      }
      const sourceKey = Object.keys(baseDict).find((key) => baseDict[key] === translationKey);
      if (sourceKey) {
        return localeDict[sourceKey] ?? baseDict[sourceKey] ?? translationKey;
      }
      return translationKey;
    };
  };
  var renderLanguageSwitcher = (root, dialog2) => {
    const locales = uniqueLocales(dialog2);
    if (locales.length <= 1) {
      return;
    }
    const hoverArea = document.createElement("div");
    hoverArea.className = "preview-language-hover-area";
    const panel = document.createElement("div");
    panel.className = "preview-language-panel";
    const select = document.createElement("select");
    select.className = "preview-language-select";
    select.setAttribute("aria-label", "Preview language");
    locales.forEach((locale) => {
      const option = document.createElement("option");
      option.value = locale;
      option.textContent = formatLocaleName(locale);
      select.appendChild(option);
    });
    select.value = locales.includes(activePreviewLocale) ? activePreviewLocale : locales[0];
    const applySelectedLocale = () => {
      if (!initialPreviewDialog) {
        return;
      }
      if (activePreviewLocale === select.value) {
        return;
      }
      activePreviewLocale = select.value;
      renderPreview(localizePreviewDialog(initialPreviewDialog, activePreviewLocale));
    };
    select.addEventListener("input", applySelectedLocale);
    select.addEventListener("change", applySelectedLocale);
    panel.appendChild(select);
    hoverArea.appendChild(panel);
    root.appendChild(hoverArea);
  };
  function resetPreview() {
    if (!initialPreviewDialog) {
      return;
    }
    renderPreview(localizePreviewDialog(initialPreviewDialog, activePreviewLocale));
  }
  function buildUI(canvas, dialog2) {
    const env = {
      findWrapper: (name) => renderutils.findWrapper(name, canvas),
      findRadioGroupMembers: (group) => renderutils.findRadioGroupMembers(group, canvas),
      updateElement: (el, props) => renderutils.updateElement(el, props),
      showRuntimeError: (msg) => renderutils.showRuntimeError(msg, canvas),
      logToEditor: (msg) => coms.sendTo("editorWindow", "consolog", msg),
      showDialogMessage: (type, message, detail) => coms.sendTo(
        "main",
        "showDialogMessage",
        type,
        message,
        detail
      ),
      callExternal: async (_name, _parameters) => void 0,
      translateMessage: createDialogMessageTranslator(dialog2, activePreviewLocale),
      openSyntaxPanel: (command) => coms.sendTo("main", "openSyntaxPanel", command),
      resetDialog: resetPreview,
      closeDialog: () => coms.sendTo("main", "close-previewWindow")
    };
    return createPreviewUI(env);
  }
  function renderPreview(dialog2) {
    closePreviewContainerSearch(false);
    previewHoveredContainer = null;
    const root = document.getElementById("preview-root");
    if (!root) return;
    const existingPanel = root.querySelector(".preview-syntax-panel");
    Array.from(root.children).forEach((child) => {
      if (child === existingPanel) {
        return;
      }
      child.remove();
    });
    if (initialPreviewDialog) {
      renderLanguageSwitcher(root, initialPreviewDialog);
    }
    const width = Number(dialog2.properties.width) || 640;
    const height = Number(dialog2.properties.height) || 480;
    const background = dialog2.properties.background || "#ffffff";
    root.style.width = `${width}px`;
    root.style.height = `${height}px`;
    try {
      const title = String(dialog2?.properties?.title || dialog2?.properties?.name || "Preview");
      if (title && typeof title === "string") {
        document.title = title;
      }
    } catch {
    }
    const canvas = document.createElement("div");
    canvas.className = "preview-canvas";
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.style.backgroundColor = String(background);
    const fs = Number(dialog2.properties.fontSize);
    if (Number.isFinite(fs) && fs > 0) {
      coms.fontSize = fs;
    }
    const created = [];
    window.__userHandlers?.forEach((fn2) => {
      fn2();
    });
    window.__userHandlers = [];
    const allElements = Array.from(dialog2.elements || []);
    for (const data of allElements) {
      const t = String(data?.type || "").trim();
      if (t === "Group") {
        continue;
      }
      const savedId = String(data?.id || "");
      const core = renderutils.makeElement({ ...data });
      const wrapper = document.createElement("div");
      wrapper.className = "element-wrapper";
      wrapper.style.position = "absolute";
      const desiredId = savedId || String(core.id);
      const desiredType = String(data.type || core.dataset.type || "").trim();
      const desiredNameId = String(data.nameid || core.dataset.nameid || "");
      const left2 = Number(data.left ?? core.dataset.left ?? 0);
      const top2 = Number(data.top ?? core.dataset.top ?? 0);
      wrapper.id = desiredId;
      wrapper.style.left = `${left2}px`;
      wrapper.style.top = `${top2}px`;
      wrapper.dataset.left = String(left2);
      wrapper.dataset.top = String(top2);
      wrapper.style.width = `${Number(data.width ?? core.clientWidth ?? 0)}px`;
      wrapper.style.height = `${Number(data.height ?? core.clientHeight ?? 0)}px`;
      if (desiredType) wrapper.dataset.type = desiredType;
      if (desiredNameId) wrapper.dataset.nameid = desiredNameId;
      try {
        const ds = core.dataset || {};
        Object.keys(ds).forEach((key) => {
          const val = ds[key];
          if (typeof val === "string") {
            wrapper.dataset[key] = val;
          }
        });
      } catch {
      }
      core.id = `${desiredId}-inner`;
      core.style.left = "0px";
      core.style.top = "0px";
      if (desiredType === "Button") core.style.position = "relative";
      if (desiredType === "Input" && core instanceof HTMLTextAreaElement) {
        core.style.width = "100%";
        core.style.height = "100%";
        core.style.minHeight = "100%";
        core.style.maxHeight = "100%";
      }
      try {
        if (desiredType === "Checkbox") {
          const custom = core.querySelector(".custom-checkbox");
          if (custom) custom.id = `checkbox-${desiredId}`;
        } else if (desiredType === "Radio") {
          const custom = core.querySelector(".custom-radio");
          if (custom) custom.id = `radio-${desiredId}`;
        } else if (desiredType === "Counter") {
          const display = core.querySelector(".counter-value");
          const inc = core.querySelector(".counter-arrow.up");
          const dec = core.querySelector(".counter-arrow.down");
          if (display) display.id = `counter-value-${desiredId}`;
          if (inc) inc.id = `counter-increase-${desiredId}`;
          if (dec) dec.id = `counter-decrease-${desiredId}`;
        } else if (desiredType === "Slider") {
          const handle = core.querySelector(".slider-handle");
          if (handle) {
            handle.id = `slider-handle-${desiredId}`;
            renderutils.updateHandleStyle(handle, {
              handleshape: String(data.handleshape ?? core.dataset.handleshape ?? "triangle"),
              direction: String(data.direction ?? core.dataset.direction ?? "horizontal"),
              handlesize: String(data.handlesize ?? core.dataset.handlesize ?? "8"),
              handleColor: String(data.handleColor ?? core.dataset.handleColor ?? "#558855"),
              handlepos: String(data.handlepos ?? core.dataset.handlepos ?? "50")
            });
          }
        }
      } catch {
      }
      const cover2 = core.querySelector(".elementcover");
      if (cover2 && cover2.parentElement) {
        cover2.parentElement.removeChild(cover2);
      }
      wrapper.appendChild(core);
      canvas.appendChild(wrapper);
      if (core instanceof HTMLTextAreaElement && desiredType === "Input") {
        requestAnimationFrame(() => renderutils.syncInputOverflow(core));
      }
      created.push(wrapper);
      const element = wrapper;
      if (desiredType === "Select") {
        const select = core instanceof HTMLSelectElement ? core : core.querySelector("select");
        if (select) {
          const raw = core.dataset.value ?? "";
          const text = String(raw);
          const tokens = text.split(/[;,]/).map((s) => s.trim()).filter((s) => s.length > 0);
          const localizedRaw = String(data.__localizedValue ?? "");
          const localizedTokens = localizedRaw ? localizedRaw.split(/[;,]/).map((s) => s.trim()).filter((s) => s.length > 0) : [];
          select.innerHTML = "";
          if (tokens.length === 0) {
            const opt = document.createElement("option");
            opt.value = "";
            opt.textContent = "";
            select.appendChild(opt);
          } else {
            tokens.forEach((t2, index) => {
              const opt = document.createElement("option");
              opt.value = t2;
              opt.textContent = localizedTokens[index] || t2;
              select.appendChild(opt);
            });
          }
        }
      }
      if (desiredType === "Label") {
        try {
          const baseValue = data.__baseValue;
          const align = String(data.align || core.dataset.align || "").toLowerCase();
          const valignRaw = String(data.valign || core.dataset.valign || "top").toLowerCase();
          const valign = valignRaw === "top" || valignRaw === "middle" || valignRaw === "bottom" ? valignRaw : "top";
          let anchoredFromBaseValue = false;
          let baseAnchorY = null;
          const translatedValue = core.dataset.value ?? "";
          if (baseValue !== void 0 && String(baseValue) !== String(translatedValue)) {
            core.dataset.value = String(baseValue ?? "");
            wrapper.dataset.value = String(baseValue ?? "");
            renderutils.updateLabel(wrapper);
            const baseTop = Number(wrapper.dataset.top ?? (parseInt(wrapper.style.top || "0", 10) || 0));
            const baseHeight = Math.ceil(wrapper.getBoundingClientRect().height || 0);
            if (baseHeight > 0) {
              if (valign === "top") {
                baseAnchorY = baseTop;
              } else if (valign === "bottom") {
                baseAnchorY = baseTop + baseHeight;
              } else {
                baseAnchorY = baseTop + baseHeight / 2;
              }
            }
            core.dataset.value = translatedValue;
            wrapper.dataset.value = translatedValue;
            anchoredFromBaseValue = align === "right" || align === "center" || baseAnchorY !== null;
          }
          renderutils.updateLabel(wrapper);
          if (baseAnchorY !== null) {
            const translatedHeight = Math.ceil(wrapper.getBoundingClientRect().height || 0);
            if (translatedHeight > 0) {
              const nextTop = valign === "bottom" ? Math.round(baseAnchorY - translatedHeight) : valign === "middle" ? Math.round(baseAnchorY - translatedHeight / 2) : Math.round(baseAnchorY);
              wrapper.style.top = `${nextTop}px`;
              wrapper.dataset.top = String(nextTop);
            }
          } else if (!anchoredFromBaseValue) {
            wrapper.style.left = `${left2}px`;
            wrapper.style.top = `${top2}px`;
            wrapper.dataset.left = String(left2);
            wrapper.dataset.top = String(top2);
          }
        } catch {
        }
      }
      if (desiredType === "Checkbox") {
        const custom = core.querySelector(".custom-checkbox");
        if (custom) {
          const checked = utils.isTrue(core.dataset.isChecked);
          custom.setAttribute("aria-checked", String(checked));
          custom.classList.toggle("checked", checked);
          custom.addEventListener("keydown", (e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.click();
            }
          });
        }
      }
      if (desiredType === "Radio") {
        const desiredGroup = String(core.dataset.group || "").trim();
        if (desiredGroup) {
          wrapper.dataset.group = desiredGroup;
        }
        const custom = core.querySelector(".custom-radio");
        const native = core.querySelector('input[type="radio"]');
        const syncState = (checked) => {
          const flag = checked ? "true" : "false";
          wrapper.dataset.isSelected = flag;
          custom?.setAttribute("aria-checked", flag);
          custom?.classList.toggle("selected", checked);
        };
        const ensureGroupConsistency = () => {
          const group = custom?.getAttribute("group") || native?.name || "";
          if (!group) return;
          document.querySelectorAll(`.custom-radio[group="${group}"]`).forEach((el) => {
            const node = el;
            if (node === custom) return;
            node.setAttribute("aria-checked", "false");
            node.classList.remove("selected");
            const host = node.closest(".element-wrapper");
            if (host) host.dataset.isSelected = "false";
          });
        };
        const selected = utils.isTrue(core.dataset.isSelected);
        if (native) {
          native.checked = selected;
        }
        syncState(selected);
        ensureGroupConsistency();
        if (custom) {
          custom.addEventListener("keydown", (e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              native?.click();
            }
          });
        }
        if (native) {
          native.addEventListener("change", () => {
            ensureGroupConsistency();
            syncState(native.checked);
          });
          native.addEventListener("click", () => {
          });
        }
      }
      if (desiredType === "Counter") {
        const display = core.querySelector(".counter-value");
        const inc = core.querySelector(".counter-arrow.up");
        const dec = core.querySelector(".counter-arrow.down");
        const rawMin = Number(core.dataset.minval ?? core.dataset.startval ?? 0);
        const min2 = Number.isFinite(rawMin) ? rawMin : 0;
        const rawMax = Number(core.dataset.maxval ?? min2);
        const max2 = Number.isFinite(rawMax) ? rawMax : min2;
        const getValue = () => Number(display?.textContent ?? min2);
        const setValue = (v) => {
          if (display) display.textContent = String(v);
        };
        inc?.addEventListener("click", () => {
          const curr = getValue();
          if (curr < max2) setValue(curr + 1);
        });
        dec?.addEventListener("click", () => {
          const curr = getValue();
          if (curr > min2) setValue(curr - 1);
        });
      }
      if (desiredType === "Button") {
        const doPress = () => core.classList.add("btn-active");
        const clearPress = () => core.classList.remove("btn-active");
        core.addEventListener("mousedown", doPress);
        core.addEventListener("mouseup", clearPress);
        core.addEventListener("mouseleave", clearPress);
      }
      if (desiredType === "Slider") {
        const handle = core.querySelector(".slider-handle");
        if (!handle) continue;
        let dragging = false;
        const direction = (core.dataset.direction || "horizontal").toLowerCase();
        const onMove = (ev) => {
          if (!dragging) return;
          const rect = core.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) return;
          let percent = 0;
          if (direction === "vertical") {
            const relY = ev.clientY - rect.top;
            const clamped = Math.max(0, Math.min(rect.height, relY));
            percent = Math.round(100 - clamped / rect.height * 100);
          } else {
            const relX = ev.clientX - rect.left;
            const clamped = Math.max(0, Math.min(rect.width, relX));
            percent = Math.round(clamped / rect.width * 100);
          }
          wrapper.dataset.handlepos = String(percent);
          renderutils.updateHandleStyle(handle, {
            handleshape: core.dataset.handleshape || "triangle",
            direction: core.dataset.direction || "horizontal",
            handlesize: core.dataset.handlesize || "8",
            handleColor: core.dataset.handleColor || "#558855",
            handlepos: String(percent)
          });
        };
        const onUp = () => {
          dragging = false;
          document.removeEventListener("mousemove", onMove);
          document.removeEventListener("mouseup", onUp);
        };
        handle.addEventListener("mousedown", (ev) => {
          if (core.classList.contains("disabled-div") || !utils.isTrue(data.isEnabled)) return;
          dragging = true;
          document.addEventListener("mousemove", onMove);
          document.addEventListener("mouseup", onUp);
          ev.preventDefault();
        });
      }
      if (desiredType === "Container") {
        attachPreviewContainerHandlers(wrapper, core);
      }
      if (!utils.isTrue(data.isVisible)) {
        wrapper.style.display = "none";
      }
      if (!utils.isTrue(data.isEnabled)) {
        renderutils.updateElement(wrapper, { isEnabled: "false" });
      }
    }
    try {
      const groups = (allElements || []).filter((e) => String(e?.type || "").trim() === "Group");
      for (const g of groups) {
        const elementIds = Array.isArray(g.elementIds) ? g.elementIds : String(g.elementIds || "").split(",").map((s) => s.trim()).filter((s) => s.length > 0);
        if (!elementIds.length) continue;
        const gl = Number(g.left ?? 0);
        const gt = Number(g.top ?? 0);
        const gid = String(g.id || `group-${Date.now()}-${Math.random().toString(36).slice(2)}`);
        const gname = String(g.nameid || "").trim();
        const group = document.createElement("div");
        group.id = gid;
        group.className = "element-group";
        group.style.position = "absolute";
        group.style.left = `${gl}px`;
        group.style.top = `${gt}px`;
        group.dataset.type = "Group";
        if (gname) group.dataset.nameid = gname;
        group.dataset.left = String(gl);
        group.dataset.top = String(gt);
        let moved = 0;
        elementIds.forEach((cid) => {
          let child = canvas.querySelector(`[id="${cid}"]`);
          if (!child) {
            const inner = canvas.querySelector(`[id="${cid}-inner"]`);
            if (inner) child = inner.closest(".element-wrapper");
          }
          if (!child) return;
          const absLeft = Number(child.dataset.left ?? (parseInt(child.style.left || "0", 10) || 0));
          const absTop = Number(child.dataset.top ?? (parseInt(child.style.top || "0", 10) || 0));
          const relLeft = absLeft - gl;
          const relTop = absTop - gt;
          child.style.left = `${relLeft}px`;
          child.style.top = `${relTop}px`;
          child.dataset.left = String(relLeft);
          child.dataset.top = String(relTop);
          group.appendChild(child);
          moved++;
        });
        try {
          const bounds = renderutils.computeBounds(elementIds);
          if (bounds) {
            group.style.width = `${bounds.width}px`;
            group.style.height = `${bounds.height}px`;
          }
        } catch {
        }
        canvas.appendChild(group);
      }
    } catch {
    }
    created.forEach((el) => {
      const type = String(el.dataset?.type || "").toLowerCase();
      if (type === "checkbox") {
        const custom = el.querySelector(".custom-checkbox");
        custom?.addEventListener("click", () => {
          const now = custom?.getAttribute("aria-checked") === "true";
          el.dataset.isChecked = String(now);
          el.dispatchEvent(new Event("change", { bubbles: true }));
        });
      } else if (type === "radio") {
        const native = el.querySelector('input[type="radio"]');
        if (native) {
          native.addEventListener("change", () => {
            el.dataset.isSelected = String(native.checked);
            el.dispatchEvent(new Event("change", { bubbles: true }));
          });
        }
      } else if (type === "select") {
        if (el instanceof HTMLSelectElement) {
          el.addEventListener("change", () => {
            el.dataset.value = String(el.value || "");
          });
        } else {
          const sel = el.querySelector("select");
          sel?.addEventListener("change", () => {
            el.dataset.value = String(sel.value || "");
          });
        }
      } else if (type === "input") {
        const input = el.querySelector("textarea");
        if (input) {
          const normalizeValue = () => input.value.replace(/\r?\n+/g, " ");
          let focusValue = input.value;
          input.addEventListener("focus", () => {
            focusValue = normalizeValue();
          });
          input.addEventListener("input", () => {
            const normalized = normalizeValue();
            if (normalized !== input.value) {
              input.value = normalized;
            }
            el.dataset.value = normalized;
            renderutils.syncInputOverflow(input);
          });
          input.addEventListener("change", () => {
            const normalized = normalizeValue();
            if (normalized !== input.value) {
              input.value = normalized;
            }
            el.dataset.value = normalized;
            focusValue = normalized;
            renderutils.syncInputOverflow(input);
          });
          input.addEventListener("keydown", (ev) => {
            if (ev.key !== "Enter" || ev.isComposing) {
              return;
            }
            ev.preventDefault();
            ev.stopPropagation();
            const normalized = normalizeValue();
            if (normalized !== input.value) {
              input.value = normalized;
            }
            el.dataset.value = normalized;
            focusValue = normalized;
            renderutils.syncInputOverflow(input);
            input.blur();
          });
        }
      } else if (type === "counter") {
        const display = document.querySelector(`#counter-value-${el.id}`);
        const inc = document.querySelector(`#counter-increase-${el.id}`);
        const dec = document.querySelector(`#counter-decrease-${el.id}`);
        const sync = () => {
          el.dataset.startval = String(Number(display?.textContent || el.dataset.startval || 0));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        };
        inc?.addEventListener("click", sync);
        dec?.addEventListener("click", sync);
      } else if (type === "slider") {
        const handle = el.querySelector(".slider-handle");
        const onUp = () => {
          el.dataset.handlepos = String(el.dataset.handlepos || "50");
        };
        handle?.addEventListener("mouseup", onUp);
      }
    });
    document.addEventListener("keydown", (ev) => {
      const key = ev.key || ev.code;
      const lowerKey = String(key || "").toLowerCase();
      if ((ev.metaKey || ev.ctrlKey) && lowerKey === "f") {
        ev.preventDefault();
        ev.stopPropagation();
        if (previewHoveredContainer) {
          openPreviewContainerSearch(previewHoveredContainer);
          return;
        }
        if (previewSearchContainer) {
          openPreviewContainerSearch(previewSearchContainer);
        }
        return;
      }
      if (key === "Escape" || key === "Esc") {
        if (previewSearchContainer) {
          closePreviewContainerSearch(true);
          ev.preventDefault();
          ev.stopPropagation();
          return;
        }
        Array.from(document.querySelectorAll(".color-popover")).forEach((el) => {
          el.style.display = "none";
        });
        const overlay = document.querySelector(".preview-canvas .customjs-error");
        if (overlay && overlay.parentElement) {
          overlay.parentElement.removeChild(overlay);
          ev.preventDefault();
          ev.stopPropagation();
          return;
        }
        coms.sendTo("main", "close-previewWindow");
        ev.preventDefault();
        ev.stopPropagation();
      }
    }, true);
    if (existingPanel) {
      root.insertBefore(canvas, existingPanel);
    } else {
      root.appendChild(canvas);
    }
    canvas.querySelectorAll('.element-wrapper[data-type="Label"]').forEach((wrapper) => {
      const baseValue = wrapper.dataset.__baseValue;
      const translatedValue = wrapper.dataset.value ?? "";
      if (baseValue === void 0 || String(baseValue) === String(translatedValue)) {
        return;
      }
      const core = wrapper.firstElementChild;
      if (!core) {
        return;
      }
      const originalLeft = Number(wrapper.dataset.left ?? (parseInt(wrapper.style.left || "0", 10) || 0));
      const originalTop = Number(wrapper.dataset.top ?? (parseInt(wrapper.style.top || "0", 10) || 0));
      core.dataset.value = String(baseValue ?? "");
      wrapper.dataset.value = String(baseValue ?? "");
      renderutils.updateLabel(wrapper);
      const baseTop = Number(wrapper.dataset.top ?? (parseInt(wrapper.style.top || "0", 10) || 0));
      const baseHeight = Math.ceil(wrapper.getBoundingClientRect().height || 0);
      core.dataset.value = translatedValue;
      wrapper.dataset.value = translatedValue;
      renderutils.updateLabel(wrapper);
      const translatedHeight = Math.ceil(wrapper.getBoundingClientRect().height || 0);
      if (baseHeight > 0 && translatedHeight > 0) {
        const centeredTop = Math.round(baseTop + baseHeight / 2 - translatedHeight / 2);
        wrapper.style.top = `${centeredTop}px`;
        wrapper.dataset.top = String(centeredTop);
        return;
      }
      wrapper.style.left = `${originalLeft}px`;
      wrapper.style.top = `${originalTop}px`;
      wrapper.dataset.left = String(originalLeft);
      wrapper.dataset.top = String(originalTop);
    });
    try {
      const rawTop = dialog2?.customJS;
      const code = String(typeof rawTop === "string" && rawTop.length ? rawTop : "");
      if (code && code.trim().length) {
        const ui = buildUI(canvas, dialog2);
        renderutils.exposeNameGlobals(canvas);
        renderutils.exposeEventNameGlobals();
        const exports = {};
        const preludeList = API_NAMES.join(", ");
        const elementsWithName = Array.from(canvas.querySelectorAll("[data-nameid]"));
        const nameIds = Array.from(new Set(
          elementsWithName.map((el) => String(el.dataset?.nameid || "").trim()).filter((n) => n && utils.isIdentifier(n))
        ));
        const groupNamesSet = /* @__PURE__ */ new Set();
        const customRadios = Array.from(canvas.querySelectorAll(".custom-radio[group]"));
        customRadios.forEach((node) => {
          const g = (node.getAttribute("group") || "").trim();
          if (g) groupNamesSet.add(g);
        });
        const wrappers = Array.from(canvas.querySelectorAll(".element-wrapper[data-group]"));
        wrappers.forEach((w) => {
          const t = String(w.dataset?.type || "").trim();
          if (t !== "Radio") return;
          const g = (w.dataset.group || "").trim();
          if (g) groupNamesSet.add(g);
        });
        const groupNames = Array.from(groupNamesSet).filter((n) => n && utils.isIdentifier(n));
        const allBareNames = Array.from(/* @__PURE__ */ new Set([...nameIds, ...groupNames]));
        const namePrelude = allBareNames.map((n) => `const ${n} = ${JSON.stringify(n)};`).join("\n");
        const runtimeProvider = String(dialog2?.properties?.runtimeProvider ?? "R").trim() || "R";
        const bindings = `const { ${preludeList} } = ui;
const log = ui.log.bind(ui);
const runtimeProvider = ${JSON.stringify(runtimeProvider)};
${namePrelude}`;
        let fn2 = null;
        try {
          fn2 = new Function("ui", "exports", bindings + "\n" + code);
        } catch (e) {
          const msg = `Code syntax error: ${String(e && e.message ? e.message : e)}`;
          coms.sendTo("editorWindow", "consolog", msg);
        }
        if (fn2) {
          try {
            fn2(ui, exports);
          } catch (e) {
            const msg = `Action code runtime error: ${String(e && e.message ? e.message : e)}`;
            const overlay = document.createElement("div");
            overlay.className = "customjs-error";
            overlay.textContent = msg;
            canvas.appendChild(overlay);
          }
        }
        if (fn2 && typeof exports.init === "function") {
          try {
            exports.init(ui);
          } catch {
          }
        }
        window.__userHandlers.push(() => {
          try {
            if (typeof exports.dispose === "function") exports.dispose(ui);
          } finally {
            ui.__disposeAll?.();
          }
        });
      } else {
        coms.sendTo("editorWindow", "consolog", "Preview: no customJS to execute (post-render).");
      }
    } catch {
    }
  }
  var bootPreviewController = function(transport3) {
    setRendererTransport(transport3);
    coms.on("reload-css", () => {
      try {
        const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        const ts = Date.now();
        links.forEach((link) => {
          try {
            const base = link.href.split("?")[0];
            link.href = `${base}?v=${ts}`;
          } catch {
          }
        });
      } catch {
      }
    });
    window.addEventListener("DOMContentLoaded", () => {
      coms.on("renderPreview", (data) => {
        try {
          const payload = typeof data === "string" ? JSON.parse(data) : data;
          initialPreviewDialog = clonePreviewDialog(payload);
          const locales = uniqueLocales(initialPreviewDialog);
          activePreviewLocale = locales.includes(String(initialPreviewDialog.properties.language ?? "")) ? String(initialPreviewDialog.properties.language ?? "") : locales[0] || "";
          renderPreview(localizePreviewDialog(initialPreviewDialog, activePreviewLocale));
        } catch (e) {
          coms.sendTo(
            "editorWindow",
            "consolog",
            `Failed to parse preview data: ${String(utils.isRecord(e) && e.message ? e.message : e)}`
          );
        }
      });
    });
  };
  var renderPreviewDialog = function(data) {
    try {
      const payload = typeof data === "string" ? JSON.parse(data) : data;
      initialPreviewDialog = clonePreviewDialog(payload);
      const locales = uniqueLocales(initialPreviewDialog);
      activePreviewLocale = locales.includes(String(initialPreviewDialog.properties.language ?? "")) ? String(initialPreviewDialog.properties.language ?? "") : locales[0] || "";
      renderPreview(localizePreviewDialog(initialPreviewDialog, activePreviewLocale));
    } catch (e) {
      coms.sendTo(
        "editorWindow",
        "consolog",
        `Failed to parse preview data: ${String(utils.isRecord(e) && e.message ? e.message : e)}`
      );
    }
  };

  // src/shell-web/browserRendererTransport.ts
  function createBrowserRendererTransport() {
    const listeners = /* @__PURE__ */ new Map();
    const on = function(channel, listener) {
      const channelListeners = listeners.get(channel) || [];
      channelListeners.push(listener);
      listeners.set(channel, channelListeners);
    };
    const emit = function(channel, ...args) {
      for (const listener of listeners.get(channel) || []) {
        listener(...args);
      }
    };
    return {
      send(channel, ...args) {
        emit(channel, ...args);
      },
      on,
      emit
    };
  }

  // src/shell-web/browserPreview.ts
  var transport2 = createBrowserRendererTransport();
  function recordBrowserPreviewEvent(event) {
    const target2 = window;
    const events = target2.dialogCreatorPreviewEvents || [];
    events.push(event);
    target2.dialogCreatorPreviewEvents = events;
  }
  function focusPreviewRoot() {
    const root = document.getElementById("preview-root");
    if (!root) {
      return;
    }
    root.tabIndex = -1;
    root.focus({ preventScroll: true });
  }
  transport2.on("send-to", (windowName, channel, ...args) => {
    if (windowName === "editorWindow" && channel === "consolog") {
      recordBrowserPreviewEvent({ type: "log", message: String(args[0] || "") });
      return;
    }
    if (windowName === "main" && channel === "showDialogMessage") {
      recordBrowserPreviewEvent({
        type: "message",
        level: String(args[0] || ""),
        message: String(args[1] || ""),
        detail: String(args[2] || "")
      });
      return;
    }
    if (windowName === "main" && channel === "openSyntaxPanel") {
      recordBrowserPreviewEvent({ type: "syntax-panel", command: String(args[0] || "") });
      return;
    }
    if (windowName === "main" && channel === "close-previewWindow") {
      recordBrowserPreviewEvent({ type: "close-requested" });
    }
  });
  var target = window;
  target.dialogCreatorPreviewTransport = transport2;
  target.renderDialogCreatorPreview = renderPreviewDialog;
  window.addEventListener("message", (event) => {
    const message = event.data;
    if (message?.type === "dialogcreator-preview-render") {
      renderPreviewDialog(message.data);
      focusPreviewRoot();
      window.parent?.postMessage({
        type: "dialogcreator-panel-payload-applied",
        requestId: String(message.requestId || "")
      }, "*");
    }
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      window.parent?.postMessage({ type: "dialogcreator-close-browser-panel" }, "*");
    }
  }, true);
  bootPreviewController(transport2);
})();
/*! Bundled license information:

sortablejs/Sortable.min.js:
  (*! Sortable 1.15.7 - MIT | git://github.com/SortableJS/Sortable.git *)
*/
//# sourceMappingURL=browserPreview.js.map
