"use strict";

const releasePage = "https://github.com/RODA/DialogCreator/releases/tag/latest";
const downloads = [
    {
        id: "download-windows",
        detail: "windows-detail",
        pattern: /^DialogCreator_(?:setup_intel|Setup_[\d.]+)\.exe$/i,
        label: "EXE installer"
    },
    {
        id: "download-portable",
        pattern: /^DialogCreator_(?:portable_intel|Portable_[\d.]+)\.exe$/i
    },
    {
        id: "download-mac",
        detail: "mac-detail",
        pattern: /^DialogCreator_(?:[\d.]+_)?universal\.dmg$/i,
        label: "DMG disk image · Universal"
    },
    {
        id: "download-linux",
        detail: "linux-detail",
        pattern: /^DialogCreator_(?:intel|[\d.]+_(?:x86_64|x64))\.AppImage$/i,
        label: "AppImage · x86-64"
    }
];

async function refreshDownloads() {
    try {
        const response = await fetch(
            "https://api.github.com/repos/RODA/DialogCreator/releases/tags/latest",
            { signal: AbortSignal.timeout(8000) }
        );

        if (!response.ok) {
            return;
        }

        const release = await response.json();

        if (!Array.isArray(release.assets)) {
            return;
        }

        for (const download of downloads) {
            const link = document.getElementById(download.id);
            const candidates = release.assets.filter((asset) => {
                return typeof asset.name === "string" && download.pattern.test(asset.name);
            });
            candidates.sort((first, second) => {
                return String(second.updated_at).localeCompare(String(first.updated_at));
            });
            const asset = candidates[0];

            if (
                !asset ||
                typeof asset.browser_download_url !== "string" ||
                !asset.browser_download_url.startsWith(
                    "https://github.com/RODA/DialogCreator/releases/download/"
                )
            ) {
                link.href = releasePage;
                link.textContent = "Check available release files ↗";

                if (download.detail) {
                    document.getElementById(download.detail).textContent = "See GitHub for current availability.";
                }

                continue;
            }

            link.href = asset.browser_download_url;

            if (download.detail && typeof asset.size === "number") {
                const megabytes = Math.round(asset.size / 1000000);
                document.getElementById(download.detail).textContent = `${download.label} · ${megabytes} MB`;
            }
        }
    } catch {
        // Keep the verified download links usable when GitHub's API is unavailable.
    }
}

refreshDownloads();
