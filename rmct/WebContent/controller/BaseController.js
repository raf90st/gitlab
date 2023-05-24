sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/core/Fragment",
	"sap/m/Label",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/HTML",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/type/String",
	"sap/m/Token",
	"sap/m/StandardListItem",
	"sap/ui/core/library"
], function(Controller, UIComponent, Fragment, Label, Filter, FilterOperator, JSONModel, HTML, MessageToast, MessageBox, NumberFormat, typeString, Token, StandardListItem, CoreLibrary) {
	"use strict";
	
	// Field Validation
	var ValueStateBc = CoreLibrary.ValueState;

	return Controller.extend("juliusbaer.rmct.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * 
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter : function () {
			return UIComponent.getRouterFor(this);
		},

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

		/**
		 * Convenience method for setting the view model.
		 * 
		 * @public
		 * @param {sap.ui.model.Model}
		 *            oModel the model instance
		 * @param {string}
		 *            sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel : function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},
		
		getInputLabel : function (sDescription) {
			return new Label({text: sDescription})
		},
		
		formatLatestPayoutDate: function(value) {
			if(!value || value === "0000000" || value === "000000") {
				return "";
			}
			
			return [value.slice(4), ".", value.slice(0, 4)].join("");
		},
		
		writeBackFormatLatestPayoutDate: function(value) {
			var val = value.replace(".", "");
			return [val.slice(2, 6), "", val.slice(0, 2)].join("");
		},
		
		formatTransferPeriods: function(value) {
			if(!value || value === "0000000" || value === "000000" || value === "") {
				return "";
			}
			
			return [value.slice(5), ".", value.slice(0, 4)].join("");
		},
		
		writeBackFormatTransferPeriods: function(value) {
			var val = value.replace(".", "");
			
			return [val.slice(2, 6), "0", val.slice(0, 2)].join("");
		},
		
		writeBackFormatCalendarMonthYear: function(value) {
			return [value.slice(3), value.slice(0, 2)].join("");
		},
		
		validateTransferPeriodInput: function (sPeriod) {
			if (sPeriod.includes(".")) {
				var aValues = sPeriod.split(".");
				var month = aValues[0];
				var year = aValues[1];
				var integerMonth = 0;
				var thisRegexMonth;
				var thisRegexYear = new RegExp('^([0-9][0-9][0-9][0-9])$');
				
				if (month.length < 3) {
					month = "0" + month;
				}
				
				if (!isNaN(month)) {
					integerMonth = parseInt(month);
				}
				
				if (integerMonth < 10) {
					thisRegexMonth = new RegExp('^([0][0][0-9])$');
				} else {
					thisRegexMonth = new RegExp('^([0][1][0-2])$');
				}
				
				var monthValidated = thisRegexMonth.test(month);
				var yearValidated = thisRegexYear.test(year);
				
				if (monthValidated && yearValidated) {
					return true;
				}
			}
			
			return false;
		},
		
		validateNonFinancialGoal: function(sValue) {
			if (sValue.includes(".")) {
				var aValues = sValue.split(".");
				var sNumber = aValues[0];
				var sDecimal = aValues[1];
				var thisRegexNumber = new RegExp('^([1-4])$');
				var thisRegexDecimal;
				var integerNumber = 0;
				
				if (sDecimal.length < 2) {
					sDecimal = sDecimal + "0";
				}
				
				if (!isNaN(sNumber)) {
					integerNumber = parseInt(sNumber);
				}
				
				if (integerNumber < 4) {
					thisRegexDecimal = new RegExp('^([0-9][0-9])$');
				} else {
					thisRegexDecimal = new RegExp('^([0][0])$');
				}
				
				var numberValidated = thisRegexNumber.test(sNumber);
				var decimalValidated = thisRegexDecimal.test(sDecimal);
				
				if (numberValidated && decimalValidated) {
					return true;
				}
			}
			
			return false;
		},
		
		setItaModel: function(sModelname, sModelType) {
			var unumber = "";
			var year = "";
			var name = "";
			var poolNumber = "";
			
			switch (sModelType) {
				case "rmITA":
					unumber = this.getModel("global").getProperty("/selectedRM/unumber");
					year = this.getModel("global").getProperty("/selectedRM/year");
					name = this.getModel("global").getProperty("/selectedRM/name");
					break;
				case "poolITA":
					poolNumber = this.getModel("global").getProperty("/selectedPool/poolNumber");
					year = this.getModel("global").getProperty("/selectedPool/year");
					break;
			}
			
			var oNewItaModel = new JSONModel({
				"bofflag": false,
				"closingdate" : "",
				"itaflag": false,
				"LegalEntity": "",
				"LegalEntityTxt": "",
				"Market": "",
				"MarketTxt": "",
				"newname": name,
				"newrm": unumber,
				"orgname": "",
				"orgrm" : "",
				"period": "",
				"periodExt": "",
				"poolNumber": poolNumber,
				"Region": "",
				"RegionTxt": "",
				"request": "",
				"year": year,
				"unumber": unumber,
				"zr": ""
			})
			
			this.getView().setModel(oNewItaModel, sModelname);
		},
		
		setKpiCorrectionsModel: function(sModelname, sKey) {
			var unumber = "";
			var year = "";
			var name = "";
			var poolNr = "";
			
			if (sKey === "RMKPI") {
				unumber = this.getModel("global").getProperty("/selectedRM/unumber");
				year = this.getModel("global").getProperty("/selectedRM/year");
				name = this.getModel("global").getProperty("/selectedRM/name");
			} else {
				poolNr = this.getModel("global").getProperty("/selectedPool/poolNumber");
				year = this.getModel("global").getProperty("/selectedPool/year");
			}
			
			var oNewKpiCorrectionsModel = new JSONModel({
				"period" : "",
				"periodExt": "",
				"name": name,
				"nnm": "",
				"aum": "",
				"pciown": "",
				"teamhcann": "",
				"nnmmtd": "",
				"aumt2": "",
				"persexpenses": "",
				"genexpenses": "",
				"provlosses": "",
				"pandscharges": "",
				"cocytd": "",
				"pc1ytd": "",
				"currency": "CHF",
				"zr": "",				
				"year": year,
				"unumber": unumber,
				"type": "00",
				"poolNumber": poolNr,
				"remark": ""
			})
			
			this.getView().setModel(oNewKpiCorrectionsModel, sModelname);
		},
		
		copyDir: function(oEvent) {
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			var removeU = unumber.replace("U", "");
			var fileURL = "O:/ZRH/CHEC/_Contract Documents/" + removeU; 
		    var inputElement = document.createElement("input");
		    
		    try {
		        document.body.append(inputElement);
		        inputElement.value = fileURL;
		        inputElement.select();
		        document.execCommand("copy");
		        this.showMessage("File URL has been copied to clipboard, use ctrl + v in Windows Explorer");
		    } catch (E) {
		    	this.handleErrorMessageBoxPress(oEvent, "File URL could not be copied");
		    }
		    
		    inputElement.remove();
		},
		
		initResetCommentFlag: function() {
			this.getModel("global").setProperty("/resetRequest/resetComments", false);
		},
		
		loadUsers: function() {
			this.getView().getModel().read("/UsersSet", {
				success: (data) => {
					if(data.results.length > 0) {
						this.getModel("global").setProperty("/users", data.results);
					}
				}
			})
		},
		
		loadPools: function() {
			this.getView().getModel().read("/PoolSet", {
				success: (data) => {
					this.getModel("global").setProperty("/pools", data.results);
				}
			})
		},
		
		loadPoolUsersForCleanupTool: function() {
			var aUsers = [];
			var aPools = [];
			var aUsersPools = [];
			
			this.getView().getModel().read("/UsersSet", {
				success: (data) => {
					aUsers = data.results;
					this.getView().getModel().read("/PoolSet", {
						success: (data) => {
							data.results.forEach((row) => {
								var obj = {
									"unumber": row.poolNumber,
									"name": row.poolName
								}
								
								aPools.push(obj);
							});
							
							aUsersPools = aUsers.concat(aPools);
							this.getModel("global").setProperty("/cleanupPoolsUsers", aUsersPools);
						}
					})
				}
			})
		},
		
		loadProspects: function() {
			this.getView().getModel().read("/ProspectDataSet", {
				success: (data) => {
					if(data.results.length > 0) {
						this.getModel("global").setProperty("/prospects", data.results);
					}
				}
			})
		},
		
		loadLocations: function() {
			this.getView().getModel().read("/LocationSet", {
				success: (data) => {
					if(data.results.length > 0) {
						this.getModel("global").setProperty("/locations", data.results);
					}
				}
			})
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
		
		openUrl: function(url, newTab) {
		    // Require the URLHelper and open the URL in a new window or tab
			// (same as _blank):
		    sap.ui.require([ "sap/m/library" ], ({URLHelper}) => URLHelper.redirect(url, newTab));
		},
		
		checkIfTestSystem: function() {
			var currentURL = window.location.href;
			var urlParts = currentURL.split("/");
			var domain = urlParts[2];
			
			if (domain.includes("sap-12q.juliusbaer.com") || domain.includes("sap-12e.juliusbaer.com")) {
				this.byId("testDevMsg").setVisible(true);
			}
		},
					
		setNavToCurrentHash: function () {
			const router = this.getRouter();
			var currentHash = router.getHashChanger().getHash().toLowerCase();
			var keyToSelect = currentHash.split("/");
			var oNavList = this.byId("navList");
			
			if (keyToSelect[0] === "") {
				oNavList.setSelectedKey("rm");
				return;
			}
			
			oNavList.setSelectedKey(keyToSelect[0]);
		},
		
		loadSimCockpitUsers: function () {
			this.getView().getModel().read("/SimulationCockpitSet", {
				success: (data) => {
					if(data.results.length > 0) {
						this.getModel("global").setProperty("/simCockpitUsers", data.results);
					}
				}
			})
		},
		
		loadSimCockpitUsersWithFilter: function(oFilter) {
			var odefFilter = oFilter;
			
			this.getView().getModel().read("/SimulationCockpitSet", {
				filters: [oFilter],
				success: (data) => {
					this.getModel("global").setProperty("/simCockpitUsers", data.results);
				}
			})
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
		
		handleUsersValueHelp : function (oEvent) {
			// create value help dialog
			if (!this._usersValueHelpDialog) {
				this._usersValueHelpDialog = sap.ui.xmlfragment(
					"juliusbaer.rmct.fragment.dialogs.userValueHelpDialog",
					this
				);
				this.getView().addDependent(this._usersValueHelpDialog);
			}			
			
			this._usersValueHelpDialog.open();
		},
		
		_handleUsersValueHelpSearch : function (evt) {
			var sValue = evt.getParameter("value");
			var aFilters = [];
			
			var oNameFilter = new Filter({
				path: "name",
				operator: FilterOperator.Contains,
				value1: sValue,
				caseSensitive: false
			});
			
			var oUnumberFilter = new Filter({
				path: "unumber",
				operator: FilterOperator.Contains,
				value1: sValue,
				caseSensitive: false
			});
			
			aFilters.push(oNameFilter);
			aFilters.push(oUnumberFilter);
			
			var oFilter = new Filter(aFilters, false);
			evt.getSource().getBinding("items").filter(oFilter);
		},
		
		_handleLocationValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");
			var aFilters = [];
			
			var oNameFilter = new Filter({
				path: "Id",
				operator: FilterOperator.Contains,
				value1: sValue,
				caseSensitive: false
			});
			
			var oUnumberFilter = new Filter({
				path: "Text",
				operator: FilterOperator.Contains,
				value1: sValue,
				caseSensitive: false
			});
			
			aFilters.push(oNameFilter);
			aFilters.push(oUnumberFilter);
			
			var oFilter = new Filter(aFilters, false);
			evt.getSource().getBinding("items").filter(oFilter);
		},
		
		
		_handleLocationValueLiveChange: function(oEvent) {
			var oBinding = oEvent.getSource().getBinding("items");
			var sUser = oEvent.getParameter("value");
			
			var aFilters = [];
			
			var oNameFilter = new Filter({
				path: "Id",
				operator: FilterOperator.Contains,
				value1: sUser,
				caseSensitive: false
			});
			
			var oUnumberFilter = new Filter({
				path: "Text",
				operator: FilterOperator.Contains,
				value1: sUser,
				caseSensitive: false
			});
			
			aFilters.push(oNameFilter);
			aFilters.push(oUnumberFilter);
			
			var oFilter = new Filter(aFilters, false);
			
			// var aFilter =[ new Filter("name","Contains",sUser)];
			oBinding.filter(oFilter);
		},
		
		_handleLocationValueHelpClose: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			
			if (oSelectedItem) {
				if(!this.NewPoolOpened){
					var oModel = this.getView().getBindingContext().getObject();
					var oData = {};
					
					for (const property in oModel) {
						if (typeof oModel[property] === "boolean" || typeof oModel[property] === "string") {
							oData[property] = oModel[property];
						}
					}
					
					var year = oModel.year;
					var poolNr = oModel.poolNumber;
					
					var updatePath = "poolNumber='" + poolNr + "',year='" + year + "'";
					
					oData.PersSarea    = oSelectedItem.getDescription();
					oData.PersSareaTxt = oSelectedItem.getTitle();
					
					this.getModel().update("/PoolProfileSet(" + updatePath + ")", oData, {
						success: (data) => {
							this.showMessage("Pool Profile successfully updated!");
							this.loadPoolProfile(poolNr, year);
						},
						error: (oError) => {
							this.handleErrorMessageBoxPress(oEvent, "Pool Profile could not be updated");
						}
					});
				} else {
					var locationId = oSelectedItem.getDescription();
					var locationTxt = oSelectedItem.getTitle();
					this.getModel("newPoolProfile").setProperty("/PersSarea", locationId);
					this.getModel("newPoolProfile").setProperty("/PersSareaTxt", locationTxt);
					this.additionalInfoValidation();
				}
			}
			
		},
		
		_handleUsersPoolsValueHelpClose: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			
			if (oSelectedItem) {
				var unumber = oSelectedItem.getDescription();
				var name = oSelectedItem.getTitle();
				this.getModel("global").setProperty("/cleanup/unumber", unumber);
				this.getModel("global").setProperty("/cleanup/name", name);
			}
		},
		
		_handleZrValueHelpSearch: function(evt) {
			var sValue = evt.getParameter("value");
			var aFilters = [];
			
			var oNameFilter = new Filter({
				path: "zr",
				operator: FilterOperator.Contains,
				value1: sValue,
				caseSensitive: false
			});
			
			aFilters.push(oNameFilter);
			
			var oFilter = new Filter(aFilters, false);
			evt.getSource().getBinding("items").filter(oFilter);
		},
		
		_handleTpValueHelpSearch: function(evt) {
			var sValue = evt.getParameter("value");
			var aFilters = [];
			
			var oNameFilter = new Filter({
				path: "fiscperiod",
				operator: FilterOperator.Contains,
				value1: sValue,
				caseSensitive: false
			});
			
			var oMonthFilter = new Filter({
				path: "desc",
				operator: FilterOperator.Contains,
				value1: sPeriod,
				caseSensitive: false
			});
			
			aFilters.push(oNameFilter);
			aFilters.push(oMonthFilter);
			
			var oFilter = new Filter(aFilters, false);
			evt.getSource().getBinding("items").filter(oFilter);
		},
		
		_handleUsersValueHelpClose : function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			
			if (oSelectedItem) {
				var unumber = oSelectedItem.getDescription();
				var year = this.getModel("global").getProperty("/selectedRM/year");
				this.getRouter().navTo("rmWithUnumber", {unumber: unumber, year: year});
			}
			evt.getSource().getBinding("items").filter([]);
		},
		
		_handleApprovingManagersValueHelpClose: function(evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var unumber = oSelectedItem.getDescription();
				var name = oSelectedItem.getTitle();
				
				this.getModel("global").setProperty("/relationshipManager/approvemgr", unumber);
				this.getModel("global").setProperty("/relationshipManager/approvemgrname", name);
				this.onRmDataChange();
			}
		},
		
		_handleProspectValueHelpConfirm: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedContexts")[0].getObject();
			var prospectId = oSelectedItem.Id;
			
			if (prospectId) {
				this.getRouter().navTo("prospectWithXNumber", {prospect: prospectId});
			}
		},
			
		onZrValueHelpRequest: function(oEvent, sKey) {
			this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.ZrValueHelpDialog%_zrValueHelpDialog");
			this.getModel("global").setProperty("/selectedRM/dataKey", sKey);
			this._zrValueHelpDialog.attachConfirm(this.onZrValueHelpConfirm, this);
		},
		
		onZrValueHelpConfirm: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var sKey = this.getModel("global").getProperty("/selectedRM/dataKey");
			
			if (oSelectedItem) {
				var zr = oSelectedItem.getTitle();
				
				switch (sKey) {
					case "newITA":
						this.getModel("newITA").setProperty("/zr", zr);
						break;
					case "newKPICorr":
						this.getModel("newKpiCorrection").setProperty("/zr", zr);
						break;
					case "newExclusion":
						this.getModel("newExclusion").setProperty("/rmid", zr);
						break;
					case "newLtdKpi":
						this.getModel("newKpiRec").setProperty("/instance", zr);
						break;
					case "editKPIModel":
						this.getModel("editKPIModel").setProperty("/zr", zr);
						//this.onKPIValuesChanged(oEvent);
						break;
					case "newPoolITA":
						this.getModel("newPoolITA").setProperty("/zr", zr);
						break;
					case "newPoolKPICorr":
						this.getModel("newPoolKpiCorrection").setProperty("/zr", zr);
						break;
					case "newPoolLtdKpi":
						this.getModel("newPoolKPIRec").setProperty("/instance", zr);
						break;
				}
			}
			
			this._zrValueHelpDialog.detachConfirm(this.onZrValueHelpConfirm, this);	
		},

		onUserValueNewDataHelpRequest: function(oEvent, sKey) {
			this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.UserValueHelpNewData%_usersValueHelpNewDataDialog");
			this.getModel("global").setProperty("/selectedRM/dataKey", sKey);
			this._usersValueHelpNewDataDialog.attachConfirm(this.onUserValueNewDataHelpConfirm, this);
		},
		
		onUserValueNewDataHelpConfirm: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var sKey = this.getModel("global").getProperty("/selectedRM/dataKey");
			
			if (oSelectedItem) {
				var unumber = oSelectedItem.getDescription();
				var name = oSelectedItem.getTitle();
				
				switch (sKey) {
					case "newITA":
						this.getModel("newITA").setProperty("/orgrm", unumber);
						break;
					case "PoolContact":
						this.byId("poolContactId").setValue(unumber);
						this.byId("poolContactText").setText(name);
						break;
					case "newPoolMember":
						this.getModel("newPoolMember").setProperty("/unumber", unumber);
						this.getModel("newPoolMember").setProperty("/name", name);
						break;
					case "newPoolMemberNewPool":
						this.getModel("newPoolMemberNewPool").setProperty("/unumber", unumber);
						this.getModel("newPoolMemberNewPool").setProperty("/name", name);
						break;
					case "PoolContactNewPool":
						this.getModel("newPoolProfile").setProperty("/contact", unumber);
						this.getModel("newPoolProfile").setProperty("/contactName", name);
						break;
					case "newPoolITA":
						this.getModel("newPoolITA").setProperty("/orgrm", unumber);
						break;
					case "newMainITANewRM":
						this.getModel("newITA").setProperty("/newrm", unumber);
						this.getModel("newITA").setProperty("/newname", name);
						break;
					case "newMainITAOrgRM":
						this.getModel("newITA").setProperty("/orgrm", unumber);
						this.getModel("newITA").setProperty("/orgname", name);
						break;
					case "cleanup":
						this.getModel("global").setProperty("/cleanup/unumber", unumber);
						this.getModel("global").setProperty("/cleanup/name", name);
						break;
					case "newAuthorization":
						this.getModel("newAuth").setProperty("/User", unumber);
						break;
					case "newProspect":
						this.getModel("newProspect").setProperty("/unumber", unumber);
						break;
				}
			}
			
			this._usersValueHelpNewDataDialog.detachConfirm(this.onUserValueNewDataHelpConfirm, this);
		},
		
		onTransferPeriodHelpRequest: function(oEvent, sKey) {
			this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.TransferPeriodsValueHelpDialog%_tpValueHelpDialog");
			
			if (sKey === "modExclusionFrom" || sKey === "modExclusionTo") {
				var index = oEvent.getSource().getParent().getIndex();
				var selectedData = oEvent.getSource().getParent().getParent().getContextByIndex(index).getObject();
				this.exclusionDataRow = selectedData;
			}
			
			if (sKey === "modITA" || sKey === "modMainITA") {
				var index = oEvent.getSource().getParent().getIndex();
				var selectedData = oEvent.getSource().getParent().getParent().getContextByIndex(index).getObject();
				this.ITADataRow = selectedData;
			}
			
			if (sKey === "modPoolITA") {
				var index = oEvent.getSource().getParent().getIndex();
				var selectedData = oEvent.getSource().getParent().getParent().getContextByIndex(index).getObject();
				this.poolITADataRow = selectedData;
			}
			
			if (sKey === "modEAMsFrom" || sKey === "modEAMsTo") {
				var index = oEvent.getSource().getParent().getIndex();
				var selectedData = oEvent.getSource().getParent().getParent().getContextByIndex(index).getObject();
				this.decEAMsDataRow = selectedData;
				this.eamIndex = index;
				this.inputEvent = oEvent.getSource();
			}
			
			if (sKey === "modPoolEAMsFrom" || sKey === "modPoolEAMsTo") {
				var index = oEvent.getSource().getParent().getIndex();
				var selectedData = oEvent.getSource().getParent().getParent().getContextByIndex(index).getObject();
				this.decPoolEAMsDataRow = selectedData;
			}
			
			this.getModel("global").setProperty("/selectedRM/dataKey", sKey);
			this._tpValueHelpDialog.dataKey = sKey;
			this._tpValueHelpDialog.attachConfirm(this.onTransferPeriodConfirm, this);
		},
		
		onTransferPeriodConfirm: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var sKey = this.getModel("global").getProperty("/selectedRM/dataKey");
			
			if (oSelectedItem) {
				var period = oSelectedItem.getTitle();
				
				switch (sKey) {
					case "newKPICorrection":
						this.getModel("newKpiCorrection").setProperty("/periodExt", period);
						sap.ui.getCore().byId("kpiTransferPeriod").fireLiveChange();
						break;
					case "newPoolKPICorrection":
						this.getModel("newKpiCorrection").setProperty("/periodExt", period);
						sap.ui.getCore().byId("poolKpiTransferPeriod").fireLiveChange();
						break;
					case "newITA":
						this.getModel("newITA").setProperty("/periodExt", period);
						break;
					case "newExclusionFrom":
						this.getModel("newExclusion").setProperty("/fromExt", period);
						break;
					case "newExclusionTo":
						this.getModel("newExclusion").setProperty("/toExt", period);
						break;
					case "modExclusionFrom":
						var oModel = this.exclusionDataRow;
						oModel.fromExt = period;
						
						var year = this.getModel("global").getProperty("/selectedRM/year");
						var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
		
						var sUpdatePath = "unumber='" + unumber + "',year='" + year + "',rmid='" + oModel.rmid + "',type='" + oModel.type + "'";
						this.updateExclusions(oEvent, oModel, sUpdatePath);
						break;
					case "modExclusionTo":
						var oModel = this.exclusionDataRow;
						oModel.fromTo = period;
						
						var year = this.getModel("global").getProperty("/selectedRM/year");
						var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
						
						var sUpdatePath = "unumber='" + unumber + "',year='" + year + "',rmid='" + oModel.rmid + "',type='" + oModel.type + "'";
						this.updateExclusions(oEvent, oModel, sUpdatePath);
						break;
					case "modITA":
						this.getModel("global").setProperty("/ITABusy", true);
						var oModel = this.ITADataRow;
						oModel.periodExt = period;
						this.updateITA(oEvent, oModel);
						break;
					case "modMainITA":
						var oModel = this.ITADataRow;
						oModel.periodExt = period;
						this.onTpChangeMainIta(oEvent, oModel);
						break;
					case "editKPIModel":
						this.getModel("editKPIModel").setProperty("/periodExt", period);
						//this.onKPIValuesChanged(oEvent);
						break;
					case "newPoolITA":
						this.getModel("newPoolITA").setProperty("/periodExt", period);
						break;
					case "modPoolITA":
						this.getModel("global").setProperty("/poolITABusy", true);
						var oModel = this.poolITADataRow;
						oModel.periodExt = period;
						this.modifyPoolITA(oModel);
						break;
					case "editPoolKPIModel":
						this.getModel("editPoolKPIModel").setProperty("/periodExt", period);
						this.onPoolKPIValuesChanged(oEvent);
						break;
					case "modEAMsFrom":
						this.getModel("global").setProperty("/decEAMsPeriodBusy", true);
						var oModel = this.decEAMsDataRow;
						var index = this.eamIndex;
						oModel.PeriodFromExt = period;
						this.inputEvent.setValue(period);

						if (oModel.IncludeEAM) {
							this.getModel("global").setProperty("/rmFieldStates/decEAMsperiodFromValidated", true);
							
							if (oModel.PeriodToExt && oModel.PeriodToExt !== "" && this.validateTransferPeriodInput(oModel.PeriodToExt)) {
								this.getModel("global").setProperty("/rmFieldStates/decEAMsperiodToValidated", true);
							} else {
								this.getModel("global").setProperty("/rmFieldStates/decEAMsperiodToValidated", false);
							}
							
							var sPeriodTo = this.getModel("global").getProperty("/rmFieldStates/decEAMsperiodToValidated");
							
							if (sPeriodTo) {
								this.getModel("global").setProperty("/rmFieldStates/decEAMssaveEnabled", true);
							}
							
							this.updateRmDecEAMsWithValidation(oEvent, oModel);
						} else {
							this.updateRmDecEAMs(oEvent, oModel);
						}
	
						break;
					case "modEAMsTo":
						this.getModel("global").setProperty("/decEAMsPeriodBusy", true);
						var oModel = this.decEAMsDataRow;
						var index = this.eamIndex;
						oModel.PeriodToExt = period;
						this.inputEvent.setValue(period);
								
						if (oModel.IncludeEAM) {
							this.getModel("global").setProperty("/rmFieldStates/decEAMsperiodToValidated", true);
							
							if (oModel.PeriodFromExt && oModel.PeriodFromExt !== "" && this.validateTransferPeriodInput(oModel.PeriodFromExt)) {
								this.getModel("global").setProperty("/rmFieldStates/decEAMsperiodFromValidated", true);
							} else {
								this.getModel("global").setProperty("/rmFieldStates/decEAMsperiodFromValidated", false);
							}
							
							var sPeriodFrom = this.getModel("global").getProperty("/rmFieldStates/decEAMsperiodFromValidated");
							
							if (sPeriodFrom) {
								this.getModel("global").setProperty("/rmFieldStates/decEAMssaveEnabled", true);
							}
							
							this.updateRmDecEAMsWithValidation(oEvent, oModel);
						} else {
							this.updateRmDecEAMs(oEvent, oModel);
						}
						
						break;
					case "releasePeriod":
						this.getModel("global").setProperty("/release/FiscperExt", period);
						var oModel = this.getModel("global").getProperty("/release");
						oModel.Fiscper = this.writeBackFormatTransferPeriods(oModel.FiscperExt);
						
						var sUpdatePath = "Fiscper='" + oModel.Fiscper + "'";
						
						this.getModel().update("/ReleasePeriodSet(" + sUpdatePath + ")", oModel, {
							success: (data) => {
								this.loadReleasePeriod();
								this.showMessage("Release Period successfully updated!");
							},
							error: (oError) => {
								this.handleErrorMessageBoxPress(oEvent, "Release Period could not be updated");
							}
						});
						break;
					case "editMilestone":
						this.getModel("editMilestone").setProperty("/PeriodExt", period);
						this.getModel("editMilestone").setProperty("/Period", this.writeBackFormatCalendarMonthYear(period));
						break;
					case "newMilestone":
						this.getModel("newMilestone").setProperty("/PeriodExt", period);
						this.getModel("newMilestone").setProperty("/Period", this.writeBackFormatCalendarMonthYear(period));
						break;
				}
				
			}
			
			this._tpValueHelpDialog.detachConfirm(this.onTransferPeriodConfirm, this);
			
		},
		
		onAuthValueConfirm: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var text = oSelectedItem.getTitle();
			var id = oSelectedItem.getDescription();
			this.getModel("newAuth").setProperty("/Value", id);
		},
		
		_handleAuthValueHelpSearch: function(evt) {
			var sValue = evt.getParameter("value");
			var aFilters = [];
			
			var oNameFilter = new Filter({
				path: "Id",
				operator: FilterOperator.Contains,
				value1: sValue,
				caseSensitive: false
			});
			
			var oUnumberFilter = new Filter({
				path: "Text",
				operator: FilterOperator.Contains,
				value1: sValue,
				caseSensitive: false
			});
			
			aFilters.push(oNameFilter);
			aFilters.push(oUnumberFilter);
			
			var oFilter = new Filter(aFilters, false);
			evt.getSource().getBinding("items").filter(oFilter);
		},
		
		_handleAuthValueLiveChange: function(oEvent) {
			var oBinding = oEvent.getSource().getBinding("items");
			var sUser = oEvent.getParameter("value");
			
			var aFilters = [];
			
			var oNameFilter = new Filter({
				path: "Id",
				operator: FilterOperator.Contains,
				value1: sUser,
				caseSensitive: false
			});
			
			var oUnumberFilter = new Filter({
				path: "Text",
				operator: FilterOperator.Contains,
				value1: sUser,
				caseSensitive: false
			});
			
			aFilters.push(oNameFilter);
			aFilters.push(oUnumberFilter);
			
			var oFilter = new Filter(aFilters, false);
			
			// var aFilter =[ new Filter("name","Contains",sUser)];
			oBinding.filter(oFilter);			
		},
		
		_handleProspectValueHelpSearch: function(evt) {
			var sValue = evt.getParameter("value");
			var aFilters = [];
			
			var oNameFilter = new Filter({
				path: "Id",
				operator: FilterOperator.Contains,
				value1: sValue,
				caseSensitive: false
			});
			
			var oUnumberFilter = new Filter({
				path: "Name",
				operator: FilterOperator.Contains,
				value1: sValue,
				caseSensitive: false
			});
			
			var oMarketFilter = new Filter({
				path: "MarketTxt",
				operator: FilterOperator.Contains,
				value1: sValue,
				caseSensitive: false
			});
			
			var oRegionFilter = new Filter({
				path: "RegionTxt",
				operator: FilterOperator.Contains,
				value1: sValue,
				caseSensitive: false
			});
			
			var oStatusFilter = new Filter({
				path: "StatusTxt",
				operator: FilterOperator.Contains,
				value1: sValue,
				caseSensitive: false
			});
			
			aFilters.push(oNameFilter);
			aFilters.push(oUnumberFilter);
			aFilters.push(oMarketFilter);
			aFilters.push(oRegionFilter);
			aFilters.push(oStatusFilter);
			
			var oFilter = new Filter(aFilters, false);
			evt.getSource().getBinding("items").filter(oFilter);
		},
		
		_handleProspectValueLiveHelpSearch: function(oEvent) {
			var oBinding = oEvent.getSource().getBinding("items");
			var sValue = oEvent.getParameter("value");
			var aFilters = [];
			
			var oNameFilter = new Filter({
				path: "Id",
				operator: FilterOperator.Contains,
				value1: sValue,
				caseSensitive: false
			});
			
			var oUnumberFilter = new Filter({
				path: "Name",
				operator: FilterOperator.Contains,
				value1: sValue,
				caseSensitive: false
			});
			
			var oMarketFilter = new Filter({
				path: "MarketTxt",
				operator: FilterOperator.Contains,
				value1: sValue,
				caseSensitive: false
			});
			
			var oRegionFilter = new Filter({
				path: "RegionTxt",
				operator: FilterOperator.Contains,
				value1: sValue,
				caseSensitive: false
			});
			
			var oStatusFilter = new Filter({
				path: "StatusTxt",
				operator: FilterOperator.Contains,
				value1: sValue,
				caseSensitive: false
			});
			
			aFilters.push(oNameFilter);
			aFilters.push(oUnumberFilter);
			aFilters.push(oMarketFilter);
			aFilters.push(oRegionFilter);
			aFilters.push(oStatusFilter);
			
			var oFilter = new Filter(aFilters, false);
			oBinding.filter(oFilter);		
		},
		
		// KPI Exceptions Modification for Pool and RM
		
		onKPIEdit: function(oEvent, sKey) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndex = oTable.getSelectedIndex();
			var selectedData = oTable.getContextByIndex(selectedIndex).getObject();
			this.getView().setModel(new JSONModel(selectedData), "editKPIModel");
			
			if (sKey === "RMKPI") {
				this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.EditKPICorrectionDialog%_editKpiCorrectionDialog");
			} else {
				this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.EditPoolKPICorrectionDialog%_editPoolKpiCorrectionDialog");
			}
		},
		
		onSaveKPIEdit: function(oEvent, sKey) {
			var oModel = this.getModel("editKPIModel").getData();
			var sUpdatePath= "";
			oModel.period = this.writeBackFormatTransferPeriods(oModel.periodExt);
			
			if (sKey === "RMKPI") {
				sUpdatePath = "unumber='" + oModel.unumber + "',year='" + oModel.year + "',zr='" + oModel.zr + "',period='" + oModel.period + "',type='" + oModel.type + "'";
			} else {
				var poolNumber = this.getModel("global").getProperty("/selectedPool/poolNumber");
				oModel.poolNumber = poolNumber;
				sUpdatePath = "poolNumber='" + oModel.poolNumber + "',year='" + oModel.year + "',zr='" + oModel.zr + "',period='" + oModel.period + "',type='" + oModel.type + "'";
			}
				
			this.updateKPICorrections(oEvent, oModel, sUpdatePath, sKey);
		},
		
		afterNewKpiClosed: function (oEvent) {
			this.getModel("global").setProperty("/rmFieldStates/kpiTransferPeriodState", ValueStateBc.Error);
			this.getModel("global").setProperty("/rmFieldStates/saveButtonEnabled", false);
			this.getModel("global").setProperty("/poolWizardData/poolKpiTransferPeriodState", ValueStateBc.Error);
			this.getModel("global").setProperty("/poolWizardData/saveButtonKPIEnabled", false);
		},
				
		updateKPICorrections: function(oEvent, oModel, sPath, sKey) {
			if (sKey === "RMKPI") {
				var rmYear = this.getModel("global").getProperty("/selectedRM/year");
				
				this.getModel().update("/KPIExceptionsSet(" + sPath + ")", oModel, {
					success: (data) => {
						this.showMessage("KPI Corrections successfully updated!");
						this.loadKpiCorrections(rmYear, oModel.unumber);
						this.onGenericFragmentclose(oEvent, "_editKpiCorrectionDialog");
					},
					error: (oError) => {
						this.handleErrorMessageBoxPress(oEvent, "KPI Correction could not be updated");
					}
				});
			} else {
				var poolYear = this.getModel("global").getProperty("/selectedPool/year");
				
				this.getModel().update("/PoolKPIExceptionsSet(" + sPath + ")", oModel, {
					success: (data) => {
						this.showMessage("KPI Corrections successfully updated!");
						this.loadPoolProfile(oModel.poolNumber, poolYear);
						this.onGenericFragmentclose(oEvent, "_editPoolKpiCorrectionDialog");
					},
					error: (oError) => {
						this.handleErrorMessageBoxPress(oEvent, "KPI Correction could not be updated");
					}
				});
			}
		},
		
		onSaveNewKPICorrection: function(oEvent, sKey) {
			var oModel = this.getModel("newKpiCorrection").getData();
			
				if (sKey === "RMKPI") {
					var year = this.getModel("global").getProperty("/selectedRM/year");
					var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
					
					oModel.year = year;
					oModel.unumber = unumber;
					oModel.period = this.writeBackFormatTransferPeriods(oModel.periodExt);
					
					this.getModel().create("/KPIExceptionsSet", oModel, {
						success: (data) => {
							this.loadKpiCorrections(year, unumber);
							this.onGenericFragmentclose(oEvent, "_newKpiCorrectionDialog");
							this.showMessage("KPI Correction successfully created!");
							this.setKpiCorrectionsModel("newKpiCorrection", "RMKPI");
						},
						error: (oError) =>{
							this.handleErrorMessageBoxPress(oEvent, "KPI Correction could not be saved");
						}
					});
					
				} else {
					var poolNumber = this.getModel("global").getProperty("/selectedPool/poolNumber");
					var year = this.getModel("global").getProperty("/selectedPool/year");
					
					oModel.poolNumber = poolNumber;
					oModel.year = year;
					oModel.period = this.writeBackFormatTransferPeriods(oModel.periodExt);
					
					this.getModel().create("/PoolKPIExceptionsSet", oModel, {
						success: (data) => {
							this.loadPoolProfile(oModel.poolNumber, oModel.year);
							this.onGenericFragmentclose(oEvent, "_newPoolKpiCorrectionDialog");
							this.showMessage("KPI Correction successfully created!");
							this.setKpiCorrectionsModel("newKpiCorrection", "POOLKPI");
						},
						error: (oError) =>{
							this.handleErrorMessageBoxPress(oEvent, "KPI Correction could not be saved");
						}
					});
				}
		},
		
		deleteKPICorrection: function(oModel, oEvent, sKey) {
			var zr = oModel.zr;
			var period = oModel.period;
			var sUpdatePath = "";
			var type = oModel.type;
			
			if (sKey === "RMKPI") {
				var year = this.getModel("global").getProperty("/selectedRM/year");
				var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
				
				sUpdatePath = "unumber='" + unumber + "',year='" + year + "',zr='" + zr + "',period='" + period + "',type='" + type + "'";
				
				this.getModel().remove("/KPIExceptionsSet(" + sUpdatePath + ")", {
					success: (data) => {
						this.showMessage("KPI Correction successfully deleted!");
						this.loadKpiCorrections(year, unumber);
					},
					error: (oError) => {
						this.handleErrorMessageBoxPress(oEvent, "KPI Correction could not be deleted");
					}
				});
			} else {
				var poolNr = this.getModel("global").getProperty("/selectedPool/poolNumber");
				var year = this.getModel("global").getProperty("/selectedPool/year");
				
				sUpdatePath = "poolNumber='" + poolNr + "',year='" + year + "',zr='" + zr + "',period='" + period + "',type='" + type + "'";
				
				this.getModel().remove("/PoolKPIExceptionsSet(" + sUpdatePath + ")", {
					success: (data) => {
						this.showMessage("KPI Correction successfully deleted!");
						this.loadPoolProfile(poolNr, year);
					},
					error: (oError) => {
						this.handleErrorMessageBoxPress(oEvent, "KPI Correction could not be deleted");
					}
				});
			}
		},
		
		onKPICorrectionDelete: function(oEvent, sKey) {
			var oTable = oEvent.getSource().getParent().getParent();
			var selectedIndices = oTable.getSelectedIndices();

			selectedIndices.forEach((rowNumber) => {
				var oDeletedValue = oTable.getContextByIndex(rowNumber).getObject();
				this.deleteKPICorrection(oDeletedValue, oEvent, sKey);
			});
		},
		
		// End KPI Modifications for Pool and RM
		
		
		// Dec EAMs for Pool and RM
				
		updateRmDecEAMs: function(oEvent, oModel) {
			var year = this.getModel("global").getProperty("/selectedRM/year");
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			var account = oModel.Account;
			oModel.PeriodFrom = this.writeBackFormatTransferPeriods(oModel.PeriodFromExt);
			oModel.PeriodTo = this.writeBackFormatTransferPeriods(oModel.PeriodToExt);
			
			var sUpdatePath = "RM='" + unumber + "',year='" + year + "',Account='" + account + "'";
			
			this.getModel().update("/DecEAMSet(" + sUpdatePath + ")", oModel, {
					success: (data) => {
						this.showMessage("Decentralized EAM successfully updated!");
						this.loadDecentralizedEAMs(year, unumber);
					},
					error: (oError) => {
						this.handleErrorMessageBoxPress(oEvent, "Decentralized EAM could not be updated");
					}
			});
		},
		
		updateRmDecEAMsWithValidation: function(oEvent, oModel) {
			var year = this.getModel("global").getProperty("/selectedRM/year");
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			var account = oModel.Account;
			oModel.PeriodFrom = this.writeBackFormatTransferPeriods(oModel.PeriodFromExt);
			oModel.PeriodTo = this.writeBackFormatTransferPeriods(oModel.PeriodToExt);
			
			var sUpdatePath = "RM='" + unumber + "',year='" + year + "',Account='" + account + "'";
			
			var updateEnabled = this.getModel("global").getProperty("/rmFieldStates/decEAMssaveEnabled");
			
			if (updateEnabled) {
				this.getModel("global").setProperty("/rmFieldStates/decEAMsperiodFromValidated", false);
				this.getModel("global").setProperty("/rmFieldStates/decEAMsperiodToValidated", false);
				this.getModel("global").setProperty("/rmFieldStates/decEAMssaveEnabled", false);
				
				this.getModel().update("/DecEAMSet(" + sUpdatePath + ")", oModel, {
					success: (data) => {
						this.showMessage("Decentralized EAM successfully updated!");
						this.loadDecentralizedEAMs(year, unumber);
					},
					error: (oError) => {
						this.handleErrorMessageBoxPress(oEvent, "Decentralized EAM could not be updated");
					}
				});
			} else {
				this.handleErrorMessageBoxPress(oEvent, "Please specify both Transfer Periods when EAM is included");
			}
		},
				
		deleteRmDecEAMs: function(oModel, oEvent) {
			var unumber = oModel.RM;
			var year = oModel.Year;
			var account = oModel.Account;
			
			var sUpdatePath = "RM='" + unumber + "',year='" + year + "',Account='" + account + "'";
			
			this.getModel().remove("/DecEAMSet(" + sUpdatePath + ")", {
				success: (data) => {
					this.showMessage("Decentralized EAM successfully deleted!");
					this.loadDecentralizedEAMs(year, unumber);
				},
				error: (oError) => {
					this.handleErrorMessageBoxPress(oEvent, "Decentralized EAM could not be deleted");
				}
			});
		},
		
		onRMdecEAMsSelected: function(oEvent) {
			var selected = oEvent.getParameter("selected");
			var index = oEvent.getSource().getParent().getIndex();
			var oModel = oEvent.getSource().getParent().getParent().getContextByIndex(index).getObject();
			
			if (!selected) {
				this.deleteRmDecEAMs(oModel, oEvent);
			} else {
				this.updateRmDecEAMs(oEvent, oModel);
			}
		},
		
		onDecEAMSPeriodManUpdate: function (oEvent) {
			var index = oEvent.getSource().getParent().getIndex();
			var oModel = oEvent.getSource().getParent().getParent().getContextByIndex(index).getObject();
			
			if (oModel.PeriodFromExt && oModel.PeriodFromExt !== "" && this.validateTransferPeriodInput(oModel.PeriodFromExt)) {
				this.getModel("global").setProperty("/rmFieldStates/decEAMsperiodFromValidated", true);
			} else {
				this.getModel("global").setProperty("/rmFieldStates/decEAMsperiodFromValidated", false);
			}
			
			if (oModel.PeriodToExt && oModel.PeriodToExt !== "" && this.validateTransferPeriodInput(oModel.PeriodToExt)) {
				this.getModel("global").setProperty("/rmFieldStates/decEAMsperiodToValidated", true);
			} else {
				this.getModel("global").setProperty("/rmFieldStates/decEAMsperiodToValidated", false);
			}
			
			var bPeriodFromValid = this.getModel("global").getProperty("/rmFieldStates/decEAMsperiodFromValidated");
			var bPeriodToValid = this.getModel("global").getProperty("/rmFieldStates/decEAMsperiodToValidated");
			
			if (bPeriodFromValid && bPeriodToValid) {
				this.getModel("global").setProperty("/rmFieldStates/decEAMssaveEnabled", true);
			}
			
			if (oModel.IncludeEAM) {
				this.updateRmDecEAMsWithValidation(oEvent, oModel);
			} else {
				this.updateRmDecEAMs(oEvent, oModel);
			}
		},
		
		decEAMsFieldValidation : function(oEvent, sKey) {
			var sPeriodInput = oEvent.getParameter("value");
			var index = oEvent.getSource().getParent().getIndex();
			var oModel = oEvent.getSource().getParent().getParent().getContextByIndex(index).getObject();
			
			var bPeriodFromValid = this.getModel("global").getProperty("/rmFieldStates/decEAMsperiodFromValidated");
			var bPeriodToValid = this.getModel("global").getProperty("/rmFieldStates/decEAMsperiodToValidated");
			var sPropertyPath = "";
			
			if (sKey === "from") {
				sPropertyPath = "/rmFieldStates/decEAMsperiodFromValidated";
			} else {
				sPropertyPath = "/rmFieldStates/decEAMsperiodToValidated";
			}
			
			if (oModel.IncludeEAM) {
				oEvent.getSource().setValueState(ValueStateBc.Error);
				
				if (this.validateTransferPeriodInput(sPeriodInput)) {
					this.getModel("global").setProperty(sPropertyPath, true);
					oEvent.getSource().setValueState(ValueStateBc.None);
				} else {
					this.getModel("global").setProperty(sPropertyPath, false);
					oEvent.getSource().setValueState(ValueStateBc.Error);
				}
				
				bPeriodFromValid = this.getModel("global").getProperty("/rmFieldStates/decEAMsperiodFromValidated");
				bPeriodToValid = this.getModel("global").getProperty("/rmFieldStates/decEAMsperiodToValidated");
				
				if (bPeriodFromValid && bPeriodToValid) {
					this.getModel("global").setProperty("/rmFieldStates/decEAMssaveEnabled", true);
				}
			} else {
				this.getModel("global").setProperty("/rmFieldStates/decEAMssaveEnabled", true);
			}
			
		},
		// End EAMs for Pool and RM
		
		// CSV Export
		onCsvExport: function(oEvent) {

			var oModel = this.getModel();
			
			var oTable = oEvent.getSource().getParent().getParent();
			var exportData = oTable.exportData();
			
			exportData.getExportType().setSeparatorChar(";");

			exportData.saveFile().catch(function(oError) {

			}).then(function() {
				exportData.destroy();
			});
		},
		
		onCsvExportToolBar: function(oEvent) {
			var oTable = oEvent.getSource().getParent().getParent().getParent();
			
			var exportData = oTable.exportData();
			
			exportData.getExportType().setSeparatorChar(";");

			exportData.saveFile().catch(function(oError) {

			}).then(function() {
				exportData.destroy();
			});
		},
			
		setActualYear: function(sProperty) {
			var year = new Date().getFullYear().toString();
			this.getModel("global").setProperty(sProperty, year);
		},
		
		setActualFiscalPeriod: function(sProperty) {
			var fiscalPeriod = new Date().getMonth();
			var year = new Date().getFullYear().toString();
			var sPeriod = fiscalPeriod.toString();
			
			if (sPeriod.length > 1) {
				sPeriod = "0" + sPeriod;
			} else {
				sPeriod = "00" + sPeriod;
			}
			
			this.getModel("global").setProperty(sProperty, year + sPeriod);
		},
		
		_handleUsersValueLiveChange: function(oEvent) {		
			var oBinding = oEvent.getSource().getBinding("items");
			var sUser = oEvent.getParameter("value");
			var aFilters = [];
			
			var oNameFilter = new Filter({
				path: "name",
				operator: FilterOperator.Contains,
				value1: sUser,
				caseSensitive: false
			});
			
			var oUnumberFilter = new Filter({
				path: "unumber",
				operator: FilterOperator.Contains,
				value1: sUser,
				caseSensitive: false
			});
			
			aFilters.push(oNameFilter);
			aFilters.push(oUnumberFilter);
			
			var oFilter = new Filter(aFilters, false);
			oBinding.filter(oFilter);			
		},
		
		_handleZrValueLiveChange: function(oEvent) {
			var oBinding = oEvent.getSource().getBinding("items");
			var sZr = oEvent.getParameter("value");
			
			var aFilters = [];
			
			var oNameFilter = new Filter({
				path: "zr",
				operator: FilterOperator.Contains,
				value1: sZr,
				caseSensitive: false
			});
			
			aFilters.push(oNameFilter);
			var oFilter = new Filter(aFilters, false);
			
			oBinding.filter(oFilter);
		},
		
		_handleTpValueLiveChange: function(oEvent) {
			var oBinding = oEvent.getSource().getBinding("items");
			var sPeriod = oEvent.getParameter("value");
			
			var aFilters = [];
			
			var oNameFilter = new Filter({
				path: "fiscperiod",
				operator: FilterOperator.Contains,
				value1: sPeriod,
				caseSensitive: false
			});
			
			var oMonthFilter = new Filter({
				path: "desc",
				operator: FilterOperator.Contains,
				value1: sPeriod,
				caseSensitive: false
			});
			
			aFilters.push(oNameFilter);
			aFilters.push(oMonthFilter);
			var oFilter = new Filter(aFilters, false);
			
			oBinding.filter(oFilter);
		},

		noDataAfterclose: function() {
			var year = this.getModel("global").getProperty("/selectedRM/year");
			this.byId("RMSelectedYear").setSelectedKey(year);
			this.getModel("global").setProperty("/selectedRM/year", year);
		},
		
		onLatestPayoutMonthSelected: function(oEvent) {
			var oSelected = oEvent.getParameter("selectedContexts");
			var monthYear = oSelected.map(function(oContext) { 
				return oContext.getObject().calmonth; 
			})
			this.getModel("global").setProperty("/relationshipManager/latestpayout", monthYear[0]);
			var unumber = this.getModel("global").getProperty("/selectedRM/unumber");
			var year = this.getModel("global").getProperty("/selectedRM/year");
			this.onRmDataChange(year, unumber);
		},
		
		onCombinedFiltersOpen: function(oEvent, sKey) {
			var filterColumns = [];
			this.getModel("global").setProperty("/combinedFiltersKey", sKey);
			
			switch (sKey) {
				case "scoreCardFilter":
					this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.CombinedFiltersDialog%_combinedFiltersDialog");
					
					filterColumns = [
						{label: "Firstname", key:"Firstname"}, 
						{label: "Surname", key:"Surname"}, 
						{label: "RM", key:"Rm"}, 
						{label: "Pool", key:"Pool"}, 
						{label: "Pool Name", key: "PoolName"}, 
						{label: "Country", key:"PersAreaTxt"},
						{label: "Location", key:"PersSareaTxt"},
						{label: "Region", key:"RegionTxt"},
						{label: "Market", key:"MarketTxt"}, 
						{label: "Scorecard", key:"RequestId"}
					];
					break;
				case "maintainITA":
					this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.MaintainITACombinedFiltersDialog%_combinedFiltersDialog");
					
					filterColumns = [
						{label: "ZR", key:"zr"}, 
						{label: "New RM Name", key:"newname"}, 
						{label: "Original RM Name", key:"orgname"}, 
						{label: "Original RM", key:"orgrm"}, 
						{label: "New RM", key: "newrm"}, 
						{label: "Transfer Month", key:"period"}
					];
					break;
				case "simTool":
					this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.SimToolCombinedFiltersDialog%_combinedFiltersDialog");
					
					filterColumns = [
						{label: "Firstname", key:"Firstname"}, 
						{label: "Surname", key:"Surname"}, 
						{label: "RM", key:"Rm"}, 
						{label: "Pool", key:"Pool"}, 
						{label: "Pool Name", key: "PoolName"}, 
						{label: "Country", key:"PersAreaTxt"},
						{label: "Location", key:"PersSareaTxt"},
						{label: "Region", key:"RegionTxt"},
						{label: "Market", key:"MarketTxt"},
					];
					break;
				default:
					break;
			}
			
			this._combinedFiltersDialog.setRangeKeyFields(filterColumns);
		},
		
		onCombinedFiltersOk: function(oEvent, sKey) {
			var multiInput;
			
			switch (sKey) {
				case "scoreCards":
					multiInput = this.getView().byId("multiInput");
					break;
				case "maintainITA":
					multiInput = this.getView().byId("multiInputMaintainITA");
					break;
				case "simTool":
					multiInput = this.getView().byId("multiInputSim");
					break;
				default:
					break;
			}
			
			var aTokens = oEvent.getParameter("tokens");
			multiInput.setTokens(aTokens);
			this.filterWithTokens(oEvent, aTokens, sKey);
			this.onGenericFragmentclose(oEvent, "_combinedFiltersDialog");
		},
		
		onRemoveToken: function(oEvent) {
			var actualTokens = oEvent.getSource().getTokens();
			var removedTokens = oEvent.getParameter("removedTokens");
			var sKey = this.getModel("global").getProperty("/combinedFiltersKey");
			var resultTokens = actualTokens.filter(token => !removedTokens.includes(token));
			this._combinedFiltersDialog.setTokens([]);
			this._combinedFiltersDialog.setTokens(resultTokens);
			this.filterWithTokens(oEvent, resultTokens, sKey);
		},
		
		onCombinedFiltersCancelPress: function(oEvent) {
			this.onGenericFragmentclose(oEvent, "_combinedFiltersDialog");
		},
		
		filterWithTokens: function(oEvent, aTokens, sKey) {
			var aFilters = [];
			
			for (var i = 0; i < aTokens.length; i++) {
				var oFilterOperator;
				
				if (aTokens[i].data().range.operation === "EQ") {
					oFilterOperator = FilterOperator.EQ;
				} else {
					return;
				}
				
				var oFilter = new Filter({
					path: aTokens[i].data().range.keyField,
					operator: oFilterOperator,
					value1: aTokens[i].data().range.value1,
					caseSensitive: false
				});
				
				aFilters.push(oFilter);
			}
			
			this.oGlobalFilter = new Filter(aFilters, true);
			this._filterScore(sKey);
		},
		
		_filterScore : function(sKey) {
			var oFilter = null;

			if (this.oGlobalFilter) {
				oFilter = this.oGlobalFilter;
			}
			
			switch (sKey) {
				case "scoreCards":
					this.byId("manageScorecardsTable").getBinding().filter(oFilter);
					break;
				case "maintainITA":
					this.byId("maintainITATable").getBinding().filter(oFilter);
					break;
				case "copyProfiles":
					this.byId("copyProfilesTable").getBinding().filter(oFilter);
					break;
				case "authTable":
					this.byId("authorizationsTable").getBinding().filter(oFilter);
					break;
				case "simYearPerCountry":
					this.byId("simYearPerCountryTable").getBinding().filter(oFilter);
					break;
				case "growthRateAbs":
					this.byId("growthRateAbsTable").getBinding().filter(oFilter);
					break;
				case "simYear":
					this.byId("simYearPerCountryTable").getBinding().filter(oFilter);
					break;
				case "simCurrency":
					this.byId("simCurrencyTable").getBinding().filter(oFilter);
					break;
				case "growthRates":
					this.byId("growthRatesTable").getBinding().filter(oFilter);
					break;
				case "payoutCurves":
					this.byId("PayoutCurvesTable").getBinding().filter(oFilter);
					break;
				case "customizeCompModels":
					this.byId("customizeCompModelsTable").getBinding().filter(oFilter);
					break;
				case "customizeCompParams":
					this.byId("customizeCompParamsTable").getBinding().filter(oFilter);
					break;
				case "simToolEntries":
					this.byId("manageSimToolTable").getBinding().filter(oFilter);
					break;
				default:
					break;
			}
		},
		
		onCombinedFiltersAfterClose: function(oEvent) {
			this._combinedFiltersDialog.setRangeKeyFields([]);
			// this._combinedFiltersDialog = null;
		},
		
		filterAdvanced : function(oEvent, sKey) {
			var sQuery = sQuery = oEvent.getParameter("newValue").trim();
			var aQueries;
			var advancedSearch = false;
			var filterColums = [];
			
			switch (sKey) {
				case "scoreCards":
					filterColums = ["Firstname", "Surname", "Rm", "Pool", "PoolName", "PersAreaTxt", "PersSareaTxt", "RegionTxt", "MarketTxt", "RequestId", "RequestStatusText"];
					break;
				case "maintainITA":
					filterColums = ["zr", "newname", "orgname", "orgrm", "newrm", "period", "RegionTxt", "MarketTxt"];
					break;
				case "copyProfiles":
					filterColums = ["Bp", "Name"];
					break;
				case "authTable":
					filterColums = ["User", "Value"];
					break;
				case "simYearPerCountry":
					filterColums = ["Year", "Country", "CountryTxt"];
					break;
				case "growthRateAbs":
					filterColums = ["Year", "Country", "SeqNr", "AmountFrom", "AmountTo", "Currency", "Parameter", "CountryTxt"];
					break;
				case "simCurrency":
					filterColums = ["Currency", "Country", "CountryTxt"];
					break;
				case "growthRates":
					filterColums = ["Year", "Country", "SeqNr", "QuantityFrom", "QuantityTo", "Unit", "Parameter", "CountryTxt"];
					break;
				case "payoutCurves":
					filterColums = ["Year", "Country", "AmountFrom", "AmountTo", "Parameter", "CountryTxt", "Currency", "ModelTxt", "Model"];
					break;
				case "customizeCompModels":
					filterColums = ["Model", "Year", "ModelTxt"];
					break;
				case "customizeCompParams":
					filterColums = ["Year", "Value", "PrioritySeqNr", "EntityObject", "EntityValue", "Parameter", "ParameterTxt", "EntityObjectTxt", "EntityValueTxt"];
					break;
				case "simToolEntries":
					filterColums = ["Firstname", "Surname", "Rm", "Pool", "PoolName", "PersAreaTxt", "PersSareaTxt", "RegionTxt", "MarketTxt"];
					break;
				default:
					break;
			}

			this.oGlobalFilter = null;

			if (sQuery) {
				var aFilters = [];
				
				if (sQuery.includes(",")) {
					aQueries = sQuery.split(",");
					advancedSearch = true;
				}
				
				if (sQuery.includes(";")) {
					aQueries = sQuery.split(";");
					advancedSearch = true;
				}
				
				if (advancedSearch) {
					for (var n = 0; n < aQueries.length; n++) {
						for (var i = 0; i < filterColums.length; i++) {
							var oFilter = new Filter({
								path: filterColums[i],
								operator: FilterOperator.Contains,
								value1: aQueries[n].trim(),
								caseSensitive: false
							});
							
							aFilters.push(oFilter);
						}
					}
				} else {
					for (var i = 0; i < filterColums.length; i++) {
						var oFilter = new Filter({
							path: filterColums[i],
							operator: FilterOperator.Contains,
							value1: sQuery,
							caseSensitive: false
						});
						
						aFilters.push(oFilter);
					}
				}
			
				this.oGlobalFilter = new Filter(aFilters, false);
			}
			this._filterScore(sKey);
		},
		
		//Maintain Functions
		
		onRMProfileCleanup: function(oEvent) {
			var unumber = this.getModel("global").getProperty("/cleanup/unumber");
			
			if (!unumber) {
				this.handleErrorMessageBoxPress(oEvent, "Please Enter unumber or pool");
				return;
			}
			// var name = this.getModel("global").getProperty("/cleanup/name");
			
			this.getModel().callFunction('/CleanupProfile', {
				method: 'POST',
				urlParameters: {
					BP: unumber
				},
				success: (data) => {
					var name = data.Name;
					this.showMessage("Account " + unumber + " (" + name + ") " +  "successfully deleted!");
				},
				error: (oError) =>
				{
					this.handleErrorMessageBoxPress(oEvent, "Account " + unumber + " could not be deleted");
					
				}			
			})
		},
		
		onCleanupClose: function(oEvent) {
			this.getModel("global").setProperty("/cleanup", []);
		},
		
		loadReleasePeriod: function() {
			this.getView().getModel().read("/ReleasePeriodSet", {
				success: (data) => {
					this.getModel("global").setProperty("/release", data.results[0]);
				}
			});
		},
		
		loadMdData: function() {
			this.getView().getModel().read("/MDCurrencySet", {
				success: (data) => {
					this.getModel("global").setProperty("/mdCurrencies", data.results);
				}
			});
			
			this.getView().getModel().read("/MDRegionSet", {
				success: (data) => {
					this.getModel("global").setProperty("/mdRegions", data.results);
				}
			});
			
			this.getView().getModel().read("/MDYearSet", {
				success: (data) => {
					this.getModel("global").setProperty("/mdYears", data.results);
					data.results.forEach((row) => {
						if (row.Default) {
							this.getModel("global").setProperty("/selectedRM/year", row.Year);
							this.getModel("global").setProperty("/selectedPool/year", row.Year);
						}
					});
				}
			});
		},
		
		onRequestReset: function(oEvent) {
			var requestId = this.getModel("global").getProperty("/resetRequest/requestId");
			var resetComments = this.getModel("global").getProperty("/resetRequest/resetComments");
			var status = this.getModel("global").getProperty("/resetRequest/statusId");
			var fiscalPeriod = this.getModel("global").getProperty("/scoreCardPeriod");
			
			this.getModel().callFunction('/ResetRequest', {
				method: 'POST',
				urlParameters: {
					RequestId : requestId,
					ResetComments : resetComments,
					Status : status
				},
				success: (data) => {
					this.getModel("global").setProperty("/resetRequest/requestId", data.RequestId);
					this.getModel("global").setProperty("/resetRequest/resetComments", data.ResetComments);
					this.getModel("global").setProperty("/resetRequest/statusId", data.Status);
					
					if (fiscalPeriod) {
						this.loadScoreCards(fiscalPeriod);
					}
					
					this.showMessage("Reset Request successfully executed!");
				},
				error: (oError) =>
				{
					this.handleErrorMessageBoxPress(oEvent, "Reset Request could not be executed");
					
				}			
			})
			
			this.onGenericFragmentclose(oEvent, "_resetRequestDialog");
		},
		
		onResetClose: function(oEvent) {
			this.getModel("global").setProperty("/resetRequest", []);
			this.initResetCommentFlag();
		},
		
		loadEmailTexts: function() {
			this.getView().getModel().read("/MailTextSet", {
				success: (data) => {
					data.results.forEach((row) => {
						if (row.Id === "0001") {
							this.getModel("global").setProperty("/approvalTxt", row.Text)
						} else {
							this.getModel("global").setProperty("/rejectionTxt", row.Text)
						}
					});
				}
			});
		},
		
		onCustEntityValueHelpRequest: function(oEvent) {
			var selectedKey = this.getModel("global").getProperty("/selectedCustomEntity");
			this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.EntityValueHelpDialog%_custEntityValueHelpDialog");
			
			var oItemSelectTemplate = new StandardListItem({
				title : "{Text}",
				description : "{Id}"
			});
			
			var oEntitySet = {
				path: "",
				parameters: {operationMode: 'Client'},
				template: oItemSelectTemplate
			};
				
			switch(selectedKey) {
				case "LegalEntity":
					oEntitySet.path = "/LegalEntitySet";
					break;
				case "Location":
					oEntitySet.path = "/LocationSet";
					break;
				case "Market":
					oEntitySet.path = "/MarketSet";
					break;
				case "Region":
					oEntitySet.path = "/RegionSet";
					break;
				case "Team":
					oEntitySet.path = "/TeamSet";
					break;
			}
			
			sap.ui.getCore().byId("custEntityValueHelp").bindAggregation("items", oEntitySet);
		},
		
		onCustEntitySelected: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			
			if (oSelectedItem) {
				var entityId = oSelectedItem.getDescription();
				var entityText = oSelectedItem.getTitle();
				this.getModel("newCustCompParamModel").setProperty("/EntityValue", entityId);
				this.getModel("newCustCompParamModel").setProperty("/EntityValueTxt", entityText);
			}
		},
		
		onCustomizeColumns: function(oEvent) {
			var aCols = oEvent.getSource().getParent().getParent().getParent().getColumns();
			this.onGenericFragmentLoad(oEvent, "juliusbaer.rmct.fragment.dialogs.PersonalizeColumns%_personalizeColumnsDialog");
			var oControlPanel = this._personalizeColumnsDialog.getPanels()[0];
			var aColumns = [];
			var aItems = [];
			
			for (var i = 0; i < aCols.length; i++) {
				var label = aCols[i].getLabel().getText();
				var path = aCols[i].getProperty("sortProperty");

				if (path !== "") {
					
					var oItem = {
						columnKey: path,
						text: label
					}
					
					var oColumn = {
						columnKey: path,
						visible: true,
						index: i
					}
									
					aColumns.push(oColumn);
					aItems.push(oItem);
				}
			}
			
			this.getModel("global").setProperty("/selectedScColumnsItems", aColumns);
			this.getModel("global").setProperty("/selectedScItems", aItems);
		},
		
		onCancelPerColumns: function(oEvent) {
			this.onGenericFragmentclose(oEvent, "_personalizeColumnsDialog");
		},
		
		onOKPerColumns: function(oEvent) {
			this.onGenericFragmentclose(oEvent, "_personalizeColumnsDialog");
		}
	});

});