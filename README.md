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