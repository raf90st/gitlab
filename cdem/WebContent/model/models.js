sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		
		createGlobalModel: function() {
			var oModel = new JSONModel({
				currentUser: "",
				domicileTableBusy: false,
				cdExceptionSelected: false,
				errorHandlerAttached: false,
				comDomicile: "Not calculated",
				exceptionCountry: "Not defined",
				businessRule: "Not calculated"
			});
			
			return oModel;
		}

	};
});