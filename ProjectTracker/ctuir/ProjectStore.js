//ctuir/ProjectStore
// wraps our in-memory project store processes
//kb 7/16


define(["dojo/_base/declare", "dojo/store/Memory", "dijit/tree/ObjectStoreModel"], function (declare, Memory, ObjectStoreModel) {

    var projectStore;

    return declare(null, {

        constructor: function (url) {
        
            projectStore = new Memory({
                data: this.fetchAllProjectData(url),
//for tree later
//                getChildren: function (object) {
//                    return this.query({ parent: object.id });
//               },
                idProperty: "Id", 
            });
        },

        getProjectStore: function () {
            return projectStore;
        },

        put: function (args) {
            return projectStore.put(args);
        },

        get: function (id) {
            return projectStore.get(id);
        },

        remove: function (id) {
            return projectStore.remove(id);
        },

        //convenience wrapper
        query: function (args) {
            return projectStore.query(args);
        },


        fetchAllProjectData: function (url) {
            var projects;

            require([
                "dojo/request/xhr"
            ],
                function (request) {
                    request(url,
                        {
                            handleAs: "json",
                            sync: true //TODO: blocking process -- so we can return when we are done... might want to return a deferred here...
                        }).then(function (data) {

                            projects = data;

                            //handle any flattening or processing here :: this would be faster in C#?

                            //find the "Primary" project Location and flatten
                            for (var pkey in projects) {
                                var project = projects[pkey];

                                flattenProject(project);
                                setFavoriteStatus(project);
                            }

                        }, function (err) { console.log("something went wrong: "); console.dir(err); console.dir(err.response);})
                });

            return projects;
        
        },

        

    });

});
