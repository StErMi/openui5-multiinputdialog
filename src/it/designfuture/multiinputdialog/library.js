/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library it.designfuture.multiinputdialog.
 */
sap.ui.define([
	'jquery.sap.global', 
	'sap/ui/core/library' // library dependency
	],  function(jQuery, library) {

		"use strict";

		/**
		 * Suite controls library.
		 *
		 * @namespace
		 * @name it.designfuture.multiinputdialog
		 * @author Emanuele Ricci <stermi@gmail.com>
		 * @version ${version}
		 * @public
		 */
		
		// delegate further initialization of this library to the Core
		sap.ui.getCore().initLibrary({
			name : "it.designfuture.multiinputdialog",
			noLibraryCSS: true,
			version: "${version}",
			dependencies : ["sap.ui.core", "sap.m"],
			types: [],
			interfaces: [],
			controls: [ 
				"it.designfuture.multiinputdialog.MultiInputDialog"
			],
			elements: []
		});

	/**
	 * Different mode to filter the Select Dialog
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	it.designfuture.multiinputdialog.SelectDialogMode = {

		/**
		 * Default mode. Items already selected in the multi input will be pre-checked in the Select Dialog
		 * @public
		 */
		CheckSelected : "CheckSelected",

		/**
		 * Items already selected in the multi input will be hided in the Select Dialog
		 * @public
		 */
		HideSelected : "HideSelected",

	};

		return it.designfuture.multiinputdialog;

}, /* bExport= */ false);