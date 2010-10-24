require('./extensions');

var withinHierarchy = function(ancestor, maybeDescendant) {
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

exports.create = function() {
    saved = {};

    return {
        load: function(path) {
            var results = [];
            for (var key in saved.ownProperties()) {
                if (withinHierarchy(path, key)) {
                    results = results.concat(saved[key]);
                }
            }
            return results;
        },

        save: function(obj) {
            if (!saved.hasOwnProperty(obj.path)) {
                saved[obj.path] = [];
            }
            saved[obj.path].push(obj);
        }
    };
}
