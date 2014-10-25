(function () {
  'use strict';

  angular.module('shared.underscore', [])
    .factory('_', ['$window', function($window) {
      return $window._.noConflict();
    }]);

}());
