
var security_token = "etaM2qefzYp_2YFz1HwWr9lqGdnaYSIcuy7KcEwV54cMZSI3K-Z_KXTkXNKgi_cm"; //   7/3/14.data.ctuir.org
var BaseMapLayers=
               [
                   {
                       Key: "taxMap",
                       ThumbnailSource: "images/Tax map.png",
                       Name: "Tax Map",
                       MapURL: "//restdata.umatilla.nsn.us/arcgis/rest/services/BasemapParcelViewerCTUIR/MapServer?token=" + security_token
                   },
                   {
                       Key: "imageryMap",
                       ThumbnailSource: "images/imagery.png",
                       Name: "Imagery",
                       //MapURL: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
                       MapURL: "//restdata.umatilla.nsn.us/arcgis/rest/services/BasemapImageryParcels/MapServer?token=" + security_token
                   },
                   {
                       Key: "parcelMap",
                       ThumbnailSource: "images/zoning.png",
                       Name: "Zoning",
                       //MapURL: "http://restdata.umatilla.nsn.us/arcgis/rest/services/BasemapZoning/MapServer"
                       MapURL: "//restdata.umatilla.nsn.us/arcgis/rest/services/BasemapZoningParcels/MapServer?token=" + security_token
                   }


               ];

var parcelLayerConfig = 
      {
        Key: "taxParcelLayer",
        ServiceURL: "http://restdata.umatilla.nsn.us/arcgis/rest/services/TaxParcelQueryCTUIR/MapServer/0?token=" + security_token,
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
      };



define([
  'app',
  'esri/map',
  'esri/geometry/Point',
  'esri/dijit/InfoWindow',
  'esri/InfoTemplate',
  'esri/dijit/BasemapLayer',
  'esri/dijit/BasemapGallery',
  'esri/dijit/Basemap'
], function (app, Map, Point, InfoWindow, InfoTemplate) {

  // register a new directive called esriMap with our app
  app.directive('appraisalMap', function($rootScope){
    // this object will tell angular how our directive behaves
    return {
      // only allow esriMap to be used as an element (<esri-map>)
      restrict: 'E',

      scope: false,

      // define how our template is compiled this gets the $element our directive is on as well as its attributes ($attrs)
      compile: function($element, $attrs){
        // remove the id attribute from the main element
        $element.removeAttr("id");

        // append a new div inside this element, this is where we will create our map
        $element.append("<div id=" + $attrs.id + "></div>");

        // since we are using compile we need to return our linker function
        // the 'link' function handles how our directive responds to changes in $scope
        return function (scope, element, attrs, controller){
          scope.$watch("center", function (newCenter, oldCenter) {
            if(newCenter !== oldCenter){
              controller.centerAt(newCenter);
            }
          });
        };
      },

      // even though $scope is shared we can declare a controller for manipulating this directive
      // this is great for when you need to expose an API for manipulaiting your directive
      // this is also the best place to setup our map
      controller: function($scope, $element, $attrs){

        //console.dir($attrs);

        // setup our map options based on the attributes and scope
        var mapOptions = {
          center: ($attrs.center) ? $attrs.center.split(",") : $scope.center,
          zoom: ($attrs.zoom) ? $attrs.zoom : $scope.zoom,
          spatialReference: {
              wkid:102100 //mercator
              //wkid:26911 //nad_1983
              //"wkt":'PROJCS["NAD83(NSRS2007) / UTM zone 11N",GEOGCS["NAD83(NSRS2007)",DATUM["D_",SPHEROID["GRS_1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",-117],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["Meter",1]]'

            }
        };

        // declare our map
        console.log("trying to make the map");

        var map = new Map($attrs.id, mapOptions);
        //our first layer from up above...
        //console.log("//restdata.umatilla.nsn.us/arcgis/rest/services/BasemapParcelViewerCTUIR/MapServer?token=" + security_token);
        var layer = new esri.layers.ArcGISTiledMapServiceLayer("//restdata.umatilla.nsn.us/arcgis/rest/services/BasemapParcelViewerCTUIR/MapServer?token=" + security_token);
        //console.dir(layer);
        map.addLayer(layer);

        map.parcelLayer = new esri.layers.GraphicsLayer();
        map.addLayer(map.parcelLayer);


        // start exposing an API by setting properties on "this" which is our controller
        // lets expose the "addLayer" method so child directives can add themselves to the map
        this.addLayer = function(layer, filter){
          map.locationLayer = map.addLayer(layer);

//          console.log("Added layer to map");
//          console.log("layer_"+layer.id);

            //setup our layer locationid function so we can all it again sometime
            layer.showLocationsById = function(locationObjectIds){
              try{
                this.clearSelection();
                var definitionExpression = "OBJECTID IN (" + locationObjectIds + ")";
                console.log("Definition expression: " + definitionExpression);
                this.setDefinitionExpression(definitionExpression);
                this.refresh();
              }catch(e)

              {
                console.dir(e);
              }                  
            };

          if(filter && filter == "location")
          {
              if(typeof $scope.locationObjectIds == "undefined")
              {
                $scope.$watch('locationObjectIds', function(){

                  //skip the first run
                  if(typeof $scope.locationObjectIds == "undefined")
                    return;
                  
                  layer.showLocationsById($scope.locationObjectIds); // now call it

                  layer.show();                  

                });
              }
          }
          
          return map.locationLayer;
        };

        //use this for doing a search by parcelid or address
        map.querySearchParcel = function(searchParam, callback)
        {
          var queryTask = new esri.tasks.QueryTask(parcelLayerConfig.ServiceURL);
          var query = new esri.tasks.Query();
          query.where = dojo.string.substitute(parcelLayerConfig.ParcelQuery, [searchParam]);
          query.returnGeometry = false;
          query.outSpatialReference = this.spatialReference;
          query.outFields = ["*"];
        
          queryTask.execute(query, function (result) {
              callback(result.features); //give back the parcel features we found...
          }, function(err){
              console.log("Failure executing query!");
              console.dir(err);
              console.dir(query);
          });            
        };

        //use this for selecting a specific parcel/allotment by id (no geometry)
        map.queryMatchParcel = function(searchParam, callback)
        {
          var queryTask = new esri.tasks.QueryTask(parcelLayerConfig.ServiceURL);
          var query = new esri.tasks.Query();
          query.where = dojo.string.substitute(parcelLayerConfig.LocateParcelQuery, [searchParam]);
          query.returnGeometry = false;
          query.outSpatialReference = this.spatialReference;
          query.outFields = ["*"];
        
          queryTask.execute(query, function (result) {
              callback(result.features); //give back the parcel features we found...
          }, function(err){
              console.log("Failure executing query!");
              console.dir(err);
              console.dir(query);
          });            
        };


        //use this to select a particular parcel either by objectid (like after a search) or x,y mapPoint
        map.querySelectParcel = function(mapPoint, objectId, callback){

          var queryTask = new esri.tasks.QueryTask(parcelLayerConfig.ServiceURL);
          var query = new esri.tasks.Query();

          query.outSpatialReference = this.spatialReference;
          query.returnGeometry = true;
          query.outFields = ["*"];
          if (mapPoint) {
              query.geometry = mapPoint;
          }
          else {
              query.objectIds = [objectId];
          }
          
          query.spatialRelationship = esri.tasks.Query.SPATIAL_REL_INTERSECTS;
          queryTask.execute(query, function (result) {
              callback(result.features); //give back the parcel features we found...
          }, function(err){
              console.log("Failure executing query!");
              console.dir(err);
              console.dir(query);
          });            

                  
        };

        map.clearGraphics = function(){
          this.parcelLayer.clear();
        }

        map.addParcelToMap = function(feature, color, alpha)
        {
            
                var graphic;
                if(!color)
                  color = "#FF6600";
                
                if(!alpha)
                  alpha = .25;


                var lineColor = new dojo.Color();
                lineColor.setColor(color);

                var fillColor = new dojo.Color();
                fillColor.setColor(color);
                fillColor.a = alpha;

                var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                    new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, lineColor, 3), fillColor);

                graphic = new esri.Graphic(feature.geometry, symbol, feature.attributes);

                this.parcelLayer.clear();
                this.parcelLayer.add(graphic);
                this.selectedFeature = feature;
                this.selectedGraphic = graphic;

                $scope.$emit("map.selectedFeature",feature); //notify
        }

        map.centerAndZoomToGraphic = function(graphic)
        {
            var centerPoint = graphic.geometry.getExtent().getCenter();
            return map.centerAndZoom(centerPoint, 15);
        };

        // lets expose a version of centerAt that takes an array of [lng,lat]
        this.centerAt = function(center){
          var point = new Point({
            x: center[0],
            y: center[1],
            spatialReference: {
              wkid:102100 //mercator
              //wkid:26911 //nad_1983
              //"wkt":'PROJCS["NAD83(NSRS2007) / UTM zone 11N",GEOGCS["NAD83(NSRS2007)",DATUM["D_",SPHEROID["GRS_1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",-117],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["Meter",1]]'

            }
          });

          map.centerAt(point);
        };

        // listen for click events and expost them as broadcasts on the scope and suing the scopes click handler
        map.on("click", function(e){
          // emit a message that bubbles up scopes, listen for it on your scope
          $scope.$emit("map.click", e);

          // use the scopes click fuction to handle the event
          $scope.$apply(function($scope) {
            $scope.click.call($scope, e);
          });
        });

        map.on("load", function(e){
          //createBasemapDropdown(map);
        });

        $scope.map = map;
        //map.resize();
        
        //console.log("Map is complete and in scope.");

      }
    };
  });
});


