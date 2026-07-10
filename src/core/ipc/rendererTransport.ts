export interface RendererTransport {
    send(channel: string, ...args: unknown[]): void;
    on(channel: string, listener: (...args: unknown[]) => void): void;
}

export function createMissingRendererTransport(): RendererTransport {
    return {
        send(channel: string): void {
            throw new Error(`Renderer transport is not configured for channel "${channel}".`);
        },
        on(channel: string): void {
            throw new Error(`Renderer transport is not configured for channel "${channel}".`);
        }
    };
}
