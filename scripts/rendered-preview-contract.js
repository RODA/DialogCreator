"use strict";

const path = require("path");
const { chromium } = require("playwright");

const rootDir = path.resolve(__dirname, "..");

const sampleDialog = {
    id: "preview-contract-dialog",
    properties: {
        name: "PreviewContract",
        title: "Preview Contract",
        language: "en_US",
        runtimeProvider: "R",
        width: "420",
        height: "220",
        background: "#ffffff",
        fontSize: "12"
    },
    syntax: {},
    elements: [
        {
            id: "button-contract",
            type: "Button",
            nameid: "runButton",
            label: "Run",
            value: "Run",
            left: "24",
            top: "28",
            width: "96",
            height: "30",
            isEnabled: "true",
            isVisible: "true"
        },
        {
            id: "input-contract",
            type: "Input",
            nameid: "answerInput",
            value: "value",
            left: "24",
            top: "76",
            width: "180",
            height: "30",
            isEnabled: "true",
            isVisible: "true"
        }
    ],
    customJS: "log('preview contract custom js');"
};

const main = async function() {
    const browser = await chromium.launch();
    const page = await browser.newPage({
        viewport: {
            width: 700,
            height: 500
        }
    });

    const previewPath = path.join(rootDir, "docs", "live", "pages", "preview.html");
    await page.goto(`file://${previewPath}`);
    await page.waitForSelector("#preview-root");

    await page.evaluate((dialog) => {
        window.dialogCreatorPreviewTransport.emit("renderPreview", dialog);
    }, sampleDialog);

    await page.waitForSelector(".preview-canvas .element-wrapper[data-nameid='runButton']");
    await page.waitForSelector(".preview-canvas .element-wrapper[data-nameid='answerInput']");

    const result = await page.evaluate(() => {
        const root = document.getElementById("preview-root");
        const canvas = document.querySelector(".preview-canvas");
        const button = document.querySelector(".element-wrapper[data-nameid='runButton']");
        const input = document.querySelector(".element-wrapper[data-nameid='answerInput']");
        const events = window.dialogCreatorPreviewEvents || [];

        return {
            rootWidth: root?.style.width || "",
            rootHeight: root?.style.height || "",
            canvasWidth: canvas?.style.width || "",
            canvasHeight: canvas?.style.height || "",
            buttonText: button?.textContent?.trim() || "",
            inputValue: input?.querySelector("input, textarea")?.value || "",
            logEvents: events.filter((event) => event.type === "log").map((event) => event.message)
        };
    });

    await browser.close();

    if (result.rootWidth !== "420px" || result.rootHeight !== "220px") {
        throw new Error(`Preview root size drifted: ${result.rootWidth} x ${result.rootHeight}`);
    }

    if (result.canvasWidth !== "420px" || result.canvasHeight !== "220px") {
        throw new Error(`Preview canvas size drifted: ${result.canvasWidth} x ${result.canvasHeight}`);
    }

    if (!result.buttonText.includes("Run")) {
        throw new Error(`Preview button text drifted: ${result.buttonText}`);
    }

    if (result.inputValue !== "value") {
        throw new Error(`Preview input value drifted: ${result.inputValue}`);
    }

    if (!result.logEvents.includes("preview contract custom js")) {
        throw new Error("Preview custom JS did not run through the shared PreviewUI log path.");
    }

    console.log("Rendered preview contract passed.");
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
