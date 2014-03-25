'use strict';

/* Filters */

angular.module('DatasetFilters', [])
    .filter('checkmark', function () {
        return function (input) {
            return (input == null) ? '\u2713' : '\u2718';
        };
    })
    .filter('units', function () {
        return function (input) {
            return (input == null) ? '' : '(in ' + input + ' units.)';
        };
    })
    .filter('locationNameFilter', function($rootScope){
        return function(input) {
            if($rootScope.locationOptions[input])
                return $rootScope.locationOptions[input];

            return input;
        };
    })
    .filter('QAStatusFilter', function($rootScope){
        return function(input) {
            if($rootScope.QAStatusOptions[input])
                return $rootScope.QAStatusOptions[input];

            return input;
        };
    })
    .filter('arrayValues', function(){
        return function(input) {
            //console.log(">> input = " + input);
            var result = '';
            
            if(input)
            {
                return angular.fromJson(input).toString();
                
                var vals = angular.fromJson(input);
                angular.forEach(vals, function(item){
                    if(result != '')
                        result += ',';
                    result += item;
                });
            }

            return result;
        };
    })


;
