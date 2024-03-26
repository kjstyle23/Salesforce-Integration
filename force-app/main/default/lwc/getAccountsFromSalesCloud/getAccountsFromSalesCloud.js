import { LightningElement, wire, track, api } from 'lwc';
import doCallout from '@salesforce/apex/Callout_SalesCloudOrg.doCallout';
import createAccounts from '@salesforce/apex/Callout_SalesCloudOrg.createAccounts';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

export default class GetAccountsFromSalesCloud extends LightningElement {

    @track showData = false; // Flag to control data display
    @track accountData = []; 
    @track selectedRows = [];
    @track accountToCreate = [];
    @track isPopupOpen = false;
    @track message='';
    @track btnDisabled = false;
    @track showSpinner = false;
    @track btnCreate = true;

    handleClick(){
        this.btnDisabled = true;
        this.showSpinner = true;
        doCallout()
            .then(result => {
                this.accountData = result.map(item => {
                    return{
                    Name: item.Name,
                    Industry: item.Industry,
                    Type: item.Type
                    };
                });
                console.log('Callout Happened!!');
                this.showData = true;
                this.showSpinner = false;
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }

    handleRowAction(event){
        this.selectedRows = event.detail.selectedRows;
        this.btnCreate = false;
    }

    createAccount(){
        console.log('Selected Records : ',JSON.stringify(this.selectedRows));
        console.log('length : ',JSON.stringify(this.selectedRows.length));
        if(this.selectedRows.length > 0){
             this.accountToCreate = this.selectedRows.map(item => {
                console.log('Name : '+item.Name);
                return{
                    Name: item.Name,
                    Industry: item.Industry,
                    Type: item.Type
                }});
                console.log('accountToCreate : ',(this.accountToCreate));
            console.log('Accounts passing : ',JSON.stringify(this.accountToCreate));
            createAccounts({ lstAc : this.accountToCreate})
            .then(result => {
                console.log('Accounts created successfully:', result);
                this.isPopupOpen = true;
                this.message = result;
                console.log('isPopupOpen => ',this.isPopupOpen);
                console.log('message => ',this.message);
                // this.showToast('Information',result,'info',10000);
            })
            .catch(error => {
                console.error('Error creating accounts:', error);
                const showToast = new ShowToastEvent({
                    title: 'Error',
                    message: 'An error occurred. Please try again. '+error,
                    variant: 'error'
                });
                this.dispatchEvent(showToast);
            });

        }
        else{
            this.showToast('Information','Please Select Account!!','Error',5000);
        }
    }

    closePopup() {
        this.isPopupOpen = false;
    }

    @api
    showToast(title,message,variant,duration){
        const showToast = new ShowToastEvent({
            title : title,
            message : message,
            variant : variant,
            duration : duration
        });
        this.dispatchEvent(showToast);
    }

    hideData(){
        console.log('Call from Child to Parent');
        console.log('this.selectedRows => ',JSON.stringify(this.selectedRows));
        this.showData = false;
        this.btnDisabled = false;
        this.isPopupOpen = false;
        this.selectedRows = '';
        this.btnCreate = false;
        console.log('selectedRows => ',JSON.stringify(this.selectedRows));
    }

    columns = [
        { label: 'Account Name', fieldName: 'Name', type: 'text' },
        { label: 'Industry', fieldName: 'Industry', type: 'text' },
        { label: 'Type', fieldName: 'Type', type: 'text' }
    ];
   
}