require('../../lib/extensions');
var TestFixture = require('nodeunit').testCase,
    tests = require('../testExtensions');

exports['Object'] = TestFixture({
    'ownProperties should be empty for empty object': tests.unit(function(test) {
        test.jsonEquals({expected: [], actual: {}.ownProperties()});
    }),

    'ownProperties should contain only properties defined directly on the object': tests.unit(function(test) {
        var obj = {key: 0};
        test.jsonEquals({expected: ['key'], actual: obj.ownProperties()});
    }),

    'ownProperties should only contained prototype members if they are redefined': tests.unit(function(test) {
        var obj = {constructor: 0};
        test.jsonEquals({expected: ['constructor'], actual: obj.ownProperties()});
    }),

    'ownProperties should exclude functions': tests.unit(function(test) {
        var obj = {
            key: 0,
            fn: function() {}
        };
        test.jsonEquals({expected: ['key'], actual: obj.ownProperties()});
    })
});

exports['Array'] = TestFixture({
    'flatten should return empty array if provided an empty array': tests.unit(function(test) {
        test.jsonEquals({expected: [], actual: [].flatten()});
    }),

    'flatten should return array if no sub-arrays': tests.unit(function(test) {
        test.jsonEquals({expected: [1, 'two', 3], actual: [1, 'two', 3].flatten()});
    }),

    'flatten should flatten sub-arrays': tests.unit(function(test) {
        var original = [1, [2, 3], [4, 5, 6]];
        test.jsonEquals({expected: [1, 2, 3, 4, 5, 6], actual: original.flatten()});
    })
});
