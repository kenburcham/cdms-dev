//admin controller
'use strict';

var mod_dac = angular.module('ActivitiesController', ['ui.bootstrap']);

//modal that handles both saving and editing locations
mod_dac.controller('ModalAddLocationCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService',
    function($scope,  $modalInstance, DataService, DatastoreService){

        //if $scope.selectedLocation is set then we are EDITING, otherwise CREATING
        if($scope.selectedLocation)
        {
            $scope.headingMessage = "Editing existing location";
            $scope.row = $scope.selectedLocation;
        }
        else
        {
            $scope.headingMessage = "Create new location for a project"; //default mode = 
            $scope.row = {
                Projection: "NAD83",
                UTMZone: "11",
            };
        }


        $scope.project = DataService.getProject($scope.dataset.ProjectId); 
        $scope.locationTypes = DatastoreService.getLocationTypes();
        $scope.waterbodies = DatastoreService.getWaterBodies();

        $scope.save = function(){
            
            //OK -- if we are saving a NEW location then start off by adding the point to the featurelayer
            if(!$scope.row.Id)
            {
                //add the graphic to the map and get SDE_ObjectId
                $scope.map.locationLayer.applyEdits([$scope.newGraphic],null,null).then(function(results){
                    if(results[0].success)
                    {
                        $scope.row.SdeObjectId = results[0].objectId;
                        console.log("Created a new point! "+ $scope.row.SdeObjectId);

                        var promise = DatastoreService.saveNewProjectLocation($scope.project.Id, $scope.row);
                        promise.$promise.then(function(){
                            //console.log("done and success!");
                            //reload the project -- this will cause the locations and locationlayer to be reloaded!  wow!  go AngularJS!  :)
                            $scope.refreshProjectLocations();
                            $modalInstance.dismiss(); 
                        });
                        
                    }
                    else
                    {
                        $scope.errorMessage = "There was a problem saving that location.";
                    }

                });
            }
            else //updating an existing...
            {
                var promise = DatastoreService.saveNewProjectLocation($scope.project.Id, $scope.row);
                promise.$promise.then(function(){
                    //done updating.
                    $modalInstance.dismiss();                 
                });
            }

            $scope.map.infoWindow.hide();
            if($scope.newGraphic)
                $scope.map.graphics.remove($scope.newGraphic);

            
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

            var desclinkTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' + 
                               '<a href="#/dataview/{{row.getProperty(\'Id\')}}">{{row.getProperty("Description") }}</a>' +
                               '</div>';


            var QATemplate = '<div class="ngCellText" ng-class="col.colIndex()">{{QAStatusList[row.getProperty("ActivityQAStatus.QAStatusId")]}}</div>';

            //performance idea: if project-role evaluation ends up being slow, you can conditionally include here...
          	var editButtonTemplate = '<div project-role="editor" class="ngCellText" ng-class="col.colIndex()">' + 
            				   '<a href="#/edit/{{row.getProperty(\'Id\')}}">Edit</a>' +
            				   '</div>';

            $scope.columnDefs = [
                        {field:'ActivityDate', displayName:'Activity Date', cellTemplate: linkTemplate, width:'100px'},
                        {field:'Location.Label',displayName: 'Location'},
                        {field:'Location.WaterBody.Name',displayName: 'Waterbody', visible: false},
                        {field:'Description', displayName: 'Date Range', cellTemplate: desclinkTemplate, visible: false},
                        {field:'User.Fullname',displayName: 'By User', width: '120px'},
                        {field:'QAStatus', displayName: 'QA Status', cellTemplate: QATemplate, width: '100px'},
                        {field:'Actions',displayName: '', cellTemplate: editButtonTemplate, width: '50px'},
                    ];

            $scope.showFilter = false;

            $scope.gridOptionsFilter = {};
            $scope.gridOptions = {
            	data: 'activities',
                selectedItems: [],
            	showColumnMenu: true,
                sortInfo: {fields:['ActivityDate'], directions: ['desc']},
            	columnDefs: 'columnDefs',
                filterOptions: $scope.gridOptionsFilter,


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

            $scope.removeFilter = function()
            {
                $scope.activities = $scope.allActivities;
                $scope.clearLocation();
            }

            $scope.clearLocation = function(){
                $scope.map.infoWindow.hide();
                $scope.selectedLocation = null;

                if($scope.newGraphic)
                {
                    $scope.map.graphics.remove($scope.newGraphic);
                    $scope.newGraphic = null;
                }
  
            };

            $scope.removeLocation = function(){
                if(confirm("Are you sure you want to delete this location?"))
                    alert("Not implemented.");
            };

            $scope.editLocation = function(){
                $scope.row = $scope.selectedLocation;
                var modalInstance = $modal.open({
                    templateUrl: 'partials/modal-addlocation.html',
                    controller: 'ModalAddLocationCtrl',
                    scope: $scope, //very important to pass the scope along... 
                });
            };
           
            $scope.selectedLocation = null;
            $scope.newPoint = null;
            $scope.newGraphic = null;

            $scope.getFormContent = function()
            {
                return "Click button above to create a new location here.";
            };

            
            // expose a method for handling clicks ON THE MAP - this is linked to from the Map.js directive
            $scope.click = function(e){

            try{

                if(!$scope.map.graphics.infoTemplate)
                {
                    $scope.map.graphics.infoTemplate = $scope.template;
                    console.log("graphics layer infotemplate defined.");
                }

  
                $scope.map.infoWindow.resize(250, 300);
                
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
                      
                      $scope.selectedLocation = location;
                      if($scope.newGraphic)
                      {
                           $scope.map.graphics.remove($scope.newGraphic);
                           $scope.newGraphic = null; // just to clear the buttons on the UI.
                      }
                       

                      //$scope.center = [e.mapPoint.x,e.mapPoint.y];
                }
                else // no -- maybe they are making a new point?
                {
                    $scope.selectedLocation = null; //since we didn't select an existing one.
        
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
                    $scope.removeFilter(); //also clears location
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
                if($scope.project && $scope.project.$resolved){
                    $scope.reloadProjectLocations();
                }
            });      

            $scope.refreshProjectLocations = function(){
                DataService.clearProject();
                $scope.project = null;
                $scope.project = DataService.getProject($scope.dataset.ProjectId);
            };

            $scope.reloadProjectLocations = function(){

                $scope.locationsArray = getMatchingByField($scope.project.Locations,2,"LocationTypeId");

                $scope.locationObjectIds = getLocationObjectIdsByType(2,$scope.project.Locations);

                if($scope.map && $scope.map.locationLayer && $scope.map.locationLayer.hasOwnProperty('showLocationsById'))
                    $scope.map.locationLayer.showLocationsById($scope.locationObjectIds); //bump and reload the locations.

                //console.log("Project locations loaded!");

            };      

            $scope.$watch('dataset.Fields', function() { 
                if(!$scope.dataset.Fields ) return;
                //load our project based on the projectid we get back from the dataset
                $scope.project = DataService.getProject($scope.dataset.ProjectId);
                $scope.QAStatusList = makeObjects($scope.dataset.QAStatuses, 'Id','Name');

                //hide irrelevant fields
                if($scope.dataset.Datastore.Name == 'Water Temperature')
                {
                    console.log("showing fields");
                    $scope.columnDefs[0].visible = false;
                    $scope.columnDefs[2].visible = true;
                    $scope.columnDefs[3].visible = true;
                }

            });

            $scope.$watch('activities.$resolved', function(){ 
                $scope.loading = true;
                if($scope.activities && $scope.activities.$resolved)
                {
                    $scope.loading = false;
                    
                    if($scope.activities.length > 0)
                    {
                        $scope.gridOptions.ngGrid.data.$promise.then(function(){
                            $rootScope.GridActivities = $scope.gridOptions.ngGrid.data;
                        });
                    }
                }

                //turn off the wheel of fishies
                if(typeof $scope.activities.$resolved == "undefined")
                    $scope.loading = false;
                
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

            //Ok -- this is pretty ugly and non-angular-ish.  This is because in the context of a dijit I'm not sure
            //  how to get angular to process any content here... so we'll have to compose the content " by hand "
            $scope.getInfoContent = function(graphic)
            {
                var location = getByField($scope.locationsArray,graphic.attributes.OBJECTID,"SdeObjectId");
                $scope.map.infoWindow.setTitle(location.Label);

                var html = "";
                
                if(location.Description)
                    html += "<i>" + location.Description + "</i><br/><br/>";

                html += "<b>Type: </b>" + location.LocationType.Name;
                
                if(location.Elevation)
                    html += "<br/><b>Elevation: </b>" + location.Elevation;
                if(location.GPSEasting)
                    html += "<br/><b>Easting: </b>" + location.GPSEasting;
                if(location.GPSNorthing)
                    html += "<br/><b>Northing: </b>" + location.GPSNorthing;
                if(location.Latitude)
                    html += "<br/><b>Latitude: </b>" + location.Latitude;
                if(location.Longitude)
                    html += "<br/><b>Longitude: </b>" + location.Longitude;
                if(location.OtherAgencyId)
                    html += "<br/><b>Other Agency Id: </b>" + location.OtherAgencyId;
                if(location.WettedWidth)
                    html += "<br/><b>Wetted Width: </b>" + location.WettedWidth;
                if(location.WettedDepth)
                    html += "<br/><b>Wetted Depth: </b>" + location.WettedDepth;
                if(location.RiverMile)
                    html += "<br/><b>River Mile: </b>" + location.RiverMile;
                if(location.ImageLink)
                    html += "<br/><br/><a href='"+location.ImageLink+"' target='_blank'><img width='200px' src='"+location.ImageLink+"'/></a>"

                if($scope.Profile.isProjectOwner($scope.project) || $scope.Profile.isProjectEditor($scope.project))
                    html += "<br/><div class='right'><a href='#/datasetimport/"+$scope.dataset.Id+"?LocationId="+location.Id+"'>Import data</a></div>";
                
                return html;

            };

		}


];

mod_dac.controller('DatasetActivitiesCtrl', datasetActivitiesController);