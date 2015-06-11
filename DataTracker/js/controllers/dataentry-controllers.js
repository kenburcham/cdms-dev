//Data Entry Controller
'use strict';

var mod_de = angular.module('DataEntryControllers', ['ui.bootstrap']);

mod_de.controller('ModalQuickAddAccuracyCheckCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService',
  function($scope,  $modalInstance, DataService, DatastoreService){

    $scope.ac_row = {};

    $scope.save = function(){
      
      var promise = DatastoreService.saveInstrumentAccuracyCheck($scope.viewInstrument.Id, $scope.ac_row);
      promise.$promise.then(function(){
          $scope.reloadProject();  
          $modalInstance.dismiss();  
      });
      

    };

    $scope.cancel = function(){
      $modalInstance.dismiss();
    };

  }
]);

//datasheet version of the data entrypage
mod_de.controller('DataEntryDatasheetCtrl', ['$scope','$routeParams','DataService','$modal','$location','$rootScope','ActivityParser','DataSheet','$route',
	function($scope, $routeParams, DataService, $modal, $location, $rootScope, ActivityParser, DataSheet, $route){

		initEdit(); // stop backspace from ditching in the wrong place.

		$scope.userId = $rootScope.Profile.Id;
		$scope.fields = { header: [], detail: [], relation: {} };
		$scope.colDefs = [];
        
        //setup the data array that will be bound to the grid and filled with the json data objects
        $scope.dataSheetDataset = [];
        
		//datasheet grid definition
		$scope.gridDatasheetOptions = {
			data: 'dataSheetDataset',
			enableCellSelection: true,
	        enableRowSelection: false,
	        enableCellEdit: true,
	        columnDefs: 'datasheetColDefs',
	        enableColumnResize: true,
	        
		};

        //config the fields for the datasheet - include mandatory location and activityDate fields
		$scope.datasheetColDefs = DataSheet.getColDefs();
		DataSheet.initScope($scope);

		//fire up our dataset
        $scope.dataset = DataService.getDataset($routeParams.Id);

		//update our location options as soon as our project is loaded.
        $scope.$watch('project.Name', function(){
        	if(!$scope.project) return;

        	//console.dir($scope.project);
			$scope.locationOptions = $rootScope.locationOptions = makeObjects(getUnMatchingByField($scope.project.Locations,PRIMARY_PROJECT_LOCATION_TYPEID,"LocationTypeId"), 'Id','Label') ;

        	if($scope.project.Instruments.length > 0)
        	{
        		$scope.instrumentOptions = $rootScope.instrumentOptions = makeInstrumentObjects($scope.project.Instruments);
        		getByField($scope.datasheetColDefs, 'Instrument','Label').visible=true;
			}

			//check authorization -- need to have project loaded before we can check project-level auth
			if(!$rootScope.Profile.isProjectOwner($scope.project) && !$rootScope.Profile.isProjectEditor($scope.project))
			{
				$location.path("/unauthorized");
			}

        });

         //setup a listener to populate column headers on the grid
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

			//now everything is populated and we can do any post-processing.
			if($scope.datasheetColDefs.length > 2)
			{
				$scope.addNewRow();
			}

			if($scope.dataset.Config)
			{
				var filteredColDefs = [];

				angular.forEach($scope.datasheetColDefs, function(coldef){
					if($scope.dataset.Config.DataEntryPage &&
						!$scope.dataset.Config.DataEntryPage.HiddenFields.contains(coldef.field))
					{
						filteredColDefs.push(coldef);
					}
				});

				$scope.datasheetColDefs = $scope.colDefs = filteredColDefs;
			}

			$scope.recalculateGridWidth($scope.datasheetColDefs.length);
            $scope.validateGrid($scope);

    	});

		$scope.doneButton = function()
		{
		 	$scope.activities = undefined;
		 	$scope.dataset = undefined;
		 	$route.reload();
		 	//DataSheet.initScope($scope); //needed?
		}

		$scope.viewButton = function()
		{
			$location.path("/"+$scope.dataset.activitiesRoute+"/"+$scope.dataset.Id);
		}

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
			row.QAStatusId = $scope.dataset.DefaultActivityQAStatusId;
			row.RowQAStatusId = $scope.dataset.DefaultRowQAStatusId;
			$scope.dataSheetDataset.push(row);
			$scope.onRow = row;

		};

		$scope.saveData = function() {

			var sheetCopy = angular.copy($scope.dataSheetDataset);

            $scope.activities = ActivityParser.parseActivitySheet(sheetCopy, $scope.fields);
            
            if(!$scope.activities.errors)
            {
                var promise = DataService.saveActivities($scope.userId, $scope.dataset.Id, $scope.activities);
                promise.$promise.then(function(){
                	$scope.new_activity = $scope.activities.new_records;
                });
            }

		};

		
	}
]);


