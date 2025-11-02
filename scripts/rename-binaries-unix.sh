#!/bin/bash

VERSION=$(node -p "require('./package.json').version")
ARCH=$(uname -m)
PLATFORM=$(uname -s)

if [ "$PLATFORM" = "Darwin" ]; then
    # macOS section
    if [ "$ARCH" = "x86_64" ]; then
        NEW_NAME_INTEL="DialogCreator_${VERSION}_intel.dmg"
        ORIGINAL_FILE_INTEL="build/output/DialogCreator-${VERSION}.dmg"

        if [ -f "$ORIGINAL_FILE_INTEL" ]; then
            mv "$ORIGINAL_FILE_INTEL" "build/output/$NEW_NAME_INTEL"
        fi

    elif [ "$ARCH" = "arm64" ]; then
        NEW_NAME_ARM="DialogCreator_${VERSION}_silicon.dmg"
        ORIGINAL_FILE_ARM="build/output/DialogCreator-${VERSION}-arm64.dmg"
        NEW_NAME_INTEL="DialogCreator_${VERSION}_intel.dmg"
        ORIGINAL_FILE_INTEL="build/output/DialogCreator-${VERSION}.dmg"

        if [ -f "$ORIGINAL_FILE_ARM" ]; then
            mv "$ORIGINAL_FILE_ARM" "build/output/$NEW_NAME_ARM"
        fi

        if [ -f "$ORIGINAL_FILE_INTEL" ]; then
            mv "$ORIGINAL_FILE_INTEL" "build/output/$NEW_NAME_INTEL"
        fi

    else
        echo "Unknown macOS architecture: $ARCH"
        exit 1
    fi

elif [ "$PLATFORM" = "Linux" ]; then
    # Linux section
    if [ "$ARCH" = "x86_64" ]; then
        NEW_NAME_INTEL="DialogCreator_${VERSION}_intel.AppImage"
        ORIGINAL_FILE_INTEL="build/output/DialogCreator-${VERSION}.AppImage"

        if [ -f "$ORIGINAL_FILE_INTEL" ]; then
            mv "$ORIGINAL_FILE_INTEL" "build/output/$NEW_NAME_INTEL"
        fi

    elif [ "$ARCH" = "aarch64" ]; then
        NEW_NAME_INTEL="DialogCreator_${VERSION}_intel.AppImage"
        ORIGINAL_FILE_INTEL="build/output/DialogCreator-${VERSION}.AppImage"
        NEW_NAME_ARM="DialogCreator_${VERSION}_silicon.AppImage"
        ORIGINAL_FILE_ARM="build/output/DialogCreator-${VERSION}-arm64.AppImage"

        if [ -f "$ORIGINAL_FILE_ARM" ]; then
            mv "$ORIGINAL_FILE_ARM" "build/output/$NEW_NAME_ARM"
        fi

        if [ -f "$ORIGINAL_FILE_INTEL" ]; then
            mv "$ORIGINAL_FILE_INTEL" "build/output/$NEW_NAME_INTEL"
        fi

    else
        echo "Unknown Linux architecture: $ARCH"
        exit 1
    fi
else
    echo "Unsupported platform: $PLATFORM"
    exit 1
fi
