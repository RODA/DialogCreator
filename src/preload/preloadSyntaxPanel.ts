/*
    Copyright (c) 2025, Adrian Dusa
    All rights reserved.

    License: Academic Non-Commercial License (see LICENSE file for details).
    SPDX-License-Identifier: LicenseRef-ANCL-AdrianDusa
*/

import { coms } from "../modules/coms";

window.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('syntaxpanel-root') || (() => {
        const el = document.createElement('div');
        el.id = 'syntaxpanel-root';
        document.body.appendChild(el);
        return el;
    })();

    const container = document.createElement('div');
    container.className = 'syntaxpanel-container';
    const pre = document.createElement('pre');
    pre.className = 'syntaxpanel-pre';
    container.appendChild(pre);
    (root as HTMLElement).appendChild(container);

    const notifyResize = () => {
        coms.sendTo(
            'main',
            'syntaxpanel-resize',
            { height: Math.ceil(container.scrollHeight) }
        );
    };

    const render = (text: string) => {
        pre.textContent = String(text ?? '');
        requestAnimationFrame(() => notifyResize());
    };

    coms.on('renderSyntaxCommand', (...args: unknown[]) => {
        const text = String(args[0] ?? '');
        render(text);
    });

    // Initial sizing in case of race between load and first render
    setTimeout(() => notifyResize(), 50);
});
