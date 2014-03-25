require([
     "dojo/_base/declare", "dojo/parser", "dojo/ready",
     "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/text!templates/projectDetails.html"
], function(declare, parser, ready, _WidgetBase, _TemplatedMixin, template){

    declare("ctuir/ProjectDetail", [_WidgetBase, _TemplatedMixin], {
        templateString: template,
        Description: "[Empty]",
        Name: "[Empty]",
        project: null,
        
        postCreate: function () {
            log.debug("and now post-create");
        },

        onPageLoad: function () {
            log.debug(" and now on page load");
        },

    });

    ready(function () {
        // Call the parser manually so it runs after our widget is defined, and page has finished loading
        parser.parse();

        log.debug("Hey we are here!");

        //log.debug("Hey!  we are here with a project: " + current_project.Id);

        initGallery();
        initDocuments();
        initData();
        initLocations();
        log.debug("done initilizing grids");

    });

    
    
    
});

function initGallery()
{

    require([
       "dojo/_base/declare",
       "dojo/store/Memory",
       "dgrid/Grid",
       "dgrid/extensions/Pagination",
       "dojo/on"
    ], function (declare, Memory, Grid, Pagination, on) {

        var data;
        if (gallerygrid)
            data = [
                { Title: "Meacham Creek-North", date: "3/2/2010", Description: "The area above the spot where the location near the picture was taken could be.", image: "mc1_th.png" },
                { Title: "Meacham Creek-South", date: "4/7/2011", Description: "Another descriptive description that give description information.", image: "mc2_th.png" },
                { Title: "Meacham Creek-West", date: "7/22/2012", Description: "Here we could have another description. Whatever, Keywords, A, Person Wanted, To Use, Too", image: "mc3_th.png" }];
        else
            data = [
                { Title: "Meacham Creek-North", date: "3/2/2010", Description: "The area above the spot where the location near the picture was taken could be.", image: "mc1_th.png" },
                { Title: "Meacham Creek-South", date: "4/7/2011", Description: "Another descriptive description that give description information.", image: "mc2_th.png" },
                { Title: "Meacham Creek-West", date: "7/22/2012", Description: "Here we could have another description. Whatever, Keywords, A, Person Wanted, To Use, Too", image: "mc3_th.png" }];

        // Once the response is received, build an in-memory store with the data
        var store = new Memory({ data: data });

        //dojo.byId("gallery").innerHTML = "";

        if (gallerygrid) {
            gallerygrid.setStore(store);
        } else {

            // Create a Grid instance using Pagination, referencing the store
            gallerygrid = new (declare([Grid, Pagination]))({
                store: store,
                columns: [
                     {
                         label: "Image", field: "image", width: "20%",
                         formatter: function (item, rowIndex, cell) {
                             return "<img src='images/" + item + "'/>";
                         }
                     },
                    {
                        label: "Title", field: "Title", width: "30%"
                    },
                    {
                        label: "Description", field: "Description", width: "30%"
                    },


                    {
                        label: "Date", field: "date", width: "10%"
                    },
                                       

                ],


            }, "gallery");
        }
        gallerygrid.refresh();


    });


    require(["dijit/form/TextBox", "dojo/on", "dojo/keys", "dojo/dom", "dojo/domReady!"], function (TextBox, on, keys, dom) {
        var myTextBox = new dijit.form.TextBox({
            name: "search-gallery",
            value: "" /* no or empty value! */,
            placeHolder: "Find Images",
        }, "search-gallery");

        on(myTextBox, "keyup", function (e) {
            //if (e.keyCode == keys.ENTER) //comment out if you want it to do the typeahead thing...
            dom.byId('search-gallery-icon').click();

        });
    });



}

   





