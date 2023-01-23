# Workers

## Make rules

### `make install`
Runs installation of all required project dependencies.

### `make install-deploy`
This rule will be used by CodeBuild to install dependencies required to deploy previously built artifact.
This rule should most likely stay unchanged unless you know what you're doing!

### `make test`
Runs tests and linters.

### `make build`
Runs tests and builds artifacts required by Serverless Framework.

### `make deploy`
Deploys workers to AWS using Serverless Framework.
