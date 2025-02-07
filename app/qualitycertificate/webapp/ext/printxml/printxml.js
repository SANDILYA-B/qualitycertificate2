sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/ui/core/HTML"
], function(MessageToast, JSONModel, Dialog, Button, HTML) {
    'use strict';

    return {
        printXml: function(oBindingContext, aSelectedContexts) {
            if (!aSelectedContexts || aSelectedContexts.length === 0) {
                MessageToast.show("No selection made.");
                return;
            }

            let mParameters = {
                contexts: aSelectedContexts, // Pass the whole array, not a single element
                label: 'Confirm',
                invocationGrouping: true    
            };

            this.editFlow.invokeAction('qualitycertificate.printForm', mParameters)
                .then(function(result) {
                    let response = result.getObject();
                    if (!response || !response.value) {
                        MessageToast.show("Error: No XML data received.");
                        return;
                    }

                    let xmlData = response.value;
                    console.log(xmlData);

                    // Escape XML to display properly in HTML
                    let escapedXml = encodeURIComponent(xmlData)
                        .replace(/%3C/g, "&lt;")
                        .replace(/%3E/g, "&gt;");

                    // Create an HTML element to display XML
                    const oHtml = new HTML({
                        content: `<pre style="white-space: pre-wrap; word-wrap: break-word;">${escapedXml}</pre>`
                    });

                    let oDialog = new Dialog({
                        title: 'Generated XML',
                        contentWidth: "600px",
                        contentHeight: "500px",
                        verticalScrolling: true,
                        content: oHtml,
                        buttons: [
                            new Button({
                                text: 'Download XML',
                                press: function () {
                                    const blob = new Blob([xmlData], { type: 'application/xml' });
                                    const xmlUrl = URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = xmlUrl;
                                    link.download = 'quality_certificate.xml';
                                    document.body.appendChild(link); // Append to avoid Firefox issues
                                    link.click();
                                    document.body.removeChild(link); // Cleanup
                                    URL.revokeObjectURL(xmlUrl); // Release memory
                                }
                            }),
                            new Button({
                                text: 'Close',
                                press: function () {
                                    oDialog.close();
                                }
                            })
                        ],
                        afterClose: function() {
                            oDialog.destroy();
                        }
                    });

                    oDialog.open();
                })
                .catch(function(error) {
                    console.error("Error invoking action:", error);
                    MessageToast.show("Failed to generate XML.");
                });
        }
    };
});