function initDocuments() {

    require([
       "dojo/_base/declare",
       "dojo/store/Memory",
       "dgrid/Grid",
       "dgrid/extensions/Pagination",
       "dojo/on"
    ], function (declare, Memory, Grid, Pagination, on) {


        /*
        var data = [
            {
                filename: "CTUIR-DNR-Umatilla_River_Vision_V2_051811.pdf", Title: "CTUIR Umatilla River Vision", Description: "Version 2 (updated 2013)",
                filetype: "PDF", author: "Mike Lambert", uploaddate: "2/14/13  4:13pm", size: "821kb"
            },
              {
                  filename: "Meacham_Creek_Floodplain_Restoration_and_In-stream_Enhancement_Project_Biological_Assessment_June_2010.pdf",
                  Title: "Final Biological Assessment Meacham Creek Floodplain Restoration", Description: "In-stream Enhancement Project River Mile 6 to 7",
                  filetype: "PDF", author: "Mike Lambert", uploaddate: "2/14/13  4:15pm", size: "28.7mb"
              },
                {
                    filename: "Meacham_Creek_Watershed_Analysis_and_Action_Plan_Final_Report_2003.pdf",
                    Title: "Meacham Creek Watershed Analysis and Action Plan",
                    Description: "Final Report (April 16, 2003)",
                    filetype: "MS Word",
                    author: "Chip Andrus, Water Work Consulting",
                    uploaddate: "12/14/12  9:13pm",
                    size: "862kb"
                },
                {
                    filename: "MeachamPhaseIIRM6-8.5_BA Final_Feb2013.pdf", 
                    Title: "Meacham Creek Floodplain Restoration and In-stream Enhancement",
                    Description: "Phase II: Biological Assessment and Essential Fish Habitat Assessment",
                    filetype: "MS Excel", author: "Mike Lambert",
                    uploaddate: "1/8/13  4:13pm", size: "58mb",
                },
        ];
        */

        // Once the response is received, build an in-memory store with the data
        var store = new Memory({ data: current_project.Files });

        if (docsgrid) {
            docsgrid.setStore(store);
        } else {
            // Create a Grid instance using Pagination, referencing the store
            docsgrid = new (declare([Grid, Pagination]))({
                store: store,
                
                columns: [
                    {
                        label: "File", field: "Title",
                        get: function (object) {
                            return object;
                        },
                        formatter: function (item) {
                            return "<a href='files/" + item.filename + "' title='"+item.Description+"'>"+item.Title+"</a>";
                        },
                    },
                    {
                        label: "Type", field: "filetype"
                    },
                    {
                        label: "Uploader", field: "author"
                    },
                    {
                        label: "Date", field: "uploaddate"
                    },
                    {
                        label: "Size", field: "size",
                    },

                ],


            }, "docs-grid");
        }
        docsgrid.refresh();


    });


    require(["dijit/form/TextBox", "dojo/on", "dojo/keys", "dojo/dom", "dojo/domReady!"], function (TextBox, on, keys, dom) {
        var myTextBox = new dijit.form.TextBox({
            name: "search-docs",
            value: "" /* no or empty value! */,
            placeHolder: "Find Documents",
        }, "search-docs");

        on(myTextBox, "keyup", function (e) {
            //if (e.keyCode == keys.ENTER) //comment out if you want it to do the typeahead thing...
            dom.byId('search-docs-icon').click();

        });
    });


}

