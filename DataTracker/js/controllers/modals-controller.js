//file modal controller
var mod_fmc = angular.module('ModalsController', ['ui.bootstrap']);

//handles managing file controltypes
mod_fmc.controller('FileModalCtrl', ['$scope','$modalInstance', 'DataService','DatastoreService',
    function($scope,  $modalInstance, DataService, DatastoreService){

    	//note: file selected for upload are managed by onFileSelect from parent scope (dataeditcontroller, most likely)

    	//file_field and file_row
    	console.dir($scope.file_row);
    	console.dir($scope.file_field);
    	console.log("Files!");
    	console.dir($scope.filesToUpload);

    	$scope.currentFiles = $scope.file_row[$scope.file_field.DbColumnName];
    	if($scope.currentFiles)
    		$scope.currentFiles = angular.fromJson($scope.currentFiles);
    	else
    		$scope.currentFiles = [];

    	console.dir($scope.currentFiles);

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

        $scope.makeNewLink = function(){$scope.newLink = {Name: "", Link: "http://"}}; 
        $scope.makeNewLink();

        $scope.currentLinks = $scope.link_row[$scope.link_field.DbColumnName];
        if($scope.currentLinks)
            $scope.currentLinks = angular.fromJson($scope.currentLinks);
        else
            $scope.currentLinks = [];

        console.dir($scope.currentLinks);

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
