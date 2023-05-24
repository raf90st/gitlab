sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v4/ODataListBinding",
    "sap/ui/core/UIComponent"

], function(Controller, JSONModel, ODataListBinding, UIComponent) {
    "use strict";

    return Controller.extend("adminStatistics.controller.Admin", {
        onInit: function() {
            this.getView().setModel(new JSONModel({
                searchName: ""
            }), "global");
        },

        getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		getCurrentTableObject: function (oEvent) {
			return oEvent.getSource().getParent().getBindingContext().getObject();
		},

        getData: function() {
            //var data = this.getView().getModel('selections').getProperty('/mode');
            //this.getOwnerComponent().onOpenDialog();
            /*var message = new Waitmessage(this.getView());
            message.onOpenDialog();*/
            //console.log('Data: ' + data);
            this.shouldRefreshLogs = true;
            this.getView().byId("MatchStatisticSmartTable").getObjectBinding().execute().then(() => {
                //var oBinding = this.byId("logsTable").getBinding("items");
                if (oBinding) oBinding.refresh();
            }).catch((err) => {
                
            });
        },

        teamStatisticSelected: function (oEvent, sKey) {
            var oTableObject = this.getCurrentTableObject(oEvent);
            var matchId = oTableObject.MatchId;
            this.getRouter().navTo(sKey, {matchId: matchId});
        }

    });
});