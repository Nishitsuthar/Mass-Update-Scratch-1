import { LightningElement ,api,track} from 'lwc';
export default class GoogleFilePickerComponent extends LightningElement {

    receivedMessage = [];
    @track isShowModal = false;
    @track searchKey;
    @track data = [];
    @track vfRoot = '';
    @track selectedId = '';

    @track columns = [
        { label: 'Name', fieldName: 'name' },
        {
            label: 'Owner',
            fieldName: 'owner',
            type: 'string',
            sortable: true,
            cellAttributes: { alignment: 'left' }
        },
        { label: 'Last modified', fieldName: 'modifiedTime', type: 'date' }
    ];
    
    
    connectedCallback() {
        console.log('connectedCallback called ');
        // var VfOrigin = "https://power-drive-2498-dev-ed.scratch.lightning.force.com";
       
                        
        var VfOrigin = "https://power-drive-2498-dev-ed--c.scratch.vf.force.com";
        this.vfRoot = VfOrigin;
        console.log('vd origin-'+this.vfRoot);
        window.addEventListener("message", (message) => {
            console.log('message.origin==',message.origin);
            if (message.origin !== VfOrigin) {
                console.log('message origin is not equal');
               
            //Not the expected origin
                return;
            }

            //handle the message
            console.log('message 2===',message);
            console.log('message 11===',message.data.payload);
            console.log('message===',message.data.name);
            if (message.data.name === "SendingListOfFiles") {
                console.log('message equals');
                this.receivedMessage = message.data.payload;
                
                // this.convertToDataTable();
                this.isShowModal = true;
            }
        });
    }
    
    //This funcation will fetch the Account Name on basis of searchkey
    searchFile(){
        //call Apex method.
        getAccountData({textkey: this.searchKey})
        .then(result => {
                this.accounts = result;
        })
        .catch( error=>{
            this.accounts = null;
        });

    }
    handelSearchKey(event){
        console.log('handelSearchKey called==');
        this.searchKey = event.target.value;
    }
  
    // convertToDataTable(){
    //     const data = [];
    //     [
    //         { id: 1, name: 'Billy Simonns', age: 40, email: 'billy@salesforce.com' },
    //         { id: 2, name: 'Kelsey Denesik', age: 35, email: 'kelsey@salesforce.com' },
    //         { id: 3, name: 'Kyle Ruecker', age: 50, email: 'kyle@salesforce.com' },
    //         {
    //             id: 4,
    //             name: 'Krystina Kerluke',
    //             age: 37,
    //             email: 'krystina@salesforce.com',
    //         },
    //     ];
    //     console.log('tyepof==',typeof data);

    //     this.receivedMessage.forEach(function (currentItem, index){
    //         console.log('Name==',currentItem.name);
    //         console.log('owner==', currentItem.owners[0].displayName);
    //         // var test = {id: currentItem.name, name: currentItem.name, modifiedTime: currentItem.modifiedTime, owner: currentItem.owners[0].displayName};
    //         // data.push(test);

    //         data.add({id: currentItem.name, name: currentItem.name, modifiedTime: currentItem.modifiedTime, owner: currentItem.owners[0].displayName});
            
    //     });
    //     console.log('data==');
    //     console.log(data);
    // }



    showModalBox() {  
        this.isShowModal = true;
    }

    hideModalBox() {  
        this.isShowModal = false;
    }




    getSelectedRec(){
        console.log('getSelectedRec called==');
        var selectedRecords =  this.template.querySelector("lightning-datatable").getSelectedRows();
        console.log('selected Record==',selectedRecords);
        
      

        if(selectedRecords.length > 0){
            console.log('selected ==',selectedRecords[0]["id"]);
            this.selectedId = selectedRecords[0]["id"];

            // pasing data to iframe - Vfpage
            console.log('vfRoot==',this.vfRoot);
            var message = {
                name:"PassingToVF",
                fileId:this.selectedId
            };
           this.template.querySelector("iframe").contentWindow.postMessage(message, this.vfRoot);
        }   
    }
    selectRow(event){
        console.log('SELECT row called=='+event.currentTarget.data);
    }




}