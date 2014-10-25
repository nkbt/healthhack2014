(function () {
  'use strict';


  angular.module('app.chart', [
    'shared.d3',
    'shared.underscore',
    'app.fileReader'
  ])

    .controller('Chart', ['$scope', '_', function ($scope, _) {

      function parseCsv(text) {

        var lines = text.split('\n'),
          header = lines.shift().split(','),
          data = _.map(lines, function(line) {
            return _.object(header, line.split(','))
          });

        console.log("data", data);
      }


      $scope.data = {
        raw: ''
      };

      $scope.$watch('data.raw', parseCsv);

    }])

    .directive('chart', function () {

      function link($scope, $element) {

      }

      return {
        restrict: 'E',
        link: link
      }

    });

}());
