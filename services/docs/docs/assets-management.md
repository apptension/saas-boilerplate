---
id: assets-management
title: Assets Management
---

## Backend reference

### Files storage

By default, backend is configured to use S3 as its files storage. `DEFAULT_FILE_STORAGE` variable in `settings.py` file is set to `common.storages.S3Boto3StorageWithCDN`. This is `S3Boto3Storage` class that comes by default with `django-storages` library, extended with support to CloudFormation distribution as CDN and query string signature to allow access files in private S3 Bucket.

Both S3 Bucket and CloudFront Distribution are created as a part of the Components Stack. 

### Uploading files

`graphene` and `graphene-django` do not support file uploads out of the box. Support for this functionality is added with `graphene-file-upload` library.
It follows the specification available [here](https://github.com/jaydenseric/graphql-multipart-request-spec).

If you don't have control over file names (e.g., files are uploaded by users) and want to avoid filename collisions (so that one user doesn't overwrite other user's files) you can use `common.storages.UniqueFilePathGenerator` class:

```python
from common.storages import UniqueFilePathGenerator

class Document(models.Model):
    file = models.FileField(upload_to=UniqueFilePathGenerator("documents"))
```

It accepts path prefix, and appends randomly generated hash to the path before the file is stored on S3. If name uniqueness is assured other way, you could simply use `upload_to="documents"` there.

### Fetching file data with GraphQL

`FileField` type is converted to ObjectType for GraphQL, so that when user fetches for the object having field with `FileField` type, he can fetch for its details like: 

```graphql
file {
    name
    url
}
```

Currently `name` and `url` are only available parameters, but it can be easily extended in `FieldType` class that can be found in `common/graphql/field_conversions.py`, so that if needed, you can easily add fields like `size`, `extension` and more.


## Webapp reference

Webapp is configured with `relayEnvironment` handling files out of the box. This behavior is determined in the `fetchQuery` function under  `src/shared/services/graphqlApi/relayEnvironment.ts` path. 

To upload file simply pass it to the relay's mutator `uploadables`:

```javascript
const [commitFileMutation] = usePromiseMutation(
    graphql`
      ...
      node {
        file {
          name
          url
        }
      }
    `
);

const handleUpload = (file: File) => {
    commitFileMutation({
      uploadables: {
        file
      }
    })
}
```