"use strict";

const path = require("path");
const { chromium } = require("playwright");

const rootDir = path.resolve(__dirname, "..");

// Exercise call()/block()/indent() through the real Preview prelude, so the
// check covers name injection as well as the rendered indentation.
const customJS = [
    "const simple = call('using', 'ess', 't.testhv(F3_agea ~ F2_gndr)');",
    "log('SIMPLE\\n' + simple);",
    "",
    "const complex = call('using', [",
    "    'ess',",
    "    block([",
    "        '.table <- wtable(B1_polintr, F2_gndr)',",
    "        'print(.table)',",
    "        'chisq.test(.table)',",
    "        'fischer.exact(.table)'",
    "    ])",
    "]);",
    "log('COMPLEX\\n' + complex);",
    "",
    "const filtered = call('using', [",
    "    call('subset', ['ess', 'F2_gndr == 1']),",
    "    't.testhv(F3_agea ~ F2_gndr)'",
    "]);",
    "log('FILTERED\\n' + filtered);",
    "",
    "log('OPTIONAL\\n' + call('using', ['ess', 'wtable(a)', '', null, undefined]));",
    "log('INDENT\\n' + indent('a\\nb', 2));",
    "log('EDGES\\n' + call('reset') + '|' + block());"
].join("\n");

const sampleDialog = {
    id: "syntax-contract-dialog",
    properties: {
        name: "SyntaxContract",
        title: "Syntax Contract",
        language: "en_US",
        runtimeProvider: "R",
        width: "320",
        height: "160",
        background: "#ffffff",
        fontSize: "12"
    },
    syntax: {},
    elements: [
        {
            id: "button-syntax",
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
        }
    ],
    customJS
};

const expected = {
    SIMPLE: [
        "using(",
        "  ess,",
        "  t.testhv(F3_agea ~ F2_gndr)",
        ")"
    ].join("\n"),

    COMPLEX: [
        "using(",
        "  ess,",
        "  {",
        "    .table <- wtable(B1_polintr, F2_gndr)",
        "    print(.table)",
        "    chisq.test(.table)",
        "    fischer.exact(.table)",
        "  }",
        ")"
    ].join("\n"),

    FILTERED: [
        "using(",
        "  subset(",
        "    ess,",
        "    F2_gndr == 1",
        "  ),",
        "  t.testhv(F3_agea ~ F2_gndr)",
        ")"
    ].join("\n"),

    OPTIONAL: [
        "using(",
        "  ess,",
        "  wtable(a)",
        ")"
    ].join("\n"),

    INDENT: "    a\n    b",

    EDGES: "reset()|{}"
};

const main = async function() {
    const browser = await chromium.launch();
    const page = await browser.newPage({
        viewport: {
            width: 600,
            height: 400
        }
    });

    const previewPath = path.join(rootDir, "dist", "web", "pages", "preview.html");
    await page.goto(`file://${previewPath}`);
    await page.waitForSelector("#preview-root");

    await page.evaluate((dialog) => {
        window.dialogCreatorPreviewTransport.emit("renderPreview", dialog);
    }, sampleDialog);

    await page.waitForSelector(".preview-canvas .element-wrapper[data-nameid='runButton']");

    const messages = await page.evaluate(() => {
        const events = window.dialogCreatorPreviewEvents || [];
        return events
            .filter((event) => event.type === "log")
            .map((event) => String(event.message));
    });

    const errorOverlay = await page.evaluate(() => {
        const overlay = document.querySelector(".customjs-error");
        return overlay ? overlay.textContent : "";
    });

    await browser.close();

    if (errorOverlay) {
        throw new Error(`Custom JS raised a runtime error: ${errorOverlay}`);
    }

    const rendered = {};
    messages.forEach((message) => {
        const breakAt = message.indexOf("\n");
        if (breakAt > 0) {
            rendered[message.slice(0, breakAt)] = message.slice(breakAt + 1);
        }
    });

    Object.keys(expected).forEach((label) => {
        if (!(label in rendered)) {
            throw new Error(`Syntax helper did not run for ${label}.`);
        }

        if (rendered[label] !== expected[label]) {
            throw new Error(
                `${label} drifted.\n--- expected ---\n${expected[label]}\n--- actual ---\n${rendered[label]}`
            );
        }
    });

    console.log("Rendered syntax contract passed.");
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
