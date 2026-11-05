"use strict";

const assert = require("assert");
const fs = require("fs");
const { chromium } = require("playwright");
const { startRenderedWebServer } = require("./rendered-web-server");

const positions = ["left", "right", "above", "below"];
const alignments = ["start", "middle", "end"];
const tolerance = 0.6;

const assertNear = function(actual, expected, context) {
    assert.ok(
        Math.abs(actual - expected) <= tolerance,
        `${context}: expected ${expected}, rendered ${actual}`
    );
};

const settleLayout = async function(frame) {
    await frame.evaluate(async () => {
        await document.fonts.ready;
        await new Promise((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(resolve));
        });
    });
};

const editInput = async function(frame, selector, value) {
    const input = frame.locator(selector);
    await input.fill(String(value));
    await input.press("Enter");
    await input.blur();
    await settleLayout(frame);
};

const chooseOption = async function(frame, selector, value) {
    const select = frame.locator(selector);
    await select.focus();
    await select.selectOption(value);
    await select.blur();
    await settleLayout(frame);
};

const readElementBox = async function(element) {
    return element.evaluate((node) => {
        const rect = node.getBoundingClientRect();
        return {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
        };
    });
};

const readPaintedLabelText = async function(label) {
    return label.evaluate((node) => {
        const host = node.firstElementChild;
        const text = host.querySelector('.smart-label-text');
        const clip = host.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(text);
        const lines = Array.from(range.getClientRects()).map((rect) => {
            const left = Math.max(rect.left, clip.left);
            const top = Math.max(rect.top, clip.top);
            const right = Math.min(rect.right, clip.right);
            const bottom = Math.min(rect.bottom, clip.bottom);
            return { left, top, width: Math.max(0, right - left), height: Math.max(0, bottom - top) };
        }).filter((rect) => rect.width > 0 && rect.height > 0);
        return {
            host: { left: clip.left, top: clip.top, width: clip.width, height: clip.height },
            lines
        };
    });
};

const checkAnchorBoxes = function(labelBox, targetBox, spec, context) {
    const fraction = { start: 0, middle: 0.5, end: 1 }[spec.align];
    let left;
    let top;

    if (spec.position === "left" || spec.position === "right") {
        left = spec.position === "left"
            ? targetBox.left - spec.gap - labelBox.width
            : targetBox.left + targetBox.width + spec.gap;
        top = targetBox.top
            + (targetBox.height - labelBox.height) * fraction
            + spec.offset;
    } else {
        left = targetBox.left
            + (targetBox.width - labelBox.width) * fraction
            + spec.offset;
        top = spec.position === "above"
            ? targetBox.top - spec.gap - labelBox.height
            : targetBox.top + targetBox.height + spec.gap;
    }

    assertNear(labelBox.left, left, `${context}: left`);
    assertNear(labelBox.top, top, `${context}: top`);
    return labelBox;
};

const checkAttachedPosition = async function(label, target, spec, context) {
    const [labelBox, targetBox] = await Promise.all([
        readElementBox(label),
        readElementBox(target)
    ]);
    return checkAnchorBoxes(labelBox, targetBox, spec, context);
};

const clickFileCommand = async function(page, selector) {
    await page.getByRole("button", { name: "File", exact: true }).click();
    await page.locator(selector).click();
};

const savePackage = async function(page) {
    const downloading = page.waitForEvent("download");
    await clickFileCommand(page, "#dialogcreator-browser-save");
    const download = await downloading;
    const filePath = await download.path();
    const bytes = Array.from(fs.readFileSync(filePath));
    const source = await page.evaluate(async ({ bytes, name }) => {
        const file = new File([new Uint8Array(bytes)], name, {
            type: "application/zip"
        });
        const result = await window.dialogCreatorBrowserHost.files.readPackage(file);
        if (!result.ok) {
            throw new Error(result.reason);
        }
        return JSON.parse(result.json);
    }, { bytes, name: download.suggestedFilename() });

    return { source, bytes, fileName: download.suggestedFilename() };
};

const uploadDialog = async function(page, source) {
    const bytes = await page.evaluate((source) => {
        const result = window.dialogCreatorBrowserHost.files.createPackage(
            JSON.stringify(source)
        );
        if (!result.ok) {
            throw new Error(result.reason);
        }
        return Array.from(result.bytes);
    }, source);
    await page.locator("#dialogcreator-browser-file-input").setInputFiles({
        name: "LabelAnchoring.dc.zip",
        mimeType: "application/zip",
        buffer: Buffer.from(bytes)
    });
};

