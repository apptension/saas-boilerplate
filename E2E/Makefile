SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../base.mk

.PHONY: test secrets

pull-base-image:
	/bin/sh ./scripts/pull-base-image.sh

build-base-image:
	sh ./scripts/build-base-image.sh

build-image: pull-base-image
	$(DOCKER_COMPOSE) build --build-arg "BASE_IMAGE=${PROJECT_NAME}-e2e-base:latest" e2e

test: CHAMBER_SERVICE_NAME=env-${PROJECT_ENV_NAME}-e2e
test: build-image
	$(DOCKER_COMPOSE) run e2e sh -c "/bin/chamber exec ${CHAMBER_SERVICE_NAME} -- ./scripts/run_tests.sh"

secrets: export CHAMBER_SERVICE=e2e
secrets:
	$(DOCKER_COMPOSE) build ssmeditor
	$(DOCKER_COMPOSE) run --rm ssmeditor
