(function () {
  'use strict';

  angular.module('app.fullscreen', [])


    .directive('fullscreen', [
      '$interval', '$window', '$document',
      function ($interval, $window, $document) {


      function link($scope, $element) {

        $scope.dimensions = {width: 0, height: 0};

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


      return {
        restrict: 'E',
        link: link
      }
    }]);

}());
