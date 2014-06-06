
'use strict';


/* Controllers */

var mod_ds = angular.module('DatasetControllers', ['ui.bootstrap', 'angularFileUpload','ui.select2']);

mod_ds.controller('ModalAddAccuracyCheckCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService',
  function($scope,  $modalInstance, DataService, DatastoreService){

    $scope.ac_row = {};

    
    $scope.save = function(){
      
      var promise = DatastoreService.saveInstrumentAccuracyCheck($scope.viewInstrument.Id, $scope.ac_row);
      promise.$promise.then(function(){
          $scope.reloadProject();  
          $modalInstance.dismiss();  
      });
      

    };

    $scope.cancel = function(){
      $modalInstance.dismiss();
    };

  }
]);

mod_ds.controller('ModalProjectEditorCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService',
  function($scope,  $modalInstance, DataService, DatastoreService){

    if($scope.row && $scope.row.Id)
    {
        $scope.header_message = "Edit project: " + $scope.project.Name;  
    }
    else
    {
        $scope.header_message = "Create new project";
        $scope.row = {};
    }
    
    $scope.save = function(){
      
       $scope.row.Metadata = [];

       //need to make multi-selects into json objects
       angular.forEach($scope.metadataList, function(md){
            //flatten multiselect values into an json array string
            if(md.Values && md.controlType == "multiselect")
            {
                md = angular.copy(md);
                md.Values = angular.toJson(md.Values).toString(); //wow, definitely need tostring here!
            }

            $scope.row.Metadata.push(md);
        });

        var promise = DataService.saveProject($scope.row);
        promise.$promise.then(function(){
            $scope.reloadProject();  
            $modalInstance.dismiss();  
        });

    };

    $scope.cancel = function(){
      $modalInstance.dismiss();
    };

  }
]);


mod_ds.controller('ModalCreateInstrumentCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService',
  function($scope,  $modalInstance, DataService, DatastoreService){

    $scope.header_message = "Create new instrument";

    $scope.row = {
        StatusId: 0
    };      

    if($scope.viewInstrument)
    {
        $scope.header_message = "Edit instrument: " + $scope.viewInstrument.Name;
        $scope.row = $scope.viewInstrument;
    }


    $scope.InstrumentTypes = DatastoreService.getInstrumentTypes();

    $scope.save = function(){      
        var promise = DatastoreService.saveInstrument($scope.project.Id, $scope.row);
        promise.$promise.then(function(){
            $scope.reloadProject();  
            $modalInstance.dismiss();  
        });
    };

    $scope.cancel = function(){
        $modalInstance.dismiss();
    };
  }
]);



