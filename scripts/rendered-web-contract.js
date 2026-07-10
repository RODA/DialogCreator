"use strict";

const assert = require("assert");
const { chromium } = require("playwright");
const { startRenderedWebServer } = require("./rendered-web-server");
const pkg = require("../package.json");

const clickMenuItem = async function(page, label, itemSelector) {
    await page.getByRole("button", { name: label }).click();
    await page.locator(itemSelector).click();
};

const main = async function() {
    const server = await startRenderedWebServer();
    const browser = await chromium.launch();
    const context = await browser.newContext({
        acceptDownloads: true,
        viewport: {
            width: 1280,
            height: 820
        }
    });
    const page = await context.newPage();

    try {
        await page.goto(server.url);
        await page.waitForSelector("#dialogcreator-browser-frame");

        const hostReady = await page.evaluate(() => {
            return Boolean((window).dialogCreatorBrowserHost);
        });
        assert.ok(hostReady, "browser host composition should mount");

        const frame = page.frameLocator("#dialogcreator-browser-frame");
        await page.locator("#dialogcreator-browser-menu").waitFor();
        await page.locator("#dialogcreator-main-window").waitFor();
        await frame.locator("#editor-toolbar").waitFor();

        const shellResult = await page.evaluate(() => {
            const desktop = document.querySelector("#dialogcreator-browser-desktop");
            const mainWindow = document.querySelector("#dialogcreator-main-window");
            const titlebar = document.querySelector("#dialogcreator-main-titlebar");
            const desktopRect = desktop?.getBoundingClientRect();
            const windowRect = mainWindow?.getBoundingClientRect();
            const titlebarRect = titlebar?.getBoundingClientRect();

            return {
                hasDesktop: Boolean(desktop),
                hasMainWindow: Boolean(mainWindow),
                hasTitlebar: Boolean(titlebar),
                desktopWidth: desktopRect?.width || 0,
                desktopHeight: desktopRect?.height || 0,
                windowWidth: windowRect?.width || 0,
                windowHeight: windowRect?.height || 0,
                titlebarHeight: titlebarRect?.height || 0,
                menuButtons: Array.from(document.querySelectorAll(".web-menu-button"))
                    .map((button) => button.textContent?.trim() || "")
            };
        });

        assert.strictEqual(shellResult.hasDesktop, true, "browser shell should render a desktop canvas");
        assert.strictEqual(shellResult.hasMainWindow, true, "browser shell should render a main window");
        assert.strictEqual(shellResult.hasTitlebar, true, "browser main window should have a titlebar");
        assert.ok(shellResult.desktopWidth > 900, "desktop canvas should fill the viewport");
        assert.ok(shellResult.desktopHeight > 600, "desktop canvas should fill the viewport height");
        assert.ok(shellResult.windowWidth > 700, "main window should have a desktop-window width");
        assert.ok(shellResult.windowHeight > 400, "main window should have a desktop-window height");
        assert.ok(shellResult.titlebarHeight >= 28, "main window should have a visible titlebar");
        assert.deepStrictEqual(shellResult.menuButtons, ["File", "Edit", "Info"]);

        await page.getByRole("button", { name: "File" }).click();
        await page.locator(".web-menu-root.is-open .web-menu-popup").waitFor();
        await page.keyboard.press("Escape");

        await clickMenuItem(page, "Info", '[data-browser-info-command="manual"]');
        const manualFrame = page.frameLocator("#dialogcreator-info-layer iframe");
        await manualFrame.locator("h1").filter({ hasText: "Dialog Creator - User Manual" }).waitFor();
        await page.locator("#dialogcreator-info-layer .web-info-window__close").click();
        await page.locator("#dialogcreator-info-layer").waitFor({ state: "detached" });

        await clickMenuItem(page, "Info", '[data-browser-info-command="api"]');
        const apiFrame = page.frameLocator("#dialogcreator-info-layer iframe");
        await apiFrame.locator("h1").filter({ hasText: "Dialog Creator" }).waitFor();
        await page.keyboard.press("Escape");
        await page.locator("#dialogcreator-info-layer").waitFor({ state: "detached" });

        await clickMenuItem(page, "Info", '[data-browser-info-command="about"]');
        const aboutFrame = page.frameLocator("#dialogcreator-info-layer iframe");
        await aboutFrame.locator("h1").filter({ hasText: "Dialog Creator" }).waitFor();
        await aboutFrame.locator(".version").filter({ hasText: `Version ${pkg.version}` }).waitFor();
        await aboutFrame.locator(".meta").filter({ hasText: "Copyright © 2025-2026" }).waitFor();
        const aboutResizeHandles = await page
            .locator("#dialogcreator-info-layer .web-workbench-resize-handle")
            .count();
        assert.strictEqual(aboutResizeHandles, 0, "browser About info window should not be resizable");
        await page.locator("#dialogcreator-info-layer .web-info-window__close").click();
        await page.locator("#dialogcreator-info-layer").waitFor({ state: "detached" });

        const beforeDrag = await page.locator("#dialogcreator-main-window").boundingBox();
        assert.ok(beforeDrag, "main window bounds should be readable before drag");
        const titlebar = await page.locator("#dialogcreator-main-titlebar").boundingBox();
        assert.ok(titlebar, "titlebar bounds should be readable");
        await page.mouse.move(titlebar.x + 80, titlebar.y + 15);
        await page.mouse.down();
        await page.mouse.move(titlebar.x + 150, titlebar.y + 65);
        await page.mouse.up();
        const afterDrag = await page.locator("#dialogcreator-main-window").boundingBox();
        assert.ok(afterDrag, "main window bounds should be readable after drag");
        assert.ok(afterDrag.x > beforeDrag.x + 40, "main window should move horizontally when dragged");
        assert.ok(afterDrag.y > beforeDrag.y + 30, "main window should move vertically when dragged");

        const beforeResize = afterDrag;
        const resizeHandle = await page
            .locator('#dialogcreator-main-window .web-workbench-resize-handle[data-resize-direction="corner"]')
            .boundingBox();
        assert.ok(resizeHandle, "resize handle bounds should be readable");
        await page.mouse.move(resizeHandle.x + 8, resizeHandle.y + 8);
        await page.mouse.down();
        await page.mouse.move(resizeHandle.x + 108, resizeHandle.y + 78);
        await page.mouse.up();
        const afterResize = await page.locator("#dialogcreator-main-window").boundingBox();
        assert.ok(afterResize, "main window bounds should be readable after resize");
        assert.ok(afterResize.width > beforeResize.width + 60, "main window should resize wider");
        assert.ok(afterResize.height > beforeResize.height + 40, "main window should resize taller");

        const result = await frame.locator("body").evaluate(() => {
            const toolbar = document.querySelector("#editor-toolbar");
            const dialog = document.querySelector("#dialog");
            const properties = document.querySelector("#properties");
            const toolbarRect = toolbar?.getBoundingClientRect();
            const dialogRect = dialog?.getBoundingClientRect();
            const propertiesRect = properties?.getBoundingClientRect();

            return {
                title: document.title,
                toolbarHeight: toolbarRect?.height || 0,
                dialogWidth: dialogRect?.width || 0,
                propertiesWidth: propertiesRect?.width || 0,
                buttons: document.querySelectorAll("#editor-toolbar button.iconbutton").length,
                availableElements: document.querySelectorAll("#elementsList li[data-element-key]").length,
                brokenImages: Array.from(document.images)
                    .filter((image) => !image.complete || image.naturalWidth === 0)
                    .map((image) => image.getAttribute("src") || "")
            };
        });

        assert.strictEqual(result.title, "Dialog creator");
        assert.strictEqual(result.buttons, 13, "toolbar icon buttons should render in browser shell");
        assert.ok(result.availableElements >= 10, "shared editor bootstrap should populate available elements");
        assert.strictEqual(result.brokenImages.length, 0, `broken images: ${result.brokenImages.join(", ")}`);
        assert.ok(result.toolbarHeight > 20, "toolbar should have visible height in browser shell");
        assert.ok(result.dialogWidth > 100, "dialog canvas should have visible width in browser shell");
        assert.ok(result.propertiesWidth > 100, "properties panel should have visible width in browser shell");

        await frame.locator("#dialogName").focus();
        await page.keyboard.press(process.platform === "darwin" ? "Meta+P" : "Control+P");
        await frame.frameLocator("#dialogcreator-browser-panel iframe").locator(".preview-canvas").waitFor();
        await frame.locator("#dialogcreator-browser-panel").evaluate((panel) => panel.remove());

        const downloadPromise = page.waitForEvent("download");
        await clickMenuItem(page, "File", "#dialogcreator-browser-save");
        const download = await downloadPromise;
        assert.strictEqual(
            download.suggestedFilename(),
            "NewDialog.dc.zip",
            "browser Save should download the same .dc.zip package contract"
        );

        const packageBytes = await page.evaluate(async () => {
            const json = JSON.stringify({
                id: "browser-load-contract",
                properties: {
                    name: "LoadedFromBrowser",
                    title: "Loaded from browser",
                    language: "en_US",
                    runtimeProvider: "R",
                    width: "640",
                    height: "480",
                    fontSize: "12"
                },
                syntax: {},
                elements: [],
                customJS: "log('loaded');"
            }, null, 4);
            const result = window.dialogCreatorBrowserHost.files.createPackage(json);
            if (!result.ok) {
                throw new Error(result.reason);
            }
            return Array.from(result.bytes);
        });

        await page.locator("#dialogcreator-browser-file-input").setInputFiles({
            name: "LoadedFromBrowser.dc.zip",
            mimeType: "application/zip",
            buffer: Buffer.from(packageBytes)
        });
        await frame.locator("#dialogName").waitFor({ state: "visible" });
        await frame.locator("#dialogName").waitFor({ state: "attached" });
        await frame.locator("#dialogName").evaluate((input) => new Promise((resolve) => {
            const check = () => {
                if (input.value === "LoadedFromBrowser") {
                    resolve(true);
                    return;
                }
                setTimeout(check, 25);
            };
            check();
        }));

        await clickMenuItem(page, "File", "#dialogcreator-browser-preview");
        const previewPanel = frame.frameLocator("#dialogcreator-browser-panel iframe");
        await previewPanel.locator(".preview-canvas").waitFor();
        await frame.locator(".dialogcreator-browser-panel-titlebar").waitFor();
        await frame.getByRole("button", { name: "Close" }).waitFor();
        const previewTitlebarBounds = await frame.locator(".dialogcreator-browser-panel-titlebar").boundingBox();
        const previewCloseBounds = await frame.getByRole("button", { name: "Close" }).boundingBox();
        assert.ok(previewTitlebarBounds, "preview titlebar bounds should be readable");
        assert.ok(previewCloseBounds, "preview close button bounds should be readable");
        assert.ok(
            previewCloseBounds.x > previewTitlebarBounds.x + previewTitlebarBounds.width - 40,
            "preview close button should be positioned on the right side"
        );

        const previewWindowBeforeDrag = await frame
            .locator(".dialogcreator-browser-panel-window")
            .boundingBox();
        assert.ok(previewWindowBeforeDrag, "preview window bounds should be readable before drag");
        const previewTitlebar = await frame.locator(".dialogcreator-browser-panel-titlebar").boundingBox();
        assert.ok(previewTitlebar, "preview titlebar bounds should be readable");
        await page.mouse.move(previewTitlebar.x + 120, previewTitlebar.y + 15);
        await page.mouse.down();
        await page.mouse.move(previewTitlebar.x + 190, previewTitlebar.y + 75);
        await page.mouse.up();
        const previewWindowAfterDrag = await frame
            .locator(".dialogcreator-browser-panel-window")
            .boundingBox();
        assert.ok(previewWindowAfterDrag, "preview window bounds should be readable after drag");
        assert.ok(
            previewWindowAfterDrag.x > previewWindowBeforeDrag.x + 40,
            "preview window should move horizontally when dragged"
        );
        assert.ok(
            previewWindowAfterDrag.y > previewWindowBeforeDrag.y + 30,
            "preview window should move vertically when dragged"
        );

        await previewPanel.locator("#preview-root").focus();
        await page.keyboard.press("Escape");
        await frame.locator("#dialogcreator-browser-panel").waitFor({ state: "detached" });

        await clickMenuItem(page, "File", "#dialogcreator-browser-preview");
        await frame.frameLocator("#dialogcreator-browser-panel iframe").locator(".preview-canvas").waitFor();
        await frame.getByRole("button", { name: "Close" }).click();
        await frame.locator("#dialogcreator-browser-panel").waitFor({ state: "detached" });

        await frame.locator("#dialog-code").click();
        const codePanel = frame.frameLocator("#dialogcreator-browser-panel iframe");
        await codePanel.locator("#codeText").fill("setValue(answerInput, 'browser');");
        await codePanel.locator("#saveCode").click();
        await frame.locator("#dialogcreator-browser-panel").waitFor({ state: "detached" });

        await frame.locator("#dialog-code").click();
        const reopenedCodePanel = frame.frameLocator("#dialogcreator-browser-panel iframe");
        await reopenedCodePanel.locator("#codeText").waitFor();
        const editorFrame = page.frames().find((candidate) => candidate.url().includes("editor.html"));
        assert.ok(editorFrame, "editor iframe should be available");
        await editorFrame.waitForFunction(
            (expected) => {
                return (window.dialogCreatorBrowserEditorEvents || []).some((event) => {
                    return event.type === "open-panel" &&
                        event.html === "code.html" &&
                        event.customJS === expected;
                });
            },
            "setValue(answerInput, 'browser');"
        );

        await frame.locator("#dialogcreator-browser-panel").evaluate((panel) => panel.remove());
        await frame.getByRole("button", { name: "Default values" }).click();
        const defaultsPanel = frame.frameLocator("#dialogcreator-browser-panel iframe");
        await defaultsPanel.locator("#elementsList li[data-element-key='buttonElement']").click();
        await defaultsPanel.locator("#propertiesList:not(.hidden)").waitFor();
        const firstDefaultSelection = await defaultsPanel.locator("body").evaluate(() => {
            return {
                defaultElement: document.querySelector("#propertiesList")?.dataset.defaultElement || "",
                visibleRows: Array.from(document.querySelectorAll("#propertiesList .element-property"))
                    .filter((row) => !row.classList.contains("hidden-element"))
                    .length
            };
        });
        assert.strictEqual(
            firstDefaultSelection.defaultElement,
            "buttonElement",
            "first browser defaults selection should bind the selected element"
        );
        assert.ok(
            firstDefaultSelection.visibleRows > 0,
            "first browser defaults selection should show properties"
        );
        const defaultButtonLabel = await defaultsPanel.locator("#ellabel").inputValue();
        assert.strictEqual(defaultButtonLabel, "Button", "browser defaults panel should reuse defaults controller");

        console.log("Rendered web shell contract passed.");
    } finally {
        await context.close();
        await browser.close();
        await server.close();
    }
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
