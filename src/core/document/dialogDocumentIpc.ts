import type { HostCommandTransport } from "../host/hostTransport";

export const dialogDocumentChannels = {
    documentJsonUpdated: 'document-json-updated'
} as const;

export function sendDialogDocumentJsonUpdated(
    transport: HostCommandTransport,
    json: string
): void {
    transport.sendTo('main', dialogDocumentChannels.documentJsonUpdated, json);
}
