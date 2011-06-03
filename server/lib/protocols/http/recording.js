'use strict';

var repositories = require('repository');

function create() {
    var requests = repositories.create();

    function recorder(request, response, next) {
        request.body = '';
        request.setEncoding('utf8');

        request.on('data', function (chunk) {
            request.body += chunk;
        });

        request.on('end', function () {
            requests.save({
                path: request.url,
                method: request.method,
                headers: request.headers,
                body: request.body
            });
            next();
        });
    }

    return {
        middleware: recorder,
        load: function (path) {
            return requests.load(path);
        }
    };
}

exports.create = create;
