(function () {
  'use strict';

  function toFloat(str) {
    return str && str.length > 0 ? parseFloat(str) : 0;
  }


  angular.module('app.csv', [
    'shared.underscore',
    'app.fileReader'
  ])

    .controller('CSV', ['$scope', '_', function ($scope, _) {

      function parseCsv(text) {
        var lines = text.split('\n'),
          header = lines.shift().split(',');

        $scope.data.parsed = _.map(lines, function (line) {
          return _.object(header, line.split(','))
        });
      }

      function pickYield() {
        $scope.data.yield.r1 = _.map(
          _.pluck($scope.data.parsed, 'isaac_Yield_(Mbases)_R1'), toFloat
        );
        $scope.data.yield.r2 = _.map(
          _.pluck($scope.data.parsed, 'isaac_Yield_(Mbases)_R2'), toFloat
        );

        console.log("$scope.data.yield", $scope.data.yield);
      }


      $scope.data = {
        raw: '',
        parsed: [],
        yield: {}
      };

      $scope.$watch('data.raw', parseCsv);
      $scope.$watch('data.parsed', pickYield);
    }]);


}());
