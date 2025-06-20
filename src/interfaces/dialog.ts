

export interface DialogProperties {
    name: string;
    title: string;
    width: string;
    height: string;
    fontSize: string;
    background?: string;
}

export interface Dialog {
    canvas: HTMLDivElement;
    id: string;
    selectedElement: string; // id of the selected element in the dialog
    properties: DialogProperties;
    elements: { [key: string]: HTMLElement };
    syntax: {
        command: string,
        defaultElements: []
    };
    initialize: (obj: DialogProperties) => void;
    updateElementProperties: (id: string, payload: { [key: string]: string }) => void;
    addElement: (element: HTMLElement) => void;
    removeElement: (elId: string) => void;
    getElement: (elId: string) => HTMLElement | undefined;
}
