import { Elements } from './elements';

export interface Utils {
    getElementValue: <T extends keyof Elements, K extends keyof Elements[T]>(
        element: Elements[T],
        key: K
    ) => string;
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
    updateHandleStyle: (
        handle: HTMLDivElement,
        obj: Elements[keyof Elements]
    ) => void;
    makeNameID: (type: string, nameidRecords: Record<string, number>) => string;
    nameidValidChange: (newId: string, currentElement: HTMLElement) => boolean;
    updateCheckboxColor: (uuid: string, color: string) => void;
    setInputFilter: (textbox: HTMLElement, inputFilter: (value: string) => boolean) => void;
    setOnlyNumbers: (items: string[]) => void;
    setOnlyNumbersWithMinus: (items: string[]) => void;
    setOnlyDouble: (items: string[]) => void;
    isValidColor: (value: string) => boolean;
    makeElement: (
        data: Elements[keyof Elements],
        uuid: string,
        nameid?: string,
        fontSize?: number,
        fontFamily?: string
    ) => HTMLDivElement | HTMLInputElement | HTMLSelectElement;
    updateButton: (
        button: HTMLDivElement,
        text: string,
        fontSize: number,
        lineClamp: number,
        widthMax: number
    ) => void;
    objViewClassValid: (currentElement: HTMLElement) => boolean;
}
