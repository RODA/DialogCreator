"use strict";

const assert = require("assert");
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

const checkLabelAlignment = async function(page) {
    const alignments = ["top", "middle", "bottom"];
    const translations = {
        en_US: "New dataset",
        de_DE: "Neuer Datensatz",
        fr_FR: "Nouveau jeu de données"
    };
    const dialog = {
        id: "preview-label-alignment",
        properties: { ...sampleDialog.properties },
        syntax: {},
        elements: [],
        i18n: {
            baseLocale: "en_US",
            locales: { en_US: {}, de_DE: {}, fr_FR: {} }
        }
    };

    alignments.forEach((alignment, index) => {
        const id = `label-${alignment}`;
        dialog.elements.push({
            id,
            type: "Label",
            nameid: `label_${alignment}`,
            value: translations.en_US,
            left: 24 + index * 130,
            top: 100,
            maxWidth: 100,
            lineClamp: 2,
            fontSize: 12,
            align: "left",
            valign: alignment,
            isEnabled: true,
            isVisible: true
        });

        Object.entries(translations).forEach(([locale, text]) => {
            dialog.i18n.locales[locale][`elements.${id}.value`] = text;
        });
    });

    await page.evaluate((dialog) => {
        window.dialogCreatorPreviewTransport.emit("renderPreview", dialog);
    }, dialog);
    await page.waitForSelector("#label-middle");
    await page.evaluate(() => document.fonts.ready);

    let baseLabels;
    for (const [locale, text] of Object.entries(translations)) {
        await page.selectOption("[aria-label='Preview language']", locale);

        const labels = await page.evaluate(() => {
            return Array.from(document.querySelectorAll(
                ".preview-canvas .element-wrapper[data-type='Label']"
            )).map((wrapper) => {
                const host = wrapper.firstElementChild;
                const wrapperRect = wrapper.getBoundingClientRect();
                const hostRect = host.getBoundingClientRect();
                return {
                    alignment: wrapper.dataset.valign,
                    text: host.textContent,
                    wrapperTop: wrapperRect.top,
                    wrapperHeight: wrapperRect.height,
                    hostTop: hostRect.top,
                    hostHeight: hostRect.height,
                    lineHeight: Number.parseFloat(getComputedStyle(host).lineHeight)
                };
            });
        });

        assert.strictEqual(labels.length, alignments.length, `${locale}: all labels should render`);
        if (locale === "en_US") {
            baseLabels = labels;
        }

        labels.forEach((label, index) => {
            const context = `${locale} ${label.alignment}`;
            const base = baseLabels[index];
            const anchorFraction = label.alignment === "bottom"
                ? 1
                : label.alignment === "middle" ? 0.5 : 0;
            const baseAnchor = base.wrapperTop + base.wrapperHeight * anchorFraction;
            const translatedAnchor = label.wrapperTop + label.wrapperHeight * anchorFraction;
            const expectedHostTop = label.wrapperTop
                + (label.wrapperHeight - label.hostHeight) * anchorFraction;

            assert.strictEqual(label.text, text, `${context}: translation should render`);
            assert.ok(
                Math.abs(translatedAnchor - baseAnchor) <= 1,
                `${context}: translation moved the label's vertical anchor`
            );
            assert.ok(
                Math.abs(label.hostTop - expectedHostTop) <= 1,
                `${context}: text is not aligned within its label box`
            );

            // German fits on one line in the allocated two-line box; French fills it.
            if (locale === "de_DE") {
                assert.ok(label.wrapperHeight - label.hostHeight > 10,
                    `${context}: fixture must leave room for vertical alignment`);
                assert.ok(Math.abs(label.hostHeight - label.lineHeight) <= 1,
                    `${context}: German fixture should remain one line`);
            } else if (locale === "fr_FR") {
                assert.ok(Math.abs(label.hostHeight - 2 * label.lineHeight) <= 1,
                    `${context}: French fixture should wrap to two lines`);
            }
        });
    }
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

    try {
        await checkLabelAlignment(page);
    } finally {
        await browser.close();
    }

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
