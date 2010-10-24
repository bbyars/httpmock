Object.prototype.ownProperties = function() {
    var results = [];
    for (var prop in this) {
        if (this.hasOwnProperty(prop) && (typeof this[prop] !== 'function')) {
            results.push(prop);
        }
    }
    return results;
};

Array.prototype.flatten = function() {
    var results = [];
    for (var i = 0; i < this.length; i++) {
        results = results.concat(this[i]);
    }
    return results;
}
