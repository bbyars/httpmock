'use strict';

require('extensions');

var connect = require('../deps/connect/lib/connect/index');

var defaults = {
    response: {
        statusCode: 200,
        headers: {
            // We can't use persistent connections, because a test case
            // may shutdown the stub, which prevents new connections for
            // the port, but that won't prevent the system under test
            // from reusing an existing TCP connection after the stub
            // has shutdown, causing difficult to track down bugs when
            // multiple tests are run.
            'Connection': 'close'
        },
        body: ''
    }
};

exports.create = function (port, callback) {
    var Repository = require('repository'),
        requests = Repository.create(),
        stubs = Repository.create(),
        logPrefix = '[{0}]: '.format(port);

    var recorder = function (request, response, next) {
        var body = '';
        request.setEncoding('utf8');

        request.on('data', function (chunk) {
            body += chunk;
        });

        request.on('end', function () {
            var data = {
                path: request.url,
                method: request.method,
                headers: request.headers,
                body: body
            };

            requests.save(data);
            next();
        });
    };

    var stubber = function (request, response, next) {
        var matchingStubs = stubs.load(request.url),
            match = matchingStubs[0] || defaults,
            stub = Object.create(defaults).merge(match).response;

        response.writeHead(stub.statusCode, stub.headers);
        response.write(stub.body);
        response.end();
        next();
    };

    var server = connect.createServer(
        connect.logger({format: logPrefix + ':method :url'}),
        recorder,
        stubber
    );

    server.on('close', function () {
        console.log(logPrefix + 'Ciao...');
    });

    server.listen(port, function () {
        console.log(logPrefix + 'Open for business...');

        callback({
            close: function (callback) {
                server.on('close', callback);
                server.close();
            },

            loadRequests: function (path) {
                return requests.load(path || '/');
            },

            addStub: function (stub) {
                stubs.save(stub);
            }
        });
    });
};

