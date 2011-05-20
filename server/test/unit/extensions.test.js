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
    }
});

