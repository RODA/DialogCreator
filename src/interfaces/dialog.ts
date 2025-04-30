

export interface DialogProperties {
    name: string;
    title: string;
    width: string;
    height: string;
    fontSize: string;
    background?: string;
}

export interface DialogContainer {
    properties: DialogProperties;
    elements: { [key: string]: HTMLElement };
    syntax: {
        command: string,
        defaultElements: []
    };
    initialize: (obj: DialogProperties) => void;
    updateDialogProperties: () => void;
    updateProperties: (id: string, payload: { [key: string]: string }) => void;
    addElement: (element: HTMLElement) => void;
    removeElement: (elId: string) => void;
    getElement: (elId: string) => HTMLElement | undefined;
}
