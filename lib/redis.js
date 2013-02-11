var utils = require('./utils.js');

// redis base
var redis = require('redis');
var redisConf = {
  host: '127.0.0.1',
  port: 6379
};
var redisClient = redis.createClient(redisConf.port, redisConf.host);
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
      prefix: utils.prefix + ':sess:'
    }, redisConf));
  }

});
