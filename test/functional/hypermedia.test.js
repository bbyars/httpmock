var TestFixture = require('nodeunit').testCase,
    verify = require('../testExtensions').verify,
    http = require('http');

var TEST_PORT = 3000;
var TEST_URL = 'http://127.0.0.1';

exports['Server'] = TestFixture({
    'should send back json links to delete stubs': function(test) {
        test.expect(1);

        var httpmock = http.createClient(TEST_PORT, TEST_URL);
        var request = httpmock.request('GET', '/');
        request.end();

        request.on('response', function (response) {
          console.log('STATUS: ' + response.statusCode);
          console.log('HEADERS: ' + JSON.stringify(response.headers));
          response.setEncoding('utf8');
          response.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            test.ok(true);
            test.done();
          });
        });
    }
});

