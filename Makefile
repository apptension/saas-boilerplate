SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/Makefile.base.mk

bootstrap-infra:
	nx run tools:bootstrap-infra

setup:
	nx run-many --skip-nx-cache --target=setup --projects=core,backend,workers,webapp,e2e-tests

#
# Infrastructure deployment
#

deploy-env-infra:
	nx run --output-style=stream infra-shared:deploy:global
	nx run --output-style=stream infra-shared:deploy:main
	nx run --output-style=stream infra-shared:deploy:db
	nx run --output-style=stream infra-functions:deploy
	nx run --output-style=stream infra-shared:deploy:ci
	nx run --output-style=stream infra-shared:deploy:components

upload-version:
	nx run --output-style=stream tools:upload-version migrations,api,workers,webapp

#
# Packages deployment
#

build:
	nx run-many --output-style=stream --target=build backend,workers,webapp

lint:
	nx run-many --output-style=stream --target=lint

deploy-components:
	nx run --output-style=stream infra-shared:deploy:components

deploy-env-app: deploy-components
	nx run-many --output-style=stream --target=deploy --projects=backend,workers,webapp

stop-task-scheduling-executions:
	nx run --output-style=stream workers:stop-task-scheduling-executions

#
# Helper rules
#

psql:
	docker compose exec db psql -d'backend' -U'backend'

create-repo-auth-url:
	nx run --output-style=stream tools:create-cicd-creds

create-docker-volume:
	nx run --output-style=stream core:docker-create-volumes
