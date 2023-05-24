sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"juliusbaer/rmct/controller/BaseController",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"juliusbaer/rmct/model/formatter",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"sap/ui/core/library",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/ComboBox",
	"sap/ui/core/Item",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/SearchField",
	"sap/m/P13nColumnsItem",
	"sap/m/P13nItem"
], function (Controller, BaseController, MessageToast, JSONModel, formatter, MessageBox, Fragment, CoreLibrary, Input, Label, Dialog, Button, ComboBox, Item, Filter, FilterOperator, SearchField, P13nColumnsItem, P13nItem) {
	"use strict";
	return BaseController.extend("juliusbaer.rmct.controller.settings.SimTool", {
		formatter: formatter,

		onInit: function () {
			this.getRouter().getRoute("simTool").attachMatched(this._onRouteMatched, this);
		},
		
		_onRouteMatched: function(oEvent) {
			var fiscalPeriod = this.getModel("global").getProperty("/simToolPeriod");
			
			if (fiscalPeriod === "") {
				this.setActualFiscalPeriod("/simToolPeriod");
				fiscalPeriod = this.getModel("global").getProperty("/simToolPeriod");
			}
			
			this.loadSimToolEntries(fiscalPeriod);
			this.checkSimCalcButtonStatus();
		},

		onFiscalPeriodChange: function(oEvent) {
			var fiscalPeriod = oEvent.getSource().getSelectedKey();
			this.loadSimToolEntries(fiscalPeriod);
			this.checkSimCalcButtonStatus();
		},
		
		loadSimToolEntries: function(sPeriod) {
			this.getModel("global").setProperty("/simToolBusy", true);
			var sPath = "Fiscper='" + sPeriod + "'";
			this.getView().bindElement(
					{						
						path : "/LoadingPeriodSimSet(" + sPath + ")",
						parameters : {						
							expand: "RMSimSet"
						},
						events : {
							dataReceived: (oEvent) => {
								this.getModel("global").setProperty("/simToolBusy", false);
							}
						}
				});		
		},
			
		checkSimCalcButtonStatus: function () {
			this.getView().getModel().read("/CalculationStatusSimSet", {
				success: (data) => {
					this.getModel("global").setProperty("/calcSimButtonStatus", data.results[0]);
				}
			})
		},
		
		onSimEntriesRefresh: function() {
			this.checkSimCalcButtonStatus();
			var fiscalPeriod = this.getModel("global").getProperty("/simToolPeriod");
			this.loadSimToolEntries(fiscalPeriod);
		},
			
		onPressSimToolCalculate: function(oEvent) {
			this.getModel("global").setProperty("/simToolBusy", true);
			var sUserAction = "Calculate"
			var sFiscalPeriod = this.getModel("global").getProperty("/simToolPeriod");
			
			this.getModel().callFunction('/IsReadyToCalculateSim',{
				method: 'GET',
				urlParameters: {
					Fiscper: sFiscalPeriod,
				},
				success: (data) => {
					if (data.Ready) {
						var oTable = this.byId("manageSimToolTable");
						var selectedIndices = oTable.getSelectedIndices();
						var aSelectedValues = [];
						
						selectedIndices.forEach((rowNumber) => {
							var oValue = oTable.getContextByIndex(rowNumber).getObject();
							aSelectedValues.push(oValue);
						});
						
						var oRequestDataSet = {
								"Action": sUserAction,
								"Fiscper": sFiscalPeriod,
								"Text": "",
								"RMSimSet" : aSelectedValues
						};
						
						this.getModel().create("/LoadingPeriodSimSet", oRequestDataSet, {
							success: (data) => {
								this.checkSimCalcButtonStatus();
								this.onSimEntriesRefresh();
								this.getModel("global").setProperty("/simToolBusy", false);
							},
							error: (oError) =>{
								console.log(oError);
							}
						});
					} else {
						this.checkSimCalcButtonStatus();
					}
				},
				error: (oError) =>
				{
					console.log(oError);
					this.checkSimCalcButtonStatus();
				}			
				})
		}
	});
});