PORT = 3000
VERSION = 0.6.0

.PHONY: default start stop java test unit_test functional_test lint

default: test lint java stop

start:
	server/scripts/stop_server
	server/scripts/start_server $(PORT) &
	sleep 1

stop:
	server/scripts/stop_server

java: start
	url=http://localhost:$(PORT) ant -Dversion=$(VERSION) -f clients/java/build.xml
	
test: unit_test functional_test

unit_test:
	server/scripts/run_tests test/unit

functional_test: start
	port=$(PORT) server/scripts/run_tests test/functional

lint:
	find server -path 'server/deps' -prune -o \( -name "*.js" -o -name run_tests -o -name start_server \) -print | xargs server/deps/nodelint/nodelint --config server/jslint.config
