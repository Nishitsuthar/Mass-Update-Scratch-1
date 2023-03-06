global class InsertSobjectBatchable implements Database.Batchable<sObject>, Database.Stateful  {
    public List<sObject> lstSobject;
    public String strcsv;
    public String sObjectName;
    public List<String> csvfield;
    public String csvErrorValue;
    public String csvValue;

    public InsertSobjectBatchable(List<sObject> dataList, String strcsvfield, String selectObjectName, List<String> csvF){
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
    global void execute(Database.BatchableContext bc, List<sObject> scope){
        System.debug('lstSobject=='+lstSobject);
        System.debug('strcsv=='+strcsv);
        System.debug('sObjectName=='+sObjectName);
        System.debug('csvfield=='+csvfield);
        if(scope.getSObjectType().getDescribe().isAccessible() && scope.getSObjectType().getDescribe().isUpdateable()){
            Database.SaveResult[] resultList = database.insert(scope, false);
            System.debug('resultList=='+resultList);

            List<String> successList = new List<String>();
            List<SObject> errorList = new List<SObject>();
            Map<String, String> errorDetailMap = new Map<String, String>();
            List<String> errorMessage = new List<String>();
            // String errorMessage;

            
            for (Integer i=0;i<resultList.size();i++){
                
                if(resultList[i].isSuccess()) {
                    System.debug('success===');
                    successList.add(resultList[i].getId());
                } 
                // if(!resultList[i].isSuccess())
                else if(resultList[i].getId() == null){
                    
                    errorList.add(lstSobject.get(i)); 
                    Database.Error errors =  resultList[i].getErrors().get(0);
                    System.debug('error massage:::'+ errors);
                    errorMessage.add(errors.getMessage());
                    // errorDetailMap.put(lstSobject.get(i).Id , errors.getMessage());
                }
                System.debug('erorList data:::::'+ errorList);
                System.debug('csvErrorValue==='+csvErrorValue);
            }
            

            String querySuccess = ' SELECT ' + strcsv + ' FROM ' + sObjectName + ' WHERE Id =: successList ';
            List<SObject> sList = (database.query(querySuccess));
            SObjectType r = ((SObject)(Type.forName('Schema.'+sObjectName).newInstance())).getSObjectType();
            DescribeSObjectResult d = r.getDescribe();

            System.debug('Success List==='+sList);
            for(SObject sobj : sList){
                System.debug('In Success List==');

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
                csvValue = csvValue + ' Insert Record ' + '\n';
            }    
            

            // String queryError = ' SELECT ' + strcsv + ' FROM ' + sObjectName + ' WHERE Id =: errorList ';
            // List<SObject> eList = (database.query(queryError));
            List<SObject> eList = errorList;
            System.debug('eList=='+eList);
            Integer a =0;
            for(SObject sobj : eList){
                System.debug('In Error Loop==');
                for(String csvName : csvfield){
                    if(sobj.get(csvName) != null){
                        csvErrorValue += sobj.get(csvName) + ',';
                    }else{
                        csvErrorValue += '' + ',';
                    } 
                }
                // csvErrorValue += 'error : ' + errorDetailMap.get(sobj.get('Id')+'');
                csvErrorValue += 'error : ' + errorMessage[a] + '';
                csvErrorValue += '\n';
                a++;
            }
             
           

        }
    }
    global void finish(Database.BatchableContext bc){
        System.debug('Finish Called====');
        List<Messaging.Emailfileattachment> efaList = new List<Messaging.Emailfileattachment>();
        
        Messaging.EmailFileAttachment csvAttc1 = new Messaging.EmailFileAttachment();
        blob csvBlob = Blob.valueOf(csvValue);
        string csvname= 'SuccessData.csv';
        csvAttc1.setFileName(csvname);
        csvAttc1.setBody(csvBlob);
        
        Messaging.EmailFileAttachment csvAttc2 = new Messaging.EmailFileAttachment();
        blob csvBlob2 = Blob.valueOf(csvErrorValue);
        string csvname2= 'ErrorData.csv';
        System.debug('error converted==='+csvBlob2.tostring());
        csvAttc2.setFileName(csvname2);
        csvAttc2.setBody(csvBlob2);
        
        efaList.add(csvAttc1);
        efaList.add(csvAttc2);
        
        try{
            Messaging.SingleEmailMessage email =new Messaging.SingleEmailMessage();
            String[] toAddresses = new list<string> { UserInfo.getUserEmail() };
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