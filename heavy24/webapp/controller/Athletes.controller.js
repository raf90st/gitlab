sap.ui.define([
    "./BaseController",
    "sap/m/MessageToast",
    'sap/ui/core/Fragment',
    'sap/ui/model/Sorter',
    'sap/ui/Device',
    'sap/suite/ui/microchart/ColumnMicroChartData'
], function (BaseController, MessageToast, Fragment, Sorter, Device, ColumnMicroChartData) {
	"use strict";

	return BaseController.extend("teamfact.app.controller.Athletes", {

		onInit : function () {
			// apply content density mode to root view
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
            
            // attach method "_onRouteMatched" to route "athletes"
            this.getRouter().getRoute("athletes").attachPatternMatched(this._onRouteMatched, this);

            this.currentTheme = "sap_fiori_3_dark"; // also configured in index.html

			// Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
            this._mViewSettingsDialogs = {};    
            
            this.CumulativeSplit = true;
            
            //this.onSwitchLoading(); // start automatic load (defined in BaseController)
        },       
        
        /**
		 * Binds the view for the correct athletes (based on athletes id in URL)
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'athletes'
		 * @private
		 */
        _onRouteMatched: function (oEvent) {
            this.sTeamId = oEvent.getParameter("arguments").teamId;      
            this.sToken = oEvent.getParameter("arguments").token;

            // check if TeamId and Token are related and read athletes
            this._readAthletes();   
        },

        _readAthletes: function(){   
            console.log("_readAthletes() in Athletes");     
            var that = this;
            $.get({
                url: `../race/Teams(${that.sTeamId})`,
                success: function(data){                    
                    // check team Token from Url
                    if(data) {                        
                        if(that.sToken == data.Token) {
                            that.getView().bindElement("/TeamOverview(" + that.sTeamId + ")");
                            that._readTeamOverview(that.sTeamId);
                        } else {       
                            that.getRouter().navTo("welcome"); 
                            MessageToast.show(that.getModel("i18n").getResourceBundle().getText("AccessDenied"),{duration: 3000});                                                                         
                        }                        
                    }                   
                },
                error: function(error){                   
                    MessageToast.show(that.getModel("i18n").getResourceBundle().getText("NoTeamData"),{duration: 3000});                                             
                }               
            })
        },

        _readTeamOverview: function(sTeamId) {
            var that = this;

            $.get({
                url: "/race/TeamOverview(" + sTeamId + ")",
                success: function (data) {
                    var sTeamLapsUrl = "/race/LapResults?$filter=TeamID%20eq%20" + data.TeamID + 
                    "%20and%20Athlete_ID%20eq%20" + data.CurrentAthleteID + "&$orderby=LapNr%20asc&$top=5";
                    that._readLastFiveAthleteLaps(sTeamLapsUrl);
                },
                error: function (error) {
                    MessageToast.show(that.getModel("i18n").getResourceBundle().getText("NoTeamData"),{duration: 3000});
                }
            })
        },

        _readLastFiveAthleteLaps: function(sUrl) {
            var that = this;
            var oColumnChart = this.byId("fiveRoundsChart");

            $.get({
                url: sUrl,
                success: function (data) {
                    var aRounds = data.value;
                    var lapAvg = Number((aRounds[0].LapTime + aRounds[1].LapTime + aRounds[2].LapTime + 
                        aRounds[3].LapTime + aRounds[4].LapTime) / 5).toFixed(2);    

                    oColumnChart.removeAllColumns();
                    for (var i = 0; i < aRounds.length; i++) {
                        var laptime = Number(aRounds[i].LapTime).toFixed(2);
                        var sColor = "";

                        if (laptime <= lapAvg) {
                            sColor = "Good"
                        } else {
                            sColor = "Error"
                        }

                        var lapTimeInMinutes = new Date(laptime * 1000).toISOString().substr(14, 5);

                        var oColumn = new ColumnMicroChartData({
                            value: parseFloat(lapTimeInMinutes.replace(":",".")),
                            label: aRounds[i].LapNr,
                            color: sColor
                        })
                        oColumnChart.addColumn(oColumn);
                    }
                },
                error: function (error) {
                    MessageToast.show(that.getModel("i18n").getResourceBundle().getText("NoTeamData"),{duration: 3000});
                }
            })
        },

        onLastFiveRoundInfoPress: function (oEvent) {
            var oIcon = oEvent.getSource();
            this._onGenericFragmentLoad("teamfact.app.view.fragment.Last5RoundsPopover%_popoverFragment");
            this._popoverFragment.openBy(oIcon);
        },

        // called from BaseController
        startAutomaticLoad: function (seconds) {
            console.log("startAutomaticLoad() in Athletes " + seconds + " sec");        
            var that = this;
            that.intervalHandle = setInterval(function() { 
                that._readAthletes();
            },  seconds*1000);  // reload every x sec    
            this.getView().byId("idLoadingButton").addStyleClass("spinning");
            this.bActiveLoading = true;  
        },

        // called from BaseController
        stopAutomaticLoad: function () {    
            console.log("stopAutomaticLoad() in Athletes");        
            // stop the interval on exit. 
            if (this.intervalHandle) clearInterval(this.intervalHandle) ;
            this.getView().byId("idLoadingButton").removeStyleClass("spinning"); 
            this.bActiveLoading = false;  
        },  

        _getViewSettingsDialog: function (sDialogFragmentName) {
			var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

			if (!pDialog) {
				pDialog = Fragment.load({
					id: this.getView().getId(),
					name: sDialogFragmentName,
					controller: this
				}).then(function (oDialog) {
					if (Device.system.desktop) {
						oDialog.addStyleClass("sapUiSizeCompact");
					}
					return oDialog;
				});
				this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
			}
			return pDialog;
		},

        onSortButtonPressed: function () {
			this._getViewSettingsDialog("teamfact.app.view.fragment.SortDialogAthletes")
				.then(function (oViewSettingsDialog) {
					oViewSettingsDialog.open();
				});
        },

        onSortDialogConfirm: function (oEvent) {
			var oTable = this.byId("idRoundsTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				aSorters = [];

			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));

			// apply the selected sort and group settings
			oBinding.sort(aSorters);
		},

        onSwitchMode : function (oEvent){
            if(this.currentTheme == "sap_fiori_3_dark") {                    
                 this.currentTheme = "sap_fiori_3";       
            } else {
                 this.currentTheme = "sap_fiori_3_dark"; 
            }  
            sap.ui.getCore().applyTheme(this.currentTheme);          
        },

        onAthleteItemPressed : function (oEvent) {
            var oItem, oCtx;
			oItem = oEvent.getParameter("listItem");
            oCtx = oItem.getBindingContext();
            
            this.stopAutomaticLoad();
            this.getRouter().navTo("athlete",{token:this.sToken, athleteId:oCtx.getProperty("Athlete")});
        },

        onSwitchSplitTimes : function (oEvent) {
            var state = oEvent.getParameter("state");    
            this.CumulativeSplit = state;       
            this._bindView(this.sTeamId);    
        }

	});

});