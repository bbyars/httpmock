var sys = require('sys')
    exec = require('child_process').exec,
    spawn = require('child_process').spawn,
    NO_OP = function () {};

desc('Build the application.');
task('default', ['test:all'], NO_OP);

namespace('test', function () {
    require.paths.unshift(__dirname + '/deps/nodeunit/lib');
    var testrunner = require('nodeunit').reporters.default;

    desc('Runs all unit tests');
    task('unit', [], function () {
        testrunner.run(['test/unit']);
    });

    desc('Runs all functional tests');
    task('functional', [], function() {
        testrunner.run(['test/functional']);
    });

    desc('Runs all tests');
    task('all', ['test:unit', 'test:functional'], NO_OP);
});

namespace('package', function () {
    var DEPENDENCIES_DIR = __dirname + '/deps';

    function packagePath (packageName) {
        return '/usr/local/lib/node/.npm/' + packageName + '/active/package';
    }

    function localPath (packageName) {
        return DEPENDENCIES_DIR + '/' + packageName;
    }

    desc("Copies an npm package to the lib directory, so the application doesn't depend on preinstalled packages")
    task('unpack', [], function () {
        var mkdir = '[ -d ' + DEPENDENCIES_DIR + ' ] || mkdir ' + DEPENDENCIES_DIR;
        exec(mkdir, NO_OP);
        for (var i = 0; i < arguments.length; i++) {
            var copy = 'cp -RL ' + packagePath(arguments[i]) + ' ' + localPath(arguments[i]);
            exec(copy, function(error, stdout, stderr) {
                var message = (error == null)
                    ? packagePath(arguments[i]) + ' => ' + localPath(arguments[i])
                    : error + '\n' + stderr;
                console.log(message);
            });
        }
    });
});
