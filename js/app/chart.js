(function () {
  'use strict';


  angular.module('app.chart', [
    'shared.d3',
    'shared.underscore'
  ])

    .controller('Chart', ['$scope', function ($scope) {

      $scope.y = {
        list: [
          {name: 'bcl2fastq_Yield_(Mbases)', value: 'bcl2fastq_Yield_(Mbases)'},
          {name: 'bcl2fastq_PCT_Q30_bases', value: 'bcl2fastq_PCT_Q30_bases'}
        ],
        value: ''
      };
      $scope.y.value = $scope.y.list[0];

    }])


    .directive('chart', ['d3', '_', function (d3, _) {


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


        var bars = this.chart.selectAll('.bar');

        bars
          .transition().duration(100)
          .attr('width', this.xScale.rangeBand())
          .attr('height', function (d) {
            return this.yScale(d[this.metrics.y]);
          }.bind(this))
          .attr('y', function (d) {
            return this.height() - this.yScale(d[this.metrics.y]);
          }.bind(this))
          .attr('x', function (d) {
            return this.xScale(d['info_Flowcell']);
          }.bind(this));


        this.vis.select('.x.axis')
          .attr('transform', 'translate(0,' + this.height() + ')')
          .call(this.xAxis)
          .selectAll('text')
          .transition().duration(100)
          .style('text-anchor', 'end')
          .attr('dx', '-0.8em')
          .attr('dy', '0.15em');


        this.vis.select('.y.axis')
          .call(this.yAxis);

      }


      function redraw() {
        var data = _data;

        this.xScale.domain(data.map(function (d) {
          return d['info_Flowcell'];
        }));
        this.yScale.domain(d3.extent(data, function (d) {
          return parseFloat(d[this.metrics.y]);
        }.bind(this)));


        var bars = this.chart.selectAll('.bar').data(data);

        bars
          .transition()
          .duration(100)
          .attr('class', 'bar')
          .attr('width', this.xScale.rangeBand())
          .attr('height', function (d) {
            return this.yScale(d[this.metrics.y]);
          }.bind(this))
          .attr('y', function (d) {
            return this.height() - this.yScale(d[this.metrics.y]);
          }.bind(this))
          .attr('x', function (d) {
            return this.xScale(d['info_Flowcell']);
          }.bind(this));

        bars
          .enter().append('rect')
          .on('mouseover', this.tip.show)
          .on('mouseout', this.tip.hide)
          .attr('width', this.xScale.rangeBand())
          .attr('height', 0)
          .attr('y', this.height())
          .attr('x', function (d) {
            return this.xScale(d['info_Flowcell']);
          }.bind(this))
          .style('fill', 'rgba(0,100,0,0.1)')

          .transition()
          .delay(200)
          .duration(300)
          .attr('class', 'bar')
          .attr('height', function (d) {
            return this.yScale(d[this.metrics.y]);
          }.bind(this))
          .attr('y', function (d) {
            return this.height() - this.yScale(d[this.metrics.y]);
          }.bind(this));

        bars
          .exit()
          .style('fill', 'rgba(255,0,0,1)')
          .transition()
          .duration(500)
          .attr('height', 0)
          .attr('y', this.height())
          .remove();


        this.vis.select('.x.axis')
          .attr('transform', 'translate(0,' + this.height() + ')')
          .call(this.xAxis)
          .selectAll('text')
          .style('text-anchor', 'end')
          .attr('dx', '-0.8em')
          .attr('dy', '0.15em')
          .attr('transform', 'rotate(-65)');


        this.vis.select('.y.axis')
          .call(this.yAxis)
          .selectAll('.label')
          .attr('y', 6)
          .attr('x', 0)
          .attr('dy', '-1em')
          .style('text-anchor', 'start')
          .text(this.metrics.y);

      }


      function createChart(svg) {

        this.svg = d3.select(svg)
          .attr('width', this.width() + this.margin.left + this.margin.right)
          .attr('height', this.height() + this.margin.top + this.margin.bottom);

        this.vis = this.svg.append('g')
          .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

        this.chart = this.vis.append('g');

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
          .ticks(5)
          .tickFormat(d3.format('.2s'));

        this.vis.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + this.height() + ')')
          .call(this.xAxis);

        this.vis.append('g')
          .attr('class', 'y axis')
          .call(this.yAxis)
          .append('text')
          .attr('y', 6)
          .attr('x', 0)
          .attr('dy', '-1em')
          .style('text-anchor', 'start')
          .text(this.metrics.y);

        this.tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function (d) {
            return _.map(d, function (item, key) {
              return [
                ['<i>', key, '</i>'].join(''),
                ['<b>', item, '</b>'].join('')
              ].join(': ');
            }).join('<br>');
          });
        this.vis.call(this.tip);
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

          margin: {top: 40, right: 40, bottom: 120, left: 100},
          width: function () {
            return $scope.dimensions.width - this.margin.left - this.margin.right;
          },
          height: function () {
            return $scope.dimensions.height - this.margin.top - this.margin.bottom;
          }
        };

        createChart.call(chart, $element.find('svg')[0]);


        /**
         * Mock feeding data
         * @param {Object[]} data
         * @param {Number} index
         */
        function feed(data, index) {
          _.each(data.slice(index, index + 50), function (d) {
            if (_data.length > 500) {
              _data.shift();
            }
            _data.push(d);
          });
          redraw.call(chart);

          if (index + 50 < data.length) {
            index = index + 50;
            setTimeout(feed.bind(null, data, index), 3000);
          }
        }

        d3.csv(attr.src, function (data) {
          feed(data, 0);
        });

//        $scope.$watch('y.value.value', function (value) {
//          chart.metrics.y = value;
//        });

        $scope.$watch('dimensions', _.debounce(rescale.bind(chart), 1000), true);

      }


      return {
        restrict: 'E',
        link: link
      };

    }]);


}());
