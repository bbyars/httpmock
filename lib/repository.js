require('./extensions');

var fileSystem = require('fs'),
    path = require('path'),
    exec = require('child_process').exec;

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

var counter = 0,
    baseDir = 'data',
    requestsDir = baseDir + '/requests';


exports.clear = function (callback) {
    exec('rm -rf ' + baseDir, function (error) {
        if (error) {
            console.log(error);
        }
        callback();
    });
};

exports.load = function (containingPath, callback) {
    var results;
    path.exists(requestsDir, function (exists) {
        if (!exists) {
            callback([]);
        }
        else {
            fileSystem.readdir(requestsDir, function (error, files) {
                if (error) {
                    throw error;
                }
                results = files.map(function (file) {
                    return JSON.parse(fileSystem.readFileSync(path.join(requestsDir, file), 'utf8'));
                }).filter(function (value) {
                    return withinHierarchy(containingPath, value.path);
                });
                callback(results);
            });
        }
    });
};

exports.save = function (data, callback) {
    path.exists(baseDir, function (exists) {
        if (!exists) {
            fileSystem.mkdirSync(baseDir, 0755);
            fileSystem.mkdirSync(requestsDir, 0755);
        }

        counter += 1;
        fileSystem.writeFile(requestsDir + '/' + counter, JSON.stringify(data), function (error) {
            if (error) {
                throw error;
            }
            callback();
        });
    });
};

/*
/{port}
    /requests
        1
        2
        3
        4
    /stubs
*/
