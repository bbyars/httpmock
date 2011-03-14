'use strict';

Object.prototype.merge = function (other) {
    for (var prop in other) {
        if (other.hasOwnProperty(prop)) {
            this[prop] = other[prop];
        }
    }
    return this;
};

String.prototype.format = function () {
    var formatted = this,
        arg;

    for (arg in arguments) {
        formatted = formatted.replace("{" + arg + "}", arguments[arg]);
    }
    return formatted;
};