function initLocations() {
    require(["dojo/_base/declare",
            "dgrid/OnDemandGrid",
            "dgrid/Selection",
            "dgrid/Keyboard",
            "dojo/store/Memory",
            "dojo/on"
    ], function (declare, Grid, Selection, Keyboard, Memory, on) {

        var data = [
            {
                id: 0,
                name: "All locations",
            },
            {
                id: 3772,
                name: "Lookinglass Weir",
            },
            {
                id: 14255,
                name: "Catherine Creek Weir",
            },
            {
                id: 52341,
                name: "Upper Grande Ronde",
            },
        ];

        var store = new Memory({ data: data });

        var MyGrid = declare([Grid, Selection, Keyboard]);

        datalocationgrid = new MyGrid({
            store: store, // a Dojo object store
            columns: [{
                label: "Locations", field: "name", sortable: false,
            }]
            
        }, "project-locations");
        datalocationgrid.refresh();

        datalocationgrid.on("dgrid-select", function (event) {
            changeDataLocationSelected(event.rows[0].data.id);
        });

        datalocationgrid.select(0); //default to "all"
    });


}

    function initData() {

        require([
           "dojo/_base/declare",
           "dojo/store/Memory",
           "dgrid/OnDemandGrid",
           "dgrid/Keyboard", "dgrid/Selection",
           "dgrid/extensions/DijitRegistry",
           "dgrid/editor",
           "dijit/form/DateTextBox",
           "dijit/form/TimeTextBox",
           "dijit/form/Select",
           "dojo/on"
        ], function (declare, Memory, Grid, Keyboard, Selection, Registry, editor, DateTextBox, TimeTextBox, Select, on) {

            var data = [
                {
                    id: "1",
                    locationid: "3772",
                    fishnumber: "1",
                    trapcheckdate: "2013-04-23",
                    trapcheckstarttime: "07:20:11",
                    trapcheckfinalreleasetime: "09:18:41",
                    watertemp: "4",
                    airtemp: "6",
                    crew: "TO/MM",
                    gauge: "",
                    flow: "1.7",
                    sex: "M",
                    species: "STH",
                    origin: "H",
                    mark: "",
                    isrecapture: "N",
                    forklength: "685",
                    totallength: "",
                    finclipnumber: "",
                    scalenumber: "",
                    age: "A",

                    radiotag: "",
                    solutioninjected: "",
                    solutiondose: "",

                    ripeness: "",
                    geneticsamplenumber: "",
                    operclepunch: "",
                    scalecard: "",
                    scaleposition: "",
                    snoutid: "",
                    otilithgenenumber: "",
                    disposition: "P",
                    comments: "",
                    weight: "67",
                    iscarcass: "N",

                },

                {
                    id: "2",
                    locationid: "14255",
                    fishnumber: "2",
                    trapcheckdate: "2013-03-15",
                    trapcheckstarttime: "10:29:00",
                    trapcheckfinalreleasetime: "10:50:00",
                    watertemp: "4",
                    airtemp: "7",
                    crew: "",
                    gauge: "",
                    flow: "",
                    sex: "",
                    species: "SAL",
                    origin: "",
                    mark: "",
                    isrecapture: "",
                    forklength: "",
                    totallength: "",
                    finclipnumber: "",
                    scalenumber: "",
                    age: "",

                    radiotag: "",
                    solutioninjected: "",
                    solutiondose: "",

                    ripeness: "",
                    geneticsamplenumber: "",
                    operclepunch: "",
                    scalecard: "",
                    scaleposition: "",
                    snoutid: "",
                    otilithgenenumber: "",
                    disposition: "",
                    comments: "",
                    weight: "",
                    iscarcass: "",

                },

                {
                    id: "3",
                    locationid: "52341",
                    fishnumber: "3",
                    trapcheckdate: "2013-03-13",
                    trapcheckstarttime: "18:30:01",
                    trapcheckfinalreleasetime: "19:14:00",
                    watertemp: "5",
                    airtemp: "7",
                    crew: "",
                    gauge: "",
                    flow: "",
                    sex: "",
                    species: "SAL",
                    origin: "",
                    mark: "",
                    isrecapture: "",
                    forklength: "552",
                    totallength: "",
                    finclipnumber: "",
                    scalenumber: "",
                    age: "",

                    radiotag: "",
                    solutioninjected: "",
                    solutiondose: "",

                    ripeness: "",
                    geneticsamplenumber: "",
                    operclepunch: "",
                    scalecard: "",
                    scaleposition: "",
                    snoutid: "",
                    otilithgenenumber: "",
                    disposition: "",
                    comments: "",
                    weight: "",
                    iscarcass: "",

                },

                {
                    id: "4",
                    locationid: "52341",
                    fishnumber: "4",
                    trapcheckdate: "2013-03-13",
                    trapcheckstarttime: "18:30:01",
                    trapcheckfinalreleasetime: "19:14:00",
                    watertemp: "5",
                    airtemp: "7",
                    crew: "",
                    gauge: "",
                    flow: "",
                    sex: "",
                    species: "SAL",
                    origin: "",
                    mark: "",
                    isrecapture: "",
                    forklength: "423",
                    totallength: "",
                    finclipnumber: "",
                    scalenumber: "",
                    age: "",

                    radiotag: "",
                    solutioninjected: "",
                    solutiondose: "",

                    ripeness: "",
                    geneticsamplenumber: "",
                    operclepunch: "",
                    scalecard: "",
                    scaleposition: "",
                    snoutid: "",
                    otilithgenenumber: "",
                    disposition: "",
                    comments: "",
                    weight: "",
                    iscarcass: "",

                },

            ];

            // Once the response is received, build an in-memory store with the data
            var store = new Memory({ data: data });


            //this will all be automagically generated...
                datagrid = new (declare([Grid, Keyboard, Selection, Registry]))({
                    store: store,
                    columns: [

                   //{ label: "Fish Number", field: "fishnumber", },
                   editor({ label: "Trap Check Date", field: "trapcheckdate"}, DateTextBox, "click"),
                   editor({ label: "Trap Check Start Time", field: "trapcheckstarttime"}, "text", "click"),
                   editor({ label: "Trap Check End Time", field: "trapcheckfinalreleasetime" },"text", "click"),
                   editor({ label: "Water Temperature (C)", field: "watertemp" }, "text", "click"),
                   editor({ label: "Air Temperature (C)", field: "airtemp" }, "text","click"),
                   editor({ label: "Crew", field: "crew" }, "text", "click"),
                   { label: "Gauge", field: "gauge" },
                   { label: "Flow", field: "flow" },
                   editor({ label: "Sex", field: "sex", sortable: false}, "radio"),
                   editor({ label: "Species", field: "species", editorArgs: { options: [{ value: "SAL", label: "Salmon" }, { value: "STH", label: "Steelhead" }] } }, Select, "click"),
                   { label: "Origin", field: "origin" },
                   { label: "Mark", field: "mark" },
                   editor({ label: "Is Recapture?", field: "isrecapture" }, "checkbox"),
                   { label: "Fork Length (mm)", field: "forklength" },
                   { label: "Total Length (mm)", field: "totallength" },
                   { label: "Fin Clip Number", field: "finclipnumber" },
                   { label: "Scale Number", field: "scalenumber" },
                   { label: "Age", field: "age" },
                   { label: "Radio Tag", field: "radiotag" },
                   { label: "Solution Injected", field: "solutioninjected" },
                   { label: "Solution Dose", field: "solutiondose" },
                   { label: "Ripeness", field: "ripeness" },
                   { label: "Genetic Sample Number", field: "geneticsamplenumber" },
                   { label: "Opercle Punch", field: "operclepunch" },
                   { label: "Scale Card", field: "scalecard" },
                   { label: "Scale Position", field: "scaleposition" },
                   { label: "Snout Id", field: "snoutid" },
                   { label: "Otilith Gene Number", field: "otilithgenenumber" },
                   { label: "Disposition", field: "disposition" },
                    { label: "Comments", field: "comments" },
                    { label: "Weight (g)", field: "weight" },
                    { label: "Is Carcass?", field: "iscarcass" },

               

                    ],


                }, "project-data");
            
                datagrid.refresh();


        });


    }


/** we'll use this to convert the string to a Date object **/
    var toDate = function (data) {
        log.debug("--->", data);
        var objdate = new Date();
        return objdate;
    }

    function changeDataLocationSelected(id) {
        log.debug("Change location!: ", id);
        if (id == "0")
            datagrid.query = {};
        else
            datagrid.query = { locationid: id };

        datagrid.refresh();
    }