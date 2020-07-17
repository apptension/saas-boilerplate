SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../base.mk

install:
	yarn

clean:
	rm -rf build

build: export REACT_APP_VERSIONS_BASE_URL := https://$(PROJECT_NAME)-version-matrix.s3-$(AWS_DEFAULT_REGION).amazonaws.com
build: clean
	yarn build

deploy:
	@echo "Deploy"
