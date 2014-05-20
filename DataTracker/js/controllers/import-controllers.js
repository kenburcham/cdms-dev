//import-controllers
// ken burcham 2/2014
'use strict';

var mod_di = angular.module('DataImportControllers', ['ui.bootstrap']);

//"constants" of indexes to the mappableFields array
// note: we did have to hard-code these on the dataset-import.html page in ng-disabled attrbutes
var DO_NOT_MAP = 0;
var ACTIVITY_DATE = 1;

var DEFAULT_IMPORT_QACOMMENT = "Initial Import";

var USE_FAKE_DATA = false;
var USE_FAKE_COLS = false;

mod_di.controller("DatasetImportCtrl", ['$scope','$routeParams','DataService','$location', 'ActivityQAStatusesConstant','$upload','ActivityParser','DataSheet', '$rootScope', 'Logger','$route','$modal',
    	function($scope, $routeParams, DataService, $location, QAActivityStatuses, $upload, ActivityParser, DataSheet, $rootScope, Logger,$route, $modal) {
    		$scope.QAActivityStatuses = QAActivityStatuses;
    		$scope.dataset = DataService.getDataset($routeParams.Id);    			
			$scope.mappedActivityFields = {};
			$scope.userId = $rootScope.Profile.Id;
			$scope.headerFields = [];
			$scope.detailFields = [];
			$scope.dataSheetDataset = [];
			
			$scope.existingActivitiesLoad = DataService.getActivities($routeParams.Id);
			$scope.existingActivities = [];

			$scope.ActivityFields = {};

			//set locationid if it is incoming as a query param (?LocationId=142)
    		if($routeParams.LocationId)
    			$scope.ActivityFields.LocationId = $routeParams.LocationId;

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
				
				/*
				{
					Label: "[-- Location Id --]"
				},
				
				{
					Label: "[-- QA Row Status Id --]"
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

	        	//setup locationOptions dropdown
				$scope.locationOptions = $rootScope.locationOptions = makeObjects(getMatchingByField($scope.project.Locations,2,"LocationTypeId"), 'Id','Label') ;

				//setup location field to participate in validation 
				$scope.FieldLookup['locationId'] = { DbColumnName: 'locationId', ControlType: "select" };
				$scope.CellOptions['locationIdOptions'] = $scope.locationOptions;
					
	        });

			//setup our existingActivities array so we can manage duplicates
	        var ealoadwatcher = $scope.$watch('existingActivitiesLoad.length', function(){
	        	if($scope.existingActivitiesLoad.length > 0)
	        	{
	        		$scope.existingActivitiesLoad.$promise.then(function(){
	        			angular.forEach($scope.existingActivitiesLoad, function(activity, key){
	        				$scope.existingActivities.push(activity.LocationId+"_"+activity.ActivityDate.substr(0,10));
	        			});
	        			$scope.existingActivitiesLoad = []; // cleanup
	        			console.dir($scope.existingActivities);
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
				$scope.ActivityFields.LastAccuracyCheck = $scope.viewInstrument.AccuracyChecks[$scope.viewInstrument.AccuracyChecks.length-1];
				$scope.ActivityFields.DataGradeText = getDataGrade($scope.ActivityFields.LastAccuracyCheck) ;
			};

			$scope.toggleDuplicates = function(){

				try{
					if($scope.ignoreDuplicates)
					{
						$scope.TempRecordsBucket = [];
						$scope.DuplicateRecordsBucket = [];
						angular.forEach($scope.dataSheetDataset, function(item, key){
							//console.dir(item);
							if($scope.existingActivities.indexOf(item.locationId + "_"+item.activityDate.substr(0,10)) != -1) //found a duplicate
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
		        enableRowSelection: false,
		        enableCellEdit: true,
		        columnDefs: 'datasheetColDefs',
		        enableColumnResize: true,
 				
			};

            //config the fields for the preview datasheet - include mandatory location and activityDate fields
			$scope.datasheetColDefs = DataSheet.getColDefs();
			DataSheet.initScope($scope);

			//setup our mappableFields list
    		$scope.$watch('dataset.Name', function(){
    			if($scope.dataset.Fields)
    			{
					$scope.project = DataService.getProject($scope.dataset.ProjectId);

					$scope.QAStatusOptions = $rootScope.QAStatusOptions = makeObjects($scope.dataset.QAStatuses, 'Id','Name');
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
						if(field.FieldRoleId == 1)
							$scope.headerFields.push(field);
						else
							$scope.detailFields.push(field);

						//setup grid editing features and define as a grid field
	    				$scope.datasheetColDefs.push(makeFieldColDef(field, $scope));
	    				
					});
				}

				if(USE_FAKE_DATA || USE_FAKE_COLS)
				{
					//fake our fields
					Logger.debug("Using fake cols");
					$scope.fileFields = ["Fishno","Date","Sex","Maturity","Clip","FLmm","FLcm","Sc#","Gen#","OP","Oto#","Disp","Origin","Comments","PIT"];

					if(USE_FAKE_DATA)
					{
						Logger.debug("Using fake data");
						$scope.dataSheetDataset = getData();
						$scope.UploadResults = getResults();
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
					
					/*
					else if($scope.mapping[field_name].Label === $scope.mappableFields[LOCATION_ID].Label)
						$scope.mappedActivityFields[LOCATION_ID] = field_name;
					
					else if($scope.mapping[field_name].Label === $scope.mappableFields[QA_STATUS_ID].Label)
						$scope.mappedActivityFields[QA_STATUS_ID] = field_name;
					*/
					else
					{
						//undisable corresponding speical field if this had been one
						if($scope.mappedActivityFields[ACTIVITY_DATE] === field_name)
							$scope.mappedActivityFields[ACTIVITY_DATE] = false;
					
					/*
						if($scope.mappedActivityFields[LOCATION_ID] === field_name)
							$scope.mappedActivityFields[LOCATION_ID] = false;
						if($scope.mappedActivityFields[QA_STATUS_ID] === field_name)
							$scope.mappedActivityFields[QA_STATUS_ID] = false;
						*/
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

				if(!$scope.ActivityFields.ActivityDate)
				{
					if($scope.mappedActivityFields[ACTIVITY_DATE])
						$scope.ActivityFields.ActivityDate = $scope.mappedActivityFields[ACTIVITY_DATE]
					else
						$scope.errors.push("Please select an activity date or map a date source field.");
				}

				if(!$scope.ActivityFields.QAStatusId)
				{
					//if($scope.mappedActivityFields[QA_STATUS_ID])
					//	$scope.ActivityFields.QAStatusId = $scope.mappedActivityFields[QA_STATUS_ID]
					//else
						$scope.errors.push("Please select a activity QA Status.");
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

				console.log("Display Import Preview!");

				angular.forEach($scope.UploadResults.Data.rows, function(data_row){
					try{
					var new_row = {};

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



					//spin through and copy the values in for mapped fields
					angular.forEach($scope.mapping, function(field, col){
						try{
						if(field.Label != $scope.mappableFields[DO_NOT_MAP])
						{
							//just ditch if it is an empty value
							if(data_row[col] == null || data_row[col] == "")
								return;

							//check for numeric or ignore as blank if it isn't.
							if(field.ControlType == "number")
							{
								if(!isNumber(data_row[col]))
								{
									console.log("ignoring: " + field.DbColumnName + " is a number field but value is not a number: " + data_row[col]);
									return; //don't set this as a value
								}
								//else
								//	console.log("is numeric and value is too." + field.DbColumnName);
							}

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
							        var row_item = row_items[a].trim().toUpperCase();
							        //$scope.Logger.debug(" on --> "+row_item);
							        if(new_row[field.DbColumnName].indexOf(row_item) == -1)
							            new_row[field.DbColumnName].push(row_item);

							        //$scope.Logger.debug(new_row[field.DbColumnName]);
							    }

							    //new_row[field.DbColumnName] = angular.toJson(new_row[field.DbColumnName]);
							    //$scope.Logger.debug("  AND our final multiselect value == ");
							    //$scope.Logger.debug(new_row[field.DbColumnName]);
							}
							else //just add the value to the cell
							{
								//set the value
								new_row[field.DbColumnName] = data_row[col]; //but don't uppercase anything that isn't a multiselect or select.

								//$scope.Logger.debug("found a map value: " +new_row[field.DbColumnName]+" = "+data_row[col]);
								if(field.ControlType == "select" && data_row[col])
									new_row[field.DbColumnName] = data_row[col].trim().toUpperCase(); //uppercase select's too....
								
							}

							//set our rule context up
							var value = data_row[col];
							var row = new_row;

							//Fire update rules (the validation ones already run)
							 try{
		                        //fire Field rule if it exists -- OnChange
		                        if(field.Field && field.Field.Rule && field.Field.Rule.OnChange){
		                            eval(field.Field.Rule.OnChange);
		                        }

		                        //fire Datafield rule if it exists -- OnChange
		                        if(field.Rule && field.Rule.OnChange){
		                            eval(field.Rule.OnChange);
		                        }
		                    }catch(e){
		                        //so we don't die if the rule fails....
		                        console.dir(e);
		                    }

						}//if
						}catch(e){
							console.dir(e);
						}
					});

					//validation before we add row
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
        
				

			};

			$scope.uploadFile = function()
			{
				$scope.loading=true;
			      $scope.upload = $upload.upload({
			        url: '/services/data/UploadImportFile', //upload.php script, node.js route, or servlet url
			        method: "POST",
			        // headers: {'headerKey': 'headerValue'},
			        // withCredential: true,
			        data: {ProjectId: $scope.project.Id},
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

			$scope.saveDataSheet = function() {

				//prepare dataset for saving -- add defaultrowqastatusid, move activityqastatusid
				for (var i = 0; i < $scope.dataSheetDataset.length; i++) {
					var row = $scope.dataSheetDataset[i];

					//copy in the selected qastatus (default was set above)
					row.ActivityQAStatus = {
	        			QAStatusId: ""+row.QAStatusId,
	        			Comments: DEFAULT_IMPORT_QACOMMENT,
	        		};

	        		//set our default rowqastatusid to be what is defined in the dataset definition
	        		row.QAStatusId = $scope.dataset.DefaultRowQAStatusId;

				}

	            $scope.activities = ActivityParser.parseActivitySheet($scope.dataSheetDataset, $scope.headerFields, $scope.detailFields);
	            if(!$scope.activities.errors)
	            {
	                DataService.saveActivities($scope.userId, $scope.dataset.Id, $scope.activities);
	            }

			};

	    	$scope.openDuplicatesModal = function(){
				var modalInstance = $modal.open({
					templateUrl: 'partials/viewduplicates-modal.html',
					controller: 'ModalDuplicatesViewCtrl',
					scope: $scope, //very important to pass the scope along... -- TODO: but we don't want to pass in the whole $scope...
					//resolve: { files: function() { return $scope.files; } }
				});
	    	};

	    }
]);


function getResults()
{	
	return {"showPreview":true,"Data":{"columns":["Fishno","Date","Sex","Maturity","Clip","FLmm","FLcm","Sc#","Gen#","OP","Oto#","Disp","Origin","Comments","PIT"],"rows":[{"Fishno":3,"Date":"2013-03-27T00:00:00","Sex":"F","Maturity":"G","Clip":"None","FLmm":700,"FLcm":70,"Sc#":3,"Gen#":3,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":null,"PIT":null},{"Fishno":4,"Date":"2013-03-29T00:00:00","Sex":"F","Maturity":"G","Clip":"None","FLmm":670,"FLcm":67,"Sc#":4,"Gen#":4,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":null,"PIT":null},{"Fishno":7,"Date":"2013-04-01T00:00:00","Sex":"F","Maturity":"G","Clip":"None","FLmm":647,"FLcm":64,"Sc#":7,"Gen#":7,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":null,"PIT":null},{"Fishno":8,"Date":"2013-04-01T00:00:00","Sex":"F","Maturity":"G","Clip":"None","FLmm":675,"FLcm":67,"Sc#":8,"Gen#":null,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":"Lost Genetic sample","PIT":null},{"Fishno":10,"Date":"2013-04-03T00:00:00","Sex":"F","Maturity":"G","Clip":"None","FLmm":670,"FLcm":67,"Sc#":10,"Gen#":10,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":"Bad Reye","PIT":null},{"Fishno":12,"Date":"2013-04-03T00:00:00","Sex":"F","Maturity":"G","Clip":"None","FLmm":695,"FLcm":69,"Sc#":12,"Gen#":12,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":null,"PIT":null},{"Fishno":13,"Date":"2013-04-15T00:00:00","Sex":"F","Maturity":"R","Clip":"None","FLmm":685,"FLcm":68,"Sc#":13,"Gen#":13,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":null,"PIT":null},{"Fishno":14,"Date":"2013-04-22T00:00:00","Sex":"F","Maturity":"G","Clip":"None","FLmm":700,"FLcm":70,"Sc#":14,"Gen#":14,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":null,"PIT":null},{"Fishno":21,"Date":"2013-04-29T00:00:00","Sex":"F","Maturity":"G","Clip":"None","FLmm":570,"FLcm":57,"Sc#":21,"Gen#":21,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":null,"PIT":null},{"Fishno":20,"Date":"2013-04-29T00:00:00","Sex":"F","Maturity":"G","Clip":"None","FLmm":590,"FLcm":59,"Sc#":20,"Gen#":20,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":null,"PIT":null},{"Fishno":22,"Date":"2013-04-29T00:00:00","Sex":"F","Maturity":"G","Clip":"None","FLmm":625,"FLcm":62,"Sc#":22,"Gen#":22,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":null,"PIT":null},{"Fishno":23,"Date":"2013-04-29T00:00:00","Sex":"F","Maturity":"G","Clip":"None","FLmm":655,"FLcm":65,"Sc#":23,"Gen#":23,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":null,"PIT":null},{"Fishno":15,"Date":"2013-04-29T00:00:00","Sex":"F","Maturity":"G","Clip":"None","FLmm":665,"FLcm":66,"Sc#":15,"Gen#":15,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":null,"PIT":null},{"Fishno":18,"Date":"2013-04-29T00:00:00","Sex":"F","Maturity":"G","Clip":"None","FLmm":670,"FLcm":67,"Sc#":18,"Gen#":18,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":null,"PIT":null},{"Fishno":16,"Date":"2013-04-29T00:00:00","Sex":"F","Maturity":"G","Clip":"None","FLmm":680,"FLcm":68,"Sc#":16,"Gen#":16,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":null,"PIT":null},{"Fishno":24,"Date":"2013-04-29T00:00:00","Sex":"F","Maturity":"G","Clip":"None","FLmm":715,"FLcm":71,"Sc#":24,"Gen#":24,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":null,"PIT":null},{"Fishno":27,"Date":"2013-05-03T00:00:00","Sex":"F","Maturity":"G","Clip":"None","FLmm":544,"FLcm":54,"Sc#":27,"Gen#":27,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":null,"PIT":null},{"Fishno":1,"Date":"2013-03-13T00:00:00","Sex":"M","Maturity":"G","Clip":"None","FLmm":685,"FLcm":68,"Sc#":1,"Gen#":1,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":null,"PIT":null},{"Fishno":2,"Date":"2013-03-15T00:00:00","Sex":"M","Maturity":"R","Clip":"None","FLmm":575,"FLcm":57,"Sc#":2,"Gen#":2,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":"No PIT","PIT":null},{"Fishno":5,"Date":"2013-03-29T00:00:00","Sex":"M","Maturity":"G","Clip":"None","FLmm":525,"FLcm":52,"Sc#":5,"Gen#":5,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":null,"PIT":null},{"Fishno":9,"Date":"2013-04-01T00:00:00","Sex":"M","Maturity":"G","Clip":"None","FLmm":690,"FLcm":69,"Sc#":9,"Gen#":9,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":null,"PIT":null},{"Fishno":6,"Date":"2013-04-01T00:00:00","Sex":"M","Maturity":"G","Clip":"None","FLmm":730,"FLcm":73,"Sc#":6,"Gen#":6,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":null,"PIT":null},{"Fishno":11,"Date":"2013-04-03T00:00:00","Sex":"M","Maturity":"G","Clip":"None","FLmm":730,"FLcm":73,"Sc#":11,"Gen#":11,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":null,"PIT":null},{"Fishno":25,"Date":"2013-04-29T00:00:00","Sex":"M","Maturity":"G","Clip":"None","FLmm":564,"FLcm":56,"Sc#":25,"Gen#":25,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":null,"PIT":null},{"Fishno":17,"Date":"2013-04-29T00:00:00","Sex":"M","Maturity":"R","Clip":"None","FLmm":710,"FLcm":71,"Sc#":17,"Gen#":17,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":null,"PIT":null},{"Fishno":19,"Date":"2013-04-29T00:00:00","Sex":"M","Maturity":"R","Clip":"None","FLmm":725,"FLcm":72,"Sc#":19,"Gen#":19,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":null,"PIT":null},{"Fishno":26,"Date":"2013-05-03T00:00:00","Sex":"M","Maturity":"R","Clip":"None","FLmm":680,"FLcm":68,"Sc#":26,"Gen#":26,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":null,"PIT":null},{"Fishno":28,"Date":"2013-05-06T00:00:00","Sex":"M","Maturity":"R","Clip":"None","FLmm":620,"FLcm":62,"Sc#":28,"Gen#":28,"OP":"1ROP","Oto#":null,"Disp":"PU","Origin":"Wild","Comments":"Headburn, no PIT tag","PIT":null}]},"errors":{},"activities":{"activities":{"1_2013-03-27T00:00:00":{"locationId":"75","ActivityDate":"2013-03-27T00:00:00.000Z","Header":{},"Details":[{"locationId":"75","activityDate":"2013-03-27T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"F","Origin":"Wild","FishComments":null}]},"1_2013-03-29T00:00:00":{"locationId":"75","ActivityDate":"2013-03-29T00:00:00.000Z","Header":{},"Details":[{"locationId":"75","activityDate":"2013-03-29T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"F","Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-03-29T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"M","Origin":"Wild","FishComments":null}]},"1_2013-04-01T00:00:00":{"locationId":"75","ActivityDate":"2013-04-01T00:00:00.000Z","Header":{},"Details":[{"locationId":"75","activityDate":"2013-04-01T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"F","Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-01T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"F","Origin":"Wild","FishComments":"Lost Genetic sample"},{"locationId":"75","activityDate":"2013-04-01T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"M","Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-01T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"M","Origin":"Wild","FishComments":null}]},"1_2013-04-03T00:00:00":{"locationId":"75","ActivityDate":"2013-04-03T00:00:00.000Z","Header":{},"Details":[{"locationId":"75","activityDate":"2013-04-03T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"F","Origin":"Wild","FishComments":"Bad Reye"},{"locationId":"75","activityDate":"2013-04-03T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"F","Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-03T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"M","Origin":"Wild","FishComments":null}]},"1_2013-04-15T00:00:00":{"locationId":"75","ActivityDate":"2013-04-15T00:00:00.000Z","Header":{},"Details":[{"locationId":"75","activityDate":"2013-04-15T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"F","Origin":"Wild","FishComments":null}]},"1_2013-04-22T00:00:00":{"locationId":"75","ActivityDate":"2013-04-22T00:00:00.000Z","Header":{},"Details":[{"locationId":"75","activityDate":"2013-04-22T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"F","Origin":"Wild","FishComments":null}]},"1_2013-04-29T00:00:00":{"locationId":"75","ActivityDate":"2013-04-29T00:00:00.000Z","Header":{},"Details":[{"locationId":"75","activityDate":"2013-04-29T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"F","Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-29T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"F","Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-29T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"F","Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-29T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"F","Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-29T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"F","Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-29T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"F","Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-29T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"F","Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-29T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"F","Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-29T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"M","Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-29T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"M","Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-29T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"M","Origin":"Wild","FishComments":null}]},"1_2013-05-03T00:00:00":{"locationId":"75","ActivityDate":"2013-05-03T00:00:00.000Z","Header":{},"Details":[{"locationId":"75","activityDate":"2013-05-03T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"F","Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-05-03T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"M","Origin":"Wild","FishComments":null}]},"1_2013-03-13T00:00:00":{"locationId":"75","ActivityDate":"2013-03-13T00:00:00.000Z","Header":{},"Details":[{"locationId":"75","activityDate":"2013-03-13T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"M","Origin":"Wild","FishComments":null}]},"1_2013-03-15T00:00:00":{"locationId":"75","ActivityDate":"2013-03-15T00:00:00.000Z","Header":{},"Details":[{"locationId":"75","activityDate":"2013-03-15T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"M","Origin":"Wild","FishComments":"No PIT"}]},"1_2013-05-06T00:00:00":{"locationId":"75","ActivityDate":"2013-05-06T00:00:00.000Z","Header":{},"Details":[{"locationId":"75","activityDate":"2013-05-06T00:00:00","QAStatusId":"Approved","undefined":null,"Sex":"M","Origin":"Wild","FishComments":"Headburn, no PIT tag"}]}},"errors":false}};
}

function getData()
{
	return [{"locationId":"75","activityDate":"2013-03-27T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"F","ForkLength":170,"GeneticSampleId":3,"Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-03-29T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"F","ForkLength":167,"GeneticSampleId":4,"Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-01T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"F","ForkLength":166,"GeneticSampleId":7,"Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-01T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"F","ForkLength":167,"GeneticSampleId":null,"Origin":"Wild","FishComments":"Lost Genetic sample"},{"locationId":"75","activityDate":"2013-04-03T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"F","ForkLength":167,"GeneticSampleId":10,"Origin":"Wild","FishComments":"Bad Reye"},{"locationId":"75","activityDate":"2013-04-03T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"F","ForkLength":169,"GeneticSampleId":12,"Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-15T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"F","ForkLength":18,"GeneticSampleId":13,"Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-22T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"F","ForkLength":170,"GeneticSampleId":14,"Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-29T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"F","ForkLength":157,"GeneticSampleId":21,"Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-29T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"F","ForkLength":159,"GeneticSampleId":20,"Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-29T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"F","ForkLength":162,"GeneticSampleId":22,"Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-29T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"F","ForkLength":165,"GeneticSampleId":23,"Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-29T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"F","ForkLength":166,"GeneticSampleId":15,"Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-29T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"F","ForkLength":167,"GeneticSampleId":18,"Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-29T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"F","ForkLength":168,"GeneticSampleId":16,"Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-29T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"F","ForkLength":171,"GeneticSampleId":24,"Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-05-03T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"F","ForkLength":154,"GeneticSampleId":27,"Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-03-13T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"M","ForkLength":168,"GeneticSampleId":1,"Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-03-15T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"M","ForkLength":157,"GeneticSampleId":2,"Origin":"Wild","FishComments":"No PIT"},{"locationId":"75","activityDate":"2013-03-29T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"M","ForkLength":152,"GeneticSampleId":5,"Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-01T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"M","ForkLength":169,"GeneticSampleId":9,"Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-01T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"M","ForkLength":173,"GeneticSampleId":6,"Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-03T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"M","ForkLength":173,"GeneticSampleId":11,"Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-29T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"M","ForkLength":156,"GeneticSampleId":25,"Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-29T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"M","ForkLength":171,"GeneticSampleId":17,"Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-04-29T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"M","ForkLength":172,"GeneticSampleId":19,"Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-05-03T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"M","ForkLength":168,"GeneticSampleId":26,"Origin":"Wild","FishComments":null},{"locationId":"75","activityDate":"2013-05-06T00:00:00","QAStatusId":"Ready for QA","undefined":null,"Sex":"M","ForkLength":162,"GeneticSampleId":28,"Origin":"Wild","FishComments":"Headburn, no PIT tag"}];
}


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

