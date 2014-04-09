//edit dataset + metadata
'use strict';

var METADATA_ENTITY_DATASETTYPEID = 5;

var mod_edc = angular.module('DatasetDetailsControllers', ['ui.bootstrap']);

mod_edc.controller('DatasetDetailsCtrl', ['$scope','$routeParams', 'DataService','$location','$filter',
    function(scope, routeParams, DataService, $location, $filter){
        scope.dataset = DataService.getDataset(routeParams.Id);

        //common fields we show for all datasets
        scope.metadataList = {};
        
        //if we only want to show in edit mode, use some if statement here...
        DataService.getMetadataProperties(scope, METADATA_ENTITY_DATASETTYPEID); //sets scope.metadataProperties

        scope.$watch('dataset.ProjectId', function(){
            if(scope.dataset && scope.dataset.ProjectId)
            {
                scope.project = DataService.getProject(scope.dataset.ProjectId);

                //prepopulate the dataset fields that are included in the dataset's details (not strictly "metadata" -- but interfaced the same way)
                scope.metadataList = angular.extend(scope.metadataList, {
                    Name: {
                            field: 'Name',
                            value: scope.dataset.Name
                   	},
                    Description: {
                            field: 'Description',
                            value: scope.dataset.Description
                    },
                    Dataset: {
                            field: 'Dataset',
                            value: scope.dataset.Datastore.Name,
                            locked: true
                    },
                    Owner: {
                            field: 'Owner',
                            value: 'CTUIR Department of Natural Resources',
                            locked: true
                    },
                    Created: {
                            field: 'Created',
                            value: $filter('date')(scope.dataset.CreateDateTime, "MM/dd/yyyy") ,
                            locked: true
                    }
	            });

                angular.forEach(scope.dataset.Metadata, function(value, key){
                    try{
                    		var name = DataService.getMetadataProperty(value.MetadataPropertyId).Name;
                        	scope.metadataList[name] =
                        	{
	                            field: name,
	                            propertyId: value.MetadataPropertyId,
	                            value: value.Values
                        	};


                    }catch(e)
                    {
                        console.dir(e);
                    }
                });

            }
        });

		//these are all the properties configured for datasets
		scope.$watch('metadataProperties', function(){
			console.log("Hey we have some properties now!");
			    angular.forEach(scope.metadataProperties, function(value, key){
			    	//if it isn't already there, add it as an available option
			   		if(!(value.Name in scope.metadataList))
			   		{
						scope.metadataList[value.Name] =
                    	{
                            field: value.Name,
                            propertyId: value.Id,
                            value: ""
                    	};
			   		}
			    });


		});

        scope.close = function(){
            $location.path("/activities/"+scope.dataset.Id);   
        };

        scope.edit = function(){
  			$location.path("/dataset-edit/"+scope.dataset.Id);   
        };

		
	}
]);