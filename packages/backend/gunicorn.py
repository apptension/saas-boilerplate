"""gunicorn WSGI server configuration."""
import logging
from multiprocessing import cpu_count


def max_workers():
    return cpu_count() * 2 + 1


bind = "0.0.0.0:80"
max_requests = 1000
accesslog = "-"
errorlog = "-"
workers = max_workers()
worker_class = "gevent"


class HealthCheckFilter(logging.Filter):
    def filter(self, record):
        return not record.args['a'].startswith("ELB-HealthChecker")


def on_starting(server):
    server.log.access_log.addFilter(HealthCheckFilter())
