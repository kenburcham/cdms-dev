//file modal controller
var mod_fmc = angular.module('ModalsController', ['ui.bootstrap']);



mod_fmc.controller('ModalCreateInstrumentCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService',
  function($scope,  $modalInstance, DataService, DatastoreService){

    $scope.header_message = "Create new instrument";

    $scope.instrument_row = {
        StatusId: 0,
        OwningDepartmentId: 1,
    };

    if($scope.viewInstrument)
    {
        $scope.header_message = "Edit instrument: " + $scope.viewInstrument.Name;
        $scope.instrument_row = $scope.viewInstrument;
    }


    $scope.InstrumentTypes = DatastoreService.getInstrumentTypes();
    $scope.Departments = DataService.getDepartments();
    $scope.RawProjects = DataService.getProjects();


    $scope.save = function(){
        var saveRow = angular.copy($scope.instrument_row);
        saveRow.AccuracyChecks = undefined;
        saveRow.InstrumentType = undefined;
        saveRow.OwningDepartment = undefined;
        var promise = DatastoreService.saveInstrument($scope.project.Id, saveRow);
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


//when you click the "View" button on a relation table field, it opens this modal
mod_fmc.controller('RelationGridModalCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService',
    function($scope,  $modalInstance, DataService, DatastoreService){

        //incoming scope variable
        // $scope.relationgrid_row, $scope.relationgrid_field
        if($scope.relationgrid_field.Field == null || $scope.relationgrid_field.Field.DataSource == null)
        {
            $scope.alerts = [{type: "error", msg: "There is a misconfiguration in the relationship. "}];
            return;
        }
        else
        {
            $scope.relation_dataset = DataService.getDataset($scope.relationgrid_field.Field.DataSource);
        }

        //get the relationdata out of the row -- use it if it exists, otherwise fetch it from the db.
        if($scope.relationgrid_row[$scope.relationgrid_field.DbColumnName])
            $scope.relationgrid_data = $scope.relationgrid_row[$scope.relationgrid_field.DbColumnName];
        else
        {
            $scope.relationgrid_data = DataService.getRelationData($scope.relationgrid_field.FieldId, $scope.relationgrid_row.ActivityId, $scope.relationgrid_row.RowId);
            $scope.relationgrid_row[$scope.relationgrid_field.DbColumnName] = $scope.relationgrid_data;
        }

        $scope.relationColDefs = [];
        $scope.relationGrid = {
            data: 'relationgrid_data',
            columnDefs: 'relationColDefs',
            enableCellSelection: true,
            enableRowSelection: false,
            enableCellEdit: $scope.isEditable,
            enableColumnResize: true,
        };

        $scope.$watch('relation_dataset.Id', function(){
            if(!$scope.relation_dataset.Id)
                return;

            var grid_fields = [];

            //iterate the fields of our relation dataset and populate our grid columns
            angular.forEach($scope.relation_dataset.Fields.sort(orderByIndex), function(field){
                parseField(field, $scope);
                grid_fields.push(field);
                $scope.relationColDefs.push(makeFieldColDef(field, $scope));
            });

            //add our list of fields to a relationFields collection -- we will use this later when saving...
            $scope.fields.relation[$scope.relationgrid_field.Field.DbColumnName] = grid_fields;
            
        });

        $scope.save = function(){

            //copy back to the actual row field
            //$scope.link_row[$scope.link_field.DbColumnName] = angular.toJson($scope.currentLinks);
            //console.dir($scope.relationgrid_row);
            $scope.updatedRows.push($scope.relationgrid_row.Id);
            $modalInstance.dismiss();
        };

        $scope.cancel = function(){
            $modalInstance.dismiss();
        };

        $scope.addRow = function()
        {
            $scope.relationgrid_data.push(makeNewRow($scope.relationColDefs));
        }

    }
]);



//handles managing file controltypes
mod_fmc.controller('FileModalCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService',
    function($scope,  $modalInstance, DataService, DatastoreService){

    	//note: file selected for upload are managed by onFileSelect from parent scope (dataeditcontroller, most likely)

    	//file_field and file_row
    	//console.dir($scope.file_row);
    	//console.dir($scope.file_field);
    	//console.log("Files!");
    	//console.dir($scope.filesToUpload);

    	$scope.currentFiles = $scope.file_row[$scope.file_field.DbColumnName];
    	if($scope.currentFiles)
    		$scope.currentFiles = angular.fromJson($scope.currentFiles);
    	else
    		$scope.currentFiles = [];

    	//console.dir($scope.currentFiles);

    	$scope.removeFile = function(file)
    	{
	    		angular.forEach($scope.currentFiles, function(existing_file, key){
	    			if(existing_file.Name == file.Name)
	    				$scope.currentFiles.splice(key,1);
	    		});
	    	
	    	if(!file.Id) //removing a not-yet-saved file, so remove it from the tobeuploaded list
	    	{
	    		//also look in the previously scheduled for upload files...
	    		try{
	    		angular.forEach($scope.filesToUpload[$scope.file_field.DbColumnName], function(to_upload_file, key){
	    			//console.dir(to_upload_file);
	    			//console.dir(file);
	    			//console.dir(key);

	    			if(to_upload_file.Name == file.Name){
	    				$scope.filesToUpload[$scope.file_field.DbColumnName].splice(key,1);
	    			}
	    		});
	    		}
	    		catch(e)
	    		{
	    			console.dir(e);
	    		}
	    	}

//	    	console.dir($scope.filesToUpload);
    	}

        $scope.save = function(){
			//add any newly scheduled to upload files to the list for display
        	angular.forEach($scope.filesToUpload[$scope.file_field.DbColumnName], function(incoming_file, key){
        		incoming_file.Name = incoming_file.name; //copy this value!
        		$scope.currentFiles.push(incoming_file);
        	});

        	//copy back to the actual row field
        	$scope.file_row[$scope.file_field.DbColumnName] = angular.toJson($scope.currentFiles);
            $modalInstance.dismiss();
        };

        $scope.cancel = function(){
            $modalInstance.dismiss();
        };

    }
]);

//handles modifying link control types

mod_fmc.controller('LinkModalCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService',
    function($scope,  $modalInstance, DataService, DatastoreService){

        //note: file selected for upload are managed by onFileSelect from parent scope (dataeditcontroller, most likely)

        $scope.makeNewLink = function(){$scope.newLink = {Name: "", Link: "//"}}; 
        $scope.makeNewLink();

        $scope.currentLinks = $scope.link_row[$scope.link_field.DbColumnName];
        if($scope.currentLinks)
            $scope.currentLinks = angular.fromJson($scope.currentLinks);
        else
            $scope.currentLinks = [];

        //console.dir($scope.currentLinks);

        $scope.removeLink = function(link)
        {
            angular.forEach($scope.currentLinks, function(existing_link, key){
                if(existing_link.Link == link.Link)
                    $scope.currentLinks.splice(key,1);
            });
        }

        $scope.addLink = function()
        {
            $scope.currentLinks.push($scope.newLink);   
            $scope.makeNewLink();
        }

        $scope.save = function(){

            //copy back to the actual row field
            $scope.link_row[$scope.link_field.DbColumnName] = angular.toJson($scope.currentLinks);
            $modalInstance.dismiss();
        };

        $scope.cancel = function(){
            $modalInstance.dismiss();
        };

    }
]);


