"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildSync } = require("esbuild");
const { chromium } = require("playwright");
const { startRenderedWebServer } = require("./rendered-web-server");

const shapes = {
    Button: { width: 90, height: 26, label: "Button", lineClamp: 1 },
    Input: { width: 100, height: 30, value: "Input" },
    Select: { width: 100, value: "One,Two" },
    Checkbox: { size: 18, fill: true, isChecked: false },
    Radio: { size: 18, group: "individual_radio", isSelected: false },
    Counter: { minval: 1, startval: 2, maxval: 5, space: 4, updownsize: 8 },
    Slider: { width: 80, height: 3, direction: "horizontal", handlesize: 8, handleshape: "triangle", handlepos: 50 },
    Label: { value: "Caption", maxWidth: 85, lineClamp: 2, align: "left", valign: "top" },
    Separator: { width: 80, height: 2, direction: "horizontal" },
    Container: { width: 110, height: 60, selection: "single", itemType: "any" },
    Choice: { width: 110, height: 60, items: "One,Two", ordering: "no", orientation: "vertical", align: "left" }
};

const makeElement = function(id, type, properties = {}) {
    return {
        id, type, nameid: id, left: 50, top: 60,
        isEnabled: true, isVisible: true,
        ...shapes[type], ...properties
    };
};

const attachment = function(target, position = "right", gap = 10, align = "middle", offset = 0) {
    return { anchorTarget: target, anchorPosition: position, anchorGap: gap, anchorAlign: align, anchorOffset: offset };
};

const makeDialog = function(name, elements) {
    return {
        id: name,
        properties: { name, title: name, language: "en_US", runtimeProvider: "R", width: 720, height: 600, fontSize: 12 },
        syntax: {}, elements, customJS: ""
    };
};

const makeIndividualDialog = function() {
    const dialog = makeDialog("ElementAnchoringContract", [
        makeElement("tail_select", "Select", attachment("bridge_button", "below", 11, "middle", -2)),
        makeElement("bridge_button", "Button", attachment("bridge_label", "right", 9, "end", 1)),
        makeElement("bridge_label", "Label", { value: "Reference", ...attachment("hub", "right", 12) }),
        makeElement("hub", "Input", { left: 180, top: 180, width: 110, height: 42 }),
        ...Object.keys(shapes).map((type, index) => makeElement(`source_${type.toLowerCase()}`, type, {
            left: 45, top: 45 + index * 5,
            ...attachment("hub", "right", 8, "middle", -150 + index * 32)
        })),
        makeElement("legacy_absolute", "Separator", { left: 35, top: 35, width: 50 }),
        makeElement("change_branch", "Button", { left: 35, top: 520, width: 145, label: "Change branch text" })
    ]);
    dialog.i18n = { baseLocale: "en_US", locales: {
        en_US: { "elements.bridge_label.value": "Reference" },
        de_DE: { "elements.bridge_label.value": "Bezugsbezeichnung" },
        fr_FR: { "elements.bridge_label.value": "Libellé de référence" }
    } };
    dialog.customJS = "onClick(change_branch, () => setValue(bridge_label, 'A longer caption changed through the public API'));";
    return dialog;
};

const near = function(actual, expected, message) {
    assert.ok(Math.abs(actual - expected) <= 0.6,
        `${message}: expected ${expected}, rendered ${actual}`);
};

const box = async function(element) {
    return element.evaluate((node) => {
        const rect = node.getBoundingClientRect();
        return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
    });
};

const elementById = function(frame, id) {
    return frame.locator(`.element-wrapper[id="${id}"]`);
};

