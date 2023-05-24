sap.ui.define([], function () {
	"use strict";
	return {

		visible : function(value) {
			return !(typeof(value) == 'undefined' || value == null || value == "");
		}
	};
});