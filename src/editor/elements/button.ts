export type buttonElementType = {
    parentId: string;
    type: string;
    name: string;
    label: string;
    left: number;
    top: number;
    isVisible: boolean;
    isEnabled: boolean;
    onClick: string;
    elementIds: string[];
    conditions: string;
}

export const buttonElement: buttonElementType = {
    parentId: '',
    type: 'Button',
    name: 'button1',
    label: 'button',
    left: 15,
    top: 15,
    isVisible: true,
    isEnabled: true,
    onClick: 'run',
    elementIds: [],
    conditions: ''
}
