from django.contrib import admin

from . import models


@admin.register(models.CrudDemoItem)
class DemoItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
