var http = require('http'),
    sys = require('sys'),
    url = require('url'),
    repository = require('./lib/repository');

var port = process.argv[2];

http.createServer(function(request, response) {
    var resourceMethod = request.method + ' ' + url.parse(request.url).pathname;
    console.log(resourceMethod);
    response.writeHead(200);
    response.end();
}).listen(port);

console.log('Open for business...');

process.on('SIGINT', function () {
    console.log('Ciao...');
    process.exit();
});

