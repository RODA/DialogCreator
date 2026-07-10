
#!/usr/bin/env bash
set -euo pipefail

VERSION=$(node -p "require('./package.json').version")
NAME=$(node -p "(p=> (p.build && p.build.productName) ? p.build.productName : p.name)(require('./package.json'))")
# Use a filename-safe variant (replace spaces with underscores)
NAME_FILE=$(printf '%s' "$NAME" | sed 's/[[:space:]]\+/_/g')

ORIGINAL_LINUX_INTEL="build/output/${NAME_FILE}_${VERSION}_x64.AppImage"
LEGACY_LINUX_INTEL="build/output/${NAME}-${VERSION}.AppImage"
NEW_LINUX_INTEL="${NAME_FILE}_intel.AppImage"

copied_any=0

if [ -f "$ORIGINAL_LINUX_INTEL" ]; then
    echo "Copying $(basename "$ORIGINAL_LINUX_INTEL") -> $NEW_LINUX_INTEL"
    cp -f "$ORIGINAL_LINUX_INTEL" "build/output/$NEW_LINUX_INTEL"
    copied_any=1
elif [ -f "$LEGACY_LINUX_INTEL" ]; then
    echo "Copying $(basename "$LEGACY_LINUX_INTEL") -> $NEW_LINUX_INTEL"
    cp -f "$LEGACY_LINUX_INTEL" "build/output/$NEW_LINUX_INTEL"
    copied_any=1
fi

if [ "$copied_any" -eq 0 ]; then
    echo "No matching artifacts found to copy in build/output for version $VERSION." >&2
fi

# Ensure AppImage files are executable
echo "Marking .AppImage files executable in build/output..."
count=0
while IFS= read -r -d '' f; do
    chmod +x "$f" || true
    echo "Made executable: $(basename "$f")"
    count=$((count+1))
done < <(find build/output -maxdepth 1 -type f -name "*.AppImage" -print0)

if [ "$count" -eq 0 ]; then
    echo "No .AppImage files found to make executable."
fi
