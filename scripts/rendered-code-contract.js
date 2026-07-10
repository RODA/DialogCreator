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
            width: 900,
            height: 620
        }
    });

    try {
        const codeUrl = pathToFileURL(
            path.join(rootDir, "dist", "web", "pages", "code.html")
        ).toString();

        await page.goto(codeUrl);
        await page.waitForSelector("#codeMount");

        const ready = await page.evaluate(() => {
            const status = document.getElementById("codeStatus")?.textContent || "";
            const textarea = document.getElementById("codeText");
            return {
                status,
                fallbackReady: Boolean(textarea),
                mountHeight: document.getElementById("codeMount")?.getBoundingClientRect().height || 0
            };
        });

        assert.ok(
            ready.status.includes("Ready") || ready.status.includes("No syntax errors"),
            `unexpected status: ${ready.status}`
        );
        assert.ok(ready.fallbackReady, "browser code page should mount a fallback editor when CM6 is not preloaded");
        assert.ok(ready.mountHeight > 100, "code editor mount should have visible height");

        await page.fill("#codeText", "setValue(x, 1);");
        await page.click("#saveCode");

        const saved = await page.evaluate(() => {
            return new Promise((resolve) => {
                const host = (window).dialogCreatorBrowserCodeEvents || [];
                const savedEvent = host.find((event) => event.type === "saved");
                if (savedEvent) {
                    resolve(savedEvent);
                    return;
                }
                setTimeout(() => {
                    const next = (window).dialogCreatorBrowserCodeEvents || [];
                    resolve(next.find((event) => event.type === "saved") || null);
                }, 100);
            });
        });

        assert.deepStrictEqual(saved, {
            type: "saved",
            code: "setValue(x, 1);"
        });

        console.log("Rendered code editor contract passed.");
    } finally {
        await browser.close();
    }
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
