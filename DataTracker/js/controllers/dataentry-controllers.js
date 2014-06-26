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
		$scope.headerFields = [];
		$scope.detailFields = [];
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
			$scope.locationOptions = $rootScope.locationOptions = makeObjects(getMatchingByField($scope.project.Locations,2,"LocationTypeId"), 'Id','Label') ;
			
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
					$scope.headerFields.push(field);
					$scope.datasheetColDefs.push(makeFieldColDef(field, $scope));
				}
				else if(field.FieldRoleId == FIELD_ROLE_DETAIL)
				{
					$scope.detailFields.push(field);
    				$scope.datasheetColDefs.push(makeFieldColDef(field, $scope));
				}
				
    		});

			//now everything is populated and we can do any post-processing.
			if($scope.datasheetColDefs.length > 2)
			{
				$scope.addNewRow();
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
			row.QAStatusId = $scope.dataset.DefaultActivityQAStatusId;
			row.RowQAStatusId = $scope.dataset.DefaultRowQAStatusId;
			$scope.dataSheetDataset.push(row);
			$scope.onRow = row;

		};

		$scope.saveData = function() {
            $scope.activities = ActivityParser.parseActivitySheet($scope.dataSheetDataset, $scope.headerFields, $scope.detailFields);
            
            if(!$scope.activities.errors)
            {
                DataService.saveActivities($scope.userId, $scope.dataset.Id, $scope.activities);
            }

		};

		
	}
]);


//Fieldsheet / form version of the dataentry page
mod_de.controller('DataEntryFormCtrl', ['$scope','$routeParams','DataService','$modal','$location','$rootScope','ActivityParser','DataSheet','$route',
	function($scope, $routeParams, DataService, $modal, $location, $rootScope, ActivityParser, DataSheet, $route){

		initEdit(); // stop backspace from ditching in the wrong place.

		$scope.userId = $rootScope.Profile.Id;
		$scope.headerFields = [];
		$scope.detailFields = [];
		$scope.datasheetColDefs = [];
        
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
			$scope.locationOptions = $rootScope.locationOptions = makeObjects(getMatchingByField($scope.project.Locations,2,"LocationTypeId"), 'Id','Label') ;

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
					$scope.headerFields.push(field);
				}
				else if (field.FieldRoleId == FIELD_ROLE_DETAIL)
				{
					$scope.detailFields.push(field);
    				$scope.datasheetColDefs.push(makeFieldColDef(field, $scope));

    				//a convention:  if your dataset has a ReadingDateTime field then we enable timezones for an activity.
    				if(field.DbColumnName == "ReadingDateTime")
    				{
    					$scope.hasReadingDateTime = true;
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
			angular.forEach($scope.headerFields, function(headerfield){
				$scope.row[headerfield.DbColumnName] = (headerfield.DefaultValue) ? headerfield.DefaultValue : null;
			});

			$scope.row.ActivityQAStatus.QAStatusId = ""+$scope.dataset.DefaultActivityQAStatusId;

			$scope.recalculateGridWidth($scope.detailFields.length);

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

		$scope.getDataGrade = function(check){ return getDataGrade(check)}; //alias from service

		$scope.selectInstrument = function(){
			//get latest accuracy check
			$scope.viewInstrument = getByField($scope.project.Instruments, $scope.row.InstrumentId, "Id");
			$scope.row.LastAccuracyCheck = $scope.viewInstrument.AccuracyChecks[$scope.viewInstrument.AccuracyChecks.length-1];
			$scope.row.DataGradeText = getDataGrade($scope.row.LastAccuracyCheck) ;
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

		$scope.saveData = function(){
			console.log("save!");
			$scope.activities = ActivityParser.parseSingleActivity($scope.row, $scope.dataSheetDataset, $scope.headerFields, $scope.detailFields);
			if(!$scope.activities.errors)
			{
				DataService.saveActivities($scope.userId, $scope.dataset.Id, $scope.activities);
			}
		};		
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


