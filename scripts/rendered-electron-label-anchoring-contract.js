"use strict";

const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { _electron } = require("playwright");

const rootDir = path.resolve(__dirname, "..");
const tolerance = 0.75;

const fileHash = function(file) {
    return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
};

const taskProcessIds = function(parentPid) {
    if (process.platform === "win32") {
        return [parentPid];
    }

    const rows = execFileSync("ps", ["-axo", "pid=,ppid="], { encoding: "utf8" })
        .trim().split("\n").map((row) => row.trim().split(/\s+/).map(Number));
    const owned = [parentPid];
    for (let index = 0; index < owned.length; index += 1) {
        for (const [pid, parent] of rows) {
            if (parent === owned[index] && !owned.includes(pid)) {
                owned.push(pid);
            }
        }
    }
    return owned;
};

const processIsLive = function(pid) {
    try {
        process.kill(pid, 0);
        return true;
    } catch (error) {
        if (error.code === "ESRCH") {
            return false;
        }
        throw error;
    }
};

const closeTaskApplication = async function(app) {
    const child = app.process();
    if (child.exitCode !== null || child.signalCode !== null) {
        return;
    }

    const owned = taskProcessIds(child.pid);
    const exited = new Promise((resolve) => {
        if (child.exitCode !== null || child.signalCode !== null) {
            resolve();
        } else {
            child.once("exit", resolve);
        }
    });
    let forced = false;
    const watchdog = setTimeout(() => {
        forced = true;
        for (const pid of owned.slice().reverse()) {
            try {
                process.kill(pid, "SIGKILL");
            } catch (error) {
                if (error.code !== "ESRCH") {
                    console.error("Could not stop task-owned process " + pid + ": " + error);
                }
            }
        }
    }, 3000);

    // This private fixture is discarded; app.quit() would open an unsaved-file prompt.
    const exitRequest = app.evaluate(({ app }) => app.exit(0)).catch(() => undefined);
    let exitDeadline;
    try {
        await Promise.race([
            exited,
            new Promise((_resolve, reject) => {
                exitDeadline = setTimeout(() => {
                    reject(new Error("Task-owned Electron did not report process exit within five seconds."));
                }, 5000);
            })
        ]);
        await Promise.race([
            exitRequest,
            new Promise((resolve) => setTimeout(resolve, 1000))
        ]);
    } finally {
        clearTimeout(watchdog);
        clearTimeout(exitDeadline);
    }

    const deadline = Date.now() + 2000;
    let remaining = owned.filter(processIsLive);
    while (remaining.length && Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        remaining = owned.filter(processIsLive);
    }
    for (const pid of remaining) {
        try {
            process.kill(pid, "SIGKILL");
        } catch (error) {
            if (error.code !== "ESRCH") {
                throw error;
            }
        }
    }
    if (remaining.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert.deepStrictEqual(owned.filter(processIsLive), [], "Task-owned Electron processes must be gone");
    assert.strictEqual(forced, false, "Task-owned Electron should honor app.exit before the watchdog");
    console.log("Native task shutdown verified for PIDs " + owned.join(","));
};

const assertNear = function(actual, expected, message) {
    assert.ok(Math.abs(actual - expected) <= tolerance,
        `${message}: expected ${expected}, rendered ${actual}`);
};

const settleLayout = async function(page) {
    await page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Native renderer did not produce its next layout frames."));
            }, 5000);
            requestAnimationFrame(() => requestAnimationFrame(() => {
                clearTimeout(timeout);
                resolve();
            }));
        });
    });
};

const editInput = async function(page, selector, value) {
    const input = page.locator(selector);
    await input.fill(String(value));
    await input.press("Enter");
    await input.blur();
    await settleLayout(page);
};

const chooseOption = async function(page, selector, value) {
    const input = page.locator(selector);
    await input.focus();
    await input.selectOption(value);
    await input.blur();
    await settleLayout(page);
};

