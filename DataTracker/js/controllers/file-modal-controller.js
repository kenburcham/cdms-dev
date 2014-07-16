//file modal controller
var mod_fmc = angular.module('FileModalController', ['ui.bootstrap']);

//modal that handles both saving and editing locations
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

