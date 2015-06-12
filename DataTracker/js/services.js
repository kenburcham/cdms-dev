'use strict';

var mod = angular.module('DatasetServices', ['ngResource']);

//Note: typically you won't want to use these factories directly in your
// controllers, but rather use the DataService below.
mod.factory('Projects',['$resource', function(resource){
        return resource(serviceUrl+'/api/projects',{}, {
            query: {method: 'GET', params: {}, isArray: true}
        });
}]);

mod.factory('Users',['$resource', function($resource){
        return $resource(serviceUrl+'/api/users', {}, {
            query: {method: 'GET', params: {}, isArray: true}
        });
}]);

mod.factory('Project',['$resource', function($resource){
        return $resource(serviceUrl+'/api/projects', {}, {
            query: {method: 'GET', params: {id:'id'}, isArray: false}
        });
}]);

mod.factory('ProjectDatasets',['$resource', function($resource){
        return $resource(serviceUrl+'/action/ProjectDatasets', {}, {
            query: {method: 'GET', params: {id:'projectId'}, isArray: true}
        });
}]);

mod.factory('Activities',['$resource', function($resource){
        return $resource(serviceUrl+'/action/DatasetActivities', {}, {
            query: {method: 'GET', params: {id:'datasetId'}, isArray: true}
        });
}]);

mod.factory('Datasets',['$resource', function($resource){
        return $resource(serviceUrl+'/api/datasets', {}, {
            query: {method: 'GET', params: {id:'datasetId'}, isArray: false}
        });
}]);

mod.factory('Data',['$resource', function($resource){
        return $resource(serviceUrl+'/action/DatasetData', {}, {
            query: {method: 'GET', params: {id:'activityId'}, isArray: false}
        });
}]);

mod.factory('SaveActivitiesAction', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SaveDatasetActivities');
}]);

mod.factory('UpdateActivitiesAction', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/UpdateDatasetActivities');
}]);

mod.factory('QueryActivitiesAction',  ['$resource', function($resource){
        return $resource(serviceUrl+'/data/QueryDatasetActivities', {}, {
           save: {method: 'POST', isArray: true}
        });
}]);

mod.factory('ExportActivitiesAction',  ['$resource', function($resource){
        return $resource(serviceUrl+'/data/DownloadDatasetActivities', {}, {
           save: {method: 'POST', isArray: false}
        });
}]);

mod.factory('SetProjectEditors', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SetProjectEditors');
}]);

mod.factory('DeleteActivitiesAction', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/DeleteDatasetActivities');
}]);

mod.factory('DeleteLocationAction', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/DeleteLocation');
}]);


mod.factory('SetQaStatusAction', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SetQaStatus');
}]);

mod.factory('GetMyDatasetsAction', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetMyDatasets', {}, {
            query: {method: 'GET', params: {}, isArray: true}
        });
}]);

mod.factory('GetMyProjectsAction', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetMyProjects', {}, {
            query: {method: 'GET', params: {}, isArray: true}
        });
}]);


mod.factory('SaveUserPreferenceAction', ['$resource', function($resource){
        return $resource(serviceUrl+'/action/SaveUserPreference');
}]);

mod.factory('GetMetadataProperties', ['$resource', function($resource){
        return $resource(serviceUrl+'/api/MetadataProperties');
}]);

mod.factory('GetAllPossibleDatastoreLocations', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetAllPossibleDatastoreLocations');
}]);

mod.factory('GetAllDatastoreFields', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetAllDatastoreFields');
}]);

mod.factory('GetDatastore', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetDatastore', {}, { query: {method: 'GET', params: {}, isArray: false}});
}]);

mod.factory('GetDatastoreProjects', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetDatastoreProjects');
}]);

mod.factory('GetAllDatastores', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetAllDatastores');
}]);

mod.factory('GetDatastoreDatasets', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetDatastoreDatasets');
}]);


mod.factory('SaveDatasetMetadata', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SetDatasetMetadata');
}]);

mod.factory('GetSources', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetSources');
}]);

mod.factory('GetInstruments', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetInstruments');
}]);

mod.factory('SaveDatasetField', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SaveDatasetField');
}]);

mod.factory('SaveMasterField', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SaveMasterField');
}]);

mod.factory('DeleteDatasetField', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/DeleteDatasetField');
}]);

mod.factory('GetAllFields', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetAllFields');
}]);

mod.factory('GetLocationTypes', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetLocationTypes');
}]);

mod.factory('AddMasterFieldToDataset', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/AddMasterFieldToDataset');
}]);

mod.factory('SaveProjectLocation', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SaveProjectLocation');
}]);

mod.factory('GetAllInstruments', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetAllInstruments');
}]);

mod.factory('SaveProjectInstrument', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SaveProjectInstrument');
}]);

mod.factory('SaveInstrument', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SaveInstrument');
}]);

mod.factory('SaveInstrumentAccuracyCheck', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SaveInstrumentAccuracyCheck');
}]);

mod.factory('GetInstrumentTypes', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetInstrumentTypes');
}]);

mod.factory('RemoveProjectInstrument', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/RemoveProjectInstrument');
}]);

mod.factory('GetMetadataFor',['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetMetadataFor', {}, {
           save: {method: 'POST', isArray: true}
        });
}]);

mod.factory('GetWaterBodies', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetWaterBodies');
}]);

mod.factory('SaveProject', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/SaveProject');
}]);


mod.factory('GetHeadersDataForDataset', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetHeadersDataForDataset');
}]);

mod.factory('UpdateFile', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/UpdateFile');
}]);

mod.factory('DeleteFile', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/DeleteFile');
}]);

mod.factory('GetTimeZones', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetTimeZones');
}]);

mod.factory('GetDepartments', ['$resource', function($resource){
        return $resource(serviceUrl+'/api/Department');
}]);

mod.factory('GetRelationData', ['$resource', function($resource){
        return $resource(serviceUrl+'/data/GetRelationData',{},{
                       save: {method: 'POST', isArray: true}
        });
}]);




mod.service('DatastoreService', ['$q','GetAllPossibleDatastoreLocations','GetAllDatastoreFields','GetDatastore','GetDatastoreProjects','GetAllDatastores','GetDatastoreDatasets','GetSources','GetInstruments','SaveDatasetField','SaveMasterField','DeleteDatasetField','GetAllFields','AddMasterFieldToDataset','GetLocationTypes','SaveProjectLocation','GetAllInstruments','SaveProjectInstrument','SaveInstrument','SaveInstrumentAccuracyCheck','GetInstrumentTypes','RemoveProjectInstrument','GetWaterBodies','UpdateFile','DeleteFile','GetTimeZones','DeleteLocationAction',
    function($q, GetAllPossibleDatastoreLocations,GetAllDatastoreFields,GetDatastore,GetDatastoreProjects,GetAllDatastores,GetDatastoreDatasets, GetSources, GetInstruments,SaveDatasetField, SaveMasterField, DeleteDatasetField,GetAllFields, AddMasterFieldToDataset, GetLocationTypes, SaveProjectLocation,GetAllInstruments,SaveProjectInstrument,SaveInstrument, SaveInstrumentAccuracyCheck, GetInstrumentTypes, RemoveProjectInstrument,GetWaterBodies,UpdateFile,DeleteFile, GetTimeZones,DeleteLocationAction){
        var service = {

            datastoreId: null,

            getLocations: function(id)
            {
                service.datastoreId = id;
                return GetAllPossibleDatastoreLocations.query({id: id});
            },

            getFields: function(id)
            {
                return GetAllDatastoreFields.query({id: id});
            },
            getMasterFields: function(categoryId){
                return GetAllFields.query({id: categoryId});
            },
            getDatastore: function(id)
            {
                return GetDatastore.query({id: id});
            },

            getProjects: function(id)
            {
                return GetDatastoreProjects.query({id: id});
            },

            getDatastores: function()
            {
                return GetAllDatastores.query();
            },

            getWaterBodies: function()
            {
                return GetWaterBodies.query();
            },

            getDatasets: function(id)
            {
                return GetDatastoreDatasets.query({id: id});
            },
            getSources: function()
            {
                return GetSources.query();
            },
            getInstruments: function()
            {
                return GetInstruments.query();
            },
            getInstrumentTypes: function()
            {
                return GetInstrumentTypes.query();
            },
            getLocationTypes: function()
            {
                return GetLocationTypes.query();
            },
            saveDatasetField: function(field, saveResults)
            {
                saveResults.saving = true;

                SaveDatasetField.save(field, function(data){
                    saveResults.saving = false;
                    saveResults.success = true;
                }, function(data){
                    saveResults.saving = false;
                    saveResults.failure = true;
                });

            },
            saveMasterField: function(field, saveResults)
            {
                saveResults.saving = true;

                SaveMasterField.save(field, function(data){
                    saveResults.saving = false;
                    saveResults.success = true;
                }, function(data){
                    saveResults.saving = false;
                    saveResults.failure = true;
                });

            },
            saveNewProjectLocation: function(projectId, location)
            {
                return SaveProjectLocation.save({ProjectId: projectId, Location: location});
            },
            addMasterFieldToDataset: function(datasetId, fieldId)
            {
                return AddMasterFieldToDataset.save({DatasetId: datasetId, FieldId: fieldId});
            },

            removeField: function(datasetId, fieldId)
            {
                return DeleteDatasetField.save({DatasetId: datasetId, FieldId: fieldId});
            },
            getAllInstruments: function()
            {
                return GetAllInstruments.query();
            },
            saveInstrument: function(projectId, instrument){
                return SaveInstrument.save({ProjectId: projectId, Instrument: instrument}); //will connect to this project if creating instrument
            },
            saveProjectInstrument: function(projectId, instrument){
                return SaveProjectInstrument.save({ProjectId: projectId, Instrument: instrument});
            },
            removeProjectInstrument: function(projectId, instrumentId){
                return RemoveProjectInstrument.save({ProjectId: projectId, InstrumentId: instrumentId});
            },
            saveInstrumentAccuracyCheck: function(instrumentId, ac)
            {
                return SaveInstrumentAccuracyCheck.save({InstrumentId: instrumentId, AccuracyCheck: ac});
            },
            updateFile: function(projectId, file)
            {
                return UpdateFile.save({ProjectId: projectId, File: file});
            },
            deleteFile: function(projectId, file)
            {
                return DeleteFile.save({ProjectId: projectId, File: file});
            },
            deleteLocation: function(locationId)
            {
                return DeleteLocationAction.save({LocationId: locationId});
            },
            getTimeZones: function()
            {
                return GetTimeZones.query();
            }



        };

        return service;
    }
]);

