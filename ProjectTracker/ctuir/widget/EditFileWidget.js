
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!templates/EditFile.html?v=1",
    "dojo/dom-attr", "dojo/query", "dojo/_base/lang"],
    function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, domAttr, query, lang) {
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

            Id: 0,
            Name: "",
            Description: "",
            Title: "",
            Link: "",

            templateString: template,

            startup: function () {
                this.inherited(arguments);
                var suffix = this.Link.substr(this.Link.length -3,3);
                log.debug("Suffix: " + suffix);
                if (suffix != "png" && suffix != "jpg" && suffix != "gif")
                    domAttr.set("linkNode", "src", "/jsdemo/images/blank-document.png");
                
            },

         
        });

});
