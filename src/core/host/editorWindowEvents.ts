import type { HostCommandTransport } from "./hostTransport";

export const editorWindowChannels = {
    consoleLog: 'consolog',
    setDialogCustomJS: 'setDialogCustomJS'
} as const;

export function sendEditorConsoleLog(
    transport: HostCommandTransport,
    message: string
): void {
    transport.sendTo('editorWindow', editorWindowChannels.consoleLog, message);
}

export function sendDialogCustomJS(
    transport: HostCommandTransport,
    code: string
): void {
    transport.sendTo('editorWindow', editorWindowChannels.setDialogCustomJS, code);
}
