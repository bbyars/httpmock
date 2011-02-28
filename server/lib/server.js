var connect = require('../deps/connect/lib/connect/index');

exports.create = function (port, callback) {
    var Repository = require('./repository'),
        requests = Repository.create(),
        stubs = Repository.create(),
        logPrefix = '[{0}]: '.format(port);

    var recorder = function (request, response, next) {
        var body = '';
        request.setEncoding('utf8');

        request.addListener('data', function (chunk) {
            body += chunk;
        });

        request.addListener('end', function () {
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

    var server = connect.createServer(
        //connect.bodyDecoder,
        connect.logger({format: logPrefix + ':method :url'}),

        function (request, response, next) {
            var matchingStubs = stubs.load(request.url),
                stub;

            if (matchingStubs.length > 0) {
                console.log(logPrefix + '... sending stubbed response');
                stub = matchingStubs[0].response;
                response.writeHead(stub.statusCode, stub.headers);
                response.write(stub.body);
            }
            else {
                response.writeHead(200);
            }

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

            loadRequests: function (path) {
                return requests.load(path || '/');
            },

            addStub: function (stub) {
                stubs.save(stub);
            }
        });
    });
};

