---
title: Run Contentful migrations
---

The project expects Contentful to contain a `demoItem` model type with certain fields.
In order to make the configuration process easier for you we've prepared a simple
Contentful migration that creates said model.

:::caution

For now Contentful migrations are not run in CI/CD pipeline and are far from being complete to use as a production
migration flow.

:::

## Get Contentful management API access token

You can follow [official documentation](https://www.contentful.com/developers/docs/references/authentication/#getting-a-personal-access-token) to
acquire necessary Management API access key required to run a Contentful migration script.

## Running locally

### Configure environmental variables

Set environmental variables in the `services/contentful/.env` file.
If it doesn't exist create it using `services/contentful/.env.example` first.

```
CONTENTFUL_SPACE_ID=<CHANGE_ME>
CONTENTFUL_ACCESS_TOKEN=<CHANGE_ME>
CONTENTFUL_ENVIRONMENT=<CHANGE_ME>
```

### Run the command

Run following command from the root of the project:

```shell
make -C services/contentful deploy
```
