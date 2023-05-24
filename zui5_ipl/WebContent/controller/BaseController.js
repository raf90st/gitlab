sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/core/Fragment",
	"sap/m/Label",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/HTML",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/type/String",
	"sap/m/Token",
	"sap/m/StandardListItem",
	"sap/ui/core/library"
], function(Controller, UIComponent, Fragment, Label, Filter, FilterOperator, JSONModel, HTML, MessageToast, MessageBox, 
	NumberFormat, typeString, Token, StandardListItem, CoreLibrary) {
	"use strict";
	
	return Controller.extend("juliusbaer.ipl.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * 
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter : function () {
			return UIComponent.getRouterFor(this)
		},

		/**
		 * Convenience method for getting the view model by name.
		 * 
		 * @public
		 * @param {string}
		 *            [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel : function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * 
		 * @public
		 * @param {sap.ui.model.Model}
		 *            oModel the model instance
		 * @param {string}
		 *            sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel : function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},
		
		getFiscPer: function() {
			this.getView().getModel().read("/FiscperHierarchySet", {
				success: (data) => {
					this.getModel("global").setProperty("/releasePeriod", data.results[0].period);
					this.getModel("global").setProperty("/releasePeriodTxt", data.results[0].text);
				}
			})
		},
		
		getButtonConfirm: function() {
			this.getView().getModel().read("/ButtonConfirmSet", {
				success: (data) => {
					this.getModel("global").setProperty("/confirmButtonEnabled", data.results[0].enabled);
					this.getModel("global").setProperty("/confirmButtonTxt", data.results[0].text);
					this.getModel("global").setProperty("/confirmedBy", data.results[0].confirmedByTxt);
					this.getModel("global").setProperty("/confirmedOn", data.results[0].confirmedOn);
				}
			})
		},
		
		getItemCatButtonConfirm: function() {
			this.getView().getModel().read("/ItemCatButtonConfirmSet", {
				success: (data) => {
					this.getModel("global").setProperty("/confirmItemCatButtonEnabled", data.results[0].enabled);
					this.getModel("global").setProperty("/confirmItemCatButtonTxt", data.results[0].text);
					this.getModel("global").setProperty("/confirmedItemCatBy", data.results[0].confirmedByTxt);
					this.getModel("global").setProperty("/confirmedItemCatOn", data.results[0].confirmedOn);
				}
			})
		},
		
		getOverviewTileInformation: function() {
			this.getView().getModel().read("/OverviewTilesSet", {
				success: (data) => {
					//this.setOverviewGrid(data.results);
					this.getModel("tiles").setData(data.results);
				}
			})
		},
		
		showMessage: function(sMsg) {
			MessageToast.show(sMsg);
		},
		
		handleErrorMessageBoxPress: function(oEvent, sErrorMsg, oError) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.error(
				sErrorMsg,
				{
					details: oError,
					styleClass: bCompact ? "sapUiSizeCompact" : ""
				}
			);
		},
		
		setNavToCurrentHash: function () {
			const router = this.getRouter();
			var currentHash = router.getHashChanger().getHash().toLowerCase();
			
			if (currentHash === "") {
				this.getModel("side").setProperty("/selectedMenuItem", "ipl");
			} else {
				this.getModel("side").setProperty("/selectedMenuItem", currentHash);
			}
		},
		
		onGenericFragmentLoad: function (oEvent, sXmlPathAndId) {
			var aTmp = sXmlPathAndId.split('%');
			var sXmlPath = aTmp[0];
			var sId = aTmp[1];
			
			if (!this[sId]) {
				this[sId] = sap.ui.xmlfragment(
					sXmlPath,
					this
				);
				this.getView().addDependent(this[sId]);
			}			
			
			this[sId].open();
		},
		
		onGenericFragmentclose: function(oEvent, sId) {
			this[sId].close();
		},
		
		selectAdditionalFilterValue: function (sFilterValue) {
			var sAdditionalFilterValue = "";
			
			switch (sFilterValue) {
				case "B3IS_PLAN":
					sAdditionalFilterValue = "itemMissingPlan";
					break;
				case "ECCS_INC_PLAN":
					sAdditionalFilterValue = "itemMissingECCS";
					break;
				case "has_pc":
					break;
			}
			
			return sAdditionalFilterValue;
		},
		
		onCustomFilterClicked: function(oEvent) {
			var oColumn = oEvent.getSource().getParent().getParent();
			var sFilterProperty = oColumn.getFilterProperty();
			var sFilterAddProperty = this.selectAdditionalFilterValue(sFilterProperty);
			var sTableId = oEvent.getSource().getParent().getParent().getParent().getId();
			var sOptionSelected = oEvent.getSource().getProperty("text");
			var aFilters = [];
			var oItems = this.byId(sTableId).getBinding();
			var oColumnFilter;
			var bFilterValOne = true;
			var bFilterValTwo = true;
			
			switch (sOptionSelected) {
				case "Show All":
					oItems.filter(null);
					oColumn.setFiltered(false);
					return;
				case "Mapped Items":		
					bFilterValOne = true;
					bFilterValTwo = false;
					break;
				case "Unmapped Items":
					bFilterValOne = false;
					bFilterValTwo = false;
					break;
				case "Missing Items":
					bFilterValOne = false;
					bFilterValTwo = true;
					break;
			}
			
			oColumnFilter = new Filter({
				path: sFilterProperty,
				operator: FilterOperator.EQ,
				value1: bFilterValOne,
			});
			
			aFilters.push(oColumnFilter);
			
			if (sFilterAddProperty !== "") {
				oColumnFilter = new Filter({
					path: sFilterAddProperty,
					operator: FilterOperator.EQ,
					value1: bFilterValTwo,
				});
				
				aFilters.push(oColumnFilter);
			}
			
			oItems.filter(aFilters);
			oColumn.setFiltered(true);
		},
			
		refreshTableData: function(sTableId) {
			this.byId(sTableId).getModel().refresh();
		}
	});

});