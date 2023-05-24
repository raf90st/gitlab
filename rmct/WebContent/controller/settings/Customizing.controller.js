sap.ui.define([
	"juliusbaer/rmct/controller/BaseController",
	"sap/ui/core/mvc/Controller",
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
	"sap/m/Link",
	"sap/m/HBox",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportColumn",
	"sap/ui/core/util/ExportCell"
], function (BaseController, Controller, MessageToast, JSONModel, formatter, MessageBox, Fragment, CoreLibrary, Input, Label, Dialog, Button, ComboBox, Item, Filter, FilterOperator, Link, HBox, ExportTypeCSV, Export, ExportColumn, ExportCell) {
	"use strict";
	
	return BaseController.extend("juliusbaer.rmct.controller.settings.Customizing", {
		formatter: formatter,

		onInit: function () {		
			this.getRouter().getRoute("compmodels").attachMatched(this._onCompModelCustRouteMatched, this);
			this.getRouter().getRoute("compparams").attachMatched(this._onCompParamCustRouteMatched, this);
			this.getRouter().getRoute("payoutCurves").attachMatched(this._onPayoutCurvesCustRouteMatched, this);
			this.getRouter().getRoute("growthRates").attachMatched(this._onGrowthRatesCustRouteMatched, this);
			this.getRouter().getRoute("simCurrency").attachMatched(this._onSimCurrencyCustRouteMatched, this);
			this.getRouter().getRoute("growthRateAbs").attachMatched(this._onGrowthRatesAbsCustRouteMatched, this);
			this.getRouter().getRoute("simYearPerCountry").attachMatched(this._onSimYearPerCountryCustRouteMatched, this);
		},
		
		_onCompModelCustRouteMatched: function(oEvent) {
			this.loadCustomCompensationModels();
		},
		
		_onCompParamCustRouteMatched: function(oEvent) {
			this.loadCustomCompensationParameters();
		},
		
		_onPayoutCurvesCustRouteMatched: function(oEvent) {
			this.loadCustomPayoutCurves();
		},
		
		_onGrowthRatesCustRouteMatched: function(oEvent) {
			this.loadCustomGrowthRates();
		},
		
		_onSimCurrencyCustRouteMatched: function(oEvent) {
			this.loadCustomSimulationCurrency();
		},
		
		_onGrowthRatesAbsCustRouteMatched: function(oEvent) {
			this.loadCustomGrowthRateAbs();
		},
		
		_onSimYearPerCountryCustRouteMatched: function(oEvent) {
			this.loadCustomFirstSimYear();
		},
		
		loadCustomCompensationModels: function() {
			this.getView().getModel().read("/CustCompModelSet", {
				success: (data) => {
					this.getModel("global").setProperty("/custCompModel", data.results);
				}
			})
		},
		
		loadCustomCompensationParameters: function() {
			this.getView().getModel().read("/CustCompParamSet", {
				success: (data) => {
					this.getModel("global").setProperty("/custCompParams", data.results);
				}
			})
		},
		
		loadCustomGrowthRates: function() {
			this.getView().getModel().read("/CustGrowthRateSet", {
				success: (data) => {
					this.getModel("global").setProperty("/custGrowthRate", data.results);
				}
			})
		},
		
		loadCustomPayoutCurves: function() {
			this.getView().getModel().read("/CustPayoutCurveSet", {
				success: (data) => {
					this.getModel("global").setProperty("/custPayoutCurves", data.results);
				}
			})
		},
		
		loadCustomSimulationCurrency: function() {
			this.getView().getModel().read("/CustSimCurrencySet", {
				success: (data) => {
					this.getModel("global").setProperty("/custSimCurrency", data.results);
				}
			})
		},
		
		loadCustomGrowthRateAbs: function() {
			this.getView().getModel().read("/CustGrowthRateAbsSet", {
				success: (data) => {
					this.getModel("global").setProperty("/custGrowthRateAbs", data.results);
				}
			})
		},
		
		loadCustomFirstSimYear: function() {
			this.getView().getModel().read("/CustFirstYearSet", {
				success: (data) => {
					this.getModel("global").setProperty("/custFirstYearSim", data.results);
				}
			})
		},
		
		setSimYearModel: function(sModelName) {
			var oModel = new JSONModel({
				"Country": "",
				"Year": "",
				"CountryTxt": ""
			})
			
			this.getView().setModel(oModel, sModelName);
		},
		
		setGrowthRatesAbsModel: function(sModelName) {
			var oModel = new JSONModel({
				"Country": "",
				"Year": "",
				"CountryTxt": "",
				"SeqNr": "",
				"AmountFrom": "",
				"AmountTo": "",
				"Currency": "CHF",
				"Parameter": "",
				"CountryTxt": ""
			})
			
			this.getView().setModel(oModel, sModelName);
		},
		
		setSimCurrencyModel: function(sModelName) {
			var oModel = new JSONModel({
				"Country": "",
				"Currency": "",
				"CountryTxt": ""
			})
			
			this.getView().setModel(oModel, sModelName);
		},
		
		setGrowthRatesModel: function(sModelName) {
			var oModel = new JSONModel({
				"Country": "",
				"Year": "",
				"CountryTxt": "",
				"SeqNr": "",
				"QuantityFrom": "",
				"QuantityTo": "",
				"Unit": "",
				"Parameter": "",
				"CountryTxt": ""
			})
			
			this.getView().setModel(oModel, sModelName);
		},
		
		setPayoutCurveModel: function(sModelName) {
			var oModel = new JSONModel({
				"Country": "",
				"Year": "",
				"CountryTxt": "",
				"SeqNr": "",
				"AmountFrom": "",
				"AmountTo": "",
				"Currency": "CHF",
				"Parameter": "",
				"CountryTxt": "",
				"Model": "",
				"ModelTxt": ""
			})
			
			this.getView().setModel(oModel, sModelName);
		},
		
		setCustCompModel: function(sModelName) {
			var oModel = new JSONModel({
				"Model": "",
				"ModelTxt": "",
				"Year": ""
			})
			
			this.getView().setModel(oModel, sModelName);
		},
		
		setCustCompParamModel: function(sModelName) {
			var oModel = new JSONModel({
				"EntityValue": "",
				"Year": "",
				"EntityObject": "",
				"PrioritySeqNr": "",
				"Value": "",
				"ParameterTxt": "",
				"EntityObjectTxt": "",
				"Parameter": "",
				"EntityValueTxt": "",
			})
			
			this.getView().setModel(oModel, sModelName);
		},
		
		onAddNewSimYear: function(oEvent) {
			this.setSimYearModel("newSimYear");
			this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.NewSimYearDialog%_newSimYearDialog');
		},
		
		onAddNewGrowthRateAbs: function(oEvent) {
			this.setGrowthRatesAbsModel("newGrowthRateAbs");
			this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.NewGrowthRateAbsDialog%_newGrowthRateAbsDialog');
		},
		
		onAddNewSimCurrency: function(oEvent) {
			this.setSimCurrencyModel("newSimCurrency");
			this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.NewSimCurrencyDialog%_newSimCurrencyDialog');
		},
		
		onAddNewGrowthRate: function(oEvent) {
			this.setGrowthRatesModel("newGrowthRate");
			this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.NewGrowthRateDialog%_newGrowthRateDialog');
		},
		
		onAddNewPayoutCurve: function(oEvent) {
			this.setPayoutCurveModel("newPayoutCurve");
			this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.NewPayoutCurveDialog%_newPayoutCurveDialog');
		},
		
		onAddNewCustomizedCompModel: function(oEvent) {
			this.setCustCompModel("newCustCompModel");
			this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.NewCustomizedCompModel%_newCustCompModelDialog');
		},
		
		onAddNewCustCompParam: function(oEvent) {
			this.setCustCompParamModel("newCustCompParamModel");
			this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.NewCustomizedCompParamModel%_newCustCompParamModelDialog');
		},
		
		onSaveNewSimYear: function(oEvent, sKey) {
			var oModel = this.getModel("newSimYear").getData();

			this.getModel().create("/CustFirstYearSet", oModel, {
				success: (data) => {
					this.loadCustomFirstSimYear();
					this.onGenericFragmentclose(oEvent, "_newSimYearDialog");
					this.showMessage("Year successfully created!");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Year could not be created");
				}
			});
		},
		
		onCopyNewSimYear: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndex = oTable.getSelectedIndex();
			var selectedData = oTable.getContextByIndex(selectedIndex).getObject();
			this.getView().setModel(new JSONModel(selectedData), "newSimYear");
			this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.NewSimYearDialog%_newSimYearDialog');
		},
		
		onDeleteNewSimYear: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndex = oTable.getSelectedIndex();
			var selectedData = oTable.getContextByIndex(selectedIndex).getObject();
			
			var sUpdatePath = "Country='" + selectedData.Country + "'";
			
			this.getModel().remove("/CustFirstYearSet(" + sUpdatePath + ")", {
				success: (data) => {
					this.loadCustomFirstSimYear();
					this.showMessage("Year sucessfully deleted!");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Year could not be deleted");
				}
			});
		},
		
		onSimYearCustomizeChange: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var index = oEvent.getSource().getParent().getIndex();
			var oModel = oTable.getContextByIndex(index).getObject();
			
			var sUpdatePath = "Country='" + oModel.Country + "'";

			this.getModel().update("/CustFirstYearSet(" + sUpdatePath + ")", oModel, {
				success: (data) => {
					this.showMessage("Year successfully updated!");
					this.loadCustomFirstSimYear();
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Year could not be updated");
				}
			});
		},
		
		onGrowthRateAbsCustomizeChange: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var index = oEvent.getSource().getParent().getIndex();
			var oModel = oTable.getContextByIndex(index).getObject();
			
			var sUpdatePath = "Country='" + oModel.Country + "',Year='" + oModel.Year + "',SeqNr='" + oModel.SeqNr + "'";
			
			this.getModel().update("/CustGrowthRateAbsSet(" + sUpdatePath + ")", oModel, {
				success: (data) => {
					this.showMessage("Growth Rate successfully updated!");
					this.loadCustomGrowthRateAbs();
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Growth Rate could not be updated");
				}
			});
		},
		
		onSaveNewGrowthRateAbs: function(oEvent) {
			var oModel = this.getModel("newGrowthRateAbs").getData();

			this.getModel().create("/CustGrowthRateAbsSet", oModel, {
				success: (data) => {
					this.loadCustomGrowthRateAbs();
					this.onGenericFragmentclose(oEvent, "_newGrowthRateAbsDialog");
					this.showMessage("Growth Rate successfully created!");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Growth Rate could not be created");
				}
			});
		},
		
		onCopyNewGrowthRateAbs: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndex = oTable.getSelectedIndex();
			var selectedData = oTable.getContextByIndex(selectedIndex).getObject();
			this.getView().setModel(new JSONModel(selectedData), "newGrowthRateAbs");
			this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.NewGrowthRateAbsDialog%_newGrowthRateAbsDialog');
		},
		
		onDeleteNewGrowthRateAbs: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndex = oTable.getSelectedIndex();
			var selectedData = oTable.getContextByIndex(selectedIndex).getObject();
			
			var sUpdatePath = "Country='" + selectedData.Country + "',Year='" + selectedData.Year + "',SeqNr='" + selectedData.SeqNr + "'";
			
			this.getModel().remove("/CustGrowthRateAbsSet(" + sUpdatePath + ")", {
				success: (data) => {
					this.loadCustomGrowthRateAbs();
					this.showMessage("Growth Rate sucessfully deleted!");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Growth Rate could not be deleted");
				}
			});
		},

		onSimCurrencyCustomizeChange: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var index = oEvent.getSource().getParent().getIndex();
			var oModel = oTable.getContextByIndex(index).getObject();
			
			var sUpdatePath = "Country='" + oModel.Country + "'";
			
			this.getModel().update("/CustSimCurrencySet(" + sUpdatePath + ")", oModel, {
				success: (data) => {
					this.showMessage("Simulation Currency successfully updated!");
					this.loadCustomSimulationCurrency();
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Simulation Currency could not be updated");
				}
			});
		},
		
		onSaveNewSimCurrency: function(oEvent) {
			var oModel = this.getModel("newSimCurrency").getData();

			this.getModel().create("/CustSimCurrencySet", oModel, {
				success: (data) => {
					this.loadCustomSimulationCurrency();
					this.onGenericFragmentclose(oEvent, "_newSimCurrencyDialog");
					this.showMessage("Simulation Currency successfully created!");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Simulation Currency could not be created");
				}
			});
		},
		
		onCopyNewSimCurrency: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndex = oTable.getSelectedIndex();
			var selectedData = oTable.getContextByIndex(selectedIndex).getObject();
			this.getView().setModel(new JSONModel(selectedData), "newSimCurrency");
			this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.NewSimCurrencyDialog%_newSimCurrencyDialog');
		},
		
		onDeleteNewSimCurrency: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndex = oTable.getSelectedIndex();
			var selectedData = oTable.getContextByIndex(selectedIndex).getObject();
			
			var sUpdatePath = "Country='" + selectedData.Country + "'";
			
			this.getModel().remove("/CustSimCurrencySet(" + sUpdatePath + ")", {
				success: (data) => {
					this.loadCustomSimulationCurrency();
					this.showMessage("Simulation Currency sucessfully deleted!");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Simulation Currency could not be deleted");
				}
			});
		},
		
		onGrowthRatesCustomizeChange: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var index = oEvent.getSource().getParent().getIndex();
			var oModel = oTable.getContextByIndex(index).getObject();
			
			var sUpdatePath = "Country='" + oModel.Country + "',Year='" + oModel.Year + "',SeqNr='" + oModel.SeqNr + "'";
			
			this.getModel().update("/CustGrowthRateSet(" + sUpdatePath + ")", oModel, {
				success: (data) => {
					this.showMessage("Growth Rate successfully updated!");
					this.loadCustomGrowthRates();
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Growth Rate could not be updated");
				}
			});
		},
		
		onSaveNewGrowthRate: function(oEvent) {
			var oModel = this.getModel("newGrowthRate").getData();

			this.getModel().create("/CustGrowthRateSet", oModel, {
				success: (data) => {
					this.loadCustomGrowthRates();
					this.onGenericFragmentclose(oEvent, "_newGrowthRateDialog");
					this.showMessage("Growth Rate successfully created!");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Growth Rate could not be created");
				}
			});
		},
		
		onCopyNewGrowthRate: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndex = oTable.getSelectedIndex();
			var selectedData = oTable.getContextByIndex(selectedIndex).getObject();
			this.getView().setModel(new JSONModel(selectedData), "newGrowthRate");
			this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.NewGrowthRateDialog%_newGrowthRateDialog');
		},
		
		onDeleteGrowthRate: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndex = oTable.getSelectedIndex();
			var selectedData = oTable.getContextByIndex(selectedIndex).getObject();
			
			var sUpdatePath = "Country='" + selectedData.Country + "',Year='" + selectedData.Year + "',SeqNr='" + selectedData.SeqNr + "'";
			
			this.getModel().remove("/CustGrowthRateSet(" + sUpdatePath + ")", {
				success: (data) => {
					this.loadCustomGrowthRates();
					this.showMessage("Growth Rate sucessfully deleted!");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Growth Rate could not be deleted");
				}
			});
		},
		
		onPayoutCurvesCustomizeChange: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var index = oEvent.getSource().getParent().getIndex();
			var oModel = oTable.getContextByIndex(index).getObject();
			
			var sUpdatePath = "Country='" + oModel.Country + "',Year='" + oModel.Year + "',SeqNr='" + oModel.SeqNr + "',Model='" + oModel.Model + "'";
			
			this.getModel().update("/CustPayoutCurveSet(" + sUpdatePath + ")", oModel, {
				success: (data) => {
					this.showMessage("Payout Curve successfully updated!");
					this.loadCustomPayoutCurves();
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Payout Curve could not be updated");
				}
			});
		},
		
		onSaveNewPayoutCurve: function(oEvent) {
			var oModel = this.getModel("newPayoutCurve").getData();

			this.getModel().create("/CustPayoutCurveSet", oModel, {
				success: (data) => {
					this.loadCustomPayoutCurves();
					this.onGenericFragmentclose(oEvent, "_newPayoutCurveDialog");
					this.showMessage("Payout Curve successfully created!");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Payout Curve could not be created");
				}
			});
		},
		
		onCopyNewPayoutCurve: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndex = oTable.getSelectedIndex();
			var selectedData = oTable.getContextByIndex(selectedIndex).getObject();
			this.getView().setModel(new JSONModel(selectedData), "newPayoutCurve");
			this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.NewPayoutCurveDialog%_newPayoutCurveDialog');
		},
		
		onDeleteNewPayoutCurve: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndex = oTable.getSelectedIndex();
			var selectedData = oTable.getContextByIndex(selectedIndex).getObject();
			
			var sUpdatePath = "Country='" + selectedData.Country + "',Year='" + selectedData.Year + "',SeqNr='" + selectedData.SeqNr + "',Model='" + selectedData.Model + "'";
			
			this.getModel().remove("/CustPayoutCurveSet(" + sUpdatePath + ")", {
				success: (data) => {
					this.loadCustomPayoutCurves();
					this.showMessage("Payout Curve sucessfully deleted!");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Payout Curve could not be deleted");
				}
			});
		},
		
		onSaveNewCustCompModel: function(oEvent) {
			var oModel = this.getModel("newCustCompModel").getData();

			this.getModel().create("/CustCompModelSet", oModel, {
				success: (data) => {
					this.loadCustomCompensationModels();
					this.onGenericFragmentclose(oEvent, "_newCustCompModelDialog");
					this.showMessage("Compensation Model successfully created!");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Compensation Model could not be created");
				}
			});
		},
		
		onCopyNewCustomizedCompModel: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndex = oTable.getSelectedIndex();
			var selectedData = oTable.getContextByIndex(selectedIndex).getObject();
			this.getView().setModel(new JSONModel(selectedData), "newCustCompModel");
			this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.NewCustomizedCompModel%_newCustCompModelDialog');
		},
		
		onDeleteNewCustomizedCompModel: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndex = oTable.getSelectedIndex();
			var selectedData = oTable.getContextByIndex(selectedIndex).getObject();
			
			var sUpdatePath = "Model='" + selectedData.Model + "',Year='" + selectedData.Year + "'";
			
			this.getModel().remove("/CustCompModelSet(" + sUpdatePath + ")", {
				success: (data) => {
					this.loadCustomCompensationModels();
					this.showMessage("Compensation Model sucessfully deleted!");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Compensation Model could not be deleted");
				}
			});
		},
		
		onCompParamsCustomizeChange: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var index = oEvent.getSource().getParent().getIndex();
			var oModel = oTable.getContextByIndex(index).getObject();
			
			var sUpdatePath = "Parameter='" + oModel.Parameter + "',Year='" + oModel.Year + "',EntityValue='" + oModel.EntityValue + "',EntityObject='" + oModel.EntityObject + "'";
			
			this.getModel().update("/CustCompParamSet(" + sUpdatePath + ")", oModel, {
				success: (data) => {
					this.showMessage("Compensation Parameter successfully updated!");
					this.loadCustomCompensationParameters();
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Compensation Parameter could not be updated");
				}
			});
		},
		
		onEntityObjectSelected: function(oEvent) {
			sap.ui.getCore().byId("inputForCustomEntity").setValue("");
			sap.ui.getCore().byId("inputForCustomEntity").setEnabled(true);
			var selectedEntity = oEvent.getParameter("newValue");
			var selectedKey = selectedEntity.replace(/\s+/g, '');
			
			if (selectedKey === "*") {
				sap.ui.getCore().byId("inputForCustomEntity").setValue("*");
				sap.ui.getCore().byId("inputForCustomEntity").setEnabled(false);
			} else {
				this.getModel("global").setProperty("/selectedCustomEntity", selectedKey);
			}
		},
		
		onSavenewCustCompParamModel: function(oEvent) {
			var oModel = this.getModel("newCustCompParamModel").getData();

			this.getModel().create("/CustCompParamSet", oModel, {
				success: (data) => {
					this.loadCustomCompensationParameters();
					this.onGenericFragmentclose(oEvent, "_newCustCompParamModelDialog");
					this.showMessage("Compensation Parameter successfully created!");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Compensation Parameter could not be created");
				}
			});
		},
		
		onCopyNewCustCompParam: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndex = oTable.getSelectedIndex();
			var selectedData = oTable.getContextByIndex(selectedIndex).getObject();
			this.getView().setModel(new JSONModel(selectedData), "newCustCompParamModel");
			this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.NewCustomizedCompParamModel%_newCustCompParamModelDialog');
		},
		
		onDeleteNewCustCompParam: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndex = oTable.getSelectedIndex();
			var selectedData = oTable.getContextByIndex(selectedIndex).getObject();
			
			var sUpdatePath = "Parameter='" + selectedData.Parameter + "',Year='" + selectedData.Year + "',EntityValue='" + selectedData.EntityValue + "',EntityObject='" + selectedData.EntityObject + "'";
			
			this.getModel().remove("/CustCompParamSet(" + sUpdatePath + ")", {
				success: (data) => {
					this.loadCustomCompensationParameters();
					this.showMessage("Compensation Parameter sucessfully deleted!");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Compensation Parameter could not be deleted");
				}
			});
		}
		
	});
});