/*global angular:false */

var GalleryModule = angular.module('Gallery', ['GalleryServices', 'ngSanitize'])
  .config(['$locationProvider', function ($locationProvider) {
    $locationProvider.html5Mode(true);
}]);

GalleryModule.run(['$rootScope', '$location', function ( /* $rootScope, $location */ ) {
  // what to run
}]);

GalleryModule.directive('ngFinally', function () {
  return {
    restrict: 'A',
    link: function ($scope, elem, attrs) {
      // only call for the last element
      if($scope.$last){
        // angularjs custom function with DOM Access - works fine
        $(elem).ready(function(){
          $scope.$eval(attrs.ngFinally);
        });
      }
    }
  };
});

