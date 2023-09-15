# SaaS Boilerplate CLI

<!-- toc -->

- [SaaS Boilerplate CLI](#saas-boilerplate-cli)
- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ pnpm i -w
$ saas COMMAND
running command...
$ saas (--version)
@sb/cli/2.0.3 darwin-arm64 node-v18.15.0
$ saas --help [COMMAND]
USAGE
  $ saas COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`saas autocomplete [SHELL]`](#saas-autocomplete-shell)
- [`saas aws get-env`](#saas-aws-get-env)
- [`saas aws login`](#saas-aws-login)
- [`saas aws set-env ENVSTAGE`](#saas-aws-set-env-envstage)
- [`saas backend black`](#saas-backend-black)
- [`saas backend build`](#saas-backend-build)
- [`saas backend build-docs`](#saas-backend-build-docs)
- [`saas backend deploy api`](#saas-backend-deploy-api)
- [`saas backend deploy migrations`](#saas-backend-deploy-migrations)
- [`saas backend down`](#saas-backend-down)
- [`saas backend makemigrations`](#saas-backend-makemigrations)
- [`saas backend migrate`](#saas-backend-migrate)
- [`saas backend remote-shell`](#saas-backend-remote-shell)
- [`saas backend ruff`](#saas-backend-ruff)
- [`saas backend secrets`](#saas-backend-secrets)
- [`saas backend shell`](#saas-backend-shell)
- [`saas backend stripe sync`](#saas-backend-stripe-sync)
- [`saas backend test`](#saas-backend-test)
- [`saas backend up`](#saas-backend-up)
- [`saas build`](#saas-build)
- [`saas ci create-credentials`](#saas-ci-create-credentials)
- [`saas db shell`](#saas-db-shell)
- [`saas deploy`](#saas-deploy)
- [`saas docs build`](#saas-docs-build)
- [`saas docs deploy`](#saas-docs-deploy)
- [`saas docs up`](#saas-docs-up)
- [`saas down`](#saas-down)
- [`saas emails build`](#saas-emails-build)
- [`saas emails secrets`](#saas-emails-secrets)
- [`saas emails test`](#saas-emails-test)
- [`saas help [COMMANDS]`](#saas-help-commands)
- [`saas infra bootstrap`](#saas-infra-bootstrap)
- [`saas infra deploy [STACKNAME]`](#saas-infra-deploy-stackname)
- [`saas lint`](#saas-lint)
- [`saas plugins`](#saas-plugins)
- [`saas plugins:install PLUGIN...`](#saas-pluginsinstall-plugin)
- [`saas plugins:inspect PLUGIN...`](#saas-pluginsinspect-plugin)
- [`saas plugins:install PLUGIN...`](#saas-pluginsinstall-plugin-1)
- [`saas plugins:link PLUGIN`](#saas-pluginslink-plugin)
- [`saas plugins:uninstall PLUGIN...`](#saas-pluginsuninstall-plugin)
- [`saas plugins:uninstall PLUGIN...`](#saas-pluginsuninstall-plugin-1)
- [`saas plugins:uninstall PLUGIN...`](#saas-pluginsuninstall-plugin-2)
- [`saas plugins update`](#saas-plugins-update)
- [`saas up`](#saas-up)
- [`saas webapp build`](#saas-webapp-build)
- [`saas webapp deploy`](#saas-webapp-deploy)
- [`saas webapp graphql download-schema`](#saas-webapp-graphql-download-schema)
- [`saas webapp lint`](#saas-webapp-lint)
- [`saas webapp secrets`](#saas-webapp-secrets)
- [`saas webapp test`](#saas-webapp-test)
- [`saas webapp up`](#saas-webapp-up)
- [`saas workers black`](#saas-workers-black)
- [`saas workers build`](#saas-workers-build)
- [`saas workers deploy`](#saas-workers-deploy)
- [`saas workers invoke local`](#saas-workers-invoke-local)
- [`saas workers lint`](#saas-workers-lint)
- [`saas workers secrets`](#saas-workers-secrets)
- [`saas workers shell`](#saas-workers-shell)
- [`saas workers test`](#saas-workers-test)

## `saas autocomplete [SHELL]`

display autocomplete installation instructions

```
USAGE
  $ saas autocomplete [SHELL] [-r]

ARGUMENTS
  SHELL  (zsh|bash|powershell) Shell type

FLAGS
  -r, --refresh-cache  Refresh cache (ignores displaying instructions)

DESCRIPTION
  display autocomplete installation instructions

EXAMPLES
  $ saas autocomplete

  $ saas autocomplete bash

  $ saas autocomplete zsh

  $ saas autocomplete powershell

  $ saas autocomplete --refresh-cache
```

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v2.3.8/src/commands/autocomplete/index.ts)_

## `saas aws get-env`

Get currently selected ENV stage

```
USAGE
  $ saas aws get-env

DESCRIPTION
  Get currently selected ENV stage

EXAMPLES
  $ saas aws get-env
```

_See code: [dist/commands/aws/get-env.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/aws/get-env.js)_

## `saas aws login`

Get currently selected ENV stage

```
USAGE
  $ saas aws login

DESCRIPTION
  Get currently selected ENV stage

EXAMPLES
  $ saas aws login
```

_See code: [dist/commands/aws/login.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/aws/login.js)_

## `saas aws set-env ENVSTAGE`

Select ENV stage

```
USAGE
  $ saas aws set-env ENVSTAGE

ARGUMENTS
  ENVSTAGE  Env stage to select

DESCRIPTION
  Select ENV stage

EXAMPLES
  $ saas aws set-env local

  $ saas aws set-env qa

  $ saas aws set-env staging

  $ saas aws set-env production
```

_See code: [dist/commands/aws/set-env.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/aws/set-env.js)_

## `saas backend black`

Run black inside backend docker container

```
USAGE
  $ saas backend black

DESCRIPTION
  Run black inside backend docker container

EXAMPLES
  $ saas backend black
```

_See code: [dist/commands/backend/black.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/backend/black.js)_

## `saas backend build`

Build backend docker image and upload it to AWS ECR

```
USAGE
  $ saas backend build

DESCRIPTION
  Build backend docker image and upload it to AWS ECR

EXAMPLES
  $ saas backend build
```

_See code: [dist/commands/backend/build.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/backend/build.js)_

## `saas backend build-docs`

Build backend docs and put results into docs package

```
USAGE
  $ saas backend build-docs

DESCRIPTION
  Build backend docs and put results into docs package

EXAMPLES
  $ saas backend build-docs
```

_See code: [dist/commands/backend/build-docs.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/backend/build-docs.js)_

## `saas backend deploy api`

Deploys backend API to AWS using previously built artifact

```
USAGE
  $ saas backend deploy api [--diff]

FLAGS
  --diff  Perform a dry run and list all changes that would be applied in AWS account

DESCRIPTION
  Deploys backend API to AWS using previously built artifact

EXAMPLES
  $ saas backend deploy api
```

_See code: [dist/commands/backend/deploy/api.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/backend/deploy/api.js)_

## `saas backend deploy migrations`

Deploys database migrations to AWS using previously built artifact and immediately performs them

```
USAGE
  $ saas backend deploy migrations [--diff]

FLAGS
  --diff  Perform a dry run and list all changes that would be applied in AWS account

DESCRIPTION
  Deploys database migrations to AWS using previously built artifact and immediately performs them

EXAMPLES
  $ saas backend deploy migrations
```

_See code: [dist/commands/backend/deploy/migrations.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/backend/deploy/migrations.js)_

## `saas backend down`

Stops all backend services

```
USAGE
  $ saas backend down

DESCRIPTION
  Stops all backend services

EXAMPLES
  $ saas backend down
```

_See code: [dist/commands/backend/down.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/backend/down.js)_

## `saas backend makemigrations`

Shorthand to generate django backend migrations. If you need more control use `saas backend shell` and run `./manage.py makemigrations` manually

```
USAGE
  $ saas backend makemigrations

DESCRIPTION
  Shorthand to generate django backend migrations. If you need more control use `saas backend shell` and run
  `./manage.py makemigrations` manually

EXAMPLES
  $ saas backend makemigrations
```

_See code: [dist/commands/backend/makemigrations.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/backend/makemigrations.js)_

## `saas backend migrate`

Shorthand to run backend migrations using local database. If you need more control use`saas backend shell` and run `./manage.py migrate` manually

```
USAGE
  $ saas backend migrate

DESCRIPTION
  Shorthand to run backend migrations using local database. If you need more control use`saas backend shell` and run
  `./manage.py migrate` manually

EXAMPLES
  $ saas backend migrate
```

_See code: [dist/commands/backend/migrate.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/backend/migrate.js)_

## `saas backend remote-shell`

Use aws execute-command to start a /bin/bash session inside a running backend task in ECS cluster

```
USAGE
  $ saas backend remote-shell

DESCRIPTION
  Use aws execute-command to start a /bin/bash session inside a running backend task in ECS cluster

EXAMPLES
  $ saas backend remote-shell
```

_See code: [dist/commands/backend/remote-shell.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/backend/remote-shell.js)_

## `saas backend ruff`

Run ruff inside backend docker container

```
USAGE
  $ saas backend ruff

DESCRIPTION
  Run ruff inside backend docker container

EXAMPLES
  $ saas backend ruff
```

_See code: [dist/commands/backend/ruff.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/backend/ruff.js)_

## `saas backend secrets`

Runs an ssm-editor helper tool in docker container to set runtime environmental variables of backend service. Underneath it uses chamber to both fetch and set those variables in AWS SSM Parameter Store

```
USAGE
  $ saas backend secrets

DESCRIPTION
  Runs an ssm-editor helper tool in docker container to set runtime environmental variables of backend service.
  Underneath it uses chamber to both fetch and set those variables in AWS SSM Parameter Store

EXAMPLES
  $ saas backend secrets
```

_See code: [dist/commands/backend/secrets.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/backend/secrets.js)_

## `saas backend shell`

Runs interactive bash shell inside backend docker container

```
USAGE
  $ saas backend shell

DESCRIPTION
  Runs interactive bash shell inside backend docker container

EXAMPLES
  $ saas backend shell
```

_See code: [dist/commands/backend/shell.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/backend/shell.js)_

## `saas backend stripe sync`

Run stripe synchronisation command inside backend docker container. Requires environmental variables with stripe credentials to be set.

```
USAGE
  $ saas backend stripe sync

DESCRIPTION
  Run stripe synchronisation command inside backend docker container. Requires environmental variables with stripe
  credentials to be set.

EXAMPLES
  $ saas backend stripe sync
```

_See code: [dist/commands/backend/stripe/sync.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/backend/stripe/sync.js)_

## `saas backend test`

Runs all backend tests in docker container

```
USAGE
  $ saas backend test

DESCRIPTION
  Runs all backend tests in docker container

EXAMPLES
  $ saas backend test
```

_See code: [dist/commands/backend/test.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/backend/test.js)_

## `saas backend up`

Starts all backend services

```
USAGE
  $ saas backend up

DESCRIPTION
  Starts all backend services

EXAMPLES
  $ saas backend up
```

_See code: [dist/commands/backend/up.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/backend/up.js)_

## `saas build`

Build all deployable artifacts

```
USAGE
  $ saas build

DESCRIPTION
  Build all deployable artifacts

EXAMPLES
  $ saas build
```

_See code: [dist/commands/build.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/build.js)_

## `saas ci create-credentials`

Create CI/CD repository credentials. They can be used in Bitbucket, Github, Gitlab, etc to push code changes to CodeCommit

```
USAGE
  $ saas ci create-credentials

DESCRIPTION
  Create CI/CD repository credentials. They can be used in Bitbucket, Github, Gitlab, etc to push code changes to
  CodeCommit

EXAMPLES
  $ saas ci create-credentials
```

_See code: [dist/commands/ci/create-credentials.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/ci/create-credentials.js)_

## `saas db shell`

Start a psql client shell in local `db` container. It allows you to run some raw queries when needed.

```
USAGE
  $ saas db shell

DESCRIPTION
  Start a psql client shell in local `db` container. It allows you to run some raw queries when needed.

EXAMPLES
  $ saas db shell
```

_See code: [dist/commands/db/shell.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/db/shell.js)_

## `saas deploy`

Deploy all previously built artifacts to AWS

```
USAGE
  $ saas deploy [--diff]

FLAGS
  --diff  Perform a dry run and list all changes that would be applied in AWS account

DESCRIPTION
  Deploy all previously built artifacts to AWS

EXAMPLES
  $ saas deploy
```

_See code: [dist/commands/deploy.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/deploy.js)_

## `saas docs build`

Build docs artifact

```
USAGE
  $ saas docs build

DESCRIPTION
  Build docs artifact

EXAMPLES
  $ saas docs build
```

_See code: [dist/commands/docs/build.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/docs/build.js)_

## `saas docs deploy`

Deploys docs to AWS using previously built artifact

```
USAGE
  $ saas docs deploy [--diff]

FLAGS
  --diff  Perform a dry run and list all changes that would be applied in AWS account

DESCRIPTION
  Deploys docs to AWS using previously built artifact

EXAMPLES
  $ saas docs deploy
```

_See code: [dist/commands/docs/deploy.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/docs/deploy.js)_

## `saas docs up`

Starts local docusaurus server

```
USAGE
  $ saas docs up

DESCRIPTION
  Starts local docusaurus server

EXAMPLES
  $ saas docs up
```

_See code: [dist/commands/docs/up.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/docs/up.js)_

## `saas down`

Starts both backend and frontend

```
USAGE
  $ saas down

DESCRIPTION
  Starts both backend and frontend

EXAMPLES
  $ saas down
```

_See code: [dist/commands/down.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/down.js)_

## `saas emails build`

Build emails artifact and place it in workers package

```
USAGE
  $ saas emails build

DESCRIPTION
  Build emails artifact and place it in workers package

EXAMPLES
  $ saas emails build
```

_See code: [dist/commands/emails/build.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/emails/build.js)_

## `saas emails secrets`

Runs an ssm-editor helper tool in docker container to set runtime environmental variables of webapp service. Underneath it uses chamber to both fetch and set those variables in AWS SSM Parameter Store

```
USAGE
  $ saas emails secrets

DESCRIPTION
  Runs an ssm-editor helper tool in docker container to set runtime environmental variables of webapp service.
  Underneath it uses chamber to both fetch and set those variables in AWS SSM Parameter Store

EXAMPLES
  $ saas emails secrets
```

_See code: [dist/commands/emails/secrets.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/emails/secrets.js)_

## `saas emails test`

Runs all emails tests

```
USAGE
  $ saas emails test

DESCRIPTION
  Runs all emails tests

EXAMPLES
  $ saas emails test
```

_See code: [dist/commands/emails/test.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/emails/test.js)_

## `saas help [COMMANDS]`

Display help for saas.

```
USAGE
  $ saas help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for saas.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.19/src/commands/help.ts)_

## `saas infra bootstrap`

Bootstrap infrastructure in AWS account by creating resources necessary to start working with SaaS Boilerplate

```
USAGE
  $ saas infra bootstrap

DESCRIPTION
  Bootstrap infrastructure in AWS account by creating resources necessary to start working with SaaS Boilerplate

EXAMPLES
  $ saas infra bootstrap
```

_See code: [dist/commands/infra/bootstrap.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/infra/bootstrap.js)_

## `saas infra deploy [STACKNAME]`

Deploy infrastructure of a currently selected environment stage to AWS account

```
USAGE
  $ saas infra deploy [STACKNAME] [--diff]

ARGUMENTS
  STACKNAME  (global|main|db|functions|ci|components) Name of the stack to deploy. If not specified all will be deployed

FLAGS
  --diff  Perform a dry run and list all changes that would be applied

DESCRIPTION
  Deploy infrastructure of a currently selected environment stage to AWS account

EXAMPLES
  $ saas infra deploy
```

_See code: [dist/commands/infra/deploy.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/infra/deploy.js)_

## `saas lint`

Lint all projects

```
USAGE
  $ saas lint

DESCRIPTION
  Lint all projects

EXAMPLES
  $ saas lint
```

_See code: [dist/commands/lint.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/lint.js)_

## `saas plugins`

List installed plugins.

```
USAGE
  $ saas plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ saas plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v3.4.0/src/commands/plugins/index.ts)_

## `saas plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ saas plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ saas plugins add

EXAMPLES
  $ saas plugins:install myplugin

  $ saas plugins:install https://github.com/someuser/someplugin

  $ saas plugins:install someuser/someplugin
```

## `saas plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ saas plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ saas plugins:inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v3.4.0/src/commands/plugins/inspect.ts)_

## `saas plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ saas plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ saas plugins add

EXAMPLES
  $ saas plugins:install myplugin

  $ saas plugins:install https://github.com/someuser/someplugin

  $ saas plugins:install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v3.4.0/src/commands/plugins/install.ts)_

## `saas plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ saas plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ saas plugins:link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v3.4.0/src/commands/plugins/link.ts)_

## `saas plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ saas plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ saas plugins unlink
  $ saas plugins remove
```

## `saas plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ saas plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ saas plugins unlink
  $ saas plugins remove
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v3.4.0/src/commands/plugins/uninstall.ts)_

## `saas plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ saas plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ saas plugins unlink
  $ saas plugins remove
```

## `saas plugins update`

Update installed plugins.

```
USAGE
  $ saas plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v3.4.0/src/commands/plugins/update.ts)_

## `saas up`

Starts both backend and frontend

```
USAGE
  $ saas up

DESCRIPTION
  Starts both backend and frontend

EXAMPLES
  $ saas up
```

_See code: [dist/commands/up.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/up.js)_

## `saas webapp build`

Build webapp artifact ready to be deployed to AWS

```
USAGE
  $ saas webapp build

DESCRIPTION
  Build webapp artifact ready to be deployed to AWS

EXAMPLES
  $ saas webapp build
```

_See code: [dist/commands/webapp/build.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/webapp/build.js)_

## `saas webapp deploy`

Deploys webapp to AWS using previously built artifact

```
USAGE
  $ saas webapp deploy [--diff]

FLAGS
  --diff  Perform a dry run and list all changes that would be applied in AWS account

DESCRIPTION
  Deploys webapp to AWS using previously built artifact

EXAMPLES
  $ saas webapp deploy
```

_See code: [dist/commands/webapp/deploy.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/webapp/deploy.js)_

## `saas webapp graphql download-schema`

Download graphql schemas and merge them

```
USAGE
  $ saas webapp graphql download-schema

DESCRIPTION
  Download graphql schemas and merge them

EXAMPLES
  $ saas webapp graphql download-schema
```

_See code: [dist/commands/webapp/graphql/download-schema.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/webapp/graphql/download-schema.js)_

## `saas webapp lint`

Runs all webapp linters

```
USAGE
  $ saas webapp lint

DESCRIPTION
  Runs all webapp linters

EXAMPLES
  $ saas webapp lint
```

_See code: [dist/commands/webapp/lint.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/webapp/lint.js)_

## `saas webapp secrets`

Runs an ssm-editor helper tool in docker container to set runtime environmental variables of webapp service. Underneath it uses chamber to both fetch and set those variables in AWS SSM Parameter Store

```
USAGE
  $ saas webapp secrets

DESCRIPTION
  Runs an ssm-editor helper tool in docker container to set runtime environmental variables of webapp service.
  Underneath it uses chamber to both fetch and set those variables in AWS SSM Parameter Store

EXAMPLES
  $ saas webapp secrets
```

_See code: [dist/commands/webapp/secrets.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/webapp/secrets.js)_

## `saas webapp test`

Runs all webapp tests

```
USAGE
  $ saas webapp test [--watchAll <value>]

FLAGS
  --watchAll=<value>  [default: true]

DESCRIPTION
  Runs all webapp tests

EXAMPLES
  $ saas webapp test
```

_See code: [dist/commands/webapp/test.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/webapp/test.js)_

## `saas webapp up`

Starts frontend service

```
USAGE
  $ saas webapp up

DESCRIPTION
  Starts frontend service

EXAMPLES
  $ saas webapp up
```

_See code: [dist/commands/webapp/up.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/webapp/up.js)_

## `saas workers black`

Runs black inside workers docker container

```
USAGE
  $ saas workers black

DESCRIPTION
  Runs black inside workers docker container

EXAMPLES
  $ saas workers black
```

_See code: [dist/commands/workers/black.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/workers/black.js)_

## `saas workers build`

Build workers artifact ready to be deployed to AWS

```
USAGE
  $ saas workers build

DESCRIPTION
  Build workers artifact ready to be deployed to AWS

EXAMPLES
  $ saas workers build
```

_See code: [dist/commands/workers/build.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/workers/build.js)_

## `saas workers deploy`

Deploys workers to AWS using previously built artifact

```
USAGE
  $ saas workers deploy [--diff]

FLAGS
  --diff  Perform a dry run and list all changes that would be applied in AWS account

DESCRIPTION
  Deploys workers to AWS using previously built artifact

EXAMPLES
  $ saas workers deploy
```

_See code: [dist/commands/workers/deploy.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/workers/deploy.js)_

## `saas workers invoke local`

Invoke an async worker task

```
USAGE
  $ saas workers invoke local -f [-d]

FLAGS
  -d, --data      String containing data to be passed as an event to your function.
  -f, --function  (required) The name of the function in your service that you want to invoke locally

DESCRIPTION
  Invoke an async worker task

EXAMPLES
  $ saas workers invoke local
```

_See code: [dist/commands/workers/invoke/local.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/workers/invoke/local.js)_

## `saas workers lint`

Run all linters inside workers docker container

```
USAGE
  $ saas workers lint

DESCRIPTION
  Run all linters inside workers docker container

EXAMPLES
  $ saas workers lint
```

_See code: [dist/commands/workers/lint.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/workers/lint.js)_

## `saas workers secrets`

Runs an ssm-editor helper tool in docker container to set runtime environmental variables of workers service. Underneath it uses chamber to both fetch and set those variables in AWS SSM Parameter Store

```
USAGE
  $ saas workers secrets

DESCRIPTION
  Runs an ssm-editor helper tool in docker container to set runtime environmental variables of workers service.
  Underneath it uses chamber to both fetch and set those variables in AWS SSM Parameter Store

EXAMPLES
  $ saas workers secrets
```

_See code: [dist/commands/workers/secrets.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/workers/secrets.js)_

## `saas workers shell`

Runs shell inside workers docker container

```
USAGE
  $ saas workers shell

DESCRIPTION
  Runs shell inside workers docker container

EXAMPLES
  $ saas workers shell
```

_See code: [dist/commands/workers/shell.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/workers/shell.js)_

## `saas workers test`

Run all tests inside workers docker container

```
USAGE
  $ saas workers test

DESCRIPTION
  Run all tests inside workers docker container

EXAMPLES
  $ saas workers test
```

_See code: [dist/commands/workers/test.js](https://github.com/apptension/saas-boilerplate/blob/v2.0.3/dist/commands/workers/test.js)_

<!-- commandsstop -->
