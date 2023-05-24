sap.ui.define([
	"juliusbaer/ipl/controller/BaseController",
	"sap/ui/core/mvc/Controller",
	"juliusbaer/ipl/model/formatter",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function(BaseController, Controller, formatter, History, UIComponent, JSONModel, Filter, FilterOperator, MessageToast, MessageBox) {
	"use strict";

	return BaseController.extend("juliusbaer.ipl.controller.ItemCategorization", {

		formatter: formatter,
		
		onInit: function () {
			this.getRouter().getRoute("itemCat").attachMatched(this._onRouteMatched, this);
		},
	
		_onRouteMatched: function() {
			//this.setNavToCurrentHash();
		},
		
		onCategorizationConfirm: function(oEvent) {
			this.getModel().callFunction('/confirmItemCat', {
				method: 'GET',
				success: (data) => {
					this.getItemCatButtonConfirm();
					this.getFiscPer();
					this.getOverviewTileInformation();
				},
				error: (oError) => {
					
				}			
			})
		},
		
		onCategorizationRelease: function(oEvent) {
			this.getModel().callFunction('/releaseItemCat', {
				method: 'GET',
				success: (data) => {
					this.getItemCatButtonConfirm();
					this.getFiscPer();
					this.getOverviewTileInformation();
				},
				error: (oError) => {
					
				}			
			})
		},
		
		onPressItemCatChange: function(oEvent) {
			var itemIndex = oEvent.getSource().getParent().getIndex();
			var itemModel = oEvent.getSource().getParent().getParent().getContextByIndex(itemIndex);
			var itemObject = itemModel.getObject();
			this.getModel("global").setProperty("/selectedItemForCatChange", itemObject.CS_ITEM);
			this.onGenericFragmentLoad(oEvent, "juliusbaer.ipl.fragment.dialog.ItemCategorizationDialog%_itemCatDialog");
		},
		
		onCategorizationChangeConfirm(oEvent) {
			var selectedItem = oEvent.getParameter("selectedItem").getDescription();
			var selectedItemTitle = oEvent.getParameter("selectedItem").getTitle();
			var selectedItemId = this.getModel("global").getProperty("/selectedItemForCatChange");
			//this.onGenericFragmentclose(oEvent, "_itemCatDialog");
			
			this.getModel().callFunction('/changeItemCategory', {
				method: 'POST',
				urlParameters: {
					item: selectedItem,
					itemTxt: selectedItemTitle,
					itemId: selectedItemId
				},
				success: (data) => {
					this.showMessage("Category Successfully changed!");
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress("Category could not be changed");
				}		
			})
		}
	});
});