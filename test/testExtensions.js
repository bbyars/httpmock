var sys = require('sys'),
    http = require('http');

var toJSON = function(obj) {
    return typeof obj === 'string' ? obj : sys.inspect(obj);
};

var addCustomAsserts = function(test) {
    test.jsonEquals = function(spec) {
        var message = spec.message ||
            'JSON not equal\nExpected:\n' + toJSON(spec.expected) + '\n\nActual:\n' + toJSON(spec.actual);
        test.strictEqual(toJSON(spec.actual), toJSON(spec.expected), message);
    };
}

var getResponse = function(spec) {
console.log("Got in getResponse...");
    var localhost = http.createClient(3000, 'localhost');
    var request = localhost.request(spec.method, spec.endpoint, spec.headers);
    request.write(toJSON(spec.body));
    request.end();

    request.on('response', function(response) {
console.log("in response handler");
        var responseBody = "";
        response.setEncoding('utf8');

        response.addListener("data", function(chunk) {
console.log("in data handler");
            responseBody += chunk;
        });

        response.on('end', function() {
console.log("in end handler");
            response.body = responseBody;
            spec.callback(response);
        });
    });
}

exports.unit = function(callback, numberOfAsserts) {
    return function(test) {
        addCustomAsserts(test);
        test.expect(numberOfAsserts || 1);

        callback(test);

        test.done();
    };
}

exports.functional = function(spec) {
    return function(test) {
        addCustomAsserts(test);
        test.expect(spec.numberOfAsserts || 1);

        var testCallback = spec.callback;
        spec.callback = function(response) {
            testCallback(test, response);
        };

        getResponse(spec);
    };
};

exports.getResponse = getResponse;
