//appraisal controller
'use strict';

var mod_apr = angular.module('AppraisalControllers', ['ui.bootstrap']);

var appraisalController = ['$scope','$route','$routeParams', 'DataService', '$modal', '$location','$window', '$rootScope','DatastoreService',
    	function ($scope, $route, $routeParams, DataService, $modal, $location, $window, $rootScope, DatastoreService) {

            $scope.dataset = DataService.getDataset($routeParams.Id);
            $scope.activities = DataService.getActivities($routeParams.Id);
            $scope.loading = true;
            $scope.project = null;
            $scope.saveResults = null;
            $scope.isFavorite = $rootScope.Profile.isDatasetFavorite($routeParams.Id);
            $scope.allActivities = null;
            $scope.headerdata = DataService.getHeadersDataForDataset($routeParams.Id);
            $scope.filteringActivities = false;

            //console.log("Profile = ");
            //console.dir($rootScope.Profile);

            var linkTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' + 
            				   '<a href="#/dataview/{{row.getProperty(\'Id\')}}">{{row.getProperty("ActivityDate") | date:\'MM/dd/yyyy\'}}</a>' +
            				   '</div>';

            var desclinkTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' + 
                               '<a href="#/dataview/{{row.getProperty(\'Id\')}}">{{row.getProperty("Description") }}</a>' +
                               '</div>';

            var allotmentTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' + 
                               '<a href="#/dataview/{{row.getProperty(\'Id\')}}">{{row.getProperty("headerdata.Allotment") }}</a>' +
                               '</div>';


            var QATemplate = '<div class="ngCellText" ng-class="col.colIndex()">{{QAStatusList[row.getProperty("ActivityQAStatus.QAStatusId")]}}</div>';

            //performance idea: if project-role evaluation ends up being slow, you can conditionally include here...
          	var editButtonTemplate = '<div project-role="editor" class="ngCellText" ng-class="col.colIndex()">' + 
            				   '<a href="#/edit/{{row.getProperty(\'Id\')}}">Edit</a>' +
            				   '</div>';

            $scope.columnDefs = [
                        {field:'ActivityDate', displayName:'Activity Date', cellTemplate: linkTemplate, width:'100px', visible: false},

                        {field:'headerdata.Allotment',displayName: 'Parcel Id', cellTemplate: allotmentTemplate, width: '140px'},
                        {field:'headerdata.AllotmentStatus',displayName: 'Status'},
                        {field:'headerdata.CobellAppraisalWave',displayName: 'Wave', width: '200px'},

                        {field:'headerdata.LastAppraisalRequestDate',displayName: 'Request Date', width: '200px', cellFilter: 'date'},

                        //{field:'Location.Label',displayName: 'Location'},
                    
                        {field:'User.Fullname',displayName: 'By User', width: '120px'},
                        {field:'QAStatus', displayName: 'QA Status', cellTemplate: QATemplate, width: '100px', visible: false},
                        {field:'Actions',displayName: '', cellTemplate: editButtonTemplate, width: '40px'},

                    ];

            $scope.showFilter = false;


            $scope.selectedActivity = [];

            $scope.gridOptionsFilter = {};
            $scope.gridOptions = {
            	data: 'activities',
                selectedItems: $scope.selectedActivity,
            	showColumnMenu: true,
                sortInfo: {fields:['headerdata.Allotment'], directions: ['desc']},
            	columnDefs: 'columnDefs',
                filterOptions: $scope.gridOptionsFilter,
                multiSelect: false,

            };

            //someone clicks search on the 
            $scope.parcelSearch = function()
            {
                if(!$scope.parcelSearchText)
                    return;

                $scope.hasResults = true;
                $scope.map.searchResults = [];
                $scope.map.searchMessage = "Searching...";

                $scope.map.querySearchParcel($scope.parcelSearchText, function(features){
                    if(features.length == 0)
                    {
                        $scope.map.searchMessage = "No results found.";
                    }
                    else
                    {
                        angular.forEach(features, function(feature){
                            $scope.map.searchResults.push(feature.attributes);
                        });
                    }
                    $scope.$apply();
                    
                });
            }

            //when someone clicks an item in the returned list of parcels
            $scope.selectParcel = function(parcelObjectId)
            {
                $scope.map.loading = true;
                $scope.clearAll();
                $scope.map.querySelectParcel(null,parcelObjectId, function(features){
                    $scope.map.loading = false;
                    if (features.length == 0) { 
                          alert('No parcel polygon found that matches that allotment.');
                          return;
                    };

                    $scope.map.addParcelToMap(features[0]);
                    $scope.map.centerAndZoomToGraphic($scope.map.selectedGraphic).then(function(){
                        //show the infowindow
                        $scope.map.infoWindow.resize(250, 300);
                        $scope.map.infoWindow.setContent($scope.getInfoWindowContent(features[0]));
                        $scope.map.infoWindow.show($scope.map.selectedGraphic.geometry.getExtent().getCenter());    
                    });
                   
                    $scope.$apply();
                    
                });
            };

            $scope.clearAll = function()
            {
                $scope.activities = $scope.allActivities;
                $scope.filteredActivities = undefined;
                $scope.map.clearGraphics();
                $scope.map.infoWindow.hide();
                $scope.map.selectedFeature = undefined;
                $scope.filteringActivities = false;
            };


            //when someone clicks an item in the grid, angular will add it to the selectedItems array, so we watch that.
            $scope.$watch('gridOptions.selectedItems', function(){

                if(!$scope.gridOptions.selectedItems || $scope.gridOptions.selectedItems.length == 0 )
                    return;

                //if clicked on the already selected one, do nothing.
                if($scope.map.selectedFeature && 
                    $scope.map.selectedFeature.attributes.OBJECTID == $scope.gridOptions.selectedItems[0].Location.SdeObjectId)
                {
                    return;
                }

                $scope.map.selectedFeature = undefined;
                $scope.map.loading = true;

  //              console.log("clicked a grid item.  querying for: ");
//                console.dir($scope.gridOptions.selectedItems[0].Location.SdeObjectId);
                var selectedAppraisal = $scope.gridOptions.selectedItems[0];
                $scope.clearAll();
                $scope.map.querySelectParcel(null,selectedAppraisal.Location.SdeObjectId, function(features){
                    $scope.map.loading = false;
                    if (features.length == 0) { 
                          //alert('No parcel polygon found that matches that appraisal.');
                          return;
                    };

                    $scope.map.addParcelToMap(features[0]);
                    $scope.map.centerAndZoomToGraphic($scope.map.selectedGraphic).then(function(){
                        //show the infowindow
                        $scope.map.infoWindow.resize(250, 300);
                        $scope.map.infoWindow.setContent($scope.getInfoWindowContent(features[0]));
                        $scope.map.infoWindow.show($scope.map.selectedGraphic.geometry.getExtent().getCenter());    
                    });

                    $scope.$apply();
                });

            },true);

            $scope.filterByFeature = function(features){

            }
            
            // expose a method for handling clicks ON THE MAP - this is linked to from the Map.js directive
            $scope.click = function(e){
                $scope.map.loading = true;
                $scope.clearAll();
                $scope.map.reposition(); //this is important or else we end up with our map points off somehow.

                $scope.map.querySelectParcel(e.mapPoint, null, function(features){
                    if (features.length == 0) { 
                      alert('No parcel found at that location.');
                      $scope.map.loading = false;
                      $scope.$apply(); //bump angular
                      return;
                    };

                    $scope.map.addParcelToMap(features[0]);

                    //show the infowindow
                    $scope.map.infoWindow.resize(250, 300);
                    $scope.map.infoWindow.setContent($scope.getInfoWindowContent(features[0]));
                    $scope.map.infoWindow.show($scope.map.selectedGraphic.geometry.getExtent().getCenter());

                    console.log("Found ObjectId: " + $scope.map.selectedFeature.attributes.OBJECTID);

                    var objectid = $scope.map.selectedFeature.attributes.OBJECTID;

                    $scope.filteredActivities = [];

                    //now select the item in the grid
                    angular.forEach($scope.allActivities, function(item, index){

                        if(item.Location.SdeObjectId == objectid){
                            $scope.filteredActivities.push(item);                       
                        }
                    });

                    
                    $scope.activities = $scope.filteredActivities;
                    $scope.filteringActivities = true; //need this because we also filter to empty...
                    $scope.map.loading = false;
                    $scope.$apply(); //bump angular



                });
            };
          
            //start a new appraisal record (really just an activity data entry for appraisal dataset)
            $scope.newRecord = function()
            {
                //create a new location from the map feature selected
                var new_location = {
                    LocationTypeId: LOCATION_TYPE_APPRAISAL,
                    SdeFeatureClassId: SDE_FEATURECLASS_TAXLOTQUERY,
                    SdeObjectId: $scope.map.selectedFeature.attributes.OBJECTID,
                    Label: $scope.map.selectedFeature.attributes.PARCELID,

                };
                

                var promise = DatastoreService.saveNewProjectLocation($scope.project.Id, new_location);
                promise.$promise.then(function(){ 
                   console.log("done and success!");

                   //reload the project locations and spin through to grab our new locationId for the one we just created.
                   $scope.refreshProjectLocations();
                   $scope.project.$promise.then(function(){
                        //grab our new locationId
                        var location = getByField($scope.project.Locations, $scope.map.selectedFeature.attributes.OBJECTID,"SdeObjectId");
                        var acres = $scope.map.selectedFeature.attributes.ACRES_GIS;
                        
                        //bounce the user to the data entry form with that location selected.
                        $location.path("/dataentryform/"+$scope.dataset.Id).search({LocationId: location.Id, Allotment: location.Label, Acres: acres});
                   });
                    
                   
                });

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
                

            };

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

                $scope.locationsArray = getMatchingByField($scope.project.Locations,LOCATION_TYPE_APPRAISAL,"LocationTypeId");

                $scope.locationObjectIds = getLocationObjectIdsByType(LOCATION_TYPE_APPRAISAL,$scope.project.Locations);

                if($scope.map && $scope.map.locationLayer && $scope.map.locationLayer.hasOwnProperty('showLocationsById'))
                    $scope.map.locationLayer.showLocationsById($scope.locationObjectIds); //bump and reload the locations.

                //console.log("Project locations loaded!");

            };      

            $scope.reloadActivities = function(){
                $scope.activities = DataService.getActivities($routeParams.Id);
            };

            $scope.$watch('dataset.Fields', function() { 
                if(!$scope.dataset.Fields ) return;
                //load our project based on the projectid we get back from the dataset
                $scope.project = DataService.getProject($scope.dataset.ProjectId);
                $scope.QAStatusList = makeObjects($scope.dataset.QAStatuses, 'Id','Name');

            });

            $scope.$watch('activities.$resolved', function(){ 
                $scope.loading = true;
                if($scope.activities && $scope.activities.$resolved)
                {

                    if(!$scope.allActivities)
                       $scope.allActivities = $scope.activities;

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

            //Maybe there is a better way?!
            $scope.activities.$promise.then(function(){
                $scope.headerdata.$promise.then(function(){
                    angular.forEach($scope.activities, function(activity, key){
                        activity.headerdata = getByField($scope.headerdata, activity.Id, "ActivityId");
                    });
                });
            });


            $scope.openQueryWindow = function(p) {
            	$location.path("/datasetquery/"+$scope.dataset.Id);
            };

            $scope.openDetailsWindow = function(p) {
            	$location.path("/dataset-details/"+$scope.dataset.Id);
            };
            
            $scope.deleteActivities = function() {
                $scope.saveResults = {};
                if(!confirm("Are you sure you want to delete this allotment?  There is no undo for this operation."))
                    return;

                DataService.deleteActivities($rootScope.Profile.Id, $scope.dataset.Id, $scope.gridOptions, $scope.saveResults);
                var deleteWatcher = $scope.$watch('saveResults', function(){
                    if($scope.saveResults.success)
                    {
                        $scope.activities = undefined;
                        $route.reload();
                    }
                    else if($scope.saveResults.failure)
                    {
                        deleteWatcher();
                        console.log("failure! there was a problem deleting a record...");
                    }
                },true);
            };

			$scope.openDataEntry = function (p) { $location.path("/dataentry/"+$scope.dataset.Id);	};

            

            //This is very specific to this appraisal page... might be nice to make this pluggable or something. --even just use a partial?
            $scope.getInfoWindowContent = function(feature)
            {
                var attributes = feature.attributes;
                var location = getByField($scope.locationsArray,feature.attributes.OBJECTID,"SdeObjectId"); //is there already a location for this OBJECTID?

                if(location)
                    var allotment = getByField($scope.activities,location.Id,"LocationId"); //is there already an allotment associated with this location?

                $scope.map.infoWindow.setTitle(feature.attributes.PARCELID);

                var html = "";
                
                if(allotment && allotment.headerdata.CobellAppraisalWave)
                    html += "<b>Wave: </b>" + allotment.headerdata.CobellAppraisalWave + "<br/>";
                if(allotment && allotment.headerdata.AllotmentStatus)
                    html += "<b>Appraisal Status: </b>" + allotment.headerdata.AllotmentStatus + "<hr/>";

                if(attributes.Address && attributes.Address.trim() != "")
                    html += "<b>Address: </b>" + attributes.Address + "<br/>";
                if(attributes.OWNERSHIPS)
                    html += "<b>Ownership: </b>" + attributes.OWNERSHIPS + "<br/>";
                if(attributes.ACRES_GIS)
                    html += "<b>Acres (GIS): </b>" + attributes.ACRES_GIS;
                
                if(allotment && allotment.Id)
                    html += "<br/><div class='right'><a href='#dataview/"+allotment.Id+"'>View</a></div>";
                
                return html;

            };

		}


];

mod_apr.controller('AppraisalCtrl', appraisalController);