require('./extensions');

var fileSystem = require('fs'),
    path = require('path'),
    exec = require('child_process').exec;

/*
Uses the following filesystem layout:

/{port}
    /requests
        1
        2
        3
        4
    /stubs
*/

exports.forServer = function (port) {
    var counter = 0,
        baseDir = 'data',
        portDir = baseDir + '/' + port;

    var withinHierarchy = function (ancestor, maybeDescendant) {
        var ancestorParts = ancestor.split(/\//),
            descendantParts = maybeDescendant.split(/\//);

        if (ancestorParts.length > descendantParts.length) {
            return false;
        }

        for (var i = 0; i < ancestorParts.length; i++) {
            if (ancestorParts[i].toLowerCase() !== descendantParts[i].toLowerCase()) {
                return false;
            }
        }
        return true;
    };

    var withinRequestsDir = function (callback) {
        var requestsDir = portDir + '/requests';

        var withDir = function (dirName, callback) {
            path.exists(dirName, function (exists) {
                if (exists) {
                    callback();
                }
                else {
                    fileSystem.mkdir(dirName, 0755, callback);
                }
            });
        };

        withDir(baseDir, function () {
            withDir(portDir, function () {
                withDir(requestsDir, function () {
                    callback(requestsDir);
                });
            });
        });
    };    return {
        clear: function (callback) {
            //TODO: use rmdirs
            exec('rm -rf ' + portDir, function (error) {
                if (error) {
                    console.log(error);
                }
                callback();
            });
        },

        load: function (containingPath, callback) {
            //TODO: any async code here fails to return during the 
            // functional tests.  Unit tests and using curl seem to work
            // just fine
            var results, dir = portDir + '/requests';
            try {
                var files = fileSystem.readdirSync(dir);
                results = files.map(function (file) {
                    return JSON.parse(fileSystem.readFileSync(path.join(dir, file), 'utf8'));
                }).filter(function (value) {
                    return withinHierarchy(containingPath, value.path);
                });
                callback(results);
            }
            catch (err) {
                callback([]);
            }

            /*withinRequestsDir(function (dir) {
                fileSystem.readdir(dir, function (error, files) {
                    if (error) {
                        throw error;
                    }
                    results = files.map(function (file) {
                        return JSON.parse(fileSystem.readFileSync(path.join(dir, file), 'utf8'));
                    }).filter(function (value) {
                        return withinHierarchy(containingPath, value.path);
                    });
                    callback(results);
                });
                callback([]);
            });*/
        },

        save: function (data, callback) {
            withinRequestsDir(function (dir) {
                counter += 1;
                fileSystem.writeFile(dir + '/' + counter, JSON.stringify(data), function (error) {
                    if (error) {
                        throw error;
                    }
                    callback();
                });
            });
        }
    };
};

