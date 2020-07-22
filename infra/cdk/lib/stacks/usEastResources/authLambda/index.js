exports.handler = (event, context, callback) => {
  checkCredentials(event, context, callback);
};

function checkCredentials(event, context, callback) {
  // Get the request and its headers
  const request = event.Records[0].cf.request;
  const headers = request.headers;

  // Build a Basic Authentication string
  const authString = 'Basic ' + request.origin.custom.customHeaders['x-auth-string'][0].value;

  // Challenge for auth if auth credentials are absent or incorrect
  if (typeof headers.authorization == 'undefined' || headers.authorization[0].value !== authString) {
    const response = {
      status: '401',
      statusDescription: 'Unauthorized',
      body: 'Unauthorized',
      headers: {
        'www-authenticate': [{ key: 'WWW-Authenticate', value: 'Basic' }]
      },
    };
    callback(null, response);
  }

  // User has authenticated
  callback(null, request);

}
