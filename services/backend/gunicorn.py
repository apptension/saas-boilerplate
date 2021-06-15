"""gunicorn WSGI server configuration."""
from multiprocessing import cpu_count


def max_workers():
    return cpu_count() * 2 + 1


bind = "0.0.0.0:80"
max_requests = 1000
accesslog = "-"
errorlog = "-"
workers = max_workers()
worker_class = "gevent"
