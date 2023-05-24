sap.ui.define([
    "./BaseController",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType"
], function (BaseController, MessageToast, Filter, FilterOperator, FilterType) {
	"use strict";

	return BaseController.extend("teamfact.app.controller.ManagerAdmin", {

		onInit : function () {
			// apply content density mode to root view
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
            
            // attach method "_onRouteMatched" to route "manager"
            this.getRouter().getRoute("managerAdmin").attachPatternMatched(this._onRouteMatched, this);
        },       
        
        /**
		 * Binds the view for the correct manager (based on manager id in URL)
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'manager'
		 * @private
		 */
        _onRouteMatched: function (oEvent) {            
        },

        onNew: function (oEvent) {                        
            var oContext = this.getView().byId("idManagersTable").getBinding("items")
                .create({
                    "FirstName" : "",
                    "LastName" : "",
                    "Email" : ""
                });
 
            // Note: This promise fails only if the transient entity is deleted
            oContext.created().then(function () {
                MessageToast.show("Erfolgreich angelegt");
            }, function (oError) {
                MessageToast.show("Es ist ein fehler aufgetreten");                
            });
        },
        
        onFilter : function(oEvent) {
            var sQuery = oEvent.getParameter("query");
            var oContext = this.getView().byId("idTeamsTable").getBinding();
            var oFilter;
            
			if (sQuery) {
				oFilter = new Filter([
					new Filter("Number", FilterOperator.Contains, sQuery),
					new Filter("TeamName", FilterOperator.Contains, sQuery)
                ], false);
               
			} else { // clear filter
                oFilter = null; 
            }
             oContext.filter(oFilter, FilterType.Application);
        },

        onEventComboBoxChanged : function(oEvent) {
            var oView = this.getView(),
			    oComboBox = oEvent.getSource(),
                sSelectedKey = oComboBox.getSelectedKey();                
            
            var oFilter = new Filter("Event_ID", FilterOperator.EQ, sSelectedKey);
            oView.byId("idTeamsTable").getBinding().filter(oFilter, FilterType.Application);            
            oView.byId("idAPITable").getBinding().filter(oFilter, FilterType.Application);
            oView.byId("idContestsTable").getBinding().filter(oFilter, FilterType.Application);
			
        }
        

        


	});

});