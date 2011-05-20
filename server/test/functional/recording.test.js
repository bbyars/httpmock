'use strict';

require('extensions');

var testCase = require('nodeunit').testCase,
    http = require('testExtensions').http,
    api = require('testExtensions').api,
    controlServerURL = require('testExtensions').controlServerURL,
    port = 3001,
    stubUrl = 'http://localhost:' + port;

function getRequests(spec, callback) {
    if (arguments.length === 1) {
        callback = spec;
        spec = {};
    }
    var stubPort = spec.port || port,
        query = spec.query || '';
    http.get('{0}/servers/{1}/requests{2}'.format(controlServerURL, stubPort, query), callback);
}

exports['Trying to GET /servers/:port/requests'] = testCase({
    'returns 404 if server not created': function (test) {
        getRequests({port: 1234}, function (response) {
            test.strictEqual(response.statusCode, 404);
            test.done();
        });
    }
});

exports['GET /servers/:port/requests'] = testCase({
    setUp: function (callback) {
        api.createServerAtPort(port, function () {
            callback();
        });
    },

    tearDown: function (callback) {
        api.deleteServerAtPort(port, function () {
            callback();
        });
    },

    'returns empty array if no requests to given url': function (test) {
        getRequests(function (response) {
            test.jsonEquals(response.body, []);
            test.done();
        });
    },

    'returns requests to server': function (test) {
        http.getResponse({
            method: 'GET',
            url: stubUrl + '/test',
            headers: { 'Accept': 'text/plain' },
            callback: function () {
                getRequests(function (response) {
                    test.jsonEquals(response.body, [{
                        path: '/test',
                        method: 'GET',
                        headers: {
                            accept: 'text/plain',
                            connection: 'close'
                        },
                        body: ''
                    }]);
                    test.done();
                });
            }
        });
    },

    'uses querystring to filter requests sent back': function (test) {
        var result;

        http.get(stubUrl + '/first', function () {
            http.get(stubUrl + '/second', function () {
                http.get(stubUrl + '/second/again', function () {
                    getRequests({query: '?path=/second'}, function (response) {
                        result = response.parsedBody.map(function (item) {
                            return item.path;
                        });
                        test.jsonEquals(result, ['/second', '/second/again']);
                        test.done();
                    });
                });
            });
        });
    },

    'records request body': function (test) {
        http.post(stubUrl + '/', {
            body: { key: 0 },
            callback: function () {
                getRequests(function (response) {
                    test.strictEqual(response.parsedBody[0].body, '{"key":0}');
                    test.done();
                });
            }
        });
    }
});

