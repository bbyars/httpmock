## Refactorings
* filter out stub matching logic into module, unit test
* Remove string.format for something more javascript like
* Move cli object in bin/httpmock to lib (we need to require from that dir anyhow)
** Add tests

## Build
* packages: npm, brew
* web page with artifacts
* Add test coverage

## Functionality
* Add HTML pages for the different rel urls
* Content negotiation (look for right content type)
* Add smtp mocking, with same REST API (create servers on demand)
    * Would be nice as a plugin, allow other protocols as plugins
    * Add protocol to post /servers, use same REST API for each
* Accept HTML; allow QA's to manually set up tests
* Allow ordering stub calls to same path to simulate state change

## Bugs
* isPortInUse gives intermittent test failures (timing issue?)

