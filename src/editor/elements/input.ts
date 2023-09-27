export type buttonElementType = {
    parentId: string;
    type: string;
    name: string;
    width: number;
    left: number;
    top: number;
    isVisible: boolean;
    isEnabled: boolean;
    value: string;
    elementIds: string[];
    conditions: string;
}

export const buttonElement: buttonElementType = {
    parentId: '', 
    type: 'Input', 
    name: 'input1', 
    width: 120, 
    left: 15, 
    top: 15, 
    isVisible: true, 
    isEnabled: true, 
    value: '', 
    elementIds: [], 
    conditions: ''
}
