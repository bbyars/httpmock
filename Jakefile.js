var sys = require('sys')
    exec = require('child_process').exec,
    spawn = require('child_process').spawn;

var NO_OP = function() {};

desc('Build the application.');
task('default', ['test:unit'], NO_OP);

namespace('test', function() {
    require.paths.unshift(__dirname + '/deps/nodeunit/lib');
    var testrunner = require('nodeunit').reporters.default;

    desc('Runs all unit tests');
    task('unit', [], function() { testrunner.run(['test/unit']); });

    desc('Runs all functional tests');
    task('functional', [], function() {
        /*
        var app = spawn('node', ['app.js'], {cwd: __dirname, env: process.env, customFds: [-1, -1, -1]});
        app.stdout.setEncoding('utf8');
        app.stdout.on('data', function (data) {
            if (data.indexOf('Server running') === 0) {
            */
                testrunner.run(['test/functional']);
                /*
                app.kill();
            }
        });
        */
    });

    //TODO: Does not work; it appears as though it does run test:functional, but doesn't wait for it to finish
    desc('Runs all tests');
    task('all', ['test:unit', 'test:functional'], NO_OP);
});

namespace('package', function() {
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
