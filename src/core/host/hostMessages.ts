import type { HostCommandTransport } from "./hostTransport";

export type HostMessageType = 'info' | 'error' | 'question' | 'warning';

export const hostMessageChannels = {
    showError: 'showError',
    showDialogMessage: 'showDialogMessage'
} as const;

export function showHostError(
    transport: HostCommandTransport,
    message: string
): void {
    transport.sendTo('main', hostMessageChannels.showError, message);
}

export function showHostDialogMessage(
    transport: HostCommandTransport,
    type: HostMessageType,
    title: string,
    message: string
): void {
    transport.sendTo(
        'main',
        hostMessageChannels.showDialogMessage,
        type,
        title,
        message
    );
}
