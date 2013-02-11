// var auth_url = 'http://openid.wox-xion.ch/';
var editRx = new RegExp('^/edit');

// module
module.exports = {
  check: function (req, res, next) {
    // get requests are fine
    if (req.method == 'GET' && !editRx.test(req.path)) next();
    else {
      // require authentication for anything else
      // XXX implement the authentication
      res.send(500, 'Needs authentication');
      // next();
    }
  }
};
