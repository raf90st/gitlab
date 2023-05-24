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
				parentNodeForTopOrg: {},
				buttonShowUnmapped: "Show only unmapped",
				onlyUnmapped: false,
				treeTableBusy: false,
				columnFilterProperty: "",
				columnFilterOption: "showAll",
				filteredTableId: "",
				releasePeriod: "",
				releasePeriodTxt: "",
				confirmButtonEnabled: false,
				confirmButtonTxt: "",
				confirmedBy: "",
				confirmedOn: "",
				selectedCategory: "",
				confirmItemCatButtonEnabled: false,
				confirmItemCatButtonTxt: "",
				confirmedItemCatBy: "",
				confirmedItemCatOn: "",
				selectedItemForCatChange: ""
			})
			return oModel;
		},
		
		createTileModel: function () {
			var oModel = new JSONModel({});
			return oModel;
		}
	};
});