const checkEditor = async function(page, editor) {
    await editor.locator('[data-element-key="inputElement"]').click();
    const target = editor.locator('#dialog .element-wrapper[data-type="Input"]');
    await target.click();
    for (const [property, value] of Object.entries({
        left: 260,
        top: 150,
        width: 160,
        height: 64
    })) {
        await editInput(editor, `#el${property}`, value);
    }
    const targetId = await target.getAttribute("id");

    await editor.locator('[data-element-key="labelElement"]').click();
    const label = editor.locator('#dialog .element-wrapper[data-type="Label"]');
    await label.click();
    await editInput(editor, "#elvalue", "Attached label");
    const labelId = await label.getAttribute("id");
    const fallback = await label.evaluate((node) => ({
        left: Number(node.dataset.left),
        top: Number(node.dataset.top)
    }));
    assert.strictEqual(
        await editor.locator(`#element-anchor-target option[value="${labelId}"]`).count(),
        0,
        "A label must not be offered as its own target"
    );
    await chooseOption(editor, "#element-anchor-target", targetId);

    assert.strictEqual(await editor.locator("#elleft").evaluate((input) => input.readOnly), true);
    assert.strictEqual(await editor.locator("#eltop").evaluate((input) => input.readOnly), true);

    for (const position of positions) {
        await chooseOption(editor, "#element-anchor-position", position);
        for (const align of alignments) {
            await chooseOption(editor, "#element-anchor-align", align);
            await checkAttachedPosition(label, target, {
                position,
                align,
                gap: 10,
                offset: 0
            }, `Editor ${position}/${align}`);
        }
    }

    const spec = { position: "right", align: "middle", gap: -6, offset: -9 };
    await chooseOption(editor, "#element-anchor-position", spec.position);
    await chooseOption(editor, "#element-anchor-align", spec.align);
    await editInput(editor, "#element-anchor-gap", spec.gap);
    await editInput(editor, "#element-anchor-offset", spec.offset);
    await checkAttachedPosition(label, target, spec, "Signed gap and cross-axis offset");

    await target.click();
    await editInput(editor, "#elleft", 235);
    await editInput(editor, "#eltop", 175);
    await editInput(editor, "#elwidth", 180);
    await editInput(editor, "#elheight", 76);
    await checkAttachedPosition(label, target, spec, "Moving and resizing the target");

    await editInput(editor, "#elnameid", "renamedTarget");
    await label.click();
    assert.strictEqual(
        await editor.locator("#element-anchor-target").inputValue(),
        targetId,
        "Renaming the target should retain its stable attachment ID"
    );
    await editInput(editor, "#elmaxWidth", 100);
    await editInput(editor, "#ellineClamp", 2);
    await editInput(editor, "#elvalue", "A longer attached label that wraps across lines");
    await editInput(editor, "#dialogFontSize", 15);
    await checkAttachedPosition(label, target, spec, "Changing label text, font, and line limit");
    const selection = await label.evaluate((node) => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        const cover = node.querySelector('.elementcover').getBoundingClientRect();
        return {
            selected: node.classList.contains('selectedElement'),
            outline: [style.outlineStyle, style.outlineWidth, style.outlineOffset],
            width: rect.width,
            height: rect.height,
            lineHeight: Number.parseFloat(getComputedStyle(node.firstElementChild).lineHeight),
            coverWidth: cover.width,
            coverHeight: cover.height
        };
    });
    assert.strictEqual(selection.selected, true, "Attached label retains its editor selection");
    assert.deepStrictEqual(selection.outline, ["dotted", "1px", "3px"]);
    assertNear(selection.coverWidth, selection.width, "Selection cover uses rendered label width");
    assertNear(selection.coverHeight, selection.height, "Selection cover uses rendered label height");
    assert.ok(
        selection.height <= 2 * selection.lineHeight + 1,
        "Attached two-line label must not reserve the unclamped text height"
    );
    if (process.env.DIALOGCREATOR_ANCHOR_SCREENSHOT) {
        await editor.locator("#element-anchor-target").scrollIntoViewIfNeeded();
        await page.screenshot({ path: process.env.DIALOGCREATOR_ANCHOR_SCREENSHOT });
    }

    const beforeDrag = await label.boundingBox();
    assert.ok(beforeDrag, "Attached label must have a rendered box for dragging");
    await page.mouse.move(beforeDrag.x + 10, beforeDrag.y + 8);
    await page.mouse.down();
    await page.mouse.move(beforeDrag.x + 33, beforeDrag.y - 3, { steps: 4 });
    await page.mouse.up();
    await settleLayout(editor);
    const afterDrag = await label.boundingBox();
    assert.ok(afterDrag, "Dragging must leave a visible attached label");
    const movedRight = afterDrag.x - beforeDrag.x;
    const movedUp = afterDrag.y - beforeDrag.y;
    assert.ok(Math.abs(movedRight - 23) <= 1.6, "Label should follow the horizontal pointer movement");
    assert.ok(Math.abs(movedUp + 11) <= 1.6, "Label should follow the vertical pointer movement");
    spec.gap += movedRight;
    spec.offset += movedUp;
    await checkAttachedPosition(label, target, spec, "Dragging updates attachment offsets");
    assert.strictEqual(
        await label.getAttribute("data-anchor-target"),
        targetId,
        "Dragging an attached label should keep its target"
    );

    const beforeNudge = await readElementBox(label);
    await editor.evaluate(() => document.activeElement?.blur());
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Shift+ArrowDown");
    await settleLayout(editor);
    const afterNudge = await readElementBox(label);
    assertNear(afterNudge.left - beforeNudge.left, 1, "ArrowRight nudges the attached label one pixel");
    assertNear(afterNudge.top - beforeNudge.top, 10, "Shift+ArrowDown nudges the attached label ten pixels");
    spec.gap += 1;
    spec.offset += 10;
    await checkAttachedPosition(label, target, spec, "Keyboard nudge updates attachment offsets");

    await label.click();
    await target.click({ modifiers: ["Shift"] });
    assert.strictEqual(
        await editor.locator("#dialog .selectedElement").count(),
        2,
        "Pair nudge must exercise a selection containing both caption and target"
    );
    const beforePair = await Promise.all([readElementBox(label), readElementBox(target)]);
    await editor.evaluate(() => document.activeElement?.blur());
    await page.keyboard.press("ArrowRight");
    await settleLayout(editor);
    const afterPair = await Promise.all([readElementBox(label), readElementBox(target)]);
    assertNear(afterPair[0].left - beforePair[0].left, 1, "Selected caption moves once with its selected target");
    assertNear(afterPair[1].left - beforePair[1].left, 1, "Selected target moves one pixel");
    await checkAttachedPosition(label, target, spec, "Moving the attached pair retains its gap");

    const saved = await savePackage(page);
    const savedLabel = saved.source.elements.find((element) => element.id === labelId);
    assert.strictEqual(savedLabel.anchorTarget, targetId);
    assert.strictEqual(savedLabel.anchorPosition, spec.position);
    assert.strictEqual(savedLabel.anchorAlign, spec.align);
    assertNear(Number(savedLabel.anchorGap), spec.gap, "Saved attachment gap");
    assertNear(Number(savedLabel.anchorOffset), spec.offset, "Saved cross-axis offset");
    assertNear(Number(savedLabel.left), fallback.left, "Package retains authored fallback left");
    assertNear(Number(savedLabel.top), fallback.top, "Package retains authored fallback top");
    const oldLabel = await label.elementHandle();
    await page.locator("#dialogcreator-browser-file-input").setInputFiles({
        name: saved.fileName,
        mimeType: "application/zip",
        buffer: Buffer.from(saved.bytes)
    });
    await editor.waitForFunction((node) => !node.isConnected, oldLabel);
    await label.waitFor();
    await settleLayout(editor);
    await checkAttachedPosition(label, target, spec, "Attachment survives save and reopen");

    await label.click();
    await editInput(editor, "#element-anchor-gap", 120);
    await chooseOption(editor, "#elvalign", "middle");
    const attachedBox = await readElementBox(label);
    const attachedText = await readPaintedLabelText(label);
    const canvasBox = await label.evaluate((node) => {
        const rect = node.parentElement.getBoundingClientRect();
        return { left: rect.left, width: rect.width };
    });
    assert.ok(attachedBox.left + attachedBox.width > canvasBox.left + canvasBox.width,
        "Detach fixture must place the attached label outside the canvas");
    await chooseOption(editor, "#element-anchor-target", "");
    const detachedBox = await readElementBox(label);
    const detachedText = await readPaintedLabelText(label);
    assertNear(detachedBox.left, attachedBox.left, "Detach keeps visible left position");
    assertNear(detachedBox.top, attachedBox.top, "Detach keeps visible top position");
    assertNear(detachedBox.width, attachedBox.width, "Detach preserves clamped label width");
    assertNear(detachedBox.height, attachedBox.height, "Detach preserves clamped label height");
    assert.ok(attachedText.lines.length > 0, "Detach fixture must contain painted text");
    assert.strictEqual(detachedText.lines.length, attachedText.lines.length);
    for (const key of ["left", "top", "width", "height"]) {
        assertNear(detachedText.host[key], attachedText.host[key], `Detach preserves text host ${key}`);
        for (let line = 0; line < attachedText.lines.length; line += 1) {
            assertNear(detachedText.lines[line][key], attachedText.lines[line][key],
                `Detach preserves painted line ${line + 1} ${key}`);
        }
    }
    assert.strictEqual(await editor.locator("#elleft").evaluate((input) => input.readOnly), false);
    assert.strictEqual(await editor.locator("#eltop").evaluate((input) => input.readOnly), false);
    const detached = await savePackage(page);
    const detachedLabel = detached.source.elements.find((element) => element.id === labelId);
    assert.deepStrictEqual(
        Object.keys(detachedLabel).filter((key) => key.startsWith("anchor")),
        [],
        "Absolute labels should omit optional attachment fields from packages"
    );

    await chooseOption(editor, "#element-anchor-target", targetId);
    await chooseOption(editor, "#element-anchor-position", "right");
    await editInput(editor, "#element-anchor-gap", 10);
    await target.click();
    const beforeDelete = await readElementBox(label);
    await editor.locator("#removeElement").click();
    await label.click();
    await settleLayout(editor);
    const afterDelete = await readElementBox(label);
    assertNear(afterDelete.left, beforeDelete.left, "Missing target preserves last label left");
    assertNear(afterDelete.top, beforeDelete.top, "Missing target preserves last label top");
    assert.strictEqual(await label.getAttribute("data-anchor-target"), targetId);
    const error = editor.locator("#element-anchor-error");
    assert.strictEqual(await error.isVisible(), true, "Missing target must have a visible error");
    assert.match(await error.textContent(), /missing|not found|available|target/i);
};

