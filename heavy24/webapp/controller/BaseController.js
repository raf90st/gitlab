sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
	"sap/ui/core/UIComponent",
	"sap/m/library",
], function (Controller, History, UIComponent, mobileLibrary) {
	"use strict";

	// shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;
    this.bActiveLoading = false;

	return Controller.extend("teamfact.app.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter : function () {
			return UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel : function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel : function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
        },

        /**
		 * Convenience method for loading dialog fragment into memory and open it.
		 * 
		 * @private
		 * @param {string}
		 *            [sXmlPathAndId] concatinated string of fragment data path and dialog id separated by % sign
		 */
		_onGenericFragmentLoad: function (sXmlPathAndId) {
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
			
			//this[sId].open();
		},

		/**
		 * Convenience method for closing a dialog.
		 * 
		 * @private
		 * @param {string}
		 *            [sId] the Dialog Id
		 */
		_onGenericFragmentclose: function (sId) {
			this[sId].close();
		},

        onExit: function() {
            this.stopAutomaticLoad();
        },
        
        onNavBack: function () {
			var oHistory, sPreviousHash;

			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				//this.getRouter().navTo("appHome", {}, true /*no history*/);
			}
        },

        // called from BaseController
        onSwitchLoading: function () {
            if (this.bActiveLoading) {
                this.stopAutomaticLoad();                                                                              
            } else {
                this.startAutomaticLoad(10); // every 10 sec              
            }
        },

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle : function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        }
        
    });

});