import type { HostCommandTransport } from "./hostTransport";

export type DialogChildWindowArgs = {
    html: string;
    preload: string;
    width: number;
    height: number;
    title?: string;
    backgroundColor?: string;
    useContentSize?: boolean;
    autoHideMenuBar?: boolean;
    data?: unknown;
};

export const hostWindowChannels = {
    openSyntaxPanel: 'openSyntaxPanel',
    resizeSyntaxPanel: 'syntaxpanel-resize',
    openSecondWindow: 'secondWindow',
    closeCodeWindow: 'close-codeWindow',
    closePreviewWindow: 'close-previewWindow',
    closeSecondWindow: 'close-secondWindow',
    renderPreview: 'renderPreview'
} as const;

export function openHostSyntaxPanel(
    transport: HostCommandTransport,
    command: string
): void {
    transport.sendTo('main', hostWindowChannels.openSyntaxPanel, command);
}

export function resizeHostSyntaxPanel(
    transport: HostCommandTransport,
    size: { height: number }
): void {
    transport.sendTo('main', hostWindowChannels.resizeSyntaxPanel, size);
}

export function openHostSecondWindow(
    transport: HostCommandTransport,
    args: DialogChildWindowArgs
): void {
    transport.sendTo('main', hostWindowChannels.openSecondWindow, args);
}

export function closeHostCodeWindow(transport: HostCommandTransport): void {
    transport.sendTo('main', hostWindowChannels.closeCodeWindow);
}

export function closeHostPreviewWindow(transport: HostCommandTransport): void {
    transport.sendTo('main', hostWindowChannels.closePreviewWindow);
}

export function sendHostPreviewData(
    transport: HostCommandTransport,
    data: string
): void {
    transport.sendTo('secondWindow', hostWindowChannels.renderPreview, data);
}
