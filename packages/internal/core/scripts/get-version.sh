#!/usr/bin/env bash

git describe --tags --first-parent --abbrev=11 --long --dirty --always
