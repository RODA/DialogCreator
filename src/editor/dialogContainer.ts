import { DialogPropertiesInterface } from './settings';
import { ElementsInterface } from './elements';
import { showMessageBox } from '../FrontToBackCommunication';
import { editor } from './editor';

interface DialogContainerInterface {
    properties: DialogPropertiesInterface;
    elements: { [key: string]: ElementsInterface[keyof ElementsInterface] };
    syntax: {
        command: string,
        defaultElements: []
    };
    initialize: (obj: DialogPropertiesInterface) => void;
    updateDialogProperties: () => void;
    updateProperties: (id: string, payload: { [key: string]: string }) => void;
    addElement: (element: ElementsInterface[keyof ElementsInterface]) => void;
    removeElement: (elId: string) => void;
    getElement: (elId: string) => ElementsInterface[keyof ElementsInterface] | undefined;
}

export const dialogContainer: DialogContainerInterface = {

    properties: {} as DialogPropertiesInterface,
    elements: {},
    syntax: {
        command: '',
        defaultElements: []
    },

    // Dialog =======================================
    // dialog properties: name, title, width, height
    initialize: function (obj) {
        this.properties = { ...obj };
    },

    updateDialogProperties: () => {

    },


    // update dialog element props !!!!!!
    updateProperties: function (id, payload) {
        // TODO: move these into some sort of global variables?
        const dialogW = editor.dialog.getBoundingClientRect().width;
        const dialogH = editor.dialog.getBoundingClientRect().height;
        //----

        const notFound: string[] = [];
        const keys = Object.keys(payload);

        for (let i = 0; i < keys.length; i++) {
            if (Object.hasOwn(dialogContainer.elements[id], keys[i])) {
                if (keys[i] == 'left') {
                    const elementWidth = document.getElementById(id).getBoundingClientRect().width;
                    if (Number(payload[keys[i]]) + elementWidth + 10 > dialogW) {
                        payload[keys[i]] = String(Math.round(dialogW - elementWidth - 10));
                    }
                    if (Number(payload[keys[i]]) < 10) { payload[keys[i]] = '10'; }
                    const elleft = document.getElementById('elleft') as HTMLInputElement;
                    elleft.value = payload[keys[i]];
                } else if (keys[i] == 'top') {
                    const elementHeight = document.getElementById(id).getBoundingClientRect().height;
                    if (Number(payload[keys[i]]) + elementHeight + 10 > dialogH) {
                        payload[keys[i]] = String(Math.round(dialogH - elementHeight - 10));
                    }
                    if (Number(payload[keys[i]]) < 10) { payload[keys[i]] = '10'; }
                    const eltop = document.getElementById('eltop') as HTMLInputElement;
                    eltop.value = payload[keys[i]];
                }

                // payload[keys[i]] is a string, including the "left" property
                dialogContainer.elements[id][keys[i]] = payload[keys[i]];

                if (keys[i] == 'label' || keys[i] == 'width') {
                    const elementWidth = document.getElementById(id).getBoundingClientRect().width;
                    const elleft = document.getElementById('elleft') as HTMLInputElement;
                    if (Number(elleft.value) + elementWidth + 10 > dialogW) {
                        const newleft = String(Math.round(dialogW - elementWidth - 10));
                        elleft.value = newleft;
                        // why does it requires a number, here ??
                        dialogContainer.elements[id]['left'] = Number(newleft);
                    }
                } else if (keys[i] == 'height') {
                    const eltop = document.getElementById('eltop') as HTMLInputElement;
                    const elementHeight = document.getElementById(id).getBoundingClientRect().height;
                    if (Number(eltop.value) + elementHeight + 10 > dialogH) {
                        const newtop = String(Math.round(dialogH - elementHeight - 10));
                        eltop.value = newtop;
                        dialogContainer.elements[id]['top'] = Number(newtop);
                    }
                }
            } else {
                notFound.push(keys[i]);
            }
        }

        if (notFound.length) {
            showMessageBox({
                type: 'warning',
                title: 'Notice',
                message: 'Props "' + notFound.join(',') + '" not found to update!'
            });
        }
    },

    // Elements
    // ======================================
    // add/save an element
    addElement: function (element) {
        dialogContainer.elements[element.id] = element;
    },

    // remove element from container
    removeElement: function (elID) {
        delete this.elements[elID];
    },

    // return an element by ID
    getElement: function (elId) {
        return this.elements[elId];
    },

    // Elements helper
    // ======================================
    // clean / make element data
    // prepareData: function(data)
    // {
    //     let response = { error: false, message: ''};

    //     // trim & convert to int data
    //     this.cleanValues(data);

    //     // check if we already have a dataSet container
    //     if (data.type == 'Container' && data.objViewClass == 'dataSet') {
    //         if(this.elementContainerDataSetExists()){
    //             data.objViewClass = 'variable';
    //             response.error = true;
    //             response.message = 'You can have only one Dataset Container per dialog.';
    //         }
    //     }

    //     return response;
    // },

    // element type container restrinctions
    // elementContainerDataSetExists()
    // {
    //     for( let el in this.elements) {
    //         if( this.elements[el].type == 'Container' && this.elements[el].objViewClass == 'dataSet'){
    //             return true;
    //         }
    //     }
    //     return false;
    // },

    // check if an element with the same name exists an make list with names
    // elementNameList(name)
    // {
    //     let namesList = [];
    //     let exists = false;
    //     for( let el in this.elements) {
    //         namesList.push(this.elements[el].name);
    //         if( this.elements[el].name == name){
    //             exists = true;
    //         }
    //     }
    //     if(exists) {
    //         return namesList;
    //     }
    //     return [];
    // },
    // validate conditions and add them to the element
    // validateConditions : function(data)
    // {
    //     // if empty string -  remove conditions and save
    //     if(data.conditions === ''){
    //         this.elements[data.id].conditions = '';
    //         return true;
    //     }
    //     // we received the data
    //     if(data.id !== void 0 & data.conditions != void 0 & data.name != void 0)
    //     {
    //         // let's check if we have the element
    //         if(this.elements[data.id] !== void 0){
    //             // TO DO - parse conditions before adding them
    //             let isOK = conditions.parseConditions(data.conditions);

    //             // console.log(JSON.stringify(isOK));
    //             // console.log(isOK);

    //             if(!isOK.error) {
    //                 this.elements[data.id].conditions = data.conditions;
    //                 // data saved - return true
    //                 return true;
    //             }
    //         }
    //     }
    //     // error
    //     return false;
    // },

    // Syntax ======================================
    // get all the elements for the dialog syntax
    // dataForSyntax: function()
    // {
    //     let noElements = Object.keys(this.elements);
    //     let response = { syntax: this.syntax, elements: []};
    //     let radioGroups = {};

    //     if(noElements.length == 0){ return response; }

    //     for(let i in this.elements){
    //         // ignore some elements
    //         if(this.elements[i].type != 'Label' && this.elements[i].type != 'Separator' && this.elements[i].type != 'Button' && this.elements[i].type != 'Radio') {
    //             response.elements.push({name: this.elements[i].name, type: this.elements[i].type});
    //         }
    //         // get anly the radio grup - and their values
    //         if(this.elements[i].type == 'Radio') {
    //             if(Array.isArray(radioGroups[this.elements[i].radioGroup])) {
    //                 radioGroups[this.elements[i].radioGroup].push(this.elements[i].name);
    //             } else {
    //                 radioGroups[this.elements[i].radioGroup] = [];
    //                 radioGroups[this.elements[i].radioGroup].push(this.elements[i].name);
    //             }
    //         }
    //     }

    //     for(let i in radioGroups) {
    //         response.elements.push({ name: i, type: 'RadioGroup', values: radioGroups[i]});
    //     }

    //     return response;
    // },

    // save dialog syntax
    // saveSyntax: function(data)
    // {
    //     // update syntax and elements
    //     this.syntax.command = data.command;
    //     this.syntax.defaultElements = data.defaultElements;

    //     return true;
    // }
};
