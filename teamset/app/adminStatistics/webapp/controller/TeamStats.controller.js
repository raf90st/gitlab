sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v4/ODataListBinding",
    "sap/ui/core/UIComponent"

], function(Controller, JSONModel, ODataListBinding, UIComponent) {
    "use strict";

    return Controller.extend("adminStatistics.controller.TeamStats", {
        onInit: function() {
            this.getRouter().getRoute("teamStatistics").attachMatched(this._onRouteMatched, this);
        },

        getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		getCurrentTableObject: function (oEvent) {
			return oEvent.getSource().getParent().getBindingContext().getObject();
		},

        _onRouteMatched: function(oEvent) {
            var matchId = oEvent.getParameter("arguments").matchId;
            var sCompletePath = "/MatchStatistics('" + matchId + "')";
            //this.byId("teamStatsTable").bindRows(sCompletePath);
            this.getView().bindElement(
				{
					path: sCompletePath,
					/*parameters : {						
						expand: "TeamStatistic"
					},*/
					events: {
						dataRequested: () => {
						},
						dataReceived: (oEvent) => {
						}
					}
				}
			);
        },

        playerStatisticSelected: function (oEvent, sKey) {
            var oTableObject = this.getCurrentTableObject(oEvent);
            var matchId = oTableObject.Match_MatchId;
            var teamId = oTableObject.TeamId;
            this.getRouter().navTo(sKey, {matchId: matchId, teamId: teamId});
        }

    });
});