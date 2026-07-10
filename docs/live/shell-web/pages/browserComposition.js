"use strict";
(() => {
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

  // src/core/dialog-package/dialogPackageFormat.ts
  var DIALOG_JSON = "dialog.json";
  var ACTIONS_JS = "actions.js";
  var LEGACY_CUSTOM_JS = "custom.js";
  var SCRIPT_SPEC = Object.freeze({
    entry: ACTIONS_JS,
    language: "javascript"
  });
  var textEncoder = new TextEncoder();
  var textDecoder = new TextDecoder("utf-8");
  var CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
      }
      table[i] = c >>> 0;
    }
    return table;
  })();
  function toUint8Array(data) {
    return data instanceof Uint8Array ? data : new Uint8Array(data);
  }
  function concatBytes(parts) {
    const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
    const output = new Uint8Array(totalLength);
    let offset = 0;
    for (const part of parts) {
      output.set(part, offset);
      offset += part.length;
    }
    return output;
  }
  function createByteBuffer(length) {
    const bytes = new Uint8Array(length);
    return {
      bytes,
      view: new DataView(bytes.buffer)
    };
  }
  function crc32(data) {
    let crc = 4294967295;
    for (const byte of data) {
      crc = CRC_TABLE[(crc ^ byte) & 255] ^ crc >>> 8;
    }
    return (crc ^ 4294967295) >>> 0;
  }
  function dosTimestamp(date = /* @__PURE__ */ new Date()) {
    const year = Math.max(1980, date.getFullYear());
    const time = date.getHours() << 11 | date.getMinutes() << 5 | Math.floor(date.getSeconds() / 2);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const dosDate = year - 1980 << 9 | month << 5 | day;
    return { time, date: dosDate };
  }
  function normalizeZipPath(name) {
    return String(name || "").replace(/\\/g, "/").replace(/^\/+/, "");
  }
  function readString(buffer, start, end, encoding) {
    const bytes = buffer.subarray(start, end);
    if (encoding === "latin1") {
      return Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    }
    return textDecoder.decode(bytes);
  }
  function makeZip(files) {
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    const stamp = dosTimestamp();
    for (const file of files) {
      const name = textEncoder.encode(normalizeZipPath(file.name));
      const data = toUint8Array(file.data);
      const crc = crc32(data);
      const localHeader = createByteBuffer(30);
      localHeader.view.setUint32(0, 67324752, true);
      localHeader.view.setUint16(4, 20, true);
      localHeader.view.setUint16(6, 2048, true);
      localHeader.view.setUint16(8, 0, true);
      localHeader.view.setUint16(10, stamp.time, true);
      localHeader.view.setUint16(12, stamp.date, true);
      localHeader.view.setUint32(14, crc, true);
      localHeader.view.setUint32(18, data.length, true);
      localHeader.view.setUint32(22, data.length, true);
      localHeader.view.setUint16(26, name.length, true);
      localHeader.view.setUint16(28, 0, true);
      localParts.push(localHeader.bytes, name, data);
      const centralHeader = createByteBuffer(46);
      centralHeader.view.setUint32(0, 33639248, true);
      centralHeader.view.setUint16(4, 20, true);
      centralHeader.view.setUint16(6, 20, true);
      centralHeader.view.setUint16(8, 2048, true);
      centralHeader.view.setUint16(10, 0, true);
      centralHeader.view.setUint16(12, stamp.time, true);
      centralHeader.view.setUint16(14, stamp.date, true);
      centralHeader.view.setUint32(16, crc, true);
      centralHeader.view.setUint32(20, data.length, true);
      centralHeader.view.setUint32(24, data.length, true);
      centralHeader.view.setUint16(28, name.length, true);
      centralHeader.view.setUint16(30, 0, true);
      centralHeader.view.setUint16(32, 0, true);
      centralHeader.view.setUint16(34, 0, true);
      centralHeader.view.setUint16(36, 0, true);
      centralHeader.view.setUint32(38, 0, true);
      centralHeader.view.setUint32(42, offset, true);
      centralParts.push(centralHeader.bytes, name);
      offset += localHeader.bytes.length + name.length + data.length;
    }
    const central = concatBytes(centralParts);
    const end = createByteBuffer(22);
    end.view.setUint32(0, 101010256, true);
    end.view.setUint16(4, 0, true);
    end.view.setUint16(6, 0, true);
    end.view.setUint16(8, files.length, true);
    end.view.setUint16(10, files.length, true);
    end.view.setUint32(12, central.length, true);
    end.view.setUint32(16, offset, true);
    end.view.setUint16(20, 0, true);
    return concatBytes([...localParts, central, end.bytes]);
  }
  function findEndOfCentralDirectory(buffer) {
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const minOffset = Math.max(0, buffer.length - 65535 - 22);
    for (let i = buffer.length - 22; i >= minOffset; i--) {
      if (view.getUint32(i, true) === 101010256) {
        return i;
      }
    }
    throw new Error("Invalid DialogCreator package: ZIP directory not found.");
  }
  function readZip(buffer, options = {}) {
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const eocd = findEndOfCentralDirectory(buffer);
    const entries = view.getUint16(eocd + 10, true);
    const centralOffset = view.getUint32(eocd + 16, true);
    const files = /* @__PURE__ */ new Map();
    let cursor = centralOffset;
    for (let i = 0; i < entries; i++) {
      if (view.getUint32(cursor, true) !== 33639248) {
        throw new Error("Invalid DialogCreator package: malformed ZIP directory.");
      }
      const flags = view.getUint16(cursor + 8, true);
      const method = view.getUint16(cursor + 10, true);
      const compressedSize = view.getUint32(cursor + 20, true);
      const fileNameLength = view.getUint16(cursor + 28, true);
      const extraLength = view.getUint16(cursor + 30, true);
      const commentLength = view.getUint16(cursor + 32, true);
      const localOffset = view.getUint32(cursor + 42, true);
      const encoding = flags & 2048 ? "utf8" : "latin1";
      const name = normalizeZipPath(readString(
        buffer,
        cursor + 46,
        cursor + 46 + fileNameLength,
        encoding
      ));
      if (!name.endsWith("/")) {
        if (view.getUint32(localOffset, true) !== 67324752) {
          throw new Error(`Invalid DialogCreator package: malformed ZIP entry ${name}.`);
        }
        const localNameLength = view.getUint16(localOffset + 26, true);
        const localExtraLength = view.getUint16(localOffset + 28, true);
        const dataStart = localOffset + 30 + localNameLength + localExtraLength;
        const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
        let data;
        if (method === 0) {
          data = new Uint8Array(compressed);
        } else if (method === 8 && options.inflateRaw) {
          data = options.inflateRaw(compressed);
        } else if (method === 8) {
          throw new Error(`DialogCreator package entry ${name} requires deflate support.`);
        } else {
          throw new Error(`Unsupported compression method ${method} for ${name}.`);
        }
        files.set(name, data);
      }
      cursor += 46 + fileNameLength + extraLength + commentLength;
    }
    return files;
  }
  function parseDialogJson(json) {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object" || !("properties" in parsed)) {
      throw new Error("Invalid dialog JSON: missing dialog properties.");
    }
    return parsed;
  }
  function createDialogPackageFiles(json) {
    const dialog = parseDialogJson(json);
    const customJS = String(dialog.customJS || "");
    delete dialog.customJS;
    dialog.script = { ...SCRIPT_SPEC };
    return {
      dialogJson: JSON.stringify(dialog, null, 4) + "\n",
      customJS
    };
  }
  function createDialogPackage(json) {
    const dialogFiles = createDialogPackageFiles(json);
    const files = [
      { name: DIALOG_JSON, data: textEncoder.encode(dialogFiles.dialogJson) },
      { name: ACTIONS_JS, data: textEncoder.encode(dialogFiles.customJS) }
    ];
    return makeZip(files);
  }
  function readDialogFiles(dialogJson, customJS) {
    const dialog = parseDialogJson(dialogJson);
    const script = dialog.script;
    if (customJS !== void 0) {
      dialog.customJS = customJS;
    } else if (script?.entry) {
      throw new Error(`Invalid DialogCreator package: missing script entry ${normalizeZipPath(String(script.entry))}.`);
    } else {
      dialog.customJS = String(dialog.customJS || "");
    }
    return JSON.stringify(dialog, null, 4);
  }
  function readDialogPackage(data, options = {}) {
    const buffer = toUint8Array(data);
    const files = readZip(buffer, options);
    const dialogFile = files.get(DIALOG_JSON);
    if (!dialogFile) {
      throw new Error(`Invalid DialogCreator package: missing ${DIALOG_JSON}.`);
    }
    const dialogJson = textDecoder.decode(dialogFile);
    const dialog = parseDialogJson(dialogJson);
    const script = dialog.script;
    const entry = normalizeZipPath(String(script?.entry || ACTIONS_JS));
    const customFile = files.get(entry) ?? (entry === ACTIONS_JS ? files.get(LEGACY_CUSTOM_JS) : void 0);
    const customJS = customFile ? textDecoder.decode(customFile) : void 0;
    return readDialogFiles(dialogJson, customJS);
  }
  function isDialogPackageName(fileName) {
    return String(fileName || "").toLowerCase().endsWith(".dc.zip");
  }

  // src/core/document/dialogDocumentRules.ts
  var DIALOG_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
  function parseDialogJsonForSave(json) {
    try {
      const parsed = JSON.parse(json);
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Dialog JSON must contain an object.");
      }
      return parsed;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Dialog JSON is invalid: ${message}`);
    }
  }
  function dialogNameFromJson(json) {
    const parsed = parseDialogJsonForSave(json);
    const properties = parsed.properties;
    if (!properties || typeof properties !== "object") {
      throw new Error("Dialog properties are missing.");
    }
    const name = String(properties.name || "").trim();
    if (!DIALOG_NAME_PATTERN.test(name)) {
      throw new Error(
        "Dialog name must be one word using only letters, numbers, and underscores, and it cannot start with a number."
      );
    }
    return name;
  }
  function defaultDialogPackageFileName(json) {
    const dialogName = json ? dialogNameFromJson(json) : "";
    return `${dialogName || "dialog"}.dc.zip`;
  }

  // src/shell-web/browserDialogFileStore.ts
  async function readBrowserDialogPackage(file) {
    if (!isDialogPackageName(file.name)) {
      return {
        ok: false,
        reason: "Choose a .dc.zip DialogCreator package."
      };
    }
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      return {
        ok: true,
        fileName: file.name,
        json: readDialogPackage(bytes)
      };
    } catch (error) {
      return {
        ok: false,
        reason: error instanceof Error ? error.message : String(error)
      };
    }
  }
  function createBrowserDialogPackage(json, requestedName) {
    try {
      const fileName = requestedName && isDialogPackageName(requestedName) ? requestedName : defaultDialogPackageFileName(json);
      const bytes = createDialogPackage(json);
      const blobBuffer = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(blobBuffer).set(bytes);
      const blob = new Blob([blobBuffer], { type: "application/zip" });
      return {
        ok: true,
        fileName,
        bytes,
        blob
      };
    } catch (error) {
      return {
        ok: false,
        reason: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // src/modules/elements.ts
  var elements = {
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

  // src/interfaces/database.ts
  var PersistedProps = Object.fromEntries(
    Object.entries(elements).filter(([key]) => key !== "groupElement").map(([key, val]) => [key, val.$persist ?? []])
  );
  var DBElementsProps = Object.fromEntries(
    Object.entries(PersistedProps).map(([k, v]) => [k, [...v]])
  );

  // src/shell-web/staticElementCatalog.ts
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

  // src/shell-web/browserComposition.ts
  function createBrowserComposition() {
    return {
      transport: createBrowserRendererTransport(),
      catalog: createStaticElementCatalog(),
      files: {
        createPackage: createBrowserDialogPackage,
        readPackage: readBrowserDialogPackage
      }
    };
  }
  function mountBrowserComposition() {
    const composition = createBrowserComposition();
    Object.assign(window, {
      dialogCreatorBrowserHost: composition
    });
    return composition;
  }
  function getEditorFrameWindow() {
    const frame = document.getElementById("dialogcreator-browser-frame");
    return frame?.contentWindow || null;
  }
  function closeEditorPanel() {
    getEditorFrameWindow()?.postMessage({ type: "dialogcreator-close-browser-panel" }, "*");
  }
  function sendEditorCommand(command, data) {
    const frameWindow = getEditorFrameWindow();
    if (!frameWindow) {
      return Promise.reject(new Error("Editor is not ready."));
    }
    const requestId = `browser-command-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        window.removeEventListener("message", onMessage);
        reject(new Error(`Timed out waiting for editor command ${command}.`));
      }, 5e3);
      const onMessage = function(event) {
        const message = event.data;
        if (message?.type !== "dialogcreator-browser-command-result" || message.requestId !== requestId) {
          return;
        }
        clearTimeout(timeout);
        window.removeEventListener("message", onMessage);
        if (message.ok) {
          resolve(message.result);
        } else {
          reject(new Error(String(message.reason || "Editor command failed.")));
        }
      };
      window.addEventListener("message", onMessage);
      frameWindow.postMessage({
        type: "dialogcreator-browser-command",
        requestId,
        command,
        data
      }, "*");
    });
  }
  function setBrowserStatus(message) {
    const status = document.getElementById("dialogcreator-browser-status");
    if (status) {
      status.textContent = message;
    }
  }
  function downloadDialogPackage(fileName, blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1e3);
  }
  function closeOpenMenus() {
    document.querySelectorAll("[data-menu-root].is-open").forEach((root) => {
      root.classList.remove("is-open");
      root.querySelector(".web-menu-button")?.setAttribute("aria-expanded", "false");
    });
  }
  function installMenuPopups() {
    document.querySelectorAll("[data-menu-root]").forEach((root) => {
      const button = root.querySelector(".web-menu-button");
      if (!button) {
        return;
      }
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const isOpen = root.classList.contains("is-open");
        closeOpenMenus();
        if (!isOpen) {
          root.classList.add("is-open");
          button.setAttribute("aria-expanded", "true");
        }
      });
    });
    document.addEventListener("pointerdown", (event) => {
      const target = event.target;
      if (!target?.closest("[data-menu-root]")) {
        closeOpenMenus();
      }
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeOpenMenus();
        closeEditorPanel();
        removeBrowserInfoWindow();
      }
    }, true);
    document.querySelectorAll(".web-menu-item").forEach((item) => {
      item.addEventListener("click", () => closeOpenMenus());
    });
  }
  function focusEditorFrame() {
    const frame = document.getElementById("dialogcreator-browser-frame");
    frame?.contentWindow?.focus();
  }
  function installEditMenu() {
    document.querySelectorAll("[data-browser-edit-command]").forEach((button) => {
      button.addEventListener("click", () => {
        focusEditorFrame();
        const command = String(button.dataset.browserEditCommand || "");
        document.execCommand(command);
      });
    });
  }
  function installInfoMenu() {
    document.querySelectorAll("[data-browser-info-command]").forEach((button) => {
      button.addEventListener("click", () => {
        const command = String(button.dataset.browserInfoCommand || "");
        openBrowserInfoWindow(command);
      });
    });
  }
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function infoConfigFor(page) {
    switch (page) {
      case "manual":
        return {
          title: "Dialog Creator - User Manual",
          src: "docs/manual.html",
          width: 1200,
          height: 780,
          minWidth: 900,
          minHeight: 640,
          resizable: true
        };
      case "api":
        return {
          title: "Dialog Creator - API Reference",
          src: "docs/api.html",
          width: 1200,
          height: 780,
          minWidth: 900,
          minHeight: 640,
          resizable: true
        };
      case "about":
      default:
        return {
          title: "About Dialog Creator",
          src: "pages/about.html",
          width: 420,
          height: 325,
          minWidth: 420,
          minHeight: 325,
          resizable: false
        };
    }
  }
  function removeBrowserInfoWindow() {
    document.getElementById("dialogcreator-info-layer")?.remove();
  }
  function centerInDesktop(desktop, win) {
    const left = Math.max(0, Math.round((desktop.clientWidth - win.offsetWidth) / 2));
    const top = Math.max(0, Math.round((desktop.clientHeight - win.offsetHeight) / 2));
    win.style.left = `${left}px`;
    win.style.top = `${top}px`;
  }
  function installWindowDrag(bounds, win, titlebar) {
    titlebar.addEventListener("pointerdown", (event) => {
      const target = event.target;
      if (event.button !== 0 || target?.closest("button")) {
        return;
      }
      const startX = event.clientX;
      const startY = event.clientY;
      const startLeft = win.offsetLeft;
      const startTop = win.offsetTop;
      titlebar.setPointerCapture(event.pointerId);
      const move = function(moveEvent) {
        const nextLeft = clamp(
          startLeft + moveEvent.clientX - startX,
          0,
          Math.max(0, bounds.clientWidth - win.offsetWidth)
        );
        const nextTop = clamp(
          startTop + moveEvent.clientY - startY,
          0,
          Math.max(0, bounds.clientHeight - win.offsetHeight)
        );
        win.style.left = `${Math.round(nextLeft)}px`;
        win.style.top = `${Math.round(nextTop)}px`;
      };
      const up = function(upEvent) {
        titlebar.releasePointerCapture(upEvent.pointerId);
        titlebar.removeEventListener("pointermove", move);
        titlebar.removeEventListener("pointerup", up);
        titlebar.removeEventListener("pointercancel", up);
      };
      titlebar.addEventListener("pointermove", move);
      titlebar.addEventListener("pointerup", up);
      titlebar.addEventListener("pointercancel", up);
    });
  }
  function installInfoWindowResize(bounds, win, config) {
    if (!config.resizable) {
      return;
    }
    win.querySelectorAll(".web-workbench-resize-handle").forEach((handle) => {
      handle.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) {
          return;
        }
        const direction = String(handle.dataset.resizeDirection || "");
        const startX = event.clientX;
        const startY = event.clientY;
        const startWidth = win.offsetWidth;
        const startHeight = win.offsetHeight;
        handle.setPointerCapture(event.pointerId);
        const move = function(moveEvent) {
          const maxWidth = Math.max(config.minWidth, bounds.clientWidth - win.offsetLeft);
          const maxHeight = Math.max(config.minHeight, bounds.clientHeight - win.offsetTop);
          if (direction === "right" || direction === "corner") {
            const width = clamp(
              startWidth + moveEvent.clientX - startX,
              config.minWidth,
              maxWidth
            );
            win.style.width = `${Math.round(width)}px`;
          }
          if (direction === "bottom" || direction === "corner") {
            const height = clamp(
              startHeight + moveEvent.clientY - startY,
              config.minHeight,
              maxHeight
            );
            win.style.height = `${Math.round(height)}px`;
          }
        };
        const up = function(upEvent) {
          handle.releasePointerCapture(upEvent.pointerId);
          handle.removeEventListener("pointermove", move);
          handle.removeEventListener("pointerup", up);
          handle.removeEventListener("pointercancel", up);
        };
        handle.addEventListener("pointermove", move);
        handle.addEventListener("pointerup", up);
        handle.addEventListener("pointercancel", up);
      });
    });
  }
  function createInfoResizeHandle(direction) {
    const handle = document.createElement("span");
    handle.className = "web-workbench-resize-handle";
    handle.dataset.resizeDirection = direction;
    return handle;
  }
  function installInfoFrameEscape(frame) {
    try {
      frame.contentWindow?.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          removeBrowserInfoWindow();
        }
      }, true);
    } catch {
    }
  }
  function openBrowserInfoWindow(page) {
    const desktop = document.getElementById("dialogcreator-browser-desktop");
    if (!desktop) {
      return;
    }
    const config = infoConfigFor(page);
    removeBrowserInfoWindow();
    const layer = document.createElement("div");
    layer.id = "dialogcreator-info-layer";
    layer.className = "web-info-layer";
    const win = document.createElement("section");
    win.className = "web-info-window";
    win.setAttribute("role", "dialog");
    win.setAttribute("aria-label", config.title);
    win.style.width = `${Math.min(config.width, Math.max(config.minWidth, desktop.clientWidth - 48))}px`;
    win.style.height = `${Math.min(config.height, Math.max(config.minHeight, desktop.clientHeight - 48))}px`;
    win.style.minWidth = `${config.minWidth}px`;
    win.style.minHeight = `${config.minHeight}px`;
    const titlebar = document.createElement("div");
    titlebar.className = "web-info-window__titlebar";
    const title = document.createElement("div");
    title.className = "web-info-window__title";
    title.textContent = config.title;
    const close = document.createElement("button");
    close.type = "button";
    close.className = "web-info-window__close";
    close.setAttribute("aria-label", "Close");
    const frame = document.createElement("iframe");
    frame.className = "web-info-window__frame";
    frame.title = config.title;
    frame.src = config.src;
    close.addEventListener("click", removeBrowserInfoWindow);
    frame.addEventListener("load", () => {
      installInfoFrameEscape(frame);
    });
    titlebar.append(title, close);
    win.append(titlebar, frame);
    if (config.resizable) {
      win.append(
        createInfoResizeHandle("right"),
        createInfoResizeHandle("bottom"),
        createInfoResizeHandle("corner")
      );
    }
    layer.appendChild(win);
    desktop.appendChild(layer);
    centerInDesktop(desktop, win);
    installWindowDrag(desktop, win, titlebar);
    installInfoWindowResize(desktop, win, config);
    frame.focus();
  }
  function installMainWindowDrag() {
    const desktop = document.getElementById("dialogcreator-browser-desktop");
    const win = document.getElementById("dialogcreator-main-window");
    const titlebar = document.getElementById("dialogcreator-main-titlebar");
    if (!desktop || !win || !titlebar) {
      return;
    }
    titlebar.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) {
        return;
      }
      const desktopRect = desktop.getBoundingClientRect();
      const rect = win.getBoundingClientRect();
      const startX = event.clientX;
      const startY = event.clientY;
      const startLeft = rect.left - desktopRect.left;
      const startTop = rect.top - desktopRect.top;
      titlebar.setPointerCapture(event.pointerId);
      const move = function(moveEvent) {
        const nextLeft = clamp(
          startLeft + moveEvent.clientX - startX,
          0,
          Math.max(0, desktop.clientWidth - win.offsetWidth)
        );
        const nextTop = clamp(
          startTop + moveEvent.clientY - startY,
          0,
          Math.max(0, desktop.clientHeight - win.offsetHeight)
        );
        win.style.left = `${Math.round(nextLeft)}px`;
        win.style.top = `${Math.round(nextTop)}px`;
      };
      const up = function(upEvent) {
        titlebar.releasePointerCapture(upEvent.pointerId);
        titlebar.removeEventListener("pointermove", move);
        titlebar.removeEventListener("pointerup", up);
        titlebar.removeEventListener("pointercancel", up);
      };
      titlebar.addEventListener("pointermove", move);
      titlebar.addEventListener("pointerup", up);
      titlebar.addEventListener("pointercancel", up);
    });
  }
  function installMainWindowResize() {
    const desktop = document.getElementById("dialogcreator-browser-desktop");
    const win = document.getElementById("dialogcreator-main-window");
    if (!desktop || !win) {
      return;
    }
    win.querySelectorAll(".web-workbench-resize-handle").forEach((handle) => {
      handle.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) {
          return;
        }
        const direction = String(handle.dataset.resizeDirection || "");
        const startX = event.clientX;
        const startY = event.clientY;
        const startWidth = win.offsetWidth;
        const startHeight = win.offsetHeight;
        const minWidth = 720;
        const minHeight = 420;
        const maxWidth = Math.max(minWidth, desktop.clientWidth - win.offsetLeft);
        const maxHeight = Math.max(minHeight, desktop.clientHeight - win.offsetTop);
        handle.setPointerCapture(event.pointerId);
        const move = function(moveEvent) {
          if (direction === "right" || direction === "corner") {
            const width = clamp(
              startWidth + moveEvent.clientX - startX,
              minWidth,
              maxWidth
            );
            win.style.width = `${Math.round(width)}px`;
          }
          if (direction === "bottom" || direction === "corner") {
            const height = clamp(
              startHeight + moveEvent.clientY - startY,
              minHeight,
              maxHeight
            );
            win.style.height = `${Math.round(height)}px`;
          }
        };
        const up = function(upEvent) {
          handle.releasePointerCapture(upEvent.pointerId);
          handle.removeEventListener("pointermove", move);
          handle.removeEventListener("pointerup", up);
          handle.removeEventListener("pointercancel", up);
        };
        handle.addEventListener("pointermove", move);
        handle.addEventListener("pointerup", up);
        handle.addEventListener("pointercancel", up);
      });
    });
  }
  function installBrowserMenu(composition) {
    const fileInput = document.getElementById("dialogcreator-browser-file-input");
    const newDialog = async function() {
      try {
        await sendEditorCommand("new");
        setBrowserStatus("New dialog");
      } catch (error) {
        setBrowserStatus(error instanceof Error ? error.message : String(error));
      }
    };
    const loadDialog = function() {
      fileInput?.click();
    };
    const previewDialog = async function() {
      try {
        await sendEditorCommand("preview");
      } catch (error) {
        setBrowserStatus(error instanceof Error ? error.message : String(error));
      }
    };
    document.getElementById("dialogcreator-browser-new")?.addEventListener("click", () => {
      void newDialog();
    });
    document.getElementById("dialogcreator-browser-load")?.addEventListener("click", () => {
      loadDialog();
    });
    fileInput?.addEventListener("change", async () => {
      const file = fileInput.files?.[0];
      fileInput.value = "";
      if (!file) {
        return;
      }
      const result = await composition.files.readPackage(file);
      if (!result.ok) {
        setBrowserStatus(result.reason);
        return;
      }
      try {
        await sendEditorCommand("load-json", result.json);
        setBrowserStatus(`Loaded ${result.fileName}`);
      } catch (error) {
        setBrowserStatus(error instanceof Error ? error.message : String(error));
      }
    });
    const save = async function(requestedName) {
      let json = "";
      try {
        json = String(await sendEditorCommand("get-json") || "");
      } catch (error) {
        setBrowserStatus(error instanceof Error ? error.message : String(error));
        return;
      }
      const result = composition.files.createPackage(json, requestedName);
      if (!result.ok) {
        setBrowserStatus(result.reason);
        return;
      }
      downloadDialogPackage(result.fileName, result.blob);
      setBrowserStatus(`Saved ${result.fileName}`);
    };
    document.getElementById("dialogcreator-browser-save")?.addEventListener("click", () => {
      void save();
    });
    document.getElementById("dialogcreator-browser-save-as")?.addEventListener("click", () => {
      void save();
    });
    document.getElementById("dialogcreator-browser-preview")?.addEventListener("click", () => {
      void previewDialog();
    });
    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message?.type !== "dialogcreator-browser-shortcut") {
        return;
      }
      switch (String(message.command || "")) {
        case "new":
          void newDialog();
          break;
        case "load":
          loadDialog();
          break;
        case "save":
        case "save-as":
          void save();
          break;
        case "preview":
          void previewDialog();
          break;
        default:
          break;
      }
    });
    window.addEventListener("keydown", (event) => {
      const key = (event.key || "").toLowerCase();
      if (!(event.metaKey || event.ctrlKey)) {
        return;
      }
      if (key === "n") {
        event.preventDefault();
        void newDialog();
        return;
      }
      if (key === "s") {
        event.preventDefault();
        void save();
        return;
      }
      if (key === "l") {
        event.preventDefault();
        loadDialog();
        return;
      }
      if (key === "p") {
        event.preventDefault();
        void previewDialog();
      }
    }, { capture: true });
  }
  installMenuPopups();
  installEditMenu();
  installInfoMenu();
  installMainWindowDrag();
  installMainWindowResize();
  installBrowserMenu(mountBrowserComposition());
})();
//# sourceMappingURL=browserComposition.js.map
