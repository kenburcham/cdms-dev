//query-controllers
'use strict';

var mod_dq = angular.module('DataQueryControllers', ['ui.bootstrap']);

mod_dq.controller('ModalExportController',['$scope','DataService','$modalInstance','$window',
	function($scope, DataService,$modalInstance, $window) {

		//$scope.alerts 
		$scope.Export = { Filename: "Export.csv" };

		$scope.ok = function(){
			$scope.downloadQuery = $scope.buildQuery(); 
			$scope.downloadQuery.criteria.Filename = $scope.Export.Filename;
			DataService.exportActivities($scope.downloadQuery);

			//$modalInstance.dismiss();
		};

		$scope.cancel = function(){
			$modalInstance.dismiss();
		};
	}
]);

mod_dq.controller('DataQueryCtrl', ['$scope','$routeParams','DataService','$location', '$modal','DataSheet', '$rootScope',
    	function($scope, $routeParams, DataService, $location, $modal, DataSheet, $rootScope) {

			$scope.dataset = DataService.getDataset($routeParams.Id);
			
    		$scope.headerFields = [];
    		$scope.detailFields = [];
    		$scope.datasheetColDefs = [];
    		$scope.query = {results: []};
    		$scope.dataSheetDataset = [];
    		$scope.dataFields = [];

    		$scope.gridDatasheetOptions = { 
    			data: 'dataSheetDataset', 
		        columnDefs: 'datasheetColDefs',
    			enableColumnResize: true, 
	        	enableRowSelection: true,
	        	enableCellEdit: false,
	        	enableSorting: true, 
    			enableCellSelection: true,
    			showFilter: false,
    			showColumnMenu: true,
    			multiSelect: false,
    		};

			$scope.chartConfig = {
    			  title : 'Fish by Species',
				  tooltips: true,
				  labels : false,
				  
				  legend: {
				    display: true,
				    position: 'right'
				  }
    		};

    		$scope.chartData = {"series": [], "data":[{ "x": "Loading...", "y": [0],"tooltip": ""}]}; //default

			DataSheet.initScope($scope);

			$scope.datasheetColDefs = [{   
										field: 'LocationId', 
                                        displayName: 'Location', 
                                        cellFilter: 'locationNameFilter'
                                    },
                                    {
                                        field: 'ActivityDate', 
                                        displayName: 'Activity Date',
                                        cellFilter: 'date: \'MM/dd/yyyy\'',
                                    },
                                    {
                                        field: 'ActivityQAStatusId',
                                        displayName: 'QA Status',
                                        cellFilter: 'QAStatusFilter'
                                    }];

    		$scope.$watch('project.Name', function(){
    			if($scope.project){
    				$scope.locationOptions = $rootScope.locationOptions = makeObjects(getMatchingByField($scope.project.Locations,2,"LocationTypeId"), 'Id','Label') ;
    				$scope.locationOptions["all"] = "- All -";
    				$scope.Criteria.LocationIds = ["all"]; //set the default
				}
    		});

    		//setup a listener to populate column headers on the grid
			$scope.$watch('dataset.Id', function() { 
				if(!$scope.dataset.Fields)
					return;

				$scope.project = DataService.getProject($scope.dataset.ProjectId);
	        	$scope.QAStatusOptions = $rootScope.QAStatusOptions = makeObjects($scope.dataset.QAStatuses, 'Id','Name');
	        	$scope.QAStatusOptions["all"] = "- All -";
	        	$scope.Criteria.ParamQAStatusId = "all";

				var fieldIndex = 0;

				angular.forEach($scope.dataset.Fields.sort(orderByIndex), function(field){
					parseField(field, $scope);
					if(field.FieldRoleId == FIELD_ROLE_HEADER)
					{
						$scope.headerFields.push(field);
					}
					else if(field.FieldRoleId == FIELD_ROLE_DETAIL)
					{
						$scope.detailFields.push(field);
					}

					//create a javascript list from our possible values (if any)
					if(field.Field.PossibleValues)
					{
						
		                field.PossibleValuesList = makeObjectsFromValues(field.DbColumnName, field.Field.PossibleValues); //set this into our object
	
						fieldIndex ++;

					}

					$scope.datasheetColDefs.push(makeFieldColDef(field, $scope));

					$scope.dataFields.push(field);

	    		});

				$scope.recalculateGridWidth($scope.datasheetColDefs.length);

	    	});

			$scope.criteriaList = [];

	    	$scope.queryToolVisible = true;
			$scope.Criteria = {};
			$scope.Criteria.paramActivityDateType = "all"; //default
			

    		$scope.AutoExecuteQuery = true;

    		$scope.removeCriteria = function(idx) {
    			$scope.criteriaList.splice(idx,1);
    			if($scope.AutoExecuteQuery)
					$scope.executeQuery();
    		};

    		$scope.addCriteria = function(){
				$scope.criteriaList.push({
					//commenting these out because they will be read at EXECUTE time, not saved per query.
					//qastatus:   $scope.Criteria.ParamQAStatusId,
					//locations:  $scope.Criteria.LocationIds,
					//activities: $scope.Criteria.paramActivityDateType, 
					DbColumnName: 		$scope.Criteria.ParamFieldSelect[0].DbColumnName,
					Id: 				$scope.Criteria.ParamFieldSelect[0].Id,
					Value: 				$scope.Criteria.Value,
				});

				console.dir($scope.criteriaList);

				$scope.Criteria.Value = null;

				if($scope.AutoExecuteQuery)
					$scope.executeQuery();
    		};

    		$scope.buildQuery = function(){
				var query = 
    			{
					criteria: {
						DatasetId: 	  $scope.dataset.Id,
						QAStatusId:   $scope.Criteria.ParamQAStatusId,
						Locations:    angular.toJson($scope.Criteria.LocationIds).toString(),
						FromDate:     $scope.Criteria.BetweenFromActivityDate,
						ToDate:       $scope.Criteria.BetweenToActivityDate,
						DateSearchType: $scope.Criteria.paramActivityDateType, 
						Fields: 	  $scope.criteriaList,

					},
					loading: true,
    			};

    			return query;
    		};

    		$scope.executeQuery = function(){
    			
    			$scope.query = $scope.buildQuery();

    			DataService.queryActivities($scope.query);
    			//service will run query and then update:
	    			//query.results
	    			//query.errors
	    	};

	    	$scope.$watch('query.loading', function(){
	    		console.log("-- gathering graph data");
	    		$scope.chartData = getAdultWeirChartData($scope.query.results);	
	    		$scope.dataSheetDataset = $scope.query.results;
	    	});
	    	



	    	

	    	$scope.openActivity = function()
	    	{
	    		$location.path("/dataview/"+$scope.onRow.entity.ActivityId);
	    	};

    		$scope.queryList = [
    		{
    			Title: "2013 Fall and Spring Chinook",
    			Description: "All activity for Spring/Fall Chinook from 1/1/13-12/31/13"
    		},
    		{
    			Title: "Broodstock 2013",
    			Description: "All fish used for broodstock in 2013"
    		}
    		];

    		$scope.openExportView = function() {
				var modalInstance = $modal.open({
					templateUrl: 'partials/exportfile-modal.html',
					controller: 'ModalExportController',
					scope: $scope, //very important to pass the scope along... -- TODO: but we don't want to pass in the whole $scope...
					//resolve: { files: function() { return $scope.files; } }
				});
			}
    	}
]);


