## Application Details
|               |
| ------------- |
|**Generation Date and Time**<br>Wed Sep 16 2026 08:12:16 GMT+0900 (Korean Standard Time)|
|**App Generator**<br>SAP Fiori Application Generator|
|**App Generator Version**<br>1.32.0|
|**Generation Platform**<br>Visual Studio Code|
|**Template Used**<br>List Report Page V4|
|**Service Type**<br>OData URL|
|**Service URL**<br>https://saphana2.s-pert.com:44360/sap/opu/odata4/sap/zsp_itsm_p_custmaster_ui_v4/srvd/sap/zsp_itsm_p_custmaster_ui/0001/|
|**Module Name**<br>zspf_custmaster|
|**Application Title**<br>거래처 마스터|
|**Namespace**<br>zsp.itsm|
|**UI5 Theme**<br>sap_horizon|
|**UI5 Version**<br>1.152.0|
|**Enable TypeScript**<br>False|
|**Add Eslint configuration**<br>True, see https://www.npmjs.com/package/@sap-ux/eslint-plugin-fiori-tools#rules for the eslint rules.|
|**Main Entity**<br>Main|
|**Navigation Entity**<br>None|

## zspf_custmaster

거래처 마스터

### Starting the generated app

-   This app has been generated using the SAP Fiori tools - App Generator, as part of the SAP Fiori tools suite.  To launch the generated application, run the following from the generated application root folder:

```
    npm start
```

- It is also possible to run the application using mock data that reflects the OData Service URL supplied during application generation.  In order to run the application with Mock Data, run the following from the generated app root folder:

```
    npm run start-mock
```

#### Pre-requisites:

