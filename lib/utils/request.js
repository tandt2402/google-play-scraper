
const debug = require('debug')('google-play-scraper');
const requestLib = require('request');
const throttled = require('throttled-request')(requestLib);

// TODO add an optional parse function
const doRequest = (opts, limit) => new Promise(function (resolve, reject) {
  // debug('Making request: %s %j %o', url, headers, requestOptions);

  let req = requestLib
  if (limit) {
    throttled.configure({
      requests: limit,
      milliseconds: 1000
    });
    req = throttled
  }
  req(opts, (error, response, body) => {
    if (error) {
      debug('Request error', error);
      return reject(error);
    }

    if (response.statusCode >= 400) {
      return reject({ response });
    }
    debug('Finished request');
    resolve(body);
  });
});

function request (opts, limit) {
  debug('Making request: %j', opts);
  return doRequest(opts, limit)
    .then(function (response) {
      debug('Request finished');
      return response;
    })
    .catch(function (reason) {
      debug('Request error:', reason.message, reason.response && reason.response.statusCode);

      let message = 'Error requesting Google Play:' + reason.message;
      if (reason.response && reason.response.statusCode === 404) {
        message = 'App not found (404)';
      }
      const err = Error(message);
      err.status = reason.response && reason.response.statusCode;
      throw err;
    });
}

module.exports = request;
