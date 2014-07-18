
//data view controllers 

'use strict';
var mod_dv = angular.module('DataViewControllers', ['ui.bootstrap']);

mod_dv.controller('ModalQaUpdateCtrl', ['$scope','DataService', '$modalInstance',
	function($scope, DataService, $modalInstance){
		$scope.save = function(){
			
			DataService.updateQaStatus(
				$scope.grid.Header.ActivityId,
				$scope.row.ActivityQAStatus.QAStatusId, 
				$scope.row.ActivityQAStatus.Comments, 
				$scope.QaSaveResults);
		
			$modalInstance.dismiss();

		};

		$scope.cancel = function(){
			$modalInstance.dismiss();
		};

	}
]);




mod_dv.controller('DatasetViewCtrl', ['$scope','$routeParams','DataService','$modal','$location','DataSheet','$route','$rootScope','ChartService',
    	function($scope, $routeParams, DataService, $modal, $location, DataSheet, $route, $rootScope, ChartService) {
    		$scope.grid = DataService.getActivityData($routeParams.Id); //activity data for a particular activityId
    		
    		$scope.headerFields = [];
    		$scope.detailFields = [];
    		$scope.datasheetColDefs = [];
    		$scope.dataSheetDataset = [];

    		$scope.fieldsloaded = false;

			$scope.$watch('QaSaveResults', function(){
				if($scope.QaSaveResults && $scope.QaSaveResults.success)
				{
					$scope.grid = DataService.getActivityData($routeParams.Id); //activity data for a particular activityId
				}				
			},true);

    		$scope.query = { loading: true };
    		$scope.activities = $rootScope.GridActivities; //pull this in from the previous page, if they were set.  Used for navigating between activities.

			$scope.gridDatasheetOptions = { 
    			data: 'dataSheetDataset', 
		        columnDefs: 'datasheetColDefs',
    			enableColumnResize: true, 
    			enableSorting: true, 
    			enableCellSelection: true,
    			showFilter: true,
    			showColumnMenu: true,
    			enableRowSelection: true,
    			multiSelect: false,
	   			//showFooter: true,
    			//footerTemplate: '<div class="grid-footer-totals"><div class="colt0 sumField"></div><div class="colt1 sumField"></div><div class="colt2 sumField"></div><div class="colt3 sumField"></div><div class="colt4 sumField"></div><div class="colt5 sumField">s: 1433<br/>a: 477.67</div><div class="colt6 sumField"></div></div>',

    		};

    		DataSheet.initScope($scope);

    		$scope.$watch('dataset.ProjectId', function()
    		{
    			if($scope.dataset && $scope.dataset.ProjectId)
    			{
    				$scope.project = DataService.getProject($scope.dataset.ProjectId);
	    			$scope.QAStatusOptions = $rootScope.QAStatusOptions = makeObjects($scope.dataset.QAStatuses, 'Id','Name');

	    			ChartService.buildChart($scope, $scope.grid.Details, $scope.dataset.Datastore.TablePrefix);

	    			//if we have more than 1 row qa status then show them.
		    		if($scope.dataset.RowQAStatuses.length > 1)
		    		{
		    			$scope.datasheetColDefs.unshift(
				    	{
		    				field: "QAStatusId", //QARowStatus
		    				displayName: "QA",
		 					cellFilter: 'RowQAStatusFilter'
		    			});
		    		}

	    		}

    		});

    		//setup a listener to populate column headers on the grid
			$scope.$watch('grid.Dataset', function() { 
				if(!$scope.grid.Dataset) return; //not done cooking yet.
				$scope.dataset = $scope.grid.Dataset;//DataService.getDataset($scope.grid.Dataset.Id);
				DataService.configureDataset($scope.dataset);

				if(!$scope.fieldsloaded)
				{
					angular.forEach($scope.grid.Dataset.Fields.sort(orderByIndex), function(field){

						parseField(field, $scope);

						if(field.FieldRoleId == FIELD_ROLE_HEADER)
						{
							$scope.headerFields.push(field);
						}
						else if (field.FieldRoleId == FIELD_ROLE_DETAIL)
						{
							$scope.detailFields.push(field);
							$scope.datasheetColDefs.push(makeFieldColDef(field, $scope));
						}
		    		});

		    		$scope.fieldsloaded = true;

		    		$scope.dataSheetDataset = $scope.grid.Details;
		    		$scope.recalculateGridWidth($scope.datasheetColDefs.length);
				}
				$scope.query.loading = false;

				$scope.RowQAStatuses =  $rootScope.RowQAStatuses = makeObjects($scope.dataset.RowQAStatuses, 'Id', 'Name');  //Row qa status ids

   				$scope.grid.Header.Activity.Timezone = angular.fromJson($scope.grid.Header.Activity.Timezone);


	    	});

			$scope.getDataGrade = function(check){ return getDataGrade(check)}; //alias from service

	        $scope.changeQa = function(){
	        	$scope.QaSaveResults = {};
				$scope.row = {ActivityQAStatus: {}}; //modal selections

	        	var modalInstance = $modal.open({
						templateUrl: 'partials/changeqa-modal.html',
						controller: 'ModalQaUpdateCtrl',
						scope: $scope, //very important to pass the scope along... -- TODO: but we don't want to pass in the whole $scope...
						//resolve: { files: function() { return $scope.files; } }
					});
	        };

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


			//defined in services
			$scope.previousActivity = function(){
				previousActivity($scope.activities, $routeParams.Id, $location);
			}

			$scope.nextActivity = function(){
				nextActivity($scope.activities, $routeParams.Id, $location);
			}

			$scope.fromJson = function(field)
			{
				return angular.fromJson($scope.grid.Header[field]);
			}


    }]);

		