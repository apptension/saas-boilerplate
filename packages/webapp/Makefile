SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../Makefile.base.mk

.PHONY: build test

test:
	pnpm nx test

build:
	pnpm nx build

deploy:
	pnpm nx deploy
