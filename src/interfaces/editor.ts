import { AnyElement } from './elements';
import { DialogProperties } from './dialog';

export interface Editor {
    makeDialog: () => void;
    updateDialogArea: (props: DialogProperties) => void;
    addAvailableElementsTo: (window: string) => void;
    deselectAll: () => void;
    addElementToDialog: (name: string, data?: AnyElement) => void;
    addElementListeners: (element: HTMLElement) => void;
    addDragAndDrop: (element: HTMLElement) => void;
    // updateElement: (data: { [key: string]: string }) => void;
    removeSelectedElement: () => void;
    clearPropsList: () => void;
    addDefaultsButton: () => void;
    propertyUpdate: (ev: FocusEvent) => void;
    initializeDialogProperties: () => void;
    stringifyDialog: () => string;
    previewDialog: () => void;
    loadDialogFromJson?: (data: unknown) => void;
    // arrange/z-order actions
    bringSelectedToFront: () => void;
    sendSelectedToBack: () => void;
    bringSelectedForward: () => void;
    sendSelectedBackward: () => void;
    // grouping actions
    groupSelection: () => void;
    ungroupSelection: () => void;
    selectAll?: () => void;
}

export interface EditorSettings {
    fontSize: number;
    fontFamily: string;
    maxWidth: number;
    maxHeight: number;
    dialog: DialogProperties;
}
