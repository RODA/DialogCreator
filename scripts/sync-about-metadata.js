"use strict";

const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const packagePath = path.join(rootDir, "package.json");
const aboutPath = path.join(rootDir, "src", "pages", "about.html");
const copyrightStartYear = 2025;

function copyrightYears(today = new Date()) {
    const currentYear = today.getFullYear();

    if (currentYear <= copyrightStartYear) {
        return String(copyrightStartYear);
    }

    return `${copyrightStartYear}-${currentYear}`;
}

function syncAboutMetadata() {
    const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    const version = String(pkg.version || "").trim();

    if (!version) {
        throw new Error(`Missing version in ${packagePath}`);
    }

    let html = fs.readFileSync(aboutPath, "utf8");
    html = html.replace(
        /<div class="version">Version [^<]*<\/div>/,
        `<div class="version">Version ${version}</div>`
    );
    html = html.replace(
        /<p class="meta">Copyright © [^<]*, Adrian Dusa<\/p>/,
        `<p class="meta">Copyright © ${copyrightYears()}, Adrian Dusa</p>`
    );

    fs.writeFileSync(aboutPath, html);
}

if (require.main === module) {
    syncAboutMetadata();
}

module.exports = {
    syncAboutMetadata,
    copyrightYears
};
