/**
 * ToolsController
 *
 * @description :: Server-side logic for managing tools
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

/**
 * Require node modules
 */

var Q = require('q');

module.exports = {

  /**
   * Render flash message
   * @param  {Object} flash Contain message type and text
   */
  displayFlashMessage: function(req, flash) {
    if (!req.session.message[flash.type])
      req.session.message[flash.type] = new Array();

    req.session.message[flash.type].push(flash.message);
  },

  /**
   * Set information in session
   * @param {Object} item Contain item key and value
   */
  setItemSession: function(req, item) {
    req.session[item.key] = item.value;
  },

  /**
   * Remove information from session
   * @param {String} key Key to remove
   */
  removeItemSession: function (req, key) {
    delete req.session[key];
  }

};
