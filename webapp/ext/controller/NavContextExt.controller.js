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

    function attachGridRowNavigation(oController) {
        var oView = oController.base.getView();
        var oExtensionAPI = oController.base.getExtensionAPI();
        if (!oView || !oExtensionAPI || !oExtensionAPI.routing) {
            return;
        }

        function doAttach(oInnerTable) {
            if (!oInnerTable || oInnerTable._bRowNavAttached) {
                return;
            }
            oInnerTable._bRowNavAttached = true;

            oInnerTable.attachCellClick(function (oEvent) {
                // 1. 행 선택(체크박스) 컬럼 클릭 시 상세 이동 방지
                var iColIndex = oEvent.getParameter("columnIndex");
                if (iColIndex === undefined || iColIndex === null || iColIndex < 0) {
                    return;
                }

                // 2. 내부 버튼, 링크 등 상호작용 요소 클릭 제외
                var oDomEvent = window.event;
                var oTarget = (oDomEvent && oDomEvent.target) || null;
                if (oTarget && (oTarget.closest("button") ||
                    oTarget.closest(".sapMBtn") ||
                    oTarget.closest(".sapMLnk") ||
                    oTarget.closest(".sapMCb") ||
                    oTarget.closest(".sapUiTableColResizer"))) {
                    return;
                }

                var oCellControl = oEvent.getParameter("cellControl");
                if (oCellControl && (oCellControl.isA("sap.m.Button") || oCellControl.isA("sap.m.Link") || oCellControl.isA("sap.m.CheckBox"))) {
                    return;
                }

                // 3. Object Page로 이동
                var oContext = oEvent.getParameter("rowBindingContext");
                if (oContext) {
                    oExtensionAPI.routing.navigate(oContext);
                }
            });
        }

        // 1) 이미 렌더링된 sap.ui.table.Table 검색
        var aTables = oView.findAggregatedObjects(true, function (o) {
            return o && o.isA && o.isA("sap.ui.table.Table");
        });
        if (aTables && aTables.length) {
            aTables.forEach(doAttach);
        }

        // 2) sap.ui.mdc.Table 초기화 대기 후 inner table 연결
        var aMdcTables = oView.findAggregatedObjects(true, function (o) {
            return o && o.isA && o.isA("sap.ui.mdc.Table");
        });
        if (aMdcTables && aMdcTables.length) {
            aMdcTables.forEach(function (oMdcTable) {
                if (oMdcTable.initialized) {
                    oMdcTable.initialized().then(function () {
                        var oInner = oMdcTable.getAggregation("_content") || (typeof oMdcTable._getTable === "function" && oMdcTable._getTable());
                        if (oInner && oInner.isA && oInner.isA("sap.ui.table.Table")) {
                            doAttach(oInner);
                        }
                    }).catch(function () {});
                }
            });
        }
    }

    var oExtension = {
        override: {
            onAfterRendering: function () {
                var that = this;
                attachGridRowNavigation(that);
                setTimeout(function () {
                    attachGridRowNavigation(that);
                }, 500);
            },
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
