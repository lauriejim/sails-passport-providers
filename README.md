# Passport and providers on sails.js

> Passport is an easy way to access to multiple provider.
The first utility is for login connection, but in other case you may be want just access to provider informations and make what you want.
In this case i create a link between basic user account and providers accounts


### Install the project

```shell
$ git clone git@github.com:hack1337/sails-passport-providers.git
$ npm install
```

### Add your favorite providers

Realy easy to add your favorite provider, in `config/passport.js` you can add your provider settings.
1. Create app on your provider site
2. Install the provider passport node module
3. Create provider strategie
4. Configure the strategie
5. Add the button on the view

You will find an exemple in `config/passport.js`

For all providers informations to configure strategies : [Passport providers](http://passportjs.org/guide/providers/)

Route to use for provider login is `auth/:provider`

### Providers informations full access control

On some exemple about login with provider, we can use provider just for login.
In this case you have full access control on providers informations.

How use it ?

```js
// Auth Controller
// providerLogin Action

providerLogin: function(req, res) {

  // Set provider callback action
  // Value is [controller].[action] in this case i'm in auth controller and providerLogin action
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
    // Make what you want with provider_profile informations
  });
}
```

#### TODO

> - Expand readme
> - Correct my English :)

