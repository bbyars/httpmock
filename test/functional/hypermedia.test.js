require('../../lib/extensions');

var TestFixture = require('nodeunit').testCase,
    sys = require('sys'),
    url = require('url'),
    http = require('http'),
    tests = require('../testExtensions');

exports['Server'] = TestFixture({
    'getting / should return base hypermedia': function(test) {
        get('http://localhost:3000/', function(response) {
            var expected = {
                servers: [],
                links: [
                    {
                        href: "http://localhost:3000/servers",
                        rel: "http://localhost:3000/relations/server"
                    }
                ]
            };
            test.strictEqual(response.body, sys.inspect(expected));
            test.done();
        });
    },

    'posting to /servers should create stub at given port': function(test) {
        post('http://localhost:3000/servers', {
            body: { port: 3001 },
            callback: function(response) {
console.log('in callback');
                test.strictEqual(response.statusCode, 201);
                test.strictEqual(response.headers.location, 'http://localhost:3000/servers/3001');
                test.strictEqual(response.body, sys.inspect({
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
                }));
console.log('got here..');

                get('http://localhost:3001/', function(stubbedResponse) {
console.log("hit stub server");
                    test.strictEqual(stubbedResponse.statusCode, 200);
                    test.done();
                });
            }
        });
    }/*,

    'should enable setting up stub response': verify(function(test) {
        test.expect(3);
        createStubServerAtPort(3002, function(response) {
            setupStub({
                url: getStubEndpoint(JSON.parse(response.body)),
                stub: {
                    request: {
                        path: "/test"
                    },
                    response: {
                        statusCode: 400,
                        headers: { 'Content-type': 'text/plain' },
                        body: 'Testing 1..2..3..'
                    }
                },
                callback: function() {
                    get('http://localhost:3002/test', function(response) {
                        test.strictEqual(response.statusCode, 400);
                        test.strictEqual(response.headers['Content-type'], 'text/plain');
                        test.strictEqual(response.body, 'Testing 1..2..3..');
                        test.done();
                    });
                }
            });
        }));
    },*/
});

var setDefaults = function(options) {
    return {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
        },
        body: ''
    }.merge(options);
};

var getResponse = function(options) {
    var spec = setDefaults(options),
        urlParts = url.parse(spec.url),
        client = http.createClient(urlParts.port, urlParts.hostname),
        request = client.request(spec.method, urlParts.pathname, spec.headers);

    request.write(JSON.stringify(spec.body));
    request.end();

    request.on('response', function(response) {
console.log('in response handler');
        response.body = '';
        response.setEncoding('utf8');

        response.addListener('data', function(chunk) {
console.log('chunk: ' + chunk);
            response.body += chunk;
        });

        response.on('end', function() {
            spec.callback(response);
        });
    });
};

var get = function(url, callback) {
    getResponse({url: url, method: 'GET', callback: callback});
};

var post = function(url, options) {
    getResponse(options.merge({url: url, method: 'POST'}));
};

var createStubServerAtPort = function(port, callback) {
    post('http://localhost:3000/servers', {
        body: {port: port},
        callback: callback
    });
};

var getStubUrl = function(hypermedia) {
    var link;
    for (var i = 0; i < hypermedia.links.length; i++) {
        link = hypermedia.links[i];
        if (link.rel === 'http://localhost:3000/relations/stub') {
            return link.href;
        }
    }
};

var setupStub = function(options) {
    post(options.url, {
        body: options.stub,
        callback: function(response) {
            if (response.statusCode !== 201) {
                throw { message: 'Unexpected response setting up stub: ' + response.statusCode };
            }
            options.callback();
        }
    });
};

