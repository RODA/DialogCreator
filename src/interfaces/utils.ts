import { AnyElement } from './elements';
import { DialogProperties } from "../interfaces/dialog";

export interface Utils {
    getKeys(obj: Record<string, unknown>): Array<string>;
    isNumeric: (x: string) => boolean;
    possibleNumeric: (x: string) => boolean;
    isInteger: (x: number) => boolean;
    asNumeric(x: string): number;
    asInteger(x: string): number;
    isTrue: (x: unknown) => boolean;
    isFalse: (x: unknown) => boolean;
    isNull: (x: unknown) => boolean;
    missing: (x: unknown) => boolean;
    exists: (x: unknown) => boolean;
    isElementOf<T>(x: T, set: T[]): boolean;
    isNotElementOf<T>(x: T, set: T[]): boolean;
    unselectRadioGroup: (element: HTMLElement) => void;
    makeUniqueNameID: (type: string) => string;
    nameidValidChange: (newId: string, currentElement: HTMLElement) => boolean;
    setInputFilter: (textbox: HTMLInputElement | null, inputFilter: (value: string) => boolean) => void;
    setOnlyNumbers: (items: string[], prefix?: string) => void;
    setOnlyNumbersWithMinus: (items: string[], prefix?: string) => void;
    setOnlyDouble: (items: string[], prefix?: string) => void;
    isValidColor: (value: string) => boolean;
    makeElement: (settings: AnyElement) => HTMLElement;
    updateElement: (element: HTMLElement, properties?: AnyElement) => void;
    addAvailableElementsTo: (name: string) => void;
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
    capitalize: (str: string) => string;
}
