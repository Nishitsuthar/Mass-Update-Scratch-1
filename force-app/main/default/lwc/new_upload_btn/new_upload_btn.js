import { LightningElement, api, track, wire } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import PARSER from '@salesforce/resourceUrl/PapaParse';
import sheetjs from '@salesforce/resourceUrl/sheetjsNew';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getVFOrigin from '@salesforce/apex/URL_Controller.getVFOrigin';
// import PageReference from '@salesforce/schema/PageReference';




export default class new_upload_btn extends LightningElement {
    @api myRecordId;
    parserInitialized = false;
    @api progress;
    @api fileName;

    get acceptedFormats() {
        return ['.csv', '.xls', '.xlsx'];
    }

    connectedCallback() {
        console.log('connected call back');
        getVFOrigin()
            .then(result => {
                const updatedUrl = result.replace(".my.salesforce.com", ".vf.force.com");
                const matchIndex = updatedUrl.indexOf("-ed");
                var VfOrigin = updatedUrl.substring(0, matchIndex + 3) + "--c" + updatedUrl.substring(matchIndex + 3);

                window.addEventListener("message", (message) => {
                    if (message.origin !== VfOrigin) {
                        //Not the expected origin
                        return;
                    }
                    //handle the message
                    if (message.data.name === "new_upload_btn") {
                        console.log('event');
                        let fileName = message.data.finame;
                        this.fileName = message.data.finame;
                        this.sendFileName(this.fileName);
                        let extension = fileName.split('.').pop();

                        if (extension == 'csv') {
                            console.log('csv');
                            var data1 = Papa.parse(message.data.payload, {
                                header: true
                            });
                            this.progressBar();
                            var headerValue = data1.meta.fields;
                            var rowData = data1.data;
                            this.headerCheck(headerValue);
                            this.dataStoreTable(rowData);
                        } else {
                            console.log('xlsx');
                            this.progressBar();
                            var rowData = this.parseExcelFile(message.data.payload);
                        }
                    }
                });

                // return result;
            })
            .catch(error => {
                console.error(error);
            });

    }

    renderedCallback() {
        try {
            if (!this.parserInitialized) {
                console.log('2nd steps in IF', this.parserInitialized);
                Promise.all([
                    loadScript(this, PARSER + '/PapaParse/papaparse.js'),
                    loadScript(this, sheetjs + '/sheetjs/xlsx.full.min.js'),
                ])
                    .then(() => {
                        console.log('script loaded', XLSX.version);
                        this.parserInitialized = true;
                    })
                    .catch(error => {
                        console.log('in catch ', error);
                        console.error(error)
                    });
            }
        } catch (error) {
            console.log('error mesg--> ' + error);
        }
    }

