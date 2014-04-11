//edit dataset + metadata
'use strict';

var METADATA_ENTITY_DATASETTYPEID = 5;

var mod_edc = angular.module('DatasetDetailsControllers', ['ui.bootstrap']);

mod_edc.controller('DatasetDetailsCtrl', ['$scope','$routeParams', 'DataService','$location','$filter',
    function(scope, routeParams, DataService, $location, $filter){
        scope.dataset = DataService.getDataset(routeParams.Id);

        //common fields we show for all datasets
        scope.metadataList = {};

        //select lists
        scope.CellOptions = {};
        
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
                            value: scope.dataset.Name,
                            controlType: 'text',
                   	},
                    Description: {
                            field: 'Description',
                            value: scope.dataset.Description,
                            controlType: 'text',
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

				//add in the metadata that came with this dataset
                angular.forEach(scope.dataset.Metadata, function(value, key){
                    try{
                    		var property = DataService.getMetadataProperty(value.MetadataPropertyId);

							scope.populateMetadataDropdowns(property); //setup any dropdown

                        	scope.metadataList[property.Name] =
                        	{
	                            field: property.Name,
	                            propertyId: property.Id,
	                            controlType: property.ControlType,
	                            value: value.Values,
	                            options: scope.CellOptions[property.Id+"_Options"]
                        	};

                        	


                    }catch(e)
                    {
                        console.dir(e);
                    }
                });

            }
        });

		//these are all the metadata properties configured for all datasets
		// -- add in the ones that aren't already being used in this particular dataset.
		scope.$watch('metadataProperties', function(){
			console.log("Hey we have some properties now!");
			    angular.forEach(scope.metadataProperties, function(property, key){
			    	//if it isn't already there, add it as an available option
			   		if(!(property.Name in scope.metadataList))
			   		{
			   			scope.populateMetadataDropdowns(property); //setup the dropdown

						scope.metadataList[property.Name] =
                    	{
                            field: property.Name,
                            propertyId: property.Id,
                            controlType: property.ControlType,
                            value: "",
                            options: scope.CellOptions[property.Id+"_Options"]
                    	};
                    	
			   		}
			    });


		});

		scope.populateMetadataDropdowns = function(property)
		{
			if(property.ControlType == "select" || property.ControlType == "multiselect")
        	{
				scope.CellOptions[property.Id+'_Options'] = makeObjectsFromValues(property.Id+"_Options", property.PossibleValues);
        	}
		};

        scope.saveResults = {};

        scope.save = function(){
            var metadata = [];
            angular.forEach(scope.metadataList, function(item, key){
                metadata.push({ MetadataPropertyId: item.propertyId, Values: item.value});
            });

            DataService.saveDatasetMetadata(scope.dataset.Id, metadata, scope.saveResults);

            var watcher = scope.$watch('saveResults',function(){
                if(!scope.saveResults.saving && scope.saveResults.success)
                {
                    console.log("watcher");
                    DataService.clearDataset();
                    $location.path("/dataset-details/"+scope.dataset.Id);
                    watcher();
                }
            },true);
            
        };

        scope.cancel = function(){
            $location.path("/dataset-details/"+scope.dataset.Id);
        };

        scope.close = function(){
            $location.path("/activities/"+scope.dataset.Id);   
        };

        scope.edit = function(){
  			$location.path("/dataset-edit/"+scope.dataset.Id);   
        };

		
	}
]);