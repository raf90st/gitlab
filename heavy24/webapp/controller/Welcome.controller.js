sap.ui.define([
	"./BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("teamfact.app.controller.Welcome", {

		/**
		 * Navigates to xxx when the link is pressed
		 * @public
		 */
		onLinkPressed : function () {
			this.getRouter().navTo("athletes");
		}

	});

});