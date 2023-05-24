sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v4/ODataListBinding",
    "sap/m/MessageToast"

], function(Controller, JSONModel, ODataListBinding, MessageToast) {
    "use strict";

    return Controller.extend("admin.controller.Admin", {
        onInit: function() {
            this.shouldRefreshLogs = false;

            this.refreshLogs("logsTable");
            this.refreshLogs("statisticsLogsTable");

            this.getView().setModel(new JSONModel({
                clientIdRequired: false,
                statsClientIdRequired: false,
                seasonRequired: false,
                competitionRequired: false,
                clubRequired: false,
                matchRequired: false,
                updateAllData: false,
                selectedSeason: "",
                seasonalMatches: [],
                selectedMatch: ""
            }), "ui");
        },

        refreshLogs: function(sTableId) {
            if (this.shouldRefreshLogs) {
                var oBinding = this.byId(sTableId).getBinding("items");
                if (oBinding) oBinding.refresh();
            }
            setTimeout(() => {
                this.refreshLogs(sTableId);
            }, 2000);
        },

        getData: function() {
            //var data = this.getView().getModel('selections').getProperty('/mode');
            //this.getOwnerComponent().onOpenDialog();
            /*var message = new Waitmessage(this.getView());
            message.onOpenDialog();*/
            //console.log('Data: ' + data);
            this.shouldRefreshLogs = true;
            this.getView().byId("getDataForApi").getObjectBinding().execute().then(() => {
                var oBinding = this.byId("logsTable").getBinding("items");
                if (oBinding) oBinding.refresh();
                this.shouldRefreshLogs = false;
            }).catch((err) => {
                this.shouldRefreshLogs = false;
            });
        },

        getStatisticsData: function() {
            this.shouldRefreshLogs = true;

            this.getView().byId("getStatisticsForApi").getObjectBinding().execute().then(() => {
                var oBinding = this.byId("statisticsLogsTable").getBinding("items");
                if (oBinding) oBinding.refresh();
                this.shouldRefreshLogs = false;
            }).catch((err) => {
                this.shouldRefreshLogs = false;
            });
        },

        onServiceSelected: function(oEvent) {
            var aParams = oEvent.getSource().getSelectedItem().getCustomData();
            var oUIModel = this.getView().getModel('ui');
            oUIModel.setProperty('/seasonRequired', aParams[0].getValue());
            if (aParams[0].getValue()) {
                this.byId('seasonIdDd').getBinding('items').refresh();
            }
            oUIModel.setProperty('/competitionRequired', aParams[1].getValue());
            if (aParams[1].getValue()) {
                this.byId('compIdDd').getBinding('items').refresh();
            }
            oUIModel.setProperty('/clubRequired', aParams[2].getValue());
            if (aParams[2].getValue()) {
                this.byId('clubIdDd').getBinding('items').refresh();
            }
        },

        onStatisticsServiceSelected: function(oEvent) {
            var oSelectedItem = oEvent.getSource().getSelectedItem();
            var aParams = oSelectedItem.getCustomData();
            var oUIModel = this.getView().getModel('ui');
            oUIModel.setProperty('/matchRequired', aParams[0].getValue());
            this.byId("seasonSelect").setVisible(false);

            if (oSelectedItem.getText() === "Matchstatistik") {
                this.byId("seasonSelect").setVisible(true);
            }
            
            /*if (aParams[0].getValue()) {
                this.byId('matchIdDd').getBinding('items').refresh();
            }*/
        },

        onModeChange: function(oEvent) {
            var selectedMode = oEvent.getParameter("selectedItem").getKey();
            this.getView().getModel("ui").setProperty("/clientIdRequired", selectedMode === '2')
        },

        onStatisticModeChange: function(oEvent) {
            var selectedMode = oEvent.getParameter("selectedItem").getKey();
            this.getView().getModel("ui").setProperty("/statsClientIdRequired", selectedMode === '2')
        },

        // Generic function to load XML Fragments and give them unique id's
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

        onSeasonSelected: function(oEvent) {
            this.bindSuggestionItemsToSeason();
            this.resetMatchId();
        },

        onSeasonSelectedWithValueHelp: function(oEvent) {
            var sTitleSelectedItem = oEvent.getParameter("selectedItem").getProperty("title");
            this.getView().getModel("ui").setProperty("/selectedSeason", sTitleSelectedItem);
            this.bindSuggestionItemsToSeason();
            this.resetMatchId();
        },

        bindSuggestionItemsToSeason: function() {
            var oInput = this.byId("matchSelect");
            var sSelectedSeason = this.getView().getModel("ui").getProperty("/selectedSeason");
            oInput.removeAllSuggestionItems();

            $.get({
                url: `/dfl/Fixtures?$filter=Season eq '${sSelectedSeason}' `,
                success: function (data) {
                    for (var i = 0;  i < data.value.length; i++) {
                        var matchId = data.value[i].MatchId;
                        var matchName = data.value[i].HomeTeamName + " vs " + data.value[i].GuestTeamName;

                        var oItem = new sap.ui.core.Item({
                            key: matchId,
                            text: matchName
                        });

                        oInput.addSuggestionItem(oItem);
                    }
                },
                error: function (error) {
                    MessageToast.show("Verbindungsproblem zur Datenbank, versuchen Sie es später erneut");
                }
            })
        },

        onMatchSelected: function(oEvent) {
            var sKeySelectedItem = oEvent.getSource().getProperty("selectedKey");
            this.byId("getStatisticsForApi").getObjectBinding().getParameterContext().setProperty("matchId", sKeySelectedItem);
        },

        onMatchValueHelpRequested: function(oEvent) {
            var sSelectedSeason = this.getView().getModel("ui").getProperty("/selectedSeason");
            var that = this;

            this.onGenericFragmentLoad(oEvent, "admin.view.dialog.ValueHelpMatches%_matchValueHelpDialog");

            $.get({
                url: `/dfl/Fixtures?$filter=Season eq '${sSelectedSeason}' `,
                success: function (data) {
                    that.getView().getModel("ui").setProperty("/seasonalMatches", data.value);
                },
                error: function (error) {
                    MessageToast.show("Verbindungsproblem zur Datenbank, versuchen Sie es später erneut");
                }
            })
        },

        onMatchSelectedWithValueHelp: function(oEvent) {
            var sKeySelectedItem = oEvent.getParameter("selectedItem").getCustomData()[0].getKey();
            var sSelectedMatchTitel = oEvent.getParameter("selectedItem").getTitle();
            this.byId("getStatisticsForApi").getObjectBinding().getParameterContext().setProperty("matchId", sKeySelectedItem);
            this.getView().getModel("ui").setProperty("/selectedMatch", sSelectedMatchTitel);
        },

        handleSeasonValueLiveChange: function(oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new sap.ui.model.Filter({
				path: "Season",
				operator: sap.ui.model.FilterOperator.Contains,
				value1: sValue,
				caseSensitive: false
			});

            oEvent.getSource().getBinding("items").filter(oFilter);
        },

        handleMatchValueLiveChange: function(oEvent) {
            var sValue = oEvent.getParameter("value");
            var aFilters = [];

            var oFilterHome = new sap.ui.model.Filter({
				path: "HomeTeamName",
				operator: sap.ui.model.FilterOperator.Contains,
				value1: sValue,
				caseSensitive: false
			});

            var oFilterGuest = new sap.ui.model.Filter({
				path: "GuestTeamName",
				operator: sap.ui.model.FilterOperator.Contains,
				value1: sValue,
				caseSensitive: false
			});

            aFilters.push(oFilterHome);
            aFilters.push(oFilterGuest);
            var oFilter = new sap.ui.model.Filter(aFilters, false);

            oEvent.getSource().getBinding("items").filter(oFilter);
        },

        resetMatchId: function() {
            this.byId("getStatisticsForApi").getObjectBinding().getParameterContext().setProperty("matchId", "");
            this.byId("matchSelect").setValue("");
        }
    });
});