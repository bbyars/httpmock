var sys = require('sys');

var NO_OP = function() {};

desc('Build the application.');
task('default', [], function () {
    console.log('Build successful.');
});

namespace('test', function() {
    require.paths.unshift(__dirname + '/deps/nodeunit/lib');
    var testrunner = require('nodeunit').reporters.default;

    desc('Runs all unit tests');
    task('unit', [], function() { testrunner.run(['test/unit']); });

    desc('Runs all functional tests');
    task('functional', [], function() { testrunner.run(['test/functional']); });

    //TODO: Does not work
    desc('Runs all tests');
    task('all', ['test:unit', 'test:functional'], NO_OP);
});

namespace('package', function() {
    var exec = require('child_process').exec;

    function packagePath(packageName) {
        return '/usr/local/lib/node/.npm/' + packageName + '/active/package';
    }

    function localPath(packageName) {
        return __dirname + '/deps/' + packageName;
    }

    desc("Copies an npm package to the lib directory, so the application doesn't depend on preinstalled packages")
    task('unpack', [], function() {
        exec('[ -d deps ] || mkdir deps ]', NO_OP);
        for (var i = 0; i < arguments.length; i++) {
            var command = 'cp -RL ' + packagePath(arguments[i]) + ' ' + localPath(arguments[i]);
            exec(command, function(error, stdout, stderr) {
                var message = (error == null)
                    ? packagePath(arguments[i]) + ' => ' + localPath(arguments[i])
                    : error + '\n' + stderr;
                console.log(message);
            });
        }
    });
});
