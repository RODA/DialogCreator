// encapsulation

import { ipcRenderer } from 'electron';
import * as interfaces from '../src/library/interfaces';


export const showMessage = (obj: interfaces.ShowMessage) => {
    ipcRenderer.send('showDialogMessage', obj);
}


export const showError = (message: string) => {
    ipcRenderer.send('showError', message);
}