/**********************************************************************
 * Author       :   MV Clouds
 * Date         :   24-03-2020
 * Description  :   Display Csv data and Update Csv data into Salesforce
***********************************************************************/

public with sharing class updateFieldsController {
    
    //Gets all standard and custom Object from salesforce
    @AuraEnabled(cacheable=true)
    public static List<string> getAllObject() {  
         List<String> sObjectList = new List<String>();
         
        System.debug('global==='+schema.getGlobalDescribe());
        System.debug('global==='+schema.getGlobalDescribe().values());

        for(Schema.SObjectType sObj : schema.getGlobalDescribe().values()){
            if(sObj.getDescribe().isUpdateable() && sObj.getDescribe().isAccessible()){
                sObjectList.add(sObj.getDescribe().getName()+','+sObj.getDescribe().getLabel());
            }
        }
        System.debug('obects===='+sObjectList);
        return sObjectList;
    }
    
    // Current user email address from salesforce 
	@AuraEnabled(cacheable=true)
    public static String getEmail() {    
        String email = UserInfo.getUserEmail();
        System.debug('User Info===='+email);
        return email;
    }    
    
    //Getting fields from salesforce using ObjectName
    @AuraEnabled
    public static List<pairWrapperNew> getObjectSelectField(String ObjectName){
        if(ObjectName == ''){
            return null;
        }
        List<pairWrapper> lstfieldname = new List<pairWrapper>();
        List<pairWrapperNew> apiNameAndList = new List<pairWrapperNew>(); 
        List<String> apiList = new List<String>();
        List<String> labelList = new List<String>();
        Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(ObjectName).getDescribe().fields.getMap();
      
        for (Schema.SObjectField fields: fieldMap.Values()) {  
            if(fields.getDescribe().isAccessible() && fields.getDescribe().isUpdateable()){
                schema.describefieldresult dfield = fields.getDescribe();
                
                pairWrapper field = new pairWrapper();
                
                field.label            = dfield.getLabel();
                field.apiName          = dfield.getName();
                field.fieldType        = String.valueOf(dfield.getType());
                field.fieldSize        = Integer.valueOf(dfield.getLength());
                field.refrence         = String.valueOf(dfield.getReferenceTo());
                field.formulaField     = dfield.getDefaultValueFormula();
                field.relationshipName = dfield.getRelationshipName();    

                 apiList.add((dfield.getName()).toUpperCase());
                 labelList.add((dfield.getLabel()).toUpperCase());


                if((field.apiName == 'Id') || (dfield.isUpdateable() == true) ){
                    lstfieldname.add(field);
                }
                // else if(dfield.isUpdateable() == true){
                //     lstfieldname.add(field);
                // }
            }
        }
        
        Map<String, Schema.SObjectField> fieldMapNew = Schema.getGlobalDescribe().get(ObjectName).getDescribe().fields.getMap();
        
        map<string,string> newMap= new Map<string,string>();
        
        for(String strKey: fieldMapNew.keyset()) {
            newMap.put(strKey, String.valueof(fieldMap.get(strKey)));
        }
        pairWrapperNew fieldNew = new pairWrapperNew();
        
        fieldNew.pairWrapperList = lstfieldname;
        fieldNew.apiNameList = apiList;
        fieldNew.fieldMap1 = newMap;
        fieldNew.labelNameList = labelList;
        apiNameAndList.add(fieldNew);
        System.debug('apinameeee:::'+ apiNameAndList);

        // return lstfieldname;
        return apiNameAndList;
    }
    // to Insert jenish gangani 10/2 show in datatable of data
    @AuraEnabled
    public static  Map<String,Map<String,String>> setInsertQuery(List<String> selectedListOfFields,String selectObjectName,List<String> headerData,String tableData,String tablePushDataListJson, String FieldToUpdateList){
        
        System.debug('Set query called==============');
        System.debug('selectObjectName======'+selectObjectName);
        System.debug('headerData======'+headerData);
        System.debug('tableData======'+tableData);
        System.debug('FieldToUpdateList====='+FieldToUpdateList); 


        Map<String, Integer> IndexFieldCSV = new Map<String, Integer>();
        
        Integer index = 0;
        for(String s : headerData){
            IndexFieldCSV.put(s, index);
            index++;
        }

        System.debug('IndexFieldCSV::::::'+ IndexFieldCSV);
        
        List<String>                    dataList                         = (List<String>)                   System.JSON.deserialize(tableData               , List<String>.class);
        List<uploadCsvFileJsonWrapper>  FieldToUpdateListWpr             = (List<uploadCsvFileJsonWrapper>) System.JSON.deserialize(FieldToUpdateList       , List<uploadCsvFileJsonWrapper>.class);
        
        Map<String,Set<String>>         keyValueMap     = new Map<String,Set<String>>();
        Map<String,Map<String,String>>  csvAllDataMap   = new Map<String,Map<String,String>>();
        
      
        Integer indexofInsert = 0;
        
        String strKey;
        Map<String,String> strValue = new Map<String,String>(); 
        SObjectType r = ((SObject)(Type.forName('Schema.'+selectObjectName).newInstance())).getSObjectType();
   		DescribeSObjectResult d = r.getDescribe();
        //Getting CSV data and storing it into *csvAllDataMap* map
        for(String data : dataList){
            strKey = ''; 
            strValue = new Map<String, String>();
            data=data.trim(); 
            if(data != ''){  
                if(data.endsWith(',')) {
                    data += ' ';
                }
                List<String> StringData = data.split(',(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)');
               

                for(uploadCsvFileJsonWrapper field : FieldToUpdateListWpr){
                    if(IndexFieldCSV.get(field.csvfield)!=null){
                        if(StringData[IndexFieldCSV.get(field.csvfield)].trim().startsWith('"') && StringData[IndexFieldCSV.get(field.csvfield)].trim().endsWith('"')){
                        	strValue.put('CSV' + field.csvfield , StringData[IndexFieldCSV.get(field.csvfield)].trim().removeStart('"').removeEnd('"'));  
                 
                        }else{
                            strValue.put( 'CSV' + field.csvfield , StringData[IndexFieldCSV.get(field.csvfield)].trim());    
                      
                        }                       
                    }
                }
                String sInteger = String.valueOf(indexofInsert);
                csvAllDataMap.put(sInteger, strValue);
               
            }
         
             indexofInsert++;

        }
        
        
        
        List<ContentWorkspace> ws = [SELECT Id, RootContentFolderId FROM ContentWorkspace WHERE Name = 'Mass Update' LIMIT 1];
        if(ws.isEmpty()){
            ContentWorkspace wsf = new ContentWorkspace();
            wsf.Name = 'Mass Update';
            try{
                insert wsf;                                 
            }catch(Exception e){
                // Folder Existed
            }
        }
        System.debug('275=====>'+csvAllDataMap);
        return csvAllDataMap;
    }


        //  Get the csv data and make query for getting salesforce data

      @AuraEnabled
    public static List<wrapDataList> setQuery(List<String> selectedListOfFields,String selectObjectName,List<String> headerData,String tableData,String tablePushDataListJson, String FieldToUpdateList, String keyValueMap, String csvAllDataMap){
        
       System.debug('Set query called==============');
        System.debug('selectedListOfFields===='+selectedListOfFields);
        System.debug('selectObjectName======'+selectObjectName);
        System.debug('headerData======'+headerData);
        System.debug('tableData======'+tableData);
        System.debug('tablePushDataListJson======'+tablePushDataListJson);
        System.debug('FieldToUpdateList====='+FieldToUpdateList);
        System.debug('keyValueMap12====='+keyValueMap);
        System.debug('csvAllDataMap12====='+csvAllDataMap);


        Map<String, Set<String>> mapFromJson = (Map<String, Set<String>>) JSON.deserialize(keyValueMap, Map<String, Set<String>>.class);
        System.debug('mapFromJson '+mapFromJson);

        Map<String, Map<String,String>> dataObj = (Map<String, Map<String,String>>) JSON.deserialize(csvAllDataMap, Map<String, Map<String,String>>.class);
        System.debug('dataObje '+dataObj);

        // Convert the nested Map<String, Object> into a Map<String, Map<String, String>>





        Map<String, Integer> IndexFieldCSV = new Map<String, Integer>();
        
      
        // ----- jenish 26/02
        for (Integer i = 0; i < headerData.size(); i++) {
            IndexFieldCSV.put(headerData[i], i);
        }
        // ----- jenish 26/02
        
        List<String>                    dataList                         = (List<String>)                   System.JSON.deserialize(tableData               , List<String>.class);
        List<uploadCsvFileJsonWrapper>  tablePushDataListJsonDeserialize = (List<uploadCsvFileJsonWrapper>) System.JSON.deserialize(tablePushDataListJson   , List<uploadCsvFileJsonWrapper>.class);
        List<uploadCsvFileJsonWrapper>  FieldToUpdateListWpr             = (List<uploadCsvFileJsonWrapper>) System.JSON.deserialize(FieldToUpdateList       , List<uploadCsvFileJsonWrapper>.class);



       
        DescribeSObjectResult d= Schema.getGlobalDescribe().get(selectObjectName).getDescribe();
       
        
        Set<String> listSql = new Set<String>();    
        String soqlQuer = 'SELECT ';
        
        //Mapping of fields which data have to save into which fields
        if(FieldToUpdateListWpr.size() > 0){
            for(uploadCsvFileJsonWrapper field : FieldToUpdateListWpr){
                if(field.SObjectField != null){
                    if(!listSql.contains(field.SObjectField)){
                        listSql.add(field.SObjectField);
                    }
                }
            }
        }
        
        //Selected fields from CSV to making condition for fetching record
        if(tablePushDataListJsonDeserialize.size() > 0){
            for(uploadCsvFileJsonWrapper field : tablePushDataListJsonDeserialize){
                if(field.SObjectField != null){
                    if(!listSql.contains(field.SObjectField)){
                        listSql.add(field.SObjectField);
                    }
                }
            }
        }
        
        //Showing the fields which data have to Showing from salesforce
        if(selectedListOfFields != null && selectedListOfFields.size() > 0){
            for(String selectFieldOfCheckBox : selectedListOfFields){
                if(!listSql.contains(selectFieldOfCheckBox)){
                    listSql.add(selectFieldOfCheckBox);
                }
            }
        }
        
        
        List<String> lstFetchField = new List<String>();
        lstFetchField.addAll(listSql);
        String allstring = string.join(lstFetchField,',');

        soqlQuer += allstring;
        soqlQuer += ' FROM ' +selectObjectName+ ' WHERE ';
        
        //****************************************** Where condition start from here ***********************************!!
        
        //Getting schema of selected Object
   		
        integer i=0;
        for(String st1 : mapFromJson.keyset()){
            String whereStr = '(';
            String fieldType = String.valueOf(d.fields.getMap().get(st1).getDescribe().getType());        
            for(String s : mapFromJson.get(st1)){
                if(s != null && s != ''){
                	if(fieldType == 'NUMBER' || fieldType == 'DOUBLE' || fieldType == 'Boolean' || fieldType == 'CURRENCY' || fieldType == 'DATETIME' || fieldType == 'PERCENT' || fieldType == 'TIME'){
                        whereStr += s+',';
                    }else if(fieldType == 'DATE'){
                        whereStr += String.valueOf(date.parse(s))+',';    
                    }else{
                        if(s.contains('\'')){
                            whereStr += '\''+s.replace('\'', '\\\'')+'\',';
                        }else{
                            whereStr += '\''+s+'\',';
                        }
                    }
                }
            }
            whereStr = whereStr.removeEnd(',') + ')';
            if(i==0){
                soqlQuer += st1 + ' IN ' + whereStr;
            }else{
                soqlQuer += ' AND ' + st1 + ' IN ' + whereStr;
            }
            i++;
        }
        
        List<ContentWorkspace> ws = [SELECT Id, RootContentFolderId FROM ContentWorkspace WHERE Name = 'Mass Update' LIMIT 1];
        if(ws.isEmpty()){
            ContentWorkspace wsf = new ContentWorkspace();
            wsf.Name = 'Mass Update';
            try{
                insert wsf;                                 
            }catch(Exception e){
                // Folder Existed
            }
        }
        
        List<wrapDataList> listData = new List<wrapDataList>();
        listData.add(new wrapDataList(soqlQuer, dataObj));
        System.debug('ListData====='+listData);
        return listData;
    }
    
    
    // Get data from salesforce and match with csv data
    @AuraEnabled
    public static Map<String,Map<String,String>> setSFData(String selectObjectName, Map<String,Map<String,String>> csvData, String query, String tablePushDataListJson, List<String> headerData, String FieldToUpdateList, List<String> selectedListOfFields){
        System.debug('setSFData Call');
        System.debug('csvData==='+csvData);
        System.debug('query======'+query);
        System.debug('tablePushDataListJson==='+tablePushDataListJson);
        System.debug('headerData==='+headerData);
        System.debug('FieldToUpdateList==='+FieldToUpdateList);
        System.debug('selectedListOfFields===='+selectedListOfFields);



        List<uploadCsvFileJsonWrapper>  tablePushDataListJsonDeserialize = (List<uploadCsvFileJsonWrapper>) System.JSON.deserialize(tablePushDataListJson   , List<uploadCsvFileJsonWrapper>.class);
        List<uploadCsvFileJsonWrapper>  FieldToUpdateListWpr             = (List<uploadCsvFileJsonWrapper>) System.JSON.deserialize(FieldToUpdateList       , List<uploadCsvFileJsonWrapper>.class);
        



        	
      
        if(!selectedListOfFields.contains('Id')){  
             selectedListOfFields.add('Id');
        }
        
        Map<String, Integer> IndexFieldCSV = new Map<String, Integer>();
        Integer index = 0;
        for(String s : headerData){
            IndexFieldCSV.put(s, index);
            index++;
        }
        try {
            List<SObject> SObjectList = database.query(query);  

            
            Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(selectObjectName).getDescribe().fields.getMap();
            
            Map<String, SObject> abcList = new Map<String, SObject>();
            
            for(SObject s : SObjectList){
                string id =''; 
                // Creating Id for data from coming from salesforce
                for(uploadCsvFileJsonWrapper ucv : tablePushDataListJsonDeserialize){
                    if(IndexFieldCSV.get(ucv.csvfield) != null){
                        if(fieldMap.get(ucv.SObjectField).getDescribe().getType() == Schema.DisplayType.DATE){
                            id += String.valueOf(s.get(ucv.SObjectField)).removeEnd(' 00:00:00') + '^';
                        }
                        else if(fieldMap.get(ucv.SObjectField).getDescribe().getType() == Schema.DisplayType.DATETIME){
                            System.debug('Date Time Field Not Supported');
                        }
                        else{
                        	id += s.get(ucv.SObjectField)+'^';
                        }
                    }
                }
                id = id.removeEnd('^');
                abcList.put(id, s);
                    
            }
            System.debug('abcList===> '+ abcList);
            for(String str : abcList.keyset()){
                if(csvData.containsKey(str)){
                    Map<String,String> lstStr = csvData.get(str);
                    SObject lstSalesforce = abcList.get(str);
             
                    for(String a : selectedListOfFields){
                        if(lstSalesforce.get(a) != null ){
                            if(fieldMap.get(a).getDescribe().getType() == Schema.DisplayType.DATETIME){
                                System.debug('disaplay data and time not supported');
                                
                            }else if(fieldMap.get(a).getDescribe().getType() == Schema.DisplayType.DATE){
                                lstStr.put('SF' + a , String.valueOf(Date.valueOf(lstSalesforce.get(a))));
                            }else{
                                lstStr.put('SF' + a , lstSalesforce.get(a)+'' );
                            }
                        }else{
                            lstStr.put('SF' + a , '' ); 
                        }
                    }
                    csvData.put(str,lstStr);
                }
            }

        } catch (Exception e) {
            System.debug('Error ' + e.getMessage() + e.getLineNumber());
        }

        System.debug('csvData=='+csvData);
        return csvData;
    }
    
    // It will set list of Sobject for updating data into salesforce
    @AuraEnabled
    public static String setSobjectList(Map<String,Map<String,String>> allData, String FieldToUpdateList, String selectObjectName){
        System.debug('setSobjectList method call');

        List<uploadCsvFileJsonWrapper>  FieldToUpdateListWpr             = (List<uploadCsvFileJsonWrapper>) System.JSON.deserialize(FieldToUpdateList       , List<uploadCsvFileJsonWrapper>.class);
        List<SObject> objList = new List<SObject>(); 
       
        Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(selectObjectName).getDescribe().fields.getMap();
        
        map<string,string> newMap= new Map<string,string>();
        for(String strKey: fieldMap.keyset()) {
            newMap.put(strKey, String.valueof(fieldMap.get(strKey)));
        }
        
        Schema.SObjectType sobj1 = Schema.getGlobalDescribe().get(selectObjectName);
        
        for(Map<String,String> addMap : allData.values()){
            SObject sobj = sobj1.newSObject();
            for(uploadCsvFileJsonWrapper field : FieldToUpdateListWpr){
                    if(addMap.get('CSV'+field.csvfield) != ''){
                        if(sobj.Id == null){
                            sobj.put('Id' , addMap.get('SFId'));
                        }
                        Schema.DisplayType fielddataType = fieldMap.get(field.SObjectField).getDescribe().getType();
                        System.debug('fielddataType '+fielddataType);
                        if(fieldMap.get(field.SObjectField).getDescribe().isAccessible() && fieldMap.get(field.SObjectField).getDescribe().isUpdateable()){
                            if(fielddataType == Schema.DisplayType.PERCENT || fielddataType == Schema.DisplayType.CURRENCY || fielddataType == Schema.DisplayType.Double){
                                sobj.put(field.SObjectField, Decimal.valueof(addMap.get('CSV'+field.csvfield).trim()));
                            }
                            else if(fielddataType == Schema.DisplayType.DATE){
                                try{ 
                                    sobj.put(field.SObjectField, date.parse(addMap.get('CSV'+field.csvfield).removeEnd(' 00:00:00').trim()));  
                                }catch(Exception e){
                                    System.debug('Error for Date ' + e.getMessage());
                                    return 'Error '+e.getMessage();
                                }
                            } 
                            else if(fielddataType == Schema.DisplayType.DATETIME){
                              
                                try {
                                     sobj.put(field.SObjectField, (DateTime)JSON.deserialize('"' + ((addMap.get('CSV'+field.csvfield).trim()).substringBefore('.') + '.000-00:00') + '"', DateTime.class)); 
                                } catch (Exception e) {
                                    return 'Error ' + e.getMessage();
                                }
                               // jenish gangani update datetime field
                                // sobj.put(field.SObjectField, DATETIME.valueof(lstStr.get(listCSv)));  
                            }
                            else if(fielddataType == Schema.DisplayType.TIME){
                                 try {
                                String[] strTimeSplit = (addMap.get('CSV'+field.csvfield).trim()).split(':');
                                Time timeChange = Time.newInstance( Integer.valueOf(strTimeSplit[0]) //hour
                                                                   ,Integer.valueOf(strTimeSplit[1]) //min
                                                                   ,0                                //sec
                                                                   ,0); 
                              sobj.put(field.SObjectField, timeChange); 
                             } catch (Exception e) {
                                    return 'Error ' + e.getMessage();
                                }                             }
                            else if(fielddataType == Schema.DisplayType.Boolean){
                                sobj.put(field.SObjectField, Boolean.valueof(addMap.get('CSV'+field.csvfield).trim()));  
                            }
                            else{
                                sobj.put(field.SObjectField, addMap.get('CSV'+field.csvfield));  
                                // System.debug(addMap.get('CSV'+field.csvfield));
                            }                            
                        }                        
                    }
            }   
            if(sobj.Id != null){
                objList.add(sobj);    
            }
        }
        System.debug('objList===>645===>'+ objList);
        String objListValue = JSON.serialize(objList);
        return objListValue;
    }

    // --------- jenish gangani 11/02 convert Sobject
    @AuraEnabled
    public static String setSobjectListForInsert(Map<String,Map<String,String>> allData, String FieldToUpdateList, String selectObjectName){
        List<uploadCsvFileJsonWrapper>  FieldToUpdateListWpr             = (List<uploadCsvFileJsonWrapper>) System.JSON.deserialize(FieldToUpdateList       , List<uploadCsvFileJsonWrapper>.class);
        List<SObject> objList = new List<SObject>(); 
       
        Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(selectObjectName).getDescribe().fields.getMap();
        
        Schema.SObjectType sobj1 = Schema.getGlobalDescribe().get(selectObjectName);
        
        for(Map<String,String> addMap : allData.values()){
            SObject sobj = sobj1.newSObject();
            for(uploadCsvFileJsonWrapper field : FieldToUpdateListWpr){
                    if(addMap.get('CSV'+field.csvfield) != ''){
                       
                        Schema.DisplayType fielddataType = fieldMap.get(field.SObjectField).getDescribe().getType();
                        if(fieldMap.get(field.SObjectField).getDescribe().isAccessible() && fieldMap.get(field.SObjectField).getDescribe().isUpdateable()){
                            if(fielddataType == Schema.DisplayType.PERCENT || fielddataType == Schema.DisplayType.CURRENCY || fielddataType == Schema.DisplayType.Double){
                                sobj.put(field.SObjectField, Decimal.valueof(addMap.get('CSV'+field.csvfield).trim()));
                            }
                            else if(fielddataType == Schema.DisplayType.DATE){
                                try{
                                    sobj.put(field.SObjectField, date.parse(addMap.get('CSV'+field.csvfield).removeEnd(' 00:00:00').trim()));      
                                }catch(Exception e){
                                return 'Error '+e.getMessage();
                                }
                            } 
                            else if(fielddataType == Schema.DisplayType.DATETIME){
                                try {
                                     sobj.put(field.SObjectField, (DateTime)JSON.deserialize('"' + ((addMap.get('CSV'+field.csvfield).trim()).substringBefore('.') + '.000-00:00') + '"', DateTime.class)); 
                                } catch (Exception e) {
                                    return 'Error '+e.getMessage();
                                }
                               
                            }
                            else if(fielddataType == Schema.DisplayType.TIME){
                                               // ---- jenish gangani for convert time 2/3/23
                                               try {
                                                String[] strTimeSplit = (addMap.get('CSV'+field.csvfield).trim()).split(':');
                                            Time timeChange = Time.newInstance( Integer.valueOf(strTimeSplit[0]) //hour
                                                                               ,Integer.valueOf(strTimeSplit[1]) //min
                                                                               ,0                                //sec
                                                                               ,0); 
                                          sobj.put(field.SObjectField, timeChange); 
                                          } catch (Exception e) {
                                            return 'Error '+e.getMessage();
                                          } 
                                          // ---- jenish gangani for convert time 2/3/23
                            }
                            else if(fielddataType == Schema.DisplayType.Boolean){
                                sobj.put(field.SObjectField, Boolean.valueof(addMap.get('CSV'+field.csvfield).trim()));  
                            }
                            else{
                                sobj.put(field.SObjectField, addMap.get('CSV'+field.csvfield));  
                            }                            
                        }                        
                    }
            }   
 
                objList.add(sobj);    
        }
        System.debug('objList==>'+ objList);
        return JSON.serialize(objList);
    }

    // --------- jenish gangani 11/02
    
    
    // this method will update data using batch class
    @AuraEnabled
    public static void insertCSVtoSF(String data, String FieldToUpdateList, String selectObjectName){
        System.debug('insertCSVtoSF called==');
        System.debug('Data=='+data);
        System.debug('FieldToUpdateList=='+FieldToUpdateList);
        System.debug('selectObjectName=='+selectObjectName);
       

        List<SObject>                   dataList             = (List<SObject>)                   System.JSON.deserialize(data, List<SObject>.class);
        List<uploadCsvFileJsonWrapper>  FieldToUpdateListWpr = (List<uploadCsvFileJsonWrapper>)  System.JSON.deserialize(FieldToUpdateList, List<uploadCsvFileJsonWrapper>.class);
        
        List<String> csvField = new List<String>();
        
        csvField.add('Id');
        for(uploadCsvFileJsonWrapper field : FieldToUpdateListWpr){
            if(field.SObjectField != 'Id' && !csvfield.contains(field.SObjectField)){
             	csvfield.add(field.SObjectField);   
            }
        }    
        String strcsvfield = string.join(csvfield,',');
        
        UpdateSobjectBatchable updateSObject = new UpdateSobjectBatchable(dataList, strcsvfield, selectObjectName, csvField);
        Database.executeBatch(updateSObject);
    }
    // this method for insert record using batch class jenish gangani 11/02/23
    @AuraEnabled
    public static void insertRecord(String data, String FieldToUpdateList, String selectObjectName){
        System.debug('insertRecord Method');
        System.debug('data of insertRecord===>'+ data);

        List<SObject>                   dataList             = (List<SObject>)                   System.JSON.deserialize(data, List<SObject>.class);
        List<uploadCsvFileJsonWrapper>  FieldToUpdateListWpr = (List<uploadCsvFileJsonWrapper>)  System.JSON.deserialize(FieldToUpdateList, List<uploadCsvFileJsonWrapper>.class);
        
        List<String> csvField = new List<String>();
        
        // csvField.add('Id');
        for(uploadCsvFileJsonWrapper field : FieldToUpdateListWpr){
            if(!csvfield.contains(field.SObjectField)){
             	csvfield.add(field.SObjectField);   
            }
        }    
        String strcsvfield = string.join(csvfield,',');
        
        InsertSobjectBatchable insertSObject = new InsertSobjectBatchable(dataList, strcsvfield, selectObjectName, csvField);
        Database.executeBatch(insertSObject);
    }
    // jenish gangani 11/02/23
    
    public class pairWrapper{
        @AuraEnabled public String label{get; set;}
        @AuraEnabled public String apiName{get; set;}
        @AuraEnabled public String fieldType{get; set;}
        @AuraEnabled public Integer fieldSize{get; set;}
        @AuraEnabled public String refrence{get; set;}
        @AuraEnabled public String formulaField{get; set;}
        @AuraEnabled public String relationshipName{get; set;}

    }


    // -----------jenish gangani
public class pairWrapperNew{
        @AuraEnabled public List<string> apiNameList{get; set;}
        @AuraEnabled public List<string> labelNameList{get; set;}
        @AuraEnabled public List<pairWrapper> pairWrapperList{get; set;}
        @AuraEnabled public Map<String, String> fieldMap1{get; set;}
    }
    // -----------jenish gangani

    
    public class uploadCsvFileJsonWrapper{
        @AuraEnabled public String csvfield{get; set;}  
        @AuraEnabled public String operator{get; set;}  
        @AuraEnabled public String SObjectField{get; set;}
    }
    
    public class wrapDataList{
        @AuraEnabled public String theQuery{get;set;}
        @AuraEnabled public Map<String,Map<String,String>> theMap{get;set;}
        
        public wrapDataList(String theQuery, Map<String,Map<String,String>> theMap){
            this.theQuery   = theQuery;
            this.theMap    = theMap;
        }
    }
    
    public class wrapDataSecond{
        @AuraEnabled public List<SObject> theList{get;set;}
        @AuraEnabled public Map<String,Map<String,String>> theMap{get;set;}
        
        public wrapDataSecond(List<SObject> theList, Map<String,Map<String,String>> theMap){
            this.theList   = theList;
            this.theMap    = theMap;
        }
    }
    // ---------jenish gangani 2/3/23
    @AuraEnabled
    public static Void sendemail(String name, String email, String subject, String body){
        try {
            List<Messaging.SingleEmailMessage> emailList = new List<Messaging.SingleEmailMessage>();
            List<String> address = new List<String>{'ritu.p@mvclouds.com'};
                
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            System.debug('mail :'+ mail);
            mail.setSubject(subject);
            mail.setplaintextbody(body+'\n\n\nFrom '+name +'\nEmail '+email);
            mail.setToAddresses(address);
            emailList.add(mail);
            System.debug('emailList :'+emailList);
            Messaging.sendEmail(emailList);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    // ---------jenish gangani 9/2/23
}