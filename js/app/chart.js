(function () {
  'use strict';

  angular.module('app.chart', [
    'shared.d3',
    'shared.underscore'
  ])

    .directive('chart', ['d3', '_', function (d3, _) {


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
          .attr('transform', 'translate(0,' + this.height() + ')')
          .call(this.xAxis)
          .selectAll('text')
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


      function dataReady(data) {

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
              e[key] = x[this.metrics.y];
            }.bind(this));
            return e;
          }.bind(this))
          .map(data, d3.map);

        this.color.domain(d3.range(1, 9));

        data1.forEach(function (flowcellKey, d) {
          var y0 = 0;
          d[this.metrics.y] = _.map(d, function (value, laneKey) {
            var e = {
              flowcell: flowcellKey,
              name: laneKey.split('__').shift(),
              y0: y0,
              y1: y0 + parseFloat(value)
            };

            y0 = e.y1;

            return e;
          });
          d.total = _.last(d[this.metrics.y]).y1;
          d.flowcell = flowcellKey;
        }.bind(this));

        data.sort(function (a, b) {
          return b.total - a.total;
        });

        this.xScale.domain(data1.keys());
        this.yScale.domain([0, d3.max(data1.values(), function (d) {
          return d.total;
        })]);

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
          .text('bcl2fastq_PCT_>=_Q30_bases');


        this.bar = this.vis.selectAll('.bar')
          .data(data1.values())
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

        this.legend = this.vis.selectAll('.legend')
          .data(this.color.domain().slice())
          .enter().append('g')
          .attr('class', 'legend')
          .attr('transform', function (d, i) {
            return 'translate(0, ' + i * 20 + ')';
          });

        this.legend.append('rect')
          .attr('x', this.width())
          .attr('width', 18)
          .attr('height', 18)
          .style('fill', this.color);

        this.legend.append('text')
          .attr('x', this.width() - 6)
          .attr('y', 9)
          .attr('dy', '0.35em')
          .style('text-anchor', 'end')
          .text(function (d) {
            return d;
          });
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


        this.color = d3.scale.category20();


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
        d3.csv(attr.src, dataReady.bind(chart));
        $scope.$watch('dimensions', _.debounce(rescale.bind(chart), 1000), true);
      }


      return {
        restrict: 'E',
        template: '<svg></svg>',
        link: link
      };

    }]);


}());
