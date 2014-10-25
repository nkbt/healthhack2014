(function () {
  'use strict';

  angular.module('app.fullscreen', [])

    .controller('Fullscreen', [
      '$scope', '$interval', '$window', '$document',
      function ($scope, $interval, $window, $document) {


        $scope.dimensions = $scope.dimensions || {width: 0, height: 0};

        function updateDimentions() {
          $scope.dimensions.width = $document[0].body.clientWidth;
          $scope.dimensions.height = $window.innerHeight;
        }

        updateDimentions();

        var interval = $interval(updateDimentions, 100);

        $scope.$on('destroy', function () {
          $interval.cancel(interval);
          interval = null;
        })
      }
    ]);
}());
