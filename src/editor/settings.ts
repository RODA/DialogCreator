export interface DialogPropertiesInterface {
    name: string;
    title: string;
    width: number;
    height: number;
    fontSize: number;
    background?: string;
}
export interface EditorSettingsInterface {
    fontSize: number;
    fontFamily: string;
    dialog: DialogPropertiesInterface;
    availableElements: string[];
}

export const editorSettings: EditorSettingsInterface = {
    fontSize: 13,
    fontFamily: 'Arial',

    // dialog properties
    dialog: {
        name: 'NewDialog',
        title: 'New dialog',
        width: 640,
        height: 480,
        fontSize: 13,
        background: '#FFFFFF',
    },

    // available dialog elements
    availableElements: ['Button', 'Input', 'Checkbox', 'Radio', 'Label', 'Container', 'Select', 'Slider', 'Counter', 'Separator'],
}
