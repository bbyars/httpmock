var TestFixture = require('nodeunit').testCase,
    sys = require('sys'),
    tests = require('../testExtensions');

exports['Server'] = TestFixture({
    'should send back json links': tests.functional({
        method: 'GET',
        endpoint: '/',
        headers: {'Accept': 'application/json'},
        body: '',
        callback: function(test, response) {
            var expected = {
                servers: [],
                link: {
                    href: "http://localhost:3000/servers",
                    rel: "http://localhost:3000/relations/create"
                }
            };
            test.jsonEquals({expected: expected, actual: response.body});
            test.done();
        }
    }),

    'should allow stubbing based on url': tests.functional({
        method: 'POST',
        endpoint: '/_stubs',
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
        },
        body: {
            request: {
                url: 'http://localhost:3000/test'
            },
            response: {
                headers: {
                    'Content-type': 'text/plain'
                },
                body: 'Hello, World!'
            }
        },
        numberOfAsserts: 2,
        callback: function(test, response) {
            console.log("Got here...");
            tests.getResponse({
                method: 'GET',
                endpoint: '/test',
                callback: function(stubResponse) {
           // NOT GETTING HERE
                    console.log('in second callback');
                    test.strictEquals(stubResponse.headers['Content-type'], 'text/plain');
                    test.strictEquals(stubResponse.body, 'Hello, World!');
                    test.done();
                }
            });
        }
    })
});