mod.service('DataService', ['$q','$resource', 'Projects', 'Users','Project','ProjectDatasets', 'Activities', 'Datasets', 'Data', 'SaveActivitiesAction', 'UpdateActivitiesAction','QueryActivitiesAction','SetProjectEditors', 'DeleteActivitiesAction', 'SetQaStatusAction', 'GetMyDatasetsAction','GetMyProjectsAction','SaveUserPreferenceAction','ExportActivitiesAction','GetMetadataProperties','SaveDatasetMetadata','GetMetadataFor','SaveProject','GetHeadersDataForDataset','GetDepartments','GetRelationData',
    function($q, resource, Projects, Users, Project, ProjectDatasets, Activities, Datasets, Data, SaveActivitiesAction, UpdateActivitiesAction, QueryActivitiesAction, SetProjectEditors, DeleteActivitiesAction, SetQaStatusAction, GetMyDatasetsAction, GetMyProjectsAction, SaveUserPreferenceAction, ExportActivitiesAction,GetMetadataProperties, SaveDatasetMetadata, GetMetadataFor, SaveProject,GetHeadersDataForDataset, GetDepartments, GetRelationData){
    var service = {

        //our "singleton cache" kinda thing
        project: null,
        dataset: null,
        metadataProperties: null,

        clearDataset: function()
        {
            service.dataset = null;
        },

        clearProject: function()
        {
            service.project = null;
        },

        getProject: function(id) {
            if(service.project && service.project.Id == id)
                return service.project;

            service.project = Project.query({id: id});

            service.project.$promise.then(function(){
                //console.log("after-project-load!");
                //do some sorting after we load for instruments
                if(service.project.Instruments.length > 0)
                {
                    service.project.Instruments = service.project.Instruments.sort(orderByAlphaName);
                }

                //and also for locations
                //service.project.Locations = service.project.Locations.sort(orderByAlpha);
            });

            return service.project;
        },

        getMyDatasets: function() {
            return GetMyDatasetsAction.query();
        },

        getMyProjects: function() {
            return GetMyProjectsAction.query();
        },

        getDataset: function(datasetId) {
            if(service.dataset && service.dataset.Id == datasetId)
                return service.dataset;

            service.dataset = Datasets.query({id: datasetId});

            //load our configuration if there is one
            service.dataset.$promise.then(function(){
                service.configureDataset(service.dataset);
            });

            return service.dataset;
        },

        getRelationData: function(relationFieldId, activityId, rowId){
            return GetRelationData.save({FieldId: relationFieldId, ActivityId: activityId, ParentRowId: rowId});
        },

        configureDataset: function(dataset)
        {
            console.log("configuring dataset!" + dataset.Id);
            //default page routes
            dataset.activitiesRoute = "activities"; //default route -- when they click to go to "activities" this is the route they should use.

            //objectify our dataset config for later use
            if(dataset.Config)
            {
                dataset.Config = angular.fromJson(dataset.Config);

                //if there are page routes in configuration, set them in our dataset
                if(dataset.Config.ActivitiesPage)
                    dataset.activitiesRoute = dataset.Config.ActivitiesPage.Route;

                //part of configuration is authorization.  If the user isn't authorized
                //  for this dataset, bump them to error
                if(dataset.Config.RestrictRoles)
                {   
                    var authorized = false;
                    for (var i = dataset.Config.RestrictRoles.length - 1; i >= 0; i--) {
                        if(angular.rootScope.Profile.hasRole(dataset.Config.RestrictRoles[i]))
                            authorized = true;
                    };

                    if(!authorized)
                        angular.rootScope.go('/unauthorized');
                    
                    //console.dir(angular.rootScope.Profile);
                    //console.dir(dataset.Config.RestrictRoles);
                }

            }

        },

        getHeadersDataForDataset: function(datasetId) {
            return GetHeadersDataForDataset.query({id: datasetId});
        },

        getActivityData: function(id) {
            return Data.query({id: id});
        },

        getActivities: function(id) {
            return Activities.query({id: id});
        },

        getProjects: function() {
            return Projects.query();
        },

        getUsers: function() {
            return Users.query();
        },

        getDepartments: function(){
            return GetDepartments.query();
        },

        getProjectDatasets: function(projectId){
            this.getProject(projectId); //set our local project to the one selected
            return ProjectDatasets.query({id: projectId});
        },

        getMetadataProperty: function(propertyId){

            if(!service.metadataProperties)
            {
                this._loadMetadataProperties().$promise.then(function(){
                   return service.metadataProperties["ID_"+propertyId];
               });
            }
            else
            {
                return service.metadataProperties["ID_"+propertyId];
            }
        },

        getMetadataProperties: function(propertyTypeId) {

            var properties = $q.defer();

            if(!service.metadataProperties)
            {
                this._loadMetadataProperties().$promise.then(function(){
                    properties.resolve(getMatchingByField(service.metadataProperties, propertyTypeId, 'MetadataEntityId'));
                });
            }else{
                properties.resolve(getMatchingByField(service.metadataProperties, propertyTypeId, 'MetadataEntityId'));
            }

            return properties;

        },

        getMetadataFor: function(projectId, typeId)
        {
            return GetMetadataFor.save({ProjectId: projectId, EntityTypeId: typeId});
        },

        //returns promise so you can carry on once it loads.
        _loadMetadataProperties: function()
        {
            return GetMetadataProperties.query(function(data){
                service.metadataProperties = {};
                angular.forEach(data, function(value, key){
                    service.metadataProperties["ID_"+value.Id] = value;
                });
            });

        },

        saveDatasetMetadata: function(datasetId, metadata, saveResults)
        {
            var payload = {
                DatasetId: datasetId,
                Metadata: metadata
            };

            return SaveDatasetMetadata.save(payload);

        },

        saveProject: function(project)
        {
            return SaveProject.save({Project: project});
        },

        //this should give you the possible QA Statuses for this dataset's rows
        getPossibleRowQAStatuses: function(id){
            //for now we fake it:
            return
            [{
                id: 1,
                name: "ok",
            },
            {   id: 2,
                name: "error",
            }
            ]

        },

        queryActivities: function(query)
        {
            //using "save" here because we need to POST our query criteria object
            QueryActivitiesAction.save(query.criteria, function(data){
                query.results = data;
                query.errors = undefined;
                console.log("success!");
                query.loading = false;
            }, function(data){
                query.results = undefined;
                query.errors = ["There was a problem running your querying.  Please try again or contact support."];
                console.log("Failure!");
                console.dir(data);
                query.loading = false;
            });

        },

        exportActivities: function(query)
        {
            ExportActivitiesAction.save(query.criteria, function(data){
                console.log("success!");
                query.loading = false;
                query.exportedFile = data;
                console.dir(data);
                //console.dir(angular.fromJson(data));
            }, function(data){
                console.log("Failure!");
                query.failed = true;
                query.loading = false;
            });
        },

        updateActivities: function(userId, datasetId, activities)
        {
            activities.saving = true; //tell everyone we are saving
            activities.UserId = userId;
            activities.DatasetId = datasetId;
            UpdateActivitiesAction.save(activities, function(data){
                activities.success = "Update successful.";
                activities.errors = false;
                console.log("Success!");
                activities.saving = false; //and... we're done.
            }, function(data){
                activities.success = false;
                activities.errors = {saveError: "There was a problem saving your data.  Please try again or contact support."};
                console.log("Failure!");
                console.dir(data);
                activities.saving = false; //and... we're done.
            });

        },

        saveEditors: function(userId, projectId, editors, saveResults)
        {
            saveResults.saving = true;
            var payload = {
                ProjectId: projectId,
                Editors: editors,
            };

            SetProjectEditors.save(payload, function(data){
                saveResults.saving = false;
                saveResults.success = true;
            }, function(data){
                saveResults.saving = false;
                saveResults.failure = true;
            });

        },

        saveUserPreference: function(name, value, results)
        {
            var payload = {UserPreference: {Name: name, Value: value}};

            SaveUserPreferenceAction.save(payload, function(data){
                results.done = true;
                results.success = true;
            }, function(data){
                results.done = true;
                results.failure = true;
            });

        },

        saveActivities: function(userId, datasetId, activities)
        {
            activities.saving = true; //tell everyone we are saving
            activities.UserId = userId;
            activities.DatasetId = datasetId;
            return SaveActivitiesAction.save(activities, function(data){
                activities.success = "Save successful.";
                activities.errors = false;
                activities.new_records = data;
                console.log("Success!");
                activities.saving = false; //and... we're done.
            }, function(data){
                activities.success = false;
                activities.errors = {saveError: "There was a problem saving your data.  Please try again or contact support."};
                console.log("Failure!");
                console.dir(data);
                activities.saving = false; //and... we're done.
            });
        },

        //delete selectedItems activities
        deleteActivities: function(userId, datasetId, grid, saveResults) {

            if(!grid.selectedItems)
            {
                saveResults.success = true;
                saveResults.message = "Nothing to do.";
                return;
            }

            var payload = {
                UserId: userId,
                DatasetId: datasetId,
                Activities: grid.selectedItems,
            }

            DeleteActivitiesAction.save(payload, function(data){
                saveResults.success = true;
                saveResults.message = "Activities Deleted.";
            }, function(data){
                saveResults.failure = true;
                saveResults.message = "There was a problem deleting the records.  Please try again or contact support.";
            });

        },

        updateQaStatus: function(ActivityId, QAStatusId, Comments, saveResults){
            saveResults.saving = true;
            var payload = {
                QAStatusId: QAStatusId,
                ActivityId: ActivityId,
                Comments: Comments,
            };

            console.dir(payload);

            SetQaStatusAction.save(payload, function(data){
                saveResults.saving = false;
                saveResults.success = true;
            },
            function(data){
                saveResults.saving = false;
                saveResults.failure = true;
            });
        },



    };

    service.getMetadataProperty(1); //cause our metadata properties to be loaded early.

    return service;

}]);


