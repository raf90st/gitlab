sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v4/ODataListBinding",
    "sap/ui/core/UIComponent"

], function(Controller, JSONModel, ODataListBinding, UIComponent) {
    "use strict";

    return Controller.extend("adminStatistics.controller.PlayerStats", {
        onInit: function() {
            this.getRouter().getRoute("playerStatistics").attachMatched(this._onRouteMatched, this);
        },

        getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		getCurrentTableObject: function (oEvent) {
			return oEvent.getSource().getParent().getBindingContext().getObject();
		},

        _onRouteMatched: function(oEvent) {
            var matchId = oEvent.getParameter("arguments").matchId;
            var teamId = oEvent.getParameter("arguments").teamId;
            var sCompletePath = "/MatchStatistics('" + matchId + "')/TeamStatistic('" + teamId + "')";
            this.getView().bindElement(
				{
					path: sCompletePath,
					/*parameters : {						
						expand: "TeamStatistic,PlayerStatistic"
					},*/
					events: {
						dataRequested: () => {
						},
						dataReceived: (oEvent) => {
						}
					}
				}
			);
        }

    });
});