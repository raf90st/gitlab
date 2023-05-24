sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v4/ODataListBinding",
    "sap/m/MessageToast"

], function(Controller, JSONModel, ODataListBinding, MessageToast) {
    "use strict";

    return Controller.extend("admin.controller.Admin", {
        onInit: function() {
            this.getView().setModel(new JSONModel({
                dataLoad: false
            }), "chargingInfo");
        },

        handleUploadPress: function() {
            var fileUploader = this.getView().byId("fileUploader");
            var that = this;
            var file = fileUploader.oFileUpload.files[0];

            // Create a File Reader object
            var reader = new FileReader();

            reader.onload = function(e) {
                var data = [];
                var strCSV = e.target.result;

                var aDataRows = strCSV.split("\n");
                var aHeaderRow = aDataRows[1].split(";");

                //remove header rows before filling object array
                aDataRows = aDataRows.splice(2);

                if (aHeaderRow.length > 0) {

                    for (var i = 0; i < aDataRows.length; i++) {
                        var aData = aDataRows[i].split(";");
                        var obj = {};

                        for (var n = 0; n < aData.length; n++) {
                            if (aHeaderRow[n] !== '') {
                                obj[aHeaderRow[n].trim()] = aData[n].trim();
                            }
                        }

                        data.push(obj);
                    }
                }

                that.upsertData(data);

                console.log(">>> File Upload:");
                console.log(data);
            };
            reader.readAsBinaryString(file);
        },

        upsertData: function(data) {
            var oBinding = this.getView().getModel().bindContext("/updateChargeInfo(...)");
            oBinding.setParameter("aCsvData", data);
            this.getView().getModel("chargingInfo").setProperty("/dataLoad", true);

            oBinding.execute().then(() => {
                var oBinding = this.byId("logsTable").getBinding("items");

                if (oBinding) {
                    oBinding.refresh();
                }

                this.getView().getModel("chargingInfo").setProperty("/dataLoad", false);

            }).catch((err) => {
                console.log("Error executing Data Load");
            });
        }
    });
});