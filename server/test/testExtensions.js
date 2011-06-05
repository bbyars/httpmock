'use strict';

require('../lib/extensions');

var url = require('url'),
    http = require('http'),
    nodeunitTypes = require('../deps/nodeunit/lib/types'),
    nodeunitTest = nodeunitTypes.test,
    adminPort = process.env.port,
    controlServerURL = 'http://localhost:' + adminPort;

if (!adminPort) {
    throw {
        message: 'You must set the port environment variable to the port the control server is listening on'
    };
}

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
        web.del('{0}/servers/{1}'.format(controlServerURL, port), callback);
    },

    createServerAtPort: function (port, callback) {
        web.post(controlServerURL + '/servers', {
            body: { port: port },
            callback: callback
        });
    }
};

function mock() {
    var wasCalled = false,
        actualArguments = [],
        message = '';

    var stubFunction = function () {
        wasCalled = true;
        actualArguments = Array.prototype.slice.call(arguments);
    };

    var setMessage = function (expected, actual) {
        message = '\nExpected call with ' + expected;
        if (wasCalled) {
            message += '\nActual called with ' + actual;
        }
        else {
            message += '\nNever called';
        }
    };

    stubFunction.wasCalled = function () {
        return wasCalled;
    };

    stubFunction.wasCalledWith = function () {
        var args = Array.prototype.slice.call(arguments),
            expected = JSON.stringify(args),
            actual = JSON.stringify(actualArguments);

        setMessage(expected, actual);
        return wasCalled &&
            JSON.stringify(actualArguments) === JSON.stringify(args);
    };

    stubFunction.message = function () {
        return message;
    };

    return stubFunction;
}

function withArgs() {
    var expected = Array.prototype.slice.call(arguments);
    return function (test, mock) {
        test.ok(mock.wasCalledWith.apply(null, expected), mock.message());
    };
}

var addCustomAsserts = function (test) {
    test.jsonEquals = function (actual, expected, message) {
        var json = function (obj) {
            return (typeof obj === 'object') ? JSON.stringify(obj) : obj;
        };

        message = message || 'JSON not equal\nExpected:\n{0}\n\nActual:\n{1}'.format(
            json(expected), json(actual));
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

    test.wasCalled = function (mock) {
        if (arguments.length === 1) {
            test.ok(mock.wasCalled(), 'Expected mock call, none received.');
        }
        else {
            // assume withArgs result
            arguments[1](test, mock);
        }
    };
};

nodeunitTypes.test = function () {
    var test = nodeunitTest.apply(this, arguments);
    addCustomAsserts(test);
    return test;
};

exports.http = web;
exports.api = api;
exports.controlServerURL = controlServerURL;
exports.adminPort = adminPort;
exports.mock = mock;
exports.withArgs = withArgs;
