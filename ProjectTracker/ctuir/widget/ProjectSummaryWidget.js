var METADATA_MAPIMAGESELECTION = "26";

define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin",
    "dojo/text!templates/ProjectSummary.html?v=27",
    "dojo/dom-style", "dojo/_base/fx", "dojo/_base/lang", "dojo/dom-attr", "dojo/dom"],
    function (declare, _WidgetBase, _TemplatedMixin, template, domStyle, baseFx, lang, attr, dom) {
        return declare([_WidgetBase, _TemplatedMixin], {

            Name: "Undefined",
            Description: "",
            
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
            metadata_20: "",
            metadata_22: "Not entered",
            metadata_25: "",
            metadata_26: "",
            Files: "",

            startup: function () {
                this.inherited(arguments);
                    try{
                        console.log("trying metadata26");
                        
                        if(this.metadata_26){
                            for (var file in this.Files) {
                                file = this.Files[file];
                                if (file.Id == this.metadata_26)
                                {
                                    var img = file.Link;

                                    console.log("img = " + img);

                                    if (!is_empty(img))
                                        attr.set("basin-graphic", "src", img);
                                }
                            }
                        }

                        //convert newlines
                        dom.byId("outputs").innerHTML = nl2br(this.metadata_1);
                        dom.byId("outcomes").innerHTML = nl2br(this.metadata_14);
                        dom.byId("impacts").innerHTML = nl2br(this.metadata_15);

                    } catch (e) {
                        console.dir(e);
                    }
            }
        });


        
      
    });