mod_fmc.controller('ModalChooseMapCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService',
  function($scope,  $modalInstance, DataService, DatastoreService){

     var galleryLinkTemplate = '<a href="{{row.getProperty(\'Link\')}}" target="_blank" title="{{row.getProperty(\'Link\')}}">' +
                                '<img ng-src="{{row.getProperty(\'Link\')}}" width="150px"/><br/><div class="ngCellText" ng-class="col.colIndex()">' +
                               '</a>' +
                               '</div>';
        $scope.chooseMapSelection = [];
        
        $scope.chooseMapGallery = {
            data: 'project.Images',
            columnDefs:
            [
                {field:'Name',displayName: 'File', cellTemplate: galleryLinkTemplate},
                {field: 'Title'},
                {field: 'Description'},
                //{field: 'Size'},
            ],
            multiSelect: false,
            selectedItems: $scope.chooseMapSelection

        };
    

    $scope.save = function(){

        if($scope.chooseMapSelection.length == 0)
        {
            alert("Please choose an image to save by clicking on it and try again.");
            return;
        }

        //is there already a mapselection?
        var mapmd = getByField($scope.project.Metadata, METADATA_PROPERTY_MAPIMAGE, "MetadataPropertyId");
        var mapmd_html = getByField($scope.project.Metadata, METADATA_PROPERTY_MAPIMAGE_HTML, "MetadataPropertyId");

        if(!mapmd)
        {
            mapmd = {   MetadataPropertyId: METADATA_PROPERTY_MAPIMAGE, UserId: $scope.Profile.Id  };
            $scope.project.Metadata.push(mapmd);
        }

        if(!mapmd_html)
        {
            mapmd_html = {  MetadataPropertyId: METADATA_PROPERTY_MAPIMAGE_HTML, UserId: $scope.Profile.Id  };
            $scope.project.Metadata.push(mapmd_html);
        }        

        mapmd.Values = $scope.chooseMapSelection[0].Id; //fileid of the chosen image file

        //whip up the html .. might be good to have this in a pattern somewhere external!
        var the_html = "<div class='selected-image-div'>";
            the_html += "<img src='" + $scope.chooseMapSelection[0].Link + "' class='selected-image'>";
            if ($scope.chooseMapSelection[0].Description)
                the_html += "<p>" + $scope.chooseMapSelection[0].Description + "</p>";
            the_html += "</div>";

        mapmd_html.Values = the_html;

        //console.dir($scope.project.Metadata);

        var promise = DataService.saveProject($scope.project);
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

mod_fmc.controller('ModalChooseSummaryImagesCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService',
  function($scope,  $modalInstance, DataService, DatastoreService){

     var galleryLinkTemplate = '<a href="{{row.getProperty(\'Link\')}}" target="_blank" title="{{row.getProperty(\'Link\')}}">' +
                                '<img ng-src="{{row.getProperty(\'Link\')}}" width="150px"/><br/><div class="ngCellText" ng-class="col.colIndex()">' +
                               '</a>' +
                               '</div>';
        $scope.chooseSummaryImagesSelection = [];
        
        $scope.chooseSummaryImagesGallery = {
            data: 'project.Images',
            columnDefs:
            [
                {field:'Name',displayName: 'File', cellTemplate: galleryLinkTemplate},
                {field: 'Title'},
                {field: 'Description'},
                //{field: 'Size'},
            ],
            multiSelect: true,
            selectedItems: $scope.chooseSummaryImagesSelection

        };
    

    $scope.save = function(){

        if($scope.chooseSummaryImagesSelection.length == 0)
        {
            alert("Please choose at least one image to save by clicking on it and try again.");
            return;
        }

        //is there already a metadata record?
        var imgmd = getByField($scope.project.Metadata, METADATA_PROPERTY_SUMMARYIMAGE, "MetadataPropertyId");
        var imgmd_html = getByField($scope.project.Metadata, METADATA_PROPERTY_SUMMARYIMAGE_HTML, "MetadataPropertyId");

        if(!imgmd)
        {
            imgmd = {   MetadataPropertyId: METADATA_PROPERTY_SUMMARYIMAGE, UserId: $scope.Profile.Id  };
            $scope.project.Metadata.push(imgmd);
        }

        if(!imgmd_html)
        {
            imgmd_html = {  MetadataPropertyId: METADATA_PROPERTY_SUMMARYIMAGE_HTML, UserId: $scope.Profile.Id  };
            $scope.project.Metadata.push(imgmd_html);
        }        

        var selections = [];
        var the_html = "";

        for (var i = $scope.chooseSummaryImagesSelection.length - 1; i >= 0; i--) {
            var selection = $scope.chooseSummaryImagesSelection[i];

            //whip up the html .. might be good to have this in a pattern somewhere external!
            the_html += "<div class='selected-image-div'>";
                the_html += "<img src='" + selection.Link + "' class='selected-image'>";
                if (selection.Description)
                    the_html += "<p>" + selection.Description + "</p>";
                the_html += "</div>";

            selections.push(selection.Id);

        }

        imgmd_html.Values = the_html;
        imgmd.Values = selections.toString();

        //console.dir($scope.project.Metadata);

        var promise = DataService.saveProject($scope.project);
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



