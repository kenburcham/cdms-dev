//defines ctuir.ProjectMap
//Ken Burcham
// 7/3/2013

define(["dojo/_base/declare", 
        "dojo/_base/array",
        "esri/map",
        "esri/layers/FeatureLayer",
        "esri/dijit/Legend",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/symbols/SimpleLineSymbol",
        "dojo/on",
        "dojo/_base/Color"], 
function (declare, array, Map, FeatureLayer, Legend, SimpleMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol, on, Color) {


    //dojo.require("esri.dijit.editing.TemplatePicker-all");

    var map = null,
        locationLayers = [],
        layerConfig = null,
        //token = "N_VXY29IE_ITagCSuyR32-ZGB-LmyH4ahX4AL1elvGsOAlI0S6hcX026FoSbWXHPzxPMBe8RgH7o55joHj6unA..",
        token = "-9aUN96XPyALFuCmNmNHaCTnszs5G1t-IdvVWf6aF0xiGI2aRntS-yb6a2wmPDnZ", //data.ctuir.org -- works for both?
        //token = "KcBF5fByIPl1ZKFPwDeTUIoEWLoI7G_XPzBWaBtL-rRCNfSZWOP4eEV7cJi7Qwl_Q4o-iN7r9Ghqb3KQgQVF_Q..", //jsdemo
        //token = "HQfNB65MOSjhqWbiO4BGamfkyNpYQP-hrNTUSNDmvpdsaWoWm0kX6jyETkgKINXQ", //cdms
        server = "https://restdata.ctuir.org/arcgis/rest/services",
        isShowingAllFeatures = false;

    var drawToolbar;
    var selectedTemplate;
    var newGraphic; //there can be only one!

    var geometry_service = "https://restdata.ctuir.org/arcgis/rest/services/Utilities/Geometry/GeometryServer";

    function getObjectIdField(name, config) {
        var objidfield = 'OBJECTID';
        require(["dojo/_base/array"],
        function (array) {
            array.forEach(config, function (item) {
                if (item.name == name) {
                    if ('objidfield' in item)
                        objidfield = item.objidfield;
                }
            });
        });
        return objidfield;
    };

    //name = our layer name, layerquery  = {queryparm: true})
    function limitObjectIdsInLayer (name, layerquery) {

        layerquery['locationLayer'] = name; //add this into the query
        var layerobjects = projectStore.query(layerquery);

        //console.dir(layerobjects);

        var layer = locationLayers[name];
        var layerids = [];
        require(["dojo/_base/array"], function (array) {
            array.forEach(layerobjects, function (item) {
                //console.log(" Found an item in this layer: " + item.objectId);
                layerids.push(item.objectId);
            });
        });

        //link up our ids for the SQL "IN" clause:
        var idstring = idstring = "'" + layerids.join("','") + "'";

        //and here is the real magic!
        layer.clearSelection();
        map.infoWindow.hide();
        var definitionExpression = getObjectIdField(name, this.layerConfig) + " IN (" + idstring + ")";
        console.log(definitionExpression);
        layer.setDefinitionExpression(definitionExpression);
        layer.show();

    };

    //spin through all of our map layers and limit to these objects.
    function limitMapFeatures(layerquery) {

        for (var key in locationLayers) //you CANNOT foreach over js associative arrays!
        {
            limitObjectIdsInLayer(key, layerquery);
        }
    };

    return declare(null, {

        constructor: function (config, node) {
            layerConfig = config;

            esri.config.defaults.geometryService = new esri.tasks.GeometryService(geometry_service);

            map = new Map(node, {
                center: [-118.45, 45.56],
                basemap: "streets",
                zoom: 9,
                //extent: new esri.geometry.Extent(-119.93, 44.93, -117.48, 46.07),
                
            });

            on.once(map, "load", function () { createBasemapDropdown(basemapConfig); });


            var mapLayers = [];
            var layerLegend = [];

            console.log("Starting up Map");

            array.forEach(layerConfig, function (item) {

                console.log("Found configured mapLayer : " + item.Id);

                //determine unique field we'll use to identify the features on this layer
                var objidfield = getObjectIdField(item.Id, layerConfig);

                console.dir(objidfield);
                
                //and the url we'll use to get the layer
                var url = server + item.Service + "?token=" + token;

                //create feature layer object and add to map
                var layer = new FeatureLayer(
                    url,
                    {
                        id: item.Id,
                        mode: FeatureLayer.MODE_SNAPSHOT,
                        //mode: FeatureLayer.ON_DEMAND,
                        outFields: [objidfield],
                        title: item.Name,
                        //autoGeneralize: true, //TODO: might need more work here than this. :)
                        //maxAllowableOffset: map.Resolution * 2,

                    }
                );

                //add layer to our list so we can look up objects later
                locationLayers[item.Id] = layer;
                limitObjectIdsInLayer(item.Id, { favorite: true }); //"my projects"

                mapLayers.push(layer);
                layerLegend.push({ layer: layer, title: item.Name });

                //wire up our onclick for this layer
                on(layer, "click", function (evt) {
                    //require(["dojo/_base/event"], function(event){
                    eventMapFeatureSelected(item.Id + "_" + evt.graphic.attributes[objidfield], evt);

                    if (newGraphic) {
                        map.graphics.remove(newGraphic);
                    }
                    evt.stopPropagation();
                        //event.stop();
                    //}
                    
                });

            });

            console.log(" >> 3");

            //add the legend    TODO: would like to see this refactored out of here... events?  
            require(["dojo/domReady!"], function () {
                on(map, 'layers-add-result', function (results) {
                    console.dir(results.layers);
                    var layerInfo = array.map(results.layers, function (layer, index) {
                        return { layer: layer.layer, title: layer.layer.name };
                    });

                    console.log("and we are here with: " + layerInfo.length);

                    /* // turn off legend for now
                    if (layerInfo.length > 0) {
                        var legendDijit = new Legend({
                            map: map,
                            layerInfos: layerLegend
                        }, "legendDiv");
                        legendDijit.startup();
                        console.log("Started up legend dijit");
                    }
                    */

                    //initEditing(results);
                    setupHighlighting(results);
                });
                console.log(" >> 4");
            });

            map.addLayers(mapLayers);

        },

        getMap: function () {
            return map;
        },

        setBasemap: function (basemap) {
            map.setBasemap(basemap);
        },

        getLayers: function () {
            return locationLayers;
        },

        getLayer: function (id) {
            return locationLayers[id];
        },

        clearSelections: function() {
                for (var key in locationLayers) {
                    var layer = locationLayers[key];
                    layer.clearSelection();
                }
        },

        zoomToFeature: function (feature) {
            var extent = feature.geometry.getExtent();
            map.setExtent(extent);
            //console.dir(extent);
        },


        //shows all features in all layers by turning off the definition expression we use to limit by objectid
        showAllFeatures: function() {

            map.infoWindow.hide();

            for (var key in locationLayers) //you CANNOT foreach over js associative arrays!
            {
                var layer = locationLayers[key];

                layer.clearSelection();
                layer.setDefinitionExpression();
            }

            isShowingAllFeatures = true;

        },
      
        hideAllFeatures: function()
        {
            map.infoWindow.hide();

            for (var key in locationLayers) //you CANNOT foreach over js associative arrays!
            {
                var layer = locationLayers[key];
                layer.clearSelection(); //clear any selection
                layer.setDefinitionExpression(); //turn off any filtering
                layer.hide(); 
            }
        },

        showLayerFeatures: function(layer)
        {
            this.hideAllFeatures();
            console.log("show Layer Features: " + layer);
            var layer = locationLayers[layer];
            layer.show();
            map.setExtent(layer.fullExtent); //zoom to layer.
        },

        //spin through all of our map layers and limit to these objects.
        limitMapFeatures: function (layerquery) {
            console.dir(layerquery);
            for (var key in locationLayers) //you CANNOT foreach over js associative arrays!
            {
                console.log("layer -- " + key);
                limitObjectIdsInLayer(key, layerquery);
            }
        },

        showInfoWindow : function (projects, features, part_layer, part_objectid) {

            map.infoWindow.setTitle("");
            map.infoWindow.setContent(getProjectHtml(projects));

            var graphic = features[0];
            var mapPoint;

            if (graphic.geometry.type == "point")
                mapPoint = graphic.geometry;
            else
                mapPoint = graphic._extent.getCenter(); //TODO: hmm maybe there is a better way?

            map.infoWindow.show(mapPoint);
            map.centerAt(mapPoint);
        },

         getProjectsByLayer: function(part_layer, part_objectid) {

            var project = projectStore.query({ key: part_layer+"_"+part_objectid });

            if (project.total == 0) {
                console.log("oops -- no project exists for " + part_layer + " - " + part_objectid);
                return null;
            }

            return project;
         },

         addPointByLatLong: function(lat, long, layerId) {
        
             try{
                 projectMap.clearSelections();

                 if (newGraphic) {
                     //layer.applyEdits(null, null, [newGraphic]); //delete the previously created point
                     map.graphics.remove(newGraphic);
                 }

                 var layer = this.getLayer(layerId);
                 var point = new esri.geometry.Point();
                 point.setLatitude(lat);
                 point.setLongitude(long);
                 //log.debug(point);
             
                 var template = layer.templates[0];

                 var newAttributes = dojo.mixin({}, template.prototype.attributes);
                 newGraphic = new esri.Graphic(point, new esri.symbol.SimpleMarkerSymbol(), newAttributes);

                 map.graphics.add(newGraphic);
                 setNewProjectSelectionTextValue("New");
             } catch (e) {
                 log.debug(e);
             }
            
         },

         //call me when you are done editing and you want to keep the point you created.
         saveEditing: function (layerId) {
             if (newGraphic) {
                 var layer = this.getLayer(layerId);
                 layer.applyEdits([newGraphic], null, null).then(function (evt) {
                     log.debug(evt);
                     if (evt && evt[0].success) {
                         var layer = newGraphic.getLayer();
                         eventMapFeatureSelected(layer.id + "_" + newGraphic.attributes["OBJECTID"]);  //select the newly created point.

                         //clean up
                         //newGraphic = null;
                         drawToolbar.deactivate();
                         drawToolbar = null;

                     } else if (evt && evt[0].success == false) {
                         alert("There was a problem saving the location.  Please try again or contact support.");
                         log.error("Error saving new location to map.");
                     }
                 });
                 
             }
             
         },
         hasNewGraphic: function () {
             return !(is_empty(newGraphic));
         },

         deleteNewGraphic: function (layerId) {
             log.debug("Deleting New Graphic");
             if (newGraphic) {
                 var layer = this.getLayer(layerId);
                 layer.applyEdits(null, null, [newGraphic]).then(function (evt) {
                     log.debug(evt);
                     if (evt && evt[0].success) {
                         //anything to do?
                     } else if (evt && evt[0].success == false) {
                         alert("There was a problem canceling that location.  Please try again or contact support.");
                         log.error("Error deleting location from map.");
                     }
                 });

             }
             else
                 log.debug("No graphic was selected to delete.");
         },

         //call me when you DO NOT want to keep the point and are done editing.
         abortEditing: function (layerId) {

             if (newGraphic) {
                 map.graphics.remove(newGraphic);
                 newGraphic = null;
             }

             drawToolbar.deactivate();
             drawToolbar = null;

         },

         //call me to enable eding on this layer.
         enableEditing: function (layerId) {
             log.debug("Starting up editor...");

             esri.config.defaults.io.proxyUrl = "/gisproxy/proxy.ashx";
             esri.config.defaults.io.alwaysUseProxy = false;

             var layer = this.getLayer(layerId);

             drawToolbar = new esri.toolbars.Draw(map);
             drawToolbar.activate(esri.toolbars.Draw.POINT);

             //new point created
             dojo.connect(drawToolbar, "onDrawEnd", function (geometry) {
                 try {

                     projectMap.clearSelections();

                     log.debug("adding a point!", geometry);

                     //if there is already a newGraphic set
                     if (newGraphic) {
                         //layer.applyEdits(null, null, [newGraphic]); //delete the previously created point
                         map.graphics.remove(newGraphic);
                     }

                     var template = layer.templates[0];
                     var newAttributes = dojo.mixin({}, template.prototype.attributes);
                     newGraphic = new esri.Graphic(geometry, new esri.symbol.SimpleMarkerSymbol(), newAttributes);
                     //debugobject = newGraphic;
                     //log.debug(newGraphic);

                     map.graphics.add(newGraphic);
                     setNewProjectSelectionTextValue("New");

                     
                 } catch (e) {
                     log.debug(e);
                 }

             });

         },
   
    });



    function setupHighlighting(results) {
        var layers = dojo.map(results.layers, function (result) {
            return result.layer;
        });

        dojo.forEach(layers, function (layer) {
            //if (item.type == 'point') {
            if (layer.geometryType == 'esriGeometryPoint') {
                var selectionSymbol = new SimpleMarkerSymbol(
                    SimpleMarkerSymbol.STYLE_CIRCLE,
                    10,
                    new SimpleLineSymbol(
                        SimpleLineSymbol.STYLE_SOLID,
                        new Color([55, 55, 0]),
                        1),
                    new Color([255, 255, 0, 0.25]));
                layer.setSelectionSymbol(selectionSymbol);
            }
                //else if (item.type == 'polygon') {
            else if (layer.geometryType == 'esriGeometryPolygon') {
                var selectionSymbol = new SimpleFillSymbol(
                    SimpleFillSymbol.STYLE_SOLID,
                    new SimpleLineSymbol(
                        SimpleLineSymbol.STYLE_SOLID,
                        new Color([55, 55, 0]), 2),
                    new Color([255, 255, 0, 0.25]))

                layer.setSelectionSymbol(selectionSymbol);
                layer.setOpacity(.5);
            }
                //else if (item.type == 'line') {
            else if (layer.geometryType == 'esriGeometryPolyline') {
                var selectionSymbol = new SimpleLineSymbol().setColor(new dojo.Color([255, 255, 0, 0.5])).setWidth(4);

                layer.setSelectionSymbol(selectionSymbol);
            }
        });
    }



});