'use strict';

require('extensions');

var http = require('http'),
    url = require('url'),
    express = require('express'),
    connect = require('connect'),
    server = require('stubServer'),
    ports = require('ports'),
    merge = connect.utils.merge;

var CONTENT_TYPE = 'application/vnd.httpmock+json';
connect.bodyParser.parse[CONTENT_TYPE] = JSON.parse;

var create = function (port) {
    var servers = {},
        contentHeader = {'Content-Type': CONTENT_TYPE},
        app;

    function createAbsoluteUrl(request, response, next) {
        var host = request.headers.host || 'localhost:' + port;
        response.absoluteUrl = function (endpoint, serverPort) {
            serverPort = serverPort || port;
            return 'http://{0}{1}'.format(host, endpoint).replace(/:\d+/, ':' + serverPort);
        };
        next();
    }

    function serverHypermedia(port, response) {
        return {
            url: response.absoluteUrl('/', port),
            port: parseInt(port, 10),
            links: [
                {
                    href: response.absoluteUrl('/servers/{0}'.format(port)),
                    rel: response.absoluteUrl('/relations/server')
                },
                {
                    href: response.absoluteUrl('/servers/{0}/requests'.format(port)),
                    rel: response.absoluteUrl('/relations/request')
                },
                {
                    href: response.absoluteUrl('/servers/{0}/stubs'.format(port)),
                    rel: response.absoluteUrl('/relations/stub')
                }
            ]
        };
    }

    function validateServerExists(request, response, next) {
        var port = request.port = request.params.port;

        if (!servers[port]) {
            response.send({ message: 'no server exists at port ' + port }, 404);
        }
        else {
            next();
        }
    }

    function validatePort(request, response, next) {
        var port = request.body.port;

        if (!port) {
            response.send({ message: 'port is a required field' }, 400);
        }
        else if (!ports.isValidPortNumber(port)) {
            response.send({ message: 'port must be a valid integer between 1 and 65535' }, 400);
        }
        else {
            next();
        }
    }

    function validatePortAvailable(request, response, next) {
        var port = request.body.port;

        ports.isPortInUse(port, function (isInUse) {
            if (isInUse) {
                response.send({ message: 'port in use' }, 409);
            }
            else {
                next();
            }
        });
    }

    app = express.createServer(
        connect.logger({format: '[ROOT]: :method :url'}),
        connect.bodyParser(),
        createAbsoluteUrl);
    app.listen(port);
    console.log('HTTPMock running at http://localhost:{0}'.format(port));

    app.get('/', function (request, response) {
        response.send({
            links: [
                {
                    href: response.absoluteUrl('/servers'),
                    rel: response.absoluteUrl('/relations/servers')
                }
            ]
        }, contentHeader);
    });

    app.get('/servers', function (request, response) {
        var result = Object.keys(servers).reduce(function (accumulator, port) {
            return accumulator.concat(serverHypermedia(port, response));
        }, []);
        response.send({ servers: result }, contentHeader);
    });

    app.post('/servers', validatePort, validatePortAvailable, function (request, response) {
        var port = request.body.port;

        server.create(port, function (server) {
            servers[port] = server;
            response.send(serverHypermedia(port, response),
                merge({'Location': response.absoluteUrl('/servers/' + port)}, contentHeader),
                201);
        });
    });

    app.get('/servers/:port', validateServerExists, function (request, response) {
        response.send(serverHypermedia(request.port, response), contentHeader);
    });

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
    });

    return {
        close: function () {
            console.log('Goodbye...');
            app.close();
        }
    };
};

exports.create = create;
