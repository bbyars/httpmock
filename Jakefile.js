var sys = require('sys');

var PACKAGES_ROOT = '/usr/local/lib/node/';
var LIB_ROOT = __dirname + '/lib';

var NO_OP = function() {};

desc('Build the application.');
task('default', [], function () {
    console.log('Build successful.');
});

namespace('test', function() {
    var testrunner = require('nodeunit').reporters.default;

    desc('Runs all unit tests');
    task('unit', [], function() { testrunner.run(['test/unit']); });

    desc('Runs all functional tests');
    task('functional', [], function() { testrunner.run(['test/functional']); });

    desc('Runs all tests');
    task('all', ['unit', 'functional'], NO_OP);
});

namespace('package', function() {
    var exec = require('child_process').exec;

    desc("Copies an npm package to the lib directory, so the application doesn't depend on preinstalled packages")
    task('unpack', [], function() {
        for (var i = 0; i < arguments.length; i++) {
            var packagePath = PACKAGES_ROOT + arguments[i];
            exec('cp -RL ' + packagePath + ' ' + LIB_ROOT, function(error, stdout, stderr) {
                var message = (error == null)
                    ? packagePath + ' => ' + LIB_ROOT
                    : error + '\n' + stderr;
                console.log(message);
            });
        }
    });
});
