---
title: Contentful Backend Integration
sidebar_title: Backend Integration
---

## Running locally

Set environmental variables in the `services/workers/.env` file. If it doesn't exist create it
using `services/workers/.env.example` first.

:::info
Use the Contentful Delivery API token here.
:::

```
CONTENTFUL_SPACE_ID=<CHANGE_ME>
CONTENTFUL_ACCESS_TOKEN=<CHANGE_ME>
CONTENTFUL_ENVIRONMENT=develop
```

## Running in AWS

##### Start AWS vault session

Run following command in the root of your project:

```shell
make aws-vault ENV_STAGE=<CHANGE_ME>
```

##### Set variables in AWS

First start the SSM editor tool by running following command in the root of your project:

```shell
make -C services/workers secrets
```

Variables are set in a JSON format so add following keys:

```json
{
  "CONTENTFUL_SPACE_ID": "<CHANGE_ME>",
  "CONTENTFUL_ACCESS_TOKEN": "<CHANGE_ME>"
  "CONTENTFUL_ENVIRONMENT": "<CHANGE_ME>"
}
```

## Synchronizing contentful entities with SQL database

### Create a Django model class

It's possible to save all entities of any given Contentful model to a SQL DB.

SaaS Boilerplate provides `ContentfulAbstractModel` class which directly subclasses Django `Model`. Apart from
subclassing proper class there are three other requirements in order for the synchronisation to work as expected:

- Content Type ID of the Contentful model needs to be a camelCase.
- The name of the django model class needs to be a PascalCase version of the Contentful model name.
- The model has to be defined in the `apps.content` app models.

For example if Contentful's model is named `demoItem` with a title field of ID `title` this is how the class definition would look like:

```python
# apps.content.models

class DemoItem(ContentfulAbstractModel):
    def __str__(self):
        return self.fields['title']
```

Don't forget to run migrations:

```shell
make -C services/backend shell
./manage.py makemigrations
```

From this point every 5 minutes a synchronization async worker job will be run and entities of matching content model
type will be saved to database.

### Create a Contentful webhook

You might want to synchronize the Contentful entities immediately after data is published. In order to do so you need to
create a webhook call in Contentful's web console.

Set following parameters:

- **Details**

  HTTP method: `POST`

  URL: `https://CHANGE_ME/api/content/contentful-hook/`

- **Triggers**:
  Entry: `Publish`, `Unpublish`
- **Filters**:

  Environment ID: limit to only the specific env branch

- **Headers**

  Content-type: `application/json` ⚠️

[Official documentation](https://www.contentful.com/developers/docs/concepts/webhooks/) is best documentation so it's
best that you follow it to create the webhook
