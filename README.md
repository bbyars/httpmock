# httpmock - Stubbing out third party web services

httpmock is a library for stubbing out web services without changing the system under test.  It's designed for functional testing, where you want to test your code full-stack, but you don't want your tests to fail because of instability in services being developed by other teams.  It can also be used when adding tests to a codebase that wasn't factored well for unit testing.

## Prerequisites

httpmock is composed of two parts: a server that sits in for the third party web service, and client bindings.  The server is written using [node.js](http://nodejs.org/).  The client bindings are written in whatever language you are using (Java is the only supported one at the moment).

Node.js is the only dependency to get the server up and running.  Node.js will work on any unix-like platform (including cygwin).  The easiest way to install it is probably you're package manager (e.g. `brew install node`).

## Installation and Setup

Download httpmock to the server, and run the following:
`cd server`
`node ./run_server`

That will run the control server (see below) on port 3000.  You can optionally pass another command line argument to change the port.

The client bindings will simply be a library.  For Java, add httpmock.jar to your classpath.

## API

The Java API is a work in progress.  For examples, look under clients/java/functional-test/org/httpmock/WasCalledAtFunctionalTest.java to see example verifications and clients/java/functional-test/org/httpmock/StubbingFunctionalTest.java for stubbing examples.

## Building

To build everything, run `build` from a bash-like shell.  The server can be tested with the following:
`cd server`
`./run_server`
`./run_tests`

The Java library can be built and tested (assuming the server is running) with the following:
`cd clients/java`
`ant`

## Contributing

Contributions are welcome (see TODO for my own open loops, although I welcome other ideas).  You can reach me at brandon.byars@gmail.com.