    handleUploadFinished(event) {
        // Get the list of uploaded files
        try {
            if (event.detail.files.length > 0) {
                const file = event.detail.files[0];
                // console.log('filesss' + JSON.stringify(file));
                this.fileName = file.name;
                this.progress = 0;
                let disableNext = false;

                if (file.size > 400000) {
                    disableNext = true;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'File is too Large',
                            message: 'Please upload smaller file',
                            variant: 'Info',
                        }),
                    );
                } else {
                    //*    for progress bar start
                    this.progressBar();
                    //*    for progress bar end

                    let extension = this.fileName.split('.').pop();

                    if (extension === 'csv') {
                        this.CsvToJSON(file);
                    } else if (extension === 'xls' || extension === 'xlsx') {
                        this.ExcelToJSON(file);
                    } else {
                        const toastEvent = new ShowToastEvent({
                            title: 'Unsupported file type',
                            message: 'Please upload a CSV, XLS, or XLSX file',
                            variant: 'info'
                        });
                        this.dispatchEvent(toastEvent);
                        return;
                    }
                }
                this.passEvent(disableNext);

            }
        } catch (error) {
            const toastEvent = new ShowToastEvent({
                title: 'Error',
                message: error.message,
                variant: 'error'
            });
            this.dispatchEvent(toastEvent);
        }

        this.sendFileName(this.fileName);
    }

    ExcelToJSON(file) {
        try {
            console.log(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                const data = event.target.result;
                console.log('data of xlsx==>' + data);
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                let rowObject = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName], { defval: "" });
                console.log('data of rowobject==>' + JSON.stringify(rowObject));
                var data1 = Papa.parse(rowObject, {
                    header: true,
                    skipEmptyLines: 'greedy'
                });
                console.log('data1 ' + JSON.stringify(data1));
                // var headerValue = Object.keys(rowObject[0]);
                var headerValue = data1.meta.fields;
                const rowData = data1.data;
                console.log('rowData' + JSON.stringify(rowData));
                this.headerCheck(headerValue);
                this.dataStoreTable(rowData);
            };

            reader.onerror = function (ex) {
                this.error = ex;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error while reding the file',
                        message: ex.message,
                        variant: 'error',
                    }),
                );
            };
            reader.readAsBinaryString(file);
        } catch (error) {
            console.log('error except ', error);
        }
    }

    CsvToJSON(file) {
        this.loading = true;
        Papa.parse(file, {
            quoteChar: '"',
            header: 'true',
            skipEmptyLines: 'greedy', // Add this line to skip empty lines
            complete: (results) => {
                this._rows = results.data;
                console.log('results ', JSON.parse(JSON.stringify(results)));
                this.loading = false;
                let rowObj = results.data;
                console.log('rowobjec==>' + JSON.parse(JSON.stringify(rowObj)));
                let headerName = results.meta.fields;
                this.headerCheck(headerName);
                this.dataStoreTable(rowObj);
            },
            error: (error) => {
                console.log('result --: ', { error });
                console.error(error);
                this.loading = false;
            }
        })
    }

    headerCheck(headerName) {
        var trimrow = headerName;
        console.log("trimRow=====" + trimrow);
        console.log('trimrow' + trimrow.length);
        trimrow[trimrow.length - 1] = trimrow[trimrow.length - 1].replace(/(\r\n|\n|\r)/gm, "");
        console.log('trimrow value:::', { trimrow });

        let newArray = trimrow.map(str => str.replace('"', ''));
        let newArray1 = newArray.map(str => str.replace('"', ''));
        let newArray2 = newArray1.map(str => str.replace(/\s/g, ''));

        console.log('newArray' + newArray2);
        trimrow = newArray2;
        console.log('new open :::' + trimrow);

        if (trimrow.indexOf("") !== -1) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Info',
                    message: 'Please remove your extra collum',
                    variant: 'Info',
                }),
            );
            this.passEvent('true');
        } else if (trimrow.indexOf("") == (trimrow.length - 1)) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Info',
                    message: 'Please remove your duplicat [] collum',
                    variant: 'Info',
                }),
            );
            this.passEvent('true');

        }
        else if (checkIfDuplicateExists(trimrow)) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Info',
                    message: 'Please remove same api Name in Header',
                    variant: 'Info',
                }),
            );
            this.passEvent('true');

        } else {
            this.passEvent('false');
        }

        function checkIfDuplicateExists(arr) {
            return new Set(arr).size != arr.length;
        }
        let value = trimrow;
        const event = new CustomEvent('header', { detail: { value } });
        this.dispatchEvent(event);

    }
    dataStoreTable(rowObj) {
        var arr2 = [];
        for (let i = 0; i < rowObj.length; i++) {
            arr2.push(Object.values(rowObj[i]));
        }
        console.log('arr2 Name ' + arr2);
        const newArray = arr2.map(subarray => subarray.join(','));
        let value = newArray;
        const event = new CustomEvent('tabledata', { detail: { value } });
        this.dispatchEvent(event);

    }

    parseExcelFile(filedata) {
        console.log('1st line', filedata);
        try {
            const reader = new FileReader();
            reader.readAsArrayBuffer(filedata);
            reader.onload = function () {
                const binaryData = reader.result;
                const workbook = XLSX.read(binaryData, { type: 'binary' });
                const csvDataString = XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]);
                console.log('data converted to csv ' + csvDataString);
                this.headerCheck(headerValue);
                this.dataStoreTable(rowData);
            };
        } catch (error) {
            console.log('error ' + error);
        }
    }
    progressBar() {
        let progress = 0;
        const animate = () => {
            progress += 5;
            if (progress <= 100) {
                this.progress = progress;
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
        debugger;

    }
    passEvent(valueofEvent) {
        let value = valueofEvent;
        const event = new CustomEvent('passvalue', { detail: { value } });
        this.dispatchEvent(event);

    }
    sendFileName(filName) {
        let value = filName;
        const event1 = new CustomEvent('filevalue', { detail: { value } });
        this.dispatchEvent(event1);
    }

}