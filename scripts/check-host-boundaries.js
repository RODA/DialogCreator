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
        "fs",
        "path",
        "sqlite3",
        "zlib",
        "child_process",
        "os"
    ]
};

const allowedElectronImportPaths = [
    "src/main.ts",
    "src/preload",
    "src/shell-electron"
];

const sharedFeaturePaths = [
    "src/renderer",
    "src/editor",
    "src/preview",
    "src/code-editor",
    "src/defaults",
    "src/syntax-panel"
];

function normalizeRelative(filePath) {
    return path.relative(projectRoot, filePath).split(path.sep).join("/");
}

function shouldSkipSourceFile(filePath) {
    const relativePath = normalizeRelative(filePath);

    return relativePath.startsWith("src/bundles/");
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
            if (!shouldSkipSourceFile(entryPath)) {
                files.push(entryPath);
            }
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

function isSharedFeatureFile(filePath) {
    const relativePath = normalizeRelative(filePath);

    return sharedFeaturePaths.some((sharedPath) => {
        return relativePath === sharedPath || relativePath.startsWith(`${sharedPath}/`);
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
        if (importMatches(value, ["electron"])) {
            failures.push(`${relativePath} imports Electron outside the shell boundary`);
        }
    }
}

function checkSharedFeatureImports(filePath, imports, failures) {
    const relativePath = normalizeRelative(filePath);
    if (!isSharedFeatureFile(filePath)) {
        return;
    }

    for (const value of imports) {
        if (importMatches(value, forbiddenImports.sharedFeature)) {
            failures.push(`${relativePath} imports native dependency "${value}" in shared feature code`);
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

function checkRawMainComsChannels(filePath, source, failures) {
    const relativePath = normalizeRelative(filePath);
    const pattern = /\bcoms\.sendTo\(\s*['"]main['"]\s*,\s*['"]([^'"]+)['"]/g;
    const matches = Array.from(source.matchAll(pattern));

    for (const match of matches) {
        failures.push(
            `${relativePath} sends raw main-process channel "${match[1]}"; use an owner-local host helper`
        );
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
        checkSharedFeatureImports(filePath, imports, failures);
        checkWebShellImports(filePath, imports, failures);
        checkRawMainComsChannels(filePath, source, failures);
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
