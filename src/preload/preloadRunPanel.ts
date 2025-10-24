import { coms } from "../modules/coms";

window.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('runpanel-root') || (() => {
        const el = document.createElement('div');
        el.id = 'runpanel-root';
        document.body.appendChild(el);
        return el;
    })();

    const container = document.createElement('div');
    container.className = 'runpanel-container';
    const pre = document.createElement('pre');
    pre.className = 'runpanel-pre';
    container.appendChild(pre);
    (root as HTMLElement).appendChild(container);

    const notifyResize = () => {
        coms.sendTo(
            'main',
            'runpanel-resize',
            { height: Math.ceil(container.scrollHeight) }
        );
    };

    const render = (text: string) => {
        pre.textContent = String(text ?? '');
        requestAnimationFrame(() => notifyResize());
    };

    coms.on('renderRunCommand', (...args: unknown[]) => {
        const text = String(args[0] ?? '');
        render(text);
    });

    // Initial sizing in case of race between load and first render
    setTimeout(() => notifyResize(), 50);
});
