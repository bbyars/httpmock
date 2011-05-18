PORT = 3000
VERSION = 0.2.0
BUILD_DIR = $(PWD)/build
PACKAGE_DIR = $(BUILD_DIR)/package
REPORTS_DIR = $(BUILD_DIR)/reports

.PHONY: default clean start stop java test unit_test functional_test lint package

default: clean test lint java stop package

clean:
	-rm -rf $(BUILD_DIR)

start:
	server/scripts/stop_server
	server/scripts/start_server $(PORT) &
	sleep 1

stop:
	server/scripts/stop_server

java: start
	url=http://localhost:$(PORT) ant -Dversion=$(VERSION) -Dreports.dir=$(REPORTS_DIR)/java -Dpackage.dir=$(PACKAGE_DIR)/java -f clients/java/build.xml
	
test: unit_test functional_test

unit_test:
	server/scripts/run_tests test/unit

functional_test: start
	port=$(PORT) server/scripts/run_tests test/functional

lint:
	find server -path 'server/deps' -prune -o \( -name "*.js" -o -name run_tests -o -name start_server \) -print | xargs server/deps/nodelint/nodelint --config server/jslint.config

package:
	mkdir -p $(PACKAGE_DIR)
	cp -R server $(PACKAGE_DIR)
	cat $(PACKAGE_DIR)/server/package.json.template | sed 's/{VERSION}/$(VERSION)/' > $(PACKAGE_DIR)/server/package.json
	rm $(PACKAGE_DIR)/server/package.json.template