var projectDatasetsController = ['$scope', '$routeParams', 'DataService','DatastoreService', '$rootScope','$modal','$sce',
	function(scope, routeParams, DataService, DatastoreService, $rootScope, $modal,$sce){
		scope.datasets = DataService.getProjectDatasets(routeParams.Id);
    scope.project = DataService.getProject(routeParams.Id);
    scope.currentUserId = $rootScope.Profile.Id;
    scope.filteredUsers = false;
    scope.allInstruments = DatastoreService.getAllInstruments();
    scope.CellOptions = {}; //for metadata dropdown options
    scope.metadataList = {}; 

    scope.metadataPropertiesPromise = DataService.getMetadataProperties(METADATA_ENTITY_PROJECTTYPEID); 
    scope.habitatPropertiesPromise = DataService.getMetadataProperties(METADATA_ENTITY_HABITATTYPEID); 

		var linkTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' + 
            				   '<a href="#/activities/{{row.getProperty(\'Id\')}}">{{row.getProperty("Name")}}</a>' +
            				   '</div>';

    var activityTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' + 
            				   '1/10/2014 @ 8:20 AM by Ken Burcham -- FIXME' +
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

        var fileLinkTemplate = '<a href="{{row.getProperty(\'Link\')}}" target="_blank">' +
                                '<img ng-src="{{row.getProperty(\'Link\')}}" width="150px"/><br/><div class="ngCellText" ng-class="col.colIndex()">' + 
                               '</a>' +
                               '</div>';

        var uploadedBy = '<div class="ngCellText" ng-class="col.colIndex()">' + 
                               '{{row.getProperty("UploadDate")|date}} by {{row.getProperty("User.Fullname")}}' +
                               '</div>';                               
        scope.FileFilterOptions = {};
        scope.gridFiles = {
            data: 'project.Docs',
            columnDefs:
            [
                {field:'Name',displayName: 'File Name', cellTemplate: fileLinkTemplate},
                {field: 'Title'},
                {field: 'Description'},
                {field: 'Uploaded', displayName: "Uploaded", cellTemplate: uploadedBy},
                {field: 'Size'},
            ],
            filterOptions: scope.FileFilterOptions
        };

        scope.GalleryFilterOptions = {};
        scope.gridGallery = {
            data: 'project.Images',
            columnDefs:
            [
                {field:'Name',displayName: 'File Name', cellTemplate: fileLinkTemplate},
                {field: 'Title'},
                {field: 'Description'},
                {field: 'Uploaded', displayName: "Uploaded", cellTemplate: uploadedBy},
                {field: 'Size'},
            ],
            filterOptions: scope.GalleryFilterOptions

        };
         
         scope.users = [];
         scope.$watch('project.Id', function(){
            if(scope.project && scope.project.Id)
            {
                scope.editors = scope.project.Editors;
                scope.users = DataService.getUsers();

                scope.project.MetadataValue = {};
                scope.project.Images = [];
                scope.project.Docs = [];
                
                //split out the images and other files.
                
                angular.forEach(scope.project.Files, function(file, key){
                    if(file.FileType.Name=="Image")
                        scope.project.Images.push(file);
                    else
                        scope.project.Docs.push(file);
                });
                
                //reload if it is already selected
                if(scope.viewInstrument)
                {
                    scope.viewInstrument = getMatchingByField(scope.project.Instruments, scope.viewInstrument.Id, 'Id')[0]; 
                }

                //add in the metadata to our metadataList that came with this dataset
                scope.addMetadataProperties(scope.project.Metadata);
                
                scope.mapHtml = $sce.trustAsHtml(scope.project.MetadataValue[25]);
                scope.imagesHtml = $sce.trustAsHtml(scope.project.MetadataValue[13]);


                //get habitat (and possibly other?) metadata values for this project.  they don't come with project metadata as they are their own category.
                var habitatProjectMetadataPromise = DataService.getMetadataFor(scope.project.Id, METADATA_ENTITY_HABITATTYPEID);
                habitatProjectMetadataPromise.$promise.then(function(list){
                    scope.addMetadataProperties(list);
                });

            }

         });

        //metadata -- we have a list of metadata properties that are configured for "project" entities.
        //  any metadata already associated with a project come in teh project's Metadata array, but ones that haven't
        //  been given a value yet on a specific project won't appear and need to be added in separately.


        scope.metadataPropertiesPromise.promise.then(function(list){
            scope.addMetadataProperties(list);
        });

        scope.habitatPropertiesPromise.promise.then(function(list){
            scope.addMetadataProperties(list);
        });
          
        //might be a list of metadata values from project.Metadata or a list of actual properties.
        scope.addMetadataProperties = function(metadata_list)
        {
            angular.forEach(metadata_list, function(i_property, key){
              
                var property = i_property;
                if(i_property.MetadataPropertyId) //is it a value from project.Metadata? if so then grab the property.
                    property = DataService.getMetadataProperty(i_property.MetadataPropertyId);

                //property var is a "metadataProperty" (not a metadata value)

                //if it isn't already there, add it as an available option
                if(!(property.Name in scope.metadataList))
                {
                    scope.metadataList[property.Name] =
                    {
                        field: property.Name,
                        MetadataPropertyId: property.Id,
                        controlType: property.ControlType,
                    };
                }

                //set the value no matter what if we have it.
                if(i_property.Values)
                {
                  if(property.ControlType == "multiselect")
                  {
                      //need to see if we are dealing with old style (just a list) or if it is a bonafide object.
                      var values;
                      try{
                        values = angular.fromJson(i_property.Values);
                      }
                      catch(e)  //if we can't then it wasn't an object... use split instead.
                      {
                        values = i_property.Values.split(",")
                      }
                        
                      scope.metadataList[property.Name].Values = values;
                  }
                  else
                  {
                      scope.metadataList[property.Name].Values = i_property.Values;
                  }
                
                  scope.project.MetadataValue[property.Id] = scope.metadataList[property.Name].Values; //make it easy to get values by metadata id.
                }
                else
                  scope.metadataList[property.Name].Values = "";



                if(property.PossibleValues)
                {
                  populateMetadataDropdowns(scope,property); //setup the dropdown
                  scope.metadataList[property.Name].options = scope.CellOptions[property.Id+"_Options"];      
                }

                
            });
        }


         scope.openAccuracyCheckForm = function(){
            var modalInstance = $modal.open({
              templateUrl: 'partials/instruments/modal-new-accuracycheck.html',
              controller: 'ModalAddAccuracyCheckCtrl',
              scope: scope, //very important to pass the scope along... 
        
            });
         };

         scope.createInstrument = function(){
            var modalInstance = $modal.open({
              templateUrl: 'partials/instruments/modal-create-instrument.html',
              controller: 'ModalCreateInstrumentCtrl',
              scope: scope, //very important to pass the scope along... 
            });
         };

        scope.editViewInstrument = function(){
            var modalInstance = $modal.open({
              templateUrl: 'partials/instruments/modal-create-instrument.html',
              controller: 'ModalCreateInstrumentCtrl',
              scope: scope, //very important to pass the scope along... 
            });
         };

         scope.openProjectEditor = function(){
            scope.row = scope.project; //
            var modalInstance = $modal.open({
              templateUrl: 'partials/project/modal-edit-project.html',
              controller: 'ModalProjectEditorCtrl',
              scope: scope, //very important to pass the scope along... 
        
            });
         };

         scope.getDataGrade = function(check){ return getDataGrade(check)}; //alias from service

         scope.viewInstrument = null; //what they've clicked to view accuracy checks
         scope.selectedInstrument = null; //what they've selected in the dropdown to add to the project
         scope.reloadProject = function(){
                //reload project instruments -- this will reload the instruments, too
                DataService.clearProject();
                scope.project = DataService.getProject(routeParams.Id);
         };

         scope.addInstrument = function(){
            if(!scope.selectedInstrument || getMatchingByField(scope.project.Instruments, scope.selectedInstrument, 'Id').length > 0)
                return;

            var Instruments = getMatchingByField(scope.allInstruments, scope.selectedInstrument, 'Id');
            
            var promise = DatastoreService.saveProjectInstrument(scope.project.Id, Instruments[0]);

            promise.$promise.then(function(){
                scope.reloadProject();
            });


         };

         scope.removeViewInstrument = function(){
            if(!scope.viewInstrument)
                return;

            var promise = DatastoreService.removeProjectInstrument(scope.project.Id, scope.viewInstrument.Id);
            
            promise.$promise.then(function(){
                scope.reloadProject();
            });
              

         };

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

         scope.viewSelectedInstrument = function(instrument){
            scope.viewInstrument = instrument;
         };


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
            console.log("Add Editor.");
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


var projectsController = ['$scope', 'DataService',
  function(scope, DataService){
    scope.projects = DataService.getProjects();

        var linkTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' + 
                               '<a title="{{row.getProperty(\'Description\')}}" href="#/projects/{{row.getProperty(\'Id\')}}">{{row.getProperty("Name")}}</a>' +
                               '</div>';

        scope.gridOptionsFilter = {};
        scope.gridOptions = {
            data: 'projects',
            columnDefs:
            [
                {field: 'Program', displayName:'Program', width:'200'},
                {field: 'ProjectType.Name',displayName:'Type', width: '100'},
                {field: 'Name', displayName: 'Project Name', cellTemplate: linkTemplate},
            ],
            showColumnMenu: true,
            filterOptions: scope.gridOptionsFilter,
            multiSelect: false,
        };

        scope.$watch('projects',function(){
            if(scope.projects)
            {
                //spin through and add a "Program" field to our project that we can display easily in teh grid.
                angular.forEach(scope.projects, function(project, key){
                    var program = getByField(project.Metadata,'23','MetadataPropertyId');
                    var subprogram = getByField(project.Metadata,'24','MetadataPropertyId');
                  
                    if(program) project.Program = program.Values;

                    if(subprogram && subprogram.Values != "(None)")
                      project.Program += " > " + subprogram.Values;

                });
            }
        },true);

  }
];

var loginController = ['$scope','DataService',
  function(scope, DataService){
    
  }
];

mod_ds.controller('ProjectsCtrl', projectsController);
mod_ds.controller('ProjectDatasetsCtrl', projectDatasetsController);