//ActivityParser
// Works with a wide datasheet that includes both headers and details that might represent multiple locations/days of activity
//  This full sheet idea makes it easier for data entry and importing, but we need to use this function to break
//  them out into individual activities.
/* when we're done our data will look like this:

{ "activities":{"76_10/1/2013":{"LocationId":"76","ActivityDate":"2013-10-01T07:00:00.000Z","Header":{"WaterTemperature":4,"TimeStart":"","TimeEnd":"","WaterFlow":"","AirTemperature":""},"Details":[{"locationId":"76","activityDate":"10/1/2013","WaterTemperature":4,"Species":"CHS","Sex":"M","Origin":"HAT","Mark":"[\"None\"]","Disposition":"PA","ForkLength":488,"Weight":"","TotalLength":"","GeneticSampleId":"","RadioTagId":"","FishComments":"","TimeStart":"","TimeEnd":"","WaterFlow":"","AirTemperature":"","Solution":"","SolutionDosage":""}]}},
  "errors":false,
  "UserId":1,
  "DatasetId":5
}

*/


mod.service('ActivityParser',[ 'Logger',
    function(Logger){
        var service = {

            parseSingleActivity: function(heading, data, fields){
                var activities = {activities: {}, errors: false};

                var tmpdata = data.slice(0); // create a copy.

                var key = service.makeKey(heading);

                if(key)
                {

                    if(tmpdata.length > 0)
                    {
                        angular.forEach(tmpdata, function(data_row, index){
                            //note we mash the heading fields into our row -- addActivity splits them out appropriately.
                            service.addActivity(activities, key, angular.extend(data_row, heading), fields);
                        });
                    }
                    else
                    {
                        //at least do a single.
                        console.log("trying a single with no rows!");
                        service.addActivity(activities, key, heading, fields);
                    }

                }
                else
                {
                    service.addError(activities,0, "Both a Location and ActivityDate are required to save a new Activity.");
                }


                return activities;

            },

            //parses an array of header+detail fields into discrete activities
            parseActivitySheet: function(data, fields){
                var activities = {activities: {}, errors: false};

                var tmpdata = data.slice(0); //create a copy

				var activityDateToday = new Date(); //need an activity date to use for the whole sheet, if we need to provide one.  
				
                angular.forEach(tmpdata, function(row, index){
					var key = service.makeKey(row, activityDateToday); 

                    if(key)
                        service.addActivity(activities, key, row, fields);
                    else
                        service.addError(activities, index, "Please check for errors, something required is missing to save a new Activity.");

                });

                return activities;
            },

            addError: function(activities, index, message){
                if(!activities.errors)
                {
                    activities.errors = {};
                }
                activities.errors.saveError = message;
            },

            makeKey: function(row, activityDateToday){

                if(!row.activityDate)
                    row.activityDate = toExactISOString(activityDateToday);

                if(row.locationId && row.activityDate)

                {
					return row.locationId + '_' + row.activityDate;
                }

                return undefined;
            },

            addActivity: function(activities, key, row, fields){
                if(row.Timezone)
                    var currentTimezone = row.Timezone;

                if(!activities.activities[key])
                {

                    var a_date = row.activityDate;

                    if(row.activityDate instanceof Date)
                    {
                        console.log("is a Date");

                        a_date = toExactISOString(row.activityDate); //
                        console.log(a_date);
                    }
                    else
                    {
                        console.log("Is a string.");
                        a_date = row.activityDate;
                    }
                    console.log("finally: " + a_date);

                    console.log(a_date);

                    //setup the new activity object structure
                    activities.activities[key] = {
                        LocationId: row.locationId,
                        ActivityDate: a_date,
                        InstrumentId: row.InstrumentId,
                        Header: {},
                        Details: [],
                    };

                    if(row.AccuracyCheckId)
                        activities.activities[key].AccuracyCheckId = row.AccuracyCheckId;

                    if(row.PostAccuracyCheckId)
                        activities.activities[key].PostAccuracyCheckId = row.PostAccuracyCheckId;

                    if(row.Timezone)
                    {
                        activities.activities[key].Timezone = angular.toJson(row.Timezone).toString();
                        row.Timezone = undefined;
                    }

                    //add in activityqa if there isn't one (now required)
                    if(!row.ActivityQAStatus)
                    {
                        //datasheet case
                        row.ActivityQAStatus =
                            {
                                QAStatusId: row.QAStatusId,
                                Comments: ''
                            };
                        row.QAStatusId = row.RowQAStatusId; // and then set QA status for this row...
                    }

                    activities.activities[key].ActivityQAStatus =
                    {
                        QAStatusID: row.ActivityQAStatus.QAStatusId,
                        Comments: row.ActivityQAStatus.Comments,
                    };



                    //true if we are editing...
                    if(row.ActivityId)
                        activities['ActivityId'] = row.ActivityId;

                    //copy the other header fields from this first row.
                    angular.forEach(fields.header, function(field){

                        //flatten multiselect values into an json array string
                        if(field.ControlType == "multiselect" && row[field.DbColumnName])
                        {
                            row[field.DbColumnName] = angular.toJson(row[field.DbColumnName]).toString(); //wow, definitely need tostring here!
                        }

                        activities.activities[key].Header[field.DbColumnName] = row[field.DbColumnName];
                    });

                }

                //add in activityqa if there isn't one (now required) -- for every row
                if(!row.ActivityQAStatus)
                {
                    //datasheet case
                    row.ActivityQAStatus =
                        {
                            QAStatusId: row.QAStatusId,
                            Comments: ''
                        };
                    row.QAStatusId = row.RowQAStatusId; // and then set QA status for this row...
                }

                //iterate through each field and do any necessary processing to field values
                var rowHasValue = prepFieldsToSave(row, fields.detail, currentTimezone);

                //console.dir(fields);

                //iterate through fields now and also prep any grid fields
                angular.forEach(Object.keys(fields.relation), function(relation_field){
                    //console.dir(relation_field);
                    //console.log("we ahve a grid cell to save!: " + relation_field);
                    var rel_grid = row[relation_field];
                    //console.dir(rel_grid);
                    angular.forEach(rel_grid, function(grid_row)
                    {
                        //console.dir(grid_row);
                        var gridHasValue = prepFieldsToSave(grid_row, fields.relation[relation_field], currentTimezone);
                        rowHasValue = (rowHasValue) ? rowHasValue : gridHasValue; //bubble up the true!
                    });
                });

                //only save the detail row if we have a value in at least one of the fields.
                if(rowHasValue)
                    activities.activities[key].Details.push(row);

            },

        };

        return service;
    }]);

