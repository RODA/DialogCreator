import { ipcRenderer } from "electron";
import { utils } from "../library/utils";
import { Handlers } from "../interfaces/handlers";


// Define a "map" from event name to import path and method to call
const handlers: Handlers = {
    populateDefaults: {module: "defaults", method: "addElementsToDefaults"},
    // add more events here
};


ipcRenderer.on('populateDefaults', async (_event, ...args) =>
    utils.handleEvent(handlers, 'populateDefaults', ...args)
);

// if the function would return something:
// ipcRenderer.on('populateDefaults', async (_event, ...args) => {
//     const result = await utils.handleEvent(handlers, 'populateDefaults', ...args);
// });
