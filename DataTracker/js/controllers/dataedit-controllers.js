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
mod_edit.controller('DataEditCtrl', ['$scope','$q','$sce','$routeParams','DataService','$modal','$location','$rootScope','ActivityParser','DataSheet','FileUploadService',
	function($scope, $q, $sce, $routeParams, DataService, $modal, $location, $rootScope, ActivityParser, DataSheet, UploadService){

		initEdit(); // stop backspace from ditching in the wrong place.

		$scope.userId = $rootScope.Profile.Id;
		$scope.fields = { header: [], detail: [], relation: []}; 

		//fields to support uploads
		$scope.filesToUpload = {};
		$scope.file_row = {};
		$scope.file_field = {};

		$scope.errors = { heading: []};

		$scope.cellInputEditableTemplate = '<input ng-class="\'colt\' + col.index" ng-input="COL_FIELD" ng-model="COL_FIELD" />';
		$scope.cellSelectEditableTemplate = '<select ng-class="\'colt\' + col.index" ng-blur="updateCell(row,\'QAStatusId\')" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in RowQAStatuses"/>';

		$scope.datasheetColDefs = [];

		$scope.option = { enableMultiselect: false };

		$scope.dataset_activities = DataService.getActivityData($routeParams.Id);

        $scope.dataSheetDataset = [];
        $scope.row = {ActivityQAStatus: {}}; //header field values get attached here by dbcolumnname
        $scope.selectedItems = [];

		$scope.gridOptionsFilter = {};

        //datasheet grid
		$scope.gridDatasheetOptions = {
			data: 'dataSheetDataset',
			enableCellSelection: true,
			enableRowSelection: true,
	        multiSelect: true,
	        enableCellEdit: true,
	        columnDefs: 'datasheetColDefs',
	        enableColumnResize: true,
	        selectedItems: $scope.selectedItems,
	        filterOptions: $scope.gridOptionsFilter,

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

			$scope.locationOptions = $rootScope.locationOptions = makeObjects(getUnMatchingByField($scope.project.Locations,PRIMARY_PROJECT_LOCATION_TYPEID,"LocationTypeId"), 'Id','Label') ;
			$scope.selectInstrument();

        });

        $scope.$watch('dataset_activities.Dataset.Id', function()
        {
        	if(!$scope.dataset_activities.Dataset)
        		return;

        	$scope.dataset = $scope.dataset_activities.Dataset;
        	DataService.configureDataset($scope.dataset); //bump to load config since we are pulling it directly out of the activities

        	$scope.project = DataService.getProject($scope.dataset.ProjectId);
        	$scope.QAStatusOptions = $rootScope.QAStatusOptions = makeObjects($scope.dataset.QAStatuses, 'Id','Name');

        	//set the header field values
        	$scope.row['ActivityId'] = $scope.dataset_activities.Header.ActivityId;
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

					if($scope.dataset_activities.Header.Activity.Timezone)
						$scope.row.Timezone = getByField($scope.SystemTimezones, angular.fromJson($scope.dataset_activities.Header.Activity.Timezone).Name, "Name"); //set default timezone

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
        	$scope.gridFields = [];

        	//setup our header/detail field structure
					angular.forEach($scope.dataset.Fields.sort(orderByIndex), function(field){
						parseField(field, $scope);
						if(field.FieldRoleId == FIELD_ROLE_HEADER)
						{
							$scope.fields.header.push(field);
							//also copy the value to row
							if(field.ControlType == "multiselect")
							{
								//console.dir($scope.dataset_activities.Header[field.DbColumnName]);
								$scope.row[field.DbColumnName] = angular.fromJson($scope.dataset_activities.Header[field.DbColumnName]);
							}
							else
								$scope.row[field.DbColumnName] = $scope.dataset_activities.Header[field.DbColumnName];
						}
						else if(field.FieldRoleId == FIELD_ROLE_DETAIL)
						{
							$scope.fields.detail.push(field);
		    				$scope.datasheetColDefs.push(makeFieldColDef(field, $scope));
						}

						//keep a list of grid fields (relations) for later loading
						if(field.ControlType == "grid")
							$scope.gridFields.push(field);
					});

				$scope.recalculateGridWidth($scope.fields.detail.length);
	      $scope.validateGrid($scope);

		});


		$scope.$watch('dataSheetDataset', function(){
			if(!$scope.dataSheetDataset)
				return;

			//kick off the loading of relation data (we do this for UI performance rather than returning with the data...)
			angular.forEach($scope.dataSheetDataset, function(datarow){
				angular.forEach($scope.gridFields, function(gridfield){
					datarow[gridfield.DbColumnName] = DataService.getRelationData(gridfield.FieldId, datarow.ActivityId, datarow.RowId);
					console.log("kicking off loading of " + datarow.ActivityId + ' ' + datarow.RowId);
				})	
			})
			
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

				//mark the row as updated so it will get saved.
				if($scope.updatedRows.indexOf(item.Id) == -1)
                {
                    $scope.updatedRows.push(item.Id);
                }
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


        $scope.createInstrument = function(){
            $scope.viewInstrument = null;
            var modalInstance = $modal.open({
              templateUrl: 'partials/instruments/modal-create-instrument.html',
              controller: 'ModalCreateInstrumentCtrl',
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
			if($scope.row.AccuracyCheckId)
				$scope.row.AccuracyCheck = getByField($scope.viewInstrument.AccuracyChecks, $scope.row.AccuracyCheckId, "Id");
		};


		 $scope.cancel = function(){
		 	if($scope.dataChanged)
		 	{
			 	if(!confirm("Looks like you've made changes.  Are you sure you want to leave this page?"))
			 		return;
			}

		 	$location.path("/"+$scope.dataset.activitiesRoute+"/"+$scope.dataset.Id);
		 };


		//adds row to datasheet grid
		$scope.addNewRow = function()
		{
			var row = makeNewRow($scope.datasheetColDefs);
			row.QAStatusId = $scope.dataset.DefaultRowQAStatusId;
			$scope.dataSheetDataset.push(row);
		};

		$scope.viewRelation = function(row, field_name)
        {
        	//console.dir(row.entity);
        	var field = $scope.FieldLookup[field_name];
        	//console.dir(field);

        	$scope.openRelationEditGridModal(row.entity, field);
        }


		$scope.openRelationEditGridModal = function(row, field)
		{
			$scope.relationgrid_row = row;
			$scope.relationgrid_field = field;
			$scope.isEditable = true;
			var modalInstance = $modal.open({
				templateUrl: 'partials/modals/relationgrid-edit-modal.html',
				controller: 'RelationGridModalCtrl',
				scope: $scope, 
			});
		};


		/* -- these functions are for uploading - */
		$scope.openFileModal = function(row, field)
        {
            //console.dir(row);
            //console.dir(field);
            $scope.file_row = row;
            $scope.file_field = field;

            var modalInstance = $modal.open({
                templateUrl: 'partials/modals/file-modal.html',
                controller: 'FileModalCtrl',
                scope: $scope, //scope to make a child of
            });
        };

        //field = DbColumnName
        $scope.onFileSelect = function(field, files)
        {
            //console.log("file selected! " + field)
            $scope.filesToUpload[field] = files;
        };

        //this function gets called when a user clicks the "Add" button in a GRID file cell
        $scope.addFiles = function(row, field_name)
        {
            var field = $scope.FieldLookup[field_name];

            //console.dir(row);
            //console.dir(field);
            $scope.openFileModal(row.entity, field);

            //go ahead and mark this row as being updated.
            if($scope.updatedRows)
                $scope.updatedRows.push(row.entity.Id);

        }
        /*  -- */

		$scope.saveData = function(){

			$scope.errors.heading = []; //reset errors if there are any.

			if($scope.gridHasErrors)
			{
				if(!confirm("There are validation errors.  Are you sure you want to save anyway?"))
					return;
			}

			var promise = UploadService.uploadFiles($scope.filesToUpload, $scope);
			promise.then(function(data){

				//spin through the files that we uploaded
				angular.forEach($scope.filesToUpload, function(files, field){

					var local_files = [];

					for(var i = 0; i < files.length; i++)
			      	{
			          var file = files[i];

			          if(file.data && file.data.length == 1) //since we only upload one at a time...
			          {
			          		//console.dir(file.data);
			          		local_files.push(file.data[0]); //only ever going to be one if there is any...
			          		//console.log("file id = "+file.data[0].Id);
			          }
			          else
			          {
			          	//console.log("no file id.");
			          	$scope.errors.heading.push("There was a problem saving file: " + file.Name + " - Try a unique filename.");
			          	throw "Problem saving file: " + file.Name;
			          }
			      	}

			      	//if we already had actual files in this field, copy them in
			      	if($scope.file_row[field])
			      	{
			      		var current_files = angular.fromJson($scope.file_row[field]);
			      		angular.forEach(current_files, function(file){
			      			if(file.Id) //our incoming files don't have an id, just actual files.
			      				local_files.push(file);
			      		});
			      	}

					$scope.file_row[field] = angular.toJson(local_files);
					//console.log("Ok our new list of files: "+$scope.row[field]);
				});

				$scope.activities = ActivityParser.parseSingleActivity($scope.row, angular.extend($scope.dataSheetDataset, $scope.deletedRows), $scope.fields);

				if(!$scope.activities.errors)
				{
					//add our updated list and deleted list to our payload
					$scope.activities.deletedRowIds = $scope.getDeletedRowIds($scope.deletedRows);
					$scope.activities.updatedRowIds = $scope.updatedRows;

					DataService.updateActivities($scope.userId, $scope.dataset.Id, $scope.activities);

				}
			});



		};

		$scope.doneButton = function(){
			$scope.activities = undefined;
		 	$location.path("/"+$scope.dataset.activitiesRoute+"/"+$scope.dataset.Id);
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
