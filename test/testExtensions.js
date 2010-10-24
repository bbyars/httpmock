var sys = require('sys');

exports.verify = function(testMethod, numberOfAsserts) {
    return function(test) {
        numberOfAsserts = numberOfAsserts || 1;
        test.expect(numberOfAsserts);

        test.jsonEquals = function(spec) {
            test.strictEqual(sys.inspect(spec.actual), sys.inspect(spec.expected), spec.message);
        };

        testMethod(test);

        test.done();
    };
}

