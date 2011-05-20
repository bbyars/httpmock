'use strict';

require('../testExtensions');

var testCase = require('nodeunit').testCase,
    createRepository = require('repository').create;

exports.Repository = testCase({
    'should return empty array if nothing recorded': function (test) {
        var repository = createRepository();
        test.jsonEquals(repository.load('/path'), []);
        test.done();
    },

    'should return request if under correct path': function (test) {
        var repository = createRepository();
        repository.save({path: '/test'});
        test.jsonEquals(repository.load('/test'), [{path: '/test'}]);
        test.done();
    },

    'should not return request under different path': function (test) {
        var repository = createRepository();
        repository.save({path: '/not-test'});
        test.jsonEquals(repository.load('/test'), []);
        test.done();
    },

    'should return request under subpath': function (test) {
        var repository = createRepository();
        repository.save({path: '/test/sub'});
        test.jsonEquals(repository.load('/test'), [{path: '/test/sub'}]);
        test.done();
    },

    'should only match full path part': function (test) {
        var repository = createRepository();
        repository.save({path: '/test2'});
        repository.save({path: '/test'});
        test.jsonEquals(repository.load('/test'), [{path: '/test'}]);
        test.done();
    },

    'should compare path case insensitive': function (test) {
        var repository = createRepository();
        repository.save({path: '/test/sub'});
        test.jsonEquals(repository.load('/TEST'), [{path: '/test/sub'}]);
        test.done();
    },

    'should handle paths matching prototype members': function (test) {
        var repository = createRepository();
        repository.save({path: '/constructor'});
        test.jsonEquals(repository.load('/constructor'), [{path: '/constructor'}]);
        test.done();
    },

    'should return all if loading /': function (test) {
        var repository = createRepository();
        repository.save({path: '/test'});
        test.jsonEquals(repository.load('/'), [{path: '/test'}]);
        test.done();
    }
});
