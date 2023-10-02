// export const editorContainer = {

//     properties: {}, 
//     elements: {},
//     syntax: {
//         command: '',
//         defaultElements: []
//     },
 
//     // Dialog =======================================
//     // dialog properties: name, title, width, height
//     initialize: function(obj) 
//     {
//         this.properties = Object.assign({},obj);
//         this.elements = {};
//         this.syntax = {
//             command: '',
//             defaultElements: []
//         };
//     },
    
//     // update dialog props
//     updateProperties: function(obj)
//     {
//         // for new props please define in initialization edior.js : make
//         for (let prop in obj) 
//         {
//             if(prop === 'dependencies' && this.properties[prop].length === 0) {
//                 this.properties[prop] = obj[prop];
//             }
//             if(this.properties[prop]) {
//                 this.properties[prop] = obj[prop];
//             }
//         }              
//     },

//     // Elements 
//     // ======================================
//     // add/save an element
//     addElement: function(parentID, element, data) 
//     {
//         data.parentId = parentID;

//         if(element.type == 'set') {
//             element.forEach( (element) => {
//                 data.elementIds.push(element.id);
//             });
//         } else {
//             data.elementIds.push(element.id);
//         }

//         // we are modifying the data object here
//         let isDataOK = this.prepareData(data);
        
//         // add/save element
//         this.elements[parentID] = Object.assign({}, data);  

//         // check if we have errors | if true show message
//         if(isDataOK.error){
//             return isDataOK;
//         }
//         // everythig is okay
//         return {error: false, message: ''};   
//     },
//     // remove element from container
//     removeElement: function(elID)
//     {
//         delete this.elements[elID];
//     },
//     // return an element by ID
//     getElement: function(elId)
//     {       
//         return this.elements[elId];
//     },

//     // Elements helper 
//     // ======================================
//     // clean / make element data
//     prepareData: function(data)
//     {
//         let response = { error: false, message: ''};
        
//         // trim & convert to int data
//         this.cleanValues(data);

//         // check if we already have a dataSet container
//         if (data.type == 'Container' && data.objViewClass == 'dataSet') {
//             if(this.elementContainerDataSetExists()){
//                 data.objViewClass = 'variable';
//                 response.error = true;
//                 response.message = 'You can have only one Dataset Container per dialog.';
//             }
//         }

//         return response;
//     },
//     // parse to int and trim values
//     cleanValues: function(data)
//     {
//         for(let i in data)
//         {
//             if( i == 'text' || i == 'label' || i == 'conditions' ) {
//                 data[i] = data[i].trim();
//             }
//             if(i == 'width' && data.type == 'Container'){
//                 data[i] = isNaN(parseInt(data[i])) ? 150 : parseInt(data[i]);
//             }
//             if(i == 'width' && (data.type == 'Input' || data.type == 'Select')){
//                 data[i] = isNaN(parseInt(data[i])) ? 120 : parseInt(data[i]);
//             }
//             if(i == 'length' && data.type == 'Slider'){
//                 data[i] = isNaN(parseInt(data[i])) ? 200 : parseInt(data[i]);
//             }
//             if(i == 'height' && data.type == 'Container'){
//                 data[i] = isNaN(parseInt(data[i])) ? 200 : parseInt(data[i]);
//             }
//             if(i == 'left' || i == 'top'){
//                 data[i] = isNaN(parseInt(data[i])) ? 15 : parseInt(data[i]);
//             }
//             if(i == 'startval' && data.type == 'Counter'){
//                 data[i] = isNaN(parseInt(data[i])) ? 1 : parseInt(data[i]);
//             }
//             if(i == 'maxval' && data.type == 'Counter'){
//                 data[i] = isNaN(parseInt(data[i])) ? 5 : parseInt(data[i]);
//             }
//         }
//         return data;
//     },

