
//data view controllers 

'use strict';
var mod_dv = angular.module('DataViewControllers', ['ui.bootstrap']);

mod_dv.controller('ModalQaUpdateCtrl', ['$scope','DataService', '$modalInstance',
	function($scope, DataService, $modalInstance){
		$scope.save = function(){
			
			DataService.updateQaStatus(
				$scope.grid.Header.ActivityId,
				$scope.row.ActivityQAStatus.QAStatusId, 
				$scope.row.ActivityQAStatus.Comments, 
				$scope.QaSaveResults);
		
			$modalInstance.dismiss();

		};

		$scope.cancel = function(){
			$modalInstance.dismiss();
		};

	}
]);




mod_dv.controller('DatasetViewCtrl', ['$scope','$routeParams','DataService','$modal','$location','DataSheet','$route','$rootScope',
    	function($scope, $routeParams, DataService, $modal, $location, DataSheet, $route, $rootScope) {
    		$scope.grid = DataService.getActivityData($routeParams.Id); //activity data for a particular activityId
    		
    		$scope.headerFields = [];
    		$scope.detailFields = [];
    		$scope.datasheetColDefs = [];
    		$scope.dataSheetDataset = [];

    		$scope.fieldsloaded = false;

			$scope.$watch('QaSaveResults', function(){
				if($scope.QaSaveResults && $scope.QaSaveResults.success)
				{
					$scope.grid = DataService.getActivityData($routeParams.Id); //activity data for a particular activityId
				}				
			},true);

    		$scope.query = { loading: true };
    		$scope.activities = $rootScope.GridActivities; //pull this in from the previous page, if they were set.  Used for navigating between activities.

			$scope.gridDatasheetOptions = { 
    			data: 'dataSheetDataset', 
		        columnDefs: 'datasheetColDefs',
    			enableColumnResize: true, 
    			enableSorting: true, 
    			enableCellSelection: true,
    			showFilter: true,
    			showColumnMenu: true,
    			enableRowSelection: true,
    			multiSelect: false,
	   			//showFooter: true,
    			//footerTemplate: '<div class="grid-footer-totals"><div class="colt0 sumField"></div><div class="colt1 sumField"></div><div class="colt2 sumField"></div><div class="colt3 sumField"></div><div class="colt4 sumField"></div><div class="colt5 sumField">s: 1433<br/>a: 477.67</div><div class="colt6 sumField"></div></div>',

    		};

    		$scope.chartConfig = {
    			  title : 'Fish by Species',
				  tooltips: true,
				  labels : false,
				  
				  legend: {
				    display: true,
				    position: 'right'
				  }
    		};

    		$scope.chartData = {"series": [], "data":[{ "x": "Loading...", "y": [0],"tooltip": ""}]}; //default

    		DataSheet.initScope($scope);

    		$scope.$watch('dataset.ProjectId', function()
    		{
    			if($scope.dataset && $scope.dataset.ProjectId)
    			{
    				$scope.project = DataService.getProject($scope.dataset.ProjectId);
	    			$scope.QAStatusOptions = $rootScope.QAStatusOptions = makeObjects($scope.dataset.QAStatuses, 'Id','Name');

	    			$scope.buildChart();

	    			//if we have more than 1 row qa status then show them.
		    		if($scope.dataset.RowQAStatuses.length > 1)
		    		{
		    			$scope.datasheetColDefs.unshift(
				    	{
		    				field: "QAStatusId", //QARowStatus
		    				displayName: "QA",
		 					cellFilter: 'RowQAStatusFilter'
		    			});
		    		}

	    		}

    		});

    		//setup a listener to populate column headers on the grid
			$scope.$watch('grid.Dataset', function() { 
				if(!$scope.grid.Dataset) return; //not done cooking yet.
				$scope.dataset = $scope.grid.Dataset;//DataService.getDataset($scope.grid.Dataset.Id);

				if(!$scope.fieldsloaded)
				{
					angular.forEach($scope.grid.Dataset.Fields.sort(orderByIndex), function(field){

						parseField(field, $scope);

						if(field.FieldRoleId == FIELD_ROLE_HEADER)
						{
							$scope.headerFields.push(field);
						}
						else if (field.FieldRoleId == FIELD_ROLE_DETAIL)
						{
							$scope.detailFields.push(field);
							$scope.datasheetColDefs.push(makeFieldColDef(field, $scope));
						}
		    		});

		    		$scope.fieldsloaded = true;

		    		$scope.dataSheetDataset = $scope.grid.Details;
		    		$scope.recalculateGridWidth($scope.datasheetColDefs.length);
				}
				$scope.query.loading = false;

				$scope.RowQAStatuses =  $rootScope.RowQAStatuses = makeObjects($scope.dataset.RowQAStatuses, 'Id', 'Name');  //Row qa status ids

   				$scope.grid.Header.Activity.Timezone = angular.fromJson($scope.grid.Header.Activity.Timezone);


	    	});

			$scope.buildChart = function(){
					if($scope.dataset.Datastore.TablePrefix == "AdultWeir") /// TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		    			$scope.chartData = getAdultWeirChartData($scope.grid.Details);
		    		else if($scope.dataset.Datastore.TablePrefix == "WaterTemp")
		    			$scope.buildWaterTempChart();
		    		else
		    			delete $scope.chartData; 

			};

			$scope.buildWaterTempChart = function(){
				
				buildWaterTempChart($scope);
				console.log("done watertemp chart");

			};

			$scope.getDataGrade = function(check){ return getDataGrade(check)}; //alias from service

	        $scope.changeQa = function(){
	        	$scope.QaSaveResults = {};
				$scope.row = {ActivityQAStatus: {}}; //modal selections

	        	var modalInstance = $modal.open({
						templateUrl: 'partials/changeqa-modal.html',
						controller: 'ModalQaUpdateCtrl',
						scope: $scope, //very important to pass the scope along... -- TODO: but we don't want to pass in the whole $scope...
						//resolve: { files: function() { return $scope.files; } }
					});
	        };

	    	$scope.openEdit = function()
	    	{
	    		$location.path("/edit/"+$scope.grid.Header.ActivityId);
	    	}

			$scope.openExportView = function() {
				var modalInstance = $modal.open({
					templateUrl: 'partials/exportfile-modal.html',
					controller: 'ModalDataEntryCtrl',
					scope: $scope, //very important to pass the scope along... -- TODO: but we don't want to pass in the whole $scope...
					//resolve: { files: function() { return $scope.files; } }
				});
			}

    		
    		//copy and paste alert -- this should be in a common thing!
    		$scope.openDataEntryModal = function() {
				var modalInstance = $modal.open({
					templateUrl: 'partials/dataentry-modal.html',
					controller: 'ModalDataEntryCtrl',
					scope: $scope, //very important to pass the scope along... -- TODO: but we don't want to pass in the whole $scope...
					//resolve: { files: function() { return $scope.files; } }
				});
			};


			//defined in services
			$scope.previousActivity = function(){
				previousActivity($scope.activities, $routeParams.Id, $location);
			}

			$scope.nextActivity = function(){
				nextActivity($scope.activities, $routeParams.Id, $location);
			}


    }]);

		function buildWaterTempChart(scope)
				{
					var margin = {top: 10, right: 10, bottom: 20, left: 30},
					    width = 400 - margin.left - margin.right,
					    height = 200 - margin.top - margin.bottom;

					var x = d3.time.scale()
					    .range([0, width]);

					var y = d3.scale.linear()
					    .range([height, 0]);

					var color = d3.scale.ordinal()
					  		.domain([1,12,13,14,15,16])
					  		.range(["FF0000","#009933" , "#0000FF","#0FF933" , "#00FFFF","#00FFAAFB"]);

					var xAxis = d3.svg.axis()
					    .scale(x)
					    .orient("bottom");

					var yAxis = d3.svg.axis()
					    .scale(y)
					    .orient("left");

					var line = d3.svg.line()
						//.interpolate("basis")
					    .x(function(d) { return x(d.chart_date); })
					    .y(function(d) { return y(d.chart_temp); });

					var svg = d3.select("#chart-div").append("svg")
					    .attr("width", width + margin.left + margin.right)
					    .attr("height", height + margin.top + margin.bottom)
					  .append("g")
					    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	
					
					var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;

					//color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

					var data = scope.dataSheetDataset;
					  data.forEach(function(d) {
					  	//only show rows with default QA status (OK)
					  	//if(d.QAStatusId == scope.dataset.DefaultRowQAStatusId)
					  	//{
					  		d.chart_date = parseDate(d.ReadingDateTime);
					    	d.chart_temp = +d.WaterTemperature;
					    	d.chart_QAStatusId = d.QAStatusId;
					    //}

					    //console.dir(d);
					  });

					  //x.domain(d3.extent(data, function(d) { return d.date; }));
					  //y.domain(d3.extent(data, function(d) { return d.close; }));


					  x.domain(d3.extent(data, function(d) { return d.chart_date; }));
					  y.domain(d3.extent(data, function(d) { return d.chart_temp; }));

					  svg.append("g")
					      .attr("class", "x axis")
					      .attr("transform", "translate(0," + height + ")")
					      .call(xAxis);

					  svg.append("g")
					      .attr("class", "y axis")
					      .call(yAxis)
					    .append("text")
					      .attr("transform", "rotate(-90)")
					      .attr("y", 6)
					      .attr("dy", ".71em")
					      .style("text-anchor", "end")
					      .text("H2O Temp (C)");

					  svg.append("path")
					      .datum(data)
					      .attr("class", "line")
					      .attr("d", line);
					      /*
					      .style("stroke", function(d,i) { 
					      	console.dir(d);
					      	console.dir(i);
					      	console.dir(color(d.chart_QAStatusId));
					      	return color(d.chart_QAStatusId); 
					      });*/
					};