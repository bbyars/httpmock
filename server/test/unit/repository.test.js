'use strict';

var TestFixture = require('nodeunit').testCase,
    unitTest = require('testExtensions').unitTest,
    createRepository = require('repository').create;

exports.Repository = new TestFixture({
    'should return empty array if nothing recorded': unitTest(function (test) {
        var repository = createRepository();
        test.jsonEquals(repository.load('/path'), []);
    }),

    'should return request if under correct path': unitTest(function (test) {
        var repository = createRepository();
        repository.save({path: '/test'});
        test.jsonEquals(repository.load('/test'), [{path: '/test'}]);
    }),

    'should not return request under different path': unitTest(function (test) {
        var repository = createRepository();
        repository.save({path: '/not-test'});
        test.jsonEquals(repository.load('/test'), []);
    }),

    'should return request under subpath': unitTest(function (test) {
        var repository = createRepository();
        repository.save({path: '/test/sub'});
        test.jsonEquals(repository.load('/test'), [{path: '/test/sub'}]);
    }),

    'should only match full path part': unitTest(function (test) {
        var repository = createRepository();
        repository.save({path: '/test2'});
        repository.save({path: '/test'});
        test.jsonEquals(repository.load('/test'), [{path: '/test'}]);
    }),

    'should compare path case insensitive': unitTest(function (test) {
        var repository = createRepository();
        repository.save({path: '/test/sub'});
        test.jsonEquals(repository.load('/TEST'), [{path: '/test/sub'}]);
    }),

    'should handle paths matching prototype members': unitTest(function (test) {
        var repository = createRepository();
        repository.save({path: '/constructor'});
        test.jsonEquals(repository.load('/constructor'), [{path: '/constructor'}]);
    }),

    'should return all if loading /': unitTest(function (test) {
        var repository = createRepository();
        repository.save({path: '/test'});
        test.jsonEquals(repository.load('/'), [{path: '/test'}]);
    })
});

