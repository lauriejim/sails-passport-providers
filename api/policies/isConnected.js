module.exports = function(req, res, next) {
  if (!req.session.user) {
    var message = {type: 'warning', message:'You must be connected'};
    sails.controllers.tools.displayFlashMessage(req, message);
    return res.redirect('/');
  }
  next();
};