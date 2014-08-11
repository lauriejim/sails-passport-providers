/**
 * Realy easy to add a new provider
 *
 * 1. Create app on your provider site
 * 2. Add the new node module
 * 3. Set the strategie
 * 4. Configure the strategie
 * 5. Add the button on the view
 *
 * Route to user "/auth/:provider"
 *
 * You have an exemple for linked in
 * For all other http://passportjs.org/guide/providers/
 */

/**
 * Require node modules
 */

var bcrypt = require('bcrypt-nodejs');

var passport = require('passport');

// Passport providers
var LocalStrategy = require('passport-local').Strategy;
var GitHubStrategy = require('passport-github').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

// $ npm install passport-linkedin --save
// var LinkedInStrategy = require('passport-linkedin').Strategy;

/**
 * Return providers informations
 */
var verifyHandler = function(token, tokenSecret, profile, done) {
  done(null, profile);
};

module.exports = {

  express: {
    customMiddleware: function(app) {

      passport.use(new GitHubStrategy({
          clientID: "19d7d8d531390cea8ab5",
          clientSecret: "65faada2ecbcfd14bfbab6a8613b1993111afdfb",
          callbackURL: "/provider/github"
        },
        verifyHandler
      ));

      passport.use(new FacebookStrategy({
          clientID: "263123383840687",
          clientSecret: "e8a685792b8d2d4e89155a2f037be53f",
          callbackURL: "/provider/facebook"
        },
        verifyHandler
      ));

      passport.use(new TwitterStrategy({
          consumerKey: "0bcwIeF7o4ZJOx8pkL3p5XCts",
          consumerSecret: "A5FYTBZHfZtHACZIPlfbRoG3yNeftVx8n1M7NTpFx1AZjLS8hn",
          callbackURL: "/provider/twitter"
        },
        verifyHandler
      ));

      // passport.use(new LinkedInStrategy({
      //     consumerKey: "77abe27z93ey62",
      //     consumerSecret: "dLGBDGOzNWQum9lR",
      //     callbackURL: "/provider/linkedin"
      //   },
      //   verifyHandler
      // ));

      app.use(passport.initialize());
    }
  }

};
