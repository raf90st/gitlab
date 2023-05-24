sap.ui.define([
	'juliusbaer/rmct/controller/BaseController',
	'sap/ui/core/Fragment',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/ResponsivePopover',
	'sap/m/MessagePopover',
	'sap/m/ActionSheet',
	'sap/m/Button',
	'sap/m/Link',
	'sap/m/Bar',
	'sap/ui/layout/VerticalLayout',
	'sap/m/NotificationListItem',
	'sap/m/MessagePopoverItem',
	'sap/ui/core/CustomData',
	'sap/m/MessageToast',
	'sap/ui/Device',
	'sap/ui/core/syncStyleClass',
	'sap/m/library'
], function(
	BaseController,
	Fragment,
	Controller,
	JSONModel,
	ResponsivePopover,
	MessagePopover,
	ActionSheet,
	Button,
	Link,
	Bar,
	VerticalLayout,
	NotificationListItem,
	MessagePopoverItem,
	CustomData,
	MessageToast,
	Device,
	syncStyleClass,
	mobileLibrary
) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	// shortcut for sap.m.VerticalPlacementType
	var VerticalPlacementType = mobileLibrary.VerticalPlacementType;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	return BaseController.extend("juliusbaer.rmct.controller.App", {

		_bExpanded: true,

		onInit: function() {
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

			// if the app starts on desktop devices with small or meduim screen size, collaps the sid navigation
			if (Device.resize.width <= 1024) {
				this.onSideNavButtonPress();
			}
			Device.media.attachHandler(function (oDevice) {
				if ((oDevice.name === "Tablet" && this._bExpanded) || oDevice.name === "Desktop") {
					this.onSideNavButtonPress();
					// set the _bExpanded to false on tablet devices
					// extending and collapsing of side navigation should be done when resizing from
					// desktop to tablet screen sizes)
					this._bExpanded = (oDevice.name === "Desktop");
				}
			}.bind(this));
			
			//Load Users from Backend for UserValueHelpSearch
			this.loadUsers();
			
			//Load Pools
			this.loadPools();
			
			//Load Pool + Users for Cleanup Tool
			this.loadPoolUsersForCleanupTool();
			
			//Load Locations
			this.loadLocations();
			
			//Load Prospects
			this.loadProspects();
			
			//Load Release Periods for Admin Section
			this.loadReleasePeriod();
			
			//Load Master Data
			this.loadMdData();
			
			//Load E-Mail Texts for Admin Section
			this.loadEmailTexts();
			
			//set Reset Comment Flag to false
			this.initResetCommentFlag();
		},
		
		onAfterRendering: function () {
			this.setNavToCurrentHash();
			this.checkIfTestSystem();
		},
		
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @param {sap.ui.base.Event} oEvent The item select event
		 */
		onItemSelect: function(oEvent) {
			var oItem = oEvent.getParameter('item');
			var sKey = oItem.getKey();
			
			// some Navbar items are just loading fragments
			switch (sKey) {
				case "cce":
					this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.CCELoadDialog%_cceLoadDialog');
					break;
				case "cleanup":
					this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.CleanUpProfilesDialog%_cleanUpDialog');
					break;
				case "release":	
					this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.ReleaseDialog%_releaseDialog');
					break;
				case "reset":
					this.onGenericFragmentLoad(oEvent, 'juliusbaer.rmct.fragment.dialogs.ResetRequestDialog%_resetRequestDialog');
					break;
			}
			
			// call the navTo function
			if (sKey === "profile" || sKey === "rm" || sKey === "pool" || sKey === "simcockpit" || 
				sKey === "prospect" || sKey === "descretionaryrm" || sKey === "calcscorecard" || sKey === "reports" || 
				sKey === "mainITA" || sKey === "copyprofiles" || sKey === "masterdata" || sKey === "authorizations" || 
				sKey === "email" || sKey === "compmodels" || sKey === "compparams" || sKey === "payoutCurves" || 
				sKey === "growthRates" || sKey === "simCurrency" || sKey === "growthRateAbs" || sKey === "simYearPerCountry" ||
				sKey === "simTool") {
				// if the device is phone, collaps the navigation side of the app to give more space
				if (Device.system.phone) {
					this.onSideNavButtonPress();
				}
				this.getRouter().navTo(sKey);
			}
		},

		onSideNavButtonPress: function() {
			var oToolPage = this.byId("app");
			var bSideExpanded = oToolPage.getSideExpanded();
			this._setToggleButtonTooltip(bSideExpanded);
			oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
		},

		_setToggleButtonTooltip : function(bSideExpanded) {
			var oToggleButton = this.byId('sideNavigationToggleButton');
			if (bSideExpanded) {
				oToggleButton.setTooltip('Large Size Navigation');
			} else {
				oToggleButton.setTooltip('Small Size Navigation');
			}
		}

	});
});