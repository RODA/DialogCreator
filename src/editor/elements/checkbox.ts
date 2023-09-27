export type checkboxElementType = {
    parentId: string;
    type: string;
    name: string;
    label: string;
    left: number;
    top: number;
    isChecked: boolean;
    isVisible: boolean;
    isEnabled: boolean;
    elementIds: string[];
    conditions: string;
}

export const checkboxElement: checkboxElementType = {
    parentId: '',
    type: 'Checkbox',
    name: 'checkbox1',
    label: 'checkbox',
    left: 10,
    top: 10,
    isChecked: false,
    isEnabled: true,
    isVisible: true,
    elementIds: [],
    conditions: ''
}