function prepFieldsToSave(row, fields, currentTimezone)
{
    var rowHasValue = false;

    //handle field level validation or processing
    angular.forEach(fields, function(field){
        if(row[field.DbColumnName])
        {
            //flatten multiselect values into an json array string
            if(field.ControlType == "multiselect")
                row[field.DbColumnName] = angular.toJson(row[field.DbColumnName]).toString(); //wow, definitely need tostring here!

            //convert to a date string on client side for datetimes
            if(field.ControlType == "datetime" && row[field.DbColumnName])
            {
                if(row[field.DbColumnName] instanceof Date)
                {
                    row[field.DbColumnName] = toExactISOString(row[field.DbColumnName]);
                }
                else
                {
                    try{    
                        row[field.DbColumnName] = toExactISOString(new Date(row[field.DbColumnName]));
                    }catch(e){
                        console.log("Error converting date: "+row[field.DbColumnName]);
                    }
                }
            }

            rowHasValue = true;
        }
    });

    return rowHasValue;

}

mod.service('FileUploadService',['$q','$upload',function($q, $upload){
        var service = {
            uploadFiles: function(filesToUpload, $scope){

                    $scope.uploadErrorMessage = undefined;

                    var promises = [];

                    angular.forEach(filesToUpload, function(files, field){

                        console.log("handling files for: " + field)

                          for(var i = 0; i < files.length; i++)
                          {
                              var file = files[i];
                              //console.dir(file);

                              if(file.success != "Success")
                              {

                                var deferred = $q.defer();

                                $upload.upload({
                                  url: serviceUrl + '/data/UploadProjectFile',
                                  method: "POST",
                                  // headers: {'headerKey': 'headerValue'},
                                  // withCredential: true,
                                  data: {ProjectId: $scope.project.Id, Description: "Uploaded file for: "+file.Name, Title: file.Name},
                                  file: file,

                                }).progress(function(evt) {
                                    console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));

                                }).success(function(data, status, headers, config) {
                                    //console.dir(data);
                                    config.file.success = "Success";
                                    config.file.data = data;
                                    deferred.resolve(data);

                                })
                                .error(function(data, status, headers, config) {
                                    $scope.uploadErrorMessage = "There was a problem uploading your file.  Please try again or contact the Helpdesk if this issue continues.";
                                    console.log(" error.");
                                    config.file.success = "Failed";
                                    deferred.reject();

                                  });

                                promises.push(deferred.promise);

                              }

                          }
                    });

                    return $q.all(promises);
                },
            };
            return service;
}]);

