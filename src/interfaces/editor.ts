import { AnyElement } from './elements';
import { DialogProperties } from './dialog';

export interface Editor {
    make: (dialog: HTMLDivElement) => void;
    updateDialogArea: (props: DialogProperties) => void;
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
