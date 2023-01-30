# SaaS Boilerplate

<p align="center"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="AWS Boilerplate License" /> <img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" alt="Maintenance" /> </p>

The primary objective of this boilerplate is to give you a production ready code that reduces the amount of time you
would normally have to spend on system infrastructure's configuration. It contains a number of services that a typical
web application has (frontend, backend api, admin panel, workers) as well as their continuous deployment. Using this
boilerplate you can deploy multiple environments, each representing a different stage in your pipeline.

## Hosted documentation

Until you will modify this project, you can use documentation from the source SaaS Boilerplate project which is available [here](https://docs.demo.saas.apptoku.com/)
⚠️ This may be outdated, prefer the **Local documentation** as documented in then next section.

## Requirements

- Install [Docker](https://docs.docker.com/get-docker)
- Install [Node.js](https://nodejs.org/en/download/) version 16.14 or above (which can be checked by running `node -v`).
  You can use [nvm](https://github.com/nvm-sh/nvm) for managing multiple Node versions installed on a single machine.
- Install [Python](https://www.python.org/downloads/) version 3.8 (which can be checked by running `python3 -v`). You can use [`pyenv`](https://github.com/pyenv/pyenv)
  for managing multiple Python versions installed on a single machine.
- Install [pnpm](https://pnpm.io/installation) version 7 or above (which can be checked by running `pnpm --version`)
- Install [nx](https://nx.dev/getting-started/intro#why-nx) version 15.4.5. After you install Node.js call
  `npm install -g nx@15.4.5`

### Optional

- Install [PDM](https://github.com/pdm-project/pdm/#installation) version 2.3 or above (which can be checked by running
  `pdm --version`)
  - you need this one if you want to run `pdm install` command in `packages/backend` or `packages/workers` outside
    docker container
- Install [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) version 2
  (which can be checked by running `aws --version`)
  - you need this one if you want to deploy SaaS Boilerplate to AWS from your machine

## Adjust `.env.shared` files

Root and almost all packages allow configuration through environmental variables. For local machine those
need to be present in so called `.env` files. We prepared a set of example defaults in form or `.env.shared` files but
a few need to be adjusted before you start the project for the first time.

##### `.env.shared` (in project root)

| Name         | Example | Description                                                                        |
| ------------ | ------- | ---------------------------------------------------------------------------------- |
| PROJECT_NAME | myapp   | The name of your project (best if 3-5 characters to avoid AWS names being to long) |

##### `./packages/backend/.env.shared`

| Name                   | Example                           | Description                                                                                          |
| ---------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| DJANGO_SECRET_KEY      | Zs639zRcb5!9om2@tW2H6XG#Znj^TB^I  | 50 character random string; [docs](https://docs.djangoproject.com/en/3.0/ref/settings/#secret-key)   |
| HASHID_FIELD_SALT      | t5$^r\*xsMRXn1xjzhRSl8I5Hb3BUW$4U | 50 character random string; [docs](https://github.com/nshafer/django-hashid-field#hashid_field_salt) |
| ADMIN_EMAIL            | admin@exmaple.com                 | Will be used to create first super admin user                                                        |
| ADMIN_DEFAULT_PASSWORD | AvPZpabgj9Z8                      | Will be used to create first super admin user                                                        |

## Install dependencies

The project is configured to use pnpm workspaces, which means that you can install `node_modules` of all packages in
repository, with single command:

```sh
pnpm install
```

## Start the app

### Start backend

```sh
nx run core:docker-compose:up
```

or a shorter version:

```sh
make up
```

### Start webapp

```sh
nx start webapp
```

### Local documentation

In order to run your local documentation server execute following commands:

```sh
nx start docs
```


## Important information

> All changes, new features and project related technical information should be documented by being added to the `docs`
> package!
