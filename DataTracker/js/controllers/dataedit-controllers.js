//data edit controllers / QA

'use strict';

var mod_edit = angular.module('DataEditControllers', ['ui.bootstrap']);


//Fieldsheet / form version of the dataentry page
mod_edit.controller('DataEditCtrl', ['$scope','$routeParams','DataService','$modal','$location','$rootScope','ActivityParser','DataSheet',
	function($scope, $routeParams, DataService, $modal, $location, $rootScope, ActivityParser, DataSheet){

		initEdit(); // stop backspace from ditching in the wrong place.

		$scope.userId = 1; /////////////////////////////////////////TODOOOOOOOOOOOOOOOOOOOOOOOO
		$scope.headerFields = [];
		$scope.detailFields = [];

		$scope.cellInputEditableTemplate = '<input ng-class="\'colt\' + col.index" ng-input="COL_FIELD" ng-model="COL_FIELD" />';
		$scope.cellSelectEditableTemplate = '<select ng-class="\'colt\' + col.index" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in QAStatuses"/>';

		$scope.datasheetColDefs = [
				{
    				field: "QAStatusId", //QARowStatus
    				displayName: "QA",
    				minWidth: 50, maxWidth: 180,
    				enableCellEditOnFocus: true, 
        			editableCellTemplate: $scope.cellSelectEditableTemplate,
 					cellFilter: 'mapStatus'
    			}
		];
        
		$scope.QAStatuses = {   1: 'Ok',   2: 'Flagged'  }; //Row qa status ids, Get from DB -------------------------------- TODO

        $scope.dataset_activities = DataService.getActivityData($routeParams.Id);

        $scope.dataSheetDataset = [];
        $scope.row = {ActivityQAStatus: {}}; //header field values get attached here by dbcolumnname
        
		//datasheet grid
		$scope.gridDatasheetOptions = {
			data: 'dataSheetDataset',
			enableCellSelection: true,
	        enableRowSelection: false,
	        enableCellEdit: true,
	        columnDefs: 'datasheetColDefs',
	        enableColumnResize: true,
	        
		};

        //config the fields for the datasheet - include mandatory location and activityDate fields
		//$scope.datasheetColDefs = DataSheet.getColDefs();
		DataSheet.initScope($scope);

		//update our location options as soon as our project is loaded.
        $scope.$watch('project.Name', function(){
        	if(!$scope.project) return;
        	
			//check authorization -- need to have project loaded before we can check project-level auth
			if(!$rootScope.Profile.isProjectOwner($scope.project) && !$rootScope.Profile.isProjectEditor($scope.project))
			{
				$location.path("/unauthorized");
			}

			$scope.locationOptions = $rootScope.locationOptions = makeObjects($scope.project.Locations, 'Id','Label') ;

        });

        $scope.$watch('dataset_activities.Dataset.Id', function()
        {
        	if(!$scope.dataset_activities.Dataset)
        		return;

        	$scope.dataset = $scope.dataset_activities.Dataset;
        	$scope.project = DataService.getProject($scope.dataset.ProjectId);
        	$scope.QAStatusOptions = $rootScope.QAStatusOptions = makeObjects($scope.dataset.QAStatuses, 'Id','Name');

        	//set the header field values 
        	$scope.row['activityDate'] = $scope.dataset_activities.Header.Activity.ActivityDate;
        	$scope.row['locationId'] = ""+$scope.dataset_activities.Header.Activity.LocationId; //note the conversion of this to a string!
        	if($scope.dataset_activities.Header.Activity.ActivityQAStatus)
        	{
        		$scope.row.ActivityQAStatus = {
        			QAStatusId: ""+$scope.dataset_activities.Header.Activity.ActivityQAStatus.QAStatusId,
        			Comments: $scope.dataset_activities.Header.Activity.ActivityQAStatus.Comments,
        		}
			}

			//set the detail (grid) values.
        	$scope.dataSheetDataset = $scope.dataset_activities.Details;

        	//setup our header/detail field structure
			angular.forEach($scope.dataset.Fields.sort(orderByIndex), function(field){
				parseField(field, $scope);
				if(field.FieldRoleId == 1)
				{
					$scope.headerFields.push(field);
					//also copy the value to row
					$scope.row[field.DbColumnName] = $scope.dataset_activities.Header[field.DbColumnName];
				}
				else
				{
					$scope.detailFields.push(field);
    				$scope.datasheetColDefs.push(makeFieldColDef(field, $scope));
				}

			});

            $scope.validateGrid($scope);

		});
        

		 $scope.cancel = function(){
		 	if($scope.dataChanged)
		 	{	
			 	if(!confirm("Looks like you've made changes.  Are you sure you want to leave this page?"))
			 		return;
			}

		 	$location.path("/activities/"+$scope.dataset.Id);
		 };
		

		//adds row to datasheet grid
		$scope.addNewRow = function()
		{
			var row = makeNewRow($scope.datasheetColDefs);
			row.QAStatusId = $scope.dataset.DefaultRowQAStatusId;
			$scope.dataSheetDataset.push(row);
		};


		$scope.saveData = function(){
			
			$scope.activities = ActivityParser.parseSingleActivity($scope.row, angular.extend($scope.dataSheetDataset, $scope.deletedRows), $scope.headerFields, $scope.detailFields);
			
			if(!$scope.activities.errors)
			{

				//add our updated list and deleted list to our payload
				$scope.activities.deletedRowIds = $scope.getDeletedRowIds($scope.deletedRows);
				$scope.activities.updatedRowIds = $scope.updatedRows;

				DataService.updateActivities($scope.userId, $scope.dataset.Id, $scope.activities);

			}
			
		};		

		$scope.doneButton = function(){
			$scope.activities = undefined;
		 	$location.path("/activities/"+$scope.dataset.Id);
		};

		$scope.getDeletedRowIds = function(rows)
		{
			var results = [];
			for (var i = 0; i < rows.length; i++) {
				var row = rows[i];
				if(row.Id) // true of deleted existing records; new rows added won't have an id.
				{
					results.push(row.Id);
				}
			};

			return results;
		}
	}
]);


