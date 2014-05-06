//my datasets - MyDatasetsCtrl

'use strict';

var mod_mydata = angular.module('MyDatasetsControllers', ['ui.bootstrap']);

mod_mydata.controller('MyDatasetsCtrl', ['$scope','$rootScope','$location','DataService','$window',
	function($scope, $rootScope,$location, DataService, $window){

		//var mydatasets = getByName($rootScope.Profile.UserPreferences, 'Datasets');
		$scope.mydatasets = DataService.getMyDatasets();
		$scope.favoriteDatasetStores = {};

		$scope.$watch('mydatasets',function(){
			if($scope.mydatasets && $scope.mydatasets.length>0)
			{
				angular.forEach($scope.mydatasets, function(dataset, key){
					if(!$scope.favoriteDatasetStores[dataset.Datastore.Name])
						$scope.favoriteDatasetStores[dataset.Datastore.Name] = { Datastore: dataset.Datastore, favoriteDatasets: []};

					$scope.favoriteDatasetStores[dataset.Datastore.Name].favoriteDatasets.push(dataset);					
				});
			}
		},true);

/*
		$scope.favoriteDatasetStores = [{
			Name: "Adult Weir",
			DatastoreDatasetId: "15",
			favoriteDatasets: [{
				Id: "1002",
				Name: "UM-Adult Weir",
				},
				{
					Id: "1003",
					Name: "GR-Adult Weir",	
				},
				{
					Id: "1004",
					Name: "ISK-Adult Weir",	
				},
				{
					Id: "1005",
					Name: "PL-Adult Weir",	
				}
				]
		}];
*/
		
		$scope.openReportWindow = function( target ){
			$window.open('http://gis-sql/Reports/Pages/Folder.aspx?ItemPath=%2f' + target,'_blank');
		};

}]);

