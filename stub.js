var http = require('http'),
    sys = require('sys'),
    repository = require('./lib/repository');

var port = process.argv[2];

http.createServer(function(request, response) {
    response.writeHead(200);
    response.end();
}).listen(port);

console.log('Stub server running at http://localhost:' + port);

