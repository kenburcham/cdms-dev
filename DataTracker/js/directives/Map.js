


define([
  'app',
  'esri/map',
  'esri/geometry/Point',
  'esri/dijit/InfoWindow',
  'esri/InfoTemplate',
  'esri/dijit/BasemapLayer',
  'esri/dijit/BasemapGallery',
  'esri/dijit/Basemap',
  'esri/virtualearth/VETiledLayer'
], function (app, Map, Point, InfoWindow, InfoTemplate, VETiledLayer) {


  
  // register a new directive called esriMap with our app
  app.directive('esriMap', function(){
    // this object will tell angular how our directive behaves
    return {
      // only allow esriMap to be used as an element (<esri-map>)
      restrict: 'E',

      // this directive shares $scope with its parent (this is the default)
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

        //possible bing maps
        var bing_layers_map = {
          BingMapsRoad: esri.virtualearth.VETiledLayer.MAP_STYLE_ROAD,
          BingMapsAerial: esri.virtualearth.VETiledLayer.MAP_STYLE_AERIAL ,
          BingMapsHybrid: esri.virtualearth.VETiledLayer.MAP_STYLE_AERIAL_WITH_LABELS
        };

console.dir(bing_layers_map);
        // setup our map options based on the attributes and scope
        var mapOptions = {
          center: ($attrs.center) ? $attrs.center.split(",") : $scope.center,
          zoom: ($attrs.zoom) ? $attrs.zoom : $scope.zoom,
          //basemap: 'streets', //($attrs.basemap) ? $attrs.basemap : $scope.basemap,
          spatialReference: {
              wkid:102100 //mercator
              //wkid:26911 //nad_1983
              //"wkt":'PROJCS["NAD83(NSRS2007) / UTM zone 11N",GEOGCS["NAD83(NSRS2007)",DATUM["D_",SPHEROID["GRS_1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",-117],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["Meter",1]]'

            }
        };

        // declare our map
        var map = new Map($attrs.id, mapOptions);

        map.selectedBasemap = defaultLayer;
        
        map.basemaps = [];
        for (var property in datasetActivitiesBasemapConfig) {
          if(datasetActivitiesBasemapConfig.hasOwnProperty(property))
          {
              map.basemaps.push({label: datasetActivitiesBasemapConfig[property].Display, name: property});
          }
        };

        map.updateLayers = function(){

            console.log("Changing Layer: "+map.selectedBasemap);

            try{
              //console.log("Loading layer: " + datasetActivitiesBasemapConfig[map.selectedBasemap].ServiceURL);      

              map.removeAllLayers();

              var new_layer = undefined;

              //add the selected basemap
              if(datasetActivitiesBasemapConfig[map.selectedBasemap].library == 'CTUIR')
                new_layer = new esri.layers.ArcGISTiledMapServiceLayer(datasetActivitiesBasemapConfig[map.selectedBasemap].ServiceURL);
              else if(datasetActivitiesBasemapConfig[map.selectedBasemap].library == 'Bing')
              {
                new_layer = new esri.virtualearth.VETiledLayer({
                  bingMapsKey: BING_KEY,
                  mapStyle: bing_layers_map[datasetActivitiesBasemapConfig[map.selectedBasemap].type]
                });
              }



              map.addLayer(new_layer);
              map.currentBasemapLayer = new_layer;

              if(map.locationLayer)
                map.addLayer(map.locationLayer);

              map.parcelLayer = new esri.layers.GraphicsLayer();
              map.addLayer(map.parcelLayer);

              console.log("done!");
              map.reposition();
            }
            catch(e)
            {
              console.dir(e);
            }
        };

        map.updateLayers();





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
