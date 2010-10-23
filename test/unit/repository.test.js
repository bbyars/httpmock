var TestFixture = require('nodeunit').testCase;
var repository = require('lib/repository');
var sys = require('sys');

function assertEqual(test, spec) {
    test.strictEqual(sys.inspect(spec.actual), sys.inspect(spec.expected), spec.message);
}

function verify(numberOfAsserts, testMethod) {
    return function(test) {
        test.expect(numberOfAsserts);
        test.jsonEquals = function(spec) {
            test.strictEqual(sys.inspect(spec.actual), sys.inspect(spec.expected), spec.message);
        };
        testMethod(test);
        test.done();
    };
}

exports['Repository'] = TestFixture({
    'should return empty array if nothing recorded': verify(1, function(test) {
        var requests = repository.load('path');
        test.jsonEquals({expected: [], actual: requests});
    }),

    'should return request if under correct path': verify(1, function(test) {
        var request = {path: 'test'};
        repository.save(request);
        var requests = repository.load('test');
        test.jsonEquals({expected: [request], actual: requests});
    })
});