1. Active NodeJS LTS (Long Term Support) version and associated supported NPM version.  (See https://nodejs.org)


### Custom Extensions (Rich Text Editor & Selection Fields)

Fiori Elements 표준 List Report V4 템플릿에 Page Map을 활용하여 서식 있는 텍스트(Rich Text Editor) 확장을 적용한 내역입니다.

<br>

#### 1) manifest.json — 커스텀 섹션을 ObjectPage에 등록

`sap.ui5 > routing > targets > mainObjectPage > options > settings > content.body.sections` 아래에 섹션을 하나 선언합니다. 이 섹션 키(`Richtexteditor`)가 나중에 컨트롤러에서 컨트롤을 찾을 때 쓰는 ID의 일부가 되므로 이름을 바꾸면 컨트롤러 쪽 ID 문자열도 같이 바꿔야 합니다.

```json
"mainObjectPage": {
  "options": {
    "settings": {
      "content": {
        "body": {
          "sections": {
            "Richtexteditor": {
              "template": "zsp.itsm.zspf_custmaster.ext.fragment.RichTextEditor",
              "title": "{i18n>detailContentTitle}",
              "position": {
                "placement": "After",
                "anchor": "Item"
              }
            }
          }
        }
      }
    }
  }
}
```

#### 2) RichTextEditor.fragment.xml — UI 컴포넌트 구성
표준 화면에 삽입될 에디터 영역입니다. TinyMCE6 엔진을 사용하며, 화면의 상태(읽기/편집)에 따라 editable 속성이 OData V4 모델 UI 상태값과 동적으로 바인딩됩니다.

```xml
<core:FragmentDefinition
    xmlns="sap.m"
    xmlns:core="sap.ui.core"
    xmlns:rte="sap.ui.richtexteditor">
    
    <VBox class="sapUiContentPadding">
        <rte:RichTextEditor
            id="myRTE"
            value="{Content}" 
            editable="{ui>/isEditable}"
            editorType="TinyMCE6"
            width="100%"
            height="600px"
            customToolbar="true"
            showGroupFont="true"
            showGroupLink="true"
            showGroupInsert="true"
            ready=".onRTEReady" />
    </VBox>
</core:FragmentDefinition>
```

#### 3) RichTextEditor.controller.js — 에디터 툴바 커스터마이징
UI 렌더링이 완료된 후 발생하는 ready 이벤트(onRTEReady)를 잡아, 기본 툴바 외에 텍스트 스타일(styles)과 표 삽입(table) 버튼 그룹을 에디터 인스턴스에 동적으로 추가합니다.

```json
sap.ui.define([
    "sap/ui/richtexteditor/library" 
], function(RTELibrary) {
    'use strict';

    return {
        onRTEReady: function(oEvent) {
            var oRTE = oEvent.getSource();

            // 추가 툴바 그룹 바인딩
            oRTE.addButtonGroup("styles").addButtonGroup("table");
        }
    };
});
```

#### 4) annotation.xml — 솔루션 구분(SolutionFlag) 내비게이션 필터 추가
OData V4 환경에서 Header 엔티티 리스트를 조회할 때, 자식 엔티티의 필드(솔루션 구분)로 필터링하기 위해 `@UI.SelectionFields` 어노테이션을 로컬에 재정의했습니다. 
기존 백엔드 필터 속성들(`Custno`, `Manager`)을 그대로 유지하면서, 새롭게 추가된 내비게이션 경로인 `_Solution/SolutionFlag`를 명시하여 조회 시 1:N 관계에 의한 헤더 데이터 중복 문제를 방지합니다.

```xml
<Annotations Target="SAP__self.MainType">
    <Annotation Term="UI.SelectionFields">
        <Collection>
            <PropertyPath>Custno</PropertyPath>
            <PropertyPath>Manager</PropertyPath>
            <PropertyPath>_Solution/SolutionFlag</PropertyPath>
        </Collection>
    </Annotation>
</Annotations>
```

#### 5) NavContextExt.controller.js — Cross-App Navigation 파라미터 정제 (화이트리스트 제어)
거래처 마스터에서 고객업체 요청관리(`ZSPF_REQUEST`) 등 타 앱으로 Intent 기반 내비게이션(Cross-App Navigation)을 수행할 때, 현재 화면의 불필요한 필터 조건이나 파라미터(감사 필드 등)가 타겟 앱으로 전파되어 검색을 왜곡하는 현상을 방지하도록 `adaptNavigationContext` 훅을 구현했습니다.

* **manifest.json (컨트롤러 확장 및 Outbound 선언)**:
```json
"sap.ui5": {
  "extends": {
    "extensions": {
      "sap.ui.controllerExtensions": {
        "sap.fe.templates.ObjectPage.ObjectPageController": {
          "controllerName": "zsp.itsm.zspfcustmaster.ext.controller.NavContextExt"
        },
        "sap.fe.templates.ListReport.ListReportController": {
          "controllerName": "zsp.itsm.zspfcustmaster.ext.controller.NavContextExt"
        }
      }
    }
  }
}
```

* **NavContextExt.controller.js (파라미터 화이트리스트 필터링)**:
```javascript
sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension"
], function (ControllerExtension) {
    "use strict";

    var mAllowedByTarget = {
        "ZSPF_REQUEST": ["Custno"]
    };

    function restrictSelectionVariant(oSelectionVariant, aAllowed) {
        if (!oSelectionVariant) return;
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

    return ControllerExtension.extend("zsp.itsm.zspfcustmaster.ext.controller.NavContextExt", {
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
    });
});
```

<br>

#### 6) CustnoCell (커스텀 컬럼 Fragment) — 고객업체코드 및 요청내역(ZSPF_REQUEST) 바로가기

고객 목록 테이블의 가독성을 높이고 특정 고객의 요청내역을 원클릭으로 바로 조회할 수 있도록, 표준 컬럼을 커스텀 XML Fragment로 확장했습니다.

* **manifest.json (커스텀 컬럼 등록)**:
  `controlConfiguration > @com.sap.vocabularies.UI.v1.LineItem > columns`에 `CustnoCell`을 선언하고 배치 위치(`anchor: "DataField::Buildate", placement: "Before"`)를 지정했습니다.
```json
"columns": {
  "CustnoCell": {
    "header": "고객업체코드",
    "width": "18rem",
    "horizontalAlign": "Begin",
    "position": {
      "anchor": "DataField::Buildate",
      "placement": "Before"
    },
    "template": "zsp.itsm.zspfcustmaster.ext.fragment.CustnoCell",
    "properties": [
      "Custno",
      "Custname"
    ]
  }
}
```

* **CustnoCell.fragment.xml (UI 구성)**:
  고객업체명(`Custname` 또는 `Custno`) 텍스트와 함께 `ZSPF_REQUEST`로 바로 이동하는 인라인 버튼(`요청내역`)을 배치했습니다.
```xml
<core:FragmentDefinition
    xmlns="sap.m"
    xmlns:core="sap.ui.core">
    <HBox alignItems="Center">
        <Text
            text="{= ${Custname} || ${Custno} }"
            wrapping="false"
            class="sapUiTinyMarginEnd" />
        <Button
            icon="sap-icon://request"
            text="요청내역"
            type="Transparent"
            tooltip="고객 요청내역(ZSPF_REQUEST) 바로가기"
            press="handler.onNavigateToRequest"
            core:require="{ handler: 'zsp/itsm/zspfcustmaster/ext/controller/CustnoCellHandler' }" />
    </HBox>
</core:FragmentDefinition>
```

* **CustnoCellHandler.js (Cross-App Navigation 실행)**:
  선택된 행의 `Custno`를 파라미터로 추출하여 `CrossApplicationNavigation` 서비스를 통해 `ZSPF_REQUEST-display`로 화면 전환을 수행합니다.

<br>

#### 7) NavContextExt.controller.js — GridTable 라인(행) 클릭 시 Object Page 자동 진입 네비게이션

다수의 컬럼을 가로 스크롤로 조회할 수 있는 `GridTable` 고유의 데스크톱 레이아웃과 하단 가로 스크롤바를 100% 유지하면서, 우측 끝의 작은 화살표(`>`) 버튼까지 마우스를 이동할 필요 없이 **행/셀 클릭만으로 즉시 상세(Object Page)로 이동**할 수 있도록 컨트롤러 확장 이벤트를 구현했습니다.

* **작동 원리 및 주요 예외 처리**:
  - `onAfterRendering` 생명주기에서 `sap.ui.mdc.Table`의 초기화 완료(`initialized()`) 시 내부 `sap.ui.table.Table`에 `cellClick` 리스너를 바인딩합니다.
  - **체크박스 열 제외**: 행 삭제나 다중 선택을 위해 체크박스 열(`columnIndex < 0`)을 누를 때는 상세 페이지로 이동하지 않고 순수 행 선택만 정상 동작하도록 예외 처리했습니다.
  - **내부 액션 버튼 제외**: `[요청내역]` 버튼이나 링크(`.sapMBtn`, `.sapMLnk` 등)를 누를 때는 해당 액션만 수행되고 상세 페이지로 튕기지 않도록 이벤트 타겟 필터링을 적용했습니다.
  - 셀 클릭 시 바인딩 컨텍스트(`rowBindingContext`)를 추출하여 Fiori Elements 표준 `routing.navigate(oContext)`를 호출합니다.

```javascript
// NavContextExt.controller.js — GridTable 행 클릭 네비게이션
function attachGridRowNavigation(oController) {
    var oView = oController.base.getView();
    var oExtensionAPI = oController.base.getExtensionAPI();
    if (!oView || !oExtensionAPI || !oExtensionAPI.routing) return;

    function doAttach(oInnerTable) {
        if (!oInnerTable || oInnerTable._bRowNavAttached) return;
        oInnerTable._bRowNavAttached = true;

        oInnerTable.attachCellClick(function (oEvent) {
            var iColIndex = oEvent.getParameter("columnIndex");
            if (iColIndex === undefined || iColIndex === null || iColIndex < 0) return; // 체크박스 제외

            var oDomEvent = window.event;
            var oTarget = (oDomEvent && oDomEvent.target) || null;
            if (oTarget && (oTarget.closest("button") || oTarget.closest(".sapMBtn") || oTarget.closest(".sapMLnk"))) return;

            var oContext = oEvent.getParameter("rowBindingContext");
            if (oContext) {
                oExtensionAPI.routing.navigate(oContext);
            }
        });
    }

    var aTables = oView.findAggregatedObjects(true, function (o) { return o && o.isA && o.isA("sap.ui.table.Table"); });
    if (aTables && aTables.length) aTables.forEach(doAttach);

    var aMdcTables = oView.findAggregatedObjects(true, function (o) { return o && o.isA && o.isA("sap.ui.mdc.Table"); });
    if (aMdcTables && aMdcTables.length) {
        aMdcTables.forEach(function (oMdc) {
            if (oMdc.initialized) {
                oMdc.initialized().then(function () {
                    var oInner = oMdc.getAggregation("_content") || (typeof oMdc._getTable === "function" && oMdc._getTable());
                    if (oInner && oInner.isA && oInner.isA("sap.ui.table.Table")) doAttach(oInner);
                });
            }
        });
    }
}
```

<br>

#### 8) annotation.xml — custDelete 및 onDelete(논리 삭제) 액션 실행 시 테이블 자동 새로고침(Common.SideEffects)

BDEF의 `custDelete`(고객사 삭제) 및 `onDelete`(고객담당자 삭제) 액션은 레코드를 물리적으로 삭제하지 않고 `delflag = 'X'`로 처리하는 논리적 삭제(Soft Delete) 방식으로 동작합니다. OData V4 Fiori Elements 환경에서 커스텀 액션(POST) 실행 후 테이블 캐시가 자동 갱신되지 않아 화면에 삭제된 행이 유지되던 현상을 해결하기 위해 SideEffects 어노테이션을 적용했습니다.

* **현상 및 원인**:
  - `custDelete` / `onDelete` 액션 수행 시 백엔드 CDS View(`where delflag is initial`)에서 해당 데이터가 제외되지만, 프론트엔드에서는 엔티티셋 재조회 트리거가 없어 브라우저를 새로고침하기 전까지 행이 유지됨.
* **해결 방안 (`annotation.xml`)**:
  - `SAP__self.MainType` 대상에 `custDelete` 실행 시 루트 엔티티셋(`/com.sap.gateway.srvd.zsp_itsm_p_custmaster_ui.v0001.Container/Main`)을 재조회하는 `Common.SideEffects` 정의.
  - `SAP__self.CustomerManagerType` 대상에 `onDelete` 실행 시 담당자 네비게이션 컬렉션(`_Customer/_Manager` 및 `/...Container/CustomerManager`)을 재조회하는 `Common.SideEffects` 정의.

```xml
<!-- custDelete (고객사 삭제) SideEffects -->
<Annotations Target="SAP__self.MainType">
    <Annotation Term="Common.SideEffects" Qualifier="CustDeleteRefresh">
        <Record Type="Common.SideEffectsType">
            <PropertyValue Property="SourceActions">
                <Collection>
                    <String>com.sap.gateway.srvd.zsp_itsm_p_custmaster_ui.v0001.custDelete</String>
                    <String>SAP__self.custDelete</String>
                </Collection>
            </PropertyValue>
            <PropertyValue Property="TargetEntities">
                <Collection>
                    <NavigationPropertyPath>/com.sap.gateway.srvd.zsp_itsm_p_custmaster_ui.v0001.Container/Main</NavigationPropertyPath>
                </Collection>
            </PropertyValue>
            <PropertyValue Property="TargetProperties">
                <Collection>
                    <PropertyPath>Delflag</PropertyPath>
                </Collection>
            </PropertyValue>
        </Record>
    </Annotation>
</Annotations>

<!-- onDelete (고객담당자 삭제) SideEffects -->
<Annotations Target="SAP__self.CustomerManagerType">
    <Annotation Term="Common.SideEffects" Qualifier="CustManagerDeleteRefresh">
        <Record Type="Common.SideEffectsType">
            <PropertyValue Property="SourceActions">
                <Collection>
                    <String>com.sap.gateway.srvd.zsp_itsm_p_custmaster_ui.v0001.onDelete</String>
                    <String>SAP__self.onDelete</String>
                </Collection>
            </PropertyValue>
            <PropertyValue Property="TargetEntities">
                <Collection>
                    <NavigationPropertyPath>_Customer/_Manager</NavigationPropertyPath>
                    <NavigationPropertyPath>/com.sap.gateway.srvd.zsp_itsm_p_custmaster_ui.v0001.Container/CustomerManager</NavigationPropertyPath>
                    <NavigationPropertyPath></NavigationPropertyPath>
                </Collection>
            </PropertyValue>
            <PropertyValue Property="TargetProperties">
                <Collection>
                    <PropertyPath>Delflag</PropertyPath>
                </Collection>
            </PropertyValue>
        </Record>
    </Annotation>
</Annotations>
```
