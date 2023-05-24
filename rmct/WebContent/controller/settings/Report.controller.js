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
	
	return BaseController.extend("juliusbaer.rmct.controller.settings.Report", {
		formatter: formatter,

		onInit: function () {		
			this.getRouter().getRoute("reports").attachMatched(this._onRouteMatched, this);
			this.getRouter().getRoute("mainITA").attachMatched(this._onMaintainITARouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
			this.setActualYear("/selectedReport/year");
		},
		
		_onMaintainITARouteMatched: function (oEvent) {
			this.setActualYear("/selectedMaintainITA/year");
			var year = this.getModel("global").getProperty("/selectedMaintainITA/year");
			this.loadMaintainableITAs(oEvent, year);
		},
		
		onMaintainITASelectedYearChanged: function (oEvent) {
			var year = oEvent.getSource().getSelectedKey();
			this.loadMaintainableITAs(oEvent, year);
		},
			
		loadMaintainableITAs: function (oEvent, sYear) {
			this.getModel("global").setProperty("/selectedMaintainITA/ITAsBusy", true);
			var aFilters = [];
			var yearFilter = new Filter('year','EQ', sYear);
			aFilters.push(yearFilter);
			
			this.getView().getModel().read("/TransferredAccountsSet", {
				filters: aFilters,
				success: (data) => {
					this.getModel("global").setProperty("/maintainTransferredAccounts", data.results);
					this.getModel("global").setProperty("/selectedMaintainITA/ITAsBusy", false);
				}
			})
		},
		
		buildExcelFile: function(sPath, sKey, oEvent) {
			this.getModel("global").setProperty("/selectedReport/busyWithCsv", true);
			var year = this.getModel("global").getProperty("/selectedReport/year");
			var aFilters = [];
			var yearFilter = new Filter('year','EQ', year);
			aFilters.push(yearFilter);
			
			this.getView().getModel().read(sPath, {
				filters: aFilters,
				success: (data) => {
					var aColumns = this.getModel("reports").getProperty("/" + sKey);
					var oData = data.results;
					var oModel = new JSONModel({});
					oModel.setData(oData);
					
					var aColumnObjects = [];
					
					for (var i = 0; i < aColumns.length; i++) {
						var oColumn = new ExportColumn({
							name: aColumns[i].name,
							template: new ExportCell({
								content: aColumns[i].content
							})
						})
						
						aColumnObjects.push(oColumn);
					}
					
					var oExport = new Export({

						exportType: new ExportTypeCSV({
							fileExtension: "csv",
							separatorChar: ";"
						}),

						models: oModel,

						rows: {
							path: "/"
						},
						
						columns: aColumnObjects
					});

					oExport.saveFile().catch(function(oError) {

					}).then(function() {
						oExport.destroy();
					});
					
					this.getModel("global").setProperty("/selectedReport/busyWithCsv", false);
				},
				
				error: (error) => {
					this.handleErrorMessageBoxPress(oEvent, "Selected Report could not be generated");
					this.getModel("global").setProperty("/selectedReport/busyWithCsv", false);
				}
			})
		},
		
		downloadCSVForReports: function(oEvent) {
			var sKey = oEvent.getSource().getId();
			
			switch (sKey) {
				case "juliusbaer.rmct---reports--decEAM":
					this.buildExcelFile("/DecEAMSet", sKey, oEvent);
					break;
				case "juliusbaer.rmct---reports--simLog":
					this.buildExcelFile("/SimToolLogSet", sKey, oEvent);
					break;
				case "juliusbaer.rmct---reports--bc":
					this.buildExcelFile("/BusinessCaseSet", sKey, oEvent);
					break;
				case "juliusbaer.rmct---reports--kpi":
					this.buildExcelFile("/KPIExceptionsSet", sKey, oEvent);
					break;
				case "juliusbaer.rmct---reports--ltdKpi":
					this.buildExcelFile("/LimitedKPIRecognitionSet", sKey, oEvent);
					break;
				case "juliusbaer.rmct---reports--simKPI":
					this.buildExcelFile("/SimToolKPISet", sKey, oEvent);
					break;
				case "juliusbaer.rmct---reports--excl":
					this.buildExcelFile("/ExclusionsSet", sKey, oEvent);
					break;
				case "juliusbaer.rmct---reports--ita":
					this.buildExcelFile("/TransferredAccountsSet", sKey, oEvent);
					break;
				case "juliusbaer.rmct---reports--prosp":
					this.buildExcelFile("/ProspectSet", sKey, oEvent);
					break;
				case "juliusbaer.rmct---reports--cpo":
					this.buildExcelFile("/PoolReportSet", sKey, oEvent);
					break;
				case "juliusbaer.rmct---reports--ce":
					this.buildExcelFile("/CompElementSet", sKey, oEvent);
					break;
				case "juliusbaer.rmct---reports--mile":
					this.buildExcelFile("/MilestoneSet", sKey, oEvent);
					break;
				case "juliusbaer.rmct---reports--pList":
					this.buildExcelFile("/PayoutSet", sKey, oEvent);
					break;
				case "juliusbaer.rmct---reports--fxr":
					this.buildExcelFile("/ExchangeRateSet", sKey, oEvent);
					break;
				case "juliusbaer.rmct---reports--kri":
					this.buildExcelFile("/KRIDeductionSet", sKey, oEvent);
					break;
				case "juliusbaer.rmct---reports--access":
					this.buildExcelFile("/AccessMonitoringSet", sKey, oEvent);
					break;
				case "juliusbaer.rmct---reports--perf":
					this.buildExcelFile("/PerformanceSet", sKey, oEvent);
					break;
				case "juliusbaer.rmct---reports--params":
					this.buildExcelFile("/ParameterReportSet", sKey, oEvent);
					break;
				case "juliusbaer.rmct---reports--scApp":
					this.buildExcelFile("/ScorecardApprovalSet", sKey, oEvent);
					break;
				default:
					break;
			}
		},
		
		onNewMaintainITA: function(oEvent) {
			this.setItaModel("newITA", "mainITA");
			this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.NewMaintainTransferredAccount%_newMaintainTransferredAccountsDialog");
		},
		
		onSaveNewMainTransferredAccount : function(oEvent) {
			var oModel = this.getModel("newITA").getData();
					
			oModel.period = this.writeBackFormatTransferPeriods(oModel.periodExt);
			
			this.getModel().create("/TransferredAccountsSet", oModel, {
				success: (data) => {
					this.onGenericFragmentclose(oEvent, "_newMaintainTransferredAccountsDialog");
					this.showMessage("Transferred Account successfully created!");
					this.setItaModel("newITA", "mainITA");
				},
				error: (oError) =>{
					this.handleErrorMessageBoxPress(oEvent, "Transferred Account could not be saved");
				}
			});
		},
		
		onMainItaModified : function(oEvent) {
			var index = oEvent.getSource().getParent().getIndex();
			var oModel = oEvent.getSource().getParent().getParent().getContextByIndex(index).getObject();
			
			oModel.period = this.writeBackFormatTransferPeriods(oModel.periodExt);
			
			var sUpdatePath = "unumber='" + oModel.unumber + "',year='" + oModel.year + "',zr='" + oModel.zr + "'";
			
			this.getModel().update("/TransferredAccountsSet(" + sUpdatePath + ")", oModel, {
				success: (data) => {
					this.showMessage("Transferred Accounts successfully updated!");
//					this.loadMaintainableITAs(oEvent, oModel.year);
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Transferred Account could not be updated");
				}
			});
		},
		
		onTpChangeMainIta: function (oEvent, oModel) {
			var sUpdatePath = "unumber='" + oModel.unumber + "',year='" + oModel.year + "',zr='" + oModel.zr + "'";
			
			oModel.period = this.writeBackFormatTransferPeriods(oModel.periodExt);
			
			this.getModel().update("/TransferredAccountsSet(" + sUpdatePath + ")", oModel, {
				success: (data) => {
					this.showMessage("Transferred Accounts successfully updated!");
//					this.loadMaintainableITAs(oEvent, oModel.year);
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Internally Transferred Account not be updated");
				}
			});
		},
		
		downloadAccruals: function(oEvent) {
			var selectedYear = this.getModel("global").getProperty("/selectedReport/year");
			
			this.getView().getModel().read("/AccrualsSet(year='" + selectedYear + "')", {
				success: (data) => {
					this.openUrl(data.URL, true);
				}
			})
		},
		
		onItaRefresh: function(oEvent){
			var year = this.getModel("global").getProperty("/selectedMaintainITA/year");
			this.loadMaintainableITAs(oEvent, year);
		}

	});
});