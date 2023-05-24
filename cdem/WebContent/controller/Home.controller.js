sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../model/formatter",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter"
], function(Controller, formatter, MessageToast, MessageBox, Fragment, Filter) {
	"use strict";

	return Controller.extend("juliusbaer.cdem.controller.Home", {
		
		/**
		 * Convenience method for getting the view model by name.
		 * 
		 * @public
		 * @param {string}
		 *            [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel : function (sName) {
			return this.getView().getModel(sName);
		},
			
		showMessage: function(sMsg) {
			MessageToast.show(sMsg);
		},
		
		handleErrorMessageBoxPress: function(oEvent, sErrorMsg) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.error(
				sErrorMsg,
				{
					styleClass: bCompact ? "sapUiSizeCompact" : ""
				}
			);
		},

		formatter: formatter,

		onInit: function (oEvent) {
			this.getOwnerComponent().getModel().callFunction('/GetUserInformation',{
				method: 'GET',
				urlParameters: {
				},
				success: (data) => {
					this.getModel("global").setProperty("/currentUser", data.unumber);
				},
				error: (oError) =>
				{
					var sErrorMsg = JSON.parse(oError.getParameter("response").responseText).error.message.value;
					this.handleErrorMessageBoxPress(oError, sErrorMsg);
				}		
			})
		},
		
		handleAuthError: function(oError) {
			if (oError.getParameter("response")) {
				var sErrorMsg = JSON.parse(oError.getParameter("response").responseText).error.message.value;
				this.handleErrorMessageBoxPress(oError, sErrorMsg);
			}
		},
		
		onPressLookupZR: function(oEvent) {
			var bErrorHandlerInitialized = this.getModel("global").getProperty("/errorHandlerAttached");
			
			if (!bErrorHandlerInitialized) {
				this.getModel().attachRequestFailed(function (oError) {
					this.handleAuthError(oError);
				}, this);
				this.getModel("global").setProperty("/errorHandlerAttached", true);
			}
			
			if (oEvent.getParameter("clearButtonPressed")) {
				this.byId("commentNecessary").setVisible(false);
				this.byId("commentField").setEditable(false);
				this.byId("cidWarning").setVisible(false);
				this.getModel("global").setProperty("/cdExceptionSelected", false);
				this.getModel("global").setProperty("/commentFieldEditable", false);
				this.resetSelectedCalcValues();
				this.getView().unbindElement();
				return;
			}
			
			var zr = this.byId("ZRInput").getValue();
			
			if (zr && zr !== '') {
				var sPath = "zrNumber='" + zr + "'";
				this.getModel("global").setProperty("/domicileTableBusy", true);
				this.resetSelectedCalcValues();
					
				this.getView().bindElement({												
					path : "/SelectedZRSet(" + sPath + ")",
					parameters : {						
						expand: "DomicilesForZR"
					},
					events : {
						dataReceived: (oEvent) => {
							var data = oEvent.getParameter("data");
							this.getModel("global").setProperty("/domicileTableBusy", false);
							
							if (data && data.DomicilesForZR.length > 0) {
								this.byId("commentField").setEditable(true);
								this.byId("cidWarning").setVisible(true);
								
								for (var i = 0; i < data.DomicilesForZR.length; i++) {
									if (data.DomicilesForZR[i].cdException) {
										this.getModel("global").setProperty("/cdExceptionSelected", true);
										this.getModel("global").setProperty("/exceptionCountry", data.DomicilesForZR[i].mainCountry);
									}
									
									if (data.DomicilesForZR[i].cdCalculated) {
										this.getModel("global").setProperty("/comDomicile", data.DomicilesForZR[i].mainCountry);
									}
									
									if (data.DomicilesForZR[i].businessRule !== '') {
										this.getModel("global").setProperty("/businessRule", data.DomicilesForZR[i].businessRule);
									}
								}
								
								if (this.getModel("global").getProperty("/cdExceptionSelected")) {
									if (data.comment === '') {
										this.byId("commentNecessary").setVisible(true);
										return;
									}
									this.byId("saveButton").setEnabled(true);
								}
							}								
						}						
					}
				});
			}
		},
		
		onPressSaveZR: function(oEvent) {
			if (this.getView().getModel().hasPendingChanges()) {
				var sPath = this.getView().getBindingContext().getPath();
				var oSelectedZr = this.getView().getBindingContext().getObject();
				//remove domiciles Array for update method
				delete oSelectedZr.DomicilesForZR;
				
				this.getModel().update(sPath, oSelectedZr, {
					success: (oData) => {
						this.showMessage("Save Successful!");
						this.getView().getElementBinding().getModel().refresh(true);
					},
					error: (oError) => {
						var sErrorMsg = JSON.parse(oError.responseText).error.message.value;
                        this.handleErrorMessageBoxPress(oEvent, sErrorMsg);
					}
				});
			} else {
				this.showMessage("No Changes to submit");
			}
		},
		
		toggleException: function(oEvent) {
			var oSelectedBrId = oEvent.getSource().getParent().getBindingContext().getObject().brID;
			var oSelectedPbId = oEvent.getSource().getParent().getBindingContext().getObject().pbID;
			var oSelectedPuId = oEvent.getSource().getParent().getBindingContext().getObject().puID;
			var aRows = oEvent.getSource().getParent().getParent().getBinding().getContexts();
			
			if (oEvent.getSource().getSelected()) {
				this.getModel("global").setProperty("/cdExceptionSelected", true);
				
				if (this.getView().getBindingContext().getObject().comment === '') {
					this.byId("saveButton").setEnabled(false);
				}
				
				for (var i = 0; i < aRows.length; i++) {
					var oItem = aRows[i].getObject();
					var sPath = aRows[i].getPath() + "/cdException";
									
					if (oItem.brID === oSelectedBrId &&
						oItem.pbID === oSelectedPbId &&
						oItem.puID === oSelectedPuId) 
					{
						var oSelectedZrPath = this.getView().getBindingContext().getPath();
						this.getModel("global").setProperty("/exceptionCountry", oItem.mainCountry);
						this.getView().getModel().setProperty(oSelectedZrPath + "/mainCountryCode", oItem.mainCountryCode);
						this.getView().getModel().setProperty(oSelectedZrPath + "/brID", oItem.brID);
						this.getView().getModel().setProperty(oSelectedZrPath + "/pbID", oItem.pbID);
						this.getView().getModel().setProperty(oSelectedZrPath + "/puID", oItem.puID);
					} else {
						this.getView().getModel().setProperty(sPath, false);
					}
				}
			} else {
				this.getModel("global").setProperty("/cdExceptionSelected", false);
				this.getModel("global").setProperty("/exceptionCountry", "Not defined");
				this.byId("saveButton").setEnabled(true);
			}
		},
		
		checkCommentField: function(oEvent) {
			if (this.getModel("global").getProperty("/cdExceptionSelected")) {
				if (oEvent.getSource().getValue() === '') {
					this.byId("commentNecessary").setVisible(true);
					this.byId("saveButton").setEnabled(false);
					this.showMessage("Please enter a comment to proceed");
				} else {
					this.byId("commentNecessary").setVisible(false);
					this.byId("saveButton").setEnabled(true);
				}
			}
		},
		
		resetSelectedCalcValues: function() {
			this.getModel("global").setProperty("/businessRule", "Not calculated");
			this.getModel("global").setProperty("/exceptionCountry", "Not defined");
			this.getModel("global").setProperty("/comDomicile", "Not calculated");
		}
	});
});