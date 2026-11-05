"use strict";

const assert = require("assert");
const { chromium } = require("playwright");
const { startRenderedWebServer } = require("./rendered-web-server");

const oldWindowWidth = 1050;
const oldPanelWidth = 260;
const oldControlWidth = 121;
const scrollbarWidth = 14;

const assertNear = function(actual, expected, context) {
    assert.ok(Math.abs(actual - expected) <= 0.6,
        `${context}: expected ${expected}, rendered ${actual}`);
};

const settleLayout = async function(frame) {
    await frame.evaluate(async () => {
        await document.fonts.ready;
        await new Promise((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(resolve));
        });
    });
};

const editProperty = async function(frame, selector, value) {
    const input = frame.locator(selector);
    await input.fill(String(value));
    await input.press("Enter");
    await input.blur();
    await settleLayout(frame);
};

const readPanel = async function(editor) {
    return editor.locator("#propertiesList").evaluate((panel) => {
        const outer = document.getElementById("properties");
        const style = getComputedStyle(panel);
        const scrollbar = getComputedStyle(panel, "::-webkit-scrollbar");
        const thumb = getComputedStyle(panel, "::-webkit-scrollbar-thumb");
        const track = getComputedStyle(panel, "::-webkit-scrollbar-track");
        const rect = panel.getBoundingClientRect();
        const borderWidth = Number.parseFloat(style.borderLeftWidth)
            + Number.parseFloat(style.borderRightWidth);
        return {
            width: outer.getBoundingClientRect().width,
            height: rect.height,
            top: rect.top,
            bottom: rect.bottom,
            clientWidth: panel.clientWidth,
            clientHeight: panel.clientHeight,
            scrollHeight: panel.scrollHeight,
            scrollWidth: panel.scrollWidth,
            scrollTop: panel.scrollTop,
            overflow: style.overflowY,
            gutter: style.scrollbarGutter,
            gutterWidth: panel.offsetWidth - panel.clientWidth - borderWidth,
            scrollbarWidth: Number.parseFloat(scrollbar.width),
            thumbColor: thumb.backgroundColor,
            trackColor: track.backgroundColor,
            controls: Object.fromEntries(["elnameid", "element-anchor-target", "elvalue"].map((id) => {
                const control = document.getElementById(id);
                return [id, control.getBoundingClientRect().width];
            })),
            editorHeight: window.innerHeight,
            bodyScrollTop: document.body.scrollTop,
            documentScrollTop: document.documentElement.scrollTop,
            windowScrollY: window.scrollY
        };
    });
};

const checkContainedScroll = function(panel, context) {
    assert.ok(panel.height <= panel.editorHeight + 1, `${context}: panel must fit inside the editor`);
    assert.ok(["auto", "scroll"].includes(panel.overflow), `${context}: properties must own vertical scrolling`);
    assert.ok(panel.gutter.includes("stable"), `${context}: scrollbar space must stay reserved`);
    assertNear(panel.gutterWidth, scrollbarWidth, `${context}: rendered scrollbar gutter`);
    assertNear(panel.width, oldPanelWidth + scrollbarWidth, `${context}: widened properties panel`);
    assertNear(panel.clientWidth, oldPanelWidth - 20, `${context}: original property list content area`);
    assert.strictEqual(panel.bodyScrollTop, 0, `${context}: body must not scroll`);
    assert.strictEqual(panel.documentScrollTop, 0, `${context}: document must not scroll`);
    assert.strictEqual(panel.windowScrollY, 0, `${context}: editor viewport must not scroll`);
    assert.ok(panel.scrollWidth <= panel.clientWidth + 1, `${context}: properties must not overflow horizontally`);
    for (const [id, width] of Object.entries(panel.controls)) {
        if (width > 0) {
            assertNear(width, oldControlWidth, `${context}: ${id} keeps its existing width`);
        }
    }
};

const checkLastPropertyVisible = async function(editor, context) {
    const bounds = await editor.locator("#elisVisible").evaluate((control) => {
        const rect = control.getBoundingClientRect();
        const panel = document.getElementById("propertiesList").getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, panelTop: panel.top, panelBottom: panel.bottom };
    });
    assert.ok(bounds.top >= bounds.panelTop - 0.6, `${context}: last property must not be above the panel`);
    assert.ok(bounds.bottom <= bounds.panelBottom + 0.6, `${context}: last property must be reachable inside the panel`);
};

