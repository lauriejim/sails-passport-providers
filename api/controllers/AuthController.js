/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

/**
 * Require node modules
 */

var Q = require('q');
var bcrypt = require('bcrypt-nodejs');

module.exports = {

  /**
   * Display login form
   */
  displayLogin: function(req, res) {
    res.view('auth/login');
  },

  /**
   * Remove user from session
   */
  logout: function(req, res) {
    sails.controllers.tools.removeItemSession(req, 'user');
    res.redirect('/');
  },

  /**
   * Login function with login and password
   * This realy basic login function
   */
  localLogin: function(req, res) {
    // Set user information
    var user = {
      email: req.param('email'),
      password: req.param('password')
    };

    // Find user by email
    sails.controllers.user.findOne({email: user.email})
    .then(function (res_user) {

      // If an user exist with this email
      if (res_user) {
        // Now i compare with encrypted password
        bcrypt.compare(user.password, res_user.password, function testPassword(err, pcw_match) {
          // If password match i set user informations in user session
          if (pcw_match) {
            var session = {
              key  : 'user',
              value: res_user
            };
            sails.controllers.tools.setItemSession(req, session);
            res.redirect('/user/profile');
          // If password not match i render error message
          } else {
            var message = {type: 'warning', message:'Bad password.'};
            sails.controllers.tools.displayFlashMessage(req, message);
            res.redirect('/login');
          }
        });
      // If this email not exist i render error message
      } else {
        var message = {type: 'warning', message:'This email not exist.'};
        sails.controllers.tools.displayFlashMessage(req, message);
        res.redirect('/login');
      }
    });
  },

  /**
   * Provider login function
   */
  providerLogin: function(req, res) {

    // Set provider callback action
    var session = {
      key: 'provider',
      value: 'auth.providerLogin'
    };
    sails.controllers.tools.setItemSession(req, session);

    // Set provider name
    var provider = req.param('provider');

    // Retrieve provider information
    sails.controllers.provider.getProviderProfile(req, res, provider)
    .then(function (provider_profile) {

      // Find provider by provider id and provider name
      sails.controllers.provider.findOne({pid: provider_profile.id.toString(), provider: provider})
      .then(next(provider_profile));

      function next(provider_profile) {
        return function (res_profile) {

          // If provider exist
          if (res_profile) {

            // Find user who link to this provider account
             sails.controllers.user.findOne({id: res_profile.user[0].id})
            .then(function (res_user) {

              // Set user informations in user session
              var session = {
                key  : 'user',
                value: res_user
              };
              sails.controllers.tools.setItemSession(req, session);
              res.redirect('/user/profile');
            });

          // If provider is not exist, i automatically created
          } else {
            sails.controllers.provider.createAccount(req, res, provider_profile);
          }
        }
      }
    });
  }

};
