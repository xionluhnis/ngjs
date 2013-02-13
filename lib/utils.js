var crypto = require('crypto');

module.exports = {
  /**
   * Hexadecimal md5 hash
   */
  md5_hex: function (str) {
    var hash = crypto.createHash('md5');
    hash.update(str, 'utf8');
    return hash.digest('hex');
  },
  /**
   * Base 64 md5 hash
   */
  md5_base64: function (str) {
    var hash = crypto.createHash('md5');
    hash.update(str, 'utf8');
    return hash.digest('base64');
  },
  /**
   * Random time-based nonce
   */
  generateNonceString: function () {
    return module.exports.md5_base64('naivie-nonce-value-' + Date.now())
      .replace(/\W/g, '').substring(0, 8);
  },
  /**
   * Extend an object with properties of other objects
   */
  extend: function (obj) {
    if (!obj) obj = {};
    var extObjList = Array.prototype.slice.call(arguments, 1);
    extObjList.forEach(function (extObj) {
      if (extObj) {
        for (var key in extObj) obj[key] = extObj[key];
      }
    });
    return obj;
  },
  /**
   * Fish-Yates shuffle implementation
   *
   * @see http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
   */
  shuffle: function (input, output) {
    if (!output) output = input;
    if (output.length < input.length) {
      output.length = input.length;
    }
    output[0] = input[0];
    for (var i = 1; i < input.length; ++i) {
      var j = Math.floor(Math.random() * (i + 1)); // random() in [0;1[ => j in [0;i]
      var t = input[i];
      output[i] = output[j];
      output[j] = t;
    }
    return output;
  },
  // Colors for terms
  // @see http://en.wikipedia.org/wiki/ANSI_escape_code
  BLACK: '\u001b[30m',
  GRAY: '\u001b[30;1m',
  RED: '\u001b[31m',
  BLUE: '\u001b[34m',
  WHITE: '\u001b[37;1m',
  RESET: '\u001b[0m'
};
