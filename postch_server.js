Postch = {};

OAuth.registerService('postch', 2, null, function(query) {

  var accessToken = getAccessToken(query);
  var identity = getIdentity(accessToken);
  var emails = getEmails(accessToken);
  var primaryEmail = _.findWhere(emails, {primary: true});

  return {
    serviceData: {
      id: identity.id,
      accessToken: OAuth.sealSecret(accessToken),
      email: identity.email || (primaryEmail && primaryEmail.email) || '',
      username: identity.login,
      emails: emails
    },
    options: {profile: {name: identity.name}}
  };
});

// http://developer.postch.com/v3/#user-agent-required
var userAgent = "Meteor";
if (Meteor.release)
  userAgent += "/" + Meteor.release;

var getAccessToken = function (query) {
  var config = ServiceConfiguration.configurations.findOne({service: 'postch'});
  if (!config)
    throw new ServiceConfiguration.ConfigError();

  var response;
  try {
    response = HTTP.post(
      "https://postch.com/login/oauth/access_token", {
        headers: {
          Accept: 'application/json',
          "User-Agent": userAgent
        },
        params: {
          code: query.code,
          client_id: config.clientId,
          client_secret: OAuth.openSecret(config.secret),
          redirect_uri: OAuth._redirectUri('postch', config),
          state: query.state
        }
      });
  } catch (err) {
    throw _.extend(new Error("Failed to complete OAuth handshake with Postch. " + err.message),
                   {response: err.response});
  }
  if (response.data.error) { // if the http response was a json object with an error attribute
    throw new Error("Failed to complete OAuth handshake with Postch. " + response.data.error);
  } else {
    return response.data.access_token;
  }
};

var getIdentity = function (accessToken) {
  try {
    return HTTP.get(
      "https://api.postch.com/user", {
        headers: {"User-Agent": userAgent}, // http://developer.postch.com/v3/#user-agent-required
        params: {access_token: accessToken}
      }).data;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from Postch. " + err.message),
                   {response: err.response});
  }
};

var getEmails = function (accessToken) {
  try {
    return HTTP.get(
      "https://api.postch.com/user/emails", {
        headers: {"User-Agent": userAgent}, // http://developer.postch.com/v3/#user-agent-required
        params: {access_token: accessToken}
      }).data;
  } catch (err) {
    return [];
  }
};

Postch.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
