/**
 * ProviderController
 *
 * @description :: Server-side logic for managing providers
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

/**
 * Require node modules
 */

var passport = require('passport');
var Q = require('q');

module.exports = {

  /**
   * Handle provider callback action
   * To have full access control on what i what to do
   * with provider information i set in session the
   * action to exectute with provider information
   */
  providerCallback: function(req, res) {
    var action = req.session.provider.split('.');
    sails.controllers[action[0]][action[1]](req, res);
  },

  /**
   * Call provider api with middleware configuration
   * @param  {String} provider Name of provider to call
   * @return {Object}          Provider informations
   */
  getProviderProfile: function(req, res, provider) {
    var deferred = Q.defer();
    passport.authenticate(provider, {},
      function (err, profile) {
        if (err) return deferred.reject(err);
        deferred.resolve(profile);
      })(req, res);
    return deferred.promise;
  },

  /**
   * Create a link beetwen user account and a provider account
   */
  createLinkProvider: function(req, res) {
    // Set provider callback action
    var session = {
      key: 'provider',
      value: 'provider.createLinkProvider'
    };
    sails.controllers.tools.setItemSession(req, session);

    // Set provider name
    var provider = req.param('provider');

    // Retrieve provider information
    sails.controllers.provider.getProviderProfile(req, res, provider)
    .then(function (provider_profile) {

      // Set provider filter
      var profile = {
        pid     : provider_profile.id,
        provider: provider_profile.provider,
      };

      // Find provider account
      sails.controllers.provider.findOne(profile)
      .then(next(profile));

      function next(profile) {
        return function (res_profile) {

          // If this account is already linked render error message
          if (res_profile) {
            var message = {type: 'warning', message:'This account is already linked to another account.'};
            sails.controllers.tools.displayFlashMessage(req, message);
            res.redirect('/user/profile');
          // If not linked create the link
          } else {
            // Create the provider information in database
            sails.controllers.provider.create(profile)
            .then(function (res_profile) {

              // Find connected user
              sails.controllers.user.findOne({id: req.session.user.id})
              .then(next(res_profile));

              function next(res_profile) {
                return function (res_user) {

                  // Link provider with user
                  res_user.provider.add(res_profile);
                  res_user.save(function () {

                    //Find new user information
                    sails.controllers.user.findOne({id: res_user.id})
                    .then(function (res_user) {

                      // Update user session informations
                      var session = {
                        key  : 'user',
                        value: res_user
                      };
                      sails.controllers.tools.setItemSession(req, session);
                      res.redirect('/user/profile');
                    });
                  })
                }
              }
            });
          }
        }
      }
    });
  },

  /**
   * Remove a link between user account and provider account
   */
  removeLinkProvider: function(req, res) {
    // Set provider
    var provider = req.param('provider');

    // Fin connected user account
    sails.controllers.user.findOne({id: req.session.user.id})
    .then(function (res_user) {

      // If user account have just one provider and no password
      // Render error message
      if (res_user.provider.length == 1 && (!res_user.email || !res_user.password)) {
        var message = {type: 'warning', message:'You can\'t unlink this provider cause you need email and password.'};
        sails.controllers.tools.displayFlashMessage(req, message);
        res.redirect('/user/profile');
      } else {
        // Remove provider link
        res_user.provider.remove(res_user.providers[provider].id);
        res_user.save(function () {

          // Destroy the provider from database
          sails.controllers.provider.destroy(res_user.providers[provider].id);

          // Find new user informations
          sails.controllers.user.findOne({id: req.session.user.id})
          .then(function (res_user) {

          // Update user session informations
          var session = {
              key  : 'user',
              value: res_user
            };
            sails.controllers.tools.setItemSession(req, session);
            res.redirect('/user/profile');
          });
        });
      }
    });
  },

  /**
   * Create user account from provider
   */
  createAccount: function(req, res, provider_profile) {
    // Set provider profil
    var profile = {
      pid     : provider_profile.id,
      provider: provider_profile.provider,
    };

    // Set user profil
    var user = {
      name: provider_profile.displayName
    };

    // If provider have email, i set the email
    if (provider_profile.emails) {
      profile.email = provider_profile.emails[0].value;
      user.email = provider_profile.emails[0].value;
    }

    // Create user account
    sails.controllers.user.create(user)
    .then(function (res_user) {

      // Create provider account
      sails.controllers.provider.create(profile)
      .then(next(res_user));

      function next(res_user) {
        return function (res_profile) {
          // Link the user account with provider account
          res_user.provider.add(res_profile);
          res_user.save(function () {

            // Find user informations
            sails.controllers.user.findOne({id: res_user.id})
            .then(function (res_user) {

              // Set user information in session
              var session = {
                key  : 'user',
                value: res_user
              };
              sails.controllers.tools.setItemSession(req, session);
              res.redirect('/user/profile');
            });
          })
        }
      }
    });
  },

  /**
   * Provider's CRUD functions
   */

  findOne: function(filtre) {
    var deferred = Q.defer();
    Provider.findOne(filtre)
    .populate('user')
    .exec(function (err, profile) {
      if (err) return deferred.reject(err);
      deferred.resolve(profile);
    });
    return deferred.promise;
  },

  create: function(profile) {
    var deferred = Q.defer();
    Provider.create(profile)
    .populate('user')
    .exec(function (err, profile) {
      if (err) deferred.reject(err);
      deferred.resolve(profile);
    });
    return deferred.promise;
  },

  update: function(id, profile) {
    var deferred = Q.defer();
    Provider.update(id, profile)
    .exec(function (err, profile) {
      if (err) return deferred.reject(err);
      deferred.resolve(profile);
    });
    return deferred.promise;
  },

  destroy: function(id) {
    var deferred = Q.defer();
    Provider.destroy(id)
    .exec(function (err) {
      if (err) return deferred.reject(err);
      deferred.resolve();
    });
    return deferred.promise;
  }

};

