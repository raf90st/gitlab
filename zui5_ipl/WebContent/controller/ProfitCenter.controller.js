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

	return BaseController.extend("juliusbaer.ipl.controller.ProfitCenter", {

		formatter: formatter,
		
		onInit: function () {
			this.getRouter().getRoute("profitcenter").attachMatched(this._onProfitCenterRouteMatched, this);
		},
	
		_onProfitCenterRouteMatched: function() {
			//this.setNavToCurrentHash();
		}
		
	});
});