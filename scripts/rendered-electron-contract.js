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
        assert.strictEqual(result.updateButtonHidden, true, "Update button should be hidden until an update is downloaded");
        assert.strictEqual(result.updateButtonTitle, "Update", "Update button hover title should be Update");
        assert.ok(result.availableElements >= 10, "Electron editor should populate available elements");
        assert.strictEqual(result.actionsEnabled, true, "Actions button should be enabled");
        assert.strictEqual(result.brokenImages.length, 0, `broken images: ${result.brokenImages.join(", ")}`);
        assert.ok(menuLabels.includes("File"), "Electron application menu should include File");
        assert.ok(menuLabels.includes("Edit"), "Electron application menu should include Edit");
        assert.ok(menuLabels.includes("Info"), "Electron application menu should include Info");

        await window.locator('[data-element-key="labelElement"]').click();
        const label = window.locator('#dialog .element-wrapper[data-type="Label"]');
        await label.click();

        for (const lines of ["1", "2", "3"]) {
            await window.locator("#ellineClamp").fill(lines);
            await window.locator("#ellineClamp").press("Enter");

            for (const alignment of ["bottom", "middle", "top", "middle"]) {
                await window.locator("#elvalign").focus();
                await window.locator("#elvalign").selectOption(alignment);
                await window.locator("#ellineClamp").focus();

                const labelState = await label.evaluate((element) => {
                    return {
                        control: document.getElementById("elvalign").value,
                        saved: element.dataset.valign,
                        rendered: getComputedStyle(element).alignItems,
                        lines: element.dataset.lineClamp
                    };
                });

                const expectedStyle = alignment === "middle"
                    ? "center"
                    : alignment === "bottom" ? "flex-end" : "flex-start";
                assert.deepStrictEqual(labelState, {
                    control: alignment,
                    saved: alignment,
                    rendered: expectedStyle,
                    lines
                }, `Label alignment should agree in the editor with ${lines} lines`);
            }
        }

        await window.locator("#dialogName").click();
        await label.click();
        assert.strictEqual(
            await window.locator("#elvalign").inputValue(),
            "middle",
            "Reselecting a label should retain Middle without visiting Preview"
        );

        await electronApp.evaluate(({ BrowserWindow }) => {
            const mainWindow = BrowserWindow.getAllWindows().find((candidate) => {
                return candidate.webContents.getURL().includes("editor.html");
            });
            mainWindow.webContents.send("message-from-main-dialogcreator-updater-state", {
                mode: "downloading",
                percent: 50,
                version: "9.9.9"
            });
        });

        const updateButtonDownloading = await window.locator("body").evaluate(() => {
            const updateButton = document.getElementById("app-update-button");
            return updateButton?.classList.contains("hidden") ?? false;
        });

        assert.strictEqual(updateButtonDownloading, true, "Update button should stay hidden while the update is downloading");

        await electronApp.evaluate(({ BrowserWindow }) => {
            const mainWindow = BrowserWindow.getAllWindows().find((candidate) => {
                return candidate.webContents.getURL().includes("editor.html");
            });
            mainWindow.webContents.send("message-from-main-dialogcreator-updater-state", {
                mode: "downloaded",
                percent: 100,
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

        assert.strictEqual(updateButtonPosition.enabled, true, "Update button should be enabled when an update is downloaded");
        assert.strictEqual(updateButtonPosition.iconPresent, true, "Update button should render a download icon");
        assert.strictEqual(updateButtonPosition.rightAligned, true, "Update button should sit on the right side of the toolbar");
        assert.strictEqual(updateButtonPosition.title, "Update", "Update button hover title should remain Update");

        await window.locator("#app-update-button").hover();
        await window.waitForTimeout(200);
        const updateButtonHover = await window.locator("#app-update-button").evaluate((button) => {
            const icon = button.querySelector(".codicon-download");
            const text = button.querySelector(".update-text");
            return {
                iconDisplay: icon ? window.getComputedStyle(icon).display : "",
                text: text?.textContent || "",
                textDisplay: text ? window.getComputedStyle(text).display : "",
                width: button.getBoundingClientRect().width
            };
        });

        assert.strictEqual(updateButtonHover.iconDisplay, "none", "Update icon should hide on hover");
        assert.strictEqual(updateButtonHover.text, "Update", "Update button should reveal the Update label on hover");
        assert.notStrictEqual(updateButtonHover.textDisplay, "none", "Update label should be visible on hover");
        assert.ok(updateButtonHover.width >= 70, "Update button should expand on hover");

        console.log("Rendered Electron contract passed.");
    } finally {
        await electronApp.close();
    }
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