const readPropertiesLayout = async function(page) {
    return page.evaluate(() => {
        const outer = document.getElementById("properties");
        const scroller = document.getElementById("propertiesList");
        const bottom = document.getElementById("elisVisible");
        const outerRect = outer.getBoundingClientRect();
        const rect = scroller.getBoundingClientRect();
        const bottomRect = bottom.getBoundingClientRect();
        const valueRect = document.getElementById("elvalue").getBoundingClientRect();
        const style = getComputedStyle(scroller);
        return {
            viewportWidth: innerWidth,
            viewportHeight: innerHeight,
            outerWidth: outerRect.width,
            outerRight: outerRect.right,
            scrollerLeft: rect.left,
            scrollerRight: rect.right,
            scrollerTop: rect.top,
            scrollerBottom: rect.bottom,
            clientHeight: scroller.clientHeight,
            scrollHeight: scroller.scrollHeight,
            scrollTop: scroller.scrollTop,
            gutterWidth: scroller.offsetWidth - scroller.clientWidth,
            overflowY: style.overflowY,
            scrollbarGutter: style.scrollbarGutter,
            scrollbarWidth: getComputedStyle(scroller, "::-webkit-scrollbar").width,
            trackColor: getComputedStyle(scroller, "::-webkit-scrollbar-track").backgroundColor,
            thumbColor: getComputedStyle(scroller, "::-webkit-scrollbar-thumb").backgroundColor,
            attachWidth: document.getElementById("element-anchor-target").getBoundingClientRect().width,
            valueWidth: valueRect.width,
            valueRight: valueRect.right,
            bottomTop: bottomRect.top,
            bottomBottom: bottomRect.bottom,
            documentScrollTop: document.documentElement.scrollTop
        };
    });
};

const checkPropertiesOverflow = async function(editor, nativeWindow) {
    const initial = await readPropertiesLayout(editor);
    const contentWidth = await nativeWindow.evaluate((window) => window.getContentSize()[0]);
    assert.strictEqual(initial.viewportWidth, contentWidth,
        "Native editor viewport should match the window content width");
    assert.ok(initial.scrollHeight > initial.clientHeight, "Attached label properties should overflow at default height");
    assert.strictEqual(initial.overflowY, "auto");
    assert.strictEqual(initial.scrollbarGutter, "stable");
    assert.strictEqual(initial.scrollbarWidth, "14px");
    assertNear(initial.gutterWidth, 14, "Native properties gutter");
    assertNear(initial.attachWidth, 121, "Attachment control retains its existing width");
    assertNear(initial.valueWidth, 121, "Value control retains its existing width");
    assert.ok(initial.scrollerRight <= initial.outerRight - 10 + tolerance,
        "Scrollbar should stay inside the outer right padding");
    assert.ok(initial.valueRight <= initial.scrollerRight - initial.gutterWidth + tolerance,
        "Scrollbar must not cover the property controls");

    await editor.locator("#propertiesList").evaluate((node) => { node.scrollTop = 0; });
    await editor.mouse.move(initial.scrollerLeft + 35, initial.scrollerTop + initial.clientHeight / 2);
    await editor.mouse.wheel(0, 1800);
    await editor.waitForFunction(() => {
        const scroller = document.getElementById("propertiesList");
        return scroller.scrollTop >= scroller.scrollHeight - scroller.clientHeight - 2;
    }, undefined, { timeout: 5000 });
    const wheel = await readPropertiesLayout(editor);
    assert.ok(wheel.bottomTop >= wheel.scrollerTop && wheel.bottomBottom <= wheel.scrollerBottom + tolerance,
        "Wheel scrolling should expose the bottom property control");
    assert.strictEqual(wheel.documentScrollTop, 0, "The properties panel should scroll independently");

    const attachmentBeforeTab = await editor.locator('#dialog .element-wrapper[data-type="Label"]')
        .evaluate((node) => ({
            target: node.dataset.anchorTarget,
            position: node.dataset.anchorPosition || "left",
            gap: Number(node.dataset.anchorGap ?? 10),
            align: node.dataset.anchorAlign || "middle",
            offset: Number(node.dataset.anchorOffset ?? 0)
        }));
    await editor.locator("#elnameid").focus();
    await editor.locator("#propertiesList").evaluate((node) => { node.scrollTop = 0; });
    let reachedBottom = false;
    for (let step = 0; step < 40; step += 1) {
        await editor.keyboard.press("Tab");
        reachedBottom = await editor.evaluate(() => document.activeElement?.id === "elisVisible");
        if (reachedBottom) {
            break;
        }
    }
    assert.strictEqual(reachedBottom, true, "Tab should reach the bottom property control");
    const tab = await readPropertiesLayout(editor);
    assert.ok(tab.scrollTop > 0 && tab.bottomBottom <= tab.scrollerBottom + tolerance,
        "Keyboard focus should scroll the bottom property into view");
    const attachmentAfterTab = await editor.locator('#dialog .element-wrapper[data-type="Label"]')
        .evaluate((node) => ({
            target: node.dataset.anchorTarget,
            position: node.dataset.anchorPosition || "left",
            gap: Number(node.dataset.anchorGap ?? 10),
            align: node.dataset.anchorAlign || "middle",
            offset: Number(node.dataset.anchorOffset ?? 0)
        }));
    assert.deepStrictEqual(attachmentAfterTab, attachmentBeforeTab,
        "Tabbing through calculated readonly coordinates must not change the attachment");

    await editor.locator("#propertiesList").evaluate((node) => { node.scrollTop = 0; });
    const thumbHeight = Math.max(32, initial.clientHeight * initial.clientHeight / initial.scrollHeight);
    const scrollbarX = initial.scrollerRight - initial.gutterWidth / 2;
    await editor.mouse.move(scrollbarX, initial.scrollerTop + thumbHeight / 2);
    await editor.mouse.down();
    await editor.mouse.move(scrollbarX,
        initial.scrollerBottom - thumbHeight / 2, { steps: 8 });
    await editor.mouse.up();
    await editor.waitForFunction(() => document.getElementById("propertiesList").scrollTop > 0,
        undefined, { timeout: 5000 });
    const drag = await readPropertiesLayout(editor);
    assert.ok(drag.bottomBottom <= drag.scrollerBottom + tolerance,
        "Dragging the native scrollbar thumb should expose the bottom control");

    const chromeHeight = await nativeWindow.evaluate((window) => {
        return window.getBounds().height - window.getContentBounds().height;
    });
    await nativeWindow.evaluate((window, height) => {
        window.setSize(1064, height);
    }, initial.scrollHeight + chromeHeight + 40);
    await editor.waitForFunction(() => {
        const scroller = document.getElementById("propertiesList");
        return scroller.scrollHeight <= scroller.clientHeight;
    }, undefined, { timeout: 5000 });
    const fitted = await readPropertiesLayout(editor);
    assertNear(fitted.gutterWidth, 14, "Gutter stays reserved when all properties fit");
    assertNear(fitted.valueWidth, initial.valueWidth, "Controls keep their width when scrolling is unnecessary");

    await nativeWindow.evaluate((window) => window.setSize(1064, 680));
    await editor.waitForFunction(() => {
        const scroller = document.getElementById("propertiesList");
        return scroller.scrollHeight > scroller.clientHeight;
    }, undefined, { timeout: 5000 });
    const shrunk = await readPropertiesLayout(editor);
    assertNear(shrunk.valueWidth, initial.valueWidth, "Controls keep their width after shrinking again");
    assertNear(shrunk.gutterWidth, 14, "Gutter stays reserved after shrinking again");
    console.log("Native properties overflow observations: " + JSON.stringify({
        initial, wheel, tab, drag, fitted, shrunk
    }));
};

