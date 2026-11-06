# Dialog Creator
See: https://roda.github.io/DialogCreator/

## Publishing macOS artifacts

After `npm run staple`, run `npm run publish` on macOS with an authenticated
GitHub CLI (`gh`). It uploads the existing universal DMG, updater ZIP, ZIP
blockmap, and `latest-mac.yml` from `build/output/` to the existing `latest`
release in `RODA/DialogCreator`. It replaces same-named assets and uploads the
updater metadata after the binaries. Once those uploads succeed, it removes
versioned macOS assets older than the version just published.

License: Academic Non-Commercial License (see `LICENSE` for details).
