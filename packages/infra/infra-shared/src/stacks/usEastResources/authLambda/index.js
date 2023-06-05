exports.handler = (event, context, callback) => {
  checkCredentials(event, context, callback);
};

const getAuthString = (request) => {
  const headerName = 'x-auth-string';
  if (request.origin.s3) {
    return 'Basic ' + request.origin.s3.customHeaders[headerName][0].value;
  }
  return 'Basic ' + request.origin.custom.customHeaders[headerName][0].value;
}

function checkCredentials(event, context, callback) {
  console.log(JSON.stringify(event, undefined,2));

  // Get the request and its headers
  const request = event.Records[0].cf.request;
  const headers = request.headers;

  // Build a Basic Authentication string
  const authString = getAuthString(request);

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