const settle = async function(frame) {
    await frame.evaluate(async () => {
        await document.fonts.ready;
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
};

const checkRelation = async function(frame, source, context) {
    const [from, to] = await Promise.all([
        box(elementById(frame, source.id)), box(elementById(frame, source.anchorTarget))
    ]);
    assert.ok(from.width > 0 && from.height > 0, `${context}: ${source.type} must have rendered dimensions`);
    const fraction = { start: 0, middle: 0.5, end: 1 }[source.anchorAlign || "middle"];
    const gap = source.anchorGap ?? 10;
    const offset = source.anchorOffset ?? 0;
    const side = source.anchorPosition || "left";
    let left;
    let top;
    if (side === "left" || side === "right") {
        left = side === "left" ? to.left - gap - from.width : to.left + to.width + gap;
        top = to.top + (to.height - from.height) * fraction + offset;
    } else {
        left = to.left + (to.width - from.width) * fraction + offset;
        top = side === "above" ? to.top - gap - from.height : to.top + to.height + gap;
    }
    near(from.left, left, `${context} ${source.id} left`);
    near(from.top, top, `${context} ${source.id} top`);
};

const checkRelations = async function(frame, source, context) {
    await settle(frame);
    for (const element of source.elements.filter((element) => element.anchorTarget)) {
        await checkRelation(frame, element, context);
    }
};

let createPackage;
const packageBytes = function(source) {
    if (!createPackage) {
        const compiled = buildSync({
            stdin: { resolveDir: path.resolve(__dirname, ".."), contents: 'export { createDialogPackage } from "./src/core/dialog-package/dialogPackageFormat";' },
            bundle: true, platform: "node", format: "cjs", target: "es2022", write: false
        });
        const module = { exports: {} };
        new Function("module", "exports", compiled.outputFiles[0].text)(module, module.exports);
        createPackage = module.exports.createDialogPackage;
    }
    return Buffer.from(createPackage(JSON.stringify(source)));
};

const upload = async function(page, editor, source) {
    await page.locator("#dialogcreator-browser-file-input").setInputFiles({
        name: `${source.properties.name}.dc.zip`, mimeType: "application/zip", buffer: packageBytes(source)
    });
    await editor.waitForFunction((name) => document.getElementById("dialogName").value === name, source.properties.name);
    await settle(editor);
};

const fileCommand = async function(page, id) {
    await page.getByRole("button", { name: "File", exact: true }).click();
    await page.locator(`#dialogcreator-browser-${id}`).click();
};

const save = async function(page) {
    const promise = page.waitForEvent("download");
    await fileCommand(page, "save");
    const download = await promise;
    const bytes = fs.readFileSync(await download.path());
    const source = await page.evaluate(async ({ bytes, name }) => {
        const result = await window.dialogCreatorBrowserHost.files.readPackage(
            new File([new Uint8Array(bytes)], name, { type: "application/zip" })
        );
        if (!result.ok) throw new Error(result.reason);
        return JSON.parse(result.json);
    }, { bytes: Array.from(bytes), name: download.suggestedFilename() });
    return { source, bytes, fileName: download.suggestedFilename() };
};

const reopen = async function(page, editor, saved) {
    const old = await editor.locator("#dialog .element-wrapper").first().elementHandle();
    await page.locator("#dialogcreator-browser-file-input").setInputFiles({
        name: saved.fileName, mimeType: "application/zip", buffer: saved.bytes
    });
    await editor.waitForFunction((node) => !node.isConnected, old);
    await settle(editor);
};

const choose = async function(editor, target) {
    const select = editor.locator("#element-anchor-target");
    await select.focus();
    await select.selectOption(target);
    await select.blur();
    await settle(editor);
};

const edit = async function(editor, field, value) {
    await editor.locator(`#el${field}`).fill(String(value));
    await editor.locator(`#el${field}`).press("Enter");
    await editor.locator(`#el${field}`).blur();
    await settle(editor);
};

const checkIdle = async function(frame, context) {
    const changes = await frame.evaluate(async () => {
        let count = 0;
        const observer = new MutationObserver((records) => { count += records.length; });
        document.querySelectorAll('.element-wrapper').forEach((node) => {
            observer.observe(node, { attributes: true, attributeFilter: ["style"] });
        });
        for (let tick = 0; tick < 8; tick += 1) await new Promise(requestAnimationFrame);
        observer.disconnect();
        return count;
    });
    assert.equal(changes, 0, `${context}: layout must settle without idle style mutations`);
};

const checkIndividualControls = async function(page, editor) {
    const source = makeIndividualDialog();
    await upload(page, editor, source);
    await checkRelations(editor, source, "Editor initial/reversed chain");
    const root = elementById(editor, "hub");
    const tail = elementById(editor, "tail_select");
    if (process.env.DIALOGCREATOR_ELEMENT_SCREENSHOTS) {
        await tail.click();
        await editor.locator("#element-anchor-target").scrollIntoViewIfNeeded();
        await page.screenshot({ path: `${process.env.DIALOGCREATOR_ELEMENT_SCREENSHOTS}-chain.png` });
    }
    const legacyBefore = await box(elementById(editor, "legacy_absolute"));
    await root.click();
    for (const [field, value] of Object.entries({ left: 190, top: 195, width: 135, height: 70 })) {
        await edit(editor, field, value);
    }
    await checkRelations(editor, source, "Root move/resize updates every individual and chain member");
    const legacyAfter = await box(elementById(editor, "legacy_absolute"));
    near(legacyAfter.left, legacyBefore.left, "Legacy absolute left is untouched");
    near(legacyAfter.top, legacyBefore.top, "Legacy absolute top is untouched");

    await root.click();
    await tail.click({ modifiers: ["Shift"] });
    assert.equal(await editor.locator("#dialog .selectedElement").count(), 2);
    const before = await Promise.all([box(root), box(tail)]);
    const tailAnchor = await tail.evaluate((node) => [node.dataset.anchorGap, node.dataset.anchorOffset]);
    await editor.evaluate(() => document.activeElement?.blur());
    await page.keyboard.press("ArrowRight");
    await settle(editor);
    const after = await Promise.all([box(root), box(tail)]);
    near(after[0].left - before[0].left, 1, "Selected chain root nudge");
    near(after[1].left - before[1].left, 1, "Selected indirect descendant must move only once");
    assert.deepEqual(await tail.evaluate((node) => [node.dataset.anchorGap, node.dataset.anchorOffset]), tailAnchor);

    const dragStart = await root.boundingBox();
    const beforeDrag = await Promise.all([box(root), box(tail)]);
    await page.mouse.move(dragStart.x + 10, dragStart.y + 10);
    await page.mouse.down();
    await page.mouse.move(dragStart.x + 22, dragStart.y + 19, { steps: 4 });
    await page.mouse.up();
    await settle(editor);
    const afterDrag = await Promise.all([box(root), box(tail)]);
    const dx = afterDrag[0].left - beforeDrag[0].left;
    const dy = afterDrag[0].top - beforeDrag[0].top;
    assert.ok(dx > 8 && dy > 5, "Multi-selection drag must move the chain root");
    near(afterDrag[1].left - beforeDrag[1].left, dx, "Indirect descendant drag translates once horizontally");
    near(afterDrag[1].top - beforeDrag[1].top, dy, "Indirect descendant drag translates once vertically");
    assert.deepEqual(await tail.evaluate((node) => [node.dataset.anchorGap, node.dataset.anchorOffset]), tailAnchor);
    await checkRelations(editor, source, "After chain multi-selection movement");

    const saved = await save(page);
    for (const element of source.elements.filter((element) => element.anchorTarget)) {
        const persisted = saved.source.elements.find((candidate) => candidate.id === element.id);
        assert.equal(persisted.anchorTarget, element.anchorTarget);
        assert.equal(Number(persisted.left), element.left, `${element.id}: fallback left remains authored`);
        assert.equal(Number(persisted.top), element.top, `${element.id}: fallback top remains authored`);
    }
    assert.deepEqual(Object.keys(saved.source.elements.find((element) => element.id === "legacy_absolute"))
        .filter((key) => key.startsWith("anchor")), []);
    await reopen(page, editor, saved);
    await checkRelations(editor, source, "Reopened individual controls and reversed chain");

    await fileCommand(page, "preview");
    const handle = await editor.locator("#dialogcreator-browser-panel iframe").elementHandle();
    const preview = await handle.contentFrame();
    for (const locale of ["en_US", "de_DE", "fr_FR"]) {
        await preview.locator(".preview-language-hover-area").hover();
        await preview.locator(".preview-language-select").selectOption(locale);
        await checkRelations(preview, source, `Preview ${locale}`);
    }
    await elementById(preview, "change_branch").click();
    await checkRelations(preview, source, "Public setValue propagates through a Label target");
    await checkIdle(preview, "Valid individual controls and chain");
    await editor.getByRole("button", { name: "Close", exact: true }).click();
};

const cycleDialog = function(imported = false) {
    const elements = [
        makeElement("cycle_a", "Input", { left: 70, top: 70, width: 80 }),
        makeElement("cycle_b", "Button", { left: 230, top: 70, width: 80 }),
        makeElement("cycle_c", "Checkbox", { left: 400, top: 70 }),
        makeElement("valid_root", "Input", { left: 120, top: 260, width: 100 }),
        makeElement("valid_branch", "Label", { ...attachment("valid_root"), left: 280, top: 260 })
    ];
    if (imported) {
        Object.assign(elements[0], attachment("cycle_b"));
        Object.assign(elements[1], attachment("cycle_c"));
        Object.assign(elements[2], attachment("cycle_a"));
        elements.push(
            makeElement("cycle_dependent", "Select", { left: 70, top: 130, ...attachment("cycle_a") }),
            makeElement("missing_root", "Input", { left: 70, top: 190, ...attachment("missing_target") }),
            makeElement("missing_dependent", "Button", { left: 280, top: 190, ...attachment("missing_root") })
        );
    }
    return makeDialog(imported ? "ImportedCycleRepair" : "CycleOptions", elements);
};

const checkCycles = async function(page, editor) {
    let source = cycleDialog();
    await upload(page, editor, source);
    await elementById(editor, "cycle_a").click();
    assert.equal(await editor.locator('#element-anchor-target option[value="cycle_a"]').count(), 0);
    const labelTarget = editor.locator('#element-anchor-target option[value="valid_branch"]');
    assert.equal(await labelTarget.count(), 1, "Labels are valid attachment targets");
    assert.equal(await labelTarget.evaluate((option) => option.disabled), false);
    await choose(editor, "cycle_b");
    await elementById(editor, "cycle_b").click();
    assert.equal(await editor.locator('#element-anchor-target option[value="cycle_a"]').evaluate((option) => option.disabled), true,
        "A reverse dependency must be unavailable in the target picker");
    assert.equal(await elementById(editor, "cycle_b").getAttribute("data-anchor-target"), null);
    const beforeRejected = await box(elementById(editor, "cycle_b"));
    // A stale/custom host request can still reach the change handler despite the
    // disabled option. Reject it before applying any of the proposed metadata.
    await editor.locator("#element-anchor-target").evaluate((select) => {
        select.value = "cycle_a";
        select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await settle(editor);
    assert.equal(await elementById(editor, "cycle_b").getAttribute("data-anchor-target"), null);
    assert.deepEqual(await box(elementById(editor, "cycle_b")), beforeRejected,
        "Rejected reverse dependency must not change the element's position");
    assert.match(await editor.locator("#element-anchor-error").textContent(), /cycle|circular/i);
    await choose(editor, "cycle_c");
    await elementById(editor, "cycle_c").click();
    assert.equal(await editor.locator('#element-anchor-target option[value="cycle_a"]').evaluate((option) => option.disabled), true,
        "The picker must reject closing a three-element dependency cycle");
    await checkRelation(editor, source.elements.find((element) => element.id === "valid_branch"), "Independent valid branch");

    source = cycleDialog(true);
    await upload(page, editor, source);
    const warning = editor.locator(".element-anchor-warning:visible");
    assert.ok(await warning.count() > 0, "Imported cycles and missing dependencies must be visible");
    assert.match(await warning.textContent(), /cycle|circular/i);
    assert.match(await warning.textContent(), /missing_target|not found|missing/i);
    if (process.env.DIALOGCREATOR_ELEMENT_SCREENSHOTS) {
        await elementById(editor, "cycle_a").click();
        await page.screenshot({ path: `${process.env.DIALOGCREATOR_ELEMENT_SCREENSHOTS}-cycle.png` });
    }
    const invalid = ["cycle_a", "cycle_b", "cycle_c", "cycle_dependent", "missing_root", "missing_dependent"];
    const warningText = await warning.textContent();
    for (const id of invalid) {
        assert.ok(warningText.includes(id), `${id}: invalid dependency needs its own visible explanation`);
        assert.equal(await elementById(editor, id).evaluate((node) => node.classList.contains("element-anchor-invalid")), true);
    }
    const before = await Promise.all(invalid.map((id) => box(elementById(editor, id))));
    await checkIdle(editor, "Imported invalid graph");
    const after = await Promise.all(invalid.map((id) => box(elementById(editor, id))));
    assert.deepEqual(after, before, "Invalid graph nodes must not drift between layout passes");
    await checkRelation(editor, source.elements.find((element) => element.id === "valid_branch"), "Valid branch beside imported errors");
    const blockedDownload = page.waitForEvent("download", { timeout: 800 }).catch(() => null);
    await fileCommand(page, "save");
    assert.equal(await blockedDownload, null, "Saving a cyclic document must be blocked");
    assert.match(await page.locator("#dialogcreator-browser-status").textContent(), /cycle|circular/i);

    for (const id of ["cycle_a", "missing_root"]) {
        await elementById(editor, id).click();
        await choose(editor, "");
    }
    await settle(editor);
    assert.equal(await editor.locator(".element-anchor-warning:visible").count(), 0, "Detaching a broken link repairs its dependency branch");
    const saved = await save(page);
    for (const id of ["cycle_a", "missing_root"]) {
        assert.equal(saved.source.elements.find((element) => element.id === id).anchorTarget, undefined);
    }
};

const checkGroupedChain = async function(page, editor) {
    const root = makeElement("001", "Input", { nameid: "opaqueGroupRoot", left: 140, top: 140, width: 80 });
    const middle = makeElement("group_middle", "Button", { left: 250, top: 140, ...attachment(root.id) });
    const tail = makeElement("group_tail", "Checkbox", { left: 350, top: 180, ...attachment(middle.id, "below", 8, "end", 2) });
    const source = makeDialog("GroupedElementChain", [{
        id: "chain_group", type: "Group", nameid: "chainGroup", left: 110, top: 110,
        elementIds: [root.id, middle.id, tail.id]
    }, tail, middle, root]);
    await upload(page, editor, source);
    await elementById(editor, root.id).click({ button: "right" });
    await editor.locator('#element-context-menu [data-action="duplicate"]').click();
    await settle(editor);
    assert.equal(await editor.locator("#dialog .element-group").count(), 2);
    const check = async function() {
        const groups = editor.locator("#dialog .element-group");
        for (let index = 0; index < 2; index += 1) {
            const group = groups.nth(index);
            const a = group.locator('.element-wrapper[data-type="Input"]');
            const b = group.locator('.element-wrapper[data-type="Button"]');
            const c = group.locator('.element-wrapper[data-type="Checkbox"]');
            const aId = await a.getAttribute("id");
            const bId = await b.getAttribute("id");
            assert.equal(await b.getAttribute("data-anchor-target"), aId);
            assert.equal(await c.getAttribute("data-anchor-target"), bId);
            await checkRelation(editor, { ...middle, id: bId, anchorTarget: aId }, `Group ${index + 1} middle`);
            await checkRelation(editor, { ...tail, id: await c.getAttribute("id"), anchorTarget: bId }, `Group ${index + 1} tail`);
        }
    };
    await check();
    const saved = await save(page);
    await reopen(page, editor, saved);
    await check();
};

const main = async function() {
    const server = await startRenderedWebServer();
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, acceptDownloads: true });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("dialog", (dialog) => dialog.accept());
    try {
        if (process.argv.includes("--layout-only")) {
            await page.goto(`${server.url}/pages/preview.html`);
            await page.waitForFunction(() => Boolean(window.dialogCreatorPreviewTransport));
            const source = makeIndividualDialog();
            await page.evaluate((source) => window.dialogCreatorPreviewTransport.emit("renderPreview", source), source);
            await checkRelations(page, source, "Every individual type in real Preview");
        } else {
            await page.goto(server.url);
            await page.frameLocator("#dialogcreator-browser-frame").locator('[data-element-key="inputElement"]').waitFor();
            const editor = page.frames().find((frame) => frame.url().includes("/pages/editor.html"));
            assert.ok(editor);
            await checkIndividualControls(page, editor);
            await checkCycles(page, editor);
            await checkGroupedChain(page, editor);
        }
        assert.deepEqual(errors, []);
        console.log("Rendered element anchoring passed: individual controls, dependency chains, cycle repair and persistence.");
    } finally {
        await browser.close();
        await server.close();
    }
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
