#!/usr/bin/env bash
set -euo pipefail

VERSION=$(node -p "require('./package.json').version")
NAME=$(node -p "(p=> (p.build && p.build.productName) ? p.build.productName : p.name)(require('./package.json'))")
# Use a filename-safe variant (replace spaces with underscores)
NAME_FILE=$(printf '%s' "$NAME" | sed 's/[[:space:]]\+/_/g')

ORIGINAL_UNIVERSAL_DMG="build/output/${NAME_FILE}_${VERSION}_universal.dmg"
STABLE_UNIVERSAL_DMG="${NAME_FILE}_universal.dmg"
LATEST_MAC="build/output/latest-mac.yml"

if [ -f "$LATEST_MAC" ]; then
    node <<'NODE'
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const latestPath = path.join('build', 'output', 'latest-mac.yml');
const latest = yaml.load(fs.readFileSync(latestPath, 'utf8')) || {};
const files = Array.isArray(latest.files) ? latest.files : [];
const zipEntry = files.find((entry) => /\.zip$/i.test(String((entry || {}).url || '')));

if (!zipEntry) {
    process.exit(0);
}

const zipPath = path.join('build', 'output', String(zipEntry.url || ''));
if (fs.existsSync(zipPath)) {
    zipEntry.size = fs.statSync(zipPath).size;
}

latest.files = [zipEntry];
latest.path = String(zipEntry.url || '');
latest.sha512 = zipEntry.sha512;

fs.writeFileSync(latestPath, yaml.dump(latest, {
    lineWidth: -1,
    noRefs: true
}));
NODE
fi

LEGACY_UNIVERSAL_DMG="build/output/${NAME}-${VERSION}-universal.dmg"
DMG_SOURCE=""

if [ -f "$ORIGINAL_UNIVERSAL_DMG" ]; then
    DMG_SOURCE="$ORIGINAL_UNIVERSAL_DMG"
elif [ -f "$LEGACY_UNIVERSAL_DMG" ]; then
    DMG_SOURCE="$LEGACY_UNIVERSAL_DMG"
fi

if [ -n "$DMG_SOURCE" ]; then
    echo "Renaming $(basename "$DMG_SOURCE") -> $STABLE_UNIVERSAL_DMG"
    mv "$DMG_SOURCE" "build/output/$STABLE_UNIVERSAL_DMG"
else
    echo "No universal DMG found at $ORIGINAL_UNIVERSAL_DMG." >&2
fi

rm -f build/output/*.dmg.blockmap
