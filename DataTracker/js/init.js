/* -- bootstraps angular via dojo --*/

var profile = null; 
var ALLOW_SUPERADMIN = true;
var serviceUrl = '//data.ctuir.org/servicesSTAGE';
var PRIMARY_PROJECT_LOCATION_TYPEID = 3;
var NAD83_SPATIAL_REFERENCE = 'PROJCS["NAD83(NSRS2007) / UTM zone 11N",GEOGCS["NAD83(NSRS2007)",DATUM["D_",SPHEROID["GRS_1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",-117],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["Meter",1]]';
var GEOMETRY_SERVICE_URL = "//restdata.ctuir.org/arcgis/rest/services/Utilities/Geometry/GeometryServer";
var LOGIN_URL = "//data.ctuir.org/cdms-dev/DataTracker/login.html";
var WHOAMI_URL = '//data.ctuir.org/servicesSTAGE/action/whoami';

require([
  'angular',
  'dojo/parser',
  'dijit/Menu',
  'dijit/MenuItem',
  'dijit/form/DropDownButton',
  'app',
  'app/directives/Map',
  'app/directives/FeatureLayer',
  'app/directives/AppraisalMap'


], function(angular,parser) {
  angular.element(document).ready(function(){
	//check our authentication and setup our user profile first of all!
	//http://nadeemkhedr.wordpress.com/2013/11/25/how-to-do-authorization-and-role-based-permissions-in-angularjs/
  	$.get(WHOAMI_URL, function(data){
  		profile = data;
  	})
    .fail(function(){
      window.location=LOGIN_URL;
    })
  	.always(function(){
		console.log("Booting angular.");
  		angular.bootstrap(document.body, ['app']);
      console.log("parsing");
      parser.parse();
  	});
	  
  });
  
});


var millis_per_h = 3600000;

var SystemTimezones = [
  {
    "Name" : "Pacific Standard Time (GMT-08:00)",
    "Description" : "(GMT-08:00) Pacific Standard Time (US & Canada)",
    "TimezoneOffset" : -8 * millis_per_h,
  }, 
{
    "Name" : "Pacific Daylight Time (GMT-07:00)",
    "Description" : "(GMT-07:00) Pacific Daylight Time (US & Canada)",
    "TimezoneOffset" : -7 * millis_per_h,
  },
  {
    "Name" : "Mountain Standard Time (GMT-07:00)",
    "Description" : "(GMT-07:00) Mountain Standard Time (US & Canada)",
    "TimezoneOffset" : -7 * millis_per_h,
  },

  // {
  //  "Name" : "Central Standard Time",
  //  "Description" : "(GMT-06:00) Central Standard Time (US & Canada)",
  //  "TimezoneOffset" : -6 * millis_per_h,
  //}, {
  //  "Name" : "Eastern Standard Time",
  //  "Description" : "(GMT-05:00) Eastern Standard Time (US & Canada)",
  //  "TimezoneOffset" : -5 * millis_per_h,
  //},
  {
    "Name" : "Mountain Daylight Time (GMT-06:00)",
    "Description" : "(GMT-06:00) Mountain Daylight Time (US & Canada)",
    "TimezoneOffset" : -6 * millis_per_h,
  }, 

  {
    "Name" : "Greenwich Mean Time (GMT-00:00)",
    "Description" : "(GMT-00:00) Greenwich Mean Time",
    "TimezoneOffset" : 0,
  }, 


  //{
  //  "Name" : "Central Daylight Time",
  //  "Description" : "(GMT-05:00) Central Daylight Time (US & Canada)",
  //  "TimezoneOffset" : -5 * millis_per_h,
  // }, {
  //  "Name" : "Eastern Daylight Time",
  //  "Description" : "(GMT-04:00) Eastern Daylight Time (US & Canada)",
  //  "TimezoneOffset" : -4 * millis_per_h,
  //}
];

var DataGradeMethods = [];
DataGradeMethods.push(""); // 0
DataGradeMethods.push("NIST check in BOTH warm and ice baths");
DataGradeMethods.push("NIST check in ice bath only");
DataGradeMethods.push("Manufacturer Calibration");
DataGradeMethods.push("No Accuracy Check Conducted");
DataGradeMethods.push("Unknown Accuracy Method");
