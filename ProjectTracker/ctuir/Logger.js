/*
* Logging facility.
*/
define(["dojo/_base/declare"], function (declare) {
    
    return declare(null, {

        constructor: function () {
            
        },

        log: function () {
            for (var i = 0; i < arguments.length; i++) {

                //output the argument
                console.dir(arguments[i]);

                //traverse recursively if it is an array
                if (arguments[i] instanceof Array) {
                    var arrayArg = arguments[i];
                    this.log.apply(this, arrayArg);
                }
                
            }
        },

        debug: function () {
            this.log.apply(this, arguments);
        },

        error: function () {
            this.log.apply(this, arguments);

            var message = {Message: arguments[0], Type: "ERROR"};

            restSend("/services/action/SystemLog", message, "POST", function (project) {
                log.debug("ERROR Message POSTED to server: " + arguments[0]);
            });
        },

        audit: function(){
            var message = { Message: arguments[0], Type: "AUDIT" };

            restSend("/services/action/SystemLog", message, "POST", function (project) {
                log.debug("AUDIT Message POSTED to server: " + arguments[0]);
            });
        },

    });

});