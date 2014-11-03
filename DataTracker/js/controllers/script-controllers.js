//Data Entry Controller
'use strict';

var mod_script = angular.module('ScriptControllers', ['ui.bootstrap']);

mod_script.controller('ScriptletController', ['$scope','$upload', 'DataService','DatastoreService',
  function($scope, $upload,  DataService, DatastoreService){

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

			//fetch current records via query
			$scope.activities = DataService.queryActivities({ criteria: {DatasetId: $scope.dataset.Id, Fields: [], Locations: "[\"all\"]", QAStatusId: "all"} } );;

			$scope.$watch('activities', function(){
				//if(!$scope.activities)
				//	return;

				var datasheet = [];

				console.log("spinning through...");
				angular.forEach($scope.uploadResults.Data.rows, function(incoming){
					console.dir(incoming);
					//spin through our upload data and match up with existing activity.  Use parcelId
					angular.forEach($scope.activities, function(existing){
						if(existing.Allotment == incoming["Allotment:"])
						{
							console.dir(existing);
							datasheet.push(existing);
							existing.NewValue=incoming["Value:"];

						}
					});
				});	

	            $scope.activities = ActivityParser.parseActivitySheet(datasheet, $scope.fields);
	            
	            /*
	            if(!$scope.activities.errors)
	            {
	                var promise = DataService.saveActivities($scope.userId, $scope.dataset.Id, $scope.activities);
	                promise.$promise.then(function(){
	                	$scope.new_activity = $scope.activities.new_records;
	                });
	            }
	            */
	            console.log("done!");

			},true);
			
		};
			
  }]);

	