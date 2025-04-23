// encapsulation

import { ipcRenderer } from 'electron';
import { ShowMessage } from '../src/interfaces/communication';


export const showMessage = (obj: ShowMessage) => {
    ipcRenderer.send('showDialogMessage', obj);
}


export const showError = (message: string) => {
    ipcRenderer.send('showError', message);
}