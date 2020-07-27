# Web app
This service is your primary Single Page Application. The boilerplate includes infrastructure to build,
host, and deploy static files and host them under the domain configured in `.awsboilerplate.<env>.json` file.

> Path: `services/webapp`

## Make rules

### `make install`
You should configure this rule in Makefile to install web app's dependencies

#### Example rule
```makefile
test:
	npm install
```

### `make install-deploy`
This rule will be used by CodeBuild to install dependencies required to deploy previously built artifact.
This rule should most likely stay unchanged unless you know what you're doing!

### `make test`
You should configure this rule in Makefile to run your web app's tests and linters

#### Example rule
```makefile
test:
	npm run test
```

### `make build`
You should configure this rule in Makefile to run your web app's build step

#### Example rule
```makefile
build: test
	npm run build
```

### `make deploy`
This rule will deploy the app to AWS. Make sure you log in to AWS first using `make aws-vault` command.