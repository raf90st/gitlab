sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/table/Row",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Input",
	"sap/m/DatePicker",
	"sap/m/Select",
	"sap/ui/core/Item",
	"sap/ui/core/ListItem",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/comp/filterbar/FilterGroupItem",
	"sap/m/MultiComboBox",
	"sap/m/MessageToast",
	"sap/ui/model/FilterOperator"

], function (Controller, JSONModel, Filter, Table, Column, Row, Label, Text, Button, Dialog, Input, DatePicker, Select, Item,
	ListItem, VerticalLayout, FilterGroupItem, MultiComboBox, MessageToast, FilterOperator) {
	"use strict";

	return Controller.extend("juliusbaer.tmt.controller.tmtInitial", {
		onInit: function () {
			var oModel = new JSONModel({
				tableData: [],
				tableId: ""
			})

			var oInputModel = new JSONModel({})

			var oFilterModel = new JSONModel({
				filterValues: []
			})

			var oGlobalModel = new JSONModel({
				jsonModel: "",
				searchId: "",
				searchedParentNode: "",
				inputEnabled: false,
				searchParentInit: false
			})

			this.setModel(oGlobalModel, "global");

			this.getView().getModel().read("/FieldTypesSet", {
				success: (data) => {
					this.aFieldTypes = data.results;
				}
			});
			this.aCurrentFieldTypesList = [];
			this.getView().setModel(oModel, "values");
			this.getView().setModel(oInputModel, "inputs");
			this.getView().setModel(oFilterModel, "filters");
			this.byId("table").addStyleClass("tableStyle");
			this.getTable();
		},

		addDataColumns: function (sTableId, oPanel, oTable) {
			this.aCurrentFieldTypesList.length = 0;
			oTable.removeAllColumns();
			var oFilter = new Filter('tableId', 'EQ', sTableId);

			this.getView().getModel().read("/FieldListSet", {
				filters: [oFilter],
				success: (data) => {
					data.results.forEach((column, index) => {
						var oCurrentFieldType = {
							"fieldType": column.fieldType,
							"fieldDescription": column.fieldDescription,
							"FieldSearchHelpEntity": column.searchHelpEntity,
							"fieldId": column.fieldId,
							"isKeyField": column.isKeyField
						};
						this.aCurrentFieldTypesList.push(oCurrentFieldType);
						oTable.addColumn(new Column({
							label: new Label({
								text: column.fieldDescription
							}),
							template: this.getControlFieldType(column.fieldType, column.fieldId, column.searchHelpEntity, column.isKeyField),
							filterProperty: column.fieldDescription
						}));
					});
					this.setInputModel();
					oPanel.addContent(oTable);
				}
			});
		},

		addDataRows: function (sTableId) {
			var aReset = [];
			this.getModel("values").setProperty("/tableData", aReset);
			var oFilter = new Filter('tableId', 'EQ', sTableId);

			this.getView().getModel().read("/ValuesSet", {
				filters: [oFilter],
				success: (data) => {
					var oRecords = {};
					data.results.forEach(function (value, index) {
						var oRecord = oRecords[value.recordKeyHash];
						if (oRecord) {
							oRecord[value.fieldId] = value.fieldValue;
						} else {
							var oNewRecord = {};
							oNewRecord[value.fieldId] = value.fieldValue;
							oNewRecord.keyHash = value.recordKeyHash;
							oNewRecord.tableId = value.tableId;
							oRecords[value.recordKeyHash] = oNewRecord;
						}
					});
					var aRecords = [];
					for (const property in oRecords) {
						aRecords.push(oRecords[property]);
					}
					this.getModel("values").setProperty("/tableData", aRecords);
					//this.setFilterPanel(this.byId("filterPanel"), sTableId);
				}
			});
		},

		getTable: function () {
			var tableId = this.getTableId();
			this.getView().getModel().read("/AuthorizedTablesSet", {
				success: (data) => {
					if (!tableId) {
						tableId = data.results[0].tableId;
					}
					this.setSelectedAuthTablesKey(tableId);
					this.addDataColumns(tableId, this.byId("tableViewPanel"), this.byId("table"));
					this.addDataRows(tableId);
					this.addNewRowButton(this.byId("buttonsPanel"));
					this.addDeleteButton(this.byId("buttonsPanel"));
					this.addSaveChangesButton(this.byId("buttonsPanel"));
				}
			});
		},

		getControlFieldType: function (sFieldType, sFieldId, sSearchEntity, bIsKeyField) {
			switch (sFieldType) {
			case 1:
				return new Input({
					value: "{values>" + sFieldId + "}",
					editable: !bIsKeyField,
					change: (oEvent) => {
						this.onUserValueChanged(oEvent);
					}
				})
			case 2:
				return new Input({
					value: "{values>" + sFieldId + "}",
					editable: !bIsKeyField,
					type: "Number",
					change: (oEvent) => {
						this.onUserValueChanged(oEvent);
					}
				})
			case 3:
				return new DatePicker({
					value: "{values>" + sFieldId + "}",
					editable: !bIsKeyField,
					change: (oEvent) => {
						this.onUserValueChanged(oEvent);
					}
				})
			case 4:
				var oItemSelectTemplate = new Item({
					key: "{key}",
					text: "{text}"
				});

				var oSelect = new Select({
					selectedKey: "{values>" + sFieldId + "}",
					editable: !bIsKeyField,
					change: (oEvent) => {
						this.onUserValueChanged(oEvent);
					}
				});
				oSelect.bindAggregation("items", "/" + sSearchEntity, oItemSelectTemplate);
				return oSelect;
			}
		},

		getInputFieldType: function (sFieldType, iIndex, sSearchEntity, bIsKeyField) {
			switch (sFieldType) {
			case 1:
				return new Input({
					value: "{inputs>/" + iIndex + "}",
					required: bIsKeyField
				})
			case 2:
				return new Input({
					value: "{inputs>/" + iIndex + "}",
					type: "Number",
					required: bIsKeyField

				})
			case 3:
				return new DatePicker({
					value: "{inputs>/" + iIndex + "}",
					required: bIsKeyField

				})
			case 4:
				var oItemSelectTemplate = new Item({
					key: "{key}",
					text: "{text}"
				});

				var oSelect = new Select({
					width: "100%",
					selectedKey: "{inputs>/" + iIndex + "}"
				});
				oSelect.bindAggregation("items", "/" + sSearchEntity, oItemSelectTemplate);
				return oSelect;
			}
		},

		getInputLabel: function (sDescription) {
			return new Label({
				text: sDescription
			})
		},

		getVerticalLabelControl: function (oLabel, oInput) {
			var oVerticalLayout = new VerticalLayout({
				width: "100%"
			});
			oVerticalLayout.addContent(oLabel);
			oVerticalLayout.addContent(oInput);
			return oVerticalLayout;
		},

		onUserValueChanged: function (oEvent) {
			oEvent.getSource().getParent().getBindingContext('values').getObject().changed = true;
		},

		addSaveChangesButton: function (oPanel) {
			var oChangeButton = new Button({
				text: "Save",
				press: (oEvent) => {
					this.testSave(oEvent);
				}
			})
			oPanel.addContent(oChangeButton);
		},

		addNewRowButton: function (oPanel) {
			var oNewRowButton = new Button({
				text: "New",
				icon: "sap-icon://add",
				press: (oEvent) => {
					this.addNewRow(oEvent);
				}
			})
			oPanel.addContent(oNewRowButton);
		},

		addNewRow: function (oEvent) {
			var aTypes = this.aCurrentFieldTypesList;
			
			if (!this._newRowDialog) {
				this._newRowDialog = new Dialog({
					title: 'New Row',
					beginButton: new Button({
						text: 'Save',
						press: (oEvent) => {
							this.saveNewRow(oEvent);
							this._newRowDialog.close();
						}
					}),
					endButton: new Button({
						text: 'Cancel',
						press: (oEvent) => {
							this._newRowDialog.close();
						}
					}),
					afterClose: (oEvent) => {
						this.setInputModel();
					}
				});
				
				aTypes.forEach((type, index) => {
					var i = index+1;
					var label = this.getInputLabel(type.fieldDescription);
					var input = this.getInputFieldType(type.fieldType, i, type.FieldSearchHelpEntity);
					this._newRowDialog.addContent(label);
					this._newRowDialog.addContent(input);
				});	
				this.getView().addDependent(this._newRowDialog);
			}
			this._newRowDialog.open();
		},

		testSave: function (oEvent) {
			var aValues = this.getView().getModel("values").getProperty("/tableData");
			var aToChange = aValues.filter((change) => change.changed === true);
			var aToCreate = aValues.filter((change) => change.created === true);

			aToChange.forEach((oToChange, index) => {
				var sTableId = oToChange.tableId;
				var sKeyHash = oToChange.keyHash;
				for (var property in oToChange) {
					if (property !== "tableId" && property !== "keyHash" && property !== "changed") {
						var sFieldId = property;
						var sValue = oToChange[property];
						var oChangeObject = {
							"tableId": sTableId,
							"recordKeyHash": sKeyHash,
							"fieldId": sFieldId,
							"fieldValue": sValue
						};
						this.updateData(oChangeObject, index);
					}
				}
			});

			aToCreate.forEach((oToCreate, index) => {
				var sTableId = this.getModel("values").getProperty("/tableId");
				
				for (var property in oToCreate) {
					if (property !== "tableId" && property !== "created") {
						var sFieldId = property;
						var sValue = oToCreate[property];
						var oCreateObject = {
							"tableId": sTableId,
							"fieldId": sFieldId,
							"fieldValue": sValue,
							"recordKeyHash": oToCreate["keyHash"]
						};
						this.createData(oCreateObject, index);
					}
				}
			});

		},

		saveNewRow: function (oEvent) {
			var oInput = this.getView().getModel("inputs").getData();
			var aValues = this.getView().getModel("values").getProperty("/tableData");
			var oLastElement = aValues[aValues.length - 1];
			var keyHash = parseInt(oLastElement.keyHash) + 3;
			var oNewInput = {};
			Object.assign(oNewInput, oInput);
			oNewInput.created = true;
			oNewInput.keyHash = keyHash.toString();
			this.getView().getModel("values").getProperty("/tableData").push(oNewInput);
			this.getView().getModel("values").refresh();
		},

		setInputModel: function () {
			var aTypes = this.aCurrentFieldTypesList;
			aTypes.forEach((type, index) => {
				var i = index + 1;
				this.getView().getModel("inputs").setProperty("/" + i, "");
			});
		},

		updateData: function (oValue, index) {
			var sTableId = oValue.tableId;
			var sKeyHash = oValue.recordKeyHash;
			var sFieldId = oValue.fieldId;
			var sUpdatePath = "tableId='" + sTableId + "',recordKeyHash='" + sKeyHash + "',fieldId='" + sFieldId + "'";
			this.getView().getModel().update("/ValuesSet(" + sUpdatePath + ")", oValue, {
				success: (data) => {
					if (index === 0) {
						MessageToast.show("Successfully updated values");
					}
				},
				error: (oError) => {
					console.log(oError);
				}
			});
		},

		createData: function (oCreated, index) {
			this.getModel().create("/ValuesSet", oCreated, {
				//changeSetId: "1",
				success: (data) => {
					if (index === 0) {
						MessageToast.show("Successfully created new data!");
					}
				},
				error: (oError) => {

				}
			});
		},

		setFilterPanel: function (oFilterPanel, sTableId) {
			var aTypes = this.aCurrentFieldTypesList;
			//var tableId = this.getTableId();
			/*aTypes.forEach((item, index) => {
				oFilterBar.addFilterGroupItem(this.setFilterGroupItem(item.fieldId, item.fieldType, item.fieldDescription));
			});*/
			oFilterPanel.addContent(this.setFilterGroupItem(sTableId, aTypes[0].fieldId, aTypes[0].fieldType, aTypes[0].fieldDescription));
		},

		setFilterGroupItem: function (sTableId, sFieldId, sFieldType, sFieldDesc) {
			var aFilterValues = [];

			var oFilter = new Filter({
				filters: [
					new Filter('tableId', 'EQ', sTableId),
					new Filter("fieldId", 'EQ', sFieldId)
				],
				and: true,
			});

			this.getView().getModel().read("/ValuesSet", {
				filters: [oFilter],
				success: function (data) {
					data.results.forEach((filteredValue, index) => {
						var oFilteredValue = {};
						oFilteredValue.fieldId = filteredValue.fieldId;
						oFilteredValue.fieldValue = filteredValue.fieldValue;
						aFilterValues.push(oFilterValue);
					});
					this.getView().getModel("filters").setProperty("/filterValues", aFilterValues);
				},
				error: (oError) => {

				}
			});

			switch (sFieldType) {
			case 1:
				var oItemSelectTemplate = new Item({
					key: "{filters>fieldId}",
					text: "{filters>fieldValue}"
				});

				var oSelect = new Select({
					change: (oEvent) => {
						this.testFunction();
					}
				});

				oSelect.bindAggregation("items", "/filterValues", oItemSelectTemplate);
				//return oSelect
			}
		},

		testFunction: function () {
			console.log("Testfunction!");
		},

		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		onAuthTableChange: function () {
			var sTableId = this.getModel("values").getProperty("/tableId");
			this._newRowDialog = null;
			this.setTableId(sTableId);
			this.addDataColumns(sTableId, this.byId("tableViewPanel"), this.byId("table"));
			this.addDataRows(sTableId);
			//this.getModel("values").refresh();
		},

		getTableId: function () {
			var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			return oStore.get("tableId");
		},

		setTableId: function (sTableId) {
			var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			oStore.put("tableId", sTableId);

		},

		setSelectedAuthTablesKey: function (sTableKey) {
			this.byId("authorizedTablesSelection").setSelectedKey(sTableKey);
		},

		addDeleteButton: function (oPanel) {
			var oNewRowButton = new Button({
				text: "Delete",
				icon: "sap-icon://delete",
				press: (oEvent) => {
					this.deleteRow(oEvent);
				}
			})
			oPanel.addContent(oNewRowButton);
		},

		deleteRow: function (oEvent) {
			var oTable = this.byId("table");
			var selectedIndices = oTable.getSelectedIndices();
			var aValues = this.getView().getModel("values").getProperty("/tableData");
			var oModel = this.getView().getModel();

			selectedIndices.forEach((rowNumber, index) => {
				var oDeletedValue = oTable.getContextByIndex(rowNumber).getObject();
				this.deleteData(oDeletedValue, oModel, index);
			});

			var aResult = aValues.filter(function (eachElem, index) {
				return selectedIndices.indexOf(index) == -1
			})

			this.getView().getModel("values").setProperty("/tableData", aResult);
			this.getView().getModel("values").refresh();
		},

		deleteData: function (oValue, oModel, index) {
			var sTableId = oValue.tableId;
			var sKeyHash = oValue.keyHash;

			for (var property in oValue) {
				if (property !== "keyHash" && property !== "tableId") {
					var sFieldId = property;
					var sUpdatePath = "tableId='" + sTableId + "',recordKeyHash='" + sKeyHash + "',fieldId='" + sFieldId + "'";
					oModel.remove("/ValuesSet(" + sUpdatePath + ")", {
						success: (data) => {
						if (index === 0) {
							MessageToast.show("Successfully deleted data!");
						}
							console.log("remove Success!");
						}
					});
				}
			}
		},

		showMessage: function(sMsg) {
			MessageToast.show(sMsg);
		},
		
		filterGlobally : function(oEvent) {
			var sQuery = oEvent.getParameter("query");
			this.oGlobalFilter = null;

			if (sQuery) {
				var aTypes = this.aCurrentFieldTypesList;
				var aFilters = [];
				aTypes.forEach((type, index) => {
					if (type.fieldType === 2) {
						var oFilter = new Filter(type.fieldId, FilterOperator.EQ, sQuery)	
					} else {
						var oFilter = new Filter(type.fieldId, FilterOperator.Contains, sQuery)
					}
					aFilters.push(oFilter);
				});
				this.oGlobalFilter = new Filter(aFilters, false);
			}
			this._filter();
		},

		_filter : function() {
			var oFilter = null;

			if (this.oGlobalFilter) {
				oFilter = this.oGlobalFilter;
			}
			this.byId("table").getBinding().filter(oFilter);
		}
	});
});