/******************************************************
 * Author       :   MV Clouds
 * Date         :   24-03-2020
 * Description  :   Update Data into Salesforce in batch
*******************************************************/

global class UpdateSobjectBatchable implements Database.Batchable<sObject>, Database.Stateful {

    global Integer recordsProcessed = 0;
    public List<sObject> lstSobject;
    public String strcsv;
    public String sObjectName;
    public List<String> csvfield;
    public String csvErrorValue;
    public String csvValue;
    
    public UpdateSobjectBatchable(List<sObject> dataList, String strcsvfield, String selectObjectName, List<String> csvF){
        lstSobject = dataList;
        strcsv = strcsvfield;
        sObjectName = selectObjectName;
        csvfield = csvF;
    }
    
    global List<sObject> start(Database.BatchableContext bc) {
        csvValue = strcsv + ', Status ' + '\n ';
        csvErrorValue = strcsv + ', Status ' + '\n';
        return lstSobject;
    }
    
    // Update data and make success and error list
    global void execute(Database.BatchableContext bc, List<sObject> scope){

        if(scope.getSObjectType().getDescribe().isAccessible() && scope.getSObjectType().getDescribe().isUpdateable()){
            Database.SaveResult[] resultList = database.update(scope, false);

            List<String> successList = new List<String>();
            List<String> errorList = new List<String>();
            Map<String, String> errorDetailMap = new Map<String, String>();
            
            for (Integer i=0;i<resultList.size();i++){
                System.debug('resultList=='+resultList);
                if(resultList[i].isSuccess()) {
                    System.debug('success===');
                    successList.add(resultList[i].getId());
                } 
                else if(!resultList[i].isSuccess()) {
                    System.debug('Error===');
                    errorList.add(lstSobject.get(i).Id); 
                    Database.Error errors =  resultList[i].getErrors().get(0);
                    errorDetailMap.put(lstSobject.get(i).Id , errors.getMessage());
                }
            }
            
			System.debug('success Id=='+successList);
			System.debug('Error Id=='+errorList);          
            
            String querySuccess = ' SELECT ' + strcsv + ' FROM ' + sObjectName + ' WHERE Id =: successList ';
            List<SObject> sList = (database.query(querySuccess));
            SObjectType r = ((SObject)(Type.forName('Schema.'+sObjectName).newInstance())).getSObjectType();
            DescribeSObjectResult d = r.getDescribe();
            for(SObject sobj : sList){
                
                for(String csvName : csvfield){ 
                    String fieldType = String.valueOf(d.fields.getMap().get(csvName).getDescribe().getType());
                    if(sobj.get(csvName) != null){
                        if(fieldType == 'DATE'){
                            String dateStr = String.valueOf(sobj.get(csvName)).removeEnd(' 00:00:00');
                            
                            list<String> lstSplitDate = dateStr.split('-');
                            
                            String dt = (Integer.valueOf(lstSplitDate[1]) + '/' + Integer.valueOf(lstSplitDate[2]) + '/' + Integer.valueOf(lstSplitDate[0]));
                            
                            csvValue += dt + ',';
                        }else{
                            if((sobj.get(csvName)+'').contains(',')){
                                csvValue += '"'+sobj.get(csvName) + '",';
                            }else{
                                csvValue += sobj.get(csvName) + ','; 
                            }                            
                        }
                    }else{
                        csvValue += '' + ',';
                    } 
                }
                csvValue = csvValue + ' Updated Record ' + '\n';
            }    
            
            
            String queryError = ' SELECT ' + strcsv + ' FROM ' + sObjectName + ' WHERE Id =: errorList ';
            List<SObject> eList = (database.query(queryError));
            
            for(SObject sobj : eList){
                for(String csvName : csvfield){
                    if(sobj.get(csvName) != null){
                        csvErrorValue += sobj.get(csvName) + ',';
                    }else{
                        csvErrorValue += '' + ',';
                    } 
                }
                csvErrorValue += 'error : ' + errorDetailMap.get(sobj.get('Id')+'');
                csvErrorValue += '\n';
            }
        }
    }    
    // send mail to owner with success and error data
    global void finish(Database.BatchableContext bc){
        
        List<Messaging.Emailfileattachment> efaList = new List<Messaging.Emailfileattachment>();
        
        Messaging.EmailFileAttachment csvAttc1 = new Messaging.EmailFileAttachment();
        blob csvBlob = Blob.valueOf(csvValue);
        string csvname= 'SuccessData.csv';
        csvAttc1.setFileName(csvname);
        csvAttc1.setBody(csvBlob);
        
        Messaging.EmailFileAttachment csvAttc2 = new Messaging.EmailFileAttachment();
        blob csvBlob2 = Blob.valueOf(csvErrorValue);
        string csvname2= 'ErrorData.csv';
        csvAttc2.setFileName(csvname2);
        csvAttc2.setBody(csvBlob2);
        
        efaList.add(csvAttc1);
        efaList.add(csvAttc2);
        
        try{
            Messaging.SingleEmailMessage email =new Messaging.SingleEmailMessage();
            String[] toAddresses = new list<string> { 'jenish.g@mvclouds.com' };
            String subject = sObjectName + ' Operation Completed successfully.' ;
            email.setSubject(subject);
            email.setHtmlBody('Dear '+ UserInfo.getFirstName() + ' ' + UserInfo.getLastName() +',<br /><br />'
                +'Thank you for using the Mass Update App. <br />'
                +'We have completed Operation on '+ sObjectName +'. Please find attached file for Error and Success result. <br /><br />'
                +'Regards,');
            email.setToAddresses( toAddresses );
            email.setPlainTextBody('Salesforce Data');
            email.setFileAttachments(efaList);
            Messaging.SendEmailResult [] r = Messaging.sendEmail(new Messaging.SingleEmailMessage[] {email});
        } catch (Exception e) {
            System.debug('Error ' + e.getMessage());
        }
        
        if(ContentVersion.getSObjectType().getDescribe().isAccessible() && ContentVersion.getSObjectType().getDescribe().isUpdateable() && ContentVersion.getSObjectType().getDescribe().isCreateable()){
            List<ContentVersion> cvList = new List<ContentVersion>();
            
            ContentVersion cv = new ContentVersion();
            if(Schema.sObjectType.ContentVersion.fields.VersionData.isCreateable()){
                cv.VersionData = Blob.valueOf(csvValue);    
            }
            if(Schema.sObjectType.ContentVersion.fields.Title.isCreateable()){
                cv.Title = 'SuccessData';
            }
            if(Schema.sObjectType.ContentVersion.fields.PathOnClient.isCreateable()){
                cv.PathOnClient = 'SuccessData.csv';
            }
            cvList.add(cv);
            
            ContentVersion cve = new ContentVersion();
            if(Schema.sObjectType.ContentVersion.fields.VersionData.isCreateable()){
                cve.VersionData = Blob.valueOf(csvErrorValue);
            }
            if(Schema.sObjectType.ContentVersion.fields.Title.isCreateable()){
                cve.Title = 'ErrorData';
            }
            if(Schema.sObjectType.ContentVersion.fields.PathOnClient.isCreateable()){
                cve.PathOnClient = 'ErrorData.csv';
            }
            cvList.add(cve);
            
            insert cvList;
            
            cvList = [SELECT Id, ContentDocumentId FROM ContentVersion WHERE Id IN: cvList];
            ContentWorkspace ws = [SELECT Id, RootContentFolderId FROM ContentWorkspace WHERE Name = 'Mass Update' LIMIT 1];
            
            
            for(ContentVersion cvl : cvList){
                ContentDocumentLink cdl = new ContentDocumentLink();
                cdl.ContentDocumentId = cvl.ContentDocumentId;
                cdl.ShareType = 'I';
                cdl.Visibility = 'AllUsers';
                cdl.LinkedEntityId = ws.Id;
                insert cdl;    
            }
        }else{
            System.debug('User does not have access to Content Version!');
        }
    }    
}