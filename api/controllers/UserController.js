/**
 * UsersController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

//----------
// Node modules
//----------

var Q = require('q');
var _ = require('underscore');
var bcrypt = require('bcrypt-nodejs');

module.exports = {

  /**
   * Display profil page
   */
  displayProfile: function(req, res) {
    res.view('users/single', {
      user: req.session.user
    });
  },

  /**
   * Display register form
   */
  displayRegister: function(req, res) {
    res.view('users/register');
  },

  /**
   * Create user account
   */
  createUserAccount: function(req, res) {
    // Set user informations
    var user = {
      name: req.param('name'),
      email: req.param('email'),
      password: req.param('password')
    }

    // Test email format
    var isEmail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var valideEmail = isEmail.test(user.email);

    // If is not email render error message
    if (!valideEmail || !user.name) {
      var message = {type: 'warning', message:'Register formulaire is invalid, be sure all fiel are complete.'};
      sails.controllers.tools.displayFlashMessage(req, message);
      return res.redirect('/register');
    }

    // Find user by email
    sails.controllers.user.findOne({email: user.email})
    .then(function (get_user) {

      // If user exist render error message
      if (get_user) {
        var message = {type: 'warning', message:'This email alreay exist.'};
        sails.controllers.tools.displayFlashMessage(req, message);
        res.redirect('/register');
      // If not exist create account
      } else {
        sails.controllers.user.create(user)
        .then(function (new_user) {

          // Render success message
          var message = {type: 'success', message:'Your new account is created.'};
          sails.controllers.tools.displayFlashMessage(req, message)
          res.redirect('/login');
        });
      }
    })
  },

  /**
   * Update user account
   */
  updateUserAccount: function(req, res) {
    // Set user information
    var user = {
      name: req.param('name'),
      email: req.param('email')
    };

    // If password change i crypt it
    if (req.param('password')) {
      bcrypt.hash(req.param('password'), null, null, function(err, hash) {
        user.password = hash;
      });
    }

    // Test email format
    var isEmail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var valideEmail = isEmail.test(user.email);

    // If is not email render error message
    if (!valideEmail || !user.name) {
      var message = {type: 'warning', message:'Update profile formulaire is invalide, be sure all fiel are complete.'};
      sails.controllers.tools.displayFlashMessage(req, message);
      return res.redirect('/user/profile');
    }

    // Find user by email
    sails.controllers.user.findOne({email: user.email})
    .then(function (res_user) {

      // Test if email already used
      if (res_user && res_user.id !== req.session.user.id) {
        var message = {type: 'warning', message:'This email is already used.'};
        sails.controllers.tools.displayFlashMessage(req, message);
        return res.redirect('/user/profile');
      }

      // Update user informations
      sails.controllers.user.update(req.session.user["id"], user)
      .then(function (new_user) {

        // Find connected user information
        sails.controllers.user.findOne({id: req.session.user["id"]})
        .then(function (res_user) {

          // Update user session informations
          var session = {
            key: 'user',
            value: res_user
          };

          // Set success message
          var message = {type: 'success', message:'Your profile is updated.'};
          sails.controllers.tools.displayFlashMessage(req, message);
          sails.controllers.tools.setItemSession(req, session);
          res.redirect('/user/profile');
        });
      });
    });
  },

  /**
   * Destroy user account
   */
  destroyUserAccount: function(req, res) {
    // Find connected user information
    sails.controllers.user.findOne({id: req.session.user["id"]})
    .then(function (res_user) {

      // Destroy all linked provider
      for (var i = 0, length = res_user.provider.length; i < length; i++) {
        sails.controllers.provider.destroy(res_user.provider[i].id);
      };

      // Destroy user
      sails.controllers.user.destroy(req.param('user_id'))
      .then(function () {

        // Render success message
        var message = {type: 'warning', message:'Your account id destroy'};
        sails.controllers.tools.displayFlashMessage(req, message);
        sails.controllers.auth.logout(req, res);
      });
    })
  },

  /**
   * User's CRUD functions
   */

  findOne: function(filtre) {
    var deferred = Q.defer();
    User.findOne(filtre)
    .populate('provider')
    .exec(function (err, user) {
      if (err) return deferred.reject(err);
      if (!user) return deferred.resolve(user);
      var provider = {};
      for (var i = 0, length = user.provider.length; i < length; i++) {
        provider[user.provider[i].provider] = _.clone(user.provider[i]);
      }
      user.providers = provider;
      deferred.resolve(user);
    });
    return deferred.promise;
  },

  create: function(user) {
    var deferred = Q.defer();
    User.create(user)
    .exec(function (err, user) {
      if (err) deferred.reject(err);
      deferred.resolve(user);
    });
    return deferred.promise;
  },

  update: function(id, user) {
    var deferred = Q.defer();
    User.update(id, user)
    .exec(function (err, user) {
      if (err) return deferred.reject(err);
      deferred.resolve(user);
    });
    return deferred.promise;
  },

  destroy: function(id) {
    var deferred = Q.defer();
    User.destroy(id)
    .exec(function (err) {
      if (err) return deferred.reject(err);
      deferred.resolve();
    });
    return deferred.promise;
  }

};