//     // element type container restrinctions
//     elementContainerDataSetExists()
//     {
//         for( let el in this.elements) {            
//             if( this.elements[el].type == 'Container' && this.elements[el].objViewClass == 'dataSet'){
//                 return true;
//             }
//         }
//         return false;    
//     },
//     // return new element name
//     elementNameReturn: function(elName)
//     {
//         let namesList = this.elementNameList(elName);

//         if(namesList.length > 0) {
//             while(namesList.includes(elName)) {
//                 elName = this.elementNameMake(elName);
//             }
//         }
//         return elName;
//     },
//     // generate element name
//     elementNameMake: function(name)
//     {
//         let numberIs = [];
//         let nameArray = name.split('');
        
//         while(nameArray.length > 0){
//             let elIs = nameArray.pop();
//             if(!isNaN(parseInt(elIs))){
//                 numberIs.push(parseInt(elIs));
//             } else {
//                 break;
//             }
//         }
//         let newNumberIs = '';
//         let toRemove = 0;
//         if(numberIs.length > 0){
//             toRemove = numberIs.length;
//             while(numberIs.length > 0){
//                 newNumberIs += numberIs.pop();
//             }
//         }

//         let no = (newNumberIs != '') ? parseInt(newNumberIs) + 1 : '1';
//         let newTxt = (toRemove > 0) ? name.slice(0, -toRemove) : name;

//         return(newTxt + no);  
//     },
//     // check if an element with the same name exists an make list with names
//     elementNameList(name)
//     {          
//         let namesList = [];
//         let exists = false;
//         for( let el in this.elements) {            
//             namesList.push(this.elements[el].name);
//             if( this.elements[el].name == name){
//                 exists = true;
//             }
//         }        
//         if(exists) {
//             return namesList;
//         }
//         return [];
//     },
//     // validate conditions and add them to the element
//     validateConditions : function(data)
//     {      
//         // if empty string -  remove conditions and save
//         if(data.conditions === ''){
//             this.elements[data.id].conditions = '';
//             return true;
//         }    
//         // we received the data
//         if(data.id !== void 0 & data.conditions != void 0 & data.name != void 0)
//         {
//             // let's check if we have the element
//             if(this.elements[data.id] !== void 0){
//                 // TO DO - parse conditions before adding them
//                 let isOK = conditions.parseConditions(data.conditions);
                
//                 // console.log(JSON.stringify(isOK));
//                 // console.log(isOK);
                
//                 if(!isOK.error) {
//                     this.elements[data.id].conditions = data.conditions;
//                     // data saved - return true
//                     return true;
//                 }
//             }
//         }
//         // error
//         return false;
//     },

//     // Syntax ======================================
//     // get all the elements for the dialog syntax
//     dataForSyntax: function()
//     {        
//         let noElements = Object.keys(this.elements);
//         let response = { syntax: this.syntax, elements: []};
//         let radioGroups = {};

//         if(noElements.length == 0){ return response; }

//         for(let i in this.elements){
//             // ignore some elements
//             if(this.elements[i].type != 'Label' && this.elements[i].type != 'Separator' && this.elements[i].type != 'Button' && this.elements[i].type != 'Radio') {
//                 response.elements.push({name: this.elements[i].name, type: this.elements[i].type});
//             }
//             // get anly the radio grup - and their values
//             if(this.elements[i].type == 'Radio') {
//                 if(Array.isArray(radioGroups[this.elements[i].radioGroup])) {
//                     radioGroups[this.elements[i].radioGroup].push(this.elements[i].name);
//                 } else {
//                     radioGroups[this.elements[i].radioGroup] = [];
//                     radioGroups[this.elements[i].radioGroup].push(this.elements[i].name);
//                 }
//             }
//         }

//         for(let i in radioGroups) {
//             response.elements.push({ name: i, type: 'RadioGroup', values: radioGroups[i]});
//         }

//         return response;
//     },
    
//     // save dialog syntax
//     saveSyntax: function(data)
//     {        
//         // update syntax and elements
//         this.syntax.command = data.command;
//         this.syntax.defaultElements = data.defaultElements;       

//         return true;
//     }
// };
