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
