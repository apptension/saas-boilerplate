import os

from celery import Celery
from celery.signals import task_postrun, task_prerun, worker_process_init

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("tasks")

app.config_from_object("django.conf:settings", namespace="CELERY")

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Explicitly import task modules that are outside of Django apps
# These are not discovered by autodiscover_tasks()
app.autodiscover_tasks(["common.task_backends"], related_name="celery_tasks")


# =============================================================================
# Database Connection Management for Celery
# =============================================================================
# These signals prevent database connection leaks in Celery workers.
# Without this, connections accumulate because Celery workers are long-running
# processes and Django only closes connections at the end of HTTP requests.


@worker_process_init.connect
def close_db_connections_on_worker_init(**kwargs):
    """
    Close any stale database connections when a new worker process starts.
    This ensures workers start with a clean connection state.
    """
    from django.db import close_old_connections

    close_old_connections()


@task_prerun.connect
def close_db_connections_before_task(**kwargs):
    """
    Close stale database connections before each task runs.
    This ensures we don't use a connection that became invalid.
    """
    from django.db import close_old_connections

    close_old_connections()


@task_postrun.connect
def close_db_connections_after_task(**kwargs):
    """
    Close database connections after each task completes.
    This is the key fix - it prevents connection accumulation in workers.

    Without this, each worker accumulates connections until it hits the
    max-tasks-per-child limit and restarts.
    """
    from django.db import close_old_connections

    close_old_connections()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f"Request: {self.request!r}")  # noqa
