PWD ?= pwd_unknown
BASE_DIR := $(dir $(lastword $(MAKEFILE_LIST)))

export PROJECT_ROOT_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
export PACKAGES_DIR := $(BASE_DIR)packages

ifndef ENV_STAGE:
	-include $(BASE_DIR).env
else
	-include $(BASE_DIR).env.$(ENV_STAGE)
	export ENV_STAGE
endif

ifeq ($(user),)
# USER retrieved from env, UID from shell.
HOST_USER ?= $(strip $(if $(USER),$(USER),nodummy))
HOST_UID ?= $(strip $(if $(shell id -u),$(shell id -u),4000))
else
# allow override by adding user= and/ or uid=  (lowercase!).
# uid= defaults to 0 if user= set (i.e. root).
HOST_USER = $(user)
HOST_UID = $(strip $(if $(uid),$(uid),0))
endif

CMD_ARGUMENTS ?= $(cmd)

export HOST_USER
export HOST_UID

# As specified in
# https://www.gnu.org/software/make/manual/html_node/Choosing-the-Shell.html,
# the variable SHELL is never set from the environment.
# As such, default shell of the user has to be get the other way.
USER_SHELL=$(shell env | grep '^SHELL=' | cut -d '=' -f 2)



aws-login:
	aws-vault login $(AWS_VAULT_PROFILE)


secrets-editor: SERVICE_NAME?=
secrets-editor:
	pnpm nx run ssm-editor:compose-build-image
	docker-compose run --rm --entrypoint /bin/bash ssm-editor /scripts/run.sh $(SERVICE_NAME)
