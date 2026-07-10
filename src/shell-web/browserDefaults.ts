import { bootDefaultsController } from '../defaults/defaultsController';
import { createBrowserRendererTransport } from './browserRendererTransport';
import { createStaticElementCatalog } from './staticElementCatalog';

const transport = createBrowserRendererTransport();
const catalog = createStaticElementCatalog();

transport.on('send-to', async (windowName, channel, ...args) => {
    if (windowName !== 'main') {
        return;
    }

    if (channel === 'getProperties') {
        const element = String(args[0] || '');
        const properties = await catalog.getProperties(element);
        transport.emit('message-from-main-propertiesFromDB', element, properties);
        return;
    }

    if (channel === 'resetProperties') {
        const element = String(args[0] || '');
        const properties = await catalog.resetProperties(element);
        if (properties) {
            transport.emit('message-from-main-resetOK', properties);
            transport.emit('message-from-main-propertiesFromDB', element, properties);
        }
        return;
    }

    if (channel === 'updateProperty') {
        const element = String(args[0] || '');
        const property = String(args[1] || '');
        const value = String(args[2] || '');
        const ok = await catalog.updateProperty(element, property, value);

        if (ok) {
            const properties = await catalog.getProperties(element);
            transport.emit('message-from-main-propertiesFromDB', element, properties);
        }
    }
});

bootDefaultsController(transport);

const emitAvailableElements = function(): void {
    setTimeout(() => {
        transport.emit('addAvailableElementsTo', 'defaults');
    }, 0);
};

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', emitAvailableElements, { once: true });
} else {
    emitAvailableElements();
}
