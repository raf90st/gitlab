sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v4/ODataListBinding"

], function(Controller, JSONModel, ODataListBinding) {
    "use strict";

    return Controller.extend("adminFileUploader.controller.Admin", {
        onInit: function() {},

        handleUploadPress: function() {
            var fileUploader = this.getView().byId("fileUploader");
            //var domRef = fileUploader.getFocusDomRef();
            var file = fileUploader.oFileUpload.files[0];

            // Create a File Reader object
            var reader = new FileReader();

            reader.onload = function(e) {
                var data = [];
                var strCSV = e.target.result;

                var aDataRows = strCSV.split("\n");
                var aHeaderRow = aDataRows[0].split(";");

                //remove header row before filling object array
                aDataRows = aDataRows.splice(1);

                if (aHeaderRow.length > 0) {

                    for (var i = 0; i < aDataRows.length; i++) {
                        var aData = aDataRows[i].split(";");
                        var obj = {};

                        for (var n = 0; n < aData.length; n++) {
                            obj[aHeaderRow[n]] = aData[n].trim()
                        }

                        data.push(obj);
                    }
                }

                console.log(">>> File Upload:");
                console.log(data);
            };
            reader.readAsBinaryString(file);
        }
    });
});