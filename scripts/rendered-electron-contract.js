"use strict";

const assert = require("assert");
const path = require("path");
const { _electron } = require("playwright");

const rootDir = path.resolve(__dirname, "..");

const main = async function() {
    const electronApp = await _electron.launch({
        args: [path.join(rootDir, "dist", "main.js")],
        env: {
            ...process.env,
            NODE_ENV: "test"
        }
    });

    try {
        const window = await electronApp.firstWindow();
        await window.waitForSelector("#editor-toolbar");

        const result = await window.locator("body").evaluate(() => {
            return {
                title: document.title,
                toolbarButtons: document.querySelectorAll("#editor-toolbar button.iconbutton").length,
                availableElements: document.querySelectorAll("#elementsList li[data-element-key]").length,
                actionsEnabled: !(document.getElementById("dialog-code")?.disabled ?? true),
                brokenImages: Array.from(document.images)
                    .filter((image) => !image.complete || image.naturalWidth === 0)
                    .map((image) => image.getAttribute("src") || "")
            };
        });

        const menuLabels = await electronApp.evaluate(({ Menu }) => {
            const menu = Menu.getApplicationMenu();
            return (menu?.items || []).map((item) => item.label);
        });

        assert.strictEqual(result.title, "Dialog creator");
        assert.strictEqual(result.toolbarButtons, 13, "Electron toolbar icon buttons should render");
        assert.ok(result.availableElements >= 10, "Electron editor should populate available elements");
        assert.strictEqual(result.actionsEnabled, true, "Actions button should be enabled");
        assert.strictEqual(result.brokenImages.length, 0, `broken images: ${result.brokenImages.join(", ")}`);
        assert.ok(menuLabels.includes("File"), "Electron application menu should include File");
        assert.ok(menuLabels.includes("Edit"), "Electron application menu should include Edit");
        assert.ok(menuLabels.includes("Info"), "Electron application menu should include Info");

        console.log("Rendered Electron contract passed.");
    } finally {
        await electronApp.close();
    }
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
