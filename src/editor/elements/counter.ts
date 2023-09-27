export type counterElementType = {
    parentId: string;
    type: string;
    name: string;
    startval: number;
    maxval: number;
    width: number;
    left: number;
    top: number;
    isVisible: boolean;
    isEnabled: boolean;
    elementIds: string[];
    conditions: string;
}

export const counterElement: counterElementType = {
    parentId: '', 
    type: 'Counter', 
    name: 'counter1', 
    startval: 1, 
    maxval: 5, 
    width: 25, 
    left: 15, 
    top: 15, 
    isVisible: true, 
    isEnabled: true, 
    elementIds: [], 
    conditions: ''
}
