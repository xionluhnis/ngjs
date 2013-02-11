var app = module.parent.exports;
var openid = require('openid');

// colors
var BLUE = app.util.BLUE;
var RED = app.util.RED;
var RESET = app.util.RESET;

// auth openid service
// @see https://github.com/havard/node-openid
// @see https://github.com/bnoguchi/everyauth
var OPENID_URL = 'http://openid.wox-xion.ch';
var rp;

// filters
var editRx = new RegExp('^/edit');
var authRx = new RegExp('^/auth');

// module
module.exports = {
  check: function (req, res, next) {
    // get requests are fine (except for modificaiton)
    if (req.method == 'GET' && !editRx.test(req.path)) next();
    // auth requests are fine too!
    else if(authRx.test(req.path)) next();
    // authenticated requests are fine of course!
    else if(req.session.identity && req.session.authenticated) next();
    else {
      // require authentication for anything else
      res.redirect('/auth');
    }
  },
  auth: function(req, res){
    if(!rp){
      var port = app.get('port').toString();
      var url = req.protocol + '://' + req.host + (port == '80' ? '' : ':' + port) + '/auth/callback';
      rp = new openid.RelyingParty(url, null, false, false, []);
    }
    rp.authenticate(OPENID_URL, false, function(err, authURL){
      if(err) res.send(500, 'Error: ', err);
      else if(!authURL) res.send(500, 'Authentication failed.');
      else res.redirect(authURL);
    });
  },
  callback: function(req, res) {
    if(!rp){
      res.send(500, 'Invalid callback!');
    }else rp.verifyAssertion(req, function(err, result){
      if(err) console.log(RED + 'Auth. Error: ' + RESET, err);
      // did it work?
      if(!result || !result.authenticated) res.send(500, 'Authentication failed...');
      else {
        // it worked!
        console.log(BLUE + 'Auth. Success: ' + RESET, result);
        // we save it in the session
        req.session.authURL = OPENID_URL;
        req.session.identity = result.claimedIdentifier;
        req.session.authenticated = true;
        res.redirect('/');
      }
    });
  }
};
