default: test lint

test: unit_test functional_test

unit_test: FORCE
	scripts/run_tests test/unit

functional_test: FORCE
	scripts/run_tests test/functional

lint:
	find . -path './deps' -prune -o -name "*.js" -print | xargs deps/nodelint/nodelint --config jslint.config

FORCE:
