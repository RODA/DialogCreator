import type { DBElements } from "../../interfaces/database";
import type {
    HostCommandTransport,
    HostEventTransport
} from "../host/hostTransport";

export const elementCatalogChannels = {
    getProperties: 'getProperties',
    resetProperties: 'resetProperties',
    updateProperty: 'updateProperty',
    propertiesFromDB: 'propertiesFromDB',
    resetOK: 'resetOK'
} as const;

export function requestElementProperties(
    transport: HostCommandTransport,
    element: keyof DBElements | string
): void {
    transport.sendTo('main', elementCatalogChannels.getProperties, element);
}

export function resetElementProperties(
    transport: HostCommandTransport,
    element: keyof DBElements | string
): void {
    transport.sendTo('main', elementCatalogChannels.resetProperties, element);
}

export function updateElementProperty(
    transport: HostCommandTransport,
    element: keyof DBElements | string,
    property: string,
    value: string
): void {
    transport.sendTo(
        'main',
        elementCatalogChannels.updateProperty,
        element,
        property,
        value
    );
}

export function onElementProperties(
    transport: HostEventTransport,
    listener: (element: string, properties: Record<string, string>) => void
): void {
    transport.on(elementCatalogChannels.propertiesFromDB, (...args) => {
        listener(
            String(args[0] ?? ''),
            (args[1] || {}) as Record<string, string>
        );
    });
}

export function onResetElementProperties(
    transport: HostEventTransport,
    listener: (properties: Record<string, string>) => void
): void {
    transport.on(elementCatalogChannels.resetOK, (...args) => {
        listener((args[0] || {}) as Record<string, string>);
    });
}
