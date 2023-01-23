from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField

from rest_framework_simplejwt.token_blacklist import admin as token_admin, models as token_models

from . import models

admin.site.unregister(token_models.OutstandingToken)


@admin.register(token_models.OutstandingToken)
class OutstandingTokenAdmin(token_admin.OutstandingTokenAdmin):
    def has_delete_permission(self, *args, **kwargs):
        return True


class UserCreationForm(forms.ModelForm):
    password1 = forms.CharField(label="Password", widget=forms.PasswordInput)
    password2 = forms.CharField(label="Password confirmation", widget=forms.PasswordInput)

    class Meta:
        model = models.User
        fields = ("email",)

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords don't match")
        return password2

    def save(self, commit=True):
        user = super(UserCreationForm, self).save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    password = ReadOnlyPasswordHashField()

    class Meta:
        model = models.User
        fields = ("email", "password", "is_active", "is_superuser")

    def clean_password(self):
        return self.initial["password"]


class UserProfileInline(admin.StackedInline):
    model = models.UserProfile


@admin.register(models.User)
class UserAdmin(BaseUserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm

    list_display = ("__str__", "created", "last_login")
    list_filter = ("is_superuser",)
    fieldsets = (
        (None, {"fields": ("email", "password", "is_active")}),
        (
            "Permissions",
            {
                "fields": (
                    "groups",
                    "is_superuser",
                )
            },
        ),
    )
    add_fieldsets = ((None, {"classes": ("wide",), "fields": ("email", "password1", "password2")}),)
    search_fields = ("email",)
    ordering = ("created",)
    filter_horizontal = ()
    inlines = [
        UserProfileInline,
    ]
