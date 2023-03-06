({
    searchHelper: function (component, event, helper) {
        var action = component.get("c.getAllObject");
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var arr = [];
                var storeResponse = response.getReturnValue();
                console.log('List of string ', { storeResponse });
                // storeResponse.sort();
                // console.log('store======'+storeResponse);
                for (var i = 0; i < storeResponse.length; i++) {
                    arr.push({
                        value: storeResponse[i].split(',')[0],
                        label: storeResponse[i].split(',')[1]
                    });
                }


                // JENISH GANGANI
                arr.sort((a, b) => {
                    let nameA = a.label.toUpperCase(); // ignore upper and lowercase
                    let nameB = b.label.toUpperCase(); // ignore upper and lowercase
                    if (nameA < nameB) {
                        return -1;
                    }
                    if (nameA > nameB) {
                        return 1;
                    }

                    // names must be equal
                    return 0;
                });
                // JENISH GANGANI

                // arr.sort();    
                // console.log('list of objcet:::'+JSON.stringify(arr));         
                component.set("v.ObjectListMain", arr);
            }
        });
        $A.enqueueAction(action);

    },

    getUserEmail: function (component, event, helper) {

        var action = component.get("c.getEmail");
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set('v.UserEmail', response.getReturnValue());
            }
        });
        $A.enqueueAction(action);
    },

    onChangeObject: function (component, event, helper) {
        console.log('onChangeObject');
        component.set("v.IsSpinner", true);
        var getFieldSet = component.get("c.getObjectSelectField");
        var selectedObject = component.get("v.selectedObject") + '';
        getFieldSet.setParams({
            "ObjectName": selectedObject
        });
        getFieldSet.setCallback(this, function (response) {
            var result = response.getState();
            console.log('result===', result);
            if (result === 'SUCCESS' || result === 'DRAFT') {
                console.log('aass::', response.getReturnValue());
                // console.log(response.getReturnValue()[0].apiNameList);
                console.log(response.getReturnValue()[0].pairWrapperList);
                component.set("v.fieldList", response.getReturnValue()[0].pairWrapperList);
                component.set("v.apiListofObject", response.getReturnValue()[0].apiNameList);

                let objList = response.getReturnValue()[0].pairWrapperList;
                let fieldTypeObj = {};
                objList.forEach(e => {
                    fieldTypeObj[e.apiName] = e.fieldType;
                });
                component.set('v.fieldTypeObj', fieldTypeObj);

                var fieldType = response.getReturnValue()[0].fieldMap1;
                component.set('v.schema', fieldType);

                var apiList = component.get("v.apiListofObject")
                console.log('apiame::' + apiList);
                component.set("v.IsSpinner", false);


            } else {
                component.set("v.IsSpinner", false);
                helper.showToast(component, "Error", "Failed!", "Error accur, Something went wrong OnChangeObject");
            }
        });
        $A.enqueueAction(getFieldSet);
    },

    callNexthandle: function (component, event, helper) {
        console.log('table Data=====' + component.get("v.tabledata"));
        console.log('length tab data ======' + component.get("v.tabledata").length);
        console.log('file name in massupdate=====>' + component.get("v.fileName"));
        // -----jenish gangani 12/02 
        var apiList = component.get('v.apiListofObject');
        var headerData = component.get("v.header");
        var operation = component.get("v.operation");
        console.log('opratioon ==>' + operation);
        // headerData[0] = headerData[0].toUpperCase();
        // -----jenish gangani 12/02 

        if (component.get("v.tabledata").length == 0) {
            helper.showToast(component, "Info", "Info!", "Please Upload File");
        } else if (component.get("v.operation") == '') {
            helper.showToast(component, "Info", "Info!", "Please Select Operation");
        } else if (component.get("v.selectedObject") == '') {
            helper.showToast(component, "Info", "Info!", "Please Select Object First");
        }
        // -----jenish gangani 12/02 
        else if (!apiList.includes(headerData[0].toUpperCase())) {
            helper.showToast(component, "Info", "Info!", "Check Your first Record Or Object");
        }
        // -----jenish gangani 12/02 

        else {
            component.set("v.IsSpinner", true);
            var selectedStep = event.getSource().get("v.value");
            console.log('selectedStep' + selectedStep);
            // ----------jenish gangani progress bar
            var toggleIndicatorCurrent = component.find("step1Indicator");
            $A.util.removeClass(toggleIndicatorCurrent, 'slds-tabs--path__item slds-is-current');
            $A.util.addClass(toggleIndicatorCurrent, 'slds-tabs--path__item slds-is-complete');
            var secoundColour = component.find("secoundColour");
            $A.util.addClass(secoundColour, 'secoundColour');
            var toggleIndicatorNext = component.find("step2Indicator");
            $A.util.removeClass(toggleIndicatorNext, 'slds-tabs--path__item slds-is-incomplete');
            $A.util.addClass(toggleIndicatorNext, 'slds-tabs--path__item slds-is-current');
            // ----------jenish gangani

            var nextStep = selectedStep == 'Step1' ? 'Step2' : 'finished';

            var fieldToUpdateList = [];
            var headerData = component.get("v.header");
            var objectField = component.get("v.fieldList");

            //    --------------------------------------------------------------------------------------------------         //jenish gangani 3/2/23
            console.log('headerData Value ::: :::' + headerData);
            console.log('headerData Value in index  ::: :::' + headerData[0]);

            console.log('objectField Value type ::: :::', typeof (objectField));

            console.log('objectField Value ::: :::', objectField);

            //    --------------------------------------------------------------------------------------------------         //jenish gangani 3/2/23

            // JENISH GANGANI 2/2/23 4:00AM
            objectField.sort((a, b) => {
                let nameA = a.label.toUpperCase(); // ignore upper and lowercase
                let nameB = b.label.toUpperCase(); // ignore upper and lowercase
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }

                // names must be equal
                return 0;
            });

            // JENISH GANGANI


            console.log('headerData=====' + headerData);
            console.log('header length=====' + headerData.length);
            console.log('objectField11======' + JSON.stringify(objectField));

            //auto match field
            for (var i = 0; i < headerData.length; i++) {
                var data = {};
                data['csvfield'] = headerData[i];
                for (var j = 0; j < objectField.length; j++) {
                    if (headerData[i] == objectField[j].apiName || headerData[i] == objectField[j].label) {
                        data['SObjectField'] = objectField[j].apiName;
                    }
                }
                fieldToUpdateList.push(data);
            }
            console.log('field to Update List====' + JSON.stringify(fieldToUpdateList));
            component.set('v.FieldToUpdateList', fieldToUpdateList);
            component.set("v.IsSpinner", false);
            if (nextStep == 'finished') {
                component.set("v.finished", nextStep);
            } else {
                helper.addRowRecord(component, event, helper);
                component.set("v.currentStep", nextStep);
            }
        }
    },

    onSelectAllChange: function (component, event, helper) {
        const myCheckboxes = component.find('checkboxfield');
        let chk = (myCheckboxes.length == null) ? [myCheckboxes] : myCheckboxes;
        if (component.get('v.isSelectAll') == false) {
            chk.forEach(checkbox => checkbox.set('v.checked', component.get('v.isSelectAll')));
        } else {
            chk.forEach(checkbox => checkbox.set('v.checked', component.get('v.isSelectAll')));
        }
    },

    addRowRecord: function (component, event, helper) {
        var tableListData = component.get("v.tableListData");

        tableListData.push({
            'csvfield': '',
            'operator': '=',
            'SObjectField': ''
        });

        if (tableListData.length == 1) {
            component.set("v.CriteriaDeleteButton", true);
        } else {
            component.set("v.CriteriaDeleteButton", false);
        }
        component.set("v.tableListData", tableListData);
    },

    addRowMapRecord: function (component, event, helper) {
        var selDataList = component.get("v.FieldToUpdateList");
        selDataList.push({
            'csvfield': '',
            'SObjectField': ''
        });
        if (selDataList.length == 1) {
            component.set("v.FieldMappingDeleteButton", true);
        } else {
            component.set("v.FieldMappingDeleteButton", false);
        }
        component.set("v.FieldToUpdateList", selDataList);
    },

    deleteRowRecord: function (component, event, helper) {

        var tableDataList = component.get("v.tableListData");
        console.log('tableDataList' + tableDataList);
        var index = event.getSource().get('v.name');

        tableDataList.splice(index, 1);
        component.set("v.tableListData", tableDataList);

        if (tableDataList.length == 1) {
            console.log('index of deleteRowRecord' + tableDataList.length);
            component.set("v.CriteriaDeleteButton", true);
        } else {
            console.log('index of deleteRowRecord else condition' + tableDataList.length);
            component.set("v.CriteriaDeleteButton", false);
        }
    },
    deleteMapRowRecord: function (component, event, helper) {

        var selDataList = component.get("v.FieldToUpdateList");
        console.log('selDataList:::' + selDataList);
        var index = event.getSource().get('v.name');
        console.log('index:::' + index);

        selDataList.splice(index, 1);

        component.set("v.FieldToUpdateList", selDataList);

        if (selDataList.length == 1) {
            console.log('index of deleteMapRowRecord' + selDataList.length);
            component.set("v.FieldMappingDeleteButton", true);
        } else {
            console.log('index of deleteMapRowRecord else condition' + selDataList.length);
            component.set("v.FieldMappingDeleteButton", false);
        }
    },


    setSobject: function (component, event, helper, ResultOfAllData, sfPushDataListJson, selectObjectName) {

        var action = component.get('c.setSobjectList');

        action.setParams({
            'allData': ResultOfAllData,
            'FieldToUpdateList': sfPushDataListJson,
            'selectObjectName': selectObjectName,
        });
        action.setCallback(this, function (response) {
            var result = response.getState();
            console.log('erroe ' + response.getError());
            console.log('result :::::' + result)
            if (result == 'SUCCESS') {
                var res = response.getReturnValue();
                if (res.startsWith('Error Invalid')) {
                    helper.showToast(component, "Info", "Info!", res);
                    component.set("v.stepOneNextButton", true);
                } else {
                    // console.log('check the typeof:::;'+ typeof())
                    console.log('res::::' + JSON.stringify(res));
                    component.set("v.updateFieldList", res);
                }
            } else {
                helper.showToast(component, "Error", "Failed!", + 'Error accur, Something went wrong setSobject');
            }
            component.set("v.IsSpinner", false);
        });
        $A.enqueueAction(action);
    },

    // --------jenish gangani 11/02 for insert data
    setSobjectforInsertRecord: function (component, event, helper, ResultOfAllData, sfPushDataListJson, selectObjectName) {

        var action = component.get('c.setSobjectListForInsert');

        action.setParams({
            'allData': ResultOfAllData,
            'FieldToUpdateList': sfPushDataListJson,
            'selectObjectName': selectObjectName,
        });
        action.setCallback(this, function (response) {
            var result = response.getState();

            if (result == 'SUCCESS') {
                component.set("v.IsSpinner", true);
                var res = response.getReturnValue();
                console.log('res==>' + res);
                console.log('resfor insert::::' + JSON.stringify(res));
                if (res.startsWith('Error Invalid')) {
                    helper.showToast(component, "Info", "Info!", res);
                    component.set("v.stepOneNextButton", true);
                } else {

                    let insertData = response.getReturnValue();
                    component.set("v.insertFieldList", insertData);
                    console.log('component::==>' + component.get("v.insertFieldList"));
                }


            } else {
                helper.showToast(component, "Error", "Failed!", "Error accur, Something went wrong setSobjectforInsertRecord");
            }
            component.set("v.IsSpinner", false);

        });
        $A.enqueueAction(action);
    },



    getSobjectList: function (component, event, helper, resultdata, query, selectObjectName, tablePushDataListJson, headerData, sfPushDataListJson, selectedListOfFields) {

        var pageSize = component.get('v.pageSize');
        var pageNumber = component.get('v.pageNumber');

        var action = component.get("c.setSFData");
        action.setParams({
            'selectObjectName': selectObjectName,
            'csvData': resultdata,
            'query': query,
            'tablePushDataListJson': tablePushDataListJson,
            'headerData': headerData,
            'FieldToUpdateList': sfPushDataListJson,
            'selectedListOfFields': selectedListOfFields,
        });
        action.setCallback(this, function (response) {
            var state = response.getState();

            if (state === 'SUCCESS' || state === 'DRAFT') {
                var fieldHeaderListing = [], SFData = [], CSVData = [];
                var ResultOfAllData = response.getReturnValue();

                console.log('ResultOfAllData====' + ResultOfAllData);
                console.log('ResultOfAllData====' + JSON.stringify(ResultOfAllData));

                var i = 0;

                for (var key in ResultOfAllData) {

                    if (i < Object.keys(ResultOfAllData[key]).length) {
                        fieldHeaderListing = [];
                        i = Object.keys(ResultOfAllData[key]).length;
                        var sfid = 0;
                        var srno = {};
                        srno['label'] = "Sr No";
                        srno['fieldName'] = "SrNo";
                        srno['type'] = "text";
                        srno['initialWidth'] = 70;
                        fieldHeaderListing.push(srno);
                        console.log('fieldHeaderListing1:::::' + JSON.stringify(fieldHeaderListing));
                        for (var val in ResultOfAllData[key]) {
                            if (val.startsWith("SFId")) {
                                sfid++;
                                var data = {};
                                data['label'] = val.replace('SF', '');
                                data['fieldName'] = val;
                                data['type'] = 'url';
                                data['typeAttributes'] = { label: { fieldName: val }, target: '_blank' };
                                fieldHeaderListing.push(data);
                            }
                        }
                        console.log('fieldHeaderListing2:::::' + JSON.stringify(fieldHeaderListing));
                        var csvCount = 0, sfCount = 0;
                        for (var val in ResultOfAllData[key]) {
                            if (val.startsWith("SF")) {
                                if (val !== "SFId") {
                                    sfCount++;
                                    var data = {};
                                    data['label'] = val.replace('SF', '');
                                    data['fieldName'] = val;
                                    data['type'] = 'text';
                                    data['cellAttributes'] = { class: { fieldName: 'sfcols' } };
                                    fieldHeaderListing.push(data);
                                }
                            }
                        }
                        console.log('fieldHeaderListing3:::::' + JSON.stringify(fieldHeaderListing));
                        for (var val in ResultOfAllData[key]) {
                            if (val.startsWith("CSV")) {
                                csvCount++;
                                var data = {};
                                data['label'] = val.replace('CSV', '');
                                data['fieldName'] = val;
                                data['type'] = 'text';
                                data['cellAttributes'] = { class: { fieldName: 'csvcols' } };
                                fieldHeaderListing.push(data);
                            }
                        }
                        console.log('fieldHeaderListing4:::::::' + JSON.stringify(fieldHeaderListing));
                    }
                }
                var ListData = [], TempListData = [], srno = 1;
                for (var key in ResultOfAllData) {
                    var data = {};
                    data['SrNo'] = srno + '';
                    for (var val in ResultOfAllData[key]) {
                        if (val == 'SFId') {
                            data[val] = '/' + ResultOfAllData[key][val];
                        } else {
                            data[val] = ResultOfAllData[key][val];
                        }
                        if (val.startsWith('SF')) {
                            data['sfcols'] = 'sfcol';
                        } else {
                            data['csvcols'] = 'csvcol';
                        }
                    }
                    srno++;
                    ListData.push(data);
                    if (TempListData.length < pageSize) {
                        TempListData.push(data);
                    }
                }
                if (sfid == 0) {
                    helper.showToast(component, "Info", "Info!", "Could not found data");
                }
                if (ListData.length <= pageSize * (pageNumber)) {
                    component.set('v.isLastPage', true);
                } else {
                    component.set('v.isLastPage', false);
                }

                var totalSize = ListData.length / pageSize;

                console.log('TempListData==' + JSON.stringify(TempListData));
                console.log('totalSize===' + totalSize);
                console.log('sfid===' + sfid);
                console.log('fieldHeaderListing===' + JSON.stringify(fieldHeaderListing));
                console.log('ResultOfAllData===' + JSON.stringify(ResultOfAllData));
                console.log('dataSize===' + ListData.length);
                console.log('TableLightningData===' + JSON.stringify(TempListData));


                component.set("v.totalPage", totalSize);
                component.set("v.sfId", sfid);
                component.set("v.columns", fieldHeaderListing);
                component.set('v.ResultOfAllData', ListData);
                component.set("v.dataSize", ListData.length);
                component.set('v.TableLightningData', TempListData);

                helper.setSobject(component, event, helper, ResultOfAllData, sfPushDataListJson, selectObjectName);

            } else {
                component.set("v.IsSpinner", false);
                helper.showToast(component, "Error", "Failed!", "Error accur, Something went wrong getSobjectList");
            }

        });
        $A.enqueueAction(action);
    },

    nextWriteQuery: function (component, event, helper) {
        console.log('next write query called====');
        component.set("v.IsSpinner", true);
        var selectedFieldsListArray = [];
        console.log('selectedFieldsListArray:::::' + selectedFieldsListArray);
        var action = component.get("c.setQuery");
        console.log('action::::' + JSON.stringify(action));
        var selectObjectName = component.get("v.selectedObject");
        console.log('selectobjectName:::' + selectObjectName);
        var headerData = component.get('v.header');
        console.log('headerData::::::' + headerData);
        var tableData = component.get('v.tabledata');
        console.log('tabledata::::::' + tableData);
        var tablePushDataList = component.get('v.tableListData');
        console.log('tablePushDataList:::::::' + JSON.stringify(tablePushDataList));
        var sfPushData = component.get('v.FieldToUpdateList');
        console.log('sfPushData:::::::' + JSON.stringify(sfPushData));
        var pageNumber = component.get('v.pageNumber');
        console.log('pageNumber:::::::' + pageNumber);
        var pageSize = component.get('v.pageSize');
        console.log('pageSize:::::::' + pageSize);

        var checkedBox = component.find('checkboxfield');

        console.log('checkBox::::::' + checkedBox);
        for (var i = 0; i < checkedBox.length; i++) {
            if (checkedBox[i].get("v.checked") == true && checkedBox[i].get("v.name") != null) {
                selectedFieldsListArray.push(checkedBox[i].get("v.name"));
            }
        }
        console.log('selectedFieldsListArray:::::::' + selectedFieldsListArray);

        var tableDataString = JSON.stringify(tableData);
        console.log('tableDataString:::' + tableDataString);
        var tablePushDataListJson = JSON.stringify(tablePushDataList);
        console.log('tablePushDataListJson:::::' + tablePushDataListJson);
        var sfPushDataListJson = JSON.stringify(sfPushData);
        console.log('sfPushDataListJson:::::' + sfPushDataListJson);

        let IndexFieldCSV = new Map();

        for (let i = 0; i < headerData.length; i++) {
            IndexFieldCSV.set(headerData[i], i);
        }

        let dataList = JSON.parse(tableDataString);
        let tablePushDataListJsonDeserialize = JSON.parse(tablePushDataListJson);
        let FieldToUpdateListWpr = JSON.parse(sfPushDataListJson);

        console.log('IndexFieldCSV=====' + IndexFieldCSV);
        console.log('dataList 2nd======' + dataList);
        console.log('tablePushDataListJsonDeserialize 2nd======' + tablePushDataListJsonDeserialize);
        console.log('FieldToUpdateListWpr 2nd =====' + FieldToUpdateListWpr);



        // var objSchema = sforce.connection.describeSObject('Account');
        // console.log('objectSchema==>' + objSchema);



        var keyValueMap = new Map();
        var csvAllDataMap = new Map();
        var selectedListOfFields = selectedFieldsListArray;

        for (let ucv of tablePushDataListJsonDeserialize) {
            keyValueMap.set(ucv.SObjectField, new Set());
        }
        console.log('121== keyvalueMap==>' + keyValueMap);

        if (!selectedListOfFields.includes('Id')) {
            selectedListOfFields.push('Id');
        }
        console.log('selected field===' + selectedListOfFields);

        let mnList = [];
        let j = 0;
        let strKey;
        var strValue = new Map();
        let k = 0;
        const fieldTypeObject = component.get('v.fieldTypeObj');

        for (let data of dataList) {
            strKey = '';
            strValue = new Map();
            k = 0;
            data = data.trim();
            if (data !== '') {
                if (data.endsWith(',')) {
                    data += ' ';
                }

                let StringData = data.split(",");


                for (let ucv of tablePushDataListJsonDeserialize) {
                    // console.log('IndexFieldCSV.get(ucv.csvfield)===148==>' + IndexFieldCSV.get(ucv.csvfield));
                    if (IndexFieldCSV.get(ucv.csvfield) !== undefined) {
                        if (keyValueMap.has(ucv.SObjectField)) {

                            let fieldType = fieldTypeObject[ucv.SObjectField];
                            // console.log('field type-->'+ fieldType);

                            let celldata = StringData[IndexFieldCSV.get(ucv.csvfield)];
                            if (fieldType === 'DATE') {
                                strKey += String(date.parse(celldata)).replace(/\s\d{2}:\d{2}:\d{2}/, "").trim() + '^';
                            } else {
                                if (celldata.trim().replace(/"/g, '') && celldata.trim().replace(/"/g, '')) {
                                    // console.log(celldata.trim().removeStart('"').removeEnd('"'));
                                    strKey += celldata.trim() + '^';
                                    // console.log('strKey===161==>', strKey);
                                } else {
                                    strKey += celldata.trim() + '^';
                                    // console.log('strKey===164==>', strKey);
                                }
                            }
                            keyValueMap.get(ucv.SObjectField).add(celldata.trim());
                            // console.log('keyValueMap====>',keyValueMap);
                            // }
                        }
                    }
                }

                for (let field of FieldToUpdateListWpr) {
                    if (IndexFieldCSV.get(field.csvfield) != null) {
                        let celldata = StringData[IndexFieldCSV.get(field.csvfield)].trim();
                        if (celldata.replace(/"/g, "") && celldata.replace(/"/g, "")) {
                            strValue.set('CSV' + field.csvfield, celldata.replace(/""/g, ''));
                        } else {
                            strValue.set('CSV' + field.csvfield, celldata);
                        }
                    }
                }
                // console.log('192 ==> strValue ==> ', strValue);
                csvAllDataMap.set(strKey.slice(0, -1), strValue);
                // console.log('csvAllDataMap===>', csvAllDataMap);

            }
            // var csvdata = JSON.stringify(csvAllDataMap);


        }



        var obj1 = {};
        for (let [key, value] of keyValueMap) {
            obj1[key] = Array.from(value);
        }
        var keyValueMap1 = JSON.stringify(obj1);

        const csvAllDataObject = {};
        csvAllDataMap.forEach((value, key) => {
            csvAllDataObject[key] = Object.fromEntries(value.entries());
            // console.log('csvAllDataObject[key] ' + csvAllDataObject[key]);

        });
        // var csvAllDataMap1 = JSON.stringify(obj2);
        var csvAllDataMap1 = JSON.stringify(csvAllDataObject);


        // --------------------------------------------------- jenish gangani 27/02



        action.setParams({
            'selectedListOfFields': selectedFieldsListArray,
            'selectObjectName': selectObjectName,
            'headerData': headerData,
            'tableData': tableDataString,
            'tablePushDataListJson': tablePushDataListJson,
            'FieldToUpdateList': sfPushDataListJson,
            'keyValueMap': keyValueMap1,
            'csvAllDataMap': csvAllDataMap1,
        });

        action.setCallback(this, function (response) {
            var resultFull = response.getState();

            if (resultFull === 'SUCCESS' || resultFull === 'DRAFT') {
                var res = response.getReturnValue();
                var result = res[0];
                console.log('res==>' + JSON.stringify(res[0]));
                helper.getSobjectList(component, event, helper, result['theMap'], result['theQuery'], selectObjectName, tablePushDataListJson, headerData, sfPushDataListJson, selectedFieldsListArray);

            } else {
                console.log('err ' + response.getError());
                component.set("v.IsSpinner", false);
                helper.showToast(component, "Error", "Failed!", "Error accur, Something went wrong nextWritequery");
            }
        });
        $A.enqueueAction(action);
    },

    saveRecordData: function (component, event, helper) {
        component.set("v.IsSpinner", true);
        var action = component.get('c.insertCSVtoSF');
        var data = component.get("v.updateFieldList");
        var sfPushData = component.get('v.FieldToUpdateList');
        var selectObjectName = component.get("v.selectedObject");
        var sfPushDataListJson = JSON.stringify(sfPushData);

        action.setParams({
            'data': data,
            'FieldToUpdateList': sfPushDataListJson,
            'selectObjectName': selectObjectName
        });
        action.setCallback(this, function (response) {
            var status = response.getState();
            if (status == 'SUCCESS') {

            } else {
                component.set("v.IsSpinner", false);
                helper.showToast(component, "Error", "Failed!", "Error accur, Something went wrong saveRecordData");
            }
            component.set("v.IsSpinner", false);
        });
        $A.enqueueAction(action);
    },
    saveRecordsToSFForToInsert: function (component, event, helper) {
        component.set("v.IsSpinner", true);
        var action = component.get('c.insertRecord');
        var dataOfInsert = component.get("v.insertFieldList");
        var sfPushData = component.get('v.FieldToUpdateList');
        var selectObjectName = component.get("v.selectedObject");
        var sfPushDataListJson = JSON.stringify(sfPushData);
        console.log('component==>' + component.get("v.insertFieldList"));
        console.log('dataOfInsert==>', dataOfInsert);

        action.setParams({
            'data': dataOfInsert,
            'FieldToUpdateList': sfPushDataListJson,
            'selectObjectName': selectObjectName
        });
        action.setCallback(this, function (response) {
            var status = response.getState();
            if (status == 'SUCCESS') {

            } else {
                component.set("v.IsSpinner", false);
                helper.showToast(component, "Error", "Failed!", "Error accur, Something went wrong saveRecordsToSFForInsert");
            }
            component.set("v.IsSpinner", false);
        });
        $A.enqueueAction(action);
    },
    showToast: function (component, type, title, message) {
        try {
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "type": type,
                "title": title,
                "message": message
            });
            toastEvent.fire();
        } catch (e) {
            component.set('v.toastMsg', type);
            component.set('v.toastDescMsg', message);
            setTimeout(function () {
                component.set('v.toastMsg', null);
                component.set('v.toastDescMsg', null);
            }, 5000);
        }
    },

    pageRecord: function (component, event, helper) {
        var result = component.get('v.ResultOfAllData');
        var pageNumber = component.get('v.pageNumber');
        var pageSize = component.get('v.pageSize');
        var dataSize = component.get('v.dataSize');
        if (dataSize <= pageSize * (pageNumber)) {
            component.set('v.isLastPage', true);
        } else {
            component.set('v.isLastPage', false);
        }
        var temp = (pageNumber - 1) * pageSize;
        var tempData = [];
        for (var i = temp; i < temp + pageSize; i++) {
            if (result[i] != '' && result[i] != null) {
                tempData.push(result[i]);
            }
        }
        component.set('v.TableLightningData', tempData);
    },
    // Record insert Method 
    insertRecord: function (component, event, helper) {
        console.log('insertRecord called====');
        component.set("v.IsSpinner", true);
        var action = component.get("c.setInsertQuery");
        console.log('action::::' + action);
        var selectObjectName = component.get("v.selectedObject");
        console.log('selectobjectName:::' + selectObjectName);
        var headerData = component.get('v.header');
        console.log('headerData::::::' + headerData);
        var tableData = component.get('v.tabledata');
        console.log('tabledata::::::' + tableData);
        var sfPushData = component.get('v.FieldToUpdateList');
        console.log('sfPushData:::::::' + JSON.stringify(sfPushData));
        var pageNumber = component.get('v.pageNumber');
        console.log('pageNumber:::::::' + pageNumber);
        var pageSize = component.get('v.pageSize');
        console.log('pageSize:::::::' + pageSize);
        var tableDataString = JSON.stringify(tableData);
        console.log('tableDataString:::::' + tableDataString);
        var sfPushDataListJson = JSON.stringify(sfPushData);
        console.log('sfPushDataListJson:::::::' + sfPushDataListJson);

        action.setParams({
            'selectObjectName': selectObjectName,
            'headerData': headerData,
            'tableData': tableDataString,
            'FieldToUpdateList': sfPushDataListJson,
        });

        action.setCallback(this, function (response) {
            var resultFull = response.getState();
            console.log('resultFulll::::::' + resultFull);

            if (resultFull === 'SUCCESS' || resultFull === 'DRAFT') {
                var ResultOfAllData = response.getReturnValue();
                console.log('result of the res::::' + JSON.stringify(ResultOfAllData));

                for (var key in ResultOfAllData) {

                    console.log('key:::' + key);
                    console.log('ResultOfAllData:::' + ResultOfAllData);
                    var i = 0;
                    var fieldHeaderListing = []


                    if (i < Object.keys(ResultOfAllData[key]).length) {
                        fieldHeaderListing = [];
                        i = Object.keys(ResultOfAllData[key]).length;

                        var sfid = 0;
                        var srno = {};
                        srno['label'] = "Sr No";
                        srno['fieldName'] = "SrNo";
                        srno['type'] = "text";
                        srno['initialWidth'] = 70;
                        fieldHeaderListing.push(srno);

                        var csvCount = 0, sfCount = 0;

                        console.log('fieldHeaderListing3:::::' + JSON.stringify(fieldHeaderListing));
                        for (var val in ResultOfAllData[key]) {
                            if (val.startsWith("CSV")) {
                                csvCount++;
                                var data = {};
                                data['label'] = val.replace('CSV', '');
                                data['fieldName'] = val;
                                data['type'] = 'text';
                                data['cellAttributes'] = { class: { fieldName: 'csvcols' } };
                                fieldHeaderListing.push(data);
                            }
                        }
                        console.log('fieldHeaderListing4:::::::' + JSON.stringify(fieldHeaderListing));
                    }
                }
                var ListData = [], TempListData = [], srno = 1;
                for (var key in ResultOfAllData) {
                    var data = {};
                    data['SrNo'] = srno + '';
                    for (var val in ResultOfAllData[key]) {
                        if (val == 'SFId') {
                            data[val] = '/' + ResultOfAllData[key][val];
                        } else {
                            data[val] = ResultOfAllData[key][val];
                        }
                        if (val.startsWith('SF')) {
                            data['sfcols'] = 'sfcol';
                        } else {
                            data['csvcols'] = 'csvcol';
                        }
                    }
                    srno++;
                    ListData.push(data);
                    if (TempListData.length < pageSize) {
                        TempListData.push(data);
                    }
                }
                if (ListData.length <= pageSize * (pageNumber)) {
                    component.set('v.isLastPage', true);
                } else {
                    component.set('v.isLastPage', false);
                }

                var totalSize = ListData.length / pageSize;

                console.log('TempListData==' + JSON.stringify(TempListData));
                console.log('totalSize===' + totalSize);
                console.log('sfid===' + sfid);
                console.log('fieldHeaderListing===' + JSON.stringify(fieldHeaderListing));
                console.log('ResultOfAllData===' + JSON.stringify(ResultOfAllData));
                console.log('dataSize===' + ListData.length);
                console.log('TableLightningData===' + JSON.stringify(TempListData));


                component.set("v.totalPage", totalSize);
                component.set("v.sfId", sfid);
                component.set("v.columns", fieldHeaderListing);
                component.set('v.ResultOfAllData', ListData);
                component.set("v.dataSize", ListData.length);
                component.set('v.TableLightningData', TempListData);

                // component.set("v.IsSpinner", false);
                helper.setSobjectforInsertRecord(component, event, helper, ResultOfAllData, sfPushDataListJson, selectObjectName);


            } else {
                component.set("v.IsSpinner", false);
                helper.showToast(component, "Error", "Failed!", "Error accur, Something went wrong insert Method");
            }
        });
        $A.enqueueAction(action);
    },


})