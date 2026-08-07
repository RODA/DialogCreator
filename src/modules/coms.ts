// encapsulation

import { Communications } from '../interfaces/coms';
import { utils } from '../library/utils';
import {
    createMissingRendererTransport,
    RendererTransport
} from '../core/ipc/rendererTransport';
import {
    rendererCommandNames,
    runRendererCommand
} from './rendererCommandRegistry';
import {
    HostMessageType,
    showHostDialogMessage,
    showHostError
} from '../core/host/hostMessages';


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

    for (const eventName of rendererCommandNames) {
        transport.on(eventName, async (...args) => {
            // assume the event returns something
            const result = await runRendererCommand(eventName, ...args);
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
        const result = await runRendererCommand(channel, ...args);
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

    fontSize: 12,
    fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, 'Noto Sans', 'Liberation Sans', sans-serif",
} satisfies Communications;

coms.on('consolog', (...args: unknown[]) => {
    console.log(args[0]);
});


export const showMessage = (
    type: HostMessageType,
    title: string,
    message: string
) => {
    showHostDialogMessage(coms, type, title, message);
}

export const showError = (message: string) => {
    showHostError(coms, message);
}
