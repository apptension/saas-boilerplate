from django.core.files.base import ContentFile
from io import BytesIO

from PIL import Image


class ImageWithThumbnailMixin:
    FILE_FORMATS = {"jpg": "JPEG", "jpeg": "JPEG", "png": "PNG", "gif": "GIF"}

    def make_thumbnail(self):
        image = Image.open(self.original)
        image.thumbnail(self.THUMBNAIL_SIZE, Image.ANTIALIAS)

        file_name = self.original.name.split("/")[-1]
        extension = self.original.name.split(".")[-1]
        file_format = self.FILE_FORMATS.get(extension.lower())
        if not file_format:
            raise ValueError("Unsupported image file format.")

        temp_thumbnail = BytesIO()
        image.save(temp_thumbnail, file_format)
        temp_thumbnail.seek(0)

        self.thumbnail.save(file_name, ContentFile(temp_thumbnail.read()), save=False)
        temp_thumbnail.close()

    def save(self, *args, **kwargs):
        if self.original:
            self.make_thumbnail()
        super().save(*args, **kwargs)
