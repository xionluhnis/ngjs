var app = module.parent.exports;
var async = require('async');
var fs = require('fs');
var path = require('path');

// colors
var GRAY = app.util.GRAY;
var RED = app.util.RED;
var RESET = app.util.RESET;
var WHITE = app.util.WHITE;

// route cache
var routeCache = {};

// directories to exclude
var exclude = {
  'css': true,
  'js': true,
  'images': true,
  'libs': true
};

// valid directory name to look for
var dirNameRx = /[0-9a-zA-Z]+[0-9a-zA-Z_\\-\\.]*/;

// creating initial routing information (synchronously)
var baseDir = app.util.publicDir;
console.log(GRAY + 'Creating routing in %s' + RESET, baseDir);
var routeStack = [{
  route: '/',
  dir: baseDir,
  type: 'index',
  store: true
}];
while (routeStack.length) {
  var entry = routeStack.pop();
  // we only store galleries (not indexes)
  // unless it's a validated index
  if (entry.type === 'gallery' || entry.store) routeCache[entry.route] = entry.type;
  console.log(GRAY + '%s [%s]' + RESET, entry.route, entry.type);
  if (entry.type === 'index') {
    var dirs = fs.readdirSync(entry.dir);
    for (var i = 0; i < dirs.length; ++i) {
      var dirname = dirs[i];
      // is it excluded?
      if (dirname in exclude) continue;
      if (!dirNameRx.test(dirname)) continue;

      // we create the entry
      var e = {
        route: path.join(entry.route, dirname) + '/',
        dir: path.join(entry.dir, dirname),
        type: 'index'
      };
      var stats = fs.statSync(e.dir);
      if (stats && stats.isDirectory()) {
        // checking the type
        var imagesDir = path.join(e.dir, 'images');
        if (fs.existsSync(imagesDir)) {
          stats = fs.statSync(imagesDir);
          if (stats && stats.isDirectory()) e.type = 'gallery';
        }
        routeStack.push(e);
      }
    }
  }
}

module.exports = {
  /**
   * Index view
   */
  index: function (req, res) {
    req.params[0] = 'home';
    req.viewRoute = '/';
    module.exports.jade(req, res);
  },
  /**
   * Filter file names
   */
  filter: function (files) {
    return files.filter(function (name) {
      return !exclude[name] && dirNameRx.test(name);
    });
  },

  /**
   * Get the valid subdirectories
   * within a directory (which should not be a gallery!)
   */
  getSubdirs: function (dir, callback) {
    // capture all directories
    fs.readdir(dir, function (err, files) {
      // we want only directories
      async.filter(module.exports.filter(files), function (filename, cb) {
        var file = path.join(dir, filename);
        fs.stat(file, function (err, stats) {
          if (err) {
            console.log(RED + 'Error: ' + RESET, err);
            cb(false);
          } else cb(stats.isDirectory());
        });
      }, function (dirList) {
        if (err) callback(err);
        else callback(null, dirList);
      });
    });
  },

  /**
   * Parse a route
   */
  parse: function (routeStr, callback) {
    // is the route already cached?
    var type = routeCache[routeStr];
    if (type) {
      callback(null, {
        type: type,
        route: routeStr,
        dir: app.util.publicDir + routeStr
      });
      return;
    }

    // check that it's a route
    if(routeStr.charAt(0) !== '/' || routeStr.charAt(routeStr.length - 1) !== '/') {
      callback(new Error('Invalid route ' + routeStr));
      return;
    }

    // we rebuild it to check its validity
    var route = '/';
    var dir = app.util.publicDir;
    // computation of the route
    var tokens = routeStr.substring(1, routeStr.length - 1).split('/');
    for (var i = 0; i < tokens.length; ++i) {
      var name = tokens[i];
      if (!dirNameRx.test(name)) {
        // invalid route
        // we don't leak information
        callback(null, {
          type: 'notfound',
          fullRoute: routeStr,
          token: name
        });
        return;
      }
      // we should be currently in an index, is it correct?
      var type = routeCache[route];
      if (type === 'gallery') {
        // we cannot go farther into a gallery!
        // invalid access!
        callback(null, {
          type: 'notfound',
          fullRoute: routeStr,
          galleryRoute: route
        });
        // XXX the gallery may not be in the index yet!
        return;
      }

      // possibly valid route
      route = path.join(route, name) + '/';
      dir = path.join(dir, name);
    }

    // does the route actually exist?
    fs.exists(dir, function (exists) {
      if (!exists) {
        callback(null, {
          type: 'notfound',
          route: route,
          dir: dir
        });
        return;
      }

      // it exists!
      // what type of route is it?
      var imagesDir = path.join(dir, 'images');
      fs.exists(imagesDir, function (exists) {
        if (exists) {
          fs.stat(imagesDir, function (err, stats) {
            if (err) {
              callback(err);
            } else if (stats.isDirectory()) {
              // it's a gallery!
              // cache it!
              routeCache[route] = 'gallery';
              callback(null, {
                type: 'gallery',
                route: route,
                dir: dir
              });
            } else {
              // it's an index with a images file!
              console.log(RED + 'Attention, weird "images" file in ' + WHITE + route + RESET);
              callback(null, {
                type: 'index',
                route: route,
                dir: dir
              });
            }
          });
        } else {
          // we are in an index
          callback(null, {
            type: 'index',
            route: route,
            dir: dir
          });
        }
      });
    });
  },
  /**
   * Index or gallery routing
   */
  route: function (req, res) {
    var route = req.params[0];
    if (!route) {
      res.send(500, 'Invalid route');
      return;
    }
    // checking cache
    var routeType = routeCache[route];
    if (routeType) {
      req.params[0] = routeType;
      req.viewRoute = route;
      module.exports.jade(req, res);
      return;
    }

    // not in the cache
    // is it a valid route?
    var baseDir = app.util.publicDir + route;
    fs.exists(baseDir, function (exists) {
      if (!exists) {
        // we go to the "not found" page
        req.params[0] = 'notfound';
        module.exports.jade(req, res);
        return;
      }
      // what type of route?
      fs.stat(baseDir + 'images', function (err, stats) {
        // XXX cache indexes too?
        // How do you know an index is an index?
        //  => we must use metadata or a tree of indexes
        //     if the metadata is absent => go to a not-found page (auth => create page?)
        if (err || !stats.isDirectory()) req.params[0] = 'index';
        else {
          req.params[0] = 'gallery';
          // cache it!
          routeCache[route] = req.params[0];
        }
        req.viewRoute = route;
        module.exports.jade(req, res);
      });
    });
  },

  /**
   * Some random view (or something else)
   */
  jade: function (req, res, next) {
    // do we serve the template view or the base with routing info?
    var view = req.params[0];
    if (req.path.charAt(req.path.length - 1) == '/') {
      view = 'home';
      // checking the viewRoute parameter
      if (!req.viewRoute) {
        res.redirect(app.util.prefix + '/');
        return;
      }
    }
    res.render(view + '.jade', {
      auth: false,
      path: req.path,
      query: req.query,
      route: req.viewRoute
    }, function (err, html) {
      if (err) {
        console.log(RED + 'Error: ' + RESET, err);
        if (next) next();
        else res.send(500, 'End of the road.');
      } else {
        res.send(html);
      }
    });
  }
};
