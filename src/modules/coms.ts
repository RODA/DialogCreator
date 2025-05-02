// encapsulation

import { ipcRenderer } from 'electron';
import { ShowMessage, Global } from '../interfaces/coms';
import { EventEmitter } from 'events';
import { Elements } from '../interfaces/elements';
import { elements } from '../modules/elements';
import { utils } from '../library/utils';

export const global: Global = {
    messenger: new EventEmitter(),
    elements: {} as Elements,
    elementSelected: false,
    fontSize: 12,
    fontFamily: 'Arial, Helvetica, sans-serif',
    maxWidth: 615,
    maxHeight: 455,
    dialog: document.createElement('div'),
    dialogId: '',
    selectedElementId: '',

    // IPC dispatcher
    handlers: {
        populateDefaults: {
            module: 'defaults', // the handler finds the module in the modules/ folder
            functioname: 'addElementsToDefaults'
        },
    }
}

// automatically dispatch all events to their respective handlers
for (const eventName in global.handlers) {
    ipcRenderer.on(eventName, async (_event, ...args) => {
        // assume the event returns something
        const result = await utils.handleEvent(eventName, ...args);
        if (utils.exists(result)) {
            global.messenger.emit(eventName + 'Result', result);
        }
    });
}

global.elements = { ...elements };
global.messenger.on('updateDefaults', (event, updatedElements) => {
    global.elements = { ...updatedElements };
});


export const showMessage = (obj: ShowMessage) => {
    ipcRenderer.send('showDialogMessage', obj);
}

export const showError = (message: string) => {
    ipcRenderer.send('showError', message);
}

ipcRenderer.on('consolog', (event, object: any) => {
    console.log(object);
});
