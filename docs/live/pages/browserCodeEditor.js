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
          for (let i2 = 0; i2 < keys.length; i2++) {
            if (Object.hasOwn(dataset, keys[i2])) {
              if (keys[i2] == "left") {
                const elementWidth = document.getElementById(id)?.getBoundingClientRect().width;
                if (elementWidth && Number(payload[keys[i2]]) + elementWidth + 10 > dialogW) {
                  payload[keys[i2]] = String(Math.round(dialogW - elementWidth - 10));
                }
                if (Number(payload[keys[i2]]) < 10) {
                  payload[keys[i2]] = "10";
                }
                const elleft = document.getElementById("elleft");
                elleft.value = payload[keys[i2]];
              } else if (keys[i2] == "top") {
                const elementHeight = document.getElementById(id)?.getBoundingClientRect().height;
                if (elementHeight && Number(payload[keys[i2]]) + elementHeight + 10 > dialogH) {
                  payload[keys[i2]] = String(Math.round(dialogH - elementHeight - 10));
                }
                if (Number(payload[keys[i2]]) < 10) {
                  payload[keys[i2]] = "10";
                }
                const eltop = document.getElementById("eltop");
                eltop.value = payload[keys[i2]];
              }
              if (keys[i2] == "label" || keys[i2] == "width") {
                const elementWidth = document.getElementById(id)?.getBoundingClientRect().width;
                const elleft = document.getElementById("elleft");
                if (elementWidth && Number(elleft.value) + elementWidth + 10 > dialogW) {
                  const newleft = String(Math.round(dialogW - elementWidth - 10));
                  elleft.value = newleft;
                  dialog.elements[id].style.left = newleft + "px";
                }
              } else if (keys[i2] == "height") {
                const eltop = document.getElementById("eltop");
                const elementHeight = document.getElementById(id)?.getBoundingClientRect().height;
                if (elementHeight && Number(eltop.value) + elementHeight + 10 > dialogH) {
                  const newtop = String(Math.round(dialogH - elementHeight - 10));
                  eltop.value = newtop;
                  dialog.elements[id].style.top = newtop + "px";
                }
              }
            } else {
              notFound.push(keys[i2]);
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
  function unsafeStringify(arr, offset2 = 0) {
    return (byteToHex[arr[offset2 + 0]] + byteToHex[arr[offset2 + 1]] + byteToHex[arr[offset2 + 2]] + byteToHex[arr[offset2 + 3]] + "-" + byteToHex[arr[offset2 + 4]] + byteToHex[arr[offset2 + 5]] + "-" + byteToHex[arr[offset2 + 6]] + byteToHex[arr[offset2 + 7]] + "-" + byteToHex[arr[offset2 + 8]] + byteToHex[arr[offset2 + 9]] + "-" + byteToHex[arr[offset2 + 10]] + byteToHex[arr[offset2 + 11]] + byteToHex[arr[offset2 + 12]] + byteToHex[arr[offset2 + 13]] + byteToHex[arr[offset2 + 14]] + byteToHex[arr[offset2 + 15]]).toLowerCase();
  }
  var byteToHex;
  var init_stringify = __esm({
    "node_modules/uuid/dist/stringify.js"() {
      byteToHex = [];
      for (let i2 = 0; i2 < 256; ++i2) {
        byteToHex.push((i2 + 256).toString(16).slice(1));
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
      for (let i2 = 0; i2 < 16; ++i2) {
        buf[offset2 + i2] = rnds[i2];
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
        function i2(t2, e2, n2) {
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
              i2(e2, t3, n2[t3]);
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
          if (Object.getOwnPropertySymbols) for (var i3 = Object.getOwnPropertySymbols(t2), r2 = 0; r2 < i3.length; r2++) n2 = i3[r2], -1 === e2.indexOf(n2) && {}.propertyIsEnumerable.call(t2, n2) && (o2[n2] = t2[n2]);
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
          var i3 = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
          return i3 && new i3(n2);
        }
        function E(t2, e2, n2) {
          if (t2) {
            var o2 = t2.getElementsByTagName(e2), i3 = 0, r2 = o2.length;
            if (n2) for (; i3 < r2; i3++) n2(o2[i3], i3);
            return o2;
          }
          return [];
        }
        function O() {
          var t2 = document.scrollingElement;
          return t2 || document.documentElement;
        }
        function X(t2, e2, n2, o2, i3) {
          if (t2.getBoundingClientRect || t2 === window) {
            var r2, a2, l2, s2, c2, u2, d2 = t2 !== window && t2.parentNode && t2 !== O() ? (a2 = (r2 = t2.getBoundingClientRect()).top, l2 = r2.left, s2 = r2.bottom, c2 = r2.right, u2 = r2.height, r2.width) : (l2 = a2 = 0, s2 = window.innerHeight, c2 = window.innerWidth, u2 = window.innerHeight, window.innerWidth);
            if ((e2 || n2) && t2 !== window && (i3 = i3 || t2.parentNode, !y)) do {
              if (i3 && i3.getBoundingClientRect && ("none" !== R(i3, "transform") || n2 && "static" !== R(i3, "position"))) {
                var h2 = i3.getBoundingClientRect();
                a2 -= h2.top + parseInt(R(i3, "border-top-width")), l2 -= h2.left + parseInt(R(i3, "border-left-width")), s2 = a2 + r2.height, c2 = l2 + r2.width;
                break;
              }
            } while (i3 = i3.parentNode);
            return o2 && t2 !== window && (o2 = (e2 = D(i3 || t2)) && e2.a, t2 = e2 && e2.d, e2 && (s2 = (a2 /= t2) + (u2 /= t2), c2 = (l2 /= o2) + (d2 /= o2))), { top: a2, left: l2, bottom: s2, right: c2, width: d2, height: u2 };
          }
        }
        function Y(t2, e2, n2) {
          for (var o2 = M(t2, true), i3 = X(t2)[e2]; o2; ) {
            var r2 = X(o2)[n2];
            if (!("top" === n2 || "left" === n2 ? r2 <= i3 : i3 <= r2)) return o2;
            if (o2 === O()) break;
            o2 = M(o2, false);
          }
          return false;
        }
        function B(t2, e2, n2, o2) {
          for (var i3 = 0, r2 = 0, a2 = t2.children; r2 < a2.length; ) {
            if ("none" !== a2[r2].style.display && a2[r2] !== Ht.ghost && (o2 || a2[r2] !== Ht.dragged) && P(a2[r2], n2.draggable, t2, false)) {
              if (i3 === e2) return a2[r2];
              i3++;
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
            var i3 = D(t2), r2 = i3.a, i3 = i3.d;
          } while (e2 += t2.scrollLeft * r2, n2 += t2.scrollTop * i3, t2 !== o2 && (t2 = t2.parentNode));
          return [e2, n2];
        }
        function M(t2, e2) {
          if (!t2 || !t2.getBoundingClientRect) return O();
          var n2 = t2, o2 = false;
          do {
            if (n2.clientWidth < n2.scrollWidth || n2.clientHeight < n2.scrollHeight) {
              var i3 = R(n2);
              if (n2.clientWidth < n2.scrollWidth && ("auto" == i3.overflowX || "scroll" == i3.overflowX) || n2.clientHeight < n2.scrollHeight && ("auto" == i3.overflowY || "scroll" == i3.overflowY)) {
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
        function L(n2, o2, i3) {
          var r2 = {};
          return Array.from(n2.children).forEach(function(t2) {
            var e2;
            P(t2, o2.draggable, n2, false) && !t2.animated && t2 !== i3 && (e2 = X(t2), r2.left = Math.min(null !== (t2 = r2.left) && void 0 !== t2 ? t2 : 1 / 0, e2.left), r2.top = Math.min(null !== (t2 = r2.top) && void 0 !== t2 ? t2 : 1 / 0, e2.top), r2.right = Math.max(null !== (t2 = r2.right) && void 0 !== t2 ? t2 : -1 / 0, e2.right), r2.bottom = Math.max(null !== (t2 = r2.bottom) && void 0 !== t2 ? t2 : -1 / 0, e2.bottom));
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
              var e3 = 0, n2 = t3.target, o3 = n2.fromRect, i3 = X(n2), r2 = n2.prevFromRect, a2 = n2.prevToRect, l2 = t3.rect, s2 = D(n2, true);
              s2 && (i3.top -= s2.f, i3.left -= s2.e), n2.toRect = i3, n2.thisAnimationDuration && _(r2, i3) && !_(o3, i3) && (l2.top - i3.top) / (l2.left - i3.left) == (o3.top - i3.top) / (o3.left - i3.left) && (t3 = l2, s2 = r2, r2 = a2, a2 = c2.options, e3 = Math.sqrt(Math.pow(s2.top - t3.top, 2) + Math.pow(s2.left - t3.left, 2)) / Math.sqrt(Math.pow(s2.top - r2.top, 2) + Math.pow(s2.left - r2.left, 2)) * a2.animation), _(i3, o3) || (n2.prevFromRect = o3, n2.prevToRect = i3, e3 = e3 || c2.options.animation, c2.animate(n2, l2, i3, e3)), e3 && (u2 = true, d2 = Math.max(d2, e3), clearTimeout(n2.animationResetTimer), n2.animationResetTimer = setTimeout(function() {
                n2.animationTime = 0, n2.prevFromRect = null, n2.fromRect = null, n2.prevToRect = null, n2.thisAnimationDuration = null;
              }, e3), n2.thisAnimationDuration = e3);
            }), clearTimeout(e2), u2 ? e2 = setTimeout(function() {
              "function" == typeof t2 && t2();
            }, d2) : "function" == typeof t2 && t2(), o2 = [];
          }, animate: function(t2, e3, n2, o3) {
            var i3, r2;
            o3 && (R(t2, "transition", ""), R(t2, "transform", ""), i3 = (r2 = D(this.el)) && r2.a, r2 = r2 && r2.d, i3 = (e3.left - n2.left) / (i3 || 1), r2 = (e3.top - n2.top) / (r2 || 1), t2.animatingX = !!i3, t2.animatingY = !!r2, R(t2, "transform", "translate3d(" + i3 + "px," + r2 + "px,0)"), this.forRepaintDummy = t2.offsetWidth, R(t2, "transition", "transform " + o3 + "ms" + (this.options.easing ? " " + this.options.easing : "")), R(t2, "transform", "translate3d(0,0,0)"), "number" == typeof t2.animated && clearTimeout(t2.animated), t2.animated = setTimeout(function() {
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
          var i3 = e2 + "Global";
          W.forEach(function(t3) {
            n2[t3.pluginName] && (n2[t3.pluginName][i3] && n2[t3.pluginName][i3](I({ sortable: n2 }, o2)), n2.options[t3.pluginName] && n2[t3.pluginName][e2] && n2[t3.pluginName][e2](I({ sortable: n2 }, o2)));
          });
        }, initializePlugins: function(n2, o2, i3, t2) {
          for (var e2 in W.forEach(function(t3) {
            var e3 = t3.pluginName;
            (n2.options[e3] || t3.initializeByDefault) && ((t3 = new t3(n2, o2, n2.options)).sortable = n2, t3.options = n2.options, n2[e3] = t3, a(i3, t3.defaults));
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
          var i3;
          return W.forEach(function(t2) {
            e2[t2.pluginName] && t2.optionListeners && "function" == typeof t2.optionListeners[n2] && (i3 = t2.optionListeners[n2].call(e2[t2.pluginName], o2));
          }), i3;
        } };
        function U(t2) {
          var e2 = t2.sortable, n2 = t2.rootEl, o2 = t2.name, i3 = t2.targetEl, r2 = t2.cloneEl, a2 = t2.toEl, l2 = t2.fromEl, s2 = t2.oldIndex, c2 = t2.newIndex, u2 = t2.oldDraggableIndex, d2 = t2.newDraggableIndex, h2 = t2.originalEvent, f2 = t2.putSortable, p2 = t2.extraEventProperties;
          if (e2 = e2 || n2 && n2[K]) {
            var g2, m2 = e2.options, t2 = "on" + o2.charAt(0).toUpperCase() + o2.substr(1);
            !window.CustomEvent || y || w ? (g2 = document.createEvent("Event")).initEvent(o2, true, true) : g2 = new CustomEvent(o2, { bubbles: true, cancelable: true }), g2.to = a2 || n2, g2.from = l2 || n2, g2.item = i3 || n2, g2.clone = r2, g2.oldIndex = s2, g2.newIndex = c2, g2.oldDraggableIndex = u2, g2.newDraggableIndex = d2, g2.originalEvent = h2, g2.pullMode = f2 ? f2.lastPutMode : void 0;
            var v2, b2 = I(I({}, p2), G.getEventProperties(o2, e2));
            for (v2 in b2) g2[v2] = b2[v2];
            n2 && n2.dispatchEvent(g2), m2[t2] && m2[t2].call(e2, g2);
          }
        }
        function q(t2, e2) {
          var n2 = (o2 = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : {}).evt, o2 = l(o2, V);
          G.pluginEvent.bind(Ht)(t2, e2, I({ dragEl: $, parentEl: Q, ghostEl: J, rootEl: tt, nextEl: et, lastDownEl: nt, cloneEl: ot, cloneHidden: it, dragStarted: vt, putSortable: ut, activeSortable: Ht.active, originalEvent: n2, oldIndex: rt, oldDraggableIndex: lt, newIndex: at2, newDraggableIndex: st, hideGhostForTarget: Yt, unhideGhostForTarget: Bt, cloneNowHidden: function() {
            it = true;
          }, cloneNowShown: function() {
            it = false;
          }, dispatchSortableEvent: function(t3) {
            Z({ sortable: e2, name: t3, originalEvent: n2 });
          } }, o2));
        }
        var V = ["evt"];
        function Z(t2) {
          U(I({ putSortable: ut, cloneEl: ot, targetEl: $, rootEl: tt, oldIndex: rt, oldDraggableIndex: lt, newIndex: at2, newDraggableIndex: st }, t2));
        }
        var $, Q, J, tt, et, nt, ot, it, rt, at2, lt, st, ct, ut, dt, ht, ft, pt, gt, mt, vt, bt, yt, wt, Dt, Et = false, St = false, _t = [], Ct = false, Tt = false, xt = [], Ot = false, Mt = [], At = "undefined" != typeof document, Nt = d, It = w || y ? "cssFloat" : "float", Pt = At && !n && !d && "draggable" in document.createElement("div"), kt = (function() {
          if (At) {
            if (y) return false;
            var t2 = document.createElement("x");
            return t2.style.cssText = "pointer-events:auto", "auto" === t2.style.pointerEvents;
          }
        })(), Rt = function(t2, e2) {
          var n2 = R(t2), o2 = parseInt(n2.width) - parseInt(n2.paddingLeft) - parseInt(n2.paddingRight) - parseInt(n2.borderLeftWidth) - parseInt(n2.borderRightWidth), i3 = B(t2, 0, e2), r2 = B(t2, 1, e2), a2 = i3 && R(i3), l2 = r2 && R(r2), s2 = a2 && parseInt(a2.marginLeft) + parseInt(a2.marginRight) + X(i3).width, t2 = l2 && parseInt(l2.marginLeft) + parseInt(l2.marginRight) + X(r2).width;
          if ("flex" === n2.display) return "column" === n2.flexDirection || "column-reverse" === n2.flexDirection ? "vertical" : "horizontal";
          if ("grid" === n2.display) return n2.gridTemplateColumns.split(" ").length <= 1 ? "vertical" : "horizontal";
          if (i3 && a2.float && "none" !== a2.float) {
            e2 = "left" === a2.float ? "left" : "right";
            return !r2 || "both" !== l2.clear && l2.clear !== e2 ? "horizontal" : "vertical";
          }
          return i3 && ("block" === a2.display || "flex" === a2.display || "table" === a2.display || "grid" === a2.display || o2 <= s2 && "none" === n2[It] || r2 && "none" === n2[It] && o2 < s2 + t2) ? "vertical" : "horizontal";
        }, Xt = function(t2) {
          function l2(r2, a2) {
            return function(t3, e3, n3, o2) {
              var i3 = t3.options.group.name && e3.options.group.name && t3.options.group.name === e3.options.group.name;
              if (null == r2 && (a2 || i3)) return true;
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
            var e2 = (i3 = t2.clientX, r2 = t2.clientY, _t.some(function(t3) {
              var e3 = t3[K].options.emptyInsertThreshold;
              if (e3 && !F(t3)) {
                var n3 = X(t3), o3 = i3 >= n3.left - e3 && i3 <= n3.right + e3, e3 = r2 >= n3.top - e3 && r2 <= n3.bottom + e3;
                return o3 && e3 ? a2 = t3 : void 0;
              }
            }), a2);
            if (e2) {
              var n2, o2 = {};
              for (n2 in t2) t2.hasOwnProperty(n2) && (o2[n2] = t2[n2]);
              o2.target = o2.rootEl = e2, o2.preventDefault = void 0, o2.stopPropagation = void 0, e2[K]._onDragOver(o2);
            }
          }
          var i3, r2, a2;
        }
        function jt(t2) {
          $ && $.parentNode[K]._isOutsideThisEl(t2.target);
        }
        function Ht(t2, e2) {
          if (!t2 || !t2.nodeType || 1 !== t2.nodeType) throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(t2));
          this.el = t2, this.options = e2 = a({}, e2), t2[K] = this;
          var n2, o2, i3 = { group: null, sort: true, disabled: false, store: null, handle: null, draggable: /^[uo]l$/i.test(t2.nodeName) ? ">li" : ">*", swapThreshold: 1, invertSwap: false, invertedSwapThreshold: null, removeCloneOnHide: true, direction: function() {
            return Rt(t2, this.options);
          }, ghostClass: "sortable-ghost", chosenClass: "sortable-chosen", dragClass: "sortable-drag", ignore: "a, img", filter: null, preventOnFilter: true, animation: 0, easing: null, setData: function(t3, e3) {
            t3.setData("Text", e3.textContent);
          }, dropBubble: false, dragoverBubble: false, dataIdAttr: "data-id", delay: 0, delayOnTouchOnly: false, touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1, forceFallback: false, fallbackClass: "sortable-fallback", fallbackOnBody: false, fallbackTolerance: 0, fallbackOffset: { x: 0, y: 0 }, supportPointer: false !== Ht.supportPointer && "PointerEvent" in window && (!u || d), emptyInsertThreshold: 5 };
          for (n2 in G.initializePlugins(this, t2, i3), i3) n2 in e2 || (e2[n2] = i3[n2]);
          for (o2 in Xt(e2), this) "_" === o2.charAt(0) && "function" == typeof this[o2] && (this[o2] = this[o2].bind(this));
          this.nativeDraggable = !e2.forceFallback && Pt, this.nativeDraggable && (this.options.touchStartThreshold = 1), e2.supportPointer ? f(t2, "pointerdown", this._onTapStart) : (f(t2, "mousedown", this._onTapStart), f(t2, "touchstart", this._onTapStart)), this.nativeDraggable && (f(t2, "dragover", this), f(t2, "dragenter", this)), _t.push(this.el), e2.store && e2.store.get && this.sort(e2.store.get(this) || []), a(this, N());
        }
        function Lt(t2, e2, n2, o2, i3, r2, a2, l2) {
          var s2, c2, u2 = t2[K], d2 = u2.options.onMove;
          return !window.CustomEvent || y || w ? (s2 = document.createEvent("Event")).initEvent("move", true, true) : s2 = new CustomEvent("move", { bubbles: true, cancelable: true }), s2.to = e2, s2.from = t2, s2.dragged = n2, s2.draggedRect = o2, s2.related = i3 || e2, s2.relatedRect = r2 || X(e2), s2.willInsertAfter = l2, s2.originalEvent = a2, t2.dispatchEvent(s2), c2 = d2 ? d2.call(u2, s2, a2) : c2;
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
            var n2 = this, o2 = this.el, t2 = this.options, i3 = t2.preventOnFilter, r2 = e2.type, a2 = e2.touches && e2.touches[0] || e2.pointerType && "touch" === e2.pointerType && e2, l2 = (a2 || e2).target, s2 = e2.target.shadowRoot && (e2.path && e2.path[0] || e2.composedPath && e2.composedPath()[0]) || l2, c2 = t2.filter;
            if (!(function(t3) {
              Mt.length = 0;
              var e3 = t3.getElementsByTagName("input"), n3 = e3.length;
              for (; n3--; ) {
                var o3 = e3[n3];
                o3.checked && Mt.push(o3);
              }
            })(o2), !$ && !(/mousedown|pointerdown/.test(r2) && 0 !== e2.button || t2.disabled) && !s2.isContentEditable && (this.nativeDraggable || !u || !l2 || "SELECT" !== l2.tagName.toUpperCase()) && !((l2 = P(l2, t2.draggable, o2, false)) && l2.animated || nt === l2)) {
              if (rt = j(l2), lt = j(l2, t2.draggable), "function" == typeof c2) {
                if (c2.call(this, e2, l2, this)) return Z({ sortable: n2, rootEl: s2, name: "filter", targetEl: l2, toEl: o2, fromEl: o2 }), q("filter", n2, { evt: e2 }), void (i3 && e2.preventDefault());
              } else if (c2 = c2 && c2.split(",").some(function(t3) {
                if (t3 = P(s2, t3.trim(), o2, false)) return Z({ sortable: n2, rootEl: t3, name: "filter", targetEl: l2, fromEl: o2, toEl: o2 }), q("filter", n2, { evt: e2 }), true;
              })) return void (i3 && e2.preventDefault());
              t2.handle && !P(s2, t2.handle, o2, false) || this._prepareDragStart(e2, a2, l2);
            }
          }
        }, _prepareDragStart: function(t2, e2, n2) {
          var o2, i3 = this, r2 = i3.el, a2 = i3.options, l2 = r2.ownerDocument;
          n2 && !$ && n2.parentNode === r2 && (o2 = X(n2), tt = r2, Q = ($ = n2).parentNode, et = $.nextSibling, nt = n2, ct = a2.group, dt = { target: Ht.dragged = $, clientX: (e2 || t2).clientX, clientY: (e2 || t2).clientY }, gt = dt.clientX - o2.left, mt = dt.clientY - o2.top, this._lastX = (e2 || t2).clientX, this._lastY = (e2 || t2).clientY, $.style["will-change"] = "all", o2 = function() {
            q("delayEnded", i3, { evt: t2 }), Ht.eventCanceled ? i3._onDrop() : (i3._disableDelayedDragEvents(), !c && i3.nativeDraggable && ($.draggable = true), i3._triggerDragStart(t2, e2), Z({ sortable: i3, name: "choose", originalEvent: t2 }), k($, a2.chosenClass, true));
          }, a2.ignore.split(",").forEach(function(t3) {
            E($, t3.trim(), Kt);
          }), f(l2, "dragover", Ft), f(l2, "mousemove", Ft), f(l2, "touchmove", Ft), a2.supportPointer ? (f(l2, "pointerup", i3._onDrop), this.nativeDraggable || f(l2, "pointercancel", i3._onDrop)) : (f(l2, "mouseup", i3._onDrop), f(l2, "touchend", i3._onDrop), f(l2, "touchcancel", i3._onDrop)), c && this.nativeDraggable && (this.options.touchStartThreshold = 4, $.draggable = true), q("delayStart", this, { evt: t2 }), !a2.delay || a2.delayOnTouchOnly && !e2 || this.nativeDraggable && (w || y) ? o2() : Ht.eventCanceled ? this._onDrop() : (a2.supportPointer ? (f(l2, "pointerup", i3._disableDelayedDrag), f(l2, "pointercancel", i3._disableDelayedDrag)) : (f(l2, "mouseup", i3._disableDelayedDrag), f(l2, "touchend", i3._disableDelayedDrag), f(l2, "touchcancel", i3._disableDelayedDrag)), f(l2, "mousemove", i3._delayedDragTouchMoveHandler), f(l2, "touchmove", i3._delayedDragTouchMoveHandler), a2.supportPointer && f(l2, "pointermove", i3._delayedDragTouchMoveHandler), i3._dragStartTimer = setTimeout(o2, a2.delay)));
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
            var e2 = this.options, n2 = e2.fallbackTolerance, o2 = e2.fallbackOffset, i3 = t2.touches ? t2.touches[0] : t2, r2 = J && D(J, true), a2 = J && r2 && r2.a, l2 = J && r2 && r2.d, e2 = Nt && Dt && S(Dt), a2 = (i3.clientX - dt.clientX + o2.x) / (a2 || 1) + (e2 ? e2[0] - xt[0] : 0) / (a2 || 1), l2 = (i3.clientY - dt.clientY + o2.y) / (l2 || 1) + (e2 ? e2[1] - xt[1] : 0) / (l2 || 1);
            if (!Ht.active && !Et) {
              if (n2 && Math.max(Math.abs(i3.clientX - this._lastX), Math.abs(i3.clientY - this._lastY)) < n2) return;
              this._onDragStart(t2, true);
            }
            J && (r2 ? (r2.e += a2 - (ft || 0), r2.f += l2 - (pt || 0)) : r2 = { a: 1, b: 0, c: 0, d: 1, e: a2, f: l2 }, r2 = "matrix(".concat(r2.a, ",").concat(r2.b, ",").concat(r2.c, ",").concat(r2.d, ",").concat(r2.e, ",").concat(r2.f, ")"), R(J, "webkitTransform", r2), R(J, "mozTransform", r2), R(J, "msTransform", r2), R(J, "transform", r2), ft = a2, pt = l2, ht = i3), t2.cancelable && t2.preventDefault();
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
          var n2 = this, o2 = t2.dataTransfer, i3 = n2.options;
          q("dragStart", this, { evt: t2 }), Ht.eventCanceled ? this._onDrop() : (q("setupClone", this), Ht.eventCanceled || ((ot = T($)).removeAttribute("id"), ot.draggable = false, ot.style["will-change"] = "", this._hideClone(), k(ot, this.options.chosenClass, false), Ht.clone = ot), n2.cloneId = zt(function() {
            q("clone", n2), Ht.eventCanceled || (n2.options.removeCloneOnHide || tt.insertBefore(ot, $), n2._hideClone(), Z({ sortable: n2, name: "clone" }));
          }), e2 || k($, i3.dragClass, true), e2 ? (St = true, n2._loopId = setInterval(n2._emulateDragOver, 50)) : (p(document, "mouseup", n2._onDrop), p(document, "touchend", n2._onDrop), p(document, "touchcancel", n2._onDrop), o2 && (o2.effectAllowed = "move", i3.setData && i3.setData.call(n2, o2, $)), f(document, "drop", n2), R($, "transform", "translateZ(0)")), Et = true, n2._dragStartId = zt(n2._dragStarted.bind(n2, e2, t2)), f(document, "selectstart", n2), vt = true, window.getSelection().removeAllRanges(), u && R(document.body, "user-select", "none"));
        }, _onDragOver: function(n2) {
          var o2, i3, r2, t2, e2, a2 = this.el, l2 = n2.target, s2 = this.options, c2 = s2.group, u2 = Ht.active, d2 = ct === c2, h2 = s2.sort, f2 = ut || u2, p2 = this, g2 = false;
          if (!Ot) {
            if (void 0 !== n2.preventDefault && n2.cancelable && n2.preventDefault(), l2 = P(l2, s2.draggable, a2, true), O2("dragOver"), Ht.eventCanceled) return g2;
            if ($.contains(n2.target) || l2.animated && l2.animatingX && l2.animatingY || p2._ignoreWhileAnimating === l2) return A2(false);
            if (St = false, u2 && !s2.disabled && (d2 ? h2 || (i3 = Q !== tt) : ut === this || (this.lastPutMode = ct.checkPull(this, u2, $, n2)) && c2.checkPut(this, u2, $, n2))) {
              if (r2 = "vertical" === this._getDirection(n2, l2), o2 = X($), O2("dragOverValid"), Ht.eventCanceled) return g2;
              if (i3) return Q = tt, M2(), this._hideClone(), O2("revert"), Ht.eventCanceled || (et ? tt.insertBefore($, et) : tt.appendChild($)), A2(true);
              var m2 = F(a2, s2.draggable);
              if (m2 && (S2 = n2, c2 = r2, x2 = X(F((E2 = this).el, E2.options.draggable)), E2 = L(E2.el, E2.options, J), !(c2 ? S2.clientX > E2.right + 10 || S2.clientY > x2.bottom && S2.clientX > x2.left : S2.clientY > E2.bottom + 10 || S2.clientX > x2.right && S2.clientY > x2.top) || m2.animated)) {
                if (m2 && (t2 = n2, e2 = r2, C2 = X(B((_2 = this).el, 0, _2.options, true)), _2 = L(_2.el, _2.options, J), e2 ? t2.clientX < _2.left - 10 || t2.clientY < C2.top && t2.clientX < C2.right : t2.clientY < _2.top - 10 || t2.clientY < C2.bottom && t2.clientX < C2.left)) {
                  var v2 = B(a2, 0, s2, true);
                  if (v2 === $) return A2(false);
                  if (D2 = X(l2 = v2), false !== Lt(tt, a2, $, o2, l2, D2, n2, false)) return M2(), a2.insertBefore($, v2), Q = a2, N2(), A2(true);
                } else if (l2.parentNode === a2) {
                  var b2, y2, w2, D2 = X(l2), E2 = $.parentNode !== a2, S2 = (S2 = $.animated && $.toRect || o2, x2 = l2.animated && l2.toRect || D2, _2 = (e2 = r2) ? S2.left : S2.top, t2 = e2 ? S2.right : S2.bottom, C2 = e2 ? S2.width : S2.height, v2 = e2 ? x2.left : x2.top, S2 = e2 ? x2.right : x2.bottom, x2 = e2 ? x2.width : x2.height, !(_2 === v2 || t2 === S2 || _2 + C2 / 2 === v2 + x2 / 2)), _2 = r2 ? "top" : "left", C2 = Y(l2, "top", "top") || Y($, "top", "top"), v2 = C2 ? C2.scrollTop : void 0;
                  if (bt !== l2 && (y2 = D2[_2], Ct = false, Tt = !S2 && s2.invertSwap || E2), 0 !== (b2 = (function(t3, e3, n3, o3, i4, r3, a3, l3) {
                    var s3 = o3 ? t3.clientY : t3.clientX, c3 = o3 ? n3.height : n3.width, t3 = o3 ? n3.top : n3.left, o3 = o3 ? n3.bottom : n3.right, n3 = false;
                    if (!a3) {
                      if (l3 && wt < c3 * i4) {
                        if (Ct = !Ct && (1 === yt ? t3 + c3 * r3 / 2 < s3 : s3 < o3 - c3 * r3 / 2) ? true : Ct) n3 = true;
                        else if (1 === yt ? s3 < t3 + wt : o3 - wt < s3) return -yt;
                      } else if (t3 + c3 * (1 - i4) / 2 < s3 && s3 < o3 - c3 * (1 - i4) / 2) return (function(t4) {
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
            q(t3, p2, I({ evt: n2, isOwner: d2, axis: r2 ? "vertical" : "horizontal", revert: i3, dragRect: o2, targetRect: D2, canSort: h2, fromSortable: f2, target: l2, completed: A2, onMove: function(t4, e4) {
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
            at2 = j($), st = j($, s2.draggable), Z({ sortable: p2, name: "change", toEl: a2, newIndex: at2, newDraggableIndex: st, originalEvent: n2 });
          }
        }, _ignoreWhileAnimating: null, _offMoveEvents: function() {
          p(document, "mousemove", this._onTouchMove), p(document, "touchmove", this._onTouchMove), p(document, "pointermove", this._onTouchMove), p(document, "dragover", Ft), p(document, "mousemove", Ft), p(document, "touchmove", Ft);
        }, _offUpEvents: function() {
          var t2 = this.el.ownerDocument;
          p(t2, "mouseup", this._onDrop), p(t2, "touchend", this._onDrop), p(t2, "pointerup", this._onDrop), p(t2, "pointercancel", this._onDrop), p(t2, "touchcancel", this._onDrop), p(document, "selectstart", this);
        }, _onDrop: function(t2) {
          var e2 = this.el, n2 = this.options;
          at2 = j($), st = j($, n2.draggable), q("drop", this, { evt: t2 }), Q = $ && $.parentNode, at2 = j($), st = j($, n2.draggable), Ht.eventCanceled || (Ct = Tt = Et = false, clearInterval(this._loopId), clearTimeout(this._dragStartTimer), Gt(this.cloneId), Gt(this._dragStartId), this.nativeDraggable && (p(document, "drop", this), p(e2, "dragstart", this._onDragStart)), this._offMoveEvents(), this._offUpEvents(), u && R(document.body, "user-select", ""), R($, "transform", ""), t2 && (vt && (t2.cancelable && t2.preventDefault(), n2.dropBubble || t2.stopPropagation()), J && J.parentNode && J.parentNode.removeChild(J), (tt === Q || ut && "clone" !== ut.lastPutMode) && ot && ot.parentNode && ot.parentNode.removeChild(ot), $ && (this.nativeDraggable && p($, "dragend", this), Kt($), $.style["will-change"] = "", vt && !Et && k($, (ut || this).options.ghostClass, false), k($, this.options.chosenClass, false), Z({ sortable: this, name: "unchoose", toEl: Q, newIndex: null, newDraggableIndex: null, originalEvent: t2 }), tt !== Q ? (0 <= at2 && (Z({ rootEl: Q, name: "add", toEl: Q, fromEl: tt, originalEvent: t2 }), Z({ sortable: this, name: "remove", toEl: Q, originalEvent: t2 }), Z({ rootEl: Q, name: "sort", toEl: Q, fromEl: tt, originalEvent: t2 }), Z({ sortable: this, name: "sort", toEl: Q, originalEvent: t2 })), ut && ut.save()) : at2 !== rt && 0 <= at2 && (Z({ sortable: this, name: "update", toEl: Q, originalEvent: t2 }), Z({ sortable: this, name: "sort", toEl: Q, originalEvent: t2 })), Ht.active && (null != at2 && -1 !== at2 || (at2 = rt, st = lt), Z({ sortable: this, name: "end", toEl: Q, originalEvent: t2 }), this.save())))), this._nulling();
        }, _nulling: function() {
          q("nulling", this), tt = $ = Q = J = et = ot = nt = it = dt = ht = vt = at2 = st = rt = lt = bt = yt = ut = ct = Ht.dragged = Ht.ghost = Ht.clone = Ht.active = null;
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
          for (var t2, e2 = [], n2 = this.el.children, o2 = 0, i3 = n2.length, r2 = this.options; o2 < i3; o2++) P(t2 = n2[o2], r2.draggable, this.el, false) && e2.push(t2.getAttribute(r2.dataIdAttr) || (function(t3) {
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
            var i3, r2 = (n2.touches ? n2.touches[0] : n2).clientX, a2 = (n2.touches ? n2.touches[0] : n2).clientY, l2 = t2.scrollSensitivity, s2 = t2.scrollSpeed, c2 = O(), u2 = false;
            qt !== e2 && (qt = e2, ee(), Ut = t2.scroll, i3 = t2.scrollFn, true === Ut && (Ut = M(e2, true)));
            var d2 = 0, h2 = Ut;
            do {
              var f2 = h2, p2 = X(f2), g2 = p2.top, m2 = p2.bottom, v2 = p2.left, b2 = p2.right, y2 = p2.width, w2 = p2.height, D2 = void 0, E2 = void 0, S2 = f2.scrollWidth, _2 = f2.scrollHeight, C2 = R(f2), T2 = f2.scrollLeft, p2 = f2.scrollTop, E2 = f2 === c2 ? (D2 = y2 < S2 && ("auto" === C2.overflowX || "scroll" === C2.overflowX || "visible" === C2.overflowX), w2 < _2 && ("auto" === C2.overflowY || "scroll" === C2.overflowY || "visible" === C2.overflowY)) : (D2 = y2 < S2 && ("auto" === C2.overflowX || "scroll" === C2.overflowX), w2 < _2 && ("auto" === C2.overflowY || "scroll" === C2.overflowY)), T2 = D2 && (Math.abs(b2 - r2) <= l2 && T2 + y2 < S2) - (Math.abs(v2 - r2) <= l2 && !!T2), p2 = E2 && (Math.abs(m2 - a2) <= l2 && p2 + w2 < _2) - (Math.abs(g2 - a2) <= l2 && !!p2);
              if (!Jt[d2]) for (var x2 = 0; x2 <= d2; x2++) Jt[x2] || (Jt[x2] = {});
              Jt[d2].vx == T2 && Jt[d2].vy == p2 && Jt[d2].el === f2 || (Jt[d2].el = f2, Jt[d2].vx = T2, Jt[d2].vy = p2, clearInterval(Jt[d2].pid), 0 == T2 && 0 == p2 || (u2 = true, Jt[d2].pid = setInterval(function() {
                o2 && 0 === this.layer && Ht.active._onTouchMove($t);
                var t3 = Jt[this.layer].vy ? Jt[this.layer].vy * s2 : 0, e3 = Jt[this.layer].vx ? Jt[this.layer].vx * s2 : 0;
                "function" == typeof i3 && "continue" !== i3.call(Ht.dragged.parentNode[K], e3, t3, n2, $t, Jt[this.layer].el) || H(Jt[this.layer].el, e3, t3);
              }.bind({ layer: d2 }), 24))), d2++;
            } while (t2.bubbleScroll && h2 !== c2 && (h2 = M(h2, false)));
            te = u2;
          }
        }, 30), n = function(t2) {
          var e2 = t2.originalEvent, n2 = t2.putSortable, o2 = t2.dragEl, i3 = t2.activeSortable, r2 = t2.dispatchSortableEvent, a2 = t2.hideGhostForTarget, t2 = t2.unhideGhostForTarget;
          e2 && (i3 = n2 || i3, a2(), e2 = e2.changedTouches && e2.changedTouches.length ? e2.changedTouches[0] : e2, e2 = document.elementFromPoint(e2.clientX, e2.clientY), t2(), i3 && !i3.el.contains(e2) && (r2("spill"), this.onSpill({ dragEl: o2, putSortable: n2 })));
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
            var o2, i3 = this, r2 = (e2.touches ? e2.touches[0] : e2).clientX, a2 = (e2.touches ? e2.touches[0] : e2).clientY, t3 = document.elementFromPoint(r2, a2);
            $t = e2, n2 || this.options.forceAutoScrollFallback || w || y || u ? (ie(e2, this.options, t3, n2), o2 = M(t3, true), !te || Qt && r2 === Vt && a2 === Zt || (Qt && ne(), Qt = setInterval(function() {
              var t4 = M(document.elementFromPoint(r2, a2), true);
              t4 !== o2 && (o2 = t4, ee()), ie(e2, i3.options, t4, n2);
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
            var e2 = t3.completed, n2 = t3.target, o2 = t3.onMove, i3 = t3.activeSortable, r2 = t3.changed, a2 = t3.cancel;
            i3.options.swap && (t3 = this.sortable.el, i3 = this.options, n2 && n2 !== t3 && (t3 = oe, oe = false !== o2(n2) ? (k(n2, i3.swapClass, true), n2) : null, t3 && t3 !== oe && k(t3, i3.swapClass, false)), r2(), e2(true), a2());
          }, drop: function(t3) {
            var e2, n2, o2 = t3.activeSortable, i3 = t3.putSortable, r2 = t3.dragEl, a2 = i3 || this.sortable, l2 = this.options;
            oe && k(oe, l2.swapClass, false), oe && (l2.swap || i3 && i3.options.swap) && r2 !== oe && (a2.captureAnimationState(), a2 !== o2 && o2.captureAnimationState(), n2 = oe, t3 = (e2 = r2).parentNode, l2 = n2.parentNode, t3 && l2 && !t3.isEqualNode(n2) && !l2.isEqualNode(e2) && (i3 = j(e2), r2 = j(n2), t3.isEqualNode(l2) && i3 < r2 && r2++, t3.insertBefore(n2, t3.children[i3]), l2.insertBefore(e2, l2.children[r2])), a2.animateAll(), a2 !== o2 && o2.animateAll());
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
            var n2, o2, e2 = t3.fromSortable, i3 = t3.rootEl, r2 = t3.sortable, a2 = t3.dragRect;
            1 < he.length && (he.forEach(function(t4) {
              r2.addAnimationState({ target: t4, rect: ge ? X(t4) : a2 }), A(t4), t4.fromRect = a2, e2.removeAnimationState(t4);
            }), ge = false, n2 = !this.options.removeCloneOnHide, o2 = i3, he.forEach(function(t4, e3) {
              e3 = o2.children[t4.sortableIndex + (n2 ? Number(e3) : 0)];
              e3 ? o2.insertBefore(t4, e3) : o2.appendChild(t4);
            }));
          }, dragOverCompleted: function(t3) {
            var e2, n2 = t3.sortable, o2 = t3.isOwner, i3 = t3.insertion, r2 = t3.activeSortable, a2 = t3.parentEl, l2 = t3.putSortable, t3 = this.options;
            i3 && (o2 && r2._hideClone(), pe = false, t3.animation && 1 < he.length && (ge || !o2 && !r2.options.sort && !l2) && (e2 = X(ce, false, true, true), he.forEach(function(t4) {
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
            var o2, i3, r2, a2, n2, e2, l2, s2 = t3.originalEvent, c2 = t3.rootEl, u2 = t3.parentEl, d2 = t3.sortable, h2 = t3.dispatchSortableEvent, f2 = t3.oldIndex, t3 = t3.putSortable, p2 = t3 || this.sortable;
            s2 && (o2 = this.options, i3 = u2.children, me || (o2.multiDragKey && !this.multiDragKeyDown && this._deselectMultiDrag(), k(ce, o2.selectedClass, !~he.indexOf(ce)), ~he.indexOf(ce) ? (he.splice(he.indexOf(ce), 1), le = null, U({ sortable: d2, rootEl: c2, name: "deselect", targetEl: ce, originalEvent: s2 })) : (he.push(ce), U({ sortable: d2, rootEl: c2, name: "select", targetEl: ce, originalEvent: s2 }), s2.shiftKey && le && d2.el.contains(le) ? (r2 = j(le), a2 = j(ce), ~r2 && ~a2 && r2 !== a2 && (function() {
              for (var e3, t4 = r2 < a2 ? (e3 = r2, a2) : (e3 = a2, r2 + 1), n3 = o2.filter; e3 < t4; e3++) ~he.indexOf(i3[e3]) || P(i3[e3], o2.draggable, u2, false) && (n3 && ("function" == typeof n3 ? n3.call(d2, s2, i3[e3], d2) : n3.split(",").some(function(t5) {
                return P(i3[e3], t5.trim(), u2, false);
              })) || (k(i3[e3], o2.selectedClass, true), he.push(i3[e3]), U({ sortable: d2, rootEl: c2, name: "select", targetEl: i3[e3], originalEvent: s2 })));
            })()) : le = ce, se = p2)), me && this.isMultiDrag && (ge = false, (u2[K].options.sort || u2 !== c2) && 1 < he.length && (n2 = X(ce), e2 = j(ce, ":not(." + this.options.selectedClass + ")"), !pe && o2.animation && (ce.thisAnimationDuration = null), p2.captureAnimationState(), pe || (o2.animation && (ce.fromRect = n2, he.forEach(function(t4) {
              var e3;
              t4.thisAnimationDuration = null, t4 !== ce && (e3 = ge ? X(t4) : n2, t4.fromRect = e3, p2.addAnimationState({ target: t4, rect: e3 }));
            })), be(), he.forEach(function(t4) {
              i3[e2] ? u2.insertBefore(t4, i3[e2]) : u2.appendChild(t4), e2++;
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
            var n2 = this, o2 = [], i3 = [];
            return he.forEach(function(t3) {
              var e2;
              o2.push({ multiDragElement: t3, index: t3.sortableIndex }), e2 = ge && t3 !== ce ? -1 : ge ? j(t3, ":not(." + n2.options.selectedClass + ")") : j(t3), i3.push({ multiDragElement: t3, index: e2 });
            }), { items: e(he), clones: [].concat(fe), oldIndicies: o2, newIndicies: i3 };
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
    const mergeLocaleDictionary = (current2, useGeneratedValues) => {
      const currentDict = current2 || {};
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
        addElementToDialog: function(name, data2) {
          if (data2) {
            const core = renderutils.makeElement({ ...data2 });
            core.dataset.type = String(data2.type || name);
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
        loadDialogFromJson: function(data2) {
          try {
            const obj = typeof data2 === "string" ? JSON.parse(data2) : data2;
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
      cycleSorterState = (current2, mode) => {
        if (mode === "no") {
          return current2 === "off" ? "asc" : "off";
        }
        const preferred = preferredSorterState(mode);
        const alternate = preferred === "asc" ? "desc" : "asc";
        if (current2 === "off") return preferred;
        if (current2 === preferred) return alternate;
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
        makeElement: function(data2) {
          if (typeof data2 !== "object" || Array.isArray(data2)) {
            showError("Invalid settings for this element.");
          }
          const template = resolveElementTemplate(data2?.type);
          data2 = { ...template, ...data2 };
          const uuid = v4_default();
          const provided = String(data2.nameid || "").trim();
          const baseFallback = String(data2.type || "el").toLowerCase();
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
          if (data2.type === "Input") {
            eltype = "textarea";
          } else if (data2.type === "Select") {
            eltype = "select";
          }
          const element = document.createElement(eltype);
          data2.id = uuid;
          data2.nameid = nameid;
          element.style.position = "absolute";
          element.style.top = data2.top + "px";
          element.style.left = data2.left + "px";
          const errs = renderutils.assertTypes(data2, { collect: true }) || [];
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
          const recordata = data2;
          const keys = utils.getKeys(recordata);
          keys.forEach((key) => {
            if (key.startsWith("$") || !/^[$A-Za-z_][\w$]*$/.test(key)) return;
            const value = valueToDataset(recordata[key]);
            if (utils.notNil(value)) {
              element.dataset[key] = value;
            }
          });
          if (data2.type == "Button") {
            element.className = "smart-button";
            element.style.backgroundColor = data2.color;
            element.style.borderColor = data2.borderColor;
            element.style.color = data2.fontColor;
            element.dataset.borderColor = data2.borderColor;
            element.style.width = data2.width + "px";
            element.style.maxWidth = data2.width + "px";
            element.style.height = data2.height + "px";
            element.dataset.width = String(data2.width);
            element.dataset.height = String(data2.height);
            const lineHeight = coms.fontSize * 1.2;
            const paddingY = 3;
            const maxHeight = lineHeight * data2.lineClamp + 3 * paddingY;
            element.style.maxHeight = maxHeight + "px";
            const span = ensureElementTextNode(element, "smart-button-text");
            span.style.fontFamily = coms.fontFamily;
            span.style.overflow = "hidden";
            span.style.textOverflow = "ellipsis";
            span.style.whiteSpace = "nowrap";
            syncElementPresentation(element, data2.label, data2.icon, "smart-button-text", "smart-button-icon", "buttonIcon");
            renderutils.updateButton(
              element,
              data2.label,
              coms.fontSize,
              data2.lineClamp,
              data2.width,
              data2.icon,
              data2.height,
              data2.iconSize
            );
          } else if (data2.type == "Input" && element instanceof HTMLTextAreaElement) {
            element.value = data2.value || "";
            element.rows = 1;
            element.wrap = "soft";
            element.style.resize = "none";
            element.style.width = data2.width + "px";
            element.style.height = data2.height + "px";
            element.style.borderColor = data2.borderColor || "#8c8c8c";
            element.style.setProperty("--input-disabled-background-color", getDisabledColor(data2));
            requestAnimationFrame(() => syncInputOverflow(element));
          } else if (data2.type == "Select") {
            element.className = "custom-select";
            element.style.width = data2.width + "px";
            element.style.setProperty("--input-disabled-background-color", getDisabledColor(data2));
            const color = data2.arrowColor || "#000000";
            const svg = encodeURIComponent(`
                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'>
                    <path fill='${color}' d='M6 8L0 0h12z'/>
                </svg>
            `);
            element.style.backgroundImage = `url("data:image/svg+xml,${svg}")`;
            try {
              const selectEl = element;
              const raw = String(data2.value ?? selectEl.dataset.value ?? "");
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
          } else if (data2.type == "Checkbox") {
            element.className = "element-div";
            element.style.width = data2.size + "px";
            element.style.height = data2.size + "px";
            const customCheckbox = document.createElement("div");
            customCheckbox.id = "checkbox-" + uuid;
            customCheckbox.className = "custom-checkbox";
            customCheckbox.setAttribute("role", "checkbox");
            customCheckbox.setAttribute("tabindex", "0");
            const initialChecked = utils.isTrue(data2.isChecked);
            customCheckbox.setAttribute("aria-checked", initialChecked ? "true" : "false");
            customCheckbox.classList.toggle("checked", initialChecked);
            customCheckbox.dataset.fill = String(!!data2.fill);
            customCheckbox.style.setProperty("--checkbox-color", data2.color);
            customCheckbox.style.setProperty("--checkbox-border-color", data2.borderColor || "#8c8c8c");
            customCheckbox.style.setProperty("--checkbox-disabled-background-color", getDisabledColor(data2));
            customCheckbox.style.borderColor = data2.borderColor || "#8c8c8c";
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
          } else if (data2.type == "Radio") {
            element.className = "element-div";
            element.style.width = data2.size + "px";
            element.style.height = data2.size + "px";
            const initialSelected = utils.isTrue(data2.isSelected);
            const wrapperLabel = document.createElement("label");
            wrapperLabel.className = "custom-radio-wrapper";
            wrapperLabel.dataset.group = String(data2.group || "");
            const nativeRadio = document.createElement("input");
            nativeRadio.type = "radio";
            nativeRadio.name = data2.group || "";
            nativeRadio.id = `native-radio-${uuid}`;
            nativeRadio.className = "native-radio";
            nativeRadio.dataset.color = data2.color;
            nativeRadio.style.position = "absolute";
            nativeRadio.style.opacity = "0";
            nativeRadio.style.pointerEvents = "auto";
            nativeRadio.checked = initialSelected;
            const customRadio = document.createElement("span");
            customRadio.id = `radio-${uuid}`;
            customRadio.className = "custom-radio";
            customRadio.setAttribute("role", "radio");
            customRadio.setAttribute("aria-checked", initialSelected ? "true" : "false");
            customRadio.setAttribute("group", data2.group || "");
            customRadio.style.setProperty("--radio-color", data2.color);
            customRadio.style.setProperty("--radio-disabled-background-color", getDisabledColor(data2));
            customRadio.classList.toggle("selected", initialSelected);
            wrapperLabel.appendChild(nativeRadio);
            wrapperLabel.appendChild(customRadio);
            element.appendChild(wrapperLabel);
            if (data2.group) {
              element.dataset.group = String(data2.group);
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
          } else if (data2.type == "Counter") {
            element.className = "counter-wrapper";
            const borderColor = String(data2.borderColor || "#8c8c8c");
            element.dataset.borderColor = borderColor;
            const arrowColor = String(data2.color || "#558855");
            const arrowSize = Number(data2.updownsize || 8);
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
              glyph.style.setProperty("--counter-arrow-disabled-fill-color", getDisabledColor(data2));
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
            const rawMin = Number(data2.minval ?? data2.startval ?? 0);
            const rawStart = Number(data2.startval ?? rawMin);
            const rawMax = Number(data2.maxval ?? rawStart);
            const min = Number.isFinite(rawMin) ? rawMin : 0;
            const max = Number.isFinite(rawMax) ? rawMax : Math.max(min, Number.isFinite(rawStart) ? rawStart : min);
            const start = Number.isFinite(rawStart) ? rawStart : min;
            const initial = Math.min(Math.max(start, min), max);
            display.textContent = String(initial);
            display.style.padding = "0px " + data2.space + "px";
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
          } else if (data2.type == "Slider") {
            element.className = "separator";
            element.style.width = data2.width + "px";
            element.style.height = data2.height + "px";
            element.style.backgroundColor = String(data2.color || "#000000");
            element.dataset.color = String(data2.color || "#000000");
            const handle = document.createElement("div");
            handle.className = "slider-handle";
            handle.id = "slider-handle-" + uuid;
            element.appendChild(handle);
            const handleConfig = Object.fromEntries(
              Object.entries(data2).map(([k, v]) => [k, v ?? ""])
            );
            renderutils.updateHandleStyle(handle, handleConfig);
          } else if (data2.type == "Label") {
            syncElementPresentation(element, data2.value || "", data2.icon, "smart-label-text", "smart-label-icon", "elementIcon");
            element.style.fontFamily = coms.fontFamily;
            element.style.fontSize = coms.fontSize + "px";
            element.style.lineHeight = "1.2";
            element.style.color = data2.fontColor || "#000000";
            element.style.overflow = "hidden";
            element.style.textOverflow = "ellipsis";
            element.style.position = "relative";
            const clampInit = Number(data2.lineClamp) || 1;
            const maxWInit = Number(data2.maxWidth ?? data2.maxWidth ?? 0);
            element.style.textAlign = data2.align || "left";
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
          } else if (data2.type == "Separator") {
            element.className = "separator";
            element.style.width = data2.width + "px";
            element.style.height = data2.height + "px";
            element.style.backgroundColor = String(data2.color || "#000000");
            element.dataset.color = String(data2.color || "#000000");
          } else if (data2.type == "Container") {
            element.className = "container";
            element.style.backgroundColor = data2.backgroundColor;
            element.style.borderColor = data2.borderColor;
            element.style.setProperty("--container-active-fg", String(data2.activeFontColor || "#ffffff"));
            element.style.setProperty("--container-disabled-bg", String(data2.disabledColor ?? "#d8d8d8"));
            element.dataset.backgroundColor = String(data2.backgroundColor || "#ffffff");
            element.dataset.fontColor = String(data2.fontColor || "#000000");
            element.dataset.activeBackgroundColor = String(data2.activeBackgroundColor || "#589658");
            element.dataset.activeFontColor = String(data2.activeFontColor || "#ffffff");
            element.dataset.disabledColor = String(data2.disabledColor ?? "#d8d8d8");
            element.dataset.borderColor = data2.borderColor;
            element.style.width = data2.width + "px";
            element.style.height = data2.height + "px";
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
              const fg = String(data2.fontColor) || "#000000";
              const abg = String(data2.activeBackgroundColor) || "#589658";
              const afg = String(data2.activeFontColor) || "#ffffff";
              const dbg = String(data2.disabledColor ?? "#d8d8d8");
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
              applyEditorContainerSampleState(element, data2, !utils.isFalse(data2.isEnabled));
            }
          } else if (data2.type == "Choice") {
            element.className = "sorter";
            element.style.width = data2.width + "px";
            element.style.height = data2.height + "px";
            element.style.backgroundColor = data2.backgroundColor;
            element.style.borderColor = data2.borderColor;
            element.dataset.backgroundColor = data2.backgroundColor;
            element.dataset.fontColor = data2.fontColor;
            element.dataset.activeBackgroundColor = data2.activeBackgroundColor;
            element.dataset.activeFontColor = data2.activeFontColor;
            element.dataset.borderColor = data2.borderColor;
            element.dataset.selection = normalizeChoiceSelection(data2.selection);
            element.dataset.sortable = String(data2.sortable);
            element.dataset.ordering = normalizeChoiceOrdering(data2.ordering);
            element.dataset.orientation = normalizeChoiceOrientation(data2.orientation);
            element.dataset.items = String(data2.items || "");
            element.dataset.align = String(data2.align || "left");
            if (renderutils.previewWindow()) {
              delete element.dataset.selected;
              delete element.dataset.activeValues;
              delete element.dataset[SORTER_STATE_KEY];
            } else {
              const labels = splitSorterValues(data2.items || "");
              const orderingMode = normalizeChoiceOrdering(data2.ordering);
              const sampleState = buildSorterSampleState(labels, orderingMode);
              if (sampleState) {
                element.__sampleSorterState = sampleState;
              } else {
                delete element.__sampleSorterState;
              }
            }
            renderutils.renderSorter(element, {
              items: data2.items,
              sortable: data2.sortable,
              ordering: data2.ordering,
              orientation: data2.orientation,
              align: data2.align,
              backgroundColor: data2.backgroundColor,
              fontColor: data2.fontColor,
              activeBackgroundColor: data2.activeBackgroundColor,
              activeFontColor: data2.activeFontColor,
              borderColor: data2.borderColor,
              selection: data2.selection
            });
          }
          element.style.fontFamily = coms.fontFamily;
          element.style.fontSize = coms.fontSize + "px";
          if (utils.isFalse(data2.isVisible)) {
            if (renderutils.previewWindow()) {
              element.style.display = "none";
            } else {
              element.classList.add("design-hidden");
              element.style.removeProperty("visibility");
            }
          }
          if (utils.isFalse(data2.isEnabled)) {
            if (!utils.isElementOf(data2.type, ["Input", "Select", "Checkbox", "Radio", "Counter"])) {
              element.classList.add("disabled-div");
            }
            if (data2.type === "Input" && element instanceof HTMLTextAreaElement) {
              element.disabled = true;
              applyControlDisabledAppearance({ input: element, enabled: false, source: data2 });
            } else if (data2.type === "Select" && element instanceof HTMLSelectElement) {
              element.disabled = true;
              applyControlDisabledAppearance({ input: element, enabled: false, source: data2 });
            } else if (data2.type === "Checkbox") {
              const customCheckbox = element.querySelector(".custom-checkbox");
              applyControlDisabledAppearance({ checkbox: customCheckbox, enabled: false, source: data2 });
            } else if (data2.type === "Radio") {
              const nativeRadio = element.querySelector(".native-radio");
              const customRadio = element.querySelector(".custom-radio");
              if (nativeRadio) {
                nativeRadio.disabled = true;
              }
              applyControlDisabledAppearance({ radio: customRadio, enabled: false, source: data2 });
            } else if (data2.type === "Counter") {
              applyCounterDisabledAppearance(element, false, data2);
            } else if (data2.type === "Container") {
              element.style.backgroundColor = getDisabledColor(data2);
              applyEditorContainerSampleState(element, data2, false);
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
          const list2 = existingList || document.createElement("div");
          list2.className = "sorter-list";
          list2.dataset.orientation = orientation;
          list2.style.position = "relative";
          const existingSortable = list2.__sortable;
          if (existingSortable?.destroy) {
            try {
              existingSortable.destroy();
            } catch {
            }
          }
          delete list2.__sortable;
          list2.innerHTML = "";
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
                Array.from(list2.querySelectorAll(".sorter-item")).forEach((otherRow, otherIndex) => {
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
              if (list2.dataset.dragging === "true") return;
              cycle();
            });
            label.addEventListener("click", (ev) => {
              ev.stopPropagation();
              if (list2.dataset.dragging === "true") return;
              cycle();
            });
            indicator.addEventListener("click", (ev) => {
              ev.stopPropagation();
              if (list2.dataset.dragging === "true") return;
              cycle();
            });
            row.appendChild(label);
            row.appendChild(indicator);
            list2.appendChild(row);
          };
          items.forEach((item, idx) => attachRow(item, idx));
          if (!existingList) {
            visual.innerHTML = "";
            visual.appendChild(list2);
          }
          if (sortable) {
            list2.__sortable = new Sortable(list2, {
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
                list2.dataset.dragging = "true";
              },
              onEnd: () => {
                setTimeout(() => {
                  delete list2.dataset.dragging;
                }, 0);
                const rows = Array.from(list2.querySelectorAll(".sorter-item"));
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
                  let i2 = 1;
                  while (existing.has(`${desired}${i2}`)) {
                    i2++;
                  }
                  finalName = `${desired}${i2}`;
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
        assertTypes: function(data2, options = {}) {
          const { schema, collect = false, strictPresence = false } = options;
          if (!__uniformSchema && !schema) {
            __uniformSchema = renderutils.buildUniformSchema();
          }
          const active = schema || __uniformSchema;
          const errors = [];
          for (const [key, expected] of Object.entries(active)) {
            const has = Object.prototype.hasOwnProperty.call(data2, key);
            if (!has) {
              if (strictPresence) {
                const msg = `Missing expected key "${key}"`;
                if (collect) errors.push(msg);
                else throw new Error(msg);
              }
              continue;
            }
            const val = data2[key];
            const tv = typeof val;
            if (tv !== expected) {
              let coerced = false;
              if (expected === "string" && (tv === "boolean" || tv === "number")) {
                data2[key] = String(val);
                coerced = true;
              } else if (expected === "boolean" && tv === "string") {
                const low = String(val).toLowerCase();
                if (low === "true" || low === "false") {
                  data2[key] = low === "true";
                  coerced = true;
                }
              } else if (expected === "number" && tv === "string") {
                const num = Number(val);
                if (!Number.isNaN(num)) {
                  data2[key] = num;
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

  // node_modules/acorn/dist/acorn.mjs
  var astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 574, 3, 9, 9, 7, 9, 32, 4, 318, 1, 78, 5, 71, 10, 50, 3, 123, 2, 54, 14, 32, 10, 3, 1, 11, 3, 46, 10, 8, 0, 46, 9, 7, 2, 37, 13, 2, 9, 6, 1, 45, 0, 13, 2, 49, 13, 9, 3, 2, 11, 83, 11, 7, 0, 3, 0, 158, 11, 6, 9, 7, 3, 56, 1, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 68, 8, 2, 0, 3, 0, 2, 3, 2, 4, 2, 0, 15, 1, 83, 17, 10, 9, 5, 0, 82, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 7, 19, 58, 14, 5, 9, 243, 14, 166, 9, 71, 5, 2, 1, 3, 3, 2, 0, 2, 1, 13, 9, 120, 6, 3, 6, 4, 0, 29, 9, 41, 6, 2, 3, 9, 0, 10, 10, 47, 15, 199, 7, 137, 9, 54, 7, 2, 7, 17, 9, 57, 21, 2, 13, 123, 5, 4, 0, 2, 1, 2, 6, 2, 0, 9, 9, 49, 4, 2, 1, 2, 4, 9, 9, 55, 9, 266, 3, 10, 1, 2, 0, 49, 6, 4, 4, 14, 10, 5350, 0, 7, 14, 11465, 27, 2343, 9, 87, 9, 39, 4, 60, 6, 26, 9, 535, 9, 470, 0, 2, 54, 8, 3, 82, 0, 12, 1, 19628, 1, 4178, 9, 519, 45, 3, 22, 543, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3, 6, 2, 1, 2, 4, 101, 0, 161, 6, 10, 9, 357, 0, 62, 13, 499, 13, 245, 1, 2, 9, 233, 0, 3, 0, 8, 1, 6, 0, 475, 6, 110, 6, 6, 9, 4759, 9, 787719, 239];
  var astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 14, 29, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 19, 35, 5, 35, 5, 39, 9, 51, 13, 10, 2, 14, 2, 6, 2, 1, 2, 10, 2, 14, 2, 6, 2, 1, 4, 51, 13, 310, 10, 21, 11, 7, 25, 5, 2, 41, 2, 8, 70, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 7, 25, 39, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 28, 43, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 14, 35, 39, 27, 10, 22, 251, 41, 7, 1, 17, 5, 57, 28, 11, 0, 9, 21, 43, 17, 47, 20, 28, 22, 13, 52, 58, 1, 3, 0, 14, 44, 33, 24, 27, 35, 30, 0, 3, 0, 9, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 20, 1, 64, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 31, 9, 2, 0, 3, 0, 2, 37, 2, 0, 26, 0, 2, 0, 45, 52, 19, 3, 21, 2, 31, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 14, 0, 72, 26, 38, 6, 186, 43, 117, 63, 32, 7, 3, 0, 3, 7, 2, 1, 2, 23, 16, 0, 2, 0, 95, 7, 3, 38, 17, 0, 2, 0, 29, 0, 11, 39, 8, 0, 22, 0, 12, 45, 20, 0, 19, 72, 200, 32, 32, 8, 2, 36, 18, 0, 50, 29, 113, 6, 2, 1, 2, 37, 22, 0, 26, 5, 2, 1, 2, 31, 15, 0, 24, 43, 261, 18, 16, 0, 2, 12, 2, 33, 125, 0, 80, 921, 103, 110, 18, 195, 2637, 96, 16, 1071, 18, 5, 26, 3994, 6, 582, 6842, 29, 1763, 568, 8, 30, 18, 78, 18, 29, 19, 47, 17, 3, 32, 20, 6, 18, 433, 44, 212, 63, 33, 24, 3, 24, 45, 74, 6, 0, 67, 12, 65, 1, 2, 0, 15, 4, 10, 7381, 42, 31, 98, 114, 8702, 3, 2, 6, 2, 1, 2, 290, 16, 0, 30, 2, 3, 0, 15, 3, 9, 395, 2309, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 1845, 30, 7, 5, 262, 61, 147, 44, 11, 6, 17, 0, 322, 29, 19, 43, 485, 27, 229, 29, 3, 0, 208, 30, 2, 2, 2, 1, 2, 6, 3, 4, 10, 1, 225, 6, 2, 3, 2, 1, 2, 14, 2, 196, 60, 67, 8, 0, 1205, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42719, 33, 4381, 3, 5773, 3, 7472, 16, 621, 2467, 541, 1507, 4938, 6, 8489];
  var nonASCIIidentifierChars = "\u200C\u200D\xB7\u0300-\u036F\u0387\u0483-\u0487\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u0669\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u06F0-\u06F9\u0711\u0730-\u074A\u07A6-\u07B0\u07C0-\u07C9\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u0897-\u089F\u08CA-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0966-\u096F\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u09E6-\u09EF\u09FE\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A66-\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0AE6-\u0AEF\u0AFA-\u0AFF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B55-\u0B57\u0B62\u0B63\u0B66-\u0B6F\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0BE6-\u0BEF\u0C00-\u0C04\u0C3C\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0CE6-\u0CEF\u0CF3\u0D00-\u0D03\u0D3B\u0D3C\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D66-\u0D6F\u0D81-\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0E50-\u0E59\u0EB1\u0EB4-\u0EBC\u0EC8-\u0ECE\u0ED0-\u0ED9\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1040-\u1049\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109D\u135D-\u135F\u1369-\u1371\u1712-\u1715\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u17E0-\u17E9\u180B-\u180D\u180F-\u1819\u18A9\u1920-\u192B\u1930-\u193B\u1946-\u194F\u19D0-\u19DA\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AB0-\u1ABD\u1ABF-\u1ADD\u1AE0-\u1AEB\u1B00-\u1B04\u1B34-\u1B44\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BF3\u1C24-\u1C37\u1C40-\u1C49\u1C50-\u1C59\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1DC0-\u1DFF\u200C\u200D\u203F\u2040\u2054\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\u30FB\uA620-\uA629\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA82C\uA880\uA881\uA8B4-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F1\uA8FF-\uA909\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9D0-\uA9D9\uA9E5\uA9F0-\uA9F9\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA50-\uAA59\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uABF0-\uABF9\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFF10-\uFF19\uFF3F\uFF65";
  var nonASCIIidentifierStartChars = "\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088F\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5C\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDC-\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C8A\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7DC\uA7F1-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC";
  var reservedWords = {
    3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
    5: "class enum extends super const export import",
    6: "enum",
    strict: "implements interface let package private protected public static yield",
    strictBind: "eval arguments"
  };
  var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";
  var keywords$1 = {
    5: ecma5AndLessKeywords,
    "5module": ecma5AndLessKeywords + " export import",
    6: ecma5AndLessKeywords + " const class extends export import super"
  };
  var keywordRelationalOperator = /^in(stanceof)?$/;
  var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
  var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");
  function isInAstralSet(code, set) {
    var pos = 65536;
    for (var i2 = 0; i2 < set.length; i2 += 2) {
      pos += set[i2];
      if (pos > code) {
        return false;
      }
      pos += set[i2 + 1];
      if (pos >= code) {
        return true;
      }
    }
    return false;
  }
  function isIdentifierStart(code, astral) {
    if (code < 65) {
      return code === 36;
    }
    if (code < 91) {
      return true;
    }
    if (code < 97) {
      return code === 95;
    }
    if (code < 123) {
      return true;
    }
    if (code <= 65535) {
      return code >= 170 && nonASCIIidentifierStart.test(String.fromCharCode(code));
    }
    if (astral === false) {
      return false;
    }
    return isInAstralSet(code, astralIdentifierStartCodes);
  }
  function isIdentifierChar(code, astral) {
    if (code < 48) {
      return code === 36;
    }
    if (code < 58) {
      return true;
    }
    if (code < 65) {
      return false;
    }
    if (code < 91) {
      return true;
    }
    if (code < 97) {
      return code === 95;
    }
    if (code < 123) {
      return true;
    }
    if (code <= 65535) {
      return code >= 170 && nonASCIIidentifier.test(String.fromCharCode(code));
    }
    if (astral === false) {
      return false;
    }
    return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes);
  }
  var TokenType = function TokenType2(label, conf) {
    if (conf === void 0) conf = {};
    this.label = label;
    this.keyword = conf.keyword;
    this.beforeExpr = !!conf.beforeExpr;
    this.startsExpr = !!conf.startsExpr;
    this.isLoop = !!conf.isLoop;
    this.isAssign = !!conf.isAssign;
    this.prefix = !!conf.prefix;
    this.postfix = !!conf.postfix;
    this.binop = conf.binop || null;
    this.updateContext = null;
  };
  function binop(name, prec) {
    return new TokenType(name, { beforeExpr: true, binop: prec });
  }
  var beforeExpr = { beforeExpr: true };
  var startsExpr = { startsExpr: true };
  var keywords = {};
  function kw(name, options) {
    if (options === void 0) options = {};
    options.keyword = name;
    return keywords[name] = new TokenType(name, options);
  }
  var types$1 = {
    num: new TokenType("num", startsExpr),
    regexp: new TokenType("regexp", startsExpr),
    string: new TokenType("string", startsExpr),
    name: new TokenType("name", startsExpr),
    privateId: new TokenType("privateId", startsExpr),
    eof: new TokenType("eof"),
    // Punctuation token types.
    bracketL: new TokenType("[", { beforeExpr: true, startsExpr: true }),
    bracketR: new TokenType("]"),
    braceL: new TokenType("{", { beforeExpr: true, startsExpr: true }),
    braceR: new TokenType("}"),
    parenL: new TokenType("(", { beforeExpr: true, startsExpr: true }),
    parenR: new TokenType(")"),
    comma: new TokenType(",", beforeExpr),
    semi: new TokenType(";", beforeExpr),
    colon: new TokenType(":", beforeExpr),
    dot: new TokenType("."),
    question: new TokenType("?", beforeExpr),
    questionDot: new TokenType("?."),
    arrow: new TokenType("=>", beforeExpr),
    template: new TokenType("template"),
    invalidTemplate: new TokenType("invalidTemplate"),
    ellipsis: new TokenType("...", beforeExpr),
    backQuote: new TokenType("`", startsExpr),
    dollarBraceL: new TokenType("${", { beforeExpr: true, startsExpr: true }),
    // Operators. These carry several kinds of properties to help the
    // parser use them properly (the presence of these properties is
    // what categorizes them as operators).
    //
    // `binop`, when present, specifies that this operator is a binary
    // operator, and will refer to its precedence.
    //
    // `prefix` and `postfix` mark the operator as a prefix or postfix
    // unary operator.
    //
    // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
    // binary operators with a very low precedence, that should result
    // in AssignmentExpression nodes.
    eq: new TokenType("=", { beforeExpr: true, isAssign: true }),
    assign: new TokenType("_=", { beforeExpr: true, isAssign: true }),
    incDec: new TokenType("++/--", { prefix: true, postfix: true, startsExpr: true }),
    prefix: new TokenType("!/~", { beforeExpr: true, prefix: true, startsExpr: true }),
    logicalOR: binop("||", 1),
    logicalAND: binop("&&", 2),
    bitwiseOR: binop("|", 3),
    bitwiseXOR: binop("^", 4),
    bitwiseAND: binop("&", 5),
    equality: binop("==/!=/===/!==", 6),
    relational: binop("</>/<=/>=", 7),
    bitShift: binop("<</>>/>>>", 8),
    plusMin: new TokenType("+/-", { beforeExpr: true, binop: 9, prefix: true, startsExpr: true }),
    modulo: binop("%", 10),
    star: binop("*", 10),
    slash: binop("/", 10),
    starstar: new TokenType("**", { beforeExpr: true }),
    coalesce: binop("??", 1),
    // Keyword token types.
    _break: kw("break"),
    _case: kw("case", beforeExpr),
    _catch: kw("catch"),
    _continue: kw("continue"),
    _debugger: kw("debugger"),
    _default: kw("default", beforeExpr),
    _do: kw("do", { isLoop: true, beforeExpr: true }),
    _else: kw("else", beforeExpr),
    _finally: kw("finally"),
    _for: kw("for", { isLoop: true }),
    _function: kw("function", startsExpr),
    _if: kw("if"),
    _return: kw("return", beforeExpr),
    _switch: kw("switch"),
    _throw: kw("throw", beforeExpr),
    _try: kw("try"),
    _var: kw("var"),
    _const: kw("const"),
    _while: kw("while", { isLoop: true }),
    _with: kw("with"),
    _new: kw("new", { beforeExpr: true, startsExpr: true }),
    _this: kw("this", startsExpr),
    _super: kw("super", startsExpr),
    _class: kw("class", startsExpr),
    _extends: kw("extends", beforeExpr),
    _export: kw("export"),
    _import: kw("import", startsExpr),
    _null: kw("null", startsExpr),
    _true: kw("true", startsExpr),
    _false: kw("false", startsExpr),
    _in: kw("in", { beforeExpr: true, binop: 7 }),
    _instanceof: kw("instanceof", { beforeExpr: true, binop: 7 }),
    _typeof: kw("typeof", { beforeExpr: true, prefix: true, startsExpr: true }),
    _void: kw("void", { beforeExpr: true, prefix: true, startsExpr: true }),
    _delete: kw("delete", { beforeExpr: true, prefix: true, startsExpr: true })
  };
  var lineBreak = /\r\n?|\n|\u2028|\u2029/;
  var lineBreakG = new RegExp(lineBreak.source, "g");
  function isNewLine(code) {
    return code === 10 || code === 13 || code === 8232 || code === 8233;
  }
  function nextLineBreak(code, from, end) {
    if (end === void 0) end = code.length;
    for (var i2 = from; i2 < end; i2++) {
      var next = code.charCodeAt(i2);
      if (isNewLine(next)) {
        return i2 < end - 1 && next === 13 && code.charCodeAt(i2 + 1) === 10 ? i2 + 2 : i2 + 1;
      }
    }
    return -1;
  }
  var nonASCIIwhitespace = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
  var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;
  var ref = Object.prototype;
  var hasOwnProperty = ref.hasOwnProperty;
  var toString = ref.toString;
  var hasOwn = Object.hasOwn || (function(obj, propName) {
    return hasOwnProperty.call(obj, propName);
  });
  var isArray = Array.isArray || (function(obj) {
    return toString.call(obj) === "[object Array]";
  });
  var regexpCache = /* @__PURE__ */ Object.create(null);
  function wordsRegexp(words) {
    return regexpCache[words] || (regexpCache[words] = new RegExp("^(?:" + words.replace(/ /g, "|") + ")$"));
  }
  function codePointToString(code) {
    if (code <= 65535) {
      return String.fromCharCode(code);
    }
    code -= 65536;
    return String.fromCharCode((code >> 10) + 55296, (code & 1023) + 56320);
  }
  var loneSurrogate = /(?:[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/;
  var Position = function Position2(line, col) {
    this.line = line;
    this.column = col;
  };
  Position.prototype.offset = function offset(n) {
    return new Position(this.line, this.column + n);
  };
  var SourceLocation = function SourceLocation2(p, start, end) {
    this.start = start;
    this.end = end;
    if (p.sourceFile !== null) {
      this.source = p.sourceFile;
    }
  };
  function getLineInfo(input, offset2) {
    for (var line = 1, cur = 0; ; ) {
      var nextBreak = nextLineBreak(input, cur, offset2);
      if (nextBreak < 0) {
        return new Position(line, offset2 - cur);
      }
      ++line;
      cur = nextBreak;
    }
  }
  var defaultOptions = {
    // `ecmaVersion` indicates the ECMAScript version to parse. Must be
    // either 3, 5, 6 (or 2015), 7 (2016), 8 (2017), 9 (2018), 10
    // (2019), 11 (2020), 12 (2021), 13 (2022), 14 (2023), or `"latest"`
    // (the latest version the library supports). This influences
    // support for strict mode, the set of reserved words, and support
    // for new syntax features.
    ecmaVersion: null,
    // `sourceType` indicates the mode the code should be parsed in.
    // Can be either `"script"`, `"module"` or `"commonjs"`. This influences global
    // strict mode and parsing of `import` and `export` declarations.
    sourceType: "script",
    // When set to true, enable strict parsing mode even if `sourceType`
    // is `"script"`.
    strict: false,
    // `onInsertedSemicolon` can be a callback that will be called when
    // a semicolon is automatically inserted. It will be passed the
    // position of the inserted semicolon as an offset, and if
    // `locations` is enabled, it is given the location as a `{line,
    // column}` object as second argument.
    onInsertedSemicolon: null,
    // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
    // trailing commas.
    onTrailingComma: null,
    // By default, reserved words are only enforced if ecmaVersion >= 5.
    // Set `allowReserved` to a boolean value to explicitly turn this on
    // an off. When this option has the value "never", reserved words
    // and keywords can also not be used as property names.
    allowReserved: null,
    // When enabled, a return at the top level is not considered an
    // error.
    allowReturnOutsideFunction: false,
    // When enabled, import/export statements are not constrained to
    // appearing at the top of the program, and an import.meta expression
    // in a script isn't considered an error.
    allowImportExportEverywhere: false,
    // By default, await identifiers are allowed to appear at the top-level scope only if ecmaVersion >= 2022.
    // When enabled, await identifiers are allowed to appear at the top-level scope,
    // but they are still not allowed in non-async functions.
    allowAwaitOutsideFunction: null,
    // When enabled, super identifiers are not constrained to
    // appearing in methods and do not raise an error when they appear elsewhere.
    allowSuperOutsideMethod: null,
    // When enabled, hashbang directive in the beginning of file is
    // allowed and treated as a line comment. Enabled by default when
    // `ecmaVersion` >= 2023.
    allowHashBang: false,
    // By default, the parser will verify that private properties are
    // only used in places where they are valid and have been declared.
    // Set this to false to turn such checks off.
    checkPrivateFields: true,
    // When `locations` is on, `loc` properties holding objects with
    // `start` and `end` properties in `{line, column}` form (with
    // line being 1-based and column 0-based) will be attached to the
    // nodes.
    locations: false,
    // A function can be passed as `onToken` option, which will
    // cause Acorn to call that function with object in the same
    // format as tokens returned from `tokenizer().getToken()`. Note
    // that you are not allowed to call the parser from the
    // callback—that will corrupt its internal state.
    onToken: null,
    // A function can be passed as `onComment` option, which will
    // cause Acorn to call that function with `(block, text, start,
    // end)` parameters whenever a comment is skipped. `block` is a
    // boolean indicating whether this is a block (`/* */`) comment,
    // `text` is the content of the comment, and `start` and `end` are
    // character offsets that denote the start and end of the comment.
    // When the `locations` option is on, two more parameters are
    // passed, the full `{line, column}` locations of the start and
    // end of the comments. Note that you are not allowed to call the
    // parser from the callback—that will corrupt its internal state.
    // When this option has an array as value, objects representing the
    // comments are pushed to it.
    onComment: null,
    // Nodes have their start and end characters offsets recorded in
    // `start` and `end` properties (directly on the node, rather than
    // the `loc` object, which holds line/column data. To also add a
    // [semi-standardized][range] `range` property holding a `[start,
    // end]` array with the same numbers, set the `ranges` option to
    // `true`.
    //
    // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
    ranges: false,
    // It is possible to parse multiple files into a single AST by
    // passing the tree produced by parsing the first file as
    // `program` option in subsequent parses. This will add the
    // toplevel forms of the parsed file to the `Program` (top) node
    // of an existing parse tree.
    program: null,
    // When `locations` is on, you can pass this to record the source
    // file in every node's `loc` object.
    sourceFile: null,
    // This value, if given, is stored in every node, whether
    // `locations` is on or off.
    directSourceFile: null,
    // When enabled, parenthesized expressions are represented by
    // (non-standard) ParenthesizedExpression nodes
    preserveParens: false
  };
  var warnedAboutEcmaVersion = false;
  function getOptions(opts) {
    var options = {};
    for (var opt in defaultOptions) {
      options[opt] = opts && hasOwn(opts, opt) ? opts[opt] : defaultOptions[opt];
    }
    if (options.ecmaVersion === "latest") {
      options.ecmaVersion = 1e8;
    } else if (options.ecmaVersion == null) {
      if (!warnedAboutEcmaVersion && typeof console === "object" && console.warn) {
        warnedAboutEcmaVersion = true;
        console.warn("Since Acorn 8.0.0, options.ecmaVersion is required.\nDefaulting to 2020, but this will stop working in the future.");
      }
      options.ecmaVersion = 11;
    } else if (options.ecmaVersion >= 2015) {
      options.ecmaVersion -= 2009;
    }
    if (options.allowReserved == null) {
      options.allowReserved = options.ecmaVersion < 5;
    }
    if (!opts || opts.allowHashBang == null) {
      options.allowHashBang = options.ecmaVersion >= 14;
    }
    if (isArray(options.onToken)) {
      var tokens = options.onToken;
      options.onToken = function(token) {
        return tokens.push(token);
      };
    }
    if (isArray(options.onComment)) {
      options.onComment = pushComment(options, options.onComment);
    }
    if (options.sourceType === "commonjs" && options.allowAwaitOutsideFunction) {
      throw new Error("Cannot use allowAwaitOutsideFunction with sourceType: commonjs");
    }
    return options;
  }
  function pushComment(options, array) {
    return function(block, text, start, end, startLoc, endLoc) {
      var comment = {
        type: block ? "Block" : "Line",
        value: text,
        start,
        end
      };
      if (options.locations) {
        comment.loc = new SourceLocation(this, startLoc, endLoc);
      }
      if (options.ranges) {
        comment.range = [start, end];
      }
      array.push(comment);
    };
  }
  var SCOPE_TOP = 1;
  var SCOPE_FUNCTION = 2;
  var SCOPE_ASYNC = 4;
  var SCOPE_GENERATOR = 8;
  var SCOPE_ARROW = 16;
  var SCOPE_SIMPLE_CATCH = 32;
  var SCOPE_SUPER = 64;
  var SCOPE_DIRECT_SUPER = 128;
  var SCOPE_CLASS_STATIC_BLOCK = 256;
  var SCOPE_CLASS_FIELD_INIT = 512;
  var SCOPE_SWITCH = 1024;
  var SCOPE_VAR = SCOPE_TOP | SCOPE_FUNCTION | SCOPE_CLASS_STATIC_BLOCK;
  function functionFlags(async, generator) {
    return SCOPE_FUNCTION | (async ? SCOPE_ASYNC : 0) | (generator ? SCOPE_GENERATOR : 0);
  }
  var BIND_NONE = 0;
  var BIND_VAR = 1;
  var BIND_LEXICAL = 2;
  var BIND_FUNCTION = 3;
  var BIND_SIMPLE_CATCH = 4;
  var BIND_OUTSIDE = 5;
  var Parser = function Parser2(options, input, startPos) {
    this.options = options = getOptions(options);
    this.sourceFile = options.sourceFile;
    this.keywords = wordsRegexp(keywords$1[options.ecmaVersion >= 6 ? 6 : options.sourceType === "module" ? "5module" : 5]);
    var reserved = "";
    if (options.allowReserved !== true) {
      reserved = reservedWords[options.ecmaVersion >= 6 ? 6 : options.ecmaVersion === 5 ? 5 : 3];
      if (options.sourceType === "module") {
        reserved += " await";
      }
    }
    this.reservedWords = wordsRegexp(reserved);
    var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
    this.reservedWordsStrict = wordsRegexp(reservedStrict);
    this.reservedWordsStrictBind = wordsRegexp(reservedStrict + " " + reservedWords.strictBind);
    this.input = String(input);
    this.containsEsc = false;
    if (startPos) {
      this.pos = startPos;
      this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1;
      this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
    } else {
      this.pos = this.lineStart = 0;
      this.curLine = 1;
    }
    this.type = types$1.eof;
    this.value = null;
    this.start = this.end = this.pos;
    this.startLoc = this.endLoc = this.curPosition();
    this.lastTokEndLoc = this.lastTokStartLoc = null;
    this.lastTokStart = this.lastTokEnd = this.pos;
    this.context = this.initialContext();
    this.exprAllowed = true;
    this.inModule = options.sourceType === "module";
    this.strict = this.inModule || options.strict === true || this.strictDirective(this.pos);
    this.potentialArrowAt = -1;
    this.potentialArrowInForAwait = false;
    this.yieldPos = this.awaitPos = this.awaitIdentPos = 0;
    this.labels = [];
    this.undefinedExports = /* @__PURE__ */ Object.create(null);
    if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!") {
      this.skipLineComment(2);
    }
    this.scopeStack = [];
    this.enterScope(
      this.options.sourceType === "commonjs" ? SCOPE_FUNCTION : SCOPE_TOP
    );
    this.regexpState = null;
    this.privateNameStack = [];
  };
  var prototypeAccessors = { inFunction: { configurable: true }, inGenerator: { configurable: true }, inAsync: { configurable: true }, canAwait: { configurable: true }, allowReturn: { configurable: true }, allowSuper: { configurable: true }, allowDirectSuper: { configurable: true }, treatFunctionsAsVar: { configurable: true }, allowNewDotTarget: { configurable: true }, allowUsing: { configurable: true }, inClassStaticBlock: { configurable: true } };
  Parser.prototype.parse = function parse() {
    var this$1$1 = this;
    var node = this.options.program || this.startNode();
    this.nextToken();
    return this.catchStackOverflow(function() {
      return this$1$1.parseTopLevel(node);
    });
  };
  prototypeAccessors.inFunction.get = function() {
    return (this.currentVarScope().flags & SCOPE_FUNCTION) > 0;
  };
  prototypeAccessors.inGenerator.get = function() {
    return (this.currentVarScope().flags & SCOPE_GENERATOR) > 0;
  };
  prototypeAccessors.inAsync.get = function() {
    return (this.currentVarScope().flags & SCOPE_ASYNC) > 0;
  };
  prototypeAccessors.canAwait.get = function() {
    for (var i2 = this.scopeStack.length - 1; i2 >= 0; i2--) {
      var ref2 = this.scopeStack[i2];
      var flags = ref2.flags;
      if (flags & (SCOPE_CLASS_STATIC_BLOCK | SCOPE_CLASS_FIELD_INIT)) {
        return false;
      }
      if (flags & SCOPE_FUNCTION) {
        return (flags & SCOPE_ASYNC) > 0;
      }
    }
    return this.inModule && this.options.ecmaVersion >= 13 || this.options.allowAwaitOutsideFunction;
  };
  prototypeAccessors.allowReturn.get = function() {
    if (this.inFunction) {
      return true;
    }
    if (this.options.allowReturnOutsideFunction && this.currentVarScope().flags & SCOPE_TOP) {
      return true;
    }
    return false;
  };
  prototypeAccessors.allowSuper.get = function() {
    var ref2 = this.currentThisScope();
    var flags = ref2.flags;
    return (flags & SCOPE_SUPER) > 0 || this.options.allowSuperOutsideMethod;
  };
  prototypeAccessors.allowDirectSuper.get = function() {
    return (this.currentThisScope().flags & SCOPE_DIRECT_SUPER) > 0;
  };
  prototypeAccessors.treatFunctionsAsVar.get = function() {
    return this.treatFunctionsAsVarInScope(this.currentScope());
  };
  prototypeAccessors.allowNewDotTarget.get = function() {
    for (var i2 = this.scopeStack.length - 1; i2 >= 0; i2--) {
      var ref2 = this.scopeStack[i2];
      var flags = ref2.flags;
      if (flags & (SCOPE_CLASS_STATIC_BLOCK | SCOPE_CLASS_FIELD_INIT) || flags & SCOPE_FUNCTION && !(flags & SCOPE_ARROW)) {
        return true;
      }
    }
    return false;
  };
  prototypeAccessors.allowUsing.get = function() {
    var ref2 = this.currentScope();
    var flags = ref2.flags;
    if (flags & SCOPE_SWITCH) {
      return false;
    }
    if (!this.inModule && flags & SCOPE_TOP) {
      return false;
    }
    return true;
  };
  prototypeAccessors.inClassStaticBlock.get = function() {
    return (this.currentVarScope().flags & SCOPE_CLASS_STATIC_BLOCK) > 0;
  };
  Parser.extend = function extend() {
    var plugins = [], len = arguments.length;
    while (len--) plugins[len] = arguments[len];
    var cls = this;
    for (var i2 = 0; i2 < plugins.length; i2++) {
      cls = plugins[i2](cls);
    }
    return cls;
  };
  Parser.parse = function parse2(input, options) {
    return new this(options, input).parse();
  };
  Parser.parseExpressionAt = function parseExpressionAt(input, pos, options) {
    var parser = new this(options, input, pos);
    parser.nextToken();
    return parser.parseExpression();
  };
  Parser.tokenizer = function tokenizer(input, options) {
    return new this(options, input);
  };
  Object.defineProperties(Parser.prototype, prototypeAccessors);
  var pp$9 = Parser.prototype;
  var literal = /^(?:'((?:\\[^]|[^'\\])*?)'|"((?:\\[^]|[^"\\])*?)")/;
  pp$9.strictDirective = function(start) {
    if (this.options.ecmaVersion < 5) {
      return false;
    }
    for (; ; ) {
      skipWhiteSpace.lastIndex = start;
      start += skipWhiteSpace.exec(this.input)[0].length;
      var match = literal.exec(this.input.slice(start));
      if (!match) {
        return false;
      }
      if ((match[1] || match[2]) === "use strict") {
        skipWhiteSpace.lastIndex = start + match[0].length;
        var spaceAfter = skipWhiteSpace.exec(this.input), end = spaceAfter.index + spaceAfter[0].length;
        var next = this.input.charAt(end);
        return next === ";" || next === "}" || lineBreak.test(spaceAfter[0]) && !(/[(`.[+\-/*%<>=,?^&]/.test(next) || next === "!" && this.input.charAt(end + 1) === "=");
      }
      start += match[0].length;
      skipWhiteSpace.lastIndex = start;
      start += skipWhiteSpace.exec(this.input)[0].length;
      if (this.input[start] === ";") {
        start++;
      }
    }
  };
  pp$9.eat = function(type) {
    if (this.type === type) {
      this.next();
      return true;
    } else {
      return false;
    }
  };
  pp$9.isContextual = function(name) {
    return this.type === types$1.name && this.value === name && !this.containsEsc;
  };
  pp$9.eatContextual = function(name) {
    if (!this.isContextual(name)) {
      return false;
    }
    this.next();
    return true;
  };
  pp$9.catchStackOverflow = function(f) {
    try {
      return f();
    } catch (e) {
      if (e instanceof Error && (/\bstack\b.*\b(exceeded|overflow)\b/i.test(e.message) || /\btoo much recursion\b/i.test(e.message))) {
        this.raise(this.start, "Not enough stack space to parse input");
      } else {
        throw e;
      }
    }
  };
  pp$9.expectContextual = function(name) {
    if (!this.eatContextual(name)) {
      this.unexpected();
    }
  };
  pp$9.canInsertSemicolon = function() {
    return this.type === types$1.eof || this.type === types$1.braceR || lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
  };
  pp$9.insertSemicolon = function() {
    if (this.canInsertSemicolon()) {
      if (this.options.onInsertedSemicolon) {
        this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc);
      }
      return true;
    }
  };
  pp$9.semicolon = function() {
    if (!this.eat(types$1.semi) && !this.insertSemicolon()) {
      this.unexpected();
    }
  };
  pp$9.afterTrailingComma = function(tokType, notNext) {
    if (this.type === tokType) {
      if (this.options.onTrailingComma) {
        this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc);
      }
      if (!notNext) {
        this.next();
      }
      return true;
    }
  };
  pp$9.expect = function(type) {
    this.eat(type) || this.unexpected();
  };
  pp$9.unexpected = function(pos) {
    this.raise(pos != null ? pos : this.start, "Unexpected token");
  };
  var DestructuringErrors = function DestructuringErrors2() {
    this.shorthandAssign = this.trailingComma = this.parenthesizedAssign = this.parenthesizedBind = this.doubleProto = -1;
  };
  pp$9.checkPatternErrors = function(refDestructuringErrors, isAssign) {
    if (!refDestructuringErrors) {
      return;
    }
    if (refDestructuringErrors.trailingComma > -1) {
      this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element");
    }
    var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
    if (parens > -1) {
      this.raiseRecoverable(parens, isAssign ? "Assigning to rvalue" : "Parenthesized pattern");
    }
  };
  pp$9.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
    if (!refDestructuringErrors) {
      return false;
    }
    var shorthandAssign = refDestructuringErrors.shorthandAssign;
    var doubleProto = refDestructuringErrors.doubleProto;
    if (!andThrow) {
      return shorthandAssign >= 0 || doubleProto >= 0;
    }
    if (shorthandAssign >= 0) {
      this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns");
    }
    if (doubleProto >= 0) {
      this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property");
    }
  };
  pp$9.checkYieldAwaitInDefaultParams = function() {
    if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos)) {
      this.raise(this.yieldPos, "Yield expression cannot be a default value");
    }
    if (this.awaitPos) {
      this.raise(this.awaitPos, "Await expression cannot be a default value");
    }
  };
  pp$9.isSimpleAssignTarget = function(expr) {
    if (expr.type === "ParenthesizedExpression") {
      return this.isSimpleAssignTarget(expr.expression);
    }
    return expr.type === "Identifier" || expr.type === "MemberExpression";
  };
  var pp$8 = Parser.prototype;
  pp$8.parseTopLevel = function(node) {
    var exports$1 = /* @__PURE__ */ Object.create(null);
    if (!node.body) {
      node.body = [];
    }
    while (this.type !== types$1.eof) {
      var stmt = this.parseStatement(null, true, exports$1);
      node.body.push(stmt);
    }
    if (this.inModule) {
      for (var i2 = 0, list2 = Object.keys(this.undefinedExports); i2 < list2.length; i2 += 1) {
        var name = list2[i2];
        this.raiseRecoverable(this.undefinedExports[name].start, "Export '" + name + "' is not defined");
      }
    }
    this.adaptDirectivePrologue(node.body);
    this.next();
    node.sourceType = this.options.sourceType === "commonjs" ? "script" : this.options.sourceType;
    return this.finishNode(node, "Program");
  };
  var loopLabel = { kind: "loop" };
  var switchLabel = { kind: "switch" };
  pp$8.isLet = function(context) {
    if (this.options.ecmaVersion < 6 || !this.isContextual("let")) {
      return false;
    }
    skipWhiteSpace.lastIndex = this.pos;
    var skip = skipWhiteSpace.exec(this.input);
    var next = this.pos + skip[0].length, nextCh = this.fullCharCodeAt(next);
    if (nextCh === 91 || nextCh === 92) {
      return true;
    }
    if (context) {
      return false;
    }
    if (nextCh === 123) {
      return true;
    }
    if (isIdentifierStart(nextCh)) {
      var start = next;
      do {
        next += nextCh <= 65535 ? 1 : 2;
      } while (isIdentifierChar(nextCh = this.fullCharCodeAt(next)));
      if (nextCh === 92) {
        return true;
      }
      var ident = this.input.slice(start, next);
      if (!keywordRelationalOperator.test(ident)) {
        return true;
      }
    }
    return false;
  };
  pp$8.isAsyncFunction = function() {
    if (this.options.ecmaVersion < 8 || !this.isContextual("async")) {
      return false;
    }
    skipWhiteSpace.lastIndex = this.pos;
    var skip = skipWhiteSpace.exec(this.input);
    var next = this.pos + skip[0].length, after;
    return !lineBreak.test(this.input.slice(this.pos, next)) && this.input.slice(next, next + 8) === "function" && (next + 8 === this.input.length || !(isIdentifierChar(after = this.fullCharCodeAt(next + 8)) || after === 92));
  };
  pp$8.isUsingKeyword = function(isAwaitUsing, isFor) {
    if (this.options.ecmaVersion < 17 || !this.isContextual(isAwaitUsing ? "await" : "using")) {
      return false;
    }
    skipWhiteSpace.lastIndex = this.pos;
    var skip = skipWhiteSpace.exec(this.input);
    var next = this.pos + skip[0].length;
    if (lineBreak.test(this.input.slice(this.pos, next))) {
      return false;
    }
    if (isAwaitUsing) {
      var usingEndPos = next + 5, after;
      if (this.input.slice(next, usingEndPos) !== "using" || usingEndPos === this.input.length || isIdentifierChar(after = this.fullCharCodeAt(usingEndPos)) || after === 92) {
        return false;
      }
      skipWhiteSpace.lastIndex = usingEndPos;
      var skipAfterUsing = skipWhiteSpace.exec(this.input);
      next = usingEndPos + skipAfterUsing[0].length;
      if (skipAfterUsing && lineBreak.test(this.input.slice(usingEndPos, next))) {
        return false;
      }
    }
    var ch = this.fullCharCodeAt(next);
    if (!isIdentifierStart(ch) && ch !== 92) {
      return false;
    }
    var idStart = next;
    do {
      next += ch <= 65535 ? 1 : 2;
    } while (isIdentifierChar(ch = this.fullCharCodeAt(next)));
    if (ch === 92) {
      return true;
    }
    var id = this.input.slice(idStart, next);
    if (keywordRelationalOperator.test(id)) {
      return false;
    }
    if (isFor && !isAwaitUsing && id === "of") {
      skipWhiteSpace.lastIndex = next;
      var skipAfterOf = skipWhiteSpace.exec(this.input);
      next = next + skipAfterOf[0].length;
      if (this.input.charCodeAt(next) !== 61 || // Check for ==, === and => operators
      (ch = this.input.charCodeAt(next + 1)) === 61 || ch === 62) {
        return false;
      }
    }
    return true;
  };
  pp$8.isAwaitUsing = function(isFor) {
    return this.isUsingKeyword(true, isFor);
  };
  pp$8.isUsing = function(isFor) {
    return this.isUsingKeyword(false, isFor);
  };
  pp$8.parseStatement = function(context, topLevel, exports$1) {
    var starttype = this.type, node = this.startNode(), kind;
    if (this.isLet(context)) {
      starttype = types$1._var;
      kind = "let";
    }
    switch (starttype) {
      case types$1._break:
      case types$1._continue:
        return this.parseBreakContinueStatement(node, starttype.keyword);
      case types$1._debugger:
        return this.parseDebuggerStatement(node);
      case types$1._do:
        return this.parseDoStatement(node);
      case types$1._for:
        return this.parseForStatement(node);
      case types$1._function:
        if (context && (this.strict || context !== "if" && context !== "label") && this.options.ecmaVersion >= 6) {
          this.unexpected();
        }
        return this.parseFunctionStatement(node, false, !context);
      case types$1._class:
        if (context) {
          this.unexpected();
        }
        return this.parseClass(node, true);
      case types$1._if:
        return this.parseIfStatement(node);
      case types$1._return:
        return this.parseReturnStatement(node);
      case types$1._switch:
        return this.parseSwitchStatement(node);
      case types$1._throw:
        return this.parseThrowStatement(node);
      case types$1._try:
        return this.parseTryStatement(node);
      case types$1._const:
      case types$1._var:
        kind = kind || this.value;
        if (context && kind !== "var") {
          this.unexpected();
        }
        return this.parseVarStatement(node, kind);
      case types$1._while:
        return this.parseWhileStatement(node);
      case types$1._with:
        return this.parseWithStatement(node);
      case types$1.braceL:
        return this.parseBlock(true, node);
      case types$1.semi:
        return this.parseEmptyStatement(node);
      case types$1._export:
      case types$1._import:
        if (this.options.ecmaVersion > 10 && starttype === types$1._import) {
          skipWhiteSpace.lastIndex = this.pos;
          var skip = skipWhiteSpace.exec(this.input);
          var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
          if (nextCh === 40 || nextCh === 46) {
            return this.parseExpressionStatement(node, this.parseExpression());
          }
        }
        if (!this.options.allowImportExportEverywhere) {
          if (!topLevel) {
            this.raise(this.start, "'import' and 'export' may only appear at the top level");
          }
          if (!this.inModule) {
            this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'");
          }
        }
        return starttype === types$1._import ? this.parseImport(node) : this.parseExport(node, exports$1);
      // If the statement does not start with a statement keyword or a
      // brace, it's an ExpressionStatement or LabeledStatement. We
      // simply start parsing an expression, and afterwards, if the
      // next token is a colon and the expression was a simple
      // Identifier node, we switch to interpreting it as a label.
      default:
        if (this.isAsyncFunction()) {
          if (context) {
            this.unexpected();
          }
          this.next();
          return this.parseFunctionStatement(node, true, !context);
        }
        var usingKind = this.isAwaitUsing(false) ? "await using" : this.isUsing(false) ? "using" : null;
        if (usingKind) {
          if (!this.allowUsing) {
            this.raise(this.start, "Using declaration cannot appear in the top level when source type is `script` or in the bare case statement");
          }
          if (context) {
            this.raise(this.start, "Using declaration is not allowed in single-statement positions");
          }
          if (usingKind === "await using") {
            if (!this.canAwait) {
              this.raise(this.start, "Await using cannot appear outside of async function");
            }
            this.next();
          }
          this.next();
          this.parseVar(node, false, usingKind);
          this.semicolon();
          return this.finishNode(node, "VariableDeclaration");
        }
        var maybeName = this.value, expr = this.parseExpression();
        if (starttype === types$1.name && expr.type === "Identifier" && this.eat(types$1.colon)) {
          return this.parseLabeledStatement(node, maybeName, expr, context);
        } else {
          return this.parseExpressionStatement(node, expr);
        }
    }
  };
  pp$8.parseBreakContinueStatement = function(node, keyword) {
    var isBreak = keyword === "break";
    this.next();
    if (this.eat(types$1.semi) || this.insertSemicolon()) {
      node.label = null;
    } else if (this.type !== types$1.name) {
      this.unexpected();
    } else {
      node.label = this.parseIdent();
      this.semicolon();
    }
    var i2 = 0;
    for (; i2 < this.labels.length; ++i2) {
      var lab = this.labels[i2];
      if (node.label == null || lab.name === node.label.name) {
        if (lab.kind != null && (isBreak || lab.kind === "loop")) {
          break;
        }
        if (node.label && isBreak) {
          break;
        }
      }
    }
    if (i2 === this.labels.length) {
      this.raise(node.start, "Unsyntactic " + keyword);
    }
    return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");
  };
  pp$8.parseDebuggerStatement = function(node) {
    this.next();
    this.semicolon();
    return this.finishNode(node, "DebuggerStatement");
  };
  pp$8.parseDoStatement = function(node) {
    this.next();
    this.labels.push(loopLabel);
    node.body = this.parseStatement("do");
    this.labels.pop();
    this.expect(types$1._while);
    node.test = this.parseParenExpression();
    if (this.options.ecmaVersion >= 6) {
      this.eat(types$1.semi);
    } else {
      this.semicolon();
    }
    return this.finishNode(node, "DoWhileStatement");
  };
  pp$8.parseForStatement = function(node) {
    this.next();
    var awaitAt = this.options.ecmaVersion >= 9 && this.canAwait && this.eatContextual("await") ? this.lastTokStart : -1;
    this.labels.push(loopLabel);
    this.enterScope(0);
    this.expect(types$1.parenL);
    if (this.type === types$1.semi) {
      if (awaitAt > -1) {
        this.unexpected(awaitAt);
      }
      return this.parseFor(node, null);
    }
    var isLet = this.isLet();
    if (this.type === types$1._var || this.type === types$1._const || isLet) {
      var init$1 = this.startNode(), kind = isLet ? "let" : this.value;
      this.next();
      this.parseVar(init$1, true, kind);
      this.finishNode(init$1, "VariableDeclaration");
      return this.parseForAfterInit(node, init$1, awaitAt);
    }
    var startsWithLet = this.isContextual("let"), isForOf = false;
    var usingKind = this.isUsing(true) ? "using" : this.isAwaitUsing(true) ? "await using" : null;
    if (usingKind) {
      var init$2 = this.startNode();
      this.next();
      if (usingKind === "await using") {
        if (!this.canAwait) {
          this.raise(this.start, "Await using cannot appear outside of async function");
        }
        this.next();
      }
      this.parseVar(init$2, true, usingKind);
      this.finishNode(init$2, "VariableDeclaration");
      return this.parseForAfterInit(node, init$2, awaitAt);
    }
    var containsEsc = this.containsEsc;
    var refDestructuringErrors = new DestructuringErrors();
    var initPos = this.start;
    var init = awaitAt > -1 ? this.parseExprSubscripts(refDestructuringErrors, "await") : this.parseExpression(true, refDestructuringErrors);
    if (this.type === types$1._in || (isForOf = this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
      if (awaitAt > -1) {
        if (this.type === types$1._in) {
          this.unexpected(awaitAt);
        }
        node.await = true;
      } else if (isForOf && this.options.ecmaVersion >= 8) {
        if (init.start === initPos && !containsEsc && init.type === "Identifier" && init.name === "async") {
          this.unexpected();
        } else if (this.options.ecmaVersion >= 9) {
          node.await = false;
        }
      }
      if (startsWithLet && isForOf) {
        this.raise(init.start, "The left-hand side of a for-of loop may not start with 'let'.");
      }
      this.toAssignable(init, false, refDestructuringErrors);
      this.checkLValPattern(init);
      return this.parseForIn(node, init);
    } else {
      this.checkExpressionErrors(refDestructuringErrors, true);
    }
    if (awaitAt > -1) {
      this.unexpected(awaitAt);
    }
    return this.parseFor(node, init);
  };
  pp$8.parseForAfterInit = function(node, init, awaitAt) {
    if ((this.type === types$1._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) && init.declarations.length === 1) {
      if (this.type === types$1._in) {
        if ((init.kind === "using" || init.kind === "await using") && !init.declarations[0].init) {
          this.raise(this.start, "Using declaration is not allowed in for-in loops");
        }
        if (this.options.ecmaVersion >= 9 && awaitAt > -1) {
          this.unexpected(awaitAt);
        }
      } else if (this.options.ecmaVersion >= 9) {
        node.await = awaitAt > -1;
      }
      return this.parseForIn(node, init);
    }
    if (awaitAt > -1) {
      this.unexpected(awaitAt);
    }
    return this.parseFor(node, init);
  };
  pp$8.parseFunctionStatement = function(node, isAsync, declarationPosition) {
    this.next();
    return this.parseFunction(node, FUNC_STATEMENT | (declarationPosition ? 0 : FUNC_HANGING_STATEMENT), false, isAsync);
  };
  pp$8.parseIfStatement = function(node) {
    this.next();
    node.test = this.parseParenExpression();
    node.consequent = this.parseStatement("if");
    node.alternate = this.eat(types$1._else) ? this.parseStatement("if") : null;
    return this.finishNode(node, "IfStatement");
  };
  pp$8.parseReturnStatement = function(node) {
    if (!this.allowReturn) {
      this.raise(this.start, "'return' outside of function");
    }
    this.next();
    if (this.eat(types$1.semi) || this.insertSemicolon()) {
      node.argument = null;
    } else {
      node.argument = this.parseExpression();
      this.semicolon();
    }
    return this.finishNode(node, "ReturnStatement");
  };
  pp$8.parseSwitchStatement = function(node) {
    this.next();
    node.discriminant = this.parseParenExpression();
    node.cases = [];
    this.expect(types$1.braceL);
    this.labels.push(switchLabel);
    this.enterScope(SCOPE_SWITCH);
    var cur;
    for (var sawDefault = false; this.type !== types$1.braceR; ) {
      if (this.type === types$1._case || this.type === types$1._default) {
        var isCase = this.type === types$1._case;
        if (cur) {
          this.finishNode(cur, "SwitchCase");
        }
        node.cases.push(cur = this.startNode());
        cur.consequent = [];
        this.next();
        if (isCase) {
          cur.test = this.parseExpression();
        } else {
          if (sawDefault) {
            this.raiseRecoverable(this.lastTokStart, "Multiple default clauses");
          }
          sawDefault = true;
          cur.test = null;
        }
        this.expect(types$1.colon);
      } else {
        if (!cur) {
          this.unexpected();
        }
        cur.consequent.push(this.parseStatement(null));
      }
    }
    this.exitScope();
    if (cur) {
      this.finishNode(cur, "SwitchCase");
    }
    this.next();
    this.labels.pop();
    return this.finishNode(node, "SwitchStatement");
  };
  pp$8.parseThrowStatement = function(node) {
    this.next();
    if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) {
      this.raise(this.lastTokEnd, "Illegal newline after throw");
    }
    node.argument = this.parseExpression();
    this.semicolon();
    return this.finishNode(node, "ThrowStatement");
  };
  var empty$1 = [];
  pp$8.parseCatchClauseParam = function() {
    var param = this.parseBindingAtom();
    var simple = param.type === "Identifier";
    this.enterScope(simple ? SCOPE_SIMPLE_CATCH : 0);
    this.checkLValPattern(param, simple ? BIND_SIMPLE_CATCH : BIND_LEXICAL);
    this.expect(types$1.parenR);
    return param;
  };
  pp$8.parseTryStatement = function(node) {
    this.next();
    node.block = this.parseBlock();
    node.handler = null;
    if (this.type === types$1._catch) {
      var clause = this.startNode();
      this.next();
      if (this.eat(types$1.parenL)) {
        clause.param = this.parseCatchClauseParam();
      } else {
        if (this.options.ecmaVersion < 10) {
          this.unexpected();
        }
        clause.param = null;
        this.enterScope(0);
      }
      clause.body = this.parseBlock(false);
      this.exitScope();
      node.handler = this.finishNode(clause, "CatchClause");
    }
    node.finalizer = this.eat(types$1._finally) ? this.parseBlock() : null;
    if (!node.handler && !node.finalizer) {
      this.raise(node.start, "Missing catch or finally clause");
    }
    return this.finishNode(node, "TryStatement");
  };
  pp$8.parseVarStatement = function(node, kind, allowMissingInitializer) {
    this.next();
    this.parseVar(node, false, kind, allowMissingInitializer);
    this.semicolon();
    return this.finishNode(node, "VariableDeclaration");
  };
  pp$8.parseWhileStatement = function(node) {
    this.next();
    node.test = this.parseParenExpression();
    this.labels.push(loopLabel);
    node.body = this.parseStatement("while");
    this.labels.pop();
    return this.finishNode(node, "WhileStatement");
  };
  pp$8.parseWithStatement = function(node) {
    if (this.strict) {
      this.raise(this.start, "'with' in strict mode");
    }
    this.next();
    node.object = this.parseParenExpression();
    node.body = this.parseStatement("with");
    return this.finishNode(node, "WithStatement");
  };
  pp$8.parseEmptyStatement = function(node) {
    this.next();
    return this.finishNode(node, "EmptyStatement");
  };
  pp$8.parseLabeledStatement = function(node, maybeName, expr, context) {
    for (var i$1 = 0, list2 = this.labels; i$1 < list2.length; i$1 += 1) {
      var label = list2[i$1];
      if (label.name === maybeName) {
        this.raise(expr.start, "Label '" + maybeName + "' is already declared");
      }
    }
    var kind = this.type.isLoop ? "loop" : this.type === types$1._switch ? "switch" : null;
    for (var i2 = this.labels.length - 1; i2 >= 0; i2--) {
      var label$1 = this.labels[i2];
      if (label$1.statementStart === node.start) {
        label$1.statementStart = this.start;
        label$1.kind = kind;
      } else {
        break;
      }
    }
    this.labels.push({ name: maybeName, kind, statementStart: this.start });
    node.body = this.parseStatement(context ? context.indexOf("label") === -1 ? context + "label" : context : "label");
    this.labels.pop();
    node.label = expr;
    return this.finishNode(node, "LabeledStatement");
  };
  pp$8.parseExpressionStatement = function(node, expr) {
    node.expression = expr;
    this.semicolon();
    return this.finishNode(node, "ExpressionStatement");
  };
  pp$8.parseBlock = function(createNewLexicalScope, node, exitStrict) {
    if (createNewLexicalScope === void 0) createNewLexicalScope = true;
    if (node === void 0) node = this.startNode();
    node.body = [];
    this.expect(types$1.braceL);
    if (createNewLexicalScope) {
      this.enterScope(0);
    }
    while (this.type !== types$1.braceR) {
      var stmt = this.parseStatement(null);
      node.body.push(stmt);
    }
    if (exitStrict) {
      this.strict = false;
    }
    this.next();
    if (createNewLexicalScope) {
      this.exitScope();
    }
    return this.finishNode(node, "BlockStatement");
  };
  pp$8.parseFor = function(node, init) {
    node.init = init;
    this.expect(types$1.semi);
    node.test = this.type === types$1.semi ? null : this.parseExpression();
    this.expect(types$1.semi);
    node.update = this.type === types$1.parenR ? null : this.parseExpression();
    this.expect(types$1.parenR);
    node.body = this.parseStatement("for");
    this.exitScope();
    this.labels.pop();
    return this.finishNode(node, "ForStatement");
  };
  pp$8.parseForIn = function(node, init) {
    var isForIn = this.type === types$1._in;
    this.next();
    if (init.type === "VariableDeclaration" && init.declarations[0].init != null && (!isForIn || this.options.ecmaVersion < 8 || this.strict || init.kind !== "var" || init.declarations[0].id.type !== "Identifier")) {
      this.raise(
        init.start,
        (isForIn ? "for-in" : "for-of") + " loop variable declaration may not have an initializer"
      );
    }
    node.left = init;
    node.right = isForIn ? this.parseExpression() : this.parseMaybeAssign();
    this.expect(types$1.parenR);
    node.body = this.parseStatement("for");
    this.exitScope();
    this.labels.pop();
    return this.finishNode(node, isForIn ? "ForInStatement" : "ForOfStatement");
  };
  pp$8.parseVar = function(node, isFor, kind, allowMissingInitializer) {
    node.declarations = [];
    node.kind = kind;
    for (; ; ) {
      var decl = this.startNode();
      this.parseVarId(decl, kind);
      if (this.eat(types$1.eq)) {
        decl.init = this.parseMaybeAssign(isFor);
      } else if (!allowMissingInitializer && kind === "const" && !(this.type === types$1._in || this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
        this.unexpected();
      } else if (!allowMissingInitializer && (kind === "using" || kind === "await using") && this.options.ecmaVersion >= 17 && this.type !== types$1._in && !this.isContextual("of")) {
        this.raise(this.lastTokEnd, "Missing initializer in " + kind + " declaration");
      } else if (!allowMissingInitializer && decl.id.type !== "Identifier" && !(isFor && (this.type === types$1._in || this.isContextual("of")))) {
        this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
      } else {
        decl.init = null;
      }
      node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
      if (!this.eat(types$1.comma)) {
        break;
      }
    }
    return node;
  };
  pp$8.parseVarId = function(decl, kind) {
    decl.id = kind === "using" || kind === "await using" ? this.parseIdent() : this.parseBindingAtom();
    this.checkLValPattern(decl.id, kind === "var" ? BIND_VAR : BIND_LEXICAL, false);
  };
  var FUNC_STATEMENT = 1;
  var FUNC_HANGING_STATEMENT = 2;
  var FUNC_NULLABLE_ID = 4;
  pp$8.parseFunction = function(node, statement, allowExpressionBody, isAsync, forInit) {
    this.initFunction(node);
    if (this.options.ecmaVersion >= 9 || this.options.ecmaVersion >= 6 && !isAsync) {
      if (this.type === types$1.star && statement & FUNC_HANGING_STATEMENT) {
        this.unexpected();
      }
      node.generator = this.eat(types$1.star);
    }
    if (this.options.ecmaVersion >= 8) {
      node.async = !!isAsync;
    }
    if (statement & FUNC_STATEMENT) {
      node.id = statement & FUNC_NULLABLE_ID && this.type !== types$1.name ? null : this.parseIdent();
      if (node.id && !(statement & FUNC_HANGING_STATEMENT)) {
        this.checkLValSimple(node.id, this.strict || node.generator || node.async ? this.treatFunctionsAsVar ? BIND_VAR : BIND_LEXICAL : BIND_FUNCTION);
      }
    }
    var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;
    this.enterScope(functionFlags(node.async, node.generator));
    if (!(statement & FUNC_STATEMENT)) {
      node.id = this.type === types$1.name ? this.parseIdent() : null;
    }
    this.parseFunctionParams(node);
    this.parseFunctionBody(node, allowExpressionBody, false, forInit);
    this.yieldPos = oldYieldPos;
    this.awaitPos = oldAwaitPos;
    this.awaitIdentPos = oldAwaitIdentPos;
    return this.finishNode(node, statement & FUNC_STATEMENT ? "FunctionDeclaration" : "FunctionExpression");
  };
  pp$8.parseFunctionParams = function(node) {
    this.expect(types$1.parenL);
    node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
    this.checkYieldAwaitInDefaultParams();
  };
  pp$8.parseClass = function(node, isStatement) {
    this.next();
    var oldStrict = this.strict;
    this.strict = true;
    this.parseClassId(node, isStatement);
    this.parseClassSuper(node);
    var privateNameMap = this.enterClassBody();
    var classBody = this.startNode();
    var hadConstructor = false;
    classBody.body = [];
    this.expect(types$1.braceL);
    while (this.type !== types$1.braceR) {
      var element = this.parseClassElement(node.superClass !== null);
      if (element) {
        classBody.body.push(element);
        if (element.type === "MethodDefinition" && element.kind === "constructor") {
          if (hadConstructor) {
            this.raiseRecoverable(element.start, "Duplicate constructor in the same class");
          }
          hadConstructor = true;
        } else if (element.key && element.key.type === "PrivateIdentifier" && isPrivateNameConflicted(privateNameMap, element)) {
          this.raiseRecoverable(element.key.start, "Identifier '#" + element.key.name + "' has already been declared");
        }
      }
    }
    this.strict = oldStrict;
    this.next();
    node.body = this.finishNode(classBody, "ClassBody");
    this.exitClassBody();
    return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression");
  };
  pp$8.parseClassElement = function(constructorAllowsSuper) {
    if (this.eat(types$1.semi)) {
      return null;
    }
    var ecmaVersion2 = this.options.ecmaVersion;
    var node = this.startNode();
    var keyName = "";
    var isGenerator = false;
    var isAsync = false;
    var kind = "method";
    var isStatic = false;
    if (this.eatContextual("static")) {
      if (ecmaVersion2 >= 13 && this.eat(types$1.braceL)) {
        this.parseClassStaticBlock(node);
        return node;
      }
      if (this.isClassElementNameStart() || this.type === types$1.star) {
        isStatic = true;
      } else {
        keyName = "static";
      }
    }
    node.static = isStatic;
    if (!keyName && ecmaVersion2 >= 8 && this.eatContextual("async")) {
      if ((this.isClassElementNameStart() || this.type === types$1.star) && !this.canInsertSemicolon()) {
        isAsync = true;
      } else {
        keyName = "async";
      }
    }
    if (!keyName && (ecmaVersion2 >= 9 || !isAsync) && this.eat(types$1.star)) {
      isGenerator = true;
    }
    if (!keyName && !isAsync && !isGenerator) {
      var lastValue = this.value;
      if (this.eatContextual("get") || this.eatContextual("set")) {
        if (this.isClassElementNameStart()) {
          kind = lastValue;
        } else {
          keyName = lastValue;
        }
      }
    }
    if (keyName) {
      node.computed = false;
      node.key = this.startNodeAt(this.lastTokStart, this.lastTokStartLoc);
      node.key.name = keyName;
      this.finishNode(node.key, "Identifier");
    } else {
      this.parseClassElementName(node);
    }
    if (ecmaVersion2 < 13 || this.type === types$1.parenL || kind !== "method" || isGenerator || isAsync) {
      var isConstructor = !node.static && checkKeyName(node, "constructor");
      var allowsDirectSuper = isConstructor && constructorAllowsSuper;
      if (isConstructor && kind !== "method") {
        this.raise(node.key.start, "Constructor can't have get/set modifier");
      }
      node.kind = isConstructor ? "constructor" : kind;
      this.parseClassMethod(node, isGenerator, isAsync, allowsDirectSuper);
    } else {
      this.parseClassField(node);
    }
    return node;
  };
  pp$8.isClassElementNameStart = function() {
    return this.type === types$1.name || this.type === types$1.privateId || this.type === types$1.num || this.type === types$1.string || this.type === types$1.bracketL || this.type.keyword;
  };
  pp$8.parseClassElementName = function(element) {
    if (this.type === types$1.privateId) {
      if (this.value === "constructor") {
        this.raise(this.start, "Classes can't have an element named '#constructor'");
      }
      element.computed = false;
      element.key = this.parsePrivateIdent();
    } else {
      this.parsePropertyName(element);
    }
  };
  pp$8.parseClassMethod = function(method, isGenerator, isAsync, allowsDirectSuper) {
    var key = method.key;
    if (method.kind === "constructor") {
      if (isGenerator) {
        this.raise(key.start, "Constructor can't be a generator");
      }
      if (isAsync) {
        this.raise(key.start, "Constructor can't be an async method");
      }
    } else if (method.static && checkKeyName(method, "prototype")) {
      this.raise(key.start, "Classes may not have a static property named prototype");
    }
    var value = method.value = this.parseMethod(isGenerator, isAsync, allowsDirectSuper);
    if (method.kind === "get" && value.params.length !== 0) {
      this.raiseRecoverable(value.start, "getter should have no params");
    }
    if (method.kind === "set" && value.params.length !== 1) {
      this.raiseRecoverable(value.start, "setter should have exactly one param");
    }
    if (method.kind === "set" && value.params[0].type === "RestElement") {
      this.raiseRecoverable(value.params[0].start, "Setter cannot use rest params");
    }
    return this.finishNode(method, "MethodDefinition");
  };
  pp$8.parseClassField = function(field) {
    if (checkKeyName(field, "constructor")) {
      this.raise(field.key.start, "Classes can't have a field named 'constructor'");
    } else if (field.static && checkKeyName(field, "prototype")) {
      this.raise(field.key.start, "Classes can't have a static field named 'prototype'");
    }
    if (this.eat(types$1.eq)) {
      this.enterScope(SCOPE_CLASS_FIELD_INIT | SCOPE_SUPER);
      field.value = this.parseMaybeAssign();
      this.exitScope();
    } else {
      field.value = null;
    }
    this.semicolon();
    return this.finishNode(field, "PropertyDefinition");
  };
  pp$8.parseClassStaticBlock = function(node) {
    node.body = [];
    var oldLabels = this.labels;
    this.labels = [];
    this.enterScope(SCOPE_CLASS_STATIC_BLOCK | SCOPE_SUPER);
    while (this.type !== types$1.braceR) {
      var stmt = this.parseStatement(null);
      node.body.push(stmt);
    }
    this.next();
    this.exitScope();
    this.labels = oldLabels;
    return this.finishNode(node, "StaticBlock");
  };
  pp$8.parseClassId = function(node, isStatement) {
    if (this.type === types$1.name) {
      node.id = this.parseIdent();
      if (isStatement) {
        this.checkLValSimple(node.id, BIND_LEXICAL, false);
      }
    } else {
      if (isStatement === true) {
        this.unexpected();
      }
      node.id = null;
    }
  };
  pp$8.parseClassSuper = function(node) {
    node.superClass = this.eat(types$1._extends) ? this.parseExprSubscripts(null, false) : null;
  };
  pp$8.enterClassBody = function() {
    var element = { declared: /* @__PURE__ */ Object.create(null), used: [] };
    this.privateNameStack.push(element);
    return element.declared;
  };
  pp$8.exitClassBody = function() {
    var ref2 = this.privateNameStack.pop();
    var declared = ref2.declared;
    var used = ref2.used;
    if (!this.options.checkPrivateFields) {
      return;
    }
    var len = this.privateNameStack.length;
    var parent = len === 0 ? null : this.privateNameStack[len - 1];
    for (var i2 = 0; i2 < used.length; ++i2) {
      var id = used[i2];
      if (!hasOwn(declared, id.name)) {
        if (parent) {
          parent.used.push(id);
        } else {
          this.raiseRecoverable(id.start, "Private field '#" + id.name + "' must be declared in an enclosing class");
        }
      }
    }
  };
  function isPrivateNameConflicted(privateNameMap, element) {
    var name = element.key.name;
    var curr = privateNameMap[name];
    var next = "true";
    if (element.type === "MethodDefinition" && (element.kind === "get" || element.kind === "set")) {
      next = (element.static ? "s" : "i") + element.kind;
    }
    if (curr === "iget" && next === "iset" || curr === "iset" && next === "iget" || curr === "sget" && next === "sset" || curr === "sset" && next === "sget") {
      privateNameMap[name] = "true";
      return false;
    } else if (!curr) {
      privateNameMap[name] = next;
      return false;
    } else {
      return true;
    }
  }
  function checkKeyName(node, name) {
    var computed = node.computed;
    var key = node.key;
    return !computed && (key.type === "Identifier" && key.name === name || key.type === "Literal" && key.value === name);
  }
  pp$8.parseExportAllDeclaration = function(node, exports$1) {
    if (this.options.ecmaVersion >= 11) {
      if (this.eatContextual("as")) {
        node.exported = this.parseModuleExportName();
        this.checkExport(exports$1, node.exported, this.lastTokStart);
      } else {
        node.exported = null;
      }
    }
    this.expectContextual("from");
    if (this.type !== types$1.string) {
      this.unexpected();
    }
    node.source = this.parseExprAtom();
    if (this.options.ecmaVersion >= 16) {
      node.attributes = this.parseWithClause();
    }
    this.semicolon();
    return this.finishNode(node, "ExportAllDeclaration");
  };
  pp$8.parseExport = function(node, exports$1) {
    this.next();
    if (this.eat(types$1.star)) {
      return this.parseExportAllDeclaration(node, exports$1);
    }
    if (this.eat(types$1._default)) {
      this.checkExport(exports$1, "default", this.lastTokStart);
      node.declaration = this.parseExportDefaultDeclaration();
      return this.finishNode(node, "ExportDefaultDeclaration");
    }
    if (this.shouldParseExportStatement()) {
      node.declaration = this.parseExportDeclaration(node);
      if (node.declaration.type === "VariableDeclaration") {
        this.checkVariableExport(exports$1, node.declaration.declarations);
      } else {
        this.checkExport(exports$1, node.declaration.id, node.declaration.id.start);
      }
      node.specifiers = [];
      node.source = null;
      if (this.options.ecmaVersion >= 16) {
        node.attributes = [];
      }
    } else {
      node.declaration = null;
      node.specifiers = this.parseExportSpecifiers(exports$1);
      if (this.eatContextual("from")) {
        if (this.type !== types$1.string) {
          this.unexpected();
        }
        node.source = this.parseExprAtom();
        if (this.options.ecmaVersion >= 16) {
          node.attributes = this.parseWithClause();
        }
      } else {
        for (var i2 = 0, list2 = node.specifiers; i2 < list2.length; i2 += 1) {
          var spec = list2[i2];
          this.checkUnreserved(spec.local);
          this.checkLocalExport(spec.local);
          if (spec.local.type === "Literal") {
            this.raise(spec.local.start, "A string literal cannot be used as an exported binding without `from`.");
          }
        }
        node.source = null;
        if (this.options.ecmaVersion >= 16) {
          node.attributes = [];
        }
      }
      this.semicolon();
    }
    return this.finishNode(node, "ExportNamedDeclaration");
  };
  pp$8.parseExportDeclaration = function(node) {
    return this.parseStatement(null);
  };
  pp$8.parseExportDefaultDeclaration = function() {
    var isAsync;
    if (this.type === types$1._function || (isAsync = this.isAsyncFunction())) {
      var fNode = this.startNode();
      this.next();
      if (isAsync) {
        this.next();
      }
      return this.parseFunction(fNode, FUNC_STATEMENT | FUNC_NULLABLE_ID, false, isAsync);
    } else if (this.type === types$1._class) {
      var cNode = this.startNode();
      return this.parseClass(cNode, "nullableID");
    } else {
      var declaration = this.parseMaybeAssign();
      this.semicolon();
      return declaration;
    }
  };
  pp$8.checkExport = function(exports$1, name, pos) {
    if (!exports$1) {
      return;
    }
    if (typeof name !== "string") {
      name = name.type === "Identifier" ? name.name : name.value;
    }
    if (hasOwn(exports$1, name)) {
      this.raiseRecoverable(pos, "Duplicate export '" + name + "'");
    }
    exports$1[name] = true;
  };
  pp$8.checkPatternExport = function(exports$1, pat) {
    var type = pat.type;
    if (type === "Identifier") {
      this.checkExport(exports$1, pat, pat.start);
    } else if (type === "ObjectPattern") {
      for (var i2 = 0, list2 = pat.properties; i2 < list2.length; i2 += 1) {
        var prop = list2[i2];
        this.checkPatternExport(exports$1, prop);
      }
    } else if (type === "ArrayPattern") {
      for (var i$1 = 0, list$1 = pat.elements; i$1 < list$1.length; i$1 += 1) {
        var elt = list$1[i$1];
        if (elt) {
          this.checkPatternExport(exports$1, elt);
        }
      }
    } else if (type === "Property") {
      this.checkPatternExport(exports$1, pat.value);
    } else if (type === "AssignmentPattern") {
      this.checkPatternExport(exports$1, pat.left);
    } else if (type === "RestElement") {
      this.checkPatternExport(exports$1, pat.argument);
    }
  };
  pp$8.checkVariableExport = function(exports$1, decls) {
    if (!exports$1) {
      return;
    }
    for (var i2 = 0, list2 = decls; i2 < list2.length; i2 += 1) {
      var decl = list2[i2];
      this.checkPatternExport(exports$1, decl.id);
    }
  };
  pp$8.shouldParseExportStatement = function() {
    return this.type.keyword === "var" || this.type.keyword === "const" || this.type.keyword === "class" || this.type.keyword === "function" || this.isLet() || this.isAsyncFunction();
  };
  pp$8.parseExportSpecifier = function(exports$1) {
    var node = this.startNode();
    node.local = this.parseModuleExportName();
    node.exported = this.eatContextual("as") ? this.parseModuleExportName() : node.local;
    this.checkExport(
      exports$1,
      node.exported,
      node.exported.start
    );
    return this.finishNode(node, "ExportSpecifier");
  };
  pp$8.parseExportSpecifiers = function(exports$1) {
    var nodes = [], first = true;
    this.expect(types$1.braceL);
    while (!this.eat(types$1.braceR)) {
      if (!first) {
        this.expect(types$1.comma);
        if (this.afterTrailingComma(types$1.braceR)) {
          break;
        }
      } else {
        first = false;
      }
      nodes.push(this.parseExportSpecifier(exports$1));
    }
    return nodes;
  };
  pp$8.parseImport = function(node) {
    this.next();
    if (this.type === types$1.string) {
      node.specifiers = empty$1;
      node.source = this.parseExprAtom();
    } else {
      node.specifiers = this.parseImportSpecifiers();
      this.expectContextual("from");
      node.source = this.type === types$1.string ? this.parseExprAtom() : this.unexpected();
    }
    if (this.options.ecmaVersion >= 16) {
      node.attributes = this.parseWithClause();
    }
    this.semicolon();
    return this.finishNode(node, "ImportDeclaration");
  };
  pp$8.parseImportSpecifier = function() {
    var node = this.startNode();
    node.imported = this.parseModuleExportName();
    if (this.eatContextual("as")) {
      node.local = this.parseIdent();
    } else {
      this.checkUnreserved(node.imported);
      node.local = node.imported;
    }
    this.checkLValSimple(node.local, BIND_LEXICAL);
    return this.finishNode(node, "ImportSpecifier");
  };
  pp$8.parseImportDefaultSpecifier = function() {
    var node = this.startNode();
    node.local = this.parseIdent();
    this.checkLValSimple(node.local, BIND_LEXICAL);
    return this.finishNode(node, "ImportDefaultSpecifier");
  };
  pp$8.parseImportNamespaceSpecifier = function() {
    var node = this.startNode();
    this.next();
    this.expectContextual("as");
    node.local = this.parseIdent();
    this.checkLValSimple(node.local, BIND_LEXICAL);
    return this.finishNode(node, "ImportNamespaceSpecifier");
  };
  pp$8.parseImportSpecifiers = function() {
    var nodes = [], first = true;
    if (this.type === types$1.name) {
      nodes.push(this.parseImportDefaultSpecifier());
      if (!this.eat(types$1.comma)) {
        return nodes;
      }
    }
    if (this.type === types$1.star) {
      nodes.push(this.parseImportNamespaceSpecifier());
      return nodes;
    }
    this.expect(types$1.braceL);
    while (!this.eat(types$1.braceR)) {
      if (!first) {
        this.expect(types$1.comma);
        if (this.afterTrailingComma(types$1.braceR)) {
          break;
        }
      } else {
        first = false;
      }
      nodes.push(this.parseImportSpecifier());
    }
    return nodes;
  };
  pp$8.parseWithClause = function() {
    var nodes = [];
    if (!this.eat(types$1._with)) {
      return nodes;
    }
    this.expect(types$1.braceL);
    var attributeKeys = {};
    var first = true;
    while (!this.eat(types$1.braceR)) {
      if (!first) {
        this.expect(types$1.comma);
        if (this.afterTrailingComma(types$1.braceR)) {
          break;
        }
      } else {
        first = false;
      }
      var attr = this.parseImportAttribute();
      var keyName = attr.key.type === "Identifier" ? attr.key.name : attr.key.value;
      if (hasOwn(attributeKeys, keyName)) {
        this.raiseRecoverable(attr.key.start, "Duplicate attribute key '" + keyName + "'");
      }
      attributeKeys[keyName] = true;
      nodes.push(attr);
    }
    return nodes;
  };
  pp$8.parseImportAttribute = function() {
    var node = this.startNode();
    node.key = this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never");
    this.expect(types$1.colon);
    if (this.type !== types$1.string) {
      this.unexpected();
    }
    node.value = this.parseExprAtom();
    return this.finishNode(node, "ImportAttribute");
  };
  pp$8.parseModuleExportName = function() {
    if (this.options.ecmaVersion >= 13 && this.type === types$1.string) {
      var stringLiteral = this.parseLiteral(this.value);
      if (loneSurrogate.test(stringLiteral.value)) {
        this.raise(stringLiteral.start, "An export name cannot include a lone surrogate.");
      }
      return stringLiteral;
    }
    return this.parseIdent(true);
  };
  pp$8.adaptDirectivePrologue = function(statements) {
    for (var i2 = 0; i2 < statements.length && this.isDirectiveCandidate(statements[i2]); ++i2) {
      statements[i2].directive = statements[i2].expression.raw.slice(1, -1);
    }
  };
  pp$8.isDirectiveCandidate = function(statement) {
    return this.options.ecmaVersion >= 5 && statement.type === "ExpressionStatement" && statement.expression.type === "Literal" && typeof statement.expression.value === "string" && // Reject parenthesized strings.
    (this.input[statement.start] === '"' || this.input[statement.start] === "'");
  };
  var pp$7 = Parser.prototype;
  pp$7.toAssignable = function(node, isBinding, refDestructuringErrors) {
    if (this.options.ecmaVersion >= 6 && node) {
      switch (node.type) {
        case "Identifier":
          if (this.inAsync && node.name === "await") {
            this.raise(node.start, "Cannot use 'await' as identifier inside an async function");
          }
          break;
        case "ObjectPattern":
        case "ArrayPattern":
        case "AssignmentPattern":
        case "RestElement":
          break;
        case "ObjectExpression":
          node.type = "ObjectPattern";
          if (refDestructuringErrors) {
            this.checkPatternErrors(refDestructuringErrors, true);
          }
          for (var i2 = 0, list2 = node.properties; i2 < list2.length; i2 += 1) {
            var prop = list2[i2];
            this.toAssignable(prop, isBinding);
            if (prop.type === "RestElement" && (prop.argument.type === "ArrayPattern" || prop.argument.type === "ObjectPattern")) {
              this.raise(prop.argument.start, "Unexpected token");
            }
          }
          break;
        case "Property":
          if (node.kind !== "init") {
            this.raise(node.key.start, "Object pattern can't contain getter or setter");
          }
          this.toAssignable(node.value, isBinding);
          break;
        case "ArrayExpression":
          node.type = "ArrayPattern";
          if (refDestructuringErrors) {
            this.checkPatternErrors(refDestructuringErrors, true);
          }
          this.toAssignableList(node.elements, isBinding);
          break;
        case "SpreadElement":
          node.type = "RestElement";
          this.toAssignable(node.argument, isBinding);
          if (node.argument.type === "AssignmentPattern") {
            this.raise(node.argument.start, "Rest elements cannot have a default value");
          }
          break;
        case "AssignmentExpression":
          if (node.operator !== "=") {
            this.raise(node.left.end, "Only '=' operator can be used for specifying default value.");
          }
          node.type = "AssignmentPattern";
          delete node.operator;
          this.toAssignable(node.left, isBinding);
          break;
        case "ParenthesizedExpression":
          this.toAssignable(node.expression, isBinding, refDestructuringErrors);
          break;
        case "ChainExpression":
          this.raiseRecoverable(node.start, "Optional chaining cannot appear in left-hand side");
          break;
        case "MemberExpression":
          if (!isBinding) {
            break;
          }
        default:
          this.raise(node.start, "Assigning to rvalue");
      }
    } else if (refDestructuringErrors) {
      this.checkPatternErrors(refDestructuringErrors, true);
    }
    return node;
  };
  pp$7.toAssignableList = function(exprList, isBinding) {
    var end = exprList.length;
    for (var i2 = 0; i2 < end; i2++) {
      var elt = exprList[i2];
      if (elt) {
        this.toAssignable(elt, isBinding);
      }
    }
    if (end) {
      var last = exprList[end - 1];
      if (this.options.ecmaVersion === 6 && isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier") {
        this.unexpected(last.argument.start);
      }
    }
    return exprList;
  };
  pp$7.parseSpread = function(refDestructuringErrors) {
    var node = this.startNode();
    this.next();
    node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
    return this.finishNode(node, "SpreadElement");
  };
  pp$7.parseRestBinding = function() {
    var node = this.startNode();
    this.next();
    if (this.options.ecmaVersion === 6 && this.type !== types$1.name) {
      this.unexpected();
    }
    node.argument = this.parseBindingAtom();
    return this.finishNode(node, "RestElement");
  };
  pp$7.parseBindingAtom = function() {
    if (this.options.ecmaVersion >= 6) {
      switch (this.type) {
        case types$1.bracketL:
          var node = this.startNode();
          this.next();
          node.elements = this.parseBindingList(types$1.bracketR, true, true);
          return this.finishNode(node, "ArrayPattern");
        case types$1.braceL:
          return this.parseObj(true);
      }
    }
    return this.parseIdent();
  };
  pp$7.parseBindingList = function(close, allowEmpty, allowTrailingComma, allowModifiers) {
    var elts = [], first = true;
    while (!this.eat(close)) {
      if (first) {
        first = false;
      } else {
        this.expect(types$1.comma);
      }
      if (allowEmpty && this.type === types$1.comma) {
        elts.push(null);
      } else if (allowTrailingComma && this.afterTrailingComma(close)) {
        break;
      } else if (this.type === types$1.ellipsis) {
        var rest = this.parseRestBinding();
        this.parseBindingListItem(rest);
        elts.push(rest);
        if (this.type === types$1.comma) {
          this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
        }
        this.expect(close);
        break;
      } else {
        elts.push(this.parseAssignableListItem(allowModifiers));
      }
    }
    return elts;
  };
  pp$7.parseAssignableListItem = function(allowModifiers) {
    var elem = this.parseMaybeDefault(this.start, this.startLoc);
    this.parseBindingListItem(elem);
    return elem;
  };
  pp$7.parseBindingListItem = function(param) {
    return param;
  };
  pp$7.parseMaybeDefault = function(startPos, startLoc, left) {
    left = left || this.parseBindingAtom();
    if (this.options.ecmaVersion < 6 || !this.eat(types$1.eq)) {
      return left;
    }
    var node = this.startNodeAt(startPos, startLoc);
    node.left = left;
    node.right = this.parseMaybeAssign();
    return this.finishNode(node, "AssignmentPattern");
  };
  pp$7.checkLValSimple = function(expr, bindingType, checkClashes) {
    if (bindingType === void 0) bindingType = BIND_NONE;
    var isBind = bindingType !== BIND_NONE;
    switch (expr.type) {
      case "Identifier":
        if (this.strict && this.reservedWordsStrictBind.test(expr.name)) {
          this.raiseRecoverable(expr.start, (isBind ? "Binding " : "Assigning to ") + expr.name + " in strict mode");
        }
        if (isBind) {
          if (bindingType === BIND_LEXICAL && expr.name === "let") {
            this.raiseRecoverable(expr.start, "let is disallowed as a lexically bound name");
          }
          if (checkClashes) {
            if (hasOwn(checkClashes, expr.name)) {
              this.raiseRecoverable(expr.start, "Argument name clash");
            }
            checkClashes[expr.name] = true;
          }
          if (bindingType !== BIND_OUTSIDE) {
            this.declareName(expr.name, bindingType, expr.start);
          }
        }
        break;
      case "ChainExpression":
        this.raiseRecoverable(expr.start, "Optional chaining cannot appear in left-hand side");
        break;
      case "MemberExpression":
        if (isBind) {
          this.raiseRecoverable(expr.start, "Binding member expression");
        }
        break;
      case "ParenthesizedExpression":
        if (isBind) {
          this.raiseRecoverable(expr.start, "Binding parenthesized expression");
        }
        return this.checkLValSimple(expr.expression, bindingType, checkClashes);
      default:
        this.raise(expr.start, (isBind ? "Binding" : "Assigning to") + " rvalue");
    }
  };
  pp$7.checkLValPattern = function(expr, bindingType, checkClashes) {
    if (bindingType === void 0) bindingType = BIND_NONE;
    switch (expr.type) {
      case "ObjectPattern":
        for (var i2 = 0, list2 = expr.properties; i2 < list2.length; i2 += 1) {
          var prop = list2[i2];
          this.checkLValInnerPattern(prop, bindingType, checkClashes);
        }
        break;
      case "ArrayPattern":
        for (var i$1 = 0, list$1 = expr.elements; i$1 < list$1.length; i$1 += 1) {
          var elem = list$1[i$1];
          if (elem) {
            this.checkLValInnerPattern(elem, bindingType, checkClashes);
          }
        }
        break;
      default:
        this.checkLValSimple(expr, bindingType, checkClashes);
    }
  };
  pp$7.checkLValInnerPattern = function(expr, bindingType, checkClashes) {
    if (bindingType === void 0) bindingType = BIND_NONE;
    switch (expr.type) {
      case "Property":
        this.checkLValInnerPattern(expr.value, bindingType, checkClashes);
        break;
      case "AssignmentPattern":
        this.checkLValPattern(expr.left, bindingType, checkClashes);
        break;
      case "RestElement":
        this.checkLValPattern(expr.argument, bindingType, checkClashes);
        break;
      default:
        this.checkLValPattern(expr, bindingType, checkClashes);
    }
  };
  var TokContext = function TokContext2(token, isExpr, preserveSpace, override, generator) {
    this.token = token;
    this.isExpr = !!isExpr;
    this.preserveSpace = !!preserveSpace;
    this.override = override;
    this.generator = !!generator;
  };
  var types = {
    b_stat: new TokContext("{", false),
    b_expr: new TokContext("{", true),
    b_tmpl: new TokContext("${", false),
    p_stat: new TokContext("(", false),
    p_expr: new TokContext("(", true),
    q_tmpl: new TokContext("`", true, true, function(p) {
      return p.tryReadTemplateToken();
    }),
    f_stat: new TokContext("function", false),
    f_expr: new TokContext("function", true),
    f_expr_gen: new TokContext("function", true, false, null, true),
    f_gen: new TokContext("function", false, false, null, true)
  };
  var pp$6 = Parser.prototype;
  pp$6.initialContext = function() {
    return [types.b_stat];
  };
  pp$6.curContext = function() {
    return this.context[this.context.length - 1];
  };
  pp$6.braceIsBlock = function(prevType) {
    var parent = this.curContext();
    if (parent === types.f_expr || parent === types.f_stat) {
      return true;
    }
    if (prevType === types$1.colon && (parent === types.b_stat || parent === types.b_expr)) {
      return !parent.isExpr;
    }
    if (prevType === types$1._return || prevType === types$1.name && this.exprAllowed) {
      return lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
    }
    if (prevType === types$1._else || prevType === types$1.semi || prevType === types$1.eof || prevType === types$1.parenR || prevType === types$1.arrow) {
      return true;
    }
    if (prevType === types$1.braceL) {
      return parent === types.b_stat;
    }
    if (prevType === types$1._var || prevType === types$1._const || prevType === types$1.name) {
      return false;
    }
    return !this.exprAllowed;
  };
  pp$6.inGeneratorContext = function() {
    for (var i2 = this.context.length - 1; i2 >= 1; i2--) {
      var context = this.context[i2];
      if (context.token === "function") {
        return context.generator;
      }
    }
    return false;
  };
  pp$6.updateContext = function(prevType) {
    var update, type = this.type;
    if (type.keyword && prevType === types$1.dot) {
      this.exprAllowed = false;
    } else if (update = type.updateContext) {
      update.call(this, prevType);
    } else {
      this.exprAllowed = type.beforeExpr;
    }
  };
  pp$6.overrideContext = function(tokenCtx) {
    if (this.curContext() !== tokenCtx) {
      this.context[this.context.length - 1] = tokenCtx;
    }
  };
  types$1.parenR.updateContext = types$1.braceR.updateContext = function() {
    if (this.context.length === 1) {
      this.exprAllowed = true;
      return;
    }
    var out = this.context.pop();
    if (out === types.b_stat && this.curContext().token === "function") {
      out = this.context.pop();
    }
    this.exprAllowed = !out.isExpr;
  };
  types$1.braceL.updateContext = function(prevType) {
    this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr);
    this.exprAllowed = true;
  };
  types$1.dollarBraceL.updateContext = function() {
    this.context.push(types.b_tmpl);
    this.exprAllowed = true;
  };
  types$1.parenL.updateContext = function(prevType) {
    var statementParens = prevType === types$1._if || prevType === types$1._for || prevType === types$1._with || prevType === types$1._while;
    this.context.push(statementParens ? types.p_stat : types.p_expr);
    this.exprAllowed = true;
  };
  types$1.incDec.updateContext = function() {
  };
  types$1._function.updateContext = types$1._class.updateContext = function(prevType) {
    if (prevType.beforeExpr && prevType !== types$1._else && !(prevType === types$1.semi && this.curContext() !== types.p_stat) && !(prevType === types$1._return && lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) && !((prevType === types$1.colon || prevType === types$1.braceL) && this.curContext() === types.b_stat)) {
      this.context.push(types.f_expr);
    } else {
      this.context.push(types.f_stat);
    }
    this.exprAllowed = false;
  };
  types$1.colon.updateContext = function() {
    if (this.curContext().token === "function") {
      this.context.pop();
    }
    this.exprAllowed = true;
  };
  types$1.backQuote.updateContext = function() {
    if (this.curContext() === types.q_tmpl) {
      this.context.pop();
    } else {
      this.context.push(types.q_tmpl);
    }
    this.exprAllowed = false;
  };
  types$1.star.updateContext = function(prevType) {
    if (prevType === types$1._function) {
      var index = this.context.length - 1;
      if (this.context[index] === types.f_expr) {
        this.context[index] = types.f_expr_gen;
      } else {
        this.context[index] = types.f_gen;
      }
    }
    this.exprAllowed = true;
  };
  types$1.name.updateContext = function(prevType) {
    var allowed = false;
    if (this.options.ecmaVersion >= 6 && prevType !== types$1.dot) {
      if (this.value === "of" && !this.exprAllowed || this.value === "yield" && this.inGeneratorContext()) {
        allowed = true;
      }
    }
    this.exprAllowed = allowed;
  };
  var pp$5 = Parser.prototype;
  pp$5.checkPropClash = function(prop, propHash, refDestructuringErrors) {
    if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement") {
      return;
    }
    if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand)) {
      return;
    }
    var key = prop.key;
    var name;
    switch (key.type) {
      case "Identifier":
        name = key.name;
        break;
      case "Literal":
        name = String(key.value);
        break;
      default:
        return;
    }
    var kind = prop.kind;
    if (this.options.ecmaVersion >= 6) {
      if (name === "__proto__" && kind === "init") {
        if (propHash.proto) {
          if (refDestructuringErrors) {
            if (refDestructuringErrors.doubleProto < 0) {
              refDestructuringErrors.doubleProto = key.start;
            }
          } else {
            this.raiseRecoverable(key.start, "Redefinition of __proto__ property");
          }
        }
        propHash.proto = true;
      }
      return;
    }
    name = "$" + name;
    var other = propHash[name];
    if (other) {
      var redefinition;
      if (kind === "init") {
        redefinition = this.strict && other.init || other.get || other.set;
      } else {
        redefinition = other.init || other[kind];
      }
      if (redefinition) {
        this.raiseRecoverable(key.start, "Redefinition of property");
      }
    } else {
      other = propHash[name] = {
        init: false,
        get: false,
        set: false
      };
    }
    other[kind] = true;
  };
  pp$5.parseExpression = function(forInit, refDestructuringErrors) {
    var this$1$1 = this;
    return this.catchStackOverflow(function() {
      var startPos = this$1$1.start, startLoc = this$1$1.startLoc;
      var expr = this$1$1.parseMaybeAssign(forInit, refDestructuringErrors);
      if (this$1$1.type === types$1.comma) {
        var node = this$1$1.startNodeAt(startPos, startLoc);
        node.expressions = [expr];
        while (this$1$1.eat(types$1.comma)) {
          node.expressions.push(this$1$1.parseMaybeAssign(forInit, refDestructuringErrors));
        }
        return this$1$1.finishNode(node, "SequenceExpression");
      }
      return expr;
    });
  };
  pp$5.parseMaybeAssign = function(forInit, refDestructuringErrors, afterLeftParse) {
    if (this.isContextual("yield")) {
      if (this.inGenerator) {
        return this.parseYield(forInit);
      } else {
        this.exprAllowed = false;
      }
    }
    var ownDestructuringErrors = false, oldParenAssign = -1, oldTrailingComma = -1, oldDoubleProto = -1;
    if (refDestructuringErrors) {
      oldParenAssign = refDestructuringErrors.parenthesizedAssign;
      oldTrailingComma = refDestructuringErrors.trailingComma;
      oldDoubleProto = refDestructuringErrors.doubleProto;
      refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = -1;
    } else {
      refDestructuringErrors = new DestructuringErrors();
      ownDestructuringErrors = true;
    }
    var startPos = this.start, startLoc = this.startLoc;
    if (this.type === types$1.parenL || this.type === types$1.name) {
      this.potentialArrowAt = this.start;
      this.potentialArrowInForAwait = forInit === "await";
    }
    var left = this.parseMaybeConditional(forInit, refDestructuringErrors);
    if (afterLeftParse) {
      left = afterLeftParse.call(this, left, startPos, startLoc);
    }
    if (this.type.isAssign) {
      var node = this.startNodeAt(startPos, startLoc);
      node.operator = this.value;
      if (this.type === types$1.eq) {
        left = this.toAssignable(left, false, refDestructuringErrors);
      }
      if (!ownDestructuringErrors) {
        refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = refDestructuringErrors.doubleProto = -1;
      }
      if (refDestructuringErrors.shorthandAssign >= left.start) {
        refDestructuringErrors.shorthandAssign = -1;
      }
      if (this.type === types$1.eq) {
        this.checkLValPattern(left);
      } else {
        this.checkLValSimple(left);
      }
      node.left = left;
      this.next();
      node.right = this.parseMaybeAssign(forInit);
      if (oldDoubleProto > -1) {
        refDestructuringErrors.doubleProto = oldDoubleProto;
      }
      return this.finishNode(node, "AssignmentExpression");
    } else {
      if (ownDestructuringErrors) {
        this.checkExpressionErrors(refDestructuringErrors, true);
      }
    }
    if (oldParenAssign > -1) {
      refDestructuringErrors.parenthesizedAssign = oldParenAssign;
    }
    if (oldTrailingComma > -1) {
      refDestructuringErrors.trailingComma = oldTrailingComma;
    }
    return left;
  };
  pp$5.parseMaybeConditional = function(forInit, refDestructuringErrors) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseExprOps(forInit, refDestructuringErrors);
    if (this.checkExpressionErrors(refDestructuringErrors)) {
      return expr;
    }
    if (!(expr.type === "ArrowFunctionExpression" && expr.start === startPos) && this.eat(types$1.question)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.test = expr;
      node.consequent = this.parseMaybeAssign();
      this.expect(types$1.colon);
      node.alternate = this.parseMaybeAssign(forInit);
      return this.finishNode(node, "ConditionalExpression");
    }
    return expr;
  };
  pp$5.parseExprOps = function(forInit, refDestructuringErrors) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseMaybeUnary(refDestructuringErrors, false, false, forInit);
    if (this.checkExpressionErrors(refDestructuringErrors)) {
      return expr;
    }
    return expr.start === startPos && expr.type === "ArrowFunctionExpression" ? expr : this.parseExprOp(expr, startPos, startLoc, -1, forInit);
  };
  pp$5.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, forInit) {
    var prec = this.type.binop;
    if (prec != null && (!forInit || this.type !== types$1._in)) {
      if (prec > minPrec) {
        var logical = this.type === types$1.logicalOR || this.type === types$1.logicalAND;
        var coalesce = this.type === types$1.coalesce;
        if (coalesce) {
          prec = types$1.logicalAND.binop;
        }
        var op = this.value;
        this.next();
        var startPos = this.start, startLoc = this.startLoc;
        var right = this.parseExprOp(this.parseMaybeUnary(null, false, false, forInit), startPos, startLoc, prec, forInit);
        var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical || coalesce);
        if (logical && this.type === types$1.coalesce || coalesce && (this.type === types$1.logicalOR || this.type === types$1.logicalAND)) {
          this.raiseRecoverable(this.start, "Logical expressions and coalesce expressions cannot be mixed. Wrap either by parentheses");
        }
        return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, forInit);
      }
    }
    return left;
  };
  pp$5.buildBinary = function(startPos, startLoc, left, right, op, logical) {
    if (right.type === "PrivateIdentifier") {
      this.raise(right.start, "Private identifier can only be left side of binary expression");
    }
    var node = this.startNodeAt(startPos, startLoc);
    node.left = left;
    node.operator = op;
    node.right = right;
    return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression");
  };
  pp$5.parseMaybeUnary = function(refDestructuringErrors, sawUnary, incDec, forInit) {
    var startPos = this.start, startLoc = this.startLoc, expr;
    if (this.isContextual("await") && this.canAwait) {
      expr = this.parseAwait(forInit);
      sawUnary = true;
    } else if (this.type.prefix) {
      var node = this.startNode(), update = this.type === types$1.incDec;
      node.operator = this.value;
      node.prefix = true;
      this.next();
      node.argument = this.parseMaybeUnary(null, true, update, forInit);
      this.checkExpressionErrors(refDestructuringErrors, true);
      if (update) {
        this.checkLValSimple(node.argument);
      } else if (this.strict && node.operator === "delete" && isLocalVariableAccess(node.argument)) {
        this.raiseRecoverable(node.start, "Deleting local variable in strict mode");
      } else if (node.operator === "delete" && isPrivateFieldAccess(node.argument)) {
        this.raiseRecoverable(node.start, "Private fields can not be deleted");
      } else {
        sawUnary = true;
      }
      expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
    } else if (!sawUnary && this.type === types$1.privateId) {
      if ((forInit || this.privateNameStack.length === 0) && this.options.checkPrivateFields) {
        this.unexpected();
      }
      expr = this.parsePrivateIdent();
      if (this.type !== types$1._in) {
        this.unexpected();
      }
    } else {
      expr = this.parseExprSubscripts(refDestructuringErrors, forInit);
      if (this.checkExpressionErrors(refDestructuringErrors)) {
        return expr;
      }
      while (this.type.postfix && !this.canInsertSemicolon()) {
        var node$1 = this.startNodeAt(startPos, startLoc);
        node$1.operator = this.value;
        node$1.prefix = false;
        node$1.argument = expr;
        this.checkLValSimple(expr);
        this.next();
        expr = this.finishNode(node$1, "UpdateExpression");
      }
    }
    if (!incDec && this.eat(types$1.starstar)) {
      if (sawUnary) {
        this.unexpected(this.lastTokStart);
      } else {
        return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false, false, forInit), "**", false);
      }
    } else {
      return expr;
    }
  };
  function isLocalVariableAccess(node) {
    return node.type === "Identifier" || node.type === "ParenthesizedExpression" && isLocalVariableAccess(node.expression);
  }
  function isPrivateFieldAccess(node) {
    return node.type === "MemberExpression" && node.property.type === "PrivateIdentifier" || node.type === "ChainExpression" && isPrivateFieldAccess(node.expression) || node.type === "ParenthesizedExpression" && isPrivateFieldAccess(node.expression);
  }
  pp$5.parseExprSubscripts = function(refDestructuringErrors, forInit) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseExprAtom(refDestructuringErrors, forInit);
    if (expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")") {
      return expr;
    }
    var result = this.parseSubscripts(expr, startPos, startLoc, false, forInit);
    if (refDestructuringErrors && result.type === "MemberExpression") {
      if (refDestructuringErrors.parenthesizedAssign >= result.start) {
        refDestructuringErrors.parenthesizedAssign = -1;
      }
      if (refDestructuringErrors.parenthesizedBind >= result.start) {
        refDestructuringErrors.parenthesizedBind = -1;
      }
      if (refDestructuringErrors.trailingComma >= result.start) {
        refDestructuringErrors.trailingComma = -1;
      }
    }
    return result;
  };
  pp$5.parseSubscripts = function(base, startPos, startLoc, noCalls, forInit) {
    var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" && this.lastTokEnd === base.end && !this.canInsertSemicolon() && base.end - base.start === 5 && this.potentialArrowAt === base.start;
    var optionalChained = false;
    while (true) {
      var element = this.parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit);
      if (element.optional) {
        optionalChained = true;
      }
      if (element === base || element.type === "ArrowFunctionExpression") {
        if (optionalChained) {
          var chainNode = this.startNodeAt(startPos, startLoc);
          chainNode.expression = element;
          element = this.finishNode(chainNode, "ChainExpression");
        }
        return element;
      }
      base = element;
    }
  };
  pp$5.shouldParseAsyncArrow = function() {
    return !this.canInsertSemicolon() && this.eat(types$1.arrow);
  };
  pp$5.parseSubscriptAsyncArrow = function(startPos, startLoc, exprList, forInit) {
    return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, true, forInit);
  };
  pp$5.parseSubscript = function(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit) {
    var optionalSupported = this.options.ecmaVersion >= 11;
    var optional = optionalSupported && this.eat(types$1.questionDot);
    if (noCalls && optional) {
      this.raise(this.lastTokStart, "Optional chaining cannot appear in the callee of new expressions");
    }
    var computed = this.eat(types$1.bracketL);
    if (computed || optional && this.type !== types$1.parenL && this.type !== types$1.backQuote || this.eat(types$1.dot)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.object = base;
      if (computed) {
        node.property = this.parseExpression();
        this.expect(types$1.bracketR);
      } else if (this.type === types$1.privateId && base.type !== "Super") {
        node.property = this.parsePrivateIdent();
      } else {
        node.property = this.parseIdent(this.options.allowReserved !== "never");
      }
      node.computed = !!computed;
      if (optionalSupported) {
        node.optional = optional;
      }
      base = this.finishNode(node, "MemberExpression");
    } else if (!noCalls && this.eat(types$1.parenL)) {
      var refDestructuringErrors = new DestructuringErrors(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
      this.yieldPos = 0;
      this.awaitPos = 0;
      this.awaitIdentPos = 0;
      var exprList = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false, refDestructuringErrors);
      if (maybeAsyncArrow && !optional && this.shouldParseAsyncArrow()) {
        this.checkPatternErrors(refDestructuringErrors, false);
        this.checkYieldAwaitInDefaultParams();
        if (this.awaitIdentPos > 0) {
          this.raise(this.awaitIdentPos, "Cannot use 'await' as identifier inside an async function");
        }
        this.yieldPos = oldYieldPos;
        this.awaitPos = oldAwaitPos;
        this.awaitIdentPos = oldAwaitIdentPos;
        return this.parseSubscriptAsyncArrow(startPos, startLoc, exprList, forInit);
      }
      this.checkExpressionErrors(refDestructuringErrors, true);
      this.yieldPos = oldYieldPos || this.yieldPos;
      this.awaitPos = oldAwaitPos || this.awaitPos;
      this.awaitIdentPos = oldAwaitIdentPos || this.awaitIdentPos;
      var node$1 = this.startNodeAt(startPos, startLoc);
      node$1.callee = base;
      node$1.arguments = exprList;
      if (optionalSupported) {
        node$1.optional = optional;
      }
      base = this.finishNode(node$1, "CallExpression");
    } else if (this.type === types$1.backQuote) {
      if (optional || optionalChained) {
        this.raise(this.start, "Optional chaining cannot appear in the tag of tagged template expressions");
      }
      var node$2 = this.startNodeAt(startPos, startLoc);
      node$2.tag = base;
      node$2.quasi = this.parseTemplate({ isTagged: true });
      base = this.finishNode(node$2, "TaggedTemplateExpression");
    }
    return base;
  };
  pp$5.parseExprAtom = function(refDestructuringErrors, forInit, forNew) {
    if (this.type === types$1.slash) {
      this.readRegexp();
    }
    var node, canBeArrow = this.potentialArrowAt === this.start;
    switch (this.type) {
      case types$1._super:
        if (!this.allowSuper) {
          this.raise(this.start, "'super' keyword outside a method");
        }
        node = this.startNode();
        this.next();
        if (this.type === types$1.parenL && !this.allowDirectSuper) {
          this.raise(node.start, "super() call outside constructor of a subclass");
        }
        if (this.type !== types$1.dot && this.type !== types$1.bracketL && this.type !== types$1.parenL) {
          this.unexpected();
        }
        return this.finishNode(node, "Super");
      case types$1._this:
        node = this.startNode();
        this.next();
        return this.finishNode(node, "ThisExpression");
      case types$1.name:
        var startPos = this.start, startLoc = this.startLoc, containsEsc = this.containsEsc;
        var id = this.parseIdent(false);
        if (this.options.ecmaVersion >= 8 && !containsEsc && id.name === "async" && !this.canInsertSemicolon() && this.eat(types$1._function)) {
          this.overrideContext(types.f_expr);
          return this.parseFunction(this.startNodeAt(startPos, startLoc), 0, false, true, forInit);
        }
        if (canBeArrow && !this.canInsertSemicolon()) {
          if (this.eat(types$1.arrow)) {
            return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false, forInit);
          }
          if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === types$1.name && !containsEsc && (!this.potentialArrowInForAwait || this.value !== "of" || this.containsEsc)) {
            id = this.parseIdent(false);
            if (this.canInsertSemicolon() || !this.eat(types$1.arrow)) {
              this.unexpected();
            }
            return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true, forInit);
          }
        }
        return id;
      case types$1.regexp:
        var value = this.value;
        node = this.parseLiteral(value.value);
        node.regex = { pattern: value.pattern, flags: value.flags };
        return node;
      case types$1.num:
      case types$1.string:
        return this.parseLiteral(this.value);
      case types$1._null:
      case types$1._true:
      case types$1._false:
        node = this.startNode();
        node.value = this.type === types$1._null ? null : this.type === types$1._true;
        node.raw = this.type.keyword;
        this.next();
        return this.finishNode(node, "Literal");
      case types$1.parenL:
        var start = this.start, expr = this.parseParenAndDistinguishExpression(canBeArrow, forInit);
        if (refDestructuringErrors) {
          if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr)) {
            refDestructuringErrors.parenthesizedAssign = start;
          }
          if (refDestructuringErrors.parenthesizedBind < 0) {
            refDestructuringErrors.parenthesizedBind = start;
          }
        }
        return expr;
      case types$1.bracketL:
        node = this.startNode();
        this.next();
        node.elements = this.parseExprList(types$1.bracketR, true, true, refDestructuringErrors);
        return this.finishNode(node, "ArrayExpression");
      case types$1.braceL:
        this.overrideContext(types.b_expr);
        return this.parseObj(false, refDestructuringErrors);
      case types$1._function:
        node = this.startNode();
        this.next();
        return this.parseFunction(node, 0);
      case types$1._class:
        return this.parseClass(this.startNode(), false);
      case types$1._new:
        return this.parseNew();
      case types$1.backQuote:
        return this.parseTemplate();
      case types$1._import:
        if (this.options.ecmaVersion >= 11) {
          return this.parseExprImport(forNew);
        } else {
          return this.unexpected();
        }
      default:
        return this.parseExprAtomDefault();
    }
  };
  pp$5.parseExprAtomDefault = function() {
    this.unexpected();
  };
  pp$5.parseExprImport = function(forNew) {
    var node = this.startNode();
    if (this.containsEsc) {
      this.raiseRecoverable(this.start, "Escape sequence in keyword import");
    }
    this.next();
    if (this.type === types$1.parenL && !forNew) {
      return this.parseDynamicImport(node);
    } else if (this.type === types$1.dot) {
      var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
      meta.name = "import";
      node.meta = this.finishNode(meta, "Identifier");
      return this.parseImportMeta(node);
    } else {
      this.unexpected();
    }
  };
  pp$5.parseDynamicImport = function(node) {
    this.next();
    node.source = this.parseMaybeAssign();
    if (this.options.ecmaVersion >= 16) {
      if (!this.eat(types$1.parenR)) {
        this.expect(types$1.comma);
        if (!this.afterTrailingComma(types$1.parenR)) {
          node.options = this.parseMaybeAssign();
          if (!this.eat(types$1.parenR)) {
            this.expect(types$1.comma);
            if (!this.afterTrailingComma(types$1.parenR)) {
              this.unexpected();
            }
          }
        } else {
          node.options = null;
        }
      } else {
        node.options = null;
      }
    } else {
      if (!this.eat(types$1.parenR)) {
        var errorPos = this.start;
        if (this.eat(types$1.comma) && this.eat(types$1.parenR)) {
          this.raiseRecoverable(errorPos, "Trailing comma is not allowed in import()");
        } else {
          this.unexpected(errorPos);
        }
      }
    }
    return this.finishNode(node, "ImportExpression");
  };
  pp$5.parseImportMeta = function(node) {
    this.next();
    var containsEsc = this.containsEsc;
    node.property = this.parseIdent(true);
    if (node.property.name !== "meta") {
      this.raiseRecoverable(node.property.start, "The only valid meta property for import is 'import.meta'");
    }
    if (containsEsc) {
      this.raiseRecoverable(node.start, "'import.meta' must not contain escaped characters");
    }
    if (this.options.sourceType !== "module" && !this.options.allowImportExportEverywhere) {
      this.raiseRecoverable(node.start, "Cannot use 'import.meta' outside a module");
    }
    return this.finishNode(node, "MetaProperty");
  };
  pp$5.parseLiteral = function(value) {
    var node = this.startNode();
    node.value = value;
    node.raw = this.input.slice(this.start, this.end);
    if (node.raw.charCodeAt(node.raw.length - 1) === 110) {
      node.bigint = node.value != null ? node.value.toString() : node.raw.slice(0, -1).replace(/_/g, "");
    }
    this.next();
    return this.finishNode(node, "Literal");
  };
  pp$5.parseParenExpression = function() {
    this.expect(types$1.parenL);
    var val = this.parseExpression();
    this.expect(types$1.parenR);
    return val;
  };
  pp$5.shouldParseArrow = function(exprList) {
    return !this.canInsertSemicolon();
  };
  pp$5.parseParenAndDistinguishExpression = function(canBeArrow, forInit) {
    var startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8;
    if (this.options.ecmaVersion >= 6) {
      this.next();
      var innerStartPos = this.start, innerStartLoc = this.startLoc;
      var exprList = [], first = true, lastIsComma = false;
      var refDestructuringErrors = new DestructuringErrors(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart;
      this.yieldPos = 0;
      this.awaitPos = 0;
      while (this.type !== types$1.parenR) {
        first ? first = false : this.expect(types$1.comma);
        if (allowTrailingComma && this.afterTrailingComma(types$1.parenR, true)) {
          lastIsComma = true;
          break;
        } else if (this.type === types$1.ellipsis) {
          spreadStart = this.start;
          exprList.push(this.parseParenItem(this.parseRestBinding()));
          if (this.type === types$1.comma) {
            this.raiseRecoverable(
              this.start,
              "Comma is not permitted after the rest element"
            );
          }
          break;
        } else {
          exprList.push(this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem));
        }
      }
      var innerEndPos = this.lastTokEnd, innerEndLoc = this.lastTokEndLoc;
      this.expect(types$1.parenR);
      if (canBeArrow && this.shouldParseArrow(exprList) && this.eat(types$1.arrow)) {
        this.checkPatternErrors(refDestructuringErrors, false);
        this.checkYieldAwaitInDefaultParams();
        this.yieldPos = oldYieldPos;
        this.awaitPos = oldAwaitPos;
        return this.parseParenArrowList(startPos, startLoc, exprList, forInit);
      }
      if (!exprList.length || lastIsComma) {
        this.unexpected(this.lastTokStart);
      }
      if (spreadStart) {
        this.unexpected(spreadStart);
      }
      this.checkExpressionErrors(refDestructuringErrors, true);
      this.yieldPos = oldYieldPos || this.yieldPos;
      this.awaitPos = oldAwaitPos || this.awaitPos;
      if (exprList.length > 1) {
        val = this.startNodeAt(innerStartPos, innerStartLoc);
        val.expressions = exprList;
        this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
      } else {
        val = exprList[0];
      }
    } else {
      val = this.parseParenExpression();
    }
    if (this.options.preserveParens) {
      var par = this.startNodeAt(startPos, startLoc);
      par.expression = val;
      return this.finishNode(par, "ParenthesizedExpression");
    } else {
      return val;
    }
  };
  pp$5.parseParenItem = function(item) {
    return item;
  };
  pp$5.parseParenArrowList = function(startPos, startLoc, exprList, forInit) {
    return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, false, forInit);
  };
  var empty = [];
  pp$5.parseNew = function() {
    if (this.containsEsc) {
      this.raiseRecoverable(this.start, "Escape sequence in keyword new");
    }
    var node = this.startNode();
    this.next();
    if (this.options.ecmaVersion >= 6 && this.type === types$1.dot) {
      var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
      meta.name = "new";
      node.meta = this.finishNode(meta, "Identifier");
      this.next();
      var containsEsc = this.containsEsc;
      node.property = this.parseIdent(true);
      if (node.property.name !== "target") {
        this.raiseRecoverable(node.property.start, "The only valid meta property for new is 'new.target'");
      }
      if (containsEsc) {
        this.raiseRecoverable(node.start, "'new.target' must not contain escaped characters");
      }
      if (!this.allowNewDotTarget) {
        this.raiseRecoverable(node.start, "'new.target' can only be used in functions and class static block");
      }
      return this.finishNode(node, "MetaProperty");
    }
    var startPos = this.start, startLoc = this.startLoc;
    node.callee = this.parseSubscripts(this.parseExprAtom(null, false, true), startPos, startLoc, true, false);
    if (node.callee.type === "Super") {
      this.raiseRecoverable(startPos, "Invalid use of 'super'");
    }
    if (this.eat(types$1.parenL)) {
      node.arguments = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false);
    } else {
      node.arguments = empty;
    }
    return this.finishNode(node, "NewExpression");
  };
  pp$5.parseTemplateElement = function(ref2) {
    var isTagged = ref2.isTagged;
    var elem = this.startNode();
    if (this.type === types$1.invalidTemplate) {
      if (!isTagged) {
        this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal");
      }
      elem.value = {
        raw: this.value.replace(/\r\n?/g, "\n"),
        cooked: null
      };
    } else {
      elem.value = {
        raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, "\n"),
        cooked: this.value
      };
    }
    this.next();
    elem.tail = this.type === types$1.backQuote;
    return this.finishNode(elem, "TemplateElement");
  };
  pp$5.parseTemplate = function(ref2) {
    if (ref2 === void 0) ref2 = {};
    var isTagged = ref2.isTagged;
    if (isTagged === void 0) isTagged = false;
    var node = this.startNode();
    this.next();
    node.expressions = [];
    var curElt = this.parseTemplateElement({ isTagged });
    node.quasis = [curElt];
    while (!curElt.tail) {
      if (this.type === types$1.eof) {
        this.raise(this.pos, "Unterminated template literal");
      }
      this.expect(types$1.dollarBraceL);
      node.expressions.push(this.parseExpression());
      this.expect(types$1.braceR);
      node.quasis.push(curElt = this.parseTemplateElement({ isTagged }));
    }
    this.next();
    return this.finishNode(node, "TemplateLiteral");
  };
  pp$5.isAsyncProp = function(prop) {
    return !prop.computed && prop.key.type === "Identifier" && prop.key.name === "async" && (this.type === types$1.name || this.type === types$1.num || this.type === types$1.string || this.type === types$1.bracketL || this.type.keyword || this.options.ecmaVersion >= 9 && this.type === types$1.star) && !lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
  };
  pp$5.parseObj = function(isPattern, refDestructuringErrors) {
    var node = this.startNode(), first = true, propHash = {};
    node.properties = [];
    this.next();
    while (!this.eat(types$1.braceR)) {
      if (!first) {
        this.expect(types$1.comma);
        if (this.options.ecmaVersion >= 5 && this.afterTrailingComma(types$1.braceR)) {
          break;
        }
      } else {
        first = false;
      }
      var prop = this.parseProperty(isPattern, refDestructuringErrors);
      if (!isPattern) {
        this.checkPropClash(prop, propHash, refDestructuringErrors);
      }
      node.properties.push(prop);
    }
    return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression");
  };
  pp$5.parseProperty = function(isPattern, refDestructuringErrors) {
    var prop = this.startNode(), isGenerator, isAsync, startPos, startLoc;
    if (this.options.ecmaVersion >= 9 && this.eat(types$1.ellipsis)) {
      if (isPattern) {
        prop.argument = this.parseIdent(false);
        if (this.type === types$1.comma) {
          this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
        }
        return this.finishNode(prop, "RestElement");
      }
      prop.argument = this.parseMaybeAssign(false, refDestructuringErrors);
      if (this.type === types$1.comma && refDestructuringErrors && refDestructuringErrors.trailingComma < 0) {
        refDestructuringErrors.trailingComma = this.start;
      }
      return this.finishNode(prop, "SpreadElement");
    }
    if (this.options.ecmaVersion >= 6) {
      prop.method = false;
      prop.shorthand = false;
      if (isPattern || refDestructuringErrors) {
        startPos = this.start;
        startLoc = this.startLoc;
      }
      if (!isPattern) {
        isGenerator = this.eat(types$1.star);
      }
    }
    var containsEsc = this.containsEsc;
    this.parsePropertyName(prop);
    if (!isPattern && !containsEsc && this.options.ecmaVersion >= 8 && !isGenerator && this.isAsyncProp(prop)) {
      isAsync = true;
      isGenerator = this.options.ecmaVersion >= 9 && this.eat(types$1.star);
      this.parsePropertyName(prop);
    } else {
      isAsync = false;
    }
    this.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc);
    return this.finishNode(prop, "Property");
  };
  pp$5.parseGetterSetter = function(prop) {
    var kind = prop.key.name;
    this.parsePropertyName(prop);
    prop.value = this.parseMethod(false);
    prop.kind = kind;
    var paramCount = prop.kind === "get" ? 0 : 1;
    if (prop.value.params.length !== paramCount) {
      var start = prop.value.start;
      if (prop.kind === "get") {
        this.raiseRecoverable(start, "getter should have no params");
      } else {
        this.raiseRecoverable(start, "setter should have exactly one param");
      }
    } else {
      if (prop.kind === "set" && prop.value.params[0].type === "RestElement") {
        this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params");
      }
    }
  };
  pp$5.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc) {
    if ((isGenerator || isAsync) && this.type === types$1.colon) {
      this.unexpected();
    }
    if (this.eat(types$1.colon)) {
      prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
      prop.kind = "init";
    } else if (this.options.ecmaVersion >= 6 && this.type === types$1.parenL) {
      if (isPattern) {
        this.unexpected();
      }
      prop.method = true;
      prop.value = this.parseMethod(isGenerator, isAsync);
      prop.kind = "init";
    } else if (!isPattern && !containsEsc && this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" && (prop.key.name === "get" || prop.key.name === "set") && (this.type !== types$1.comma && this.type !== types$1.braceR && this.type !== types$1.eq)) {
      if (isGenerator || isAsync) {
        this.unexpected();
      }
      this.parseGetterSetter(prop);
    } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
      if (isGenerator || isAsync) {
        this.unexpected();
      }
      this.checkUnreserved(prop.key);
      if (prop.key.name === "await" && !this.awaitIdentPos) {
        this.awaitIdentPos = startPos;
      }
      if (isPattern) {
        prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
      } else if (this.type === types$1.eq && refDestructuringErrors) {
        if (refDestructuringErrors.shorthandAssign < 0) {
          refDestructuringErrors.shorthandAssign = this.start;
        }
        prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
      } else {
        prop.value = this.copyNode(prop.key);
      }
      prop.kind = "init";
      prop.shorthand = true;
    } else {
      this.unexpected();
    }
  };
  pp$5.parsePropertyName = function(prop) {
    if (this.options.ecmaVersion >= 6) {
      if (this.eat(types$1.bracketL)) {
        prop.computed = true;
        prop.key = this.parseMaybeAssign();
        this.expect(types$1.bracketR);
        return prop.key;
      } else {
        prop.computed = false;
      }
    }
    return prop.key = this.type === types$1.num || this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never");
  };
  pp$5.initFunction = function(node) {
    node.id = null;
    if (this.options.ecmaVersion >= 6) {
      node.generator = node.expression = false;
    }
    if (this.options.ecmaVersion >= 8) {
      node.async = false;
    }
  };
  pp$5.parseMethod = function(isGenerator, isAsync, allowDirectSuper) {
    var node = this.startNode(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
    this.initFunction(node);
    if (this.options.ecmaVersion >= 6) {
      node.generator = isGenerator;
    }
    if (this.options.ecmaVersion >= 8) {
      node.async = !!isAsync;
    }
    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;
    this.enterScope(functionFlags(isAsync, node.generator) | SCOPE_SUPER | (allowDirectSuper ? SCOPE_DIRECT_SUPER : 0));
    this.expect(types$1.parenL);
    node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
    this.checkYieldAwaitInDefaultParams();
    this.parseFunctionBody(node, false, true, false);
    this.yieldPos = oldYieldPos;
    this.awaitPos = oldAwaitPos;
    this.awaitIdentPos = oldAwaitIdentPos;
    return this.finishNode(node, "FunctionExpression");
  };
  pp$5.parseArrowExpression = function(node, params, isAsync, forInit) {
    var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
    this.enterScope(functionFlags(isAsync, false) | SCOPE_ARROW);
    this.initFunction(node);
    if (this.options.ecmaVersion >= 8) {
      node.async = !!isAsync;
    }
    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;
    node.params = this.toAssignableList(params, true);
    this.parseFunctionBody(node, true, false, forInit);
    this.yieldPos = oldYieldPos;
    this.awaitPos = oldAwaitPos;
    this.awaitIdentPos = oldAwaitIdentPos;
    return this.finishNode(node, "ArrowFunctionExpression");
  };
  pp$5.parseFunctionBody = function(node, isArrowFunction, isMethod, forInit) {
    var isExpression = isArrowFunction && this.type !== types$1.braceL;
    var oldStrict = this.strict, useStrict = false;
    if (isExpression) {
      node.body = this.parseMaybeAssign(forInit);
      node.expression = true;
      this.checkParams(node, false);
    } else {
      var nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params);
      if (!oldStrict || nonSimple) {
        useStrict = this.strictDirective(this.end);
        if (useStrict && nonSimple) {
          this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list");
        }
      }
      var oldLabels = this.labels;
      this.labels = [];
      if (useStrict) {
        this.strict = true;
      }
      this.checkParams(node, !oldStrict && !useStrict && !isArrowFunction && !isMethod && this.isSimpleParamList(node.params));
      if (this.strict && node.id) {
        this.checkLValSimple(node.id, BIND_OUTSIDE);
      }
      node.body = this.parseBlock(false, void 0, useStrict && !oldStrict);
      node.expression = false;
      this.adaptDirectivePrologue(node.body.body);
      this.labels = oldLabels;
    }
    this.exitScope();
  };
  pp$5.isSimpleParamList = function(params) {
    for (var i2 = 0, list2 = params; i2 < list2.length; i2 += 1) {
      var param = list2[i2];
      if (param.type !== "Identifier") {
        return false;
      }
    }
    return true;
  };
  pp$5.checkParams = function(node, allowDuplicates) {
    var nameHash = /* @__PURE__ */ Object.create(null);
    for (var i2 = 0, list2 = node.params; i2 < list2.length; i2 += 1) {
      var param = list2[i2];
      this.checkLValInnerPattern(param, BIND_VAR, allowDuplicates ? null : nameHash);
    }
  };
  pp$5.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
    var elts = [], first = true;
    while (!this.eat(close)) {
      if (!first) {
        this.expect(types$1.comma);
        if (allowTrailingComma && this.afterTrailingComma(close)) {
          break;
        }
      } else {
        first = false;
      }
      var elt = void 0;
      if (allowEmpty && this.type === types$1.comma) {
        elt = null;
      } else if (this.type === types$1.ellipsis) {
        elt = this.parseSpread(refDestructuringErrors);
        if (refDestructuringErrors && this.type === types$1.comma && refDestructuringErrors.trailingComma < 0) {
          refDestructuringErrors.trailingComma = this.start;
        }
      } else {
        elt = this.parseMaybeAssign(false, refDestructuringErrors);
      }
      elts.push(elt);
    }
    return elts;
  };
  pp$5.checkUnreserved = function(ref2) {
    var start = ref2.start;
    var end = ref2.end;
    var name = ref2.name;
    if (this.inGenerator && name === "yield") {
      this.raiseRecoverable(start, "Cannot use 'yield' as identifier inside a generator");
    }
    if (this.inAsync && name === "await") {
      this.raiseRecoverable(start, "Cannot use 'await' as identifier inside an async function");
    }
    if (!(this.currentThisScope().flags & SCOPE_VAR) && name === "arguments") {
      this.raiseRecoverable(start, "Cannot use 'arguments' in class field initializer");
    }
    if (this.inClassStaticBlock && (name === "arguments" || name === "await")) {
      this.raise(start, "Cannot use " + name + " in class static initialization block");
    }
    if (this.keywords.test(name)) {
      this.raise(start, "Unexpected keyword '" + name + "'");
    }
    if (this.options.ecmaVersion < 6 && this.input.slice(start, end).indexOf("\\") !== -1) {
      return;
    }
    var re = this.strict ? this.reservedWordsStrict : this.reservedWords;
    if (re.test(name)) {
      if (!this.inAsync && name === "await") {
        this.raiseRecoverable(start, "Cannot use keyword 'await' outside an async function");
      }
      this.raiseRecoverable(start, "The keyword '" + name + "' is reserved");
    }
  };
  pp$5.parseIdent = function(liberal) {
    var node = this.parseIdentNode();
    this.next(!!liberal);
    this.finishNode(node, "Identifier");
    if (!liberal) {
      this.checkUnreserved(node);
      if (node.name === "await" && !this.awaitIdentPos) {
        this.awaitIdentPos = node.start;
      }
    }
    return node;
  };
  pp$5.parseIdentNode = function() {
    var node = this.startNode();
    if (this.type === types$1.name) {
      node.name = this.value;
    } else if (this.type.keyword) {
      node.name = this.type.keyword;
      if ((node.name === "class" || node.name === "function") && (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
        this.context.pop();
      }
      this.type = types$1.name;
    } else {
      this.unexpected();
    }
    return node;
  };
  pp$5.parsePrivateIdent = function() {
    var node = this.startNode();
    if (this.type === types$1.privateId) {
      node.name = this.value;
    } else {
      this.unexpected();
    }
    this.next();
    this.finishNode(node, "PrivateIdentifier");
    if (this.options.checkPrivateFields) {
      if (this.privateNameStack.length === 0) {
        this.raise(node.start, "Private field '#" + node.name + "' must be declared in an enclosing class");
      } else {
        this.privateNameStack[this.privateNameStack.length - 1].used.push(node);
      }
    }
    return node;
  };
  pp$5.parseYield = function(forInit) {
    if (!this.yieldPos) {
      this.yieldPos = this.start;
    }
    var node = this.startNode();
    this.next();
    if (this.type === types$1.semi || this.canInsertSemicolon() || this.type !== types$1.star && !this.type.startsExpr) {
      node.delegate = false;
      node.argument = null;
    } else {
      node.delegate = this.eat(types$1.star);
      node.argument = this.parseMaybeAssign(forInit);
    }
    return this.finishNode(node, "YieldExpression");
  };
  pp$5.parseAwait = function(forInit) {
    if (!this.awaitPos) {
      this.awaitPos = this.start;
    }
    var node = this.startNode();
    this.next();
    node.argument = this.parseMaybeUnary(null, true, false, forInit);
    return this.finishNode(node, "AwaitExpression");
  };
  var pp$4 = Parser.prototype;
  pp$4.raise = function(pos, message) {
    var loc = getLineInfo(this.input, pos);
    message += " (" + loc.line + ":" + loc.column + ")";
    if (this.sourceFile) {
      message += " in " + this.sourceFile;
    }
    var err = new SyntaxError(message);
    err.pos = pos;
    err.loc = loc;
    err.raisedAt = this.pos;
    throw err;
  };
  pp$4.raiseRecoverable = pp$4.raise;
  pp$4.curPosition = function() {
    if (this.options.locations) {
      return new Position(this.curLine, this.pos - this.lineStart);
    }
  };
  var pp$3 = Parser.prototype;
  var Scope = function Scope2(flags) {
    this.flags = flags;
    this.var = [];
    this.lexical = [];
    this.functions = [];
  };
  pp$3.enterScope = function(flags) {
    this.scopeStack.push(new Scope(flags));
  };
  pp$3.exitScope = function() {
    this.scopeStack.pop();
  };
  pp$3.treatFunctionsAsVarInScope = function(scope) {
    return scope.flags & SCOPE_FUNCTION || !this.inModule && scope.flags & SCOPE_TOP;
  };
  pp$3.declareName = function(name, bindingType, pos) {
    var redeclared = false;
    if (bindingType === BIND_LEXICAL) {
      var scope = this.currentScope();
      redeclared = scope.lexical.indexOf(name) > -1 || scope.functions.indexOf(name) > -1 || scope.var.indexOf(name) > -1;
      scope.lexical.push(name);
      if (this.inModule && scope.flags & SCOPE_TOP) {
        delete this.undefinedExports[name];
      }
    } else if (bindingType === BIND_SIMPLE_CATCH) {
      var scope$1 = this.currentScope();
      scope$1.lexical.push(name);
    } else if (bindingType === BIND_FUNCTION) {
      var scope$2 = this.currentScope();
      if (this.treatFunctionsAsVar) {
        redeclared = scope$2.lexical.indexOf(name) > -1;
      } else {
        redeclared = scope$2.lexical.indexOf(name) > -1 || scope$2.var.indexOf(name) > -1;
      }
      scope$2.functions.push(name);
    } else {
      for (var i2 = this.scopeStack.length - 1; i2 >= 0; --i2) {
        var scope$3 = this.scopeStack[i2];
        if (scope$3.lexical.indexOf(name) > -1 && !(scope$3.flags & SCOPE_SIMPLE_CATCH && scope$3.lexical[0] === name) || !this.treatFunctionsAsVarInScope(scope$3) && scope$3.functions.indexOf(name) > -1) {
          redeclared = true;
          break;
        }
        scope$3.var.push(name);
        if (this.inModule && scope$3.flags & SCOPE_TOP) {
          delete this.undefinedExports[name];
        }
        if (scope$3.flags & SCOPE_VAR) {
          break;
        }
      }
    }
    if (redeclared) {
      this.raiseRecoverable(pos, "Identifier '" + name + "' has already been declared");
    }
  };
  pp$3.checkLocalExport = function(id) {
    if (this.scopeStack[0].lexical.indexOf(id.name) === -1 && this.scopeStack[0].var.indexOf(id.name) === -1) {
      this.undefinedExports[id.name] = id;
    }
  };
  pp$3.currentScope = function() {
    return this.scopeStack[this.scopeStack.length - 1];
  };
  pp$3.currentVarScope = function() {
    for (var i2 = this.scopeStack.length - 1; ; i2--) {
      var scope = this.scopeStack[i2];
      if (scope.flags & (SCOPE_VAR | SCOPE_CLASS_FIELD_INIT | SCOPE_CLASS_STATIC_BLOCK)) {
        return scope;
      }
    }
  };
  pp$3.currentThisScope = function() {
    for (var i2 = this.scopeStack.length - 1; ; i2--) {
      var scope = this.scopeStack[i2];
      if (scope.flags & (SCOPE_VAR | SCOPE_CLASS_FIELD_INIT | SCOPE_CLASS_STATIC_BLOCK) && !(scope.flags & SCOPE_ARROW)) {
        return scope;
      }
    }
  };
  var Node = function Node2(parser, pos, loc) {
    this.type = "";
    this.start = pos;
    this.end = 0;
    if (parser.options.locations) {
      this.loc = new SourceLocation(parser, loc);
    }
    if (parser.options.directSourceFile) {
      this.sourceFile = parser.options.directSourceFile;
    }
    if (parser.options.ranges) {
      this.range = [pos, 0];
    }
  };
  var pp$2 = Parser.prototype;
  pp$2.startNode = function() {
    return new Node(this, this.start, this.startLoc);
  };
  pp$2.startNodeAt = function(pos, loc) {
    return new Node(this, pos, loc);
  };
  function finishNodeAt(node, type, pos, loc) {
    node.type = type;
    node.end = pos;
    if (this.options.locations) {
      node.loc.end = loc;
    }
    if (this.options.ranges) {
      node.range[1] = pos;
    }
    return node;
  }
  pp$2.finishNode = function(node, type) {
    return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc);
  };
  pp$2.finishNodeAt = function(node, type, pos, loc) {
    return finishNodeAt.call(this, node, type, pos, loc);
  };
  pp$2.copyNode = function(node) {
    var newNode = new Node(this, node.start, this.startLoc);
    for (var prop in node) {
      newNode[prop] = node[prop];
    }
    return newNode;
  };
  var scriptValuesAddedInUnicode = "Berf Beria_Erfe Gara Garay Gukh Gurung_Khema Hrkt Katakana_Or_Hiragana Kawi Kirat_Rai Krai Nag_Mundari Nagm Ol_Onal Onao Sidetic Sidt Sunu Sunuwar Tai_Yo Tayo Todhri Todr Tolong_Siki Tols Tulu_Tigalari Tutg Unknown Zzzz";
  var ecma9BinaryProperties = "ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS";
  var ecma10BinaryProperties = ecma9BinaryProperties + " Extended_Pictographic";
  var ecma11BinaryProperties = ecma10BinaryProperties;
  var ecma12BinaryProperties = ecma11BinaryProperties + " EBase EComp EMod EPres ExtPict";
  var ecma13BinaryProperties = ecma12BinaryProperties;
  var ecma14BinaryProperties = ecma13BinaryProperties;
  var unicodeBinaryProperties = {
    9: ecma9BinaryProperties,
    10: ecma10BinaryProperties,
    11: ecma11BinaryProperties,
    12: ecma12BinaryProperties,
    13: ecma13BinaryProperties,
    14: ecma14BinaryProperties
  };
  var ecma14BinaryPropertiesOfStrings = "Basic_Emoji Emoji_Keycap_Sequence RGI_Emoji_Modifier_Sequence RGI_Emoji_Flag_Sequence RGI_Emoji_Tag_Sequence RGI_Emoji_ZWJ_Sequence RGI_Emoji";
  var unicodeBinaryPropertiesOfStrings = {
    9: "",
    10: "",
    11: "",
    12: "",
    13: "",
    14: ecma14BinaryPropertiesOfStrings
  };
  var unicodeGeneralCategoryValues = "Cased_Letter LC Close_Punctuation Pe Connector_Punctuation Pc Control Cc cntrl Currency_Symbol Sc Dash_Punctuation Pd Decimal_Number Nd digit Enclosing_Mark Me Final_Punctuation Pf Format Cf Initial_Punctuation Pi Letter L Letter_Number Nl Line_Separator Zl Lowercase_Letter Ll Mark M Combining_Mark Math_Symbol Sm Modifier_Letter Lm Modifier_Symbol Sk Nonspacing_Mark Mn Number N Open_Punctuation Ps Other C Other_Letter Lo Other_Number No Other_Punctuation Po Other_Symbol So Paragraph_Separator Zp Private_Use Co Punctuation P punct Separator Z Space_Separator Zs Spacing_Mark Mc Surrogate Cs Symbol S Titlecase_Letter Lt Unassigned Cn Uppercase_Letter Lu";
  var ecma9ScriptValues = "Adlam Adlm Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb";
  var ecma10ScriptValues = ecma9ScriptValues + " Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd";
  var ecma11ScriptValues = ecma10ScriptValues + " Elymaic Elym Nandinagari Nand Nyiakeng_Puachue_Hmong Hmnp Wancho Wcho";
  var ecma12ScriptValues = ecma11ScriptValues + " Chorasmian Chrs Diak Dives_Akuru Khitan_Small_Script Kits Yezi Yezidi";
  var ecma13ScriptValues = ecma12ScriptValues + " Cypro_Minoan Cpmn Old_Uyghur Ougr Tangsa Tnsa Toto Vithkuqi Vith";
  var ecma14ScriptValues = ecma13ScriptValues + " " + scriptValuesAddedInUnicode;
  var unicodeScriptValues = {
    9: ecma9ScriptValues,
    10: ecma10ScriptValues,
    11: ecma11ScriptValues,
    12: ecma12ScriptValues,
    13: ecma13ScriptValues,
    14: ecma14ScriptValues
  };
  var data = {};
  function buildUnicodeData(ecmaVersion2) {
    var d = data[ecmaVersion2] = {
      binary: wordsRegexp(unicodeBinaryProperties[ecmaVersion2] + " " + unicodeGeneralCategoryValues),
      binaryOfStrings: wordsRegexp(unicodeBinaryPropertiesOfStrings[ecmaVersion2]),
      nonBinary: {
        General_Category: wordsRegexp(unicodeGeneralCategoryValues),
        Script: wordsRegexp(unicodeScriptValues[ecmaVersion2])
      }
    };
    d.nonBinary.Script_Extensions = d.nonBinary.Script;
    d.nonBinary.gc = d.nonBinary.General_Category;
    d.nonBinary.sc = d.nonBinary.Script;
    d.nonBinary.scx = d.nonBinary.Script_Extensions;
  }
  for (i = 0, list = [9, 10, 11, 12, 13, 14]; i < list.length; i += 1) {
    ecmaVersion = list[i];
    buildUnicodeData(ecmaVersion);
  }
  var ecmaVersion;
  var i;
  var list;
  var pp$1 = Parser.prototype;
  var BranchID = function BranchID2(parent, base) {
    this.parent = parent;
    this.base = base || this;
  };
  BranchID.prototype.separatedFrom = function separatedFrom(alt) {
    for (var self2 = this; self2; self2 = self2.parent) {
      for (var other = alt; other; other = other.parent) {
        if (self2.base === other.base && self2 !== other) {
          return true;
        }
      }
    }
    return false;
  };
  BranchID.prototype.sibling = function sibling() {
    return new BranchID(this.parent, this.base);
  };
  var RegExpValidationState = function RegExpValidationState2(parser) {
    this.parser = parser;
    this.validFlags = "gim" + (parser.options.ecmaVersion >= 6 ? "uy" : "") + (parser.options.ecmaVersion >= 9 ? "s" : "") + (parser.options.ecmaVersion >= 13 ? "d" : "") + (parser.options.ecmaVersion >= 15 ? "v" : "");
    this.unicodeProperties = data[parser.options.ecmaVersion >= 14 ? 14 : parser.options.ecmaVersion];
    this.source = "";
    this.flags = "";
    this.start = 0;
    this.switchU = false;
    this.switchV = false;
    this.switchN = false;
    this.pos = 0;
    this.lastIntValue = 0;
    this.lastStringValue = "";
    this.lastAssertionIsQuantifiable = false;
    this.numCapturingParens = 0;
    this.maxBackReference = 0;
    this.groupNames = /* @__PURE__ */ Object.create(null);
    this.backReferenceNames = [];
    this.branchID = null;
  };
  RegExpValidationState.prototype.reset = function reset(start, pattern, flags) {
    var unicodeSets = flags.indexOf("v") !== -1;
    var unicode = flags.indexOf("u") !== -1;
    this.start = start | 0;
    this.source = pattern + "";
    this.flags = flags;
    if (unicodeSets && this.parser.options.ecmaVersion >= 15) {
      this.switchU = true;
      this.switchV = true;
      this.switchN = true;
    } else {
      this.switchU = unicode && this.parser.options.ecmaVersion >= 6;
      this.switchV = false;
      this.switchN = unicode && this.parser.options.ecmaVersion >= 9;
    }
  };
  RegExpValidationState.prototype.raise = function raise(message) {
    this.parser.raiseRecoverable(this.start, "Invalid regular expression: /" + this.source + "/: " + message);
  };
  RegExpValidationState.prototype.at = function at(i2, forceU) {
    if (forceU === void 0) forceU = false;
    var s = this.source;
    var l = s.length;
    if (i2 >= l) {
      return -1;
    }
    var c = s.charCodeAt(i2);
    if (!(forceU || this.switchU) || c <= 55295 || c >= 57344 || i2 + 1 >= l) {
      return c;
    }
    var next = s.charCodeAt(i2 + 1);
    return next >= 56320 && next <= 57343 ? (c << 10) + next - 56613888 : c;
  };
  RegExpValidationState.prototype.nextIndex = function nextIndex(i2, forceU) {
    if (forceU === void 0) forceU = false;
    var s = this.source;
    var l = s.length;
    if (i2 >= l) {
      return l;
    }
    var c = s.charCodeAt(i2), next;
    if (!(forceU || this.switchU) || c <= 55295 || c >= 57344 || i2 + 1 >= l || (next = s.charCodeAt(i2 + 1)) < 56320 || next > 57343) {
      return i2 + 1;
    }
    return i2 + 2;
  };
  RegExpValidationState.prototype.current = function current(forceU) {
    if (forceU === void 0) forceU = false;
    return this.at(this.pos, forceU);
  };
  RegExpValidationState.prototype.lookahead = function lookahead(forceU) {
    if (forceU === void 0) forceU = false;
    return this.at(this.nextIndex(this.pos, forceU), forceU);
  };
  RegExpValidationState.prototype.advance = function advance(forceU) {
    if (forceU === void 0) forceU = false;
    this.pos = this.nextIndex(this.pos, forceU);
  };
  RegExpValidationState.prototype.eat = function eat(ch, forceU) {
    if (forceU === void 0) forceU = false;
    if (this.current(forceU) === ch) {
      this.advance(forceU);
      return true;
    }
    return false;
  };
  RegExpValidationState.prototype.eatChars = function eatChars(chs, forceU) {
    if (forceU === void 0) forceU = false;
    var pos = this.pos;
    for (var i2 = 0, list2 = chs; i2 < list2.length; i2 += 1) {
      var ch = list2[i2];
      var current2 = this.at(pos, forceU);
      if (current2 === -1 || current2 !== ch) {
        return false;
      }
      pos = this.nextIndex(pos, forceU);
    }
    this.pos = pos;
    return true;
  };
  pp$1.validateRegExpFlags = function(state) {
    var validFlags = state.validFlags;
    var flags = state.flags;
    var u = false;
    var v = false;
    for (var i2 = 0; i2 < flags.length; i2++) {
      var flag = flags.charAt(i2);
      if (validFlags.indexOf(flag) === -1) {
        this.raise(state.start, "Invalid regular expression flag");
      }
      if (flags.indexOf(flag, i2 + 1) > -1) {
        this.raise(state.start, "Duplicate regular expression flag");
      }
      if (flag === "u") {
        u = true;
      }
      if (flag === "v") {
        v = true;
      }
    }
    if (this.options.ecmaVersion >= 15 && u && v) {
      this.raise(state.start, "Invalid regular expression flag");
    }
  };
  function hasProp(obj) {
    for (var _ in obj) {
      return true;
    }
    return false;
  }
  pp$1.validateRegExpPattern = function(state) {
    this.regexp_pattern(state);
    if (!state.switchN && this.options.ecmaVersion >= 9 && hasProp(state.groupNames)) {
      state.switchN = true;
      this.regexp_pattern(state);
    }
  };
  pp$1.regexp_pattern = function(state) {
    state.pos = 0;
    state.lastIntValue = 0;
    state.lastStringValue = "";
    state.lastAssertionIsQuantifiable = false;
    state.numCapturingParens = 0;
    state.maxBackReference = 0;
    state.groupNames = /* @__PURE__ */ Object.create(null);
    state.backReferenceNames.length = 0;
    state.branchID = null;
    this.regexp_disjunction(state);
    if (state.pos !== state.source.length) {
      if (state.eat(
        41
        /* ) */
      )) {
        state.raise("Unmatched ')'");
      }
      if (state.eat(
        93
        /* ] */
      ) || state.eat(
        125
        /* } */
      )) {
        state.raise("Lone quantifier brackets");
      }
    }
    if (state.maxBackReference > state.numCapturingParens) {
      state.raise("Invalid escape");
    }
    for (var i2 = 0, list2 = state.backReferenceNames; i2 < list2.length; i2 += 1) {
      var name = list2[i2];
      if (!state.groupNames[name]) {
        state.raise("Invalid named capture referenced");
      }
    }
  };
  pp$1.regexp_disjunction = function(state) {
    var trackDisjunction = this.options.ecmaVersion >= 16;
    if (trackDisjunction) {
      state.branchID = new BranchID(state.branchID, null);
    }
    this.regexp_alternative(state);
    while (state.eat(
      124
      /* | */
    )) {
      if (trackDisjunction) {
        state.branchID = state.branchID.sibling();
      }
      this.regexp_alternative(state);
    }
    if (trackDisjunction) {
      state.branchID = state.branchID.parent;
    }
    if (this.regexp_eatQuantifier(state, true)) {
      state.raise("Nothing to repeat");
    }
    if (state.eat(
      123
      /* { */
    )) {
      state.raise("Lone quantifier brackets");
    }
  };
  pp$1.regexp_alternative = function(state) {
    while (state.pos < state.source.length && this.regexp_eatTerm(state)) {
    }
  };
  pp$1.regexp_eatTerm = function(state) {
    if (this.regexp_eatAssertion(state)) {
      if (state.lastAssertionIsQuantifiable && this.regexp_eatQuantifier(state)) {
        if (state.switchU) {
          state.raise("Invalid quantifier");
        }
      }
      return true;
    }
    if (state.switchU ? this.regexp_eatAtom(state) : this.regexp_eatExtendedAtom(state)) {
      this.regexp_eatQuantifier(state);
      return true;
    }
    return false;
  };
  pp$1.regexp_eatAssertion = function(state) {
    var start = state.pos;
    state.lastAssertionIsQuantifiable = false;
    if (state.eat(
      94
      /* ^ */
    ) || state.eat(
      36
      /* $ */
    )) {
      return true;
    }
    if (state.eat(
      92
      /* \ */
    )) {
      if (state.eat(
        66
        /* B */
      ) || state.eat(
        98
        /* b */
      )) {
        return true;
      }
      state.pos = start;
    }
    if (state.eat(
      40
      /* ( */
    ) && state.eat(
      63
      /* ? */
    )) {
      var lookbehind = false;
      if (this.options.ecmaVersion >= 9) {
        lookbehind = state.eat(
          60
          /* < */
        );
      }
      if (state.eat(
        61
        /* = */
      ) || state.eat(
        33
        /* ! */
      )) {
        this.regexp_disjunction(state);
        if (!state.eat(
          41
          /* ) */
        )) {
          state.raise("Unterminated group");
        }
        state.lastAssertionIsQuantifiable = !lookbehind;
        return true;
      }
    }
    state.pos = start;
    return false;
  };
  pp$1.regexp_eatQuantifier = function(state, noError) {
    if (noError === void 0) noError = false;
    if (this.regexp_eatQuantifierPrefix(state, noError)) {
      state.eat(
        63
        /* ? */
      );
      return true;
    }
    return false;
  };
  pp$1.regexp_eatQuantifierPrefix = function(state, noError) {
    return state.eat(
      42
      /* * */
    ) || state.eat(
      43
      /* + */
    ) || state.eat(
      63
      /* ? */
    ) || this.regexp_eatBracedQuantifier(state, noError);
  };
  pp$1.regexp_eatBracedQuantifier = function(state, noError) {
    var start = state.pos;
    if (state.eat(
      123
      /* { */
    )) {
      var min = 0, max = -1;
      if (this.regexp_eatDecimalDigits(state)) {
        min = state.lastIntValue;
        if (state.eat(
          44
          /* , */
        ) && this.regexp_eatDecimalDigits(state)) {
          max = state.lastIntValue;
        }
        if (state.eat(
          125
          /* } */
        )) {
          if (max !== -1 && max < min && !noError) {
            state.raise("numbers out of order in {} quantifier");
          }
          return true;
        }
      }
      if (state.switchU && !noError) {
        state.raise("Incomplete quantifier");
      }
      state.pos = start;
    }
    return false;
  };
  pp$1.regexp_eatAtom = function(state) {
    return this.regexp_eatPatternCharacters(state) || state.eat(
      46
      /* . */
    ) || this.regexp_eatReverseSolidusAtomEscape(state) || this.regexp_eatCharacterClass(state) || this.regexp_eatUncapturingGroup(state) || this.regexp_eatCapturingGroup(state);
  };
  pp$1.regexp_eatReverseSolidusAtomEscape = function(state) {
    var start = state.pos;
    if (state.eat(
      92
      /* \ */
    )) {
      if (this.regexp_eatAtomEscape(state)) {
        return true;
      }
      state.pos = start;
    }
    return false;
  };
  pp$1.regexp_eatUncapturingGroup = function(state) {
    var start = state.pos;
    if (state.eat(
      40
      /* ( */
    )) {
      if (state.eat(
        63
        /* ? */
      )) {
        if (this.options.ecmaVersion >= 16) {
          var addModifiers = this.regexp_eatModifiers(state);
          var hasHyphen = state.eat(
            45
            /* - */
          );
          if (addModifiers || hasHyphen) {
            for (var i2 = 0; i2 < addModifiers.length; i2++) {
              var modifier = addModifiers.charAt(i2);
              if (addModifiers.indexOf(modifier, i2 + 1) > -1) {
                state.raise("Duplicate regular expression modifiers");
              }
            }
            if (hasHyphen) {
              var removeModifiers = this.regexp_eatModifiers(state);
              if (!addModifiers && !removeModifiers && state.current() === 58) {
                state.raise("Invalid regular expression modifiers");
              }
              for (var i$1 = 0; i$1 < removeModifiers.length; i$1++) {
                var modifier$1 = removeModifiers.charAt(i$1);
                if (removeModifiers.indexOf(modifier$1, i$1 + 1) > -1 || addModifiers.indexOf(modifier$1) > -1) {
                  state.raise("Duplicate regular expression modifiers");
                }
              }
            }
          }
        }
        if (state.eat(
          58
          /* : */
        )) {
          this.regexp_disjunction(state);
          if (state.eat(
            41
            /* ) */
          )) {
            return true;
          }
          state.raise("Unterminated group");
        }
      }
      state.pos = start;
    }
    return false;
  };
  pp$1.regexp_eatCapturingGroup = function(state) {
    if (state.eat(
      40
      /* ( */
    )) {
      if (this.options.ecmaVersion >= 9) {
        this.regexp_groupSpecifier(state);
      } else if (state.current() === 63) {
        state.raise("Invalid group");
      }
      this.regexp_disjunction(state);
      if (state.eat(
        41
        /* ) */
      )) {
        state.numCapturingParens += 1;
        return true;
      }
      state.raise("Unterminated group");
    }
    return false;
  };
  pp$1.regexp_eatModifiers = function(state) {
    var modifiers = "";
    var ch = 0;
    while ((ch = state.current()) !== -1 && isRegularExpressionModifier(ch)) {
      modifiers += codePointToString(ch);
      state.advance();
    }
    return modifiers;
  };
  function isRegularExpressionModifier(ch) {
    return ch === 105 || ch === 109 || ch === 115;
  }
  pp$1.regexp_eatExtendedAtom = function(state) {
    return state.eat(
      46
      /* . */
    ) || this.regexp_eatReverseSolidusAtomEscape(state) || this.regexp_eatCharacterClass(state) || this.regexp_eatUncapturingGroup(state) || this.regexp_eatCapturingGroup(state) || this.regexp_eatInvalidBracedQuantifier(state) || this.regexp_eatExtendedPatternCharacter(state);
  };
  pp$1.regexp_eatInvalidBracedQuantifier = function(state) {
    if (this.regexp_eatBracedQuantifier(state, true)) {
      state.raise("Nothing to repeat");
    }
    return false;
  };
  pp$1.regexp_eatSyntaxCharacter = function(state) {
    var ch = state.current();
    if (isSyntaxCharacter(ch)) {
      state.lastIntValue = ch;
      state.advance();
      return true;
    }
    return false;
  };
  function isSyntaxCharacter(ch) {
    return ch === 36 || ch >= 40 && ch <= 43 || ch === 46 || ch === 63 || ch >= 91 && ch <= 94 || ch >= 123 && ch <= 125;
  }
  pp$1.regexp_eatPatternCharacters = function(state) {
    var start = state.pos;
    var ch = 0;
    while ((ch = state.current()) !== -1 && !isSyntaxCharacter(ch)) {
      state.advance();
    }
    return state.pos !== start;
  };
  pp$1.regexp_eatExtendedPatternCharacter = function(state) {
    var ch = state.current();
    if (ch !== -1 && ch !== 36 && !(ch >= 40 && ch <= 43) && ch !== 46 && ch !== 63 && ch !== 91 && ch !== 94 && ch !== 124) {
      state.advance();
      return true;
    }
    return false;
  };
  pp$1.regexp_groupSpecifier = function(state) {
    if (state.eat(
      63
      /* ? */
    )) {
      if (!this.regexp_eatGroupName(state)) {
        state.raise("Invalid group");
      }
      var trackDisjunction = this.options.ecmaVersion >= 16;
      var known = state.groupNames[state.lastStringValue];
      if (known) {
        if (trackDisjunction) {
          for (var i2 = 0, list2 = known; i2 < list2.length; i2 += 1) {
            var altID = list2[i2];
            if (!altID.separatedFrom(state.branchID)) {
              state.raise("Duplicate capture group name");
            }
          }
        } else {
          state.raise("Duplicate capture group name");
        }
      }
      if (trackDisjunction) {
        (known || (state.groupNames[state.lastStringValue] = [])).push(state.branchID);
      } else {
        state.groupNames[state.lastStringValue] = true;
      }
    }
  };
  pp$1.regexp_eatGroupName = function(state) {
    state.lastStringValue = "";
    if (state.eat(
      60
      /* < */
    )) {
      if (this.regexp_eatRegExpIdentifierName(state) && state.eat(
        62
        /* > */
      )) {
        return true;
      }
      state.raise("Invalid capture group name");
    }
    return false;
  };
  pp$1.regexp_eatRegExpIdentifierName = function(state) {
    state.lastStringValue = "";
    if (this.regexp_eatRegExpIdentifierStart(state)) {
      state.lastStringValue += codePointToString(state.lastIntValue);
      while (this.regexp_eatRegExpIdentifierPart(state)) {
        state.lastStringValue += codePointToString(state.lastIntValue);
      }
      return true;
    }
    return false;
  };
  pp$1.regexp_eatRegExpIdentifierStart = function(state) {
    var start = state.pos;
    var forceU = this.options.ecmaVersion >= 11;
    var ch = state.current(forceU);
    state.advance(forceU);
    if (ch === 92 && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
      ch = state.lastIntValue;
    }
    if (isRegExpIdentifierStart(ch)) {
      state.lastIntValue = ch;
      return true;
    }
    state.pos = start;
    return false;
  };
  function isRegExpIdentifierStart(ch) {
    return isIdentifierStart(ch, true) || ch === 36 || ch === 95;
  }
  pp$1.regexp_eatRegExpIdentifierPart = function(state) {
    var start = state.pos;
    var forceU = this.options.ecmaVersion >= 11;
    var ch = state.current(forceU);
    state.advance(forceU);
    if (ch === 92 && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
      ch = state.lastIntValue;
    }
    if (isRegExpIdentifierPart(ch)) {
      state.lastIntValue = ch;
      return true;
    }
    state.pos = start;
    return false;
  };
  function isRegExpIdentifierPart(ch) {
    return isIdentifierChar(ch, true) || ch === 36 || ch === 95 || ch === 8204 || ch === 8205;
  }
  pp$1.regexp_eatAtomEscape = function(state) {
    if (this.regexp_eatBackReference(state) || this.regexp_eatCharacterClassEscape(state) || this.regexp_eatCharacterEscape(state) || state.switchN && this.regexp_eatKGroupName(state)) {
      return true;
    }
    if (state.switchU) {
      if (state.current() === 99) {
        state.raise("Invalid unicode escape");
      }
      state.raise("Invalid escape");
    }
    return false;
  };
  pp$1.regexp_eatBackReference = function(state) {
    var start = state.pos;
    if (this.regexp_eatDecimalEscape(state)) {
      var n = state.lastIntValue;
      if (state.switchU) {
        if (n > state.maxBackReference) {
          state.maxBackReference = n;
        }
        return true;
      }
      if (n <= state.numCapturingParens) {
        return true;
      }
      state.pos = start;
    }
    return false;
  };
  pp$1.regexp_eatKGroupName = function(state) {
    if (state.eat(
      107
      /* k */
    )) {
      if (this.regexp_eatGroupName(state)) {
        state.backReferenceNames.push(state.lastStringValue);
        return true;
      }
      state.raise("Invalid named reference");
    }
    return false;
  };
  pp$1.regexp_eatCharacterEscape = function(state) {
    return this.regexp_eatControlEscape(state) || this.regexp_eatCControlLetter(state) || this.regexp_eatZero(state) || this.regexp_eatHexEscapeSequence(state) || this.regexp_eatRegExpUnicodeEscapeSequence(state, false) || !state.switchU && this.regexp_eatLegacyOctalEscapeSequence(state) || this.regexp_eatIdentityEscape(state);
  };
  pp$1.regexp_eatCControlLetter = function(state) {
    var start = state.pos;
    if (state.eat(
      99
      /* c */
    )) {
      if (this.regexp_eatControlLetter(state)) {
        return true;
      }
      state.pos = start;
    }
    return false;
  };
  pp$1.regexp_eatZero = function(state) {
    if (state.current() === 48 && !isDecimalDigit(state.lookahead())) {
      state.lastIntValue = 0;
      state.advance();
      return true;
    }
    return false;
  };
  pp$1.regexp_eatControlEscape = function(state) {
    var ch = state.current();
    if (ch === 116) {
      state.lastIntValue = 9;
      state.advance();
      return true;
    }
    if (ch === 110) {
      state.lastIntValue = 10;
      state.advance();
      return true;
    }
    if (ch === 118) {
      state.lastIntValue = 11;
      state.advance();
      return true;
    }
    if (ch === 102) {
      state.lastIntValue = 12;
      state.advance();
      return true;
    }
    if (ch === 114) {
      state.lastIntValue = 13;
      state.advance();
      return true;
    }
    return false;
  };
  pp$1.regexp_eatControlLetter = function(state) {
    var ch = state.current();
    if (isControlLetter(ch)) {
      state.lastIntValue = ch % 32;
      state.advance();
      return true;
    }
    return false;
  };
  function isControlLetter(ch) {
    return ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122;
  }
  pp$1.regexp_eatRegExpUnicodeEscapeSequence = function(state, forceU) {
    if (forceU === void 0) forceU = false;
    var start = state.pos;
    var switchU = forceU || state.switchU;
    if (state.eat(
      117
      /* u */
    )) {
      if (this.regexp_eatFixedHexDigits(state, 4)) {
        var lead = state.lastIntValue;
        if (switchU && lead >= 55296 && lead <= 56319) {
          var leadSurrogateEnd = state.pos;
          if (state.eat(
            92
            /* \ */
          ) && state.eat(
            117
            /* u */
          ) && this.regexp_eatFixedHexDigits(state, 4)) {
            var trail = state.lastIntValue;
            if (trail >= 56320 && trail <= 57343) {
              state.lastIntValue = (lead - 55296) * 1024 + (trail - 56320) + 65536;
              return true;
            }
          }
          state.pos = leadSurrogateEnd;
          state.lastIntValue = lead;
        }
        return true;
      }
      if (switchU && state.eat(
        123
        /* { */
      ) && this.regexp_eatHexDigits(state) && state.eat(
        125
        /* } */
      ) && isValidUnicode(state.lastIntValue)) {
        return true;
      }
      if (switchU) {
        state.raise("Invalid unicode escape");
      }
      state.pos = start;
    }
    return false;
  };
  function isValidUnicode(ch) {
    return ch >= 0 && ch <= 1114111;
  }
  pp$1.regexp_eatIdentityEscape = function(state) {
    if (state.switchU) {
      if (this.regexp_eatSyntaxCharacter(state)) {
        return true;
      }
      if (state.eat(
        47
        /* / */
      )) {
        state.lastIntValue = 47;
        return true;
      }
      return false;
    }
    var ch = state.current();
    if (ch !== 99 && (!state.switchN || ch !== 107)) {
      state.lastIntValue = ch;
      state.advance();
      return true;
    }
    return false;
  };
  pp$1.regexp_eatDecimalEscape = function(state) {
    state.lastIntValue = 0;
    var ch = state.current();
    if (ch >= 49 && ch <= 57) {
      do {
        state.lastIntValue = 10 * state.lastIntValue + (ch - 48);
        state.advance();
      } while ((ch = state.current()) >= 48 && ch <= 57);
      return true;
    }
    return false;
  };
  var CharSetNone = 0;
  var CharSetOk = 1;
  var CharSetString = 2;
  pp$1.regexp_eatCharacterClassEscape = function(state) {
    var ch = state.current();
    if (isCharacterClassEscape(ch)) {
      state.lastIntValue = -1;
      state.advance();
      return CharSetOk;
    }
    var negate = false;
    if (state.switchU && this.options.ecmaVersion >= 9 && ((negate = ch === 80) || ch === 112)) {
      state.lastIntValue = -1;
      state.advance();
      var result;
      if (state.eat(
        123
        /* { */
      ) && (result = this.regexp_eatUnicodePropertyValueExpression(state)) && state.eat(
        125
        /* } */
      )) {
        if (negate && result === CharSetString) {
          state.raise("Invalid property name");
        }
        return result;
      }
      state.raise("Invalid property name");
    }
    return CharSetNone;
  };
  function isCharacterClassEscape(ch) {
    return ch === 100 || ch === 68 || ch === 115 || ch === 83 || ch === 119 || ch === 87;
  }
  pp$1.regexp_eatUnicodePropertyValueExpression = function(state) {
    var start = state.pos;
    if (this.regexp_eatUnicodePropertyName(state) && state.eat(
      61
      /* = */
    )) {
      var name = state.lastStringValue;
      if (this.regexp_eatUnicodePropertyValue(state)) {
        var value = state.lastStringValue;
        this.regexp_validateUnicodePropertyNameAndValue(state, name, value);
        return CharSetOk;
      }
    }
    state.pos = start;
    if (this.regexp_eatLoneUnicodePropertyNameOrValue(state)) {
      var nameOrValue = state.lastStringValue;
      return this.regexp_validateUnicodePropertyNameOrValue(state, nameOrValue);
    }
    return CharSetNone;
  };
  pp$1.regexp_validateUnicodePropertyNameAndValue = function(state, name, value) {
    if (!hasOwn(state.unicodeProperties.nonBinary, name)) {
      state.raise("Invalid property name");
    }
    if (!state.unicodeProperties.nonBinary[name].test(value)) {
      state.raise("Invalid property value");
    }
  };
  pp$1.regexp_validateUnicodePropertyNameOrValue = function(state, nameOrValue) {
    if (state.unicodeProperties.binary.test(nameOrValue)) {
      return CharSetOk;
    }
    if (state.switchV && state.unicodeProperties.binaryOfStrings.test(nameOrValue)) {
      return CharSetString;
    }
    state.raise("Invalid property name");
  };
  pp$1.regexp_eatUnicodePropertyName = function(state) {
    var ch = 0;
    state.lastStringValue = "";
    while (isUnicodePropertyNameCharacter(ch = state.current())) {
      state.lastStringValue += codePointToString(ch);
      state.advance();
    }
    return state.lastStringValue !== "";
  };
  function isUnicodePropertyNameCharacter(ch) {
    return isControlLetter(ch) || ch === 95;
  }
  pp$1.regexp_eatUnicodePropertyValue = function(state) {
    var ch = 0;
    state.lastStringValue = "";
    while (isUnicodePropertyValueCharacter(ch = state.current())) {
      state.lastStringValue += codePointToString(ch);
      state.advance();
    }
    return state.lastStringValue !== "";
  };
  function isUnicodePropertyValueCharacter(ch) {
    return isUnicodePropertyNameCharacter(ch) || isDecimalDigit(ch);
  }
  pp$1.regexp_eatLoneUnicodePropertyNameOrValue = function(state) {
    return this.regexp_eatUnicodePropertyValue(state);
  };
  pp$1.regexp_eatCharacterClass = function(state) {
    if (state.eat(
      91
      /* [ */
    )) {
      var negate = state.eat(
        94
        /* ^ */
      );
      var result = this.regexp_classContents(state);
      if (!state.eat(
        93
        /* ] */
      )) {
        state.raise("Unterminated character class");
      }
      if (negate && result === CharSetString) {
        state.raise("Negated character class may contain strings");
      }
      return true;
    }
    return false;
  };
  pp$1.regexp_classContents = function(state) {
    if (state.current() === 93) {
      return CharSetOk;
    }
    if (state.switchV) {
      return this.regexp_classSetExpression(state);
    }
    this.regexp_nonEmptyClassRanges(state);
    return CharSetOk;
  };
  pp$1.regexp_nonEmptyClassRanges = function(state) {
    while (this.regexp_eatClassAtom(state)) {
      var left = state.lastIntValue;
      if (state.eat(
        45
        /* - */
      ) && this.regexp_eatClassAtom(state)) {
        var right = state.lastIntValue;
        if (state.switchU && (left === -1 || right === -1)) {
          state.raise("Invalid character class");
        }
        if (left !== -1 && right !== -1 && left > right) {
          state.raise("Range out of order in character class");
        }
      }
    }
  };
  pp$1.regexp_eatClassAtom = function(state) {
    var start = state.pos;
    if (state.eat(
      92
      /* \ */
    )) {
      if (this.regexp_eatClassEscape(state)) {
        return true;
      }
      if (state.switchU) {
        var ch$1 = state.current();
        if (ch$1 === 99 || isOctalDigit(ch$1)) {
          state.raise("Invalid class escape");
        }
        state.raise("Invalid escape");
      }
      state.pos = start;
    }
    var ch = state.current();
    if (ch !== 93) {
      state.lastIntValue = ch;
      state.advance();
      return true;
    }
    return false;
  };
  pp$1.regexp_eatClassEscape = function(state) {
    var start = state.pos;
    if (state.eat(
      98
      /* b */
    )) {
      state.lastIntValue = 8;
      return true;
    }
    if (state.switchU && state.eat(
      45
      /* - */
    )) {
      state.lastIntValue = 45;
      return true;
    }
    if (!state.switchU && state.eat(
      99
      /* c */
    )) {
      if (this.regexp_eatClassControlLetter(state)) {
        return true;
      }
      state.pos = start;
    }
    return this.regexp_eatCharacterClassEscape(state) || this.regexp_eatCharacterEscape(state);
  };
  pp$1.regexp_classSetExpression = function(state) {
    var result = CharSetOk, subResult;
    if (this.regexp_eatClassSetRange(state)) ;
    else if (subResult = this.regexp_eatClassSetOperand(state)) {
      if (subResult === CharSetString) {
        result = CharSetString;
      }
      var start = state.pos;
      while (state.eatChars(
        [38, 38]
        /* && */
      )) {
        if (state.current() !== 38 && (subResult = this.regexp_eatClassSetOperand(state))) {
          if (subResult !== CharSetString) {
            result = CharSetOk;
          }
          continue;
        }
        state.raise("Invalid character in character class");
      }
      if (start !== state.pos) {
        return result;
      }
      while (state.eatChars(
        [45, 45]
        /* -- */
      )) {
        if (this.regexp_eatClassSetOperand(state)) {
          continue;
        }
        state.raise("Invalid character in character class");
      }
      if (start !== state.pos) {
        return result;
      }
    } else {
      state.raise("Invalid character in character class");
    }
    for (; ; ) {
      if (this.regexp_eatClassSetRange(state)) {
        continue;
      }
      subResult = this.regexp_eatClassSetOperand(state);
      if (!subResult) {
        return result;
      }
      if (subResult === CharSetString) {
        result = CharSetString;
      }
    }
  };
  pp$1.regexp_eatClassSetRange = function(state) {
    var start = state.pos;
    if (this.regexp_eatClassSetCharacter(state)) {
      var left = state.lastIntValue;
      if (state.eat(
        45
        /* - */
      ) && this.regexp_eatClassSetCharacter(state)) {
        var right = state.lastIntValue;
        if (left !== -1 && right !== -1 && left > right) {
          state.raise("Range out of order in character class");
        }
        return true;
      }
      state.pos = start;
    }
    return false;
  };
  pp$1.regexp_eatClassSetOperand = function(state) {
    if (this.regexp_eatClassSetCharacter(state)) {
      return CharSetOk;
    }
    return this.regexp_eatClassStringDisjunction(state) || this.regexp_eatNestedClass(state);
  };
  pp$1.regexp_eatNestedClass = function(state) {
    var start = state.pos;
    if (state.eat(
      91
      /* [ */
    )) {
      var negate = state.eat(
        94
        /* ^ */
      );
      var result = this.regexp_classContents(state);
      if (state.eat(
        93
        /* ] */
      )) {
        if (negate && result === CharSetString) {
          state.raise("Negated character class may contain strings");
        }
        return result;
      }
      state.pos = start;
    }
    if (state.eat(
      92
      /* \ */
    )) {
      var result$1 = this.regexp_eatCharacterClassEscape(state);
      if (result$1) {
        return result$1;
      }
      state.pos = start;
    }
    return null;
  };
  pp$1.regexp_eatClassStringDisjunction = function(state) {
    var start = state.pos;
    if (state.eatChars(
      [92, 113]
      /* \q */
    )) {
      if (state.eat(
        123
        /* { */
      )) {
        var result = this.regexp_classStringDisjunctionContents(state);
        if (state.eat(
          125
          /* } */
        )) {
          return result;
        }
      } else {
        state.raise("Invalid escape");
      }
      state.pos = start;
    }
    return null;
  };
  pp$1.regexp_classStringDisjunctionContents = function(state) {
    var result = this.regexp_classString(state);
    while (state.eat(
      124
      /* | */
    )) {
      if (this.regexp_classString(state) === CharSetString) {
        result = CharSetString;
      }
    }
    return result;
  };
  pp$1.regexp_classString = function(state) {
    var count = 0;
    while (this.regexp_eatClassSetCharacter(state)) {
      count++;
    }
    return count === 1 ? CharSetOk : CharSetString;
  };
  pp$1.regexp_eatClassSetCharacter = function(state) {
    var start = state.pos;
    if (state.eat(
      92
      /* \ */
    )) {
      if (this.regexp_eatCharacterEscape(state) || this.regexp_eatClassSetReservedPunctuator(state)) {
        return true;
      }
      if (state.eat(
        98
        /* b */
      )) {
        state.lastIntValue = 8;
        return true;
      }
      state.pos = start;
      return false;
    }
    var ch = state.current();
    if (ch < 0 || ch === state.lookahead() && isClassSetReservedDoublePunctuatorCharacter(ch)) {
      return false;
    }
    if (isClassSetSyntaxCharacter(ch)) {
      return false;
    }
    state.advance();
    state.lastIntValue = ch;
    return true;
  };
  function isClassSetReservedDoublePunctuatorCharacter(ch) {
    return ch === 33 || ch >= 35 && ch <= 38 || ch >= 42 && ch <= 44 || ch === 46 || ch >= 58 && ch <= 64 || ch === 94 || ch === 96 || ch === 126;
  }
  function isClassSetSyntaxCharacter(ch) {
    return ch === 40 || ch === 41 || ch === 45 || ch === 47 || ch >= 91 && ch <= 93 || ch >= 123 && ch <= 125;
  }
  pp$1.regexp_eatClassSetReservedPunctuator = function(state) {
    var ch = state.current();
    if (isClassSetReservedPunctuator(ch)) {
      state.lastIntValue = ch;
      state.advance();
      return true;
    }
    return false;
  };
  function isClassSetReservedPunctuator(ch) {
    return ch === 33 || ch === 35 || ch === 37 || ch === 38 || ch === 44 || ch === 45 || ch >= 58 && ch <= 62 || ch === 64 || ch === 96 || ch === 126;
  }
  pp$1.regexp_eatClassControlLetter = function(state) {
    var ch = state.current();
    if (isDecimalDigit(ch) || ch === 95) {
      state.lastIntValue = ch % 32;
      state.advance();
      return true;
    }
    return false;
  };
  pp$1.regexp_eatHexEscapeSequence = function(state) {
    var start = state.pos;
    if (state.eat(
      120
      /* x */
    )) {
      if (this.regexp_eatFixedHexDigits(state, 2)) {
        return true;
      }
      if (state.switchU) {
        state.raise("Invalid escape");
      }
      state.pos = start;
    }
    return false;
  };
  pp$1.regexp_eatDecimalDigits = function(state) {
    var start = state.pos;
    var ch = 0;
    state.lastIntValue = 0;
    while (isDecimalDigit(ch = state.current())) {
      state.lastIntValue = 10 * state.lastIntValue + (ch - 48);
      state.advance();
    }
    return state.pos !== start;
  };
  function isDecimalDigit(ch) {
    return ch >= 48 && ch <= 57;
  }
  pp$1.regexp_eatHexDigits = function(state) {
    var start = state.pos;
    var ch = 0;
    state.lastIntValue = 0;
    while (isHexDigit(ch = state.current())) {
      state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
      state.advance();
    }
    return state.pos !== start;
  };
  function isHexDigit(ch) {
    return ch >= 48 && ch <= 57 || ch >= 65 && ch <= 70 || ch >= 97 && ch <= 102;
  }
  function hexToInt(ch) {
    if (ch >= 65 && ch <= 70) {
      return 10 + (ch - 65);
    }
    if (ch >= 97 && ch <= 102) {
      return 10 + (ch - 97);
    }
    return ch - 48;
  }
  pp$1.regexp_eatLegacyOctalEscapeSequence = function(state) {
    if (this.regexp_eatOctalDigit(state)) {
      var n1 = state.lastIntValue;
      if (this.regexp_eatOctalDigit(state)) {
        var n2 = state.lastIntValue;
        if (n1 <= 3 && this.regexp_eatOctalDigit(state)) {
          state.lastIntValue = n1 * 64 + n2 * 8 + state.lastIntValue;
        } else {
          state.lastIntValue = n1 * 8 + n2;
        }
      } else {
        state.lastIntValue = n1;
      }
      return true;
    }
    return false;
  };
  pp$1.regexp_eatOctalDigit = function(state) {
    var ch = state.current();
    if (isOctalDigit(ch)) {
      state.lastIntValue = ch - 48;
      state.advance();
      return true;
    }
    state.lastIntValue = 0;
    return false;
  };
  function isOctalDigit(ch) {
    return ch >= 48 && ch <= 55;
  }
  pp$1.regexp_eatFixedHexDigits = function(state, length) {
    var start = state.pos;
    state.lastIntValue = 0;
    for (var i2 = 0; i2 < length; ++i2) {
      var ch = state.current();
      if (!isHexDigit(ch)) {
        state.pos = start;
        return false;
      }
      state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
      state.advance();
    }
    return true;
  };
  var Token = function Token2(p) {
    this.type = p.type;
    this.value = p.value;
    this.start = p.start;
    this.end = p.end;
    if (p.options.locations) {
      this.loc = new SourceLocation(p, p.startLoc, p.endLoc);
    }
    if (p.options.ranges) {
      this.range = [p.start, p.end];
    }
  };
  var pp = Parser.prototype;
  pp.next = function(ignoreEscapeSequenceInKeyword) {
    if (!ignoreEscapeSequenceInKeyword && this.type.keyword && this.containsEsc) {
      this.raiseRecoverable(this.start, "Escape sequence in keyword " + this.type.keyword);
    }
    if (this.options.onToken) {
      this.options.onToken(new Token(this));
    }
    this.lastTokEnd = this.end;
    this.lastTokStart = this.start;
    this.lastTokEndLoc = this.endLoc;
    this.lastTokStartLoc = this.startLoc;
    this.nextToken();
  };
  pp.getToken = function() {
    this.next();
    return new Token(this);
  };
  if (typeof Symbol !== "undefined") {
    pp[Symbol.iterator] = function() {
      var this$1$1 = this;
      return {
        next: function() {
          var token = this$1$1.getToken();
          return {
            done: token.type === types$1.eof,
            value: token
          };
        }
      };
    };
  }
  pp.nextToken = function() {
    var curContext = this.curContext();
    if (!curContext || !curContext.preserveSpace) {
      this.skipSpace();
    }
    this.start = this.pos;
    if (this.options.locations) {
      this.startLoc = this.curPosition();
    }
    if (this.pos >= this.input.length) {
      return this.finishToken(types$1.eof);
    }
    if (curContext.override) {
      return curContext.override(this);
    } else {
      this.readToken(this.fullCharCodeAtPos());
    }
  };
  pp.readToken = function(code) {
    if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92) {
      return this.readWord();
    }
    return this.getTokenFromCode(code);
  };
  pp.fullCharCodeAt = function(pos) {
    var code = this.input.charCodeAt(pos);
    if (code <= 55295 || code >= 56320) {
      return code;
    }
    var next = this.input.charCodeAt(pos + 1);
    return next <= 56319 || next >= 57344 ? code : (code << 10) + next - 56613888;
  };
  pp.fullCharCodeAtPos = function() {
    return this.fullCharCodeAt(this.pos);
  };
  pp.skipBlockComment = function() {
    var startLoc = this.options.onComment && this.curPosition();
    var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
    if (end === -1) {
      this.raise(this.pos - 2, "Unterminated comment");
    }
    this.pos = end + 2;
    if (this.options.locations) {
      for (var nextBreak = void 0, pos = start; (nextBreak = nextLineBreak(this.input, pos, this.pos)) > -1; ) {
        ++this.curLine;
        pos = this.lineStart = nextBreak;
      }
    }
    if (this.options.onComment) {
      this.options.onComment(
        true,
        this.input.slice(start + 2, end),
        start,
        this.pos,
        startLoc,
        this.curPosition()
      );
    }
  };
  pp.skipLineComment = function(startSkip) {
    var start = this.pos;
    var startLoc = this.options.onComment && this.curPosition();
    var ch = this.input.charCodeAt(this.pos += startSkip);
    while (this.pos < this.input.length && !isNewLine(ch)) {
      ch = this.input.charCodeAt(++this.pos);
    }
    if (this.options.onComment) {
      this.options.onComment(
        false,
        this.input.slice(start + startSkip, this.pos),
        start,
        this.pos,
        startLoc,
        this.curPosition()
      );
    }
  };
  pp.skipSpace = function() {
    loop: while (this.pos < this.input.length) {
      var ch = this.input.charCodeAt(this.pos);
      switch (ch) {
        case 32:
        case 160:
          ++this.pos;
          break;
        case 13:
          if (this.input.charCodeAt(this.pos + 1) === 10) {
            ++this.pos;
          }
        case 10:
        case 8232:
        case 8233:
          ++this.pos;
          if (this.options.locations) {
            ++this.curLine;
            this.lineStart = this.pos;
          }
          break;
        case 47:
          switch (this.input.charCodeAt(this.pos + 1)) {
            case 42:
              this.skipBlockComment();
              break;
            case 47:
              this.skipLineComment(2);
              break;
            default:
              break loop;
          }
          break;
        default:
          if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
            ++this.pos;
          } else {
            break loop;
          }
      }
    }
  };
  pp.finishToken = function(type, val) {
    this.end = this.pos;
    if (this.options.locations) {
      this.endLoc = this.curPosition();
    }
    var prevType = this.type;
    this.type = type;
    this.value = val;
    this.updateContext(prevType);
  };
  pp.readToken_dot = function() {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next >= 48 && next <= 57) {
      return this.readNumber(true);
    }
    var next2 = this.input.charCodeAt(this.pos + 2);
    if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) {
      this.pos += 3;
      return this.finishToken(types$1.ellipsis);
    } else {
      ++this.pos;
      return this.finishToken(types$1.dot);
    }
  };
  pp.readToken_slash = function() {
    var next = this.input.charCodeAt(this.pos + 1);
    if (this.exprAllowed) {
      ++this.pos;
      return this.readRegexp();
    }
    if (next === 61) {
      return this.finishOp(types$1.assign, 2);
    }
    return this.finishOp(types$1.slash, 1);
  };
  pp.readToken_mult_modulo_exp = function(code) {
    var next = this.input.charCodeAt(this.pos + 1);
    var size = 1;
    var tokentype = code === 42 ? types$1.star : types$1.modulo;
    if (this.options.ecmaVersion >= 7 && code === 42 && next === 42) {
      ++size;
      tokentype = types$1.starstar;
      next = this.input.charCodeAt(this.pos + 2);
    }
    if (next === 61) {
      return this.finishOp(types$1.assign, size + 1);
    }
    return this.finishOp(tokentype, size);
  };
  pp.readToken_pipe_amp = function(code) {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === code) {
      if (this.options.ecmaVersion >= 12) {
        var next2 = this.input.charCodeAt(this.pos + 2);
        if (next2 === 61) {
          return this.finishOp(types$1.assign, 3);
        }
      }
      return this.finishOp(code === 124 ? types$1.logicalOR : types$1.logicalAND, 2);
    }
    if (next === 61) {
      return this.finishOp(types$1.assign, 2);
    }
    return this.finishOp(code === 124 ? types$1.bitwiseOR : types$1.bitwiseAND, 1);
  };
  pp.readToken_caret = function() {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 61) {
      return this.finishOp(types$1.assign, 2);
    }
    return this.finishOp(types$1.bitwiseXOR, 1);
  };
  pp.readToken_plus_min = function(code) {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === code) {
      if (next === 45 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 62 && (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
        this.skipLineComment(3);
        this.skipSpace();
        return this.nextToken();
      }
      return this.finishOp(types$1.incDec, 2);
    }
    if (next === 61) {
      return this.finishOp(types$1.assign, 2);
    }
    return this.finishOp(types$1.plusMin, 1);
  };
  pp.readToken_lt_gt = function(code) {
    var next = this.input.charCodeAt(this.pos + 1);
    var size = 1;
    if (next === code) {
      size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
      if (this.input.charCodeAt(this.pos + size) === 61) {
        return this.finishOp(types$1.assign, size + 1);
      }
      return this.finishOp(types$1.bitShift, size);
    }
    if (next === 33 && code === 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 45 && this.input.charCodeAt(this.pos + 3) === 45) {
      this.skipLineComment(4);
      this.skipSpace();
      return this.nextToken();
    }
    if (next === 61) {
      size = 2;
    }
    return this.finishOp(types$1.relational, size);
  };
  pp.readToken_eq_excl = function(code) {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 61) {
      return this.finishOp(types$1.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2);
    }
    if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) {
      this.pos += 2;
      return this.finishToken(types$1.arrow);
    }
    return this.finishOp(code === 61 ? types$1.eq : types$1.prefix, 1);
  };
  pp.readToken_question = function() {
    var ecmaVersion2 = this.options.ecmaVersion;
    if (ecmaVersion2 >= 11) {
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 46) {
        var next2 = this.input.charCodeAt(this.pos + 2);
        if (next2 < 48 || next2 > 57) {
          return this.finishOp(types$1.questionDot, 2);
        }
      }
      if (next === 63) {
        if (ecmaVersion2 >= 12) {
          var next2$1 = this.input.charCodeAt(this.pos + 2);
          if (next2$1 === 61) {
            return this.finishOp(types$1.assign, 3);
          }
        }
        return this.finishOp(types$1.coalesce, 2);
      }
    }
    return this.finishOp(types$1.question, 1);
  };
  pp.readToken_numberSign = function() {
    var ecmaVersion2 = this.options.ecmaVersion;
    var code = 35;
    if (ecmaVersion2 >= 13) {
      ++this.pos;
      code = this.fullCharCodeAtPos();
      if (isIdentifierStart(code, true) || code === 92) {
        return this.finishToken(types$1.privateId, this.readWord1());
      }
    }
    this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
  };
  pp.getTokenFromCode = function(code) {
    switch (code) {
      // The interpretation of a dot depends on whether it is followed
      // by a digit or another two dots.
      case 46:
        return this.readToken_dot();
      // Punctuation tokens.
      case 40:
        ++this.pos;
        return this.finishToken(types$1.parenL);
      case 41:
        ++this.pos;
        return this.finishToken(types$1.parenR);
      case 59:
        ++this.pos;
        return this.finishToken(types$1.semi);
      case 44:
        ++this.pos;
        return this.finishToken(types$1.comma);
      case 91:
        ++this.pos;
        return this.finishToken(types$1.bracketL);
      case 93:
        ++this.pos;
        return this.finishToken(types$1.bracketR);
      case 123:
        ++this.pos;
        return this.finishToken(types$1.braceL);
      case 125:
        ++this.pos;
        return this.finishToken(types$1.braceR);
      case 58:
        ++this.pos;
        return this.finishToken(types$1.colon);
      case 96:
        if (this.options.ecmaVersion < 6) {
          break;
        }
        ++this.pos;
        return this.finishToken(types$1.backQuote);
      case 48:
        var next = this.input.charCodeAt(this.pos + 1);
        if (next === 120 || next === 88) {
          return this.readRadixNumber(16);
        }
        if (this.options.ecmaVersion >= 6) {
          if (next === 111 || next === 79) {
            return this.readRadixNumber(8);
          }
          if (next === 98 || next === 66) {
            return this.readRadixNumber(2);
          }
        }
      // Anything else beginning with a digit is an integer, octal
      // number, or float.
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
        return this.readNumber(false);
      // Quotes produce strings.
      case 34:
      case 39:
        return this.readString(code);
      // Operators are parsed inline in tiny state machines. '=' (61) is
      // often referred to. `finishOp` simply skips the amount of
      // characters it is given as second argument, and returns a token
      // of the type given by its first argument.
      case 47:
        return this.readToken_slash();
      case 37:
      case 42:
        return this.readToken_mult_modulo_exp(code);
      case 124:
      case 38:
        return this.readToken_pipe_amp(code);
      case 94:
        return this.readToken_caret();
      case 43:
      case 45:
        return this.readToken_plus_min(code);
      case 60:
      case 62:
        return this.readToken_lt_gt(code);
      case 61:
      case 33:
        return this.readToken_eq_excl(code);
      case 63:
        return this.readToken_question();
      case 126:
        return this.finishOp(types$1.prefix, 1);
      case 35:
        return this.readToken_numberSign();
    }
    this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
  };
  pp.finishOp = function(type, size) {
    var str = this.input.slice(this.pos, this.pos + size);
    this.pos += size;
    return this.finishToken(type, str);
  };
  pp.readRegexp = function() {
    var escaped, inClass, start = this.pos;
    for (; ; ) {
      if (this.pos >= this.input.length) {
        this.raise(start, "Unterminated regular expression");
      }
      var ch = this.input.charAt(this.pos);
      if (lineBreak.test(ch)) {
        this.raise(start, "Unterminated regular expression");
      }
      if (!escaped) {
        if (ch === "[") {
          inClass = true;
        } else if (ch === "]" && inClass) {
          inClass = false;
        } else if (ch === "/" && !inClass) {
          break;
        }
        escaped = ch === "\\";
      } else {
        escaped = false;
      }
      ++this.pos;
    }
    var pattern = this.input.slice(start, this.pos);
    ++this.pos;
    var flagsStart = this.pos;
    var flags = this.readWord1();
    if (this.containsEsc) {
      this.unexpected(flagsStart);
    }
    var state = this.regexpState || (this.regexpState = new RegExpValidationState(this));
    state.reset(start, pattern, flags);
    this.validateRegExpFlags(state);
    this.validateRegExpPattern(state);
    var value = null;
    try {
      value = new RegExp(pattern, flags);
    } catch (e) {
    }
    return this.finishToken(types$1.regexp, { pattern, flags, value });
  };
  pp.readInt = function(radix, len, maybeLegacyOctalNumericLiteral) {
    var allowSeparators = this.options.ecmaVersion >= 12 && len === void 0;
    var isLegacyOctalNumericLiteral = maybeLegacyOctalNumericLiteral && this.input.charCodeAt(this.pos) === 48;
    var start = this.pos, total = 0, lastCode = 0;
    for (var i2 = 0, e = len == null ? Infinity : len; i2 < e; ++i2, ++this.pos) {
      var code = this.input.charCodeAt(this.pos), val = void 0;
      if (allowSeparators && code === 95) {
        if (isLegacyOctalNumericLiteral) {
          this.raiseRecoverable(this.pos, "Numeric separator is not allowed in legacy octal numeric literals");
        }
        if (lastCode === 95) {
          this.raiseRecoverable(this.pos, "Numeric separator must be exactly one underscore");
        }
        if (i2 === 0) {
          this.raiseRecoverable(this.pos, "Numeric separator is not allowed at the first of digits");
        }
        lastCode = code;
        continue;
      }
      if (code >= 97) {
        val = code - 97 + 10;
      } else if (code >= 65) {
        val = code - 65 + 10;
      } else if (code >= 48 && code <= 57) {
        val = code - 48;
      } else {
        val = Infinity;
      }
      if (val >= radix) {
        break;
      }
      lastCode = code;
      total = total * radix + val;
    }
    if (allowSeparators && lastCode === 95) {
      this.raiseRecoverable(this.pos - 1, "Numeric separator is not allowed at the last of digits");
    }
    if (this.pos === start || len != null && this.pos - start !== len) {
      return null;
    }
    return total;
  };
  function stringToNumber(str, isLegacyOctalNumericLiteral) {
    if (isLegacyOctalNumericLiteral) {
      return parseInt(str, 8);
    }
    return parseFloat(str.replace(/_/g, ""));
  }
  function stringToBigInt(str) {
    if (typeof BigInt !== "function") {
      return null;
    }
    return BigInt(str.replace(/_/g, ""));
  }
  pp.readRadixNumber = function(radix) {
    var start = this.pos;
    this.pos += 2;
    var val = this.readInt(radix);
    if (val == null) {
      this.raise(this.start + 2, "Expected number in radix " + radix);
    }
    if (this.options.ecmaVersion >= 11 && this.input.charCodeAt(this.pos) === 110) {
      val = stringToBigInt(this.input.slice(start, this.pos));
      ++this.pos;
    } else if (isIdentifierStart(this.fullCharCodeAtPos())) {
      this.raise(this.pos, "Identifier directly after number");
    }
    return this.finishToken(types$1.num, val);
  };
  pp.readNumber = function(startsWithDot) {
    var start = this.pos;
    if (!startsWithDot && this.readInt(10, void 0, true) === null) {
      this.raise(start, "Invalid number");
    }
    var octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
    if (octal && this.strict) {
      this.raise(start, "Invalid number");
    }
    var next = this.input.charCodeAt(this.pos);
    if (!octal && !startsWithDot && this.options.ecmaVersion >= 11 && next === 110) {
      var val$1 = stringToBigInt(this.input.slice(start, this.pos));
      ++this.pos;
      if (isIdentifierStart(this.fullCharCodeAtPos())) {
        this.raise(this.pos, "Identifier directly after number");
      }
      return this.finishToken(types$1.num, val$1);
    }
    if (octal && /[89]/.test(this.input.slice(start, this.pos))) {
      octal = false;
    }
    if (next === 46 && !octal) {
      ++this.pos;
      this.readInt(10);
      next = this.input.charCodeAt(this.pos);
    }
    if ((next === 69 || next === 101) && !octal) {
      next = this.input.charCodeAt(++this.pos);
      if (next === 43 || next === 45) {
        ++this.pos;
      }
      if (this.readInt(10) === null) {
        this.raise(start, "Invalid number");
      }
    }
    if (isIdentifierStart(this.fullCharCodeAtPos())) {
      this.raise(this.pos, "Identifier directly after number");
    }
    var val = stringToNumber(this.input.slice(start, this.pos), octal);
    return this.finishToken(types$1.num, val);
  };
  pp.readCodePoint = function() {
    var ch = this.input.charCodeAt(this.pos), code;
    if (ch === 123) {
      if (this.options.ecmaVersion < 6) {
        this.unexpected();
      }
      var codePos = ++this.pos;
      code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
      ++this.pos;
      if (code > 1114111) {
        this.invalidStringToken(codePos, "Code point out of bounds");
      }
    } else {
      code = this.readHexChar(4);
    }
    return code;
  };
  pp.readString = function(quote) {
    var out = "", chunkStart = ++this.pos;
    for (; ; ) {
      if (this.pos >= this.input.length) {
        this.raise(this.start, "Unterminated string constant");
      }
      var ch = this.input.charCodeAt(this.pos);
      if (ch === quote) {
        break;
      }
      if (ch === 92) {
        out += this.input.slice(chunkStart, this.pos);
        out += this.readEscapedChar(false);
        chunkStart = this.pos;
      } else if (ch === 8232 || ch === 8233) {
        if (this.options.ecmaVersion < 10) {
          this.raise(this.start, "Unterminated string constant");
        }
        ++this.pos;
        if (this.options.locations) {
          this.curLine++;
          this.lineStart = this.pos;
        }
      } else {
        if (isNewLine(ch)) {
          this.raise(this.start, "Unterminated string constant");
        }
        ++this.pos;
      }
    }
    out += this.input.slice(chunkStart, this.pos++);
    return this.finishToken(types$1.string, out);
  };
  var INVALID_TEMPLATE_ESCAPE_ERROR = {};
  pp.tryReadTemplateToken = function() {
    this.inTemplateElement = true;
    try {
      this.readTmplToken();
    } catch (err) {
      if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
        this.readInvalidTemplateToken();
      } else {
        throw err;
      }
    }
    this.inTemplateElement = false;
  };
  pp.invalidStringToken = function(position, message) {
    if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
      throw INVALID_TEMPLATE_ESCAPE_ERROR;
    } else {
      this.raise(position, message);
    }
  };
  pp.readTmplToken = function() {
    var out = "", chunkStart = this.pos;
    for (; ; ) {
      if (this.pos >= this.input.length) {
        this.raise(this.start, "Unterminated template");
      }
      var ch = this.input.charCodeAt(this.pos);
      if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) {
        if (this.pos === this.start && (this.type === types$1.template || this.type === types$1.invalidTemplate)) {
          if (ch === 36) {
            this.pos += 2;
            return this.finishToken(types$1.dollarBraceL);
          } else {
            ++this.pos;
            return this.finishToken(types$1.backQuote);
          }
        }
        out += this.input.slice(chunkStart, this.pos);
        return this.finishToken(types$1.template, out);
      }
      if (ch === 92) {
        out += this.input.slice(chunkStart, this.pos);
        out += this.readEscapedChar(true);
        chunkStart = this.pos;
      } else if (isNewLine(ch)) {
        out += this.input.slice(chunkStart, this.pos);
        ++this.pos;
        switch (ch) {
          case 13:
            if (this.input.charCodeAt(this.pos) === 10) {
              ++this.pos;
            }
          case 10:
            out += "\n";
            break;
          default:
            out += String.fromCharCode(ch);
            break;
        }
        if (this.options.locations) {
          ++this.curLine;
          this.lineStart = this.pos;
        }
        chunkStart = this.pos;
      } else {
        ++this.pos;
      }
    }
  };
  pp.readInvalidTemplateToken = function() {
    for (; this.pos < this.input.length; this.pos++) {
      switch (this.input[this.pos]) {
        case "\\":
          ++this.pos;
          break;
        case "$":
          if (this.input[this.pos + 1] !== "{") {
            break;
          }
        // fall through
        case "`":
          return this.finishToken(types$1.invalidTemplate, this.input.slice(this.start, this.pos));
        case "\r":
          if (this.input[this.pos + 1] === "\n") {
            ++this.pos;
          }
        // fall through
        case "\n":
        case "\u2028":
        case "\u2029":
          ++this.curLine;
          this.lineStart = this.pos + 1;
          break;
      }
    }
    this.raise(this.start, "Unterminated template");
  };
  pp.readEscapedChar = function(inTemplate) {
    var ch = this.input.charCodeAt(++this.pos);
    ++this.pos;
    switch (ch) {
      case 110:
        return "\n";
      // 'n' -> '\n'
      case 114:
        return "\r";
      // 'r' -> '\r'
      case 120:
        return String.fromCharCode(this.readHexChar(2));
      // 'x'
      case 117:
        return codePointToString(this.readCodePoint());
      // 'u'
      case 116:
        return "	";
      // 't' -> '\t'
      case 98:
        return "\b";
      // 'b' -> '\b'
      case 118:
        return "\v";
      // 'v' -> '\u000b'
      case 102:
        return "\f";
      // 'f' -> '\f'
      case 13:
        if (this.input.charCodeAt(this.pos) === 10) {
          ++this.pos;
        }
      // '\r\n'
      case 10:
        if (this.options.locations) {
          this.lineStart = this.pos;
          ++this.curLine;
        }
        return "";
      case 56:
      case 57:
        if (this.strict) {
          this.invalidStringToken(
            this.pos - 1,
            "Invalid escape sequence"
          );
        }
        if (inTemplate) {
          var codePos = this.pos - 1;
          this.invalidStringToken(
            codePos,
            "Invalid escape sequence in template string"
          );
        }
      default:
        if (ch >= 48 && ch <= 55) {
          var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
          var octal = parseInt(octalStr, 8);
          if (octal > 255) {
            octalStr = octalStr.slice(0, -1);
            octal = parseInt(octalStr, 8);
          }
          this.pos += octalStr.length - 1;
          ch = this.input.charCodeAt(this.pos);
          if ((octalStr !== "0" || ch === 56 || ch === 57) && (this.strict || inTemplate)) {
            this.invalidStringToken(
              this.pos - 1 - octalStr.length,
              inTemplate ? "Octal literal in template string" : "Octal literal in strict mode"
            );
          }
          return String.fromCharCode(octal);
        }
        if (isNewLine(ch)) {
          if (this.options.locations) {
            this.lineStart = this.pos;
            ++this.curLine;
          }
          return "";
        }
        return String.fromCharCode(ch);
    }
  };
  pp.readHexChar = function(len) {
    var codePos = this.pos;
    var n = this.readInt(16, len);
    if (n === null) {
      this.invalidStringToken(codePos, "Bad character escape sequence");
    }
    return n;
  };
  pp.readWord1 = function() {
    this.containsEsc = false;
    var word = "", first = true, chunkStart = this.pos;
    var astral = this.options.ecmaVersion >= 6;
    while (this.pos < this.input.length) {
      var ch = this.fullCharCodeAtPos();
      if (isIdentifierChar(ch, astral)) {
        this.pos += ch <= 65535 ? 1 : 2;
      } else if (ch === 92) {
        this.containsEsc = true;
        word += this.input.slice(chunkStart, this.pos);
        var escStart = this.pos;
        if (this.input.charCodeAt(++this.pos) !== 117) {
          this.invalidStringToken(this.pos, "Expecting Unicode escape sequence \\uXXXX");
        }
        ++this.pos;
        var esc = this.readCodePoint();
        if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral)) {
          this.invalidStringToken(escStart, "Invalid Unicode escape");
        }
        word += codePointToString(esc);
        chunkStart = this.pos;
      } else {
        break;
      }
      first = false;
    }
    return word + this.input.slice(chunkStart, this.pos);
  };
  pp.readWord = function() {
    var word = this.readWord1();
    var type = types$1.name;
    if (this.keywords.test(word)) {
      type = keywords[word];
    }
    return this.finishToken(type, word);
  };
  var version = "8.17.0";
  Parser.acorn = {
    Parser,
    version,
    defaultOptions,
    Position,
    SourceLocation,
    getLineInfo,
    Node,
    TokenType,
    tokTypes: types$1,
    keywordTypes: keywords,
    TokContext,
    tokContexts: types,
    isIdentifierChar,
    isIdentifierStart,
    Token,
    isNewLine,
    lineBreak,
    lineBreakG,
    nonASCIIwhitespace
  };
  function parse3(input, options) {
    return Parser.parse(input, options);
  }

  // src/code-editor/codeEditorController.ts
  init_coms();
  init_utils();
  function createFallbackEditor(mount) {
    const textarea = document.createElement("textarea");
    textarea.id = "codeText";
    mount.appendChild(textarea);
    textarea.value = "";
    return {
      getValue: () => textarea.value,
      setValue: (value) => {
        textarea.value = value;
      },
      focus: () => textarea.focus(),
      destroy: () => {
      }
    };
  }
  function readDialogCodePayload(payload) {
    return typeof payload === "string" ? JSON.parse(payload) : payload;
  }
  function updateDialogMetadata(CM6, payload) {
    if (!CM6?.setDialogMeta || !payload || !Array.isArray(payload.elements)) {
      return;
    }
    const elements2 = [];
    const radioGroups = /* @__PURE__ */ new Set();
    for (const element of payload.elements) {
      const name = String(element?.nameid || "").trim();
      const type = String(element?.type || element?.dataset?.type || "").trim();
      if (!name || !type) {
        continue;
      }
      const metaElement = { name, type };
      if (type === "Select") {
        const raw = String(element?.value ?? "");
        const tokens = raw.split(/[;,]/).map((value) => value.trim()).filter((value) => value.length > 0);
        metaElement.options = tokens;
      }
      if (type === "Radio") {
        const group = String(element?.group || element?.dataset?.group || "").trim();
        if (group) {
          radioGroups.add(group);
        }
      }
      elements2.push(metaElement);
    }
    CM6.setDialogMeta({
      elements: elements2,
      radioGroups: Array.from(radioGroups)
    });
  }
  async function bootCodeEditor(options) {
    setRendererTransport(options.transport);
    const mount = document.getElementById("codeMount");
    const status = document.getElementById("codeStatus");
    const button = document.getElementById("saveCode");
    if (!mount || !button) {
      return;
    }
    const loadedCodeMirror = options.loadCodeMirror ? await options.loadCodeMirror() : null;
    const CM6 = loadedCodeMirror || window.CM6 || null;
    let editor2 = null;
    let debounceTimer = null;
    const setStatus = function(message) {
      if (status) {
        status.textContent = message;
      }
    };
    const updateDiagCount = function() {
      try {
        if (!status || !mount) return;
        mount.querySelectorAll(".cm-lintPoint").length;
        mount.querySelectorAll(".cm-diagnosticRange, .cm-lintRange").length;
        mount.querySelectorAll(".cm-diagnostic").length;
        mount.querySelectorAll(".cm-lintMarker").length;
      } catch {
      }
    };
    const runSyntaxCheck = function() {
      const code = editor2?.getValue?.() || "";
      try {
        options.parseJavaScript?.(code);
        setStatus("No syntax errors");
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setStatus(`Syntax error: ${message}`);
      }
      if (typeof CM6?.requestLint === "function" && editor2) {
        try {
          CM6.requestLint(editor2);
          setTimeout(updateDiagCount, 350);
        } catch {
        }
      }
    };
    if (CM6) {
      editor2 = CM6.createCodeEditor(mount, {
        value: "",
        onChange: () => {
          if (!utils.isNil(debounceTimer)) {
            clearTimeout(debounceTimer);
          }
          debounceTimer = setTimeout(runSyntaxCheck, 250);
        }
      });
      setStatus("Ready (CM6)");
      setTimeout(updateDiagCount, 350);
    } else {
      editor2 = createFallbackEditor(mount);
      setStatus("Ready (fallback)");
    }
    coms.on("renderCode", (payload) => {
      const data2 = readDialogCodePayload(payload);
      const existing = String(data2?.customJS || "");
      try {
        updateDialogMetadata(CM6, data2);
      } catch {
      }
      try {
        editor2?.setValue(existing);
      } catch {
      }
      runSyntaxCheck();
      setTimeout(runSyntaxCheck, 10);
      setTimeout(updateDiagCount, 400);
    });
    setTimeout(runSyntaxCheck, 10);
    setTimeout(updateDiagCount, 400);
    const saveOnly = function() {
      const text = editor2?.getValue?.() || "";
      coms.sendTo("editorWindow", "setDialogCustomJS", text);
      try {
        if (!status) return;
        const previous = status.textContent || "";
        status.textContent = "Saved";
        setTimeout(() => {
          try {
            status.textContent = previous || "Ready";
          } catch {
          }
        }, 1200);
      } catch {
      }
    };
    button.addEventListener("click", () => {
      saveOnly();
      coms.sendTo("main", "close-codeWindow");
    });
    window.addEventListener("keydown", (event) => {
      try {
        const isSave = (event.key || "").toLowerCase() === "s" && (event.metaKey || event.ctrlKey);
        if (isSave) {
          event.preventDefault();
          event.stopPropagation();
          saveOnly();
        }
      } catch {
      }
    }, { capture: true });
    options.transport.on("code-save-only", () => {
      try {
        saveOnly();
      } catch {
      }
    });
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

  // src/shell-web/browserCodeEditor.ts
  var transport2 = createBrowserRendererTransport();
  function recordBrowserCodeEvent(event) {
    const target = window;
    const events = target.dialogCreatorBrowserCodeEvents || [];
    events.push(event);
    target.dialogCreatorBrowserCodeEvents = events;
  }
  transport2.on("send-to", (windowName, channel, ...args) => {
    if (windowName === "main" && channel === "close-codeWindow") {
      recordBrowserCodeEvent({ type: "close-requested" });
      window.parent?.postMessage({ type: "dialogcreator-close-browser-panel" }, "*");
      transport2.emit("browser-code-close-requested");
      return;
    }
    if (windowName === "editorWindow" && channel === "setDialogCustomJS") {
      const code = String(args[0] || "");
      recordBrowserCodeEvent({ type: "saved", code });
      window.parent?.postMessage({ type: "dialogcreator-code-saved", code }, "*");
      transport2.emit("browser-code-saved", code);
    }
  });
  window.dialogCreatorCodeTransport = transport2;
  window.addEventListener("message", (event) => {
    const message = event.data;
    if (message?.type === "dialogcreator-code-render") {
      transport2.emit("renderCode", message.data);
      window.parent?.postMessage({
        type: "dialogcreator-panel-payload-applied",
        requestId: String(message.requestId || "")
      }, "*");
    }
  });
  window.addEventListener("DOMContentLoaded", () => {
    window.dialogCreatorCodeReady = bootCodeEditor({
      transport: transport2,
      loadCodeMirror: () => window.CM6 ?? null,
      parseJavaScript(code) {
        parse3(
          code,
          {
            ecmaVersion: "latest",
            sourceType: "script",
            allowReturnOutsideFunction: true,
            allowAwaitOutsideFunction: true
          }
        );
      }
    });
  });
})();
/*! Bundled license information:

sortablejs/Sortable.min.js:
  (*! Sortable 1.15.7 - MIT | git://github.com/SortableJS/Sortable.git *)
*/
//# sourceMappingURL=browserCodeEditor.js.map
