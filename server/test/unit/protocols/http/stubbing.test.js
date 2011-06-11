'use strict';

var testCase = require('nodeunit').testCase,
    createRepository = require('repository').create,
    stubs = require('protocols/http/stubbing'),
    mock = require('testExtensions').mock,
    withArgs = require('testExtensions').withArgs;

exports['HTTP Stubbing'] = testCase({
    setUp: function (callback) {
        this.request = {
            method: 'GET',
            url: '/test'
        };
        this.response = {
            writeHead: mock(),
            write: mock(),
            end: mock()
        };
        this.stubber = stubs.create();
        this.addDefaultStub = function (request) {
            if (!request.method) {
                request.method = 'GET';
            }
            this.stubber.addStub({
                path: '/test',
                request: request,
                response: {
                    body: 'STUBBED'
                }
            });
        };

        this.wasStubbed = function () {
            return this.response.write.wasCalledWith('STUBBED');
        };

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
    },

    'should not return stub if request method differs': function (test) {
        this.request.method = 'DELETE';
        this.addDefaultStub({
            method: 'GET'
        });

        this.stubber.middleware(this.request, this.response);

        test.notOk(this.wasStubbed());
        test.done();
    },

    'should return stub if request method same': function (test) {
        this.request.method = 'GET';
        this.addDefaultStub({
            method: 'GET'
        });

        this.stubber.middleware(this.request, this.response);

        test.ok(this.wasStubbed());
        test.done();
    },

    'should not return stub if header not present': function (test) {
        this.request.headers = {
            'Content-type': 'text/plain'
        };
        this.addDefaultStub({
            headers: {
                'Content-type': 'text/plain',
                'X-Test': 'yes'
            }
        });

        this.stubber.middleware(this.request, this.response);

        test.notOk(this.wasStubbed());
        test.done();
    },

    'should not return stub if header does not match': function (test) {
        this.request.headers = {
            'Content-type': 'text/plain',
            'X-Test': 'no'
        };
        this.addDefaultStub({
            headers: {
                'Content-type': 'text/plain',
                'X-Test': 'yes'
            }
        });

        this.stubber.middleware(this.request, this.response);

        test.notOk(this.wasStubbed());
        test.done();
    },

    'should return stub if header name different case': function (test) {
        this.request.headers = {
            'content-type': 'text/plain',
            'x-test': 'yes'
        };
        this.addDefaultStub({
            headers: {
                'Content-type': 'text/plain',
                'X-Test': 'yes'
            }
        });

        this.stubber.middleware(this.request, this.response);

        test.ok(this.wasStubbed());
        test.done();
    },

    'should not return stub if header value different case': function (test) {
        this.request.headers = {
            'content-type': 'text/plain',
            'x-test': 'YES'
        };
        this.addDefaultStub({
            headers: {
                'Content-type': 'text/plain',
                'X-Test': 'yes'
            }
        });

        this.stubber.middleware(this.request, this.response);

        test.notOk(this.wasStubbed());
        test.done();
    },

    'should not return stub if body does not match': function (test) {
        this.request.body = 'body';
        this.addDefaultStub({
            body: 'test'
        });

        this.stubber.middleware(this.request, this.response);

        test.notOk(this.wasStubbed());
        test.done();
    },

    'should return stub if body partially matches': function (test) {
        this.request.body = 'this is a test.';
        this.addDefaultStub({
            body: 'test'
        });

        this.stubber.middleware(this.request, this.response);

        test.ok(this.wasStubbed());
        test.done();
    }
});
