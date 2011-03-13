'use strict';

require('extensions');

var connect = require('connect'),
    repositories = require('repository');

var defaults = {
    response: {
        statusCode: 200,
        headers: {
            // We can't use persistent connections, because a test case
            // may shutdown the stub, which prevents new connections for
            // the port, but that won't prevent the system under test
            // from reusing an existing TCP connection after the stub
            // has shutdown, causing difficult to track down bugs when
            // multiple tests are run.
            'Connection': 'close'
        },
        body: ''
    }
};

var create = function (port, callback) {
    var requests = repositories.create(),
        stubs = repositories.create(),
        logPrefix = '[{0}]: '.format(port);

    var recorder = function (request, response, next) {
        request.body = '';
        request.setEncoding('utf8');

        request.on('data', function (chunk) {
            request.body += chunk;
        });

        request.on('end', function () {
            requests.save({
                path: request.url,
                method: request.method,
                headers: request.headers,
                body: request.body
            });
            next();
        });
    };

    var findFirstMatchingStub = function (request) {
        var possibleMatches = stubs.load(request.url);

        return possibleMatches.filter(function (stub) {
            return (!stub.request || requestMatches(request, stub.request));
        })[0] || defaults;
    };

    var requestMatches = function (actual, expected) {
        return methodMatches(actual.method, expected.method)
            && allHeadersMatch(actual.headers, expected.headers)
            && bodyMatches(actual.body, expected.body);
    };

    var methodMatches = function (actual, expected) {
        return !expected || actual === expected;
    };

    var allHeadersMatch = function (actual, expected) {
        return !expected || Object.keys(expected).every(function (header) {
            return expected[header] === actual[header.toLowerCase()];
        });
    };

    var bodyMatches = function (actual, expected) {
        return !expected || actual.indexOf(expected) >= 0;
    };

    var stubber = function (request, response, next) {
        var stub = Object.create(defaults).merge(findFirstMatchingStub(request)).response;

        response.writeHead(stub.statusCode, stub.headers);
        response.write(stub.body || '');
        response.end();
        next();
    };

    var server = connect.createServer(
        connect.logger({format: logPrefix + ':method :url'}),
        recorder,
        stubber
    );

    server.on('close', function () {
        console.log(logPrefix + 'Ciao...');
    });

    server.listen(port, function () {
        console.log(logPrefix + 'Open for business...');

        callback({
            close: function (callback) {
                server.on('close', callback);
                server.close();
            },

            loadRequests: function (path) {
                return requests.load(path || '/');
            },

            addStub: function (stub) {
                stubs.save(stub);
            }
        });
    });
};

exports.create = create;