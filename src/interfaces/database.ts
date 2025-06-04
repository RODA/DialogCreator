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