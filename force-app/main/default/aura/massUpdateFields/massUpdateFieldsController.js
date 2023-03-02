({
    onChange: function (component, event, helper) {
        component.set("v.operation", component.find('select').get('v.value'));
    },
    doinit: function (component, event, helper) {
        component.set("v.IsSpinner", true);
        helper.searchHelper(component, event, helper);
        helper.getUserEmail(component, event, helper);
        component.set("v.IsSpinner", false);

        console.log('object main====>' + component.get("v.ObjectListMain"));
    },
    onblur: function (component, event, helper) {
        component.set("v.listOfSearchRecords", null);
        var forclose = component.find("searchRes");
        $A.util.addClass(forclose, 'slds-is-close');
        $A.util.removeClass(forclose, 'slds-is-open');
    },

    // function for clear the Record Selection 
    clear: function (component, event, helper) {
        helper.clear(component, event, helper);
    },

    // This function call when the end User Select any record from the result list.   
    handleComponentEvent: function (component, event, helper) {
        helper.handleComponentEvent(component, event, helper);
    },

    onChangeObject: function (component, event, helper) {
        // component.set("v.IsSpinner", false);
        helper.onChangeObject(component, event, helper);
        // component.set("v.IsSpinner", true);

    },
    //    first next button
    callNexthandle: function (component, event, helper) {
        helper.callNexthandle(component, event, helper);
    },

    onSelectAllChange: function (component, event, helper) {
        helper.onSelectAllChange(component, event, helper);
    },

    dragAndDropBar: function (component, event, helper) {
        var selectedStep2 = event.getSource().get("v.value");
        var nextStep = 'Step1';

        if (nextStep == 'finished') {
            component.set("v.finished", nextStep);
        } else {
            component.set("v.currentStep", nextStep);
        }
    },

    mapFieldBar: function (component, event, helper) {
        var selectedStep2 = event.getSource().get("v.value");
        var nextStep = 'Step2';

        if (nextStep == 'finished') {
            component.set("v.finished", nextStep);
        } else {
            component.set("v.currentStep", nextStep);
        }
    },

    updateFieldBar: function (component, event, helper) {
        var selectedStep3 = event.getSource().get("v.value");
        var nextStep = 'Step3';

        if (nextStep == 'finished') {
            component.set("v.finished", nextStep);
        } else {
            component.set("v.currentStep", nextStep);
        }
    },

    previousClikButton: function (component, event, helper) {
        console.log('previousClikButton');
        var selectedStep = event.getSource().get("v.value");
        console.log('selectstep=====' + selectedStep);
        // -----------------------------jenish gangani 8/2/23
        var toggleIndicatorNext = component.find("step2Indicator");
        $A.util.addClass(toggleIndicatorNext, 'slds-tabs--path__item slds-is-incomplete');
        $A.util.removeClass(toggleIndicatorNext, 'slds-tabs--path__item slds-is-current');
        var toggleIndicatorCurrent = component.find("step1Indicator");
        var secoundColour = component.find("secoundColour");
        $A.util.removeClass(secoundColour, 'secoundColour');
        $A.util.addClass(toggleIndicatorCurrent, 'slds-tabs--path__item slds-is-current');
        $A.util.removeClass(toggleIndicatorCurrent, 'slds-tabs--path__item slds-is-complete');

        // -----------------------------jenish gangani 8/2/23
        var nextStep = selectedStep == 'Step2' ? 'Step1' : 'finished';
        component.set("v.progress", '100');
        console.log('file name==>' + component.get('v.fileName'));

        // component.set("v.fileName", '100');


        if (nextStep == 'finished') {
            component.set("v.finished", nextStep);
        } else {
            // --------------------------------------------------------- jenish gangani
            // $A.get('e.force:refreshView').fire();
            // let lastname = sessionStorage.getItem('key');
            // console.log('lastnammeata:::' + lastname);
            // csv
            helper.deleteRowRecord(component, event, helper);
            // --------------------------------------------------------- jenish gangani
            component.set("v.currentStep", nextStep);

        }
    },

    PreviousStep2: function (component, event, helper) {
        var selectedStep = event.getSource().get("v.value");
        // --------------------------------------------jenish gangani
        var toggleIndicatorNext = component.find("step3Indicator");
        $A.util.addClass(toggleIndicatorNext, 'slds-tabs--path__item slds-is-incomplete');
        $A.util.removeClass(toggleIndicatorNext, 'slds-tabs--path__item slds-is-current');
        var toggleIndicatorCurrent = component.find("step2Indicator");
        $A.util.addClass(toggleIndicatorCurrent, 'slds-tabs--path__item slds-is-current');
        $A.util.removeClass(toggleIndicatorCurrent, 'slds-tabs--path__item slds-is-complete');
        var toggleIndicatorCurrent = component.find("thirdColour");
        $A.util.removeClass(toggleIndicatorCurrent, 'thirdColour');


        // --------------------------------------------jenish gangani


        var nextStep = selectedStep == 'Step3' ? 'Step2' : 'finished';

        if (nextStep == 'finished') {
            component.set("v.finished", nextStep);
        } else {
            component.set("v.currentStep", nextStep);
        }

    },

    addRow: function (component, event, helper) {
        helper.addRowRecord(component, event, helper);
    },

    addMapRow: function (component, event, helper) {
        helper.addRowMapRecord(component, event, helper);
    },

    deleteRow: function (component, event, helper) {
        helper.deleteRowRecord(component, event, helper);
    },

    deleteMapRow: function (component, event, helper) {
        helper.deleteMapRowRecord(component, event, helper);
    },
    // second next button
    callNextButton: function (component, event, helper) {

        console.log('next Button called');
        var validateSelect;
        console.log('value of second Button for the:::::' + component.find("selectDropValues"));
        if (component.find("selectDropValues") != undefined) {
            validateSelect = component.find("selectDropValues").reduce(function (validSoFar, inputCmp) {
                console.log('validSsofar -- > ', validSoFar);
                console.log('inputCmp -- > ', { inputCmp });

                inputCmp.showHelpMessageIfInvalid();
                return validSoFar && inputCmp.get('v.validity').valid;
            }, true);
        }
        console.log('validateSelect::::' + validateSelect);

        var tablePushDataList = component.get('v.tableListData');
        // ----------------------------------------jenish gangani 9/2
        console.log('tablePushDataList:::' + JSON.stringify(tablePushDataList));
        console.log('tablePushDataList length:::' + (tablePushDataList.length));
        var sfPushData = component.get('v.FieldToUpdateList');
        console.log('sfPushData:::' + JSON.stringify(sfPushData));
        console.log('sfPushData length:::' + (sfPushData.length));
        // ----------------------------------------jenish gangani 9/2

        // ------------------------------jenish gangani 7/2  to change the progressbar movement
        var toggleIndicatorCurrent = component.find("step2Indicator");
        $A.util.removeClass(toggleIndicatorCurrent, 'slds-tabs--path__item slds-is-current');
        $A.util.addClass(toggleIndicatorCurrent, 'slds-tabs--path__item slds-is-complete');
        var thirdColour = component.find("thirdColour");
        $A.util.addClass(thirdColour, 'thirdColour');

        var toggleIndicatorNext = component.find("step3Indicator");
        $A.util.removeClass(toggleIndicatorNext, 'slds-tabs--path__item slds-is-incomplete');
        $A.util.addClass(toggleIndicatorNext, 'slds-tabs--path__item slds-is-current');
        // ------------------------------jenish gangani 7/2


        if (tablePushDataList.length < 1 && sfPushData.length < 1) {
            helper.showToast(component, "Info", "Info!", "Please Select Atleast One Condition and One Mapping Field");
        } else if (tablePushDataList.length < 1) {
            helper.showToast(component, "Info", "Info!", "Please Select Atleast One Condition");
        } else if (sfPushData.length < 1) {
            helper.showToast(component, "Info", "Info!", "Please Select Atleast One Mapping Field");
        } else if (!validateSelect) {
            helper.showToast(component, "Error", "Error!", "Please Select All Fields");
        } else if (validateSelect) {
            var selectedStep = event.getSource().get("v.value");
            console.log('selecteStep::::' + selectedStep);

            var nextStep = selectedStep == 'Step2' ? 'Step3' : 'finished';
            // ------------ jenish gangani  get the opration value 
            var operation = component.get('v.operation');
            console.log('operation value::::' + operation);
            // ------------ jenish gangani  get the opration value 

            if (nextStep == 'finished') {
                component.set("v.finished", nextStep);
            }
            // ---------------- jenish gangani 9/2
            else if (operation == 'insert') {
                helper.insertRecord(component, event, helper);
                component.set("v.currentStep", nextStep);
            }
            // ---------------- jenish gangani 9/2

            else {
                helper.nextWriteQuery(component, event, helper);
                component.set("v.currentStep", nextStep);
            }
        }
    },

    saveRecordsToSF: function (component, event, helper) {
        var selectedStep = event.getSource().get("v.value");
        var nextStep = selectedStep == 'Step3' ? 'finished' : 'finished';

        if (nextStep == 'finished') {
            helper.saveRecordData(component, event, helper);
            component.set("v.currentStep", nextStep);
            component.set("v.finished", true);
        }
    },

    // jenish gangani 11/02
    saveRecordsToSFForInsert: function (component, event, helper) {
        var selectedStep = event.getSource().get("v.value");
        var nextStep = selectedStep == 'Step3' ? 'finished' : 'finished';

        if (nextStep == 'finished') {
            helper.saveRecordsToSFForInsert(component, event, helper);
            component.set("v.currentStep", nextStep);
            component.set("v.finished", true);
        }
    },
    // jenish gangani 11/02

    nextPageRecord: function (component, event, helper) {
        var pageNumber = component.get('v.pageNumber');
        component.set('v.pageNumber', pageNumber + 1);
        helper.pageRecord(component, event, helper);
    },

    prevPageRecord: function (component, event, helper) {
        var pageNumber = component.get('v.pageNumber');
        component.set('v.pageNumber', pageNumber - 1);
        helper.pageRecord(component, event, helper);
    },

    showSelectObjectHelp: function (component, event, helper) {
        if (component.get('v.selectObjectHelp')) {
            component.set('v.selectObjectHelp', false);
        } else {
            component.set('v.selectObjectHelp', true);
        }

    },

    showSelectFieldHelp: function (component, event, helper) {
        component.set('v.SelectFieldHelp', true);
    },

    //* jenish gangani 7/2/23


    handleNextButton: function (component, event, helper) {
        console.log('nextButton==>' + event.getParam('value'));
        component.set("v.stepOneNextButton", event.getParam('value'));
    },
    handleHeader: function (component, event, helper) {
        component.set("v.header", event.getParam('value'));
    },
    handleTableData: function (component, event, helper) {
        component.set("v.tabledata", event.getParam('value'));
    },
    handlefileValue: function (component, event, helper) {
        component.set("v.fileName", event.getParam('value'));
    },

    handleButtonClick: function (component, event, helper) {
        $A.createComponent(
            "c:quickBot",
            {},
            function (lwcComponent, status, errorMessage) {
                if (status === "SUCCESS") {
                    var lwcContainer = component.find("lwcContainer");
                    lwcContainer.set("v.body", [lwcComponent]);
                } else if (status === "INCOMPLETE") {
                    console.log("No response from server or client is offline.");
                } else if (status === "ERROR") {
                    console.log("Error: " + errorMessage);
                }
            }
        );
    }

})