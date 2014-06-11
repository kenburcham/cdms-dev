/* -- bootstraps angular via dojo --*/

var profile = null; 
var ALLOW_SUPERADMIN = true;
var serviceUrl = '//data.ctuir.org/servicesSTAGE';

require([
  'angular',
  'dojo/parser',
  'dijit/Menu',
  'dijit/MenuItem',
  'dijit/form/DropDownButton',
  'app',
  'app/directives/Map',
  'app/directives/FeatureLayer',


], function(angular,parser) {
  angular.element(document).ready(function(){
	//check our authentication and setup our user profile first of all!
	//http://nadeemkhedr.wordpress.com/2013/11/25/how-to-do-authorization-and-role-based-permissions-in-angularjs/
  	$.get('//data.ctuir.org/servicesSTAGE/action/whoami', function(data){
  		profile = data;
  	})
    .fail(function(){
      window.location="//data.ctuir.org/cdms-dev/DataTracker/login.html";
    })
  	.always(function(){
		console.log("Booting angular.");
  		angular.bootstrap(document.body, ['app']);
      console.log("parsing");
      parser.parse();
  	});
	  
  });
  
});