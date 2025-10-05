/* eslint-disable @typescript-eslint/no-explicit-any */
export type buttonElementType = {
    parentId: string;
    id: string;
    type: 'Button';
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
    elementIds: string[];
    conditions: string;
}
export type inputElementType = {
    parentId: string;
    id: string;
    type: 'Input';
    nameid: string;
    left: number;
    top: number;
    width: number;
    value: string;
    valueType: string; // 'Numeric' | 'String'
    isEnabled: boolean;
    isVisible: boolean;
    elementIds: string[];
    conditions: string;
}
export type selectElementType = {
    parentId: string;
    id: string;
    type: 'Select';
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
}
export type checkboxElementType = {
    parentId: string;
    id: string;
    type: 'Checkbox';
    nameid: string;
    left: number;
    top: number;
    size: number;
    fill: boolean;
    color: string;
    isChecked: boolean;
    isEnabled: boolean;
    isVisible: boolean;
    elementIds: string[];
    conditions: string;
}
export type radioElementType = {
    parentId: string;
    id: string;
    type: 'Radio';
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
}
export type counterElementType = {
    parentId: string;
    id: string;
    type: 'Counter';
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
}
export type sliderElementType = {
    parentId: string;
    id: string;
    type: 'Slider';
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
    elementIds: string[];
    conditions: string;
}
export type labelElementType = {
    parentId: string;
    id: string;
    type: 'Label';
    nameid: string;
    left: number;
    top: number;
    maxWidth: number;
    lineClamp: number;
    fontColor: string;
    value: string;
    isEnabled?: boolean;
    isVisible: boolean;
    elementIds: string[];
    conditions: string;
}
export type separatorElementType = {
    parentId: string;
    id: string;
    type: 'Separator';
    nameid: string;
    left: number;
    top: number;
    width: number;
    height: number;
    direction: string;
    color: string;
    isEnabled?: boolean;
    isVisible: boolean;
    elementIds: string[];
    conditions: string;
}
export type containerElementType = {
    parentId: string;
    id: string;
    type: 'Container';
    nameid: string;
    left: number;
    top: number;
    width: number;
    height: number;
    contentType: string;
    selection: string;
    variableType: string;
    parentContainer: string;
    isEnabled: boolean;
    isVisible: boolean;
    elementIds: string[];
    conditions: string;
}
export type groupElementType = {
    parentId: string;
    id: string;
    type: 'Group';
    nameid: string;
    left: number;
    top: number;
    isEnabled: boolean;
    isVisible: boolean;
    elementIds: string[];
    conditions: string;
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
}


export type StringNumber = Record<string, string | number>;
export type GeneralElements = Record<string, AnyElement>;
export type AnyElement = Elements[keyof Elements];
export type keyofAnyElement = keyof AnyElement;


export type PrimitiveKind = 'string' | 'number' | 'boolean';
export type UniformSchema = Record<string, PrimitiveKind>;
export interface BuildOptions {
    includeBooleans?: boolean;   // default true
    includeNumbers?: boolean;    // default true
    includeStrings?: boolean;    // default true
    skipKeys?: string[];         // explicit excludes
    treatMixedAs?: PrimitiveKind | 'skip'; // default 'skip'
}
export interface AssertOptions {
    schema?: UniformSchema;
    collect?: boolean;  // if true, return array of errors instead of throwing first
    strictPresence?: boolean; // if true, error if schema key is missing on data
}
