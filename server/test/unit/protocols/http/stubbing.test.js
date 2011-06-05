'use strict';

var testCase = require('nodeunit').testCase,
    createRepository = require('repository').create,
    stubs = require('protocols/http/stubbing'),
    mock = require('testExtensions').mock,
    withArgs = require('testExtensions').withArgs;

exports['HTTP Stubbing'] = testCase({
    setUp: function (callback) {
        this.request = {};
        this.response = {
            writeHead: mock(),
            write: mock(),
            end: mock()
        };
        this.stubber = stubs.create();
        callback();
    },

    'should have reasonable defaults': function (test) {
        this.stubber.middleware(this.request, this.response);

        test.wasCalled(this.response.writeHead, withArgs(200, { 'Connection': 'close' }));
        test.wasCalled(this.response.write, withArgs(''));
        test.wasCalled(this.response.end);
        test.done();
    },

    'should return stub if path matches': function (test) {
        this.request.url = '/test';
        this.stubber.addStub({
            path: '/test',
            response: {
                statusCode: 400,
                headers: { 'Content-Type': 'text/plain' },
                body: 'Testing 1..2..3..'
            }
        });

        this.stubber.middleware(this.request, this.response);

        test.wasCalled(this.response.writeHead, withArgs(400, {
            'Connection': 'close',
            'Content-Type': 'text/plain'
        }));
        test.wasCalled(this.response.write, withArgs('Testing 1..2..3..'));
        test.done();
    },

    'should not return stub if path does not match': function (test) {
        this.request.url = '/different';
        this.stubber.addStub({
            path: '/test',
            response: { body: 'Testing 1..2..3..' }
        });

        this.stubber.middleware(this.request, this.response);

        test.wasCalled(this.response.write, withArgs(''));
        test.done();
    }
});
