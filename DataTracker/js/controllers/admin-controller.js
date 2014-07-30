//admin controller

'use strict';
var mod_ac = angular.module('AdminController', ['ui.bootstrap']);

mod_dv.controller('ModalAddProjectDatasetCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService',
	function($scope,  $modalInstance, DataService, DatastoreService){

		$scope.row = {};

		$scope.projects = DataService.getProjects(); //.sort(orderByAlpha);
		

		$scope.save = function(){
			
			$modalInstance.dismiss();

		};

		$scope.cancel = function(){
			$modalInstance.dismiss();
		};

	}
]);



mod_ac.controller('AdminCtrl', ['$scope','DatastoreService','$modal','DataService',
	function($scope, DatastoreService, $modal, DataService){

		//TODO: a nicer global route authorization scheme...
		if(!$scope.Profile.isAdmin())
			angular.rootScope.go("/unauthorized");

		$scope.datastores = DatastoreService.getDatastores();
		$scope.projects = DataService.getProjects();

		var watcher = $scope.$watch('datastores',function(){

			if($scope.datastores.length > 0)
			{
				watcher();	//removes watch since we're about to do some updates that would cause multiple firings...!

				angular.forEach($scope.datastores, function(datastore, key){
					//datastore.Projects = DatastoreService.getProjects(datastore.Id);
					datastore.Datasets = DatastoreService.getDatasets(datastore.Id);
				});

			}


		}, true);


		$scope.addNewProjectDataset = function(datastore){
			$scope.datastore = datastore;
			var modalInstance = $modal.open({
				templateUrl: 'partials/admin/addNewProjectDataset.html',
				controller: 'ModalAddProjectDatasetCtrl',
				scope: $scope, //very important to pass the scope along... 
	
			});
		};

		$scope.getProjectName = function(id)
		{

			//console.log(">>" + id);
			var ret = "";
			var project = getMatchingByField($scope.projects,id,'Id');
			if(project)
				ret = " - " + project.Name;

		}


	}

]);

mod_ac.controller('AdminEditDatasetCtrl', ['$scope','DatastoreService','$modal', 'DataService', '$routeParams',
	function($scope, DatastoreService, $modal, DataService, $routeParams){

		$scope.dataset = DataService.getDataset($routeParams.Id);
		$scope.FieldLookup = {};
		
		$scope.Sources = DatastoreService.getSources();

		$scope.$watch('Sources',function(){
			if($scope.Sources.length > 0)
			$scope.SourcesLookup = makeObjects($scope.Sources, 'Id','Name');
		},true);

		$scope.Instruments = DatastoreService.getInstruments();

		$scope.$watch('Instruments',function(){
			if($scope.Instruments.length > 0)
			$scope.InstrumentsLookup = makeObjects($scope.Instruments, 'Id','Name');
		},true);

		$scope.SelectedField = null;

		$scope.$watch('dataset.Id', function(){
			
			if(!$scope.dataset.Id)
				return;
		
			if(!$scope.MasterFields)
				$scope.MasterFields = DatastoreService.getMasterFields($scope.dataset.Datastore.FieldCategoryId);

			angular.forEach($scope.dataset.Fields.sort(orderByAlpha), function(field){
				//parseField(field, $scope);
				if(field.Field.PossibleValues)
					field.Values = makeObjectsFromValues($scope.dataset.DatastoreId+field.DbColumnName, field.Field.PossibleValues);

				field.SourceId = ""+field.SourceId; //so we can find it in the dropdown!
				field.InstrumentId = ""+field.InstrumentId;
			});

			$scope.dataFields = $scope.dataset.Fields;

		});

		$scope.removeField = function()
		{
			if(!confirm("Are you sure you want to remove '" + $scope.SelectedField.Label + "' from this dataset?"))
                return;

			$scope.saveResults = {};
            DatastoreService.removeField($scope.dataset.Id, $scope.SelectedField.FieldId, $scope.saveResults)
            setTimeout(function(){
            	DataService.clearDataset();
            	$scope.dataset = DataService.getDataset($routeParams.Id); //reload
            	$scope.SelectedField = null;
            },400);


		}

		$scope.addMasterField = function()
		{
			$scope.saveResults = {};
			DatastoreService.addMasterFieldToDataset($scope.dataset.Id, $scope.newField, $scope.saveResults);
			setTimeout(function(){
				DataService.clearDataset();
            	$scope.dataset = DataService.getDataset($routeParams.Id); //reload
            },400);
		};

		$scope.saveField = function()
		{
			$scope.saveResults = {};
			DatastoreService.saveDatasetField($scope.SelectedField, $scope.saveResults);
		};

		$scope.selectField = function(field){
			$scope.SelectedField = field;
		};
		

	}
]);

mod_ac.controller('AdminEditMasterCtrl', ['$scope','DatastoreService','$modal', 'DataService', '$routeParams',
	function($scope, DatastoreService, $modal, DataService, $routeParams){

		$scope.datastore = DatastoreService.getDatastore($routeParams.Id);
		
		$scope.SelectedField = null;

		$scope.$watch('datastore.Id', function(){
			if($scope.datastore.Id > 0)
				$scope.datastoreFields = DatastoreService.getMasterFields($scope.datastore.FieldCategoryId); //DatastoreService.getFields($routeParams.Id);
		});

		$scope.$watch('datastoreFields', function(){
			if(!$scope.datastoreFields)
				return;

				angular.forEach($scope.datastoreFields, function(field){
					//parseField(field, $scope);
					if(field.PossibleValues)
						field.Values = makeObjectsFromValues($scope.datastore.Id+field.DbColumnName, field.PossibleValues);

				});				
			

		},true);

		$scope.saveField = function()
		{
			$scope.saveResults = {};
			DatastoreService.saveMasterField($scope.SelectedField, $scope.saveResults);
		}
		
		$scope.selectField = function(field){
			$scope.SelectedField = field;
		};
		

	}
]);