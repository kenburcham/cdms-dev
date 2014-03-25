
'use strict';


/* Controllers */

var mod_ds = angular.module('DatasetControllers', ['ui.bootstrap', 'angularFileUpload','ui.select2']);

var projectsController = ['$scope', 'DataService',
	function(scope, DataService){
		scope.projects = DataService.getProjects();
	}
];

var DatasetDetailsCtrl = ['$scope',
	function(scope){
		scope.metadataList = [
		{
			field: 'Name',
			value: 'CC/UGR'
		},
		{
			field: 'Summary',
			value: 'Catherine Creek /GR Adult Weir Summary'
		},
		{
			field: 'Description',
			value: 'Catherine Creek /GR Adult Weir Description'
		},
		{
			field: 'Owner',
			value: 'CTUIR Department of Natural Resources'
		},
		{
			field: 'Data Use Agreement Required',
			value: 'No'
		},
		{
			field: 'CreateDate',
			value: '1/9/2014'
		},
		];
	}
];

var projectDatasetsController = ['$scope', '$routeParams', 'DataService',
	function(scope, routeParams, DataService){
		scope.datasets = DataService.getProjectDatasets(routeParams.Id);
        scope.project = DataService.getProject(routeParams.Id);
        scope.currentUserId = 1; /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        scope.filteredUsers = false;
		var linkTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' + 
            				   '<a href="#/activities/{{row.getProperty(\'Id\')}}">{{row.getProperty("Name")}}</a>' +
            				   '</div>';

        var activityTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' + 
            				   '1/10/2014 @ 8:20 AM by Ken Burcham' +
            				   '</div>';

		scope.gridOptions = {
            	data: 'datasets',
            	columnDefs: 
            		[
            			{field:'Name', displayName:'Dataset Name', cellTemplate: linkTemplate},
            			{field:'Description',displayName: 'Description'},    
            			{field:'CreateDate',displayName: 'Last Activity', cellTemplate: activityTemplate}
            		]	
            };

         scope.users = [];
         scope.$watch('project.Id', function(){
            if(scope.project && scope.project.Id)
            {
                scope.editors = scope.project.Editors;
                scope.users = DataService.getUsers();
            }
         });

        scope.clearUsersWatch = scope.$watch('users', function(){
                if(scope.users)
                {
                    if(scope.users.length > 0)
                    {
                        scope.clearUsersWatch();
                        scope.filterUsers();
                    }
                }
                else
                    console.log("not yet.");

        },true); //note this TRUE here... this is required when watching an array directly.

        //remove this editor from the users dropdown.
        scope.filterUsers = function()
        {
            console.log("filterusers starting with " + scope.users.length);

            var newusers = [];
            
            for (var a = 0; a < scope.users.length; a++) {
                var user = scope.users[a];
                var filterOut = false;

                for (var i = 0; i < scope.editors.length; i++) {
                    //is this user an editor already?  if so leave them off the list.
                    if(scope.editors[i].Id == user.Id)
                    {
                        filterOut = true;
                        break;
                    }
                }  

                if(!filterOut)
                    newusers.push(user);
                   

            };

            console.log("set a new group: " + newusers.length);
            scope.users = newusers.sort(orderUserByAlpha);

         }

         scope.select2Options = {
            allowClear:true
         };

         scope.selectedUser = null;

         scope.addEditor = function(){
            for (var i = 0; i < scope.users.length; i++) {
                var user = scope.users[i];
                if(user.Id == scope.selectedUser)
                {
                    scope.editors.push(user);
                    scope.users.splice(i,1);
                    scope.selectedUser = null;
                    break;
                }
            };
         };

         scope.removeEditor = function(index)
         {
            scope.users.push(scope.editors.splice(index,1)[0]);
            scope.users.sort(orderUserByAlpha);
         };

         scope.saveEditors = function()
         {
            scope.saveResults = {};
            DataService.saveEditors(scope.currentUserId, scope.project.Id, scope.editors, scope.saveResults);
         };

         scope.cancel = function()
         {
           // scope.users = 
         };

	}
];

