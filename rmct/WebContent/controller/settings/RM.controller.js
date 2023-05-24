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
], function (BaseController, Controller, MessageToast, JSONModel, formatter, MessageBox, Fragment, CoreLibrary, Input, Label, Dialog, Button, ComboBox, Item, Filter, FilterOperator) {
	"use strict";
	
	// Field Validation
	var ValueState = CoreLibrary.ValueState;
	
	return BaseController.extend("juliusbaer.rmct.controller.settings.RM", {
		formatter: formatter,

		onInit: function () {		
			this.getRouter().getRoute("rm").attachMatched(this._onStandardRouteMatched, this);
			this.getRouter().getRoute("").attachMatched(this._onInitialdRouteMatched, this);
			this.getRouter().getRoute("rmWithUnumber").attachMatched(this._onRouteMatched, this);
		},
		
		prepareRMProfile: function() {
			this.byId("notesArea").setEnabled(false);
			this.byId("scoreCardCommentArea").setEnabled(false);
			
			var year = this.getModel("global").getProperty("/selectedRM/year");
			
			if (!year) {
				this.setActualYear("/selectedRM/year");
			}
			
			var oFieldStatesData = {
				nonFinancialGoalState: ValueState.Error,
				kpiTransferPeriodState: ValueState.Error,
				decEAMsTransferPeriodFromState: ValueState.None,
				decEAMsTransferPeriodToState: ValueState.None,
				decEAMsperiodFromValidated: false,
				decEAMsperiodToValidated: false,
				nfgSaveButtonEnabled: false,
				saveButtonEnabled: false,
				decEAMssaveEnabled: false
			}
				
			this.getModel("global").setProperty("/rmFieldStates", oFieldStatesData);
		},
		
		_onInitialdRouteMatched: function(oEvent) {
			this.resetCompensationProfile();
			this.setActualYear("/selectedRM/year");
		},
		
		_onStandardRouteMatched: function(oEvent) {
			this.prepareRMProfile();
			
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			var year = this.getModel("global").getProperty("/selectedRM/year");
			
			if (unumber && year) {
				this.getRouter().navTo("rmWithUnumber", {unumber: unumber, year: year});
			}
		},

		_onRouteMatched: function(oEvent) {
			this.prepareRMProfile();
			var unumber = oEvent.getParameter("arguments").unumber;
			var year = oEvent.getParameter("arguments").year;
			
			if (unumber && year) {
				this.getModel("global").setProperty("/selectedRM/unumber", unumber);
				this.loadCompensationProfile(year, unumber);
				this.getView().getParent().getParent().getParent().byId("navList").setSelectedKey("rm");
			}
		},
		
		onSavePressed: function () {
			MessageToast.show("Save was pressed");
		},

		onCancelPressed: function () {
			MessageToast.show("Cancel was pressed");
		},
		onNavButtonPress: function  () {
			this.getOwnerComponent().myNavBack();
		},
	
		onValuesChange: function() {
			MessageToast.show("Server Request!");
		},
		
		onItaOpen: function(oEvent) {
			this.setItaModel("newITA", "rmITA");
			this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.TransferredAccountsDialog%_transferredAccountsDialog");
		},
		
		onKpiCorrectionsOpen: function(oEvent) {
			this.setKpiCorrectionsModel("newKpiCorrection", "RMKPI");
			this.actualNewKPIType = "RMKPI";
			this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.KpiCorrectionsDialog%_kpiExceptionsDialog");
		},
		
		onExclusionsOpen: function(oEvent) {
			this.setExclusionsModel("newExclusion");
			this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.ExclusionsDialog%_exclusionsDialog");
		},
		
		onLimitedKPIRecOpen: function(oEvent) {
			this.setLimitedKpiRecModel("newKpiRec");
			this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.LimitedKpiRecognitionDialog%_limitedKpiDialog");
		},
		
		onBusinessCaseOpen: function(oEvent) {
			this.setBusinessCaseModel("newBusinessCase");
			this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.BusinessCaseDialog%_businessCaseDialog');
		},
		
		onDecentralizedEAMsOpen: function(oEvent) {
			this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.DecentralizedEAMsDialog%_decentralizedDialog');
		},
		
		onMTAOpen: function(oEvent) {
			this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.MTADialog%_mtaDialog");
		},
		
		onKriResultOpen: function(oEvent) {
			this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.KriResultDialog%_kriResultDialog');
		},
		
		onPolicyProceduresOpen: function(oEvent) {
			this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.PolicyProcedureDialog%_policyProcedureDialog');
		},
		
		onThKRIOpen: function (oEvent) {
			this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.TeamHeadKriDialog%_teamHeadKriDialog');
		},
		
		onMilestonesOpen: function(oEvent) {
			this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.MilestonesDialog%_mileStonesDialog');
		},
		
		onConductAssessmentOpen: function(oEvent) {
			this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.ConductAssessmentDialog%_conductAssessmentDialog');
		},
		
		onNonFinancialGoalOpen: function(oEvent) {
			this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.NonFinancialGoalDialog%_nonFinancialGoalDialog');
		},
		
		onAddNewMilestoneCondition: function(oEvent) {
			var oTable = sap.ui.getCore().byId("milestoneConditionsTable");
			var tableLength = oTable.getBinding().getLength();
			this.setMilestonesConditionModel("newMilestoneCondition", tableLength);
			this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.NewMilestoneConditionDialog%_newMilestoneConditionDialog");
		},
		
		onAddNewMilestone: function(oEvent) {
			var oTable = sap.ui.getCore().byId("milestoneTable");
			var tableLength = oTable.getBinding().getLength();
			this.setMilestonesModel("newMilestone", tableLength);
			this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.NewMilestoneDialog%_newMilestoneDialog");
		},

		setMilestonesModel(sModelName, sLength) {
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			var year = this.getModel("global").getProperty("/selectedRM/year");
			var currency = this.getModel("global").getProperty("/compensationProfile/currency");
			var tmp = sLength + 1;
			var Id = "";
			
			if (tmp < 10) {
				Id = "0" + tmp.toString();
			} else {
				Id = tmp.toString();
			}
			
			var oMilestoneModel = new JSONModel({
				"Id": Id,
				"Period": "",
				"PeriodExt": "",
				"AmountMilestone": "",
				"AmountFinal": "",
				"Currency" : currency,
				"year": year,
				"rm": unumber,
				"Remark": ""
			})
			
			this.getView().setModel(oMilestoneModel, sModelName);
		},
		
		setMilestonesConditionModel(sModelName, sLength) {
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			var year = this.getModel("global").getProperty("/selectedRM/year");
			var tmp = sLength + 1;
			var Id = "";
			var milestoneId = this.getModel("global").getProperty("/selectedMilestoneId");
			
			if (tmp < 10) {
				Id = "0" + tmp.toString();
			} else {
				Id = tmp.toString();
			}
			
			var oMilestoneCondModel = new JSONModel({
				"Id": milestoneId,
				"Condition" : Id,
				"Description": "",
				"Passed": false,
				"year": year,
				"rm": unumber,
				"Exception": false
			})
			
			this.getView().setModel(oMilestoneCondModel, sModelName);
		},
		
		
		setCompElementModel(sModelName) {
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			var year = this.getModel("global").getProperty("/selectedRM/year");
			var currency = this.getModel("global").getProperty("/compensationProfile/currency");
			
			var oCompElementModel = new JSONModel({
				"elementTxt": "",
				"currency": currency,
				"amount": "",
				"element" : "",
				"year": year,
				"rm": unumber
			})
			
			this.getView().setModel(oCompElementModel, sModelName);
		},
		
		setCompensationProfileModel: function(sModelname) {
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			var year = this.getModel("global").getProperty("/selectedRM/year");
			
			var oNewCompProfileModel = new JSONModel({
				"basispoint": "",
				"createdon": "",
				"currency" : "",
				"deferral": true,
				"disabled": false,
				"ep": "",
				"epflag": false,
				"Firstname": "",
				"groupCurrency": "",
				"keyRiskTaker": false,
				"LatestPayout": "",
				"LegalEntity" : "",
				"LegalEntityTxt": "",
				"losdate": "",
				"losexception": false,
				"Market": "",
				"MarketTxt": "",
				"modby": "",
				"model": "",
				"modelTxt": "",
				"modon": "",
				"Name": "",
				"noscorecard": false,
				"Orgunit": "",
				"OrgunitTxt": "",
				"payoutCurve": "",
				"payoutCurveException": false,
				"payoutName": "",
				"PersArea": "",
				"PersAreaTxt": "",
				"PersSarea": "",
				"PersSareaTxt": "",
				"Photo": "",
				"Pool": "",
				"PoolName": "",
				"rank": "",
				"record": "",
				"Region": "",
				"RegionTxt": "",
				"since": "",
				"Surname": "",
				"until": "",
				"unumber": unumber,
				"year": year
			})
			
			this.getView().setModel(oNewCompProfileModel, sModelname);
		},
		
		setExclusionsModel: function(sModelname) {
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			var year = this.getModel("global").getProperty("/selectedRM/year");
			
			var oNewExclusionModel = new JSONModel({
				"rmid" : "",
				"type": "ZR",
				"to": "",
				"toExt": "",
				"from": "",
				"fromExt": "",
				"year": year,
				"unumber": unumber
			})

			this.getView().setModel(oNewExclusionModel, sModelname);
		},
		
		setLimitedKpiRecModel: function(sModelname) {
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			var year = this.getModel("global").getProperty("/selectedRM/year");
					
			var oNewLtdKpiRec = new JSONModel({
				"type" : "ZR",
				"psflag": false,
				"percentage": "",
				"pciflag": false,
				"nnmflag": false,
				"unumber": unumber,
				"year": year,
				"cocflag": false,
				"aumflag": false,
				"instance": ""
			})
			
			
			this.getView().setModel(oNewLtdKpiRec, sModelname);
		},
		
		setBusinessCaseModel: function(sModelname) {
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			var year = this.getModel("global").getProperty("/selectedRM/year");
			var currency = this.getModel("global").getProperty("/compensationProfile/currency");
					
			var oNewBusinessCaseModel = new JSONModel({
				"unit" : "",
				"currency": currency,
				"roa": "0.00",
				"pci": "0.00",
				"nnm": "0.00",
				"aumavg": "0.00",
				"aum": "0.00",
				"nnmTargetContribution": "0.00",
				"localCurrency": "0.00",
				"pc3b": "0.00",
				"year": year,
				"unumber": unumber
			})
			
			this.getView().setModel(oNewBusinessCaseModel, sModelname);
		},
		
		getInputLabel : function (sDescription) {
			return new Label({text: sDescription})
		},
		
		transferPeriodFieldValidation: function (oEvent) {
			var sTransferPeriod = oEvent.getSource().getValue();
			
			if (this.validateTransferPeriodInput(sTransferPeriod)) {
				this.getModel("global").setProperty("/rmFieldStates/kpiTransferPeriodState", ValueState.None);
				this.getModel("global").setProperty("/rmFieldStates/saveButtonEnabled", true);
			} else {
				this.getModel("global").setProperty("/rmFieldStates/kpiTransferPeriodState", ValueState.Error);
				this.getModel("global").setProperty("/rmFieldStates/saveButtonEnabled", false);
			}
		},
		
		nonFinancialGoalValidation: function (oEvent) {
			var sValue = oEvent.getSource().getValue();
			
			if (this.validateNonFinancialGoal(sValue)) {
				this.getModel("global").setProperty("/rmFieldStates/nonFinancialGoalState", ValueState.None);
				this.getModel("global").setProperty("/rmFieldStates/nfgSaveButtonEnabled", true);
			} else {
				this.getModel("global").setProperty("/rmFieldStates/nonFinancialGoalState", ValueState.Error);
				this.getModel("global").setProperty("/rmFieldStates/nfgSaveButtonEnabled", false);
			}
		},
		
		loadCompensationProfile: function(sYear, sUnumber) {
			this.resetCompensationProfile();
			this.getModel("global").setProperty("/compProfileBusy", true);
			
			var aFilters = [];
			var yearFilter = new Filter('year','EQ', sYear);
			var unumberFilter = new Filter('unumber','EQ', sUnumber); 
			
			aFilters.push(yearFilter);
			aFilters.push(unumberFilter);
						
			this.getView().getModel().read("/CompensationProfileSet", {
				filters: aFilters,
				success: (data) => {
					if (!data.results[0].disabled) {
						this.getModel("global").setProperty("/selectedRM/name", data.results[0].Name);
						this.getModel("global").setProperty("/compensationProfile", data.results[0]);
						this.loadCompensationParameters(sYear, sUnumber);
						this.loadCompensationElements(sYear, sUnumber);
						this.loadCompensationComments(sYear, sUnumber, "N");
						this.loadCompensationComments(sYear, sUnumber, "S");
						this.loadRelationshipManager(sYear, sUnumber);
						this.loadApprovingManagers(sYear);
						this.loadTransferredAccounts(sYear, sUnumber);
						this.loadKpiCorrections(sYear, sUnumber);
						this.loadExclusions(sYear, sUnumber);
						this.loadLtdKpiRecognition(sYear, sUnumber);
						this.loadBusinessCase(sUnumber);
						this.loadDecentralizedEAMs(sYear, sUnumber);
						this.loadKRIResult(sYear, sUnumber);
						this.loadPolicyProcedures(sYear, sUnumber);
						this.loadTeamHeadKRI(sYear, sUnumber);
						this.loadMilestones(sUnumber);
						this.loadConductAssessment(sYear, sUnumber);
						this.loadNonFinancialGoal(sYear, sUnumber);
					} else {
						this.setCompensationProfileModel("newCompProfile");
						this.onGenericFragmentLoad(this, "juliusbaer.rmct.fragment.dialogs.NoDataLoadedDialog%_noDataDialog");
						this.getModel("global").setProperty("/compProfileBusy", false);
					}
				}
			})
		},
		
		resetProfileSelection: function() {
			this.getModel("global").setProperty("/selectedRM/name", undefined);
			this.getModel("global").setProperty("/selectedRM/unumber", undefined);
		},
		
		resetCompensationProfile: function() {
			this.getModel("global").setProperty("/compensationProfile", []);
			this.getModel("global").setProperty("/compensationParams", []);
			this.getModel("global").setProperty("/compElements", []);
			this.byId("notesArea").unbindValue();
			this.byId("notesArea").setEnabled(false);
			this.byId("scoreCardCommentArea").unbindValue();
			this.byId("scoreCardCommentArea").setEnabled(false);
			this.getModel("global").setProperty("/relationshipManager", []);
			this.getModel("global").setProperty("/approvingManagers", []);
			this.getModel("global").setProperty("/transferredAccounts", []);
			this.getModel("global").setProperty("/kpiCorrections", []);
			this.getModel("global").setProperty("/exclusions", []);
			this.getModel("global").setProperty("/limitedKpiRecognition", []);
			this.getModel("global").setProperty("/businessCase", []);
			this.getModel("global").setProperty("/RmMTA", "");
			this.getModel("global").setProperty("/kriResult", []);
			this.getModel("global").setProperty("/policyProcedureDeduction", "");
			this.getModel("global").setProperty("/thKRIDeduction", "");
			this.getModel("global").setProperty("/milestones", []);
			this.getModel("global").setProperty("/conductAssessment", []);
			this.getModel("global").setProperty("/nonFinGoal", "");
		},
		
		loadCompensationElements: function(sYear, sUnumber) {
			var aFilters = [];
			var yearFilter = new Filter('year','EQ', sYear);
			var unumberFilter = new Filter('rm','EQ', sUnumber);
			
			aFilters.push(yearFilter);
			aFilters.push(unumberFilter);
			
			this.getView().getModel().read("/CompElementSet", {
				filters: aFilters,
				success: (data) => {
					this.getModel("global").setProperty("/compElements", data.results);
				}
			})
		},
		
		loadCompensationParameters: function(sYear, sUnumber) {
			var aFilters = [];
			var yearFilter = new Filter('year','EQ', sYear);
			var unumberFilter = new Filter('unumber','EQ', sUnumber);
			
			aFilters.push(yearFilter);
			aFilters.push(unumberFilter);
						
			this.getView().getModel().read("/CompensationParametersSet", {
				filters: aFilters,
				success: (data) => {
					this.getModel("global").setProperty("/compensationParams", data.results);
				}
			})
		},
		
		loadCompensationComments: function(sYear, sUnumber, sCommentType) {
			this.getModel("global").setProperty("/compNotesBusy", true);
			this.byId("scoreCardCommentArea").detachChange(this.onNotesChanged, this);
			this.byId("notesArea").detachChange(this.onNotesChanged, this);
			
			var aFilters = [];
			var yearFilter = new Filter('year','EQ', sYear);
			var unumberFilter = new Filter('unumber','EQ', sUnumber);
			var commentFilter = new Filter('type','EQ', sCommentType);
			
			aFilters.push(yearFilter);
			aFilters.push(unumberFilter);
			aFilters.push(commentFilter);
					
			this.getView().getModel().read("/CommentSet", {
				filters: aFilters,
				success: (data) => {
					if (sCommentType === "N") {
						this.getModel("global").setProperty("/compensationNotes", data.results[0]);
						this.byId("notesArea").bindValue("global>/compensationNotes/text");
						this.byId("notesArea").attachChange(this.onNotesChanged, this);
						this.byId("notesArea").setEnabled(true);
					} else {
						this.getModel("global").setProperty("/scorecardNotes", data.results[0]);
						this.byId("scoreCardCommentArea").bindValue("global>/scorecardNotes/text");
						this.byId("scoreCardCommentArea").attachChange(this.onNotesChanged, this);
						this.byId("scoreCardCommentArea").setEnabled(true);
					}
					this.getModel("global").setProperty("/compNotesBusy", false);
				}
			})
		},
		
		loadModelSelection: function() {	
			this.getView().getModel().read("/CompModelSet", {
				success: (data) => {
					this.getModel("global").setProperty("/modelSelection", data.results);
				}
			})
		},
		
		loadRelationshipManager: function(sYear, sUnumber) {
			var aFilters = [];
			var yearFilter = new Filter('year','EQ', sYear);
			var unumberFilter = new Filter('unumber','EQ', sUnumber);
			
			aFilters.push(yearFilter);
			aFilters.push(unumberFilter);
						
			this.getView().getModel().read("/RelationshipManagerSet", {
				filters: aFilters,
				success: (data) => {
					data.results[0].latestpayout = this.formatLatestPayoutDate(data.results[0].latestpayout);
					this.getModel("global").setProperty("/relationshipManager", data.results[0]);
				}
			})
		},
		
		loadApprovingManagers: function(sYear) {
			var aFilters = [];
			var unumberFilter = new Filter('year','EQ', sYear);

			aFilters.push(unumberFilter);
			
			this.getView().getModel().read("/ApprovingManagersSet", {
				filters: aFilters,
				success: (data) => {
					this.getModel("global").setProperty("/approvingManagers", data.results);
				}
			})
		},
		
		loadTransferredAccounts: function(sYear, sUnumber) {
			var aFilters = [];
			var yearFilter = new Filter('year','EQ', sYear);
			var unumberFilter = new Filter('unumber','EQ', sUnumber);
			
			aFilters.push(yearFilter);
			aFilters.push(unumberFilter);
			
			this.getView().getModel().read("/TransferredAccountsSet", {
				filters: aFilters,
				success: (data) => {					
					this.getModel("global").setProperty("/transferredAccounts", data.results);
					this.getModel("global").setProperty("/transferredAccounts/length", data.results.length);
					this.getModel("global").setProperty("/ITABusy", false);
				}
			})
		},
		
		loadKpiCorrections: function(sYear, sUnumber) {
			var aFilters = [];
			var yearFilter = new Filter('year','EQ', sYear);
			var unumberFilter = new Filter('unumber','EQ', sUnumber);
			
			aFilters.push(yearFilter);
			aFilters.push(unumberFilter);
			
			this.getView().getModel().read("/KPIExceptionsSet", {
				filters: aFilters,
				success: (data) => {
					var aFieldSorted = data.results;
					aFieldSorted.sort((a, b) => a.zr < b.zr ? -1 : (a.zr > b.zr ? 1 : 0))
					this.getModel("global").setProperty("/kpiCorrections", aFieldSorted);
					this.getModel("global").setProperty("/kpiCorrections/length", data.results.length);
				}
			})
		},
		
		loadExclusions: function(sYear, sUnumber) {
			var aFilters = [];
			var yearFilter = new Filter('year','EQ', sYear);
			var unumberFilter = new Filter('unumber','EQ', sUnumber);
			
			aFilters.push(yearFilter);
			aFilters.push(unumberFilter);
			
			this.getView().getModel().read("/ExclusionsSet", {
				filters: aFilters,
				success: (data) => {
					this.getModel("global").setProperty("/exclusions", data.results);
					this.getModel("global").setProperty("/exclusions/length", data.results.length);
				}
			})
		},
		
		loadLtdKpiRecognition: function(sYear, sUnumber) {
			var aFilters = [];
			var yearFilter = new Filter('year','EQ', sYear);
			var unumberFilter = new Filter('unumber','EQ', sUnumber);
			
			aFilters.push(yearFilter);
			aFilters.push(unumberFilter);
			
			this.getView().getModel().read("/LimitedKPIRecognitionSet", {
				filters: aFilters,
				success: (data) => {
					var aFieldSorted = data.results;
					aFieldSorted.sort((a, b) => a.instance < b.instance ? -1 : (a.instance > b.instance ? 1 : 0))
					this.getModel("global").setProperty("/limitedKpiRecognition", aFieldSorted);
					this.getModel("global").setProperty("/limitedKpiRecognition/length", data.results.length);
				}
			})
		},
		
		loadBusinessCase: function(sUnumber) {
			var aFilters = [];
			var unumberFilter = new Filter('unumber','EQ', sUnumber);
			
			aFilters.push(unumberFilter);
			
			this.getView().getModel().read("/BusinessCaseSet", {
				filters: aFilters,
				success: (data) => {
					this.getModel("global").setProperty("/businessCase", data.results);
					this.getModel("global").setProperty("/businessCase/length", data.results.length);
				}
			})
		},
		
		loadKRIResult: function(sYear, sUnumber) {
			var aFilters = [];
			var yearFilter = new Filter('year','EQ', sYear);
			var unumberFilter = new Filter('rm','EQ', sUnumber);
			
			aFilters.push(yearFilter);
			aFilters.push(unumberFilter);
			
			this.getView().getModel().read("/KRIResultSet", {
				filters: aFilters,
				success: (data) => {
					this.getModel("global").setProperty("/kriResult", data.results);
					this.getModel("global").setProperty("/kriResult/length", data.results.length);
				}
			})
		},
		
		loadPolicyProcedures: function(sYear, sUnumber) {
			var sUpdatePath = "rm='" + sUnumber + "',year='" + sYear + "'";
			
			this.getView().getModel().read("/PolicyAndProcedureViolationSet(" + sUpdatePath + ")", {
				success: (data) => {
					this.getModel("global").setProperty("/policyProcedureDeduction", data.Deduction);
				}
			})
		},
		
		loadTeamHeadKRI: function(sYear, sUnumber) {
			var sUpdatePath = "rm='" + sUnumber + "',year='" + sYear + "'";
			
			this.getView().getModel().read("/TeamHeadKRISet(" + sUpdatePath + ")", {
				success: (data) => {
					this.getModel("global").setProperty("/thKRIDeduction", data.Deduction);
				}
			})
		},
		
		loadMilestones: function(sUnumber) {
			var aFilters = [];
			var unumberFilter = new Filter('rm','EQ', sUnumber);
			
			aFilters.push(unumberFilter);
			
			this.getView().getModel().read("/MilestoneSet", {
				filters: aFilters,
				success: (data) => {
					this.getModel("global").setProperty("/milestones", data.results);
					this.getModel("global").setProperty("/milestones/length", data.results.length);
				}
			})
		},
		
		loadConductAssessment: function(sYear, sUnumber) {
			var sUpdatePath = "rm='" + sUnumber + "',year='" + sYear + "'";
			
			this.getView().getModel().read("/ConductAssessmentSet(" + sUpdatePath + ")", {
				success: (data) => {
					this.getModel("global").setProperty("/conductAssessment/Care", data.Care);
					this.getModel("global").setProperty("/conductAssessment/Excellence", data.Excellence);
					this.getModel("global").setProperty("/conductAssessment/Passion", data.Passion);
					this.getModel("global").setProperty("/conductAssessment/RiskBehaviour", data.RiskBehaviour);
				}
			})
		},
		
		loadNonFinancialGoal: function(sYear, sUnumber) {
			var sUpdatePath = "rm='" + sUnumber + "',year='" + sYear + "'";
			
			this.getView().getModel().read("/NonFinancialGoalSet(" + sUpdatePath + ")", {
				success: (data) => {
					this.getModel("global").setProperty("/nonFinGoal", data.Rating);
					
					if (this.validateNonFinancialGoal(data.Rating)) {
						this.getModel("global").setProperty("/rmFieldStates/nonFinancialGoalState", ValueState.None);
						this.getModel("global").setProperty("/rmFieldStates/nfgSaveButtonEnabled", true);
					}
					
					this.getModel("global").setProperty("/compProfileBusy", false);
				}
			})
		},
		
		onRmSelectedYearChanged: function(oEvent) {
			var year = oEvent.getSource().getSelectedKey();
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			var name = this.getModel("global").getProperty("/selectedRM/name");
			
			if (unumber) {
				this.getRouter().navTo("rmWithUnumber", {unumber: unumber, year: year});
			}
		},
		
		onModifyExclusion: function(oEvent) {
			var index = oEvent.getSource().getParent().getIndex();
			var oModel = oEvent.getSource().getParent().getParent().getContextByIndex(index).getObject();
			
			var year = this.getModel("global").getProperty("/selectedRM/year");
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			
			var sUpdatePath = "unumber='" + unumber + "',year='" + year + "',rmid='" + oModel.rmid + "',type='" + oModel.type + "'";
			this.updateExclusions(oEvent, oModel, sUpdatePath);
		},
		
		onBusinessCaseChanged: function(oEvent) {	
			var index = oEvent.getSource().getParent().getIndex();
			var oModel = oEvent.getSource().getParent().getParent().getContextByIndex(index).getObject();
			
			var year = this.getModel("global").getProperty("/selectedRM/year");
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			var sUpdatePath = "unumber='" + unumber + "',year='" + year + "'";
			
			this.updateBusinessCase(oEvent, oModel, sUpdatePath);
		},
		
		updateBusinessCase: function(oEvent, oModel, sPath) {	
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			
			this.getModel().update("/BusinessCaseSet(" + sPath + ")", oModel, {
				success: (data) => {
					this.showMessage("Business Case successfully updated!");
					this.loadBusinessCase(unumber);
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Business Case could not be updated");
				}
			});
		},
		
		onExclusionsDelete: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndices = oTable.getSelectedIndices();

			selectedIndices.forEach((rowNumber) => {
				var oDeletedValue = oTable.getContextByIndex(rowNumber).getObject();
				this.deleteExclusions(oDeletedValue, oEvent);
			});
		},
		
		deleteExclusions: function(oModel, oEvent) {
			var year = oModel.year;
			var unumber = oModel.unumber;
			var type = oModel.type;
			var rmid = oModel.rmid;
			
			var sUpdatePath = "unumber='" + unumber + "',year='" + year + "',rmid='" + rmid + "',type='" + type + "'";
			
			this.getModel().remove("/ExclusionsSet(" + sUpdatePath + ")", {
				success: (data) => {
					this.showMessage("Exclusion successfully deleted!");
					this.loadExclusions(year, unumber);
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Exclusion could not be deleted");
				}
			});
		},
		
		onBusinessCasesDelete: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndices = oTable.getSelectedIndices();

			selectedIndices.forEach((rowNumber) => {
				var oDeletedValue = oTable.getContextByIndex(rowNumber).getObject();
				this.deleteBusinessCases(oDeletedValue, oEvent);
			});
		},
		
		deleteBusinessCases: function(oModel, oEvent) {
			var unumber = oModel.unumber;
			var year = oModel.year;
			var sUpdatePath = "unumber='" + unumber + "',year='" + year + "'";
			
			this.getModel().remove("/BusinessCaseSet(" + sUpdatePath + ")", {
				success: (data) => {
					this.showMessage("Business Case successfully deleted!");
					this.loadBusinessCase(unumber);
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Business Case could not be deleted");
				}
			});
		},
			
		onSaveNewTransferredAccount: function(oEvent) {
			var oModel = this.getModel("newITA").getData();
			var year = this.getModel("global").getProperty("/selectedRM/year");
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			
			oModel.period = this.writeBackFormatTransferPeriods(oModel.periodExt);
			
			this.getModel().create("/TransferredAccountsSet", oModel, {
				success: (data) => {
					this.loadTransferredAccounts(year, unumber);
					this.onGenericFragmentclose(oEvent, "_newTransferredAccountsDialog");
					this.showMessage("Transferred Account successfully created!");
					this.setItaModel("newITA", "rmITA");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Transferred Account could not be saved");
				}
			});
		},
		
		onSaveNewExclusion: function(oEvent) {
			var oModel = this.getModel("newExclusion").getData();
			var year = this.getModel("global").getProperty("/selectedRM/year");
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
				
			oModel.from = this.writeBackFormatTransferPeriods(oModel.fromExt);
			oModel.to = this.writeBackFormatTransferPeriods(oModel.toExt);
			
			this.getModel().create("/ExclusionsSet", oModel, {
				success: (data) => {
					this.loadExclusions(year, unumber);
					this.onGenericFragmentclose(oEvent, "_newExclusionDialog");
					this.showMessage("Exclusion successfully created!");
					this.setExclusionsModel("newExclusion");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Exclusion could not be saved");
				}
			});
			
		},
		
		onSaveNewLtdKpiRec: function(oEvent) {
			var oModel = this.getModel("newKpiRec").getData();
			var oNewLtdKpiRec = {};
			var year = this.getModel("global").getProperty("/selectedRM/year");
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			
			Object.assign(oNewLtdKpiRec, oModel);
			
			this.getModel().create("/LimitedKPIRecognitionSet", oNewLtdKpiRec, {
				success: (data) => {
					console.log("create Success!");
					this.loadLtdKpiRecognition(year, unumber);
					this.onGenericFragmentclose(oEvent, "_newLimitedKpiRecognition");
					this.showMessage("Limited KPI Recognition successfully created!");
					this.setLimitedKpiRecModel("newKpiRec");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Limited KPI Recognition could not be saved");
				}
			});
		},
		
		onSaveNewBusinessCase: function(oEvent) {
			var oModel = this.getModel("newBusinessCase").getData();
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			
			this.getModel().create("/BusinessCaseSet", oModel, {
				success: (data) => {
					console.log("create Success!");
					this.loadBusinessCase(unumber);
					this.onGenericFragmentclose(oEvent, "_newBusinessCaseDialog");
					this.showMessage("Business Case successfully created!");
					this.setBusinessCaseModel("newBusinessCase");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Business Case could not be saved");
				}
			});
		},
		
			
		onItaModified: function(oEvent) {
			var index = oEvent.getSource().getParent().getIndex();
			var oModel = oEvent.getSource().getParent().getParent().getContextByIndex(index).getObject();			
			this.updateITA(oEvent, oModel);
		},
		
		onLtdKPIChange: function(oEvent) {
			var index = oEvent.getSource().getParent().getIndex();
			var oModel = oEvent.getSource().getParent().getParent().getContextByIndex(index).getObject();
			this.updateLtdKPI(oEvent, oModel);
		},
		
		updateLtdKPI: function(oEvent, oModel) {
			var year = this.getModel("global").getProperty("/selectedRM/year");
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			var type = oModel.type;
			var instance = oModel.instance;
			
			var sUpdatePath = "unumber='" + unumber + "',year='" + year + "',type='" + type + "',instance='" + instance + "'";
			
			this.getModel().update("/LimitedKPIRecognitionSet(" + sUpdatePath + ")", oModel, {
				success: (data) => {
					this.showMessage("Limited KPI Recognition successfully updated!");
					this.loadLtdKpiRecognition(year, unumber);
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Limited KPI Recognition could not be updated");
				}
			});
		},
		
		onDeleteLtdKPI: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndices = oTable.getSelectedIndices();

			selectedIndices.forEach((rowNumber) => {
				var oDeletedValue = oTable.getContextByIndex(rowNumber).getObject();
				this.deleteLtdKPI(oDeletedValue, oEvent);
			});
		},
		
		deleteLtdKPI: function(oModel, oEvent) {
			var unumber = oModel.unumber;
			var year = oModel.year;
			var instance = oModel.instance;
			var type = oModel.type;
			
			var sUpdatePath = "unumber='" + unumber + "',year='" + year + "',instance='" + instance + "',type='" + type + "'";
			
			this.getModel().remove("/LimitedKPIRecognitionSet(" + sUpdatePath + ")", {
				success: (data) => {
					this.showMessage("Limited KPI Recognition successfully deleted!");
					this.loadLtdKpiRecognition(year, unumber);
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Limited KPI Recognition could not be deleted");
				}
			});
		},
		
		onNotesChanged: function(oEvent) {
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			var year = this.getModel("global").getProperty("/selectedRM/year");
			var noteType = "";	
			var noteId = oEvent.getSource().getId();
			var oModel;
			
			if (noteId.includes('notesArea')) {
				noteType = "N";
				oModel = this.getModel("global").getProperty("/compensationNotes");
				oModel.type = noteType;
				oModel.year = year;
				oModel.unumber = unumber;
			} else {
				noteType = "S";
				oModel = this.getModel("global").getProperty("/scorecardNotes");
				oModel.type = noteType;
				oModel.year = year;
				oModel.unumber = unumber;
			}
			
			var sUpdatePath = "unumber='" + unumber + "',year='" + year + "',type='" + noteType + "'";
			
			this.getModel().update("/CommentSet(" + sUpdatePath + ")", oModel, {
				success: (data) => {
					this.showMessage("Note successfully updated!");
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Note could not be updated");
				}
			});
		},
		
		onCompParametersChanged: function(oEvent) {
			var index = oEvent.getSource().getParent().getIndex();
			var selectedData = oEvent.getSource().getParent().getParent().getContextByIndex(index).getObject();
			
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			var year = this.getModel("global").getProperty("/selectedRM/year");
			
			var sUpdatePath = "unumber='" + unumber + "',year='" + year + "',param='" + selectedData.param + "'";
			
			this.getModel().update("/CompensationParametersSet(" + sUpdatePath + ")", selectedData, {
				success: (data) => {
					this.showMessage("Compensation Parameter successfully updated!");
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Compensation Parameter could not be updated");
				}
			});
		},
		
		onCreateNewRmProfile : function(oEvent) {
			var oModel = this.getModel("newCompProfile").getData();
			
			this.getModel().create("/CompensationProfileSet", oModel, {
				success: (data) => {
					this.showMessage("Compensation Profile successfully created!");
					this.onGenericFragmentclose(oEvent, "_noDataDialog");
					this.setCompensationProfileModel("newCompProfile");
					this.loadCompensationProfile(oModel.year, oModel.unumber);
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Compensation Profile could not be created");
				}
			});
			
		},
		
		onKPIRowSelected: function(oEvent) {
			this.getModel("global").setProperty("/kpiRowSelected", true);
		},
		
		onProfileDataChange: function(oEvent) {
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			var year = this.getModel("global").getProperty("/selectedRM/year");
			var oProfileModel = this.getModel("global").getProperty("/compensationProfile");
			
			var sUpdatePath = "unumber='" + unumber + "',year='" + year + "'";
			
			this.getModel().update("/CompensationProfileSet(" + sUpdatePath + ")", oProfileModel, {
				success: (data) => {
					this.showMessage("Compensation Profile successfully updated!");
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Compensation Profile could not be updated");
				}
			});
		},
		
		onCountryPayoutFlagSelected: function(oEvent) {
			var selected = oEvent.getParameter("selected");
			
			if (!selected) {
				var oModel = this.getModel("global").getProperty("/compensationProfile");
				var unumber = oModel.unumber;
				var year = oModel.year;
				var name = this.getModel("global").getProperty("/selectedRM/name");
				oModel.payoutCurve = "";
				var sUpdatePath = "unumber='" + unumber + "',year='" + year + "'";
				
				this.getModel().update("/CompensationProfileSet(" + sUpdatePath + ")", oModel, {
					success: (data) => {
						this.showMessage("Compensation Profile successfully updated!");
						this.loadCompensationProfile(year, unumber);
					},
					error: (oError) => {
						this.handleErrorMessageBoxPress(oEvent, "Compensation Profile could not be updated");
					}
				});
			}
		},
		
		updateExclusions: function(oEvent, oModel, sPath) {
			var year = this.getModel("global").getProperty("/selectedRM/year");
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			
			oModel.from = this.writeBackFormatTransferPeriods(oModel.fromExt);
			oModel.to = this.writeBackFormatTransferPeriods(oModel.toExt);
			
			this.getModel().update("/ExclusionsSet(" + sPath + ")", oModel, {
				success: (data) => {
					this.showMessage("Exclusions successfully saved!");
					this.loadExclusions(year, unumber);
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Exclusion could not be updated");
				}
			});
		},
		
		updateITA: function(oEvent, oModel) {
			var year = this.getModel("global").getProperty("/selectedRM/year");
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			var zr = oModel.zr;
			
			oModel.period = this.writeBackFormatTransferPeriods(oModel.periodExt);
			
			var sUpdatePath = "unumber='" + unumber + "',year='" + year + "',zr='" + zr + "'";
			
			this.getModel().update("/TransferredAccountsSet(" + sUpdatePath + ")", oModel, {
				success: (data) => {
					this.showMessage("Transferred Accounts successfully updated!");
					this.loadTransferredAccounts(year, unumber);
					this.getModel("global").setProperty("/ITABusy", false);
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Internally Transferred Account not be updated");
					this.getModel("global").setProperty("/ITABusy", false);
				}
			});
		},
		
		onRmDataChange: function(oEvent) {
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			var year = this.getModel("global").getProperty("/selectedRM/year");
			var sUpdatePath = "unumber='" + unumber + "',year='" + year + "'";
			var oModel = this.getModel("global").getProperty("/relationshipManager");
			oModel.latestpayout = this.writeBackFormatLatestPayoutDate(oModel.latestpayout);
					
			this.getModel().update("/RelationshipManagerSet(" + sUpdatePath + ")", oModel, {
				success: (data) => {
					this.showMessage("Compensation Profile successfully updated!");
					this.loadRelationshipManager(year, unumber);
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Compensation Profile could not be deleted");
				}
			});
		},
		
		onExceptionSelected: function(oEvent) {
			var selected = oEvent.getParameter("selected");
			
			if (!selected) {
				var index = oEvent.getSource().getParent().getIndex();
				var oModel = oEvent.getSource().getParent().getParent().getContextByIndex(index).getObject();
				
				var sUpdatePath = "unumber='" + oModel.unumber + "',year='" + oModel.year + "',param='" + oModel.param + "'";
			
				this.getModel().remove("/CompensationParametersSet(" + sUpdatePath + ")", {
					success: (data) => {
						this.showMessage("Compensation Parameter successfully deleted!");
						this.loadCompensationParameters(oModel.year, oModel.unumber);
					},
					error: (oError) => {
						this.handleErrorMessageBoxPress(oEvent, "Compensation Parameter could not be deleted");
					}
				});
			}
		},
		
		addNewCompElement: function(oEvent) {
			this.setCompElementModel("newCompElement");
			this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.NewCompensationElementDialog%_newCompElement");
		},
		
		onSaveNewCompElement: function(oEvent) {
			var oModel = this.getModel("newCompElement").getData();
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			var year = this.getModel("global").getProperty("/selectedRM/year");
			
			this.getModel().create("/CompElementSet", oModel, {
				success: (data) => {
					this.loadCompensationElements(year, unumber);
					this.onGenericFragmentclose(oEvent, "_newCompElement");
					this.showMessage("Compensation Element successfully created!");
					this.setCompElementModel("newCompElement");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Compensation Element could not be created");
				}
			});
		},
		
		onDeleteCompElement: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndices = oTable.getSelectedIndices();

			selectedIndices.forEach((rowNumber) => {
				var oDeletedValue = oTable.getContextByIndex(rowNumber).getObject();
				this.deleteCompElement(oDeletedValue, oEvent);
			});
		},
		
		onCompElementChanged: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var index = oEvent.getSource().getParent().getIndex();
			var oModel = oTable.getContextByIndex(index).getObject();
			var sUpdatePath = "rm='" + oModel.rm + "',year='" + oModel.year + "',element='" + oModel.element + "'";
			
			this.getModel().update("/CompElementSet(" + sUpdatePath + ")", oModel, {
				success: (data) => {
					this.showMessage("Compensation Element successfully updated!");
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Compensation Element could not be updated");
				}
			});
			
		},
		
		deleteCompElement: function(oModel, oEvent) {
			var year = oModel.year;
			var unumber = oModel.rm;
			var element = oModel.element;
			
			var sUpdatePath = "rm='" + unumber + "',year='" + year + "',element='" + element + "'";
			
			this.getModel().remove("/CompElementSet(" + sUpdatePath + ")", {
				success: (data) => {
					this.showMessage("Compensation Element successfully deleted!");
					this.loadCompensationElements(year, unumber);
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Compensation Element could not be deleted");
				}
			});
		},
		
		onLosEntrySelected : function(oEvent) {
			var selected = oEvent.getParameter("selected");
			
			if (!selected) {
				var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
				var year = this.getModel("global").getProperty("/selectedRM/year");
				var oProfileModel = this.getModel("global").getProperty("/compensationProfile");
				oProfileModel.losdate = "";
				
				var sUpdatePath = "unumber='" + unumber + "',year='" + year + "'";
				
				this.getModel().update("/CompensationProfileSet(" + sUpdatePath + ")", oProfileModel, {
					success: (data) => {
						this.showMessage("Compensation Profile successfully updated!");
						this.loadCompensationProfile(year, unumber);
					},
					error: (oError) => {
						this.handleErrorMessageBoxPress(oEvent, "Compensation Profile could not be updated");
					}
				});
			}
		},
		
		onContactExceptionSelected : function(oEvent) {
			var selected = oEvent.getParameter("selected");
			
			if (!selected) {
				var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
				var year = this.getModel("global").getProperty("/selectedRM/year");
				var oModel = this.getModel("global").getProperty("/relationshipManager");
				oModel.approvemgr = "";
				
				var sUpdatePath = "unumber='" + unumber + "',year='" + year + "'";
				
				this.getModel().update("/RelationshipManagerSet(" + sUpdatePath + ")", oModel, {
					success: (data) => {
						this.showMessage("Contact successfully updated!");
						this.loadCompensationProfile(year, unumber);
					},
					error: (oError) => {
						this.handleErrorMessageBoxPress(oEvent, "Contact could not be updated");
					}
				});
			}
		},
		
		onNavToPoolProfile: function(oEvent) {
			var poolNr = oEvent.getSource().getText();
			var year = this.getModel("global").getProperty("/selectedRM/year");
			this.getRouter().navTo("poolWithPoolNr", {pool: poolNr, year: year});
		},
		
		onNewProfileCancel: function(oEvent) {
			this.onGenericFragmentclose(oEvent, "_noDataDialog");
			this.resetProfileSelection();
			this.resetCompensationProfile();
		},
		
		loadDecentralizedEAMs : function(sYear, sUnumber) {	
			var sPath = "unumber='" + sUnumber + "',year='" + sYear + "'";
			
			this.getView().bindElement(
					{						
						path : "/CompensationProfileSet(" + sPath + ")",
						parameters : {						
							expand: "RmDecEam,RmMTA"
						},
						events : {
							dataReceived: (oEvent) => {
								var receivedData = oEvent.getParameters().data;
								this.getModel("global").setProperty("/decentralizedEAMs/length", receivedData.RmDecEam.length);
								this.getModel("global").setProperty("/decEAMsPeriodBusy", false);
								this.getModel("global").setProperty("/RmMTA", receivedData.RmMTA.Percentage);
							}
						}
				});
		},
		
		onSaveMTA: function(oEvent) {
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			var year = this.getModel("global").getProperty("/selectedRM/year");
			var sUpdatePath = "unumber='" + unumber + "',year='" + year + "'";
			var value = this.getModel("global").getProperty("/RmMTA");
			
			if (value === "" || value === "0") {
				this.getModel().remove("/MTASet(" + sUpdatePath + ")", {
					success: (data) => {
						this.showMessage("MTA successfully deleted!");
						this.loadDecentralizedEAMs(year, unumber);
					},
					error: (oError) =>{
						this.handleErrorMessageBoxPress(oEvent, "MTA could not be deleted");
					}
				});
			} else {
				var oMtaModel = {
						"Percentage": value,
						"unumber": unumber,
						"year": year
				}
				
				this.getModel().update("/MTASet(" + sUpdatePath + ")", oMtaModel, {
					success: (data) => {
						this.showMessage("MTA successfully updated!");
						this.loadDecentralizedEAMs(year, unumber);
					},
					error: (oError) => {
						this.handleErrorMessageBoxPress(oEvent, "MTA could not be updated");
					}
				});
			}
		},
		
		onSaveNonFinancialGoal: function(oEvent) {
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			var year = this.getModel("global").getProperty("/selectedRM/year");
			var sUpdatePath = "rm='" + unumber + "',year='" + year + "'";
			var value = this.getModel("global").getProperty("/nonFinGoal");
			
			var oNonFinGoalModel = {
					"Rating": value,
					"rm": unumber,
					"year": year
			}
			
			this.getModel().update("/NonFinancialGoalSet(" + sUpdatePath + ")", oNonFinGoalModel, {
				success: (data) => {
					this.showMessage("Non-Financial Goal updated!");
					this.loadNonFinancialGoal(year, unumber);
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Non-Financial Goal could not be updated");
				}
			});
			
		},
		
		onKRIExceptionSelected: function(oEvent) {
			var selected = oEvent.getParameter("selected");
			
			if (!selected) {
				var oTable = oEvent.getSource().getParent().getParent();
				var index = oEvent.getSource().getParent().getIndex();
				var oModel = oTable.getContextByIndex(index).getObject();

				var sUpdatePath = "rm='" + oModel.rm + "',year='" + oModel.year + "',Topic='" + oModel.Topic + "'";
				
				this.getModel().remove("/KRIResultSet(" + sUpdatePath + ")", {
					success: (data) => {
						this.showMessage("KRI Result successfully deleted!");
						this.loadKRIResult(year, unumber);
					},
					error: (oError) => {
						this.handleErrorMessageBoxPress(oEvent, "KRI Result could not be deleted");
					}
				});
			}
		},
		
		onKriResultDeductionChanged: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var index = oEvent.getSource().getParent().getIndex();
			var oModel = oTable.getContextByIndex(index).getObject();
			var sUpdatePath = "rm='" + oModel.rm + "',year='" + oModel.year + "',Topic='" + oModel.Topic + "'";
			
			this.getModel().update("/KRIResultSet(" + sUpdatePath + ")", oModel, {
				success: (data) => {
					this.showMessage("KRI Result successfully updated!");
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "KRI Result could not be updated");
				}
			});
		},
		
		onSavePolicyProcedures: function(oEvent) {
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			var year = this.getModel("global").getProperty("/selectedRM/year");
			var sUpdatePath = "rm='" + unumber + "',year='" + year + "'";
			var value = this.getModel("global").getProperty("/policyProcedureDeduction");
			
			if (value === "" || value === "0") {
				this.getModel().remove("/PolicyAndProcedureViolationSet(" + sUpdatePath + ")", {
					success: (data) => {
						this.showMessage("Policy & Procedure Violation sucessfully deleted!");
						this.loadPolicyProcedures(year, unumber);
					},
					error: (oError) =>{
						this.handleErrorMessageBoxPress(oEvent, "Policy & Procedure Violation not be deleted");
					}
				});
			} else {
				var oPolicyModel = {
						"Deduction": value,
						"rm": unumber,
						"year": year,
						"Unit": "%"
				}
				
				this.getModel().update("/PolicyAndProcedureViolationSet(" + sUpdatePath + ")", oPolicyModel, {
					success: (data) => {
						this.showMessage("Policy & Procedure Violation updated!");
						this.loadPolicyProcedures(year, unumber);
					},
					error: (oError) => {
						this.handleErrorMessageBoxPress(oEvent, "Policy & Procedure Violation not be updated");
					}
				});
			}
			
			this.onGenericFragmentclose(oEvent, "_policyProcedureDialog");
		},
		
		onSaveTeamHeadKRI: function(oEvent) {
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			var year = this.getModel("global").getProperty("/selectedRM/year");
			var sUpdatePath = "rm='" + unumber + "',year='" + year + "'";
			var value = this.getModel("global").getProperty("/thKRIDeduction");
			
			if (value === "" || value === "0") {
				this.getModel().remove("/TeamHeadKRISet(" + sUpdatePath + ")", {
					success: (data) => {
						this.showMessage("Team Head KRI sucessfully deleted!");
						this.loadTeamHeadKRI(year, unumber);
					},
					error: (oError) =>{
						this.handleErrorMessageBoxPress(oEvent, "Team Head KRI not be deleted");
					}
				});
			} else {
				var oPolicyModel = {
						"Deduction": value,
						"rm": unumber,
						"year": year,
						"Unit": "%"
				}
				
				this.getModel().update("/TeamHeadKRISet(" + sUpdatePath + ")", oPolicyModel, {
					success: (data) => {
						this.showMessage("Team Head KRI successfully updated!");
						this.loadTeamHeadKRI(year, unumber);
					},
					error: (oError) => {
						this.handleErrorMessageBoxPress(oEvent, "Team Head KRI not be updated");
					}
				});
			}
			
			this.onGenericFragmentclose(oEvent, "_teamHeadKriDialog");
		},
		
		updateMilestone: function(oModel, oEvent) {
			var sUpdatePath = "rm='" + oModel.rm + "',year='" + oModel.year + "',Id='" + oModel.Id + "'";
			oModel.Period = this.writeBackFormatTransferPeriods(oModel.PeriodExt);
			
			this.getModel().update("/MilestoneSet(" + sUpdatePath + ")", oModel, {
				success: (data) => {
					this.showMessage("Milestone successfully updated!");
					this.loadMilestones(oModel.rm);
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Milestone could not be updated");
				}
			});
		},
		
		onMilestoneChange: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndex = oTable.getSelectedIndex();
			var selectedData = oTable.getContextByIndex(selectedIndex).getObject();
			this.getView().setModel(new JSONModel(selectedData), "editMilestone");
			this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.EditMilestoneDialog%_editMilestoneDialog");
		},
		
		onEditMilestone: function(oEvent) {
			var oModel = this.getModel("editMilestone").getData();
			this.updateMilestone(oModel, oEvent);
			this.onGenericFragmentclose(oEvent, "_editMilestoneDialog");
		},
		
		onMilestoneRowSelected: function(oEvent) {
			sap.ui.getCore().byId("milestoneConditionsTable").unbindRows();
			var selectedIndex = oEvent.getParameter("rowIndex");
			var oTable = oEvent.getSource();
			var selectedData = oTable.getContextByIndex(selectedIndex).getObject();
			this.getModel("global").setProperty("/selectedMilestoneId", selectedData.Id);
			this.getModel("global").setProperty("/milestoneButtonsVisible", true);
			var aTmp = selectedData.MilestoneConditions.__deferred.uri.split("/");
			var sEntityPath = aTmp[8];
			var sExpand = aTmp[9];
			sap.ui.getCore().byId("milestoneConditionsTable").bindRows("/" + sEntityPath + "/" + sExpand);
		},
		
		onMilestoneDelete: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndices = oTable.getSelectedIndices();

			selectedIndices.forEach((rowNumber) => {
				var oDeletedValue = oTable.getContextByIndex(rowNumber).getObject();
				this.deleteMilestone(oDeletedValue, oEvent);
			});
		},
		
		deleteMilestone: function(oModel, oEvent) {
			var sUpdatePath = "rm='" + oModel.rm + "',year='" + oModel.year + "',Id='" + oModel.Id + "'";
			
			this.getModel().remove("/MilestoneSet(" + sUpdatePath + ")", {
				success: (data) => {
					this.showMessage("Milestone sucessfully deleted!");
					this.loadMilestones(oModel.rm);
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Milestone not be deleted");
				}
			});
		},
		
		onMilestoneConditionRowSelected: function(oEvent) {
			this.getModel("global").setProperty("/conditionVisible", true);
		},
		
		updateMilestoneCondition: function(oModel, oEvent) {
			var sUpdatePath = "rm='" + oModel.rm + "',year='" + oModel.year + "',Id='" + oModel.Id + "',Condition='" + oModel.Condition + "'";
			
			this.getModel().update("/MilestoneConditionSet(" + sUpdatePath + ")", oModel, {
				success: (data) => {
					this.showMessage("Milestone Condition successfully updated!");
					this.loadMilestones(oModel.rm);
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Milestone Condition not be updated");
				}
			});
		},
		
		onMilestoneConditionChange: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndex = oTable.getSelectedIndex();
			var selectedData = oTable.getContextByIndex(selectedIndex).getObject();
			this.getView().setModel(new JSONModel(selectedData), "editMilestoneCondition");
			this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.EditMilestoneConditionDialog%_editMilestoneConditionDialog");
		},
		
		onMilestoneCheckboxSelected: function(oEvent) {
			var index = oEvent.getSource().getParent().getIndex();
			var oModel = oEvent.getSource().getParent().getParent().getContextByIndex(index).getObject();
			this.updateMilestone(oModel, oEvent);
		},
		
		onEditMilestoneCondition: function(oEvent) {
			var oModel = this.getModel("editMilestoneCondition").getData();
			this.updateMilestoneCondition(oModel, oEvent);
			this.onGenericFragmentclose(oEvent, "_editMilestoneConditionDialog");
		},
		
		onMilestoneConditionDelete: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndices = oTable.getSelectedIndices();

			selectedIndices.forEach((rowNumber) => {
				var oDeletedValue = oTable.getContextByIndex(rowNumber).getObject();
				this.deleteMilestoneCondition(oDeletedValue, oEvent);
			});
		},
		
		deleteMilestoneCondition: function(oModel, oEvent) {
			var sUpdatePath = "rm='" + oModel.rm + "',year='" + oModel.year + "',Id='" + oModel.Id + "',Condition='" + oModel.Condition + "'";
			
			this.getModel().remove("/MilestoneConditionSet(" + sUpdatePath + ")", {
				success: (data) => {
					this.showMessage("Milestone Condition sucessfully deleted!");
					this.loadMilestones(oModel.rm);
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Milestone Condition not be deleted");
				}
			});
		},
		
		onSaveNewMilestone: function(oEvent) {
			var oModel = this.getModel("newMilestone").getData();
			
			this.getModel().create("/MilestoneSet", oModel, {
				success: (data) => {
					this.loadMilestones(oModel.rm);
					this.onGenericFragmentclose(oEvent, "_newMilestoneDialog");
					this.showMessage("Milestone successfully created!");
					this.setMilestonesModel("newMilestone");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Milestone could not be created");
				}
			});
		},
		
		onSaveNewMilestoneCondition : function(oEvent) {
			var oModel = this.getModel("newMilestoneCondition").getData();
			
			this.getModel().create("/MilestoneConditionSet", oModel, {
				success: (data) => {
					this.loadMilestones(oModel.year, oModel.rm);
					this.onGenericFragmentclose(oEvent, "_newMilestoneConditionDialog");
					this.showMessage("Milestone Condition successfully created!");
					this.setMilestonesConditionModel("newMilestoneCondition");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Milestone Condition could not be created");
				}
			});
		},
		
		onMilestoneConditionCheckboxSelected: function(oEvent) {
			var index = oEvent.getSource().getParent().getIndex();
			var oModel = oEvent.getSource().getParent().getParent().getContextByIndex(index).getObject();
			this.updateMilestoneCondition(oModel, oEvent);
		},
		
		onSaveConductAssessment: function(oEvent) {
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			var year = this.getModel("global").getProperty("/selectedRM/year");
			var aValues = this.getModel("global").getProperty("/conductAssessment");
			var oModel = {};
			Object.assign(oModel, aValues);
			
			var sUpdatePath = "rm='" + unumber + "',year='" + year + "'";
			
			this.getModel().update("/ConductAssessmentSet(" + sUpdatePath + ")", oModel, {
				success: (data) => {
					this.showMessage("Conduct Assessment successfully updated!");
					this.onGenericFragmentclose(oEvent, "_conductAssessmentDialog");
					this.loadConductAssessment(oModel.year, oModel.rm);
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Conduct Assessment not be updated");
				}
			});
		}
	});
});