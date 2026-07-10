import { BrowserWindow, ipcMain } from 'electron';

export function requestEditorDialogJson(editorWindow: BrowserWindow): Promise<string> {
    return new Promise((resolve) => {
        const onSendTo = (
            _event: Electron.IpcMainEvent,
            window: string,
            channel: string,
            ...args: unknown[]
        ): void => {
            if (window !== 'main' || channel !== 'dialog-json') {
                return;
            }

            ipcMain.removeListener('send-to', onSendTo);
            resolve(String(args[0] || ''));
        };

        ipcMain.on('send-to', onSendTo);
        editorWindow.webContents.send('request-dialog-json');
    });
}
