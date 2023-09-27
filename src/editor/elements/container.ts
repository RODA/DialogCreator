export type containerElementType = {
    parentId: string;
    type: string;
    name: string;
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
}

export const containerElement: containerElementType = {
    parentId: '',
    type: 'Container',
    name: 'container1',
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
}
