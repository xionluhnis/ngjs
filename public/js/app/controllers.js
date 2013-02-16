/*global _:false */

// done only once when loading the app
$(function () {
  $(document).keypress(function (event) {
    var editing = $('#page').is(':visible');
    if (!editing) {
      // we only toggle in non-editing mode
      if (event.which == 104) { // H
        $('#index').fadeToggle('slow');
      } else if (event.which == 101) { // E
        $('#auth').fadeToggle('slow');
      }
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
  Metadata.getContent($location.path(), function (content) {
    if (content) {
      $scope.content = content;
      if (!$scope.$$phase) $scope.$digest();
    }
  }, function () {});
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
  // XXX instead of going back to /home with the /edit/.../view.html being served,
  //     open directly the view in a special #auth div#edit
  //     with ng-bind-html="contentFrom('/edit/.../view.html')"
  $scope.editToggle = function () {
    $scope.editing = !$scope.editing;
    if (!$scope.$$phase) $scope.$digest();
  };
  $scope.getEditTemplate = function () {
    return '/edit' + $location.path() + 'view.html';
  };
}
AuthController.$inject = ['$scope', '$location'];

function EditController($scope, $location, $rootScope, Metadata) {
  $scope.path = $location.path();
  // server response
  $scope.response = null;
  var update = function (res, status) {
    $scope.response = res || '';
    $scope.status = status || 'ok';
    if ($scope.status == 'ok') {
      setTimeout(function () {
        $('.response').fadeOut(10000);
      }, 2000);
    } else {
      $('.response').show();
    }
    if (!$scope.$$phase) $scope.$digest();
  };
  var error = function (res) {
    update(res, 'error');
  };
  var errorFunc = function (msg) {
    return function (err) {
      if (err) error(msg + ':\n' + err);
      else error(msg);
    };
  };
  // reset content
  var resetContent = function (content) {
    $scope.contentText = content || '';
    update();
  };


  // let's load the content!
  Metadata.getRawContent($location.path(), resetContent, function () {
    update('Error fetching content');
  });

  // save current modification
  $scope.save = function () {
    Metadata.edit({
      route: $location.path()
    }, {
      content: $scope.contentText || ''
    }, function (data) {
      if (!data) error('Server error');
      else if (!data.result) error(data.message || 'Not saved');
      else update(data.message || 'Saved!');
      $rootScope.$digest();
    }, errorFunc('Not saved'));
  };

  // reset metadata to null
  $scope.delete = function () {
    Metadata.clear({
      route: $location.path()
    }, function (data) {
      if (!data) error('Server error');
      else if (!data.result) error(data.message || 'Not deleted');
      else update(data.message || 'Deleted');
    }, errorFunc('Not deleted'));
  };
}
EditController.$inject = ['$scope', '$location', '$rootScope', 'Metadata'];

function NotFoundController($scope, $routeParams, $location) {
  $scope.path = $location.path();
}
NotFoundController.$inject = ['$scope', '$routeParams', '$location'];
