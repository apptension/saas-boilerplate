---
title: CRUD generator
---

To generate a fully-functional CRUD UI you need to run `yarn plop crud <model_name> <api_endpoint>` (i.e. `yarn plop crud event /event/`)

It will generate functional elements including:

Routes:

- `ROUTES.<model_name>.list` under `/<model_name>/` (i.e. ROUTES.event.list under /event/)
- `ROUTES.<model_name>.details` under `/<model_name>/<id>`
- `ROUTES.<model_name>.edit` under `/<model_name>/edit/<id>`
- `ROUTES.<model_name>.add` under `/<model_name>/add`

Actions:

- `<model_name>Actions.fetch<model_name>List` - to fetch all items data (i.e. `eventActions.fetchEventList`)
- `<model_name>Actions.fetch<model_name>` - to fetch single item data
- `<model_name>Actions.add<model_name>` - to add new item
- `<model_name>Actions.update<model_name>` - to update existing item
- `<model_name>Actions.delete<model_name>` - to delete existing item

Each generated route will contain functional components (listing / editing / adding / deleting).
All you need to do is to adjust it with your data model - by default it is generated using following data model:

```typescript
interface <model_name> {
  id: string;
  name: string;
}
```
