/*
    Copyright (c) 2025, Adrian Dusa
    All rights reserved.

    License: Academic Non-Commercial License (see LICENSE file for details).
    SPDX-License-Identifier: LicenseRef-ANCL-AdrianDusa
*/

import * as path from "path";

import { bootCodeEditor } from "../code-editor/codeEditorController";
import { createElectronRendererTransport } from "../shell-electron/renderer/electronRendererTransport";

function loadCodeMirrorFromElectronHost(): NonNullable<typeof window.CM6> | null {
    const fs = require('fs');
    const candidates: string[] = [];

    candidates.push(path.join(__dirname, '..', '..', 'src', 'bundles', 'codemirror.bundle.js'));
    candidates.push(path.join(__dirname, '..', '..', 'bundles', 'codemirror.bundle.js'));
    candidates.push(path.join(__dirname, '..', 'bundles', 'codemirror.bundle.js'));
    candidates.push(path.join(process.cwd?.() || '.', 'src', 'bundles', 'codemirror.bundle.js'));

    if (process && process.resourcesPath) {
        candidates.push(path.join(process.resourcesPath, 'bundles', 'codemirror.bundle.js'));
    }

    for (const bundle of candidates) {
        try {
            if (bundle && fs.existsSync(bundle)) {
                require(bundle);
                break;
            }
        } catch {
            // Try the next candidate.
        }
    }

    return window.CM6 || null;
}

window.addEventListener('DOMContentLoaded', () => {
    void bootCodeEditor({
        transport: createElectronRendererTransport(),
        loadCodeMirror: loadCodeMirrorFromElectronHost,
        parseJavaScript(code: string): void {
            const acorn = require('acorn');
            acorn.parse(
                code,
                {
                    ecmaVersion: 'latest',
                    sourceType: 'script',
                    allowReturnOutsideFunction: true,
                    allowAwaitOutsideFunction: true
                }
            );
        }
    });
});
