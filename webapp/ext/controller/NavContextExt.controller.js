sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension"
], function (ControllerExtension) {
    "use strict";

    // ZSPF_REQUEST 로 이동할 때 전달을 허용할 필드 (화이트리스트)
    var mAllowedByTarget = {
        "ZSPF_REQUEST": ["Custno"]
    };

    function restrictSelectionVariant(oSelectionVariant, aAllowed) {
        if (!oSelectionVariant) {
            return;
        }
        (oSelectionVariant.getSelectOptionsPropertyNames() || []).forEach(function (sName) {
            if (aAllowed.indexOf(sName) === -1) {
                oSelectionVariant.removeSelectOption(sName);
            }
        });
        (oSelectionVariant.getParameterNames() || []).forEach(function (sName) {
            if (aAllowed.indexOf(sName) === -1) {
                oSelectionVariant.removeParameter(sName);
            }
        });
    }

    var oExtension = {
        override: {
            intentBasedNavigation: {
                adaptNavigationContext: function (oSelectionVariant, oTargetInfo) {
                    var sSemanticObject = oTargetInfo && oTargetInfo.semanticObject;
                    var aAllowed = mAllowedByTarget[sSemanticObject];
                    if (aAllowed) {
                        restrictSelectionVariant(oSelectionVariant, aAllowed);
                    }
                }
            }
        }
    };

    return ControllerExtension.extend("zsp.itsm.zspfcustmaster.ext.controller.NavContextExt", oExtension);
});
