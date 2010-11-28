Object.prototype.ownProperties = function() {
    var results = [];
    for (var prop in this) {
        if (this.hasOwnProperty(prop) && (typeof this[prop] !== 'function')) {
            results.push(prop);
        }
    }
    return results;
};

Object.prototype.merge = function(other) {
    for (var prop in other) {
        if (other.hasOwnProperty(prop)) {
            this[prop] = other[prop];
        }
    }
    return this;
};

Array.prototype.flatten = function() {
    return this.reduce(function (accumulator, next) {
        return accumulator.concat(next);
    }, []);
}

String.prototype.format = function() {
    var formatted = this;
    for (arg in arguments) {
        formatted = formatted.replace("{" + arg + "}", arguments[arg]);
    }
    return formatted;
};

