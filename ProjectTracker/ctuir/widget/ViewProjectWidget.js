define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin",
    "dojo/text!templates/ViewProject.html?v=38",
    "dojo/dom-style", "dojo/_base/fx", "dojo/_base/lang", "dojo/dom", "dojo/query", "dojo/dom-class"],
    function (declare, _WidgetBase, _TemplatedMixin, template, domStyle, baseFx, lang, dom, query, domClass) {
        return declare([_WidgetBase, _TemplatedMixin], {

            Name: "Undefined",
            Owner: "",
            started: false,

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
         
            DisplayStartDate: "",
            DisplayEndDate: "",

            destroy: function()
            {
                this.inherited(arguments);
                self.started = false;
            },

            //ok NOW dom is loaded...
            startup: function () {
                this.inherited(arguments);

                log.debug("Starting up ViewProjectWidget! started == " + self.started);
                if (!self.started) {

                    initDocuments();
                    initGallery();
                    initSummary();
                    initData();

                    //setup search boxes
                    require(["dijit/form/TextBox", "dojo/on", "dojo/keys", "dojo/dom", "dojo/domReady!"], function (TextBox, on, keys, dom) {
                        //document search
                        var textbox = new TextBox({
                            name: "search-docs",
                            value: "" /* no or empty value! */,
                            placeHolder: "Find Documents",
                        }, "search-docs");

                        on(textbox, "keyup", function (e) {
                            if (e.keyCode == keys.ENTER)
                                e.stopPropagation(); //keeps it from pressing "enter" on whatever the default action on the page is set to be.

                            dom.byId('search-docs-icon').click();
                        });

                        //gallery search
                        var myTextBox = new TextBox({
                            name: "search-gallery",
                            value: "" /* no or empty value! */,
                            placeHolder: "Find Images",
                        }, "search-gallery");

                        on(myTextBox, "keyup", function (e) {
                            if (e.keyCode == keys.ENTER)
                                e.stopPropagation(); //keeps it from pressing "enter" on whatever the default action on the page is set to be.

                            dom.byId('search-gallery-icon').click();

                        });
                    });

                    self.started = true;
                }
                else
                    log.debug("Hey!! we were already started. zoom zoom");

                log.debug("-- setting metadata values --");
                dom.byId("outputs").innerHTML = nl2br(dom.byId("outputs").innerHTML);
                dom.byId("outcomes").innerHTML = nl2br(dom.byId("outcomes").innerHTML);
                dom.byId("impacts").innerHTML = nl2br(dom.byId("impacts").innerHTML);
                dom.byId("details_outputs").innerHTML = nl2br(dom.byId("details_outputs").innerHTML);
                dom.byId("details_outcomes").innerHTML = nl2br(dom.byId("details_outcomes").innerHTML);
                dom.byId("details_impacts").innerHTML = nl2br(dom.byId("details_impacts").innerHTML);

                //show the habitat fields if this is a habitat project.
                ChangeViewFieldsByType();

            }
            
        });

        //displays quad report summary info, esp images.
        function initSummary() {
            
            require(["dijit/form/Button", "dojo/dom", "dojo/dom-class", "dojo/on", "dojo/domReady!"], function (Button, dom, domClass, on) {
                if (current_project.Owner.Id == current_user.Id) {
                    try {
                        //setup the choose quad images button
                        var myButton = new Button({
                            label: "Choose Quad Report images",
                            onClick: function () {

                                dom.byId("search-gallery").value = "";
                                initGallery("choose-image-grid");
                                SummaryImageDialog.show();

                            }
                        }, "chooseQuadImagesButton");

                        dom.byId("displayQuadImages").innerHTML = "No Quad Report images selected";
                        
                        on(dom.byId("quad-images-div"), "mouseover", function () {
                            domClass.remove("choose-images-button", "hidden");
                        });

                        on(dom.byId("quad-images-div"), "mouseout", function () {
                            domClass.add("choose-images-button", "hidden");
                        });

                        //setup the choose project map button
                        var myButton = new Button({
                            label: "Choose map image",
                            onClick: function () {

                                dom.byId("search-gallery").value = "";
                                initGallery("choose-map-image-grid");
                                MapImageDialog.show();

                            }
                        }, "chooseMapImageButton");

                        dom.byId("displayMapImage").innerHTML = "No map image selected";

                        on(dom.byId("project-map-div"), "mouseover", function () {
                            domClass.remove("choose-map-image-button", "hidden");
                        });

                        on(dom.byId("project-map-div"), "mouseout", function () {
                            domClass.add("choose-map-image-button", "hidden");
                        });


                    } catch (e) {
                        log.debug(e);
                    }
                }



                });

                       

        }
        
        function initDocuments() {
            require([
               "dojo/_base/declare",
               "dojo/store/Memory",
               "dgrid/Grid",
               "dgrid/extensions/Pagination",
               "dgrid/Selection",
               "dojo/on",
               "dojo/date/locale"
            ], function (declare, Memory, Grid, Pagination, Selection, on, locale) {

                // Once the response is received, build an in-memory store with the data
                var store = new Memory({ data: current_project.Files, idProperty: "Id" });

                    // Create a Grid instance using Pagination, referencing the store
                    docsgrid = new (declare([Grid, Pagination, Selection]))({
                        store: store,
                        selectionMode: "toggle",

                        columns: [
                            {
                                label: "File", field: "Title",
                                get: function (object) {
                                    return object;
                                },
                                formatter: function (item) {
                                    return "<a href='" + item.Link + "' title='" + item.Description + "' target='_blank'>" + item.Title + "</a>";
                                },
                            },
                            {
                                label: "Description", field: "Description", width: "40%"
                            },
                            {
                                label: "Type",
                                field: "FileTypeId",
                                get: function (object) {
                                    return object.FileType.Name;
                                }
                            },
                            {
                                label: "Uploaded",
                                field: "UploadDate",
                                get: function (object) {
                                    return formatDateTime(object.UploadDate.toString()) + " by " + object.User.Fullname;
                                }
                            },
                            {
                                label: "Size",
                                field: "Size",
                                get: function (object) {
                                    if (object.Size > 1024) {
                                        return object.Size / 1024 + " Mb";
                                    }
                                    return object.Size + " Kb"
                                }
                            },

                        ],

                        query: function (item, index, items) {
                            var filterString = "";

                            if(dom.byId("search-docs"))
                                filterString = dom.byId("search-docs").value;

                            var itemstring = item.Title + " " + item.Description; //so we can do a search of both fields

                            // early exits
                            if (item.FileType.Id == 1) return false; //don't show if it is an image -- those go in the gallery
                            if (filterString.length < 2) return true;
                            if (itemstring == " ") return false; //empty

                            // compare
                            var name = (itemstring + "").toLowerCase();
                            //log.debug(name);
                            if (~name.indexOf(filterString.toLowerCase())) { return true; }

                            return false;
                        },


                    }, "docs-grid");
                
                    docsgrid.refresh();

            });


            

        }

        function initData() {
            require([
               "dojo/_base/declare",
               "dojo/store/Memory",
               "dgrid/Grid",
               "dgrid/extensions/Pagination",
               "dgrid/Selection",
               "dojo/on",
               "dojo/date/locale",
               "dojo/request/xhr"
            ], function (declare, Memory, Grid, Pagination, Selection, on, locale, request) {

                try{

                    console.log("Hey lets see if we can get some datasets for project: "+current_project.Id);
                    //pop out for this project's datasets.
                    request(SERVER_SERVICE + "/action/ProjectDatasets/"+current_project.Id,
                    {
                        handleAs: "json",
                        sync: true //TODO: blocking process -- so we can return when we are done... might want to return a deferred here...
                    }).then(function (data) {
                        console.log("Yep!");
                        console.dir(data);
                        current_project.Datasets = data;

                    }, function (err) { 
                        current_project.Datasets = [];
                        console.log("something went wrong: "); console.dir(err); console.dir(err.response); 
                    });

                    // Once the response is received, build an in-memory store with the data
                    var store = new Memory({ data: current_project.Datasets, idProperty: "Id" });

                    // Create a Grid instance using Pagination, referencing the store
                    var datagrid = new (declare([Grid, Pagination, Selection]))({
                        store: store,
                        selectionMode: "toggle",

                        columns: [
                            {
                                label: "Name", field: "Name", width: "40%",
                                get: function (object) {
                                    return object;
                                },
                                formatter: function (item) {
                                    return "<a href='../DataTracker/index.html#/activities/" + item.Id +"' title='" + item.Description + "' target='_blank'>" + item.Name + "</a>";
                                },
                            },
                            {
                                label: "Description", field: "Description", width: "60%"
                            },

                        ],

                    }, "data-grid");
                
                    datagrid.refresh();


                }catch(e){
                    console.dir(e);
                }


            });


            

        }
      
        function initGallery(target) {

            require([
               "dojo/_base/declare",
               "dojo/store/Memory",
               "dgrid/Grid",
               "dgrid/extensions/Pagination",
               "dgrid/Selection",
               "dojo/on"
            ], function (declare, Memory, Grid, Pagination, Selection, on) {

              
                if (!target)
                    target = "gallery";

                dojo.byId(target).innerHTML = "";

                // Once the response is received, build an in-memory store with the data
                var store = new Memory({ data: current_project.Files, idProperty: "Id"  });

                //dojo.byId("gallery").innerHTML = "";

                    // Create a Grid instance using Pagination, referencing the store
                    var ggrid = new (declare([Grid, Pagination, Selection]))({
                        store: store,
                        selectionMode: "toggle",
                        columns: [
                             {
                                 label: "Image", field: "Link",
                                 get: function (object) {
                                     return object;
                                 },
                                 formatter: function (item) {
                                     return "<a href='" + item.Link + "' title='" + item.Title + "'  target='_blank'><img src='" + item.Link + "'/></a>";
                                 },
                             },
                            {
                                label: "Title", field: "Title", width: "30%"
                            },
                            {
                                label: "Description", field: "Description", width: "30%"
                            },
                            {
                                label: "Uploaded",
                                field: "UploadDate",
                                get: function (object) {
                                    return formatDateTime(object.UploadDate.toString()) + " by " + object.User.Fullname;
                                }
                            },


                        ],
                        query: function (item, index, items) {
                            
                                var filterString = "";

                                //at first, the dom won't be loaded given our widget lifecycle...
                                if (dom.byId("search-gallery"))
                                    filterString = dom.byId("search-gallery").value;

                                var itemstring = item.Title + " " + item.Description; //so we can do a search of both fields

                                //log.debug(item, item.FileType);

                                //log.debug("Our id: ", item.FileType.Id);

                                // early exits
                                if (item.FileType.Id != 1) return false;
                                if (filterString.length < 2) return true;
                                if (itemstring == " ") return false; //empty

                                // compare
                                var name = (itemstring + "").toLowerCase();
                                //log.debug(name);
                                if (~name.indexOf(filterString.toLowerCase())) { return true; }

                                return false;
                            
                        },


                    }, target);
                
                    ggrid.refresh();

                    if (target == "gallery")
                        gallerygrid = ggrid;
                    else
                        imagegrid = ggrid;


            });


           


        }

});