const makePreviewDialog = function() {
    const targetId = "anchoring-target";
    const elements = [{
        id: targetId,
        type: "Input",
        nameid: "attach_target",
        left: 290,
        top: 180,
        width: 160,
        height: 70,
        value: "Target",
        isEnabled: true,
        isVisible: true
    }];
    const locales = { en_US: {}, de_DE: {}, fr_FR: {} };
    const translations = {
        en_US: "New dataset",
        de_DE: "Neuer Datensatz",
        fr_FR: "Nouveau jeu de données"
    };

    for (const position of positions) {
        for (const align of alignments) {
            const id = `attached_${position}_${align}`;
            elements.push({
                id,
                type: "Label",
                nameid: id,
                left: 40,
                top: 35,
                value: translations.en_US,
                maxWidth: 100,
                lineClamp: 2,
                fontSize: 12,
                align: "left",
                valign: "top",
                anchorTarget: targetId,
                anchorPosition: position,
                anchorGap: 10,
                anchorAlign: align,
                anchorOffset: -4,
                isEnabled: true,
                isVisible: true
            });
            for (const [locale, text] of Object.entries(translations)) {
                locales[locale][`elements.${id}.value`] = text;
            }
        }
    }

    const intrinsicTargets = [
        {
            id: "intrinsic_checkbox",
            type: "Checkbox",
            size: 18,
            left: 160.1,
            top: 100.1,
            isChecked: false
        },
        {
            id: "intrinsic_radio",
            type: "Radio",
            size: 16,
            group: "intrinsic_group",
            left: 430.75,
            top: 100.25,
            isSelected: false
        },
        {
            id: "intrinsic_counter",
            type: "Counter",
            left: 170.5,
            top: 310.25,
            minval: 1,
            startval: 3,
            maxval: 10,
            space: 4,
            updownsize: 8
        },
        {
            id: "intrinsic_select",
            type: "Select",
            left: 440.5,
            top: 310.5,
            width: 140,
            value: "One,Two"
        }
    ];
    for (const target of intrinsicTargets) {
        elements.push({ ...target, nameid: target.id, isEnabled: true, isVisible: true });
        for (const position of positions) {
            const id = `${target.id}_${position}`;
            elements.push({
                id,
                type: "Label",
                nameid: id,
                left: 35,
                top: 30,
                value: "Caption",
                maxWidth: 100,
                lineClamp: 1,
                anchorTarget: target.id,
                anchorPosition: position,
                anchorGap: 10,
                anchorAlign: "middle",
                anchorOffset: -0.75,
                isEnabled: true,
                isVisible: true
            });
        }
    }
    elements.push({
        id: "fractional_label",
        type: "Label",
        nameid: "fractional_label",
        left: 35,
        top: 30,
        value: "Fractional",
        maxWidth: 100,
        lineClamp: 1,
        anchorTarget: "intrinsic_checkbox",
        anchorPosition: "right",
        anchorGap: 0.2,
        anchorAlign: "middle",
        anchorOffset: 0.1,
        isEnabled: true,
        isVisible: true
    });
    elements.push({
        id: "initially_hidden_radio",
        type: "Radio",
        nameid: "initially_hidden_radio",
        group: "anchored_hidden_radio_group",
        left: 640.25,
        top: 220.5,
        size: 18,
        isSelected: true,
        isEnabled: true,
        isVisible: false
    }, {
        id: "visible_radio_peer",
        type: "Radio",
        nameid: "visible_radio_peer",
        group: "anchored_hidden_radio_group",
        left: 640.25,
        top: 260.5,
        size: 18,
        isSelected: false,
        isEnabled: true,
        isVisible: true
    }, {
        id: "initially_hidden_radio_label",
        type: "Label",
        nameid: "initially_hidden_radio_label",
        left: 35,
        top: 30,
        value: "Hidden selected radio",
        maxWidth: 130,
        lineClamp: 1,
        anchorTarget: "initially_hidden_radio",
        anchorPosition: "left",
        anchorGap: 10,
        anchorAlign: "middle",
        anchorOffset: 0,
        isEnabled: true,
        isVisible: true
    }, {
        id: "radio_checked_state",
        type: "Label",
        nameid: "radio_checked_state",
        left: 35,
        top: 465,
        value: "pending",
        maxWidth: 150,
        lineClamp: 1,
        isEnabled: true,
        isVisible: true
    });
    elements.push({
        id: "initially_hidden_target",
        type: "Checkbox",
        nameid: "initially_hidden_target",
        left: 525.25,
        top: 220.5,
        size: 18,
        isEnabled: true,
        isVisible: false
    }, {
        id: "initially_hidden_label",
        type: "Label",
        nameid: "initially_hidden_label",
        left: 35,
        top: 30,
        value: "Initially hidden target",
        maxWidth: 150,
        lineClamp: 1,
        anchorTarget: "initially_hidden_target",
        anchorPosition: "right",
        anchorGap: 10,
        anchorAlign: "middle",
        anchorOffset: 0,
        isEnabled: true,
        isVisible: true
    });

    elements.push({
        id: "absolute-label",
        type: "Label",
        nameid: "legacy_absolute",
        left: 35,
        top: 430,
        value: "Absolute legacy label",
        maxWidth: 250,
        lineClamp: 1,
        align: "left",
        valign: "top",
        isEnabled: true,
        isVisible: true
    });
    elements.push({
        id: "legacy-long-absolute",
        type: "Label",
        nameid: "legacy_long_absolute",
        left: 35,
        top: 350,
        value: "Legacy label containing enough words to wrap across at least five complete lines",
        maxWidth: 75,
        lineClamp: 2,
        align: "left",
        valign: "middle",
        isEnabled: true,
        isVisible: true
    });
    elements.push({
        id: "hidden_attached_label",
        type: "Label",
        nameid: "hidden_attached_label",
        left: 35,
        top: 30,
        value: "Hidden attached caption",
        maxWidth: 100,
        lineClamp: 2,
        anchorTarget: targetId,
        anchorPosition: "right",
        anchorGap: 10,
        anchorAlign: "middle",
        anchorOffset: 0,
        isEnabled: true,
        isVisible: false
    });
    for (const [name, text, left] of [
        ["change_value", "Change label", 280],
        ["toggle_target", "Toggle target", 420],
        ["show_initial_target", "Show initial target", 560]
    ]) {
        elements.push({
            id: name,
            type: "Button",
            nameid: name,
            label: text,
            left,
            top: 410,
            width: 120,
            height: 28,
            lineClamp: 1,
            isEnabled: true,
            isVisible: true
        });
    }
    for (const [name, text, left] of [
        ["change_hidden_value", "Change hidden", 280],
        ["toggle_hidden_label", "Toggle hidden label", 460]
    ]) {
        elements.push({
            id: name,
            type: "Button",
            nameid: name,
            label: text,
            left,
            top: 455,
            width: 160,
            height: 28,
            lineClamp: 1,
            isEnabled: true,
            isVisible: true
        });
    }

    return {
        id: "label-anchoring-contract",
        properties: {
            name: "LabelAnchoringContract",
            title: "Label attachment",
            width: 720,
            height: 500,
            fontSize: 12,
            language: "en_US",
            runtimeProvider: "R"
        },
        syntax: {},
        elements,
        i18n: { baseLocale: "en_US", locales },
        customJS: [
            "setValue(radio_checked_state, String(isChecked(initially_hidden_radio)));",
            "onClick(change_value, () => {",
            "    setValue(attached_right_middle, 'A longer value changed through the public API');",
            "});",
            "onClick(toggle_target, () => show(attach_target, isHidden(attach_target)));",
            "onClick(change_hidden_value, () => setValue(hidden_attached_label, 'A longer caption changed while hidden'));",
            "onClick(toggle_hidden_label, () => show(hidden_attached_label, isHidden(hidden_attached_label)));",
            "onClick(show_initial_target, () => {",
            "    show(initially_hidden_target);",
            "    show(initially_hidden_radio);",
            "    setValue(radio_checked_state, String(isChecked(initially_hidden_radio)));",
            "});"
        ].join("\n")
    };
};

