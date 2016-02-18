Postch = {};

OAuth.registerService('postch', 2, null, function(query) {

  var accessToken = getAccessToken(query);
  var userInfo = getUserInfo(accessToken);


  return {
    serviceData: {
      id: userInfo.sub,
      accessToken: OAuth.sealSecret(accessToken),
      email: userInfo.email || '',
      username: userInfo.preferred_username,
      emails: [userInfo.email]
    },
    options: {profile: {name: userInfo.name}}
  };
});


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
      "https://wedec.post.ch/OAuth/token?", {
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

var getUserInfo = function (accessToken) {
  try {
    return HTTP.get(
      "https://wedec.post.ch/api/userinfo", {
        headers: {"User-Agent": userAgent}, // TODO: do we need to set it? github needs it
        params: {access_token: accessToken}
      }).data;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from Postch. " + err.message),
                   {response: err.response});
  }
};


Postch.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
