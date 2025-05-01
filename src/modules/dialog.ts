import { Dialog, DialogProperties } from '../interfaces/dialog';
import { editor } from './editor';

export const dialog: Dialog = {

    properties: {} as DialogProperties,
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
        // TODO
    },

    // update dialog element props !!!!!!
    updateProperties: function (id, payload) {
        // TODO: move these into some sort of global variables?
        const dialogW = editor.dialog.getBoundingClientRect().width;
        const dialogH = editor.dialog.getBoundingClientRect().height;
        //----

        const notFound: string[] = [];
        const keys = Object.keys(payload);
        const dataset = dialog.elements[id].dataset;


        // const type = dialog.elements[id].dataset.type;
        // if (!type) return;
        // const elementType = (type.toLowerCase() + 'Element') as keyof Elements;
        // const element = elements[elementType];

        // console.log(dialog.elements[id]);
        // console.log('elementType', elementType);
        // console.log('element', element);

        for (let i = 0; i < keys.length; i++) {
            if (Object.hasOwn(dataset, keys[i])) {

                if (keys[i] == 'left') {
                    const elementWidth = document.getElementById(id)?.getBoundingClientRect().width;
                    if (elementWidth && Number(payload[keys[i]]) + elementWidth + 10 > dialogW) {
                        payload[keys[i]] = String(Math.round(dialogW - elementWidth - 10));
                    }
                    if (Number(payload[keys[i]]) < 10) { payload[keys[i]] = '10'; }
                    const elleft = document.getElementById('elleft') as HTMLInputElement;
                    elleft.value = payload[keys[i]];
                } else if (keys[i] == 'top') {
                    const elementHeight = document.getElementById(id)?.getBoundingClientRect().height;
                    if (elementHeight && Number(payload[keys[i]]) + elementHeight + 10 > dialogH) {
                        payload[keys[i]] = String(Math.round(dialogH - elementHeight - 10));
                    }
                    if (Number(payload[keys[i]]) < 10) { payload[keys[i]] = '10'; }
                    const eltop = document.getElementById('eltop') as HTMLInputElement;
                    eltop.value = payload[keys[i]];
                }
                // dialog.elements[id] is a proxy
                // proxy['top'] calls the set() method of the proxy
                // (defined when the proxy is created)
                // dialog.elements[id][keys[i]] = payload[keys[i]];

                // instead of using the proxy, we can use the element directly
                // and fire its event


                if (keys[i] == 'label' || keys[i] == 'width') {
                    const elementWidth = document.getElementById(id)?.getBoundingClientRect().width;
                    const elleft = document.getElementById('elleft') as HTMLInputElement;
                    if (elementWidth && Number(elleft.value) + elementWidth + 10 > dialogW) {
                        const newleft = String(Math.round(dialogW - elementWidth - 10));
                        elleft.value = newleft;
                        // why does it requires a number, here ??
                        // dialog.elements[id]['left'] = Number(newleft);
                        dialog.elements[id].style.left = newleft + 'px';
                    }
                } else if (keys[i] == 'height') {
                    const eltop = document.getElementById('eltop') as HTMLInputElement;
                    const elementHeight = document.getElementById(id)?.getBoundingClientRect().height;
                    if (elementHeight && Number(eltop.value) + elementHeight + 10 > dialogH) {
                        const newtop = String(Math.round(dialogH - elementHeight - 10));
                        eltop.value = newtop;
                        // dialog.elements[id]['top'] = Number(newtop);
                        dialog.elements[id].style.top = newtop + 'px';
                    }
                }
            } else {
                notFound.push(keys[i]);
            }
        }

        if (notFound.length) {
            // showMessage({
            //     type: 'warning',
            //     title: 'Notice',
            //     message: 'Props "' + notFound.join(',') + '" not found to update!'
            // });
        }
    },

    // Elements
    // ======================================
    // add/save an element
    addElement: function (element) {
        dialog.elements[element.id] = element;
    },

    // remove element from container
    removeElement: function (elID) {
        delete dialog.elements[elID];
    },

    // return an element by ID
    getElement: function (elId) {
        return dialog.elements[elId];
    },
};
