'use strict';

require('extensions');

var testCase = require('nodeunit').testCase;

exports.String = testCase({
    'format should do nothing if no placeholders': function (test) {
        test.strictEqual('test'.format('ignore'), 'test');
        test.done();
    },

    'format should replace placeholders': function (test) {
        test.strictEqual('test {0} {1}'.format('one', 'two'), 'test one two');
        test.done();
    },

    'interpolate should return string if no placeholders': function (test) {
        test.strictEqual('test'.interpolate({ key: 'value' }), 'test');
        test.done();
    },

    'interpolate should replace placeholders': function (test) {
        test.strictEqual('{one} {two}'.interpolate({ one: 1, two: 2 }), '1 2');
        test.done();
    },

    'interpolate should not replace placeholders lacking a replacement': function (test) {
        test.strictEqual('{one} {two}'.interpolate({ one: 1 }), '1 {two}');
        test.done();
    }
});

