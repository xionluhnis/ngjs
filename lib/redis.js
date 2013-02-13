var conf = require('../config.js');
var utils = require('./utils.js');

// redis base
var redis = require('redis');
var redisClient = redis.createClient(conf.redis.port, conf.redis.host);
// XXX select db with conf.redis.database?
redisClient.on('error', function(err) {
  console.log(utils.RED + 'Redis client error: ' + utils.RESET, err);
});
redis.debug_mode = false;

// keys map
// var keys = {};
module.exports = utils.extend(redisClient, {

  getStore: function(serv){
    var RedisStore = require('connect-redis')(serv);
    return new RedisStore(utils.extend(conf.session, conf.redis));
  }

});
