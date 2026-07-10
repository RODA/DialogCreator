"use strict";

const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");

const rootDir = path.resolve(__dirname, "..");
const outDir = path.join(rootDir, "docs", "live");

const copyDirectory = function(source, target) {
    if (!fs.existsSync(source)) {
        return;
    }

    fs.mkdirSync(target, { recursive: true });

    for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
        const sourcePath = path.join(source, entry.name);
        const targetPath = path.join(target, entry.name);

        if (entry.isDirectory()) {
            copyDirectory(sourcePath, targetPath);
            continue;
        }

        fs.copyFileSync(sourcePath, targetPath);
    }
};

const copyFiles = function(source, target, files) {
    if (!fs.existsSync(source)) {
        return;
    }

    fs.mkdirSync(target, { recursive: true });

    for (const file of files) {
        const sourcePath = path.join(source, file);
        const targetPath = path.join(target, file);

        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, targetPath);
        }
    }
};

const removeDirectory = function(dirPath) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
            fs.rmSync(dirPath, { recursive: true, force: true });
            return;
        } catch (error) {
            if (attempt === 2) {
                throw error;
            }
        }
    }
};

const writeRootIndex = function() {
    const sourcePath = path.join(outDir, "shell-web", "pages", "browser.html");
    const targetPath = path.join(outDir, "index.html");
    const html = fs.readFileSync(sourcePath, "utf8")
        .replace(/href="\/css\//g, 'href="css/')
        .replace(/href="\/shell-web\//g, 'href="shell-web/')
        .replace(/src="\/pages\//g, 'src="pages/')
        .replace(/src="\/shell-web\//g, 'src="shell-web/')
        .replace(/href="\.\.\/\.\.\/css\//g, 'href="css/')
        .replace(/href="\.\/browser\.css"/g, 'href="shell-web/pages/browser.css"')
        .replace(/src="\.\.\/\.\.\/pages\//g, 'src="pages/')
        .replace(/src="\.\/browserComposition\.js"/g, 'src="shell-web/pages/browserComposition.js"');

    fs.writeFileSync(targetPath, html);
};

const injectBrowserEditorScript = function() {
    const editorPath = path.join(outDir, "pages", "editor.html");
    let html = fs.readFileSync(editorPath, "utf8");

    if (!html.includes("browserEditor.js")) {
        html = html.replace(
            "</body>",
            "        <script src=\"./browserEditor.js\"></script>\n    </body>"
        );
    }

    fs.writeFileSync(editorPath, html);
};

const injectBrowserCodeScript = function() {
    const codePath = path.join(outDir, "pages", "code.html");
    let html = fs.readFileSync(codePath, "utf8");

    if (!html.includes("browserCodeEditor.js")) {
        html = html.replace(
            "</body>",
            "    <script src=\"./browserCodeEditor.js\"></script>\n  </body>"
        );
    }

    fs.writeFileSync(codePath, html);
};

const injectBrowserDefaultsScript = function() {
    const defaultsPath = path.join(outDir, "pages", "defaults.html");
    let html = fs.readFileSync(defaultsPath, "utf8");

    if (!html.includes("browserDefaults.js")) {
        html = html.replace(
            "</body>",
            "        <script src=\"./browserDefaults.js\"></script>\n    </body>"
        );
    }

    fs.writeFileSync(defaultsPath, html);
};

const injectBrowserPreviewScript = function() {
    const previewPath = path.join(outDir, "pages", "preview.html");
    let html = fs.readFileSync(previewPath, "utf8");

    if (!html.includes("browserPreview.js")) {
        html = html.replace(
            "</body>",
            "    <script src=\"./browserPreview.js\"></script>\n  </body>"
        );
    }

    fs.writeFileSync(previewPath, html);
};

const main = async function() {
    removeDirectory(outDir);
    fs.mkdirSync(outDir, { recursive: true });

    copyDirectory(path.join(rootDir, "src", "css"), path.join(outDir, "css"));
    copyDirectory(path.join(rootDir, "src", "assets"), path.join(outDir, "assets"));
    copyDirectory(path.join(rootDir, "src", "pages"), path.join(outDir, "pages"));
    copyFiles(path.join(rootDir, "docs"), path.join(outDir, "docs"), [
        "manual.html",
        "api.html"
    ]);
    copyDirectory(path.join(rootDir, "docs", "css"), path.join(outDir, "docs", "css"));
    copyDirectory(path.join(rootDir, "docs", "fonts"), path.join(outDir, "docs", "fonts"));
    copyDirectory(path.join(rootDir, "docs", "images"), path.join(outDir, "docs", "images"));
    copyDirectory(path.join(rootDir, "docs", "scripts"), path.join(outDir, "docs", "scripts"));
    copyDirectory(
        path.join(rootDir, "src", "shell-web", "pages"),
        path.join(outDir, "shell-web", "pages")
    );
    writeRootIndex();

    injectBrowserEditorScript();
    injectBrowserCodeScript();
    injectBrowserDefaultsScript();
    injectBrowserPreviewScript();

    await esbuild.build({
        entryPoints: [path.join(rootDir, "src", "shell-web", "browserComposition.ts")],
        bundle: true,
        outfile: path.join(outDir, "shell-web", "pages", "browserComposition.js"),
        platform: "browser",
        format: "iife",
        target: "es2022",
        sourcemap: true
    });

    await esbuild.build({
        entryPoints: [path.join(rootDir, "src", "shell-web", "browserEditor.ts")],
        bundle: true,
        outfile: path.join(outDir, "pages", "browserEditor.js"),
        platform: "browser",
        format: "iife",
        target: "es2022",
        sourcemap: true
    });

    await esbuild.build({
        entryPoints: [path.join(rootDir, "src", "shell-web", "browserCodeEditor.ts")],
        bundle: true,
        outfile: path.join(outDir, "pages", "browserCodeEditor.js"),
        platform: "browser",
        format: "iife",
        target: "es2022",
        sourcemap: true
    });

    await esbuild.build({
        entryPoints: [path.join(rootDir, "src", "shell-web", "browserDefaults.ts")],
        bundle: true,
        outfile: path.join(outDir, "pages", "browserDefaults.js"),
        platform: "browser",
        format: "iife",
        target: "es2022",
        sourcemap: true
    });

    await esbuild.build({
        entryPoints: [path.join(rootDir, "src", "shell-web", "browserPreview.ts")],
        bundle: true,
        outfile: path.join(outDir, "pages", "browserPreview.js"),
        platform: "browser",
        format: "iife",
        target: "es2022",
        sourcemap: true
    });

    const browserBundles = [
        path.join(outDir, "pages", "browserEditor.js"),
        path.join(outDir, "pages", "browserCodeEditor.js"),
        path.join(outDir, "pages", "browserDefaults.js"),
        path.join(outDir, "pages", "browserPreview.js")
    ];
    const forbiddenBundleMarkers = [
        "electron",
        "sqlite3",
        "node:fs",
        "node:path",
        "node:zlib",
        "require(\"fs\")",
        "require(\"path\")",
        "require(\"zlib\")"
    ];
    const leakedMarkers = forbiddenBundleMarkers.flatMap((marker) => {
        return browserBundles
            .filter((bundlePath) => fs.readFileSync(bundlePath, "utf8").includes(marker))
            .map((bundlePath) => `${path.basename(bundlePath)}:${marker}`);
    });

    if (leakedMarkers.length > 0) {
        throw new Error(`Web editor bundle contains native markers: ${leakedMarkers.join(", ")}`);
    }

    console.log(`Web shell built at ${path.relative(rootDir, outDir)}`);
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
