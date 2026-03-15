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
        id: '',
        type: 'Input',
        nameid: 'input',
        left: 15,
        top: 15,
        width: 60,
        value: '',
        valueType: 'String',
        borderColor: '#8c8c8c',
        disabledColor: '#dedede',
        isEnabled: true,
        isVisible: true,
        elementIds: [],
        $persist: [
            'nameid','left','top','width','value','valueType','borderColor','disabledColor','isEnabled','isVisible'
        ] as const
    },
    selectElement: {
        id: '',
        type: 'Select',
        nameid: 'select',
        left: 15,
        top: 15,
        width: 120,
        value: '',
        arrowColor: '#5b855b',
        disabledColor: '#dedede',
        isEnabled: true,
        isVisible: true,
        elementIds: [],
        $persist: [
            'nameid','left','top','width','value','arrowColor','disabledColor','isEnabled','isVisible'
        ] as const
    },
    checkboxElement: {        id: '',
        type: 'Checkbox',
        nameid: 'checkbox',
        left: 10,
        top: 10,
        size: 14,
        fill: true,
        color: '#70a470',
        borderColor: '#8c8c8c',
        disabledColor: '#dedede',
        isChecked: false,
        isEnabled: true,
        isVisible: true,
        elementIds: [],
        $persist: [
            'nameid','left','top','size','color','fill','borderColor','disabledColor','isChecked','isEnabled','isVisible'
        ] as const
    },
    radioElement: {
        id: '',
        type: 'Radio',
        nameid: 'radio',
        group: 'radiogroup1',
        left: 10,
        top: 10,
        size: 14,
        color: '#5b855b',
        disabledColor: '#dedede',
        isSelected: false,
        isEnabled: true,
        isVisible: true,
        elementIds: [],
        $persist: [
            'nameid','group','left','top','size','color','disabledColor','isSelected','isEnabled','isVisible'
        ] as const
    },
    counterElement: {        id: '',
        type: 'Counter',
        nameid: 'counter',
        left: 15,
        top: 15,
        space: 4,
        color: '#558855',
        borderColor: '#8c8c8c',
        disabledColor: '#dedede',
        minval: 1,
        startval: 1,
        maxval: 5,
        updownsize: 8,
        isEnabled: true,
        isVisible: true,
        elementIds: [],
        $persist: [
            'nameid','left','top','space','color','borderColor','disabledColor','minval','startval','maxval','updownsize','isEnabled','isVisible'
        ] as const
    },
    sliderElement: {
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
        handleColor: '#558855',
        handlesize: 8,
        elementIds: [],
        $persist: [
            'nameid','left','top','width','height','direction','color','isEnabled','isVisible','handlepos','handleshape','handleColor','handlesize'
        ] as const
    },
    labelElement: {
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
        rotate: 0,
        isEnabled: true,
        isVisible: true,
        elementIds: [],
        $persist: [
            'left','top','maxWidth','lineClamp','fontColor','value','align','rotate','isEnabled','isVisible'
        ] as const
    },
    separatorElement: {        id: '',
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
    containerElement: {        id: '',
        type: 'Container',
        nameid: 'container',
        left: 15,
        top: 15,
        width: 130,
        height: 100,
        selection: 'single',
        itemType: 'any',
        itemOrder: false,
        backgroundColor: '#ffffff',
        fontColor: '#000000',
        activeBackgroundColor: '#589658',
        activeFontColor: '#ffffff',
        disabledColor: '#d8d8d8',
        borderColor: '#b8b8b8',
        isEnabled: true,
        isVisible: true,
        elementIds: [],
        $persist: [
            'nameid','left','top','width','height','selection','itemType','itemOrder','backgroundColor','fontColor','activeBackgroundColor','activeFontColor','disabledColor','borderColor','isEnabled','isVisible'
        ] as const
    },
    choiceElement: {        id: '',
        type: 'Choice',
        nameid: 'choice',
        left: 15,
        top: 15,
        width: 50,
        height: 75,
        items: 'A,B,C',
        backgroundColor: '#ffffff',
        fontColor: '#000000',
        activeBackgroundColor: '#589658',
        activeFontColor: '#ffffff',
        borderColor: '#b8b8b8',
        sortable: true,
        ordering: 'no',
        orientation: 'vertical',
        align: 'left',
        isEnabled: true,
        isVisible: true,
        elementIds: [],
        $persist: [
            'nameid','left','top','width','height','items','backgroundColor','fontColor','activeBackgroundColor','activeFontColor','borderColor','sortable','ordering','orientation','align','isEnabled','isVisible'
        ] as const
    },
    groupElement: {
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
