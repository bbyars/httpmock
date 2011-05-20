'use strict';

require('../testExtensions');

var testCase = require('nodeunit').testCase,
    spawn = require('child_process').spawn,
    isValidPortNumber = require('ports').isValidPortNumber,
    isPortInUse = require('ports').isPortInUse;

exports.Ports = testCase({
    'undefined is not a valid port': function (test) {
        test.notOk(isValidPortNumber(undefined));
        test.done();
    },

    'a float is not a valid port': function (test) {
        test.notOk(isValidPortNumber(123.1));
        test.done();
    },

    'ports must be in the correct range': function (test) {
        test.notOk(isValidPortNumber(0), '0 should not be valid');
        test.ok(isValidPortNumber(1), '1 should be valid');
        test.ok(isValidPortNumber(65535), '65535 should be valid');
        test.notOk(isValidPortNumber(65536), '65536 should not be valid');
        test.done();
    },

    'isPortInUse detects used port': function (test) {
        // Not a great test - assumes both that you have netcat installed,
        // and that port 3333 is currently unused.  Any better ideas?
        var netcat = spawn('nc', ['-l', 3333]);
        isPortInUse(3333, function (isInUse) {
            test.ok(isInUse);
            netcat.kill();
            test.done();
        });
    },

    'isPortInUse detects unused port': function (test) {
        isPortInUse(3333, function (isInUse) {
            test.notOk(isInUse);
            test.done();
        });
    }
});
