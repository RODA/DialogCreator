"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const yaml = require("js-yaml");
const { appBuilderPath } = require("app-builder-bin");

const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "build", "output");
const latestPath = path.join(outputDir, "latest.yml");

function fail(message) {
    console.error(message);
    process.exit(1);
}

function sha512Base64(filePath) {
    const hash = crypto.createHash("sha512");
    hash.update(fs.readFileSync(filePath));
    return hash.digest("base64");
}

function runAppBuilder(args) {
    const result = spawnSync(appBuilderPath, args, {
        cwd: rootDir,
        encoding: "utf8",
        stdio: "pipe"
    });

    if (result.status !== 0) {
        const output = [result.stdout, result.stderr]
            .filter(Boolean)
            .join("\n")
            .trim();

        fail(`app-builder failed while refreshing Windows update metadata.\n${output}`);
    }
}

function readLatestInfo() {
    if (!fs.existsSync(latestPath)) {
        fail(`Windows update metadata not found: ${latestPath}`);
    }

    return yaml.load(fs.readFileSync(latestPath, "utf8"));
}

function findInstallerPath(latestInfo) {
    if (!latestInfo || typeof latestInfo.path !== "string") {
        fail("latest.yml does not contain a top-level updater path.");
    }

    const installerPath = path.join(outputDir, latestInfo.path);
    if (!fs.existsSync(installerPath)) {
        fail(`Windows updater installer not found: ${installerPath}`);
    }

    return installerPath;
}

function refreshBlockmap(installerPath) {
    const blockmapPath = `${installerPath}.blockmap`;

    runAppBuilder([
        "blockmap",
        "--input",
        installerPath,
        "--output",
        blockmapPath
    ]);

    if (!fs.existsSync(blockmapPath)) {
        fail(`Windows updater blockmap was not created: ${blockmapPath}`);
    }
}

function updateLatestInfo(latestInfo, installerPath) {
    const installerName = path.basename(installerPath);
    const installerSize = fs.statSync(installerPath).size;
    const installerSha512 = sha512Base64(installerPath);

    latestInfo.path = installerName;
    latestInfo.sha512 = installerSha512;

    if (Array.isArray(latestInfo.files)) {
        for (const fileInfo of latestInfo.files) {
            if (
                fileInfo &&
                (fileInfo.path === installerName || fileInfo.url === installerName)
            ) {
                fileInfo.sha512 = installerSha512;
                fileInfo.size = installerSize;
            }
        }
    }

    fs.writeFileSync(latestPath, yaml.dump(latestInfo, {
        lineWidth: 120,
        noRefs: true
    }));
}

const latestInfo = readLatestInfo();
const installerPath = findInstallerPath(latestInfo);

refreshBlockmap(installerPath);
updateLatestInfo(latestInfo, installerPath);

console.log(`Refreshed Windows updater metadata for ${path.basename(installerPath)}`);
