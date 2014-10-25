(function () {
  'use strict';


  function ChartDirective() {

  }


  angular.module('app.chart', [
    'shared.d3',
    'shared.underscore'
  ])

    .controller('Chart', ['$scope', '_', function ($scope, _) {

    }])

    .directive('chart', ['d3', '_', function (d3, _) {


      function rescale($scope, dimensions) {
//        console.log("dimensions", dimensions);
        var chart = $scope.chart,
          xScale = $scope.xScale,
          yScale = $scope.yScale;

        if (!chart) {
          return;
        }

        chart.transition()
          .attr('width', dimensions.width)
          .attr('height', dimensions.height);

        xScale.range([0, dimensions.width]);
        yScale.range([0, dimensions.height]);

        chart.selectAll('circle')
          .transition()
          .attr('cx', function (d) {
//            console.log("xScale(d['info_Date'])", xScale(d['info_Date']));
            return xScale(d['info_Date']);
          })
          .attr('cy', function (d) {
            return yScale(d['bcl2fastq_PCT_>=_Q30_bases']);
          });
      }


      function dataReady(data) {

//        var data2 = d3.map(data);
//        console.log("data2", data2);
//
//        return;

//        console.log("_.pluck(data, '')", _.unique(_.pluck(data, 'info_Sample_Id')));


        var data1 = d3.nest()
          .sortValues(function (a, b) {
            return d3.ascending(a['info_Date'], b['info_Date']);
          })
          .key(function (d) {
            return d['info_Flowcell'];
          })
          .rollup(function (d) {
            var e = {};
            d.forEach(function (x) {
              var key = [x['info_lane'], x['info_Sample_Id']].join('__');
              e[key] = x['bcl2fastq_PCT_>=_Q30_bases'];
            });
            return e;
          })
          .map(data, d3.map);
//
        console.log("data1", data1);
//return;
        window._data = data1;

//        console.log("data1.values", data1.values);
//        console.log(d3.keys(data1.values()[0]).map(function (key) {
//          console.log("key", key.split('__').shift());
//
//
//          return key;
////        }));


        this.color.domain(d3.range(1, 9));

        data1.forEach(function (flowcellKey, d) {
          var y0 = 0;
          d['bcl2fastq_PCT_>=_Q30_bases'] = _.map(d, function (value, laneKey) {
            var e = {
              flowcell: flowcellKey,
              name: laneKey.split('__').shift(),
              y0: y0,
              y1: y0 + parseFloat(value)
            };

            y0 = e.y1;

            return e;
          });
          d.total = _.last(d['bcl2fastq_PCT_>=_Q30_bases']).y1;
          d.flowcell = flowcellKey;
        }.bind(this));

        data.sort(function (a, b) {
          return b.total - a.total;
        });

        this.xScale.domain(data1.keys());
        this.yScale.domain([0, d3.max(data1.values(), function (d) {
          return d.total;
        })]);

        this.svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + this.height() + ")")
          .call(this.xAxis)

          .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-0.8em")
          .attr("dy", "0.15em")
          .attr("transform", 'rotate(-65)');

        this.svg.append("g")
          .attr("class", "y axis")
          .call(this.yAxis)
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("bcl2fastq_PCT_>=_Q30_bases");

        var flowcell = this.svg.selectAll(".flowcell")
          .data(data1.values())
          .enter().append("g")
          .attr("class", "flowcell")
          .attr("transform", function (d) {
            return "translate(" + this.xScale(d.flowcell) + ",0)";
          }.bind(this));

        flowcell.selectAll("rect")
          .data(function (d) {
            return d['bcl2fastq_PCT_>=_Q30_bases'];
          })
          .enter().append("rect")
          .attr("width", this.xScale.rangeBand())
          .attr("y", function (d) {
            return this.yScale(d.y1);
          }.bind(this))
          .attr("height", function (d) {
            return this.yScale(d.y0) - this.yScale(d.y1);
          }.bind(this))
          .style("fill", function (d) {
            return this.color(d.name);
          }.bind(this));

        var legend = this.svg.selectAll(".legend")
          .data(this.color.domain().slice())
          .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function (d, i) {
            return "translate(0, " + i * 20 + ")";
          });

        legend.append("rect")
          .attr("x", this.width() - 18)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", this.color);

        legend.append("text")
          .attr("x", this.width() - 24)
          .attr("y", 9)
          .attr("dy", "0.35em")
          .style("text-anchor", "end")
          .text(function (d) {
            return d;
          });


        /*
        *
        *
        *
        *
        *
        *
        *
        *
        *
        *
        *
        *
        *
        *
        *
        *
        *
        * */
        return


        this.color = d3.scale.category10()
          .domain(d3.range(1, 9));
//        console.log("d3.range(1, 8)", d3.range(1, 9));
//        console.log("this.color.range()", this.color.range());
//        console.log("this.color.range()", this.color.domain());

        this.xScale
          .domain(data1.keys());

        this.yScale
          .domain([d3.max(data1, sumY), 0]);

        console.log("this.yScale.range()", this.yScale.range());
        console.log("this.yScale.domain()", this.yScale.domain());


        console.log("this.yScale(80)", this.yScale(80));
        console.log("this.yScale(1000)", this.yScale(1000));
        console.log("this.yScale(5)", this.yScale(5));
        console.log("this.yScale(0)", this.yScale(0));
//        this.yScale
//          .domain([d3.max(data, function (d) {
//            return parseFloat(d['bcl2fastq_PCT_>=_Q30_bases']);
//          }) * 1.1, d3.min(data, function (d) {
//            return parseFloat(d['bcl2fastq_PCT_>=_Q30_bases']);
//          }) * 0.9]);
//
//
        function sumY(d) {
          console.log("d", d);
          return d3.sum(d, function (d1) {
            return d1['bcl2fastq_PCT_>=_Q30_bases'];
          });
        }

        var bar = this.vis.selectAll('g')
          .data(data1)
          .enter()
          .append('g');


        bar.selectAll('rect')
          .data(function (d) {
            return d.values;
          })
          .enter()

          .append('rect')
          .attr("x", function (d) {
            return this.xScale(d.key);
          }.bind(this))
          .attr("width", this.xScale.rangeBand())
          .attr("y", function (d) {
            return this.height() - this.yScale(d['bcl2fastq_PCT_>=_Q30_bases']);
          }.bind(this))
          .attr("height", function (d) {
            return this.yScale(sumY(d));
          }.bind(this))
          .style('fill', 'rgba(0, 0, 0, 0.05)');


        this.vis.selectAll('g')
          .data(data1)
          .enter()
          .append('g')

          .selectAll('circle')
          .data(function (d) {
            return d.values;
          })
          .enter()

          .append('circle')
          .attr('cx', function (d) {
            return this.xScale(d['info_Flowcell']) +
              this.xScale.rangeBand() * (1 - d['info_lane'] / 8);
          }.bind(this))
          .attr('cy', function (d) {
            return this.height() - this.yScale(d['bcl2fastq_PCT_>=_Q30_bases']);
          }.bind(this))
          .attr('r', this.r)
          .style("fill", function (d) {
            return this.color(d['info_line']);
          }.bind(this));


        ;

        return;
        chart.selectAll('circle')
          .data(data1)
          .enter()

          .append('circle')
          .data(function (d1) {
            return d1.values;
          })
          .attr('cx', function (d) {
            return xScale(d.key);
          })
          .attr('cy', function (d) {
            return $scope.dimensions.height - yScale(d['bcl2fastq_PCT_>=_Q30_bases']);
          })
          .attr('r', r)
          .style('fill', 'blue');

        return;


//

        xScale
          .domain([d3.min(data, function (d) {
            return d['info_Date'];
          }), d3.max(data, function (d) {
            return d['info_Date'];
          })]).
          range([0, $scope.dimensions.width]);

        yScale
          .domain([d3.max(data, function (d) {
            return parseFloat(d['bcl2fastq_PCT_>=_Q30_bases']);
          }) * 1.1, d3.min(data, function (d) {
            return parseFloat(d['bcl2fastq_PCT_>=_Q30_bases']);
          }) * 0.9]).
          range([0, $scope.dimensions.height]);


        chart.selectAll('circle')
          .data(data, function (d) {
            return d['IUS'];
          })
          .enter()

          .append('circle')
          .attr('cx', function (d) {
            return xScale(d['info_Date']);
          })
          .attr('cy', function (d) {
//            console.log("d['bcl2fastq_PCT_>=_Q30_bases']", d['bcl2fastq_PCT_>=_Q30_bases'], yScale(d['bcl2fastq_PCT_>=_Q30_bases']));
//            console.log("d", d);
            return yScale(d['bcl2fastq_PCT_>=_Q30_bases']);
          })
          .attr('r', r)
          .style('fill', 'blue');


      }


      function createChart(svg) {

        this.svg = d3.select(svg)
          .attr('width', this.width() + this.margin.left + this.margin.right)
          .attr('height', this.height() + this.margin.top + this.margin.bottom)
          .append("g")
          .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        this.xScale = d3.scale.ordinal()
          .rangeRoundBands([0, this.width()], 0.1);


        this.yScale = d3.scale.linear()
          .range([this.height(), 0]);


        this.color = d3.scale.category20();


        this.xAxis = d3.svg.axis()
          .scale(this.xScale)
          .orient("bottom");

        this.yAxis = d3.svg.axis()
          .scale(this.yScale)
          .orient("left")
          .tickFormat(d3.format(".2s"));

      }


      function link($scope, $element, attr) {

        var chart = {
          margin: {top: 40, right: 20, bottom: 120, left: 40},
          r: 1,
          width: function () {
            return $scope.dimensions.width - this.margin.left - this.margin.right;
          },
          height: function () {
            return $scope.dimensions.height - this.margin.top - this.margin.bottom;
          }
        };

        createChart.call(chart, $element.find('svg')[0]);
        d3.csv(attr.src, dataReady.bind(chart));
//        $scope.$watch('dimensions', _.debounce(rescale.bind(null, $scope), 1000), true);
      }


      return {
        restrict: 'E',
        template: '<svg></svg>',
        link: link
      }

    }])


}());
