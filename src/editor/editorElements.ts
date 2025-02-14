import { v4 as uuidv4 } from 'uuid';
import { ElementsInterface } from './elements';
import { dialogContainer } from './dialogContainer';
export type editorElementsTypes = 'addButton' | 'addCheckbox' | 'addRadio'
// | 'addContainer' | 'addCounter' | 'addInput' | 'addLabel' | 'addSelect' | 'addSeparator' | 'addSlider';

export interface EditorElementsInterface {
    fontSize: number;
    fontFamily: string;
    maxWidth: number;
    maxHeight: number;
    setDefaults: (size: number, family: string, maxWidth: number, maxHeight: number) => void;
    addButton: (dialog: HTMLDivElement, data: ElementsInterface["buttonElement"]) => ElementsInterface["buttonElement"];
    addCheckbox: (dialog: HTMLDivElement, data: ElementsInterface["checkboxElement"]) => ElementsInterface["checkboxElement"];
    addRadio: (dialog: HTMLDivElement, data: ElementsInterface["checkboxElement"]) => ElementsInterface["checkboxElement"];
    // addContainer: (dialog: HTMLDivElement, data: elementsConfig.containerElementType) => void;
    // addCounter: (dialog: HTMLDivElement, data: elementsConfig.counterElementType) => void;
    addInput: (dialog: HTMLDivElement, data: ElementsInterface["inputElement"]) => ElementsInterface["inputElement"];
    // addLabel: (dialog: HTMLDivElement, data: elementsConfig.label ) => void;
    // addSelect: (dialog: HTMLDivElement, data: elementsConfig.select ) => void;
    // addSeparator: (dialog: HTMLDivElement, data: elementsConfig.separator ) => void;
    // addSlider: (dialog: HTMLDivElement, data: elementsConfig.slider ) => void;
    // [propName: string]: any;
}

