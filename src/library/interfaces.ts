import { EventEmitter } from 'events';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type buttonElementType = {
    parentId: string;
    id: string;
    nameid: string;
    type: string;
    label: string;
    left: number;
    top: number;
    maxWidth: number;
    lineClamp: number;
    color: string;
    fontColor: string;
    // fontSize: number;
    isVisible: boolean;
    isEnabled: boolean;
    onClick: string;
    elementIds: string[];
    conditions: string;
    [key: string]: any;
}
export type inputElementType = {
    parentId: string;
    type: string;
    id: string;
    nameid: string;
    width: number;
    left: number;
    top: number;
    isVisible: boolean;
    isEnabled: boolean;
    value: string;
    elementIds: string[];
    conditions: string;
    [key: string]: any;
}
export type selectElementType = {
    parentId: string;
    type: string;
    id: string;
    nameid: string;
    width: number;
    left: number;
    top: number;
    // dataSource: string; // too R specific
    // Robjects: string;   // too R specific
    value: string;
    isVisible: boolean;
    isEnabled: boolean;
    elementIds: string[];
    conditions: string;
    [key: string]: any;
}
export type checkboxElementType = {
    parentId: string;
    type: string;
    id: string;
    nameid: string;
    left: number;
    top: number;
    size: number;
    color: string;
    isChecked: boolean;
    isVisible: boolean;
    isEnabled: boolean;
    elementIds: string[];
    conditions: string;
    [key: string]: any;
}
export type radioElementType = {
    parentId: string;
    type: string;
    id: string;
    group: string;
    left: number;
    top: number;
    size: number;
    color: string;
    isSelected: boolean;
    isVisible: boolean;
    isEnabled: boolean;
    elementIds: string[];
    conditions: string;
    [key: string]: any;
}
export type counterElementType = {
    parentId: string;
    type: string;
    id: string;
    nameid: string;
    startval: number;
    maxval: number;
    space: number;
    left: number;
    top: number;
    color: string;
    isVisible: boolean;
    isEnabled: boolean;
    elementIds: string[];
    conditions: string;
    [key: string]: any;
}
export type sliderElementType = {
    parentId: string;
    type: string;
    id: string;
    nameid: string;
    handlepos: number;
    handleshape: string;
    handlecolor: string;
    handlesize: number;
    width: number;
    height: number;
    left: number;
    top: number;
    direction: string;
    color: string;
    isVisible: boolean;
    isEnabled: boolean;
    conditions: string;
    [key: string]: any;
}
export type labelElementType = {
    parentId: string;
    type: string;
    id: string;
    // fontSize: number;
    fontColor: string;
    left: number;
    top: number;
    isVisible: boolean;
    value: string;
    elementIds: string[];
    conditions: string;
    [key: string]: any;
}
export type separatorElementType = {
    parentId: string;
    type: string;
    id: string;
    width: number;
    height: number;
    left: number;
    top: number;
    direction: string;
    color: string;
    isVisible: boolean;
    conditions: string;
    [key: string]: any;
}
export type containerElementType = {
    parentId: string;
    type: string;
    id: string;
    nameid: string;
    objViewClass: string;
    variableType: string;
    parentContainer: string;
    width: number;
    height: number;
    left: number;
    top: number;
    isVisible: boolean;
    isEnabled: boolean;
    elementIds: string[];
    conditions: string;
    [key: string]: any;
}


export interface Elements {
    buttonElement: buttonElementType;
    inputElement: inputElementType;
    selectElement: selectElementType;
    checkboxElement: checkboxElementType;
    radioElement: radioElementType;
    counterElement: counterElementType;
    sliderElement: sliderElementType;
    labelElement: labelElementType;
    separatorElement: separatorElementType;
    containerElement: containerElementType;
}


export interface Editor {
    dialog: HTMLDivElement;
    dialogId: string;
    selectedElementId: string;
    editorEvents: EventEmitter;
    make: (dialogContainer: HTMLDivElement) => void;
    updateDialogProperties: (props: DialogProperties) => void;
    drawAvailableElements: () => HTMLUListElement;
    deselectAll: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addElementToDialog: (type: string, withData?: any) => void;
    addElementListeners: <T extends Elements[keyof Elements] >(element: T) => void;
    addDragAndDrop: (element: HTMLElement) => void;
    updateElement: (payload: { [key: string]: string }) => void;
    removeSelectedElement: () => void;
    clearPropsList: () => void;
}


export interface EditorElements {
    nameidRecords: Record<string, number>;
    fontSize: number;
    fontFamily: string;
    maxWidth: number;
    maxHeight: number;
    setDefaults: (
        size: number,
        family: string,
        maxWidth: number,
        maxHeight: number
    ) => void;
    addButton: (
        dialog: HTMLDivElement,
        data: Elements["buttonElement"]
    ) => Elements["buttonElement"];
    addCheckbox: (
        dialog: HTMLDivElement,
        data: Elements["checkboxElement"]
    ) => Elements["checkboxElement"];
    addRadio: (
        dialog: HTMLDivElement,
        data: Elements["checkboxElement"]
    ) => Elements["checkboxElement"];
    addInput: (
        dialog: HTMLDivElement,
        data: Elements["inputElement"]
    ) => Elements["inputElement"];
    addLabel: (
        dialog: HTMLDivElement,
        data: Elements["labelElement"]
    ) => Elements["labelElement"];
    addSeparator: (
        dialog: HTMLDivElement,
        data: Elements["separatorElement"]
    ) => Elements["separatorElement"];
    addSelect: (
        dialog: HTMLDivElement,
        data: Elements["selectElement"]
    ) => Elements["selectElement"];
    addSlider: (
        dialog: HTMLDivElement,
        data: Elements["sliderElement"]
    ) => Elements["sliderElement"];
    addCounter: (
        dialog: HTMLDivElement,
        data: Elements["counterElement"]
    ) => Elements["counterElement"];
    addContainer: (
        dialog: HTMLDivElement,
        data: Elements["containerElement"]
    ) => Elements["containerElement"];
    // [propName: string]: any;
}

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

export interface ShowMessage {
    type: 'info' | 'error' | 'question' | 'warning';
    title: string;
    message: string;
}

export interface DialogProperties {
    name: string;
    title: string;
    width: number;
    height: number;
    fontSize: number;
    background?: string;
}
export interface EditorSettings {
    fontSize: number;
    fontFamily: string;
    dialog: DialogProperties;
    availableElements: string[];
}

export interface DialogContainer {
    properties: DialogProperties;
    elements: { [key: string]: Elements[keyof Elements] };
    syntax: {
        command: string,
        defaultElements: []
    };
    initialize: (obj: DialogProperties) => void;
    updateDialogProperties: () => void;
    updateProperties: (id: string, payload: { [key: string]: string }) => void;
    addElement: (element: Elements[keyof Elements]) => void;
    removeElement: (elId: string) => void;
    getElement: (elId: string) => Elements[keyof Elements] | undefined;
}
