(function () {
  'use strict';

  angular.module('app.fileReader', [])


    .directive('fileReader', function () {

      function parse($scope, event) {
        $scope.value = event.target.result;
        $scope.$apply();
      }


      function handleFileSelect($scope, event) {
        var files = event.target.files,
          fileReader = new FileReader();
        fileReader.onload = parse.bind(null, $scope);
        fileReader.readAsText(files[0]);
      }


      function link($scope, $element) {
        $element
          .on('change', handleFileSelect.bind(null, $scope));
      }


      return {
        restrict: 'E',
        template: '<input type="file" multiple />',
        link: link,
        scope: {
          value: '=ngModel'
        }
      }
    });

}());
