var http = require('http'),
    url = require('url'),
    port = process.argv[2],
    repository = require('./lib/repository').forServer(port);

http.createServer(function(request, response) {
    var resourceMethod = request.method + ' ' + url.parse(request.url).pathname;
    console.log(resourceMethod);

    //repository.save(request, function () {
        response.writeHead(200);
        response.end();
    //});
}).listen(port);

console.log('Open for business...');

process.on('SIGINT', function () {
    //repository.clear....
    console.log('Ciao...');
    process.exit();
});

