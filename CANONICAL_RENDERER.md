# Canonical portable dialog renderer

DialogCreator owns the renderer used by its Editor/Preview and by DialogForge.

- `src/library/renderutils.ts` owns control construction and presentation updates. The Editor uses this same factory, adding its authoring covers and selection behavior.
- `src/renderer/dialogRenderer.ts` owns portable dialog mounting, runtime control interaction, group reconstruction, actions and attachment layout. Preview is a host adapter in `src/preview/previewController.ts`.
- `src/renderer/documentLocalization.ts` owns translated presentation while preserving option and Choice identities.
- `src/library/api.ts` is the canonical UI facade; renderer host capabilities are explicit callbacks.
- `src/css/global.css`, `editor.css`, `preview.css` and `src/assets/` are the canonical visual resources. The consumer package includes their exact bytes.
- `src/core/layout/elementAnchoring.ts` owns the attachment contract. Consumers use the pure `@dialogcreator/renderer/core` entry point for validation and localization, including on the server.

`npm run package:renderer -- /destination` produces a self-contained npm archive from these sources. `src/renderer/package.json` versions that artifact. The archive contains bundled JavaScript, declarations, the exact CSS/assets and a SHA-256 source manifest. It has no Electron, filesystem or transport dependency. No package is published by this command.

DialogForge pins that archive in `vendor/` and `package-lock.json`. Its native and browser builds stage the same package assets. Its backend adapter translates runtime data, persisted state, conditions and command events to the canonical UI. Plot content is a host extension: the renderer still owns its wrapper and attachment layout. Venn/FISS toolbar composition remains in the product adapter and uses canonical wrapper selectors.

Changes to control DOM, presentation, interaction, translation or attachment behavior belong here. Update the package version and regenerate the consumer dependency; do not patch generated bundles or add consumer-specific standard control builders/styles. A consumer checkout builds without a sibling DialogCreator checkout or a public package registry.

Rendered evidence includes DialogCreator Preview/editor anchoring and DialogForge's real dialog page, all standard controls, real translated Add variables actions, direct-package/consumer label comparison, restored state and runtime lists, plus the actual Venn product dialog/actions/renderer. These bounded checks do not certify backend R execution or installer releases.