export const editorElements: EditorElementsInterface = {

    // defaults
    fontSize: 12,
    fontFamily: 'Arial, Helvetica, sans-serif',
    maxWidth: 615,
    maxHeight: 455,
    // TODO:
    // minWidth: 0,
    // minHeight: 0,

    // set default font size and family
    setDefaults: function (size, family, maxWidth, maxHeight) {
        this.fontSize = size;
        this.fontFamily = family;
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
    },
    // The elements
    // ==============================================
    // Add button
    addButton: function (dialog, data) {
        if (typeof data === 'object' && !Array.isArray(data)) {

            const buttonId = uuidv4();

            const dataProxy = new Proxy({ ...data }, {
                set(obj, key: string, value) {

                    const el = document.getElementById(buttonId) as HTMLButtonElement;

                    switch (key) {
                        case 'label':
                            el.innerText = value;
                            obj[key] = value;
                            break;
                        case 'top':
                            if (el && editorElements.maxHeight >= value) {
                                obj[key] = parseInt(value);
                                el.style.top = value + 'px';
                            } else {
                                el.style.top = editorElements.maxHeight + 'px';
                            }
                            break;
                        case 'left':
                            obj[key] = parseInt(value);
                            if (el) {
                                el.style.left = value + 'px';
                            }
                            break;
                        case 'isEnabled':
                            obj[key] = value === 'true';
                            break;
                        default:
                            obj[key] = value;

                    }
                    return true;
                }
            })

            const button = document.createElement('button');
            // position
            button.style.position = 'absolute';
            button.style.top = data.top + 'px';
            button.style.left = data.left + 'px';
            // label
            button.innerText = data.label

            button.style.maxWidth = editorElements.maxWidth + 'px';
            button.style.maxHeight = editorElements.maxHeight + 'px';

            button.style.fontFamily = editorElements.fontFamily;
            button.style.fontSize = editorElements.fontSize + 'px';

            // on screen
            button.id = buttonId;
            // in container
            dataProxy.id = buttonId;
            dataProxy.parentId = dialog.id;

            if (!data.isEnabled) {
                button.disabled = true;
            }
            if (!data.isVisible) {
                button.style.display = 'none';
            }
            dialog.appendChild(button);
            return dataProxy;
        } else {
            return;
        }
    },

    // Add checkbox
    addCheckbox: function (dialog, data) {
        if (typeof data === 'object' && !Array.isArray(data)) {

            const checkboxId = uuidv4();

            const dataProxy = new Proxy({ ...data }, {
                set(obj, key: string, value) {
                    const el = document.getElementById(checkboxId) as HTMLInputElement;
                    const cb = document.getElementById("checkbox-" + checkboxId) as HTMLElement;
                    const cover = document.getElementById("cover-" + checkboxId) as HTMLElement;

                    switch (key) {
                        case 'top':
                            if (el && editorElements.maxHeight >= value) {
                                obj[key] = parseInt(value);
                                el.style.top = value + 'px';
                            } else {
                                el.style.top = editorElements.maxHeight + 'px';
                            }
                            break;
                        case 'left':
                            obj[key] = parseInt(value);
                            if (el) {
                                el.style.left = value + 'px';
                            }
                            break;
                        case 'isEnabled':
                            obj[key] = value === 'true';
                            if (obj[key]) {
                                // el.disabled = false;
                                cover.classList.remove('disabled-div');
                            } else {
                                // el.disabled = true;
                                cover.classList.add('disabled-div');
                            }
                            break;
                        case 'isChecked':
                            obj[key] = value === 'true';
                            cb.setAttribute("aria-checked", value);
                            break;
                        default:
                            obj[key] = value;
                    }

                    return true;
                }
            })

            const checkbox = document.createElement('div');
            checkbox.className = 'element-div';

            // position
            checkbox.style.top = data.top + 'px';
            checkbox.style.left = data.left + 'px';
            checkbox.style.width = '13px';
            checkbox.style.height = '13px';

            // Create the custom checkbox
            const customCheckbox = document.createElement('div');
            customCheckbox.id = "checkbox-" + checkboxId;
            customCheckbox.className = 'custom-checkbox';
            customCheckbox.setAttribute('role', 'checkbox');
            customCheckbox.setAttribute('tabindex', '0');
            customCheckbox.setAttribute('aria-checked', 'false');

            customCheckbox.addEventListener('click', () => {
                const isChecked = customCheckbox.getAttribute('aria-checked') === 'true';
                customCheckbox.setAttribute('aria-checked', isChecked ? "false" : "true");
            });

            // Create the cover div
            const cover = document.createElement('div');
            cover.id = "cover-" + checkboxId;
            cover.className = 'cover';
            // Append the cover to the custom checkbox

            checkbox.appendChild(customCheckbox);
            checkbox.appendChild(cover);

            // // create checkbox
            // const checkbox = document.createElement('input');
            // checkbox.type = 'checkbox';
            // // position
            // checkbox.style.position = 'absolute';
            // checkbox.style.top = data.top + 'px';
            // checkbox.style.left = data.left + 'px';

            // checkbox.style.fontFamily = editorElements.fontFamily;
            // checkbox.style.fontSize = editorElements.fontSize + 'px';

            // on screen
            checkbox.id = checkboxId;


            // in container
            dataProxy.id = checkboxId;
            dataProxy.parentId = dialog.id;

            checkbox.classList.remove('disabled-div');
            if (!data.isEnabled) {
                // checkbox.disabled = true;
                checkbox.classList.add('disabled-div');
            }

            if (!data.isVisible) {
                checkbox.style.display = 'none';
            }
            dialog.appendChild(checkbox);
            return dataProxy;
        } else {
            return;
        }
    },

    // Add radio button
    addRadio: function (dialog, data) {

        const unselectRadioGroup = function(element: HTMLElement) {
            document.querySelectorAll(`[group="${element.getAttribute("group")}"]`).forEach((radio) => {
                const id = radio.id.slice(6);
                dialogContainer.elements[id].isSelected = false;
                radio.setAttribute('aria-checked', 'false');
            });
        };

        if (typeof data === 'object' && !Array.isArray(data)) {

            const radioId = uuidv4();

            const dataProxy = new Proxy({ ...data }, {
                set(obj, key: string, value) {
                    const el = document.getElementById(radioId) as HTMLInputElement;
                    const rd = document.getElementById("radio-" + radioId) as HTMLElement;
                    const cover = document.getElementById("cover-" + radioId) as HTMLElement;

                    switch (key) {
                        case 'group':
                            obj[key] = value;
                            rd.setAttribute("group", value);
                            break;
                        case 'top':
                            if (el && editorElements.maxHeight >= value) {
                                obj[key] = parseInt(value);
                                el.style.top = value + 'px';
                            } else {
                                el.style.top = editorElements.maxHeight + 'px';
                            }
                            break;
                        case 'left':
                            obj[key] = parseInt(value);
                            if (el) {
                                el.style.left = value + 'px';
                            }
                            break;
                        case 'isEnabled':
                            obj[key] = value === 'true';
                            if (obj[key]) {
                                // el.disabled = false;
                                cover.classList.remove('disabled-div');
                            } else {
                                // el.disabled = true;
                                cover.classList.add('disabled-div');
                            }
                            break;
                        case 'isSelected':
                            if (value === 'true') {
                                unselectRadioGroup(rd);
                            }
                            rd.setAttribute('aria-checked', value);
                            obj[key] = value === 'true';
                            break;
                        default:
                            obj[key] = value;
                    }

                    return true;
                }
            })

            const radio = document.createElement('div');
            radio.className = 'element-div';

            // position
            radio.style.top = data.top + 'px';
            radio.style.left = data.left + 'px';
            radio.style.width = '13px';
            radio.style.height = '13px';

            // Create the custom radio
            const customRadio = document.createElement('div');
            customRadio.id = "radio-" + radioId;
            customRadio.className = 'custom-radio';
            customRadio.setAttribute('role', 'radio');
            customRadio.setAttribute('tabindex', '0');
            customRadio.setAttribute('aria-checked', 'false');
            customRadio.setAttribute('group', data.group);

            // Create the cover div
            const cover = document.createElement('div');
            cover.id = "cover-" + radioId;
            cover.className = 'cover';
            // Append the cover to the custom radio
            customRadio.appendChild(cover);

            radio.appendChild(customRadio);

            // on screen
            radio.id = radioId;


            // in container
            dataProxy.id = radioId;
            dataProxy.parentId = dialog.id;

            radio.classList.remove('disabled-div');
            if (!data.isEnabled) {
                // radio.disabled = true;
                radio.classList.add('disabled-div');
            }

            if (!data.isVisible) {
                radio.style.display = 'none';
            }
            dialog.appendChild(radio);

            return dataProxy;
        } else {
            return;
        }
    },

    //     if( this.isObject(data) )
    //     {
    //         let dataLeft = parseInt(data.left)+7;
    //         let dataTop = parseInt(data.top)+7;

    //         let label = paper.text(dataLeft + 15, dataTop, data.label).attr({"text-anchor": "start", "font-size": editorElements.fontSize, "font-family": editorElements.fontFamily});

    //         // the regular gray circles
    //         let circle = paper.circle(dataLeft, dataTop, 7).attr({fill: "#eeeeee", "stroke": "#5d5d5d", "stroke-width": 1});

    //         let set = paper.set();

    //         if(data.isEnabled === 'false')
    //         {
    //             circle.attr({fill: "#cccccc", "stroke": "#848484"});
    //             label.attr({fill: '#848484'});
    //         }

    //         if(data.isSelected === 'true')
    //         {
    //             let circle1 = paper.circle(dataLeft, dataTop, 6).attr({fill: "#97bd6c", stroke: "none"});
    //             let circle2 = paper.circle(dataLeft, dataTop, 3).attr({fill: (data.isEnabled === 'false') ? "#848484" : "#000000", stroke: "none"});

    //             set.push( label, circle, circle1, circle2);
    //         } else {
    //             set.push( label, circle );
    //         }

    //         return set;
    //     } else {
    //         return;
    //     }
    // },

    // Add container
    // addContainer: function (paper, data) {
    //     if (this.isObject(data)) {
    //         // data to int
    //         let dataLeft = parseInt(data.left);
    //         let dataTop = parseInt(data.top);

    //         // check for user input
    //         if (data.width < 50) { data.width = 50; }
    //         else if (data.width > paper.width - 15) { data.width = paper.width - 30; dataLeft = 15; }

    //         if (data.height < 50) { data.height = 50; }
    //         else if (data.height > paper.height - 15) { data.height = paper.height - 30; dataTop = 15; }

    //         let rect = paper.rect(dataLeft, dataTop, data.width, data.height).attr({ fill: "#ffffff", "stroke": "#5d5d5d", "stroke-width": 1 });

    //         if (data.isEnabled == 'false') {
    //             rect.attr({ fill: "#cccccc", stroke: "#848484" });
    //         }
    //         return rect;
    //     } else {
    //         return;
    //     }
    // },

    // Add counter
    // addCounter: function (paper, data) {
    //     if (this.isObject(data)) {
    //         // data to int
    //         let dataLeft = parseInt(data.left) + 24;
    //         let dataTop = parseInt(data.top) + 7;

    //         var txtanchor = "middle";
    //         let crtVal = data.startval;

    //         let textvalue = paper.text(dataLeft, dataTop, "" + data.startval)
    //             .attr({ "text-anchor": txtanchor, "font-size": editorElements.fontSize, "font-family": editorElements.fontFamily });

    //         let downsign = paper.path([
    //             ["M", dataLeft - 12 - parseInt(data.width) / 2, dataTop - 6],
    //             ["l", 12, 0],
    //             ["l", -6, 12],
    //             ["z"]
    //         ]).attr({ fill: "#eeeeee", "stroke-width": 1, stroke: "#5d5d5d" });

    //         let upsign = paper.path([
    //             ["M", dataLeft + parseInt(data.width) / 2, dataTop + 6],
    //             ["l", 12, 0],
    //             ["l", -6, -12],
    //             ["z"]
    //         ]).attr({ fill: "#eeeeee", "stroke-width": 1, stroke: "#5d5d5d" });

    //         // let down = paper.rect(dataLeft - 22, dataTop - 6, 15, 15)
    //         //     .attr({fill: "#fff", opacity: 0, stroke: "#000", "stroke-width": 1, cursor: "pointer"});

    //         // let up = paper.rect(dataLeft + 8, dataTop - 8, 15, 15)
    //         //     .attr({fill: "#fff", opacity: 0, stroke: "#000", "stroke-width": 1, cursor: "pointer"});

    //         if (data.isEnabled == 'false') {
    //             textvalue.attr({ fill: '#848484' });
    //             upsign.attr({ fill: "#cccccc", stroke: "#848484" });
    //             downsign.attr({ fill: "#cccccc", stroke: "#848484" });
    //         }

    //         let set = paper.set();

    //         set.push(textvalue, downsign, upsign);

    //         return set;
    //     } else {
    //         return;
    //     }
    // },

    // Add Input
    addInput: function (dialog, data) {
        if (typeof data === 'object' && !Array.isArray(data)) {

            const inputId = uuidv4();

            const dataProxy = new Proxy({ ...data }, {
                set(obj, key: string, value) {

                    const el = document.getElementById(inputId) as HTMLButtonElement;

                    switch (key) {
                        case 'top':
                            if (el && editorElements.maxHeight >= value) {
                                obj[key] = parseInt(value);
                                el.style.top = value + 'px';
                            } else {
                                el.style.top = editorElements.maxHeight + 'px';
                            }
                            break;
                        case 'left':
                            obj[key] = parseInt(value);
                            if (el) {
                                el.style.left = value + 'px';
                            }
                            break;
                        case 'value':
                            obj[key] = value;
                            if (el) {
                                el.value = value;
                            }
                            break;
                        case 'isEnabled':
                            obj[key] = value === 'true';
                            break;
                        default:
                            obj[key] = value;

                    }
                    return true;
                }
            })

            const input = document.createElement('input');
            input.type = 'text';
            // position
            input.style.position = 'absolute';
            input.style.top = data.top + 'px';
            input.style.left = data.left + 'px';
            input.value = data.value;

            input.style.maxWidth = editorElements.maxWidth + 'px';
            input.style.maxHeight = editorElements.maxHeight + 'px';

            input.style.fontFamily = editorElements.fontFamily;
            input.style.fontSize = editorElements.fontSize + 'px';

            // on screen
            input.id = inputId;
            // in container
            dataProxy.id = inputId;
            dataProxy.parentId = dialog.id;

            if (!data.isEnabled) {
                input.disabled = true;
            }
            if (!data.isVisible) {
                input.style.display = 'none';
            }
            dialog.appendChild(input);
            return dataProxy;
        } else {
            return;
        }
    },

    // Label element
    // addLabel: function(paper, data)
    // {
    //     if( this.isObject(data) ) {

    //         // check for user input
    //         if(data.left < 10 || data.left > paper.width - 10){ data.left = 10; }
    //         if(data.top < 10 || data.top > paper.height - 10){ data.top = 10; }
    //         if(data.fontSize < 10 || data.fontSize > 20){ data.fontSize = 14; }

    //         // data.top + 7 fix
    //         let dataTop = parseInt(data.top) + 7;
    //         let dataLeft = parseInt(data.left);

    //         // return Raphael object
    //         return paper.text(dataLeft, dataTop, data.text).attr({fill: '#000', 'text-anchor': 'start', "font-size": data.fontSize, "font-family": editorElements.fontFamily});
    //     } else {
    //         return;
    //     }
    // },

    // Add plot
    // addPlot: function(paper, data)
    // {
    //     if( this.isObject(data) )
    //     {
    //         // data to int
    //         let dataLeft = parseInt(data.left);
    //         let dataTop = parseInt(data.top);

    //         // check for user input
    //         if(data.width < 50) { data.width = 50; }
    //         else if(data.width > paper.width - 15) { data.width = paper.width - 30; dataLeft = 15;}

    //         if(data.height < 50) { data.height = 50; }
    //         else if(data.height > paper.height - 15) { data.height = paper.height - 30; dataTop = 15; }

    //         let rect = paper.rect(dataLeft, dataTop, data.width, data.height).attr({fill: "#ffffff", "stroke": "#d6d6d6", "stroke-width": 1});

    //         if(data.isEnabled == 'false'){
    //             rect.attr({fill: "#eeeeee"});
    //         }
    //         return rect;
    //     } else {
    //         return;
    //     }
    // },

    // Add select
    // addSelect: function(paper, data)
    // {
    //     // data to int
    //     let dataLeft = parseInt(data.left);
    //     let dataTop = parseInt(data.top);
    //     // not widther than 350
    //     data.width = (data.width > 350) ? 350 : data.width;
    //     let dataWidth = parseInt(data.width);


    //     let rect = paper.rect(dataLeft, dataTop, dataWidth, 25).attr({fill: "#FFFFFF", "stroke": "#5d5d5d", "stroke-width": 1});

    //     let downsign = paper.path([
    //         ["M", dataLeft + dataWidth- 15 , dataTop + 8 ],
    //         ["l", 8, 0],
    //         ["l", -4, 8],
    //         ["z"]
    //     ]).attr({fill: "#5d5d5d", "stroke-width": 0});

    //     // if select is disable
    //     if(data.isEnabled == 'false'){
    //         rect.attr({fill: "#cccccc", stroke: "#848484"});
    //         downsign.attr({fill: "#848484"});
    //     }

    //     let set = paper.set();
    //     set.push(rect, downsign);

    //     return set;
    // },

    // Add separator
    // addSeparator: function(paper, data)
    // {
    //     if( this.isObject(data) ) {

    //         // check for user input
    //         if(data.left < 15 || data.left > paper.width - 15){ data.left = 15; }
    //         if(data.top < 15 || data.top > paper.height - 15){ data.top = 15; }

    //         // return Raphael object
    //         if(data.direction == 'x')
    //         {
    //             // width to big
    //             if(data.length < 50) { data.length = 50; }
    //             else if(data.length > paper.width - 30) { data.length = paper.width - 30; data.left = 15;}

    //             let v = parseInt(data.length) + parseInt(data.left);

    //             return paper.path("M" + data.left + " " + data.top + "L"+ v +" " + data.top).attr({stroke: "#5d5d5d"});
    //         }
    //         else if(data.direction == 'y')
    //         {
    //             // width to big
    //             if(data.length < 50) { data.length = 50; }
    //             else if(data.length > paper.height - 30) { data.length = paper.height - 30; data.top = 15;}

    //             let v = parseInt(data.length) + parseInt(data.top);

    //             return paper.path("M" + data.left + " " + data.top + "L" + data.left + " " + v).attr({stroke: "#5d5d5d"});
    //         }
    //     } else {
    //         return;
    //     }
    // },

    // Add slider
    // addSlider: function(paper, data)
    // {
    //     if( this.isObject(data) ) {

    //         // data to int
    //         let dataLeft = parseInt(data.left);
    //         let dataTop = parseInt(data.top);
    //         let dataWidth = parseInt(data.length);
    //         let dataVal = parseFloat(data.value);

    //         // check for user input
    //         if(dataLeft < 10 || dataLeft > paper.width - 10){ dataLeft = 10; }
    //         if(dataTop < 10 || dataTop > paper.height - 10){ dataTop = 10; }
    //         if(dataVal < 0) {
    //             dataVal = 0;
    //         } else if (dataVal > 1) {
    //             dataVal = 1;
    //         }

    //         // width to big
    //         if(dataWidth < 50) { dataWidth = 50; }
    //         else if(dataWidth > paper.width - 30) { dataWidth = paper.width - 30; dataLeft = 15;}

    //         let v = parseInt(dataWidth) + parseInt(dataLeft);

    //         let line = paper.path("M" + dataLeft + " " + dataTop + "L"+ v +" " + dataTop).attr({stroke: "#5d5d5d", "stroke-width": 1});

    //         let tLeft = dataLeft + (dataWidth * dataVal);
    //         let triangle = paper.path([
    //             ["M", tLeft - 6, dataTop + 13],
    //             ["l", 12, 0],
    //             ["l", -6, -12],
    //             ["z"]
    //         ]).attr({fill: "#eeeeee", "stroke-width": 1, stroke: "#5d5d5d"});


    //         if(data.isEnabled === 'false')
    //         {
    //             line.attr({stroke: '#848484'});
    //             triangle.attr({fill: "#cccccc", "stroke": "#cccccc"});
    //         }

    //         let set = paper.set();
    //         set.push( line, triangle );

    //         return set;

    //     } else {
    //         return;
    //     }
    // },

    // Helpers
    // ==============================================

};
