define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin",
		"dojo/text!templates/EntitySelectList.html",
		"dojo/dom-style", "dojo/_base/fx",
		"dojo/_base/lang"], function (declare, _WidgetBase, _TemplatedMixin, template, domStyle, baseFx, lang) {
		    return declare([_WidgetBase, _TemplatedMixin], {
		        templateString: template,
		        baseClass: 'entitySelectListWidget',

		        buildRendering: function () {

		          


		        },

		        postCreate: function () {
		            var domNode = this.domNode;
		            this.inherited(arguments);



		        },


		    });
		});