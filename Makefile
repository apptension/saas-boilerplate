SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/Makefile.base.mk


setup:
	pnpm nx run-many --skip-nx-cache --target=setup --projects=core,backend,workers,webapp,e2e-tests

#
# Infrastructure deployment
#


upload-version:
	pnpm nx run --output-style=stream tools:upload-version migrations,api,workers,webapp

#
# Packages deployment
#

stop-task-scheduling-executions:
	pnpm nx run --output-style=stream workers:stop-task-scheduling-executions

#
# Helper rules
#

create-repo-auth-url:
	pnpm nx run --output-style=stream tools:create-cicd-creds

create-docker-volume:
	pnpm nx run --output-style=stream core:docker-create-volumes