//gridDatasheetOptions needs to be set to your datasheet grid
mod.service('DataSheet',[ 'Logger', '$window', '$route',
    function(Logger,$window, $route, $q){
        //var LocationCellTemplate = '<input ng-class="\'colt\' + col.index" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-blur="updateEntity(row)" />';

        var LocationCellEditTemplate = '<select ng-class="\'colt\' + col.index" ng-blur="updateCell(row,\'locationId\')" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in locationOptions"/>';

        var QACellEditTemplate = '<select ng-class="\'colt\' + col.index" ng-blur="updateCell(row,\'QAStatusId\')" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in QAStatusOptions"/>';

		var InstrumentCellEditTemplate = '<select ng-class="\'colt\' + col.index" ng-blur="updateCell(row,\'InstrumentId\')" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in instrumentOptions"/>';

        var service = {

            initScope: function(scope){

                //setup variable in the scope
                scope.CellOptions = {}; //dropdown list options
                scope.FieldLookup = {}; //conveience lookup dbcolname->fieldobj (populated by dataentry-controller.makecoldef)
                scope.onRow = undefined;
                scope.onField = undefined;
                scope.autoUpdateUndone = [];
                scope.deletedRows = [];
                scope.updatedRows = [];
                scope.autoUpdateFeatureDisabled = true;
                scope.headerFieldErrors= {};
                scope.dataChanged = false; //any changes to the grid yet?
                scope.gridWidth = { width: '2000' }; //will set below based on number of fields

                //scope wrapper functions
                scope.undoAutoUpdate = function() { service.undoAutoUpdate(scope)};
                scope.updateCell = function(row, field) { service.updateCell(row,field,scope)};
                scope.updateHeaderField = function(field) { service.updateHeaderField(field, scope)};
                scope.validateGrid = function() { service.validateGrid(scope)};
                scope.validate = function(row) { service.validate(row, scope)};
                scope.removeRow = function() { service.removeOnRow(scope)};
                scope.undoRemoveRow = function() {service.undoRemoveOnRow(scope)};
                scope.getFieldStats = function() {return service.getFieldStats(scope)};

                scope.onNumberField = function() {
                    if(!scope.onField)
                        return false;

                    return(scope.onField.ControlType == "number");
                };

                scope.recalculateGridWidth = function(length)
                {
                    console.log("recalculateGridWidth with length: " + length);

                    var minwidth = (980 < $window.innerWidth) ? $window.innerWidth - 50 : 980;
                    //console.log("minwidth: " + minwidth);

                    var width = 150 * length; //multiply number of columns by 100px
                    //console.log("or multiplied: " + width);

                    //if(width < minwidth) width=minwidth; //min-width
                    if(width < minwidth) width=minwidth; //min-width

                    //console.log("Decided: " + width);

                    scope.gridWidth = { width: width };
                    //refresh the grid
                    setTimeout(function() {
                        scope.gridDatasheetOptions.$gridServices.DomUtilityService.RebuildGrid(scope.gridDatasheetOptions.$gridScope, scope.gridDatasheetOptions.ngGrid); //refresh
                        console.log("Width now: " + width);
                    }, 400);
                };

                scope.selectCell = function(field) {
                    //console.log("select cell!");
                    scope.onField = scope.FieldLookup[field];
                };

                //dynamically set the width of the grids.
                /*
                var grid_width_watcher = scope.$watch('FieldLookup', function(){
                    var length = array_count(getMatchingByField(scope.FieldLookup,"2","FieldRoleId"));

                    console.log("Found number of detail fields: "+length);

                    //however -- if we are in full-grid mode, we need space calculated on adding in the header fields.
                    //  currently that is only for import, full datasheet and query.
                    if($route.current.controller == 'DatasetImportCtrl' || $route.current.controller == 'DataQueryCtrl' || $route.current.controller == 'DataEntryDatasheetCtrl')
                        length = array_count(scope.FieldLookup);

                    console.log("calling with length: "+ length);

                    scope.recalculateGridWidth(length);
                    grid_width_watcher(); //remove watcher.

                },true);
                */

                //only do this for pages that have editing enabled
                if(scope.gridDatasheetOptions.enableCellEdit)
                {
                    //setup editing rowtemplate
                    scope.gridDatasheetOptions.rowTemplate = '<div ng-click="selectCell(col.field)" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="{\'has-validation-error\': !row.getProperty(\'isValid\')}" class="{{col.colIndex()}} ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>';
                }
                else
                {
                    //for viewing
                    scope.gridDatasheetOptions.rowTemplate = '<div ng-click="selectCell(col.field)" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" class="{{col.colIndex()}} ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>';

                }

                //this is pure awesomeness: setup a watcher so that when we navigate the grid we update our current row and validate it.
                scope.$watch('gridDatasheetOptions.$gridScope.selectionProvider.lastClickedRow', function(){
                    //Logger.debug(scope.gridDatasheetOptions.$gridScope);
                    scope.onRow = scope.gridDatasheetOptions.$gridScope.selectionProvider.lastClickedRow;
                    //console.dir(scope.gridDatasheetOptions.$gridScope.selectionProvider);
                });

            },

            getColDefs: function(){
	            var coldefs = [{
                            field: 'locationId',
                            Label: 'Location',
                            displayName: 'Location',
                            editableCellTemplate: LocationCellEditTemplate,
                            cellFilter: 'locationNameFilter',
                            Field: { Description: "What location is this record related to?"}
                        },
                        {
                            field: 'activityDate',
                            Label: 'Activity Date',
                            displayName: 'Activity Date',
                            cellFilter: 'date: \'MM/dd/yyyy\'',
                            editableCellTemplate: '<input ng-blur="updateCell(row,\'activityDate\')" type="text" ng-pattern="'+date_pattern+'" ng-model="COL_FIELD" ng-input="COL_FIELD" />',
                            Field: { Description: "Date of activity in format: '10/22/2014'"}
                        },
                        {
                            field: 'QAStatusId',
                            Label: 'QA Status',
                            displayName: 'QA Status',
                            editableCellTemplate: QACellEditTemplate,
                            cellFilter: 'QAStatusFilter',
                            Field: { Description: "Quality Assurance workflow status"}

                        },
                        {
                            field: 'InstrumentId',
                            Label: 'Instrument',
                            displayName: 'Instrument',
                            visible: false,
                            cellFilter: 'instrumentFilter', //'','instrumentFilter',
                            editableCellTemplate: InstrumentCellEditTemplate, //'<input ng-blur="updateCell(row,\'instrumentId\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />',   'InstrumentCellEditTemplate',
                            Field: { Description: "Instrument that detected this value."}
                        },
                  ];

                return coldefs;
            },

            //in order to call validate, you'll need to have your FieldLookup and CellOptions set
            //  on the controller (and obviously previously populated by the DataSheet service.)
            validate: function(row, scope)
            {
                if(row)
                {
                    //spin through our fields and validate our value according to validation rules
                    var row_errors = [];

                    //console.log("Validating a row with " + array_count(scope.FieldLookup) + " rows.");
                    var row_num = 0;

                    angular.forEach(scope.FieldLookup, function(field, key){
                         //TODO: first check if there is no value but one is required.

                        //if not value, ditch.
                        if(!row[key])
                            return;


                        validateField(field, row, key, scope, row_errors);
                        //row_num++;
                        //console.log("  >>incrementing!");

                    });
                    //console.log(row_num + " --------------- is our rownum");
                    if(row_errors.length > 0)
                    {
                        row.isValid = false;
                        row.errors = row_errors;
                        scope.gridHasErrors = true;
                    }
                    else
                    {
                        row.isValid = true;
                        row.errors = undefined;
                    }

                }
            },

            updateHeaderField: function(field_name, scope)
            {
                scope.dataChanged = true;

                var value = scope.row[field_name];
                var field = scope.FieldLookup[field_name];
                var errors = [];
                var row = scope.row;
                var headers = []; //there are none; our row is the headers.

                validateField(field, scope.row, field_name, scope, errors);

                if(errors.length > 0)
                {
                    scope.headerFieldErrors[field_name] = errors;
                }
                else
                {
                    delete scope.headerFieldErrors[field_name];
                }


                //fire rules - OnChange

                fireRules("OnChange", row, field, value, headers, errors, scope);

                scope.headerHasErrors = (array_count(scope.headerFieldErrors) > 0);

            },

            undoAutoUpdate: function(scope){
                for (var i = 0; i < scope.autoUpdate.updated.length; i++) {

                    //TODO -- eww don't do it this way! don't need rendered rows
                    var entityFieldValue = scope.gridDatasheetOptions.$gridScope.renderedRows[i].entity[scope.autoUpdate.field];

                    //Logger.debug("Unsetting "+scope.autoUpdate.field+": " + entityFieldValue + " back to " + scope.autoUpdate.from);

                    scope.gridDatasheetOptions.$gridScope.renderedRows[i].entity[scope.autoUpdate.field] = scope.autoUpdate.from;
                }

                //set the originally changed one to still be TO
                scope.gridDatasheetOptions.$gridScope.renderedRows[scope.autoUpdate.origRowIndex].entity[scope.autoUpdate.field] = scope.autoUpdate.to;

                scope.autoUpdateUndone.push(scope.autoUpdate.field); // mark this so we don't do it again.
                scope.autoUpdate = undefined;

                service.validateGrid(scope);

            },

            //fired whenever a cell value changes.
            updateCell: function(row, field_name, scope)
            {
                //console.log("Field changed: " + field_name);

                scope.dataChanged = true;

                if(scope.onRow.entity)
                {
                    var fromValue = scope.onRow.entity[field_name];
                    var toValue = row.entity[field_name];

                    //Logger.debug("Changed "+field+" from: " + fromValue + " to: "+ toValue);
                }
                //console.log("has an id? " + row.entity.Id);

                //make note of this update so we can save it later. (relevant only for editing)
                if(row.entity.Id)
                {

                    if(scope.updatedRows.indexOf(row.entity.Id) == -1)
                    {
                        //console.log("added an update: " + row.entity.Id);
                        scope.updatedRows.push(row.entity.Id);
                    }
                    //else
                    //    console.log("Not updating a record.");
                }
                //else
                    //console.log("not row.entity.id");


                //set value of multiselect back to an array


                //row.entity[field] = angular.toJson(toValue).toString();


                /*

                // bail out if it would be a duplicate update
                if(fromValue == toValue)
                {
                    scope.validateGrid(scope);
                    return;
                }

                //bail out if they've already undone this cascade once before
                if(scope.autoUpdateUndone.indexOf(field) > -1 || scope.autoUpdateFeatureDisabled)
                {
                    scope.validateGrid(scope); // before we bail out.
                    return;
                }
                */

                /*
                //go ahead and change all the others (this will expose an option to undo if they want)
                scope.autoUpdate = {
                    field: field,
                    from: fromValue,
                    to: toValue,
                    origRowIndex: row.rowIndex,
                    updated: [],
                };

                angular.forEach(scope.gridDatasheetOptions.$gridScope.renderedRows, function(data_row, key){
                    //if the value of this row is the same as what they just changed FROM
                    //  AND if the rowindex is higher than the current rowindex (cascade down only)
                    if(data_row.entity[field] == fromValue && key > row.rowIndex )
                    {
                        data_row.entity[field] = toValue;
                        scope.autoUpdate.updated.push(key);
                        //Logger.debug("Autoupdated: " + key);
                    }
                });
                */

                var value = row.entity[field_name];
                var field = scope.FieldLookup[field_name];

                //console.dir(scope.FieldLookup);
                //console.log("field name = " + field_name);

                row = row.entity; //get the right reference for our rules

                //fire OnChange rule

// -------------------------------------------
//I like to write my test rules here and move into rule and delete when i'm done  ---------------------------
//eg:
/*

                if(field_name == "Disposition")
                {
                    console.log("Disposition value: " + value);
                    var testRule =
                    {
                        "OnChange":
                        ""
                    };

                    field.Field.Rule = angular.fromJson(testRule);

                }
*/
// ------------------------------------------
                var headers = scope.row;
                if(field && value)
                {
                    fireRules("OnChange",row, field, value, headers, [], scope);
                }

                //this is expensive in that it runs every time a value is changed in the grid.
                scope.validateGrid(scope); //so that number of errors gets calculated properly.


            },


            undoRemoveOnRow: function(scope)
            {
                var entity = scope.deletedRows.pop();
                scope.dataSheetDataset.push(entity);
                scope.validateGrid(scope);
            },


            removeOnRow: function(scope){
                scope.dataChanged = true;
                scope.deletedRows.push(scope.onRow.entity);
                var index = scope.dataSheetDataset.indexOf(scope.onRow.entity);
                scope.dataSheetDataset.splice(index,1);
                scope.onRow = undefined;
                scope.validateGrid(scope);
            },



            //spin through all of the rows and re-validate.
            validateGrid: function(scope){

                if(!scope.gridDatasheetOptions.enableCellEdit)
                    return;

                Logger.debug(">>>>>>> validating the whole grid baby");
                scope.validation_error_count = 0;

                angular.forEach(scope.dataSheetDataset, function(data_row, key){
                    service.validate(data_row, scope);
                    if(!data_row.isValid)
                        scope.validation_error_count++;
                });

                scope.gridHasErrors = (scope.validation_error_count == 0) ? false : true;

            },

            getFieldStats: function(scope){

                if(!scope.onField || scope.onField.ControlType != "number")
                    return "";

                //first get the mean (average)
                var total = 0;
                var num_recs = 0;
                var max = undefined;
                var min = undefined;

                //calculate total (for mean), max, min
                angular.forEach(scope.dataSheetDataset, function(item, key){

                    try{
                        var num = new Number(item[scope.onField.DbColumnName]);

                        if(!isNaN(num)) //just skip if it is not a number (NaN)
                        {
                            total += num;

                            if(typeof min == "undefined")
                                min = num;

                            if(typeof max == "undefined")
                                max = num;

                            if(num > max)
                                max = num;

                            if(num < min)
                                min = num;

                            num_recs ++;
                        }
                    }
                    catch(e)
                    {
                        //ran across something that wasn't a number (usurally a blank...)
                        console.log("couldn't convert this to a number: " + item[scope.onField.DbColumnName] + " on " + scope.onField.DbColumnName);
                    }

                });

                var mean = total / num_recs;

                var std_total = 0;

                //now do standard deviation
                angular.forEach(scope.dataSheetDataset, function(item, key){
                    if(!isNaN(item[scope.onField.DbColumnName]))
                        std_total += Math.pow( (item[scope.onField.DbColumnName] - mean), 2); //difference of each item, squared
                });

                var std_dev = Math.sqrt(std_total/ (num_recs - 1) );//square root of sum of squared differences

                var stats = "Mean: " + mean.toFixed(2);
                stats += " / Max: " + max;
                stats += " / Min: " + min;
                stats += " / Std Dev: " + std_dev.toFixed(2);
                stats += " / Total: " + total;

              return stats;
            },




        } //end service



        return service;

    }]);


