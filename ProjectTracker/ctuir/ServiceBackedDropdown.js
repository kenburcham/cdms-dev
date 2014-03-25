/*
* API connector for Service-backed dropdowns
*  ken burcham 8/13/2013
*/
define(["dojo/_base/declare"], function (declare) {

    return declare(null, {

        cache: {},

        services: {
            ProjectTypes: "/services/api/ProjectTypes",
            Departments:  "/services/api/Department"
        },

        getData: function (service) {
            log.debug("getdata + " + service);

            var result = this.cache[service];

            if(!result)
            {
                var url = this.services[service];
                if(!url)
                    throw new Exception("ERROR: service " + service + " not defined.");

                log.debug("getData for service " + service + " using url " + url);

                require([
                    "dojo/request/xhr"
                ],
                    function (request) {
                        request(url,
                            {
                                sync: true, //block until we're done loading.
                                handleAs: "json",
                            }).then(function (data) {
                                //log.debug("back", data);
                                result = data;
                            });
                    });

                this.cache[service] = result;
            }
            else {

                log.debug("CACHE HIT!!! on " + service);
            }

            //log.debug("getData results" , result);
            return result;
                
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

        getItemById: function(service, id) {
            var data = this.getData(service);
            var result = null;

            for (var value in data)
            {
                value = data[value];

                if(value.Id == id)
                {
                    result = value;
                    break;
                }
            }

            return result;
        },

        //see services defined above
        getSelectOptions: function (service, selected_value) {

            var options = [];

            var data = this.getData(service);

            //Horrific bug in dojo -- you CANNOT use id's as values. 
            if (selected_value)
                selected_value = stringify_number(selected_value);

            require(["dojo/_base/array"], function (Array) {

                for (var value in data)
                {
                    value = data[value];

                    var option = {};

                    option.label = value.Name;
                    option.value = stringify_number(value.Id);
                    
                    if (selected_value == option.value) {
                        option.selected = true;
                    }

                    options.push(option);
                    
                }

//                log.debug("getSelectOptions returning",options);

            });

            return options;
        },

    });

});