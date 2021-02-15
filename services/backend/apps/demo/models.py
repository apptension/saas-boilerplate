import hashid_field
from django.db import models


class CrudDemoItem(models.Model):
    id = hashid_field.HashidAutoField(primary_key=True)
    name = models.CharField(max_length=255)
