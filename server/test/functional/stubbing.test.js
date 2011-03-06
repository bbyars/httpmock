require('../../lib/extensions');

var TestFixture = require('nodeunit').testCase,
    exec  = require('child_process').exec,
    extensions = require('../testExtensions'),
    http = extensions.http,
    api = extensions.api,
    verify = extensions.verify;

exports['Stubbing'] = TestFixture({
    'POST /servers/:port/stubs sets up stub response': verify(function (test) {
        api.createServerAtPort(3002, function () {
            http.post('http://localhost:3000/servers/3002/stubs', {
                body: {
                    path: '/test',
                    response: {
                        statusCode: 400,
                        headers: { 'Content-Type': 'text/plain' },
                        body: 'Testing 1..2..3..'
                    }
                },
                callback: function (postResponse) {
                    test.strictEqual(postResponse.statusCode, 204);

                    http.get('http://localhost:3002/test', function (response) {
                        test.strictEqual(response.statusCode, 400);
                        test.strictEqual(response.headers['content-type'], 'text/plain');
                        test.strictEqual(response.body, 'Testing 1..2..3..');
                        test.finish(3002);
                    });
                }
            });
        });
    }),

    'POST /servers/:port/stubs defaults response options': verify(function (test) {
        api.createServerAtPort(3003, function () {
            http.post('http://localhost:3000/servers/3003/stubs', {
                body: { path: '/' },
                callback: function () {
                    http.get('http://localhost:3003/', function (response) {
                        test.strictEqual(response.headers.connection, 'close');
                        test.strictEqual(response.statusCode, 200);
                        test.strictEqual(response.body, '');
                        test.finish(3003);
                    });
                }
            });
        });
    }),

    'POST /servers/:port/stubs returns 404 if server not created first': verify(function (test) {
        http.post('http://localhost:3000/servers/5000/stubs', {
            body: { path: '/' },
            callback: function (response) {
                test.strictEqual(response.statusCode, 404);
                test.done();
            }
        })
    })
});
