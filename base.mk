PWD ?= pwd_unknown
BASE_DIR := $(dir $(lastword $(MAKEFILE_LIST)))

export PROJECT_ROOT_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
export SERVICES_DIR := $(BASE_DIR)services

CONFIG_FILE ?= $(BASE_DIR)/.awsboilerplate.json

define GetFromCfg
$(shell node -p "require('$(CONFIG_FILE)').$(1)")
endef

export ENV_STAGE ?= $(call GetFromCfg,defaultEnv)
export PROJECT_NAME ?= $(call GetFromCfg,projectName)
export PROJECT_ENV_NAME = $(PROJECT_NAME)-$(ENV_STAGE)
export AWS_DEFAULT_REGION ?= $(call GetFromCfg,aws.region)

ENV_CONFIG_FILE ?= $(BASE_DIR)/.awsboilerplate.$(ENV_STAGE).json

define GetFromEnvCfg
$(shell node -p "require('$(ENV_CONFIG_FILE)').$(1)")
endef

export TOOLS_ENABLED := $(call GetFromCfg,toolsConfig.enabled)

AWS_VAULT_PROFILE ?= $(call GetFromCfg,aws.profile)
AWS_VAULT = aws-vault exec $(AWS_VAULT_PROFILE) --

ifeq ($(CI),true)
	VERSION := $(shell cat $(BASE_DIR)/VERSION)
	DOCKER_COMPOSE = docker-compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.ci.yml
else
	VERSION := $(shell git describe --tags --first-parent --abbrev=11 --long --dirty --always)
	DOCKER_COMPOSE = docker-compose
endif

export VERSION

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


version:
	@echo $(VERSION)

install-infra-cdk:
	$(MAKE) -C $(BASE_DIR)/infra/cdk install

install-infra-functions:
	$(MAKE) -C $(BASE_DIR)/infra/functions install

install-scripts:
	$(MAKE) -C $(BASE_DIR)/scripts install

# Run shell with pre-configured environment.
shell:
	$(USER_SHELL)

aws-vault:
	$(AWS_VAULT) $(USER_SHELL)

up:
	$(DOCKER_COMPOSE) up --build --force-recreate

down:
	# run as a (background) service
	docker-compose down

clean:
	# remove created images
	@docker-compose -p  down --remove-orphans --rmi all 2>/dev/null \
	&& echo 'Image(s) removed.' \
	|| echo 'Image(s) already removed.'

prune:
	# clean all that is not actively used
	docker system prune -af

upload-service-version:
ifeq ($(ENV_STAGE),local)
	@echo "Skipping upload-service-version for local env"
else ifneq ($(TOOLS_ENABLED),true)
	@echo "Global tools are disabled. Skipping upload-service-version"
else
	node $(BASE_DIR)/scripts/upload-service-version.js $(SERVICE_NAME) $(SERVICE_PARAMS)
endif

