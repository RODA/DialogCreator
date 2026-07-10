import { coms, setRendererTransport } from '../modules/coms';
import type { RendererTransport } from '../core/ipc/rendererTransport';

export function bootSyntaxPanel(transport: RendererTransport): void {
    setRendererTransport(transport);

    window.addEventListener('DOMContentLoaded', () => {
        const root = document.getElementById('syntaxpanel-root') || (() => {
            const element = document.createElement('div');
            element.id = 'syntaxpanel-root';
            document.body.appendChild(element);
            return element;
        })();

        const container = document.createElement('div');
        container.className = 'syntaxpanel-container';
        const pre = document.createElement('pre');
        pre.className = 'syntaxpanel-pre';
        container.appendChild(pre);
        (root as HTMLElement).appendChild(container);

        let lastHeight = 0;
        let lastMinContent = 0;

        const setMinHeightFor = function(outerHeight: number): void {
            const style = window.getComputedStyle(container);
            const padTop = Number.parseFloat(style.paddingTop) || 0;
            const padBottom = Number.parseFloat(style.paddingBottom) || 0;
            const minContent = Math.max(0, outerHeight - padTop - padBottom);

            if (minContent === lastMinContent) {
                return;
            }

            lastMinContent = minContent;
            if (minContent > 0) {
                container.style.minHeight = `${minContent}px`;
            } else {
                container.style.removeProperty('min-height');
            }
        };

        const notifyResize = function(): void {
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

        const render = function(text: string): void {
            if (lastHeight > 0) {
                setMinHeightFor(lastHeight);
            }

            pre.textContent = String(text ?? '');
            requestAnimationFrame(() => notifyResize());
        };

        coms.on('renderSyntaxCommand', (...args: unknown[]) => {
            render(String(args[0] ?? ''));
        });

        setTimeout(() => notifyResize(), 50);
    });
}
