from django.contrib import admin
from . import models


@admin.register(models.DemoItem)
class DemoItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_published')
    list_filter = ('is_published',)

    def title(self, obj):
        return obj.fields['title']

    def has_change_permission(self, request, obj=None):
        return False
