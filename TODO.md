## Refactorings
* Remove string.format for something more javascript like
* Pass console.log around, allows using different logger
* Move the (path || '/') logic to repository

## Build
* Pretty up github release page
* Add test coverage

## Functionality
* Add HTML pages for the different rel urls
* Content negotiation (look for right content type)
* Add smtp mocking, with same REST API (create servers on demand)
    * Would be nice as a plugin, allow other protocols as plugins
    * Add protocol to post /servers, use same REST API for each
    * Allow bin/httpmock to accept a parameter to a plugins path, allowing dynamic extension
* Accept HTML; allow QA's to manually set up tests
* Allow ordering stub calls to same path to simulate state change
* Other language bindings
    * C#
    * bash (allow scripted setups)

## Bugs
* isPortInUse gives intermittent test failures (timing issue?)