//Global / full query across all projects with this dataset.
mod_dq.controller('DatastoreQueryCtrl', ['$scope','$routeParams','DatastoreService','DataService','$location', '$modal','DataSheet', '$rootScope',
    	function($scope, $routeParams, DatastoreService, DataService, $location, $modal, DataSheet, $rootScope) {

    		$scope.datastoreLocations = DatastoreService.getLocations($routeParams.Id);
    		$scope.dataFields = DatastoreService.getFields($routeParams.Id);
    		$scope.datastore = DatastoreService.getDatastore($routeParams.Id);

			$scope.headerFields = [];
    		$scope.detailFields = [];
    		$scope.datasheetColDefs = [];
    		$scope.query = {results: []};
    		$scope.dataSheetDataset = [];

			$scope.chartData = {"series": [], "data":[{ "x": "Loading...", "y": [0],"tooltip": ""}]}; //default

    		$scope.gridDatasheetOptions = { 
    			data: 'dataSheetDataset', 
		        columnDefs: 'datasheetColDefs',
    			enableColumnResize: true, 
	        	enableRowSelection: true,
	        	enableCellEdit: false,
	        	enableSorting: true, 
    			enableCellSelection: true,
    			showFilter: false,
    			showColumnMenu: true,
    			multiSelect: false,
    		};

			DataSheet.initScope($scope);

			$scope.datasheetColDefs = [{   
										field: 'LocationId', 
                                        displayName: 'Location', 
                                        cellFilter: 'locationNameFilter'
                                    },
                                    {
                                        field: 'ActivityDate', 
                                        displayName: 'Activity Date',
                                        cellFilter: 'date: \'MM/dd/yyyy\'',
                                    },
                                    {
                                        field: 'ActivityQAStatusId',
                                        displayName: 'QA Status',
                                        cellFilter: 'QAStatusFilter'
                                    }];


    		$scope.$watch('datastoreLocations', function(){
    			if(!$scope.datastoreLocations)
    				return;
    			
    			$scope.locationOptions = $rootScope.locationOptions = makeObjects($scope.datastoreLocations, 'Id','Label') ;
    			$scope.locationOptions["all"] = "- All -";
    			$scope.Criteria.LocationIds = ["all"]; //set the default	
    		},true);


    		$scope.$watch('dataFields', function(){
    			if(!$scope.dataFields)
    				return;
    			
    			var fieldIndex = 0;

				angular.forEach($scope.dataFields, function(field){
					parseField(field, $scope);
					
					//create a javascript list from our possible values (if any)
					if(field.PossibleValues)
					{
						
		                field.PossibleValuesList = makeObjectsFromValues(field.DbColumnName, field.PossibleValues); //set this into our object
	
						fieldIndex ++;

					}

					$scope.datasheetColDefs.push(makeFieldColDef(field, $scope));


	    		});

				$scope.recalculateGridWidth($scope.datasheetColDefs.length);
    			
    		},true);


			$scope.criteriaList = [];

	    	$scope.queryToolVisible = true;
			$scope.Criteria = {};
			$scope.Criteria.paramActivityDateType = "all"; //default
			
		//$scope.QAStatusOptions = $rootScope.QAStatusOptions = makeObjects($scope.dataset.QAStatuses, 'Id','Name');  //TODO
			$scope.QAStatusOptions = {};
	        $scope.QAStatusOptions["all"] = "- All -";
	        $scope.Criteria.ParamQAStatusId = "all";

    		$scope.AutoExecuteQuery = true;

    		$scope.removeCriteria = function(idx) {
    			$scope.criteriaList.splice(idx,1);
    			if($scope.AutoExecuteQuery)
					$scope.executeQuery();
    		};

    		$scope.addCriteria = function(){
				$scope.criteriaList.push({
					//commenting these out because they will be read at EXECUTE time, not saved per query.
					//qastatus:   $scope.Criteria.ParamQAStatusId,
					//locations:  $scope.Criteria.LocationIds,
					//activities: $scope.Criteria.paramActivityDateType, 
					DbColumnName: 		$scope.Criteria.ParamFieldSelect[0].DbColumnName,
					Id: 				$scope.Criteria.ParamFieldSelect[0].Id,
					Value: 				$scope.Criteria.Value,
				});

				console.dir($scope.criteriaList);

				$scope.Criteria.Value = null;

				if($scope.AutoExecuteQuery)
					$scope.executeQuery();
    		};

    		$scope.buildQuery = function(){
				var query = 
    			{
					criteria: {
						DatastoreId: 	  $routeParams.Id,
						QAStatusId:   $scope.Criteria.ParamQAStatusId,
						Locations:    angular.toJson($scope.Criteria.LocationIds).toString(),
						FromDate:     $scope.Criteria.BetweenFromActivityDate,
						ToDate:       $scope.Criteria.BetweenToActivityDate,
						DateSearchType: $scope.Criteria.paramActivityDateType, 
						Fields: 	  $scope.criteriaList,

					},
					loading: true,
    			};

    			return query;
    		};

    		$scope.executeQuery = function(){
    			
    			$scope.query = $scope.buildQuery();

    			DataService.queryActivities($scope.query);
    			//service will run query and then update:
	    			//query.results
	    			//query.errors
	    	};

	    	$scope.$watch('query.loading', function(){
	    		console.log("-- gathering graph data");
	    		$scope.chartData = getAdultWeirChartData($scope.query.results);	
	    		$scope.dataSheetDataset = $scope.query.results;
	    	});
	    	


		}			
]);