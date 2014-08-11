
/**
* Users.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

/**
 * Require node modules
 */

var bcrypt = require('bcrypt-nodejs');

module.exports = {

  schema: true,

  attributes: {

    name: {
      type: 'STRING'
    },

    email: {
      type: 'STRING'
    },

    password: {
      type: 'STRING'
    },

    // Connection with provider accounts
    provider: {
      collection: 'provider',
      via: 'user',
      dominant: true
    }

  },

  /**
   * Crypt password before database insert
   * @param  {Object}   user User infos
   * @param  {Function} cb   callback function
   */
  beforeCreate: function(user, cb) {
    if (user.password) {
      bcrypt.hash(user.password, null, null, function(err, hash) {
        if (err) {
          cb(err);
        }else{
          user.password = hash;
          cb();
        }
      });
    } else {
      cb();
    }
  }
};

