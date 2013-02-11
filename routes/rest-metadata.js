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

module.exports = {
  get: function (req, res) {
    var route = req.query.route;
    if (!route) {
      res.send(500, 'Require route information!');
      return;
    }
    router.parse(route, function (err, data) {
      if (err) {
        console.log(RED + 'Error: ' + RESET, err);
        res.json(null);
        return;
      }
      switch (data.type) {
        case 'index':
          // XXX implement the index metadata
          // - title
          // - list ordering
          // - message
          res.json(null);
          break;
        case 'gallery':
          // parse metadata.md
          fs.readFile(path.join(data.dir, 'metadata.md'), 'utf8', function (err, content) {
            if (!content) res.json(null);
            else {
              // formatting!
              var html = md(content);
              res.json({
                data: html
              });
            }
          });
          break;
        default:
          res.json(null);
      }
    });
  },
  create: notImplemented,
  edit: notImplemented,
  clear: notImplemented
};
