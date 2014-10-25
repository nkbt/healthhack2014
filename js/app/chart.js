(function () {
  'use strict';

  angular.module('app.chart', [
    'shared.d3',
    'shared.underscore'
  ])

    .controller('Chart', ['$scope', '_', function ($scope, _) {

//      function pickYield() {
//
//
//        console.log("$scope.data.yield", $scope.data.yield);
//
////        isaac_Yield_(Mbases)_R1: "53085"isaac_Yield_(Mbases)_R2: "53085"
//      }


//      $scope.scale = d3.scale.linear()
//        .domain([0, d3.max(data)])
//        .range([0, width]);


    }])

    .directive('chart', ['d3', '_', function (d3, _) {

      function link($scope, $element, attr) {

        var barWidth = 5,
          chart = d3.select($element.find('svg')[0]),
          xScale = d3.scale.linear(),
          bars = [];
        window.chart = chart;
        d3.csv(attr.src)
//          .row(function (line) {
//            return {
//              r1: line['isaac_Yield_(Mbases)_R1'] && parseInt(line['isaac_Yield_(Mbases)_R1'], 10) || 0,
//              r2: line['isaac_Yield_(Mbases)_R2'] && parseInt(line['isaac_Yield_(Mbases)_R2'], 10) || 0
//            };
//          })
          .get(function (error, data) {

            data = data.slice(100, 200);

            chart
              .attr('height', data.length * barWidth)
              .attr('width', $scope.dimensions.width)
            ;

            console.log("data[400]", data[400]);

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

//            bars.push(line);
//
//            bar.append("text")
//              .attr("x", function (d) {
//                return x(d) - 3;
//              })
//              .attr("y", barHeight / 2)
//              .attr("dy", ".35em")
//              .text(function (d) {
//                return d;
//              });
//
            $scope.data = data;
          });


        function rescale(dimensions) {
          chart.transition()
            .attr('width', dimensions.width);
          xScale.range([0, dimensions.width]);
          chart.selectAll('rect')
            .transition()
            .attr("width", function (item) {
              return xScale(item['bcl2fastq_PCT_>=_Q30_bases']);
            });
        }

        $scope.$watch('dimensions', _.debounce(rescale, 500), true);

      }

      return {
        restrict: 'E',
        template: '<svg></svg>',
        link: link
      }

    }]);

}());
