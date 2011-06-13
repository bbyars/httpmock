'use strict';

require('extensions');

var express = require('express'),
    fs = require('fs'),
    ports = require('ports'),
    protocols = {},
    basedir = __dirname.replace(/\w+$/, ''),
    publicDir = basedir + 'public',
    staticFiles = fs.readdirSync(publicDir);

var CONTENT_TYPE = 'application/vnd.httpmock+json';
express.bodyParser.parse[CONTENT_TYPE] = JSON.parse;

// add supported protocols
var protocolNames = fs.readdirSync(__dirname + '/protocols');
for (var i = 0; i < protocolNames.length; i += 1) {
    var protocolName = protocolNames[i];
    protocols[protocolName] = require('{0}/protocols/{1}/index'.format(__dirname, protocolName));
}

var create = function (port) {
    var servers = {},
        app;

    function createAbsoluteUrl(request, response, next) {
        var host = request.headers.host || 'localhost:' + port;
        response.absoluteUrl = function (endpoint, serverPort) {
            serverPort = serverPort || port;
            return 'http://{0}{1}'.format(host, endpoint).replace(/:\d+/, ':' + serverPort);
        };
        next();
    }

//TODO: Add tests!
    function isStaticFile(url) {
        return staticFiles.some(function (file) {
            return url.indexOf(file) === 0;
        });
    }

    function connegRouter(request, response, next) {
        var contentTypes = request.headers.accept;

        if (isStaticFile(request.url)) {
            next();
        }
        else if (contentTypes.indexOf(CONTENT_TYPE) >= 0) {
            response.setHeader('Content-type', CONTENT_TYPE);
            response.render = function (view, options) {
                response.send(options.model);
            };
            next();
        }
        else if (contentTypes.indexOf('text/html') >= 0) {
            response.setHeader('Content-type', 'text/html');
            next();
        }
        else {
            response.setHeader('Accept', CONTENT_TYPE + ', text/html');
            response.statusCode = 406;
            response.send('Not acceptable.');
        }
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
        express.logger({format: '[ROOT]: :method :url'}),
        express.bodyParser(),
        //connect.static(basedir + 'public'),
        connegRouter,
        createAbsoluteUrl);
    app.set('view engine', 'jade');
    app.listen(port);
    console.log('HTTPMock running at http://localhost:{0}'.format(port));

    app.get('/', function (request, response) {
        var hypermedia = {
            links: [
                {
                    href: response.absoluteUrl('/servers'),
                    rel: response.absoluteUrl('/relations/servers')
                }
            ]
        };
        response.render('index', { model: hypermedia });
    });

    app.get('/servers', function (request, response) {
        var result = Object.keys(servers).reduce(function (accumulator, port) {
            return accumulator.concat(serverHypermedia(port, response));
        }, []);
        response.send({ servers: result });
    });

    app.post('/servers', validatePort, validatePortAvailable, function (request, response) {
        var port = request.body.port,
            protocol = request.body.protocol || 'http',
            server = protocols[protocol];

//TODO: Handle unsupported protocol

        server.create(port, function (server) {
            servers[port] = server;
            response.setHeader('Location', response.absoluteUrl('/servers/' + port));
            response.statusCode = 201;
            response.send(serverHypermedia(port, response));
        });
    });

    app.get('/servers/:port', validateServerExists, function (request, response) {
        response.send(serverHypermedia(request.port, response));
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
        response.send(results);
    });

    app.post('/servers/:port/stubs', validateServerExists, function (request, response) {
//TODO: Handle protocol not supporting stubs
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
