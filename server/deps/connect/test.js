
/**
 * Module dependencies.
 */

var connect = require('./');

connect(
  function(req, res, next){
    var options = {
      path: process.env.HOME + '/downloads/vid.avi',
      callback: function(err){
        if (err) {
          console.log('ERROR');
          throw err;
        } else {
          console.log('done');
        }
      }
    };
    connect.static.send(req, res, next, options);
  }
).listen(3000);