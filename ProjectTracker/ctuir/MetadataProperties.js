/*
* API connector for MetadataProperties
*  ken burcham 8/13/2013
*/
define(["dojo/_base/declare"], function (declare) {

    var metadata_properties;

    return declare(null, {

        constructor: function () {
            require([
                "dojo/request/xhr", "dojo/store/Memory",
            ],
                function (request, Memory) {
                    request("/services/api/MetadataProperties",
                        {
                            handleAs: "json",
                        }).then(function (data) {
                            metadata_properties = new Memory({ data: data, idProperty: "Id" });
                        });

                });
        },

        getProperties: function (){
            return metadata_properties;
        },

        /*
        * returns an options array that can be directly used in a dijit select (https://dojotoolkit.org/reference-guide/1.9/dijit/form/Select.html)
        
        options: [
            { label: "TN", value: "Tennessee" },
            { label: "VA", value: "Virginia", selected: true },
            { label: "WA", value: "Washington" },
            { label: "FL", value: "Florida" },
            { label: "CA", value: "California" }
        ]

        */
        getSelectOptions: function (id, selected_values) {

            var options = [];

            require(["dojo/_base/array"], function (Array) {

                var mp = metadata_properties.get(id);
                
                selected_values = (!selected_values) ? [""] : selected_values.split(",");

                if (mp && mp.PossibleValues) {

                    var possible_values = mp.PossibleValues.split(",");

                    for (var value in possible_values) {
                        var option = {};
                        value = possible_values[value].replace(/\s+/g, " ");
                        option.label = value;
                        option.value = value;
                        //log.debug(" --> " + value, Array.indexOf(selected_values, value));

                        if (Array.indexOf(selected_values, value) != -1) {
                            option.selected = true;
                        }

                        options.push(option);
                    }
                }

                //log.debug(options);

            });

            return options;
        },

    });

});