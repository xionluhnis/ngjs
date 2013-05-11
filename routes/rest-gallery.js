var app = module.parent.exports;
var async = require('async');
var fs = require('fs');
var path = require('path');
var router = require('./router.js');

// colors
var RED = app.util.RED;
var RESET = app.util.RESET;

// image filter
var lcImgRx = /^[0-9a-z_\-\.]+\.(jpg|jpeg|tiff|png)$/;

// WIP
var notImplemented = function (req, res) {
  res.send(500, 'Not yet implemented');
};

module.exports = {
  get: function (req, res) {
    var route = req.query.route;
    if (!route) {
      res.send(500, 'No route provided!');
      return;
    }
    router.parse(route, function (err, data) {
      if (err) console.log(RED + 'Error: ' + RESET, err);
      if (!data || data.type !== 'gallery') {
        res.json({}); // no information leak
        return;
      }
      async.auto({
        images: function (cb) {
          // we get the gallery pictures
          fs.readdir(path.join(data.dir, 'images'), function (err, files) {
            if (err) {
              cb(err);
              return;
            }
            var images = files.filter(function (fname) {
              return lcImgRx.test(fname.toLowerCase());
            }).map(function (name) {
              return path.join(route, 'images', name);
            });
            cb(null, images);
          });
        },
        thumbnails: function (cb) {
          // XXX implement thumbnail creation and retrieval
          cb(null, []);
        }
      }, function (err, result) {
        if (err) console.log(RED + 'Error: ' + RESET, err);
        res.json(result);
      });
    });
  },
  init: function (route, callback) {
    router.parse(route, function (err, data) {
      if (err) callback(err);
      else switch (data.type) {
        case 'notfound':
          // we create the directory
          // as well as the required structure
          //  => images directory, thumbs?
          // XXX implement that!
          /* fall-through */
        case 'gallery':
          callback(null, data);
          break;
        default:
          callback(new Error('Invalid action: not a gallery'));
          break;
      }
    });
  },
  create: function (req, res) {
    var route = req.query.route;
    if (!route) {
      res.send(500, 'No route provided!');
      return;
    }
    module.exports.init(route, function (err /*, data */) {
      if (err) {
        console.log(RED + 'Error: ' + RESET, err);
        res.send(500, 'Error!');
      } else res.json({
        result: true
      });
    });
  },
  edit: function (req, res) {
    var route = req.query.route;
    if (!route) {
      res.send(500, 'No route provided!');
      return;
    }
    module.exports.init(route, function (err, data) {
      if (err) {
        console.log(RED + 'Error: ' + RESET, err);
        res.send(500, 'Error!');
      } else {
        // implement the upload transfer
        // - Transfer files
        // - Unzip archives (keep only pictures)
        // - Normalize pictures
        // XXX do it!
      }
    });
  },
  clear: notImplemented
};
