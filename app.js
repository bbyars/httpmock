var http = require('http'),
    url = require('url'),
    repository = require('./lib/repository');

http.createServer(function(request, response) {
    response.writeHead(200, {'Content-type': 'text/plain'});
    var method = request.method;
    var pathname = '.' + url.parse(request.url).pathname;
    var query = url.parse(request.url).query;
    var body = method + ' ' + request.url + '\n';
    for (var header in request.headers) {
        body += header + ': ' + request.headers[header] + '\n';
    }

    repository.save(request);
    fs.mkdir(pathname, 0744, function(err) {
        if (err) throw err;

        console.log('writing to ' + pathname + '/1.txt');
        fs.writeFile(pathname + '/1.txt', body, function(err) {
            if (err) throw err;
        });
    });

    response.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    response.end(body);
}).listen(3000);

console.log('Server running at http://localhost:3000');
/*
Reset namespace:
DELETE /prefix
resets the record for any hits within that prefix (can be /)

Stub url generic:
POST /prefix/url
Takes in body, optional response headers

Get requests:
GET /prefix/url
Gets all requests to everything under that prefix, with links to headers, bodies

Stub url with header matcher:
POST /prefix/url
Takes in body, optional response headers, matcher for headers
Same for body

c# syntax
var stub = HttpMock.for("http://localhost:3000/prefix"); 
    // calls GET /, returns hyperlinks for recordings & stubs
    // calls DELETE /_recordings/prefix
stub.on("/prefix/endpoint").returns("body"); // calls POST /_stubs/prefix/endpoint
// shorthand for something like:
var expectedRequest = new ExpectedRequest("GET", "/prefix/endpoint")
    .withHeader("accept", "test")
    .withBodyContaining("test");
var stubResponse = new StubResponse(201)
    .withHeader("", "")
    .withBody("");
stub.on(expectedRequest).returns(stubResponse);

actions();

stub.assertCalled("/prefix/endpoint").atLeastOnce() // GET /_recordings/prefix
    .withBodyMatching(@"regex");

Story 1:
Record all requests and maintain request order.  Return 200

Story 2:
Reset all requests within a prefix
*/

