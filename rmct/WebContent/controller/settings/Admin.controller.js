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
	"sap/m/SearchField"
], function (Controller, BaseController, MessageToast, JSONModel, formatter, MessageBox, Fragment, CoreLibrary, Input, Label, Dialog, Button, ComboBox, Item, Filter, FilterOperator, SearchField) {
	"use strict";
	return BaseController.extend("juliusbaer.rmct.controller.settings.Admin", {
		formatter: formatter,

		onInit: function () {
			this.getRouter().getRoute("copyprofiles").attachMatched(this._onCopyRouteMatched, this);
			this.getRouter().getRoute("masterdata").attachMatched(this._onMDRouteMatched, this);
			this.getRouter().getRoute("authorizations").attachMatched(this._onAuthRouteMatched, this);
			this.getRouter().getRoute("email").attachMatched(this._onEmailRouteMatched, this);
		},
		
		_onCopyRouteMatched: function(oEvent) {
			var actYearNumber = new Date().getFullYear();
			var prevYearNumber = actYearNumber - 1;
			var prevYear = prevYearNumber.toString();
			var actualYear = actYearNumber.toString();
			
			this.getModel("global").setProperty("/copyProfilesTo", actualYear);
			this.getModel("global").setProperty("/copyProfilesFrom", prevYear);
			
			this.loadCopyProfiles(prevYear);
		},
		
		_onMDRouteMatched: function(oEvent) {
			
		},
		
		_onAuthRouteMatched: function(oEvent) {
			this.loadAuthData();
		},
		
		_onEmailRouteMatched: function(oEvent) {
			
		},
		
		setMdYearModel: function(sModelName) {			
			var oCompElementModel = new JSONModel({
				"Year": "",
				"Default": false
			})
			
			this.getView().setModel(oCompElementModel, sModelName);
		},
		
		setMdCurrencyModel: function(sModelName) {			
			var oCompElementModel = new JSONModel({
				"Key": ""
			})
			
			this.getView().setModel(oCompElementModel, sModelName);
		},
		
		setMdRegionModel: function(sModelName) {			
			var oCompElementModel = new JSONModel({
				"Key": "",
				"Text": "",
				"Valid": true
			})
			
			this.getView().setModel(oCompElementModel, sModelName);
		},
		
		setAuthModel: function(sModelName) {			
			var oCompElementModel = new JSONModel({
				"User": "",
				"Entity": "",
				"SeqNr": "",
				"Value": ""
			})
			
			this.getView().setModel(oCompElementModel, sModelName);
		},
		
		loadAuthData: function() {
			this.getView().getModel().read("/AuthExceptionSet", {
				success: (data) => {
					this.getModel("global").setProperty("/authorize", data.results);
				}
			});
		},
		
		onAddNewMaintainYear: function(oEvent) {
			this.setMdYearModel("newMdYear");
			this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.NewMdYearDialog%_newMdYearDialog');
		},
		
		onSaveNewMdYear: function(oEvent) {
			var oData = this.getModel("newMdYear").getData();
			
			this.getModel().create("/MDYearSet", oData, {
				success: (data) => {
					this.showMessage("Year successfully added!");
					this.loadMdData();
					this.onGenericFragmentclose(oEvent, "_newMdYearDialog");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Year could not be added");
				}
			});
		},
		
		onAddNewMaintainCurrency: function(oEvent) {
			this.setMdCurrencyModel("newMdCurrency");
			this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.NewMdCurrencyDialog%_newMdCurrencyDialog');
		},
		
		onSaveNewMdCurrency: function(oEvent) {
			var oData = this.getModel("newMdCurrency").getData();
			
			this.getModel().create("/MDCurrencySet", oData, {
				success: (data) => {
					this.showMessage("Currency successfully added!");
					this.loadMdData();
					this.onGenericFragmentclose(oEvent, "_newMdCurrencyDialog");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Currency could not be added");
				}
			});
		},
		
		onAddNewMaintainRegion: function(oEvent) {
			this.setMdRegionModel("newMdRegion");
			this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.NewMdRegionDialog%_newMdRegionDialog');
		},
		
		onSaveNewMdRegion: function(oEvent) {
			var oData = this.getModel("newMdRegion").getData();
			
			this.getModel().create("/MDRegionSet", oData, {
				success: (data) => {
					this.showMessage("Region successfully added!");
					this.loadMdData();
					this.onGenericFragmentclose(oEvent, "_newMdRegionDialog");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Region could not be added");
				}
			});
		},
		
		onRemoveMaintainYear: function(oEvent) {
			var index = oEvent.getSource().getParent().getParent().getSelectedIndex();
			var aYears = this.getModel("global").getProperty("/mdYears");
			var oSelectedYear = aYears[index];
			
			var sUpdatePath = "Year='" + oSelectedYear.Year + "'";
				
			this.getModel().remove("/MDYearSet(" + sUpdatePath + ")", {
				success: (data) => {
					this.showMessage("Year successfully deleted!");
					this.loadMdData();
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Year could not be deleted");
				}
			});
			
		},
		
		onRemoveMaintainCurrency: function(oEvent) {
			var index = oEvent.getSource().getParent().getParent().getSelectedIndex();
			var aCurrencies = this.getModel("global").getProperty("/mdCurrencies");
			var oSelectedYear = aCurrencies[index];
							
			var sUpdatePath = "Key='" + oSelectedYear.Key + "'";
			
			this.getModel().remove("/MDCurrencySet(" + sUpdatePath + ")", {
				success: (data) => {
					this.showMessage("Currency successfully deleted!");
					this.loadMdData();
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Currency could not be deleted");
				}
			});
				
		},
		
		onMdYearSelected: function(oEvent) {
			var index = oEvent.getSource().getParent().getIndex();
			var aYears = this.getModel("global").getProperty("/mdYears");
			var oSelectedYear = aYears[index];

			var sUpdatePath = "Year='" + oSelectedYear.Year + "'";
			
			this.getModel().update("/MDYearSet(" + sUpdatePath + ")", oSelectedYear, {
				success: (data) => {
					this.showMessage("Default Year successfully updated!");
					this.loadMdData();
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Default Year could not be updated");
				}
			});
		},
		
		onMdRegionChanged: function(oEvent) {
			var index = oEvent.getSource().getParent().getIndex();
			var aRegions = this.getModel("global").getProperty("/mdRegions");
			var oSelectedRegion = aRegions[index];
	
			var sUpdatePath = "Key='" + oSelectedRegion.Key + "'";
			
			this.getModel().update("/MDRegionSet(" + sUpdatePath + ")", oSelectedRegion, {
				success: (data) => {
					this.showMessage("Region successfully updated!");
					this.loadMdData();
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Region could not be updated");
				}
			});
		},
		
		onCopyFromYearChanged: function(oEvent) {
			var from = oEvent.getParameter("value");
			this.loadCopyProfiles(from);		
		},
		
		loadCopyProfiles : function(sFrom) {
			this.getModel("global").setProperty("/copyBusy", true);
			var sPath = "From='" + sFrom +  "'";
			
			this.getView().bindElement(
					{						
						path : "/CopyYearSet(" + sPath + ")",
						parameters : {						
							expand: "BpSet"
						},
						events : {
							dataReceived: (oEvent) => {
								this.getModel("global").setProperty("/copyBusy", false);
						}
					}
			});
		},
		
		onProfilesCopy: function(oEvent) {
			var from = this.getModel("global").getProperty("/copyProfilesFrom");
			var to = this.getModel("global").getProperty("/copyProfilesTo");
			
			if (!from || !to) {
				this.handleErrorMessageBoxPress(oEvent, "Please specify from and to year");
				return;
			}
			
			this.getModel("global").setProperty("/copyBusy", true);
					
			var oTable = this.byId("copyProfilesTable");
			var selectedIndices = oTable.getSelectedIndices();
			var aSelectedValues = [];
			
			selectedIndices.forEach((rowNumber) => {
				var oValue = oTable.getContextByIndex(rowNumber).getObject();
				oValue.Selected = true;
				aSelectedValues.push(oValue);
			});
			
			var oRequestDataSet = {
					"From": from,
					"To": to,
					"BpSet": aSelectedValues
			};
			
			this.getModel().create("/CopyYearSet", oRequestDataSet, {
				success: (data) => {
					this.showMessage("Profile(s) successfully copied");
					this.getModel("global").setProperty("/copyBusy", false);
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Profile(s) could not be copied");
					this.getModel("global").setProperty("/copyBusy", false);
				}
			});		
		},
			
		onAddNewAuthorization: function(oEvent) {
			this.setAuthModel("newAuth");
			this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.NewAuthorizationDialog%_newAuthDialog');
		},
		
		onSaveNewAuth: function(oEvent) {
			var oData = this.getModel("newAuth").getData();
			var isSelectedOrg = this.getModel("global").getProperty("/authorizeOrgSelected");
			
			if (isSelectedOrg) {
				oData.Entity = "0ORGUNIT";
			} else {
				oData.Entity = "ZRMPC2";
			}
			
			this.getModel().create("/AuthExceptionSet", oData, {
				success: (data) => {
					this.showMessage("Authorization successfully added!");
					this.loadAuthData();
					this.onGenericFragmentclose(oEvent, "_newAuthDialog");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Authorization could not be added");
				}
			});
		},
		
		onRemoveAuthorization: function(oEvent) {
			var oTable = this.byId("authorizationsTable");
			var selectedIndices = oTable.getSelectedIndices();
			
			selectedIndices.forEach((rowNumber) => {
				var oValue = oTable.getContextByIndex(rowNumber).getObject();
				var sUpdatePath = "User='" + oValue.User + "',Entity='" + oValue.Entity + "',SeqNr='" + oValue.SeqNr + "'";
				
				this.getModel().remove("/AuthExceptionSet(" + sUpdatePath + ")", {
					success: (data) => {
						this.showMessage("Authorization successfully deleted!");
						this.loadAuthData();
					},
					error: (oError) =>{
						this.handleErrorMessageBoxPress(oEvent, "Authorization could not be deleted");
					}
				});
			});
		},
		
		submitEmailTxt: function(oEvent, sKey) {
			var emailTxt = "";
			var id = sKey;
			
			if (id === "0001") {
				emailTxt = this.getModel("global").getProperty("/approvalTxt");
			} else {
				emailTxt = this.getModel("global").getProperty("/rejectionTxt");
			}
			
			var oData = {
				"Id": id,
				"Text": emailTxt
			};
			
			var sUpdatePath = "Id='" + id + "'";
			
			this.getModel().update("/MailTextSet(" + sUpdatePath + ")", oData, {
				success: (data) => {
					this.showMessage("E-Mail Text successfully updated!");
					this.loadEmailTexts();
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "E-Mail Text could not be updated");
				}
			});
		}
	});
});