'use strict';

var url = require('url'),
    http = require('http');

var setDefaults = function (options) {
    var result = {
        method: 'GET',
        headers: {
            'Accept': 'application/vnd.httpmock+json',
            'Content-type': 'application/vnd.httpmock+json',
            'Host': url.parse(options.url).host
        },
        body: ''
    };

    Object.keys(options).forEach(function (key) {
        result[key] = options[key];
    });
    return result;
};

var web = {
    getResponse: function (options) {
        var spec = setDefaults(options),
            urlParts = url.parse(spec.url),
            path = urlParts.pathname + (urlParts.search || ''),
            client = http.createClient(urlParts.port, urlParts.hostname),
            request = client.request(spec.method, path, spec.headers);

        request.write(JSON.stringify(spec.body));
        request.end();

        request.on('response', function (response) {
            response.body = '';
            response.setEncoding('utf8');

            response.addListener('data', function (chunk) {
                response.body += chunk;
            });

            response.on('end', function () {
                if (response.headers['content-type'] === 'application/vnd.httpmock+json') {
                    response.parsedBody = JSON.parse(response.body);
                }
                spec.callback(response);
            });
        });
    },

    get: function (url, callback) {
        this.getResponse({url: url, method: 'GET', callback: callback});
    },

    post: function (url, options) {
        options.url = url;
        options.method = 'POST';
        this.getResponse(options);
    },

    del: function (url, callback) {
        this.getResponse({url: url, method: 'DELETE', callback: callback});
    }
};

var api = {
    deleteServerAtPort: function (port, callback) {
        web.del('http://localhost:3000/servers/{0}'.format(port), callback);
    },

    createServerAtPort: function (port, callback) {
        web.post('http://localhost:3000/servers', {
            body: { port: port },
            callback: callback
        });
    }
};

var addCustomAsserts = function (test) {
    test.jsonEquals = function (actual, expected, message) {
        var json = function (obj) {
            return (typeof obj === 'object') ? JSON.stringify(obj) : obj;
        };

        message = message || 'JSON not equal\nExpected:\n{0}\n\nActual:\n{1}'.format(
            json(expected), json(actual)
        );
        test.strictEqual(json(actual), json(expected), message);
    };

    test.notOk = function (actual, message) {
        test.ok(!actual, message);
    };

    test.finish = function (port) {
        api.deleteServerAtPort(port, function () {
            test.done();
        });
    };
};

// Allows async
var verify = function (f) {
    return function (test) {
        addCustomAsserts(test);
        f(test);
    };
};

// No async
var unitTest = function (f) {
    return function (test) {
        addCustomAsserts(test);
        f(test);
        test.done();
    };
};

exports.verify = verify;
exports.unitTest = unitTest;
exports.http = web;
exports.api = api;
