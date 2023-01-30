SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/Makefile.base.mk

bootstrap-infra:
	nx run tools:bootstrap-infra

setup:
	nx run-many --skip-nx-cache --target=setup --projects=core,backend,workers,webapp,e2e-tests

#
# Infrastructure deployment
#

deploy-global-infra:
	nx run infra:deploy:global

deploy-global-tools:
	nx run infra:deploy:global-tools

deploy-env-infra:
	nx run infra:deploy:env

upload-version:
	nx run tools:upload-version migrations,api,workers,webapp

#
# Packages deployment
#

build:
	nx run-many --target=build

deploy-components:
	nx run infra:deploy:components

deploy-env-app: deploy-components
	nx run-many --target=deploy --projects=backend,workers,webapp

stop-task-scheduling-executions:
	nx run workers:stop-task-scheduling-executions

#
# Helper rules
#

psql:
	docker compose exec db psql -d'backend' -U'backend'

create-repo-auth-url:
	nx run tools:create-cicd-creds

create-docker-volume:
	nx run core:docker-create-volumes
