var config = require('../config.json');
var utils = require('./utils.js');

// redis base
var redis = require('redis');
var redisClient = redis.createClient(config.redis.port, config.redis.host);
// XXX select db with config.redis.database?
redisClient.on('error', function(err) {
  console.log(utils.RED + 'Redis client error: ' + utils.RESET, err);
});
redis.debug_mode = false;

// keys map
// var keys = {};
module.exports = utils.extend(redisClient, {

  getStore: function(serv){
    var RedisStore = require('connect-redis')(serv);
    return new RedisStore(utils.extend({
      prefix: utils.prefix + ':sess:' // XXX use some other prefix? session.prefix?
    }, redisConf));
  }

});
