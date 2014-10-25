(function () {
  'use strict';


  angular.module('app.chart', [
    'shared.d3',
    'shared.underscore'
  ])

    .controller('Chart', ['$scope', '_', function ($scope, _) {

    }])

    .directive('chart', ['d3', '_', function (d3, _) {


      function rescale($scope, dimensions) {
        var xScale = $scope.xScale,
          chart = $scope.chart;

        if (!chart) {
          return;
        }

        chart.transition()
          .attr('width', dimensions.width);
        xScale.range([0, dimensions.width]);
        chart.selectAll('rect')
          .transition()
          .attr("width", function (item) {
            return xScale(item['bcl2fastq_PCT_>=_Q30_bases']);
          });
      }


      function dataReady($scope, data) {

        var barWidth = 5,
          xScale = $scope.xScale,
          chart = $scope.chart;


        data = data.slice(100, 200);

        chart
          .attr('height', data.length * barWidth)
          .attr('width', $scope.dimensions.width);


        xScale.domain([0, d3.max(data, function (row) {
          return row['bcl2fastq_PCT_>=_Q30_bases'];
        })]).
          range([0, $scope.dimensions.width]);


        var bar = chart.selectAll('g')
          .data(data)
          .enter().append('g')
          .attr("transform", function (d, i) {
            return 'translate(0,' + i * barWidth + ')';
          });

        bar.append("rect")
          .attr("width", function (item) {
            return xScale(item['bcl2fastq_PCT_>=_Q30_bases']);
          })
          .attr("height", barWidth);

      }


      function link($scope, $element, attr) {

        $scope.chart = d3.select($element.find('svg')[0]);
        $scope.xScale = d3.scale.linear();
        d3.csv(attr.src, dataReady.bind(null, $scope));
        $scope.$watch('dimensions', _.debounce(rescale.bind(null, $scope), 1000), true);

      }

      return {
        restrict: 'E',
        template: '<svg></svg>',
        link: link
      }

    }])


}());
