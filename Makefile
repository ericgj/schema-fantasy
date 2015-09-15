
browserify        = browserify
BUILD_DIR         = .
SOURCE_FILES      = index.js $(wildcard src/*.js) $(wildcard src/v4/*.js)
TEST_SOURCE_FILES = $(wildcard test/*.js)
SOURCE_ROOT       = index.js
TEST_SOURCE_ROOT  = test/tests.js


build: lint $(BUILD_DIR)/build.js

test-build: $(BUILD_DIR)/test-build.js

lint:
	@jshint $(SOURCE_FILES) $(TEST_SOURCE_FILES) || true

$(BUILD_DIR)/build.js: $(SOURCE_FILES)
	$(browserify) $(SOURCE_ROOT) --debug --outfile $@

$(BUILD_DIR)/test-build.js: $(SOURCE_FILES) $(TEST_SOURCE_FILES)
	browserify $(TEST_SOURCE_ROOT) --debug --outfile $@

clean:
	rm $(BUILD_DIR)/build.js $(BUILD_DIR)/test-build.js

.PHONY: build test-build lint clean

