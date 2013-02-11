/*global _:false */

// done only once when loading the app
$(function () {
  $(document).keypress(function (event) {
    if (event.which == 104) { // H
      $('#index').fadeToggle('slow');
    } else if(event.which == 101) { // E
      $('#auth').fadeToggle('slow');
    }
  });
});

/**
 * The application base controller which sets the view stuff
 * Note: we do our own routing!
 */
function AppController($scope, $routeParams, $location) {
  $scope.getViewTemplate = function () {
    return $location.path() + 'view.html';
  };
}
AppController.$inject = ['$scope', '$routeParams', '$location'];

function IndexController($scope, $routeParams, $location, Index) {
  var path = $location.path();
  $scope.path = path.length <= 2 ? '' : path.substring(1, path.length - 1);
  Index.fetch({
    route: $location.path()
  }, function (list) {
    $scope.routes = list;
    $scope.images = [];
    _.each(list, function (route) {
      $scope.images.push.apply($scope.images, route.images);
    });
    if (!$scope.$$phase) $scope.digest();
  }, function () {});
  var $bg;
  $scope.createBg = function () {
    // we use zigfy!
    if ($bg) return;
    $bg = $('#background');
    // set src
    $bg.find('img').each(function (i) {
      $(this).attr('src', $scope.images[i]);
    });
    // set gallery
    $bg.zigfy({
      resize: true,
      showNav: false,
      autoNav: true
    });
  };
  // we clear when the view change
  $scope.$on('$destroy', function () {
    if ($bg) {
      $bg.zigfy('clear');
    }
  });
}
IndexController.$inject = ['$scope', '$routeParams', '$location', 'Index'];

function GalleryController($scope, $routeParams, $location, Gallery, Metadata) {
  // fetching gallery images
  Gallery.fetch({
    route: $location.path()
  }, function (data) {
    for (var key in data) {
      $scope[key] = data[key];
    }
    if (!$scope.$$phase) $scope.digest();
  }, function () {});
  // fetching gallery content
  Metadata.getContent($location.path(), function(content) {
    if(content){
      $scope.content = content;
      if(!$scope.$$phase) $scope.$digest();
    }
  }, function(){});
  var $g;
  $scope.createGallery = function () {
    // we use zigfy
    if ($g) return;
    $g = $('#gallery');
    // set src
    $g.find('img').each(function (i) {
      $(this).attr('src', $scope.images[i]);
    });
    // set gallery
    $g.zigfy({
      resize: true,
      showNav: true
    });
  };
  // we clear when the view changes
  $scope.$on('$destroy', function () {
    if ($g) $g.zigfy('clear');
  });
}
GalleryController.$inject = ['$scope', '$routeParams', '$location', 'Gallery', 'Metadata'];

function AuthController($scope, $location) {
  $scope.edit = function(){
    $location.path('/edit' + $location.path());
  };
}
AuthController.$inject = ['$scope', '$location'];

function NotFoundController($scope, $routeParams, $location) {
  $scope.path = $location.path();
}
NotFoundController.$inject = ['$scope', '$routeParams', '$location'];
