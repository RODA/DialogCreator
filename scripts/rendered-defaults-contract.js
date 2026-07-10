"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("playwright");

const rootDir = path.resolve(__dirname, "..");

const main = async function() {
    const browser = await chromium.launch();
    const page = await browser.newPage({
        viewport: {
            width: 1100,
            height: 760
        }
    });

    try {
        const defaultsUrl = pathToFileURL(
            path.join(rootDir, "dist", "web", "pages", "defaults.html")
        ).toString();

        await page.goto(defaultsUrl);
        await page.waitForSelector("#elementsList li[data-element-key]");
        await page.click("#elementsList li[data-element-key='buttonElement']");

        await page.waitForFunction(() => {
            return !document.getElementById("propertiesList")?.classList.contains("hidden");
        });

        const result = await page.evaluate(() => {
            const panel = document.getElementById("propertiesList");
            const labelField = document.getElementById("ellabel");
            const visibleRows = Array.from(document.querySelectorAll("#propertiesList .element-property"))
                .filter((element) => !element.classList.contains("hidden-element"));

            return {
                availableElements: document.querySelectorAll("#elementsList li[data-element-key]").length,
                defaultElement: panel?.dataset.defaultElement || "",
                panelHidden: panel?.classList.contains("hidden") || false,
                labelDisabled: labelField.disabled,
                labelValue: labelField.value,
                visibleRows: visibleRows.length
            };
        });

        assert.ok(result.availableElements >= 10, "defaults page should list available elements");
        assert.strictEqual(result.defaultElement, "buttonElement");
        assert.strictEqual(result.panelHidden, false);
        assert.strictEqual(result.labelDisabled, false);
        assert.strictEqual(result.labelValue, "Button");
        assert.ok(result.visibleRows > 3, "button defaults should show editable properties");

        console.log("Rendered defaults contract passed.");
    } finally {
        await browser.close();
    }
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
