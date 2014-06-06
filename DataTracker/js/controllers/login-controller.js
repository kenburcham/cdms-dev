var app = angular.module('loginModule', ['ngRoute']);

app.config(['$routeProvider', function($routeProvider) 
{
	$routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: 'LoginCtrl'});
	$routeProvider.otherwise({redirectTo: '/login'});
}]);

app.controller('LoginCtrl', function($scope){
	$scope.Username = "Ken";
});