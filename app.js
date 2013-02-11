var assets = require('connect-assets');
var express = require('express');
var http = require('http');
var path = require('path');
var redis = require('./lib/redis.js');
var app = module.exports = express();
app.util = require('./lib/utils.js');
var auth = require('./routes/auth.js');

// config
app.configure(function () {
  app.set('port', 3000);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  // console logger
  app.use(express.logger('dev'));
  app.use(express.favicon(path.join(app.util.publicDir, 'images', 'favicon.ico')));
  app.use(express.bodyParser());
  // using cookies and sessions for authentication
  app.use(express.cookieParser());
  app.use(express.session({
    key: 'sessionid',
    secret: app.util.sessionSecret,
    cookie: {
      path: app.util.prefix,
      maxAge: 2 * 24 * 3600 * 1000
    },
    store: redis.getStore(express)
  }));
  app.use(auth.check);
  // to use connect-assets in jade
  app.use(function (req, res, next) {
    res.locals({
      assets: {
        css: assets.css,
        js: assets.js
      }
    });
    next();
  });
  // routing from here
  app.use(app.router);
  // assets reduction
  app.use(app.util.prefix, assets({
    src: app.util.publicPath,
    helperContext: assets,
    buildDir: false,
    servePath: app.util.prefix,
    minifyBuilds: false
  }));
  // public directory
  app.use(app.util.prefix, express['static'](app.util.publicDir));
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

// Routing
var router = require('./routes/router.js');
var rx = function(body){
  return new RegExp('^' + app.util.prefix + body + '$');
};

// - base and auth
app.get(rx('/?'), router.index);

// - index structure
var route_rest_index = require('./routes/rest-index.js');
app.get(app.util.prefix + '/rest/index', route_rest_index.get);
app.post(app.util.prefix + '/rest/index', route_rest_index.create);
app.put(app.util.prefix + '/rest/index', route_rest_index.edit);
app.del(app.util.prefix + '/rest/index', route_rest_index.clear);

// - gallery content and processing
var route_rest_gallery = require('./routes/rest-gallery.js');
app.get(app.util.prefix + '/rest/gallery', route_rest_gallery.get);
app.post(app.util.prefix + '/rest/gallery', route_rest_gallery.create);
app.put(app.util.prefix + '/rest/gallery', route_rest_gallery.edit);
app.del(app.util.prefix + '/rest/gallery', route_rest_gallery.clear);

// - metadata content and processing
var route_rest_meta = require('./routes/rest-metadata.js');
app.get(app.util.prefix + '/rest/metadata', route_rest_meta.get);
app.post(app.util.prefix + '/rest/metadata', route_rest_meta.create);
app.put(app.util.prefix + '/rest/metadata', route_rest_meta.edit);
app.del(app.util.prefix + '/rest/metadata', route_rest_meta.clear);

// - general routing and jade fallback
app.get(rx('(/([0-9a-zA-Z]+[0-9a-zA-Z_\\-\\.]*/)+)'), router.route);
app.get(rx('(/([0-9a-zA-Z]+[0-9a-zA-Z_\\-\\.]*/)*)view.html'), router.route);
app.get(rx('/(.*)\\.html'), router.jade);

// server instance
var server = http.createServer(app);

// let's start listening to clients
server.listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});
