import { AnyElement } from './elements';
import { DialogProperties } from "./dialog";

export interface RendererUtils {
    unselectRadioGroup: (element: HTMLElement) => void;
    makeUniqueNameID: (type: string) => string;
    nameidValidChange: (newId: string, currentElement: HTMLElement) => boolean;
    setInputFilter: (textbox: HTMLInputElement | null, inputFilter: (value: string) => boolean) => void;
    setOnlyNumbers: (items: string[], prefix?: string) => void;
    setOnlyNumbersWithMinus: (items: string[], prefix?: string) => void;
    setOnlyDouble: (items: string[], prefix?: string) => void;
    makeElement: (settings: AnyElement) => HTMLElement;
    updateElement: (element: HTMLElement, properties?: AnyElement) => void;
    addAvailableElementsTo: (window: string) => void;
    updateButton: (
        button: HTMLDivElement,
        text: string,
        fontSize: number,
        lineClamp: number,
        widthMax: number
    ) => void;
    updateHandleStyle: (
        handle: HTMLDivElement,
        obj: { [key: string]: string },
    ) => void;
    updateCheckboxColor: (uuid: string, color: string) => void;
    handleEvent(eventName: string, ...args: unknown[]): Promise<void>;
    objViewClassValid: (currentElement: HTMLElement) => boolean;
    collectDialogProperties: () => DialogProperties;
    updateFont: (fontSize: number, fontFamily?: string) => void;
}