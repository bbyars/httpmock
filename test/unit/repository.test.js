var TestFixture = require('nodeunit').testCase,
    Repository = require('../../lib/repository'),
    unitTest = require('../testExtensions').unitTest;

exports['Repository'] = TestFixture({
    'should return empty array if nothing recorded': unitTest(function (test) {
        var repository = Repository.create();

        var requests = repository.load('path');

        test.jsonEquals(requests, []);
    }),

    'should return request if under correct path': unitTest(function (test) {
        var repository = Repository.create();
        repository.save({path: 'test'});

        var requests = repository.load('test');

        test.jsonEquals(requests, [{path: 'test'}]);
    }),

    'should not return request under different path': unitTest(function (test) {
        var repository = Repository.create();
        repository.save({path: 'not-test'});

        var requests = repository.load('test');

        test.jsonEquals(requests, []);
    }),

    'should return request under subpath': unitTest(function (test) {
        var repository = Repository.create();
        repository.save({path: 'test/sub'});

        var requests = repository.load('test');

        test.jsonEquals(requests, [{path: 'test/sub'}]);
    }),

    'should only match full path part': unitTest(function (test) {
        var repository = Repository.create();
        repository.save({path: 'test2'});
        repository.save({path: 'test'});

        var requests = repository.load('test');

        test.jsonEquals(requests, [{path: 'test'}]);
    }),

    'should compare path case insensitive': unitTest(function (test) {
        var repository = Repository.create();
        repository.save({path: 'test/sub'});

        var requests = repository.load('TEST');

        test.jsonEquals(requests, [{path: 'test/sub'}]);
    }),

    'should handle paths matching prototype members': unitTest(function (test) {
        var repository = Repository.create();
        repository.save({path: 'constructor'});

        var requests = repository.load('constructor');

        test.jsonEquals(requests, [{path: 'constructor'}]);
    })
});

