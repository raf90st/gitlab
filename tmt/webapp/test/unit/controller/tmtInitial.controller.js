/*global QUnit*/

sap.ui.define([
	"juliusbaer/tmt/controller/tmtInitial.controller"
], function (Controller) {
	"use strict";

	QUnit.module("tmtInitial Controller");

	QUnit.test("I should test the tmtInitial controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});