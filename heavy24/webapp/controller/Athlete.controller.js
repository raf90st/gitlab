sap.ui.define([
    "./BaseController",
    "sap/m/MessageToast",
], function (BaseController, MessageToast) {
	"use strict";

	return BaseController.extend("teamfact.app.controller.Athlete", {

		onInit : function () {          
            // attach method "_onRouteMatched" to route "athlete"
            this.getRouter().getRoute("athlete").attachPatternMatched(this._onRouteMatched, this);
        },       
        
        /**
		 * Binds the view for the athlete (based on athlete id in URL)
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'athlete'
		 * @private
		 */
        _onRouteMatched: function (oEvent) {     
            this.sAthleteId = oEvent.getParameter("arguments").athleteId;                    
            this.sToken = oEvent.getParameter("arguments").token;
            
            this._readAthlete();           
        },

        _readAthlete: function(){       
            console.log("_readAthlete() in Athlete Overview");      
             // get athlete data
            this.getView().bindElement("/AthleteOverview(" + this.sAthleteId + ")");       
            this._bindView();
        },

        _bindView: function () {
            // bind round data to detail table
            var oTableTemplate = new sap.m.ColumnListItem({
                cells: [
                    new sap.m.ObjectIdentifier({
                        title: "{LapNr}"
                    }),
                    new sap.m.Text({
                        text: "{ path: 'CombinedTime', type: 'sap.ui.model.type.Date', formatOptions: {source: {pattern: 'yyyy-MM-ddTHH:mm:ssZ'}, pattern: 'HH:mm'}} {i18n>Clock}"                                                
                    }),                     
                    new sap.m.Text({
                        text: "{ path: 'SplitTime1', type: 'sap.ui.model.type.Time', formatOptions: {source: {pattern: 'ssss', UTC: true}, pattern: 'mm:ss', UTC: true}}"
                    }), 
                    new sap.m.Text({
                        text: "{ path: 'SplitTime2Delta', type: 'sap.ui.model.type.Time', formatOptions: {source: {pattern: 'ssss', UTC: true}, pattern: 'mm:ss', UTC: true}}"
                    }), 
                    new sap.m.Text({
                        text: "{ path: 'SplitTime3Delta', type: 'sap.ui.model.type.Time', formatOptions: {source: {pattern: 'ssss', UTC: true}, pattern: 'mm:ss', UTC: true}}"
                    }),                                                            
                    new sap.m.ObjectNumber({
                        number: "{ path: 'LapTime', type: 'sap.ui.model.type.Time', formatOptions: {source: {pattern: 'sssss', UTC: true}, pattern: 'H:mm:ss', UTC: true}}"
                    })                                  
                ]
            });          
            
            var oTable = this.getView().byId("idRoundsTable"); 
            var oFilterTable = new sap.ui.model.Filter("Athlete", "EQ", this.sAthleteId ); 
            oTable.bindItems({path: "/RaceResultsCombinedAthlete", template:oTableTemplate, filters: oFilterTable });            
            
        },

                // called from BaseController
        startAutomaticLoad: function (seconds) {
            console.log("startAutomaticLoad() in Athlete  " + seconds + " sec");        
            var that = this;
            that.intervalHandle = setInterval(function() { 
                that._readAthlete();
            },  seconds*1000);  // reload every x sec    
            this.getView().byId("idLoadingButton").addStyleClass("spinning");
            this.bActiveLoading = true;  
        },

        // called from BaseController
        stopAutomaticLoad: function () {    
            console.log("stopAutomaticLoad() in Athlete");  
            
            // stop the interval on exit. 
            if (this.intervalHandle) clearInterval(this.intervalHandle) ;
            this.getView().byId("idLoadingButton").removeStyleClass("spinning"); 
            this.bActiveLoading = false;  
        }, 

        onNavToAthletes: function (oEvent) {
            var oItem = oEvent.getSource();
            var oContext = oItem.getBindingContext();       
            
            this.stopAutomaticLoad();

            this.getRouter().navTo("athletes",{
                token : oContext.getProperty("Token"),
				teamId : oContext.getProperty("Team_ID")
            }); 
		},
        

	});

});