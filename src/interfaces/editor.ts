import { EventEmitter } from 'events';
import { Elements } from './elements';
import { DialogProperties } from './dialogContainer';


export interface Editor {
    dialog: HTMLDivElement;
    dialogId: string;
    selectedElementId: string;
    editorEvents: EventEmitter;
    make: (dialogContainer: HTMLDivElement) => void;
    updateDialogProperties: (props: DialogProperties) => void;
    drawAvailableElements: () => HTMLUListElement;
    deselectAll: () => void;
    addElementToDialog: (type: string, withData?: any) => void;
    addElementListeners: <T extends Elements[keyof Elements] >(element: T) => void;
    addDragAndDrop: (element: HTMLElement) => void;
    updateElement: (payload: { [key: string]: string }) => void;
    removeSelectedElement: () => void;
    clearPropsList: () => void;
}

export interface EditorSettings {
    fontSize: number;
    fontFamily: string;
    dialog: DialogProperties;
    availableElements: string[];
}

export type EditorElementsTypes =
    'addButton' |
    'addInput' |
    'addSelect' |
    'addCheckbox' |
    'addRadio' |
    'addCounter' |
    'addSlider' |
    'addLabel' |
    'addSeparator' |
    'addContainer';


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
    addInput: (
        dialog: HTMLDivElement,
        data: Elements["inputElement"]
    ) => Elements["inputElement"];
    addSelect: (
        dialog: HTMLDivElement,
        data: Elements["selectElement"]
    ) => Elements["selectElement"];
    addCheckbox: (
        dialog: HTMLDivElement,
        data: Elements["checkboxElement"]
    ) => Elements["checkboxElement"];
    addRadio: (
        dialog: HTMLDivElement,
        data: Elements["checkboxElement"]
    ) => Elements["checkboxElement"];
    addCounter: (
        dialog: HTMLDivElement,
        data: Elements["counterElement"]
    ) => Elements["counterElement"];
    addSlider: (
        dialog: HTMLDivElement,
        data: Elements["sliderElement"]
    ) => Elements["sliderElement"];
    addLabel: (
        dialog: HTMLDivElement,
        data: Elements["labelElement"]
    ) => Elements["labelElement"];
    addSeparator: (
        dialog: HTMLDivElement,
        data: Elements["separatorElement"]
    ) => Elements["separatorElement"];
    addContainer: (
        dialog: HTMLDivElement,
        data: Elements["containerElement"]
    ) => Elements["containerElement"];
    // [propName: string]: any;
}

type AnyElement = Elements[keyof Elements];
type keyofAnyElement = keyof AnyElement;

export interface interfaces {
    AnyElement: AnyElement;
    keyofAnyElement: keyofAnyElement;
    Elements: Elements;
    Editor: Editor;
    EditorElements: EditorElements;
    DialogProperties: DialogProperties;
}

