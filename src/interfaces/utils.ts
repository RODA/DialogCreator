import { AnyElement } from './elements';
import { Storage } from './editor';
import { EventHandler } from './handlers';
import { DialogProperties } from "../interfaces/dialog";

export interface Utils {
    getKeys(obj: Record<string, unknown>): Array<string>;
    isNumeric: (x: string) => boolean;
    possibleNumeric: (x: string) => boolean;
    isInteger: (x: number) => boolean;
    asNumeric(x: string): number;
    asInteger(x: string): number;
    isTrue: (x: boolean) => boolean;
    isFalse: (x: boolean) => boolean;
    missing: (x: unknown) => boolean;
    exists: (x: unknown) => boolean;
    isNull: (x: unknown) => boolean;
    isElement(x: string, set: string[]): boolean;
    isNotElement(x: string, set: string[]): boolean;
    unselectRadioGroup: (element: HTMLElement) => void;
    makeNameID: (type: string, nameidRecords: Record<string, number>) => string;
    nameidValidChange: (newId: string, currentElement: HTMLElement) => boolean;
    setInputFilter: (textbox: HTMLInputElement | null, inputFilter: (value: string) => boolean) => void;
    setOnlyNumbers: (items: string[], prefix?: string) => void;
    setOnlyNumbersWithMinus: (items: string[], prefix?: string) => void;
    setOnlyDouble: (items: string[], prefix?: string) => void;
    isValidColor: (value: string) => boolean;
    makeElement: (settings: AnyElement, storage: Storage) => HTMLElement;
    updateElement: (element: HTMLElement, properties?: AnyElement) => void;
    addAvailableElementsTo: (name: string) => void;
    addDefaultsButton: () => void;
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
    handleEvent(
        eventName: string,
        ...args: any[]
    ): Promise<void>;
    objViewClassValid: (currentElement: HTMLElement) => boolean;
    collectDialogProperties: () => DialogProperties;
    updateFont: (fontSize: number, fontFamily?: string) => void;
}
