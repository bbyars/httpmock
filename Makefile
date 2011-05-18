PORT = 3000
VERSION = 0.2.0

.PHONY: default clean start stop java test unit_test functional_test lint package

default: clean test lint java stop package

clean:
	-rm -rf build

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

package:
	mkdir -p build/package	
	cp -R server build/package
	cat build/package/server/package.json.template | sed 's/{VERSION}/$(VERSION)/' > build/package/server/package.json
	rm build/package/server/package.json.template
