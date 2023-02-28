({
    showcsvdata: function (component, event, helper) {
        component.set("v.progress", 0);
        var fileInput = component.find("file").get("v.files");
        console.log("fileInput =======" + JSON.stringify(fileInput));
        console.log("file Input length=====" + fileInput.length);
        var fileName = "No File Selected..";
        var file = fileInput[0];
        console.log("file=====" + JSON.stringify(file));
        console.log("length===" + event.getSource().get("v.files").length);
        if (event.getSource().get("v.files").length > 0) {
            var fName = event.getSource().get("v.files")[0]["name"];
        }


        if (fName.indexOf(".csv") !== -1) {
            console.log("fileName=====" + fileName);

            component.set("v.fileName", fileName);
            console.log("filename====" + component.get("v.fileName"));

            if (file) {
                component.set("v.showcard", true);
                var tabledata = [];
                var reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.onload = function (evt) {
                    var csv = evt.target.result;
                    console.log('typeof csvf::' + typeof (csv));
                    console.log("csv:::" + csv);
                    console.log('csv length===', csv.length);
                    if (csv.length > 4000000) {
                        helper.showToast(
                            "Info",
                            "Info!",
                            "Please upload smaller size of csv file"
                        );
                    } else {
                        var rows = csv.split("\n");
                        var trimrow = rows[0].split(",");
                        console.log("trimRow=====" + trimrow);
                        // ------------------------------------------- jenish gangani
                        // component.set("v.header", trimrow);
                        // ------------------------------------------- jenish gangani

                        //jenish gangani 3/2/23

                        console.log('trimrow' + trimrow.length);
                        trimrow[trimrow.length - 1] = trimrow[trimrow.length - 1].replace(/(\r\n|\n|\r)/gm, "");
                        console.log('trimrow value:::', { trimrow });

                        let newArray = trimrow.map(str => str.replace('"', ''));
                        let newArray1 = newArray.map(str => str.replace('"', ''));
                        let newArray2 = newArray1.map(str => str.replace(/\s/g, ''));

                        console.log('newArray' + newArray2);
                        // console.log('string::::'+ array);
                        trimrow = newArray2;
                        console.log('new open :::' + trimrow);
                        console.log('type of ' + typeof (trimrow));
                        component.set("v.header", trimrow);

                        // --------------------------------------------------jenish gangani5/2/23

                        if (trimrow.indexOf("") !== -1) {
                            helper.showToast(
                                "Info",
                                "Info!",
                                "Please remove your extra collum"
                            );
                            var compEvent1 = component.getEvent("disableNextButton");
                            console.log('component:::' + JSON.stringify(compEvent1));
                            compEvent1.setParams({ "checkButton": true });
                            compEvent1.fire();
                        } else if (trimrow.indexOf("") == (trimrow.length - 1)) {
                            helper.showToast(
                                "Info",
                                "Info!",
                                "Please remove your duplicat [] collum"
                            );
                            var compEvent1 = component.getEvent("disableNextButton");
                            compEvent1.setParams({ "checkButton": true });
                            compEvent1.fire();

                        }
                        else if (checkIfDuplicateExists(trimrow)) {
                            var compEvent = component.getEvent("disableNextButton");
                            compEvent.setParams({ "checkButton": true });
                            compEvent.fire();
                            helper.showToast("Info", "Info!", "Please remove same api Name in Header");
                        } else {
                            var compEvent1 = component.getEvent("disableNextButton");
                            compEvent1.setParams({ "checkButton": false });
                            compEvent1.fire();

                        }

                        function checkIfDuplicateExists(arr) {
                            return new Set(arr).size != arr.length;
                        }
                        //jenish gangani 3/2/23


                        for (var i = 1; i < rows.length; i++) {

                            //jenish gangani 2/2/2023
                            console.log('rows[i].trim() ==> ', rows[i].trim());
                            if (rows[i].trim() !== ",") {
                                tabledata.push(rows[i]);
                            }
                            //jenish gangani 2/2/2023
                        }

                        for (var j = 0; j <= 100; j++) {
                            task(j);
                        }
                        function task(j) {
                            setTimeout(function () {
                                component.set("v.progress", j);
                            }, 2 * j);
                        }
                        component.set("v.tabledata", tabledata);
                        console.log("tableData====" + tabledata.length);
                        console.log("tableData::::" + tabledata);
                        console.log("tableData type of ::::" + typeof (tabledata));

                        var fileName = fName;
                        component.set("v.fileName", fileName);
                        console.log("file Name After===" + fileName);
                    }
                };
            }
        } else {
            helper.showToast("Info", "Info!", "Please upload only CSV file");
        }
    },





});

// ({
//     showcsvdata :  function (component, event, helper){
//         component.set('v.progress', 0);
//         var fileInput = event.getParam("files");

//         console.log('length of file======'+fileInput.length);
//         console.log('fileInput ======='+JSON.stringify(fileInput));

//         var fileName = 'No File Selected..';
//         var file = fileInput[0];
//         console.log('file input[0]==='+file['name']);

//         // console.log('file====='+JSON.stringify(file));
//         if (fileInput.length > 0) {
//             var fName = fileInput[0]['name'];
//         }

//         console.log('fname===='+fName);
//         console.log('fName.indexOf(".csv")===='+fName.indexOf(".csv"));

//         if(fName.indexOf(".csv") !== -1){
//             component.set("v.fileName", fileName);

//         	if (file) {
//                 component.set("v.showcard", true);
//                 var tabledata=[];
//                 var reader = new FileReader();
//                 reader.readAsText(file, "UTF-8");
//                 reader.onload = function (evt) {
//                     var csv = evt.target.result;
//                     console.log('csv.length====='+csv.length);
//                     if(csv.length > 4000000){
//                         helper.showToast("Info", "Info!", "Please upload smaller size of csv file");
//                     }else{
//                         var rows = csv.split("\n");
//                         var trimrow = rows[0].split(",");
//                         component.set("v.header",trimrow);
//                         for (var i = 1; i < rows.length; i++) {
//                             tabledata.push(rows[i]);
//                         }
//                         for(var j=0;j<=100;j++){
//                             task(j);
//                         }
//                         function task(j) {
//                           setTimeout(function() {
//                         	component.set('v.progress',j);
//                           }, 2*j);
//                         }
//                         component.set("v.tabledata",tabledata);
//                         var fileName = fName;
//                         component.set("v.fileName",fileName);
//                         console.log('file Name After==='+fileName);
//                     }

//                 }
//             }
//         }else{
//             helper.showToast("Info", "Info!", "Please upload only CSV file");
//         }
//     },
// })