'use strict';


var parse = function(argv, defaultOptions) {
    var parseOption = function (key, value) {
        var OPTION_PREFIX = /^--/,
        optionName;

        if (key.match(OPTION_PREFIX) === null) {
            error("Invalid option '" + key + "'.");
        }
        optionName = key.replace(OPTION_PREFIX, '');

        if (!defaultOptions.hasOwnProperty(optionName)) {
            error("Option '" + optionName + "' not recognized.");
        }
        if (value === undefined) {
            error("No argument provided for option '" + optionName + "'.");
        }

        return {
            key: optionName,
            value: value
        };
    };

    var parseOptions = function () {
        var options = {},
        option,
        key,
        i;

        // Add custom options
        for (i = 1; i < argv.length; i += 2) {
            option = parseOption(argv[i], argv[i+1]);
            options[option.key] = option.value;
        }

        // add default options
        for (key in defaultOptions) {
            if (defaultOptions.hasOwnProperty(key) && !options.hasOwnProperty(key)) {
                options[key] = defaultOptions[key];
            }
        }

        return options;
    };

    var parseCommand = function () {
        var command = argv[0];

        if (command === undefined) {
            error("Missing command.");
        }
        return command;
    };

    return {
        command: parseCommand(),
        options: parseOptions()
    };
};

exports.parse = parse;
