"use strict";

require('./lib/extensions');

// Needed to require express locally; it does a require('connect')
require.paths.unshift(__dirname + '/deps/connect/lib');

var CONTENT_TYPE = 'application/vnd.httpmock+json';
require('connect/middleware/bodyDecoder').decode[CONTENT_TYPE] = JSON.parse;

var http = require('http'),
    url = require('url'),
    express = require('./deps/express/lib/express'),
    repositories = require('./lib/repository'),
    isValidPortNumber = require('./lib/helpers').isValidPortNumber,
    isPortInUse = require('./lib/helpers').isPortInUse,
    server = require('./lib/server');

var port = process.argv[2] || 3000,
    servers = {},
    contentHeader = {
        'Content-Type': CONTENT_TYPE
    };

var validateServerExists = function (request, response, next) {
    var port = request.port = request.params.port;

    if (!servers[port]) {
        response.send({ message: 'no server exists at port ' + port }, 404);
    }
    else {
        next();
    }
};

var validatePort = function (request, response, next) {
    var port = request.body.port;

    if (!port) {
        response.send({ message: 'port is a required field' }, 400);
    }
    else if (!isValidPortNumber(port)) {
        response.send({ message: 'port must be a valid integer between 1 and 65535' }, 400);
    }
    else {
        next();
    }
};

var validatePortAvailable = function (request, response, next) {
    var port = request.body.port;

    isPortInUse(port, function (isInUse) {
        if (isInUse) {
            response.send({ message: 'port in use' }, 409);
        }
        else {
            next();
        }
    });
};

var app = express.createServer(
    express.logger({format: '[ROOT]: :method :url'}),
    express.bodyDecoder()
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
    }, contentHeader);
});

app.get('/servers', function (request, response) {
    var result = Object.keys(servers).reduce(function (accumulator, port) {
        return accumulator.concat(serverHypermedia(port, request));
    }, []);
    response.send({ servers: result }, contentHeader);
}),

app.post('/servers', validatePort, validatePortAvailable, function (request, response) {
    var port = request.body.port;

    server.create(port, function (server) {
        servers[port] = server;
        response.send(serverHypermedia(port, request),
            Object.create(contentHeader).merge({'Location': absoluteUrl('/servers/' + port, request)}),
            201);
    });
});

app.get('/servers/:port', validateServerExists, function (request, response) {
    response.send(serverHypermedia(request.port, request), contentHeader);
}),

app.del('/servers/:port', validateServerExists, function (request, response) {
    var server = servers[request.port];

    delete servers[request.port];
    server.close(function () {
        response.send();
    });
});

app.get('/servers/:port/requests', validateServerExists, function (request, response) {
    var path = request.query.path,
        results;

    results = servers[request.port].loadRequests(path);
    response.send(results, contentHeader);
});

app.post('/servers/:port/stubs', validateServerExists, function (request, response) {
    servers[request.port].addStub(request.body);
    response.send();
    //TODO: return 201, location = stub url
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
    var host = request.headers.host || 'localhost:' + port;
    return 'http://{0}{1}'.format(host, endpoint);
};
