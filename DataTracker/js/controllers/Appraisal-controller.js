//appraisal controller
'use strict';

var LOCATION_TYPE_APPRAISAL = 8;

var mod_apr = angular.module('AppraisalControllers', ['ui.bootstrap']);

var appraisalController = ['$scope','$routeParams', 'DataService', '$modal', '$location','$window', '$rootScope',
    	function ($scope, $routeParams, DataService, $modal, $location, $window, $rootScope) {
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

                        {field:'headerdata.Allotment',displayName: 'Parcel Id', cellTemplate: allotmentTemplate, width: '100px'},
                        {field:'headerdata.AllotmentStatus',displayName: 'Status', width: '200px'},

                        {field:'Location.Label',displayName: 'Location'},
                    
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

                            console.dir(feature);
                            $scope.map.searchResults.push(feature.attributes);
                        });
                    }
                    $scope.$apply();
                    
                });
            }

            $scope.selectParcel = function(parcelObjectId)
            {
                $scope.map.clearGraphics();
                $scope.map.querySelectParcel(null,parcelObjectId, function(features){
                    if (features.length == 0) { 
                          alert('No parcel polygon found that matches that allotment.');
                          return;
                    };

                    $scope.map.addParcelToMap(features[0]);
                    $scope.map.centerAndZoomToGraphic($scope.map.selectedGraphic);
                });
            };

            $scope.removeFilter = function()
            {
                $scope.activities = $scope.allActivities;
                $scope.filteredActivities = undefined;
                $scope.map.clearGraphics();
                $scope.map.infoWindow.hide();
                $scope.map.selectedFeature = undefined;
                $scope.filteringActivities = false;
            };

            $scope.$watch('gridOptions.selectedItems', function(){

                //if clicked on the already selected one, do nothing.
                if($scope.map.selectedFeature && 
                    $scope.map.selectedFeature.attributes.OBJECTID == $scope.gridOptions.selectedItems[0].Location.SdeObjectId)
                {
                    return;
                }

                $scope.map.selectedFeature = undefined;

                console.log("clicked a grid item.  querying for: ");
                console.dir($scope.gridOptions.selectedItems[0].Location.SdeObjectId);
                var selectedAppraisal = $scope.gridOptions.selectedItems[0];
                $scope.map.clearGraphics();
                $scope.map.querySelectParcel(null,selectedAppraisal.Location.SdeObjectId, function(features){
                    if (features.length == 0) { 
                          //alert('No parcel polygon found that matches that appraisal.');
                          return;
                    };

                    $scope.map.addParcelToMap(features[0]);
                    $scope.map.centerAndZoomToGraphic($scope.map.selectedGraphic);
                    console.log("Found ObjectId: " + $scope.map.selectedFeature.attributes.OBJECTID);
                });
            },true);

            $scope.filterByFeature = function(features){

            }
            
            // expose a method for handling clicks ON THE MAP - this is linked to from the Map.js directive
            $scope.click = function(e){
                
                $scope.map.reposition(); //this is important or else we end up with our map points off somehow.

                $scope.map.querySelectParcel(e.mapPoint, null, function(features){
                    if (features.length == 0) { 
                      alert('No parcel found at that location.');
                      return;
                    };

                    $scope.map.addParcelToMap(features[0]);
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

                    $scope.$apply(); //bump angular



                });
            };

            //fires when a map parcel is selected -- filter the grid to show just matching allotments
            $scope.$on("map.selectedFeature", function(event, args){
                //console.dir(event);
                console.log("boom we had a selectedfeature event!");
            });
          
         

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

mod_apr.controller('AppraisalCtrl', appraisalController);