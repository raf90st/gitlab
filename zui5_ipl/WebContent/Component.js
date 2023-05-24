sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/History",
	"sap/ui/model/resource/ResourceModel",
	"juliusbaer/ipl/model/models"
], function(UIComponent, History, Device, models) {
	"use strict";
	return UIComponent.extend("juliusbaer.ipl.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			
			this.setModel(models.createGlobalModel(), "global");
			
			this.setModel(models.createTileModel(), "tiles");
			
			// create the views based on the url/hash
			this.getRouter().initialize();
		},
		
		myNavBack: function () {
			var oHistory = History.getInstance();
			var oPrevHash = oHistory.getPreviousHash();
			if (oPrevHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("masterSettings", {}, true);
			}
		},

		getContentDensityClass: function () {
			if (!this._sContentDensityClass) {
				if (!sap.ui.Device.support.touch){
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}
	});
});