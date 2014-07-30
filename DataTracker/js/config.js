//CONFIGURATION 

//  This file contains all of the various config values.
//  Many of these items will need to be configured when you implement this system 
//  in a new environment.


var profile = null; 
var serviceUrl = '//data.ctuir.org/servicesSTAGE';
var PRIMARY_PROJECT_LOCATION_TYPEID = 3;
var LOCATION_TYPE_APPRAISAL = 8;
var SDE_FEATURECLASS_TAXLOTQUERY = 4;
var NAD83_SPATIAL_REFERENCE = 'PROJCS["NAD83(NSRS2007) / UTM zone 11N",GEOGCS["NAD83(NSRS2007)",DATUM["D_",SPHEROID["GRS_1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",-117],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["Meter",1]]';
var GEOMETRY_SERVICE_URL = "//restdata.ctuir.org/arcgis/rest/services/Utilities/Geometry/GeometryServer";
var LOGIN_URL = "//data.ctuir.org/cdms-dev/DataTracker/login.html";
var WHOAMI_URL = '//data.ctuir.org/servicesSTAGE/action/whoami';

var NUM_FLOAT_DIGITS = 3;
var FIELD_ROLE_HEADER = 1;
var FIELD_ROLE_DETAIL = 2;
var FIELD_ROLE_SUMMARY = 3;
var FIELD_ROLE_CALCULATED = 4;
var FIELD_ROLE_VIRTUAL = 5;
var METADATA_ENTITY_PROJECTTYPEID = 1;
var METADATA_ENTITY_HABITATTYPEID = 2;
var METADATA_ENTITY_DATASETTYPEID = 5;

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
