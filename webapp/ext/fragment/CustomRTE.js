sap.ui.define([
    "sap/ui/richtexteditor/library" 
], function(RTELibrary) {
    'use strict';

    return {
        onRTEReady: function(oEvent) {
            var oRTE = oEvent.getSource();

            oRTE.addButtonGroup("styles").addButtonGroup("table");
        }
    };
});