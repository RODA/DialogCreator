export interface HostCommandTransport {
    sendTo(windowName: string, channel: string, ...args: unknown[]): void;
}

export interface HostEventTransport {
    on(channel: string, listener: (...args: unknown[]) => void): void;
}
