// encapsulation

import { ipcRenderer } from 'electron';
import { Global } from '../interfaces/coms';
import { EventEmitter } from 'events';
import { utils } from '../library/utils';
import { renderutils } from '../library/renderutils';


const messenger = new EventEmitter();

// Track which channels have been hooked into ipcRenderer
const registeredChannels = new Set<string>();

export const global: Global = {
    emit(channel, ...args) {
        messenger.emit(channel, ...args);
    },

    // send to all listeners from all processes, via ipcMain
    send(channel, ...args) {
        global.sendTo('all', channel, ...args);
        // ipcRenderer.send("send-to", "all", channel, ...args);
    },

    sendTo(window, channel, ...args) {
        ipcRenderer.send("send-to", window, channel, ...args);
    },

    on(channel, listener) {
        // Ensure ipcRenderer is listening only once per logical channel
        const responseChannel = `response-from-main-${channel}`;

        if (!registeredChannels.has(channel)) {
            ipcRenderer.on(responseChannel, (_event, ...args) => {
                messenger.emit(channel, ...args);
            });
            registeredChannels.add(channel);
        }

        messenger.on(channel, listener);
    },

    once(channel, listener) {
        const responseChannel = `response-from-main-${channel}`;

        if (!registeredChannels.has(channel)) {
            ipcRenderer.on(responseChannel, (_event, ...args) => {
                messenger.emit(channel, ...args);
            });
            registeredChannels.add(channel);
        }

        messenger.once(channel, listener);
    },

    // IPC dispatcher
    handlers: {
        addCover: '../modules/cover',
        removeCover: '../modules/cover',
        addAvailableElementsTo: '../modules/editor',
    },

    fontSize: 12,
    fontFamily: 'Arial, Helvetica, sans-serif',
    maxWidth: 615,
    maxHeight: 455,
    dialog: document.createElement('div'),
    dialogId: '',
    selectedElementId: ''
}

// automatically dispatch all events to their respective handlers
for (const eventName in global.handlers) {
    ipcRenderer.on(eventName, async (_event, ...args) => {
        // assume the event returns something
        const result = await renderutils.handleEvent(eventName, ...args);
        if (utils.exists(result)) {
            messenger.emit(eventName + '-result', result);
        }
    });
}

global.on('consolog', (...args: unknown[]) => {
    console.log(args[0]);
});


export const showMessage = (
    type: 'info' | 'error' | 'question' | 'warning',
    title: string,
    message: string
) => {
    global.sendTo('main', 'showDialogMessage', type, title, message);
}

export const showError = (message: string) => {
    global.sendTo('main', 'showError', message);
}

