"use strict";

const assert = require("assert");
const { chromium } = require("playwright");
const { startRenderedWebServer } = require("./rendered-web-server");

const sampleDialog = {
    id: "browser-package-contract",
    properties: {
        name: "BrowserPackageContract",
        title: "Browser Package Contract",
        language: "en_US",
        runtimeProvider: "R",
        width: "640",
        height: "480",
        fontSize: "12"
    },
    syntax: {},
    elements: [],
    customJS: "log('package contract');"
};

const main = async function() {
    const server = await startRenderedWebServer();
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        await page.goto(server.url);
        await page.waitForSelector("#dialogcreator-browser-frame");

        const result = await page.evaluate(async (dialog) => {
            const host = window.dialogCreatorBrowserHost;
            const json = JSON.stringify(dialog, null, 4);
            const saved = host.files.createPackage(json);

            if (!saved.ok) {
                return saved;
            }

            const file = new File([saved.blob], saved.fileName, { type: 'application/zip' });
            const loaded = await host.files.readPackage(file);

            return {
                ok: loaded.ok,
                fileName: saved.fileName,
                byteLength: saved.bytes.length,
                loadedJson: loaded.ok ? loaded.json : '',
                reason: loaded.ok ? '' : loaded.reason
            };
        }, sampleDialog);

        assert.strictEqual(result.ok, true, result.reason || "browser package round trip should succeed");
        assert.strictEqual(result.fileName, "BrowserPackageContract.dc.zip");
        assert.ok(result.byteLength > 100, "browser package bytes should be created");

        const loaded = JSON.parse(result.loadedJson);
        assert.strictEqual(loaded.properties.name, "BrowserPackageContract");
        assert.strictEqual(loaded.customJS, "log('package contract');");

        console.log("Rendered browser package contract passed.");
    } finally {
        await browser.close();
        await server.close();
    }
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
