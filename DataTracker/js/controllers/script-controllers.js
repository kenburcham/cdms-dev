//Data Entry Controller
'use strict';

var mod_script = angular.module('ScriptControllers', ['ui.bootstrap']);

mod_script.controller('ScriptletController', ['$scope','$upload', 'DataService','DatastoreService','ActivityParser',
  function($scope, $upload,  DataService, DatastoreService,ActivityParser){

  		$scope.project = { Id: "2246" }; // default to the DECD project id 
  		$scope.dataset = DataService.getDataset(1193); 
  		$scope.startOnLine = 1;
  		$scope.uploadResults = {};
  		$scope.loading = false;
  		$scope.fields = {};

  		//setup a listener to populate datasetfields
		$scope.$watch('dataset.Fields', function() { 
			if(!$scope.dataset.Fields ) return;
			//load our project based on the projectid we get back from the dataset
        	$scope.project = DataService.getProject($scope.dataset.ProjectId);
			
        	$scope.QAStatusOptions = $rootScope.QAStatusOptions = makeObjects($scope.dataset.QAStatuses, 'Id','Name');

			//iterate the fields of our dataset and populate our grid columns
			angular.forEach($scope.dataset.Fields.sort(orderByIndex), function(field){
				parseField(field, $scope);
				
				if(field.FieldRoleId == FIELD_ROLE_HEADER)
				{
					$scope.fields.header.push(field);
					$scope.datasheetColDefs.push(makeFieldColDef(field, $scope));
				}
				else if(field.FieldRoleId == FIELD_ROLE_DETAIL)
				{
					$scope.fields.detail.push(field);
    				$scope.datasheetColDefs.push(makeFieldColDef(field, $scope));
				}
				
    		});
		});


		$scope.uploadFile = function()
		{
			console.log("loading file.");	

			$scope.loading=true;
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
		        //Logger.debug('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
		      }).success(function(data) {
		        // file is uploaded successfully
		        console.log("Success!");
		        $scope.uploadResults.Data = angular.fromJson(data);
		        $scope.fileFields = $scope.uploadResults.Data.columns;
		        $scope.loading=false;
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

		$scope.doDECDUpdate = function()
		{
			console.log("starting update");

			var updatedActivities = [];

			//query.results will be the .. uh results.
			$scope.query = { criteria: {DatasetId: $scope.dataset.Id, Fields: [], Locations: "[\"all\"]", QAStatusId: "all"} } ;

			//fetch current records via query
			DataService.queryActivities($scope.query);

			$scope.$watch('query.results', function(){
				if(!$scope.query.results)
					return;

				console.dir($scope.query.results);

				var datasheet = "";

				console.log("spinning through...");
				angular.forEach($scope.uploadResults.Data.rows, function(incoming){
					//console.dir(incoming);
					//spin through our upload data and match up with existing activity.  Use parcelId
					//if(incoming["Allotment:"] == "C3")
					angular.forEach($scope.query.results, function(existing){
						if(existing.Allotment == incoming["Allotment:"] && existing.Value != incoming["Value:"])
						{
							datasheet += "INSERT INTO Appraisal_Details (AppraisalYear, AppraisalFiles, AppraisalPhotos, AppraisalComments, AppraisalStatus, RowId, RowStatusId, ActivityId, ByUserId, QAStatusId, EffDt, AppraisalType, AppraisalLogNumber, AppraisalValue, AppraisalValuationDate, Appraiser, TypeOfTransaction, PartiesInvolved, AppraisalProjectType)";
							datasheet += "VALUES ("; 
							if(!existing.AppraisalYear)
								datasheet += "null,";
							else
								datasheet += "'" + existing.AppraisalYear + "',";
							
							if(!existing.AppraisalFiles)
								datasheet += "null,";
							else
								datasheet += "'" + existing.AppraisalFiles + "',";
							
							if(!existing.AppraisalPhotos)
								datasheet += "null,";
							else
								datasheet += "'" + existing.AppraisalPhotos + "',";
							
							if(!existing.AppraisalComments)
								datasheet += "null,";
							else
								datasheet += "'" + existing.AppraisalComments + "',";

							if(!existing.AppraisalStatus)
									datasheet += "null,";
							else
								datasheet += "'" + existing.AppraisalStatus + "',";
							
							datasheet += existing.RowId + ",";
							datasheet += existing.RowStatusId + ",";
							datasheet += existing.ActivityId + ",";
							datasheet += "1,";
							datasheet += existing.QAStatusId + ",";
							datasheet += "'" + "2014-11-03 2:30 PM" + "',";
							
							if(!existing.AppraisalType)
								datasheet += "null,";
							else
								datasheet += "'" + existing.AppraisalType + "',";
							
							if(!existing.AppraisalLogNumber)
								datasheet += "null,";
							else
								datasheet += "'" + existing.AppraisalLogNumber + "',";
							
							datasheet += "'" + incoming["Value:"] + "',";
							datasheet += "'" + incoming["Date of Value:"] + "',";
							datasheet += "'" + existing.Appraiser + "',";
							
							if(!existing.TypeOfTransaction)
								datasheet += "null,";
							else
								datasheet += "'" + existing.TypeOfTransaction + "',";
							
							if(!existing.PartiesInvolved)
								datasheet += "null,";
							else
								datasheet += "'" + existing.PartiesInvolved + "',";
							
							datasheet += "'" + existing.AppraisalProjectType + "')\n\n";
							


						}
					});
				});	

	            //$scope.activities = ActivityParser.parseActivitySheet(datasheet, $scope.fields);
	            
	            /*
	            if(!$scope.activities.errors)
	            {
	                var promise = DataService.saveActivities($scope.userId, $scope.dataset.Id, $scope.activities);
	                promise.$promise.then(function(){
	                	$scope.new_activity = $scope.activities.new_records;
	                });
	            }
	            */
	            $scope.activities = datasheet;
	            console.log("done!");

			});
			
		};
			
  }]);

	