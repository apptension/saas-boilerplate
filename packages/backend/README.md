# 🍔 Saas backend application

### `saas backend test`

Runs tests and linters inside docker container.

### `saas backend build`

Builds docker images used by the backend and pushes them to AWS ECR repository. Make sure you're logged into the AWS
using `saas aws set-env [ENV_NAME]` command.

### `saas backend deploy`

This rule deploys admin-panel, api, and migrations stacks.

## Pycharm integration

One option to configure the python interpreter in pycharm is to add interpreter with docker/docker-compose option.
The advantage of this solution is independence from using python package manager.
