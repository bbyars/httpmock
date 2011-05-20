'use strict';

require('extensions');

var testCase = require('nodeunit').testCase,
    exec  = require('child_process').exec,
    http = require('testExtensions').http,
    api = require('testExtensions').api,
    controlServerURL = require('testExtensions').controlServerURL,
    adminPort = require('testExtensions').adminPort;

exports['GET /'] = testCase({
    'returns base hypermedia': function (test) {
        http.get(controlServerURL + '/', function (response) {
            test.strictEqual(response.headers['content-type'], 'application/vnd.httpmock+json');
            test.jsonEquals(response.body, {
                links: [{
                    href: controlServerURL + '/servers',
                    rel: controlServerURL + '/relations/servers'
                }]
            });
            test.done();
        });
    },

    'uses host header in hypermedia links': function (test) {
        http.get('http://127.0.0.1:{0}/'.format(adminPort), function (response) {
            test.jsonEquals(response.body, {
                links: [{
                    href: 'http://127.0.0.1:{0}/servers'.format(adminPort),
                    rel: 'http://127.0.0.1:{0}/relations/servers'.format(adminPort)
                }]
            });
            test.done();
        });
    }
});

exports['POST /servers'] = testCase({
    'creates server at given port': function (test) {
        http.post('{0}/servers'.format(controlServerURL), {
            body: { port: 3001 },
            callback: function (response) {
                test.strictEqual(response.statusCode, 201);
                test.strictEqual(response.headers.location, '{0}/servers/3001'.format(controlServerURL));
                test.jsonEquals(response.body, {
                    url: 'http://localhost:3001/',
                    port: 3001,
                    links: [
                        {
                            href: '{0}/servers/3001'.format(controlServerURL),
                            rel: '{0}/relations/server'.format(controlServerURL)
                        },
                        {
                            href: '{0}/servers/3001/requests'.format(controlServerURL),
                            rel: '{0}/relations/request'.format(controlServerURL)
                        },
                        {
                            href: '{0}/servers/3001/stubs'.format(controlServerURL),
                            rel: '{0}/relations/stub'.format(controlServerURL)
                        }
                    ]
                });

                http.get('http://localhost:3001/', function (stubbedResponse) {
                    test.strictEqual(stubbedResponse.statusCode, 200);
                    test.finish(3001);
                });
            }
        });
    },

    'creates stub that disallows keepalive connections': function (test) {
        api.createServerAtPort(3001, function () {
            http.get('http://localhost:3001/', function (response) {
                test.strictEqual(response.headers.connection, 'close');
                test.finish(3001);
            });
        });
    },

    'returns 409 if port already in use': function (test) {
        api.createServerAtPort(adminPort, function (response) {
            test.strictEqual(response.statusCode, 409, response.body);
            test.done();
        });
    },

    'returns 400 if port missing': function (test) {
        http.post('{0}/servers'.format(controlServerURL), {
            body: { },
            callback: function (response) {
                test.strictEqual(response.statusCode, 400);
                test.jsonEquals(response.body, {
                    message: 'port is a required field'
                });
                test.done();
            }
        });
    },

    'returns 400 if port is not a number': function (test) {
        http.post('{0}/servers'.format(controlServerURL), {
            body: { port: 'test' },
            callback: function (response) {
                test.strictEqual(response.statusCode, 400);
                test.jsonEquals(response.body, {
                    message: 'port must be a valid integer between 1 and 65535'
                });
                test.done();
            }
        });
    }
});

exports['GET /servers'] = testCase({
    'shows servers created': function (test) {
        api.createServerAtPort(3002, function () {
            http.get('{0}/servers'.format(controlServerURL), function (response) {
                test.jsonEquals(response.body, {
                    servers: [{
                        url: 'http://localhost:3002/',
                        port: 3002,
                        links: [
                            {
                                href: '{0}/servers/3002'.format(controlServerURL),
                                rel: '{0}/relations/server'.format(controlServerURL)
                            },
                            {
                                href: '{0}/servers/3002/requests'.format(controlServerURL),
                                rel: '{0}/relations/request'.format(controlServerURL)
                            },
                            {
                                href: '{0}/servers/3002/stubs'.format(controlServerURL),
                                rel: '{0}/relations/stub'.format(controlServerURL)
                            }
                        ]
                    }]
                });
                test.finish(3002);
            });
        });
    }
});

exports['GET /servers:port'] = testCase({
    'returns 404 if server not created': function (test) {
        http.get('{0}/servers/4000'.format(controlServerURL), function (response) {
            test.strictEqual(response.statusCode, 404);
            test.done();
        });
    },

    'gets hypermedia for server': function (test) {
        api.createServerAtPort(3001, function () {
            http.get('{0}/servers/3001'.format(controlServerURL), function (response) {
                test.strictEqual(response.statusCode, 200);
                test.jsonEquals(response.body, {
                    url: 'http://localhost:3001/',
                    port: 3001,
                    links: [
                        {
                            href: '{0}/servers/3001'.format(controlServerURL),
                            rel: '{0}/relations/server'.format(controlServerURL)
                        },
                        {
                            href: '{0}/servers/3001/requests'.format(controlServerURL),
                            rel: '{0}/relations/request'.format(controlServerURL)
                        },
                        {
                            href: '{0}/servers/3001/stubs'.format(controlServerURL),
                            rel: '{0}/relations/stub'.format(controlServerURL)
                        }
                    ]
                });
                test.finish(3001);
            });
        });
    }
});

exports['DELETE /servers:port'] = testCase({
    'deletes stub at given port': function (test) {
        api.createServerAtPort(3004, function () {
            http.del('{0}/servers/3004'.format(controlServerURL), function (response) {
                test.strictEqual(response.statusCode, 204);
                exec('netstat -an | grep 3004 | grep LISTEN', function (error, stdout, stderr) {
                    test.strictEqual(stdout, '');
                    test.done();
                });
            });
        });
    },

    'returns 404 if server never created': function (test) {
        http.del('{0}/servers/5000'.format(controlServerURL), function (response) {
            test.strictEqual(response.statusCode, 404);
            test.done();
        });
    }
});
