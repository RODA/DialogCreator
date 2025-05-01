// encapsulation

import { ipcRenderer } from 'electron';
import { ShowMessage } from '../interfaces/coms';
import { EventEmitter } from 'events';

export const global = {
    emitter: new EventEmitter()
}

export const showMessage = (obj: ShowMessage) => {
    ipcRenderer.send('showDialogMessage', obj);
}


export const showError = (message: string) => {
    ipcRenderer.send('showError', message);
}