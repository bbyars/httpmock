'use strict';

require('extensions');

var testCase = require('nodeunit').testCase,
    http = require('testExtensions').http,
    api = require('testExtensions').api,
    controlServerURL = require('testExtensions').controlServerURL,
    port = 3001,
    stubUrl = 'http://localhost:' + port;

var stub = function (stub, callback) {
    http.post('{0}/servers/{1}/stubs'.format(controlServerURL, port), {
        body: stub,
        callback: callback
    });
};

exports['Trying to POST /servers/:port/stubs'] = testCase({
    'returns 404 if server not created first': function (test) {
        http.post('{0}/servers/5000/stubs'.format(controlServerURL), {
            body: { path: '/' },
            callback: function (response) {
                test.strictEqual(response.statusCode, 404);
                test.done();
            }
        });
    }
});

exports['POST /servers/:port/stubs'] = testCase({
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

    'sets up stub response': function (test) {
        stub({
            path: '/test',
            response: {
                statusCode: 400,
                headers: { 'Content-Type': 'text/plain' },
                body: 'Testing 1..2..3..'
            }
        }, function (postResponse) {
            test.strictEqual(postResponse.statusCode, 204);

            http.get(stubUrl + '/test', function (response) {
                test.strictEqual(response.statusCode, 400);
                test.strictEqual(response.headers['content-type'], 'text/plain');
                test.strictEqual(response.body, 'Testing 1..2..3..');
                test.done();
            });
        });
    },

    'defaults response options': function (test) {
        stub({ path: '/' }, function () {
            http.get(stubUrl + '/', function (response) {
                test.strictEqual(response.headers.connection, 'close');
                test.strictEqual(response.statusCode, 200);
                test.strictEqual(response.body, '');
                test.done();
            });
        });
    },

    'only stubs if request matches headers': function (test) {
        stub({
            path: '/test',
            request: { headers: { 'Accept': 'application/xml' } },
            response: { statusCode: 400 }
        }, function () {
            http.get(stubUrl + '/test', function (firstResponse) {
                test.strictEqual(firstResponse.statusCode, 200, 'should not have matched request');

                http.getResponse({
                    url: stubUrl + '/test',
                    headers: { 'Accept': 'application/xml' },
                    callback: function (secondResponse) {
                        test.strictEqual(secondResponse.statusCode, 400, 'should have matched request');
                        test.done();
                    }
                });
            });
        });
    },

    'only stubs if request contains body': function (test) {
        stub({
            path: '/stub',
            request: { body : 'TEST' },
            response: { statusCode: 400 }
        }, function () {
            http.post(stubUrl + '/stub', {
                body: 'TE__ST',
                callback: function (firstResponse) {
                    test.strictEqual(firstResponse.statusCode, 200, 'should not have matched request');

                    http.post(stubUrl + '/stub', {
                        body: 'HAS TEST WITHIN',
                        callback: function (secondResponse) {
                            test.strictEqual(secondResponse.statusCode, 400, 'should have matched request');
                            test.done();
                        }
                    });
                }
            });
        });
    },

    'only stubs if request method matches': function (test) {
        stub({
            path: '/stub',
            request: { method: 'GET' },
            response: { statusCode: 400 }
        }, function () {
            http.post(stubUrl + '/stub', {
                callback: function (firstResponse) {
                    test.strictEqual(firstResponse.statusCode, 200, 'should not have matched request');

                    http.get(stubUrl + '/stub', function (secondResponse) {
                        test.strictEqual(secondResponse.statusCode, 400, 'should have matched request');
                        test.done();
                    });
                }
            });
        });
    }
});
