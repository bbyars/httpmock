Object.prototype.ownProperties = function() {
    var results = [];
    for (var prop in this) {
        if (this.hasOwnProperty(prop)) {
            results.push(prop);
        }
    }
    return results;
}
