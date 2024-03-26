public class Callout_SalesCloudOrg {
    
    @AuraEnabled(cacheable=true)    
    public static List<Account> doCallout(){
        List<Account> accData = new List<Account>();
        
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setMethod('GET');
        String query = 'Select Name, Industry, Type from Account';
        String encodedString = EncodingUtil.urlEncode(query, 'UTF-8');
        req.setEndpoint('callout:Sales_Cloud_Connect/services/data/v58.0/query?q='+encodedString);
        system.debug('Request Body ==> '+req.getBody());
        
        HttpResponse res = http.send(req);
        system.debug('Status Code ==> '+res.getStatusCode());
        system.debug('Response Body ==> '+res.getBody()); 
        String responseBody = res.getBody();
        
        Map<String, Object> responseMap = (Map<String, Object>)JSON.deserializeUntyped(responseBody);
        system.debug('responseMap => '+responseMap);
        
        WrapperClass_SalesCloud wrapper = (WrapperClass_SalesCloud)JSON.deserialize(responseBody,WrapperClass_SalesCloud.class);
        system.debug('Total Size : '+wrapper.totalSize);
        system.debug('List of Records : '+wrapper.records);
        for(WrapperClass_SalesCloud.Accounts rec : wrapper.records){
            Account ac = new Account();
            ac.Name = rec.Name;
            ac.Industry = rec.Industry;
            ac.Type = rec.Type;
            system.debug('Account Info : '+ac);
            accData.add(ac);
        }
        system.debug('Account List : '+accData);
        return accData;
    }
    
    @AuraEnabled
    public static string createAccounts(List<Account> lstAc){
        boolean flag_exist = false;
        boolean flag_new = false;
        String message = '';
        String errorMsg = 'Something Went Wrong : ';
        list<String> exist_list = new list<String>();
        list<String> newAccounts = new list<String>();
        
        try{
            set<String> acNames = new set<String>();
            for(Account ac : lstAc){
                acNames.add(ac.Name);
            }
            
            system.debug('Account names : '+acNames);
            
            list<String> accountNames = new list<String>();
            for(Account ac : [Select Name from Account where Name IN :acNames]){
                accountNames.add(ac.Name);
            }
            system.debug('existing accounts ; '+accountNames);
            
            List<Account> newAc = new List<Account>();
            for(Account ac : lstAc){
                if(accountNames.contains(ac.Name)){
                    flag_exist = true;
                    exist_list.add(ac.Name);
                }
                else{
                    flag_new = true;
                    newAccounts.add(ac.name);
                    newAc.add(ac);
                }
            }
            if(newAc.size()>0){
                system.debug('Created Accounts : '+newAccounts);
                insert newAc;
            }    
            if(flag_new){
                message += '\n New Accounts Created : ' + newAccounts;        
            }
            if(flag_exist){ 
                message += '\n Accounts Already Exist :' +  exist_list;
            }
            
        }
        catch(Exception ex){
            errorMsg += ex;
            message = errorMsg;
        }
        
        
        
        return message;
    }
    
    
    
}