"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildSync } = require("esbuild");
const { chromium } = require("playwright");
const { PNG } = require(path.join(path.dirname(require.resolve("playwright-core")), "lib/utilsBundle.js"));
const { startRenderedWebServer } = require("./rendered-web-server");

const fixturePath = path.join(__dirname, "fixtures", "addvariables-anchoring");
const expectedLines = {
    en_US: ["By key variables"],
    el_GR: ["Με μεταβλητές", "κλειδιά"],
    fr_FR: ["Par variables clés"],
    de_DE: ["Nach", "Schlüsselvariablen"]
};

const settle = async function(frame) {
    await frame.evaluate(async () => {
        await document.fonts.ready;
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
};

const makePackage = function(source) {
    const compiled = buildSync({
        stdin: {
            resolveDir: path.resolve(__dirname, ".."),
            contents: 'export { createDialogPackage } from "./src/core/dialog-package/dialogPackageFormat";'
        },
        bundle: true, platform: "node", format: "cjs", target: "es2022", write: false
    });
    const module = { exports: {} };
    new Function("module", "exports", compiled.outputFiles[0].text)(module, module.exports);
    return Buffer.from(module.exports.createDialogPackage(JSON.stringify(source)));
};

const measureLabel = async function(frame, name = "label_bykeys", radioName = "by_order") {
    return frame.evaluate(({ name, radioName }) => {
        const label = document.querySelector(`.element-wrapper[data-nameid="${name}"]`);
        const host = label.firstElementChild;
        const text = host.querySelector(".smart-label-text");
        const radio = document.querySelector(`.element-wrapper[data-nameid="${radioName}"]`);
        const circle = radio.querySelector(".custom-radio");
        const rotated = Number(label.dataset.rotate || 0);
        const turned = rotated === 90 || rotated === 270;
        const rect = (node) => {
            const r = node.getBoundingClientRect();
            return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
        };
        const lines = [];
        const node = text.firstChild;
        for (let index = 0; index < node.length; index += 1) {
            const range = document.createRange();
            range.setStart(node, index);
            range.setEnd(node, index + 1);
            const r = Array.from(range.getClientRects()).find((r) => (turned ? r.height : r.width) > 0);
            if (!r) {
                continue;
            }
            const cross = turned ? r.left : r.top;
            let line = lines.find((line) => Math.abs(line.cross - cross) < 0.5);
            if (!line) {
                line = { value: "", cross, left: r.left, top: r.top, right: r.right, bottom: r.bottom };
                lines.push(line);
            }
            line.value += node.textContent[index];
            line.left = Math.min(line.left, r.left);
            line.top = Math.min(line.top, r.top);
            line.right = Math.max(line.right, r.right);
            line.bottom = Math.max(line.bottom, r.bottom);
        }
        const range = document.createRange();
        range.selectNodeContents(text);
        const lineRects = Array.from(range.getClientRects()).map((r) => ({
            left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height
        }));
        const style = getComputedStyle(host);
        return {
            value: text.textContent, rotated, turned,
            wrapper: rect(label), host: rect(host), circle: rect(circle), radio: rect(radio),
            lines: lines.map((line) => ({ ...line, value: line.value.trim() })), lineRects,
            paddingLeft: Number.parseFloat(style.paddingLeft),
            paddingRight: Number.parseFloat(style.paddingRight),
            lineHeight: Number.parseFloat(style.lineHeight),
            clampStyle: style.webkitLineClamp, textOverflow: style.textOverflow, overflow: style.overflow,
            fontSize: Number.parseFloat(style.fontSize),
            lineClamp: Number(label.dataset.lineClamp),
            maxWidth: Number(label.dataset.maxWidth),
            gap: rect(radio).left - rect(label).right,
            visibleGap: rect(circle).left - Math.max(...lineRects.map((r) => r.right)),
            centerOffset: (rect(radio).top + rect(radio).height / 2) - (rect(label).top + rect(label).height / 2),
            attributes: Object.fromEntries(["anchorTarget", "anchorPosition", "anchorGap", "anchorAlign", "anchorOffset"].map((key) => [key, radio.dataset[key]]))
        };
    }, { name, radioName });
};

const paintedBounds = function(png, box) {
    let left = Infinity;
    let right = -Infinity;
    let top = Infinity;
    let bottom = -Infinity;
    for (let y = Math.max(0, Math.floor(box.top)); y < Math.min(png.height, Math.ceil(box.bottom)); y += 1) {
        for (let x = Math.max(0, Math.floor(box.left)); x < Math.min(png.width, Math.ceil(box.right)); x += 1) {
            const index = (y * png.width + x) * 4;
            if (Math.min(png.data[index], png.data[index + 1], png.data[index + 2]) < 230) {
                left = Math.min(left, x);
                right = Math.max(right, x + 1);
                top = Math.min(top, y);
                bottom = Math.max(bottom, y + 1);
            }
        }
    }
    assert.ok(Number.isFinite(left), "The screenshot region must contain painted pixels");
    return { left, right, top, bottom };
};

const near = function(actual, expected, message) {
    assert.ok(Math.abs(actual - expected) <= 0.6, `${message}: expected ${expected}, rendered ${actual}`);
};

const checkTightLabel = function(measurement, context, checkVisibleGap = true) {
    const width = Math.max(...measurement.lineRects.map((line) => measurement.turned ? line.height : line.width));
    const naturalWidth = Math.ceil(width) + measurement.paddingLeft + measurement.paddingRight + 2;
    const expectedWidth = measurement.maxWidth > 0 ? Math.min(measurement.maxWidth, naturalWidth) : naturalWidth;
    near(measurement.turned ? measurement.wrapper.height : measurement.wrapper.width, expectedWidth,
        `${context}: wrapper must fit visible lines plus insets and clipping allowance`);
    near(measurement.gap, 10, `${context}: box attachment gap`);
    near(measurement.centerOffset, -1, `${context}: radio middle alignment and offset`);
    if (checkVisibleGap) {
        assert.ok(measurement.visibleGap >= 13 && measurement.visibleGap <= 16,
            `${context}: text-to-circle gap must contain only the authored gap and normal label inset, rendered ${measurement.visibleGap}`);
    }
};

const edit = async function(editor, selector, value) {
    const input = editor.locator(selector);
    await input.fill(String(value));
    await input.press("Enter");
    await input.blur();
    await settle(editor);
};

const choose = async function(editor, selector, value) {
    const select = editor.locator(selector);
    await select.focus();
    await select.selectOption(value);
    await select.blur();
    await settle(editor);
};

const checkAuthenticDialog = async function(page, editor, measurements) {
    const source = JSON.parse(fs.readFileSync(path.join(fixturePath, "dialog.json"), "utf8"));
    source.customJS = fs.readFileSync(path.join(fixturePath, "actions.js"), "utf8");
    await page.locator("#dialogcreator-browser-file-input").setInputFiles({
        name: "AddVariables.dc.zip", mimeType: "application/zip", buffer: makePackage(source)
    });
    await editor.waitForFunction(() => document.getElementById("dialogName").value === "AddVariables");
    await settle(editor);
    await editor.locator('.element-wrapper[data-nameid="label_bykeys"]').click();
    await edit(editor, "#elmaxWidth", 120);
    await edit(editor, "#ellineClamp", 2);
    await choose(editor, "#elvalign", "middle");
    await editor.locator('.element-wrapper[data-nameid="by_order"]').click();
    await choose(editor, "#element-anchor-target", "c8d90655-0701-42c5-a673-19b0a34738da");
    await choose(editor, "#element-anchor-position", "right");
    await edit(editor, "#element-anchor-gap", 10);
    await choose(editor, "#element-anchor-align", "middle");
    await edit(editor, "#element-anchor-offset", -1);
    const englishEditor = await measureLabel(editor);
    checkTightLabel(englishEditor, "English editor after actual property edits");
    measurements.push({ surface: "editor", locale: "en_US", ...englishEditor });

    await page.getByRole("button", { name: "File", exact: true }).click();
    await page.locator("#dialogcreator-browser-preview").click();
    const handle = await editor.locator("#dialogcreator-browser-panel iframe").elementHandle();
    const preview = await handle.contentFrame();
    await preview.locator(".preview-canvas").waitFor();
    const localeGeometry = new Map();
    for (const locale of ["en_US", "el_GR", "fr_FR", "de_DE", "el_GR", "en_US"]) {
        await preview.locator(".preview-language-hover-area").hover();
        await preview.locator(".preview-language-select").selectOption(locale);
        await page.mouse.move(1400, 1000);
        await settle(preview);
        const measurement = await measureLabel(preview);
        const record = { surface: "preview", locale, ...measurement };
        measurements.push(record);
        assert.deepEqual(measurement.lines.map((line) => line.value), expectedLines[locale], `${locale}: authored text and wrapping must remain intact`);
        assert.equal(measurement.value, expectedLines[locale].join(" "), `${locale}: all translated text must remain present`);
        assert.ok(measurement.wrapper.height <= expectedLines[locale].length * measurement.lineHeight + 1,
            `${locale}: no phantom clamped height`);
        const screenshot = await preview.locator(".preview-canvas").screenshot();
        const png = PNG.sync.read(screenshot);
        const canvas = await preview.locator(".preview-canvas").boundingBox();
        const localCanvas = await preview.locator(".preview-canvas").evaluate((node) => {
            const rect = node.getBoundingClientRect();
            return { left: rect.left, top: rect.top };
        });
        assert.ok(canvas.width === png.width && canvas.height === png.height,
            "Screenshot pixels must use the tested CSS pixel scale");
        const canvasBox = (box) => ({
            left: box.left - localCanvas.left, right: box.right - localCanvas.left,
            top: box.top - localCanvas.top, bottom: box.bottom - localCanvas.top
        });
        const textInk = paintedBounds(png, canvasBox(measurement.wrapper));
        const circleInk = paintedBounds(png, canvasBox(measurement.circle));
        measurement.painted = { textInk, circleInk, gap: circleInk.left - textInk.right };
        record.painted = measurement.painted;
        assert.ok(measurement.painted.gap >= 13 && measurement.painted.gap <= 17,
            `${locale}: painted text-to-circle gap must stay within the normal inset allowance, rendered ${measurement.painted.gap}`);
        for (const line of measurement.lineRects) {
            assert.ok(line.left >= measurement.host.left + measurement.paddingLeft - 0.1
                && line.right <= measurement.host.right - measurement.paddingRight + 0.1,
            `${locale}: every translated line must fit horizontally inside the visible host`);
            paintedBounds(png, canvasBox({
                ...line, top: Math.max(line.top, measurement.wrapper.top),
                bottom: Math.min(line.bottom, measurement.wrapper.bottom)
            }));
        }
        if (process.env.DIALOGCREATOR_WRAPPED_SCREENSHOTS) {
            fs.writeFileSync(`${process.env.DIALOGCREATOR_WRAPPED_SCREENSHOTS}-${locale}.png`, screenshot);
        }
        checkTightLabel(measurement, `Real AddVariables Preview ${locale}`);
        const followingLabel = await preview.locator('.element-wrapper[data-nameid="label_byorder"]').evaluate((node) => {
            const r = node.getBoundingClientRect();
            return { left: r.left, top: r.top, height: r.height };
        });
        near(followingLabel.left - measurement.radio.right, 7, `${locale}: the next label follows the moved radio`);
        near(followingLabel.top + followingLabel.height / 2 - measurement.radio.top - measurement.radio.height / 2,
            1, `${locale}: the next label retains its middle alignment and offset`);
        const geometry = { label: measurement.wrapper, radio: measurement.radio, followingLabel };
        if (localeGeometry.has(locale)) {
            assert.deepEqual(geometry, localeGeometry.get(locale), `${locale}: repeated locale switches must not drift`);
        }
        localeGeometry.set(locale, geometry);
        assert.equal(await preview.locator(".customjs-error").count(), 0, "Authentic actions must execute without an error overlay");
    }
    const mutations = await preview.evaluate(async () => {
        let changes = 0;
        const observer = new MutationObserver((records) => { changes += records.length; });
        document.querySelectorAll(".element-wrapper").forEach((node) => {
            observer.observe(node, { attributes: true, attributeFilter: ["style"] });
        });
        for (let frame = 0; frame < 8; frame += 1) {
            await new Promise(requestAnimationFrame);
        }
        observer.disconnect();
        return changes;
    });
    assert.equal(mutations, 0, "The real multilingual dependency chain must settle without idle layout mutations");
    await editor.getByRole("button", { name: "Close", exact: true }).click();
};

const checkLabelVariations = async function(page, url, measurements) {
    const cases = [];
    for (const rotate of [0, 90, 180, 270]) {
        for (const align of ["left", "center", "right"]) {
            cases.push({ value: "Με μεταβλητές κλειδιά", rotate, align, mode: "tight" });
        }
    }
    cases.push(
        { value: "Με μεταβλητές\nκλειδιά", rotate: 0, align: "left", mode: "tight" },
        { value: "This is a long translated label with several words that must remain clamped with an ellipsis after the second line", mode: "clamped" },
        { value: "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", mode: "clamped" },
        { value: "Με μεταβλητές κλειδιά", lineClamp: 1, mode: "single" },
        { value: "Με μεταβλητές κλειδιά", maxWidth: 0, mode: "unconstrained" }
    );
    const elements = [];
    cases.forEach((item, index) => {
        const root = `variation_root_${index}`;
        const label = `variation_label_${index}`;
        const radio = `variation_radio_${index}`;
        elements.push({
            id: root, nameid: root, type: "Radio", left: 30 + (index % 4) * 300,
            top: 70 + Math.floor(index / 4) * 180, size: 14, isVisible: true, isEnabled: true
        }, {
            id: label, nameid: label, type: "Label", left: 50, top: 60, maxWidth: item.maxWidth ?? 120,
            lineClamp: 2, value: item.value, align: item.align || "left", valign: ["top", "middle", "bottom"][index % 3],
            rotate: item.rotate || 0, fontSize: 12, isVisible: true, isEnabled: true,
            anchorTarget: root, anchorPosition: "right", anchorGap: 7, anchorAlign: "middle", anchorOffset: 1,
            ...(item.lineClamp ? { lineClamp: item.lineClamp } : {})
        }, {
            id: radio, nameid: radio, type: "Radio", left: 180, top: 60, size: 14,
            isVisible: true, isEnabled: true, anchorTarget: label, anchorPosition: "right",
            anchorGap: 10, anchorAlign: "middle", anchorOffset: -1
        });
    });
    elements.push({
        id: "icon_label", nameid: "icon_label", type: "Label", left: 30, top: 850,
        value: "", icon: "check", iconSize: 18, maxWidth: 120, lineClamp: 2,
        isVisible: true, isEnabled: true
    }, {
        id: "empty_label", nameid: "empty_label", type: "Label", left: 30, top: 910,
        value: "", maxWidth: 120, lineClamp: 2, isVisible: true, isEnabled: true
    });
    await page.goto(`${url}/pages/preview.html`);
    await page.waitForFunction(() => Boolean(window.dialogCreatorPreviewTransport));
    await page.evaluate((elements) => window.dialogCreatorPreviewTransport.emit("renderPreview", {
        properties: { name: "WrappedLabelVariations", width: 1250, height: 950, fontSize: 12, language: "en_US" },
        elements, customJS: ""
    }), elements);
    await settle(page);
    for (let index = 0; index < cases.length; index += 1) {
        const item = cases[index];
        const context = `Label variation ${index + 1} (${item.mode}, ${item.rotate || 0}°, ${item.align || "left"})`;
        const measurement = await measureLabel(page, `variation_label_${index}`, `variation_radio_${index}`);
        measurements.push({ surface: "variation", index, mode: item.mode, ...measurement });
        if (item.mode === "tight") {
            assert.deepEqual(measurement.lines.map((line) => line.value), expectedLines.el_GR,
                `${context}: line breaks and every Greek character survive sizing and rotation`);
            checkTightLabel(measurement, context, item.rotate === 0 && item.align === "left");
            const height = measurement.turned ? measurement.wrapper.width : measurement.wrapper.height;
            near(height, 29, `${context}: two-line box height`);
        } else if (item.mode === "unconstrained") {
            assert.deepEqual(measurement.lines.map((line) => line.value), [item.value]);
            checkTightLabel(measurement, context);
            near(measurement.wrapper.height, 15, `${context}: unconstrained text keeps a single natural line`);
        } else {
            near(measurement.wrapper.width, 120, `${context}: ellipsis retains the width cap`);
            if (item.mode === "clamped") {
                assert.ok(measurement.lines.length > 2, `${context}: fixture must overflow two lines`);
                near(measurement.wrapper.height, 29, `${context}: overflow is clamped to two visible lines`);
                assert.equal(measurement.clampStyle, "2", `${context}: the native ellipsis clamp stays active`);
            } else {
                assert.ok(measurement.wrapper.height <= measurement.lineHeight + 1,
                    `${context}: single-line height remains bounded`);
                assert.equal(measurement.textOverflow, "ellipsis", `${context}: the native single-line ellipsis stays active`);
            }
            assert.equal(measurement.overflow, "hidden", `${context}: overflowing glyphs remain clipped`);
        }
        assert.equal(measurement.value, item.value, `${context}: source text stays intact`);
    }
    const icon = await page.locator('.element-wrapper[data-nameid="icon_label"]').evaluate((node) => ({
        width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height,
        glyphs: node.querySelectorAll(".smart-label-icon.codicon-check").length
    }));
    near(icon.width, 20, "Icon-only label keeps its intrinsic width");
    near(icon.height, 20, "Icon-only label keeps its intrinsic height");
    assert.equal(icon.glyphs, 1, "Icon-only label retains its actual glyph");
    const empty = await page.locator('.element-wrapper[data-nameid="empty_label"]').evaluate((node) => ({
        width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height, value: node.dataset.value
    }));
    near(empty.width, 6, "Empty label keeps its existing inset width");
    near(empty.height, 15, "Empty label keeps its existing single-line height");
    assert.equal(empty.value, "");
};

const main = async function() {
    const server = await startRenderedWebServer();
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
    const errors = [];
    const measurements = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("dialog", (dialog) => dialog.accept());
    try {
        await page.goto(server.url);
        await page.frameLocator("#dialogcreator-browser-frame").locator('[data-element-key="inputElement"]').waitFor();
        const editor = page.frames().find((frame) => frame.url().includes("/pages/editor.html"));
        await checkAuthenticDialog(page, editor, measurements);
        await checkLabelVariations(page, server.url, measurements);
        assert.deepEqual(errors, []);
        console.log("Rendered wrapped-label anchors passed: real AddVariables UI and multilingual Preview visible geometry.");
    } finally {
        if (process.env.DIALOGCREATOR_WRAPPED_RESULTS) {
            fs.writeFileSync(process.env.DIALOGCREATOR_WRAPPED_RESULTS, JSON.stringify({ errors, measurements }, null, 2));
        }
        await browser.close();
        await server.close();
    }
};

if (require.main === module) {
    main().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}

module.exports = { measureLabel, checkTightLabel, paintedBounds };
