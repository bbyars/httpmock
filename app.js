var http = require('http'),
    url = require('url'),
    sys = require('sys'),
    spawn = require('child_process').spawn,
    repository = require('./lib/repository');

var port = process.argv[2] || 3000

var servers = {};

http.createServer(function(request, response) {
    request.setEncoding('utf8');
    request.body = '';
    request.on('data', function(chunk) {
        request.body += chunk;
    });

    request.on('end', function() {
        route(request, response);
    });
}).listen(port);

console.log('HTTPMock running at http://localhost:3000');

var route = function(request, response) {
    resourceMethod = request.method + ' ' + url.parse(request.url).pathname;
    switch (resourceMethod) {
        case 'GET /':
            sendBaseHypermedia(request, response);
            break;
        case 'POST /servers':
            createServer(request, response);
            break;
        case 'DELETE /servers/3001':
            deleteServer(request, response);
            break;
    }
};

var sendBaseHypermedia = function(request, response) {
    var body = {
        servers: [],
        links: [
            {
                href: 'http://localhost:3000/servers',
                rel: 'http://localhost:3000/relations/servers'
            }
        ]
    };

    response.writeHead(200, {'Content-type': 'application/json'});
    response.end(JSON.stringify(body));
};

var createServer = function(request, response) {
    var responseSent = false,
        port = JSON.parse(request.body).port,
        server = spawn('node', ['stub.js', port]);

    servers[port] = server;

    server.stdout.setEncoding('utf8');
    server.stdout.on('data', function(data) {
        console.log('[{0}]: {1}'.format(port, data));

        if (!responseSent) {
            responseSent = true;

            response.writeHead(201, {
                'Content-type': 'application/json',
                'Location': 'http://localhost:3000/servers/3001'
            });

            response.end(JSON.stringify({
                links: [
                    {
                        href: 'http://localhost:3000/servers/{0}'.format(port),
                        rel: 'http://localhost:3000/relations/server'
                    },
                    {
                        href: 'http://localhost:3000/servers/{0}/requests'.format(port),
                        rel: 'http://localhost:3000/relations/request'
                    },
                    {
                        href: 'http://localhost:3000/server/{0}/stubs'.format(port),
                        rel: 'http://localhost:3000/relations/stub'
                    }
                ]
            }));
        }
    });
};

var deleteServer = function (request, response) {
    console.log('Killing server at port {0}'.format(3001));
    servers[3001].kill();
    response.writeHead(200);
    response.end();
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

