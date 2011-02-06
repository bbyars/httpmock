require('../../lib/extensions');
var TestFixture = require('nodeunit').testCase,
    unitTest = require('../testExtensions').unitTest;

exports['Object'] = TestFixture({
    'merge should combine sender and receivers properties': unitTest(function (test) {
        test.jsonEquals({first: 1}.merge({second: 2}), {first: 1, second: 2});
    }),

    'merge should overwrite property': unitTest(function (test) {
        test.jsonEquals({key: 'this'}.merge({key: 'other'}), {key: 'other'});
    }),

    'merge should keep own functions': unitTest(function (test) {
        var obj = {
            fn: function () { return 'true'; }
        };
        test.strictEqual({}.merge(obj).fn(), 'true');
    })
});

exports['String'] = TestFixture({
    'format should do nothing if no placeholders': unitTest(function (test) {
        test.strictEqual('test'.format('ignore'), 'test');
    }),

    'format should replace placeholders': unitTest(function (test) {
        test.strictEqual('test {0} {1}'.format('one', 'two'), 'test one two');
    })
});

