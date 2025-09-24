export interface Button {
    nameid: string;
    label: string;
    left: string;
    top: string;
    maxWidth: string;
    lineClamp: string;
    color: string;
    fontColor: string;
    isEnabled: string;
    isVisible: string;
}

export interface Input {
    nameid: string;
    left: string;
    top: string;
    width: string;
    value: string;
    isEnabled: string;
    isVisible: string;
}

export interface Select {
    nameid: string;
    left: string;
    top: string;
    width: string;
    value: string;
    arrowColor: string;
    isEnabled: string;
    isVisible: string;
}

export interface Checkbox {
    nameid: string;
    left: string;
    top: string;
    size: string;
    color: string;
    isChecked: string;
    isEnabled: string;
    isVisible: string;
}

export interface Radio {
    nameid: string;
    group: string;
    left: string;
    top: string;
    size: string;
    color: string;
    isSelected: string;
    isEnabled: string;
    isVisible: string;
}

export interface Counter {
    nameid: string;
    left: string;
    top: string;
    space: string;
    color: string;
    startval: string;
    maxval: string;
    isEnabled: string;
    isVisible: string;
}

export interface Slider {
    nameid: string;
    left: string;
    top: string;
    width: string;
    height: string;
    direction: string;
    color: string;
    isEnabled: string;
    isVisible: string;
    handlepos: string;
    handleshape: string;
    handlecolor: string;
    handlesize: string;
}

export interface Label {
    left: string;
    top: string;
    maxWidth: string;
    value: string;
    isEnabled: string;
    isVisible: string;
}

export interface Separator {
    left: string;
    top: string;
    width: string;
    height: string;
    direction: string;
    color: string;
    isEnabled: string;
    isVisible: string;
}

export interface Container {
    nameid: string;
    left: string;
    top: string;
    width: string;
    height: string;
    objViewClass: string;
    variableType: string;
    parentContainer: string;
    isEnabled: string;
    isVisible: string;
}

// Map element names to their interfaces
export type DBElements = {
    Button: Button;
    Input: Input;
    Select: Select;
    Checkbox: Checkbox;
    Radio: Radio;
    Counter: Counter;
    Slider: Slider;
    Label: Label;
    Separator: Separator;
    Container: Container;
};

export type AnyDBElement = DBElements[keyof DBElements];

export interface DBInterface {
    getProperties: (element: string) => Promise<Record<string, string>>;
    updateProperty: (element: string, property: string, value: string) => Promise<boolean>;
    resetProperties: (element: string) => Promise<false | Record<string, string>>;
}

export const DBElementsProps: Record<string, string[]> = {
    buttonElement: [
        'nameid', 'label', 'left', 'top', 'maxWidth', 'lineClamp', 'color', 'fontColor', 'isEnabled', 'isVisible'
    ],
    inputElement: [
        'nameid', 'left', 'top', 'width', 'value', 'isEnabled', 'isVisible'
    ],
    selectElement: [
        'nameid', 'left', 'top', 'width', 'value', 'arrowColor', 'isEnabled', 'isVisible'
    ],
    checkboxElement: [
        'nameid', 'left', 'top', 'size', 'color', 'isChecked', 'isEnabled', 'isVisible'
    ],
    radioElement: [
        'nameid', 'group', 'left', 'top', 'size', 'color', 'isSelected', 'isEnabled', 'isVisible'
    ],
    counterElement: [
        'nameid', 'left', 'top', 'space', 'color', 'startval', 'maxval', 'isEnabled', 'isVisible'
    ],
    sliderElement: [
        'nameid', 'left', 'top', 'width', 'height', 'direction', 'color', 'isEnabled', 'isVisible', 'handlepos', 'handleshape', 'handlecolor', 'handlesize'
    ],
    labelElement: [
        'left', 'top', 'maxWidth', 'value', 'isEnabled', 'isVisible'
    ],
    separatorElement: [
        'left', 'top', 'width', 'height', 'direction', 'color', 'isEnabled', 'isVisible'
    ],
    containerElement: [
        'nameid', 'left', 'top', 'width', 'height', 'objViewClass', 'variableType', 'parentContainer', 'isEnabled', 'isVisible'
    ]
};