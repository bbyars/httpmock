PORT = 3000
PIDFILE = httpmock.pid
VERSION = 0.2.0
BUILD_DIR = $(PWD)/build
PACKAGE_DIR = $(BUILD_DIR)/package
REPORTS_DIR = $(BUILD_DIR)/reports

.PHONY: default clean start stop java test unit_test functional_test lint package

default: clean test lint java stop package

clean:
	-rm -rf $(BUILD_DIR)

start:
	server/bin/httpmock restart --port $(PORT) --pidfile $(PIDFILE) &
	sleep 1

stop:
	server/bin/httpmock stop --pidfile $(PIDFILE)

java: start
	url=http://localhost:$(PORT) ant -Dversion=$(VERSION) -Dreports.dir=$(REPORTS_DIR)/java -Dpackage.dir=$(PACKAGE_DIR)/java -f clients/java/build.xml
	
test: unit_test functional_test

unit_test:
	port=$(PORT) server/bin/run_tests test/unit

functional_test: start
	port=$(PORT) server/bin/run_tests test/functional

lint:
	find server -path 'server/deps' -prune -o \( -name "*.js" -o -name run_tests -o -name httpmock \) -print | xargs server/deps/nodelint/nodelint --config server/jslint.config

package:
	mkdir -p $(PACKAGE_DIR)
	cp -R server $(PACKAGE_DIR)
	cat $(PACKAGE_DIR)/server/package.json.template | sed 's/{VERSION}/$(VERSION)/' > $(PACKAGE_DIR)/server/package.json
	rm $(PACKAGE_DIR)/server/package.json.template
