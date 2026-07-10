"use strict";

const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const sourceRoot = path.join(projectRoot, "src");

const forbiddenImports = {
    core: [
        "electron",
        "fs",
        "path",
        "sqlite3",
        "zlib"
    ],
    webShell: [
        "electron",
        "fs",
        "path",
        "sqlite3",
        "zlib"
    ],
    sharedFeature: [
        "electron"
    ]
};

const allowedElectronImportPaths = [
    path.join("src", "main.ts"),
    path.join("src", "preload"),
    path.join("src", "shell-electron")
];

function normalizeRelative(filePath) {
    return path.relative(projectRoot, filePath).split(path.sep).join("/");
}

function readSourceFiles(dirPath) {
    if (!fs.existsSync(dirPath)) {
        return [];
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            files.push(...readSourceFiles(entryPath));
            continue;
        }

        if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
            files.push(entryPath);
        }
    }

    return files;
}

function readImports(source) {
    const imports = [];
    const patterns = [
        /\bimport\s+(?:type\s+)?(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]/g,
        /\brequire\(\s*['"]([^'"]+)['"]\s*\)/g,
        /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g
    ];

    for (const pattern of patterns) {
        let match = pattern.exec(source);
        while (match) {
            imports.push(match[1]);
            match = pattern.exec(source);
        }
    }

    return imports;
}

function importMatches(value, forbidden) {
    return forbidden.some((name) => {
        return value === name || value.startsWith(`${name}/`);
    });
}

function isAllowedElectronImport(filePath) {
    const relativePath = normalizeRelative(filePath);

    return allowedElectronImportPaths.some((allowedPath) => {
        return relativePath === allowedPath || relativePath.startsWith(`${allowedPath}/`);
    });
}

function checkCoreImports(filePath, imports, failures) {
    const relativePath = normalizeRelative(filePath);
    if (!relativePath.startsWith("src/core/")) {
        return;
    }

    for (const value of imports) {
        if (importMatches(value, forbiddenImports.core)) {
            failures.push(`${relativePath} imports host dependency "${value}"`);
        }
    }
}

function checkElectronImports(filePath, imports, failures) {
    const relativePath = normalizeRelative(filePath);
    if (isAllowedElectronImport(filePath)) {
        return;
    }

    for (const value of imports) {
        if (importMatches(value, forbiddenImports.sharedFeature)) {
            failures.push(`${relativePath} imports Electron outside the shell boundary`);
        }
    }
}

function checkWebShellImports(filePath, imports, failures) {
    const relativePath = normalizeRelative(filePath);
    if (!relativePath.startsWith("src/shell-web/")) {
        return;
    }

    for (const value of imports) {
        if (importMatches(value, forbiddenImports.webShell)) {
            failures.push(`${relativePath} imports native dependency "${value}"`);
        }
    }
}

function main() {
    const failures = [];
    const files = readSourceFiles(sourceRoot);

    for (const filePath of files) {
        const source = fs.readFileSync(filePath, "utf8");
        const imports = readImports(source);

        checkCoreImports(filePath, imports, failures);
        checkElectronImports(filePath, imports, failures);
        checkWebShellImports(filePath, imports, failures);
    }

    if (failures.length > 0) {
        console.error("Host boundary check failed:");
        for (const failure of failures) {
            console.error(`- ${failure}`);
        }
        process.exit(1);
    }

    console.log("Host boundary check passed.");
}

main();
