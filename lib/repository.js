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
            return saved.ownProperties()
                .filter(function(value) {
                    return withinHierarchy(path, value);
                }).map(function(key) {
                    return saved[key];
                }).flatten();
        },

        save: function(obj) {
            if (!saved.hasOwnProperty(obj.path)) {
                saved[obj.path] = [];
            }
            saved[obj.path].push(obj);
        }
    };
}
