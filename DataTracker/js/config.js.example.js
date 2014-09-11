//CONFIGURATION 

//CDMS - Centralized Data Management System
//Written by Ken Burcham of CTUIR
//Instructions on getting started can be found here: https://github.com/CTUIR/cdms-docs/wiki/Getting-Started

/*

This system is (C) 2014 by the Confederated Tribes of the Umatilla Indian Reservation. 
Any use is subject to our license agreement included with this code.
A copy is currently located here: https://github.com/CTUIR/cdms-dev/blob/master/LICENSE

THE CDMS AND COVERED CODE IS PROVIDED UNDER THIS LICENSE ON AN "AS IS" BASIS, 
WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING, WITHOUT LIMITATION, 
WARRANTIES THAT THE COVERED CODE IS FREE OF DEFECTS, MERCHANTABLE, FIT FOR A PARTICULAR 
PURPOSE OR NON-INFRINGING. THE ENTIRE RISK AS TO THE QUALITY AND PERFORMANCE OF THE COVERED CODE
 IS WITH LICENSEE. SHOULD ANY COVERED CODE PROVE DEFECTIVE IN ANY RESPECT, LICENSEE (NOT THE CTUIR 
 OR ANY OTHER CONTRIBUTOR) ASSUMES THE COST OF ANY NECESSARY SERVICING, REPAIR OR CORRECTION. 
 THIS DISCLAIMER OF WARRANTY CONSTITUTES AN ESSENTIAL PART OF THIS LICENSE. NO USE OF
  ANY COVERED CODE IS AUTHORIZED HEREUNDER EXCEPT UNDER THIS DISCLAIMER.

*/

//  This file contains all of the various config values.
//  Many of these items will need to be configured when you implement this system 
//  in a new environment.

//note: there are some other files you will need to edit, too:
//partials/projects.html - (the layer url must be defined there or the directive fails.)



var CURRENT_VERSION = ".3";

//Change these to point to your own webserver directories
var serviceUrl = '//localhost:31772/services'; //location of cdms-services deployment (REST Services)
var serverUrl = '//localhost:31772/cdms-dev';       //location of cdms-dev files (Javascript+HTML application)
var security_token = "etaM2qefzYp_2YFz1HwWr9lqGdnaYSIcuy7KcEwV54cMZSI3K-Z_KXTkXNKgi_cm"; //   7/3/14.data.ctuir.org
//var security_token = "2NSvy0BMObG__a4gbRkBDUWarspCqssN9Zpn6sTTPEWTbIF0t-wOmSg4DjtSHYQn"; //   8/25/14.cdms.ctuir.org


var REPORTSERVER_URL = 'http://gis-sql/Reports/Pages/Folder.aspx?ItemPath=%2f'; //the Datastore "name" will be appended here, so make sure your report server folders are named the same as your datastore
var PROJECT_REPORT_URL = 'http://gis-sql/ReportServer/Pages/ReportViewer.aspx?%2fQuadReport_Prototype%2fQuadReport_Single&rs:Command=Render&Id='; //this is the report called from the "Quad REport" button on the project view page


//GIS defaults - change these to point to your own ArcGIS server
var GEOMETRY_SERVICE_URL = "//restdata.ctuir.org/arcgis/rest/services/Utilities/Geometry/GeometryServer";
var NAD83_SPATIAL_REFERENCE = 'PROJCS["NAD83(NSRS2007) / UTM zone 11N",GEOGCS["NAD83(NSRS2007)",DATUM["D_",SPHEROID["GRS_1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",-117],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["Meter",1]]';
var DEFAULT_LOCATION_PROJECTION_ZONE = {
                Projection: "NAD83",
                UTMZone: "11",
            };   //Used as default when creating a new location
var BING_KEY = "AuaAtT6zhx1rfuP1hR_e0zh5pxy6u7Echhe9KbwfCcQRG_Y_ewSg5OcFDm-DF-8w"; //CTUIR's bing key -- only licensed from our server, so get a public/free one and use it
//var DEFAULT_BASEMAP = "BingMapsRoad";


//constants -- you might need to change these to match index values in your own database
var PRIMARY_PROJECT_LOCATION_TYPEID = 3;
var LOCATION_TYPE_APPRAISAL = 8;
var SDE_FEATURECLASS_TAXLOTQUERY = 4;
var NUM_FLOAT_DIGITS = 3;
var FIELD_ROLE_HEADER = 1;
var FIELD_ROLE_DETAIL = 2;
var FIELD_ROLE_SUMMARY = 3;
var FIELD_ROLE_CALCULATED = 4;
var FIELD_ROLE_VIRTUAL = 5;
var METADATA_ENTITY_PROJECTTYPEID = 1;
var METADATA_ENTITY_HABITATTYPEID = 2;
var METADATA_ENTITY_DATASETTYPEID = 5;

