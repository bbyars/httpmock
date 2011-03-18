'use strict';

String.prototype.format = function () {
    var formatted = this,
        arg;

    for (arg in arguments) {
        formatted = formatted.replace("{" + arg + "}", arguments[arg]);
    }
    return formatted;
};

