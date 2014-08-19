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

mod_dq.controller('DataQueryCtrl', ['$scope','$routeParams','DataService','$location', '$modal','DataSheet', '$rootScope','ChartService',
    	function($scope, $routeParams, DataService, $location, $modal, DataSheet, $rootScope, ChartService) {

			$scope.dataset = DataService.getDataset($routeParams.Id);
			
    		$scope.headerFields = [];
    		$scope.detailFields = [];
    		$scope.datasheetColDefs = [];
    		$scope.query = {results: []};
    		$scope.dataSheetDataset = [];
    		$scope.dataFields = [];
			$scope.criteriaList = [];
	    	$scope.queryToolVisible = true;
			$scope.Criteria = {};
			$scope.Criteria.paramActivityDateType = "all"; //default
			

    		$scope.AutoExecuteQuery = true;


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
                                    },
                                    {
					    				field: "QAStatusId", //QARowStatus
					    				displayName: "QA",
					    				minWidth: 50, maxWidth: 200,
					 					cellFilter: 'RowQAStatusFilter',
					 					visible: false,  //start off hidden -- show only if relevant
					    			}

                                    ];

    		$scope.$watch('project.Name', function(){
    			if($scope.project){
    				$scope.locationOptions = $rootScope.locationOptions = makeObjects(getUnMatchingByField($scope.project.Locations,PRIMARY_PROJECT_LOCATION_TYPEID,"LocationTypeId"), 'Id','Label') ;
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

	    		$scope.dataFields = $scope.dataFields.sort(orderByAlpha);

				$scope.recalculateGridWidth($scope.datasheetColDefs.length);

				$scope.RowQAStatuses =  $rootScope.RowQAStatuses = undefined;

				//add in the QA field if it is relevant for this dataset.
				if($scope.dataset.RowQAStatuses.length > 1)
				{
					$scope.RowQAStatuses =  $rootScope.RowQAStatuses = makeObjects($scope.dataset.RowQAStatuses, 'Id', 'Name');  //Row qa status ids

					$scope.RowQAStatuses["all"] = "- All -";
					$scope.Criteria.ParamRowQAStatusId = ["all"];
					$scope.datasheetColDefs[3].visible = true; //QAStatusId
				}


	    	});


    		$scope.removeCriteria = function(idx) {
    			$scope.criteriaList.splice(idx,1);
    			if($scope.AutoExecuteQuery)
					$scope.executeQuery();
    		};

    		$scope.clearValue = function()
    		{
    			$scope.Criteria.Value = null;
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
						RowQAStatusId: $scope.Criteria.ParamRowQAStatusId,
						Locations:    angular.toJson($scope.Criteria.LocationIds).toString(),
						FromDate:     $scope.Criteria.BetweenFromActivityDate,
						ToDate:       $scope.Criteria.BetweenToActivityDate,
						DateSearchType: $scope.Criteria.paramActivityDateType, 
						Fields: 	  $scope.criteriaList,

					},
					loading: true,
    			};

    			if(query.criteria.RowQAStatusId)
    				query.criteria.RowQAStatusId = angular.toJson(query.criteria.RowQAStatusId).toString();

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
	    		if(!$scope.dataset.Id)
	    			return;

	    		console.log("-- gathering graph data");
	    		$scope.dataSheetDataset = $scope.query.results;
	    		ChartService.buildChart($scope, $scope.dataSheetDataset, $scope.dataset.Datastore.TablePrefix, {height: 360, width: 800});
	    		//$scope.chartData = getAdultWeirChartData($scope.query.results);	
	    		
	    	});

	    	$scope.openActivity = function()
	    	{
	    		$location.path("/dataview/"+$scope.onRow.entity.ActivityId);
	    	};


    		$scope.openExportView = function() {
				var modalInstance = $modal.open({
					templateUrl: 'partials/modals/exportfile-modal.html',
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

    			$scope.dataFields = $scope.dataFields.sort(orderByAlpha);
    			console.log("ordered!");
    			console.dir($scope.dataFields);

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
			$scope.RowQAStatuses = {};
	        
	        $scope.QAStatusOptions["all"] = "- All -";
	        $scope.RowQAStatusOptions["all"] = "- All -";
	        
	        $scope.Criteria.ParamQAStatusId = "all";
	        $scope.Criteria.ParamRowQAStatusId = "all";
	        
	        $scope.RowQAStatuses["all"] = "- All -";


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

				//console.dir($scope.criteriaList);

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