const checkPreview = async function(page, editor) {
    const source = makePreviewDialog();
    await uploadDialog(page, source);
    await editor.waitForFunction(() => {
        return document.getElementById("dialogName").value === "LabelAnchoringContract";
    });
    await clickFileCommand(page, "#dialogcreator-browser-preview");
    const panel = await editor.locator("#dialogcreator-browser-panel iframe").elementHandle();
    const preview = await panel.contentFrame();
    assert.ok(preview, "Preview must use its shared rendered frame");
    await preview.locator(".preview-canvas").waitFor();
    await settleLayout(preview);
    const target = preview.locator('.element-wrapper[data-nameid="attach_target"]');
    const hiddenCaption = preview.locator('.element-wrapper[data-nameid="hidden_attached_label"]');
    const longAbsolute = preview.locator('.element-wrapper[data-nameid="legacy_long_absolute"]');
    const longAbsoluteGeometry = await longAbsolute.evaluate((node) => {
        const host = node.firstElementChild;
        return {
            height: node.getBoundingClientRect().height,
            unclampedHeight: host.scrollHeight,
            lineHeight: Number.parseFloat(getComputedStyle(host).lineHeight)
        };
    });
    assert.ok(longAbsoluteGeometry.unclampedHeight >= 5 * longAbsoluteGeometry.lineHeight,
        "Absolute clamp fixture must contain at least five lines of natural text");
    assert.ok(longAbsoluteGeometry.height <= 2 * longAbsoluteGeometry.lineHeight + 1,
        "Legacy absolute labels also use their authored two-line clamp for box height");
    assert.strictEqual(await hiddenCaption.isVisible(), false,
        "An authored hidden attached label must remain hidden after layout");
    await preview.locator('.element-wrapper[data-nameid="change_hidden_value"]').click();
    await settleLayout(preview);
    assert.match(await hiddenCaption.textContent(), /changed while hidden/);
    assert.strictEqual(await hiddenCaption.isVisible(), false, "Public setValue must not reveal a hidden attached label");
    await preview.evaluate(() => document.fonts.load("bold 12px Inter"));
    await settleLayout(preview);
    assert.strictEqual(await hiddenCaption.isVisible(), false, "Font loading must not reveal a hidden attached label");
    await preview.locator('.element-wrapper[data-nameid="toggle_hidden_label"]').click();
    await settleLayout(preview);
    assert.strictEqual(await hiddenCaption.isVisible(), true);
    await checkAttachedPosition(hiddenCaption, target, {
        position: "right", align: "middle", gap: 10, offset: 0
    }, "Public show positions the previously hidden caption");
    await preview.locator('.element-wrapper[data-nameid="toggle_hidden_label"]').click();
    await preview.locator('.element-wrapper[data-nameid="change_hidden_value"]').click();
    await settleLayout(preview);
    assert.strictEqual(await hiddenCaption.isVisible(), false, "A caption hidden after showing stays hidden on value changes");

    for (const name of ["checkbox", "radio", "counter", "select"]) {
        const targetName = `intrinsic_${name}`;
        const intrinsic = preview.locator(`.element-wrapper[data-nameid="${targetName}"]`);
        const [wrapperBox, controlBox] = await Promise.all([
            readElementBox(intrinsic),
            readElementBox(intrinsic.locator(":scope > :first-child"))
        ]);
        assert.ok(controlBox.width > 0 && controlBox.height > 0,
            `${targetName}: actual control must paint on both axes`);
        assertNear(wrapperBox.width, controlBox.width, `${targetName}: wrapper uses painted control width`);
        assertNear(wrapperBox.height, controlBox.height, `${targetName}: wrapper uses painted control height`);
        for (const position of positions) {
            const label = preview.locator(
                `.element-wrapper[data-nameid="${targetName}_${position}"]`
            );
            checkAnchorBoxes(await readElementBox(label), controlBox, {
                position,
                align: "middle",
                gap: 10,
                offset: -0.75
            }, `Intrinsic ${name}/${position}`);
        }
    }

    const initialTarget = preview.locator('.element-wrapper[data-nameid="initially_hidden_target"]');
    const initialLabel = preview.locator('.element-wrapper[data-nameid="initially_hidden_label"]');
    assert.strictEqual(await initialTarget.isVisible(), false);
    const hiddenRadio = preview.locator('.element-wrapper[data-nameid="initially_hidden_radio"]');
    const visibleRadioPeer = preview.locator('.element-wrapper[data-nameid="visible_radio_peer"]');
    const radioStatus = preview.locator('.element-wrapper[data-nameid="radio_checked_state"]');
    assert.strictEqual(await hiddenRadio.isVisible(), false);
    assert.strictEqual(await hiddenRadio.locator('input[type="radio"]').isChecked(), true,
        "Measuring a hidden selected radio must not clear its native selection");
    assert.strictEqual(await visibleRadioPeer.locator('input[type="radio"]').isChecked(), false);
    assert.strictEqual((await radioStatus.textContent()).trim(), "true", "Public isChecked retains selected radio state");
    const initialCanvas = await readElementBox(preview.locator(".preview-canvas"));
    const initialLabelBox = await readElementBox(initialLabel);
    checkAnchorBoxes(initialLabelBox, {
        left: initialCanvas.left + 525.25,
        top: initialCanvas.top + 220.5,
        width: 18,
        height: 18
    }, { position: "right", align: "middle", gap: 10, offset: 0 },
    "Initially hidden intrinsic target retains authored geometry");
    await preview.locator('.element-wrapper[data-nameid="show_initial_target"]').click();
    await settleLayout(preview);
    assert.strictEqual(await initialTarget.isVisible(), true);
    assert.strictEqual(await hiddenRadio.isVisible(), true);
    assert.strictEqual(await hiddenRadio.locator('input[type="radio"]').isChecked(), true,
        "Showing the initially hidden radio preserves native selection");
    assert.strictEqual(await visibleRadioPeer.locator('input[type="radio"]').isChecked(), false);
    assert.strictEqual((await radioStatus.textContent()).trim(), "true");
    await checkAttachedPosition(
        preview.locator('.element-wrapper[data-nameid="initially_hidden_radio_label"]'),
        hiddenRadio,
        { position: "left", align: "middle", gap: 10, offset: 0 },
        "Showing a selected hidden radio retains its attachment"
    );
    await checkAttachedPosition(initialLabel, initialTarget, {
        position: "right", align: "middle", gap: 10, offset: 0
    }, "Showing an initially hidden target retains its label attachment");
    const shownLabelBox = await readElementBox(initialLabel);
    assertNear(shownLabelBox.left, initialLabelBox.left, "Initially hidden target has no horizontal jump on show");
    assertNear(shownLabelBox.top, initialLabelBox.top, "Initially hidden target has no vertical jump on show");

    const fractionalLabel = preview.locator('.element-wrapper[data-nameid="fractional_label"]');
    const fractionalTarget = preview.locator('.element-wrapper[data-nameid="intrinsic_checkbox"]');
    await checkAttachedPosition(fractionalLabel, fractionalTarget, {
        position: "right", align: "middle", gap: 0.2, offset: 0.1
    }, "Fractional attachment geometry");
    const idleChanges = await preview.evaluate(async () => {
        let changes = 0;
        const observer = new MutationObserver((records) => { changes += records.length; });
        document.querySelectorAll('.element-wrapper[data-type="Label"]').forEach((label) => {
            observer.observe(label, { attributes: true, attributeFilter: ['style'] });
        });
        for (let frame = 0; frame < 8; frame += 1) {
            await new Promise(requestAnimationFrame);
        }
        observer.disconnect();
        return changes;
    });
    assert.strictEqual(idleChanges, 0, "Fractional attachment must settle without idle style rewrites");

    for (const locale of ["en_US", "de_DE", "fr_FR"]) {
        await preview.locator(".preview-language-hover-area").hover();
        await preview.locator(".preview-language-select").selectOption(locale);
        await settleLayout(preview);
        assert.strictEqual(await hiddenCaption.isVisible(), false,
            `${locale}: rebuilding translated labels respects authored visibility`);

        for (const position of positions) {
            for (const align of alignments) {
                const label = preview.locator(
                    `.element-wrapper[data-nameid="attached_${position}_${align}"]`
                );
                await checkAttachedPosition(label, target, {
                    position,
                    align,
                    gap: 10,
                    offset: -4
                }, `Preview ${locale} ${position}/${align}`);
            }
        }

        const absolute = preview.locator('.element-wrapper[data-nameid="legacy_absolute"]');
        const absoluteBox = await readElementBox(absolute);
        const canvas = await readElementBox(preview.locator(".preview-canvas"));
        assertNear(absoluteBox.left - canvas.left, 35, `${locale}: legacy absolute left`);
        assertNear(absoluteBox.top - canvas.top, 430, `${locale}: legacy absolute top`);
    }

    const changed = preview.locator('.element-wrapper[data-nameid="attached_right_middle"]');
    const spec = { position: "right", align: "middle", gap: 10, offset: -4 };
    await preview.locator('.element-wrapper[data-nameid="change_value"]').click();
    await settleLayout(preview);
    assert.match(await changed.textContent(), /longer value changed/);
    await checkAttachedPosition(changed, target, spec, "Public setValue reflows the attached label");
    const beforeHide = await readElementBox(changed);
    await preview.locator('.element-wrapper[data-nameid="toggle_target"]').click();
    await settleLayout(preview);
    assert.strictEqual(await target.isVisible(), false, "Public API should hide the target");
    const whileHidden = await readElementBox(changed);
    assertNear(whileHidden.left, beforeHide.left, "Hidden target retains attachment left");
    assertNear(whileHidden.top, beforeHide.top, "Hidden target retains attachment top");
    assert.strictEqual(await changed.isVisible(), true, "Label visibility remains independent");
    assert.strictEqual(
        await preview.locator(".element-anchor-warning:visible").count(),
        0,
        "Hiding a valid target should not report a missing attachment"
    );
    await preview.locator('.element-wrapper[data-nameid="toggle_target"]').click();
    await settleLayout(preview);
    assert.strictEqual(await target.isVisible(), true, "Public API should show the target again");
    await checkAttachedPosition(changed, target, spec, "Public show restores the same attachment");
    await editor.getByRole("button", { name: "Close", exact: true }).click();
};

