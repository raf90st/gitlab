sap.ui.define([
	"sap/ui/core/format/NumberFormat"
], function (NumberFormat) {
	"use strict";

	return {
		formatThousands: function(value) {
			   var numberFormat = NumberFormat.getFloatInstance({maxFractionDigits:1});
			   var text = numberFormat.format(value/1000);
			   return text;
		},
		
		formatLatestPayoutDateSC: function(value) {
			if(!value || value === "0000000" || value === "000000") {
				return "";
			}
			
			return [value.slice(4), ".", value.slice(0, 4)].join('');
		}
	
	};
});