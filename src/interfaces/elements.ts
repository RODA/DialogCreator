/* eslint-disable @typescript-eslint/no-explicit-any */
export type buttonElementType = {
    parentId: string;
    id: string;
    type: string;
    nameid: string;
    label: string;
    left: number;
    top: number;
    maxWidth: number;
    lineClamp: number;
    color: string;
    fontColor: string;
    isEnabled: boolean;
    isVisible: boolean;
    onClick: string;
    elementIds: string[];
    conditions: string;
    [key: string]: any;
}
export type inputElementType = {
    parentId: string;
    id: string;
    type: string;
    nameid: string;
    left: number;
    top: number;
    width: number;
    value: string;
    isEnabled: boolean;
    isVisible: boolean;
    elementIds: string[];
    conditions: string;
    [key: string]: any;
}
export type selectElementType = {
    parentId: string;
    id: string;
    type: string;
    nameid: string;
    left: number;
    top: number;
    width: number;
    // dataSource: string; // too R specific
    // Robjects: string;   // too R specific
    value: string;
    arrowColor: string;
    isEnabled: boolean;
    isVisible: boolean;
    elementIds: string[];
    conditions: string;
    [key: string]: any;
}
export type checkboxElementType = {
    parentId: string;
    id: string;
    type: string;
    nameid: string;
    left: number;
    top: number;
    size: number;
    color: string;
    isChecked: boolean;
    isEnabled: boolean;
    isVisible: boolean;
    elementIds: string[];
    conditions: string;
    [key: string]: any;
}
export type radioElementType = {
    parentId: string;
    id: string;
    type: string;
    nameid: string;
    group: string;
    left: number;
    top: number;
    size: number;
    color: string;
    isSelected: boolean;
    isEnabled: boolean;
    isVisible: boolean;
    elementIds: string[];
    conditions: string;
    [key: string]: any;
}
export type counterElementType = {
    parentId: string;
    id: string;
    type: string;
    nameid: string;
    left: number;
    top: number;
    space: number;
    color: string;
    startval: number;
    maxval: number;
    isEnabled: boolean;
    isVisible: boolean;
    elementIds: string[];
    conditions: string;
    [key: string]: any;
}
export type sliderElementType = {
    parentId: string;
    id: string;
    type: string;
    nameid: string;
    left: number;
    top: number;
    width: number;
    height: number;
    direction: string;
    color: string;
    isEnabled: boolean;
    isVisible: boolean;
    handlepos: number;
    handleshape: string;
    handleColor: string;
    handlesize: number;
    conditions: string;
    [key: string]: any;
}
export type labelElementType = {
    parentId: string;
    id: string;
    type: string;
    left: number;
    top: number;
    maxWidth: number;
    fontColor: string;
    value: string;
    isEnabled?: boolean;
    isVisible: boolean;
    elementIds: string[];
    conditions: string;
    [key: string]: any;
}
export type separatorElementType = {
    parentId: string;
    id: string;
    type: string;
    left: number;
    top: number;
    width: number;
    height: number;
    direction: string;
    color: string;
    isEnabled?: boolean;
    isVisible: boolean;
    conditions: string;
    [key: string]: any;
}
export type containerElementType = {
    parentId: string;
    id: string;
    type: string;
    nameid: string;
    left: number;
    top: number;
    width: number;
    height: number;
    objViewClass: string;
    variableType: string;
    parentContainer: string;
    isEnabled: boolean;
    isVisible: boolean;
    elementIds: string[];
    conditions: string;
    [key: string]: any;
}
export type groupElementType = {
    parentId: string;
    id: string;
    type: string;
    nameid: string;
    left: number;
    top: number;
    isEnabled: boolean;
    isVisible: boolean;
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
    groupElement: groupElementType;
    [key: string]: Elements[keyof Elements];
}



export type AnyElement = Elements[keyof Elements];
export type keyofAnyElement = keyof AnyElement;
