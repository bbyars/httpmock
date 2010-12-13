var TestFixture = require('nodeunit').testCase,
    verify = require('../testExtensions').verify,
    repository = require('../../lib/repository');

exports['Repository'] = TestFixture({
    setUp: function (callback) {
        repository.clear(callback);
    },

    'should return empty array if nothing recorded': verify(function (test) {
        repository.load('path', function (requests) {
            test.jsonEquals(requests, []);
            test.done();
        });
    }),

    'should return request if under correct path': verify(function (test) {
        repository.save({path: 'test'}, function () {
            repository.load('test', function (requests) {
                test.jsonEquals(requests, [{path: 'test'}]);
                test.done();
            });
        });
    }),

    'should not return request under different path': verify(function (test) {
        repository.save({path: 'not-test'}, function () {
            repository.load('test', function (requests) {
                test.jsonEquals(requests, []);
                test.done();
            });
        });
    }),

    'should return request under subpath': verify(function (test) {
        repository.save({path: 'test/sub'}, function () {
            repository.load('test', function (requests) {
                test.jsonEquals(requests, [{path: 'test/sub'}]);
                test.done();
            });
        });
    }),

    'should only match full path part': verify(function (test) {
        repository.save({path: 'test2'}, function () {
            repository.save({path: 'test'}, function () {
                repository.load('test', function (requests) {
                    test.jsonEquals(requests, [{path: 'test'}]);
                    test.done();
                });
            });
        });
    }),

    'should compare path case insensitive': verify(function (test) {
        repository.save({path: 'test/sub'}, function () {
            repository.load('TEST', function (requests) {
                test.jsonEquals(requests, [{path: 'test/sub'}]);
                test.done();
            });
        });
    }),

    'should handle paths matching prototype members': verify(function (test) {
        repository.save({path: 'constructor'}, function () {
            repository.load('constructor', function (requests) {
                test.jsonEquals(requests, [{path: 'constructor'}]);
                test.done();
            });
        });
    })
});

