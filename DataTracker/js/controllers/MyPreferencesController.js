//my datasets + projects

'use strict';

var mod_mydata = angular.module('MyPreferencesControllers', ['ui.bootstrap']);

mod_mydata.controller('MyDatasetsCtrl', ['$scope','$rootScope','$location','DataService','$window',
	function($scope, $rootScope,$location, DataService, $window){

		//var mydatasets = getByName($rootScope.Profile.UserPreferences, 'Datasets');
		$scope.mydatasets = DataService.getMyDatasets();
		$scope.favoriteDatasetStores = {};

		$scope.$watch('mydatasets',function(){
			if($scope.mydatasets.$resolved)
			{
				angular.forEach($scope.mydatasets, function(dataset, key){

		            //need to bump this since we are looking at a LIST of datasets...
	                DataService.configureDataset(dataset);    

					if(!$scope.favoriteDatasetStores[dataset.Datastore.Name])
						$scope.favoriteDatasetStores[dataset.Datastore.Name] = { Datastore: dataset.Datastore, favoriteDatasets: []};

					$scope.favoriteDatasetStores[dataset.Datastore.Name].favoriteDatasets.push(dataset);					


				});
			}
		},true);



		
		$scope.openReportWindow = function( target ){
			$window.open( REPORTSERVER_URL + target,'_blank');
		};

}]);


mod_mydata.controller('MyProjectsCtrl', ['$scope','$rootScope','$location','DataService','$window',
	function($scope, $rootScope,$location, DataService, $window){
		$scope.myprojects = DataService.getMyProjects();
}]);


