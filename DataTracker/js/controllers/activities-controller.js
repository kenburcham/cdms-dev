//admin controller
'use strict';

var mod_dac = angular.module('ActivitiesController', ['ui.bootstrap']);

mod_dac.controller('ModalAddLocationCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService',
    function($scope,  $modalInstance, DataService, DatastoreService){

        $scope.row = {};

        $scope.project = DataService.getProject($scope.dataset.ProjectId); 
        $scope.locationTypes = DatastoreService.getLocationTypes();

        $scope.save = function(){
            //add the graphic to the map and get SDE_ObjectId
            $scope.map.locationLayer.applyEdits([$scope.newGraphic],null,null).then(function(results){
                if(results[0].success)
                {
                    $scope.row.SdeObjectId = results[0].objectId;

                    var promise = DatastoreService.saveNewProjectLocation($scope.project.Id, $scope.row);
                    console.dir(promise);
                    promise.$promise.then(function(){
                        console.log("done and success!");
                        $modalInstance.dismiss(); 
                    });


                    //$modalInstance.dismiss(); 
                }
                else
                {
                    $scope.errorMessage = "There was a problem saving that location.";
                }

                $scope.map.infoWindow.hide();
                if($scope.newGraphic)
                    $scope.map.graphics.remove($scope.newGraphic);

            });


            //save the location information 
            //associate location with project
            
            
        };

        $scope.cancel = function(){
            $modalInstance.dismiss();
        };

    }
]);







