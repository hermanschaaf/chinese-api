var oauth = ChromeExOAuth.initBackgroundPage({
  'request_url': 'https://www.google.com/accounts/OAuthGetRequestToken',
  'authorize_url': 'https://www.google.com/accounts/OAuthAuthorizeToken',
  'access_url': 'https://www.google.com/accounts/OAuthGetAccessToken',
  'consumer_key': 'anonymous',
  'consumer_secret': 'anonymous',
  'scope': 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
  'app_name': 'ChineseLevel Reader'
});

function onAuthorized(callback) {
  var url = 'https://www.googleapis.com/oauth2/v2/userinfo';
  var request = {
    'method': 'GET',
    'parameters': {'alt': 'json'}
  };

  // Send GET request to get user info
  oauth.sendSignedRequest(url, callback, request);
};

function authorize(callback){
	oauth.authorize(function(){onAuthorized(callback)});
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action == "authenticate") {
    	authorize(function(resp, xhr){
    		sendResponse(JSON.parse(resp));
    	})
      return true;
    }
    return false;
});