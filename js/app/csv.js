(function () {
  'use strict';

  angular.module('app.csv', ['shared.d3'])

    .factory('csv', ['d3', '$q', function (d3, $q) {

      var cache = {
        raw: {},
        modified: {}
      };


      return function (src, lineModifier) {
        var deferred = $q.defer();

        if (cache.raw[src]) {

          if (!lineModifier) {
            deferred.resolve(cache.raw[src]);
            return deferred.promise;
          }

          if (!cache.modified[src][lineModifier]) {
            cache.modified[src][lineModifier] = cache.raw[src].map(lineModifier);
          }

          deferred.resolve(cache.modified[src][lineModifier]);
          return deferred.promise;
        }

        d3.csv(src)
          .get(function (error, data) {
            if (error) {
              return deferred.reject(error);
            }
            cache.raw[src] = data;

            if (!lineModifier) {
              return deferred.resolve(cache.raw[src]);
            }

            cache.modified[src][lineModifier] = cache.raw[src].map(lineModifier);

            return deferred.resolve(cache.modified[src][lineModifier]);
          });

        return deferred.promise;
      }

    }]);

}());
