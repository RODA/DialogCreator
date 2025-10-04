import { DialogProperties } from './dialog';



export interface EditorSettings {
    fontSize: number;
    fontFamily: string;
    maxWidth: number;
    maxHeight: number;
    dialog: DialogProperties;
}


/* eslint-disable @typescript-eslint/no-explicit-any */
export type buttonElementType = {
    parentId: string;
    id: string;
    nameid: string;
    type: string;
    label: string;
    left: number;
    top: number;
    maxWidth: number;
    lineClamp: number;
    color: string;
    fontColor: string;
    // fontSize: number;
    isVisible: boolean;
    isEnabled: boolean;
    onClick: string;
    elementIds: string[];
    conditions: string;
    [key: string]: any;
}
export type inputElementType = {
    parentId: string;
    type: string;
    id: string;
    nameid: string;
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
export type selectElementType = {
    parentId: string;
    type: string;
    id: string;
    nameid: string;
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
export type checkboxElementType = {
    parentId: string;
    type: string;
    id: string;
    nameid: string;
    left: number;
    top: number;
    size: number;
    color: string;
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
    group: string;
    left: number;
    top: number;
    size: number;
    color: string;
    isSelected: boolean;
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
    nameid: string;
    startval: number;
    maxval: number;
    space: number;
    left: number;
    top: number;
    color: string;
    isVisible: boolean;
    isEnabled: boolean;
    elementIds: string[];
    conditions: string;
    [key: string]: any;
}
export type sliderElementType = {
    parentId: string;
    type: string;
    id: string;
    nameid: string;
    handlepos: number;
    handleshape: string;
    handleColor: string;
    handlesize: number;
    width: number;
    height: number;
    left: number;
    top: number;
    direction: string;
    color: string;
    isVisible: boolean;
    isEnabled: boolean;
    conditions: string;
    [key: string]: any;
}
export type labelElementType = {
    parentId: string;
    type: string;
    id: string;
    // fontSize: number;
    fontColor: string;
    left: number;
    top: number;
    isVisible: boolean;
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
export type containerElementType = {
    parentId: string;
    type: string;
    id: string;
    nameid: string;
    contentType: string;
    selection: string;
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
}



export type AnyElement = Elements[keyof Elements];
export type keyofAnyElement = keyof AnyElement;
