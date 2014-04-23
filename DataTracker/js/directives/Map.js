define([
  'app',
  'esri/map',
  'esri/geometry/Point'
], function (app, Map, Point) {

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
        // setup our map options based on the attributes and scope
        var mapOptions = {
          center: ($attrs.center) ? $attrs.center.split(",") : $scope.center,
          zoom: ($attrs.zoom) ? $attrs.zoom : $scope.zoom,
          basemap: ($attrs.basemap) ? $attrs.basemap : $scope.basemap
        };

        // declare our map
        var map = new Map($attrs.id, mapOptions);

        // start exposing an API by setting properties on "this" which is our controller
        // lets expose the "addLayer" method so child directives can add themselves to the map
        this.addLayer = function(layer, filter){
          map.locationLayer = map.addLayer(layer);
          console.log("Added layer to map");
          console.dir(map.locationLayer);

          if(filter)
          {
            if(filter == "location")
            {

              if(typeof $scope.locationObjectIds == "undefined")
              {
                $scope.$watch('locationObjectIds', function(){

                  if($scope.locationObjectIds == "")
                    return;

                  layer.clearSelection();
                  var definitionExpression = "OBJECTID IN (" + $scope.locationObjectIds + ")";
                  console.log(" from watched: " + definitionExpression);
                  layer.setDefinitionExpression(definitionExpression);
                  layer.show();                  

                });
              }
              else
              {
                if($scope.locationObjectIds == "")
                    return;

                  layer.clearSelection();
                  var definitionExpression = "OBJECTID IN (" + $scope.locationObjectIds + ")";
                  console.log(" from direct: " + definitionExpression);
                  layer.setDefinitionExpression(definitionExpression);
                  layer.show();                  
              }
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
              wkid:102100
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

        $scope.map = map;
        console.log("Map is complete and in scope.");

      }
    };
  });
});