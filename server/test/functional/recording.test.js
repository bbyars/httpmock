require('extensions');

var TestFixture = require('nodeunit').testCase,
    exec  = require('child_process').exec,
    extensions = require('testExtensions');

var http = extensions.http,
    api = extensions.api,
    verify = extensions.verify;

exports['Recording'] = TestFixture({
    'GET /servers/:port/requests returns 404 if server not created': verify(function (test) {
        http.get('http://localhost:3000/servers/1234/requests', function (response) {
            test.strictEqual(response.statusCode, 404);
            test.done();
        });
    }),

    'GET /servers/:port/requests returns empty array if no requests to given url': verify(function (test) {
        api.createServerAtPort(3005, function () {
            http.get('http://localhost:3000/servers/3005/requests', function (response) {
                test.jsonEquals(response.body, []);
                test.finish(3005);
            });
        });
    }),

    'GET /servers/:port/requests returns requests to server': verify(function (test) {
        api.createServerAtPort(3006, function () {
            http.getResponse({
                method: 'GET',
                url: 'http://localhost:3006/test',
                headers: {
                    'Accept': 'text/plain'
                },
                callback: function () {
                    http.get('http://localhost:3000/servers/3006/requests', function (response) {
                        test.jsonEquals(response.body, [{
                            path: '/test',
                            method: 'GET',
                            headers: {
                                accept: 'text/plain',
                                connection: 'close'
                            },
                            body: ''
                        }]);
                        test.finish(3006);
                    });
                }
            });
        });
    }),

    'GET /servers/:port/requests?path=:filter filters requests sent back': verify(function (test) {
        var result;

        api.createServerAtPort(3007, function () {
            http.get('http://localhost:3007/first', function () {
                http.get ('http://localhost:3007/second', function () {
                    http.get('http://localhost:3007/second/again', function () {
                        http.get('http://localhost:3000/servers/3007/requests?path=/second', function (response) {
                            result = response.parsedBody.map(function (item) {
                                return item.path;
                            });
                            test.jsonEquals(result, ['/second', '/second/again']);
                            test.finish(3007);
                        });
                    });
                });
            });
        });
    }),

    'GET /servers/:port/requests records request body': verify(function (test) {
        var result;

        api.createServerAtPort(3008, function () {
            http.post('http://localhost:3008/', {
                body: {key: 0},
                callback: function () {
                    http.get('http://localhost:3000/servers/3008/requests', function (response) {
                        result = response.parsedBody[0];
                        test.strictEqual(result.body, '{"key":0}');
                        test.finish(3008);
                    });
                }
            });
        });
    })
});

