#!/bin/bash

VERSION=$(node -p "require('./package.json').version")
ARCH=$(uname -m)
PLATFORM=$(uname -s)

ORIGINAL_APPLE_ARM="build/output/DialogCreator-${VERSION}-arm64.dmg"
NEW_APPLE_ARM="DialogCreator_${VERSION}_silicon.dmg"

ORIGINAL_APPLE_INTEL="build/output/DialogCreator-${VERSION}.dmg"
NEW_APPLE_INTEL="DialogCreator_${VERSION}_intel.dmg"

ORIGINAL_LINUX_ARM="build/output/DialogCreator-${VERSION}-arm64.AppImage"
NEW_LINUX_ARM="DialogCreator_${VERSION}_silicon.AppImage"

ORIGINAL_LINUX_INTEL="build/output/DialogCreator-${VERSION}.AppImage"
NEW_LINUX_INTEL="DialogCreator_${VERSION}_intel.AppImage"

if [ -f "$ORIGINAL_APPLE_ARM" ]; then
    mv "$ORIGINAL_APPLE_ARM" "build/output/$NEW_APPLE_ARM"
    echo "Renamed Apple silicon binary."
fi

if [ -f "$ORIGINAL_APPLE_INTEL" ]; then
    mv "$ORIGINAL_APPLE_INTEL" "build/output/$NEW_APPLE_INTEL"
    echo "Renamed Apple Intel binary."
fi

if [ -f "$ORIGINAL_LINUX_ARM" ]; then
    mv "$ORIGINAL_LINUX_ARM" "build/output/$NEW_LINUX_ARM"
    echo "Renamed Linux silicon binary."
fi

if [ -f "$ORIGINAL_LINUX_INTEL" ]; then
    mv "$ORIGINAL_LINUX_INTEL" "build/output/$NEW_LINUX_INTEL"
    echo "Renamed Linux Intel binary."
fi
