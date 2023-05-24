sap.ui.define([
	"./BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("teamfact.app.controller.Manager", {

		onInit : function () {
			// apply content density mode to root view
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
            
            // attach method "_onRouteMatched" to route "manager"
            this.getRouter().getRoute("manager").attachPatternMatched(this._onRouteMatched, this);
        },       
        
        /**
		 * Binds the view for the correct manager (based on manager id in URL)
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'manager'
		 * @private
		 */
        _onRouteMatched: function (oEvent) {
            this.sManagerId = oEvent.getParameter("arguments").managerId;            
            // get Team and Contest data from the Manager
            this.getView().bindElement("/Managers(" + this.sManagerId + ")", {expand:"Contest"});
        },

        onPressTile: function (oEvent) {
            // get Team ID
            var oTeam = oEvent.getSource().getBindingContext().getObject();
            // build routing to Team Planner 
            this.getRouter().navTo("team",{managerId:this.sManagerId, teamId:oTeam.ID});
        },

        onNavToAthletes : function (oEvent){
			var oItem = oEvent.getSource();
			var oContext = oItem.getBindingContext();
            /*
            this.getRouter().navTo("athletes",{
                token : oContext.getProperty("Token"),
				teamId : oContext.getProperty("TeamID")
            });
            */
        }
	});

});