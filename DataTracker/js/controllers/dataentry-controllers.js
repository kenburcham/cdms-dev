//Data Entry Controller
'use strict';

var mod_de = angular.module('DataEntryControllers', ['ui.bootstrap']);

//datasheet version of the data entrypage
mod_de.controller('DataEntryDatasheetCtrl', ['$scope','$routeParams','DataService','$modal','$location','$rootScope','ActivityParser','DataSheet','$route',
	function($scope, $routeParams, DataService, $modal, $location, $rootScope, ActivityParser, DataSheet, $route){

		$scope.userId = 1; /////////////////////////////////////////TODOOOOOOOOOOOOOOOOOOOOOOOO
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
			$scope.locationOptions = $rootScope.locationOptions = makeObjects($scope.project.Locations, 'Id','Label') ;
			
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
				
				if(field.FieldRoleId == 1)
				{
					$scope.headerFields.push(field);
					$scope.datasheetColDefs.push(makeFieldColDef(field, $scope));
				}
				else
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

		$scope.userId = 1; /////////////////////////////////////////TODOOOOOOOOOOOOOOOOOOOOOOOO
		$scope.headerFields = [];
		$scope.detailFields = [];
		$scope.datasheetColDefs = [];
        
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

		//fire up our dataset
        $scope.dataset = DataService.getDataset($routeParams.Id);

        //update our location options as soon as our project is loaded.
        $scope.$watch('project.Name', function(){
        	if(!$scope.project) return;
        	//console.dir($scope.project);
			$scope.locationOptions = $rootScope.locationOptions = makeObjects($scope.project.Locations, 'Id','Label') ;

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

				if(field.FieldRoleId == 1)
				{
					$scope.headerFields.push(field);
				}
				else
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

			$scope.row.ActivityQAStatus.QAStatusId = ""+$scope.dataset.DefaultActivityQAStatusId;

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
			$scope.onRow = row;
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


