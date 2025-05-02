// encapsulation

import { ipcRenderer } from 'electron';
import { ShowMessage, Global } from '../interfaces/coms';
import { EventEmitter } from 'events';
import { Elements } from '../interfaces/elements';
import { elements } from '../modules/elements';
// import { utils } from '../library/utils';

export const global: Global = {
    messenger: new EventEmitter(),
    elements: {} as Elements,
    elementSelected: false,
    fontSize: 12,
    fontFamily: 'Arial, Helvetica, sans-serif',
    maxWidth: 615,
    maxHeight: 455,
    handlers: {
        populateDefaults: {
            module: 'defaults', // the handler auto-finds the module in the modules/ folder
            functioname: 'addElementsToDefaults'
        },
        // add more events here
    }
}

global.elements = { ...elements };
global.messenger.on('updateDefaults', (event, updatedDefaults) => {
    global.elements = { ...updatedDefaults };
});

// for (const eventName in global.handlers) {
//     ipcRenderer.on(eventName, async () => utils.handleEvent(eventName));
// }

export const showMessage = (obj: ShowMessage) => {
    ipcRenderer.send('showDialogMessage', obj);
}

export const showError = (message: string) => {
    ipcRenderer.send('showError', message);
}

ipcRenderer.on('consolog', (event, object: any) => {
    console.log(object);
});
