var TestFixture = require('nodeunit').testCase,
    Repository = require('../../lib/repository'),
    verify = require('../testExtensions').verify;

exports['Repository'] = TestFixture({
    'should return empty array if nothing recorded': verify(function(test) {
        var repository = Repository.create();

        var requests = repository.load('path');

        test.jsonEquals({expected: [], actual: requests});
    }),

    'should return request if under correct path': verify(function(test) {
        var repository = Repository.create();
        repository.save({path: 'test'});

        var requests = repository.load('test');

        test.jsonEquals({expected: [{path: 'test'}], actual: requests});
    }),

    'should not return request under different path': verify(function(test) {
        var repository = Repository.create();
        repository.save({path: 'not-test'});

        var requests = repository.load('test');

        test.jsonEquals({expected: [], actual: requests});
    }),

    'should return request under subpath': verify(function(test) {
        var repository = Repository.create();
        repository.save({path: 'test/sub'});

        var requests = repository.load('test');

        test.jsonEquals({expected: [{path: 'test/sub'}], actual: requests});
    }),

    'should only match full path part': verify(function(test) {
        var repository = Repository.create();
        repository.save({path: 'test2'});
        repository.save({path: 'test'});

        var requests = repository.load('test');

        test.jsonEquals({expected: [{path: 'test'}], actual: requests});
    }),

    'should compare path case insensitive': verify(function(test) {
        var repository = Repository.create();
        repository.save({path: 'test/sub'});

        var requests = repository.load('TEST');

        test.jsonEquals({expected: [{path: 'test/sub'}], actual: requests});
    }),

    'should handle paths matching prototype members': verify(function(test) {
        var repository = Repository.create();
        repository.save({path: 'constructor'});

        var requests = repository.load('constructor');

        test.jsonEquals({expected: [{path: 'constructor'}], actual: requests});
    })
});

