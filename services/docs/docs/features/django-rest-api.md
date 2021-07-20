---
title: Django REST API
---

Project is configured with fully typed support for REST API.

All request can be provided with response type:

```typescript
import { client } from './services/api/client';
//...
export const list = async () => {
  const res = await client.get<ItemType[]>(API_URL);
  return res.data; // data is ItemType[]
};
```


## Form submission error handling


Every POST/PUT response type from BE is formatted in following way:

```json
#successfull response
{
  "isError": "false",
  "dataKey1":"dataVal1",
  "dataKey2":"dataVal2"
}
```

```json
#failed response
{
  "isError": "true",
  "fieldKey1":["field-error-1"],
  "nonFieldErrors":["non-field-error"]
}
```

It allows us to support TS types for API error handling.
To support form submit with validation, you can use out-of-the-box solution based on `react-hook-form / useForm()`:

Example:

```typescript
// api
export const updateProfile = async (data: UpdateProfileApiRequestData) => {
  const res = await client.put<UpdateProfileApiResponseData>(AUTH_UPDATE_PROFILE_URL, data);
  return res.data;
};

// saga
takeLatest(authActions.updateProfile, handleApiRequest(auth.updateProfile)),


// component
const {setApiResponse, errors, genericError, ...} = useApiForm<UpdateProfileFormFields>();

const onProfileUpdate = async (profile: UpdateProfileFormFields) => {
  try {
    const res = await dispatch(updateProfile(profile));

    // dispatch promise is resolved in case of 2xx or 400 status code

    // in case of 400 status results with resolved promise but with submission errors returned
    // it will fill 'errors' variable with field errors coming from API response
    // or 'genericError' with generic errors (not related with specific form field)
    setApiResponse(res);
  } catch {
    // you can handle any other unexpected errors here
  }
};

```
