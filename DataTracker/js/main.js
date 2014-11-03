define([
  'angular'
], function(angular){

 
  // define our app as an angular module - with our dependencies and our routes
  var app = angular.module("app", 
	 [
	  'ngRoute',
	  'ngGrid',
	  'DatasetControllers',
	  'DatasetFilters',
	  'DataViewControllers',
	  'DataEditControllers',
	  'DataQueryControllers',
	  'DataEntryControllers',
	  'DataImportControllers',
	  'DatasetDetailsControllers',
	  'AppraisalControllers',
	  'MyPreferencesControllers',
	  'ActivitiesController',
	  'ModalsController',
	  'ChartServices',
	  'DatasetServices',
	  'angularFileUpload',
	  'DatasetDirectives',
	  'AdminController',
	  'angularCharts',
	  'checklist-model',
	  'ScriptControllers',

	  ])
	    .config(['$routeProvider', function($routeProvider) {
	    	
	        $routeProvider.when('/projects', {templateUrl: 'partials/projects.html', controller: 'ProjectsCtrl'});
	        $routeProvider.when('/projects/:Id', {templateUrl: 'partials/project-datasets.html', controller: 'ProjectDatasetsCtrl'});

	        //this one is a little special -- loads up the arcgis mapping stuff.
	        $routeProvider.when('/mydata', {templateUrl: 'partials/mydatasets.html', controller: 'MyDatasetsCtrl'});
	        $routeProvider.when('/myprojects', {templateUrl: 'partials/myprojects.html', controller: 'MyProjectsCtrl'});
	        $routeProvider.when('/activities/:Id', {templateUrl: 'partials/dataset-activities.html', controller: 'DatasetActivitiesCtrl', permission: 'Edit'});
	        $routeProvider.when('/dataview/:Id', {templateUrl: 'partials/dataset-view.html', controller: 'DatasetViewCtrl'});
	        $routeProvider.when('/dataentry/:Id',{templateUrl: 'partials/dataset-entry.html', controller: 'DataEntryDatasheetCtrl', permission: 'Edit'});
	        $routeProvider.when('/dataentryform/:Id',{templateUrl: 'partials/dataset-entry-form.html', controller: 'DataEntryFormCtrl', permission: 'Edit'});
	        $routeProvider.when('/edit/:Id',{templateUrl: 'partials/dataset-edit-form.html', controller: 'DataEditCtrl', permission: 'Edit'});
	        $routeProvider.when('/datasetquery/:Id',{templateUrl: 'partials/dataset-query.html', controller: 'DataQueryCtrl'});
	        $routeProvider.when('/dataset-details/:Id',{templateUrl: 'partials/dataset-details.html', controller: 'DatasetDetailsCtrl'});
	        $routeProvider.when('/datasetimport/:Id',{templateUrl: 'partials/dataset-import.html', controller: 'DatasetImportCtrl', permission: 'Edit'});
	        $routeProvider.when('/dataset-edit/:Id',{templateUrl: 'partials/edit-dataset.html', controller: 'DatasetDetailsCtrl', permission: 'Edit'});

	        $routeProvider.when('/query/:Id', {templateUrl: 'partials/dataset-query.html', controller: 'DatastoreQueryCtrl'});
	        $routeProvider.when('/admin', {templateUrl: 'partials/admin.html', controller: 'AdminCtrl'});
	        $routeProvider.when('/admin-dataset/:Id', {templateUrl: 'partials/admin/admin-dataset.html', controller: 'AdminEditDatasetCtrl'});

	        $routeProvider.when('/admin-master/:Id', {templateUrl: 'partials/admin/admin-master.html', controller: 'AdminEditMasterCtrl'});

	        //custom routes for datasets that require custom controller+pages
	        $routeProvider.when('/appraisals/:Id', {templateUrl: 'partials/appraisals/Appraisal-activities.html', controller: 'AppraisalCtrl'});
	        $routeProvider.when('/unauthorized', {templateUrl: 'partials/errors/unauthorized.html',controller: 'ErrorCtrl'});

	        $routeProvider.when('/script', {templateUrl: 'partials/scripts/index.html', controller: 'ScriptletController'});

	        //when all else fails...
	        $routeProvider.otherwise({redirectTo: '/projects'});
	    }]);

	//any functions in here are available to EVERY scope.  use sparingly!
	app.run(function($rootScope,$location) {
	  $rootScope.config = {
	      version: CURRENT_VERSION,
	      CDMS_DOCUMENTATION_URL: CDMS_DOCUMENTATION_URL,

	  };

	  $rootScope.Cache = {};
	  $rootScope.Profile = configureProfile(profile); // profile defined in init.js

	  $rootScope.go = function ( path ) {
		  $location.path( path );
	  };

	  angular.rootScope = $rootScope; //just so we can get to it later. :)

	  $rootScope.SystemTimezones = SystemTimezones; //defined in init.js
	  $rootScope.DataGradeMethods = DataGradeMethods; //ditto
	});

	return app;

});


//configure profile permission functions
function configureProfile(profile)
{
	//setup our favoritedatasets array for checking later.
	var favoriteDatasets = getByName(profile.UserPreferences, "Datasets"); 
	if(favoriteDatasets)
		profile.favoriteDatasets = favoriteDatasets.Value.split(",");
	else
		profile.favoriteDatasets = [];

	//same for favorite projects
	var favoriteProjects = getByName(profile.UserPreferences, "Projects"); 
	if(favoriteProjects)
		profile.favoriteProjects = favoriteProjects.Value.split(",");
	else
		profile.favoriteProjects = [];


	if(profile.Roles)
		profile.Roles = angular.fromJson(profile.Roles);
	
	profile.isAdmin = function()
	{
		return (profile.hasRole("Admin"));
	};

	profile.hasRole = function(role)
	{
		if(profile.Roles)
			return profile.Roles.contains(role);

		return false;
	}

	profile.canEdit = function(project)
	{
		return (profile.isProjectOwner(project) || profile.isProjectEditor(project));
	};

	//is the profile owner of the given project?
	profile.isProjectOwner = function(project){
		if(project && project.OwnerId == profile.Id)
			return true;
		
		if(profile.isAdmin())
			return true;

		//console.log(profile.Id + " is not owner: " + project.OwnerId);
		return false;                 
	};

	//is the profile editor for the given project?
	profile.isProjectEditor = function(project){

		var isEditor = false;

		if(project && project.Editors)
		{
        	for (var i = 0; i < project.Editors.length; i++) {
                var editor = project.Editors[i];
                if(editor.Id == profile.Id)
                {
             		isEditor = true;
             		break;
                }
            }         
        }

        return isEditor;    
	};

	profile.isDatasetFavorite = function(datasetId){
		return (profile.favoriteDatasets.indexOf(datasetId+"") != -1);
	};

	profile.isProjectFavorite = function(projectId){
		return (profile.favoriteProjects.indexOf(projectId+"") != -1);
	};	

	profile.toggleDatasetFavorite = function(dataset)
	{
		var dsid = dataset.Id+"";
		var index = profile.favoriteDatasets.indexOf(dsid);
		if(index == -1) //doesn't exist
			profile.favoriteDatasets.push(dsid);
		else
			profile.favoriteDatasets.splice(index,1);
	};

	profile.toggleProjectFavorite = function(project)
	{
		var dsid = project.Id+"";
		var index = profile.favoriteProjects.indexOf(dsid);
		if(index == -1) //doesn't exist
			profile.favoriteProjects.push(dsid);
		else
			profile.favoriteProjects.splice(index,1);
	};


	return profile;
}