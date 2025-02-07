sap.ui.define([
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Text",
    "sap/m/TextArea",
    "sap/m/Button"
], function (MessageToast, Dialog, Text, TextArea, Button) {
    'use strict';

    return {
        printXml: function (oBindingContext, aSelectedContexts) {
            MessageToast.show("Custom handler invoked.");
            console.log(aSelectedContexts);

            if (!aSelectedContexts || aSelectedContexts.length === 0) {
                MessageToast.show("No items selected.");
                return;
            }

            let mParameters = {
                contexts: aSelectedContexts[0],
                label: 'Confirm',
                invocationGrouping: true    
            };

            var oStatusText = new Text({ text: "Fetching XML Data..." });
            var oXMLDataTextArea = new TextArea({
                width: "100%",
                rows: 20,
                editable: false,
                value: ""
            });

            var oDialog = new Dialog({
                title: "Inspection Lot XML Data",
                content: [oStatusText, oXMLDataTextArea],
                beginButton: new Button({
                    text: "Close",
                    press: function () {
                        oDialog.close();
                    }
                })
            });

            oDialog.open();

            this.editFlow.invokeAction('qualitycertificate.printForm', mParameters)
                .then(function (result) {
                    const xmlData = result.getObject().value; 
                    oXMLDataTextArea.setValue(xmlData);
                    oStatusText.setText("XML Data fetched successfully.");
                })
                .catch(function (error) {
                    console.error("Error fetching XML data:", error);
                    oStatusText.setText("Error fetching XML data.");
                    MessageToast.show("Failed to fetch XML data.");
                });
        }
    };
});
