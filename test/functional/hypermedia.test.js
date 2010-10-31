var TestFixture = require('nodeunit').testCase,
    functionalTest = require('../testExtensions').functionalTest;

exports['Server'] = TestFixture({
    'should send back json links': functionalTest({
        method: 'GET',
        endpoint: '/',
        headers: {'Accept': 'application/json'},
        body: '',
        callback: function(test, response) {
            var expected = {
                stubs: [
                    {
                        href: "http://localhost:3000/_stubs",
                        rel: "http://localhost:3000/_relations/create"
                    }
                ]
            };
            test.jsonEquals({expected: expected, actual: response.body});
        }
    })
});

