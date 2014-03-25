//ctuir/ProjectTree

define(["dojo/_base/declare"], function (declare) {
    var privatevar = 0;

    function something() {
    };

    return declare(null, {

        constructor: function () {
        }


        //NOTE: this was just pasted in -- not working or refactored, etc!
     createProjectTree: function() {
        require([
            "dojo/_base/window", 
            "dijit/tree/ObjectStoreModel", "dijit/Tree",
            "dojo/domReady!"
        ], function (win, ObjectStoreModel, Tree) {

            var myModel = ObjectStoreModel({
                store: projectStore,
                query: { id: 'projects' },
                mayHaveChildren: function (object) {
                    return (this.store.getChildren(object).total > 0);
                }
            });

            var tree = new Tree({
                model: myModel,
                showRoot: false,
                openOnClick: true,
            });

            tree.placeAt(dojo.byId("allProjectsPane"));
            tree.startup();
        });

    }

    });

});