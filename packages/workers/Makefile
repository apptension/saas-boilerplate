SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../Makefile.base.mk

lint:
	pnpm nx lint

test:
	pnpm nx test

build:
	pnpm nx build

deploy:
	pnpm nx deploy

flake8:
	flake8

black:
	docker-compose run -T workers run black --config=pyproject.toml .

invoke-local: d ?= {}
invoke-local:
	docker-compose run -T workers node_modules/.bin/sls invoke local -f=$(f) -d=$(d)

shell:
	docker-compose run --rm workers bash
