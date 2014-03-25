//query-controllers
'use strict';

var mod_dq = angular.module('DataQueryControllers', ['ui.bootstrap']);

mod_dq.controller('DataQueryCtrl', ['$scope','$routeParams','DataService','$location', '$modal','DataSheet', '$rootScope',
    	function($scope, $routeParams, DataService, $location, $modal, DataSheet, $rootScope) {

			$scope.dataset = DataService.getDataset($routeParams.Id);
			
    		$scope.headerFields = [];
    		$scope.detailFields = [];
    		$scope.datasheetColDefs = [];
    		$scope.query = {results: []};

    		var footerTemplate = '';


    		$scope.gridDatasheetOptions = { 
    			data: 'query.results', 
		        columnDefs: 'datasheetColDefs',
    			enableColumnResize: true, 
	        	enableRowSelection: true,
	        	enableCellEdit: false,
	        	enableSorting: true, 
    			enableCellSelection: false,
    			showFilter: false,
    			showColumnMenu: true,
    			multiSelect: false,
//    			 plugins: [new ngGridCsvExportPlugin()],
    			//showFooter: true,
    			//footerTemplate: '<div class="grid-footer-totals"><div class="colt0 sumField"></div><div class="colt1 sumField"></div><div class="colt2 sumField"></div><div class="colt3 sumField"></div><div class="colt4 sumField"></div><div class="colt5 sumField">s: 1433<br/>a: 477.67</div><div class="colt6 sumField"></div></div>',

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
    				$scope.locationOptions = $rootScope.locationOptions = makeObjects($scope.project.Locations, 'Id','Label') ;
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

				$scope.footerTemplate = '<div class="grid-footer-totals">';

				angular.forEach($scope.dataset.Fields.sort(orderByAlpha), function(field){
					parseField(field, $scope);
					if(field.FieldRoleId == 1)
					{
						$scope.headerFields.push(field);
					}
					else
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

					//footer template
					$scope.footerTemplate += '<div class="colt'+fieldIndex+' sumField">';
					if(field.ControlType == 'number')
					{
						$scope.footerTemplate += 'sum<br/>avg';
					}
					$scope.footerTemplate += '</div>';


	    		});
	    		//turn off watch?
	    		$scope.footerTemplate += "</div>";

	    		//TODO!
				$scope.gridDatasheetOptions.showFooter = true;
	    		$scope.gridDatasheetOptions.footerTemplate = $scope.footerTemplate;
	    		//console.log($scope.footerTemplate);

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

    		$scope.executeQuery = function(){
    			

    			$scope.query = 
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

    			DataService.queryActivities($scope.query);
    			//service will run query and then update:
	    			//query.results
	    			//query.errors
	    	};

	    	$scope.$watch('query.loading', function(){
	    		console.log("-- gathering graph data");
	    		$scope.chartData = getAdultWeirChartData($scope.query.results);	
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
					controller: 'ModalDataEntryCtrl',
					scope: $scope, //very important to pass the scope along... -- TODO: but we don't want to pass in the whole $scope...
					//resolve: { files: function() { return $scope.files; } }
				});
			}
    	}
]);
