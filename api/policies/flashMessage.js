module.exports = function(req, res, next) {
  req.session.flashMessage = {};
  if(!req.session.message) {
    req.session.flashMessage = {};
    req.session.message = {};
    return next();
  }
  req.session.flashMessage = _.clone(req.session.message);
  req.session.message = {};
  next();
};