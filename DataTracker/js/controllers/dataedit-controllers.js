//data edit controllers / QA

'use strict';

var mod_edit = angular.module('DataEditControllers', ['ui.bootstrap']);

//modal to bulk update RowQAStatus
mod_edit.controller('ModalBulkRowQAChangeCtrl', ['$scope','$modalInstance', 

	function($scope,  $modalInstance){

		$scope.newRowQAStatus = {};

        $scope.save = function(){
        	$scope.setSelectedBulkQAStatus($scope.newRowQAStatus.Id);
            $modalInstance.dismiss();
        };

        $scope.cancel = function(){
            $modalInstance.dismiss();
        };

    }
]);





//Fieldsheet / form version of the dataentry page
mod_edit.controller('DataEditCtrl', ['$scope','$routeParams','DataService','$modal','$location','$rootScope','ActivityParser','DataSheet',
	function($scope, $routeParams, DataService, $modal, $location, $rootScope, ActivityParser, DataSheet){

		initEdit(); // stop backspace from ditching in the wrong place.

		$scope.userId = $rootScope.Profile.Id;
		$scope.headerFields = [];
		$scope.detailFields = [];

		$scope.cellInputEditableTemplate = '<input ng-class="\'colt\' + col.index" ng-input="COL_FIELD" ng-model="COL_FIELD" />';
		$scope.cellSelectEditableTemplate = '<select ng-class="\'colt\' + col.index" ng-blur="updateCell(row,\'QAStatusId\')" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in RowQAStatuses"/>';

		$scope.datasheetColDefs = [];
		
		$scope.option = { enableMultiselect: false };
		
		$scope.dataset_activities = DataService.getActivityData($routeParams.Id);

        $scope.dataSheetDataset = [];
        $scope.row = {ActivityQAStatus: {}}; //header field values get attached here by dbcolumnname
        $scope.selectedItems = [];

        //datasheet grid
		$scope.gridDatasheetOptions = {
			data: 'dataSheetDataset',
			enableCellSelection: true,
			enableRowSelection: true,
	        multiSelect: true,
	        enableCellEdit: true,
	        columnDefs: 'datasheetColDefs',
	        enableColumnResize: true,
	        selectedItems: $scope.selectedItems
        
		};

        //config the fields for the datasheet - include mandatory location and activityDate fields
		DataSheet.initScope($scope);

		//update our location options as soon as our project is loaded.
        $scope.$watch('project.Name', function(){
        	if(!$scope.project) return;
        	
			//check authorization -- need to have project loaded before we can check project-level auth
			if(!$rootScope.Profile.isProjectOwner($scope.project) && !$rootScope.Profile.isProjectEditor($scope.project))
			{
				$location.path("/unauthorized");
			}

			$scope.locationOptions = $rootScope.locationOptions = makeObjects(getMatchingByField($scope.project.Locations,2,"LocationTypeId"), 'Id','Label') ;
			$scope.selectInstrument(); 

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
        	$scope.row['InstrumentId'] = $scope.dataset_activities.Header.Activity.InstrumentId; 
        	$scope.row['AccuracyCheckId'] = $scope.dataset_activities.Header.Activity.AccuracyCheckId; 
        	$scope.row['PostAccuracyCheckId'] = $scope.dataset_activities.Header.Activity.PostAccuracyCheckId; 

        	if($scope.dataset_activities.Header.Activity.ActivityQAStatus)
        	{
        		$scope.row.ActivityQAStatus = {
        			QAStatusId: ""+$scope.dataset_activities.Header.Activity.ActivityQAStatus.QAStatusId,
        			Comments: $scope.dataset_activities.Header.Activity.ActivityQAStatus.Comments,
        		}
			}

			$scope.RowQAStatuses =  $rootScope.RowQAStatuses = makeObjects($scope.dataset.RowQAStatuses, 'Id', 'Name');  //Row qa status ids
		
			if($scope.dataset.RowQAStatuses.length > 1)
			{
				$scope.datasheetColDefs.push(
						{
		    				field: "QAStatusId", //QARowStatus
		    				displayName: "QA",
		    				minWidth: 50, maxWidth: 180,
		    				enableCellEditOnFocus: true, 
		        			editableCellTemplate: $scope.cellSelectEditableTemplate,
		 					cellFilter: 'RowQAStatusFilter'
		    			});
			}


			//set the detail (grid) values.
        	$scope.dataSheetDataset = $scope.dataset_activities.Details;

        	//setup our header/detail field structure
			angular.forEach($scope.dataset.Fields.sort(orderByIndex), function(field){
				parseField(field, $scope);
				if(field.FieldRoleId == FIELD_ROLE_HEADER)
				{
					$scope.headerFields.push(field);
					//also copy the value to row
					$scope.row[field.DbColumnName] = $scope.dataset_activities.Header[field.DbColumnName];
				}
				else if(field.FieldRoleId == FIELD_ROLE_DETAIL)
				{
					$scope.detailFields.push(field);
    				$scope.datasheetColDefs.push(makeFieldColDef(field, $scope));
				}

			});

			$scope.recalculateGridWidth($scope.detailFields.length);
            $scope.validateGrid($scope);

		});
        
		$scope.clearSelections = function()
		{
			$scope.gridDatasheetOptions.selectAll(false);
		};

		$scope.setSelectedBulkQAStatus = function(rowQAId)
		{
			angular.forEach($scope.gridDatasheetOptions.selectedItems, function(item, key){
				//console.dir(item);
				item.QAStatusId = rowQAId;
			});

			$scope.clearSelections();
		};

		$scope.openBulkQAChange = function(){

            var modalInstance = $modal.open({
              templateUrl: 'partials/dataentry/modal-rowqaupdate.html',
              controller: 'ModalBulkRowQAChangeCtrl',
              scope: $scope, //very important to pass the scope along... 
        
            });

		};



		$scope.reloadProject = function(){
                //reload project instruments -- this will reload the instruments, too
                DataService.clearProject();
                $scope.project = DataService.getProject($scope.dataset.ProjectId);
                var watcher = $scope.$watch('project.Id', function(){
                	$scope.selectInstrument();	
                	watcher();
                });
                
         };

		$scope.openAccuracyCheckModal = function(){

            var modalInstance = $modal.open({
              templateUrl: 'partials/instruments/modal-new-accuracycheck.html',
              controller: 'ModalQuickAddAccuracyCheckCtrl',
              scope: $scope, //very important to pass the scope along... 
        
            });

		};


		$scope.getDataGrade = function(check){ return getDataGrade(check)}; //alias from service

		$scope.selectInstrument = function(){
			$scope.viewInstrument = getByField($scope.project.Instruments, $scope.row.InstrumentId, "Id");
			$scope.selectAccuracyCheck();
		};

		$scope.selectAccuracyCheck = function(){
			//if($scope.row.AccuracyCheckId)
			//	$scope.row.AccuracyCheck = getByField($scope.viewInstrument.AccuracyChecks, $scope.row.AccuracyCheckId, "Id");
		};


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


