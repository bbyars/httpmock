require('./lib/extensions');

// Needed to require express locally
require.paths.unshift(__dirname + '/deps/express/support/connect/lib');

var http = require('http'),
    url = require('url'),
    sys = require('sys'),
    spawn = require('child_process').spawn,
    express = require('./deps/express/lib/express'),
    repository = require('./lib/repository');

var port = process.argv[2] || 3000,
    servers = {};

var app = express.createServer(
    express.bodyDecoder(),
    express.logger({format: ':method :url'})
);
app.listen(port);
console.log('HTTPMock running at http://localhost:{0}'.format(port));

app.get('/', function (request, response) {
    response.send({
        links: [
            {
                href: absoluteUrl('/servers', request),
                rel: absoluteUrl('/relations/servers', request)
            }
        ]
    });
});

app.get('/servers', function (request, response) {
    var result = servers.ownProperties().reduce(function (accumulator, port) {
        return accumulator.concat(serverHypermedia(port, request));
    }, []);
    response.send({ servers: result });
}),

app.post('/servers', function (request, response) {
    var responseSent = false,
        port = request.body.port,
        body;

    if (servers[port]) {
        response.send(409);
        return;
    }

    servers[port] = spawn('node', ['stub.js', port]);
    servers[port].stdout.setEncoding('utf8');
    servers[port].stdout.on('data', function(data) {
        console.log('[{0}]: {1}'.format(port, data));

        if (!responseSent) {
            responseSent = true;
            response.send(serverHypermedia(port, request),
                {'Location': absoluteUrl('/servers/' + port, request)}, 201);
        }
    });
});

app.get('/servers/:port', function (request, response) {
    var port = request.params.port;

    if (servers[port]) {
        response.send(serverHypermedia(port, request));
    }
    else {
        response.send(404);
    }
}),

app.del('/servers/:port', function (request, response) {
    var port = request.params.port;
    if (!servers[port]) {
        response.send(404);
    }
    else {
        servers[port].kill('SIGINT');
        delete servers[port];
        response.send();
    }
});

app.get('/servers/:port/requests', function (request, response) {
    response.send([]);
});

var serverHypermedia = function (port, request) {
    return {
        url: absoluteUrl('/', request).replace(/:\d+/, ':' + port),
        port: parseInt(port),
        links: [
            {
                href: absoluteUrl('/servers/{0}'.format(port), request),
                rel: absoluteUrl('/relations/server', request)
            },
            {
                href: absoluteUrl('/servers/{0}/requests'.format(port), request),
                rel: absoluteUrl('/relations/request', request)
            },
            {
                href: absoluteUrl('/server/{0}/stubs'.format(port), request),
                rel: absoluteUrl('/relations/stub', request)
            }
        ]
    };
};

var absoluteUrl = function (endpoint, request) {
    var host = request.headers['Host'] || 'localhost:' + port;
    return 'http://{0}{1}'.format(host, endpoint);
};
/*
Admin port only:
GET /
  Shows all stubbed ports, with:
    hyperlink to delete
        stops process
        deletes data store
    hyperlink to get hits
        reads data store
        cannot send request, because that would steal a url
    hyperlink to set stub
        writes data store
    hyperlink to delete stub
    hyperlink to proxy?
  Hyperlink to setup port
    forks on different port, record-mode
  Relations
    HTML description of relationships, describing inputs and outputs

Data store is file-based
    /{port-number}
        /requests
            SHA-1   {records entire HTTP request, including headers}
            SHA-1
            ...
        /stubs
            SHA-1?

Example C# code:
// calls GET /
// setup has optional second parameter (share), which, if false, follows the 
//   hyperlink to delete that URL if its there
// if the URL is not there, follows hyperlink to create
using (var remote = HttpMockServer.at("http://localhost:3000").setup("http://localhost:3001"))
{
    // calls GET/
    // follows hyperlink to create stub
    remote.stub("/endpoint?query").returns(body);

    // Could be done locally at first, but would be nice to handle centrally
    remote.proxy("/endpoint2").to("http://host/endpoint2");

    test();

    // Calls GET /
    // follows hyperlink to get hits
    // Matching could be done locally at first, with an eye on centralizing later
    Assert.That(remote.WasCalledAt("/anotherEndpoint").WithHeader("Content-Type", "text/*")
        .WithBodyContaining("text");
}
*/

