sap.ui.define(
    ["sap/ui/core/UIComponent"],
    ac => ac.extend('adminStatistics.Component', {
        metadata: {
            manifest: 'json'
        },
        init: function() {
            // call the base component's init function
            ac.prototype.init.apply(this, arguments);

            // enable routing
            this.getRouter().initialize();
        },
    })
)