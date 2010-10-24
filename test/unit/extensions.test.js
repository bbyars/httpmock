require('../../lib/extensions');
var TestFixture = require('nodeunit').testCase,
    verify = require('../testExtensions').verify;

exports['Object'] = TestFixture({
    'ownProperties should be empty for empty object': verify(function(test) {
        test.jsonEquals({expected: [], actual: {}.ownProperties()});
    }),

    'ownProperties should contain only properties defined directly on the object': verify(function(test) {
        var obj = {key: 0};
        test.jsonEquals({expected: ['key'], actual: obj.ownProperties()});
    }),

    'ownProperties should only contained prototype members if they are redefined': verify(function(test) {
        var obj = {constructor: 0};
        test.jsonEquals({expected: ['constructor'], actual: obj.ownProperties()});
    })
});
