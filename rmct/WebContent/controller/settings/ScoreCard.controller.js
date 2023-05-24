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
	return BaseController.extend("juliusbaer.rmct.controller.settings.ScoreCard", {
		formatter: formatter,

		onInit: function () {
			this.getRouter().getRoute("calcscorecard").attachMatched(this._onRouteMatched, this);
		},
		
		_onRouteMatched: function(oEvent) {
			var fiscalPeriod = this.getModel("global").getProperty("/scoreCardPeriod");
			
			if (fiscalPeriod === "") {
				this.setActualFiscalPeriod("/scoreCardPeriod");
				fiscalPeriod = this.getModel("global").getProperty("/scoreCardPeriod");
			}
				
			this.loadScoreCards(fiscalPeriod);
			this.checkCalcButtonStatus();
		},

		onFiscalPeriodChange: function(oEvent) {
			var fiscalPeriod = oEvent.getSource().getSelectedKey();
			this.getModel("global").setProperty("/scoreCardPeriod", fiscalPeriod);
			this.loadScoreCards(fiscalPeriod);
			this.checkCalcButtonStatus();
		},
		
		loadScoreCards: function(sPeriod) {
			this.getModel("global").setProperty("/calculationBusy", true);
			var sPath = "Fiscper='" + sPeriod + "'";
			this.getView().bindElement(
					{						
						path : "/LoadingPeriodSet(" + sPath + ")",
						parameters : {						
							expand: "RMSet"
						},
						events : {
							dataReceived: (oEvent) => {
								this.getModel("global").setProperty("/calculationBusy", false);
							}
						}
				});		
		},
		
		checkCalcButtonStatus: function () {
			this.getView().getModel().read("/CalculationStatusSet", {
				success: (data) => {
					this.getModel("global").setProperty("/calcButtonStatus", data.results[0]);
				}
			})
		},
		
		onScoreCardsRefresh: function() {
			this.checkCalcButtonStatus();
			var fiscalPeriod = this.getModel("global").getProperty("/scoreCardPeriod");
			this.loadScoreCards(fiscalPeriod);
		},
		
		onPressScorecardAction: function(oEvent, userAction) {
			var fiscalPeriod = this.getModel("global").getProperty("/scoreCardPeriod");
			
			switch (userAction) {
				case "calculate":
					this.calculateScoreCard(fiscalPeriod, "Calculate");
					break;
				case "distribute":
					this.distributeCloseScoreCard(fiscalPeriod, "Distribute");
					break;
				case "close":
					this.distributeCloseScoreCard(fiscalPeriod, "Close");
					break;
				default:
					break;
			}
		},
		
		distributeCloseScoreCard: function(sFiscalPeriod, sUserAction) {
			this.getModel("global").setProperty("/calculationBusy", true);
			var oTable = this.byId("manageScorecardsTable");
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
					"RMSet" : aSelectedValues
			};
			
			this.getModel().create("/LoadingPeriodSet", oRequestDataSet, {
				success: (data) => {
					this.getModel("global").setProperty("/calculationBusy", false);
					this.onScoreCardsRefresh();
					if(data.Action == 'Close'){
						this.showMessage("Closing successfully completed!");
					} else {
						this.showMessage("Distribution successfully completed!");
					}
					
				},
				error: (oError) =>{
					console.log(oError);
					this.handleErrorMessageBoxPress(oEvent, "Distribution could not be completed");
				}
			});
		},
		
		calculateScoreCard: function(sFiscalPeriod, sUserAction) {
			this.getModel("global").setProperty("/calculationBusy", true);
			this.getModel().callFunction('/IsReadyToCalculate',{
				method: 'GET',
				urlParameters: {
					Fiscper: sFiscalPeriod,
				},
				success: (data) => {
					if (data.Ready) {
						var oTable = this.byId("manageScorecardsTable");
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
								"RMSet" : aSelectedValues
						};
						
						this.getModel().create("/LoadingPeriodSet", oRequestDataSet, {
							success: (data) => {
								this.checkCalcButtonStatus();
								this.onScoreCardsRefresh();
								this.getModel("global").setProperty("/calculationBusy", false);
							},
							error: (oError) =>{
								console.log(oError);
							}
						});
					} else {
						this.checkCalcButtonStatus();
					}
				},
				error: (oError) =>
				{
					console.log(oError);
					this.checkCalcButtonStatus();
				}			
				})
		},
		
		onResetProcess: function(oEvent) {
			this.getModel().callFunction('/ResetCalculation',{
				method: 'GET',
				urlParameters: {
				},
				success: (data) => {
					this.checkCalcButtonStatus();
				},
				error: (oError) =>
				{
					console.log(oError);
					
				}		
			})
		},
		
		navToWorkflowApplication: function(oEvent) {
			var scoreCardId = oEvent.getSource().getProperty("text");
			
			if (scoreCardId === "0000000000") {
				this.handleErrorMessageBoxPress(oEvent, "No Scorecard available");
				return;
			}
			
			var currentURL = window.location.href;
			var urlParts = currentURL.split("/");
			var http = urlParts[0] + "//";
			var domain = urlParts[2];
			var workflowURL =  http + domain + "/sap/bc/ui5_ui5/sap/zui5_rmct_wf/index.html?#/Workflow/" + scoreCardId;
			
			this.openUrl(workflowURL, true);
		}
	});
});