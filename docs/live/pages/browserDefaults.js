"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
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
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
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
  var init_datasets = __esm({
    "src/library/datasets.ts"() {
      "use strict";
    }
  });

  // src/library/api.ts
  var EVENT_LIST, EVENT_NAMES, API_NAMES, NEUTRAL_NAMES, ELEMENT_FIRST_ARG_CALLS;
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
    }
  });

  // node_modules/uuid/dist/stringify.js
  function unsafeStringify(arr, offset = 0) {
    return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
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
  function v4(options, buf, offset) {
    if (!buf && !options && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return _v4(options, buf, offset);
  }
  function _v4(options, buf, offset) {
    options = options || {};
    const rnds = options.random ?? options.rng?.() ?? rng();
    if (rnds.length < 16) {
      throw new Error("Random bytes length must be >= 16");
    }
    rnds[6] = rnds[6] & 15 | 64;
    rnds[8] = rnds[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      if (offset < 0 || offset + 16 > buf.length) {
        throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
      }
      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = rnds[i];
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
  function applySelection(order, opts = {}) {
    const seen = /* @__PURE__ */ new Set();
    const filtered = [];
    for (const id of order) {
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
  function getDragTargetSize(target) {
    const datasetWidth = utils.asNumeric(target.dataset.width ?? "");
    const datasetHeight = utils.asNumeric(target.dataset.height ?? "");
    const styleWidth = utils.asNumeric(target.style.width || "");
    const styleHeight = utils.asNumeric(target.style.height || "");
    const rect = target.getBoundingClientRect();
    const width = Math.round(
      datasetWidth || styleWidth || target.offsetWidth || rect.width || 0
    );
    const height = Math.round(
      datasetHeight || styleHeight || target.offsetHeight || rect.height || 0
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
            const target = event.target;
            const clickedCanvas = !!target && target.id === dialog.id;
            const clickedOuterDialog = !!target && allowOuterDialog && target.id === "dialog";
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
            const left = Math.min(currX, lassoStart.x);
            const top = Math.min(currY, lassoStart.y);
            const width = Math.abs(currX - lassoStart.x);
            const height = Math.abs(currY - lassoStart.y);
            lassoDiv.style.left = left + "px";
            lassoDiv.style.top = top + "px";
            lassoDiv.style.width = width + "px";
            lassoDiv.style.height = height + "px";
          });
          const endLasso = (event) => {
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
            const left2 = utils.asNumeric(leftRaw2) || parseInt(String(leftRaw2).replace(/px$/, ""), 10) || child.offsetLeft;
            const top2 = utils.asNumeric(topRaw2) || parseInt(String(topRaw2).replace(/px$/, ""), 10) || child.offsetTop;
            copy2.left = left2;
            copy2.top = top2;
            const constructed2 = renderutils.makeElement({ ...template2, ...copy2 });
            const wrapper2 = document.createElement("div");
            wrapper2.classList.add("element-wrapper");
            wrapper2.style.position = "absolute";
            const origId2 = constructed2.id;
            wrapper2.id = origId2;
            constructed2.id = `${origId2}-inner`;
            wrapper2.style.left = `${left2}px`;
            wrapper2.style.top = `${top2}px`;
            wrapper2.dataset.left = String(left2);
            wrapper2.dataset.top = String(top2);
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
          const left = utils.asNumeric(leftRaw) || parseInt(String(leftRaw).replace(/px$/, ""), 10) || source.offsetLeft;
          const top = utils.asNumeric(topRaw) || parseInt(String(topRaw).replace(/px$/, ""), 10) || source.offsetTop;
          copy.left = left;
          copy.top = top;
          const constructed = renderutils.makeElement({ ...template, ...copy });
          const wrapper = document.createElement("div");
          wrapper.classList.add("element-wrapper");
          wrapper.style.position = "absolute";
          const origId = constructed.id;
          wrapper.id = origId;
          constructed.id = `${origId}-inner`;
          wrapper.style.left = `${left}px`;
          wrapper.style.top = `${top}px`;
          wrapper.dataset.left = String(left);
          wrapper.dataset.top = String(top);
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
            const target = isGroupContainer ? element : groupAncestor || element;
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
                if (target.classList.contains("element-group")) {
                  next = next.filter((id) => {
                    const node = dialog.getElement(id);
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
          let top = 0;
          let left = 0;
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
            top = Math.round(top);
            left = Math.round(left);
            dragTarget.style.left = left + "px";
            dragTarget.style.top = top + "px";
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
                  if (top < 10 + size * 0.25) {
                    top = 10 + size * 0.25;
                  }
                }
                dragTarget.style.top = top + "px";
                dragTarget.dataset.left = String(left);
                dragTarget.dataset.top = String(top);
                dialog.updateElementProperties(
                  dragTarget.id,
                  {
                    top: String(top),
                    left: String(left)
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
            const div = document.createElement("div");
            div.className = "mt-1_5";
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
            div.appendChild(button);
            elementsList.appendChild(div);
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
              const left = Number(element.left ?? (parseInt(core.style.left || "0", 10) || 0));
              const top = Number(element.top ?? (parseInt(core.style.top || "0", 10) || 0));
              wrapper.style.left = `${left}px`;
              wrapper.style.top = `${top}px`;
              loadedElementPositions.set(wrapper.id, { left, top });
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
  var Sortable, __uniformSchema, enhancedButtons, handlerModules, KNOWN_CONTAINER_ITEM_TYPES, previewWindow, normalizeContainerItemType, resolveContainerItemType, syncInputOverflow, splitList, normalizeOrderList, ELEMENT_ICON_ALIASES, normalizeElementIcon, resolveElementIconSize, normalizeLabelVAlign, resolveElementTemplate, ensureElementTextNode, ensureElementIconNode, syncElementPresentation, mergeSelectionOrder, reorderContainerItemsForPinOnTop, getDisabledColor, parseCssColor, blendCssColors, applyEditorContainerSampleState, applyControlDisabledAppearance, applyCounterDisabledAppearance, applyContainerItemFilter, SORTER_STATE_KEY, normalizeChoiceOrdering, normalizeChoiceOrientation, normalizeChoiceSelection, preferredSorterState, coerceSorterItemsForSelection, normalizeSorterItemsForMode, buildSorterSampleState, splitSorterValues, parseSorterState, stringifySorterState, normalizeSorterItems, cycleSorterState, applySorterStateClasses, updateSorterDataset, CSS_ESCAPE, renderutils;
  var init_renderutils = __esm({
    "src/library/renderutils.ts"() {
      "use strict";
      init_utils();
      init_dialog();
      init_elements();
      init_coms();
      init_api();
      init_dist();
      Sortable = require_Sortable_min();
      __uniformSchema = null;
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
        decorated.sort((left, right) => {
          if (!pinOnTop) {
            return left.baseOrder - right.baseOrder;
          }
          if (left.active !== right.active) {
            return left.active ? -1 : 1;
          }
          if (!left.active) {
            return left.baseOrder - right.baseOrder;
          }
          const leftPinned = pinnedIndex.get(left.value);
          const rightPinned = pinnedIndex.get(right.value);
          if (leftPinned !== void 0 || rightPinned !== void 0) {
            if (leftPinned === void 0) return 1;
            if (rightPinned === void 0) return -1;
            if (leftPinned !== rightPinned) return leftPinned - rightPinned;
          }
          return left.baseOrder - right.baseOrder;
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
        const order = items.map((it) => it.text).join(",");
        const selected = items.filter((it) => it.state !== "off").map((it) => `${it.text}:${it.state}`);
        const joinedSelected = selected.join(",");
        const targets = /* @__PURE__ */ new Set();
        targets.add(host);
        const wrapper = host.classList.contains("element-wrapper") ? host : host.closest(".element-wrapper");
        if (wrapper) {
          targets.add(wrapper);
        }
        targets.forEach((node) => {
          node.dataset.items = order;
          node.dataset.order = order;
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
          let max = 0;
          for (const id of existingIds) {
            if (typeof id !== "string") continue;
            if (!id.startsWith(base)) continue;
            const suffix = id.slice(base.length);
            if (/^\d+$/.test(suffix)) {
              const n = Number(suffix);
              if (Number.isFinite(n) && n > max) max = n;
            }
          }
          const next = max + 1;
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
            const min = Number.isFinite(rawMin) ? rawMin : 0;
            const max = Number.isFinite(rawMax) ? rawMax : Math.max(min, Number.isFinite(rawStart) ? rawStart : min);
            const start = Number.isFinite(rawStart) ? rawStart : min;
            const initial = Math.min(Math.max(start, min), max);
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
            element.dataset.minval = String(min);
            element.dataset.maxval = String(max);
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
                    arrows.forEach((arrow) => {
                      arrow.style.pointerEvents = enabled ? "" : "none";
                      if (!enabled) {
                        arrow.classList.add("disabled");
                      } else {
                        arrow.classList.remove("disabled");
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
            const order = items.map((it) => it.text).join(",");
            datasetSource.dataset.items = order;
            datasetSource.dataset.order = order;
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
                const order = rows.map((r) => String(r.dataset.text || "").trim()).filter(Boolean);
                if (order.length === items.length) {
                  const map = new Map(items.map((it) => [it.text, it]));
                  const next = order.map((t) => map.get(t)).filter(Boolean);
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
            const left = Number(element.dataset.left ?? (parseInt(element.style.left || "0", 10) || 0));
            const top = Number(element.dataset.top ?? (parseInt(element.style.top || "0", 10) || 0));
            let newleft = left;
            let newtop = top;
            if (left < 10) {
              newleft = 10;
            }
            if (newleft + finalBoxW + 10 > dialogW) {
              newleft = Math.max(10, Math.round(dialogW - finalBoxW - 10));
            }
            if (top < 10) {
              newtop = 10;
            }
            if (newtop + finalBoxH + 10 > dialogH) {
              newtop = Math.max(10, Math.round(dialogH - finalBoxH - 10));
            }
            if (newleft !== left) {
              element.style.left = newleft + "px";
              element.dataset.left = String(newleft);
              if (elleft) elleft.value = String(newleft);
            }
            if (newtop !== top) {
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
            const left = Math.floor(baseLeft);
            const top = Math.floor(baseTop);
            const width = Math.round(maxRight - minLeft);
            const height = Math.round(maxBottom - minTop);
            const groupTemplate = elements.groupElement;
            const groupEl = renderutils.makeElement({ ...groupTemplate, left, top });
            groupEl.dataset.type = "Group";
            groupEl.classList.add("element-group");
            groupEl.style.width = width + "px";
            groupEl.style.height = height + "px";
            if (persistent) {
              groupEl.dataset.persistent = "true";
            }
            if (!groupEl.dataset.nameid || !groupEl.dataset.nameid.trim()) {
              const unique = renderutils.makeUniqueNameID("group");
              groupEl.dataset.nameid = unique;
            }
            dialog.canvas.appendChild(groupEl);
            for (let idx = 0; idx < els.length; idx++) {
              const child = els[idx];
              const childRect = rects[idx];
              const childAbsLeft = childRect.left - canvasRect.left;
              const childAbsTop = childRect.top - canvasRect.top;
              const newLeft = Math.round(childAbsLeft) - left - 1;
              const newTop = Math.round(childAbsTop) - top - 1;
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
          const { left, top, width, height } = bounds;
          let outline = outlineEl;
          if (!outline) {
            outline = document.createElement("div");
            outline.className = "multi-outline";
            canvas.appendChild(outline);
          }
          outline.style.left = left + "px";
          outline.style.top = top + "px";
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
            const left2 = parseAxis(el, "left");
            const top2 = parseAxis(el, "top");
            const width2 = el.offsetWidth;
            const height2 = el.offsetHeight;
            const right = left2 + width2;
            const bottom = top2 + height2;
            if (left2 < minLeft) minLeft = left2;
            if (top2 < minTop) minTop = top2;
            if (right > maxRight) maxRight = right;
            if (bottom > maxBottom) maxBottom = bottom;
          }
          const left = Math.round(minLeft);
          const top = Math.round(minTop);
          const width = Math.round(maxRight - minLeft);
          const height = Math.round(maxBottom - minTop);
          return { left, top, width, height };
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

  // node_modules/@jaames/iro/dist/iro.js
  var require_iro = __commonJS({
    "node_modules/@jaames/iro/dist/iro.js"(exports, module) {
      (function(global, factory) {
        typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = global || self, global.iro = factory());
      })(exports, function() {
        "use strict";
        var n, u, t, i, r, o, f = {}, e = [], c = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|^--/i;
        function s(n2, l) {
          for (var u2 in l) {
            n2[u2] = l[u2];
          }
          return n2;
        }
        function a(n2) {
          var l = n2.parentNode;
          l && l.removeChild(n2);
        }
        function h(n2, l, u2) {
          var t2, i2, r2, o2, f2 = arguments;
          if (l = s({}, l), arguments.length > 3) {
            for (u2 = [u2], t2 = 3; t2 < arguments.length; t2++) {
              u2.push(f2[t2]);
            }
          }
          if (null != u2 && (l.children = u2), null != n2 && null != n2.defaultProps) {
            for (i2 in n2.defaultProps) {
              void 0 === l[i2] && (l[i2] = n2.defaultProps[i2]);
            }
          }
          return o2 = l.key, null != (r2 = l.ref) && delete l.ref, null != o2 && delete l.key, v(n2, l, o2, r2);
        }
        function v(l, u2, t2, i2) {
          var r2 = { type: l, props: u2, key: t2, ref: i2, __k: null, __p: null, __b: 0, __e: null, l: null, __c: null, constructor: void 0 };
          return n.vnode && n.vnode(r2), r2;
        }
        function d(n2) {
          return n2.children;
        }
        function y(n2) {
          if (null == n2 || "boolean" == typeof n2) {
            return null;
          }
          if ("string" == typeof n2 || "number" == typeof n2) {
            return v(null, n2, null, null);
          }
          if (null != n2.__e || null != n2.__c) {
            var l = v(n2.type, n2.props, n2.key, null);
            return l.__e = n2.__e, l;
          }
          return n2;
        }
        function m(n2, l) {
          this.props = n2, this.context = l;
        }
        function w(n2, l) {
          if (null == l) {
            return n2.__p ? w(n2.__p, n2.__p.__k.indexOf(n2) + 1) : null;
          }
          for (var u2; l < n2.__k.length; l++) {
            if (null != (u2 = n2.__k[l]) && null != u2.__e) {
              return u2.__e;
            }
          }
          return "function" == typeof n2.type ? w(n2) : null;
        }
        function g(n2) {
          var l, u2;
          if (null != (n2 = n2.__p) && null != n2.__c) {
            for (n2.__e = n2.__c.base = null, l = 0; l < n2.__k.length; l++) {
              if (null != (u2 = n2.__k[l]) && null != u2.__e) {
                n2.__e = n2.__c.base = u2.__e;
                break;
              }
            }
            return g(n2);
          }
        }
        function k(l) {
          (!l.__d && (l.__d = true) && 1 === u.push(l) || i !== n.debounceRendering) && (i = n.debounceRendering, (n.debounceRendering || t)(_));
        }
        function _() {
          var n2, l, t2, i2, r2, o2, f2, e2;
          for (u.sort(function(n3, l2) {
            return l2.__v.__b - n3.__v.__b;
          }); n2 = u.pop(); ) {
            n2.__d && (t2 = void 0, i2 = void 0, o2 = (r2 = (l = n2).__v).__e, f2 = l.__P, e2 = l.u, l.u = false, f2 && (t2 = [], i2 = $(f2, r2, s({}, r2), l.__n, void 0 !== f2.ownerSVGElement, null, t2, e2, null == o2 ? w(r2) : o2), j(t2, r2), i2 != o2 && g(r2)));
          }
        }
        function b(n2, l, u2, t2, i2, r2, o2, c2, s2) {
          var h2, v2, p, d2, y2, m2, g2, k2 = u2 && u2.__k || e, _2 = k2.length;
          if (c2 == f && (c2 = null != r2 ? r2[0] : _2 ? w(u2, 0) : null), h2 = 0, l.__k = x(l.__k, function(u3) {
            if (null != u3) {
              if (u3.__p = l, u3.__b = l.__b + 1, null === (p = k2[h2]) || p && u3.key == p.key && u3.type === p.type) {
                k2[h2] = void 0;
              } else {
                for (v2 = 0; v2 < _2; v2++) {
                  if ((p = k2[v2]) && u3.key == p.key && u3.type === p.type) {
                    k2[v2] = void 0;
                    break;
                  }
                  p = null;
                }
              }
              if (d2 = $(n2, u3, p = p || f, t2, i2, r2, o2, null, c2, s2), (v2 = u3.ref) && p.ref != v2 && (g2 || (g2 = [])).push(v2, u3.__c || d2, u3), null != d2) {
                if (null == m2 && (m2 = d2), null != u3.l) {
                  d2 = u3.l, u3.l = null;
                } else if (r2 == p || d2 != c2 || null == d2.parentNode) {
                  n: if (null == c2 || c2.parentNode !== n2) {
                    n2.appendChild(d2);
                  } else {
                    for (y2 = c2, v2 = 0; (y2 = y2.nextSibling) && v2 < _2; v2 += 2) {
                      if (y2 == d2) {
                        break n;
                      }
                    }
                    n2.insertBefore(d2, c2);
                  }
                  "option" == l.type && (n2.value = "");
                }
                c2 = d2.nextSibling, "function" == typeof l.type && (l.l = d2);
              }
            }
            return h2++, u3;
          }), l.__e = m2, null != r2 && "function" != typeof l.type) {
            for (h2 = r2.length; h2--; ) {
              null != r2[h2] && a(r2[h2]);
            }
          }
          for (h2 = _2; h2--; ) {
            null != k2[h2] && D(k2[h2], k2[h2]);
          }
          if (g2) {
            for (h2 = 0; h2 < g2.length; h2++) {
              A(g2[h2], g2[++h2], g2[++h2]);
            }
          }
        }
        function x(n2, l, u2) {
          if (null == u2 && (u2 = []), null == n2 || "boolean" == typeof n2) {
            l && u2.push(l(null));
          } else if (Array.isArray(n2)) {
            for (var t2 = 0; t2 < n2.length; t2++) {
              x(n2[t2], l, u2);
            }
          } else {
            u2.push(l ? l(y(n2)) : n2);
          }
          return u2;
        }
        function C(n2, l, u2, t2, i2) {
          var r2;
          for (r2 in u2) {
            r2 in l || N(n2, r2, null, u2[r2], t2);
          }
          for (r2 in l) {
            i2 && "function" != typeof l[r2] || "value" === r2 || "checked" === r2 || u2[r2] === l[r2] || N(n2, r2, l[r2], u2[r2], t2);
          }
        }
        function P(n2, l, u2) {
          "-" === l[0] ? n2.setProperty(l, u2) : n2[l] = "number" == typeof u2 && false === c.test(l) ? u2 + "px" : null == u2 ? "" : u2;
        }
        function N(n2, l, u2, t2, i2) {
          var r2, o2, f2, e2, c2;
          if ("key" === (l = i2 ? "className" === l ? "class" : l : "class" === l ? "className" : l) || "children" === l) ;
          else if ("style" === l) {
            if (r2 = n2.style, "string" == typeof u2) {
              r2.cssText = u2;
            } else {
              if ("string" == typeof t2 && (r2.cssText = "", t2 = null), t2) {
                for (o2 in t2) {
                  u2 && o2 in u2 || P(r2, o2, "");
                }
              }
              if (u2) {
                for (f2 in u2) {
                  t2 && u2[f2] === t2[f2] || P(r2, f2, u2[f2]);
                }
              }
            }
          } else {
            "o" === l[0] && "n" === l[1] ? (e2 = l !== (l = l.replace(/Capture$/, "")), c2 = l.toLowerCase(), l = (c2 in n2 ? c2 : l).slice(2), u2 ? (t2 || n2.addEventListener(l, T, e2), (n2.t || (n2.t = {}))[l] = u2) : n2.removeEventListener(l, T, e2)) : "list" !== l && "tagName" !== l && "form" !== l && !i2 && l in n2 ? n2[l] = null == u2 ? "" : u2 : "function" != typeof u2 && "dangerouslySetInnerHTML" !== l && (l !== (l = l.replace(/^xlink:?/, "")) ? null == u2 || false === u2 ? n2.removeAttributeNS("http://www.w3.org/1999/xlink", l.toLowerCase()) : n2.setAttributeNS("http://www.w3.org/1999/xlink", l.toLowerCase(), u2) : null == u2 || false === u2 ? n2.removeAttribute(l) : n2.setAttribute(l, u2));
          }
        }
        function T(l) {
          return this.t[l.type](n.event ? n.event(l) : l);
        }
        function $(l, u2, t2, i2, r2, o2, f2, e2, c2, a2) {
          var h2, v2, p, y2, w2, g2, k2, _2, C2, P2, N2 = u2.type;
          if (void 0 !== u2.constructor) {
            return null;
          }
          (h2 = n.__b) && h2(u2);
          try {
            n: if ("function" == typeof N2) {
              if (_2 = u2.props, C2 = (h2 = N2.contextType) && i2[h2.__c], P2 = h2 ? C2 ? C2.props.value : h2.__p : i2, t2.__c ? k2 = (v2 = u2.__c = t2.__c).__p = v2.__E : ("prototype" in N2 && N2.prototype.render ? u2.__c = v2 = new N2(_2, P2) : (u2.__c = v2 = new m(_2, P2), v2.constructor = N2, v2.render = H), C2 && C2.sub(v2), v2.props = _2, v2.state || (v2.state = {}), v2.context = P2, v2.__n = i2, p = v2.__d = true, v2.__h = []), null == v2.__s && (v2.__s = v2.state), null != N2.getDerivedStateFromProps && s(v2.__s == v2.state ? v2.__s = s({}, v2.__s) : v2.__s, N2.getDerivedStateFromProps(_2, v2.__s)), p) {
                null == N2.getDerivedStateFromProps && null != v2.componentWillMount && v2.componentWillMount(), null != v2.componentDidMount && f2.push(v2);
              } else {
                if (null == N2.getDerivedStateFromProps && null == e2 && null != v2.componentWillReceiveProps && v2.componentWillReceiveProps(_2, P2), !e2 && null != v2.shouldComponentUpdate && false === v2.shouldComponentUpdate(_2, v2.__s, P2)) {
                  for (v2.props = _2, v2.state = v2.__s, v2.__d = false, v2.__v = u2, u2.__e = null != c2 ? c2 !== t2.__e ? c2 : t2.__e : null, u2.__k = t2.__k, h2 = 0; h2 < u2.__k.length; h2++) {
                    u2.__k[h2] && (u2.__k[h2].__p = u2);
                  }
                  break n;
                }
                null != v2.componentWillUpdate && v2.componentWillUpdate(_2, v2.__s, P2);
              }
              for (y2 = v2.props, w2 = v2.state, v2.context = P2, v2.props = _2, v2.state = v2.__s, (h2 = n.__r) && h2(u2), v2.__d = false, v2.__v = u2, v2.__P = l, h2 = v2.render(v2.props, v2.state, v2.context), u2.__k = x(null != h2 && h2.type == d && null == h2.key ? h2.props.children : h2), null != v2.getChildContext && (i2 = s(s({}, i2), v2.getChildContext())), p || null == v2.getSnapshotBeforeUpdate || (g2 = v2.getSnapshotBeforeUpdate(y2, w2)), b(l, u2, t2, i2, r2, o2, f2, c2, a2), v2.base = u2.__e; h2 = v2.__h.pop(); ) {
                v2.__s && (v2.state = v2.__s), h2.call(v2);
              }
              p || null == y2 || null == v2.componentDidUpdate || v2.componentDidUpdate(y2, w2, g2), k2 && (v2.__E = v2.__p = null);
            } else {
              u2.__e = z(t2.__e, u2, t2, i2, r2, o2, f2, a2);
            }
            (h2 = n.diffed) && h2(u2);
          } catch (l2) {
            n.__e(l2, u2, t2);
          }
          return u2.__e;
        }
        function j(l, u2) {
          for (var t2; t2 = l.pop(); ) {
            try {
              t2.componentDidMount();
            } catch (l2) {
              n.__e(l2, t2.__v);
            }
          }
          n.__c && n.__c(u2);
        }
        function z(n2, l, u2, t2, i2, r2, o2, c2) {
          var s2, a2, h2, v2, p = u2.props, d2 = l.props;
          if (i2 = "svg" === l.type || i2, null == n2 && null != r2) {
            for (s2 = 0; s2 < r2.length; s2++) {
              if (null != (a2 = r2[s2]) && (null === l.type ? 3 === a2.nodeType : a2.localName === l.type)) {
                n2 = a2, r2[s2] = null;
                break;
              }
            }
          }
          if (null == n2) {
            if (null === l.type) {
              return document.createTextNode(d2);
            }
            n2 = i2 ? document.createElementNS("http://www.w3.org/2000/svg", l.type) : document.createElement(l.type), r2 = null;
          }
          return null === l.type ? p !== d2 && (null != r2 && (r2[r2.indexOf(n2)] = null), n2.data = d2) : l !== u2 && (null != r2 && (r2 = e.slice.call(n2.childNodes)), h2 = (p = u2.props || f).dangerouslySetInnerHTML, v2 = d2.dangerouslySetInnerHTML, c2 || (v2 || h2) && (v2 && h2 && v2.__html == h2.__html || (n2.innerHTML = v2 && v2.__html || "")), C(n2, d2, p, i2, c2), l.__k = l.props.children, v2 || b(n2, l, u2, t2, "foreignObject" !== l.type && i2, r2, o2, f, c2), c2 || ("value" in d2 && void 0 !== d2.value && d2.value !== n2.value && (n2.value = null == d2.value ? "" : d2.value), "checked" in d2 && void 0 !== d2.checked && d2.checked !== n2.checked && (n2.checked = d2.checked))), n2;
        }
        function A(l, u2, t2) {
          try {
            "function" == typeof l ? l(u2) : l.current = u2;
          } catch (l2) {
            n.__e(l2, t2);
          }
        }
        function D(l, u2, t2) {
          var i2, r2, o2;
          if (n.unmount && n.unmount(l), (i2 = l.ref) && A(i2, null, u2), t2 || "function" == typeof l.type || (t2 = null != (r2 = l.__e)), l.__e = l.l = null, null != (i2 = l.__c)) {
            if (i2.componentWillUnmount) {
              try {
                i2.componentWillUnmount();
              } catch (l2) {
                n.__e(l2, u2);
              }
            }
            i2.base = i2.__P = null;
          }
          if (i2 = l.__k) {
            for (o2 = 0; o2 < i2.length; o2++) {
              i2[o2] && D(i2[o2], u2, t2);
            }
          }
          null != r2 && a(r2);
        }
        function H(n2, l, u2) {
          return this.constructor(n2, u2);
        }
        function I(l, u2, t2) {
          var i2, o2, c2;
          n.__p && n.__p(l, u2), o2 = (i2 = t2 === r) ? null : t2 && t2.__k || u2.__k, l = h(d, null, [l]), c2 = [], $(u2, i2 ? u2.__k = l : (t2 || u2).__k = l, o2 || f, f, void 0 !== u2.ownerSVGElement, t2 && !i2 ? [t2] : o2 ? null : e.slice.call(u2.childNodes), c2, false, t2 || f, i2), j(c2, l);
        }
        n = {}, m.prototype.setState = function(n2, l) {
          var u2 = this.__s !== this.state && this.__s || (this.__s = s({}, this.state));
          ("function" != typeof n2 || (n2 = n2(u2, this.props))) && s(u2, n2), null != n2 && this.__v && (this.u = false, l && this.__h.push(l), k(this));
        }, m.prototype.forceUpdate = function(n2) {
          this.__v && (n2 && this.__h.push(n2), this.u = true, k(this));
        }, m.prototype.render = d, u = [], t = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, i = n.debounceRendering, n.__e = function(n2, l, u2) {
          for (var t2; l = l.__p; ) {
            if ((t2 = l.__c) && !t2.__p) {
              try {
                if (t2.constructor && null != t2.constructor.getDerivedStateFromError) {
                  t2.setState(t2.constructor.getDerivedStateFromError(n2));
                } else {
                  if (null == t2.componentDidCatch) {
                    continue;
                  }
                  t2.componentDidCatch(n2);
                }
                return k(t2.__E = t2);
              } catch (l2) {
                n2 = l2;
              }
            }
          }
          throw n2;
        }, r = f, o = 0;
        function _defineProperties(target, props) {
          for (var i2 = 0; i2 < props.length; i2++) {
            var descriptor = props[i2];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) {
              descriptor.writable = true;
            }
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }
        function _createClass(Constructor, protoProps, staticProps) {
          if (protoProps) {
            _defineProperties(Constructor.prototype, protoProps);
          }
          if (staticProps) {
            _defineProperties(Constructor, staticProps);
          }
          return Constructor;
        }
        function _extends() {
          _extends = Object.assign || function(target) {
            var arguments$1 = arguments;
            for (var i2 = 1; i2 < arguments.length; i2++) {
              var source = arguments$1[i2];
              for (var key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                  target[key] = source[key];
                }
              }
            }
            return target;
          };
          return _extends.apply(this, arguments);
        }
        var CSS_INTEGER = "[-\\+]?\\d+%?";
        var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";
        var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";
        var PERMISSIVE_MATCH_3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
        var PERMISSIVE_MATCH_4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
        var REGEX_FUNCTIONAL_RGB = new RegExp("rgb" + PERMISSIVE_MATCH_3);
        var REGEX_FUNCTIONAL_RGBA = new RegExp("rgba" + PERMISSIVE_MATCH_4);
        var REGEX_FUNCTIONAL_HSL = new RegExp("hsl" + PERMISSIVE_MATCH_3);
        var REGEX_FUNCTIONAL_HSLA = new RegExp("hsla" + PERMISSIVE_MATCH_4);
        var HEX_START = "^(?:#?|0x?)";
        var HEX_INT_SINGLE = "([0-9a-fA-F]{1})";
        var HEX_INT_DOUBLE = "([0-9a-fA-F]{2})";
        var REGEX_HEX_3 = new RegExp(HEX_START + HEX_INT_SINGLE + HEX_INT_SINGLE + HEX_INT_SINGLE + "$");
        var REGEX_HEX_4 = new RegExp(HEX_START + HEX_INT_SINGLE + HEX_INT_SINGLE + HEX_INT_SINGLE + HEX_INT_SINGLE + "$");
        var REGEX_HEX_6 = new RegExp(HEX_START + HEX_INT_DOUBLE + HEX_INT_DOUBLE + HEX_INT_DOUBLE + "$");
        var REGEX_HEX_8 = new RegExp(HEX_START + HEX_INT_DOUBLE + HEX_INT_DOUBLE + HEX_INT_DOUBLE + HEX_INT_DOUBLE + "$");
        var KELVIN_MIN = 2e3;
        var KELVIN_MAX = 4e4;
        var log = Math.log, round = Math.round, floor = Math.floor;
        function clamp(num, min, max) {
          return Math.min(Math.max(num, min), max);
        }
        function parseUnit(str, max) {
          var isPercentage = str.indexOf("%") > -1;
          var num = parseFloat(str);
          return isPercentage ? max / 100 * num : num;
        }
        function parseHexInt(str) {
          return parseInt(str, 16);
        }
        function intToHex(_int) {
          return _int.toString(16).padStart(2, "0");
        }
        var IroColor = /* @__PURE__ */ (function() {
          function IroColor2(value, onChange) {
            this.$ = {
              h: 0,
              s: 0,
              v: 0,
              a: 1
            };
            if (value) {
              this.set(value);
            }
            this.onChange = onChange;
            this.initialValue = _extends({}, this.$);
          }
          var _proto = IroColor2.prototype;
          _proto.set = function set(value) {
            if (typeof value === "string") {
              if (/^(?:#?|0x?)[0-9a-fA-F]{3,8}$/.test(value)) {
                this.hexString = value;
              } else if (/^rgba?/.test(value)) {
                this.rgbString = value;
              } else if (/^hsla?/.test(value)) {
                this.hslString = value;
              }
            } else if (typeof value === "object") {
              if (value instanceof IroColor2) {
                this.hsva = value.hsva;
              } else if ("r" in value && "g" in value && "b" in value) {
                this.rgb = value;
              } else if ("h" in value && "s" in value && "v" in value) {
                this.hsv = value;
              } else if ("h" in value && "s" in value && "l" in value) {
                this.hsl = value;
              } else if ("kelvin" in value) {
                this.kelvin = value.kelvin;
              }
            } else {
              throw new Error("Invalid color value");
            }
          };
          _proto.setChannel = function setChannel(format, channel, value) {
            var _extends2;
            this[format] = _extends({}, this[format], (_extends2 = {}, _extends2[channel] = value, _extends2));
          };
          _proto.reset = function reset() {
            this.hsva = this.initialValue;
          };
          _proto.clone = function clone() {
            return new IroColor2(this);
          };
          _proto.unbind = function unbind() {
            this.onChange = void 0;
          };
          IroColor2.hsvToRgb = function hsvToRgb(hsv) {
            var h2 = hsv.h / 60;
            var s2 = hsv.s / 100;
            var v2 = hsv.v / 100;
            var i2 = floor(h2);
            var f2 = h2 - i2;
            var p = v2 * (1 - s2);
            var q = v2 * (1 - f2 * s2);
            var t2 = v2 * (1 - (1 - f2) * s2);
            var mod2 = i2 % 6;
            var r2 = [v2, q, p, p, t2, v2][mod2];
            var g2 = [t2, v2, v2, q, p, p][mod2];
            var b2 = [p, p, t2, v2, v2, q][mod2];
            return {
              r: clamp(r2 * 255, 0, 255),
              g: clamp(g2 * 255, 0, 255),
              b: clamp(b2 * 255, 0, 255)
            };
          };
          IroColor2.rgbToHsv = function rgbToHsv(rgb) {
            var r2 = rgb.r / 255;
            var g2 = rgb.g / 255;
            var b2 = rgb.b / 255;
            var max = Math.max(r2, g2, b2);
            var min = Math.min(r2, g2, b2);
            var delta = max - min;
            var hue = 0;
            var value = max;
            var saturation = max === 0 ? 0 : delta / max;
            switch (max) {
              case min:
                hue = 0;
                break;
              case r2:
                hue = (g2 - b2) / delta + (g2 < b2 ? 6 : 0);
                break;
              case g2:
                hue = (b2 - r2) / delta + 2;
                break;
              case b2:
                hue = (r2 - g2) / delta + 4;
                break;
            }
            return {
              h: hue * 60 % 360,
              s: clamp(saturation * 100, 0, 100),
              v: clamp(value * 100, 0, 100)
            };
          };
          IroColor2.hsvToHsl = function hsvToHsl(hsv) {
            var s2 = hsv.s / 100;
            var v2 = hsv.v / 100;
            var l = (2 - s2) * v2;
            var divisor = l <= 1 ? l : 2 - l;
            var saturation = divisor < 1e-9 ? 0 : s2 * v2 / divisor;
            return {
              h: hsv.h,
              s: clamp(saturation * 100, 0, 100),
              l: clamp(l * 50, 0, 100)
            };
          };
          IroColor2.hslToHsv = function hslToHsv(hsl) {
            var l = hsl.l * 2;
            var s2 = hsl.s * (l <= 100 ? l : 200 - l) / 100;
            var saturation = l + s2 < 1e-9 ? 0 : 2 * s2 / (l + s2);
            return {
              h: hsl.h,
              s: clamp(saturation * 100, 0, 100),
              v: clamp((l + s2) / 2, 0, 100)
            };
          };
          IroColor2.kelvinToRgb = function kelvinToRgb(kelvin) {
            var temp = kelvin / 100;
            var r2, g2, b2;
            if (temp < 66) {
              r2 = 255;
              g2 = -155.25485562709179 - 0.44596950469579133 * (g2 = temp - 2) + 104.49216199393888 * log(g2);
              b2 = temp < 20 ? 0 : -254.76935184120902 + 0.8274096064007395 * (b2 = temp - 10) + 115.67994401066147 * log(b2);
            } else {
              r2 = 351.97690566805693 + 0.114206453784165 * (r2 = temp - 55) - 40.25366309332127 * log(r2);
              g2 = 325.4494125711974 + 0.07943456536662342 * (g2 = temp - 50) - 28.0852963507957 * log(g2);
              b2 = 255;
            }
            return {
              r: clamp(floor(r2), 0, 255),
              g: clamp(floor(g2), 0, 255),
              b: clamp(floor(b2), 0, 255)
            };
          };
          IroColor2.rgbToKelvin = function rgbToKelvin(rgb) {
            var r2 = rgb.r, b2 = rgb.b;
            var eps = 0.4;
            var minTemp = KELVIN_MIN;
            var maxTemp = KELVIN_MAX;
            var temp;
            while (maxTemp - minTemp > eps) {
              temp = (maxTemp + minTemp) * 0.5;
              var _rgb = IroColor2.kelvinToRgb(temp);
              if (_rgb.b / _rgb.r >= b2 / r2) {
                maxTemp = temp;
              } else {
                minTemp = temp;
              }
            }
            return temp;
          };
          _createClass(IroColor2, [{
            key: "hsv",
            get: function get() {
              var value = this.$;
              return {
                h: value.h,
                s: value.s,
                v: value.v
              };
            },
            set: function set(newValue) {
              var oldValue = this.$;
              newValue = _extends({}, oldValue, newValue);
              if (this.onChange) {
                var changes = {
                  h: false,
                  v: false,
                  s: false,
                  a: false
                };
                for (var key in oldValue) {
                  changes[key] = newValue[key] != oldValue[key];
                }
                this.$ = newValue;
                if (changes.h || changes.s || changes.v || changes.a) {
                  this.onChange(this, changes);
                }
              } else {
                this.$ = newValue;
              }
            }
          }, {
            key: "hsva",
            get: function get() {
              return _extends({}, this.$);
            },
            set: function set(value) {
              this.hsv = value;
            }
          }, {
            key: "hue",
            get: function get() {
              return this.$.h;
            },
            set: function set(value) {
              this.hsv = {
                h: value
              };
            }
          }, {
            key: "saturation",
            get: function get() {
              return this.$.s;
            },
            set: function set(value) {
              this.hsv = {
                s: value
              };
            }
          }, {
            key: "value",
            get: function get() {
              return this.$.v;
            },
            set: function set(value) {
              this.hsv = {
                v: value
              };
            }
          }, {
            key: "alpha",
            get: function get() {
              return this.$.a;
            },
            set: function set(value) {
              this.hsv = _extends({}, this.hsv, {
                a: value
              });
            }
          }, {
            key: "kelvin",
            get: function get() {
              return IroColor2.rgbToKelvin(this.rgb);
            },
            set: function set(value) {
              this.rgb = IroColor2.kelvinToRgb(value);
            }
          }, {
            key: "red",
            get: function get() {
              var rgb = this.rgb;
              return rgb.r;
            },
            set: function set(value) {
              this.rgb = _extends({}, this.rgb, {
                r: value
              });
            }
          }, {
            key: "green",
            get: function get() {
              var rgb = this.rgb;
              return rgb.g;
            },
            set: function set(value) {
              this.rgb = _extends({}, this.rgb, {
                g: value
              });
            }
          }, {
            key: "blue",
            get: function get() {
              var rgb = this.rgb;
              return rgb.b;
            },
            set: function set(value) {
              this.rgb = _extends({}, this.rgb, {
                b: value
              });
            }
          }, {
            key: "rgb",
            get: function get() {
              var _IroColor$hsvToRgb = IroColor2.hsvToRgb(this.$), r2 = _IroColor$hsvToRgb.r, g2 = _IroColor$hsvToRgb.g, b2 = _IroColor$hsvToRgb.b;
              return {
                r: round(r2),
                g: round(g2),
                b: round(b2)
              };
            },
            set: function set(value) {
              this.hsv = _extends({}, IroColor2.rgbToHsv(value), {
                a: value.a === void 0 ? 1 : value.a
              });
            }
          }, {
            key: "rgba",
            get: function get() {
              return _extends({}, this.rgb, {
                a: this.alpha
              });
            },
            set: function set(value) {
              this.rgb = value;
            }
          }, {
            key: "hsl",
            get: function get() {
              var _IroColor$hsvToHsl = IroColor2.hsvToHsl(this.$), h2 = _IroColor$hsvToHsl.h, s2 = _IroColor$hsvToHsl.s, l = _IroColor$hsvToHsl.l;
              return {
                h: round(h2),
                s: round(s2),
                l: round(l)
              };
            },
            set: function set(value) {
              this.hsv = _extends({}, IroColor2.hslToHsv(value), {
                a: value.a === void 0 ? 1 : value.a
              });
            }
          }, {
            key: "hsla",
            get: function get() {
              return _extends({}, this.hsl, {
                a: this.alpha
              });
            },
            set: function set(value) {
              this.hsl = value;
            }
          }, {
            key: "rgbString",
            get: function get() {
              var rgb = this.rgb;
              return "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")";
            },
            set: function set(value) {
              var match;
              var r2, g2, b2, a2 = 1;
              if (match = REGEX_FUNCTIONAL_RGB.exec(value)) {
                r2 = parseUnit(match[1], 255);
                g2 = parseUnit(match[2], 255);
                b2 = parseUnit(match[3], 255);
              } else if (match = REGEX_FUNCTIONAL_RGBA.exec(value)) {
                r2 = parseUnit(match[1], 255);
                g2 = parseUnit(match[2], 255);
                b2 = parseUnit(match[3], 255);
                a2 = parseUnit(match[4], 1);
              }
              if (match) {
                this.rgb = {
                  r: r2,
                  g: g2,
                  b: b2,
                  a: a2
                };
              } else {
                throw new Error("Invalid rgb string");
              }
            }
          }, {
            key: "rgbaString",
            get: function get() {
              var rgba = this.rgba;
              return "rgba(" + rgba.r + ", " + rgba.g + ", " + rgba.b + ", " + rgba.a + ")";
            },
            set: function set(value) {
              this.rgbString = value;
            }
          }, {
            key: "hexString",
            get: function get() {
              var rgb = this.rgb;
              return "#" + intToHex(rgb.r) + intToHex(rgb.g) + intToHex(rgb.b);
            },
            set: function set(value) {
              var match;
              var r2, g2, b2, a2 = 255;
              if (match = REGEX_HEX_3.exec(value)) {
                r2 = parseHexInt(match[1]) * 17;
                g2 = parseHexInt(match[2]) * 17;
                b2 = parseHexInt(match[3]) * 17;
              } else if (match = REGEX_HEX_4.exec(value)) {
                r2 = parseHexInt(match[1]) * 17;
                g2 = parseHexInt(match[2]) * 17;
                b2 = parseHexInt(match[3]) * 17;
                a2 = parseHexInt(match[4]) * 17;
              } else if (match = REGEX_HEX_6.exec(value)) {
                r2 = parseHexInt(match[1]);
                g2 = parseHexInt(match[2]);
                b2 = parseHexInt(match[3]);
              } else if (match = REGEX_HEX_8.exec(value)) {
                r2 = parseHexInt(match[1]);
                g2 = parseHexInt(match[2]);
                b2 = parseHexInt(match[3]);
                a2 = parseHexInt(match[4]);
              }
              if (match) {
                this.rgb = {
                  r: r2,
                  g: g2,
                  b: b2,
                  a: a2 / 255
                };
              } else {
                throw new Error("Invalid hex string");
              }
            }
          }, {
            key: "hex8String",
            get: function get() {
              var rgba = this.rgba;
              return "#" + intToHex(rgba.r) + intToHex(rgba.g) + intToHex(rgba.b) + intToHex(floor(rgba.a * 255));
            },
            set: function set(value) {
              this.hexString = value;
            }
          }, {
            key: "hslString",
            get: function get() {
              var hsl = this.hsl;
              return "hsl(" + hsl.h + ", " + hsl.s + "%, " + hsl.l + "%)";
            },
            set: function set(value) {
              var match;
              var h2, s2, l, a2 = 1;
              if (match = REGEX_FUNCTIONAL_HSL.exec(value)) {
                h2 = parseUnit(match[1], 360);
                s2 = parseUnit(match[2], 100);
                l = parseUnit(match[3], 100);
              } else if (match = REGEX_FUNCTIONAL_HSLA.exec(value)) {
                h2 = parseUnit(match[1], 360);
                s2 = parseUnit(match[2], 100);
                l = parseUnit(match[3], 100);
                a2 = parseUnit(match[4], 1);
              }
              if (match) {
                this.hsl = {
                  h: h2,
                  s: s2,
                  l,
                  a: a2
                };
              } else {
                throw new Error("Invalid hsl string");
              }
            }
          }, {
            key: "hslaString",
            get: function get() {
              var hsla = this.hsla;
              return "hsla(" + hsla.h + ", " + hsla.s + "%, " + hsla.l + "%, " + hsla.a + ")";
            },
            set: function set(value) {
              this.hslString = value;
            }
          }]);
          return IroColor2;
        })();
        var sliderDefaultOptions = {
          sliderShape: "bar",
          sliderType: "value",
          minTemperature: 2200,
          maxTemperature: 11e3
        };
        function getSliderDimensions(props) {
          var _sliderSize;
          var width = props.width, sliderSize = props.sliderSize, borderWidth = props.borderWidth, handleRadius = props.handleRadius, padding = props.padding, sliderShape = props.sliderShape;
          var ishorizontal = props.layoutDirection === "horizontal";
          sliderSize = (_sliderSize = sliderSize) != null ? _sliderSize : padding * 2 + handleRadius * 2;
          if (sliderShape === "circle") {
            return {
              handleStart: props.padding + props.handleRadius,
              handleRange: width - padding * 2 - handleRadius * 2,
              width,
              height: width,
              cx: width / 2,
              cy: width / 2,
              radius: width / 2 - borderWidth / 2
            };
          } else {
            return {
              handleStart: sliderSize / 2,
              handleRange: width - sliderSize,
              radius: sliderSize / 2,
              x: 0,
              y: 0,
              width: ishorizontal ? sliderSize : width,
              height: ishorizontal ? width : sliderSize
            };
          }
        }
        function getCurrentSliderValue(props, color) {
          var hsva = color.hsva;
          var rgb = color.rgb;
          switch (props.sliderType) {
            case "red":
              return rgb.r / 2.55;
            case "green":
              return rgb.g / 2.55;
            case "blue":
              return rgb.b / 2.55;
            case "alpha":
              return hsva.a * 100;
            case "kelvin":
              var minTemperature = props.minTemperature, maxTemperature = props.maxTemperature;
              var temperatureRange = maxTemperature - minTemperature;
              var percent = (color.kelvin - minTemperature) / temperatureRange * 100;
              return Math.max(0, Math.min(percent, 100));
            case "hue":
              return hsva.h /= 3.6;
            case "saturation":
              return hsva.s;
            case "value":
            default:
              return hsva.v;
          }
        }
        function getSliderValueFromInput(props, x2, y2) {
          var _getSliderDimensions = getSliderDimensions(props), handleRange = _getSliderDimensions.handleRange, handleStart = _getSliderDimensions.handleStart;
          var handlePos;
          if (props.layoutDirection === "horizontal") {
            handlePos = -1 * y2 + handleRange + handleStart;
          } else {
            handlePos = x2 - handleStart;
          }
          handlePos = Math.max(Math.min(handlePos, handleRange), 0);
          var percent = Math.round(100 / handleRange * handlePos);
          switch (props.sliderType) {
            case "kelvin":
              var minTemperature = props.minTemperature, maxTemperature = props.maxTemperature;
              var temperatureRange = maxTemperature - minTemperature;
              return minTemperature + temperatureRange * (percent / 100);
            case "alpha":
              return percent / 100;
            case "hue":
              return percent * 3.6;
            case "red":
            case "blue":
            case "green":
              return percent * 2.55;
            default:
              return percent;
          }
        }
        function getSliderHandlePosition(props, color) {
          var _getSliderDimensions2 = getSliderDimensions(props), width = _getSliderDimensions2.width, height = _getSliderDimensions2.height, handleRange = _getSliderDimensions2.handleRange, handleStart = _getSliderDimensions2.handleStart;
          var ishorizontal = props.layoutDirection === "horizontal";
          var sliderValue = getCurrentSliderValue(props, color);
          var midPoint = ishorizontal ? width / 2 : height / 2;
          var handlePos = handleStart + sliderValue / 100 * handleRange;
          if (ishorizontal) {
            handlePos = -1 * handlePos + handleRange + handleStart * 2;
          }
          return {
            x: ishorizontal ? midPoint : handlePos,
            y: ishorizontal ? handlePos : midPoint
          };
        }
        function getSliderGradient(props, color) {
          var hsv = color.hsv;
          var rgb = color.rgb;
          switch (props.sliderType) {
            case "red":
              return [[0, "rgb(0," + rgb.g + "," + rgb.b + ")"], [100, "rgb(255," + rgb.g + "," + rgb.b + ")"]];
            case "green":
              return [[0, "rgb(" + rgb.r + ",0," + rgb.b + ")"], [100, "rgb(" + rgb.r + ",255," + rgb.b + ")"]];
            case "blue":
              return [[0, "rgb(" + rgb.r + "," + rgb.g + ",0)"], [100, "rgb(" + rgb.r + "," + rgb.g + ",255)"]];
            case "alpha":
              return [[0, "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ",0)"], [100, "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")"]];
            case "kelvin":
              var stops = [];
              var min = props.minTemperature;
              var max = props.maxTemperature;
              var numStops = 8;
              var range = max - min;
              for (var kelvin = min, stop = 0; kelvin < max; kelvin += range / numStops, stop += 1) {
                var _IroColor$kelvinToRgb = IroColor.kelvinToRgb(kelvin), r2 = _IroColor$kelvinToRgb.r, g2 = _IroColor$kelvinToRgb.g, b2 = _IroColor$kelvinToRgb.b;
                stops.push([100 / numStops * stop, "rgb(" + r2 + "," + g2 + "," + b2 + ")"]);
              }
              return stops;
            case "hue":
              return [[0, "#f00"], [16.666, "#ff0"], [33.333, "#0f0"], [50, "#0ff"], [66.666, "#00f"], [83.333, "#f0f"], [100, "#f00"]];
            case "saturation":
              var noSat = IroColor.hsvToHsl({
                h: hsv.h,
                s: 0,
                v: hsv.v
              });
              var fullSat = IroColor.hsvToHsl({
                h: hsv.h,
                s: 100,
                v: hsv.v
              });
              return [[0, "hsl(" + noSat.h + "," + noSat.s + "%," + noSat.l + "%)"], [100, "hsl(" + fullSat.h + "," + fullSat.s + "%," + fullSat.l + "%)"]];
            case "value":
            default:
              var hsl = IroColor.hsvToHsl({
                h: hsv.h,
                s: hsv.s,
                v: 100
              });
              return [[0, "#000"], [100, "hsl(" + hsl.h + "," + hsl.s + "%," + hsl.l + "%)"]];
          }
        }
        var TAU = Math.PI * 2;
        var mod = function mod2(a2, n2) {
          return (a2 % n2 + n2) % n2;
        };
        var dist = function dist2(x2, y2) {
          return Math.sqrt(x2 * x2 + y2 * y2);
        };
        function getHandleRange(props) {
          return props.width / 2 - props.padding - props.handleRadius - props.borderWidth;
        }
        function isInputInsideWheel(props, x2, y2) {
          var _getWheelDimensions = getWheelDimensions(props), cx = _getWheelDimensions.cx, cy = _getWheelDimensions.cy;
          var r2 = props.width / 2;
          return dist(cx - x2, cy - y2) < r2;
        }
        function getWheelDimensions(props) {
          var r2 = props.width / 2;
          return {
            width: props.width,
            radius: r2 - props.borderWidth,
            cx: r2,
            cy: r2
          };
        }
        function translateWheelAngle(props, angle, invert) {
          var wheelAngle = props.wheelAngle;
          var wheelDirection = props.wheelDirection;
          if (invert && wheelDirection === "clockwise") {
            angle = wheelAngle + angle;
          } else if (wheelDirection === "clockwise") {
            angle = 360 - wheelAngle + angle;
          } else if (invert && wheelDirection === "anticlockwise") {
            angle = wheelAngle + 180 - angle;
          } else if (wheelDirection === "anticlockwise") {
            angle = wheelAngle - angle;
          }
          return mod(angle, 360);
        }
        function getWheelHandlePosition(props, color) {
          var hsv = color.hsv;
          var _getWheelDimensions2 = getWheelDimensions(props), cx = _getWheelDimensions2.cx, cy = _getWheelDimensions2.cy;
          var handleRange = getHandleRange(props);
          var handleAngle = (180 + translateWheelAngle(props, hsv.h, true)) * (TAU / 360);
          var handleDist = hsv.s / 100 * handleRange;
          var direction = props.wheelDirection === "clockwise" ? -1 : 1;
          return {
            x: cx + handleDist * Math.cos(handleAngle) * direction,
            y: cy + handleDist * Math.sin(handleAngle) * direction
          };
        }
        function getWheelValueFromInput(props, x2, y2) {
          var _getWheelDimensions3 = getWheelDimensions(props), cx = _getWheelDimensions3.cx, cy = _getWheelDimensions3.cy;
          var handleRange = getHandleRange(props);
          x2 = cx - x2;
          y2 = cy - y2;
          var hue = translateWheelAngle(props, Math.atan2(-y2, -x2) * (360 / TAU));
          var handleDist = Math.min(dist(x2, y2), handleRange);
          return {
            h: Math.round(hue),
            s: Math.round(100 / handleRange * handleDist)
          };
        }
        function getBoxDimensions(props) {
          var width = props.width, boxHeight = props.boxHeight, padding = props.padding, handleRadius = props.handleRadius;
          return {
            width,
            height: boxHeight != null ? boxHeight : width,
            radius: padding + handleRadius
          };
        }
        function getBoxValueFromInput(props, x2, y2) {
          var _getBoxDimensions = getBoxDimensions(props), width = _getBoxDimensions.width, height = _getBoxDimensions.height, radius = _getBoxDimensions.radius;
          var handleStart = radius;
          var handleRangeX = width - radius * 2;
          var handleRangeY = height - radius * 2;
          var percentX = (x2 - handleStart) / handleRangeX * 100;
          var percentY = (y2 - handleStart) / handleRangeY * 100;
          return {
            s: Math.max(0, Math.min(percentX, 100)),
            v: Math.max(0, Math.min(100 - percentY, 100))
          };
        }
        function getBoxHandlePosition(props, color) {
          var _getBoxDimensions2 = getBoxDimensions(props), width = _getBoxDimensions2.width, height = _getBoxDimensions2.height, radius = _getBoxDimensions2.radius;
          var hsv = color.hsv;
          var handleStart = radius;
          var handleRangeX = width - radius * 2;
          var handleRangeY = height - radius * 2;
          return {
            x: handleStart + hsv.s / 100 * handleRangeX,
            y: handleStart + (handleRangeY - hsv.v / 100 * handleRangeY)
          };
        }
        function getBoxGradients(props, color) {
          var hue = color.hue;
          return [
            // saturation gradient
            [[0, "#fff"], [100, "hsl(" + hue + ",100%,50%)"]],
            // lightness gradient
            [[0, "rgba(0,0,0,0)"], [100, "#000"]]
          ];
        }
        var BASE_ELEMENTS;
        function resolveSvgUrl(url) {
          if (!BASE_ELEMENTS) {
            BASE_ELEMENTS = document.getElementsByTagName("base");
          }
          var ua = window.navigator.userAgent;
          var isSafari = /^((?!chrome|android).)*safari/i.test(ua);
          var isIos = /iPhone|iPod|iPad/i.test(ua);
          var location = window.location;
          return (isSafari || isIos) && BASE_ELEMENTS.length > 0 ? location.protocol + "//" + location.host + location.pathname + location.search + url : url;
        }
        function getHandleAtPoint(props, x2, y2, handlePositions) {
          for (var i2 = 0; i2 < handlePositions.length; i2++) {
            var dX = handlePositions[i2].x - x2;
            var dY = handlePositions[i2].y - y2;
            var dist2 = Math.sqrt(dX * dX + dY * dY);
            if (dist2 < props.handleRadius) {
              return i2;
            }
          }
          return null;
        }
        function cssBorderStyles(props) {
          return {
            boxSizing: "border-box",
            border: props.borderWidth + "px solid " + props.borderColor
          };
        }
        function cssGradient(type, direction, stops) {
          return type + "-gradient(" + direction + ", " + stops.map(function(_ref) {
            var o2 = _ref[0], col = _ref[1];
            return col + " " + o2 + "%";
          }).join(",") + ")";
        }
        function cssValue(value) {
          if (typeof value === "string") {
            return value;
          }
          return value + "px";
        }
        var iroColorPickerOptionDefaults = {
          width: 300,
          height: 300,
          color: "#fff",
          colors: [],
          padding: 6,
          layoutDirection: "vertical",
          borderColor: "#fff",
          borderWidth: 0,
          handleRadius: 8,
          activeHandleRadius: null,
          handleSvg: null,
          handleProps: {
            x: 0,
            y: 0
          },
          wheelLightness: true,
          wheelAngle: 0,
          wheelDirection: "anticlockwise",
          sliderSize: null,
          sliderMargin: 12,
          boxHeight: null
        };
        var SECONDARY_EVENTS = [
          "mousemove",
          "touchmove",
          "mouseup",
          "touchend"
          /* TouchEnd */
        ];
        var IroComponentWrapper = /* @__PURE__ */ (function(Component) {
          function IroComponentWrapper2(props) {
            Component.call(this, props);
            this.uid = (Math.random() + 1).toString(36).substring(5);
          }
          if (Component) IroComponentWrapper2.__proto__ = Component;
          IroComponentWrapper2.prototype = Object.create(Component && Component.prototype);
          IroComponentWrapper2.prototype.constructor = IroComponentWrapper2;
          IroComponentWrapper2.prototype.render = function render(props) {
            var eventHandler = this.handleEvent.bind(this);
            var rootProps = {
              onMouseDown: eventHandler,
              // https://github.com/jaames/iro.js/issues/126
              // https://github.com/preactjs/preact/issues/2113#issuecomment-553408767
              ontouchstart: eventHandler
            };
            var isHorizontal = props.layoutDirection === "horizontal";
            var margin = props.margin === null ? props.sliderMargin : props.margin;
            var rootStyles = {
              overflow: "visible",
              display: isHorizontal ? "inline-block" : "block"
            };
            if (props.index > 0) {
              rootStyles[isHorizontal ? "marginLeft" : "marginTop"] = margin;
            }
            return h(d, null, props.children(this.uid, rootProps, rootStyles));
          };
          IroComponentWrapper2.prototype.handleEvent = function handleEvent(e2) {
            var this$1 = this;
            var inputHandler = this.props.onInput;
            var bounds = this.base.getBoundingClientRect();
            e2.preventDefault();
            var point = e2.touches ? e2.changedTouches[0] : e2;
            var x2 = point.clientX - bounds.left;
            var y2 = point.clientY - bounds.top;
            switch (e2.type) {
              case "mousedown":
              case "touchstart":
                var result = inputHandler(
                  x2,
                  y2,
                  0
                  /* Start */
                );
                if (result !== false) {
                  SECONDARY_EVENTS.forEach(function(event) {
                    document.addEventListener(event, this$1, { passive: false });
                  });
                }
                break;
              case "mousemove":
              case "touchmove":
                inputHandler(
                  x2,
                  y2,
                  1
                  /* Move */
                );
                break;
              case "mouseup":
              case "touchend":
                inputHandler(
                  x2,
                  y2,
                  2
                  /* End */
                );
                SECONDARY_EVENTS.forEach(function(event) {
                  document.removeEventListener(event, this$1, { passive: false });
                });
                break;
            }
          };
          return IroComponentWrapper2;
        })(m);
        function IroHandle(props) {
          var radius = props.r;
          var url = props.url;
          var cx = radius;
          var cy = radius;
          return h(
            "svg",
            { className: "IroHandle IroHandle--" + props.index + " " + (props.isActive ? "IroHandle--isActive" : ""), style: {
              "-webkit-tap-highlight-color": "rgba(0, 0, 0, 0);",
              transform: "translate(" + cssValue(props.x) + ", " + cssValue(props.y) + ")",
              willChange: "transform",
              top: cssValue(-radius),
              left: cssValue(-radius),
              width: cssValue(radius * 2),
              height: cssValue(radius * 2),
              position: "absolute",
              overflow: "visible"
            } },
            url && h("use", Object.assign({ xlinkHref: resolveSvgUrl(url) }, props.props)),
            !url && h("circle", { cx, cy, r: radius, fill: "none", "stroke-width": 2, stroke: "#000" }),
            !url && h("circle", { cx, cy, r: radius - 2, fill: props.fill, "stroke-width": 2, stroke: "#fff" })
          );
        }
        IroHandle.defaultProps = {
          fill: "none",
          x: 0,
          y: 0,
          r: 8,
          url: null,
          props: { x: 0, y: 0 }
        };
        function IroSlider(props) {
          var activeIndex = props.activeIndex;
          var activeColor = activeIndex !== void 0 && activeIndex < props.colors.length ? props.colors[activeIndex] : props.color;
          var ref = getSliderDimensions(props);
          var width = ref.width;
          var height = ref.height;
          var radius = ref.radius;
          var handlePos = getSliderHandlePosition(props, activeColor);
          var gradient = getSliderGradient(props, activeColor);
          function handleInput(x2, y2, type) {
            var value = getSliderValueFromInput(props, x2, y2);
            props.parent.inputActive = true;
            activeColor[props.sliderType] = value;
            props.onInput(type, props.id);
          }
          return h(IroComponentWrapper, Object.assign({}, props, { onInput: handleInput }), function(uid, rootProps, rootStyles) {
            return h(
              "div",
              Object.assign({}, rootProps, { className: "IroSlider", style: Object.assign(
                {},
                {
                  position: "relative",
                  width: cssValue(width),
                  height: cssValue(height),
                  borderRadius: cssValue(radius),
                  // checkered bg to represent alpha
                  background: "conic-gradient(#ccc 25%, #fff 0 50%, #ccc 0 75%, #fff 0)",
                  backgroundSize: "8px 8px"
                },
                rootStyles
              ) }),
              h("div", { className: "IroSliderGradient", style: Object.assign(
                {},
                {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  borderRadius: cssValue(radius),
                  background: cssGradient("linear", props.layoutDirection === "horizontal" ? "to top" : "to right", gradient)
                },
                cssBorderStyles(props)
              ) }),
              h(IroHandle, { isActive: true, index: activeColor.index, r: props.handleRadius, url: props.handleSvg, props: props.handleProps, x: handlePos.x, y: handlePos.y })
            );
          });
        }
        IroSlider.defaultProps = Object.assign({}, sliderDefaultOptions);
        function IroBox(props) {
          var ref = getBoxDimensions(props);
          var width = ref.width;
          var height = ref.height;
          var radius = ref.radius;
          var colors = props.colors;
          var colorPicker = props.parent;
          var activeIndex = props.activeIndex;
          var activeColor = activeIndex !== void 0 && activeIndex < props.colors.length ? props.colors[activeIndex] : props.color;
          var gradients = getBoxGradients(props, activeColor);
          var handlePositions = colors.map(function(color) {
            return getBoxHandlePosition(props, color);
          });
          function handleInput(x2, y2, inputType) {
            if (inputType === 0) {
              var activeHandle = getHandleAtPoint(props, x2, y2, handlePositions);
              if (activeHandle !== null) {
                colorPicker.setActiveColor(activeHandle);
              } else {
                colorPicker.inputActive = true;
                activeColor.hsv = getBoxValueFromInput(props, x2, y2);
                props.onInput(inputType, props.id);
              }
            } else if (inputType === 1) {
              colorPicker.inputActive = true;
              activeColor.hsv = getBoxValueFromInput(props, x2, y2);
            }
            props.onInput(inputType, props.id);
          }
          return h(IroComponentWrapper, Object.assign({}, props, { onInput: handleInput }), function(uid, rootProps, rootStyles) {
            return h(
              "div",
              Object.assign({}, rootProps, { className: "IroBox", style: Object.assign(
                {},
                {
                  width: cssValue(width),
                  height: cssValue(height),
                  position: "relative"
                },
                rootStyles
              ) }),
              h("div", { className: "IroBox", style: Object.assign(
                {},
                {
                  width: "100%",
                  height: "100%",
                  borderRadius: cssValue(radius)
                },
                cssBorderStyles(props),
                { background: cssGradient("linear", "to bottom", gradients[1]) + "," + cssGradient("linear", "to right", gradients[0]) }
              ) }),
              colors.filter(function(color) {
                return color !== activeColor;
              }).map(function(color) {
                return h(IroHandle, { isActive: false, index: color.index, fill: color.hslString, r: props.handleRadius, url: props.handleSvg, props: props.handleProps, x: handlePositions[color.index].x, y: handlePositions[color.index].y });
              }),
              h(IroHandle, { isActive: true, index: activeColor.index, fill: activeColor.hslString, r: props.activeHandleRadius || props.handleRadius, url: props.handleSvg, props: props.handleProps, x: handlePositions[activeColor.index].x, y: handlePositions[activeColor.index].y })
            );
          });
        }
        var HUE_GRADIENT_CLOCKWISE = "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)";
        var HUE_GRADIENT_ANTICLOCKWISE = "conic-gradient(red, magenta, blue, aqua, lime, yellow, red)";
        function IroWheel(props) {
          var ref = getWheelDimensions(props);
          var width = ref.width;
          var colors = props.colors;
          var borderWidth = props.borderWidth;
          var colorPicker = props.parent;
          var activeColor = props.color;
          var hsv = activeColor.hsv;
          var handlePositions = colors.map(function(color) {
            return getWheelHandlePosition(props, color);
          });
          var circleStyles = {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            boxSizing: "border-box"
          };
          function handleInput(x2, y2, inputType) {
            if (inputType === 0) {
              if (!isInputInsideWheel(props, x2, y2)) {
                return false;
              }
              var activeHandle = getHandleAtPoint(props, x2, y2, handlePositions);
              if (activeHandle !== null) {
                colorPicker.setActiveColor(activeHandle);
              } else {
                colorPicker.inputActive = true;
                activeColor.hsv = getWheelValueFromInput(props, x2, y2);
                props.onInput(inputType, props.id);
              }
            } else if (inputType === 1) {
              colorPicker.inputActive = true;
              activeColor.hsv = getWheelValueFromInput(props, x2, y2);
            }
            props.onInput(inputType, props.id);
          }
          return h(IroComponentWrapper, Object.assign({}, props, { onInput: handleInput }), function(uid, rootProps, rootStyles) {
            return h(
              "div",
              Object.assign({}, rootProps, { className: "IroWheel", style: Object.assign(
                {},
                {
                  width: cssValue(width),
                  height: cssValue(width),
                  position: "relative"
                },
                rootStyles
              ) }),
              h("div", { className: "IroWheelHue", style: Object.assign(
                {},
                circleStyles,
                {
                  transform: "rotateZ(" + (props.wheelAngle + 90) + "deg)",
                  background: props.wheelDirection === "clockwise" ? HUE_GRADIENT_CLOCKWISE : HUE_GRADIENT_ANTICLOCKWISE
                }
              ) }),
              h("div", { className: "IroWheelSaturation", style: Object.assign(
                {},
                circleStyles,
                { background: "radial-gradient(circle closest-side, #fff, transparent)" }
              ) }),
              props.wheelLightness && h("div", { className: "IroWheelLightness", style: Object.assign(
                {},
                circleStyles,
                {
                  background: "#000",
                  opacity: 1 - hsv.v / 100
                }
              ) }),
              h("div", { className: "IroWheelBorder", style: Object.assign(
                {},
                circleStyles,
                cssBorderStyles(props)
              ) }),
              colors.filter(function(color) {
                return color !== activeColor;
              }).map(function(color) {
                return h(IroHandle, { isActive: false, index: color.index, fill: color.hslString, r: props.handleRadius, url: props.handleSvg, props: props.handleProps, x: handlePositions[color.index].x, y: handlePositions[color.index].y });
              }),
              h(IroHandle, { isActive: true, index: activeColor.index, fill: activeColor.hslString, r: props.activeHandleRadius || props.handleRadius, url: props.handleSvg, props: props.handleProps, x: handlePositions[activeColor.index].x, y: handlePositions[activeColor.index].y })
            );
          });
        }
        function createWidget(WidgetComponent) {
          var widgetFactory = function(parent, props) {
            var widget;
            var widgetRoot = document.createElement("div");
            I(h(WidgetComponent, Object.assign(
              {},
              { ref: function(ref) {
                return widget = ref;
              } },
              props
            )), widgetRoot);
            function mountWidget() {
              var container = parent instanceof Element ? parent : document.querySelector(parent);
              container.appendChild(widget.base);
              widget.onMount(container);
            }
            if (document.readyState !== "loading") {
              mountWidget();
            } else {
              document.addEventListener("DOMContentLoaded", mountWidget);
            }
            return widget;
          };
          widgetFactory.prototype = WidgetComponent.prototype;
          Object.assign(widgetFactory, WidgetComponent);
          widgetFactory.__component = WidgetComponent;
          return widgetFactory;
        }
        var IroColorPicker = /* @__PURE__ */ (function(Component) {
          function IroColorPicker2(props) {
            var this$1 = this;
            Component.call(this, props);
            this.colors = [];
            this.inputActive = false;
            this.events = {};
            this.activeEvents = {};
            this.deferredEvents = {};
            this.id = props.id;
            var colors = props.colors.length > 0 ? props.colors : [props.color];
            colors.forEach(function(colorValue) {
              return this$1.addColor(colorValue);
            });
            this.setActiveColor(0);
            this.state = Object.assign(
              {},
              props,
              {
                color: this.color,
                colors: this.colors,
                layout: props.layout
              }
            );
          }
          if (Component) IroColorPicker2.__proto__ = Component;
          IroColorPicker2.prototype = Object.create(Component && Component.prototype);
          IroColorPicker2.prototype.constructor = IroColorPicker2;
          IroColorPicker2.prototype.addColor = function addColor(color, index) {
            if (index === void 0) index = this.colors.length;
            var newColor = new IroColor(color, this.onColorChange.bind(this));
            this.colors.splice(index, 0, newColor);
            this.colors.forEach(function(color2, index2) {
              return color2.index = index2;
            });
            if (this.state) {
              this.setState({ colors: this.colors });
            }
            this.deferredEmit("color:init", newColor);
          };
          IroColorPicker2.prototype.removeColor = function removeColor(index) {
            var color = this.colors.splice(index, 1)[0];
            color.unbind();
            this.colors.forEach(function(color2, index2) {
              return color2.index = index2;
            });
            if (this.state) {
              this.setState({ colors: this.colors });
            }
            if (color.index === this.color.index) {
              this.setActiveColor(0);
            }
            this.emit("color:remove", color);
          };
          IroColorPicker2.prototype.setActiveColor = function setActiveColor(index) {
            this.color = this.colors[index];
            if (this.state) {
              this.setState({ color: this.color });
            }
            this.emit("color:setActive", this.color);
          };
          IroColorPicker2.prototype.setColors = function setColors(newColorValues, activeColorIndex) {
            var this$1 = this;
            if (activeColorIndex === void 0) activeColorIndex = 0;
            this.colors.forEach(function(color) {
              return color.unbind();
            });
            this.colors = [];
            newColorValues.forEach(function(colorValue) {
              return this$1.addColor(colorValue);
            });
            this.setActiveColor(activeColorIndex);
            this.emit("color:setAll", this.colors);
          };
          IroColorPicker2.prototype.on = function on(eventList, callback) {
            var this$1 = this;
            var events = this.events;
            (!Array.isArray(eventList) ? [eventList] : eventList).forEach(function(eventType) {
              (events[eventType] || (events[eventType] = [])).push(callback);
              if (this$1.deferredEvents[eventType]) {
                this$1.deferredEvents[eventType].forEach(function(args) {
                  callback.apply(null, args);
                });
                this$1.deferredEvents[eventType] = [];
              }
            });
          };
          IroColorPicker2.prototype.off = function off(eventList, callback) {
            var this$1 = this;
            (!Array.isArray(eventList) ? [eventList] : eventList).forEach(function(eventType) {
              var callbackList = this$1.events[eventType];
              if (callbackList) {
                callbackList.splice(callbackList.indexOf(callback), 1);
              }
            });
          };
          IroColorPicker2.prototype.emit = function emit(eventType) {
            var this$1 = this;
            var args = [], len = arguments.length - 1;
            while (len-- > 0) args[len] = arguments[len + 1];
            var activeEvents = this.activeEvents;
            var isEventActive = activeEvents.hasOwnProperty(eventType) ? activeEvents[eventType] : false;
            if (!isEventActive) {
              activeEvents[eventType] = true;
              var callbackList = this.events[eventType] || [];
              callbackList.forEach(function(fn) {
                return fn.apply(this$1, args);
              });
              activeEvents[eventType] = false;
            }
          };
          IroColorPicker2.prototype.deferredEmit = function deferredEmit(eventType) {
            var ref;
            var args = [], len = arguments.length - 1;
            while (len-- > 0) args[len] = arguments[len + 1];
            var deferredEvents = this.deferredEvents;
            (ref = this).emit.apply(ref, [eventType].concat(args));
            (deferredEvents[eventType] || (deferredEvents[eventType] = [])).push(args);
          };
          IroColorPicker2.prototype.setOptions = function setOptions(newOptions) {
            this.setState(newOptions);
          };
          IroColorPicker2.prototype.resize = function resize(width) {
            this.setOptions({ width });
          };
          IroColorPicker2.prototype.reset = function reset() {
            this.colors.forEach(function(color) {
              return color.reset();
            });
            this.setState({ colors: this.colors });
          };
          IroColorPicker2.prototype.onMount = function onMount(container) {
            this.el = container;
            this.deferredEmit("mount", this);
          };
          IroColorPicker2.prototype.onColorChange = function onColorChange(color, changes) {
            this.setState({ color: this.color });
            if (this.inputActive) {
              this.inputActive = false;
              this.emit("input:change", color, changes);
            }
            this.emit("color:change", color, changes);
          };
          IroColorPicker2.prototype.emitInputEvent = function emitInputEvent(type, originId) {
            if (type === 0) {
              this.emit("input:start", this.color, originId);
            } else if (type === 1) {
              this.emit("input:move", this.color, originId);
            } else if (type === 2) {
              this.emit("input:end", this.color, originId);
            }
          };
          IroColorPicker2.prototype.render = function render(props, state) {
            var this$1 = this;
            var layout = state.layout;
            if (!Array.isArray(layout)) {
              switch (layout) {
                // TODO: implement some?
                default:
                  layout = [
                    { component: IroWheel },
                    { component: IroSlider }
                  ];
              }
              if (state.transparency) {
                layout.push({
                  component: IroSlider,
                  options: {
                    sliderType: "alpha"
                  }
                });
              }
            }
            return h("div", { class: "IroColorPicker", id: state.id, style: {
              display: state.display
            } }, layout.map(function(ref, componentIndex) {
              var UiComponent = ref.component;
              var options = ref.options;
              return h(UiComponent, Object.assign({}, state, options, { ref: void 0, onInput: this$1.emitInputEvent.bind(this$1), parent: this$1, index: componentIndex }));
            }));
          };
          return IroColorPicker2;
        })(m);
        IroColorPicker.defaultProps = Object.assign(
          {},
          iroColorPickerOptionDefaults,
          {
            colors: [],
            display: "block",
            id: null,
            layout: "default",
            margin: null
          }
        );
        var IroColorPickerWidget = createWidget(IroColorPicker);
        var iro2;
        (function(iro3) {
          iro3.version = "5.5.2";
          iro3.Color = IroColor;
          iro3.ColorPicker = IroColorPickerWidget;
          var ui;
          (function(ui2) {
            ui2.h = h;
            ui2.ComponentBase = IroComponentWrapper;
            ui2.Handle = IroHandle;
            ui2.Slider = IroSlider;
            ui2.Wheel = IroWheel;
            ui2.Box = IroBox;
          })(ui = iro3.ui || (iro3.ui = {}));
        })(iro2 || (iro2 = {}));
        var iro$1 = iro2;
        return iro$1;
      });
    }
  });

  // src/defaults/defaultsController.ts
  init_coms();
  init_renderutils();

  // src/interfaces/database.ts
  init_elements();
  var PersistedProps = Object.fromEntries(
    Object.entries(elements).filter(([key]) => key !== "groupElement").map(([key, val]) => [key, val.$persist ?? []])
  );
  var DBElementsProps = Object.fromEntries(
    Object.entries(PersistedProps).map(([k, v]) => [k, [...v]])
  );

  // src/defaults/defaultsController.ts
  init_elements();

  // src/library/colorpicker.ts
  init_renderutils();
  init_utils();
  var iro = require_iro();
  var pickerMap = /* @__PURE__ */ new WeakMap();
  var popoverMap = /* @__PURE__ */ new WeakMap();
  var hostMap = /* @__PURE__ */ new WeakMap();
  var swatchMap = /* @__PURE__ */ new WeakMap();
  var suppressMap = /* @__PURE__ */ new WeakMap();
  function isEditorWindow() {
    return Boolean(document.getElementById("dialog"));
  }
  function getSelectedElementId() {
    const propsList = document.getElementById("propertiesList");
    const boundId = propsList?.dataset?.currentElementId || "";
    return boundId || null;
  }
  function isValidHex(hex) {
    try {
      return utils.isValidColor(hex);
    } catch {
      return false;
    }
  }
  function buildPicker(host, initialColor) {
    const picker = new iro.ColorPicker(
      host,
      {
        width: 250,
        // allow room for vertical sliders next to the box
        color: isValidHex(initialColor) ? initialColor : "#000000",
        layoutDirection: "horizontal",
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
              sliderType: "value",
              layoutDirection: "vertical",
              height: 180
            }
          },
          {
            component: iro.ui.Slider,
            options: {
              sliderType: "hue",
              layoutDirection: "vertical",
              height: 180
            }
          }
        ]
      }
    );
    return picker;
  }
  function ensurePickerFor(input) {
    const existing = pickerMap.get(input);
    if (existing) return existing;
    let picker;
    const pop = document.createElement("div");
    pop.className = "color-popover";
    pop.style.position = "absolute";
    pop.style.zIndex = "2000";
    pop.style.display = "none";
    document.body.appendChild(pop);
    const host = document.createElement("div");
    host.style.minWidth = "250px";
    host.style.minHeight = "320px";
    host.style.position = "relative";
    pop.appendChild(host);
    picker = buildPicker(host, input.value);
    picker.on("color:change", (color) => {
      if (suppressMap.get(input)) return;
      const hex = color.hexString;
      applyColorToInput(
        input,
        hex,
        /*liveOnly*/
        true
      );
    });
    pickerMap.set(input, picker);
    popoverMap.set(input, pop);
    hostMap.set(input, host);
    return picker;
  }
  function togglePopover(input, open) {
    const pop = popoverMap.get(input) || ensurePickerFor(input) && popoverMap.get(input);
    if (!pop) return;
    if (open === void 0) {
      open = pop.style.display === "none";
    }
    if (!open) {
      pop.style.display = "none";
      return;
    }
    const anchorEl = swatchMap.get(input) || input;
    const rect = anchorEl.getBoundingClientRect();
    const pad = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = rect.right + pad;
    let top = rect.top;
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
    pop.style.display = "block";
    pop.style.visibility = "hidden";
    requestAnimationFrame(() => {
      const host = hostMap.get(input);
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
      newLeft = Math.min(
        Math.max(newLeft, pad),
        Math.max(pad, vw - contentW - pad)
      );
      newTop = Math.min(
        Math.max(newTop, pad),
        Math.max(pad, vh - contentH - pad)
      );
      pop.style.left = `${newLeft}px`;
      pop.style.top = `${newTop}px`;
      pop.style.visibility = "visible";
    });
    const picker = ensurePickerFor(input);
    try {
      suppressMap.set(input, true);
      const valid = utils.isValidColor(input.value);
      if (valid) {
        const desiredHex = String(input.value).trim().toLowerCase();
        const currentHex = String(picker.color.hexString || "").toLowerCase();
        if (desiredHex && desiredHex !== currentHex) {
          picker.color.set(desiredHex);
        }
      }
    } finally {
      setTimeout(() => suppressMap.delete(input), 0);
    }
    setTimeout(() => {
      const onDocClick = (ev) => {
        if (!pop.contains(ev.target) && ev.target !== swatchMap.get(input)) {
          pop.style.display = "none";
          document.removeEventListener("mousedown", onDocClick, true);
          if (!isEditorWindow()) {
            input.dispatchEvent(new Event("change", { bubbles: true }));
          } else {
            input.blur();
          }
        }
      };
      document.addEventListener("mousedown", onDocClick, true);
    }, 0);
  }
  function applyColorToInput(input, hex, liveOnly = false) {
    input.value = hex;
    const sw = swatchMap.get(input);
    if (sw) {
      sw.style.background = hex;
    }
    if (isEditorWindow()) {
      const propName = input.name;
      const selected_id = getSelectedElementId();
      if (selected_id) {
        const selected = document.getElementById(selected_id);
        if (selected) {
          renderutils.updateElement(
            selected,
            {
              [propName]: hex
            }
            // TODO: as AnyElementProperties
          );
        }
      }
      if (!liveOnly) {
        input.blur();
      }
    } else if (!liveOnly) {
      input.dispatchEvent(
        new Event(
          "change",
          {
            bubbles: true
          }
        )
      );
    }
  }
  function enhanceColorInput(input) {
    if (input.dataset.hasColorPicker) return;
    input.dataset.hasColorPicker = "true";
    const parent = input.parentElement;
    if (!parent) return;
    const wrapper = document.createElement("div");
    wrapper.className = "color-input-wrapper property-action-wrapper";
    parent.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "color-swatch-btn property-action-btn";
    swatch.title = "Pick color";
    swatch.style.background = utils.isValidColor(input.value) ? input.value : "#000000";
    swatch.style.border = "0.5px solid #000000";
    swatch.setAttribute("tabindex", "-1");
    swatch.addEventListener("mousedown", (e) => e.preventDefault());
    swatch.addEventListener("keydown", (e) => e.preventDefault());
    wrapper.appendChild(swatch);
    swatchMap.set(input, swatch);
    swatch.addEventListener("click", () => togglePopover(input, true));
    input.addEventListener("input", () => {
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
  var escapeInstalled = false;
  function attachColorPickers(root) {
    const scope = root || document;
    const candidates = Array.from(
      scope.querySelectorAll("#propertiesList input")
    ).filter((el) => {
      return typeof el.name === "string" && el.name.toLowerCase().includes("color");
    });
    for (const input of candidates) {
      enhanceColorInput(input);
    }
    if (!escapeInstalled) {
      escapeInstalled = true;
      document.addEventListener("keydown", (ev) => {
        const key = ev.key || ev.code;
        if (key === "Escape" || key === "Esc") {
          const pops = Array.from(document.querySelectorAll(".color-popover"));
          pops.forEach((p) => p.style.display = "none");
          ev.stopPropagation();
        }
      }, true);
    }
  }
  function syncColorPickers(root) {
    const scope = root || document;
    const candidates = Array.from(
      scope.querySelectorAll("#propertiesList input")
    ).filter((el) => {
      return typeof el.name === "string" && el.name.toLowerCase().includes("color");
    });
    for (const input of candidates) {
      const sw = swatchMap.get(input);
      if (sw) {
        const v = input.value;
        sw.style.background = utils.isValidColor(v) ? v : "#000000";
      }
      const picker = pickerMap.get(input);
      if (picker && utils.isValidColor(input.value)) {
        picker.color.set(input.value);
      }
    }
  }

  // src/library/iconpicker.ts
  init_renderutils();
  var COMMON_ICONS = [
    "arrow-left",
    "arrow-right",
    "arrow-up",
    "arrow-down",
    "chevron-left",
    "chevron-right",
    "chevron-up",
    "chevron-down",
    "triangle-left",
    "triangle-right",
    "triangle-up",
    "triangle-down",
    "add",
    "dash",
    "close",
    "check",
    "warning",
    "info",
    "play",
    "stop-circle",
    "search",
    "settings-gear",
    "home",
    "trash",
    "edit",
    "folder",
    "file"
  ];
  var metadataPromise = null;
  var normalizeIconValue = (value) => {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw || raw === "none") return "none";
    if (raw === "minus" || raw === "remove") return "dash";
    if (raw === "x") return "close";
    return raw;
  };
  var loadCodiconMetadata = async () => {
    if (metadataPromise) return metadataPromise;
    metadataPromise = fetch("../assets/codicons/metadata.json").then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load codicon metadata: ${response.status}`);
      }
      const raw = await response.json();
      return Object.entries(raw).map(([name, meta]) => ({
        name,
        tags: Array.isArray(meta.tags) ? meta.tags.map(String) : [],
        category: String(meta.category || ""),
        description: String(meta.description || "")
      })).sort((a, b) => a.name.localeCompare(b.name));
    }).catch((error) => {
      console.error(error);
      return [];
    });
    return metadataPromise;
  };
  var updateIconPreview = (input) => {
    if (!input) return;
    const control = input.closest(".icon-property-control");
    if (!control) return;
    const icon = normalizeIconValue(input.value);
    input.value = icon;
  };
  var commitIconValue = (input, value, mode) => {
    input.value = value;
    updateIconPreview(input);
    if (mode === "editor") {
      input.dispatchEvent(new FocusEvent("blur"));
    } else {
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };
  var createIconCard = (entry, activeName, onSelect) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "icon-picker__item";
    button.dataset.iconName = entry.name;
    button.title = entry.description || entry.name;
    if (entry.name === activeName) {
      button.classList.add("is-active");
    }
    const glyph = document.createElement("span");
    glyph.className = `icon-picker__glyph codicon codicon-${entry.name}`;
    glyph.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.className = "icon-picker__label";
    label.textContent = entry.name;
    button.appendChild(glyph);
    button.appendChild(label);
    button.addEventListener("click", () => onSelect(entry.name));
    return button;
  };
  var ensurePickerShell = () => {
    let shell = document.getElementById("iconPickerModal");
    if (shell) return shell;
    shell = document.createElement("div");
    shell.id = "iconPickerModal";
    shell.className = "icon-picker-modal hidden";
    shell.innerHTML = `
        <div class="icon-picker-modal__backdrop" data-action="close"></div>
        <div class="icon-picker-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="iconPickerTitle">
            <div class="icon-picker-modal__header">
                <div>
                    <h2 id="iconPickerTitle">Choose Icon</h2>
                    <p>Search Codicons and pick one for the selected element.</p>
                </div>
                <button type="button" class="icon-picker-modal__action custombutton" data-action="close">Close</button>
            </div>
            <div class="icon-picker-modal__controls">
                <input type="text" id="iconPickerSearch" placeholder="Search icons" aria-label="Search icons" />
                <button type="button" class="icon-picker-modal__action custombutton" id="iconPickerClear">None</button>
            </div>
            <div class="icon-picker-modal__body">
                <section class="icon-picker-section" id="iconPickerCommonSection">
                    <h3>Common</h3>
                    <div class="icon-picker-grid" id="iconPickerCommonGrid"></div>
                </section>
                <section class="icon-picker-section">
                    <h3>All Icons</h3>
                    <div class="icon-picker-grid" id="iconPickerAllGrid"></div>
                </section>
            </div>
        </div>
    `;
    document.body.appendChild(shell);
    renderutils.enhanceButtons(shell);
    return shell;
  };
  var filterEntries = (entries, query) => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((entry) => {
      return entry.name.includes(q) || entry.category.toLowerCase().includes(q) || entry.description.toLowerCase().includes(q) || entry.tags.some((tag) => tag.toLowerCase().includes(q));
    });
  };
  var renderPicker = (shell, entries, activeValue, onSelect, query = "") => {
    const commonGrid = shell.querySelector("#iconPickerCommonGrid");
    const allGrid = shell.querySelector("#iconPickerAllGrid");
    const commonSection = shell.querySelector("#iconPickerCommonSection");
    const filtered = filterEntries(entries, query);
    const commonSet = new Set(COMMON_ICONS.map(normalizeIconValue));
    const commonEntries = filtered.filter((entry) => commonSet.has(entry.name));
    const allEntries = filtered.filter((entry) => !commonSet.has(entry.name));
    commonGrid.innerHTML = "";
    allGrid.innerHTML = "";
    commonSection.style.display = commonEntries.length ? "" : "none";
    commonEntries.forEach((entry) => commonGrid.appendChild(createIconCard(entry, activeValue, onSelect)));
    allEntries.forEach((entry) => allGrid.appendChild(createIconCard(entry, activeValue, onSelect)));
  };
  var openPicker = async (input, mode) => {
    const shell = ensurePickerShell();
    const search = shell.querySelector("#iconPickerSearch");
    const clear = shell.querySelector("#iconPickerClear");
    const closeButtons = shell.querySelectorAll('[data-action="close"]');
    const entries = await loadCodiconMetadata();
    const active = normalizeIconValue(input.value);
    const close = () => {
      shell.classList.add("hidden");
      document.removeEventListener("keydown", handleEscape);
    };
    const select = (value) => {
      commitIconValue(input, value, mode);
      close();
    };
    const rerender = () => {
      renderPicker(shell, entries, active, select, search.value);
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        close();
      }
    };
    search.value = "";
    rerender();
    clear.onclick = () => select("none");
    closeButtons.forEach((btn) => {
      btn.onclick = () => close();
    });
    search.oninput = () => {
      renderPicker(shell, entries, active, select, search.value);
    };
    shell.classList.remove("hidden");
    search.focus();
    document.addEventListener("keydown", handleEscape);
  };
  function attachIconPickers(options, root) {
    const scope = root || document;
    const input = scope.querySelector("#elicon");
    const trigger = scope.querySelector("#iconPickerChoose");
    if (!input || !trigger || input.dataset.hasIconPicker === "true") return;
    input.dataset.hasIconPicker = "true";
    input.readOnly = true;
    trigger.addEventListener("click", () => {
      if (trigger.disabled || input.disabled) return;
      void openPicker(input, options.mode);
    });
    updateIconPreview(input);
  }
  function syncIconPickers(root) {
    const scope = root || document;
    scope.querySelectorAll("#elicon").forEach((input) => updateIconPreview(input));
  }

  // src/defaults/defaultsController.ts
  function bootDefaultsController(transport3) {
    setRendererTransport(transport3);
    let defaultElementSelected = "";
    const effectiveIconSizeValue = (raw) => {
      if (String(raw ?? "").trim() === "0") {
        return String(coms.fontSize || 12);
      }
      return String(raw ?? "");
    };
    const initializeDefaultsController = function() {
      renderutils.setDouble([
        "width",
        "height"
      ]);
      renderutils.setIntegers([
        "size",
        "space",
        "left",
        "top",
        "iconSize",
        "handlesize",
        "updownsize",
        "handlepos",
        "lineClamp"
      ]);
      attachColorPickers();
      attachIconPickers({ mode: "defaults" });
      renderutils.enhanceButtons(document);
      renderutils.setSignedIntegers([
        "minval",
        "startval",
        "maxval"
      ]);
      const buildDefaultValuesFor = (name) => {
        const defaults = elements[name] || {};
        const allowed = DBElementsProps[name] || [];
        const map = {};
        allowed.forEach((key) => {
          const raw = defaults[key];
          if (raw === void 0 || raw === null) {
            map[key] = "";
          } else if (typeof raw === "boolean") {
            map[key] = raw ? "true" : "false";
          } else {
            map[key] = String(raw);
          }
        });
        return map;
      };
      const applyPropertiesToPanel = (name, values) => {
        const propsPanel = document.getElementById("propertiesList");
        if (!propsPanel) return;
        propsPanel.classList.remove("hidden");
        propsPanel.dataset.defaultElement = name;
        const allowed = new Set((DBElementsProps[name] || []).map(String));
        const ellist = document.querySelectorAll('#propertiesList [id^="el"]');
        ellist.forEach((field) => {
          const row = field.closest(".element-property");
          const propName = field.name;
          if (!allowed.has(propName)) {
            field.disabled = true;
            if (row) row.classList.add("hidden-element");
            return;
          }
          field.disabled = false;
          if (row) row.classList.remove("hidden-element");
          const rawValue = values[propName] ?? "";
          const displayValue = propName === "iconSize" ? effectiveIconSizeValue(rawValue) : rawValue;
          if (field.tagName === "SELECT") {
            const select = field;
            const exact = Array.from(select.options).find((opt) => opt.value === displayValue);
            const icase = exact || Array.from(select.options).find((opt) => opt.value.toLowerCase() === displayValue.toLowerCase());
            if (icase) {
              select.value = icase.value;
            } else {
              select.value = displayValue;
            }
          } else {
            field.value = displayValue;
          }
          if (!field.dataset.defaultsBound) {
            field.addEventListener("change", () => {
              const currentElement = document.getElementById("propertiesList")?.dataset.defaultElement || "";
              if (!currentElement) return;
              const allowedProps = DBElementsProps[currentElement] || [];
              if (!allowedProps.includes(field.name)) {
                showError(`Cannot save property "${field.name}" for ${currentElement}: not declared in interfaces/database.ts (DBElementsProps).`);
                field.blur();
                return;
              }
              field.blur();
              coms.sendTo(
                "main",
                "updateProperty",
                currentElement,
                field.name,
                field.value
              );
            });
            field.dataset.defaultsBound = "true";
          }
        });
      };
      const adjustSpecialUI = (name) => {
        const colorlabel = document.getElementById("colorlabel");
        if (colorlabel) {
          if (name === "sliderElement") {
            colorlabel.innerText = "Track color";
          } else {
            colorlabel.innerText = "Color";
          }
        }
        const sliderExtras = document.getElementById("sliderHandleProperties");
        if (sliderExtras) {
          if (name === "sliderElement") {
            sliderExtras.classList.remove("hidden-element");
          } else {
            sliderExtras.classList.add("hidden-element");
          }
        }
        const valuelabel = document.getElementById("valuelabel");
        if (valuelabel) {
          if (name === "selectElement") {
            valuelabel.innerText = "Values";
          } else {
            valuelabel.innerText = "Value";
          }
        }
      };
      coms.on("defaultElementSelected", (...args) => {
        const name = typeof args[0] === "string" ? args[0] : "";
        defaultElementSelected = name;
        const propsPanel = document.getElementById("propertiesList");
        if (propsPanel) {
          propsPanel.dataset.defaultElement = name;
        }
        const baseline = buildDefaultValuesFor(name);
        applyPropertiesToPanel(name, baseline);
        adjustSpecialUI(name);
        syncColorPickers();
        syncIconPickers();
      });
      coms.on("propertiesFromDB", (...args) => {
        const name = typeof args[0] === "string" ? args[0] : "";
        defaultElementSelected = name;
        const properties = args[1];
        const allowed = DBElementsProps[name] || [];
        const defaults = elements[name] || {};
        const nonPersistKeys = renderutils.getNonPersistKeys(name);
        const missingFromDBInterface = Object.keys(defaults).filter((k) => !allowed.includes(k)).filter((k) => !nonPersistKeys.includes(k));
        if (missingFromDBInterface.length > 0) {
          console.log(missingFromDBInterface);
          showError(
            `Database interface out of sync for ${name}, check interfaces/database.ts`
          );
        }
        const baseline = buildDefaultValuesFor(name);
        const merged = { ...baseline, ...properties || {} };
        applyPropertiesToPanel(name, merged);
        adjustSpecialUI(name);
        syncColorPickers();
        syncIconPickers();
      });
      document.getElementById("reset")?.addEventListener("click", () => {
        if (defaultElementSelected) {
          coms.sendTo("main", "resetProperties", defaultElementSelected);
        } else {
          showError("No default element selected to reset properties.");
        }
      });
      coms.on("resetOK", (...args) => {
        const updatedProperties = args[0];
        if (!updatedProperties) return;
        const ellist = document.querySelectorAll('#propertiesList [id^="el"]');
        ellist.forEach((el) => {
          const item = el;
          if (item.name in updatedProperties) {
            item.value = updatedProperties[item.name];
          }
        });
        syncColorPickers();
        syncIconPickers();
      });
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initializeDefaultsController, { once: true });
    } else {
      initializeDefaultsController();
    }
  }

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

  // src/shell-web/staticElementCatalog.ts
  init_elements();
  function readDefaultProperties(element) {
    const defaults = elements[element];
    const properties = DBElementsProps[element] || [];
    const out = {};
    if (!defaults) {
      return out;
    }
    for (const property of properties) {
      out[property] = String(defaults[property] ?? "");
    }
    return out;
  }
  function createStaticElementCatalog() {
    const overrides = /* @__PURE__ */ new Map();
    return {
      async getProperties(element) {
        return {
          ...readDefaultProperties(element),
          ...overrides.get(element) || {}
        };
      },
      async updateProperty(element, property, value) {
        const current = overrides.get(element) || {};
        current[property] = value;
        overrides.set(element, current);
        return true;
      },
      async resetProperties(element) {
        const defaults = readDefaultProperties(element);
        if (Object.keys(defaults).length === 0) {
          return false;
        }
        overrides.delete(element);
        return defaults;
      }
    };
  }

  // src/shell-web/browserDefaults.ts
  var transport2 = createBrowserRendererTransport();
  var catalog = createStaticElementCatalog();
  transport2.on("send-to", async (windowName, channel, ...args) => {
    if (windowName !== "main") {
      return;
    }
    if (channel === "getProperties") {
      const element = String(args[0] || "");
      const properties = await catalog.getProperties(element);
      transport2.emit("message-from-main-propertiesFromDB", element, properties);
      return;
    }
    if (channel === "resetProperties") {
      const element = String(args[0] || "");
      const properties = await catalog.resetProperties(element);
      if (properties) {
        transport2.emit("message-from-main-resetOK", properties);
        transport2.emit("message-from-main-propertiesFromDB", element, properties);
      }
      return;
    }
    if (channel === "updateProperty") {
      const element = String(args[0] || "");
      const property = String(args[1] || "");
      const value = String(args[2] || "");
      const ok = await catalog.updateProperty(element, property, value);
      if (ok) {
        const properties = await catalog.getProperties(element);
        transport2.emit("message-from-main-propertiesFromDB", element, properties);
      }
    }
  });
  bootDefaultsController(transport2);
  var emitAvailableElements = function() {
    setTimeout(() => {
      transport2.emit("addAvailableElementsTo", "defaults");
    }, 0);
  };
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", emitAvailableElements, { once: true });
  } else {
    emitAvailableElements();
  }
})();
/*! Bundled license information:

sortablejs/Sortable.min.js:
  (*! Sortable 1.15.7 - MIT | git://github.com/SortableJS/Sortable.git *)

@jaames/iro/dist/iro.js:
  (*!
   * iro.js v5.5.2
   * 2016-2021 James Daniel
   * Licensed under MPL 2.0
   * github.com/jaames/iro.js
   *)
*/
//# sourceMappingURL=browserDefaults.js.map
