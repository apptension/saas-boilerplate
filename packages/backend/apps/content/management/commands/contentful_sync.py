from django.core.management.base import BaseCommand

from ... import tasks


class Command(BaseCommand):
    help = "Run Contentful sync task"

    def handle(self, *args, **options):
        sync_task = tasks.ContentfulSync("complete")
        sync_task.apply()
