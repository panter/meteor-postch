Postch = {};

// Request Github credentials for the user
// @param options {optional}
// @param credentialRequestCompleteCallback {Function} Callback function to call on
//   completion. Takes one argument, credentialToken on success, or Error on
//   error.
Postch.requestCredential = function (options, credentialRequestCompleteCallback) {
  // support both (options, callback) and (callback).
  if (!credentialRequestCompleteCallback && typeof options === 'function') {
    credentialRequestCompleteCallback = options;
    options = {};
  }

  var config = ServiceConfiguration.configurations.findOne({service: 'postch'});
  if (!config) {
    credentialRequestCompleteCallback && credentialRequestCompleteCallback(
      new ServiceConfiguration.ConfigError());
    return;
  }
  var credentialToken = Random.secret();

  var scope = (options && options.requestPermissions) || ['email', 'openid', 'profile'];
  var flatScope = _.map(scope, encodeURIComponent).join('+');

  var loginStyle = OAuth._loginStyle('postch', config, options);

  var loginUrl =
    'https://wedec.post.ch/OAuth/authorization' +
    '?client_id=' + config.clientId +
    '&scope=' + flatScope +
    '&redirect_uri=' + OAuth._redirectUri('postch', config) +
    '&nonce=test1234' + 
    '&state=' + OAuth._stateParam(loginStyle, credentialToken, options && options.redirectUrl);

  OAuth.launchLogin({
    loginService: "postch",
    loginStyle: loginStyle,
    loginUrl: loginUrl,
    credentialRequestCompleteCallback: credentialRequestCompleteCallback,
    credentialToken: credentialToken,
    popupOptions: {width: 900, height: 450}
  });
};
