require('../../lib/extensions');
var TestFixture = require('nodeunit').testCase,
    unitTest = require('../testExtensions').unitTest;

exports['Object'] = TestFixture({
    'ownProperties should be empty for empty object': unitTest(function (test) {
        test.jsonEquals({}.ownProperties(), []);
    }),

    'ownProperties should contain only properties defined directly on the object': unitTest(function (test) {
        test.jsonEquals({key: 0}.ownProperties(), ['key']);
    }),

    'ownProperties should only contained prototype members if they are redefined': unitTest(function (test) {
        test.jsonEquals({constructor: 0}.ownProperties(), ['constructor']);
    }),

    'ownProperties should exclude functions': unitTest(function (test) {
        var obj = {
            key: 0,
            fn: function () {}
        };
        test.jsonEquals(obj.ownProperties(), ['key']);
    }),

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

exports['Array'] = TestFixture({
    'flatten should return empty array if provided an empty array': unitTest(function (test) {
        test.jsonEquals([].flatten(), []);
    }),

    'flatten should return array if no sub-arrays': unitTest(function (test) {
        test.jsonEquals([1, 'two', 3].flatten(), [1, 'two', 3]);
    }),

    'flatten should flatten sub-arrays': unitTest(function (test) {
        var original = [1, [2, 3], [4, 5, 6]];
        test.jsonEquals(original.flatten(), [1, 2, 3, 4, 5, 6]);
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

