"""gunicorn WSGI server configuration."""
import logging
from multiprocessing import cpu_count

import environ

env = environ.Env(
    # set casting, default value
    DJANGO_DEBUG=(bool, False)
)

DEBUG = env("DJANGO_DEBUG")


def max_workers():
    if DEBUG:
        return 2
    return cpu_count() * 2 + 1


bind = "0.0.0.0:80"
max_requests = 1000
accesslog = "-"
errorlog = "-"
workers = max_workers()
worker_class = "uvicorn.workers.UvicornWorker"


class HealthCheckFilter(logging.Filter):
    def filter(self, record):
        return not record.args['a'].startswith("ELB-HealthChecker")


def on_starting(server):
    server.log.access_log.addFilter(HealthCheckFilter())
