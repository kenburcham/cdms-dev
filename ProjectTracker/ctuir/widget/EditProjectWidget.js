
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/text!templates/EditProject.html?v=15",
    "dojo/dom-style", "dojo/_base/fx", "dojo/_base/lang", "dojo/dom-class"],
    function (declare, _WidgetBase, _TemplatedMixin, template, domStyle, baseFx, lang, domClass) {
        return declare([_WidgetBase, _TemplatedMixin], {

            Id: 0,
            Name: "",
            Description: "",
            ProjectTypeId: 0,

            StartDate: "",
            EndDate: "",

            templateString: template,

            metadata_1: "",
            metadata_2: "",
            metadata_3: "",
            metadata_4: "",
            metadata_5: "",
            metadata_6: "",
            metadata_7: "",
            metadata_8: "",
            metadata_9: "",
            metadata_10: "",
            metadata_11: "",
            metadata_12: "",
            metadata_13: "",
            metadata_14: "",
            metadata_15: "",
            metadata_16: "",
            metadata_18: "",
            metadata_19: "",
            metadata_20: "",
            metadata_21: "",
            metadata_22: "",
            metadata_23: "",
            metadata_24: "", //should just auto-create these in the constructor sometime soon.

            getFormDijits: function() {
                return dijits;
            },

            destroy: function () {
                    log.debug("in widget: trying to destroy all local dijits");
                    log.debug("look like there are " + dijits.length);

                    //log.debug(dijits);

                    for (var dijit in dijits) {
                        var mydijit = dijits[dijit];
                        log.debug("destroying dijit");
                        try{
                            mydijit.destroy();
                        } catch (e) {
                            log.debug("boom -- oh well.");
                        }
                    }

                this.inherited(arguments);
                log.debug("DESTRUCTION COMPLETE.---------------------");
            },

            postCreate: function () {
                log.debug("hi mom -- postcreate of edit widget");
            },

            startup: function () {
                this.inherited(arguments);
                ChangeEditFieldsByType();
            },
            
         
        });

});
