(function () {
  'use strict';


  angular.module('app.chart', [
    'shared.d3',
    'shared.underscore'
  ])

    .controller('Chart', ['$scope', function ($scope) {

      $scope.y = {
        list: [
          {name: 'bcl2fastq_Yield_(MBases)', value: 'bcl2fastq_Yield_(MBases)'},
          {name: 'bcl2fastq_PCT_Q30_bases', value: 'bcl2fastq_PCT_Q30_bases'}
        ],
        value: ''
      };
      $scope.y.value = $scope.y.list[0];

    }])

    .factory('chartData', ['d3', '_', '$timeout', function (d3, _, $timeout) {

      return function (src, metrics, dataReady) {
        return d3.csv(src, function (data) {
          var data1 = data.slice(0, 50);

          dataReady(data1);

          $timeout(function () {
            _.each(data.slice(50, 100), function (d) {
              data1.shift();
              data1.push(d);
            });
            dataReady(data1);
          }, 1000);

        });
      };

    }])

    .directive('chart', ['d3', '_', 'chartData', function (d3, _, chartData) {


      var _data = [];


      function rescale() {
        if (!this.svg) {
          return;
        }

        this.svg.transition()
          .attr('width', this.width() + this.margin.left + this.margin.right)
          .attr('height', this.height() + this.margin.top + this.margin.bottom);

        this.xScale.rangeRoundBands([0, this.width()], 0.1);
        this.yScale.range([this.height(), 0]);

        this.vis.select('.x.axis')
          .attr('transform', 'translate(0,' + (this.height()) + ')')
          .call(this.xAxis)
          .selectAll('text')
          .style('text-anchor', 'end')
          .attr('dx', '-0.8em')
          .attr('dy', '0.15em');

        this.vis.select('.y.axis')
          .call(this.yAxis);

        this.bar
          .attr('transform', function (d) {
            return 'translate(' + this.xScale(d.flowcell) + ',0)';
          }.bind(this));

        this.bar.selectAll('rect')
          .attr('width', this.xScale.rangeBand())
          .attr('y', function (d) {
            return this.yScale(d.y1);
          }.bind(this))
          .attr('height', function (d) {
            return this.yScale(d.y0) - this.yScale(d.y1);
          }.bind(this));

        this.legend.selectAll('rect')
          .attr('x', this.width());

        this.legend.selectAll('text')
          .attr('x', this.width() - 6);

      }


      function redraw() {
        var data = _data;
        console.log("data", data);

        this.xScale.domain(data.map(function (d) {
          return d['info_Flowcell'];
        }));
        this.yScale.domain(d3.extent(data, function (d) {
          return d['bcl2fastq_PCT_Q30_bases'];
        }));
        console.log("this.xScale.domain()", this.xScale.domain());
        console.log("this.yScale.domain()", this.yScale.domain());


        var bars = this.vis.selectAll('.bar').data(data);

        bars
          .transition()
          .duration(100)
          .attr('class', 'bar')
          .attr('width', this.xScale.rangeBand())
          .attr('height', function (d) {
            return this.yScale(d['bcl2fastq_PCT_Q30_bases']);
          }.bind(this))
          .attr('y', function (d) {
            return this.height() - this.yScale(d['bcl2fastq_PCT_Q30_bases']);
          }.bind(this))
          .attr('x', function (d) {
            return this.xScale(d['info_Flowcell']);
          }.bind(this))
          .style('fill', 'rgba(0,100,0,0.1)');


        bars
          .enter().append('rect')
          .attr('width', this.xScale.rangeBand())
          .attr('height', 0)
          .attr('y', this.height())
          .attr('x', function (d) {
            return this.xScale(d['info_Flowcell']);
          }.bind(this))

          .transition()
          .delay(200)
          .duration(300)
          .attr('class', 'bar')
          .attr('height', function (d) {
            return this.yScale(d['bcl2fastq_PCT_Q30_bases']);
          }.bind(this))
          .attr('y', function (d) {
            return this.height() - this.yScale(d['bcl2fastq_PCT_Q30_bases']);
          }.bind(this))
          .style('fill', 'rgba(0,0,0,0.1)');

        bars
          .exit()
          .remove();


        return;


        this.vis.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + this.height() + ')')
          .call(this.xAxis)

          .selectAll('text')
          .style('text-anchor', 'end')
          .attr('dx', '-0.8em')
          .attr('dy', '0.15em')
          .attr('transform', 'rotate(-65)');

        this.vis.append('g')
          .attr('class', 'y axis')
          .call(this.yAxis)
          .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 6)
          .attr('dy', '.71em')
          .style('text-anchor', 'end')
          .text(this.metrics.y);


        this.bar = this.vis.selectAll('.bar')
          .data(data.values())
          .enter().append('g')
          .attr('class', 'bar')
          .attr('transform', function (d) {
            return 'translate(' + this.xScale(d.flowcell) + ',0)';
          }.bind(this));

        this.bar.selectAll('rect')
          .data(function (d) {
            return d[this.metrics.y];
          }.bind(this))
          .enter().append('rect')
          .attr('width', this.xScale.rangeBand())
          .attr('y', function (d) {
            return this.yScale(d.y1);
          }.bind(this))
          .attr('height', function (d) {
            return this.yScale(d.y0) - this.yScale(d.y1);
          }.bind(this))
          .style('fill', function (d) {
            return this.color(d.name);
          }.bind(this));

      }


      function createChart(svg) {

        this.svg = d3.select(svg)
          .attr('width', this.width() + this.margin.left + this.margin.right)
          .attr('height', this.height() + this.margin.top + this.margin.bottom);

        this.vis = this.svg.append('g')
          .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

        this.xScale = d3.scale.ordinal()
          .rangeRoundBands([0, this.width()], 0.1);

        this.yScale = d3.scale.linear()
          .range([this.height(), 0]);

        this.xAxis = d3.svg.axis()
          .scale(this.xScale)
          .orient('bottom');

        this.yAxis = d3.svg.axis()
          .scale(this.yScale)
          .orient('left')
          .tickFormat(d3.format('.2s'));

      }


      function link($scope, $element, attr) {

        /**
         * @class
         * @name chart
         */
        var chart = {

          metrics: {
            y: attr.y
          },

          margin: {top: 40, right: 40, bottom: 120, left: 40},
          width: function () {
            return $scope.dimensions.width - this.margin.left - this.margin.right;
          },
          height: function () {
            return $scope.dimensions.height - this.margin.top - this.margin.bottom;
          }
        };

        createChart.call(chart, $element.find('svg')[0]);


        function feed(data, index) {
          _.each(data.slice(index, index + 50), function (d) {
            _data.push(d);
          });
          redraw.call(chart);

          if (index + 50 < data.length && index + 50 < 500) {
            index = index + 50;
            setTimeout(feed.bind(null, data, index), 1000);
          }
        }

        d3.csv(attr.src, function (data) {
          console.log("data.length", data.length, data[0]);
          feed(data, 0);
        });


        chartData(attr.src, chart.metrics, redraw.bind(chart));

        $scope.$watch('y.value.value', function (value) {
          chart.metrics.y = value;
        });

      }


      return {
        restrict: 'E',
        link: link
      };

    }]);


}());
