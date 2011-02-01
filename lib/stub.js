var connect = require('../deps/connect/lib/connect/index');

exports.create = function (port, callback) {
    var repository = require('./repository').create(),
        logPrefix = '[{0}]: '.format(port);

    var recorder = function (request, response, next) {
        var data = {
            path: request.url,
            request: {
                headers: request.headers,
                body: '' //request.rawBody
            },
            response: {
                statusCode: response.statusCode,
                headers: response.headers,
                body: ''
            }
        };

        repository.save(data);
        next();
    };

    var server = connect.createServer(
        //connect.bodyDecoder,
        connect.logger({format: logPrefix + ':method :url'}),
        function (request, response, next) {
            response.writeHead(200);
            response.end();
            next();
        },
        recorder
    );

    server.on('close', function () {
        console.log(logPrefix + 'Ciao...');
    });

    server.listen(port, function () {
        console.log(logPrefix + 'Open for business...');

        callback({
            close: function () {
                server.close();
            },

            loadRequests: function () {
                return repository.load('/');
            }
        });
    });
};

