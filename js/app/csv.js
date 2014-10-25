(function () {
  'use strict';

  angular.module('app.csv', ['shared.d3'])

    .factory('csv', ['d3', '$q', function (d3, $q) {

      var cache = {};

      return function (src) {
        var deferred = $q.defer();

        if (cache[src]) {
          deferred.resolve(cache[src]);
          return deferred.promise;
        }

        d3.csv(src)
          .get(function (error, data) {
            if (error) {
              return deferred.reject(error);
            }
            cache[src] = data;

            return deferred.resolve(cache[src]);
          });

        return deferred.promise;
      }

    }]);

}());
