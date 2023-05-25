[//]: # '<p align="center">[NICE LOGO HERE]</p>'

<h3 style="text-align: center">
Build SaaS products faster in React, Django and AWS.
<br/>
A complete SaaS starter kit to set up your project in 3 days instead of 3 weeks.
</h3>

[![Version](https://img.shields.io/github/v/release/apptension/saas-boilerplate?style=for-the-badge)](https://github.com/apptension/saas-boilerplate)
[![License](https://img.shields.io/github/license/apptension/saas-boilerplate?style=for-the-badge)](https://github.com/apptension/saas-boilerplate)

---

📖 [**SaaS Boilerplate Documentation**](https://docs.demo.saas.apptoku.com/)

🌟 [**SaaS Boilerplate Page**](https://www.apptension.com/saas-boilerplate)

🚀 [**SaaS Boilerplate Demo**](https://app.demo.saas.apptoku.com/)

---

The primary objective of this boilerplate is to give you a production ready code that reduces the amount of time you
would normally have to spend on system infrastructure's configuration. It contains a number of services that a typical
web application has (frontend, backend api, admin panel, workers) as well as their continuous deployment. Using this
boilerplate you can deploy multiple environments, each representing a different stage in your pipeline.

## Getting started

### Requirements

- Install [Docker](https://docs.docker.com/get-docker)
- Install [Node.js](https://nodejs.org/en/download/) version 16.14 or above (which can be checked by running `node -v`).
  You can use [nvm](https://github.com/nvm-sh/nvm) for managing multiple Node versions installed on a single machine.
- Install [Python](https://www.python.org/downloads/) version 3.8 (which can be checked by running `python3 -v`). You can use [`pyenv`](https://github.com/pyenv/pyenv)
  for managing multiple Python versions installed on a single machine.
- Install [pnpm](https://pnpm.io/installation) version 7 or above (which can be checked by running `pnpm --version`)
- Install [nx](https://nx.dev/getting-started/intro#why-nx) version 15.4.5. After you install Node.js call
  `npm install -g nx@15.4.5`

#### Optional

- Install [PDM](https://github.com/pdm-project/pdm/#installation) version 2.3 or above (which can be checked by running
  `pdm --version`)
  - you need this one if you want to run `pdm install` command in `packages/backend` or `packages/workers` outside
    docker container
- Install [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) version 2
  (which can be checked by running `aws --version`)
  - you need this one if you want to deploy SaaS Boilerplate to AWS from your machine

### Fresh installation

#### Setup using CLI starter kit

You can use a special CLI tool to run a new local instance of the SaaS Boilerplate as soon as possible. It will clone
the repository and take care of setting up the environment. Run the following command in the directory where you would
like to create a new project:

**_Using `npm`:_**

```bash
npm init saas-boilerplate
```

**_Using `pnpm`:_**

```bash
pnpm create saas-boilerplate
```

**_Using `yarn`:_**

```bash
yarn create saas-boilerplate
```

#### Manual setup

For the manual setup clone this repository and follow the steps in
[Getting started guide](https://docs.demo.saas.apptoku.com/v2/getting-started/run-project/run-new-project#manual-setup).

### Run existing project

#### Install dependencies

The project is configured to use pnpm workspaces, which means that you can install `node_modules` of all packages in
repository, with single command:

```sh
pnpm install
```

### Start the app

#### Start backend

```sh
nx run core:docker-compose:up
```

or a shorter version:

```sh
make up
```

#### Start webapp

```sh
nx start webapp
```

#### Local documentation

In order to run your local documentation server execute following command:

```sh
nx start docs
```

## Tech stack

Front-end stack:

- React
- GraphQL
- Apollo Client
- styled-components
- jest
- Storybook
- Vite

Back-end stack:

- Python
- Django
- Django REST Framework
- Graphene Django
- dj-stripe
- Postgres

Infrastructure:

- NX
- AWS infrastructure written in AWS CDK
- Github or Bitbucket

3rd party services:

- Stripe
- Contentful
- Sentry
- SonarCloud
- OpenAI

The [detailed stack description](https://docs.demo.saas.apptoku.com/v2/introduction/stack-description) is available in the documentation.

## Features

This boilerplate includes plenty of ready to use features that you can adjust to you needs:

- [Authentication and authorization](https://docs.demo.saas.apptoku.com/v2/introduction/features/auth)
- [Notifications](https://docs.demo.saas.apptoku.com/v2/introduction/features/notifications)
- [Emails](https://docs.demo.saas.apptoku.com/v2/introduction/features/emails)
- [Payments and subscriptions (Stripe integration)](https://docs.demo.saas.apptoku.com/v2/introduction/features/payments)
- [Infrastructure as a Code (AWS)](https://docs.demo.saas.apptoku.com/v2/introduction/features/iac) with [pre-configured CI/CD](https://docs.demo.saas.apptoku.com/v2/introduction/features/cicd)
- [CMS integration (Contentful)](https://docs.demo.saas.apptoku.com/v2/introduction/features/cms)
- [Admin panel](https://docs.demo.saas.apptoku.com/v2/introduction/features/admin)
- [CRUD generators](https://docs.demo.saas.apptoku.com/v2/introduction/features/crud)

... and more

The full list with the descriptions can be found in the [features documentation](https://docs.demo.saas.apptoku.com/).

## License

[TODO]

## Contributing

[TODO]

## Author

[Info about Apptension]
