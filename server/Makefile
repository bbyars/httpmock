default: test lint

test: FORCE
	scripts/run_tests

lint:
	find . -path '/deps' -prune -o -name "*.js" -print | xargs deps/nodelint/nodelint

FORCE:
