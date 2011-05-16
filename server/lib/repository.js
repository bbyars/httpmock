'use strict';

var create = function () {
    var requests = [];

    function withinHierarchy(ancestor, maybeDescendant) {
        var canonicalize = function (path) {
            return path.replace(/\/$/, '').toLowerCase() + '/';
        };
        return canonicalize(maybeDescendant).indexOf(canonicalize(ancestor)) === 0;
    }

    function load(containingPath) {
        return requests.filter(function (value) {
            return withinHierarchy(containingPath, value.path);
        });
    }

    function save(request) {
        requests.push(request);
    }

    return {
        load: load,
        save: save
    };
};

exports.create = create;
