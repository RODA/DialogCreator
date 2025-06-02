// encapsulation

import { ipcRenderer } from 'electron';
import { ShowMessage, Global } from '../interfaces/coms';
import { EventEmitter } from 'events';
import { Elements } from '../interfaces/elements';
import { elements } from '../modules/elements';
import { utils } from '../library/utils';


const messenger = new EventEmitter();

export const global: Global = {
    emit(channel, ...args) { messenger.emit(channel, ...args); },
    // send to all listeners from all processed, via ipcMain
    send(channel, ...args) {
        global.sendTo('all', channel, ...args);
        // ipcRenderer.send("send-to-window", "all", channel, ...args);
    },
    sendTo(window, channel, ...args) {
        ipcRenderer.send("send-to-window", window, channel, ...args);
    },
    on(channel, listener) {
        ipcRenderer.on(`response-from-main${channel}`, (_event, ...args) => {
            messenger.emit(channel, ...args);
        });
        messenger.on(channel, listener);
    },

    // IPC dispatcher
    handlers: {
        addCover: '../modules/cover',
        removeCover: '../modules/cover',
        addElementsToDefaults: '../modules/defaults',
    },

    elements: {} as Elements,
    elementSelected: false,
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
        const result = await utils.handleEvent(eventName, ...args);
        if (utils.exists(result)) {
            messenger.emit(eventName + '-result', result);
        }
    });
}

ipcRenderer.on('consolog', (event, object: any) => {
    console.log(object);
});


export const showMessage = (obj: ShowMessage) => {
    ipcRenderer.send('showDialogMessage', obj);
}

export const showError = (message: string) => {
    ipcRenderer.send('showError', message);
}


global.elements = { ...elements };
global.on('updateDefaults', (args) => {
    const updatedElements = args as Elements;
    global.elements = { ...updatedElements };
});

// global.on('updateDefaults', (...args) => {
//     const [updatedElements] = args as [Elements];
//     global.elements = { ...updatedElements };
// });