//common utility functions -- should this be broken out elsewhere?

//refactore me even more
// makes a field colulm definition
function makeFieldColDef(field, scope) {

    var coldef =
    {
        field: field.DbColumnName,
        displayName: field.Label,
        minWidth: 70,
        defaultValue: field.DefaultValue
    };

    //only setup edit templates for fields in grids with cell editing enabled.
    if(scope.gridDatasheetOptions.enableCellEdit)
    {
        //first of all!
        coldef.enableCellEdit = true;

        //setup column according to what type it is
        //  the "coldef" options available here are "ColumnDefs Options" http://angular-ui.github.io/ng-grid/
        switch(field.ControlType)
        {
            case 'select':
            case 'lookup':
                coldef.editableCellTemplate = '<select ng-class="\'colt\' + col.index" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-blur="updateCell(row,\''+field.DbColumnName+'\')" ng-options="id as name for (id, name) in CellOptions.'+ field.DbColumnName +'Options"><option value="" selected="selected"></option></select>';
                scope.CellOptions[field.DbColumnName+'Options'] = makeObjectsFromValues(scope.dataset.DatastoreId+field.DbColumnName, field.Field.PossibleValues);
//                console.log("and we used: " + scope.dataset.DatastoreId+field.DbColumnName + " as the key");
                break;
            case 'multiselect':
            case 'multilookup':
                //coldef.editableCellTemplate = '<select class="field-multiselect" multiple="true" ng-class="\'colt\' + col.index" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in CellOptions.'+ field.DbColumnName +'Options"/>';
                //coldef.cellTemplate = '<div class="ngCellText cell-multiselect" ng-class="col.colIndex()"><span ng-cell-text>{{row.getProperty(col.field)}}</span></div>';
                coldef.editableCellTemplate = '<select class="field-multiselect" multiple="true" ng-blur="updateCell(row,\''+field.DbColumnName+'\')" ng-class="\'colt\' + col.index" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in CellOptions.'+ field.DbColumnName +'Options"/>';
                scope.CellOptions[field.DbColumnName+'Options'] = makeObjectsFromValues(scope.dataset.DatastoreId+field.DbColumnName, field.Field.PossibleValues);
//                console.log("and we used: " + scope.dataset.DatastoreId+field.DbColumnName + " as the key");
                break;
            case 'date':
                editableCellTemplate: '<input type="text" ng-blur="updateCell(row,\''+field.DbColumnName+'\')" ng-pattern="'+date_pattern+'" ng-model="COL_FIELD" ng-input="COL_FIELD" />';
                break;
            case 'datetime':
                coldef.editableCellTemplate = '<input type="text" ng-blur="updateCell(row,\''+field.DbColumnName+'\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />';
                break;
            case 'text':
                coldef.editableCellTemplate = '<input type="text" ng-blur="updateCell(row,\''+field.DbColumnName+'\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />';
                break;
            case 'currency':
                coldef.editableCellTemplate = '<input type="text" ng-blur="updateCell(row,\''+field.DbColumnName+'\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />';
                break;                
            case 'textarea':
                coldef.editableCellTemplate = '<input type="text" ng-blur="updateCell(row,\''+field.DbColumnName+'\')" ng-model="COL_FIELD" ng-input="COL_FIELD" />';
                break;
            case 'number':
                //var maxmin = field.Field.Validation ? 'max="'+field.Field.Validation[1]+'" min="'+field.Field.Validation[0]+'"' : ''; //either returns our min/max setup for a numeric field or empty string.
                coldef.editableCellTemplate = '<input type="text" ng-model="COL_FIELD" ng-blur="updateCell(row,\''+field.DbColumnName+'\')" ng-input="COL_FIELD" />';
                //coldef.cellTemplate = '<div class="ngCellText colt{{$index}}">{{row.getProperty(col.field)}}</div>';
                break;
            case 'checkbox':
                coldef.showSelectionCheckbox = true;
                coldef.editableCellTemplate = '<input type="checkbox" ng-checked="row.entity.'+field.DbColumnName+'==true" ng-model="COL_FIELD" ng-input="COL_FIELD" />';
                coldef.cellTemplate = coldef.editableCellTemplate; //checkbox for display and edit.
                break;
            case 'file':
                coldef.cellTemplate = '<button class="right btn btn-xs" ng-click="addFiles(row, col.field)">Add</button> <span ng-cell-text ng-bind-html="row.getProperty(col.field) | fileNamesFromString"></span>';
                //<span ng-bind-html="fileNamesFromRow(row,\''+ field.DbColumnName + '\')"></span>';
                break;
            //case 'grid':
            //    coldef.cellTemplate = '<button class="right btn btn-xs" ng-click="viewRelation(row, col.field)">View</button> <span ng-cell-text ng-bind-html="row.getProperty(col.field)"></span>';
            //    break;
        }
    }

    //setup cellfilters
    switch(field.ControlType)
    {
        case 'multiselect':
        case 'multilookup':
            coldef.cellFilter = 'arrayValues';
            break;

        case 'date':
            coldef.cellFilter = 'date: \'MM/dd/yyyy\'';
            break;

        case 'currency':
            coldef.cellFilter = 'currency';
            break;

        case 'datetime':
            coldef.cellFilter = 'date: \'MM/dd/yyyy HH:mm:ss\'';
            break;

        case 'link':
        case 'file':
            //override the defaul width for files...
            coldef.minWidth = '200';
            coldef.maxWidth = '400';
            coldef.width = '200';
            if(!coldef.enableCellEdit)
                coldef.cellTemplate = '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text ng-bind-html="row.getProperty(col.field) | fileNamesFromString"></span></div>';//<span ng-bind-html="fileNamesFromRow(row,\''+ field.DbColumnName + '\')"></span>';
            break;
        case 'grid':
            coldef.minWidth = '150';
            coldef.maxWidth = '150';
            coldef.width = '150';
            coldef.cellTemplate = '<button class="right btn btn-xs" ng-click="viewRelation(row, col.field)">View</button> <div class="ngCellText" ng-bind-html="row.getProperty(col.field) | countItems"></div>';
            //coldef.cellTemplate = '<span ng-cell-text ng-bind-html="row.getProperty(col.field) | countItems"></span>';
            break;
    }

    return coldef;
}

/*
* Handles preparing a field to be used by the system...
*/
function parseField(field, scope)
{
    //do this no matter what.
    scope.FieldLookup[field.DbColumnName] = field; //setup our little convenience lookup associative array - used for validation

    //are we already parsed?
    if(field.parsed === true)
        return;

    var displayName = "";

    //if we are a DatasetField
    if(field.Label)
        displayName = field.Label;

    //if we are a Field
    if(field.Name)
        displayName = field.Name;

    //include units in the label if we are a DatasetField
    if(field.Field && field.Field.Units)
        displayName += " (" + field.Field.Units+")";

    //or if we are a Field
    if(field.Units)
        displayName += " (" + field.Units+")";

    field.Label = displayName;

    //configure field validation for DatasetFields (will be skipped for global Fields (in the case of glboal query))
    if(field.Field && field.Field.Validation)
    {
        try{
            console.log("configuring validation for " + field.DbColumnName);
            field.Field.Validation = angular.fromJson(field.Field.Validation);
        }
        catch(e)
        {
            console.log("*** There is an error parsing the validation for: "+ field.Field.Name + " ***");
            console.dir(e);
            console.log("Validation == " + field.Field.Validation);
        }
    }

    //setup and parse the rule if there is one.
    try{
        field.Rule = (field.Rule) ? angular.fromJson(field.Rule) : {};

        if(field.Field)
            field.Field.Rule = (field.Field.Rule) ? angular.fromJson(field.Field.Rule) : {};
    }
    catch(e)
    {
        console.log("*** there is a rule parsing error for " + field.Field.Name + " *** ");
        console.dir(e);
    }
    
    fireRules("DefaultValue", null, field, null, null, null, null);
    fireRules("Default", null, field, null, null, null, null);

    field.parsed = true;

}

