'use strict';

require('extensions');

var connect = require('connect'),
    repositories = require('repository'),
    merge = connect.utils.merge;

// We can't use keepalive connections, because a test case
// may shutdown the stub, which prevents new connections for
// the port, but that won't prevent the system under test
// from reusing an existing TCP connection after the stub
// has shutdown, causing difficult to track down bugs when
// multiple tests are run.
var defaults = {
    statusCode: 200,
    headers: {
        'Connection': 'close'
    },
    body: ''
};

var create = function (port, callback) {
    var requests = repositories.create(),
        stubs = repositories.create(),
        logPrefix = '[{0}]: '.format(port),
        server;

    function recorder(request, response, next) {
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
    }

    function methodMatches(actual, expected) {
        return !expected || actual === expected;
    }

    function allHeadersMatch(actual, expected) {
        return !expected || Object.keys(expected).every(function (header) {
            return expected[header] === actual[header.toLowerCase()];
        });
    }

    function bodyMatches(actual, expected) {
        return !expected || actual.indexOf(expected) >= 0;
    }

    function requestMatches(actual, expected) {
        return methodMatches(actual.method, expected.method) &&
            allHeadersMatch(actual.headers, expected.headers) &&
            bodyMatches(actual.body, expected.body);
    }

    function findFirstMatchingStub(request) {
        var possibleMatches = stubs.load(request.url),
            stub;

        stub = possibleMatches.filter(function (stub) {
            return (!stub.request || requestMatches(request, stub.request));
        })[0];

        if (!stub || !stub.response) {
            return Object.create(defaults);
        }
        return stub.response;
    }

    function stubber(request, response) {
        var defaultStub = Object.create(defaults),
            match = findFirstMatchingStub(request),
            headers = merge(defaultStub.headers, match.headers),
            stub = merge(defaultStub, match);

        response.writeHead(stub.statusCode, headers);
        response.write(stub.body);
        response.end();
    }

    server = connect.createServer(
        connect.logger({format: logPrefix + ':method :url'}),
        recorder,
        stubber);

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
