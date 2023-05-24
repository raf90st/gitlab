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
	
	// Field Validation
	var ValueState = CoreLibrary.ValueState;
	
	return BaseController.extend("juliusbaer.rmct.controller.settings.Prospect", {
		formatter: formatter,

		onInit: function () {		
			this.getRouter().getRoute("prospect").attachMatched(this._onRouteMatched, this);
			this.getRouter().getRoute("prospectWithXNumber").attachMatched(this._onProspectWithNumberRouteMatched, this);
		},
		
		onOpenProspectBusinessCase: function(oEvent) {
			this.setProspectBusinessCaseModel("newProspectBC");
			this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.ProspectBusinessCaseDialog%_prospectBusinessCaseDialog");
			
		},
		
		prepareProspectProfile: function() {
			var oFieldStatesData = {
					name: ValueState.Error,
					region: ValueState.Error,
					market: ValueState.Error,
					startDate: ValueState.Error,
					model: ValueState.Error,
					legal: ValueState.Error,
					currency: ValueState.Error,
					nameValidated: false,
					marketValidated: false,
					regionValidated: false,
					legalValidated: false,
					startDateValidated: false,
					modelValidated: false,
					currencyValidated: false,
					prospectSaveButtonEnabled: false,
			}
			
			this.getModel("global").setProperty("/prospectFieldStates", oFieldStatesData);
			this.byId("notes").setEnabled(false);
		},
		
		setProspectModel: function(sModelname) {			
			var oNewProspectModel = new JSONModel({
				"Id" : "",
				"Name": "",
				"Region": "",
				"MarketTxt": "",
				"LegalEntity": "",
				"unumber": "",
				"StartDate": "",
				"Status": "",
				"RegionTxt": "",
				"LegalEntityTxt": "",
				"StatusTxt": "",
				"model": "",
				"modelTxt": "",
				"currency": "",
				"deferral": false
			})
			
			this.getView().setModel(oNewProspectModel, sModelname);
		},
		
		setProspectBusinessCaseModel: function(sModelname) {
			var prospectId = this.getModel("global").getProperty("/selectedProspect/prospect");
					
			var oNewBusinessCaseModel = new JSONModel({
				"unit" : "",
				"currency": "CHF",
				"roa": "0.00",
				"pci": "0.00",
				"nnm": "0.00",
				"aumavg": "0.00",
				"aum": "0.00",
				"year": "",
				"unumber": prospectId,
				"poolNumber": "",
				"nnmTargetContribution": "",
				"pc3b": "",
				"localCurrency": ""
			})
			
			this.getView().setModel(oNewBusinessCaseModel, sModelname);
		},
		
		setProspectCompElementModel(sModelName) {
			var prospectId = this.getModel("global").getProperty("/selectedProspect/prospect");
			var currency = this.getModel("global").getProperty("/selectedProspect/currency");
			
			var oCompElementModel = new JSONModel({
				"elementTxt": "",
				"currency": currency,
				"amount": "",
				"element" : "",
				"year": "",
				"rm": prospectId
			})
			
			this.getView().setModel(oCompElementModel, sModelName);
		},
		
		_onRouteMatched: function(oEvent) {
			this.prepareProspectProfile();
		},
		
		_onProspectWithNumberRouteMatched: function(oEvent) {
			this.prepareProspectProfile();
			var prospectNumber = oEvent.getParameter("arguments").prospect;
			this.getModel("global").setProperty("/selectedProspect/prospect", prospectNumber);
			this.loadProspectsProfile(prospectNumber);
		},

		loadProspectsProfile: function(sXnumber) {
			var sPath = "Id='" + sXnumber + "'";
			this.getModel("global").setProperty("/prospectProfileBusy", true);
			
			this.getView().bindElement(
					{						
						path : "/ProspectSet(" + sPath + ")",
						parameters : {						
							expand: "ProspectBusinessCase,ProspectNotes,ProspectElement,ProspectParameter"
						},
						events : {
							dataReceived: (oEvent) => {
								var receivedData = oEvent.getParameters().data;
								this.getModel("global").setProperty("/selectedProspect/name", receivedData.Name);
								this.getModel("global").setProperty("/prospectBusinessCase/length", receivedData.ProspectBusinessCase.length);
								this.getModel("global").setProperty("/selectedProspect/unumber", receivedData.unumber);
								this.getModel("global").setProperty("/selectedProspect/currency", receivedData.currency);
								this.getModel("global").setProperty("/selectedProspect/note", receivedData.ProspectNotes);
								this.byId("notes").detachChange(this.onProspectNoteChanged, this);
								this.byId("notes").attachChange(this.onProspectNoteChanged, this);
								this.byId("notes").bindValue("global>/selectedProspect/note/text");
								if (receivedData.InputReady) {
									this.byId("notes").setEnabled(true);
								}
								this.getModel("global").setProperty("/prospectProfileBusy", false);
							}
						}
				});
		},
		
		onCreateNewProspect: function(oEvent) {
			this.setProspectModel("newProspect");
			this.getNextProspectId();
			this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.NewProspectDialog%_newProspectDialog");
		},
		
		onSaveNewProspect: function(oEvent) {
			var oModel = this.getModel("newProspect").getData();
			
			this.getModel().create("/ProspectSet", oModel, {
				success: (data) => {
					this.showMessage("Prospect successfully created!");
					this.getRouter().navTo("prospectWithXNumber", {prospect: oModel.Id});
					this.onGenericFragmentclose(oEvent, "_newProspectDialog");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Prospect could not be created");
				}
			});
		},
		
		resetProspectFieldValidation: function() {
			this.getModel("global").setProperty("/prospectFieldStates/startDate", ValueState.Error);
			this.getModel("global").setProperty("/prospectFieldStates/model", ValueState.Error);
			this.getModel("global").setProperty("/prospectFieldStates/currency", ValueState.Error);
			this.getModel("global").setProperty("/prospectFieldStates/name", ValueState.Error);
			this.getModel("global").setProperty("/prospectFieldStates/region", ValueState.Error);
			this.getModel("global").setProperty("/prospectFieldStates/legal", ValueState.Error);
			this.getModel("global").setProperty("/prospectFieldStates/market", ValueState.Error);
			
			this.getModel("global").setProperty("/prospectFieldStates/startDateValidated", false);
			this.getModel("global").setProperty("/prospectFieldStates/modelValidated", false);
			this.getModel("global").setProperty("/prospectFieldStates/currencyValidated", false);
			this.getModel("global").setProperty("/prospectFieldStates/nameValidated", false);
			this.getModel("global").setProperty("/prospectFieldStates/regionValidated", false);
			this.getModel("global").setProperty("/prospectFieldStates/legalValidated", false);
			this.getModel("global").setProperty("/prospectFieldStates/marketValidated", false);
			
			this.getModel("global").setProperty("/prospectFieldStates/prospectSaveButtonEnabled", false);
		},
		
		prospectCurrencyValidation: function(oEvent) {
			var currency = oEvent.getSource().getValue();
			
			if (currency.length > 0) {
				this.getModel("global").setProperty("/prospectFieldStates/currency", ValueState.None);
				this.getModel("global").setProperty("/prospectFieldStates/currencyValidated", true);
			} else {
				this.getModel("global").setProperty("/prospectFieldStates/currency", ValueState.Error);
				this.getModel("global").setProperty("/prospectFieldStates/currencyValidated", false);
			}
			
			this.validateProspectSaveButton();
		},
		
		prospectModelValidation: function(oEvent) {
			var model = oEvent.getSource().getValue();
			
			if (model.length > 0) {
				this.getModel("global").setProperty("/prospectFieldStates/model", ValueState.None);
				this.getModel("global").setProperty("/prospectFieldStates/modelValidated", true);
			} else {
				this.getModel("global").setProperty("/prospectFieldStates/model", ValueState.Error);
				this.getModel("global").setProperty("/prospectFieldStates/modelValidated", false);
			}
			
			this.validateProspectSaveButton();
		},
		
		prospectStartDateFieldValidation: function(oEvent) {
			var startDate = oEvent.getSource().getValue();
			
			if (startDate.length > 0) {
				this.getModel("global").setProperty("/prospectFieldStates/startDate", ValueState.None);
				this.getModel("global").setProperty("/prospectFieldStates/startDateValidated", true);
			} else {
				this.getModel("global").setProperty("/prospectFieldStates/startDate", ValueState.Error);
				this.getModel("global").setProperty("/prospectFieldStates/startDateValidated", false);
			}
			
			this.validateProspectSaveButton();
		},
		
		prospectNameValidation: function(oEvent) {
			var name = oEvent.getSource().getValue();
			
			if (name.length > 0) {
				this.getModel("global").setProperty("/prospectFieldStates/name", ValueState.None);
				this.getModel("global").setProperty("/prospectFieldStates/nameValidated", true);
			} else {
				this.getModel("global").setProperty("/prospectFieldStates/name", ValueState.Error);
				this.getModel("global").setProperty("/prospectFieldStates/nameValidated", false);
			}
			
			this.validateProspectSaveButton();
		},
		
		prospectRegionValidation: function(oEvent) {
			var region = oEvent.getSource().getValue();
			
			if (region.length > 0) {
				this.getModel("global").setProperty("/prospectFieldStates/region", ValueState.None);
				this.getModel("global").setProperty("/prospectFieldStates/regionValidated", true);
			} else {
				this.getModel("global").setProperty("/prospectFieldStates/region", ValueState.Error);
				this.getModel("global").setProperty("/prospectFieldStates/regionValidated", false);
			}
			
			this.validateProspectSaveButton();
		},
		
		prospectLegalValidation: function(oEvent) {
			var legal = oEvent.getSource().getValue();
			
			if (legal.length > 0) {
				this.getModel("global").setProperty("/prospectFieldStates/legal", ValueState.None);
				this.getModel("global").setProperty("/prospectFieldStates/legalValidated", true);
			} else {
				this.getModel("global").setProperty("/prospectFieldStates/legal", ValueState.Error);
				this.getModel("global").setProperty("/prospectFieldStates/legalValidated", false);
			}
			
			this.validateProspectSaveButton();
		},
		
		prospectMarketValidation: function(oEvent) {
			var market = oEvent.getSource().getValue();
			
			if (market.length > 0) {
				this.getModel("global").setProperty("/prospectFieldStates/market", ValueState.None);
				this.getModel("global").setProperty("/prospectFieldStates/marketValidated", true);
			} else {
				this.getModel("global").setProperty("/prospectFieldStates/market", ValueState.Error);
				this.getModel("global").setProperty("/prospectFieldStates/marketValidated", false);
			}
			
			this.validateProspectSaveButton();
		},
		
		validateProspectSaveButton: function() {
			var marketValidated = this.getModel("global").getProperty("/prospectFieldStates/marketValidated");
			var legalValidated = this.getModel("global").getProperty("/prospectFieldStates/legalValidated");
			var regionValidated = this.getModel("global").getProperty("/prospectFieldStates/regionValidated");
			var nameValidated = this.getModel("global").getProperty("/prospectFieldStates/nameValidated");
			var startDateValidated = this.getModel("global").getProperty("/prospectFieldStates/startDateValidated");
			var modelValidated = this.getModel("global").getProperty("/prospectFieldStates/modelValidated");
			var currencyValidated = this.getModel("global").getProperty("/prospectFieldStates/currencyValidated");
			
			if (marketValidated && legalValidated && regionValidated && nameValidated && startDateValidated && modelValidated && currencyValidated) {
				this.getModel("global").setProperty("/prospectFieldStates/prospectSaveButtonEnabled", true);
			} else {
				this.getModel("global").setProperty("/prospectFieldStates/prospectSaveButtonEnabled", false);
			}
		},
		
		onProspectAction: function(oEvent, sKey) {
			var prospectId = this.getModel("global").getProperty("/selectedProspect/prospect");
			var fCall = "";
			
			switch (sKey) {
				case "transfer":
					fCall = "/ResetCalculation";
					break;
				case "deactivate":
					fCall = "/DeactivateProspect";
					break;
				case "reopen":
					fCall = "/ReopenProspect";
					break;
				default:
					return;
			}
			
			this.getModel().callFunction(fCall, {
				method: 'POST',
				urlParameters: {
					Id: prospectId
				},
				success: (data) => {
					this.loadProspectsProfile(prospectId);
				},
				error: (oError) =>
				{
					console.log(oError);
					
				}			
			})
		},
		
		getNextProspectId: function(oEvent) {
			this.getModel().callFunction("/GetNextProspectId", {
				method: 'GET',
				success: (data) => {
					this.getModel("newProspect").setProperty("/Id", data.Id)
				},
				error: (oError) =>
				{
					console.log(oError);
					
				}			
			})
		},
		
		onProspectExceptionSelected: function(oEvent) {
			var selected = oEvent.getParameter("selected");
			
			if (!selected) {
				var oTable = oEvent.getSource().getParent().getParent();
				var index = oEvent.getSource().getParent().getIndex();
				var oModel = oTable.getContextByIndex(index).getObject();		
				var sUpdatePath = "unumber='" + oModel.Id + "',param='" + oModel.param + "'";
				
				this.getModel().remove("/CompensationParametersSet(" + sUpdatePath + ")", {
					success: (data) => {
							this.showMessage("Compensation Parameter successfully deleted!");
							this.loadProspectsProfile(oModel.Id);
						},
						error: (oError) => {
							this.handleErrorMessageBoxPress(oEvent, "Compensation Parameter could not be deleted");
						}
				});					
			}
		},
		
		onSaveNewProspectBusinessCase: function() {
			var oModel = this.getModel("newProspectBC").getData();
			
			this.getModel().create("/BusinessCaseSet", oModel, {
				success: (data) => {
					console.log("create Success!");
					this.loadProspectsProfile(oModel.unumber);
					this.onGenericFragmentclose(oEvent, "_newProspectBusinessCaseDialog");
					this.showMessage("Business Case successfully created!");
					this.setBusinessCaseModel("newProspectBC");
					this.resetProspectFieldValidation();
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Business Case could not be saved");
				}
			});
		},
		
		onProspectBusinessCaseChanged: function(oEvent) {	
			var index = oEvent.getSource().getParent().getIndex();
			var oModel = oEvent.getSource().getParent().getParent().getContextByIndex(index).getObject();
			var sUpdatePath = "unumber='" + oModel.unumber + "',year='" + oModel.year + "'";
			this.updateProspectBusinessCase(oEvent, oModel, sUpdatePath);
		},
		
		updateProspectBusinessCase: function(oEvent, oModel, sPath) {	
			this.getModel().update("/BusinessCaseSet(" + sPath + ")", oModel, {
				success: (data) => {
					this.showMessage("Business Case successfully updated!");
					this.loadProspectsProfile(oModel.unumber);
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Business Case could not be updated");
				}
			});
		},
		
		onProspectBusinessCasesDelete: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndices = oTable.getSelectedIndices();

			selectedIndices.forEach((rowNumber) => {
				var oDeletedValue = oTable.getContextByIndex(rowNumber).getObject();
				this.deleteProspectBusinessCase(oDeletedValue, oEvent);
			});
		},
		
		deleteProspectBusinessCase: function(oModel, oEvent) {
			var sUpdatePath = "unumber='" + oModel.unumber + "',year='" + oModel.year + "'";
			
			this.getModel().remove("/BusinessCaseSet(" + sUpdatePath + ")", {
				success: (data) => {
					this.showMessage("Business Case successfully deleted!");
					this.loadProspectsProfile(oModel.unumber);
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Business Case could not be deleted");
				}
			});
		},
		
		onProspectProfileDataChange: function(oEvent) {
			var oModel = this.getView().getBindingContext().getObject();
			var oData = {};
			
			for (const property in oModel) {
				if (typeof oModel[property] === "boolean" || typeof oModel[property] === "string") {
					oData[property] = oModel[property];
				}
			}
			
			var prospectId = oModel.Id;
			
			var updatePath = "Id='" + prospectId + "'";
			
			this.getModel().update("/ProspectSet(" + updatePath + ")", oData, {
				success: (data) => {
					this.showMessage("Prospect successfully updated!");
					this.loadProspectsProfile(prospectId);
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Prospect could not be updated");
				}
			});
		},
		
		addNewProspectCompElement: function(oEvent) {
			this.setProspectCompElementModel("newProspElement");
			this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.NewProspectCompensationElementDialog%_newProspCompElement");
		},
		
		onSaveNewProspectCompElement: function(oEvent) {
			var oModel = this.getModel("newProspElement").getData();
			
			this.getModel().create("/CompElementSet", oModel, {
				success: (data) => {
					this.loadProspectsProfile(oModel.Id);
					this.onGenericFragmentclose(oEvent, "_newProspCompElement");
					this.showMessage("Compensation Element successfully created!");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Compensation Element could not be created");
				}
			});
		},
		
		onDeleteProspectCompElement: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndices = oTable.getSelectedIndices();

			selectedIndices.forEach((rowNumber) => {
				var oDeletedValue = oTable.getContextByIndex(rowNumber).getObject();
				this.deleteProspectCompElement(oDeletedValue, oEvent);
			});
		},
		
		deleteProspectCompElement: function(oModel, oEvent) {
			var year = oModel.year;
			var unumber = oModel.rm;
			var element = oModel.element;
			
			var sUpdatePath = "rm='" + unumber + "',year='" + year + "',element='" + element + "'";
			
			this.getModel().remove("/CompElementSet(" + sUpdatePath + ")", {
				success: (data) => {
					this.showMessage("Compensation Element successfully deleted!");
					this.loadProspectsProfile(unumber);
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Compensation Element could not be deleted");
				}
			});
		},
		
		onProspectCompElementChanged: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var index = oEvent.getSource().getParent().getIndex();
			var oModel = oTable.getContextByIndex(index).getObject()
			var year = oModel.year;
			var unumber = oModel.rm;
			var element = oModel.element;
			
			var sUpdatePath = "rm='" + unumber + "',year='" + year + "',element='" + element + "'";
			
			this.getModel().update("/CompElementSet(" + sUpdatePath + ")", oModel, {
				success: (data) => {
					this.loadProspectsProfile(unumber);
					this.showMessage("Compensation Element successfully updated!");
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Compensation Element could not be updated");
				}
			});
			
		},
		
		onProspectNoteChanged: function(oEvent) {
			var oModel = this.getModel("global").getProperty("/selectedProspect/note");
			
			var sUpdatePath = "unumber='" + oModel.unumber + "',year='" + oModel.year + "',type='" + oModel.noteType + "'";
			
			this.getModel().update("/CommentSet(" + sUpdatePath + ")", oModel, {
				success: (data) => {
					this.showMessage("Note successfully updated!");
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Note could not be updated");
				}
			});
		}
		
	});
});