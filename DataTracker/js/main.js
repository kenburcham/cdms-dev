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
	  'MyDatasetsControllers',
	  'DatasetServices',
	  'angularFileUpload',
	  'DatasetDirectives',
	  'angularCharts'
	  ])
	    .config(['$routeProvider', function($routeProvider) {
	        $routeProvider.when('/projects', {templateUrl: 'partials/projects.html', controller: 'ProjectsCtrl'});
	        $routeProvider.when('/projects/:Id', {templateUrl: 'partials/project-datasets.html', controller: 'ProjectDatasetsCtrl'});

	        //this one is a little special -- loads up the arcgis mapping stuff.
	        $routeProvider.when('/mydata', {templateUrl: 'partials/mydatasets.html', controller: 'MyDatasetsCtrl'});
	        $routeProvider.when('/activities/:Id', {templateUrl: 'partials/dataset-activities.html', controller: 'DatasetActivitiesCtrl', permission: 'Edit'});
	        $routeProvider.when('/dataview/:Id', {templateUrl: 'partials/dataset-view.html', controller: 'DatasetViewCtrl'});
	        $routeProvider.when('/dataentry/:Id',{templateUrl: 'partials/dataset-entry.html', controller: 'DataEntryDatasheetCtrl', permission: 'Edit'});
	        $routeProvider.when('/dataentryform/:Id',{templateUrl: 'partials/dataset-entry-form.html', controller: 'DataEntryFormCtrl', permission: 'Edit'});
	        $routeProvider.when('/edit/:Id',{templateUrl: 'partials/dataset-edit-form.html', controller: 'DataEditCtrl', permission: 'Edit'});
	        $routeProvider.when('/datasetquery/:Id',{templateUrl: 'partials/dataset-query.html', controller: 'DataQueryCtrl'});
	        $routeProvider.when('/dataset-details',{templateUrl: 'partials/dataset-details.html', controller: 'DatasetDetailsCtrl'});
	        $routeProvider.when('/datasetimport/:Id',{templateUrl: 'partials/dataset-import.html', controller: 'DatasetImportCtrl', permission: 'Edit'});

	        $routeProvider.otherwise({redirectTo: '/projects'});
	    }]);

	app.run(function($rootScope,$location) {
	  $rootScope.config = {
	      version: "1.0",
	  };

	  $rootScope.Cache = {};
	  $rootScope.Profile = configureProfile(profile); // profile defined in init.js

	  angular.rootScope = $rootScope; //just so we can get to it later. :)

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

	//is the profile owner of the given project?
	profile.isProjectOwner = function(project){
		//console.dir(project);
		if(project && project.OwnerId == profile.Id)
			return true;
		
		if(ALLOW_SUPERADMIN && (profile.Id == 1 || profile.Id == 2))
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
		/*
		console.log("checking: " + datasetId);
		console.log(profile.favoriteDatasets.join());
		if (profile.favoriteDatasets.indexOf(datasetId+"") != -1)
			console.log("YES!");
		else
			console.log("NO");
		*/
		return (profile.favoriteDatasets.indexOf(datasetId+"") != -1);
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


	return profile;
}