const readAttachment = async function(label) {
    return label.evaluate((node) => {
        const rect = node.getBoundingClientRect();
        return {
            properties: Object.fromEntries(Object.entries(node.dataset).filter(([key]) => {
                return key.startsWith("anchor") || key === "left" || key === "top";
            })),
            left: rect.left,
            top: rect.top
        };
    });
};

const checkUnchangedAttachment = async function(label, before, context) {
    const after = await readAttachment(label);
    assert.deepStrictEqual(after.properties, before.properties,
        `${context}: focus navigation must not change attachment metadata or fallback coordinates`);
    assertNear(after.left, before.left, `${context}: caption left stays unchanged`);
    assertNear(after.top, before.top, `${context}: caption top stays unchanged`);
};

const resizeMainWindow = async function(page, dy) {
    const handle = page.locator(
        '#dialogcreator-main-window .web-workbench-resize-handle[data-resize-direction="corner"]'
    );
    const rect = await handle.boundingBox();
    assert.ok(rect, "Main window must have a visible resize handle");
    await page.mouse.move(rect.x + 8, rect.y + 8);
    await page.mouse.down();
    await page.mouse.move(rect.x + 8, rect.y + 8 + dy, { steps: 5 });
    await page.mouse.up();
};

const dragScrollbar = async function(page, editor, position) {
    const panel = editor.locator("#propertiesList");
    const rect = await panel.boundingBox();
    const state = await panel.evaluate((node) => ({
        height: node.clientHeight,
        scrollHeight: node.scrollHeight,
        top: node.scrollTop
    }));
    const range = state.scrollHeight - state.height;
    assert.ok(range > 0, "Scrollbar drag fixture must overflow vertically");
    const thumbHeight = state.height * state.height / state.scrollHeight;
    const travel = state.height - thumbHeight;
    const thumbTop = travel * state.top / range;
    const startY = rect.y + thumbTop + Math.min(24, thumbHeight / 2);
    const desiredTop = position === "bottom" ? travel + 2 : -2;
    const x = rect.x + rect.width - scrollbarWidth / 2;
    await page.mouse.move(x, startY);
    await page.mouse.down();
    await page.mouse.move(x, startY + desiredTop - thumbTop, { steps: 6 });
    await page.mouse.up();
    await settleLayout(editor);
};

