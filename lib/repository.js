var saved = [];

exports.load = function(path) {
    return saved;
}

exports.save = function(obj) {
    saved.push(obj);
}
