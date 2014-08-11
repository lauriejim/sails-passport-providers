/**
* Providers.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  schema: true,

  attributes: {

    provider: {
      type: 'STRING'
    },

    pid: {
      type: 'STRING'
    },

    // Connection with user account
    user: {
      collection: 'user',
      via: 'provider'
    }

  }
};

