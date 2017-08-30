// Provides control it.designfuture.multiinputdialog.MultiInputDialog
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/MultiInput",
	"sap/m/Tokenizer",
	"sap/m/Token",
	"sap/m/SelectDialog",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Control, MultiInput, Tokenizer, Token, SelectDialog, Filter, FilterOperator) {
	"use strict";
	
	/**
	 * Constructor for a new MultiInputDialog.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * MultiInputDialog Control to render a QR Code
	 * @extends sap.m.MultiInput
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.40
	 * @name it.designfuture.multiinputdialog.MultiInputDialog
	 */
	var MultiInputDialog =  MultiInput.extend("it.designfuture.multiinputdialog.MultiInputDialog", {

		__valueHelpCurrentFilter: [],
		
		metadata : {
			library: 'it.designfuture.multiinputdialog',
			properties: {

				//CUSTOM
				/**
				 * List of keys used to filter the select dialog
				 */
				selectDialogFilterKeys : {type : "string[]", group : "Appearance", defaultValue : null},

				
				/**
				 * Select dialog mode to handle values already selected in the MultiInput
				 */
				selectDialogMode : {type : "it.designfuture.multiinputdialog.SelectDialogMode", group : "Appearance", defaultValue : it.designfuture.multiinputdialog.SelectDialogMode.CheckSelected},

				//SELECT DIALOG
				/**
				 * Determines the title text that appears in the dialog header
				 */
				selectDialogTitle : {type : "string", group : "Appearance", defaultValue : null},

				/**
				 * Determines the text shown when the list has no data
				 */
				selectDialogNoDataText : {type : "string", group : "Appearance", defaultValue : null},

				/**
				 * Determines if the user can select several options from the list
				 */
				selectDialogMultiSelect : {type : "boolean", group : "Dimension", defaultValue : false},

				/**
				 * Determines the number of items initially displayed in the list. Also defines the number of items to be requested from the model for each grow.
				 */
				selectDialogGrowingThreshold : {type : "int", group : "Misc", defaultValue : null},

				/**
				 * Determines the content width of the inner dialog. For more information, see the dialog documentation.
				 * @since 1.18
				 */
				selectDialogContentWidth : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

				/**
				 * This flag controls whether the dialog clears the selection after the confirm event has been fired. If the dialog needs to be opened multiple times in the same context to allow for corrections of previous user inputs, set this flag to "true".
				 * @since 1.18
				 */
				selectDialogRememberSelections : {type : "boolean", group : "Behavior", defaultValue : false},

				/**
				 * Determines the content height of the inner dialog. For more information, see the dialog documentation.
				 */
				selectDialogContentHeight : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null}
			},
			aggregations: {
				__selectDialog : {type : "sap.m.SelectDialog", multiple: false, visibility : "hidden"},
				selectDialogItems : {type : "sap.ui.core.Item", multiple : true, singularName : "selectDialogItem"}
			},
			events: {},
			renderer: null
		},
		
		init: function() {
			MultiInput.prototype.init.call(this);

			this.__valueHelpCurrentFilter = [];

			this.attachValueHelpRequest(this.__onValueHelpRequest, this);
			this.attachSuggest(this.__onSuggest, this);

			this.setAggregation("__selectDialog", new SelectDialog({
				// PROPERTIES
				title: this.getSelectDialogTitle(),
				noDataText: this.getSelectDialogNoDataText(),
				multiSelect: this.getSelectDialogMultiSelect(),
				growingThreshold: this.getSelectDialogGrowingThreshold(),
				contentWidth: this.getSelectDialogContentWidth(),
				rememberSelections: this.getSelectDialogRememberSelections(),
				contentHeight: this.getSelectDialogContentHeight(),

				// EVENTS
				search: this.__onValueHelpSearch.bind(this),
				confirm: this.__onValueHelpConfirm.bind(this)

			}));
		},

		//////////////////////////////////////////////
		// PRIVATE METHODS
		//////////////////////////////////////////////


		__getSourceValueFromValueHelp: function(selectedItem, sourceInfo) {
			var rV = null;
			if( sourceInfo.parts.length > 1 ) {
				var collectedValues = [];
				for( var k in sourceInfo.parts ) {
					var part = sourceInfo.parts[k];
					collectedValues.push( selectedItem.getBindingContext(part.model).getObject()[part.path] );
				}
				rV = sourceInfo.formatter.apply(this, collectedValues);
			} else {
				var firstPart = sourceInfo.parts[0];
				rV = selectedItem.getBindingContext(firstPart.model).getObject()[firstPart.path];
			}
			return rV;
		},

		__selectDialgoOnDataReceived: function(oEvent) {
			var aTokens = this.getTokens();
			var aItems = this.getAggregation("__selectDialog").getItems();
			for (var j in aItems){
				for( var k in aTokens ) {
					if( aItems[j].getTitle() === aTokens[k].getKey() || aItems[j].getDescription() === aTokens[k].getKey() || aItems[j].getTitle() === aTokens[k].getText() || aItems[j].getDescription() === aTokens[k].getText() ) {
						aItems[j].setSelected(true);
					}
				}
			}
		},

		__onValueHelpConfirm: function(oEvent) {
			//should add token to the multi input
			var tokens = this.getTokens();
			var mode = this.getSelectDialogMode();
			var selectedItems = oEvent.getParameter("selectedItems");
			var sourceItemTemplate = this.getBindingInfo("suggestionItems").template;
			var aAddedTokens = [];
			var aRemovedTokens = [];

			//	Check if current tokens are in the selected ones otherwise delete those tokens
			if ( mode === it.designfuture.multiinputdialog.SelectDialogMode.CheckSelected ) {
				var tokenExist = false;
				for( var tk in tokens ) {
					tokenExist = false;
					var token = tokens[tk];
					for( var ik in selectedItems ) {
						var selectedItem = selectedItems[ik];
						var keyValue = this.__getSourceValueFromValueHelp(selectedItem, sourceItemTemplate.getBindingInfo("key"));
						tokenExist = keyValue === token.getKey();
						if( tokenExist )
							break;
					}

					if( !tokenExist ) {
						aRemovedTokens.push(token);
						this.removeToken(token);
					}
				}
			}

			for( var k in selectedItems ) {
				var selectedItem = selectedItems[k];

				var keyValue = this.__getSourceValueFromValueHelp(selectedItem, sourceItemTemplate.getBindingInfo("key"));
				var textValue = this.__getSourceValueFromValueHelp(selectedItem, sourceItemTemplate.getBindingInfo("text"));
				var newToken = new Token({
					key: keyValue,
					text: textValue
				});

				//we should always check if this token is not already in the token list
				if( !this.existToken(newToken) ) {
					aAddedTokens.push(newToken);
					this.addToken(newToken);
				}
			}

			if( aAddedTokens.length > 0 ) {
				this.fireTokenUpdate({
					addedTokens: aAddedTokens,
					removedTokens: [],
					type: Tokenizer.TokenUpdateType.Added
				});
			}

			if( aRemovedTokens.length > 0 ) {
				this.fireTokenUpdate({
					addedTokens: [],
					removedTokens: aRemovedTokens,
					type: Tokenizer.TokenUpdateType.Removed
				});
			}

		},

		__onSuggestionItemSelected: function(oEvent) {
			oEvent.getSource().getBinding("suggestionItems").filter([]);
		},

		__onSuggest: function(oEvent) {
			var sQuery = oEvent.getParameter("suggestValue");
			var oBinding = oEvent.getSource().getBinding("suggestionItems");

			//Reset filters it has retained
			oBinding.aFilters = [];

			var aFilters = [];
			if (sQuery) {
				aFilters = new Filter(this.addSearchFilter(sQuery), false);
			}

			var tokenFilters = this.addTokenToFilter();
			var aFilters = tokenFilters.concat(aFilters);

			oBinding.filter(aFilters.length > 0 ? new Filter(aFilters, true) : aFilters);
		},

		__onValueHelpRequest: function(oEvent) {
			var mode = this.getSelectDialogMode();
			var selectDialog = this.getAggregation("__selectDialog");

			if( mode === it.designfuture.multiinputdialog.SelectDialogMode.HideSelected ) {
				var filters = this.addTokenToFilter();
				this.__valueHelpCurrentFilter = filters.length > 0 ? new Filter(filters, true) : filters;
				selectDialog.getBinding("items").filter(this.__valueHelpCurrentFilter);
			} else if ( mode === it.designfuture.multiinputdialog.SelectDialogMode.CheckSelected ) {
				this.getAggregation("__selectDialog").getBinding("items").attachDataReceived(this.__selectDialgoOnDataReceived, this);
				this.__selectDialgoOnDataReceived();
			}
			selectDialog.open();
		},

		__onValueHelpSearch: function(oEvent) {
			var aInternalFilters = [];
			var sSearchValue = oEvent.getParameter("value");

			if( aFilterKeys !== undefined && aFilterKeys !== null && aFilterKeys.length !== 0 && sSearchValue.length > 0 ) {
				aInternalFilters = this.addSearchFilter(sSearchValue);
			}

			var aFilters = aInternalFilters.length > 0 ? new Filter([new Filter(aInternalFilters, false)].concat(this.__valueHelpCurrentFilter), true) : this.__valueHelpCurrentFilter;

			oEvent.getSource().getBinding("items").filter( aFilters );
		},

		//////////////////////////////////////////////
		// METHODS
		//////////////////////////////////////////////

		addSearchFilter: function(sSearchValue) {
			var aInternalFilters = [];
			var aFilterKeys = this.getSelectDialogFilterKeys();
			for( var k in aFilterKeys ) {
				aInternalFilters.push(new Filter(
					aFilterKeys[k],
					FilterOperator.Contains,
					sSearchValue
				));
			}

			return aInternalFilters;
		},

		addTokenToFilter: function() {
			var aTokens = this.getTokens();
			var sourceItemTemplate = this.getBindingInfo("suggestionItems").template;
			var keyPath = sourceItemTemplate.getBindingInfo("key").parts[0].path;
			var aFilters = [];

			for( var k in aTokens ) {
				var token = aTokens[k];
				aFilters.push(
					new Filter(keyPath, FilterOperator.NE, token.getKey())
				);
			}
			return aFilters;
		},

		//////////////////////////////////////////////
		// GETTER / SETTER
		//////////////////////////////////////////////

		setSelectDialogTitle: function(value) {
			this.getAggregation("__selectDialog").setTitle(value);
			this.setProperty("selectDialogTitle", value, false);
			return this;
		},

		setSelectDialogNoDataText: function(value) {
			this.getAggregation("__selectDialog").setNoDataText(value);
			this.setProperty("selectDialogNoDataText", value, false);
			return this;
		},

		setSelectDialogMultiSelect: function(value) {
			this.getAggregation("__selectDialog").setMultiSelect(value);
			this.setProperty("selectDialogMultiSelect", value, false);
			return this;
		},

		setSelectDialogGrowingThreshold: function(value) {
			this.getAggregation("__selectDialog").setGrowingThreshold(value);
			this.setProperty("selectDialogGrowingThreshold", value, false);
			return this;
		},

		setSelectDialogContentWidth: function(value) {
			this.getAggregation("__selectDialog").setContentWidth(value);
			this.setProperty("selectDialogContentWidth", value, false);
			return this;
		},

		setSelectDialogRememberSelections: function(value) {
			this.getAggregation("__selectDialog").setRememberSelections(value);
			this.setProperty("selectDialogRememberSelections", value, false);
			return this;
		},

		setSelectDialogContentHeight: function(value) {
			this.getAggregation("__selectDialog").setContentHeight(value);
			this.setProperty("selectDialogContentHeight", value, false);
			return this;
		},

	});
	
	MultiInputDialog.prototype.existToken = function (oCompareToken) {
		var exist = false;
		var aTokens = this.getTokens();
		var oToken = null;
		for( var k in aTokens ) {
			oToken = aTokens[k];
			exist = oToken.getKey() === oCompareToken.getKey() && oToken.getText() === oCompareToken.getText();
			if( exist )
				break;
		}
		return exist;
	};

	/*
	 * Forwards a function call to a managed object based on the aggregation name.
	 * If the name is items, it will be forwarded to the list, otherwise called locally
	 * @private
	 * @param {string} sFunctionName The name of the function to be called
	 * @param {string} sAggregationName The name of the aggregation asociated
	 * @returns {any} The return type of the called function
	 */
	MultiInputDialog.prototype._callMethodInManagedObject = function (sFunctionName, sAggregationName) {
		var aArgs = Array.prototype.slice.call(arguments);

		if (sAggregationName === "selectDialogItems") {
			// apply to the internal list
			var subArgs = aArgs.slice(1);
			subArgs[0] = "items";
			return this.getAggregation("__selectDialog")[sFunctionName].apply(this.getAggregation("__selectDialog"), subArgs);
		} else {
			// apply to this control
			return sap.ui.base.ManagedObject.prototype[sFunctionName].apply(this, aArgs.slice(1));
		}
	};

	/**
	 * Forwards aggregations with the name of items to the internal list.
	 * @override
	 * @protected
	 * @param {string} sAggregationName The name for the binding
	 * @param {object} oBindingInfo The configuration parameters for the binding
	 * @returns {sap.m.MultiInputDialog} this pointer for chaining
	 */
	MultiInputDialog.prototype.bindAggregation = function () {
		var args = Array.prototype.slice.call(arguments);

		// propagate the bind aggregation function to list
		this._callMethodInManagedObject.apply(this, ["bindAggregation"].concat(args));
		return this;
	};

	MultiInputDialog.prototype.validateAggregation = function (sAggregationName, oObject, bMultiple) {
		return this._callMethodInManagedObject("validateAggregation", sAggregationName, oObject, bMultiple);
	};

	MultiInputDialog.prototype.setAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
		this._callMethodInManagedObject("setAggregation", sAggregationName, oObject, bSuppressInvalidate);
		return this;
	};

	MultiInputDialog.prototype.getAggregation = function (sAggregationName, oDefaultForCreation) {
		return this._callMethodInManagedObject("getAggregation", sAggregationName, oDefaultForCreation);
	};

	MultiInputDialog.prototype.indexOfAggregation = function (sAggregationName, oObject) {
		return this._callMethodInManagedObject("indexOfAggregation", sAggregationName, oObject);
	};

	MultiInputDialog.prototype.insertAggregation = function (sAggregationName, oObject, iIndex, bSuppressInvalidate) {
		this._callMethodInManagedObject("insertAggregation", sAggregationName, oObject, iIndex, bSuppressInvalidate);
		return this;
	};

	MultiInputDialog.prototype.addAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
		this._callMethodInManagedObject("addAggregation", sAggregationName, oObject, bSuppressInvalidate);
		return this;
	};

	MultiInputDialog.prototype.removeAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
		return this._callMethodInManagedObject("removeAggregation", sAggregationName, oObject, bSuppressInvalidate);
	};

	MultiInputDialog.prototype.removeAllAggregation = function (sAggregationName, bSuppressInvalidate) {
		return this._callMethodInManagedObject("removeAllAggregation", sAggregationName, bSuppressInvalidate);
	};

	MultiInputDialog.prototype.destroyAggregation = function (sAggregationName, bSuppressInvalidate) {
		this._callMethodInManagedObject("destroyAggregation", sAggregationName, bSuppressInvalidate);
		return this;
	};

	MultiInputDialog.prototype.getBinding = function (sAggregationName) {
		return this._callMethodInManagedObject("getBinding", sAggregationName);
	};


	MultiInputDialog.prototype.getBindingInfo = function (sAggregationName) {
		return this._callMethodInManagedObject("getBindingInfo", sAggregationName);
	};

	MultiInputDialog.prototype.getBindingPath = function (sAggregationName) {
		return this._callMethodInManagedObject("getBindingPath", sAggregationName);
	};
	
	/*
	* Override the exit method to free local resources and destroy 
	* @public
	*/	
	MultiInputDialog.prototype.exit = function() {
		// do something here to free resources ;)
		this.__valueHelpCurrentFilter = undefined;
	};
	
	return MultiInputDialog;

}, /* bExport= */ true);