//creates an empty row for arbitrary datasets
function makeNewRow(coldefs)
{
    var obj = {};

    //sets to default value of this field if one is specified as a "DefaultValue" rule; otherwise null
    angular.forEach(coldefs, function(col){
        obj[col.field] = (col.defaultValue) ?  col.defaultValue : null;
    });

    obj.isValid=true;

    return obj;
}

//takes an array and iterates into key/value object array
//also needs keyProperty and valueProperty strings; property names of individual items in the list.
//use like:  makeObjects(project.Locations, 'Id','Label')
//returns "{keyProperty: valueProperty, ...}
function makeObjects(optionList, keyProperty, valueProperty)
{
    var objects = {};

    angular.forEach(optionList, function(item){
        objects[item[keyProperty]] = item[valueProperty];
    });

    return objects;
}

//specific for instruments because we need the serial number too
function makeInstrumentObjects(optionList)
{
    var objects = {};

    angular.forEach(optionList, function(item){
        objects[item['Id']] = item['Name'] + '(' + item['SerialNumber'] + ')';
    });

    return objects;
}

//TODO: this will be handy in the future when we refactor the way lookupOptions works to use
// an array of objects instead of properties of a single object.
function sortObjectsByValue(list)
{
    var sorted = [];

    Object.keys(list)
        .map(function(k) { return [k, list[k]]; })
        .sort(function(a,b){
            if (a[1] < b[1]) return -1;
             if (a[1] > b[1]) return 1;
             return 0;
          })
          .forEach(function (d) {
              var nextObj = {};
              nextObj[d[0]] = d[1];
              sorted.push(nextObj);
          });

    return sorted;

}
//takes a possiblevalues field list and turns it into a list we can use in a select
//give us a unique key to reference it by for caching.
function makeObjectsFromValues(key, valuesList)
{
    var objects = angular.rootScope.Cache[key]; //see if we have it squirreled away in our cache

    if(!objects)
    {
        objects = {};

        if(!valuesList)
            throw new Exception("No values provided.");

        var selectOptions = "";

        try{
            selectOptions = angular.fromJson(valuesList);
        }catch(e){
            console.log("problem parsing: " + valuesList + " for field: "+ key);
        }

        //make array elements have same key/value
        if(angular.isArray(selectOptions))
        {
            selectOptions.forEach(function(item){
                objects[item] = item;
            });
        }
        else
        {
            for(var idx in selectOptions)
            {
                objects[idx] = selectOptions[idx];
            }

        }
        angular.rootScope.Cache[key] = objects; //save into our cache
    }

    return objects;
}

function orderByAlpha(a,b)
{
     if(!a || !b || !a.Label || !b.Label)
        return 0;

     var nameA=a.Label.toLowerCase(), nameB=b.Label.toLowerCase()
     if (nameA < nameB) //sort string ascending
      return -1
     if (nameA > nameB)
      return 1
     return 0 //default return value (no sorting)
}

function orderByAlphaName(a,b)
{
     if(!a || !b || !a.Label || !b.Label)
        return 0;

     var nameA=a.Name.toLowerCase(), nameB=b.Name.toLowerCase()
     if (nameA < nameB) //sort string ascending
      return -1
     if (nameA > nameB)
      return 1
     return 0 //default return value (no sorting)
}

function orderUserByAlpha(a,b)
{
     var nameA=a.Fullname.toLowerCase(), nameB=b.Fullname.toLowerCase()
     if (nameA < nameB) //sort string ascending
      return -1
     if (nameA > nameB)
      return 1
     return 0 //default return value (no sorting)
}

function orderByIndex(a,b) {
    if(a.OrderIndex && b.OrderIndex)
        return (a.OrderIndex - b.OrderIndex);
    else
        return (a.FieldRoleId - b.FieldRoleId);
}

//works for either regular arrays or associative arrays
function array_count(the_array)
{
    var count = 0;
    var keys = (Array.isArray(the_array)) ? the_array : Object.keys(the_array);
    for (var i = 0; i < keys.length; i++) {
        count ++;
    };

    return count;
}

function validateField(field, row, key, scope, row_errors)
{

    var value = row[key];

    //console.log("Validating: ("+value+") on field: " + field.DbColumnName);
    //console.dir(field);

    switch(field.ControlType)
    {
        case 'select':
            //is the value in our list of options?
            //console.log(scope.CellOptions[field.DbColumnName+'Options']);
            if(scope.CellOptions[field.DbColumnName+'Options'])
            {
                if(Object.keys(scope.CellOptions[field.DbColumnName+'Options']).indexOf(value) == -1) //not found
                    row_errors.push("["+field.DbColumnName+"] Invalid selection");
            }
            else
            {
                console.log("Error: no cellOptions for " + field.DbColumnName+'Options' );
                console.dir(scope.CellOptions);
                console.log("This might be because you're calling a rule wrong?");
            }
            break;

        case 'multiselect':
            //is each value in our list of options?
            var values = angular.fromJson(value);
            row[key] = values;
            //console.log("doing a comparison: " + values + " for value: "+ value);
            for(var a = 0; a < values.length; a++ )
            {
                var a_value = values[a];
                if(Object.keys(scope.CellOptions[field.DbColumnName+'Options']).indexOf(a_value) == -1) //not found
                    row_errors.push("["+field.DbColumnName+"] Invalid selection ("+a_value+")");
            }
            break;
        case 'date':
            //TODO
            break;
        case 'text':
            //anything here?
            break;
        case 'number':
            if(field.Field.Validation && field.Field.Validation.length == 2)
            {
                if(!stringIsNumber(value) && !is_empty(value))
                {
                    //console.dir(value);
                    row_errors.push("["+field.DbColumnName+"] Value is not a number.");
                }

                if(value < field.Field.Validation[0])
                    row_errors.push("["+field.DbColumnName+"] Value is too low.");

                if(value > field.Field.Validation[1])
                    row_errors.push("["+field.DbColumnName+"] Value is too high.");
            }
            break;
        case 'checkbox':
            //anything here?
            break;

    }


// You can test validation rules here
//------------------------------------
/*
if(field.DbColumnName == "Disposition")
{
    console.log("Disposition value: " + value);
    var testRule =
    {
        "OnValidate":
        "if((value == 'O' || value == 'T') && (scope.FieldLookup['ReleaseSite'] && !row['ReleaseSite'])) row_errors.push('[ReleaseSite] Disposition choice requires ReleaseSite');"
    };

    field.Field.Rule = angular.fromJson(testRule);
}
*/
/*
console.log(field.DbColumnName);
if(field.DbColumnName == "FinClip")
{
    console.log("Origin value: " + value);
    var testRule =
    {
        "OnValidate":
        "row['Origin'] = 'NAT';if(!(!row['FinClip'] || (row['FinClip'] == 'NONE' || row['FinClip'] == 'NA')) || ( row['Tag'] == 'WIRE')) row['Origin'] = 'HAT';"
    };

    field.Field.Rule = angular.fromJson(testRule);
}
*/

    fireRules("OnValidate",row,field,value,scope.row,row_errors, scope);


}

function stringIsNumber(s) {
    return !isNaN(parseFloat(s)) && isFinite(s);
}

function is_empty(obj) {

    // null and undefined are empty
    if (obj == null) return true;
    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length && obj.length > 0) return false;
    if (obj.length === 0) return true;

    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    // Doesn't handle toString and toValue enumeration bugs in IE < 9

    return true;
}

mod.service('Logger',[
    function(){

        var service = {
            log: function () {
                for (var i = 0; i < arguments.length; i++) {

                    //output the argument
                    //console.dir(arguments[i]);

                    //traverse recursively if it is an array
                    if (arguments[i] instanceof Array) {
                        var arrayArg = arguments[i];
                        this.log.apply(this, arrayArg);
                    }

                }
            },

            debug: function () {
                this.log.apply(this, arguments);
            },

            error: function () {
                this.log.apply(this, arguments);
                var message = {Message: arguments[0], Type: "ERROR"};
            },

            audit: function(){
                var message = { Message: arguments[0], Type: "AUDIT" };
                log.debug("AUDIT Message POSTED to server: " + arguments[0]);
            },
        };

        return service;

    }]);