//Fieldsheet / form version of the dataentry page
mod_de.controller('DataEntryFormCtrl', ['$scope','$routeParams','DataService','$modal','$location','$rootScope','ActivityParser','DataSheet','$route','FileUploadService',
	function($scope, $routeParams, DataService, $modal, $location, $rootScope, ActivityParser, DataSheet, $route, UploadService){

		initEdit(); // stop backspace from ditching in the wrong place.

		$scope.userId = $rootScope.Profile.Id;
		$scope.fields = { header: [], detail: [], relation: []}; 
		$scope.datasheetColDefs = [];
        
		$scope.filesToUpload = {};

        $scope.dataSheetDataset = [];
        $scope.row = {ActivityQAStatus: {}, activityDate: new Date()}; //header field values get attached here by dbcolumnname
        
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

		//fire up our dataset
        $scope.dataset = DataService.getDataset($routeParams.Id);

        //update our location options as soon as our project is loaded.
        $scope.$watch('project.Name', function(){
        	if(!$scope.project) return;
        	//console.dir($scope.project);

			$scope.locationOptions = $rootScope.locationOptions = makeObjects(getUnMatchingByField($scope.project.Locations,PRIMARY_PROJECT_LOCATION_TYPEID,"LocationTypeId"), 'Id','Label') ;

			//if there is only one location, just set it to that location
			if(array_count($scope.locationOptions)==1)
			{
				//there will only be one.
				angular.forEach(Object.keys($scope.locationOptions), function(key){
					console.log(key);
					$scope.row['locationId'] = key;	
				});
				
			}
			
			//check authorization -- need to have project loaded before we can check project-level auth
			if(!$rootScope.Profile.isProjectOwner($scope.project) && !$rootScope.Profile.isProjectEditor($scope.project))
			{
				$location.path("/unauthorized");
			}

			//if ?LocationId=123 is passed in then lets set it to the given LocationId
			if($routeParams.LocationId)
			{
				$scope.row['locationId'] = ""+$routeParams.LocationId;
			}

        });

         //setup a listener to populate column headers on the grid
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
				}
				else if (field.FieldRoleId == FIELD_ROLE_DETAIL)
				{
					$scope.fields.detail.push(field);
    				$scope.datasheetColDefs.push(makeFieldColDef(field, $scope));

    				//a convention:  if your dataset has a ReadingDateTime field then we enable timezones for an activity.
    				if(field.DbColumnName == "ReadingDateTime")
    				{
    					$scope.row.Timezone = getByField($scope.SystemTimezones, new Date().getTimezoneOffset() * -60000, "TimezoneOffset"); //set default timezone
    				}
				}
    		});

			//now everything is populated and we can do any post-processing.
			if($scope.datasheetColDefs.length > 2)
			{
				$scope.addNewRow();
			}

			//set defaults for header fields
			angular.forEach($scope.fields.header, function(field){
				$scope.row[field.DbColumnName] = (field.DefaultValue) ? field.DefaultValue : null;

				//FEATURE: any incoming parameter value that matches a header will get copied into that header value.
				if($routeParams[field.DbColumnName])
				{
					$scope.row[field.DbColumnName] = $routeParams[field.DbColumnName];
				}

			});

			$scope.row.ActivityQAStatus.QAStatusId = ""+$scope.dataset.DefaultActivityQAStatusId;

			$scope.recalculateGridWidth($scope.fields.detail.length);

			$scope.validateGrid($scope);


    	});

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

        $scope.createInstrument = function(){
            $scope.viewInstrument = null;
            var modalInstance = $modal.open({
              templateUrl: 'partials/instruments/modal-create-instrument.html',
              controller: 'ModalCreateInstrumentCtrl',
              scope: $scope, //very important to pass the scope along...
            });
         };


		$scope.getDataGrade = function(check){ return getDataGrade(check)}; //alias from service

		$scope.selectInstrument = function(){
			if(!$scope.row.InstrumentId)
				return;

			//get latest accuracy check
			$scope.viewInstrument = getByField($scope.project.Instruments, $scope.row.InstrumentId, "Id");
			$scope.row.LastAccuracyCheck = $scope.viewInstrument.AccuracyChecks[$scope.viewInstrument.AccuracyChecks.length-1];
			$scope.row.DataGradeText = getDataGrade($scope.row.LastAccuracyCheck) ;

			if($scope.row.LastAccuracyCheck)
				$scope.row.AccuracyCheckId = $scope.row.LastAccuracyCheck.Id;
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
			$scope.onRow = row;
		};

   	    //overriding the one in our service because we don't want to allow removing of a blank row.
        $scope.removeRow = function(){
        	if($scope.dataSheetDataset.length > 1)
        		DataSheet.removeOnRow($scope);
        };


		$scope.doneButton = function()
		{
		 	$scope.activities = undefined;
		 	$route.reload();
			//DataSheet.initScope($scope);		
		}

		$scope.viewButton = function()
		{
			$location.path("/"+$scope.dataset.activitiesRoute+"/"+$scope.dataset.Id);
		}

		$scope.viewRelation = function(row, field_name)
        {
        	console.dir(row.entity);
        	var field = $scope.FieldLookup[field_name];
        	console.dir(field);

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
      
		$scope.saveData = function(){
			console.log("save!");

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

				var sheetCopy = angular.copy($scope.dataSheetDataset);		

				$scope.activities = ActivityParser.parseSingleActivity($scope.row, sheetCopy, $scope.fields);
				if(!$scope.activities.errors)
				{
					DataService.saveActivities($scope.userId, $scope.dataset.Id, $scope.activities);
				}
			});
		};

		//this function gets called when a user clicks the "Add" button in a GRID file cell
		$scope.addFiles = function(row, field_name)
		{
			var field = $scope.FieldLookup[field_name];

			//console.dir(row);
			//console.dir(field);
			$scope.openFileModal(row.entity, field);

		}		
	}
]);




//not being used.	
mod_de.controller('ModalDataEntryCtrl', ['$scope', '$modalInstance', 
	function($scope, $modalInstance){
		//DRY alert -- this was copy and pasted... how can we fixy?
		$scope.alerts = [];

		$scope.ok = function(){
			try{
				$scope.addGridRow($scope.row);
				$scope.row = {};
				$scope.alerts.push({type: 'success',msg: 'Added.'});
			}catch(e){
				console.dir(e);
			}
		};

		$scope.cancel = function() {
			$modalInstance.dismiss('cancel');
		};

		$scope.closeAlert = function(index) {
		    $scope.alerts.splice(index, 1);
		};

		$scope.row = {}; //modal fields are bound here

		$scope.dateOptions = {
		    'year-format': "'yy'",
		    'starting-day': 1
		};


	}
	]);


