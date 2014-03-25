
//data view controllers 

'use strict';
var mod_dv = angular.module('DataViewControllers', ['ui.bootstrap']);

mod_dv.controller('DatasetViewCtrl', ['$scope','$routeParams','DataService','$modal','$location','DataSheet','$route','$rootScope',
    	function($scope, $routeParams, DataService, $modal, $location, DataSheet, $route, $rootScope) {
    		$scope.grid = DataService.getActivityData($routeParams.Id); //activity data for a particular activityId
    		
    		$scope.headerFields = [];
    		$scope.detailFields = [];
    		$scope.datasheetColDefs = [];
    		
    		$scope.query = { loading: true };

			$scope.gridDatasheetOptions = { 
    			data: 'grid.Details', 
		        columnDefs: 'datasheetColDefs',
    			enableColumnResize: true, 
    			enableSorting: true, 
    			//enableCellSelection: false,
    			showFilter: true,
    			showColumnMenu: true,
    			enableRowSelection: true,
    			multiSelect: false,
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

    		$scope.$watch('dataset.ProjectId', function()
    		{
    			if($scope.dataset && $scope.dataset.ProjectId)
    			$scope.project = DataService.getProject($scope.dataset.ProjectId);
    		});

    		//setup a listener to populate column headers on the grid
			$scope.$watch('grid.Dataset', function() { 
				if(!$scope.grid.Dataset) return; //not done cooking yet.
				$scope.dataset = DataService.getDataset($scope.grid.Dataset.Id);
				angular.forEach($scope.grid.Dataset.Fields, function(field){
					if(field.FieldRoleId == 1)
					{
						$scope.headerFields.push(field);
					}
					else
					{
						$scope.detailFields.push(field);
						$scope.datasheetColDefs.push(makeFieldColDef(field, $scope));
					}
	    		});

	    		$scope.chartData = getAdultWeirChartData($scope.grid.Details);
	    		$scope.query.loading = false;

	    	});

	    	$scope.openEdit = function()
	    	{
	    		$location.path("/edit/"+$scope.grid.Header.ActivityId);
	    	}

			$scope.openExportView = function() {
				var modalInstance = $modal.open({
					templateUrl: 'partials/exportfile-modal.html',
					controller: 'ModalDataEntryCtrl',
					scope: $scope, //very important to pass the scope along... -- TODO: but we don't want to pass in the whole $scope...
					//resolve: { files: function() { return $scope.files; } }
				});
			}

    		
    		//copy and paste alert -- this should be in a common thing!
    		$scope.openDataEntryModal = function() {
				var modalInstance = $modal.open({
					templateUrl: 'partials/dataentry-modal.html',
					controller: 'ModalDataEntryCtrl',
					scope: $scope, //very important to pass the scope along... -- TODO: but we don't want to pass in the whole $scope...
					//resolve: { files: function() { return $scope.files; } }
				});
			};
    }]);

