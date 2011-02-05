require('../../lib/extensions');

var TestFixture = require('nodeunit').testCase,
    exec  = require('child_process').exec,
    extensions = require('../testExtensions'),
    http = extensions.http,
    api = extensions.api,
    verify = extensions.verify;

exports['Server'] = TestFixture({
    'GET / returns base hypermedia': verify(function (test) {
        http.get('http://localhost:3000/', function (response) {
            test.strictEqual(response.headers['content-type'], 'application/vnd.httpmock+json');
            test.jsonEquals(response.body, {
                links: [{
                    href: 'http://localhost:3000/servers',
                    rel: 'http://localhost:3000/relations/servers'
                }]
            });
            test.done();
        });
    }),

    'POST /servers creates server at given port': verify(function (test) {
        http.post('http://localhost:3000/servers', {
            body: { port: 3001 },
            callback: function (response) {
                test.strictEqual(response.statusCode, 201);
                test.strictEqual(response.headers.location, 'http://localhost:3000/servers/3001');
                test.jsonEquals(response.body, {
                    url: 'http://localhost:3001/',
                    port: 3001,
                    links: [
                        {
                            href: 'http://localhost:3000/servers/3001',
                            rel: 'http://localhost:3000/relations/server'
                        },
                        {
                            href: 'http://localhost:3000/servers/3001/requests',
                            rel: 'http://localhost:3000/relations/request'
                        },
                        {
                            href: 'http://localhost:3000/server/3001/stubs',
                            rel: 'http://localhost:3000/relations/stub'
                        }
                    ]
                });

                http.get('http://localhost:3001/', function (stubbedResponse) {
                    test.strictEqual(stubbedResponse.statusCode, 200);
                    test.finish(3001);
                });
            }
        });
    }),

    'POST /servers returns 409 if port already in use': verify(function (test) {
        api.createServerAtPort(3000, function (response) {
            test.strictEqual(response.statusCode, 409);
            test.done();
        });
    }),

    'POST /servers returns 400 if port missing': verify(function (test) {
        http.post('http://localhost:3000/servers', {
            body: { },
            callback: function (response) {
                test.strictEqual(response.statusCode, 400);
                test.jsonEquals(response.body, {
                    message: 'port is a required field'
                });
                test.done();
            }
        });
    }),

    'POST /servers returns 400 if port is not a number': verify(function (test) {
        http.post('http://localhost:3000/servers', {
            body: { port: 'test' },
            callback: function (response) {
                test.strictEqual(response.statusCode, 400);
                test.jsonEquals(response.body, {
                    message: 'port must be a valid integer between 1 and 65535'
                });
                test.done();
            }
        });
    }),

    'GET /servers shows servers created': verify(function (test) {
        api.createServerAtPort(3002, function () {
            http.get('http://localhost:3000/servers', function (response) {
                test.jsonEquals(response.body, {
                    servers: [{
                        url: 'http://localhost:3002/',
                        port: 3002,
                        links: [
                            {
                                href: 'http://localhost:3000/servers/3002',
                                rel: 'http://localhost:3000/relations/server'
                            },
                            {
                                href: 'http://localhost:3000/servers/3002/requests',
                                rel: 'http://localhost:3000/relations/request'
                            },
                            {
                                href: 'http://localhost:3000/server/3002/stubs',
                                rel: 'http://localhost:3000/relations/stub'
                            }
                        ]
                    }]
                });
                test.finish(3002);
            });
        });
    }),

    'GET /servers:port returns 404 if server not created': verify(function (test) {
        http.get('http://localhost:3000/servers/4000', function (response) {
            test.strictEqual(response.statusCode, 404);
            test.done();
        });
    }),

    'GET /servers/:port gets hypermedia for server': verify(function (test) {
        api.createServerAtPort(3001, function () {
            http.get('http://localhost:3000/servers/3001', function (response) {
                test.strictEqual(response.statusCode, 200);
                test.jsonEquals(response.body, {
                    url: 'http://localhost:3001/',
                    port: 3001,
                    links: [
                        {
                            href: 'http://localhost:3000/servers/3001',
                            rel: 'http://localhost:3000/relations/server'
                        },
                        {
                            href: 'http://localhost:3000/servers/3001/requests',
                            rel: 'http://localhost:3000/relations/request'
                        },
                        {
                            href: 'http://localhost:3000/server/3001/stubs',
                            rel: 'http://localhost:3000/relations/stub'
                        }
                    ]
                });
                test.finish(3001);
            });
        });
    }),

    'DELETE /servers/:port deletes stub at given port': verify(function (test) {
        api.createServerAtPort(3004, function () {
            http.del('http://localhost:3000/servers/3004', function (response) {
                test.strictEqual(response.statusCode, 204);
                exec('netstat -an | grep 3004 | grep LISTEN', function (error, stdout, stderr) {
                    test.strictEqual(stdout, '');
                    test.done();
                });
            });
        });
    }),

    'DELETE /servers/:port returns 404 if server never created': verify(function (test) {
        http.del('http://localhost:3000/servers/5000', function (response) {
            test.strictEqual(response.statusCode, 404);
            test.done();
        });
    })
});

