sap.ui.define([
	"juliusbaer/ipl/controller/BaseController",
	"sap/ui/core/mvc/Controller",
	"juliusbaer/ipl/model/formatter",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function(BaseController, Controller, formatter, History, UIComponent, JSONModel, Filter, FilterOperator, MessageToast, MessageBox) {
	"use strict";

	return BaseController.extend("juliusbaer.ipl.controller.IntegratedPlanning", {

		formatter: formatter,
		
		onInit: function () {
			this.getRouter().getRoute("ipl").attachMatched(this._onIpldRouteMatched, this);
		},
				
		_onIpldRouteMatched: function(oEvent) {
			this.getModel("global").setProperty("/treeTableBusy", true);
			this.getView().getModel().read("/HierarchyNodeSet", {
				success: (data) => {
					var hierResult = this.buildHierarchy(data.results);
					this.setModel(hierResult, "nodeHierarchy");
					this.getModel("global").setProperty("/treeTableBusy", false);
				}
			})
		},
		
		refreshNodes: function(oNodeToExpand) {
			var aNodesToExpand = [oNodeToExpand.nodeName];
			var oParent = oNodeToExpand.parentNode;
			while(oParent){
				aNodesToExpand.push(oParent.nodeName);
				oParent= oParent.parentNode
			}
			
			this.getModel("global").setProperty("/treeTableBusy", true);
			this.getView().getModel().read("/HierarchyNodeSet", {
				success: (data) => {
					var hierResult = this.buildHierarchy(data.results);
					this.setModel(hierResult, "nodeHierarchy");
					this.expandNode(aNodesToExpand);
					this.getModel("global").setProperty("/treeTableBusy", false);
				}
			})
		},
		
		expandNode: function(aNodesToExpand) {
			var oTable = this.getView().byId("TreeTableBasic");
			var counter = 0;
			var oRowContext = oTable.getContextByIndex(counter);
			while (oRowContext) {
				if (aNodesToExpand.includes(oRowContext.getObject().nodeName)){
					oTable.expand(counter);
				}
				counter++;
				oRowContext = oTable.getContextByIndex(counter);
			}			
		},
		
		buildHierarchy: function(arry) {

		    var roots = [], children = {};

		    // find the top level nodes and hash the children based on parent
		    for (var i = 0, len = arry.length; i < len; ++i) {
		        var item = arry[i],
		            p = item.parent,
		            target = !p ? roots : (children[p] || (children[p] = []));
		        
		        if (item.parent && item.parent !== 0) {
		        	for (var n = 0; n < arry.length; n++) {
		        		if (item.parent === arry[n].nodeId) {
		        			item.parentNode = arry[n];
		        			break;
		        		}
		        	}
		        }

		        target.push(item);
		    }

		    // function to recursively build the tree
		    var findChildren = function(parent) {
		        if (children[parent.nodeId]) {
		            parent.children = children[parent.nodeId];
		            for (var i = 0, len = parent.children.length; i < len; ++i) {
		                findChildren(parent.children[i]);
		            }
		        }
		    };

		    // enumerate through to handle the case where there are multiple
			// roots
		    for (var i = 0, len = roots.length; i < len; ++i) {
		        findChildren(roots[i]);
		        this.setHasFigures(roots[i]);
		        this.setPartiallyMappedNodes(roots[i]);
		        this.setStatus(roots[i]);
		    }
		   		     
		    return new JSONModel({
				nodeRoot: {
					roots
				}
			});
		},
		
		
		setPartiallyMappedNodes: function(oNode) {
			if (!oNode.children) {
				return (oNode.isBottomLevel || oNode.ignored)? 2:0;
				
			}
			
			var childrenMappedSum = 0;
			
			if (!(oNode.isBottomLevel || oNode.ignored)) {		
				oNode.children.forEach((child) => {
					childrenMappedSum += this.setPartiallyMappedNodes(child);
				});
				if (childrenMappedSum == 2*oNode.children.length)
					{
						oNode.isMapped = true;
						return 2;
					}
				else if(childrenMappedSum == 0) return 0;
				else {
					oNode.isPartiallyMapped = true;
					return 1;
				}
			} else {
				return 2;
			}
		},
		
		setHasFigures: function(oNode) {
			if (!oNode.children) {
				return oNode.hasFigures;
				
			}
			
			oNode.children.forEach((child) => {
				if(this.setHasFigures(child)) oNode.hasFigures = true
			});
			return oNode.hasFigures;
			
		},
		
		setStatus: function(oNode)
		 {
			
			if (oNode.isIgnored && oNode.hasFigures){
				oNode.status = 'ignored - has figures';
				oNode.icon = 'sap-icon://alert'	;
				oNode.state = 'Warning';
			} else if(oNode.isIgnored )
			{
				oNode.status = 'ignored'
				oNode.icon = 'sap-icon://accept'	;
				oNode.state = 'Success';	
			}
			else if(oNode.isMapped)
			{
				oNode.status = 'mapped'
				oNode.icon = 'sap-icon://accept'	;
				oNode.state = 'Success';	
			}
			else if(oNode.isPartiallyMapped)
			{
				oNode.status = 'partially mapped'
				oNode.icon = 'sap-icon://alert'	;
				oNode.state = 'Warning';	
			}
			else if(!oNode.isMapped && oNode.hasFigures)
			{
				oNode.status = 'not mapped - has figures!'
				oNode.icon = 'sap-icon://alert'	;
				oNode.state = 'Error';	
			}
			else if(!oNode.isMapped )
			{
				oNode.status = 'not mapped - no figures'
				oNode.icon = 'sap-icon://alert'	;
				oNode.state = 'Warning';	
			}
				
			if(oNode.children){
				oNode.children.forEach((child) => {
					this.setStatus(child);
				});
			}
			
		},
		
		filterNodes: function(oEvent) {
			var sValue = oEvent.getParameter("query");
			var oHierarchyNode = this.getModel("nodeHierarchy").getData().nodeRoot.roots[0];
			var oFoundNode;
			var topLevelFoundNode;
			
			if (!oHierarchyNode.nodeTxt.includes(sValue)) {
				oFoundNode = traverseNodes(oHierarchyNode.children);
				if (oFoundNode) {
					topLevelFoundNode = this.lookForTopLevel(oFoundNode);
					this.refreshNodes(oFoundNode);
				}
			} else {
				this.refreshNodes(oHierarchyNode);
			}
			
			function traverseNodes(aNodes) {
				var len = aNodes.length;
				var result;
				
				for (var i = 0; i < len; i++) {
					if (aNodes[i].nodeTxt.includes(sValue)) {
						return aNodes[i];
					}
					
					if (aNodes[i].children) {
						result = traverseNodes(aNodes[i].children);
						
						if (result) {
							return result;
						}
					}
				}
				
				return result;
			}
		},
		
		
		lookForBottomLevelInChildren: function(oNode) {
			var aSelectedChildren = [];
			
			if(oNode.isBottomLevel){
				aSelectedChildren.push(oNode.nodeName);
			}
			
			function findAllChildrenOrgUnits(aChildren) {
				for (var i = 0; i < aChildren.length; i++) {
					
					if (aChildren[i].isBottomLevel) {
						aSelectedChildren.push(aChildren[i].nodeName);
					}
					
					if (aChildren[i].children) {
						findAllChildrenOrgUnits(aChildren[i].children);
					}
				}
			}
			
			findAllChildrenOrgUnits(oNode.children);
			
			return aSelectedChildren;
		},
		
		enableChildrenforBottomLevel: function(oNode) {
			if (oNode.children.length > 0) {
				for (var i = 0; i < oNode.children.length; i++) {
					oNode.children[i].bottomEnabled = true;
					if(oNode.children[i].children)this.enableChildrenforBottomLevel(oNode.children[i]);
				}
			}
		},
		
		lookForTopLevel: function(oChild) {
			var found = false;
			var parentNode = oChild;
			
			while (parentNode && !found) {
				if (parentNode.isTopLevel) {
					found = true;
					break;
				} else {
					parentNode = parentNode.parentNode;
				}
			}
			
			return parentNode;
		},
			
		updateOrgLevel: function(oEvent, sLevelSelect) {
			var oEventSource = oEvent.getSource();
			var selectedIndex = oEventSource.getEventingParent().getIndex();
			var oSelected = oEventSource.getParent().getParent().getContextByIndex(selectedIndex).getObject();
			var isSelected = oEventSource.getSelected();
			
			if (sLevelSelect === "topLevel" && isSelected) {
				var sTopLevelNodeName = oSelected.nodeName;
				
				
				var aChildren = oSelected.children;
				var aBottemLevelNodes = this.lookForBottomLevelInChildren(oSelected);
						
				if (aBottemLevelNodes.length > 0) {	
					for (var i = 0; i < aBottemLevelNodes.length; i++) {
						
						var sBottomLevelNodeName = aBottemLevelNodes[i];
						
						var oModel = {
							topLevelOrgUnit: sTopLevelNodeName,
							bottomLevelOrgUnit: sBottomLevelNodeName
						}
						
						this.getModel("global").setProperty("/treeTableBusy", true);
						
						this.getModel().create("/OrgLevelUnitSet", oModel, {
							success: (data) => {
								this.showMessage("Org Unit Top Level successfully updated!");
								if ((i + 1) === aBottemLevelNodes.length) {
									this.refreshNodes(oSelected);
								}
							},
							error: (oError) => {
								if (i === 0) {
									this.handleErrorMessageBoxPress(oEvent, "Org Unit Level could not be updated", oError);
									this.getModel("global").setProperty("/treeTableBusy", false);
								}
							}
						});
					}
				}
				else {
					this.enableChildrenforBottomLevel(oSelected);
				}
			} else if (sLevelSelect === "topLevel" && !isSelected) {
				var aChildren = this.lookForBottomLevelInChildren(oSelected);
				var sTopLevelNodeName = oSelected.nodeName;
				
				if (aChildren.length > 0) {
					for (var i = 0; i < aChildren.length; i++) {
						var sBottomLevelNodeName = aChildren[i];				
						
						var sKeys = "topLevelOrgUnit='" + sTopLevelNodeName + "',bottomLevelOrgUnit='" + sBottomLevelNodeName +"'";
						
						this.getModel("global").setProperty("/treeTableBusy", true);
				
						this.getModel().remove("/OrgLevelUnitSet(" + sKeys + ")", {
							success: (data) => {
								this.showMessage("Org Unit Top Level successfully removed!");
								if ((i + 1) === aChildren.length) {
									this.refreshNodes(oSelected);
								}
							},
							error: (oError) => {
								if (i === 0) {
									this.handleErrorMessageBoxPress(oEvent, "Org Unit Level could not be removed", oError);
									this.getModel("global").setProperty("/treeTableBusy", false);
								}
							}
						});
					}
				}
				
			} else if (sLevelSelect === "bottomLevel" && isSelected) {
				var oTopLevelNode = this.lookForTopLevel(oSelected);
				
				if (oTopLevelNode) {
					var sTopLevelNodeName = oTopLevelNode.nodeName;
					
					var sBottomLevelNodeName = oSelected.nodeName;
					
					var oModel = {
						topLevelOrgUnit: sTopLevelNodeName,
						bottomLevelOrgUnit: sBottomLevelNodeName
					}
					
					this.getModel("global").setProperty("/treeTableBusy", true);
					
					this.getModel().create("/OrgLevelUnitSet", oModel, {
						success: (data) => {
							this.showMessage("Org Unit Top Level successfully updated!");
							this.refreshNodes(oSelected);
						},
						error: (oError) => {
							this.handleErrorMessageBoxPress(oEvent, "Org Unit Level could not be updated", oError);
							this.getModel("global").setProperty("/treeTableBusy", false);
						}
					});
				}
				
			} else {
				var oTopLevelNode = this.lookForTopLevel(oSelected);
				
				if (oTopLevelNode) {
					var sTopLevelNodeName = oTopLevelNode.nodeName;
										
					var sBottomLevelNodeName = oSelected.nodeName;					
					
					var sKeys = "topLevelOrgUnit='" + sTopLevelNodeName + "',bottomLevelOrgUnit='" + sBottomLevelNodeName +"'";
					
					this.getModel("global").setProperty("/treeTableBusy", true);
					
					this.getModel().remove("/OrgLevelUnitSet(" + sKeys + ")", {
						success: (data) => {
							this.showMessage("Org Unit Bottom Level successfully removed!");
							this.refreshNodes(oSelected);
						},
						error: (oError) => {
							if (i === 0) {
								this.handleErrorMessageBoxPress(oEvent, "Org Unit Bottom Level could not be removed", oError);
								this.getModel("global").setProperty("/treeTableBusy", false);
							}
						}
					});
				}
			}
						
			/*
			 * if (isSelected) { this.getModel().create("/HierarchyNodeSet",
			 * oSelected, { success: (data) => { this.showMessage("Org Unit
			 * Level successfully updated!"); }, error: (oError) => {
			 * this.handleErrorMessageBoxPress(oEvent, "Org Unit Level could not
			 * be updated", oError); } }); } else { var sNodeId =
			 * oSelected.nodeId;
			 * 
			 * this.getModel().remove("/HierarchyNodeSet(" + sNodeId + ")", {
			 * success: (data) => { this.showMessage("Org Unit Level
			 * successfully updated!"); }, error: (oError) => {
			 * this.handleErrorMessageBoxPress(oEvent, "Org Unit Level could not
			 * be updated", oError); } }); }
			 */
		},
		
		ignoreNode: function(oEvent){
			var oContext = oEvent.getSource().getParent().getBindingContext('nodeHierarchy');
			var isOff = oEvent.getSource().getState();
			
			if (isOff) {
				this.getModel().create("/IgnoreNodeSet", {nodeName: oContext.getObject().nodeName}, {
					success: (data) => {
						this.showMessage("Node ignored");
						this.refreshNodes(oContext.getObject());
					},
					error: (oError) => {
						this.handleErrorMessageBoxPress(oEvent, "Error on ignoring node", oError);
					}
				});
			} else {
				var skey = "nodeName='" + oContext.getObject().nodeName + "'";
				
				this.getModel().remove("/IgnoreNodeSet(" + skey + ")", {
					success: (data) => {
						this.showMessage("Node considered");
						this.refreshNodes(oContext.getObject());
					},
					error: (oError) => {
						this.handleErrorMessageBoxPress(oEvent, "Error on considering node", oError);
					}
				});
			}
			
			
		},
		
		toggleShowUnmapped: function() {
			var showOnlyUnmapped = this.getModel("global").getProperty("/onlyUnmapped");
			
			if (showOnlyUnmapped) {
				var aHierarchy = this.getModel("nodeHierarchy").getData().nodeRoot.roots;
				
				var aFiltered = this.filterMappedData(aHierarchy);
				var oFilteredModel = new JSONModel({
					nodeRoot: {
						roots: aFiltered
					}
				});
				
				this.getModel("global").setProperty("/treeTableBusy", true);
				this.setModel(oFilteredModel, "nodeHierarchy");
				this.getModel("global").setProperty("/treeTableBusy", false);
			} else {
				this.getModel("global").setProperty("/treeTableBusy", true);
				this.getView().getModel().read("/HierarchyNodeSet", {
					success: (data) => {
						var hierResult = this.buildHierarchy(data.results);
						this.setModel(hierResult, "nodeHierarchy");
						this.getModel("global").setProperty("/treeTableBusy", false);
					}
				})
			}
		},
		
		filterMappedData: function(aHierachy) {
			var len = aHierachy.length;
			 
			while (len--) {
				if (aHierachy[len].children) {
					this.filterMappedData(aHierachy[len].children);
				}
					
				if (aHierachy[len].isMapped === true) {
					aHierachy.splice(len, 1);
				}
			 }
			 return aHierachy;
		},
		
		onHierachyOrgConfirmed: function(oEvent) {
			this.getModel().callFunction('/confirmOrgHierarchy', {
				method: 'GET',
				success: (data) => {
					this.getButtonConfirm();
					this.getFiscPer();
					this.getOverviewTileInformation();
				},
				error: (oError) => {
					
				}			
			})
		},
		
		onHierachyOrgReleased: function(oEvent) {
			this.getModel().callFunction('/releaseOrgHierarchy', {
				method: 'GET',
				success: (data) => {
					this.getButtonConfirm();
					this.getFiscPer();
					this.getOverviewTileInformation();
				},
				error: (oError) => {
					
				}			
			})
		},
	});
});