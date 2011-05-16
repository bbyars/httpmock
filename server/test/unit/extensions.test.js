'use strict';

require('extensions');

var TestFixture = require('nodeunit').testCase,
    unitTest = require('testExtensions').unitTest;

exports.String = new TestFixture({
    'format should do nothing if no placeholders': unitTest(function (test) {
        test.strictEqual('test'.format('ignore'), 'test');
    }),

    'format should replace placeholders': unitTest(function (test) {
        test.strictEqual('test {0} {1}'.format('one', 'two'), 'test one two');
    })
});

