import { EventEmitter } from 'events';
import { AnyElement } from './elements';
import { DialogProperties } from './dialog';

export interface Storage {
    nameidRecords: Record<string, number>;

    // defaults
    fontSize: number;
    fontFamily: string;
    maxWidth: number;
    maxHeight: number;
}

export interface Editor {
    dialog: HTMLDivElement;
    dialogId: string;
    selectedElementId: string;
    storage: Storage;
    make: (dialog: HTMLDivElement) => void;
    updateDialogProperties: (props: DialogProperties) => void;
    drawAvailableElements: (window?: string) => HTMLUListElement;
    deselectAll: () => void;
    addElementToDialog: (name: string, data?: AnyElement) => void;
    addElementListeners: (element: HTMLElement) => void;
    addDragAndDrop: (element: HTMLElement) => void;
    // updateElement: (data: { [key: string]: string }) => void;
    removeSelectedElement: () => void;
    clearPropsList: () => void;
    getElementFromContainer: () => HTMLElement | undefined;
}

export interface EditorSettings {
    fontSize: number;
    fontFamily: string;
    maxWidth: number;
    maxHeight: number;
    dialog: DialogProperties;
}
