import { showError } from "./coms";
import { rendererutils } from "../library/rendererutils";

export const defaults = {
    addElementsToDefaults: () => {
        rendererutils.addAvailableElementsTo("defaults")
    }
}
