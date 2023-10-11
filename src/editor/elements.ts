/* eslint-disable @typescript-eslint/no-explicit-any */
export type buttonElementType = {
    parentId: string;
    id: string;
    type: string;
    label: string;
    left: number;
    top: number;
    isVisible: boolean;
    isEnabled: boolean;
    onClick: string;
    elementIds: string[];
    conditions: string;
    [key: string]: any;
}
export type checkboxElementType = {
    parentId: string;
    type: string;
    id: string;
    label: string;
    left: number;
    top: number;
    isChecked: boolean;
    isVisible: boolean;
    isEnabled: boolean;
    elementIds: string[];
    conditions: string;
    [key: string]: any;
}
export type containerElementType = {
    parentId: string;
    type: string;
    id: string;
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
export type counterElementType = {
    parentId: string;
    type: string;
    id: string;
    startval: number;
    maxval: number;
    width: number;
    left: number;
    top: number;
    isVisible: boolean;
    isEnabled: boolean;
    elementIds: string[];
    conditions: string;
    [key: string]: any;
}
export type inputElementType = {
    parentId: string;
    type: string;
    id: string;
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

export interface ElementsInterface {
    buttonElement: buttonElementType;
    checkboxElement: checkboxElementType;
    containerElement: containerElementType;
    counterElement: counterElementType;
    inputElement: inputElementType;
}

export const elements: ElementsInterface = {
    buttonElement: {
        parentId: '',
        id: '',
        type: 'Button',
        label: 'Button',
        left: 15,
        top: 15,
        isVisible: true,
        isEnabled: true,
        onClick: 'run',
        elementIds: [],
        conditions: ''
    },
    checkboxElement: {
        parentId: '',
        type: 'Checkbox',
        id: '',
        label: 'checkbox',
        left: 10,
        top: 10,
        isChecked: false,
        isEnabled: true,
        isVisible: true,
        elementIds: [],
        conditions: ''
    },
    containerElement: {
        parentId: '',
        type: 'Container',
        id: '',
        objViewClass: 'variable',
        variableType: '',
        parentContainer: '',
        width: 150,
        height: 200,
        left: 15,
        top: 15,
        isVisible: true,
        isEnabled: true,
        elementIds: [],
        conditions: ''
    },
    counterElement: {
        parentId: '',
        type: 'Counter',
        id: '',
        startval: 1,
        maxval: 5,
        width: 25,
        left: 15,
        top: 15,
        isVisible: true,
        isEnabled: true,
        elementIds: [],
        conditions: ''
    },
    inputElement: {
        parentId: '',
        type: 'Input',
        id: '',
        width: 120,
        left: 15,
        top: 15,
        isVisible: true,
        isEnabled: true,
        value: '',
        elementIds: [],
        conditions: ''
    }
}
