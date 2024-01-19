export interface DialogPropertiesInterface {
    name: string;
    title: string;
    width: number;
    height: number;
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
        background: '#FFFFFF',
    },

    // available dialog elements
    availableElements: ['Button', 'Checkbox', 'Container', 'Counter', 'Input', 'Label', 'Radio', 'Select', 'Separator', 'Slider'],
}
