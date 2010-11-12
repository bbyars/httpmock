var TestFixture = require('nodeunit').testCase,
    sys = require('sys'),
    tests = require('../testExtensions');

exports['Server'] = TestFixture({
    'root should send back hypermedia for servers': tests.functional({
        method: 'GET',
        endpoint: '/',
        headers: {'Accept': 'application/json'},
        body: '',
        callback: function(test, response) {
            var expected = {
                servers: [],
                links: [
                    {
                        href: "http://localhost:3000/servers",
                        rel: "http://localhost:3000/relations/server"
                    }
                ]
            };
            test.jsonEquals({expected: expected, actual: response.body});
            test.done();
        }
    }),

    'creating a server should open up given port': tests.functional({
        method: 'POST',
        endpoint: '/servers',
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
        },
        body: '{ "port": 3001 }',
        numberOfAsserts: 4,
        callback: function(test, response) {
            test.equals({expected: 201, actual: response.statusCode});
            test.equals({expected: "http://localhost:3000/servers/3001", actual: response.headers.location});
            test.jsonEquals({actual: response.body, expected: {
                links: [
                    {
                        href: "http://localhost:3000/servers/3001/requests",
                        rel: "http://localhost:3000/relations/request"
                    },
                    {
                        href: "http://localhost:3000/server/3001/stubs",
                        rel: "http://localhost:3000/relations/stub"
                    }
                ]
            }});

            tests.getResponse({
                port: 3001,
                method: 'GET',
                endpoint: '/',
                body: '',
                callback: function(stubbedResponse) {
                    console.log("hit stub server");
                    test.equals({expected: 200, actual: stubbedResponse.statusCode});
                    test.done();
                }
            });
        }
    })
});

