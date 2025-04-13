/* eslint-disable @typescript-eslint/no-explicit-any */
export type buttonElementType = {
    parentId: string;
    id: string;
    type: string;
    label: string;
    left: number;
    top: number;
    width: number;
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
    left: number;
    top: number;
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
    left: number;
    top: number;
    group: string;
    isSelected: boolean;
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
export type labelElementType = {
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
export type selectElementType = {
    parentId: string;
    type: string;
    id: string;
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
export type sliderElementType = {
    parentId: string;
    type: string;
    min: number;
    max: number;
    start: number;
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

//checkbuttonElementType

export interface ElementsInterface {
    buttonElement: buttonElementType;
    checkboxElement: checkboxElementType;
    radioElement: radioElementType;
    containerElement: containerElementType;
    counterElement: counterElementType;
    inputElement: inputElementType;
    labelElement: labelElementType;
    separatorElement: separatorElementType;
    selectElement: selectElementType;
    sliderElement: sliderElementType;
}

export const elements: ElementsInterface = {
    buttonElement: {
        parentId: '',
        id: '',
        type: 'Button',
        label: 'Button',
        left: 15,
        top: 15,
        width: 60,
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
        left: 10,
        top: 10,
        isChecked: false,
        isVisible: true,
        isEnabled: true,
        elementIds: [],
        conditions: ''
    },
    radioElement: {
        parentId: '',
        type: 'Checkbox',
        id: '',
        left: 10,
        top: 10,
        group: 'radiogroup1',
        isSelected: false,
        isVisible: true,
        isEnabled: true,
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
    },
    labelElement: {
        parentId: '',
        type: 'Label',
        id: '',
        width: 120,
        left: 15,
        top: 15,
        isVisible: true,
        isEnabled: true,
        value: 'Label',
        elementIds: [],
        conditions: ''
    },
    separatorElement: {
        parentId: '',
        type: 'Separator',
        id: '',
        width: 200,
        height: 1,
        left: 15,
        top: 15,
        direction: "x", // Horizontal
        color: "#000000",
        isVisible: true,
        elementIds: [],
        conditions: ''
    },
    selectElement: {
        parentId: '',
        type: 'Select',
        id: '',
        width: 120,
        left: 15,
        top: 15,
        // dataSource: 'custom', // too R specific
        // Robjects: 'all',      // too R specific
        value: '',
        isVisible: true,
        isEnabled: true,
        elementIds: [],
        conditions: ''
    },
    sliderElement: {
        parentId: '',
        type: 'Slider',
        min: 0,
        max: 200,
        start: 50,
        id: '',
        width: 120,
        height: 1,
        left: 15,
        top: 15,
        direction: "x", // Horizontal
        color: "#000000",
        isVisible: true,
        elementIds: [],
        conditions: ''
    }
}