var datasetActivitiesController = ['$scope','$routeParams', 'DataService', '$modal', '$location','$window', '$rootScope',
    	function ($scope, $routeParams, DataService, $modal, $location, $window, $rootScope) {
            $scope.dataset = DataService.getDataset($routeParams.Id);
            $scope.activities = DataService.getActivities($routeParams.Id);
            $scope.loading = true;
            $scope.project = null;
            $scope.saveResults = null;
            $scope.isFavorite = $rootScope.Profile.isDatasetFavorite($routeParams.Id);
            $scope.allActivities = null;

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

            $scope.ShowMap = {
                Display: false,
                Message: "Show Map",
                MessageToOpen: "Show Map",
                MessageToClose: "Hide Map",
            };

            $scope.addLocation = function(){
                var modalInstance = $modal.open({
                    templateUrl: 'partials/modal-addlocation.html',
                    controller: 'ModalAddLocationCtrl',
                    scope: $scope, //very important to pass the scope along... 
                });
            };

            $scope.clearLocation = function(){
                $scope.map.infoWindow.hide();

                if($scope.newGraphic)
                    $scope.map.graphics.remove($scope.newGraphic);
  
            };

            $scope.removeLocation = function(){
                if(confirm("Are you sure you want to delete this location?"))
                    alert("Not implemented.");
            };

//MAP stuff
            
            $scope.selectedLocation = null;
            $scope.newPoint = null;
            $scope.newGraphic = null;

            $scope.getInfoContent = function(graphic)
            {
                var location = getByField($scope.locationsArray,graphic.attributes.OBJECTID,"SdeObjectId");
                $scope.map.infoWindow.setTitle(location.Label);
                return location.Description + '<br/>...';
            };

            $scope.getFormContent = function()
            {
                return "Click button above to create a new location here.";
            };

            
            // expose a method for handling clicks - this is linked to from the Map.js directive
            $scope.click = function(e){

            try{

                if(!$scope.map.graphics.infoTemplate)
                {
                    $scope.map.graphics.infoTemplate = $scope.template;
                    console.log("graphics layer infotemplate defined.");
                }

  
                $scope.map.infoWindow.resize(250, 200);
                
                //show the infowindow
                if(e.graphic)
                {
                    $scope.map.infoWindow.setContent($scope.getInfoContent(e.graphic));    
                }
                else
                {
                    $scope.map.infoWindow.setTitle("New Location");
                    $scope.map.infoWindow.setContent($scope.getFormContent());
                }

                $scope.map.infoWindow.show(e.mapPoint);
                


                //now... did they click an existing map point?
                if(e.graphic)
                {
                      //filter activities based on the location they clicked.
                      if(!$scope.allActivities)
                            $scope.allActivities = $scope.activities;

                      var filterActivities = [];
                      var location = getByField($scope.locationsArray,e.graphic.attributes.OBJECTID,"SdeObjectId");

                      angular.forEach($scope.allActivities, function(item, key){
                         if(item.LocationId == location.Id)
                            filterActivities.push(item);
                      });

                      $scope.activities = filterActivities;
                      
                      //$scope.center = [e.mapPoint.x,e.mapPoint.y];
                }
                else // no -- maybe they are making a new point?
                {

                    $scope.map.reposition(); //this is important or else we end up with our map points off somehow.

                      $scope.newPoint = e.mapPoint;

                      //if they had already clicked somewhere, remove that point.
                      if($scope.newGraphic)
                          $scope.map.graphics.remove($scope.newGraphic);
  
                      $scope.newGraphic = new esri.Graphic(
                          e.mapPoint,
                          new esri.symbol.SimpleMarkerSymbol()
                      );

                      $scope.map.graphics.add($scope.newGraphic);
                  
                }

            }catch(e)
            {
                console.dir(e);
            }


            };

            // listen for click broadcasts
           /* $scope.$on("map.click", function(event, e){
              console.log("broadcast", event, e);
              console.log("Map -- ");
              console.dir($scope.map.locationLayer);
            });
*/
//

            $scope.toggleMap = function(){
                if($scope.ShowMap.Display)
                {
                    $scope.ShowMap.Display = false;
                    $scope.ShowMap.Message = $scope.ShowMap.MessageToOpen;
                }
                else
                {
                    $scope.ShowMap.Display = true;
                    $scope.ShowMap.Message = $scope.ShowMap.MessageToClose;                    
                    
                    setTimeout(function(){
                        $scope.map.reposition();
                        console.log("repositioned");    
                    }, 400);
                    
                }
            };

            $scope.toggleFavorite = function(){
                $scope.isFavorite = !$scope.isFavorite; //make the visible change instantly.
                
                $scope.results = {};

                $rootScope.Profile.toggleDatasetFavorite($scope.dataset);
                
                DataService.saveUserPreference("Datasets", $rootScope.Profile.favoriteDatasets.join(), $scope.results);

                var watcher = $scope.$watch('results', function(){
                    if($scope.results.done)
                    {
                        //if something goes wrong, roll it back.
                        if($scope.results.failure)
                        {
                            $scope.isFavorite = !$scope.isFavorite; 
                            $rootScope.Profile.toggleDatasetFavorite($scope.dataset);
                        }
                        watcher();
                    }
                },true);
                

            }

            $scope.$watch('project.Name', function(){
                if($scope.project){
                    $scope.locationsArray = getMatchingByField($scope.project.Locations,2,"LocationTypeId");
                    $scope.locationObjectIds = [];
                    
                    angular.forEach($scope.locationsArray, function(item, key){
                        $scope.locationObjectIds.push(item.SdeObjectId);
                    });

                    $scope.locationObjectIds = $scope.locationObjectIds.join();
                }
            });            

            $scope.$watch('dataset.Fields', function() { 
                if(!$scope.dataset.Fields ) return;
                //load our project based on the projectid we get back from the dataset
                $scope.project = DataService.getProject($scope.dataset.ProjectId);
                $scope.QAStatusList = makeObjects($scope.dataset.QAStatuses, 'Id','Name');

            });

            $scope.$watch('activities.length', function(){ 
                if($scope.activities.length > 0)
                {
                    $scope.loading = false;
                    
                    $scope.gridOptions.ngGrid.data.$promise.then(function(){
                        $rootScope.GridActivities = $scope.gridOptions.ngGrid.data;
                    });
                    
                }
                
            });

            $scope.openQueryWindow = function(p) {
            	$location.path("/datasetquery/"+$scope.dataset.Id);
            };

            $scope.openDetailsWindow = function(p) {
            	$location.path("/dataset-details/"+$scope.dataset.Id);
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

mod_dac.controller('DatasetActivitiesCtrl', datasetActivitiesController);