var datasetActivitiesController = ['$scope','$routeParams', 'DataService', '$modal', '$location','$window', '$rootScope',
    	function ($scope, $routeParams, DataService, $modal, $location, $window, $rootScope) {
            $scope.dataset = DataService.getDataset($routeParams.Id);
            $scope.activities = DataService.getActivities($routeParams.Id);
            $scope.loading = true;
            $scope.project = null;
            $scope.saveResults = null;

            //console.log("Profile = ");
            //console.dir($rootScope.Profile);

            var linkTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' + 
            				   '<a href="#/dataview/{{row.getProperty(\'Id\')}}">{{row.getProperty("ActivityDate") | date:\'MM/dd/yyyy\'}}</a>' +
            				   '</div>';

            var QATemplate = '<div class="ngCellText" ng-class="col.colIndex()">{{QAStatusList[row.getProperty("ActivityQAStatus.QAStatusId")]}}</div>';

            //performance idea: if project-role evaluation ends up being slow, you can conditionally include here...
          	var editButtonTemplate = '<div project-role="editor" class="ngCellText" ng-class="col.colIndex()">' + 
            				   '<a href="#/edit/{{row.getProperty(\'Id\')}}">Edit</a>' +
            				   '</div>';

            $scope.QAStatusList = { 5: "Approved", 6: "Ready for QA" }; //TODO

            $scope.gridOptions = {
            	data: 'activities',
                selectedItems: [],
            	enablePaging: true,
                sortInfo: {fields:['ActivityDate'], directions: ['desc']},
            	columnDefs: 
            		[
            			{field:'ActivityDate', displayName:'Activity Date', cellTemplate: linkTemplate},
            			{field:'Location.Label',displayName: 'Location'},
            			{field:'User.Fullname',displayName: 'By User'},
            			{field:'QAStatus', displayName: 'QA Status', cellTemplate: QATemplate},
            			{field:'Actions',displayName: '', cellTemplate: editButtonTemplate, width: '50px'}
            		],

            };

            $scope.$watch('dataset.Fields', function() { 
                if(!$scope.dataset.Fields ) return;
                //load our project based on the projectid we get back from the dataset
                $scope.project = DataService.getProject($scope.dataset.ProjectId);
            });

            $scope.$watch('activities.length', function(){ 
                if($scope.activities.length > 0)
                    $scope.loading = false;
            });

            $scope.openQueryWindow = function(p) {
            	$location.path("/datasetquery/"+$scope.dataset.Id);
            };

            $scope.openDetailsWindow = function(p) {
            	$location.path("/dataset-details/");
            };

            $scope.openImportWindow = function() {
				$location.path("/datasetimport/"+$scope.dataset.Id);
			};

            $scope.deleteActivities = function() {
                $scope.saveResults = {};
                if(!confirm("Are you sure you want to delete " + $scope.gridOptions.selectedItems.length + " activities?  There is no undo for this operation."))
                    return;

                DataService.deleteActivities($rootScope.Profile.Id, $scope.dataset.Id, $scope.gridOptions, $scope.saveResults);
                var deleteWatcher = $scope.$watch('saveResults', function(){
                    if($scope.saveResults.success)
                    {
                        //clear selection
                        $scope.gridOptions.selectAll(false);
                        $scope.activities = DataService.getActivities($routeParams.Id); //reload from the db.
                        deleteWatcher();
                        console.log("success!");
                    }
                    else if($scope.saveResults.failure)
                    {
                        deleteWatcher();
                        console.log("failure!");
                    }
                },true);
            };

			$scope.openDataEntry = function (p) { $location.path("/dataentry/"+$scope.dataset.Id);	};
		}
];

mod_ds.controller('ProjectsCtrl', projectsController);
mod_ds.controller('ProjectDatasetsCtrl', projectDatasetsController);
mod_ds.controller('DatasetActivitiesCtrl', datasetActivitiesController);


mod_ds.filter('mapStatus', function( StatusesConstant ) {
  return function(input) {
    if (StatusesConstant[input]) {
      return StatusesConstant[input];
    } else {
      return 'unknown';
    }
  };
})
.factory( 'StatusesConstant', function() {
  return {
    1: 'Ok',
    2: 'Flagged'
  };
});

mod_ds.factory('ActivityQAStatusesConstant', function(){
	return {
		5:"Ready for QA",
		6:"Approved",
		7:"Needs Review",
	};
});


