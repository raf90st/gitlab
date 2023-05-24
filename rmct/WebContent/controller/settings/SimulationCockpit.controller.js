sap.ui.define([
	"juliusbaer/rmct/controller/BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Input",
	"sap/m/CheckBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV"
	
], function(BaseController, Controller, JSONModel, Fragment, Label, Text, Button, Dialog, Input, CheckBox, Filter, FilterOperator, Export, ExportTypeCSV) {
	"use strict";

	return BaseController.extend("juliusbaer.rmct.controller.settings.SimulationCockpit", {

		onInit: function() {
			this.setUserRoleModel();
			this.getRouter().getRoute("simcockpit").attachMatched(this._onRouteMatched, this);
		},
		
		_onRouteMatched: function(oEvent) {
			this.setActualYear("/simCockpitSelectedYear");
			this.loadSimCockpitUsers();
		},
		
		setUserRoleModel: function() {
			var oNewUserRoleModel = new JSONModel({
				"unumber" : "",
				"name": "",
				"accessSim": false,
				"accessCockpit": false,
				"isRM": false,
				"isRMCockpit": false,
				"year": ""
			})
			
			this.getView().setModel(oNewUserRoleModel, "newUserRole");
		},
			
		//@Override from BaseController.js
		_handleUsersValueHelpClose : function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				this.getModel("newUserRole").setProperty("/unumber", oSelectedItem.getDescription());
				this.getModel("newUserRole").setProperty("/name", oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);
		},
				
		onAddNewUserRole: function(oEvent) {
			// create value help dialog
			if (!this._inputNewUserRole) {
				this._inputNewUserRole = sap.ui.xmlfragment(
					"juliusbaer.rmct.fragment.dialogs.NewCockpitSimUserDialog",
					this
				);
				this.getView().addDependent(this._inputNewUserRole);
			}			
				
			this._inputNewUserRole.open();
		},
		
		onCancelNewUserRole : function() {
			if (this._inputNewUserRole) {
				this._inputNewUserRole.close();
				this.setUserRoleModel();
			}
		},
		
		dialogAfterClose: function() {
			this.setUserRoleModel();
		},
		
		//Filter Table
		filterGlobally : function(oEvent, manQuery) {
			var sQuery = "";
			if (manQuery) {
				sQuery = manQuery;
			} else {
				sQuery = oEvent.getParameter("newValue").trim();
			}
			
			this.oGlobalFilter = null;

			if (sQuery) {
				var aFilters = [];
				
				var oNameFilter = new Filter({
					path: "name",
					operator: FilterOperator.Contains,
					value1: sQuery,
					caseSensitive: false
				});
				
				var oUnumberFilter = new Filter({
					path: "unumber",
					operator: FilterOperator.Contains,
					value1: sQuery,
					caseSensitive: false
				});
							
				aFilters.push(oNameFilter);
				aFilters.push(oUnumberFilter);
			
				this.oGlobalFilter = new Filter(aFilters, false);
			}
			this._filter();
		},

		_filter : function() {
			var oFilter = null;

			if (this.oGlobalFilter) {
				oFilter = this.oGlobalFilter;
			}
			this.byId("manageUserRolesTable").getBinding().filter(oFilter);
		},
		
		onRemoveNewUserRole: function() {
			var oTable = this.byId("manageUserRolesTable");
			var selectedIndices = oTable.getSelectedIndices();
			
			var sText = "Are you sure you want to delete selected User Role(s)?";
			
			if (selectedIndices.length > 0) {
				var dialog = new Dialog({
					title: 'Confirm Delete',
					type: 'Message',
					content: new Text({
						text: sText
					}),
					beginButton: new Button({
						text: 'Confirm',
						press: (oEvent) => {
							this.onConfirmDeleteUserRole(oTable, selectedIndices);
							dialog.close();
						}
					}),
					endButton: new Button({
						text: 'Cancel',
						press: (oEvent) => {
							dialog.close();
						}
					}),
					afterClose: (oEvent) => {
						this.byId("manageUserRolesTable").clearSelection();
						dialog.destroy();
					}
				});

				dialog.open();
			}
		},
			
		onSaveNewUserRole: function(oEvent) {
			var oUserRoleModel = this.getModel("newUserRole").getData();
			var selectedYear = this.byId("simCockpitSelectedYear").getSelectedKey();
			var oFilter = new Filter('year','EQ', selectedYear);	
			var oNewUserRole = {};
			Object.assign(oNewUserRole, oUserRoleModel);
			oNewUserRole.year = selectedYear;
			
			this.getModel().create("/SimulationCockpitSet", oNewUserRole, {
				success: (data) => {
					console.log("create Success!");
				},
				error: (oError) =>{
					console.log(oError);
				}
			});
			
			this.loadSimCockpitUsers();
			this.byId("simCockpitSelectedYear").setSelectedKey(selectedYear);
			this.loadSimCockpitUsersWithFilter(oFilter);
			this.byId("searchForSimUsers").setValue(oNewUserRole.name);
			this.filterGlobally(oEvent, oNewUserRole.name);
			this._inputNewUserRole.close();
			this.setUserRoleModel();
			
		},
		
		onConfirmDeleteUserRole: function(oTable, selectedRows) {		
			selectedRows.forEach((rowNumber) => {
				var oDeletedRole = oTable.getContextByIndex(rowNumber).getObject();
				this.onDeleteUserRole(oDeletedRole);
			});
		},
		
		onDeleteUserRole: function(oDeletedRole) {
			var selectedYear = this.byId("simCockpitSelectedYear").getSelectedKey();
			var sUpdatePath = "unumber='" + oDeletedRole.unumber + "'";
			this.getModel().remove("/SimulationCockpitSet(" + sUpdatePath + ")", {
				success: (data) => {
					console.log("delete Success!");
				},
				error: (oError) =>{
					console.log(oError);
				}
			});
			
			var oFilter = new Filter('year','EQ', selectedYear);	
			this.loadSimCockpitUsersWithFilter(oFilter);
			this.byId("searchForSimUsers").setValue("");
			this.oGlobalFilter = null;
			this._filter();
		},
		
		onUserRolesModified: function(oEvent) {
			var oCells = oEvent.getSource().getParent().getCells();
			
			var unumber = oCells[0].getValue();
			var name = oCells[1].getValue();
			var accessSim = oCells[2].getProperty("selected");
			var accessCockpit = oCells[3].getProperty("selected");
			var isRM = oCells[4].getProperty("selected");
			var isRMCockpit = oCells[5].getProperty("selected");
			var year = oCells[6].getValue();
			
			var sUpdatePath = "unumber='" + unumber + "'" ;
				
			var oModifiedModel = {
				"unumber" : unumber,
				"name" : name,
				"accessSim": accessSim,
				"accessCockpit": accessCockpit,
				"isRM": isRM,
				"isRMCockpit": isRMCockpit,
				"year": year
			}
			
			this.getModel().update("/SimulationCockpitSet(" + sUpdatePath + ")", oModifiedModel, {
				success: (data) => {
					console.log("Modify Success!");
				},
				error: (oError) => {
					console.log(oError);
				}
			});
		},
		
		//CSV Export
		onDataExport: function() {

			var oModel = this.getModel();
			
			var oTable = this.byId("manageUserRolesTable");
			var exportData = oTable.exportData();
			
			exportData.getExportType().setSeparatorChar(";");

			exportData.saveFile().catch(function(oError) {

			}).then(function() {
				exportData.destroy();
			});
		},
		
		onOpenChangelogCockpitSim: function() {
			if (!this._changeLogSim) {
				this._changeLogSim = sap.ui.xmlfragment(
					"juliusbaer.rmct.fragment.dialogs.ChangeLogSimCockpitDialog",
					this
				);
				this.getView().addDependent(this._changeLogSim);
			}			
				
			this._changeLogSim.open();
		},
		
		onCLoseSimChangeLogDialog: function() {
			this._changeLogSim.close();
		},
		
		onSimCockpitYearChanged: function (oEvent) {
			var filterYear = oEvent.getSource().getSelectedKey();
			var oFilter = new Filter('year','EQ', filterYear);	
			this.loadSimCockpitUsersWithFilter(oFilter);	
			this.getModel("global").refresh();
		},
		
		onSimCockpitResetYear: function(oEvent) {
			this.byId("simCockpitSelectedYear").setSelectedKey("2021");
			this.loadSimCockpitUsers();
		}
	});

});