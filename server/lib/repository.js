create = function () {
    var requests = [];

    var withinHierarchy = function (ancestor, maybeDescendant) {
        var canonicalize = function (path) {
            return path.replace(/\/$/, '').toLowerCase() + '/';
        };
        return canonicalize(maybeDescendant).indexOf(canonicalize(ancestor)) === 0;
    };

    var load = function (containingPath) {
        return requests.filter(function (value) {
            return withinHierarchy(containingPath, value.path);
        });
    };

    var save = function (request) {
        requests.push(request);
    };

    return {
        load: load,
        save: save
    };
};

exports.create = create;
