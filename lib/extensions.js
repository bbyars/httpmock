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
    var results = [];
    for (var i = 0; i < this.length; i++) {
        results = results.concat(this[i]);
    }
    return results;
}

String.prototype.format = function() {
    var formatted = this;
    for (arg in arguments) {
        formatted = formatted.replace("{" + arg + "}", arguments[arg]);
    }
    return formatted;
};

