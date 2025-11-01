import { Elements } from '../interfaces/elements';

// Each element definition is augmented with an optional $persist array whose literal entries
// are constrained to the keys of that element's own type.
// The entries of $persist are used to determine which properties to persist in the database.

type ElementEntryWithPersist<T> = T & {
    $persist?: readonly (keyof T)[]
};

export type ElementsWithPersist = { [K in keyof Elements]: ElementEntryWithPersist<Elements[K]> };

export const elements: ElementsWithPersist = {
    buttonElement: {
        parentId: '',
        id: '',
        nameid: 'button',
        type: 'Button',
        label: 'Button',
        left: 15,
        top: 15,
        width: 60,
        lineClamp: 1,
        color: '#efefef',
        fontColor: '#000000',
        borderColor: '#727272',
        isEnabled: true,
        isVisible: true,
        elementIds: [],
        $persist: [
            'nameid','label','left','top','width','lineClamp','color','fontColor','borderColor','isEnabled','isVisible'
        ] as const
    },
    inputElement: {
        parentId: '',
        id: '',
        type: 'Input',
        nameid: 'input',
        left: 15,
        top: 15,
        width: 60,
        value: '',
        valueType: 'String',
        isEnabled: true,
        isVisible: true,
        elementIds: [],
        $persist: [
            'nameid','left','top','width','value','valueType','isEnabled','isVisible'
        ] as const
    },
    selectElement: {
        parentId: '',
        id: '',
        type: 'Select',
        nameid: 'select',
        left: 15,
        top: 15,
        width: 120,
        value: '',
        arrowColor: '#5b9c5b',
        isEnabled: true,
        isVisible: true,
        elementIds: [],
        $persist: [
            'nameid','left','top','width','value','arrowColor','isEnabled','isVisible'
        ] as const
    },
    checkboxElement: {
        parentId: '',
        id: '',
        type: 'Checkbox',
        nameid: 'checkbox',
        left: 10,
        top: 10,
        size: 14,
        fill: true,
        color: '#75c775',
        isChecked: false,
        isEnabled: true,
        isVisible: true,
        elementIds: [],
        $persist: [
            'nameid','left','top','size','color','fill','isChecked','isEnabled','isVisible'
        ] as const
    },
    radioElement: {
        parentId: '',
        id: '',
        type: 'Radio',
        nameid: 'radio',
        group: 'radiogroup1',
        left: 10,
        top: 10,
        size: 14,
        color: '#589658',
        isSelected: false,
        isEnabled: true,
        isVisible: true,
        elementIds: [],
        $persist: [
            'nameid','group','left','top','size','color','isSelected','isEnabled','isVisible'
        ] as const
    },
    counterElement: {
        parentId: '',
        id: '',
        type: 'Counter',
        nameid: 'counter',
        left: 15,
        top: 15,
        space: 4,
        color: '#5b9c5b',
        minval: 1,
        startval: 1,
        maxval: 5,
        isEnabled: true,
        isVisible: true,
        elementIds: [],
        $persist: [
            'nameid','left','top','space','color','minval','startval','maxval','isEnabled','isVisible'
        ] as const
    },
    sliderElement: {
        parentId: '',
        id: '',
        type: 'Slider',
        nameid: 'slider',
        left: 15,
        top: 15,
        width: 120,
        height: 1,
        direction: 'horizontal',
        color: '#000000',
        isEnabled: true,
        isVisible: true,
        handlepos: 50,
        handleshape: 'triangle',
        handleColor: '#5b9c5b',
        handlesize: 8,
        elementIds: [],
        $persist: [
            'nameid','left','top','width','height','direction','color','isEnabled','isVisible','handlepos','handleshape','handleColor','handlesize'
        ] as const
    },
    labelElement: {
        parentId: '',
        id: '',
        type: 'Label',
        nameid: 'label',
        left: 15,
        top: 15,
        maxWidth: 200,
        lineClamp: 1,
        fontColor: '#000000',
        value: 'Label',
        align: 'left',
        isEnabled: true,
        isVisible: true,
        elementIds: [],
        $persist: [
            'left','top','maxWidth','lineClamp','fontColor','value','align','isEnabled','isVisible'
        ] as const
    },
    separatorElement: {
        parentId: '',
        id: '',
        type: 'Separator',
        nameid: 'separator',
        left: 15,
        top: 15,
        width: 200,
        height: 1,
        direction: 'horizontal',
        color: '#000000',
        isEnabled: true,
        isVisible: true,
        elementIds: [],
        $persist: [
            'left','top','width','height','direction','color','isEnabled','isVisible'
        ] as const
    },
    containerElement: {
        parentId: '',
        id: '',
        type: 'Container',
        nameid: 'container',
        left: 15,
        top: 15,
        width: 130,
        height: 100,
        selection: 'single',
        itemType: 'any',
        backgroundColor: '#ffffff',
        fontColor: '#000000',
        activeBackgroundColor: '#779B49',
        activeFontColor: '#ffffff',
        disabledBackgroundColor: '#ececec',
        borderColor: '#b8b8b8',
        isEnabled: true,
        isVisible: true,
        elementIds: [],
        $persist: [
            'nameid','left','top','width','height','selection','itemType','backgroundColor','fontColor','activeBackgroundColor','activeFontColor','disabledBackgroundColor','borderColor','isEnabled','isVisible'
        ] as const
    },
    groupElement: {
        parentId: '',
        id: '',
        type: 'Group',
        nameid: 'group',
        left: 15,
        top: 15,
        isEnabled: true,
        isVisible: true,
    elementIds: []
    }
}