const checkGroupedAttachments = async function(page, editor) {
    const source = {
        id: "grouped-anchoring-contract",
        properties: {
            name: "GroupedAnchoringContract",
            title: "Grouped label attachment",
            width: 560,
            height: 400,
            fontSize: 12,
            language: "en_US",
            runtimeProvider: "R"
        },
        syntax: {},
        customJS: "",
        elements: [{
            id: "attached-group",
            type: "Group",
            nameid: "attachedGroup",
            left: 180,
            top: 110,
            width: 200,
            height: 100,
            elementIds: ["group-target", "group-caption"]
        }, {
            id: "group-target",
            type: "Input",
            nameid: "groupTarget",
            left: 220,
            top: 140,
            width: 90,
            height: 38,
            value: "Target",
            isEnabled: true,
            isVisible: true
        }, {
            id: "group-caption",
            type: "Label",
            nameid: "groupCaption",
            left: 220,
            top: 190,
            value: "Caption",
            maxWidth: 100,
            lineClamp: 1,
            anchorTarget: "group-target",
            anchorPosition: "right",
            anchorGap: 10,
            anchorAlign: "middle",
            anchorOffset: 1.5,
            isEnabled: true,
            isVisible: true
        }]
    };
    const spec = { position: "right", align: "middle", gap: 10, offset: 1.5 };
    await uploadDialog(page, source);
    await editor.waitForFunction(() => {
        return document.getElementById("dialogName").value === "GroupedAnchoringContract";
    });
    await settleLayout(editor);
    const original = editor.locator('.element-group[id="attached-group"]');
    await checkAttachedPosition(
        original.locator('.element-wrapper[data-type="Label"]'),
        original.locator('.element-wrapper[data-type="Input"]'),
        spec,
        "Authored group retains relative attachment"
    );
    await original.locator('.element-wrapper[data-type="Input"]').click({ button: "right" });
    await editor.locator('#element-context-menu [data-action="duplicate"]').click();
    await settleLayout(editor);
    const groups = editor.locator("#dialog .element-group");
    assert.strictEqual(await groups.count(), 2, "Context Duplicate creates another group");
    const duplicate = groups.filter({ hasNot: editor.locator('[id="group-target"]') });
    const duplicateId = await duplicate.getAttribute("id");
    const duplicatedTarget = duplicate.locator('.element-wrapper[data-type="Input"]');
    const duplicatedLabel = duplicate.locator('.element-wrapper[data-type="Label"]');
    const targetId = await duplicatedTarget.getAttribute("id");
    assert.notStrictEqual(targetId, "group-target", "Duplicated target receives its own stable ID");
    assert.strictEqual(
        await duplicatedLabel.getAttribute("data-anchor-target"),
        targetId,
        "Duplicating the group remaps the caption to the copied target"
    );
    await checkAttachedPosition(duplicatedLabel, duplicatedTarget, spec, "Duplicated group attachment");

    const saved = await savePackage(page);
    const copiedGroup = saved.source.elements.find((element) => element.id === duplicateId);
    assert.ok(copiedGroup.elementIds.includes(targetId));
    const oldGroup = await duplicate.elementHandle();
    await page.locator("#dialogcreator-browser-file-input").setInputFiles({
        name: saved.fileName,
        mimeType: "application/zip",
        buffer: Buffer.from(saved.bytes)
    });
    await editor.waitForFunction((node) => !node.isConnected, oldGroup);
    await settleLayout(editor);
    assert.strictEqual(await groups.count(), 2);
    for (let index = 0; index < 2; index += 1) {
        const group = groups.nth(index);
        const label = group.locator('.element-wrapper[data-type="Label"]');
        const target = group.locator('.element-wrapper[data-type="Input"]');
        assert.strictEqual(await label.getAttribute("data-anchor-target"), await target.getAttribute("id"));
        await checkAttachedPosition(label, target, spec, `Reopened group ${index + 1}`);
    }
};

const main = async function() {
    const server = await startRenderedWebServer();
    const browser = await chromium.launch();
    const page = await browser.newPage({
        acceptDownloads: true,
        viewport: { width: 1440, height: 1100 }
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("dialog", (dialog) => dialog.accept());

    try {
        await page.goto(server.url);
        await page.frameLocator("#dialogcreator-browser-frame")
            .locator('[data-element-key="labelElement"]').waitFor();
        const editor = page.frames().find((frame) => frame.url().includes("/pages/editor.html"));
        assert.ok(editor, "Shared editor must run inside the browser host");
        if (!process.argv.includes("--preview-only")) {
            await checkEditor(page, editor);
            await checkGroupedAttachments(page, editor);
        }
        await checkPreview(page, editor);
        assert.deepStrictEqual(errors, [], "Editor and Preview must have no uncaught errors");
        console.log("Rendered label anchoring passed: editor interactions, package persistence, and Preview geometry/API.");
    } finally {
        await browser.close();
        await server.close();
    }
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
