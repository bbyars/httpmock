var exec  = require('child_process').exec;

exports.isValidPortNumber = function (port) {
    return typeof(port) === 'number'
        && port.toString().indexOf('.') === -1
        && port > 0
        && port < 65536;
};

exports.isPortInUse = function (port, callback) {
    exec('netstat -an | grep ' + port + ' | grep LISTEN', function (error, stdout, stderr) {
        callback(stdout !== '');
    });
};

