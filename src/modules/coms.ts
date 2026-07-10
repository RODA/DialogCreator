// encapsulation

import { Communications } from '../interfaces/coms';
import { utils } from '../library/utils';
import { renderutils } from '../library/renderutils';
import {
    createMissingRendererTransport,
    RendererTransport
} from '../core/ipc/rendererTransport';


type Listener = (...args: unknown[]) => void;

const messenger = (() => {
    const listeners = new Map<string, Listener[]>();

    const on = function(channel: string, listener: Listener): void {
        const channelListeners = listeners.get(channel) || [];
        channelListeners.push(listener);
        listeners.set(channel, channelListeners);
    };

    return {
        emit(channel: string, ...args: unknown[]): void {
            for (const listener of listeners.get(channel) || []) {
                listener(...args);
            }
        },
        on,
        once(channel: string, listener: Listener): void {
            const onceListener = function(...args: unknown[]): void {
                const channelListeners = listeners.get(channel) || [];
                listeners.set(
                    channel,
                    channelListeners.filter((candidate) => candidate !== onceListener)
                );
                listener(...args);
            };

            on(channel, onceListener);
        }
    };
})();
let transport: RendererTransport = createMissingRendererTransport();
let rendererTransportConfigured = false;
let handlerChannelsRegistered = false;
const pendingTransportChannels = new Set<string>();

// Track which channels have been hooked into the active renderer transport
const registeredChannels = new Set<string>();

const handlers: Record<string, string> = {
    addCover: '../modules/cover',
    removeCover: '../modules/cover',
    addAvailableElementsTo: '../modules/editor',
    previewDialog: '../modules/editor',
};

export function setRendererTransport(nextTransport: RendererTransport): void {
    transport = nextTransport;
    rendererTransportConfigured = true;
    for (const channel of pendingTransportChannels) {
        registerTransportListener(channel);
    }
    pendingTransportChannels.clear();
    registerHandlerChannels();
}

function ensureRendererTransport(channel: string): void {
    if (!rendererTransportConfigured) {
        throw new Error(`Renderer transport is not configured for channel "${channel}".`);
    }
}

function registerTransportListener(channel: string): void {
    const responseChannel = `message-from-main-${channel}`;

    if (registeredChannels.has(channel)) {
        return;
    }

    // Support both the legacy prefixed channel and a clean channel name
    transport.on(responseChannel, (...args) => {
        messenger.emit(channel, ...args);
    });
    transport.on(channel, (...args) => {
        messenger.emit(channel, ...args);
    });
    registeredChannels.add(channel);
}

function registerHandlerChannels(): void {
    if (handlerChannelsRegistered) {
        return;
    }

    for (const eventName in coms.handlers) {
        transport.on(eventName, async (...args) => {
            // assume the event returns something
            const result = await renderutils.handleEvent(eventName, ...args);
            if (utils.exists(result)) {
                messenger.emit(eventName + '-result', result);
            }
        });
    }

    handlerChannelsRegistered = true;
}

export const coms = {
    emit(channel, ...args) {
        messenger.emit(channel, ...args);
    },

    // send to all listeners from all processes, via ipcMain
    send(channel, ...args) {
        coms.sendTo('all', channel, ...args);
    },

    sendTo(window, channel, ...args) {
        ensureRendererTransport(channel);
        transport.send("send-to", window, channel, ...args);
    },

    async runLocal(channel, ...args) {
        const result = await renderutils.handleEvent(channel, ...args);
        return result;
    },

    on(channel, listener) {
        if (rendererTransportConfigured) {
            registerTransportListener(channel);
        } else {
            pendingTransportChannels.add(channel);
        }

        messenger.on(channel, listener);
    },

    once(channel, listener) {
        if (rendererTransportConfigured) {
            registerTransportListener(channel);
        } else {
            pendingTransportChannels.add(channel);
        }

        messenger.once(channel, listener);
    },

    // IPC dispatcher
    handlers,

    fontSize: 12,
    fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, 'Noto Sans', 'Liberation Sans', sans-serif",
} satisfies Communications;

coms.on('consolog', (...args: unknown[]) => {
    console.log(args[0]);
});


export const showMessage = (
    type: 'info' | 'error' | 'question' | 'warning',
    title: string,
    message: string
) => {
    coms.sendTo('main', 'showDialogMessage', type, title, message);
}

export const showError = (message: string) => {
    coms.sendTo('main', 'showError', message);
}
