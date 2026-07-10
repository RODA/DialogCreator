import { ipcRenderer } from 'electron';

import type { RendererTransport } from '../../core/ipc/rendererTransport';

export function createElectronRendererTransport(): RendererTransport {
    return {
        send(channel: string, ...args: unknown[]): void {
            ipcRenderer.send(channel, ...args);
        },
        on(channel: string, listener: (...args: unknown[]) => void): void {
            ipcRenderer.on(channel, (_event, ...args) => {
                listener(...args);
            });
        }
    };
}
