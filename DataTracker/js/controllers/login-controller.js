var serviceUrl = '//data.ctuir.org/servicesSTAGE';
var successUrl = '//data.ctuir.org/cdms-dev/DataTracker/index.html';

var app = angular.module('loginModule', ['ngRoute','ui.bootstrap', 'ngResource']);

app.config(['$routeProvider', function($routeProvider) 
{
	$routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: 'LoginCtrl'});
	$routeProvider.otherwise({redirectTo: '/login'});
}]);


// Login controller
app.controller('LoginCtrl', ['$scope','LoginSvc', function($scope, LoginSvc){
	
	$scope.loggingIn = false;
	$scope.loginMessage = "Trying to login...";

	$scope.login = function(){
		$scope.error = undefined; //clear any error

		if(!$scope.Username || !$scope.Password)
			return;

		$scope.loggingIn = true;

		try{
			
			var login_try = LoginSvc.login($scope.Username, $scope.Password);

			if(login_try)
			{
				login_try.$promise.then(function(data){
					if(data.Success)
					{
						$scope.loginMessage = data.Message;
						window.location = successUrl;
					}
					else
					{
						$scope.loggingIn = false;
						$scope.error = data.Message;
					}
				});
			}
			else
			{
				$scope.loggingIn = false;
				$scope.error = 'There was a problem trying to login.  Contact the helpdesk if you need further assistance.';	
			}
		}catch(e)
		{
			console.dir(e);
		}
	};


}]);

app.factory('LoginRequest',['$resource', function(resource){
        return resource(serviceUrl+'/account/login');
}]);

app.service('LoginSvc', ['LoginRequest', function(LoginRequest){
	var service = 
		{
			login: function(username, password){
				return LoginRequest.save({Username: username, Password: password});
			}
		};

	return service;

}]);
