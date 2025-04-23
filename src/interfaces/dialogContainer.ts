import { Elements } from './elements';

export interface DialogProperties {
    name: string;
    title: string;
    width: number;
    height: number;
    fontSize: number;
    background?: string;
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

export interface interfaces {
    DialogProperties: DialogProperties;
    DialogContainer: DialogContainer;
}