import type { RendererTransport } from '../core/ipc/rendererTransport';

type Listener = (...args: unknown[]) => void;

export interface BrowserRendererTransport extends RendererTransport {
    emit(channel: string, ...args: unknown[]): void;
}

export function createBrowserRendererTransport(): BrowserRendererTransport {
    const listeners = new Map<string, Listener[]>();

    const on = function(channel: string, listener: Listener): void {
        const channelListeners = listeners.get(channel) || [];
        channelListeners.push(listener);
        listeners.set(channel, channelListeners);
    };

    const emit = function(channel: string, ...args: unknown[]): void {
        for (const listener of listeners.get(channel) || []) {
            listener(...args);
        }
    };

    return {
        send(channel: string, ...args: unknown[]): void {
            emit(channel, ...args);
        },
        on,
        emit
    };
}
