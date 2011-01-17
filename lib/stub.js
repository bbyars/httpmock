var http = require('http'),
    url = require('url');

exports.create = function (port, callback) {
    var logPrefix = '[{0}]: '.format(port),
        server;

    server = http.createServer(function(request, response) {
        var resourceMethod = request.method + ' ' + url.parse(request.url).pathname;
        console.log(logPrefix + resourceMethod);

        //repository.save(request, function () {
            response.writeHead(200);
            response.end();
        //});
    });
    server.on('close', function () {
        //repository.clear....
        console.log(logPrefix + 'Ciao...');
    });
    server.listen(port, function () {
        console.log(logPrefix + 'Open for business...');
        callback(server);
    });
};

