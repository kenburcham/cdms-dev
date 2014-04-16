'use strict';

var NUM_FLOAT_DIGITS = 3;

var mod = angular.module('DatasetServices', ['ngResource']);

var date_pattern = "/[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}/";


//Note: typically you won't want to use these factories directly in your
// controllers, but rather use the DataService below.
mod.factory('Projects',['$resource', function(resource){
        return resource('http://data.ctuir.org/servicesSTAGE/api/projects',{}, {
            query: {method: 'GET', params: {}, isArray: true}
        });
}]);

mod.factory('Users',['$resource', function($resource){
        return $resource('http://data.ctuir.org/servicesSTAGE/api/users', {}, {
            query: {method: 'GET', params: {}, isArray: true}
        });
}]);

mod.factory('Project',['$resource', function($resource){
        return $resource('http://data.ctuir.org/servicesSTAGE/api/projects', {}, {
            query: {method: 'GET', params: {id:'id'}, isArray: false}
        });
}]);

mod.factory('ProjectDatasets',['$resource', function($resource){
        return $resource('http://data.ctuir.org/servicesSTAGE/action/ProjectDatasets', {}, {
            query: {method: 'GET', params: {id:'projectId'}, isArray: true}
        });
}]);

mod.factory('Activities',['$resource', function($resource){
        return $resource('http://data.ctuir.org/servicesSTAGE/action/DatasetActivities', {}, {
            query: {method: 'GET', params: {id:'datasetId'}, isArray: true}
        });
}]);

mod.factory('Datasets',['$resource', function($resource){
        return $resource('http://data.ctuir.org/servicesSTAGE/api/datasets', {}, {
            query: {method: 'GET', params: {id:'datasetId'}, isArray: false}
        });
}]);

mod.factory('Data',['$resource', function($resource){
        return $resource('http://data.ctuir.org/servicesSTAGE/action/DatasetData', {}, {
            query: {method: 'GET', params: {id:'activityId'}, isArray: false}
        });
}]);

mod.factory('SaveActivitiesAction', ['$resource', function($resource){
        return $resource('http://data.ctuir.org/servicesSTAGE/data/SaveDatasetActivities');
}]);

mod.factory('UpdateActivitiesAction', ['$resource', function($resource){
        return $resource('http://data.ctuir.org/servicesSTAGE/data/UpdateDatasetActivities');
}]);

mod.factory('QueryActivitiesAction',  ['$resource', function($resource){
        return $resource('http://data.ctuir.org/servicesSTAGE/data/QueryDatasetActivities', {}, {
           save: {method: 'POST', isArray: true} 
        });
}]);

mod.factory('ExportActivitiesAction',  ['$resource', function($resource){
        return $resource('http://data.ctuir.org/servicesSTAGE/data/DownloadDatasetActivities', {}, {
           save: {method: 'POST', isArray: false} 
        });
}]);

mod.factory('SetProjectEditors', ['$resource', function($resource){
        return $resource('http://data.ctuir.org/servicesSTAGE/data/SetProjectEditors');
}]);

mod.factory('DeleteActivitiesAction', ['$resource', function($resource){
        return $resource('http://data.ctuir.org/servicesSTAGE/data/DeleteDatasetActivities');
}]);

mod.factory('SetQaStatusAction', ['$resource', function($resource){
        return $resource('http://data.ctuir.org/servicesSTAGE/data/SetQaStatus');
}]);

mod.factory('GetMyDatasetsAction', ['$resource', function($resource){
        return $resource('http://data.ctuir.org/servicesSTAGE/data/GetMyDatasets', {}, {
            query: {method: 'GET', params: {}, isArray: true}
        });
}]);

mod.factory('SaveUserPreferenceAction', ['$resource', function($resource){
        return $resource('http://data.ctuir.org/servicesSTAGE/action/SaveUserPreference');
}]);

