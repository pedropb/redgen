var request = require('sync-request');

var req = function(method, serverUrl, apiKey, path, options) {
    serverUrl = serverUrl || nconf.get('serverUrl');
    apiKey = apiKey || nconf.get('apiKey');

    var url = serverUrl + path;
    options.headers = { 'X-Redmine-API-Key': apiKey };
    return request(method, url, options);
}

var get = function(path, serverUrl, apiKey) {
    return req('GET', serverUrl, apiKey, path, {});
}

var put = function(path, body) {
    return req('PUT', null, null, path, { 'json': body });
}

var post = function(path, body) {
    return req('POST', null, null, path, { 'json': body });
}