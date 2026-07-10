"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("playwright");

const rootDir = path.resolve(__dirname, "..");

const readNumber = function(value) {
    const parsed = Number.parseFloat(String(value || "0"));
    return Number.isFinite(parsed) ? parsed : 0;
};

const main = async function() {
    const browser = await chromium.launch();
    const page = await browser.newPage({
        viewport: {
            width: 1280,
            height: 820
        }
    });

    try {
        const editorUrl = pathToFileURL(
            path.join(rootDir, "src/pages/editor.html")
        ).toString();

        await page.goto(editorUrl);
        await page.waitForSelector("#editor-toolbar");

        const result = await page.evaluate(() => {
            const readRect = function(selector) {
                const element = document.querySelector(selector);
                if (!element) {
                    return null;
                }

                const rect = element.getBoundingClientRect();
                const styles = window.getComputedStyle(element);
                return {
                    width: rect.width,
                    height: rect.height,
                    display: styles.display,
                    backgroundColor: styles.backgroundColor,
                    fontFamily: styles.fontFamily,
                    gridTemplateColumns: styles.gridTemplateColumns
                };
            };

            const brokenImages = Array.from(document.images)
                .filter((image) => !image.complete || image.naturalWidth === 0)
                .map((image) => image.getAttribute("src") || "");

            return {
                title: document.title,
                editorArea: readRect(".editor-area"),
                toolbar: readRect("#editor-toolbar"),
                dialog: readRect("#dialog"),
                properties: readRect("#properties"),
                buttons: document.querySelectorAll("#editor-toolbar button.iconbutton").length,
                stylesheets: Array.from(document.styleSheets).length,
                brokenImages
            };
        });

        assert.strictEqual(result.title, "Dialog creator");
        assert.ok(result.editorArea, "editor area should exist");
        assert.ok(result.toolbar, "editor toolbar should exist");
        assert.ok(result.dialog, "dialog canvas should exist");
        assert.ok(result.properties, "properties panel should exist");
        assert.ok(result.stylesheets >= 2, "editor CSS should load");
        assert.strictEqual(result.buttons, 13, "toolbar icon buttons should render");
        assert.strictEqual(result.brokenImages.length, 0, `broken images: ${result.brokenImages.join(", ")}`);
        assert.ok(readNumber(result.editorArea.width) > 900, "editor area should have desktop width");
        assert.ok(readNumber(result.toolbar.height) > 20, "toolbar should have visible height");
        assert.ok(readNumber(result.dialog.width) > 100, "dialog canvas should have visible width");
        assert.ok(readNumber(result.properties.width) > 100, "properties panel should have visible width");

        console.log("Rendered editor contract passed.");
    } finally {
        await browser.close();
    }
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
