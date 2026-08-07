"use strict";

const path = require("path");
const { chromium } = require("playwright");

const rootDir = path.resolve(__dirname, "..");

// bindObjects() returns a binding handle synchronously, the same shape the
// product runtime returns. Dialogs keep that handle and call refresh() when
// they reset, so a Promise here would break them with "refresh is not a
// function".
const customJS = [
    "const binding = bindObjects({",
    "    dialog: 'binding-contract',",
    "    datasets: c_datasets,",
    "    variables: c_variables",
    "});",
    "",
    "log('IS_PROMISE:' + (binding instanceof Promise));",
    "log('HAS_REFRESH:' + (binding && typeof binding.refresh === 'function'));",
    "",
    "// refresh() has to stay repeatable; dialogs call it on every reset.",
    "binding.refresh();",
    "binding.refresh();",
    "",
    "// Preview has no host data environment, so a reference is the plain name.",
    "log('REFERENCE_EMPTY:' + JSON.stringify(getReference(c_datasets)));",
    "setSelected(c_datasets, getValue(c_datasets)[0].name || getValue(c_datasets)[0]);",
    "log('REFERENCE_SELECTED:' + (getReference(c_datasets) === getSelected(c_datasets)[0]));",
    "",
    "// The two shapes used by the DialogR dialogs today.",
    "try {",
    "    const returned = binding.refresh();",
    "    log('REFRESH_PROMISE:' + (returned instanceof Promise));",
    "    returned.then(function() { log('REFRESH_RESOLVED:true'); });",
    "} catch (error) {",
    "    log('REFRESH_THREW:' + error.message);",
    "}",
    "",
    "try {",
    "    bindObjects({ dialog: 'binding-contract', datasets: c_datasets }).refresh();",
    "    log('INLINE_REFRESH:ok');",
    "} catch (error) {",
    "    log('INLINE_REFRESH:' + error.message);",
    "}"
].join("\n");

const sampleDialog = {
    id: "binding-contract-dialog",
    properties: {
        name: "BindingContract",
        title: "Binding Contract",
        language: "en_US",
        runtimeProvider: "R",
        width: "400",
        height: "220",
        background: "#ffffff",
        fontSize: "12"
    },
    syntax: {},
    elements: [
        {
            id: "container-datasets",
            type: "Container",
            nameid: "c_datasets",
            left: "10",
            top: "10",
            width: "170",
            height: "120",
            selection: "single",
            itemType: "any",
            isEnabled: "true",
            isVisible: "true"
        },
        {
            id: "container-variables",
            type: "Container",
            nameid: "c_variables",
            left: "200",
            top: "10",
            width: "170",
            height: "120",
            selection: "multiple",
            itemType: "any",
            isEnabled: "true",
            isVisible: "true"
        }
    ],
    customJS
};

const expected = {
    IS_PROMISE: "false",
    HAS_REFRESH: "true",
    REFERENCE_EMPTY: "\"\"",
    REFERENCE_SELECTED: "true",
    REFRESH_PROMISE: "true",
    REFRESH_RESOLVED: "true",
    INLINE_REFRESH: "ok"
};

const main = async function() {
    const browser = await chromium.launch();
    const page = await browser.newPage({
        viewport: {
            width: 700,
            height: 500
        }
    });

    const previewPath = path.join(rootDir, "dist", "web", "pages", "preview.html");
    await page.goto(`file://${previewPath}`);
    await page.waitForSelector("#preview-root");

    await page.evaluate((dialog) => {
        window.dialogCreatorPreviewTransport.emit("renderPreview", dialog);
    }, sampleDialog);

    await page.waitForSelector(".preview-canvas .element-wrapper[data-nameid='c_datasets']");
    await page.waitForFunction(() => {
        const events = window.dialogCreatorPreviewEvents || [];
        return events.some((event) => {
            return event.type === "log" && String(event.message).startsWith("REFRESH_RESOLVED:");
        });
    }, null, { timeout: 5000 });

    const result = await page.evaluate(() => {
        const events = window.dialogCreatorPreviewEvents || [];
        const datasets = document.querySelector(".element-wrapper[data-nameid='c_datasets']");
        const overlay = document.querySelector(".customjs-error");

        return {
            logs: events
                .filter((event) => event.type === "log")
                .map((event) => String(event.message)),
            datasetRows: datasets ? datasets.querySelectorAll(".container-item").length : 0,
            overlay: overlay ? overlay.textContent : ""
        };
    });

    await browser.close();

    if (result.overlay) {
        throw new Error(`Custom JS raised a runtime error: ${result.overlay}`);
    }

    const reported = {};
    result.logs.forEach((message) => {
        const splitAt = message.indexOf(":");
        if (splitAt > 0) {
            reported[message.slice(0, splitAt)] = message.slice(splitAt + 1);
        }
    });

    Object.keys(expected).forEach((label) => {
        if (reported[label] !== expected[label]) {
            throw new Error(
                `bindObjects() contract drifted for ${label}: expected ${expected[label]}, got ${reported[label]}`
            );
        }
    });

    if (result.datasetRows < 1) {
        throw new Error("bindObjects() did not populate the dataset container in Preview.");
    }

    console.log("Rendered binding contract passed.");
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
