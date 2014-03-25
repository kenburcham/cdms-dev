//ctuir/ProjectGrid
//kb 7/16

define(["dojo/_base/declare", "dgrid/OnDemandGrid", "dgrid/Keyboard", "dgrid/Selection"], function (declare, Grid, Keyboard, Selection) {
    var grid;
    var numSelected;

    return declare(null, {

        constructor: function (projectStore) {
            require(["dojo/domReady!"], function () {

                var CustomGrid = declare([Grid, Keyboard, Selection]);

                grid = new CustomGrid({
                    query: { favorite: true },
                    store: projectStore,
                    columns: [
                        {
                            label: "Program", field:"program",
                            /*
                            get: function (object) {
                                //log.debug(object.Metadata,"--------------------------------");
                                var program = object.metadata_23;
                                if (object.metadata_24 && object.metadata_24 != "(None)")
                                    program += " > " + object.metadata_24;
                                return program;
                            }*/
                        },
                        {
                            label: "Type", field: "projectType",
                        },
                        {
                            label: "Title", field: "Name",
                            /*get: function (object) {
                                return object.Name;
                            }*/
                        },
                        /*
                        {
                            label: "Description", field: "Description",
                            get: function (object) {
                                desc = object.Description.substring(0, 105);
                                if (object.Description.length > 105)
                                    desc += " (...)";
                                return desc;
                            },
                            canSort: false,
                        },*/
                        {
                            label: "Relationship", field: "relationship"
                        }
                    ],
                    selectionMode: "single",
                    cellNavigation: false,

                }, "grid");

                //grid.renderArray(getMyProjectData());
                grid.startup();

                grid.on("dgrid-select", function (event) {
                    // Report the item from the selected row to the console. 
                    //if(event.rows[0].data && "key" in event.rows[0].data)
                    eventGridProjectSelected(event.rows[0].data.Id);


                });
                //grid.on("dgrid-deselect", function (event) {
                //log.debug("Row de-selected: ", event.rows[0].data);
                //});

            });

            //$("#grid .waf-dataGrid-body").css("overflow-x", "hidden"); //TODO: check for native WAF function for suppressing scroll bars
        },

        getGrid: function () {
            return grid;
        },

        refresh: function () {
            grid.refresh();
            numSelected = 0;
        },

        getNumSelected: function(){
            return numSelected; 
        },

        select: function (id) {
            numSelected = 1;
            return grid.select(id);
        },

        //select all the grid rows with this key
        selectKeys: function (key) {
            log.debug("selectkeys: " + key);
            var key_rows = grid.store.query({ key: key });

            log.debug("key_rows"); //, key_rows);

            if (key_rows.length > 0) {
                for (var row in key_rows) {

                    if (row == 'total')
                        break;

                    row = key_rows[row];
                    grid.select(row.Id);
                    log.debug("selected " + row.Id);
                }
            }

            numSelected = key_rows.length;
            log.debug("done selecting "+ numSelected +" keys!");
        },

        deselectKeys: function (key) {
            grid.refresh();  //easier and faster!
            numSelected = 0;
        },

        deselect: function (id) {
            return grid.deselect(id);
            numSelected = 0;
        },

        getIdByKey: function (key) {
            log.debug("getIdByKey: " + key);
            var id = grid.store.query({ key: key });
            log.debug(id[0]);
            return id[0].Id;
        },

        getKeyById: function (id) {
            log.debug("getkeybyid: " + id);
            var key = grid.store.query({ Id: id });
            //log.debug(key[0]);
            log.debug("found and returning a key: " + key[0].key);
            return key[0].key;
        },



    });

});