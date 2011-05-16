'use strict';

String.prototype.format = function () {
    var formatted = this,
        i;

    for (i = 0; i < arguments.length; i += 1) {
        formatted = formatted.replace("{" + i + "}", arguments[i]);
    }
    return formatted;
};