var METADATA_PROPERTY_MAPIMAGE = 26;
var METADATA_PROPERTY_MAPIMAGE_HTML = 25;
var METADATA_PROPERTY_SUMMARYIMAGE = 11;
var METADATA_PROPERTY_SUMMARYIMAGE_HTML = 13;

var USER_PREFERENCE_LANDINGPAGE = "LandingPage"; //Name of UserPreference that contains a user's landing page (if specified)

var CDMS_DOCUMENTATION_URL = "http://intranet.ctuir.org/adminstration/oit/gis/wiki/Pages/Project%20Tracker%20Documentation.aspx";

var profile = null; 
var LOGIN_URL = serverUrl + '/DataTracker/login.html';
var WHOAMI_URL = serviceUrl + '/action/whoami';
var date_pattern = "/[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}/";

//login-controller
var successUrl = serverUrl + '/DataTracker/index.html';
var loginUrl = serverUrl + '/DataTracker/login.html'


//import-controller uses these constants
// note: we did have to hard-code these on the dataset-import.html page in ng-disabled attrbutes
var DO_NOT_MAP = 0;
var ACTIVITY_DATE = 1;
var INDEX_FIELD = 2;
var DEFAULT_IMPORT_QACOMMENT = "Initial Import";


//System Timezones
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

//Data Grade Methods -- shows up as a select list in accuracy check
var DataGradeMethods = [];
DataGradeMethods.push(""); // 0
DataGradeMethods.push("NIST check in BOTH warm and ice baths");
DataGradeMethods.push("NIST check in ice bath only");
DataGradeMethods.push("Manufacturer Calibration");
DataGradeMethods.push("No Accuracy Check Conducted");
DataGradeMethods.push("Unknown Accuracy Method");

//Appraisal Map config

var defaultLayer = "imageryLayer";

//used for dataset-activities (standard datasets)
var datasetActivitiesBasemapConfig = {
       // { library: "Esri", type: 'streets', title: 'ESRI Roads'},
        //{ library: "Esri", type: 'topo', title: 'Topographical'},
        //{ library: "Esri", type: 'hybrid', title: 'Hybrid' },
        roadsLayer: { library: "Bing", type: 'BingMapsRoad', Display: 'Roads' },
        imageryLayer: { library: "Bing", type: 'BingMapsAerial', Display: 'Aerial' },
        hybridLayer: { library: "Bing", type: 'BingMapsHybrid', Display: 'Hybrid' },
};


