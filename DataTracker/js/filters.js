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
            return (input == null) ? '' : ' ('+input+')';
        };
    })
    .filter('locationNameFilter', function($rootScope){
        return function(input) {
            if($rootScope.locationOptions[input])
                return $rootScope.locationOptions[input];

            return input;
        };
    })
    .filter('instrumentFilter', function($rootScope){ 
        return function(input) {
            if($rootScope.instrumentOptions[input])
			{
                return $rootScope.instrumentOptions[input];
			}
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
    .filter('DataGradeMethod', function($rootScope){
        return function(input) {
            return $rootScope.DataGradeMethods[input];
        };
    })
    .filter('arrayValues', function(){
        return function(input) {
            var result = '';
            if(input)
            {

                try{
                    result = angular.fromJson(input).toString();
                }
                catch(e){
                    result = input;
                }
                /*
                var vals = angular.fromJson(input);
                angular.forEach(vals, function(item){
                    if(result != '')
                        result += ',';
                    result += item;
                });
                */
            }

            return result;
        };
    }).filter('RowQAStatusFilter', function( $rootScope ) {
          return function(input) {
            if ($rootScope.RowQAStatuses[input]) {
              return $rootScope.RowQAStatuses[input];
            } else {
              return 'unknown';
            }
          };
    })
    .filter('fileNamesFromString', function($sce){
        return function(input)
        {
            var retval = [];
            if(input)
            {
                var files = angular.fromJson(input);
                angular.forEach(files, function(file){
                    retval.push("<a href='" + file.Link + "'>" + file.Name + "</a>");    
                });
            }

            if(retval.length==0)
                retval = "&nbsp;";
            else
                retval = retval.join(",");

            return $sce.trustAsHtml(retval);
            
        };
    }).filter('countItems', function($sce){
        return function(input)
        {
            var retval = '-';
            if(input)
            {
                retval = array_count(input) + "";
            }
            return $sce.trustAsHtml(retval);
        }
    })
    

;