const checkPosition = async function(label, target, spec, message) {
    const [labelBox, targetBox] = await Promise.all([
        label.boundingBox(),
        target.boundingBox()
    ]);
    assert.ok(labelBox && targetBox, `${message}: label and target must be visible`);

    const fraction = { start: 0, middle: 0.5, end: 1 }[spec.align];
    let left;
    let top;
    if (spec.position === "left" || spec.position === "right") {
        left = spec.position === "left"
            ? targetBox.x - spec.gap - labelBox.width
            : targetBox.x + targetBox.width + spec.gap;
        top = targetBox.y + (targetBox.height - labelBox.height) * fraction + spec.offset;
    } else {
        left = targetBox.x + (targetBox.width - labelBox.width) * fraction + spec.offset;
        top = spec.position === "above"
            ? targetBox.y - spec.gap - labelBox.height
            : targetBox.y + targetBox.height + spec.gap;
    }

    assertNear(labelBox.x, left, `${message}: left`);
    assertNear(labelBox.y, top, `${message}: top`);
    return labelBox;
};

const readEditorDocument = async function(app) {
    const json = await app.evaluate(async ({ BrowserWindow }, bridgePath) => {
        const editor = BrowserWindow.getAllWindows().find((window) => {
            return !window.isDestroyed() && !window.webContents.isDestroyed() && window.webContents.getURL().includes("editor.html");
        });
        const load = process.getBuiltinModule("module").createRequire(bridgePath);
        const { requestEditorDialogJson } = load(bridgePath);
        return requestEditorDialogJson(editor);
    }, path.join(rootDir, "dist/shell-electron/document/electronEditorDocumentBridge.js"));
    return JSON.parse(json);
};