//In order to use bing maps, we have to use a basemapGallery.
//  A dojo menu div named "basemapMenu" is required to exist
//  and we fill it up with the configured map options.
function createBasemapDropdown(map) {
        console.dir(map);
      var basemapGallery

      //create an array of Basemap objects corresponding to the above list
      var basemaps = dojo.map(basemapConfig, function (item) {
          return new esri.dijit.Basemap({
              layers: [new esri.dijit.BasemapLayer({
                  type: item.type
              })], id: item.type, title: item.title
          });
      });

      console.dir(basemaps);

      try{

          basemapGallery = new esri.dijit.BasemapGallery({
              basemaps: basemaps,
              //showArcGISBasemaps: true,
              bingMapsKey: BING_KEY,
              map: map,
          });



          //add each one to the existing "basemapMenu" dropdown and wire up an onclick to set the basemap.
          dojo.forEach(basemaps, function (basemap) {

            var menu = dijit.byId("basemapMenu");

              //clear out any that exist.
              if(menu.hasChildren())
              angular.forEach(menu.getChildren, function(child){
                console.log("removing a child...");
                  menu.removeChild(child);
              });

              menu.addChild(new dijit.MenuItem({
                  label: basemap.title,
                  onClick: dojo.hitch(this, function () {
                      if (basemap.id == "streets")
                          projectMap.setBasemap(basemap.id);
                      else {
                          basemapGallery.select(basemap.id);
                          //projectMap.setBasemap(basemap.id);
                      }
                      
                  })
              }));
          });

          basemapGallery.select("BingMapsRoad");

      } catch (e) {
        console.log("----------------------------------------------------");

          console.dir(e);
      }

      return basemapGallery;
}
