'use strict';

require('extensions');

var connect = require('connect'),
    stubs = require('./stubbing'),
    recorders = require('./recording'),
    merge = connect.utils.merge;

var create = function (port, callback) {
    var logPrefix = '[{0}]: '.format(port),
        stub = stubs.create(),
        recorder = recorders.create(),
        server;

    server = connect.createServer(
        connect.logger({format: logPrefix + ':method :url'}),
        recorder.middleware,
        stub.middleware);

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
                return recorder.load(path || '/');
            },

            addStub: function (stubResponse) {
                stub.addStub(stubResponse);
            }
        });
    });
};

exports.create = create;
