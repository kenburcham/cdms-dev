/* -- bootstraps angular via dojo --*/

var profile = null; 
var ALLOW_SUPERADMIN = true;

require([
  'angular',
  'app',
//  'app/controllers/MapCtrl',
  'app/directives/Map',
  'app/directives/FeatureLayer'
], function(angular) {
  angular.element(document).ready(function(){
	//check our authentication and setup our user profile first of all!
	//http://nadeemkhedr.wordpress.com/2013/11/25/how-to-do-authorization-and-role-based-permissions-in-angularjs/
  	$.get('//data.ctuir.org/servicesSTAGE/action/whoami', function(data){
  		profile = data;
  	})
    .fail(function(){
      window.location="//data.ctuir.org/cdms-dev/ProjectTracker/index.html";
    })
  	.always(function(){
		console.log("Booting angular.");
  		angular.bootstrap(document.body, ['app']);
  	});
	  
  });
  
});