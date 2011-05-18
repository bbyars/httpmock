## Refactorings
* Remove string.format for something more javascript like
* Remove verify, unit Test - use something like what Sino does
* filter out stub matching logic into module, unit test

## Build
* Package up server, jarfiles for release, with version
* packages: npm, brew, jar, etc...
* web page with artifacts
* versioning in artifacts
* config file to save port for java tests (config for node tests)
* Add test coverage
* Allow start/stop scripts to start/stop multiple, differing by port

## Functionality
* Accept HTML; allow QA's to manually set up tests
* Add HTML pages for the different rel urls
* Allow retrieving stubs per server, deleting some
* Allow ordering stub calls to same path to simulate state change
* Add endpoint to set defaults for stubs?
* Add smtp mocking, with same REST API (create servers on demand)
    * Would be nice as a plugin, allow other protocols as plugins
* Content negotiation (look for right content type)

## Bugs
* isPortInUse gives intermittent test failures (timing issue?)