const main = async function() {
    const server = await startRenderedWebServer();
    const browser = await chromium.launch({ ignoreDefaultArgs: ["--hide-scrollbars"] });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));

    try {
        await page.goto(server.url);
        await page.frameLocator("#dialogcreator-browser-frame")
            .locator('[data-element-key="inputElement"]').waitFor();
        const editor = page.frames().find((frame) => frame.url().includes("/pages/editor.html"));
        assert.ok(editor, "Browser host must use the real shared editor");
        await editor.locator('[data-element-key="inputElement"]').click();
        const target = editor.locator('#dialog .element-wrapper[data-type="Input"]');
        await target.click();
        await editProperty(editor, "#elleft", 200);
        await editProperty(editor, "#eltop", 100);
        const targetId = await target.getAttribute("id");

        await editor.locator('[data-element-key="labelElement"]').click();
        const label = editor.locator('#dialog .element-wrapper[data-type="Label"]');
        await label.click();
        await editor.locator("#element-anchor-target").selectOption(targetId);
        await settleLayout(editor);

        const initial = await readPanel(editor);
        assert.ok(initial.scrollHeight > initial.clientHeight + 5,
            "Default-height attached-label properties must require scrolling");
        checkContainedScroll(initial, "Default window");
        assertNear(initial.scrollbarWidth, scrollbarWidth, "Styled scrollbar width");
        assert.notStrictEqual(initial.thumbColor, "rgba(0, 0, 0, 0)", "Scrollbar thumb must have visible styling");
        assert.notStrictEqual(initial.trackColor, "rgba(0, 0, 0, 0)", "Scrollbar track must have visible styling");
        const initialWindow = await page.locator("#dialogcreator-main-window").boundingBox();
        assertNear(initialWindow.width, oldWindowWidth + scrollbarWidth,
            "Main window grows only by the scrollbar width");
        if (process.env.DIALOGCREATOR_PROPERTIES_SCREENSHOT) {
            await page.screenshot({ path: process.env.DIALOGCREATOR_PROPERTIES_SCREENSHOT });
        }

        await dragScrollbar(page, editor, "bottom");
        const afterThumb = await readPanel(editor);
        assert.ok(afterThumb.scrollTop > 0, "Dragging the visible scrollbar thumb scrolls the property list");
        await checkLastPropertyVisible(editor, "Scrollbar thumb drag");
        const afterThumbWindow = await page.locator("#dialogcreator-main-window").boundingBox();
        assertNear(afterThumbWindow.width, initialWindow.width,
            "Scrollbar dragging must not resize the main window");
        assertNear(afterThumbWindow.height, initialWindow.height,
            "Scrollbar dragging must not change the window height");
        await dragScrollbar(page, editor, "top");
        assert.strictEqual((await readPanel(editor)).scrollTop, 0, "Scrollbar thumb can return to the top");

        const panel = editor.locator("#propertiesList");
        const panelBox = await panel.boundingBox();
        await page.mouse.move(panelBox.x + 12, panelBox.y + panelBox.height - 30);
        await page.mouse.wheel(0, 1200);
        await editor.waitForFunction(() => document.getElementById("propertiesList").scrollTop > 0);
        await settleLayout(editor);
        await checkLastPropertyVisible(editor, "Mouse wheel");
        checkContainedScroll(await readPanel(editor), "Mouse wheel");
        if (process.env.DIALOGCREATOR_PROPERTIES_SCREENSHOT) {
            await page.screenshot({
                path: process.env.DIALOGCREATOR_PROPERTIES_SCREENSHOT.replace(/\.png$/i, "-bottom.png")
            });
        }

        const beforeReadonly = await readAttachment(label);
        for (const id of ["elleft", "eltop"]) {
            const coordinate = editor.locator(`#${id}`);
            assert.strictEqual(await coordinate.evaluate((input) => input.readOnly), true);
            await coordinate.focus();
            // A calculated field can hold a stale layout snapshot while focused.
            // Blurring it must never submit that snapshot as an authored edit.
            await coordinate.evaluate((input) => { input.value = "-100"; });
            await page.keyboard.press("Tab");
            await settleLayout(editor);
            await checkUnchangedAttachment(label, beforeReadonly, `Read-only ${id} blur`);
        }

        await label.click();
        await settleLayout(editor);
        const beforeKeyboard = await readAttachment(label);
        await editor.locator("#elnameid").focus();
        for (let step = 0; step < 40; step += 1) {
            const activeId = await editor.evaluate(() => document.activeElement?.id);
            if (activeId === "elisVisible") {
                break;
            }
            await page.keyboard.press("Tab");
        }
        assert.strictEqual(await editor.evaluate(() => document.activeElement?.id), "elisVisible",
            "Keyboard navigation must reach the last visible label property");
        await checkLastPropertyVisible(editor, "Keyboard Tab");
        checkContainedScroll(await readPanel(editor), "Keyboard Tab");
        await checkUnchangedAttachment(label, beforeKeyboard, "Keyboard Tab through all properties");

        await resizeMainWindow(page, 250);
        await settleLayout(editor);
        const tall = await readPanel(editor);
        checkContainedScroll(tall, "Taller window");
        assert.ok(tall.scrollHeight <= tall.clientHeight + 1,
            "Taller window should fit all label properties without scrolling");
        assert.strictEqual(tall.scrollTop, 0, "Fitting properties should reset the scroll position");
        await checkLastPropertyVisible(editor, "Taller window");

        await resizeMainWindow(page, -250);
        await settleLayout(editor);
        const short = await readPanel(editor);
        checkContainedScroll(short, "Shrunk window");
        assert.ok(short.scrollHeight > short.clientHeight + 5,
            "Shrinking the window must restore properties overflow");
        const restoredWindow = await page.locator("#dialogcreator-main-window").boundingBox();
        assertNear(restoredWindow.height, initialWindow.height, "Window height returns to its original size");

        await target.click();
        await settleLayout(editor);
        const inputPanel = await readPanel(editor);
        checkContainedScroll(inputPanel, "Short Input property list");
        assert.ok(inputPanel.scrollHeight <= inputPanel.clientHeight + 1,
            "Selecting an Input should fit its shorter property list");
        assert.strictEqual(await editor.locator("#element-anchor-target").isVisible(), true);
        assert.strictEqual(await editor.locator("#element-anchor-target").inputValue(), "");
        await label.click();
        await settleLayout(editor);
        const labelPanel = await readPanel(editor);
        checkContainedScroll(labelPanel, "Return to attached Label");
        assert.ok(labelPanel.scrollHeight > labelPanel.clientHeight + 5);
        assert.deepStrictEqual(errors, [], "Rendered properties interactions must not throw errors");
        console.log("Rendered properties scrolling passed: visible gutter, unchanged controls, wheel/keyboard, resize and selection changes.");
    } finally {
        await browser.close();
        await server.close();
    }
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
