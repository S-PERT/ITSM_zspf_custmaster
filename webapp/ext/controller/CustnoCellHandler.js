sap.ui.define([], function () {
    "use strict";

    return {
        onNavigateToRequest: function (oEvent) {
            var oSource = oEvent.getSource();
            var oContext = oSource.getBindingContext();
            if (!oContext) {
                return;
            }
            var sCustno = oContext.getProperty("Custno");

            var oCrossAppNav = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");
            if (oCrossAppNav) {
                oCrossAppNav.toExternal({
                    target: {
                        semanticObject: "ZSPF_REQUEST",
                        action: "display"
                    },
                    params: {
                        "Custno": sCustno
                    }
                });
            }
        }
    };
});

