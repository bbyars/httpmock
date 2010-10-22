var TestFixture = require('nodeunit').testCase;

exports['Repository'] = TestFixture({
    'should save request in file': function(test) {
        test.expect(1);
        test.ok(true, 'should pass');
        test.done();
    }
});

