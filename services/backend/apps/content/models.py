from django.db import models


class ContentfulAbstractModel(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    fields = models.JSONField(default={})
    is_published = models.BooleanField(default=False)

    class Meta:
        abstract = True


class DemoItem(ContentfulAbstractModel):
    def __str__(self):
        return self.fields['title']
