'use strict';

var connect = require('connect'),
    merge = connect.utils.merge,
    repositories = require('repository');

// We don't want to use keepalive connections, because a test case
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

function create() {
    var stubs = repositories.create();

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

    return {
        middleware: stubber,
        addStub: function (stub) {
            stubs.save(stub);
        }
    };
}

exports.create = create;