const checkGreekAddvariablesPreview = async function(app, editor, previousPreview) {
    const previousClosed = previousPreview.waitForEvent("close");
    const previousWindow = await app.browserWindow(previousPreview);
    await previousWindow.evaluate((window) => window.close());
    await previousClosed;

    const fixture = path.join(rootDir, "scripts/fixtures/addvariables-anchoring");
    const source = JSON.parse(fs.readFileSync(path.join(fixture, "dialog.json"), "utf8"));
    source.customJS = fs.readFileSync(path.join(fixture, "actions.js"), "utf8");
    await app.evaluate(({ BrowserWindow }, document) => {
        const editorWindow = BrowserWindow.getAllWindows().find((window) => {
            return !window.isDestroyed() && !window.webContents.isDestroyed() && window.webContents.getURL().includes("editor.html");
        });
        editorWindow.webContents.send("load-dialog-json", document);
    }, source);
    await editor.locator('#dialog .element-wrapper[data-nameid="label_bykeys"]').waitFor();
    await settleLayout(editor);

    const opening = app.waitForEvent("window", { timeout: 15000 });
    await app.evaluate(({ Menu }) => {
        const file = Menu.getApplicationMenu().items.find((item) => item.label === "File");
        file.submenu.items.find((item) => item.label === "Preview").click();
    });
    const preview = await opening;
    const caption = preview.locator('.element-wrapper[data-nameid="label_bykeys"]');
    const radio = preview.locator('.element-wrapper[data-nameid="by_order"]');
    await caption.waitFor();
    await preview.locator(".preview-language-hover-area").hover();
    await chooseOption(preview, ".preview-language-select", "el_GR");

    const readCaption = async function() {
        const text = await caption.evaluate((element) => {
            const host = element.firstElementChild;
            const span = host.querySelector(".smart-label-text");
            const range = document.createRange();
            range.selectNodeContents(span);
            const box = element.getBoundingClientRect();
            const hostBox = host.getBoundingClientRect();
            return {
                text: span.textContent,
                width: box.width,
                height: box.height,
                left: box.left,
                right: box.right,
                maxWidth: Number(element.dataset.maxWidth),
                lineClamp: Number(element.dataset.lineClamp),
                hostTop: hostBox.top,
                hostBottom: hostBox.bottom,
                clientHeight: host.clientHeight,
                scrollHeight: host.scrollHeight,
                lines: Array.from(range.getClientRects()).filter((rect) => rect.width > 0).map((rect) => ({
                    left: rect.left,
                    right: rect.right,
                    top: rect.top,
                    bottom: rect.bottom,
                    width: rect.width
                }))
            };
        });
        const radioBox = await radio.boundingBox();
        const widestLine = Math.max(...text.lines.map((line) => line.width));
        return {
            ...text,
            widestLine,
            expectedWidth: Math.min(text.maxWidth, Math.ceil(widestLine + 6)),
            wrapperGap: radioBox.x - text.right,
            visibleGap: radioBox.x - Math.max(...text.lines.map((line) => line.right))
        };
    };

    const greek = await readCaption();
    assert.strictEqual(greek.text, "Με μεταβλητές κλειδιά", "Authentic Greek caption must remain intact");
    assert.strictEqual(greek.lineClamp, 2);
    assert.strictEqual(greek.lines.length, 2, "Complete Greek caption should remain on two visible lines");
    assert.ok(greek.lines.every((line) => {
        return line.top >= greek.hostTop - 2 && line.bottom <= greek.hostBottom + 2;
    }), "Neither Greek line should be hidden by the clamp");
    assert.ok(greek.scrollHeight <= greek.clientHeight + 1, "Greek caption must not acquire hidden overflow");
    assertNear(greek.width, greek.expectedWidth, "Greek wrapper should fit its longest visible line plus existing insets");
    assert.ok(greek.width < greek.maxWidth - 15, "Greek fixture must shrink below its maximum width");
    assertNear(greek.wrapperGap, 10, "Native Addvariables wrapper gap");
    assert.ok(greek.visibleGap >= 10 && greek.visibleGap < 18,
        "Native Greek text-to-radio gap should be normal rather than roughly 40px");
    await checkPosition(radio, caption, {
        position: "right", gap: 10, align: "middle", offset: -1
    }, "Authentic native Addvariables Radio follows Greek Label");

    await chooseOption(preview, ".preview-language-select", "en_US");
    await chooseOption(preview, ".preview-language-select", "el_GR");
    const repeated = await readCaption();
    assert.strictEqual(repeated.text, greek.text);
    assert.strictEqual(repeated.lines.length, 2);
    assertNear(repeated.width, greek.width, "Greek fitting remains stable after changing locales");
    assertNear(repeated.visibleGap, greek.visibleGap, "Greek visible gap remains stable after changing locales");
    assert.strictEqual(await preview.locator(".customjs-error").count(), 0,
        "Authentic Addvariables actions should execute without a Preview error");
    console.log("Native authentic Greek Addvariables observation: " + JSON.stringify(greek));
};

