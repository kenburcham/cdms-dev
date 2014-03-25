define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/text!templates/ProjectLister.html?v=2",
    "dojo/dom-style", "dojo/_base/fx", "dojo/_base/lang"],
    function (declare, _WidgetBase, _TemplatedMixin, template, domStyle, baseFx, lang) {
        return declare([_WidgetBase, _TemplatedMixin], {

            Name: "No Name",
            Description: "Description",
            templateString: template,
            baseClass: "authorWidget",
            mouseAnim: null
         
        });
});
