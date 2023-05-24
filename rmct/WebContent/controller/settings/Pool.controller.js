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
], function (Controller, BaseController, MessageToast, JSONModel, formatter, MessageBox, Fragment, CoreLibrary, Input, Label, Dialog, Button, ComboBox, Item, Filter, FilterOperator) {
	"use strict";
	
	// Field Validation
	var ValueState = CoreLibrary.ValueState;
	
	return BaseController.extend("juliusbaer.rmct.controller.settings.Pool", {
		formatter: formatter,

		onInit: function () {
			this.getRouter().getRoute("pool").attachMatched(this._onPoolInitialRouteMatched, this);
			this.getRouter().getRoute("poolWithPoolNr").attachMatched(this._onRouteMatched, this);
		},
		
		preparePoolProfile: function(oEvent) {
			this.byId("notesArea").setEnabled(false);
			this.byId("scoreCardCommentArea").setEnabled(false);
			var year = this.getModel("global").getProperty("/selectedPool/year");
			
			if (!year) {
				this.setActualYear("/selectedPool/year");
			}
			
			var oWizardData = {
				poolNameState: ValueState.Error,
				poolRegionState: ValueState.Error,
				poolMarketState: ValueState.Error,
				poolLocationState: ValueState.Error,
				poolLegalEntityState: ValueState.Error,
				poolSinceState: ValueState.Error,
				poolUntilState: ValueState.Error,
				poolKpiTransferPeriodState: ValueState.Error,
				finishButtonVisible: false,
				saveButtonKPIEnabled: false
			}
			
			this.getModel("global").setProperty("/poolWizardData", oWizardData);
		},
		
		_onPoolInitialRouteMatched: function(oEvent) {
			this.preparePoolProfile(oEvent);
			var poolNumber = this.getModel("global").getProperty("/selectedPool/poolNumber");
			var year = this.getModel("global").getProperty("/selectedPool/year");
			
			if (poolNumber && year) {
				this.getRouter().navTo("poolWithPoolNr", {pool: poolNumber, year: year});
			}
		},
		
		_onRouteMatched: function(oEvent) {
			var poolNumber = oEvent.getParameter("arguments").pool;
			var year = oEvent.getParameter("arguments").year;
			this.preparePoolProfile(oEvent);
					
			if (poolNumber && year) {
				this.loadPoolProfile(poolNumber, year);
				this.getModel("global").setProperty("/selectedPool/poolNumber", poolNumber);
				this.getView().getParent().getParent().getParent().byId("navList").setSelectedKey("pool");
			}
		},
		
		setPoolKpiCorrectionsModel: function(sModelname) {
			var year = this.getModel("global").getProperty("/selectedPool/year");
			var poolNumber = this.getModel("global").getProperty("/selectedPool/poolNumber");
			
			var oNewKpiCorrectionsModel = new JSONModel({
				"poolNumber" : poolNumber,
				"zr": "",
				"unumber": "",
				"year": "",
				"name": "",
				"pc1ytd": "",
				"cocytd": "",
				"pandscharges": "",
				"provlosses": "",
				"genexpenses": "",
				"persexpenses": "",
				"aumt2": "",
				"nnm": "",
				"pciown": "",
				"aum": "",
				"nnmmtd": "",
				"teamhcann": "",
				"currency": "",
				"period": "",
				"type": "",
				"remark": "",
				"periodExt": ""

			})
			
			this.getView().setModel(oNewKpiCorrectionsModel, sModelname);
		},
		
		setLimitedPoolKpiRecModel: function(sModelname) {
			var year = this.getModel("global").getProperty("/selectedPool/year");
			var poolNumber = this.getModel("global").getProperty("/selectedPool/poolNumber");
					
			var oNewLtdKpiRec = new JSONModel({
				"type" : "ZR",
				"psflag": false,
				"percentage": "",
				"pciflag": false,
				"nnmflag": false,
				"unumber": "",
				"year": year,
				"cocflag": false,
				"aumflag": false,
				"instance": "",
				"unit": "",
				"poolNumber": poolNumber
			})
			
			this.getView().setModel(oNewLtdKpiRec, sModelname);
		},
		
		setPoolBusinessCaseModel: function(sModelname) {
			var year = this.getModel("global").getProperty("/selectedPool/year");
			var poolNr = this.getModel("global").getProperty("/selectedPool/poolNumber");
			var localCurrency = this.getModel("global").getProperty("/selectedPool/groupCurrency");
					
			var oNewBusinessCaseModel = new JSONModel({
				"unit" : "",
				"currency": "CHF",
				"roa": "0.00",
				"pci": "0.00",
				"nnm": "0.00",
				"aumavg": "0.00",
				"aum": "0.00",
				"year": year,
				"unumber": "",
				"poolNumber": poolNr,
				"nnmTargetContribution": "",
				"pc3b": "",
				"localCurrency": localCurrency
				
			})
			
			this.getView().setModel(oNewBusinessCaseModel, sModelname);
		},
		
		setPoolSetModel: function(sModelname) {
			
			var oNewPoolModel = new JSONModel({
				"poolName" : "",
				"poolNumber" : ""
			})
			
			this.getView().setModel(oNewPoolModel, sModelname);
		},
		
		setPoolProfileModel: function(sModelname) {
			var year;
			var selectedYear = this.getModel("global").getProperty("/selectedPool/year");
			
			if (selectedYear === "") {
				year = new Date().getFullYear().toString();
			} else {
				year = selectedYear;
			}
			
			var oNewPoolModel = new JSONModel({
				"LegalEntity" : "",
				"year": year,
				"LegalEntityTxt": "",
				"poolNumber": "",
				"createdOn": "",
				"poolName": "",
				"since": "",
				"until": "",
				"currency": "",
				"record": "",
				"groupCurrency": "01",
				"basePoints": "SFR",
				"payoutCurve": year,
				"payoutCurveName" : "",
				"model": "",
				"modelTxt": "",
				"PersArea": "",	
				"PersAreaTxt": "",
				"PersSarea": "",
				"PersSareaTxt": "",
				"Region": "",
				"RegionTxt": "",
				"Orgunit": "",
				"OrgunitTxt": "",
				"Market": "",
				"MarketTxt": "",
				"modby": "",
				"modon": ""
			})
			
			this.getView().setModel(oNewPoolModel, sModelname);
		},
		
		setPoolItaModel: function(sModelname) {
			var poolNumber = this.getModel("global").getProperty("/selectedPool/poolNumber");
			var year = this.getModel("global").getProperty("/selectedPool/year");
			
			var oNewItaModel = new JSONModel({
				"zr" : "",
				"year": year,
				"poolNumber": poolNumber,
				"closingdate": "",
				"newrm": "",
				"newname": "",
				"orgrm": "",
				"orgname": "",
				"itaflag": true,
				"bofflag": false,
				"period": "",
				"request": "",
				"unumber": "",
				"periodExt": ""
			})
			
			this.getView().setModel(oNewItaModel, sModelname);
		},
		
		getNextPoolId: function() {
			this.getModel().callFunction('/GetNextPoolId',{
				method: 'GET',
				urlParameters: {
				},
				success: (data) => {
					this.getModel("newPool").setProperty("/poolNumber", data.Id);
					this.getModel("newPoolProfile").setProperty("/poolNumber", data.Id);
				},
				error: (oError) =>
				{
					console.log(oError);
					
				}			
			})
		},
		
		onPoolKPIRowSelected: function(oEvent) {
			this.getModel("global").setProperty("/poolKPIRowSelected", true);
		},
		
		
		setPoolMemberModel: function(sModelname) {
			var year = this.getModel("global").getProperty("/selectedPool/year");
			var poolNr = this.getModel("global").getProperty("/selectedPool/poolNumber");
					
			var oNewPoolMemberModel = new JSONModel({
				"allocationType" : "F",
				"unumber": "",
				"allocation": "",
				"name": "",
				"poolNumber": poolNr,
				"year": year
			})
			
			this.getView().setModel(oNewPoolMemberModel, sModelname);
		},
		
		onPoolSelectedYearChanged: function(oEvent) {
			var year = oEvent.getSource().getSelectedKey();
			var poolNr = this.getModel("global").getProperty("/selectedPool/poolNumber");
			
			if (poolNr) {
				this.getRouter().navTo("poolWithPoolNr", {pool: poolNr, year: year});
			}
		},
		
		_handlePoolValueHelpSearch : function (evt) {
			var sValue = evt.getParameter("value");
			var aFilters = [];
			
			var oNameFilter = new Filter({
				path: "poolName",
				operator: FilterOperator.Contains,
				value1: sValue,
				caseSensitive: false
			});
			
			var oUnumberFilter = new Filter({
				path: "poolNumber",
				operator: FilterOperator.Contains,
				value1: sValue,
				caseSensitive: false
			});
			
			aFilters.push(oNameFilter);
			aFilters.push(oUnumberFilter);
			
			var oFilter = new Filter(aFilters, false);
			evt.getSource().getBinding("items").filter(oFilter);
		},
		
		_handlePoolValueLiveChange: function(oEvent) {		
			var oBinding = oEvent.getSource().getBinding("items");
			var sUser = oEvent.getParameter("value");
			
			var aFilters = [];
			
			var oNameFilter = new Filter({
				path: "poolName",
				operator: FilterOperator.Contains,
				value1: sUser,
				caseSensitive: false
			});
			
			var oUnumberFilter = new Filter({
				path: "poolNumber",
				operator: FilterOperator.Contains,
				value1: sUser,
				caseSensitive: false
			});
			
			aFilters.push(oNameFilter);
			aFilters.push(oUnumberFilter);
			
			var oFilter = new Filter(aFilters, false);
			oBinding.filter(oFilter);			
		},
		
		onPoolITAOpen: function (oEvent) {
			this.setItaModel("newPoolITA", "poolITA");
			this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.PoolTransferredAccountsDialog%_poolTransferredAccountsDialog");
		},
		
		onPoolKpiCorrectionsOpen: function (oEvent) {
			this.setKpiCorrectionsModel("newKpiCorrection", "POOLKPI");
			this.actualNewKPIType = "PoolKPI";
			this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.PoolKpiCorrectionsDialog%_poolKpiExceptionsDialog");
		},
		
		onPoolLtdRecOpen: function (oEvent) {
			this.setLimitedPoolKpiRecModel("newPoolKPIRec");
			this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.LimitedPoolKPIRecognitionDialog%_limitedPoolKpiDialog");
		},
		
		onPoolBusinessCasesOpen: function(oEvent) {
			this.setPoolBusinessCaseModel("newPoolBusinessCase");
			this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.PoolBusinessCaseDialog%_poolBusinessCaseDialog");	
		},
		
		onPoolDecentralizedOpen: function(oEvent) {
			this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.PoolDecentralizedEAMsDialog%_poolDecentralizedDialog");	
		},
		
		onPoolYearChange: function () {
			var year = oEvent.getSource().getSelectedKey();
			var poolNumber = this.getModel("global").getProperty("/selectedPool/poolNumber");
			this.getModel("global").setProperty("/kpiCorrectionsPool", []);
			this.getModel("global").setProperty("/limitedPoolKpiRecognition", []);
			
			if (poolNumber) {
				this.loadPoolProfile(poolNumber, year);
			} else {
				this.getModel("global").setProperty("/selectedPool/year", year);
			}
		},
		
		_handlePoolValueConfirm: function(evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var poolNumber = oSelectedItem.getDescription();
				var year = this.getModel("global").getProperty("/selectedPool/year");
				this.getModel("global").setProperty("/selectedPool/poolNumber", poolNumber);
				this.getModel("global").setProperty("/kpiCorrectionsPool", []);
				this.getModel("global").setProperty("/limitedPoolKpiRecognition", []);
				this.getRouter().navTo("poolWithPoolNr", {pool: poolNumber, year: year});
			}
			evt.getSource().getBinding("items").filter([]);
		},
		
		loadPoolProfile: function(sPoolNumber, sYear) {
			this.getModel("global").setProperty("/poolBusy", true);
			var sPath = "poolNumber='" + sPoolNumber + "',year='" + sYear + "'";
			this.getView().bindElement(
					{						
						path : "/PoolProfileSet(" + sPath + ")",
						parameters : {						
							expand: "Members,Notes,Contact,CompParameters,PoolScorecardComment,PoolTransferredAccounts,PoolLimitedKPIRecognition,PoolKPIExceptions,PoolBusinessCase,PoolDecEam"
						},
						events : {
							dataReceived: (oEvent) => {
								var receivedData = oEvent.getParameters().data;
								this.getModel("global").setProperty("/selectedPool/poolName", receivedData.poolName);
								this.getModel("global").setProperty("/selectedPool/groupCurrency", receivedData.groupCurrency);
								this.getModel("global").setProperty("/selectedPool/basePoints", receivedData.basePoints);
								this.byId("notesArea").bindValue("Notes/note");
								this.byId("scoreCardCommentArea").bindValue("PoolScorecardComment/note");
								this.byId("notesArea").setEnabled(true);
								this.byId("scoreCardCommentArea").setEnabled(true);
								this.getModel("global").setProperty("/selectedPool/region", receivedData.region);
								this.getModel("global").setProperty("/selectedPool/market", receivedData.market);
								this.getModel("global").setProperty("/selectedPool/legal", receivedData.legal);
								this.getModel("global").setProperty("/poolTransferredAccounts/length", receivedData.PoolTransferredAccounts.length);
								this.getModel("global").setProperty("/poolLimitedKPIRecognition/length", receivedData.PoolLimitedKPIRecognition.length);
								this.getModel("global").setProperty("/poolKPIExceptions/length", receivedData.PoolKPIExceptions.length);
								this.getModel("global").setProperty("/poolBusinessCase/length", receivedData.PoolBusinessCase.length);
								this.getModel("global").setProperty("/poolDecentralizedEAMs/length", receivedData.PoolDecEam.length)
								this.getModel("global").setProperty("/poolITABusy", false);
								this.getModel("global").setProperty("/decPoolEAMsPeriodBusy", false);
								this.getModel("global").setProperty("/poolBusy", false);
							}						
						}
				});		
		},
		
		onCreateNewPool: function(oEvent) {
			this.NewPoolOpened = true;
			
			this.setPoolSetModel("newPool");
			this.setPoolProfileModel("newPoolProfile");
			
			// request next available Pool Id via function import
			this.getNextPoolId();
			
			//Load Pool Create Dialog
			this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.NewPoolDialog%_newPoolDialog");
		},

		additionalInfoValidation: function() {
			var core = sap.ui.getCore();
			var	sPoolName = core.byId("poolName").getValue();
			var	sPoolRegion = core.byId("poolRegion").getSelectedKey();
			var	sPoolMarket = core.byId("poolMarket").getSelectedKey();
			var	sPoolLocation = core.byId("poolLocation").getValue();
			var sPoolLegalEntity = core.byId("poolLegalEntity").getSelectedKey();
			
			if (!sPoolName) {
				this.getModel("global").setProperty("/poolWizardData/poolNameState", ValueState.Error);
				this.getModel("global").setProperty("/poolWizardData/finishButtonVisible", false);
			} else {
				this.getModel("global").setProperty("/poolWizardData/poolNameState", ValueState.None);
			}
			
			if (!sPoolRegion) {
				this.getModel("global").setProperty("/poolWizardData/poolRegionState", ValueState.Error);
				this.getModel("global").setProperty("/poolWizardData/finishButtonVisible", false);
			} else {
				this.getModel("global").setProperty("/poolWizardData/poolRegionState", ValueState.None);
			}
			
			if (!sPoolMarket) {
				this.getModel("global").setProperty("/poolWizardData/poolMarketState", ValueState.Error);
				this.getModel("global").setProperty("/poolWizardData/finishButtonVisible", false);
			} else {
				this.getModel("global").setProperty("/poolWizardData/poolMarketState", ValueState.None);
			}
			
			if (!sPoolLocation) {
				this.getModel("global").setProperty("/poolWizardData/poolLocationState", ValueState.Error);
				this.getModel("global").setProperty("/poolWizardData/finishButtonVisible", false);
			} else {
				this.getModel("global").setProperty("/poolWizardData/poolLocationState", ValueState.None);
			}
			
			if (!sPoolLegalEntity) {
				this.getModel("global").setProperty("/poolWizardData/poolLegalEntityState", ValueState.Error);
				this.getModel("global").setProperty("/poolWizardData/finishButtonVisible", false);
			} else {
				this.getModel("global").setProperty("/poolWizardData/poolLegalEntityState", ValueState.None);
			}
			
			if (sPoolName && sPoolRegion && sPoolMarket && sPoolLocation && sPoolLegalEntity) {
				this.getModel("global").setProperty("/poolWizardData/finishButtonVisible", true);
			}
		},
		
		onSaveNewPool: function(oEvent) {
			this.NewPoolOpened = false;
			
			var oPoolModel = this.getModel("newPool").getData();
			var oPoolProfileModel = this.getModel("newPoolProfile").getData();		
			this.onAddNewPool(oPoolModel, oPoolProfileModel, oEvent);
			this.onGenericFragmentclose(oEvent, "_newPoolDialog");
			this.getRouter().navTo("poolWithPoolNr", {pool: oPoolModel.poolNumber, year: oPoolProfileModel.year});
		},
		
		onNewPoolCancel: function (oEvent) {
			this.NewPoolOpened = false;
			
			this.onGenericFragmentclose(oEvent, "_newPoolDialog");
		},
		
		onAddNewPool: function(oPoolModel, oPoolProfileModel, oEvent) {			
			this.getModel().create("/PoolSet", oPoolModel, {
				success: (data) => {
					this.onAddNewPoolProfile(oPoolProfileModel, oPoolModel, oEvent);
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Pool ID could not be created");
				}
			});
		},
		
		onAddNewPoolProfile: function(oPoolProfileModel, oPoolModel, oEvent) {
			oPoolProfileModel.poolNumber = oPoolModel.poolNumber;
			oPoolProfileModel.poolName = oPoolModel.poolName;
			
			this.getModel().create("/PoolProfileSet", oPoolProfileModel, {
				success: (data) => {
					this.showMessage("Pool successfully created!");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Pool could not be created");
				}
			});
		},
		
		onAddNewPoolCompParams: function(aModel, oEvent) {
			aModel.forEach((oModel) => {
				this.getModel().create("/PoolCompParametersSet", oModel, {
					success: (data) => {
						this.showMessage("Compensation Parameter successfully created!");
					},
					error: (oError) =>{
						this.handleErrorMessageBoxPress(oEvent, "Compensation Paramter could not be created");
					}
				});
			});
		},	
		
		selectedPoolModelChange: function(oEvent) {
			this.setNewPoolCompParamsModel("/newPoolCompParams");
		},
		
		onPoolProfileChange: function(oEvent) {
			var oModel = this.getView().getBindingContext().getObject();
			var oData = {};
			
			for (const property in oModel) {
				if (typeof oModel[property] === "boolean" || typeof oModel[property] === "string") {
					oData[property] = oModel[property];
				}
			}
			
			var year = oModel.year;
			var poolNr = oModel.poolNumber;
			
			var updatePath = "poolNumber='" + poolNr + "',year='" + year + "'";
			
			this.getModel().update("/PoolProfileSet(" + updatePath + ")", oData, {
				success: (data) => {
					this.showMessage("Pool Profile successfully updated!");
					this.loadPoolProfile(poolNr, year);
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Pool Profile could not be updated");
				}
			});
		},
		
		onPoolCompParamsChanged: function(oEvent) {
			var oModel = oEvent.getSource().getParent().getBindingContext().getObject();
			var parameter = oModel.param;
			var poolNr = this.getModel("global").getProperty("/selectedPool/poolNumber");
			var year = this.getModel("global").getProperty("/selectedPool/year");
			
			var updatePath = "poolNumber='" + poolNr + "',year='" + year + "',param='" + parameter + "'";
			
			this.getModel().update("/PoolCompParametersSet(" + updatePath + ")", oModel, {
				success: (data) => {
					this.showMessage("Compensation Parameter successfully updated!");
					this.loadPoolProfile(poolNr, year);
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Compensation Parameter could not be updated");
				}
			});
		},
		
		onAddNewPoolMemberForNewPool: function(oEvent) {
			this.setPoolMemberModel("newPoolMemberNewPool");
			this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.NewPoolMemberNewPool%_newPoolMemberNewPoolDialog");
		},
		
		onSaveNewPoolMemberNewPool: function(oEvent) {
			var oModel = this.getModel("newPoolMemberNewPool").getData();
			var aModels = this.getModel("global").getProperty("/newPoolMembers");
			
			if (aModels === "") {
				aModels = [];
			}
			
			aModels.push(oModel);
			this.getModel("global").setProperty("/newPoolMembers", aModels);
			this.onGenericFragmentclose(oEvent, "_newPoolMemberNewPoolDialog");
		},
		
		onAddNewPoolMember: function(oEvent) {
			this.setPoolMemberModel("newPoolMember");
			this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.NewPoolMemberDialog%_newPoolMemberDialog");
		},
		
		onSaveNewPoolMember: function(oEvent) {
			var oModel = this.getModel("newPoolMember").getData();
			
			this.getModel().create("/PoolMembersSet", oModel, {
				success: (data) => {
					this.showMessage("Pool Member successfully created!");
					this.loadPoolProfile(oModel.poolNumber, oModel.year);
					this.onGenericFragmentclose(oEvent, "_newPoolMemberDialog");
					this.setPoolMemberModel("newPoolMember");
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Pool Member could not be created");
				}
			});
		},
		
		onRemoveNewPoolMember: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndices = oTable.getSelectedIndices();

			selectedIndices.forEach((rowNumber) => {
				var oDeletedValue = oTable.getContextByIndex(rowNumber).getObject();
				this.onDeleteNewPoolMember(oDeletedValue);
			});
		},
		
		onRemoveNewPoolMemberForNewPool: function(oEvent) {
			var aModels = this.getModel("global").getProperty("/newPoolMembers");
			var oTable = oEvent.getSource().getParent().getParent();
			
			var selectedIndices = oTable.getSelectedIndices();
			var oDeletedValue = oTable.getContextByIndex(selectedIndices).getObject();
			
			var aWithoutUser = aModels.filter(function( obj ) {
			    return obj.unumber !== oDeletedValue.unumber;
			});
			
			this.getModel("global").setProperty("/newPoolMembers", aWithoutUser);
		},
		
		onDeleteNewPoolMember: function(oModel) {
			var unumber = oModel.unumber;
			var year = oModel.year;
			var poolNr = oModel.poolNumber;
			
			var sUpdatePath = "unumber='" + unumber + "',year='" + year + "',poolNumber='" + poolNr + "'";
			
			this.getModel().remove("/PoolMembersSet(" + sUpdatePath + ")", {
				success: (data) => {
					this.showMessage("Pool Member successfully deleted!");
					this.loadPoolProfile(oModel.poolNumber, oModel.year);
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Pool Member could not be deleted");
				}
			});
		},
		
		onPoolMemberUpdate: function(oEvent) {
			var index = oEvent.getSource().getParent().getIndex();
			var oModel = oEvent.getSource().getParent().getParent().getContextByIndex(index).getObject();
			
			var sUpdatePath = "poolNumber='" + oModel.poolNumber + "',year='" + oModel.year + "',unumber='" + oModel.unumber + "'";
			
			this.getModel().update("/PoolMembersSet(" + sUpdatePath + ")", oModel, {
				success: (data) => {
					this.showMessage("Pool Member successfully updated!");
					this.loadPoolProfile(oModel.poolNumber, oModel.year);;
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Pool Member could not be updated");
				}
			});
		},
		
		onSaveNewPoolTransferredAccount: function(oEvent) {
			var oModel = this.getModel("newPoolITA").getData();
			
			oModel.period = this.writeBackFormatTransferPeriods(oModel.periodExt);

			this.getModel().create("/PoolTransferredAccountsSet", oModel, {
				success: (data) => {
					this.showMessage("Transferred Account successfully created!");
					this.loadPoolProfile(oModel.poolNumber, oModel.year);
					this.setPoolItaModel("newPoolITA", "poolITA");
					this.onGenericFragmentclose(oEvent, "_newPoolTransferredAccountsDialog");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Transferred Acconunt could not be created");
				}
			});
		},
		
		onPoolItaModified:  function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndex = oEvent.getSource().getParent().getIndex();
			var selectedData = oTable.getContextByIndex(selectedIndex).getObject();
			
			selectedData.period = this.writeBackFormatTransferPeriods(selectedData.periodExt);
			
			var sUpdatePath = "zr='" + selectedData.zr + "',year='" + selectedData.year + "',poolNumber='" + selectedData.poolNumber + "'";
			
			this.getModel().update("/PoolTransferredAccountsSet(" + sUpdatePath + ")", selectedData, {
				success: (data) => {
					this.showMessage("Transferred Account successfully updated!");
					this.loadPoolProfile(selectedData.poolNumber, selectedData.year);
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Transferred Account could not be updated");
				}
			});
		},
		
		modifyPoolITA: function (selectedData) {
			var updatePath = "zr='" + selectedData.zr + "',year='" + selectedData.year + "',poolNumber='" + selectedData.poolNumber + "'";
			
			selectedData.period = this.writeBackFormatTransferPeriods(selectedData.periodExt);
			
			this.getModel().update("/PoolTransferredAccountsSet(" + updatePath + ")", selectedData, {
				success: (data) => {
					this.showMessage("Transferred Account successfully updated!");
					this.loadPoolProfile(selectedData.poolNumber, selectedData.year);
					this.getModel("global").setProperty("/poolITABusy", false);
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oError, "Transferred Account could not be updated");
					this.getModel("global").setProperty("/poolITABusy", false);
				}
			});
		},
		
		onSaveNewLtdPoolKpiRec: function(oEvent) {
			var oModel = this.getModel("newPoolKPIRec").getData();
			var poolNr = this.getModel("global").getProperty("/selectedPool/poolNumber");

			this.getModel().create("/PoolLimitedKPIRecognitionSet", oModel, {
				success: (data) => {
					this.showMessage("Limited KPI Recognition successfully created!");
					this.onGenericFragmentclose(oEvent, "_newLimitedPoolKpiRecognition");
					this.loadPoolProfile(poolNr, oModel.year);
					this.setLimitedPoolKpiRecModel("newPoolKPIRec");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Limited KPI Recognition could not be created");
				}
			});
		},
		
		onLtdPoolKPIChange: function(oEvent) {
			var oRow = oEvent.getSource().getParent();
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndex = oRow.getIndex();
			var selectedData = oTable.getContextByIndex(selectedIndex).getObject();
			var poolNr = selectedData.poolNumber;
			var year = selectedData.year;
			var unumber = selectedData.unumber;
			var type = selectedData.type;
			var instance = selectedData.instance;
			
			var updatePath = "poolNumber='" + poolNr + "',year='" + year + "',unumber='" + unumber + "',type='" + type + "',instance='" + instance + "'";
			
			this.getModel().update("/PoolLimitedKPIRecognitionSet(" + updatePath + ")", selectedData, {
				success: (data) => {
					this.showMessage("Limited KPI Recognition successfully updated!");
					this.loadPoolProfile(poolNr, year);
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Limited KPI Recognition could not be updated");
				}
			});
		},
		
		onDeletePoolLtdKPI: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndices = oTable.getSelectedIndices();

			selectedIndices.forEach((rowNumber) => {
				var oDeletedValue = oTable.getContextByIndex(rowNumber).getObject();
				this.deletePoolLtdKPI(oDeletedValue);
			});
		},
		
		deletePoolLtdKPI: function(oModel) {
			var poolNr = oModel.poolNumber;
			var year = oModel.year;
			var unumber = oModel.unumber;
			var type = oModel.type;
			var instance = oModel.instance;
			
			var updatePath = "poolNumber='" + poolNr + "',year='" + year + "',unumber='" + unumber + "',type='" + type + "',instance='" + instance + "'";
			
			this.getModel().remove("/PoolLimitedKPIRecognitionSet(" + updatePath + ")", {
				success: (data) => {
					this.showMessage("Limited KPI Recognition successfully deleted!");
					this.loadPoolProfile(poolNr, year);
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Limited KPI Recognition could not be deleted");
				}
			});
		},
		
		onNavToRMProfile: function(oEvent) {
			var index = oEvent.getSource().getParent().getIndex();
			var name = oEvent.getSource().getParent().getParent().getContextByIndex(index).getObject().name;
			var unumber = oEvent.getSource().getText();
			var year = this.getModel("global").getProperty("/selectedPool/year");
			this.getRouter().navTo("rmWithUnumber", {unumber: unumber, year: year});
		},
		
		onSaveNewPoolBusinessCase: function(oEvent) {
			var oModel = this.getModel("newPoolBusinessCase").getData();
			var poolNr = this.getModel("global").getProperty("/selectedPool/poolNumber");
			var year = this.getModel("global").getProperty("/selectedPool/year");
				
			this.getModel().create("/BusinessCaseSet", oModel, {
				success: (data) => {
					console.log("create Success!");
					this.loadPoolProfile(poolNr, year);
					this.onGenericFragmentclose(oEvent, "_newPoolBusinessCaseDialog");
					this.showMessage("Business Case successfully created!");
					this.setBusinessCaseModel("newPoolBusinessCase");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Business Case could not be saved");
				}
			});
		},
		
		onPoolBusinessCaseChanged: function(oEvent) {	
			var index = oEvent.getSource().getParent().getIndex();
			var oModel = oEvent.getSource().getParent().getParent().getContextByIndex(index).getObject();
			var sUpdatePath = "unumber='" + oModel.unumber + "',year='" + oModel.year + "', poolNumber='" + oModel.poolNumber + "'";
			this.updatePoolBusinessCase(oEvent, oModel, sUpdatePath);
		},
		
		updatePoolBusinessCase: function(oEvent, oModel, sPath) {	
			this.getModel().update("/PoolBusinessCaseSet(" + sPath + ")", oModel, {
				success: (data) => {
					this.showMessage("Business Case successfully updated!");
					this.loadPoolProfile(oModel.poolNumber, oModel.year);
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Business Case could not be updated");
				}
			});
		},
		
		onPoolBusinessCasesDelete: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndices = oTable.getSelectedIndices();

			selectedIndices.forEach((rowNumber) => {
				var oDeletedValue = oTable.getContextByIndex(rowNumber).getObject();
				this.deletePoolBusinessCase(oDeletedValue, oEvent);
			});
		},
		
		deletePoolBusinessCase: function(oModel, oEvent) {
			var sUpdatePath = "unumber='" + oModel.unumber + "',year='" + oModel.year + "', poolNumber='" + oModel.poolNumber + "'";
			
			this.getModel().remove("/PoolBusinessCaseSet(" + sUpdatePath + ")", {
				success: (data) => {
					this.showMessage("Business Case successfully deleted!");
					this.loadPoolProfile(oModel.poolNumber, oModel.year);
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Business Case could not be deleted");
				}
			});
		},
		
		transferPeriodPoolFieldValidation: function (oEvent) {
			var sTransferPeriod = oEvent.getSource().getValue();
			
			if (this.validateTransferPeriodInput(sTransferPeriod)) {
				this.getModel("global").setProperty("/poolWizardData/poolKpiTransferPeriodState", ValueState.None);
				this.getModel("global").setProperty("/poolWizardData/saveButtonKPIEnabled", true);
			} else {
				this.getModel("global").setProperty("/poolWizardData/poolKpiTransferPeriodState", ValueState.Error);
				this.getModel("global").setProperty("/poolWizardData/saveButtonKPIEnabled", false);
			}
		}
		
	});
});