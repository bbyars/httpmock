'use strict';

var exec = require('child_process').exec;

var isValidPortNumber = function (port) {
    return typeof(port) !== 'undefined' &&
        port.toString().indexOf('.') === -1 &&
        port > 0 &&
        port < 65536;
};

var isPortInUse = function (port, callback) {
    exec('netstat -an | grep ' + port + ' | grep LISTEN', function (error, stdout, stderr) {
        callback(stdout !== '');
    });
};

exports.isValidPortNumber = isValidPortNumber;
exports.isPortInUse = isPortInUse;
