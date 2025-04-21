import * as interfaces from '../library/interfaces';

export const editorSettings: interfaces.EditorSettings = {
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
    availableElements: ['Button', 'Input', 'Select', 'Checkbox', 'Radio', 'Counter', 'Slider', 'Label', 'Separator', 'Container'],
}
