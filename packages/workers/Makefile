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


secrets: export CHAMBER_SERVICE=workers
secrets:
	docker-compose build ssmeditor
	docker-compose run --rm ssmeditor
	sls "invoke" "local" "-f" "SynchronizeContentfulContent" "-d" "{\"source\":\"backend.contentfulSync\",\"detail-type\":\"complete\",\"detail\":{\"id\":\"56f478a32bb54ff6adf91b2f19ca6c1a\",\"type\":\"complete\"}}"