'use strict';

require('extensions');

var testCase = require('nodeunit').testCase,
    exec  = require('child_process').exec,
    http = require('testExtensions').http,
    api = require('testExtensions').api,
    verify = require('testExtensions').verify,
    adminPort = process.env.port;

exports['GET /'] = testCase({
    'returns base hypermedia': verify(function (test) {
        http.get('http://localhost:{0}/'.format(adminPort), function (response) {
            test.strictEqual(response.headers['content-type'], 'application/vnd.httpmock+json');
            test.jsonEquals(response.body, {
                links: [{
                    href: 'http://localhost:{0}/servers'.format(adminPort),
                    rel: 'http://localhost:{0}/relations/servers'.format(adminPort)
                }]
            });
            test.done();
        });
    }),

    'uses host header in hypermedia links': verify(function (test) {
        http.get('http://127.0.0.1:{0}/'.format(adminPort), function (response) {
            test.jsonEquals(response.body, {
                links: [{
                    href: 'http://127.0.0.1:{0}/servers'.format(adminPort),
                    rel: 'http://127.0.0.1:{0}/relations/servers'.format(adminPort)
                }]
            });
            test.done();
        });
    })
});

exports['POST /servers'] = testCase({
    'creates server at given port': verify(function (test) {
        http.post('http://localhost:{0}/servers'.format(adminPort), {
            body: { port: 3001 },
            callback: function (response) {
                test.strictEqual(response.statusCode, 201);
                test.strictEqual(response.headers.location, 'http://localhost:{0}/servers/3001'.format(adminPort));
                test.jsonEquals(response.body, {
                    url: 'http://localhost:3001/',
                    port: 3001,
                    links: [
                        {
                            href: 'http://localhost:{0}/servers/3001'.format(adminPort),
                            rel: 'http://localhost:{0}/relations/server'.format(adminPort)
                        },
                        {
                            href: 'http://localhost:{0}/servers/3001/requests'.format(adminPort),
                            rel: 'http://localhost:{0}/relations/request'.format(adminPort)
                        },
                        {
                            href: 'http://localhost:{0}/servers/3001/stubs'.format(adminPort),
                            rel: 'http://localhost:{0}/relations/stub'.format(adminPort)
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

    'creates stub that disallows keepalive connections': verify(function (test) {
        api.createServerAtPort(3001, function () {
            http.get('http://localhost:3001/', function (response) {
                test.strictEqual(response.headers.connection, 'close');
                test.finish(3001);
            });
        });
    }),

    'returns 409 if port already in use': verify(function (test) {
        api.createServerAtPort(adminPort, function (response) {
            test.strictEqual(response.statusCode, 409, response.body);
            test.done();
        });
    }),

    'returns 400 if port missing': verify(function (test) {
        http.post('http://localhost:{0}/servers'.format(adminPort), {
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

    'returns 400 if port is not a number': verify(function (test) {
        http.post('http://localhost:{0}/servers'.format(adminPort), {
            body: { port: 'test' },
            callback: function (response) {
                test.strictEqual(response.statusCode, 400);
                test.jsonEquals(response.body, {
                    message: 'port must be a valid integer between 1 and 65535'
                });
                test.done();
            }
        });
    })
});

exports['GET /servers'] = testCase({
    'shows servers created': verify(function (test) {
        api.createServerAtPort(3002, function () {
            http.get('http://localhost:{0}/servers'.format(adminPort), function (response) {
                test.jsonEquals(response.body, {
                    servers: [{
                        url: 'http://localhost:3002/',
                        port: 3002,
                        links: [
                            {
                                href: 'http://localhost:{0}/servers/3002'.format(adminPort),
                                rel: 'http://localhost:{0}/relations/server'.format(adminPort)
                            },
                            {
                                href: 'http://localhost:{0}/servers/3002/requests'.format(adminPort),
                                rel: 'http://localhost:{0}/relations/request'.format(adminPort)
                            },
                            {
                                href: 'http://localhost:{0}/servers/3002/stubs'.format(adminPort),
                                rel: 'http://localhost:{0}/relations/stub'.format(adminPort)
                            }
                        ]
                    }]
                });
                test.finish(3002);
            });
        });
    })
});

exports['GET /servers:port'] = testCase({
    'returns 404 if server not created': verify(function (test) {
        http.get('http://localhost:{0}/servers/4000'.format(adminPort), function (response) {
            test.strictEqual(response.statusCode, 404);
            test.done();
        });
    }),

    'gets hypermedia for server': verify(function (test) {
        api.createServerAtPort(3001, function () {
            http.get('http://localhost:{0}/servers/3001'.format(adminPort), function (response) {
                test.strictEqual(response.statusCode, 200);
                test.jsonEquals(response.body, {
                    url: 'http://localhost:3001/',
                    port: 3001,
                    links: [
                        {
                            href: 'http://localhost:{0}/servers/3001'.format(adminPort),
                            rel: 'http://localhost:{0}/relations/server'.format(adminPort)
                        },
                        {
                            href: 'http://localhost:{0}/servers/3001/requests'.format(adminPort),
                            rel: 'http://localhost:{0}/relations/request'.format(adminPort)
                        },
                        {
                            href: 'http://localhost:{0}/servers/3001/stubs'.format(adminPort),
                            rel: 'http://localhost:{0}/relations/stub'.format(adminPort)
                        }
                    ]
                });
                test.finish(3001);
            });
        });
    })
});

exports['DELETE /servers:port'] = testCase({
    'deletes stub at given port': verify(function (test) {
        api.createServerAtPort(3004, function () {
            http.del('http://localhost:{0}/servers/3004'.format(adminPort), function (response) {
                test.strictEqual(response.statusCode, 204);
                exec('netstat -an | grep 3004 | grep LISTEN', function (error, stdout, stderr) {
                    test.strictEqual(stdout, '');
                    test.done();
                });
            });
        });
    }),

    'returns 404 if server never created': verify(function (test) {
        http.del('http://localhost:{0}/servers/5000'.format(adminPort), function (response) {
            test.strictEqual(response.statusCode, 404);
            test.done();
        });
    })
});

