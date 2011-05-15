== Refactorings ==
* Remove string.format for something more javascript like
* Remove verify, unit Test - use something like what Sino does
* filter out stub matching logic into module, unit test

== Build ==
* Use nvm
* add jslint
* start server as part of build
* packages: npm, brew
* web page with artifacts
* versioning in artifacts
* config file to save port for java tests (config for node tests)

== Functionality ==
* Accept HTML; allow QA's to manually set up tests
* Add HTML pages for the different rel urls
* Allow retrieving stubs per server, deleting some
* Allow ordering stub calls to same path to simulate state change
* Add endpoint to set defaults for stubs?
* Add smtp mocking, with same REST API (create servers on demand)

== Bugs ==
* isPortInUse gives intermittent test failures (timing issue?)