const main = async function() {
    const database = path.join(rootDir, "src/database/DialogCreator.sqlite");
    const databaseBefore = fileHash(database);
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "dialogcreator-native-anchor-"));
    const privateDatabase = path.join(directory, "src/database/DialogCreator.sqlite");
    fs.mkdirSync(path.dirname(privateDatabase), { recursive: true });
    fs.copyFileSync(database, privateDatabase);

    let app;
    const errors = [];
    const observations = [];
    try {
        app = await _electron.launch({
            executablePath: require("electron"),
            args: [
                path.join(rootDir, "dist/main.js"),
                `--user-data-dir=${path.join(directory, "user-data")}`
            ],
            cwd: directory,
            env: { ...process.env, NODE_ENV: "test" },
            timeout: 30000
        });
        const child = app.process();
        assert.ok(child?.pid, "A task-owned Electron process is required");
        console.log("Native task Electron PID=" + child.pid);
        const privateProfile = await app.evaluate(({ app }) => app.getPath("userData"));
        assert.strictEqual(fs.realpathSync(privateProfile),
            fs.realpathSync(path.join(directory, "user-data")),
            "Native window state and profile must remain private");
        const catalogPath = await app.evaluate((_electron, modulePath) => {
            const load = process.getBuiltinModule("module").createRequire(modulePath);
            return load(modulePath).db.filename;
        }, path.join(rootDir, "dist/shell-electron/catalog/sqliteElementCatalog.js"));
        assert.strictEqual(fs.realpathSync(catalogPath), fs.realpathSync(privateDatabase),
            "The native check must use its private catalog copy");

        const editor = await app.firstWindow();
        const nativeWindow = await app.browserWindow(editor);
        const nativeBounds = await nativeWindow.evaluate((window) => {
            const bounds = window.getBounds();
            const minimum = window.getMinimumSize();
            return { bounds, minimum };
        });
        assert.strictEqual(nativeBounds.bounds.width, 1064, "Fresh native editor should open at 1064px wide");
        assert.strictEqual(nativeBounds.bounds.height, 680, "Fresh native editor should retain its default height");
        assert.strictEqual(nativeBounds.minimum[0], 1064, "Native minimum width should preserve property control space");
        console.log("Private native initial bounds: " + JSON.stringify(nativeBounds));
        editor.on("pageerror", (error) => errors.push(error.message));
        app.on("window", (page) => {
            page.on("pageerror", (error) => errors.push(error.message));
        });
        await editor.locator('[data-element-key="inputElement"]').waitFor();
        await editor.locator('[data-element-key="inputElement"]').click();
        const target = editor.locator('#dialog .element-wrapper[data-type="Input"]');
        await target.click();
        for (const [property, value] of Object.entries({
            left: 250, top: 160, width: 160, height: 64
        })) {
            await editInput(editor, `#el${property}`, value);
        }
        const targetId = await target.getAttribute("id");

        await editor.locator('[data-element-key="labelElement"]').click();
        const label = editor.locator('#dialog .element-wrapper[data-type="Label"]');
        await label.click();
        await editInput(editor, "#elvalue", "New dataset");
        await editInput(editor, "#elmaxWidth", 100);
        await editInput(editor, "#ellineClamp", 2);
        const labelId = await label.getAttribute("id");
        await chooseOption(editor, "#element-anchor-target", targetId);
        assert.strictEqual(await editor.locator("#elleft").evaluate((input) => input.readOnly), true);
        assert.strictEqual(await editor.locator("#eltop").evaluate((input) => input.readOnly), true);
        await checkPropertiesOverflow(editor, nativeWindow);

        const spec = { position: "left", gap: 10, align: "middle", offset: 0 };
        for (const position of ["left", "right", "above", "below"]) {
            spec.position = position;
            await chooseOption(editor, "#element-anchor-position", position);
            for (const align of ["start", "middle", "end"]) {
                spec.align = align;
                await chooseOption(editor, "#element-anchor-align", align);
                assert.strictEqual(await editor.locator("#element-anchor-position").inputValue(), position);
                assert.strictEqual(await editor.locator("#element-anchor-align").inputValue(), align);
                assert.strictEqual(await label.getAttribute("data-anchor-position"), position);
                assert.strictEqual(await label.getAttribute("data-anchor-align"), align);
                await checkPosition(label, target, spec, `Native editor ${position}/${align}`);
            }
        }

        spec.position = "right";
        spec.align = "middle";
        await chooseOption(editor, "#element-anchor-position", spec.position);
        await chooseOption(editor, "#element-anchor-align", spec.align);

        const gap = editor.locator("#element-anchor-gap");
        await gap.focus();
        await gap.fill("-3.5");
        await target.evaluate((node) => {
            node.style.width = "168px";
            node.dataset.width = "168";
        });
        await settleLayout(editor);
        assert.strictEqual(await gap.inputValue(), "-3.5",
            "A layout refresh must preserve the focused numeric draft");
        await gap.press("Enter");
        spec.gap = -3.5;
        await settleLayout(editor);
        await checkPosition(label, target, spec, "Native signed gap");

        await target.click();
        await editInput(editor, "#elleft", 280);
        await editInput(editor, "#eltop", 190);
        await checkPosition(label, target, spec, "Native target movement");
        await label.click();

        const beforeDrag = await label.boundingBox();
        await editor.mouse.move(beforeDrag.x + 8, beforeDrag.y + 7);
        await editor.mouse.down();
        await editor.mouse.move(beforeDrag.x + 32, beforeDrag.y - 3, { steps: 4 });
        await editor.mouse.up();
        await settleLayout(editor);
        const afterDrag = await label.boundingBox();
        const dx = afterDrag.x - beforeDrag.x;
        const dy = afterDrag.y - beforeDrag.y;
        assert.ok(Math.abs(dx - 24) <= 1.6, "Native label should follow horizontal pointer movement");
        assert.ok(Math.abs(dy + 10) <= 1.6, "Native label should follow vertical pointer movement");
        spec.gap += dx;
        spec.offset += dy;
        assert.strictEqual(await label.getAttribute("data-anchor-target"), targetId);
        await checkPosition(label, target, spec, "Native label drag preserves attachment");

        await editor.locator('[data-element-key="buttonElement"]').click();
        const rootButton = editor.locator('#dialog .element-wrapper[data-type="Button"]');
        await rootButton.click();
        for (const [property, value] of Object.entries({
            left: 240, top: 80, width: 120, height: 28
        })) {
            await editInput(editor, `#el${property}`, value);
        }
        const rootId = await rootButton.getAttribute("id");
        await target.click();
        await chooseOption(editor, "#element-anchor-target", rootId);
        const inputSpec = { position: "below", gap: 12, align: "middle", offset: 0 };
        await chooseOption(editor, "#element-anchor-position", inputSpec.position);
        await editInput(editor, "#element-anchor-gap", inputSpec.gap);
        await checkPosition(target, rootButton, inputSpec, "Native Input follows Button");
        await checkPosition(label, target, spec, "Native Label follows attached Input");

        await rootButton.click();
        await editInput(editor, "#elleft", 280);
        await editInput(editor, "#eltop", 120);
        await checkPosition(target, rootButton, inputSpec, "Native root movement resolves Input first");
        await checkPosition(label, target, spec, "Native root movement resolves downstream Label");

        const cycleOptions = [];
        for (const id of [targetId, labelId]) {
            const option = editor.locator(`#element-anchor-target option[value="${id}"]`);
            const state = await option.evaluate((node) => ({
                id: node.value,
                disabled: node.disabled,
                text: node.textContent,
                title: node.title
            }));
            assert.strictEqual(state.disabled, true, "Native dropdown must block a circular target");
            assert.match(state.text, /circular reference/i);
            assert.match(state.title, /cycle|circular/i);
            cycleOptions.push(state);
        }
        const rootName = await rootButton.getAttribute("data-nameid");
        const inputName = await target.getAttribute("data-nameid");
        const labelName = await label.getAttribute("data-nameid");
        assert.ok(cycleOptions[0].title.includes(rootName) && cycleOptions[0].title.includes(inputName),
            "Two-element cycle tooltip should identify its controls");
        assert.ok([rootName, inputName, labelName].every((name) => cycleOptions[1].title.includes(name)),
            "Transitive cycle tooltip should identify the full chain");
        assert.strictEqual(await editor.locator("#element-anchor-target").inputValue(), "",
            "Blocked circular candidates must leave the root absolute");
        console.log("Native mixed attachment chain: " + JSON.stringify({
            rootId, inputId: targetId, labelId, cycleOptions
        }));

        const source = await readEditorDocument(app);
        const saved = source.elements.find((element) => element.id === labelId);
        assert.strictEqual(saved.anchorTarget, targetId);
        assertNear(saved.anchorGap, spec.gap, "Native serialized gap");
        assertNear(saved.anchorOffset, spec.offset, "Native serialized offset");
        const savedInput = source.elements.find((element) => element.id === targetId);
        assert.strictEqual(savedInput.anchorTarget, rootId, "Native document should serialize non-Label attachment");

        const translations = {
            en_US: "New dataset",
            de_DE: "Neuer Datensatz",
            fr_FR: "Nouveau jeu de données"
        };
        source.properties.language = "en_US";
        source.i18n = { baseLocale: "en_US", locales: {} };
        for (const [locale, value] of Object.entries(translations)) {
            source.i18n.locales[locale] = { [`elements.${labelId}.value`]: value };
        }
        const previousLabel = await label.elementHandle();
        await app.evaluate(({ BrowserWindow }, document) => {
            const editor = BrowserWindow.getAllWindows().find((window) => {
                return !window.isDestroyed() && !window.webContents.isDestroyed() && window.webContents.getURL().includes("editor.html");
            });
            editor.webContents.send("load-dialog-json", document);
        }, source);
        await editor.waitForFunction((node) => !node.isConnected, previousLabel);
        await label.waitFor();
        await settleLayout(editor);

        assert.strictEqual(child.exitCode, null, "The task-owned application must still be running");
        const previewOpening = app.waitForEvent("window", { timeout: 15000 });
        await app.evaluate(({ Menu }) => {
            const file = Menu.getApplicationMenu().items.find((item) => item.label === "File");
            const preview = file.submenu.items.find((item) => item.label === "Preview");
            preview.click();
        });
        const preview = await previewOpening;
        await preview.locator(".preview-canvas").waitFor();
        const previewLabel = preview.locator(`.element-wrapper[id="${labelId}"]`);
        const previewTarget = preview.locator(`.element-wrapper[id="${targetId}"]`);
        const previewRoot = preview.locator(`.element-wrapper[id="${rootId}"]`);
        for (const [locale, text] of Object.entries(translations)) {
            await preview.locator(".preview-language-hover-area").hover();
            await preview.locator(".preview-language-select").selectOption(locale);
            await settleLayout(preview);
            assert.strictEqual((await previewLabel.textContent()).trim(), text);
            await checkPosition(previewTarget, previewRoot, inputSpec,
                `Native Preview ${locale} Input-to-Button attachment`);
            const box = await checkPosition(previewLabel, previewTarget, spec,
                `Native Preview ${locale} measured attachment`);
            observations.push({ locale, text, width: box.width, height: box.height });
        }
        assert.ok(observations[2].height > observations[0].height,
            "The translated native Preview fixture must exercise a changed label height");
        await checkGreekAddvariablesPreview(app, editor, preview);
        assert.deepStrictEqual(errors, [], "Native editor and Preview must have no uncaught errors");
        console.log("Native label anchoring observations: " + JSON.stringify(observations));
    } finally {
        try {
            if (app) {
                await closeTaskApplication(app);
            }
        } finally {
            const databaseAfter = fileHash(database);
            fs.rmSync(directory, { recursive: true, force: true });
            assert.strictEqual(databaseAfter, databaseBefore,
                "Native interaction must preserve the source catalog bytes");
        }
    }
    console.log("Rendered Electron label anchoring passed: editor controls, target movement, label dragging, and translated Preview.");
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
