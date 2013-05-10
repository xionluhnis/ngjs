var app = module.parent.exports;
var async = require('async');
var fs = require('fs');
var path = require('path');
var router = require('./router.js');

// colors
var RED = app.util.RED;
var RESET = app.util.RESET;
var WHITE = app.util.WHITE;

// limit of images
var IMAGES_LIMIT = process.env.IMAGES_LIMIT || 20;

// image filter
var lcImgRx = /^[0-9a-z_\-\.]+\.(jpg|jpeg|tiff|png)$/;

var notImplemented = function (req, res) {
  res.send(500, 'Not yet implemented');
};

module.exports = {
  /**
   * Extract random images from a gallery
   */
  findGalleryImages: function (galleryRoute, limit, callback) {
    var imgDir = path.join(app.conf.publicDir + galleryRoute, 'images');
    fs.readdir(imgDir, function (err, files) {
      if (err) {
        callback(err);
        return;
      }
      // filter files for images
      files = files.filter(function (name) {
        return lcImgRx.test(name.toLowerCase());
      });
      // shuffle to keep random files
      app.util.shuffle(files);
      // we only keep under the limit
      if (limit) files.length = Math.min(limit, files.length);
      // we map the images full route (not file path!)
      callback(null, files.map(function (name) {
        return path.join(galleryRoute, 'images', name);
      }));
    });
  },
  /**
   * Find images recursively
   */
  findImages: function (route, limit, callback) {
    var routeStack = [{
      route: route,
      limit: limit || 0
    }];
    var images = [];
    async.whilst(function () {
      return routeStack.length;
    }, function (cb) {
      // unstack
      var entry = routeStack.pop();
      // what type of route is that?
      router.parse(entry.route, function (err, data) {
        if (err) {
          console.log(RED + 'Error A: %s' + RESET, err);
          cb();
        } else switch (data.type) {
          case 'index':
            // do it recursively
            // => push on queue the subdirectories
            //    in some random order
            router.getSubdirs(data.dir, function (err, files) {
              if (err) {
                console.log(RED + 'Error B: %s' + RESET, err);
              } else if (files && files.length) {
                // we push the new entries, in a randomized order
                app.util.shuffle(files);
                // if the limit is really small, we only cover a part of the subdirectories
                var N = Math.ceil(entry.limit / files.length);
                (N === 1 ? files.slice(0, entry.limit) : files).forEach(function (name) {
                  routeStack.push({
                    route: path.join(data.route, name) + '/',
                    limit: N
                  });
                });
              }
              cb();
            });
            break;
          case 'gallery':
            // extract images!
            module.exports.findGalleryImages(data.route, entry.limit, function (err, imgRoutes) {
              if (err) console.log(RED + 'Error C: %s' + RESET, err);
              // we push the images
              if (imgRoutes && imgRoutes.length) images.push.apply(images, imgRoutes);
              cb();
            });
            break;
          default:
            // ...
            cb();
        }
      });
    }, function (err) {
      callback(err, images);
    });
  },
  /**
   * REST GET
   */
  get: function (req, res) {
    var route = req.query.route || '/';
    // send inforation only if we are in an index
    router.parse(route, function (err, data) {
      if (err) {
        console.log(RED + 'Error D: %s' + RESET, err);
        res.json([]);
        return;
      }
      if (data.type != 'index') {
        console.log(RED + 'Warning! Get index of type: %s\n%s' + RESET, data.type, JSON.stringify(data));
        res.json([]);
        return;
      }

      router.getSubdirs(data.dir, function (err, files) {
        if (err) {
          console.log(RED + 'Error E: %s' + RESET, err);
          res.json([]);
        } else {
          // the list of subdirectories
          async.map(files, function (fname, cb) {
            var dirRoute = path.join(data.route, fname) + '/';
            module.exports.findImages(dirRoute,
            Math.ceil(IMAGES_LIMIT / files.length), // XXX weight directories by their absolute content size
            function (err, images) {
              if (err) cb(err);
              else cb(null, {
                name: fname,
                url: app.conf.prefix + dirRoute,
                images: images.map(function (imgRoute) {
                  return app.conf.prefix + imgRoute;
                })
              });
            });
          }, function (err, result) {
            if (err) console.log(RED + 'Error F: %s' + RESET, err);
            res.json(result || []);
          });
        }
      });
    });
  },
  create: function (req, res) {
    var route = req.body.route;
    if(!route) {
      res.send(500, 'Invalid route!');
      return;
    }
    // send inforation only if we are in an index
    router.checkForCreation(route, function (err, data) {
      if (err) {
        console.log(RED + 'Error: %s' + RESET, err);
        res.json({
          result: false,
          error: err
        });
        return;
      }
      console.log(WHITE + 'Data: ' + JSON.stringify(data) + RESET);
      // it's all ok! let's create the index
      fs.mkdir(data.dir, function (err) {
        if (err) {
          console.log(RED + 'Error:' + RESET, err);
          res.json({
            result: false,
            error: err
          });
        } else res.json({
          result: true
        });
      });
    });
  },
  edit: notImplemented,
  clear: notImplemented
};
