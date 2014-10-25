(function () {
  'use strict';

  angular.module('shared.d3', [])
    .factory('d3', ['$window', function($window) {
      return $window.d3;
    }]);

}());
