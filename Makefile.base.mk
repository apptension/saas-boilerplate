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

up:
	nx run --output-style=stream core:docker-compose:up

down:
	nx run --output-style=stream core:docker-compose:down

serve:
	nx run --output-style=stream core:serve

clean:
	# remove created images
	@docker-compose -p  down --remove-orphans --rmi all 2>/dev/null \
	&& echo 'Image(s) removed.' \
	|| echo 'Image(s) already removed.'

prune:
	# clean all that is not actively used
	docker system prune -af


login:
	aws-vault exec $(AWS_VAULT_PROFILE) -- $(USER_SHELL)

secrets-editor: SERVICE_NAME?=
secrets-editor:
	nx run ssm-editor:compose-build-image
	docker-compose run --rm --entrypoint /bin/bash ssm-editor /scripts/run.sh $(SERVICE_NAME)
