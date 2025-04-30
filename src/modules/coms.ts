// encapsulation

import { ipcRenderer } from 'electron';
import { ShowMessage } from '../interfaces/coms';


export const showMessage = (obj: ShowMessage) => {
    ipcRenderer.send('showDialogMessage', obj);
}


export const showError = (message: string) => {
    ipcRenderer.send('showError', message);
}