import hashid_field
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, Group
from django.contrib.auth.models import BaseUserManager
from django.contrib.postgres.fields import CIEmailField
from django.db import models

from common.acl.helpers import CommonGroups
from common.models import ImageWithThumbnailMixin
from common.storages import UniqueFilePathGenerator, PublicS3Boto3StorageWithCDN


class UserManager(BaseUserManager):
    def create_user(self, email, password=None):
        if not email:
            raise ValueError("Users must have an email address")

        user = self.model(
            email=self.normalize_email(email),
        )
        user.set_password(password)
        user_group = Group.objects.get(name=CommonGroups.User)
        user.save(using=self._db)

        user.groups.add(user_group)

        UserProfile.objects.create(user=user)

        return user

    def create_superuser(self, email, password):
        user = self.create_user(
            email,
            password=password,
        )
        user.is_superuser = True
        user.save(using=self._db)
        return user

    def filter_admins(self):
        return self.filter(groups__name=CommonGroups.Admin)


class User(AbstractBaseUser, PermissionsMixin):
    id = hashid_field.HashidAutoField(primary_key=True)
    created = models.DateTimeField(editable=False, auto_now_add=True)
    email = CIEmailField(
        verbose_name="email address",
        max_length=255,
        unique=True,
    )
    is_confirmed = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"

    @property
    def is_staff(self):
        return self.is_superuser

    def has_group(self, name):
        return self.groups.filter(name=name).exists()


class UserAvatar(ImageWithThumbnailMixin, models.Model):
    original = models.ImageField(
        storage=PublicS3Boto3StorageWithCDN, upload_to=UniqueFilePathGenerator("avatars"), null=True
    )
    thumbnail = models.ImageField(
        storage=PublicS3Boto3StorageWithCDN, upload_to=UniqueFilePathGenerator("avatars/thumbnails"), null=True
    )

    THUMBNAIL_SIZE = (128, 128)
    ERROR_FIELD_NAME = "avatar"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    first_name = models.CharField(max_length=40, blank=True, default='')
    last_name = models.CharField(max_length=40, blank=True, default='')
    avatar = models.OneToOneField(
        UserAvatar, on_delete=models.SET_NULL, null=True, blank=True, related_name="user_profile"
    )
