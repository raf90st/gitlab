sap.ui.define([], function () {
	"use strict";
	return {
		
		formatDate: function(value) {
			if(!value) {
				return "";
			}
			
			return [value.slice(6, 8), ".", value.slice(4, 6), ".", value.slice(0, 4)].join('');
		}

	};
});