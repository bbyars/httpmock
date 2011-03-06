var TestFixture = require('nodeunit').testCase,
    unitTest = require('testExtensions').unitTest,
    verify = require('testExtensions').verify,
    spawn = require('child_process').spawn,
    isValidPortNumber = require('helpers').isValidPortNumber,
    isPortInUse = require('helpers').isPortInUse;

exports['Helpers'] = TestFixture({
    'undefined is not a valid port': unitTest(function (test) {
        test.notOk(isValidPortNumber(undefined));
    }),

    'a float is not a valid port': unitTest(function (test) {
        test.notOk(isValidPortNumber(123.1));
    }),

    'ports must be in the correct range': unitTest(function (test) {
        test.notOk(isValidPortNumber(0), '0 should not be valid')
        test.ok(isValidPortNumber(1), '1 should be valid');
        test.ok(isValidPortNumber(65535), '65535 should be valid');
        test.notOk(isValidPortNumber(65536), '65536 should not be valid');
    }),

    'isPortInUse detects used port': verify(function (test) {
        // Not a great test - assumes both that you have netcat installed,
        // and that port 3333 is currently unused.  Any better ideas?
        var netcat = spawn('nc', ['-l', 3333]);
        isPortInUse(3333, function (isInUse) {
            test.ok(isInUse);
            netcat.kill();
            test.done();
        });
    }),

    'isPortInUse detects unused port': verify(function (test) {
        isPortInUse(3333, function (isInUse) {
            test.notOk(isInUse);
            test.done();
        });
    })
});
