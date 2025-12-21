from django.contrib import admin

from . import models


@admin.register(models.CrudDemoItem)
class DemoItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')


@admin.register(models.DocumentDemoItem)
class DocumentDemoItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_by')