mod.factory('GetMetadataProperties', ['$resource', function($resource){
        return $resource('http://data.ctuir.org/servicesSTAGE/api/MetadataProperties');
}]);

mod.factory('SaveDatasetMetadata', ['$resource', function($resource){
        return $resource('http://data.ctuir.org/servicesSTAGE/data/SetDatasetMetadata');
}]);



mod.service('DataService', ['$resource', 'Projects', 'Users','Project','ProjectDatasets', 'Activities', 'Datasets', 'Data', 'SaveActivitiesAction', 'UpdateActivitiesAction','QueryActivitiesAction','SetProjectEditors', 'DeleteActivitiesAction', 'SetQaStatusAction', 'GetMyDatasetsAction','SaveUserPreferenceAction','ExportActivitiesAction','GetMetadataProperties','SaveDatasetMetadata',
    function(resource, Projects, Users, Project, ProjectDatasets, Activities, Datasets, Data, SaveActivitiesAction, UpdateActivitiesAction, QueryActivitiesAction, SetProjectEditors, DeleteActivitiesAction, SetQaStatusAction, GetMyDatasetsAction, SaveUserPreferenceAction, ExportActivitiesAction,GetMetadataProperties, SaveDatasetMetadata){
    var service = {
        
        //our "singleton cache" kinda thing
        project: null,
        dataset: null,
        metadataProperties: null,

        clearDataset: function()
        {
            service.dataset = null;
        },

        getProject: function(id) { 
            if(service.project && service.project.Id == id)
                return service.project;

            service.project = Project.query({id: id});
            return service.project;
        },

        getMyDatasets: function() {
            return GetMyDatasetsAction.query();
        },

        getDataset: function(datasetId) {
            if(service.dataset && service.dataset.Id == datasetId)
                return service.dataset;
            
            service.dataset = Datasets.query({id: datasetId});
            return service.dataset;
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

        getProjectDatasets: function(projectId){
            this.getProject(projectId); //set our local project to the one selected
            return ProjectDatasets.query({id: projectId});
        },

        getMetadataProperty: function(propertyId){
            if(!service.metadataProperties)
            {
                //console.log("Looking up properties.");
                service.metadataPropertiesPromise = GetMetadataProperties.query(function(data){
                    service.metadataProperties = {};
                    angular.forEach(data, function(value, key){
                        service.metadataProperties["ID_"+value.Id] = value;
                    });    
                  //  console.log("done and now returing");
                  //  console.dir(service.metadataProperties);
                  //  console.log("returning: " + service.metadataProperties["ID_"+propertyId].Name);
                   return service.metadataProperties["ID_"+propertyId];

                });
            }else{
                //console.log("not looking up just returning");
                return service.metadataProperties["ID_"+propertyId];                
            }
        },

        getMetadataProperties: function(scope, propertyTypeId) {
            if(!service.metadataPropertiesPromise.$resolved)
            {
                service.metadataPropertiesPromise.$promise.then(function(){
                    scope.metadataProperties = getMatchingByField(service.metadataProperties, propertyTypeId, 'MetadataEntityId');
                });
            }
            else
            {
                scope.metadataProperties = getMatchingByField(service.metadataProperties, propertyTypeId, 'MetadataEntityId');
            }
        },

        saveDatasetMetadata: function(datasetId, metadata, saveResults)
        {
            saveResults.saving = true;
            var payload = {
                DatasetId: datasetId,
                Metadata: metadata
            };

            SaveDatasetMetadata.save(payload, function(data){
                saveResults.saving = false;
                saveResults.success = true;
            }, function(data){
                saveResults.saving = false;
                saveResults.failure = true;
            });

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
            SaveActivitiesAction.save(activities, function(data){
                activities.success = "Save successful.";
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

            parseSingleActivity: function(heading, data, headerFields, detailFields){
                var activities = {activities: {}, errors: false};

                var tmpdata = data.slice(0); // create a copy.

                var key = service.makeKey(heading);

                if(key)
                {
                    angular.forEach(tmpdata, function(data_row, index){
                        //note we mash the heading fields into our row -- addActivity splits them out appropriately.
                        service.addActivity(activities, key, angular.extend(data_row, heading), headerFields, detailFields);
                    });
                }
                else
                {
                    service.addError(activities,0, "Both a Location and ActivityDate are required to save a new Activity.");
                }


                return activities;

            },

            //parses an array of header+detail fields into discrete activities
            parseActivitySheet: function(data, headerFields, detailFields){
                var activities = {activities: {}, errors: false};

                var tmpdata = data.slice(0); //create a copy

                angular.forEach(tmpdata, function(row, index){
                    var key = service.makeKey(row);

                    if(key)
                        service.addActivity(activities, key, row, headerFields, detailFields); 
                    else
                        service.addError(activities, index, "Both a Location and ActivityDate are required to save a new Activity.");

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

            makeKey: function(row){
                if(row.locationId && row.activityDate)
                {
                    return row.locationId + '_' + row.activityDate;
                }

                return undefined;
            },

            addActivity: function(activities, key, row, headerFields, detailFields){
                if(!activities.activities[key])
                {
                    //setup the new activity object structure
                    activities.activities[key] = {
                        LocationId: row.locationId,
                        ActivityDate: new Date(Date.parse(row.activityDate)).toJSON(),
                        Header: {},
                        Details: [],
                    };

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
                    angular.forEach(headerFields, function(field){
                        activities.activities[key].Header[field.DbColumnName] = row[field.DbColumnName];
                    });

                }

                //handle field level validation or processing
                angular.forEach(detailFields, function(field){

                    //flatten multiselect values into an json array string
                    if(field.ControlType == "multiselect" && row[field.DbColumnName])
                    {
                        row[field.DbColumnName] = angular.toJson(row[field.DbColumnName]).toString(); //wow, definitely need tostring here!
                    }

                    //what else? //TODO:
                    //activities.errors.push({message: "What went wrong"});
                });
                
                activities.activities[key].Details.push(row);
            },

        };        

        return service;
    }]);


//gridDatasheetOptions needs to be set to your datasheet grid
mod.service('DataSheet',[ 'Logger', '$window',
    function(Logger,$window){
        //var LocationCellTemplate = '<input ng-class="\'colt\' + col.index" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-blur="updateEntity(row)" />';

        var LocationCellEditTemplate = '<select ng-class="\'colt\' + col.index" ng-blur="updateCell(row,\'locationId\')" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in locationOptions"/>';

        var QACellEditTemplate = '<select ng-class="\'colt\' + col.index" ng-blur="updateCell(row,\'QAStatusId\')" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in QAStatusOptions"/>';


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
                
                scope.selectCell = function(field) {
                    console.log("select cell!");
                    scope.onField = scope.FieldLookup[field];
                };
                
                //dynamically set the width of the grids.
                var grid_width_watcher = scope.$watch('FieldLookup', function(){
                    var length = array_count(scope.FieldLookup);
                    var minwidth = (980 < $window.innerWidth) ? $window.innerWidth - 100 : 980;
                    //console.log(minwidth + " <----");
                    var width = 100 * length; //multiply number of columns by 100px
                    if(width < minwidth) width=minwidth; //min-width
                    scope.gridWidth = { width: width };
                    //refresh the grid
                    setTimeout(function() {
                        scope.gridDatasheetOptions.$gridServices.DomUtilityService.RebuildGrid(scope.gridDatasheetOptions.$gridScope, scope.gridDatasheetOptions.ngGrid); //refresh
                      //  console.log("Width now: " + width);
                        grid_width_watcher(); //remove watcher.
                    }, 200);
                },true);

                //only do this for pages that have editing enabled
                if(scope.gridDatasheetOptions.enableCellEdit)
                {
                    //setup editing rowtemplate
                    scope.gridDatasheetOptions.rowTemplate = '<div ng-click="selectCell(col.field)" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="{\'has-validation-error\': !row.getProperty(\'isValid\')}" class="{{col.colIndex()}} ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>';
                }

                //this is pure awesomeness: setup a watcher so that when we navigate the grid we update our current row and validate it.
                scope.$watch('gridDatasheetOptions.$gridScope.selectionProvider.lastClickedRow', function(){
                    //Logger.debug(scope.gridDatasheetOptions.$gridScope);
                    scope.onRow = scope.gridDatasheetOptions.$gridScope.selectionProvider.lastClickedRow;
                    console.dir(scope.gridDatasheetOptions.$gridScope.selectionProvider);
                });

            },

            getColDefs: function(){
                var coldefs = [{
                                        field: 'locationId', 
                                        displayName: 'Location', 
                                        editableCellTemplate: LocationCellEditTemplate,
                                        cellFilter: 'locationNameFilter'
                                    },
                                    {
                                        field: 'activityDate', 
                                        displayName: 'Activity Date',
                                        cellFilter: 'date: \'MM/dd/yyyy\'',
                                        editableCellTemplate: '<input ng-blur="updateCell(row,\'activityDate\')" type="text" ng-pattern="'+date_pattern+'" ng-model="COL_FIELD" ng-input="COL_FIELD" />',
                                    },
                                    {
                                        field: 'QAStatusId',
                                        displayName: 'QA Status',
                                        editableCellTemplate: QACellEditTemplate,
                                        cellFilter: 'QAStatusFilter'

                                    }
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
                
                try{
                    //fire Field rule if it exists -- OnChange
                    if(field.Field.Rule && field.Field.Rule.OnChange){
                        eval(field.Field.Rule.OnChange);
                    }

                    //fire Datafield rule if it exists -- OnChange
                    if(field.Rule && field.Rule.OnChange){
                        eval(field.Rule.OnChange);
                    }
                }catch(e){
                    //so we don't die if the rule fails....
                    console.dir(e);
                }
            


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
                if(value)
                {
                    try{
                        //fire Field rule if it exists -- OnChange
                        if(field.Field.Rule && field.Field.Rule.OnChange){
                            eval(field.Field.Rule.OnChange);
                        }

                        //fire Datafield rule if it exists -- OnChange
                        if(field.Rule && field.Rule.OnChange){
                            eval(field.Rule.OnChange);
                        }
                    }catch(e){
                        //so we don't die if the rule fails....
                        console.dir(e);
                    }
                }

                //this is expensive in that it runs every time a value is changed in the grid.
                scope.validateGrid(scope); //so that number of errors gets calculated properly.


            },


            undoRemoveOnRow: function(scope)
            {
                var entity = scope.deletedRows.pop();
                scope.dataSheetDataset.push(entity);
            },


            removeOnRow: function(scope){
                scope.dataChanged = true;
                scope.deletedRows.push(scope.onRow.entity);
                var index = scope.dataSheetDataset.indexOf(scope.onRow.entity);
                scope.dataSheetDataset.splice(index,1);
                scope.onRow = undefined;
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
        maxWidth: 180,
    };


    //only setup edit templates for fields in grids with cell editing enabled.
    if(scope.gridDatasheetOptions.enableCellEdit)
    {
        //first of all!
        coldef.enableCellEdit = true;

        //setup column according to what type it is
        switch(field.ControlType)
        {
            case 'select':
                coldef.editableCellTemplate = '<select ng-class="\'colt\' + col.index" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-blur="updateCell(row,\''+field.DbColumnName+'\')" ng-options="id as name for (id, name) in CellOptions.'+ field.DbColumnName +'Options"/>';
                scope.CellOptions[field.DbColumnName+'Options'] = makeObjectsFromValues(field.DbColumnName, field.Field.PossibleValues);
                break;
            case 'multiselect':
                //coldef.editableCellTemplate = '<select class="field-multiselect" multiple="true" ng-class="\'colt\' + col.index" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in CellOptions.'+ field.DbColumnName +'Options"/>';
                //coldef.cellTemplate = '<div class="ngCellText cell-multiselect" ng-class="col.colIndex()"><span ng-cell-text>{{row.getProperty(col.field)}}</span></div>';
                coldef.editableCellTemplate = '<select class="field-multiselect" multiple="true" ng-blur="updateCell(row,\''+field.DbColumnName+'\')" ng-class="\'colt\' + col.index" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in CellOptions.'+ field.DbColumnName +'Options"/>';
                scope.CellOptions[field.DbColumnName+'Options'] = makeObjectsFromValues(field.DbColumnName, field.Field.PossibleValues);
                break;
            case 'date':
                editableCellTemplate: '<input type="text" ng-blur="updateCell(row,\''+field.DbColumnName+'\')" ng-pattern="'+date_pattern+'" ng-model="COL_FIELD" ng-input="COL_FIELD" />';
                break;
            case 'text':
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

        }
    }

    //setup cellfilters
    switch(field.ControlType)
    {
        case 'multiselect':
            coldef.cellFilter = 'arrayValues';        
            break;
            
        case 'date':
            coldef.cellFilter = 'date: \'MM/dd/yyyy\'';
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

    var displayName = field.Label;

    //include units in the label
    if(field.Field.Units)
        displayName += " (" + field.Field.Units+")";

    field.Label = displayName;

    if(field.Field.Validation)
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

    try{
        field.Rule = (field.Rule) ? angular.fromJson(field.Rule) : {};
        field.Field.Rule = (field.Field.Rule) ? angular.fromJson(field.Field.Rule) : {};
    }
    catch(e)
    {
        console.log("*** there is a rule parsing error for " + field.Field.Name + " *** ");
        console.dir(e);
    }

    field.parsed = true;

}

//creates an empty row for arbitrary datasets
function makeNewRow(coldefs)
{
    var obj = {};

    angular.forEach(coldefs, function(col){
        obj[col.field] = ''
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

        var selectOptions = angular.fromJson(valuesList);
        
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
     var nameA=a.Label.toLowerCase(), nameB=b.Label.toLowerCase()
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
            if(Object.keys(scope.CellOptions[field.DbColumnName+'Options']).indexOf(value) == -1) //not found
                row_errors.push("["+field.DbColumnName+"] Invalid selection");
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


    try{
        //fire Field rule if it exists -- OnValidate
        if(field.Field && field.Field.Rule && field.Field.Rule.OnValidate)
            eval(field.Field.Rule.OnValidate);

        //fire Datafield rule if it exists -- OnValidate
        if(field.Rule && field.Rule.OnValidate)
            eval(field.Rule.OnValidate);
    }catch(e){
        console.dir(e);
    }

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

function getAdultWeirChartData(data)
{
    var dataCalc = {};

    angular.forEach(data, function(row, key){
        var num = (row.TotalFishRepresented) ? row.TotalFishRepresented : 1;
        //console.log(row);

        if(row.Species)
        {

            if(!dataCalc[row.Species])
                dataCalc[row.Species] = { total: 0, males: 0, females: 0};

            dataCalc[row.Species].total += num;

            if(row.Sex == "M")
                dataCalc[row.Species].males += 1;
            if(row.Sex == "F")
                dataCalc[row.Species].females += 1;
            
        }
        
        //console.log(row.Species + " = ");
        //console.dir(dataCalc[row.Species]);
        
    });

    var data = {
              "series": [
                "Total",
                "Male",
                "Female"
              ],
              "data": [
              ]
            };

    angular.forEach(dataCalc, function(vals, species){
        data['data'].push({
          "x": species,
          "y": [vals.total,vals.males,vals.females],
        });
    });

//    console.log(data);

    return data;

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
        return (parseFloat(fahr) - 32) * (5/9).toFixed(NUM_FLOAT_DIGITS);

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

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