//This is the list of Basemaps that show up on the Appraisals custom dataset page
var parcelLayerConfig = 
      {
        taxParcelLayer: {
          Display: "Tax Parcel",
          QueryURL: "//restdata.ctuir.org/arcgis/rest/services/TaxParcelQueryCTUIR/MapServer/0?token=" + security_token,
          ServiceURL: "//restdata.ctuir.org/arcgis/rest/services/BasemapParcelViewerCTUIR/MapServer?token=" + security_token,
          OutFields: "PARCELID, Address",
          isAddressSearchService: true,
          //ParcelQuery: "PARCELID LIKE '%${0}%' ",
          ParcelQuery: "PARCELID LIKE '%${0}%' OR ALLOTMENT LIKE '%${0}%' OR ADDRESS LIKE '%${0}%'",
          LocateParcelQuery: "PARCELID = '${0}' OR ALLOTMENT = '${0}'",
          DisplayFields: ["PARCELID", "Address"],
          UseColor: true,
          objectIDField: "PARCELID",
          Color: "#FF6600",
          Alpha: 0.25,
        },
      imageryLayer: {
          Display: "Imagery",
          QueryURL: "//restdata.ctuir.org/arcgis/rest/services/TaxParcelQueryCTUIR/MapServer/0?token=" + security_token,
          ServiceURL: "//restdata.ctuir.org/arcgis/rest/services/DECD/BasemapDECD_Imagery/MapServer?token=" + security_token,
          OutFields: "PARCELID, Address",
          isAddressSearchService: true,
          //ParcelQuery: "PARCELID LIKE '%${0}%' ",
          ParcelQuery: "PARCELID LIKE '%${0}%' OR ALLOTMENT LIKE '%${0}%' OR ADDRESS LIKE '%${0}%'",
          LocateParcelQuery: "PARCELID = '${0}' OR ALLOTMENT = '${0}'",
          DisplayFields: ["PARCELID", "Address"],
          UseColor: true,
          objectIDField: "PARCELID",
          Color: "#FF6600",
          Alpha: 0.25,
        },

      platLayer: {
          Display: "Plat",
          QueryURL: "//restdata.ctuir.org/arcgis/rest/services/TaxParcelQueryCTUIR/MapServer/0?token=" + security_token,
          ServiceURL: "//restdata.ctuir.org/arcgis/rest/services/DECD/BasemapsDECD_Plat/MapServer?token=" + security_token,
          OutFields: "PARCELID, Address",
          isAddressSearchService: true,
          //ParcelQuery: "PARCELID LIKE '%${0}%' ",
          ParcelQuery: "PARCELID LIKE '%${0}%' OR ALLOTMENT LIKE '%${0}%' OR ADDRESS LIKE '%${0}%'",
          LocateParcelQuery: "PARCELID = '${0}' OR ALLOTMENT = '${0}'",
          DisplayFields: ["PARCELID", "Address"],
          UseColor: true,
          objectIDField: "PARCELID",
          Color: "#FF6600",
          Alpha: 0.25,
        },
      soilLayer: {
          Display: "Soil",
          QueryURL: "//restdata.ctuir.org/arcgis/rest/services/TaxParcelQueryCTUIR/MapServer/0?token=" + security_token,
          ServiceURL: "//restdata.ctuir.org/arcgis/rest/services/DECD/BasemapsDECD_Soils/MapServer?token=" + security_token,
          OutFields: "PARCELID, Address",
          isAddressSearchService: true,
          //ParcelQuery: "PARCELID LIKE '%${0}%' ",
          ParcelQuery: "PARCELID LIKE '%${0}%' OR ALLOTMENT LIKE '%${0}%' OR ADDRESS LIKE '%${0}%'",
          LocateParcelQuery: "PARCELID = '${0}' OR ALLOTMENT = '${0}'",
          DisplayFields: ["PARCELID", "Address"],
          UseColor: true,
          objectIDField: "PARCELID",
          Color: "#FF6600",
          Alpha: 0.25,
        },
      topoLayer: {
          Display: "Topography",
          QueryURL: "//restdata.ctuir.org/arcgis/rest/services/TaxParcelQueryCTUIR/MapServer/0?token=" + security_token,
          ServiceURL: "//restdata.ctuir.org/arcgis/rest/services/DECD/BasemapsDECD_Topo/MapServer?token=" + security_token,
          OutFields: "PARCELID, Address",
          isAddressSearchService: true,
          //ParcelQuery: "PARCELID LIKE '%${0}%' ",
          ParcelQuery: "PARCELID LIKE '%${0}%' OR ALLOTMENT LIKE '%${0}%' OR ADDRESS LIKE '%${0}%'",
          LocateParcelQuery: "PARCELID = '${0}' OR ALLOTMENT = '${0}'",
          DisplayFields: ["PARCELID", "Address"],
          UseColor: true,
          objectIDField: "PARCELID",
          Color: "#FF6600",
          Alpha: 0.25,
        },
      zoneLayer: {
          Display: "Zoning",
          QueryURL: "//restdata.ctuir.org/arcgis/rest/services/TaxParcelQueryCTUIR/MapServer/0?token=" + security_token,
          ServiceURL: "//restdata.ctuir.org/arcgis/rest/services/DECD/BasemapsDECD_Zoning/MapServer?token=" + security_token,
          OutFields: "PARCELID, Address",
          isAddressSearchService: true,
          //ParcelQuery: "PARCELID LIKE '%${0}%' ",
          ParcelQuery: "PARCELID LIKE '%${0}%' OR ALLOTMENT LIKE '%${0}%' OR ADDRESS LIKE '%${0}%'",
          LocateParcelQuery: "PARCELID = '${0}' OR ALLOTMENT = '${0}'",
          DisplayFields: ["PARCELID", "Address"],
          UseColor: true,
          objectIDField: "PARCELID",
          Color: "#FF6600",
          Alpha: 0.25,
        },

      };

//This is the list of services that show up in the layers selector for the custom Appraisals webapp.
var servicesLayerConfig = 
{
  streamBuffers: {
    Display: "Stream Buffers",
    ServiceURL: "//restdata.ctuir.org/arcgis/rest/services/StreamBuffers/MapServer?token=" + security_token,
  },
  utilityLines: {
    Display: "Utilities",
    ServiceURL: "//restdata.ctuir.org/arcgis/rest/services/UtilityLines/MapServer?token=" + security_token,
  },
  waterSewer: {
    Display: "Water / Sewer",
    ServiceURL: "//restdata.ctuir.org/arcgis/rest/services/WaterSewer/MapServer?token=" + security_token,
  },
  roads: {
    Display: "Roads",
    ServiceURL: "//restdata.ctuir.org/arcgis/rest/services/Roads/MapServer?token=" + security_token,
  },
  range: {
    Display: "Grazing Range",
    ServiceURL: "//restdata.ctuir.org/arcgis/rest/services/RangeUnits/MapServer?token=" + security_token,
  },
  forest: {
    Display: "Timber Stands",
    ServiceURL: "//restdata.ctuir.org/arcgis/rest/services/ForestStands/MapServer?token=" + security_token,
  },

};