//from : http://stackoverflow.com/questions/17547399/angularjs-arcgis
mod.service('wish', function () {

        // it's not require... it's a wish?
        var wish = {};

        function _loadDependencies(deps, next) {
            var reqArr = {}; var keysArr = {};

            angular.forEach(Array.keys, function(key, val){
                keysArr.push(key);
                reqArr.push(val);
            });

            // use the dojo require (required by arcgis + dojo) && save refs
            // to required obs
            try{
                require(reqArr, function () {
                    var args = arguments;

                    angular.forEach(keysArr, function (name, idx) {
                        wish[name] = args[idx];
                    });

                    next();
                });

            }catch(e){
                console.dir(e);

            }
        }

        return {
            loadDependencies: function (deps, next) {
                _loadDependencies(deps, next);
            },

            get: function () {
                return wish;
            }
        };
    });

//convert a F to C
function convertFtoC(fahr){
    if(fahr != null)
        return ((parseFloat(fahr) - 32) * (5/9)).toFixed(NUM_FLOAT_DIGITS);

    return fahr;
}

function convertCtoF(cels){
    if(cels != null)
        return (parseFloat(cels)*9/5 +32).toFixed(NUM_FLOAT_DIGITS);

    return cels;
}


function previousActivity(activities, routeId, $location){
    var previousId;

    //spin through the activities - when we get to the one we're on, send the one before
    //  (unless we are on the first one, then do nothing)

    for (var i = 0; i < activities.length; i++) {
        var activity = activities[i];

        if(activity.Id == routeId)
        {
            if(previousId)
                break; // meaning the previousId is set already; we are good to go.
            else
            {
                previousId = activity.Id; //meaning we are on the first one.
                break;
            }
        }
        previousId = activity.Id;
    };

    $location.path("/dataview/"+previousId);
};

function nextActivity(activities, routeId, $location){
    var nextId;
    var found = false;

    for (var i = 0; i < activities.length; i++) {
        var activity = activities[i];

        if(found)
        {
            nextId = activity.Id;
            break;
        }

        if(activity.Id == routeId)
        {
            found = true;
            nextId = activity.Id; // in case we don't get another one.
        }

    };

    $location.path("/dataview/"+nextId);
}

//anything we might need to do in initializing edit/entry pages.
function initEdit(){
    // Prevent the backspace key from navigating back.
    //http://stackoverflow.com/questions/1495219/how-can-i-prevent-the-backspace-key-from-navigating-back/1495435#1495435
    $(document).unbind('keydown').bind('keydown', function (event) {
        var doPrevent = false;
        if (event.keyCode === 8) {
            var d = event.srcElement || event.target;
            if ((d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD' || d.type.toUpperCase() === 'FILE'))
                 || d.tagName.toUpperCase() === 'TEXTAREA') {
                doPrevent = d.readOnly || d.disabled;
            }
            else {
                doPrevent = true;
            }
        }

        if (doPrevent) {
            event.preventDefault();
        }
    });
}

//in any array with a "Name" attribute, get the matching item
function getByName(list, search_name)
{
    return getByField(list, search_name, 'Name');

    /*
    for (var i = 0; i < list.length; i++) {
        var pref = list[i];
        if(pref.Name == search_name)
            return pref;
    };

    return null;
    */
}

//returns single match in any fieldname
function getByField(list, search, field)
{
    for (var i = 0; i < list.length; i++) {
        var pref = list[i];
        if(pref[field] == search)
            return pref;
    };

    return null;
}

//returns array with matching field value
function getMatchingByField(data, search, field)
{
    var newlist = [];

    for(var key in data)
    {
        if(data[key][field] == search)
            newlist.push(data[key]);
    }

    //console.log("did a search on " + search + " for " + field);
    //console.dir(newlist);

    return newlist;
}

//returns array with UN-matching field value
function getUnMatchingByField(data, search, field)
{
    var newlist = [];

    for(var key in data)
    {
        if(data[key][field] != search)
            newlist.push(data[key]);
    }

    //console.log("did a search on " + search + " for " + field);
    //console.dir(newlist);

    return newlist;
}



function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}


//give me an instrument's accuracy check and I'll give you the datagrade to display
function getDataGrade(check)
{
    if(!check)
        return;

    var grade = "N/A";
    if(check.CheckMethod == 1)
        grade = check.Bath1Grade + "-" + check.Bath2Grade;
    else if (check.CheckMethod == 2)
        grade = check.Bath1Grade;

    return grade;
};

function populateMetadataDropdowns(scope, property)
{
    if(property.ControlType == "select" || property.ControlType == "multiselect")
    {
        scope.CellOptions[property.Id+'_Options'] = makeObjectsFromValues(property.Id+"_Options", property.PossibleValues);
    }
};

function getLocationObjectIdsByType(type, locations)
{
    //console.log("reloading project locations");
    var locationsArray = getMatchingByField(locations,type,"LocationTypeId");
    var locationObjectIdArray = [];

    angular.forEach(locationsArray, function(item, key){
        locationObjectIdArray.push(item.SdeObjectId);
    });

    var locationObjectIds = locationObjectIdArray.join();
    console.log("found project locations: " + locationObjectIds);

    return locationObjectIds;
}

function getLocationObjectIdsByInverseType(type, locations)
{
    //console.log("reloading project locations");
    var locationsArray = getUnMatchingByField(locations,type,"LocationTypeId");
    var locationObjectIdArray = [];

    angular.forEach(locationsArray, function(item, key){
        if(item.SdeObjectId)
            locationObjectIdArray.push(item.SdeObjectId);
    });

    var locationObjectIds = locationObjectIdArray.join();
    console.log("found project locations: " + locationObjectIds);

    return locationObjectIds;
}

function fireRules(type, row, field, value, headers, errors, scope)
{
    var row_errors = errors; //older rules use "row_errors"
    try{
        //fire Field rule if it exists -- OnChange
        if(field.Field && field.Field.Rule && field.Field.Rule[type]){
            console.log("Dataset field rule: " + field.Field.Rule[type]);
            if(type == "DefaultValue")
                field.DefaultValue = field.Field.Rule[type];
            else
                eval(field.Field.Rule[type]);
        }

        //fire Datafield rule if it exists -- OnChange
        if(field.Rule && field.Rule[type]){
            console.log("Master field rule: " + field.Rule[type]);
            if(type=="DefaultValue")
                field.DefaultValue = field.Rule[type];
            else
                eval(field.Rule[type]);
        }
    }catch(e){
        //so we don't die if the rule fails....
        console.dir(e);
    }

}

//give me a date and I will convert it to a UTC date.
//  used in rules.
function dateToUTC(a_date)
{
    var utc = new Date(Date.UTC(
        a_date.getFullYear(),
        a_date.getMonth(),
        a_date.getDate(),
        a_date.getHours(),
        a_date.getMinutes(),
        a_date.getSeconds()
    ));

    return utc;
}

function pad(number) {
      if (number < 10) {
        return '0' + number;
      }
      return number;
}


function toExactISOString(a_date)
{
    //TODO: better way to fix this? 
    if(a_date.getFullYear() < 1950)
        a_date.setFullYear(a_date.getFullYear() + 100);

    var s_utc = a_date.getFullYear() +
        '-' + pad(a_date.getMonth() + 1) +
        '-' + pad(a_date.getDate()) +
        'T' + pad(a_date.getHours()) +
        ':' + pad(a_date.getMinutes()) +
        ':' + pad(a_date.getSeconds()) +
        '.' + (a_date.getMilliseconds() / 1000).toFixed(3).slice(2, 5);

    return s_utc;

}

//give me a date string and offset (in ms) and I'll give you back a Date
//  with the offset applied.
//  used in rules.
function toDateOffset(str_date, int_offset)
{
    //console.log(int_offset);
    //console.log(str_date);
    var orig_date = new Date(str_date);
    //console.log(orig_date.toISOString());
    var d = new Date(orig_date.getTime() + int_offset);
    //console.log(d.toISOString());

    return d;
}

//date to friendly format: "12/05/2014 04:35:44"
function formatDate(d)
{
    var d_str =
        [d.getMonth()+1,d.getDate(), d.getFullYear()].join('/') + " " +
        [("00" + d.getHours()).slice(-2), ("00" + d.getMinutes()).slice(-2), ("00" + d.getSeconds()).slice(-2)].join(':');

    return d_str;
}

//if(somearray.contains("a"))... (case insensitive)
if(!Array.prototype.contains)
{
    Array.prototype.contains = function(searchElement)
    {
        searchElement = searchElement.toLowerCase();

        if (this==null)
            throw new TypeError('Array.contains: "this" is null or not defined');

        if(this.length == 0)
            return false;

        for (var i = this.length - 1; i >= 0; i--) {
            if(this[i].toLowerCase() == searchElement)
                return true;
        };

        return false;

    }
}
