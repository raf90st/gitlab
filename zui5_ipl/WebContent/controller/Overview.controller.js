sap.ui.define([
	"juliusbaer/ipl/controller/BaseController",
	"sap/ui/core/mvc/Controller",
	"juliusbaer/ipl/model/formatter",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function(BaseController, Controller, formatter, History, UIComponent, JSONModel, Filter, FilterOperator, MessageToast, MessageBox) {
	"use strict";

	return BaseController.extend("juliusbaer.ipl.controller.Overview", {

		formatter: formatter,
		
		onInit: function () {
			this.getRouter().getRoute("overview").attachMatched(this._onProfitCenterRouteMatched, this);
		},
	
		_onProfitCenterRouteMatched: function(oEvent) {

		},
		
		onTileSelected: function(oEvent) {
			var sItem = oEvent.getSource().getContent()[0].getItems()[0].getItems()[0].getItems()[2].getProperty("text");
			
			switch(sItem) {
				case "Unmapped Org Units":
					this.getRouter().navTo("ipl");
					break;
				case "Hiearchy Comparison":
					this.getRouter().navTo("missItems")
					break;
				case "Item Categorization":
					this.getRouter().navTo("itemCat");
					break;
				case "Unmapped Delta Plugs":
					this.getRouter().navTo("profitcenter");
					break;
			}
		}
	});
});