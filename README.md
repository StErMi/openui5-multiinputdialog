# openui5-multiinputdialog

openui5-multiinputdialog is a SAPUI5 Custom Control that extends a MultiInput allowing you to easily configure the SelectDialog with items suggestion with just a bunch of lines of code.

![MultiInputDialog preview](https://raw.githubusercontent.com/StErMi/openui5-multiinputdialog/master/preview.PNG)

## Demo

You can checkout a demo here: https://stermi.github.io/openui5-multiinputdialog/test/demo/

## Usage

### Configure manifest.json

Add the library to sap.ui5 dependencies list and configure the resourceRoots to point where you uploaded the custom library.

```json
"sap.ui5": {
    ...
	"dependencies": {
		"minUI5Version": "1.30.0",
		"libs": {
    		...
			"it.designfuture.multiinputdialog": {}
		}
	},
	"resourceRoots": {
		"it.designfuture.multiinputdialog": "./thirdparty/it/designfuture/multiinputdialog/"
	}
}
```

### Add the custom control inside an XML View

First of all add the namespace to the View

```xml
xmlns:df="it.designfuture.multiinputdialog"
```

And than you can simply add the MultiInputDialog custom control

```xml
<df:MultiInputDialog
	suggestionItems="{oData>/Customers}"
	tokens="{oDataModel>/tokens}"
	tokenUpdate="onTokenUpdate"
	selectDialogItems="{oData>/Customers}"
	selectDialogFilterKeys="ContactName,ContactTitle"
	selectDialogMultiSelect="true">
	<df:suggestionItems>
		<core:Item 
			key="{oData>CustomerID}" 
			text="{oData>ContactName}, {oData>ContactTitle}" />
	</df:suggestionItems>
	<df:selectDialogItems>
		<StandardListItem 
			title="{oData>CustomerID}" 
			info="{oData>ContactName}, {oData>ContactTitle}" />
	</df:selectDialogItems>
	<df:tokens>
		<Token key="{oData>CustomerID}" 
		text="{oData>ContactName}, {oData>ContactTitle}" />
	</df:tokens>
</df:MultiInputDialog>
```

## Parameters

| Name | Type | Default| Description
| :---- | :------------------- | :---- | :---------  |
| selectDialogFilterKeys | string[] | null | List of keys to filter select dialog items with
| selectDialogMode | String | CheckSelected|HideSelected | SelectDialog mode

You also have all [SelectDialog](https://openui5.hana.ondemand.com/#/api/sap.m.SelectDialog) options to configure the custom control with.

## Methods

| Name |  Description
| :---- | :------------------- |
| setSelectDialogTitle | Set the SelectDialog Title
| setSelectDialogNoDataText | Set the SelectDialog text when there's no item available
| setSelectDialogMultiSelect | Set the SelectDialog multiselect mode
| setSelectDialogGrowingThreshold | Set the SelectDialog growing threshold
| setSelectDialogContentWidth | Set the SelectDialog content width
| setSelectDialogRememberSelections | Set if the SelectDialog should remember selections
| setSelectDialogContentHeight | Set the SelectDialog content height
| existToken | Check if a Token already exists in the MultiInput

## Events

MultiInputDialog is extending MultiInput so you also have all it's event inherited

## Build

If you would like to extend and customize the control, you can easily do that but re-building the code with just a simple Grunt command:

```
npm install
grunt build
```

## Credits

Emanuele Ricci

 - Email: [stermi@gmail.com](stermi@gmail.com)
 - Twitter: [@StErMi](https://twitter.com/StErMi)

## License
This project is licensed under the Apache 2.0 License - see the [LICENSE.md](LICENSE.md) file for details
