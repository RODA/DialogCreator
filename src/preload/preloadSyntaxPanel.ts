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

    let lastHeight = 0;
    let lastMinContent = 0;
    const setMinHeightFor = (outerHeight: number) => {
        const style = window.getComputedStyle(container);
        const padTop = Number.parseFloat(style.paddingTop) || 0;
        const padBottom = Number.parseFloat(style.paddingBottom) || 0;
        const minContent = Math.max(0, outerHeight - padTop - padBottom);
        if (minContent === lastMinContent) return;
        lastMinContent = minContent;
        if (minContent > 0) {
            container.style.minHeight = `${minContent}px`;
        } else {
            container.style.removeProperty('min-height');
        }
    };
    const notifyResize = () => {
        const nextHeight = Math.ceil(container.scrollHeight);
        if (!Number.isFinite(nextHeight) || nextHeight <= 0) return;
        if (nextHeight <= lastHeight) {
            setMinHeightFor(lastHeight);
            return;
        }
        lastHeight = nextHeight;
        setMinHeightFor(lastHeight);
        coms.sendTo('main', 'syntaxpanel-resize', { height: lastHeight });
    };

    const render = (text: string) => {
        if (lastHeight > 0) {
            setMinHeightFor(lastHeight);
        }
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
