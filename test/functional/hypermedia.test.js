require('../../lib/extensions');

var TestFixture = require('nodeunit').testCase,
    url = require('url'),
    http = require('http'),
    exec  = require('child_process').exec;

exports['Server'] = TestFixture({
    'GET / returns base hypermedia': function (test) {
        get('http://localhost:3000/', function (response) {
            test.strictEqual(response.body, JSON.stringify({
                links: [{
                    href: 'http://localhost:3000/servers',
                    rel: 'http://localhost:3000/relations/servers'
                }]
            }));
            test.done();
        });
    },

    'POST /servers creates stub at given port': function (test) {
        post('http://localhost:3000/servers', {
            body: { port: 3001 },
            callback: function (response) {
                test.strictEqual(response.statusCode, 201);
                test.strictEqual(response.headers.location, 'http://localhost:3000/servers/3001');
                test.strictEqual(response.body, JSON.stringify({
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
                }));

                get('http://localhost:3001/', function (stubbedResponse) {
                    test.strictEqual(stubbedResponse.statusCode, 200);
                    deleteServerAtPort(3001, function () {
                        test.done();
                    });
                });
            }
        });
    },

    'POST /servers returns 409 if port already in use': function (test) {
        createServerAtPort(3000, function (response) {
            test.strictEqual(response.statusCode, 409);
            test.done();
        });
    },

    'POST /servers returns 400 if port missing': function (test) {
        post('http://localhost:3000/servers', {
            body: { },
            callback: function (response) {
                test.strictEqual(response.statusCode, 400);
                test.strictEqual(response.body, JSON.stringify({
                    message: 'port is a required field'
                }));
                test.done();
            }
        });
    },

    'POST /servers returns 400 if port is not a number': function (test) {
        post('http://localhost:3000/servers', {
            body: { port: 'test' },
            callback: function (response) {
                test.strictEqual(response.statusCode, 400);
                test.strictEqual(response.body, JSON.stringify({
                    message: 'port must be a valid integer between 1 and 65535'
                }));
                test.done();
            }
        });
    },

    'GET /servers shows servers created': function (test) {
        createServerAtPort(3002, function () {
            get('http://localhost:3000/servers', function (response) {
                test.strictEqual(response.body, JSON.stringify({
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
                }));
                finish(3002, test);
            });
        });
    },

    'GET /servers:port returns 404 if server not created': function (test) {
        get('http://localhost:3000/servers/4000', function (response) {
            test.strictEqual(response.statusCode, 404);
            test.done();
        });
    },

    'GET /servers/:port gets hypermedia for server': function (test) {
        createServerAtPort(3001, function () {
            get('http://localhost:3000/servers/3001', function (response) {
                test.strictEqual(response.statusCode, 200);
                test.strictEqual(response.body, JSON.stringify({
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
                }));
                finish(3001, test);
            });
        });
    },

    'DELETE /servers/:port deletes stub at given port': function (test) {
        createServerAtPort(3004, function () {
            del('http://localhost:3000/servers/3004', function (response) {
                test.strictEqual(response.statusCode, 204);
                exec('netstat -an | grep 3004 | grep LISTEN', function (error, stdout, stderr) {
                    test.strictEqual(stdout, '');
                    test.done();
                });
            });
        });
    },

    'DELETE /servers/:port returns 404 if server never created': function (test) {
        del('http://localhost:3000/servers/5000', function (response) {
            test.strictEqual(response.statusCode, 404);
            test.done();
        });
    },

    'GET /servers/:port/requests returns 404 if server not created': function (test) {
        get('http://localhost:3000/servers/1234/requests', function (response) {
            test.strictEqual(response.statusCode, 404);
            test.done();
        });
    },

    'GET /servers/:port/requests returns empty array if no requests to given url': function (test) {
        createServerAtPort(3005, function () {
            get('http://localhost:3000/servers/3005/requests', function (response) {
                test.strictEqual(response.body, JSON.stringify([]));
                finish(3005, test);
            });
        });
    },

    'GET /servers/:port/requests returns requests to server': function (test) {
        var result;

        createServerAtPort(3006, function () {
            getResponse({
                method: 'GET',
                url: 'http://localhost:3006/test',
                headers: {
                    'Accept': 'text/plain'
                },
                callback: function () {
                    get('http://localhost:3000/servers/3006/requests', function (response) {
                        test.strictEqual(response.parsedBody.length, 1);
                        result = response.parsedBody[0];
                        test.strictEqual(result.path, '/test');
                        test.strictEqual(result.request.headers['accept'], 'text/plain');
                        test.strictEqual(result.response.statusCode, 200);
                        finish(3006, test);
                    });
                }
            });
        });
    },

    'GET /servers/:port/requests?path=:filter filters requests sent back': function (test) {
        var result;

        createServerAtPort(3007, function () {
            get('http://localhost:3007/first', function () {
                get ('http://localhost:3007/second', function () {
                    get('http://localhost:3007/second/again', function () {
                        get('http://localhost:3000/servers/3007/requests?path=/second', function (response) {
                            result = JSON.stringify(response.parsedBody.map(function (item) {
                                return item.path;
                            }));
                            test.strictEqual(result, JSON.stringify(['/second', '/second/again']));
                            finish(3007, test);
                        });
                    });
                });
            });
        });
    },

    /*
    'POST /servers/:port/stubs sets up stub response': function (test) {
        createStubServerAtPort(3002, function (createResponse) {
            post('http://localhost:3000/servers/3002/stubs', {
                body: {
                    request: {
                        path: '/test'
                    },
                    response: {
                        statusCode: 400,
                        headers: { 'Content-type': 'text/plain' },
                        body: 'Testing 1..2..3..'
                    }
                },
                callback: function (postResponse) {
                    test.strictEqual(postResponse.statusCode, 200);
                    get('http://localhost:3002/test', function (response) {
                        test.strictEqual(response.statusCode, 400);
                        test.strictEqual(response.headers['Content-type'], 'text/plain');
                        test.strictEqual(response.body, 'Testing 1..2..3..');
                        deleteServerAtPort(3002, function () {
                            test.done();
                        }
                    }
                }
            });
        });
    })*/
});

var setDefaults = function (options) {
    return {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'Host': url.parse(options.url).host
        },
        body: '',
        callback: function (response) {}
    }.merge(options);
};

var getResponse = function (options) {
    var spec = setDefaults(options),
        urlParts = url.parse(spec.url),
        path = urlParts.pathname + (urlParts.search || ''),
        client = http.createClient(urlParts.port, urlParts.hostname),
        request = client.request(spec.method, path, spec.headers);

    request.write(JSON.stringify(spec.body));
    request.end();

    request.on('response', function (response) {
        response.body = '';
        response.setEncoding('utf8');

        response.addListener('data', function (chunk) {
            response.body += chunk;
        });

        response.on('end', function () {
            if (response.headers['content-type'] === 'application/json') {
                response.parsedBody = JSON.parse(response.body);
            }
            spec.callback(response);
        });
    });
};

var get = function (url, callback) {
    getResponse({url: url, method: 'GET', callback: callback});
};

var post = function (url, options) {
    getResponse(options.merge({url: url, method: 'POST'}));
};

var del = function (url, callback) {
    getResponse({url: url, method: 'DELETE', callback: callback});
};

var deleteServerAtPort = function(port, callback) {
    del('http://localhost:3000/servers/{0}'.format(port), callback);
}

var createServerAtPort = function (port, callback) {
    post('http://localhost:3000/servers', {
        body: { port: port },
        callback: callback
    });
};

var finish = function (port, test) {
    deleteServerAtPort(port, function () {
        test.done();
    });
}
