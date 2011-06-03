'use strict';

require('testExtensions');

var testCase = require('nodeunit').testCase,
    createRepository = require('repository').create,
    stubs = require('protocols/http/stubbing');

function mock() {
    var wasCalled = false,
        actualArguments = [];

    var stubFunction = function () {
        wasCalled = true;
        actualArguments = Array.prototype.slice.call(arguments);
    };

    stubFunction.wasCalled = function () {
        return wasCalled;
    };

    stubFunction.wasCalledWith = function () {
        var args = Array.prototype.slice.call(arguments);

        return wasCalled &&
            JSON.stringify(actualArguments) === JSON.stringify(args);
    };

    return stubFunction;
}

exports['HTTP Stubbing'] = testCase({
    setUp: function (callback) {
        this.request = {};
        this.response = {
            writeHead: mock(),
            write: mock(),
            end: mock()
        };
        callback();
    },

    'should have reasonable defaults': function (test) {
        var stubber = stubs.create();

        stubber.middleware(this.request, this.response);

        test.ok(this.response.writeHead.wasCalledWith(200, { 'Connection': 'close' }));
        test.ok(this.response.write.wasCalledWith(''));
        test.ok(this.response.end.wasCalled());
        test.done();
    }
});
