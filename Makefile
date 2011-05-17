default: test lint

java:
	ant -Dversion=$1 -f clients/java/build.xml
	
test: unit_test functional_test

unit_test: FORCE
	server/scripts/run_tests test/unit

functional_test: FORCE
	server/scripts/run_tests test/functional

lint:
	find server -path 'server/deps' -prune -o \( -name "*.js" -o -name run_tests -o -name start_server \) -print | xargs server/deps/nodelint/nodelint --config server/jslint.config

FORCE:
