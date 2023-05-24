sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    'sap/ui/core/Fragment',
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/suite/ui/commons/imageeditor/ImageEditor",
    "sap/suite/ui/commons/library",
    'sap/m/library',
    "../model/formatter",
    'sap/ui/model/Sorter',
    'sap/ui/Device'

], function (BaseController, JSONModel, History, Fragment, MessageToast, MessageBox, ImageEditor, SuiteLibrary, mobileLibrary, formatter, Sorter, Device) {
    "use strict";

    return BaseController.extend("teamfact.app.controller.Team", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
        onInit: function () {
            // Model used to manipulate control states. The chosen values make sure,
            // detail page shows busy indication immediately so there is no break in
            // between the busy indication for loading the view's meta data
            var oViewModel = new JSONModel({
                busy: true,
                delay: 0
            });

            var oUiModel = new JSONModel({
                mapExpanded: false,
                currentSplit1: null,
                currentSplit2: null,
                currentSplit3: null,
                prevLapTime: 0,
                currentFinishedFlag: 0,
                mapInitialized: false,
                currentSection: "",
                saveCurrentFinishFlag: 0,
                currentLapNr: 0,
                currentStartTime: "",
                currentFirstName: "",
                currentFullName: "",
                previousSplit1: null,
                previousSplit2: null,
                previousSplit3: null,
                mapDataInitialized: false,
                nextStartTime: null
            });

            this.oForm = null;

            this.getRouter().getRoute("team").attachPatternMatched(this._onObjectMatched, this);
            this.setModel(oViewModel, "teamView");
            this.setModel(oUiModel, "mapView");

            this.URLHelper = mobileLibrary.URLHelper;

            var oRaceModel = new JSONModel({
                planningData: [],
            })
            this.setModel(oRaceModel, "race");

            this.currentTheme = "sap_fiori_3_dark"; // also configured in index.html

            // Keeps reference to any of the created sap.m.ViewSettingsDialogs
            this._mViewSettingsDialogs = {};
            this.CumulativeSplit = true;

            var oSplitter = this.byId("idMainSplitter");
            oSplitter.getContentAreas()[0].getLayoutData().setSize("100%");

            // start app with automatic read
            this.onSwitchLoading(); // activate coding in the productive version
        },

        onAfterRendering: function () {
            this._initHereMapConfiguration();
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */


        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        // called from BaseController
        startAutomaticLoad: function (seconds) {
            console.log("startAutomaticLoad() in TeamPlanner to " + seconds + " sec");
            var that = this;
            that.intervalHandle = setInterval(function () {
                that._readAthletes();
            }, seconds * 1000);  // reload every x sec    
            this.getView().byId("idLoadingButton").addStyleClass("spinning");
            this.bActiveLoading = true;
        },

        stopAutomaticLoad: function () {
            console.log("stopAutomaticLoad() in TeamPlanner");
            // stop the interval on exit. 
            // stop the interval if you navigate out of your view and start it again when you navigate back. 
            if (this.intervalHandle) clearInterval(this.intervalHandle);
            this.getView().byId("idLoadingButton").removeStyleClass("spinning");
            this.bActiveLoading = false;
        },

        _onObjectMatched: function (oEvent) {
            this.teamId = oEvent.getParameter("arguments").teamId;
            this.managerId = oEvent.getParameter("arguments").managerId;
            this._populateColumns();
            // read athletes and check manager id
            this._readAthletes();
            //this._bindToolbar();
        },

		/**
		 * Binds toolbar to view
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
        _bindToolbar: function () {
            var sTeamId = this.teamId;
            var oTeamToolbar = this.getView().byId("teamTableToolbar");
            //oTeamToolbar.bindElement("/TeamPlanner(" + sTeamId + ")");
        },

        _readAthletes: function () {
            var isMapInitialized = this.getModel("mapView").getProperty("/mapInitialized");
            console.log("_readAthletes() in TeamPlanner");
            var that = this;
            $.get({
                url: `../race/Athletes?$orderby=SortOrder&$filter=Team_ID eq ${that.teamId}&$expand=Team`,
                success: function (data) {
                    // necessary for row count in table
                    that.getModel("race").setProperty("/teamSize", data.value.length);

                    // check manager ID and read race results
                    if (data.value.length > 0) {
                        if (that.managerId == data.value[0].Team.Manager_ID) {
                            that._bindTeamOverview(that.teamId, isMapInitialized, that);
                            that._readRaceResults(that.teamId, data.value);
                            that._bindToolbar();
                            that._bindRoundsTable(that.teamId);
                        } else {
                            MessageToast.show("Wrong manager ID", { duration: 3000 });
                        }
                    }
                },
                error: function (error) {
                    MessageToast.show(that.getModel("i18n").getResourceBundle().getText("errorText"));
                }
            })
        },

        _bindTeamOverview: function (sTeamID, isMapInitialized, oThat) {
            var oDynamicPage = oThat.getView().byId("idDynamicPage");
            oDynamicPage.bindElement(
                {
                    path: "/TeamOverview(" + sTeamID + ")",
                    events: {
                        dataReceived: (oEvent) => {
                            if (!isMapInitialized) {
                                oThat._initializeMap();
                            } else {
                                oThat._updateAthleteOnMapAfterSplitTimeCompleted();
                            }
                        }
                    }
                });
        },

        _readRaceResults: function (sTeamId, aDrivers) {
            var that = this;
            $.get({
                url: "../race/RaceResultsCombined?$filter=TeamID eq " + sTeamId,
                success: function (data) {
                    var results = data.value;
                    var iFinishedRounds = results.map(function (r) {
                        if (r.FinishedFlag === 1) {
                            return r.LapNr;
                        } else {
                            return 0;
                        }
                    });

                    aDrivers.forEach(function (driver, index) {

                        // Update JSON Model
                        for (var round = 1; round < 80; round++) {
                            aDrivers[index]["R" + round] = {
                                "Lap": round,
                                "Assigned": false,
                                "Final": iFinishedRounds.includes(round)
                            };
                        }

                        results.forEach(function (result) {
                            if (result.Athlete === driver.ID) {
                                Object.assign(aDrivers[index]["R" + result.LapNr], result);
                                aDrivers[index]["R" + result.LapNr].Assigned = true;
                            }

                        });
                    });

                    //that.getModel("global").setProperty("/spinnerVisible", false);
                    that.getModel("race").setProperty("/planningData", aDrivers);
                },
                error: function (error) {
                    MessageToast.show(that.getModel("i18n").getResourceBundle().getText("errorText"));
                }
            });
        },

        // genertate 80 columns to table
        _populateColumns: function () {
            var oTable = this.getView().byId("athleteTable");
            if (oTable.getColumns().length !== 1) return;
            for (var i = 1; i < 80; i++) {
                oTable.addColumn(
                    new sap.ui.table.Column({
                        label: "R" + i,
                        width: "5rem",
                        hAlign: "Center",
                        resizable: false,
                        menu: new sap.ui.unified.Menu({
                            visible: "{= ${race>R" + i + "/Assigned} && !${race>R" + i + "/Final} }",
                            items: [new sap.ui.unified.MenuItem("", {
                                visible: "{= ${race>R" + i + "/Assigned} && !${race>R" + i + "/Final} }",
                                text: "{i18n>insert}",
                                select: this.onInsertButtonClick.bind(this)
                            }).data({
                                "lap": i
                            }),
                            new sap.ui.unified.MenuItem("", {
                                visible: "{= ${race>R" + i + "/Assigned} && !${race>R" + i + "/Final} }",
                                text: "{i18n>remove}",
                                select: this.onRemoveButtonClick.bind(this)

                            }).data({
                                "lap": i
                            })
                            ]
                        }),
                        template: new sap.m.VBox("", {
                            items: [
                                // Planned in the future
                                new sap.m.Button("", {
                                    visible: "{= ${race>R" + i + "/Assigned} && !${race>R" + i + "/Final} }",
                                    type: "Transparent",
                                    //text: "{ path: 'race>R" + i + "/PredictedStartTime'" +                                                                           
                                    //      "}"
                                    text: "{ path: 'race>R" + i + "/PredictedStartTime'," +
                                        "type: 'sap.ui.model.type.Date'," +
                                        "formatOptions: {" +
                                        "source: {pattern: 'yyyy-MM-ddTHH:mm:ssZ'}, " +
                                        "pattern: 'HH:mm'}" +
                                        "}"
                                }).data("lap", i),

                                // Can be activated
                                new sap.m.Button("", {
                                    visible: "{= !${race>R" + i + "/Assigned} && !${race>R" + i + "/Final} }",
                                    type: "Transparent",
                                    icon: "sap-icon://customer-history",
                                    press: this.onAssignButtonClick.bind(this),
                                    customData: [new sap.ui.core.CustomData({ key: "lap", value: i })]
                                }).addStyleClass("assignBiker").data({ "lap": i, "athleteID": "{race>ID}" }),

                                // round finished -> show result
                                new sap.m.Button("", {
                                    visible: "{= ${race>R" + i + "/Assigned} && ${race>R" + i + "/Final} }",
                                    type: "Accept",
                                    text: "{ path: 'race>R" + i + "/LapTime'," +
                                        "type: 'sap.ui.model.type.Time'," +
                                        "formatOptions: {" +
                                        "source: {pattern: 'sssss', UTC: true}, " +
                                        "pattern: 'H:mm:ss', UTC: true}" +
                                        "}",
                                    press: this.onDetailsButtonClick.bind(this)
                                }).data("lap", i)
                            ]
                        })
                    })
                );
            }
        },

        _bindRoundsTable: function (sTeamId) {
            // bind round data to detail table
            if (this.CumulativeSplit) {
                var path_split2 = "{ path: 'SplitTime2', type: 'sap.ui.model.type.Time', formatOptions: {source: {pattern: 'ssss', UTC: true}, pattern: 'mm:ss', UTC: true}}";
                var path_split3 = "{ path: 'SplitTime3', type: 'sap.ui.model.type.Time', formatOptions: {source: {pattern: 'ssss', UTC: true}, pattern: 'mm:ss', UTC: true}}";
            } else {
                var path_split2 = "{ path: 'SplitTime2Delta', type: 'sap.ui.model.type.Time', formatOptions: {source: {pattern: 'ssss', UTC: true}, pattern: 'mm:ss', UTC: true}}";
                var path_split3 = "{ path: 'SplitTime3Delta', type: 'sap.ui.model.type.Time', formatOptions: {source: {pattern: 'ssss', UTC: true}, pattern: 'mm:ss', UTC: true}}";
            }

            var oTableTemplate = new sap.m.ColumnListItem({
                type: "Navigation",
                cells: [
                    new sap.m.ObjectIdentifier({
                        title: "{LapNr}"
                    }),
                    new sap.m.Text({
                        text: "{Athlete}"
                    }),
                    new sap.m.Text({
                        text: "{FullName}"
                    }),
                    new sap.m.Text({
                        text: "{ path: 'CombinedTime', type: 'sap.ui.model.type.Date', formatOptions: {source: {pattern: 'yyyy-MM-ddTHH:mm:ssZ'}, pattern: 'HH:mm'}} {i18n>Clock}"
                    }),
                    new sap.m.Text({
                        text: "{ path: 'SplitTime1', type: 'sap.ui.model.type.Time', formatOptions: {source: {pattern: 'ssss', UTC: true}, pattern: 'mm:ss', UTC: true}}"
                    }),
                    new sap.m.Text({
                        text: path_split2
                    }),
                    new sap.m.Text({
                        text: path_split3
                    }),
                    new sap.m.ObjectNumber({
                        number: "{ path: 'LapTime', type: 'sap.ui.model.type.Time', formatOptions: {source: {pattern: 'sssss', UTC: true}, pattern: 'H:mm:ss', UTC: true}}"
                    }),
                    new sap.m.ObjectNumber({
                        number: "{ContestRank}"
                    })
                ]
            });

            var oTable = this.getView().byId("idRoundsTable");
            //oTable.setFixedLayout(false);
            var oFilterTable = new sap.ui.model.Filter("TeamID", "EQ", sTeamId);
            oTable.bindItems({ path: "/RaceResultsCombinedAthlete", template: oTableTemplate, filters: oFilterTable });

        },

        /* open a new window for the Athlete view*/
        onNavToAthletes: function (oEvent) {
            var oItem = oEvent.getSource();
            var oContext = oItem.getBindingContext();

            //this.stopAutomaticLoad();

            var url = window.location.href.split('#')[0] + "#/" + oContext.getProperty("Token") + "/Team/" + oContext.getProperty("TeamID");
            this.URLHelper.redirect(url, true);
        },

        onSwitchMode: function () {
            if (this.currentTheme == "sap_fiori_3_dark") {
                this.currentTheme = "sap_fiori_3";
            } else {
                this.currentTheme = "sap_fiori_3_dark";
            }
            sap.ui.getCore().applyTheme(this.currentTheme);
        },

        onSwitchSplitTimes: function (oEvent) {
            var state = oEvent.getParameter("state");
            this.CumulativeSplit = state;
            this._bindRoundsTable(this.teamId);
        },

        onShowMap: function (oEvent) {
            var oGeoMap = this.byId("idGeoMap");
            var oSplitter = this.byId("idMainSplitter");
            // trigger to show map and set oriantation (1) show map right, (2) show map below, (3) hide map
            //oSplitter.addContentArea(oGeoMap);
            //var oLastContentArea = oSplitter.getContentAreas().pop();
            //oSplitter.removeContentArea(oLastContentArea);
            //oLastContentArea.destroy();
            var sOr = oSplitter.getOrientation();
            oSplitter.setOrientation(
                sOr === sap.ui.core.Orientation.Vertical
                    ? sap.ui.core.Orientation.Horizontal
                    : sap.ui.core.Orientation.Vertical
            );
        },

        onToggleMap: function () {
            var isMapExpanded = this.getModel("mapView").getProperty("/mapExpanded");
            var oSplitter = this.byId("idMainSplitter");

            if (!isMapExpanded) {
                oSplitter.getContentAreas()[0].getLayoutData().setSize("75%");
                this.getModel("mapView").setProperty("/mapExpanded", true);
            } else {
                oSplitter.getContentAreas()[0].getLayoutData().setSize("100%");
                this.getModel("mapView").setProperty("/mapExpanded", false);
            }
        },

        onDropRow: function (oEvent) {
            var oDraggedAthlete = oEvent.getParameter("draggedControl").getBindingContext("race").getObject();
            var bAfter = oEvent.getParameter("dropPosition") === 'After';
            var oDroppedAthlete = oEvent.getParameter("droppedControl").getBindingContext("race").getObject();

            var that = this;
            $.ajax({
                type: 'POST',
                contentType: 'application/json',
                url: `../race/changeSortOrder`,
                data: `{"athleteId":` + oDraggedAthlete.ID + `, "refAthleteId":` + oDroppedAthlete.ID +
                    `, "bAfter":` + bAfter + `}`,
                success: function (data) {

                    that._readAthletes();
                },
                error: function (error) {
                    MessageToast.show("Es ist ein Fehler aufgetreten");
                }
            })
        },

        onDefLapPopupOpenPress: function (oEvent) {
            var oControl = oEvent.getSource();
            var oView = this.getView();
            var iAthlete = oEvent.getSource().getCustomData()[0].getValue();

            // create popover
            //if (!this._oReportPopover) {
            this._oReportPopover = Fragment.load({
                id: oView.getId(),
                name: "teamfact.app.view.fragment.DeflapTime",
                controller: this
            }).then(function (oPopover) {
                oView.addDependent(oPopover);
                return oPopover;
            }.bind(this));
            //}

            this._oReportPopover.then(function (oPopover) {
                oPopover.bindElement("/Athletes(" + iAthlete + ")");
                oPopover.openBy(oControl);
                oPopover.attachAfterClose(function () {
                    oPopover.destroy();
                });
            });
        },

        onNavBack: function (oEvent) {
            var oNavCon = this.byId("popoverNavContainer");
            oNavCon.back();
            this.byId("athletePopover").focus();
        },

        onDefLapTimeSavePress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var iDefLaptime = oContext.getObject().DefLapTime;
            if (iDefLaptime > 0) {
                oContext.setProperty("DefLapTime", iDefLaptime);
                MessageToast.show("Default-Rundenzeit aktualisiert");
            } else {// set 30min as default
                oContext.setProperty("DefLapTime", 30);
                MessageToast.show("Default-Rundenzeit auf Standard (30min) zurückgesetzt");
            }

            this._readAthletes();
            this.byId("athletePopover").close();
        },

        onNavToImage: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext(); // Context is Athlete
            var oNavCon = this.byId("popoverNavContainer");
            var oDetailPage = this.byId("popoverDetail");
            var iAthleteId = oContext.getObject().ID;

            oNavCon.to(oDetailPage);
            oDetailPage.bindElement(oContext.getPath());
            //oDetailPage.bindElement("/AthletePictures(" + iAthleteId + ")");            
            this.getView().byId("athletePopover").focus();
        },

        onImageFileChange: function (oEvent) {
            var oFile = oEvent.getParameter("files")[0],
                oImageEditor = this.getView().byId("image");

            if (!oFile) {
                return;
            }

            //this.getView().getModel().setProperty("/blocked", true);
            oImageEditor.setSrc(oFile);
        },

        onImageLoaded: function () {
            var oImageEditor = this.getView().byId("image");
            var ImageEditorMode = SuiteLibrary.ImageEditorMode;

            //this.getView().getModel().setProperty("/blocked", !oImageEditor.getSrc());
            //oImageEditor.zoomToFit();
            oImageEditor.setKeepResizeAspectRatio(true);
            oImageEditor.setHeight(180, false);
            oImageEditor.setMode(ImageEditorMode.CropEllipse);
            oImageEditor.setCropAreaByRatio(1, 1);
        },

        onImageSavePress: function (oEvent) {
            var that = this;
            var oContext = oEvent.getSource().getBindingContext();
            var oImageEditor = this.getView().byId("image");
            oImageEditor.applyVisibleCrop();
            var sPath = oContext.getPath(); // e.g. "/Athletes(Id)"            
            var iAthleteId = parseInt(sPath.replace(/\D+/g, "")); // to get numeric Athlete Id via Regex -> replace only all chars with "" 

            var promiseImgBlob = oImageEditor.getImageAsBlob(sap.suite.ui.commons.ImageFormat.Png);

            promiseImgBlob.then(function (param) {
                // trigger when promise resolved -> image is available -> create AthletePictures record                                           
                $.ajax({
                    type: 'POST',
                    contentType: 'application/json',
                    url: `../race/AthletePictures`,
                    data: `{"ID":` + iAthleteId + `}`,
                    success: function (data) {
                        // AthletePictures record created
                        that._insertAthletePicture(oContext, iAthleteId, param);
                    },
                    error: function (error) {
                        // AthletePictures already exists
                        that._insertAthletePicture(oContext, iAthleteId, param);
                    }
                })

            }, function (param) {
                // trigger when promise rejected or error
                console.log(param);
                MessageToast.show(that.getModel("i18n").getResourceBundle().getText("errorText"));
            });

        },

        _insertAthletePicture: function (oContext, iAthleteId, image) {
            var that = this;
            $.ajax({
                type: 'PUT',
                contentType: 'image/png',
                url: `../race/AthletePictures(${iAthleteId})/image`,

                processData: false,
                contentType: false,
                data: image,

                success: function (data) {
                    // add the picture URL to the Athlete
                    var oAvatarPopup = that.getView().byId("idAvatarPopup");
                    oAvatarPopup.setSrc(`/race/AthletePictures(${iAthleteId})/image`);

                    that._readAthletes();

                    MessageToast.show(that.getModel("i18n").getResourceBundle().getText("successUpdate"));
                    that.byId("athletePopover").close();
                },
                error: function (error) {
                    MessageToast.show(that.getModel("i18n").getResourceBundle().getText("errorText"));
                    that.byId("athletePopover").close();
                }
            })
        },

        onDetailsButtonClick: function (oEvent) {
            var that = this;
            var oControl = oEvent.getSource();
            var oView = this.getView();
            var iLap = oEvent.getSource().data("lap");

            this._oReportPopover = Fragment.load({
                id: oView.getId(),
                name: "teamfact.app.view.fragment.InfoPopover",
                controller: this
            }).then(function (oPopover) {
                oView.addDependent(oPopover);
                return oPopover;
            }.bind(this));

            this._oReportPopover.then(function (oPopover) {
                oPopover.bindElement({ path: "/LapResults(TeamID=" + that.teamId + ",LapNr=" + iLap + ")" });
                oPopover.openBy(oControl);
                oPopover.attachAfterClose(function () {
                    oPopover.destroy();
                });

            });

        },

        onRemoveButtonClick: function (oEvent) {
            var that = this;
            var iLap = oEvent.getSource().data("lap");

            $.ajax({
                type: 'POST',
                contentType: 'application/json',
                url: `../race/removeLap`,
                data: `{"teamId":` + that.teamId + `, "lapNr":` + iLap + `}`,
                success: function (data) {
                    that._readAthletes();
                },
                error: function (error) {
                    MessageToast.show("Beim Löschen der Runde ist ein Fehler aufgetreten.");
                }
            })
        },

        onInsertButtonClick: function (oEvent) {
            var that = this;
            var iLap = oEvent.getSource().data("lap");

            $.ajax({
                type: 'POST',
                contentType: 'application/json',
                url: `../race/insertLap`,
                data: `{"teamId":` + that.teamId + `, "lapNr":` + iLap + `}`,
                success: function (data) {
                    that._readAthletes();
                },
                error: function (error) {
                    MessageToast.show("Beim Einfügen der Runde ist ein Fehler aufgetreten.");
                }
            })
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

        /* Plan a lap: assign athlete to selected Lap */
        onAssignButtonClick: function (oEvent) {
            var sLap = oEvent.getSource().getCustomData()[0].getValue();
            var sAthleteId = oEvent.getSource().getCustomData()[1].getValue();
            var oModel = this.getView().getModel();

            this._setLapPlan(sLap, sAthleteId);
        },

        /* Build PUT call to create/update the plan lap for a athelete via json */
        _setLapPlan: function (sLap, sAthleteId) {
            var that = this;
            $.ajax({
                type: 'PUT',
                contentType: 'application/json',
                url: `../race/LapPlan(TeamID=${that.teamId},LapNr=${sLap})`,
                data: `{"Athlete_ID":${sAthleteId}}`,
                success: function (data) {
                    MessageToast.show(that.getModel("i18n").getResourceBundle().getText("successUpdate"));
                    that._readAthletes();
                },
                error: function (error) {
                    MessageToast.show(that.getModel("i18n").getResourceBundle().getText("errorText"));
                }
            })
        },

        _initializeMapDataFrontend: function (oLapTimes) {
            var oMapModel = this.getModel("mapView");
            var currentSplit1 = oLapTimes.CurrentLapAthleteSplit1;
            var currentSplit2 = oLapTimes.CurrentLapAthleteSplit2;
            var currentSplit3 = oLapTimes.CurrentLapAthleteSplit3;

            var previousSplit1 = oLapTimes.PreviousLapAthleteSplit1;
            var previousSplit2 = oLapTimes.PreviousLapAthleteSplit2;
            var previousSplit3 = oLapTimes.PreviousLapAthleteSplit3;

            var currentFinishedFlag = oLapTimes.CurrentFinishedFlag;
            var currentLapNr = oLapTimes.CurrentLapNr;
            var currentStartTime = oLapTimes.LastFinishedStartTime;
            var currentFirstName = oLapTimes.FirstName;
            var currentFullname = oLapTimes.CurrentFullName;
            var previousLapTime = oLapTimes.PreviousLapTime;
            var nextStartTime = oLapTimes.NextStartTime;

            oMapModel.setProperty("/currentFullName", currentFullname);
            oMapModel.setProperty("/currentSplit1", currentSplit1);
            oMapModel.setProperty("/currentSplit2", currentSplit2);
            oMapModel.setProperty("/currentSplit3", currentSplit3);

            oMapModel.setProperty("/previousSplit1", previousSplit1);
            oMapModel.setProperty("/previousSplit2", previousSplit2);
            oMapModel.setProperty("/previousSplit3", previousSplit3);

            oMapModel.setProperty("/currentFinishedFlag", currentFinishedFlag);
            oMapModel.setProperty("/prevLapTime", previousLapTime);
            oMapModel.setProperty("/currentLapNr", currentLapNr);
            oMapModel.setProperty("/currentStartTime", currentStartTime);
            oMapModel.setProperty("/currentFirstName", currentFirstName);
            oMapModel.setProperty("/nextStartTime", nextStartTime);
            
            oMapModel.setProperty("/mapDataInitialized", true);
        },

        /* =========================================================== */
        /* MAP integration                                             */
        /* =========================================================== */

        //Initial State when Client Application is starting
        _initializeMap: function () {
            var oDynamicPage = this.getView().byId("idDynamicPage");
            var oLapTimes = oDynamicPage.getElementBinding().getBoundContext().getObject();

            var previousLapTime = oLapTimes.PreviousLapTime;
            //var nextStartTime = oLapTimes.NextStartTime;

            /*if (nextStartTime !== null) {
                this.byId("animationWarning").close()                
            }*/

            if (previousLapTime !== null) {
                this._initializeMapDataFrontend(oLapTimes);

                //var nextStartTime = oLapTimes.NextStartTime;


                /*if (nextStartTime !== null) {
                    this.byId("animationWarning").getCustomData()[1].setValue("hidden");               
                } else {
                    this.byId("animationWarning").getCustomData()[1].setValue("visible");
                }*/

                /*Real time scenario*/
                //var sClientStartTime = new Date().toISOString();
                /*Real time scenario*/

                //var sCurrentStartTime = this.getModel("mapView").getProperty("/currentStartTime");

                //var oDateClient = new Date(sClientStartTime);

                var currentSplit1 = this.getModel("mapView").getProperty("/currentSplit1");
                var currentSplit2 = this.getModel("mapView").getProperty("/currentSplit2");
                var currentSplit3 = this.getModel("mapView").getProperty("/currentSplit2");

                var previousSplit1 = this.getModel("mapView").getProperty("/previousSplit1");
                var previousSplit2 = this.getModel("mapView").getProperty("/previousSplit2");
                var previousSplit3 = this.getModel("mapView").getProperty("/previousSplit3");

                /*Simulated Start Time*/
                //var oDateClient = new Date(sCurrentStartTime);
                //oDateClient.setMinutes(oDateClient.getMinutes() + 1); 
                /*Simulated Start Time*/

                //var oDateAthlete = new Date(sCurrentStartTime);
                //var aMapData = this.getModel("mapData").getProperty("/features");

                //Athlete moving in first part of Track (between start and part 1)    
                /*if (currentSplit1 == null && currentSplit2 == null && currentSplit3 == null) {
                    var timeDiff = this._calcDiffClientStartAthleteStart(oDateClient, oDateAthlete);
                    this._calcMapSpeedandDistance(aMapData, 0, previousSplit1, timeDiff);
                    this.getModel("mapView").setProperty("/currentSection", "first");
                }*/

                //Athlete moving between first and second part of Track
                if (currentSplit1 !== null && currentSplit2 == null && currentSplit3 == null) {
                    //var timeDiff = this._calcDiffClientStartAthleteStart(oDateClient, oDateAthlete) - previousSplit1;
                    //this._calcMapSpeedandDistance(aMapData, 1, previousSplit2 - previousSplit1, previousSplit1);
                    this._colorTrack(previousSplit1, currentSplit1, "route1");
                    this.getModel("mapView").setProperty("/currentSection", "second");
                }

                //Athlete moving between second and third part of track
                if (currentSplit1 !== null && currentSplit2 !== null && currentSplit3 == null) {
                    //var timeDiff = this._calcDiffClientStartAthleteStart(oDateClient, oDateAthlete) - previousSplit2;
                    //this._calcMapSpeedandDistance(aMapData, 2, previousSplit3 - previousSplit2, timeDiff);
                    this._colorTrack(previousSplit1, currentSplit1, "route1");
                    this._colorTrack(previousSplit2 - previousSplit1, currentSplit2 - currentSplit1, "route2");
                    this.getModel("mapView").setProperty("/currentSection", "third");
                }

                //Athlete moving on last part of track (between third part and start)
                if (currentSplit1 !== null && currentSplit2 !== null && currentSplit3 !== null) {
                    //var timeDiff = this._calcDiffClientStartAthleteStart(oDateClient, oDateAthlete) - previousSplit3;
                    //this._calcMapSpeedandDistance(aMapData, 3, previousLapTime - prev2iousSplit3, timeDiff);
                    this._colorTrack(previousSplit1, currentSplit1, "route1");
                    this._colorTrack(previousSplit2 - previousSplit1, currentSplit2 - currentSplit1, "route2");
                    this._colorTrack(previousSplit3 - previousSplit2, currentSplit3 - currentSplit2, "route3");
                    this.getModel("mapView").setProperty("/currentSection", "fourth");
                }

            }

            this.getModel("mapView").setProperty("/mapInitialized", true);

        },

        _initHereMapConfiguration: function () { 
            //HERE MAP integration            
            // working map styles: terrain.day, hybrid.day
            var oGeoMap = this.getView().byId("idGeoMap");
            var aMapData = this.getModel("mapData").getProperty("/features");
            var oMapConfig = {
                "MapProvider": [{
                    "type": "",
                    "name": "HERE",
                    "description": "HERE",
                    "tileX": "256",
                    "tileY": "256",
                    "minLOD": "0",
                    "maxLOD": "19",
                    "copyright": "HERE MAPS",
                    "Source": [{
                        "id": "1",
                        "url": "https://1.aerial.maps.api.here.com/maptile/2.1/maptile/newest/terrain.day/{LOD}/{X}/{Y}/256/png8?app_id=iMSP70w5B8Mp4WEmXFcQ&app_code=QISnqOjeZCgmeVOLzEmaDQ"
                    }]
                }],
                "MapLayerStacks": [{
                    "name": "DEFAULT",
                    "MapLayer": [{
                        "name": "layer1",
                        "refMapProvider": "HERE",
                        "opacity": "1.0",
                        "colBkgnd": "RGB(255,255,255)"
                    }]
                }]
            };
            oGeoMap.setMapConfiguration(oMapConfig);
            oGeoMap.setRefMapLayerStack("DEFAULT");

            this._drawRoutesOnMap(aMapData);
        },

        _switchAthleteTrackPart: function (mapIndex, splitDiff, prevSplit, currentSplit, routeId, splitSectionText, isCompletedPart, oLapTimes) {
            this._stopAthleteonMap();
            var aMapData = this.getModel("mapData").getProperty("/features");
            var mapTrackPart = aMapData[mapIndex].geometry.coordinates;
            var intervallSpeedSeconds = this._calcTrackSpeedLastLap(splitDiff, mapTrackPart.length);
            var intervallSpeedForAnimationMilliSeconds = intervallSpeedSeconds * 1000;

            this._initializeMapDataFrontend(oLapTimes);

            if (isCompletedPart) {
                this._colorTrack(prevSplit, currentSplit, routeId);
            }

            this._moveAthleteOnMap(mapTrackPart, 0, intervallSpeedForAnimationMilliSeconds);
            this.getModel("mapView").setProperty("/currentSection", splitSectionText);
        },

        _resetAthleteToStart: function (oLapTimes, partCompleted) {
            var previousSplit1 = oLapTimes.PreviousLapAthleteSplit1;
            var previousSplit3 = oLapTimes.PreviousLapAthleteSplit3;
            var currentSplit3 = oLapTimes.CurrentLapAthleteSplit3;
            var splitDiff1 = 0;
            var splitDiff2 = 0;

            if (previousSplit1 !== null) {
                if (partCompleted) {
                    splitDiff1 = oLapTimes.PreviousLapTime - previousSplit3;
                    splitDiff2 = oLapTimes.PreviousLapTime - currentSplit3;                
                }
                
                this._switchAthleteTrackPart(0, previousSplit1, splitDiff1, splitDiff2, "route4", "first", partCompleted, oLapTimes);
            } else {
                this.getModel("mapView").setProperty("/currentSection", "first");
                this._stopAthleteonMap();
                MessageToast.show("Fahreranimation aufgrund fehlender Streckenzeiten angehalten", { duration: 3000 });
            }
            
            this.getModel("mapView").setProperty("/currentLapNr", oLapTimes.CurrentLapNr);
            this.getModel("mapView").setProperty("/prevLapTime", oLapTimes.PreviousLapTime);
        },

        _resetSplitTimes: function () {
            this.getModel("mapView").setProperty("/currentSplit1", null);
            this.getModel("mapView").setProperty("/currentSplit2", null);
            this.getModel("mapView").setProperty("/currentSplit3", null);
        },

        _resetTrackColors: function () {
            var standardColor = "#6699CC";
            var n = 4;

            for (var i = 0; i < n; i++) {
                var routeId = "route" + (i + 1);
                this.byId(routeId).setColor(standardColor);
            }
        },

        _setCurrentAthleteName: function (sName) {
            this.byId("Driver").setText(sName);
        },

        _validateAndCalcSplitDiffs: function(largerSplit, smallerSplit) {
            if (largerSplit == null || smallerSplit == null) {
                return null;
            } else {
                return largerSplit - smallerSplit;
            }
        },

        _updateAthleteOnMapAfterSplitTimeCompleted: function () {
            var oDynamicPage = this.getView().byId("idDynamicPage");
            var oLapTimes = oDynamicPage.getElementBinding().getBoundContext().getObject();
            var currentSection = this.getModel("mapView").getProperty("/currentSection");

            var split1 = this.getModel("mapView").getProperty("/currentSplit1");
            var split2 = this.getModel("mapView").getProperty("/currentSplit2");
            var split3 = this.getModel("mapView").getProperty("/currentSplit3");

            var currentLapNr = this.getModel("mapView").getProperty("/currentLapNr");
            var currentFirstName = this.getModel("mapView").getProperty("/currentFirstName");
            var previousLapTime = oLapTimes.PreviousLapTime;

            //var nextStartTime = oLapTimes.NextStartTime;

            /*if (nextStartTime !== null) {
                this.byId("animationWarning").getCustomData()[1].setValue("hidden");               
            } else {
                this.byId("animationWarning").getCustomData()[1].setValue("visible");
                this._stopAthleteonMap();
            }*/

            if (currentFirstName !== oLapTimes.FirstName) {
                this.getModel("mapView").setProperty("/currentFirstName", oLapTimes.FirstName);
            }

            if (previousLapTime !== null) { 
                switch (currentSection) {
                    case "first":
                        //normal run looking for different splittime every 10 seconds
                        //if splittime differs, we are certain that track part is done and move on to next
                        if (split1 !== oLapTimes.CurrentLapAthleteSplit1) {
                            var currentSplit1 = oLapTimes.CurrentLapAthleteSplit1;
                            var previousSplit1 = oLapTimes.PreviousLapAthleteSplit1;
                            var previousSplit2 = oLapTimes.PreviousLapAthleteSplit2;

                            if (previousSplit1 !== null && previousSplit2 !== null) {
                                //var splitDiff = previousSplit2 - previousSplit1;
                                this._colorTrack(previousSplit1, currentSplit1, "route1");
                                this.getModel("mapView").setProperty("/currentSection", "second");
                                //this._switchAthleteTrackPart(1, splitDiff, previousSplit1, currentSplit1, "route1", "second", true, oLapTimes);
                            } /*else {
                                this._stopAthleteonMap();
                                MessageToast.show("Fahreranimation aufgrund fehlender Streckenzeiten angehalten", { duration: 3000 });
                            }*/
                        }
    
                        //error handling if one or several split times are not delivered by sensor(s).
                        //In this case we look ahead for other split times and move marker to
                        //corresponding track part
                        if (split1 == null && oLapTimes.CurrentLapAthleteSplit2 !== null) {
                            var currentSplit1 = oLapTimes.CurrentLapAthleteSplit1;
                            var previousSplit1 = oLapTimes.PreviousLapAthleteSplit1;
                            var currentSplit2 = oLapTimes.CurrentLapAthleteSplit2;
                            var previousSplit2 = oLapTimes.PreviousLapAthleteSplit2;
                            var previousSplit3 = oLapTimes.PreviousLapAthleteSplit3;

                            var prevSplitDiff = this._validateAndCalcSplitDiffs(previousSplit2, previousSplit1);
                            var currentSplitDiff = this._validateAndCalcSplitDiffs(currentSplit2, currentSplit1);

                            if (previousSplit2 !== null && previousSplit3 !== null) {
                                    this._colorTrack(prevSplitDiff, currentSplitDiff, "route2");
                                    this.getModel("mapView").setProperty("/currentSection", "third");
                                    //var splitDiff = previousSplit3 - previousSplit2;
                                    //this._switchAthleteTrackPart(2, splitDiff, prevSplitDiff, currentSplitDiff, "route2", "third", true, oLapTimes);
                            } /*else {
                                this._stopAthleteonMap();
                                MessageToast.show("Fahreranimation aufgrund fehlender Streckenzeiten angehalten", { duration: 3000 });
                            }*/
                        }
    
                        if (split1 == null && oLapTimes.CurrentLapAthleteSplit3 !== null) {
                            var currentSplit2 = oLapTimes.CurrentLapAthleteSplit2;
                            var previousSplit2 = oLapTimes.PreviousLapAthleteSplit2;
                            var currentSplit3 = oLapTimes.CurrentLapAthleteSplit3;
                            var previousSplit3 = oLapTimes.PreviousLapAthleteSplit3;
                            var prevLapTime = oLapTimes.PreviousLapTime;

                            var prevSplitDiff = this._validateAndCalcSplitDiffs(previousSplit3, previousSplit2);
                            var currentSplitDiff = this._validateAndCalcSplitDiffs(currentSplit3, currentSplit2)

                            if (prevLapTime !== null && previousSplit3 !== null) {
                                    this._colorTrack(prevSplitDiff, currentSplitDiff, "route2");
                                    this.getModel("mapView").setProperty("/currentSection", "fourth");
                                    //var splitDiff = prevLapTime - previousSplit3;
                                    //this._switchAthleteTrackPart(3, splitDiff, prevSplitDiff, currentSplitDiff, "route3", "fourth", true, oLapTimes);
                            } /*else {
                                this._stopAthleteonMap();
                                MessageToast.show("Fahreranimation aufgrund fehlender Streckenzeiten angehalten", { duration: 3000 });
                            }*/
                        }
    
                        if (split1 == null && oLapTimes.CurrentLapNr !== null && currentLapNr < oLapTimes.CurrentLapNr) {
                            //this._resetAthleteToStart(oLapTimes, false);
                            this._resetTrackColors();
                        }
    
                        //error handling where athlete has had an accident and another driver will take over current round
                        //rule is that the other driver will have to start from the beginning (start part of track)
                        //therefore all current splits will be resetted and driver marker will be set back to start
                        if (split1 !== null && split1 < oLapTimes.CurrentLapAthleteSplit1) {
                            //this._resetAthleteToStart(oLapTimes, false);
                            this._resetTrackColors();
                        }
    
                        break;
                    case "second":
                        if (split2 !== oLapTimes.CurrentLapAthleteSplit2) {
                            var currentSplit1 = oLapTimes.CurrentLapAthleteSplit1;
                            var previousSplit1 = oLapTimes.PreviousLapAthleteSplit1;
                            var currentSplit2 = oLapTimes.CurrentLapAthleteSplit2;
                            var previousSplit2 = oLapTimes.PreviousLapAthleteSplit2;
                            var previousSplit3 = oLapTimes.PreviousLapAthleteSplit3;

                            var prevSplitDiff = this._validateAndCalcSplitDiffs(previousSplit2, previousSplit1);
                            var currentSplitDiff = this._validateAndCalcSplitDiffs(currentSplit2, currentSplit1);

                            if (previousSplit2 !== null && previousSplit3 !== null) {
                                    this._colorTrack(prevSplitDiff, currentSplitDiff, "route2");
                                    this.getModel("mapView").setProperty("/currentSection", "third");
                                    //var splitDiff = previousSplit3 - previousSplit2;
                                    //this._switchAthleteTrackPart(2, splitDiff, prevSplitDiff, currentSplitDiff, "route2", "third", true, oLapTimes);
                            } /*else {
                                this._stopAthleteonMap();
                                MessageToast.show("Fahreranimation aufgrund fehlender Streckenzeiten angehalten", { duration: 3000 });
                            }*/
                        }
    
                        if (split2 == null && oLapTimes.CurrentLapAthleteSplit3 !== null) {
                            var currentSplit2 = oLapTimes.CurrentLapAthleteSplit2;
                            var previousSplit2 = oLapTimes.PreviousLapAthleteSplit2;
                            var currentSplit3 = oLapTimes.CurrentLapAthleteSplit3;
                            var previousSplit3 = oLapTimes.PreviousLapAthleteSplit3;
                            var prevLapTime = oLapTimes.PreviousLapTime;

                            var prevSplitDiff = this._validateAndCalcSplitDiffs(previousSplit3, previousSplit2);
                            var currentSplitDiff = this._validateAndCalcSplitDiffs(currentSplit3, currentSplit2);

                            if (previousSplit3 !== null && prevLapTime !== null) {
                                    this._colorTrack(prevSplitDiff, currentSplitDiff, "route3");
                                    this.getModel("mapView").setProperty("/currentSection", "fourth");
                                    //var splitDiff = prevLapTime - previousSplit3;
                                    //this._switchAthleteTrackPart(3, splitDiff, prevSplitDiff, currentSplitDiff, "route3", "fourth", true, oLapTimes);
                            } /*else {
                                this._stopAthleteonMap();
                                MessageToast.show("Fahreranimation aufgrund fehlender Streckenzeiten angehalten", { duration: 3000 });
                            }*/    
                        }
    
                        if (split2 == null && currentLapNr < oLapTimes.CurrentLapNr && oLapTimes.CurrentLapNr !== null) {
                            //this._resetAthleteToStart(oLapTimes, false);
                            this._resetTrackColors();
                        }
    
                        if (split1 !== null && split1 < oLapTimes.CurrentLapAthleteSplit1) {
                            //this._resetAthleteToStart(oLapTimes, false);
                            this._resetTrackColors();
                        }
    
                        break;
                    case "third":
                        if (split3 !== oLapTimes.CurrentLapAthleteSplit3) {
                            var currentSplit2 = oLapTimes.CurrentLapAthleteSplit2;
                            var previousSplit2 = oLapTimes.PreviousLapAthleteSplit2;
                            var currentSplit3 = oLapTimes.CurrentLapAthleteSplit3;
                            var previousSplit3 = oLapTimes.PreviousLapAthleteSplit3;
                            var prevLapTime = oLapTimes.PreviousLapTime;

                            var prevSplitDiff = this._validateAndCalcSplitDiffs(previousSplit3, previousSplit2);
                            var currentSplitDiff = this._validateAndCalcSplitDiffs(currentSplit3, currentSplit2);

                            if (previousSplit3 !== null && prevLapTime !== null) {
                                this._colorTrack(prevSplitDiff, currentSplitDiff, "route3");
                                this.getModel("mapView").setProperty("/currentSection", "fourth");
                                //var splitDiff = prevLapTime - previousSplit3;
                                //this._switchAthleteTrackPart(3, splitDiff, prevSplitDiff, currentSplitDiff, "route3", "fourth", true, oLapTimes);                                    
                            } /*else {
                                this._stopAthleteonMap();
                                MessageToast.show("Fahreranimation aufgrund fehlender Streckenzeiten angehalten", { duration: 3000 });
                            }*/                           
                        }
    
                        if (split3 == null && currentLapNr < oLapTimes.CurrentLapNr && oLapTimes.CurrentLapNr !== null) {
                            //this._resetAthleteToStart(oLapTimes, false);
                            this._resetTrackColors();
                        }
    
                        if (split1 !== null && split1 < oLapTimes.CurrentLapAthleteSplit1) {
                            //this._resetAthleteToStart(oLapTimes, false);
                            this._resetTrackColors();
                        }
     
                        break;
                    case "fourth":  
                        if (currentLapNr < oLapTimes.CurrentLapNr && oLapTimes.CurrentLapNr !== null) {
                            //this._resetAthleteToStart(oLapTimes, false);
                            this._resetTrackColors();
                        }
    
                        if (split1 !== null && split1 < oLapTimes.CurrentLapAthleteSplit1) {
                            //this._resetAthleteToStart(oLapTimes, false);
                            this._resetTrackColors();
                        }
    
                        break;
                    default:
                        //this._resetAthleteToStart(oLapTimes, false);                        
                        break;
                }
            }
        },

        _moveAthleteOnMap: function (aMapData, trackPartIndex, athleteSpeed) {
            var aTrack = aMapData;
            var that = this;
            var i = trackPartIndex;

            if (trackPartIndex > aMapData.length || trackPartIndex < 0) {
                return;
            }

            var position = aTrack[i][0] + ";" + aTrack[i][1] + ";0";

            this.byId("Driver").setPosition(position);

            this.mapIntervalHandle = setInterval(function () {
                i++;

                if (i < aTrack.length) {
                    position = aTrack[i][0] + ";" + aTrack[i][1] + ";0";
                    that.byId("Driver").setPosition(position);
                }

            }, athleteSpeed);
        },

        _stopAthleteonMap: function () {
            if (this.mapIntervalHandle) {
                clearInterval(this.mapIntervalHandle);
            }
            
            this.byId("Driver").setPosition(null);
        },

        _drawRoutesOnMap: function (aMapData) {
            for (var i = 0; i < aMapData.length; i++) {
                var sPosition = "";
                var sRouteId = "route" + (i + 1);
                var aCoordinates = aMapData[i].geometry.coordinates;

                for (var n = 0; n < aCoordinates.length; n++) {
                    sPosition += aCoordinates[n][0] + ";" + aCoordinates[n][1] + ";0;";
                }

                this.byId(sRouteId).setPosition(sPosition);
            }
        },

        removeAthleteOnMap: function() {
            this.byId("Driver").setVisible("false");
        },

        _calcDiffClientStartAthleteStart: function (oClientStartTime, oAthleteStartTime) {
            return (oClientStartTime - oAthleteStartTime) / 1000;
        },

        _calcTrackSpeedLastLap: function (timeLastLapTrackPart, trackPartLength) {
            var calculatedSpeed = (1 / (trackPartLength / timeLastLapTrackPart));
            return (Math.round(calculatedSpeed * 10) / 10);
        },

        _calcMapSpeedandDistance: function (aMapData, mapIndex, splitTime, timeDiff) {
            var aSelectedTrackPart = aMapData[mapIndex].geometry.coordinates;
            var aSelectedTrackPartLength = aSelectedTrackPart.length;
            var intervallSpeedSeconds = this._calcTrackSpeedLastLap(splitTime, aSelectedTrackPartLength);
            var intervallSpeedForAnimationMilliSeconds = intervallSpeedSeconds * 1000;

            if (intervallSpeedSeconds !== 0) {
                var calculatedIndexForTrack = timeDiff / intervallSpeedSeconds;
                var roundedCalculatedIndex = Math.round(calculatedIndexForTrack) - 1;
                this._moveAthleteOnMap(aSelectedTrackPart, roundedCalculatedIndex, intervallSpeedForAnimationMilliSeconds);
            }
        },

        _colorTrack: function (prevSplit, currentSplit, routeId) {
            var colorWasFaster = "#009900";
            var colorWasSlower = "#990000";

            if (prevSplit == null || currentSplit == null) {
                return;
            }

            if (prevSplit < currentSplit) {
                this.byId(routeId).setColor(colorWasSlower);
            } else {
                this.byId(routeId).setColor(colorWasFaster);
            }
        },

        _fillTrackPartStatistic: function (sCurrentPart, prevSplit, currentSplit, sFullname, currentLapNr) {
            var title = "Noch keine Daten Verfügbar";
            var subTitle = "Aktuell liegen keine Streckeninformationen vor";
            var cardHeader = this._cardFragment.getContent()[0].getCardHeader();

            if (currentSplit !== null && prevSplit !== null) {
                var diffSplits = currentSplit - prevSplit;

                if (diffSplits < 0) {
                    diffSplits = -diffSplits;
                }

                var currentSplitMinutes = new Date(currentSplit * 1000).toISOString().substr(14, 5);
                var previousSplitMinutes = new Date(prevSplit * 1000).toISOString().substr(14, 5);
                var diffSplitMinutes = new Date(diffSplits * 1000).toISOString().substr(14, 5);

                cardHeader.setNumber(diffSplitMinutes);
                cardHeader.getSideIndicators()[0].setNumber(currentSplitMinutes);
                cardHeader.getSideIndicators()[0].setUnit("min");
                cardHeader.getSideIndicators()[0].setTitle("Akt. Runde");
                cardHeader.getSideIndicators()[1].setNumber(previousSplitMinutes);
                cardHeader.getSideIndicators()[1].setUnit("min");
                cardHeader.getSideIndicators()[1].setTitle("Letzte Runde");

                title = "Abschnitt: " + sCurrentPart + ", Runde: " + currentLapNr.toString();
                subTitle = "Auf der Strecke: " + sFullname;

                if (prevSplit < currentSplit) {
                    cardHeader.setState("Error");
                    cardHeader.setTrend("Down");
    
                } else {
                    cardHeader.setState("Good");
                    cardHeader.setTrend("Up");
                }

            }

            cardHeader.setTitle(title);
            cardHeader.setSubtitle(subTitle);
        },

        onClickTrackMarker: function (oEvent, sXmlPathandId, sTrackPart) {
            if (this._cardFragment) {
                this._cardFragment.destroy(true);
                this._cardFragment = null;
            }
            
            this._onGenericFragmentLoad(sXmlPathandId);
            var currentLapNr = this.getModel("mapView").getProperty("/currentLapNr");
            var currentFullName = this.getModel("mapView").getProperty("/currentFullName");

            switch (sTrackPart) {
                case "first":
                    var sCurrentPart = "1";
                    var prevSplit1 = this.getModel("mapView").getProperty("/previousSplit1");
                    var currentSplit1 = this.getModel("mapView").getProperty("/currentSplit1");
                    this._fillTrackPartStatistic(sCurrentPart, prevSplit1, currentSplit1, currentFullName, currentLapNr);
                    break;
                case "second":
                    var sCurrentPart = "2";
                    var prevSplitDiff = null;
                    var currentSplitDiff = null;
                    var prevSplit1 = this.getModel("mapView").getProperty("/previousSplit1");
                    var prevSplit2 = this.getModel("mapView").getProperty("/previousSplit2");
                    var currentSplit1 = this.getModel("mapView").getProperty("/currentSplit1");
                    var currentSplit2 = this.getModel("mapView").getProperty("/currentSplit2");

                    if (prevSplit1 !== null && prevSplit2 !== null && 
                        currentSplit1 !== null && currentSplit2 !== null) {
                            prevSplitDiff =  prevSplit2 - prevSplit1;
                            currentSplitDiff = currentSplit2 - currentSplit1;
                    }                    

                    this._fillTrackPartStatistic(sCurrentPart, prevSplitDiff, currentSplitDiff, currentFullName, currentLapNr);
                    break;
                case "third":
                    var sCurrentPart = "3";
                    var prevSplitDiff = null;
                    var currentSplitDiff = null;
                    var prevSplit2 = this.getModel("mapView").getProperty("/previousSplit2");
                    var prevSplit3 = this.getModel("mapView").getProperty("/previousSplit3");
                    var currentSplit2 = this.getModel("mapView").getProperty("/currentSplit2");
                    var currentSplit3 = this.getModel("mapView").getProperty("/currentSplit3");

                    if (prevSplit2 !== null && prevSplit3 !== null && 
                        currentSplit2 !== null && currentSplit3 !== null) {
                            prevSplitDiff =  prevSplit3 - prevSplit2;
                            currentSplitDiff = currentSplit3 - currentSplit2;
                    }

                    this._fillTrackPartStatistic(sCurrentPart, prevSplitDiff, currentSplitDiff, currentFullName, currentLapNr);
                    break;
            }

            oEvent.getSource().openDetailWindow("Streckenabschnitt", "0", "0");
        },


                
        onOpenDetail: function (oEvent) {
            //place the window content
            this._cardFragment.placeAt(oEvent.getParameter("contentarea").id, 'only');
        },

        onQRCodePress: function(oEvent) {
                var sLinkSrcLink = oEvent.getSource().getSrc();
                var sLinkTmpFirst = sLinkSrcLink.split("?")[1];
                var sLinkTmpSecond = sLinkSrcLink.split("?")[2];
                var sLinkToCopy = sLinkTmpFirst + "?" + sLinkTmpSecond;
                sLinkToCopy = sLinkToCopy.replace("data=", "");
                sLinkToCopy = sLinkToCopy.replace("&size=80x80", "");
                var inputElement = document.createElement("input");
                
                try {
                    navigator.clipboard.writeText(sLinkToCopy);
                    MessageToast.show("Link wurde in die Zwischenablage kopiert", { duration: 3000 });
                } catch (E) {
                    //this.handleErrorMessageBoxPress(oEvent, "File URL could not be copied");
                }
                inputElement.remove();
        }
    });

});