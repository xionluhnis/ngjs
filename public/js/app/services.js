/*global angular:false */

angular.module('GalleryServices', ['ngResource'])
  .config(['$httpProvider', function($httpProvider) {
  $httpProvider.responseInterceptors.push('xhrErrorInterceptor');
}])
  .factory('xhrErrorInterceptor', ['$rootScope', '$q', '$window', function($rootScope, $q, $window) {
  return function(promise) {
    return promise.then(function(response) {
      //on success: do nothing
      return response;
    }, function(response) {
      if (response.status === 500 && response.data === 'Needs authentication') {
        $('.reload-message').show();
        setTimeout(function() {
          $window.location.reload();
        }, 1500);
      } else {
        return $q.reject(response);
      }
    });
  };
}])
  .factory('Index', ['$resource', function($resource) {
  var Index = $resource('/rest/index', {}, {
    fetch: {
      method: 'GET',
      isArray: true
    },
    create: {
      method: 'POST'
    },
    edit: {
      method: 'PUT'
    },
    clear: {
      method: 'DELETE'
    }
  });

  return Index;
}])
  .factory('Gallery', ['$resource', function($resource) {
  var Gallery = $resource('/rest/gallery', {}, {
    fetch: {
      method: 'GET',
      isArray: false
    },
    create: {
      method: 'POST'
    },
    edit: {
      method: 'PUT'
    },
    clear: {
      method: 'DELETE'
    }
  });

  return Gallery;
}])
  .factory('Metadata', ['$resource', function($resource) {
  var Metadata = $resource('/rest/metadata', {}, {
    fetch: {
      method: 'GET',
      isArray: false
    },
    create: {
      method: 'POST'
    },
    edit: {
      method: 'PUT'
    },
    clear: {
      method: 'DELETE'
    }
  });

  var unfold = function(cb){
    return function(result){
      if(result && result.data) cb(result.data);
      else cb();
    };
  };

  Metadata.getContent = function(route, cb, err){
    return Metadata.fetch({
      route: route
    }, unfold(cb), err);
  };

  Metadata.getRawContent = function(route, cb, err){
    return Metadata.fetch({
      route: route,
      format: 'raw'
    }, unfold(cb), err);
  };

  return Metadata;
}]);
