var app = module.parent.exports;
var fs = require('fs');
var md = require('node-markdown').Markdown;
var path = require('path');
var router = require('./router.js');

// colors
var RED = app.util.RED;
var RESET = app.util.RESET;

// WIP
var notImplemented = function (req, res) {
  res.send(500, 'Not yet implemented');
};

// automatic checking of route
var checkedRoute = function (f) {
  return function (req, res) {
    var route = req.query.route;
    if (!route) {
      res.send(500, 'Require route information');
      return;
    }
    router.parse(route, function (err, data) {
      if (err) {
        console.log(RED + 'Error: ' + RESET, err);
        res.send(500, 'Invalid route');
        return;
      }
      f(req, res, data);
    });
  };
};

module.exports = {
  get: checkedRoute(function (req, res, data) {
    switch (data.type) {
      case 'index':
        // XXX implement the index metadata
        // - title
        // - list ordering
        // - message
      case 'gallery':
        // parse metadata.md
        fs.readFile(path.join(data.dir, 'metadata.md'), 'utf8', function (err, content) {
          if (!content) res.json(null);
          else {
            // formatting!
            var html = req.query.format === 'raw' ? content : md(content);
            res.json({
              data: html
            });
          }
        });
        break;
      default:
        res.json(null);
    }
  }),
  create: notImplemented,
  edit: checkedRoute(function (req, res, data) {
    switch (data.type) {
      case 'index':
      case 'gallery':
        var content = req.body.content;
        if (content) {
          fs.writeFile(path.join(data.dir, 'metadata.md'), content, 'utf8', function (err) {
            res.json({
              result: !err,
              message: err || 'ok'
            });
          });
        } else {
          res.json({
            result: false,
            message: 'No data!'
          });
        }
        break;
      default:
        res.json({
          result: false,
          message: 'Unknown route'
        });
    }
  }),
  clear: checkedRoute(function (req, res, data) {
    switch (data.type) {
      case 'index':
      case 'gallery':
        var file = path.join(data.dir, 'metadata.md');
        fs.exists(file, function (exists) {
          if (exists) {
            fs.unlink(file, function (err) {
              if (err) console.log(RED + 'Error deleting file: ' + RESET, err);
              res.json({
                result: !err,
                message: err || 'Done'
              });
            });
          } else res.json({
            result: false,
            message: 'Nothing to delete'
          });
        });
        break;
      default:
        res.send(500, 'I do not understand you...');
    }
  })
};
