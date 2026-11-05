# Product website design

DialogCreator's public homepage and download page share `docs/css/site.css`.
This is the proposed visual foundation for the DialogCreator, StatConverter,
and DialogR websites. The other product websites have not yet been migrated.

## Shared identity

- Warm white background: `--paper`, #faf9f6.
- Charcoal text and primary buttons: `--ink`, #252a30.
- Restrained blue for emphasis: `--blue`, #3f7092.
- Pale blue panels: `--surface`, #edf1f4; `--surface-deep`, #e2e9ee.
- Inter for interface text; a serif italic accent in major headings.
- Compact header, consistent content width, clear calls to action, and a
  common footer structure. Download pages use operating-system cards.
- Each product keeps its official logo. Website styling does not change the
  desktop or browser application's interface.

Use the shared palette and layout when adapting the other product websites.
Avoid assigning an unrelated colour theme to each product.

## Content and behaviour

- The homepage tour uses existing documentation images, in this order:
  Design, Add behaviour, Preview. It is labelled as a screenshot walkthrough.
- Playback can be paused; choosing a step pauses automatic advancement.
  Reduced-motion preferences disable autoplay and transitions.
- The DialogR case study is based on its actual
  `dialogs/r/frequencies/actions.js`: `tableCall()` adds `vlabel = TRUE` when
  requested, and `buildCommand()` wraps the table call in `using()`.
  It is an illustrative command, not an embedded executable dialog.
- Download links have working HTML defaults and are refreshed from the GitHub
  `latest` release. If the API cannot be reached, defaults remain usable. If
  the release has no matching asset, the link leads to the release file list.
- Recheck the static download defaults when publishing a release, especially
  the versioned Linux AppImage filename. Do not assume every platform has the
  same release version or signing status.

## Publishing

The existing Pages workflow copies `docs/` to its artifact root and the built
browser app to `live/`. No new framework or separate website build is needed.
The user manual, API reference, and build instructions use the shared website shell.
Generated manual.html and api.html content and navigation scripts are loaded by
docs/scripts/documentation.js; website-only reading styles live in
docs/css/documentation.css. The application and PDF documentation are unchanged.
