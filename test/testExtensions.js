exports.verify = function (f) {
    return function (test) {
        addCustomAsserts(test);
        f(test);
    };
};

exports.unitTest = function (f) {
    return function (test) {
        addCustomAsserts(test);
        f(test);
        test.done();
    };
};

var addCustomAsserts = function (test) {
    test.jsonEquals = function (actual, expected, message) {
        message = message || 'JSON not equal\nExpected:\n{0}\n\nActual:\n{1}'.format(
            JSON.stringify(expected), JSON.stringify(actual)
        );
        test.strictEqual(JSON.stringify(actual), JSON.stringify(expected), message);
    };

    test.notOk = function (actual, message) {
        test.ok(!actual, message);
    };
};
