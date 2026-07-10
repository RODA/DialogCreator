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
            const updateButton = document.getElementById("app-update-button");
            return {
                title: document.title,
                toolbarButtons: document.querySelectorAll("#editor-toolbar button.iconbutton").length,
                updateButtonHidden: updateButton?.classList.contains("hidden") ?? false,
                updateButtonTitle: updateButton?.getAttribute("title") || "",
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
        assert.strictEqual(result.updateButtonHidden, true, "Update button should be hidden until an update is available");
        assert.strictEqual(result.updateButtonTitle, "Update", "Update button hover title should be Update");
        assert.ok(result.availableElements >= 10, "Electron editor should populate available elements");
        assert.strictEqual(result.actionsEnabled, true, "Actions button should be enabled");
        assert.strictEqual(result.brokenImages.length, 0, `broken images: ${result.brokenImages.join(", ")}`);
        assert.ok(menuLabels.includes("File"), "Electron application menu should include File");
        assert.ok(menuLabels.includes("Edit"), "Electron application menu should include Edit");
        assert.ok(menuLabels.includes("Info"), "Electron application menu should include Info");

        await electronApp.evaluate(({ BrowserWindow }) => {
            const mainWindow = BrowserWindow.getAllWindows().find((candidate) => {
                return candidate.webContents.getURL().includes("editor.html");
            });
            mainWindow.webContents.send("message-from-main-dialogcreator-updater-state", {
                mode: "available",
                percent: 0,
                version: "9.9.9"
            });
        });

        await window.waitForSelector("#app-update-button:not(.hidden)");
        const updateButtonPosition = await window.locator("body").evaluate(() => {
            const toolbar = document.getElementById("editor-toolbar");
            const removeButton = document.getElementById("removeElement");
            const updateButton = document.getElementById("app-update-button");
            const updateIcon = updateButton?.querySelector(".codicon-download");

            const toolbarRect = toolbar.getBoundingClientRect();
            const removeRect = removeButton.getBoundingClientRect();
            const updateRect = updateButton.getBoundingClientRect();

            return {
                enabled: !updateButton.disabled,
                iconPresent: Boolean(updateIcon),
                rightAligned: updateRect.right > removeRect.right
                    && updateRect.right <= toolbarRect.right,
                title: updateButton.getAttribute("title") || ""
            };
        });

        assert.strictEqual(updateButtonPosition.enabled, true, "Update button should be enabled when an update is available");
        assert.strictEqual(updateButtonPosition.iconPresent, true, "Update button should render a download icon");
        assert.strictEqual(updateButtonPosition.rightAligned, true, "Update button should sit on the right side of the toolbar");
        assert.strictEqual(updateButtonPosition.title, "Update", "Update button hover title should remain Update");

        console.log("Rendered Electron contract passed.");
    } finally {
        await electronApp.close();
    }
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
