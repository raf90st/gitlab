sap.ui.define([
    "sap/ui/base/ManagedObject",
	"sap/ui/core/Fragment",
	"sap/ui/core/syncStyleClass",
	"sap/m/MessageToast"
], function (ManagedObject, Fragment, syncStyleClass, MessageToast) {
	"use strict";

	return ManagedObject.extend("admin.controller.Waitmessage", {

		constructor : function (oView) {
			this._oView = oView;
		},

		exit : function () {
			delete this._oView;
		},

		onOpenDialog: function () {
			// load BusyDialog fragment asynchronously
			if (!this._pBusyDialog) {
				this._pBusyDialog = Fragment.load({
					name: "admin.view.Waitmessage",
					controller: this
				}).then(function (oBusyDialog) {
					this.getView().addDependent(oBusyDialog);
					syncStyleClass("sapUiSizeCompact", this.getView(), oBusyDialog);
					return oBusyDialog;
				}.bind(this));
			}

			this._pBusyDialog.then(function(oBusyDialog) {
				oBusyDialog.open();
				this.simulateServerRequest();
			}.bind(this));
		},

		simulateServerRequest: function () {
			// simulate a longer running operation
			iTimeoutId = setTimeout(function() {
				this._pBusyDialog.then(function(oBusyDialog) {
					oBusyDialog.close();
				});
			}.bind(this), 3000);
		},

		onDialogClosed: function (oEvent) {
			clearTimeout(iTimeoutId);

			if (oEvent.getParameter("cancelPressed")) {
				MessageToast.show("The operation has been cancelled");
			} else {
				MessageToast.show("The operation has been completed");
			}
		}

	});

});