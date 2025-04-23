import { BrowserWindow, ipcRenderer } from "electron";

window.addEventListener("DOMContentLoaded", () => {
    console.log("Preload conditions script loaded");

    ipcRenderer.on('conditionsData', (event, args) => {
        // TODO
    });

    ipcRenderer.on('loadConditions', (event, args) => {
        console.log("Load conditions data");
    });


    document.getElementById('saveConditions').addEventListener('click', function () {
        // TODO
    });

    ipcRenderer.on('conditionsValid', (event, args) => {
        if(args) {
            let window = BrowserWindow.getFocusedWindow();
            window.close();
        } else {
            let message = '<p id="errors"><span>The conditions are not valid. Please check and click save again.</span><br/> For more information please consult the documentation</p>';

            document.getElementById('conditions').style.height = '127px';
            document.getElementById('conditionsInputs').insertAdjacentHTML('beforeend', message);
        }
    });
});