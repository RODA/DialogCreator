import { ipcRenderer } from "electron";
import { utils } from "../library/utils";

document.addEventListener('DOMContentLoaded', () => {

    utils.setOnlyNumbers([
        "widthDefaults",
        "heightDefaults",
        "sizeDefaults",
        "spaceDefaults",
        "leftDefaults",
        "topDefaults",
        "handlesizeDefaults",
        "handleposDefaults",
        "lineClampDefaults"
    ]);

    utils.setOnlyNumbersWithMinus(["startvalDefaults", "maxvalDefaults"]);
});


ipcRenderer.on('populateDefaults', async () => {
    utils.addAvailableElementsTo('elementsListDefaults');
});


// ipcRenderer.on('populateDefaults', async (_event, ...args) => {
//     utils.handleEvent('populateDefaults', ...args);
// });

// if the function should return something:
// ipcRenderer.on('populateDefaults', async (_event, ...args) => {
//     const result = await utils.handleEvent('populateDefaults', ...args);
// });
