//import-controllers
// ken burcham 2/2014
'use strict';

var mod_di = angular.module('DataImportControllers', ['ui.bootstrap']);


mod_di.controller("DatasetImportCtrl", ['$scope','$routeParams','DatastoreService','DataService','$location','$upload','ActivityParser','DataSheet', '$rootScope', 'Logger','$route','$modal','ChartService',
    	function($scope, $routeParams, DatastoreService, DataService, $location, $upload, ActivityParser, DataSheet, $rootScope, Logger,$route, $modal, ChartService) {
//    		$scope.QAActivityStatuses = QAActivityStatuses;
    	$scope.dataset = DataService.getDataset($routeParams.Id);
			$scope.mappedActivityFields = {};
			$scope.userId = $rootScope.Profile.Id;
			$scope.fields = { header: [], detail: [], relation: []}; 
			$scope.dataSheetDataset = [];
			$scope.showHeaderForm = false;
			$scope.row = {}; //header form values if used...
			$scope.selectedItems = [];

			$scope.HeaderColDefs = []; //inserted into grid if wide-sheet view
			$scope.DetailColDefs = []; //fields always present in the grid
			$scope.RowQAColDef = [];

			$scope.existingActivitiesLoad = DataService.getActivities($routeParams.Id);
			$scope.existingActivities = [];

			$scope.ActivityFields = { QAComments: DEFAULT_IMPORT_QACOMMENT, ActivityDate: new Date() };

			$scope.UploadResults = {};
			$scope.UploadResults.errors = [];

			$scope.ignoreDuplicates = true;
			$scope.DuplicateRecordsBucket = [];

			$scope.mappableFields = [
				{
					Label: "[-- Do not map --]"
				},
				{
					Label: "[-- Activity Date --]"
				},
				{
					Label: "[-- Index Field --]"
				},
				{
					Label: "[-- QA Row Status Id --]"
				},

				/*
				{
					Label: "[-- Location Id --]"
				},
				*/
				
			];


			$scope.$watch('project.Name', function(){
	        	if(!$scope.project) return;
	        	//Logger.debug($scope.project);

	        	//check authorization -- need to have project loaded before we can check project-level auth
				if(!$rootScope.Profile.isProjectOwner($scope.project) && !$rootScope.Profile.isProjectEditor($scope.project))
				{
					$location.path("/unauthorized");
				}

				//Add the OtherAgencyId to the label - requirement from Colette
				angular.forEach($scope.project.Locations, function(loc)
	    		{
	    			if(loc.OtherAgencyId && loc.Label.indexOf(loc.OtherAgencyId)==-1)
	    				loc.Label = loc.Label + ' (' + loc.OtherAgencyId + ')';
	    		});

	        	//setup locationOptions dropdown
				$scope.locationOptions = $rootScope.locationOptions = makeObjects(getUnMatchingByField($scope.project.Locations,PRIMARY_PROJECT_LOCATION_TYPEID,"LocationTypeId"), 'Id','Label') ;

				//setup location field to participate in validation
				$scope.FieldLookup['locationId'] = { DbColumnName: 'locationId', ControlType: "select" };
				$scope.CellOptions['locationIdOptions'] = $scope.locationOptions;

				//set locationid if it is incoming as a query param (?LocationId=142)
	    		if($routeParams.LocationId){
	    			$scope.ActivityFields.LocationId = $routeParams.LocationId;
	    			$scope.setLocation();

	    		//single location?  go ahead and set it to the default.
	    		}else if(array_count($scope.locationOptions) == 1){
	    			angular.forEach(Object.keys($scope.locationOptions), function(key){
	    				$scope.ActivityFields.LocationId = key;
	    				$scope.setLocation();
	    			});
	    		}

	        });

			$scope.setLocation = function()
			{
				$scope.ActivityFields.Location = getByField($scope.project.Locations, $scope.ActivityFields.LocationId, "Id");
			};

			//setup our existingActivities array so we can manage duplicates
	        var ealoadwatcher = $scope.$watch('existingActivitiesLoad.length', function(){
	        	if($scope.existingActivitiesLoad.length > 0)
	        	{
	        		$scope.existingActivitiesLoad.$promise.then(function(){
	        			angular.forEach($scope.existingActivitiesLoad, function(activity, key){
	        				$scope.existingActivities.push(activity.LocationId+"_"+activity.ActivityDate.substr(0,10));
	        			});
	        			$scope.existingActivitiesLoad = []; // cleanup
	        			//console.dir($scope.existingActivities);
	        			ealoadwatcher();
	        		});
	        	}

	        });

			//to be able to show only the invalid records.
			$scope.ValidRecordsBucket = [];
			$scope.TempRecordsBucket = [];

			$scope.reloadProject = function(){
                //reload project instruments -- this will reload the instruments, too
                DataService.clearProject();
                $scope.project = DataService.getProject($scope.dataset.ProjectId);
                var watcher = $scope.$watch('project.Id', function(){
                	$scope.selectInstrument();
                	watcher();
                });

	         };

			$scope.clearSelections = function()
			{
				$scope.gridDatasheetOptions.selectAll(false);
			};

			$scope.setSelectedBulkQAStatus = function(rowQAId)
			{
				angular.forEach($scope.gridDatasheetOptions.selectedItems, function(item, key){
					//console.dir(item);
					item.RowQAStatusId = rowQAId;
				});

				$scope.clearSelections();
			};

			$scope.createInstrument = function(){
	            $scope.viewInstrument = null;
	            var modalInstance = $modal.open({
	              templateUrl: 'partials/instruments/modal-create-instrument.html',
	              controller: 'ModalCreateInstrumentCtrl',
	              scope: $scope, //very important to pass the scope along...
	            });
	         };

			$scope.openBulkQAChange = function(){

	            var modalInstance = $modal.open({
	              templateUrl: 'partials/dataentry/modal-rowqaupdate.html',
	              controller: 'ModalBulkRowQAChangeCtrl',
	              scope: $scope, //very important to pass the scope along...

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
				//get latest accuracy check
				$scope.viewInstrument = getByField($scope.project.Instruments, $scope.ActivityFields.InstrumentId, "Id");
				if($scope.viewInstrument && $scope.viewInstrument.AccuracyChecks.length > 0)
					$scope.row.AccuracyCheckId = $scope.viewInstrument.AccuracyChecks[$scope.viewInstrument.AccuracyChecks.length-1].Id; //set to last one
			};

			$scope.toggleDuplicates = function(){

				try{
					if(!$scope.ignoreDuplicates)
					{
						$scope.TempRecordsBucket = [];
						$scope.DuplicateRecordsBucket = [];
						angular.forEach($scope.dataSheetDataset, function(item, key){
							var date_check = item.activityDate;

							if(typeof item.activityDate == "object")
								date_check = item.activityDate.toISOString();

							if($scope.existingActivities.indexOf(item.locationId + "_"+date_check.substr(0,10)) != -1) //found a duplicate
								$scope.DuplicateRecordsBucket.push(item);
							else
								$scope.TempRecordsBucket.push(item);
						});

						$scope.dataSheetDataset = $scope.TempRecordsBucket;
						$scope.TempRecordsBucket = [];
						//our duplicates are in $scope.DuplicateRecordsBucket
					}
					else
					{
						angular.forEach($scope.DuplicateRecordsBucket, function(item, key){
							$scope.dataSheetDataset.push(item);
						});
						$scope.DuplicateRecordsBucket = [];
					}

					$scope.validateGrid($scope);
		        	$scope.floatErrorsToTop();
		        }
		        catch(e)
		        {
		        	console.dir(e);
		        }

			};

			$scope.floatErrorsToTop = function(){
				//iterate and split errors from valid records.
				angular.forEach($scope.dataSheetDataset, function(row, key){
					if(row.isValid)
					{
						$scope.ValidRecordsBucket.push(row);
					}
					else
					{
						$scope.TempRecordsBucket.push(row);
					}
				});

				//set the grid to be just the errors.
				$scope.dataSheetDataset = $scope.TempRecordsBucket;
				$scope.TempRecordsBucket = [];

				//bring all the valid records back in below the errors
				angular.forEach($scope.ValidRecordsBucket, function(row, key){
					$scope.dataSheetDataset.push(row);
				});
				$scope.ValidRecordsBucket = [];

			};

			$scope.mapping = {};

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

            //config the fields for the preview datasheet - include mandatory location and activityDate fields
			$scope.datasheetColDefs = DataSheet.getColDefs();
			DataSheet.initScope($scope);

			$scope.cellRowQATemplate = '<select ng-class="\'colt\' + col.index" ng-blur="updateCell(row,\'RowQAStatusId\')" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in RowQAStatuses"/>';


			//setup our mappableFields list
    		$scope.$watch('dataset.Name', function(){
    			if($scope.dataset.Fields)
    			{
    				//DataService.configureDataset($scope.dataset); //bump to load config since we are pulling it directly out of the activities

					$scope.project = DataService.getProject($scope.dataset.ProjectId);

					$scope.QAStatusOptions = $rootScope.QAStatusOptions = makeObjects($scope.dataset.QAStatuses, 'Id','Name');
					$scope.RowQAStatuses =  $rootScope.RowQAStatuses = makeObjects($scope.dataset.RowQAStatuses, 'Id', 'Name');  //Row qa status ids

					$scope.ActivityFields.QAStatusId = ""+$scope.dataset.DefaultActivityQAStatusId;

					//setup special columns so they participate in validation
					$scope.FieldLookup['activityDate'] = { DbColumnName: 'activityDate', ControlType: "date" };
					$scope.FieldLookup['QAStatusId'] = 	 { DbColumnName: 'QAStatusId', ControlType: "select" };
					$scope.CellOptions['QAStatusIdOptions'] = 	 $scope.QAStatusOptions;

					//iterate fields and set 'em up
    				angular.forEach($scope.dataset.Fields.sort(orderByAlpha), function(field){
						parseField(field, $scope);

						//mappable fields
						$scope.mappableFields.push(field);

						//setup the headers/details and datasheet fields
						if(field.FieldRoleId == FIELD_ROLE_HEADER)
						{
							$scope.fields.header.push(field);
							$scope.HeaderColDefs.push(makeFieldColDef(field, $scope));
						}
						else if(field.FieldRoleId == FIELD_ROLE_DETAIL)
						{
							$scope.fields.detail.push(field);
							$scope.DetailColDefs.push(makeFieldColDef(field, $scope));
						}

						//convention: if you have a readingdatetime field then we turn on our timezone magic
						if(field.DbColumnName == "ReadingDateTime")
						{
							$scope.ActivityFields.Timezone = getByField($scope.SystemTimezones, new Date().getTimezoneOffset() * -60000, "TimezoneOffset"); //set default timezone
						}

					});

    				//set defaults for header fields
					angular.forEach($scope.fields.header, function(headerfield){
						$scope.row[headerfield.DbColumnName] = (headerfield.DefaultValue) ? headerfield.DefaultValue : null;
					});

					//if we have more than 1 row qa status then show them.
		    		if($scope.dataset.RowQAStatuses.length > 1)
		    		{
		    			$scope.RowQAColDef.push(
				    	{
		    				field: "RowQAStatusId", //QARowStatus
		    				displayName: "Row QA",
		 					cellFilter: 'RowQAStatusFilter',
		 					enableCellEditOnFocus: true,
        					editableCellTemplate: $scope.cellRowQATemplate
		    			});
		    		}

				}

    		});


    		//$scope.$watch('UploadResults.activities', function(){
    		//	$scope.activity_count = array_count($scope.UploadResults.activities.activities);
    		//});

    		//set mapping fields to defaults
			$scope.$watch('fileFields', function(){
				if(Array.isArray($scope.fileFields))
				{
					if($scope.fileFields.length == 0)
					{
						$scope.uploadErrorMessage="No columns headers were found in the file. Please make sure the column headers are in the first row of your file and try again.";
						$scope.fileFields = undefined;
					}
					//TODO: get map candidates from the server. for now, if the field name matches a mappable field, set it, otherwise set to do not map.
					//TODO: refactor this to not have to spin so many times... but not a big deal i guess. ;)
					angular.forEach($scope.fileFields, function(field_in){
						var field_in_compare = field_in.toUpperCase();
						for (var i = $scope.mappableFields.length - 1; i >= 0; i--) {

							//Logger.debug("Comparing: " + $scope.mappableFields[i].Label.toUpperCase() + " and " + field_in_compare);

							if($scope.mappableFields[i].Label.toUpperCase() === field_in_compare)
							{
								$scope.mapping[field_in] = $scope.mappableFields[i];
								return;
							}
						};

						//only reaches here if we didn't find a label match
						$scope.mapping[field_in] = $scope.mappableFields[DO_NOT_MAP];

					});
				}
			});

			//control disabling and re-enabling special fields
			$scope.updateSpecialFields = function(field_name){
				console.log(">> "+field_name);

				//this is pretty ripe for refactoring.
				if($scope.mapping[field_name])
				{
					if($scope.mapping[field_name].Label === $scope.mappableFields[ACTIVITY_DATE].Label)
						$scope.mappedActivityFields[ACTIVITY_DATE] = field_name;

					else if($scope.mapping[field_name].Label === $scope.mappableFields[INDEX_FIELD].Label)
						$scope.mappedActivityFields[INDEX_FIELD] = field_name;
					/*
					else if($scope.mapping[field_name].Label === $scope.mappableFields[LOCATION_ID].Label)
						$scope.mappedActivityFields[LOCATION_ID] = field_name;
					*/
					else if($scope.mapping[field_name].Label === $scope.mappableFields[ROW_QA_STATUS_ID].Label)
						$scope.mappedActivityFields[ROW_QA_STATUS_ID] = field_name;
					
					else
					{
						//undisable corresponding speical field if this had been one
						if($scope.mappedActivityFields[ACTIVITY_DATE] === field_name)
							$scope.mappedActivityFields[ACTIVITY_DATE] = false;

						if($scope.mappedActivityFields[INDEX_FIELD] === field_name)
							$scope.mappedActivityFields[INDEX_FIELD] = false;

					/*
						if($scope.mappedActivityFields[LOCATION_ID] === field_name)
							$scope.mappedActivityFields[LOCATION_ID] = false;
						*/
						if($scope.mappedActivityFields[ROW_QA_STATUS_ID] === field_name)
							$scope.mappedActivityFields[ROW_QA_STATUS_ID] = false;
						
					}

				}


			};

			$scope.Logger = Logger;
			$scope.enablePreview = false;

			$scope.previewUpload = function()
			{
				$scope.errors = [];
				$scope.enablePreview = false;

				//validate mapping fields -- primarily: make sure there are selections for special fields
				if(!$scope.ActivityFields.LocationId)
				{
					//if($scope.mappedActivityFields[LOCATION_ID])
					//	$scope.ActivityFields.LocationId = $scope.mappedActivityFields[LOCATION_ID]
					//else
						$scope.errors.push("Please select an activity location.");
				}

				if($scope.mappedActivityFields[ACTIVITY_DATE])
					$scope.ActivityFields.ActivityDate = $scope.mappedActivityFields[ACTIVITY_DATE];

				if(!$scope.ActivityFields.ActivityDate)
				{
					$scope.errors.push("Please select an activity date or map a date source field.");
				}

				if(!$scope.ActivityFields.QAStatusId)
				{
					//if($scope.mappedActivityFields[QA_STATUS_ID])
					//	$scope.ActivityFields.QAStatusId = $scope.mappedActivityFields[QA_STATUS_ID]
					//else
						$scope.errors.push("Please select an activity QA Status.");
				}

				if($scope.errors.length == 0)
				{
					//execute upload
					Logger.debug("displaying preview...");
					$scope.displayImportPreview();
				}else{
					console.log("Doing nothing since there are errors");
					$scope.enablePreview = true;
				}
			}

			$scope.UploadResults.showPreview = false;

			//iterates the import data rows according to mappings and copies into the grid datasheet
			$scope.displayImportPreview = function()
			{

				//decide if we are going to show the headerForm.  we DO if they entered an activity date, DO NOT if they mapped it.
				if($scope.mappedActivityFields[ACTIVITY_DATE] || $scope.mappedActivityFields[INDEX_FIELD])
				{
					$scope.showHeaderForm = false; //because we have mapped the activity date field to our datafile, meaning multiple activity dates needs the wide sheet.
					$scope.datasheetColDefs =$scope.RowQAColDef.concat($scope.datasheetColDefs,$scope.HeaderColDefs, $scope.DetailColDefs);
				}
				else
				{
					$scope.showHeaderForm = true; //single activity, use the headerform.
					$scope.datasheetColDefs = $scope.RowQAColDef.concat($scope.DetailColDefs);
				}

				$scope.recalculateGridWidth($scope.datasheetColDefs.length);

				angular.forEach($scope.UploadResults.Data.rows, function(data_row){
					try{

						//set default Row QA StatusId
					var new_row = {
						RowQAStatusId: $scope.dataset.DefaultRowQAStatusId
					};

					//ActivityFields first
					//Logger.debug($scope.mapping[$scope.ActivityFields.LocationId]);

					if($scope.mapping[$scope.ActivityFields.LocationId])
						new_row.locationId = data_row[$scope.ActivityFields.LocationId];
					else
						new_row.locationId = $scope.ActivityFields.LocationId;

					if($scope.mapping[$scope.ActivityFields.ActivityDate])
						new_row.activityDate = data_row[$scope.ActivityFields.ActivityDate];
					else
						new_row.activityDate = $scope.ActivityFields.ActivityDate;

					if($scope.mapping[$scope.ActivityFields.QAStatusId])
						new_row.QAStatusId = data_row[$scope.ActivityFields.QAStatusId];
					else
						new_row.QAStatusId = $scope.ActivityFields.QAStatusId;

					if($scope.mappedActivityFields[INDEX_FIELD])
						new_row.activityIndex = data_row[$scope.mappedActivityFields[INDEX_FIELD]];



					//spin through and copy the values in for mapped fields
					angular.forEach($scope.mapping, function(field, col){
						try{
							if(field.Label != $scope.mappableFields[DO_NOT_MAP])
							{
								//just ditch if it is an empty value
								if(data_row[col] == null || data_row[col] == "")
									return;

								if(field.Label == $scope.mappableFields[ROW_QA_STATUS_ID].Label)
									new_row.RowQAStatusId = data_row[col];

								//check for numeric or ignore as blank if it isn't.
								if(field.ControlType == "number" && !isNumber(data_row[col]) )
								{
									console.log("ignoring: " + field.DbColumnName + " is a number field but value is not a number: " + data_row[col]);
									return; //don't set this as a value
								}

								//handle control types
								if(field.ControlType == "multiselect")
								{
									//$scope.Logger.debug("is a multiselect");
									//will create an array if needed
								    if(!Array.isArray(new_row[field.DbColumnName]))
								        new_row[field.DbColumnName] = [];

								    //split on commas -- if any
								    var row_items = data_row[col].trim().split(",");

								    for(var a = 0; a < row_items.length; a++)
								    {
								        var row_item = row_items[a].trim().toUpperCase();  //KBHERE -- take this off after the upgrade!

								        //$scope.Logger.debug(" on --> "+row_item);
								        if(new_row[field.DbColumnName].indexOf(row_item) == -1)
								            new_row[field.DbColumnName].push(row_item);

								        //$scope.Logger.debug(new_row[field.DbColumnName]);
								    }

								    //new_row[field.DbColumnName] = angular.toJson(new_row[field.DbColumnName]);
								    //$scope.Logger.debug("  AND our final multiselect value == ");
								    //$scope.Logger.debug(new_row[field.DbColumnName]);
								}
								else if(field.ControlType == "datetime")
								{
									try
									{
										if(data_row[col])
										{
											var d = new Date(data_row[col]);
											new_row[field.DbColumnName] = toExactISOString(d);
										}
									}
									catch(e)
									{
										console.log("problem converting date: " + data_row[col]);
										console.dir(e);
									}
								}
								else //just add the value to the cell
								{
									//set the value
									new_row[field.DbColumnName] = data_row[col]; //but don't uppercase anything that isn't a multiselect or select.

									//console.log(field.ControlType);
									//console.log(typeof data_row[col]);

									//$scope.Logger.debug("found a map value: " +new_row[field.DbColumnName]+" = "+data_row[col]);
									if(field.ControlType == "select" && data_row[col] && typeof data_row[col] == "string")
									{
										//console.log(" -- " + data_row[col].trim().toUpperCase());
										//if(typeof data_row == "string") //might otherwise be a number or something...
										new_row[field.DbColumnName] = data_row[col].trim().toUpperCase(); //uppercase select's too....  KBHERE
									}

								}

							}//if
						}catch(e){
							console.dir(e);
						}
					});

					//Appraisal special importer case - remove this once we're done the appraisal import!
					if($scope.dataset.Id == 1193)
					{
						$scope.importAppraisalLine(new_row);
					}

					//now that the row is populated with import values, lets spin through each filed again and fire any rules
					//* ---- Run the rules for each field on this row ---- *//
					var row = new_row;
					//console.log("Ok, now we'll run the rules for each column in this row");
					angular.forEach($scope.mapping, function(field, col){

						var value = row[field.DbColumnName];

						 try{
	                        //fire Field rule if it exists -- OnChange
	                        if(field.Field && field.Field.Rule && field.Field.Rule.OnChange){
	                        	//console.log("Firing master rule: " + field.Field.Rule.OnChange);
	                            eval(field.Field.Rule.OnChange);
	                        }

	                        //fire Datafield rule if it exists -- OnChange
	                        if(field.Rule && field.Rule.OnChange){
	                        	//console.log("Firing dataset rule: " + field.Rule.OnChange);
	                            eval(field.Rule.OnChange);
	                        }
	                    }catch(e){
	                        //so we don't die if the rule fails....
	                        console.dir(e);
	                    }

					});


					//last validation before we add row:
					// -- nothing so far.

					//add imported row to datasheet.
					if(new_row.activityDate)
						$scope.dataSheetDataset.push(new_row);

					}
					catch(e)
					{
						$scope.Logger.debug(e);
					}


		 		});

				$scope.UploadResults.showPreview = true;

				$scope.toggleDuplicates();

            	$scope.validateGrid($scope);
        		$scope.floatErrorsToTop();

        		ChartService.buildChart($scope, $scope.dataSheetDataset, $scope.dataset.Datastore.TablePrefix, {width: 800, height: 350});



			};



			$scope.uploadFile = function()
			{
				$scope.loading=true;
					console.log("serviceUrl = " + serviceUrl);
					console.log("project.Id = " + $scope.project.Id);
					console.log("startOnLine = " + $scope.startOnLine);
					console.log("file...");
					console.dir($scope.file);
			      $scope.upload = $upload.upload({
			        url: serviceUrl + '/data/UploadImportFile', //upload.php script, node.js route, or servlet url
			        method: "POST",
			        // headers: {'headerKey': 'headerValue'},
			        // withCredential: true,
			        data: {ProjectId: $scope.project.Id, StartOnLine: $scope.startOnLine},
			        file: $scope.file,
			        // file: $files, //upload multiple files, this feature only works in HTML5 FromData browsers
			        /* set file formData name for 'Content-Desposition' header. Default: 'file' */
			        //fileFormDataName: myFile, //OR for HTML5 multiple upload only a list: ['name1', 'name2', ...]
			        /* customize how data is added to formData. See #40#issuecomment-28612000 for example */
			        //formDataAppender: function(formData, key, val){}
			      }).progress(function(evt) {
			        Logger.debug('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
			      }).success(function(data) {
			        // file is uploaded successfully

			        $scope.UploadResults.Data = angular.fromJson(data);
			        $scope.fileFields = $scope.UploadResults.Data.columns;
			        $scope.loading=false;
			        $scope.enablePreview = true;
			      })
			      .error(function(data)
			      	{
			      		$scope.uploadErrorMessage = "There was a problem uploading your file.  Please try again or contact the Helpdesk if this issue continues.";
			      		console.log("$scope.upload next...");
						console.dir($scope.upload);
						$scope.loading=false;
			      	});
			      //.then(success, error, progress);
			};


			$scope.onFileSelect = function($files) {
			    //$files: an array of files selected, each file has name, size, and type.

			    $scope.files = $files;
			    $scope.file = $files[0];

			 };

			 $scope.cancel = function(){
			 	if($scope.UploadResults.showPreview)
			 	{
				 	if(!confirm("Looks like you've made changes.  Are you sure you want to leave this page?"))
				 		return;
				 }

				$location.path("/activities/"+$scope.dataset.Id);
			 };

			 $scope.doneButton = function(){
			 	$scope.activities = undefined;
			 	$route.reload();
			 };

			 $scope.viewButton = function(){
			 	$location.path("/activities/"+$scope.dataset.Id);
			 }

			$scope.saveDataSheet = function() {

				if($scope.gridHasErrors)
				{
					if(!confirm("There are validation errors.  Are you sure you want to save anyway?"))
						return;
				}

				//prepare dataset for saving -- add defaultrowqastatusid, move activityqastatusid
				for (var i = 0; i < $scope.dataSheetDataset.length; i++) {
					var row = $scope.dataSheetDataset[i];

					if($scope.showHeaderForm)
						row = angular.extend(row, $scope.row, $scope.ActivityFields); // copy in the header fields...  //TODO: might be nicer to pass into parseActivitySheet below...

					//copy in the selected qastatus (default was set above)
					row.ActivityQAStatus = {
	        			QAStatusId: ""+row.QAStatusId,
	        			Comments: row.QAComments
	        		};

	        		row.QAStatusId = row.RowQAStatusId;

				}

				//var sheetCopy = angular.copy($scope.dataSheetDataset); //causes memory problems on IE for large files.
	            $scope.activities = ActivityParser.parseActivitySheet($scope.dataSheetDataset, $scope.fields);
	            
	            if(!$scope.activities.errors)
	            {				
	                DataService.saveActivities($scope.userId, $scope.dataset.Id, $scope.activities);
	            }

			};

	    	$scope.openDuplicatesModal = function(){
				var modalInstance = $modal.open({
					templateUrl: 'partials/modals/viewduplicates-modal.html',
					controller: 'ModalDuplicatesViewCtrl',
					scope: $scope, //very important to pass the scope along... -- TODO: but we don't want to pass in the whole $scope...
					//resolve: { files: function() { return $scope.files; } }
				});
	    	};

	    	//this is for custom import of appraisals
	    	$scope.importAppraisalLine = function(row){
	    		//console.dir(row);
	    		//console.log('starting: '+row['Allotment']);
				//1) create location query and lookup TSR and SDEOBJECTID by parcelid
				$scope.map.queryMatchParcel(row['Allotment'], function(features){
					//console.log("back from query!");
					if(features.length == 0)
                    {
                        console.log("didn't find parcelid: "+row['Allotment']);
                    }
                    else
                    {
                    	//console.dir(features[0].attributes['OBJECTID']);
                    	//console.dir(features[0].attributes['TSR']);
                    	var tsr = features[0].attributes['TSR'];
                    	if(tsr)
                    		tsr = tsr.replace("adminstration","admin");
                    	row.TSRFiles = '[{"Name":"View TSR","Link":"'+tsr+'"}]';

                    	//set some specific defaults -- this is a one-time thing (famous last words)
                    	row.AppraisalYear = '2014';
						row.AppraisalType = 'Land Buy Back';
						row.Appraiser = 'David Nicholson';

                    	// Wave 1
                    	//row.CobellAppraisalWave = 'Wave 1';
                    	//row.AppraisalStatus = 'Complete';
                    	//row.AllotmentStatus = 'Submitted to Regional Office';

                    	//other waves
                    	row.CobellAppraisalWave = 'Wave 3';
                    	row.AppraisalStatus = 'Not Started';
                    	row.AllotmentStatus = 'Requested';
                    	
                    	var map_loc = '//gis.ctuir.org/DECD/Appraisals/maps/Round_Basemaps_DECD_';
                    	row.MapFiles = '[{"Name":"Imagery","Link":"'+map_loc+'Imagery_'+row['Allotment']+'.pdf"},{"Name":"Plat","Link":"'+map_loc+'Plat_'+row['Allotment']+'.pdf"},{"Name":"Soils","Link":"'+map_loc+'Soils_'+row['Allotment']+'.pdf"},{"Name":"Topo","Link":"'+map_loc+'Topo_'+row['Allotment']+'.pdf"},{"Name":"Zoning","Link":"'+map_loc+'Zoning_'+row['Allotment']+'.pdf"}]';
                    	
                    	row.LastAppraisalRequestDate = new Date();

                    	row.Acres = features[0].attributes['ACRES_GIS'];

                    	//create a new location from the map feature selected
		                var new_location = {
		                    LocationTypeId: LOCATION_TYPE_APPRAISAL,
		                    SdeFeatureClassId: SDE_FEATURECLASS_TAXLOTQUERY,
		                    SdeObjectId: features[0].attributes['OBJECTID'],
		                    Label: features[0].attributes['PARCELID'],
		                };

		                var promise = DatastoreService.saveNewProjectLocation($scope.project.Id, new_location);
		                promise.$promise.then(function(location_data){
		                   //console.log("done and success!");
		                   //console.dir(location_data);
		                   row.locationId = location_data.Id;
		               });
                    }
				});
				//2) create new location (with sdeobjectid)


				//3) set new location in row
				//4) set tsr in row
				//5) create map links in row

			}

	    }
]);


mod_di.controller('ModalDuplicatesViewCtrl', ['$scope','$modalInstance',
	function($scope, $modalInstance){

		$scope.gridDuplicates = {
			data: 'DuplicateRecordsBucket',
			columnDefs: [{
				   field: 'locationId',
                    displayName: 'Location',
                    cellFilter: 'locationNameFilter'
                },
                {
                    field: 'activityDate',
                    displayName: 'Activity Date',
                    cellFilter: 'date: \'MM/dd/yyyy\'',
                }],
		};

		$scope.ok = function(){
			$modalInstance.dismiss();
		};

	}
]);
